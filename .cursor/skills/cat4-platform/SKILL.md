---
name: cat4-platform
description: >-
  CAT4 brand platform architecture, white-label cloning, modularity, and coding
  conventions. Use when building features, refactoring, reviewing PRs, adding
  domains, cloning/white-labeling/rebranding for another brand, syncing or
  migrating platform updates between CAT4 and a clone (brand:clone, brand:sync,
  brand:diff, brand:doctor), or when the user asks how this platform is built
  or should be built.
---

# CAT4 Platform

Reusable **single-brand** cannabis brand platform (reference deploy: CAT4): public marketing site, admin CMS, ambassador portal, promotions, surveys/polls, QR/rewards, analytics, and email capture.

**Stack:** Next.js 15 App Router · React 19 · TypeScript · Tailwind · Neon Postgres · Drizzle · Auth.js v5 · Zod · Vercel Blob · Vitest

**White-label model:** `npm run brand:clone` → skin (`brand.ts` + theme + seeds) → new Neon/Vercel. Sync features with `npm run brand:sync`. Not multi-tenant. Details: [white-label.md](white-label.md) · [`.brand/README.md`](../../../.brand/README.md).

## Clone, sync & migrate (mandatory tooling)

When the user asks to clone a brand, pull/push platform updates, or migrate features between deploys:

1. Read [`.brand/README.md`](../../../.brand/README.md) and [white-label.md](white-label.md).
2. Run the matching command (`brand:clone`, `brand:sync`, `brand:diff`, `brand:doctor`).
3. Prefer `--dry-run` before applying sync; never overwrite skin unless asked.

| Intent | Command |
|--------|---------|
| New brand | `npm run brand:clone` → `/Users/ryantang/white-label/<id>/` |
| Clone ← platform | `npm run brand:sync -- pull --from <peer>` |
| Clone → platform | `npm run brand:sync -- push --to <peer>` |
| Drift | `npm run brand:diff -- --peer <peer>` |

Clones root SSOT: `.brand/config.json` (`clonesRoot`). Path split SSOT: `.brand/paths.json`. Cursor rule: `.cursor/rules/brand-clone-sync.mdc`.

## Read this first

1. Follow the layering rules below on every change.
2. Prefer `brand` / `brandStorageKeys` over hardcoded brand strings.
3. For deeper detail, open the matching reference:
   - [architecture.md](architecture.md) — surfaces, data flow, auth, dual mock/DB
   - [modularity.md](modularity.md) — boundaries, scalability, when to split modules
   - [conventions.md](conventions.md) — naming, checklists, anti-patterns
   - [domain-map.md](domain-map.md) — domains, routes, UI label ↔ code name map
   - [white-label.md](white-label.md) — platform vs skin, clone playbook
   - [extending.md](extending.md) — worked examples for new fields/domains
   - [`.brand/README.md`](../../../.brand/README.md) — clone wizard + bidirectional sync

## Source of truth (priority order)

| Concern | Canonical file(s) |
|---------|-------------------|
| Brand identity / defaults | `src/lib/brand.ts` |
| Domain / DB shape | `src/lib/db/schema.ts` |
| Mock vs DB switch | `src/lib/config.ts` → `isMockDataMode()` |
| Reads/writes | `src/lib/data/*.ts` (dual-path; export via `src/lib/data/index.ts`) |
| Mutations from UI | `src/lib/actions/*.ts` (`"use server"`) |
| Input validation | `src/lib/validations.ts` |
| Auth / roles | `src/lib/auth*.ts`, `src/middleware.ts`, `src/lib/auth-utils.ts` |
| Product categories | `src/lib/categories.ts` |
| Homepage CMS JSON | `src/lib/homepage.ts` + `site_settings` key `"homepage"` |
| Theme tokens | `tailwind.config.ts` (`cat4.*`) — keep hex in sync with `brand.colors` |
| Env contract | `.env.example` |
| Clone / sync tooling | `.brand/README.md`, `.brand/paths.json`, `npm run brand:*` |
| Ops / setup | `README.md` (may lag — prefer schema + code + this skill) |

