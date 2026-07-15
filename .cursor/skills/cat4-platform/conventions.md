# Conventions & Anti-Patterns

## Naming

| Kind | Convention | Examples |
|------|------------|----------|
| Brand identity | `brand` / `brandStorageKeys` from `@/lib/brand` | `brand.name`, `brand.defaults.marketingConsent` |
| DB columns | `snake_case` in SQL | `password_hash`, `thc_percent` |
| TS / Drizzle fields | camelCase | `passwordHash`, `thcPercent` |
| Schema / tables | Brand-agnostic domain names | `brand_ambassadors` OK; no `cat4_products` |
| Data reads | `getX` / `getAllX` / `getXBySlug` | `getPublishedProducts` |
| Data writes | `createX` / `updateX` / `deleteX` | `createLandingPage` |
| Actions importing data | alias as `*Record` | `createProduct as createProductRecord` |
| Categories | slug SSOT in `lib/categories.ts` | `flower`, `preroll`, `cartridge`, `extract`, `merch` |
| Content status | `draft` \| `published` \| `archived` | LPs, surveys, QR, ambassadors |
| Products publish flag | boolean `published` | Do not replace with `content_status` casually |
| Tailwind brand tokens | `cat4-*` classes (historical) | Sync hex with `brand.colors`; rename to `brand-*` on template freeze |

## UI label ↔ code name

| Admin / marketing label | Code / routes |
|-------------------------|---------------|
| Promotions | `landing-pages`, `/[slug]`, `/admin/landing-pages` |
| Rewards | QR codes, `/r/[code]`, `/admin/rewards` |
| Subscribes | `captures`, subscribers |
| Home (CMS) | `homepage` setting JSON — not `hero_blocks` |
| Hero | `hero_blocks` / `/admin/hero` |
| Polls | `surveys` where `type = 'poll'` |

## Validation

- All action inputs go through Zod in `src/lib/validations.ts`.
- Return the first Zod error message to the client: `parsed.error.errors[0]?.message`.
- Infer shared types from schema (`$inferSelect`) rather than duplicating interfaces.

## Brand & copy

- Chrome, metadata, consent defaults, reward prefixes → `brand` / `brand.defaults`.
- Long-form marketing copy → CMS (`homepage`, about, education) or mock seeds.
- Do not add new `"CAT4"` string literals in components or actions.

## Forms & UI

- Match existing admin form style: controlled inputs + `useState`.
- `react-hook-form` is installed but unused — do not migrate unless explicitly requested.
- Use `components/ui` primitives; compose admin chrome via existing `admin-ui` helpers.
- Marketing pages: follow existing brand landing / section patterns; do not invent a second design language per feature.

## Categories

- Always import from `@/lib/categories` for slugs and labels.
- Admin label ≠ catalog label (e.g. `cartridge` → admin “Cartridge”, catalog “Vapes”).
- Prefer `getAdminCategoryLabel` / `getCatalogCategoryLabel` over `utils` re-exports for new code.

## Auth in actions

```ts
await requireAuth();           // staff or admin for CMS
await canManageUsers();        // admin-only gates (pattern in admin actions)
// ambassador actions: ensure role matches portal expectations
```

Never trust client-sent role fields.

## File placement checklist (before PR)

- [ ] No `getDb()` outside `lib/data`, seed, or explicit DB tooling
- [ ] Mock + DB paths both updated
- [ ] Zod schema added/updated
- [ ] `revalidatePath` covers public + admin views
- [ ] Middleware/roles still correct for new routes under `/admin` or `/ambassador`
- [ ] Brand strings use `brand.*` where applicable
- [ ] Types exported from schema when needed by UI
- [ ] Change remains mergeable into a white-label fork (no CAT4-only platform forks)
- [ ] Tests for pure logic changes

## Anti-patterns (do not)

1. **Direct Drizzle in pages/components** — breaks mock mode and layering.
2. **DB-only data functions** — breaks local design workflow.
3. **New polls table** — use `survey_type` on `surveys`.
4. **Conflating homepage JSON and hero_blocks** — two different admin surfaces.
5. **Global client state libraries** — RSC + actions + local state only.
6. **REST CRUD for CMS entities** — Server Actions are the write API.
7. **Hardcoded brand name** in new code — use `src/lib/brand.ts`.
8. **Multi-tenant schema for cloning** — use the white-label clone playbook instead.
9. **Treating README as SSOT for features** — check `schema.ts`, routes, and the skill.
10. **Unbounded analytics reads** on hot paths.
11. **Skipping auth** on admin actions because “UI is behind middleware”.
12. **Drive-by refactors** unrelated to the task.

## Commit / change hygiene for agents

- Touch the minimum layers required for the feature.
- When schema changes, update validations + mock seed + data layer in the same change set.
- Prefer extending enums/JSON configs over parallel tables when the domain already owns the concept.
