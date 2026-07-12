# Modularity & Scalability

## Design goals

1. **One deployable app per brand** — marketing, CMS, and ambassador portal share schema and data layer.
2. **Domain modules, not microservices** — split by `lib/data/<domain>.ts` + route/component folders.
3. **Mock parity** — local design without Neon must keep working for every domain.
4. **Serverless-friendly** — Neon HTTP + short request lifetimes; no long in-process jobs.
5. **White-label by clone** — platform core stays mergeable; brand skin lives in `brand.ts`, theme, and seeds ([white-label.md](white-label.md)).

## Module boundaries

### Keep separate

| Boundary | Mechanism |
|----------|-----------|
| Platform vs brand skin | `lib/brand.ts` + Tailwind/seeds vs schema/data/actions |
| Marketing / admin / ambassador | Route groups, layouts, middleware roles |
| UI primitives vs domain UI | `components/ui` vs `marketing` / `admin` / `surveys` |
| Schema vs access vs mutations | `db/schema` → `data/*` → `actions/*` |
| Mock vs production | `isMockDataMode()` inside `data/*` only |
| Domain helpers | `lib/ambassadors`, `lib/rewards`, `lib/surveys`, `lib/categories`, `lib/homepage` |
| Product import | `data/` + `scripts/*` → mock seed (brand-specific; swap on clone) |

### Expect coupling (coordinate changes)

| Coupling | Notes |
|----------|-------|
| Schema ↔ validations ↔ mock seeds ↔ `db/seed.ts` | Same shapes |
| `brand.ts` ↔ Tailwind `cat4.*` hex | Keep colors aligned |
| Products ↔ QR codes | Product create auto-creates product QR |
| Ambassadors ↔ users ↔ QR / hubs | Portal login + vanity `/a/[slug]` |
| Surveys ↔ polls ↔ results API | Shared `surveys` table via `type` |
| Captures funnel | subscribe / LP / survey / reward / ambassador |
| Actions ↔ `revalidatePath` lists | Missed paths = stale UI |

## Where new code goes

| Change type | Put it here |
|-------------|-------------|
| Brand name, consent defaults, storage namespace | `src/lib/brand.ts` |
| Theme colors / fonts | `tailwind.config.ts`, `globals.css` (+ sync `brand.colors`) |
| New table/enum/JSON shape | `src/lib/db/schema.ts` (+ migration) |
| CRUD / queries | `src/lib/data/<domain>.ts` |
| Cross-cutting data helpers | `src/lib/data/shared.ts` |
| Pure domain logic (no I/O) | `src/lib/<domain>/` or `src/lib/<name>.ts` |
| Admin mutation | `src/lib/actions/admin.ts` or `ambassador-admin.ts` |
| Public mutation | `src/lib/actions/public.ts` |
| Portal mutation | `src/lib/actions/ambassador.ts` |
| Admin UI | `src/components/admin/` + `src/app/admin/...` |
| Public UI | `src/components/marketing/` + `(marketing)` or short-link routes |
| Shared survey widgets | `src/components/surveys/` |
| One-off / brand import scripts | `scripts/` |

## Scalability guidelines

### Do

- Keep list/export queries bounded (existing pattern: capture list limits, CSV exports).
- Prefer append-only analytics (`page_views`, `qr_scans`, link clicks) with future aggregation in mind.
- Extract duplicated mock+SQL branches into small helpers when a `data` file exceeds ~400–500 lines **and** patterns repeat.
- Use Vercel Blob for media; store URLs in DB, not file bytes.
- Scale to N brands with N deploys (separate Neon + Blob + `brand.ts`), keeping platform PRs mergeable.
- Keep Auth credentials-only unless product explicitly adds OAuth.

### Don't

- Split into multiple Next apps or packages without a concrete multi-service need.
- Add Redis/queues “for scale” before there is a measured bottleneck.
- Put business writes in Route Handlers that duplicate Actions.
- Grow the in-memory mock store into a fake production DB.
- Introduce a shared monorepo package until a second consumer exists.
- Add multi-tenant `brandId` columns for white-labeling — that is a different product shape.
- Bypass Neon HTTP for long sessions — redesign the write instead.

## Feature growth playbook

1. **Extend an existing domain** if the entity already maps (e.g. new QR destination type → enum + config JSON).
2. **New domain module** when the entity has its own lifecycle, admin UI, and queries — follow the SKILL checklist + [extending.md](extending.md).
3. **New surface** (e.g. another portal) only with middleware role rules + layout isolation.
4. **New brand** → clone playbook in [white-label.md](white-label.md), not schema tenancy.
5. **Extract service** only if separate scaling/security/deploy cadence requires it — document in this skill when it happens.

## Import style

Prefer barrel imports for data:

```ts
import { getPublishedProducts, createProduct as createProductRecord } from "@/lib/data";
```

Deep imports (`@/lib/data/ambassadors`) are acceptable for large modules to avoid cycles. New code should default to the barrel unless a cycle forces otherwise.

## Performance notes for agents

- RSC by default; mark client components only when interactivity requires it.
- `revalidatePath` surgically — list public + admin paths that show the data.
- Image hosts must be allowlisted in `next.config.ts` before using new remote CDNs.
- Dev webpack memory cache is intentional (`next.config.ts`); use `npm run clean` if cache corruption appears.