## Layering (non-negotiable)

```
UI (RSC pages / client forms)
  → Server Actions (lib/actions/*)  or thin Route Handlers (app/api/*)
    → Zod (validations) + auth helpers
      → Data access (lib/data/*)
        → isMockDataMode() ? mock store : getDb() / Drizzle
```

**Rules:**

1. Pages and components never call `getDb()` or import Drizzle tables for queries.
2. Actions never contain SQL; they auth → validate → call `lib/data` → `revalidatePath`.
3. Every new `lib/data` function implements **both** mock and DB paths with the same signature.
4. Prefer Server Actions over new REST endpoints. HTTP routes only for Auth.js, Blob upload, QR/card images, and JSON that clients must poll.
5. No global client stores (Redux/Zustand). Use RSC + Server Actions + local `useState`.
6. Brand chrome/copy defaults come from `src/lib/brand.ts`, not scattered string literals.

## Surfaces

| Surface | Path prefix | Access |
|---------|-------------|--------|
| Marketing | `src/app/(marketing)/` | Public (+ age gate) |
| Admin CMS | `src/app/admin/` | `admin` \| `staff` (middleware) |
| Ambassador portal | `src/app/ambassador/` | `ambassador` role |
| Short public links | `/[slug]` promotions, `/r/*` QR, `/a/*` ambassador hubs, `/survey/*`, `/poll/*` | Public |
| API | `src/app/api/` | Thin exceptions only |

Components: `components/ui` (primitives) · `components/marketing` · `components/admin` · `components/surveys`.

## Adding a domain (checklist)

```
- [ ] Enum/table/types in schema.ts (brand-agnostic names — no cat4_ prefixes)
- [ ] Migration (db:generate) or documented db:push for local
- [ ] Mock seed + store wiring if needed
- [ ] lib/data/<domain>.ts with dual mock/DB paths
- [ ] Export from lib/data/index.ts
- [ ] Zod schemas in validations.ts
- [ ] Server Actions in the right actions file (admin / public / ambassador*)
- [ ] Routes + components in the correct surface folders
- [ ] revalidatePath for affected public/admin paths
- [ ] Default copy uses brand.* when it mentions the brand
- [ ] Unit tests for pure helpers under src/lib/*.test.ts
```

See [extending.md](extending.md) for worked examples.

## Modularity, scale & white-label (summary)

- Stay a **single Next.js monolith** per brand deploy.
- Scale to more brands by **cloning + separate Neon/Vercel**, not multi-tenant `brandId` columns.
- Keep domains in separate `lib/data/<domain>.ts` files.
- Do not invent a second polls table — polls share `surveys` via `type`.
- Cap list/export sizes as analytics tables grow.
- Full guidelines: [modularity.md](modularity.md) · [white-label.md](white-label.md).

## Quick anti-patterns

- Bypassing `lib/data` with direct Drizzle in pages/actions
- Implementing only the DB path (or only mock) for a new data function
- Hardcoding `"CAT4"` in new UI/consent/metadata (use `brand`)
- Adding multi-tenant brand FKs for a simple white-label clone
- Conflating homepage JSON (`/admin/home`) with `hero_blocks` (`/admin/hero`)
- Using UI labels as folder names (Promotions → `landing-pages`, Rewards → QR codes)
- Migrating forms to `react-hook-form` without an explicit decision

## Commands

| Task | Command |
|------|---------|
| Dev (mock by default) | `npm run dev` |
| Clear Next cache | `npm run clean` / `dev:clean` |
| Lint / test | `npm run lint` · `npm test` |
| Schema push / migrate | `npm run db:push` · `db:generate` · `db:migrate` |
| Seed | `npm run db:seed` |
| Regenerate product mock seed | `npm run import:products` |
| White-label clone wizard | `npm run brand:clone` |
| Sync platform ↔ clone | `npm run brand:sync -- pull\|push --from\|--to <peer>` |
| Platform drift / leftover brand strings | `npm run brand:diff` · `npm run brand:doctor` |
