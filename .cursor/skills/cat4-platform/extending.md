# Extending the platform

Worked examples for agents. Always keep mock + DB parity and white-label rules ([white-label.md](white-label.md)).

## Example A — New admin field on an existing entity

**Goal:** Add `subtitle` to products.

1. **Schema** — `src/lib/db/schema.ts`: add `subtitle: text("subtitle")` on `products`.
2. **Migrate** — `npm run db:generate` then `db:migrate` (or `db:push` locally).
3. **Validations** — extend `productSchema` in `src/lib/validations.ts`.
4. **Data layer** — `src/lib/data/products.ts`: include `subtitle` in `createProduct` / `updateProduct` for **both** mock and Drizzle branches.
5. **Mock seed** — update `products-seed` / store defaults if demos should show it.
6. **UI** — admin product form + optional PDP marketing component.
7. **Action** — existing `createProduct` / `updateProduct` already parse via Zod; ensure `revalidatePath` still covers `/` and `/products`.
8. **Do not** put the new column only in the form or only in SQL.

## Example B — New domain module

**Goal:** Add a “Press” / media mentions domain.

Follow the SKILL checklist, mapped:

| Step | Files |
|------|--------|
| Schema | `press_items` table + types in `schema.ts` |
| Data | `src/lib/data/press.ts` with `isMockDataMode()` branches |
| Barrel | export from `src/lib/data/index.ts` |
| Zod | `pressItemSchema` in `validations.ts` |
| Actions | `createPressItem` etc. in `admin.ts` |
| Admin UI | `components/admin/press-*.tsx` + `app/admin/.../press` |
| Public | `(marketing)/press` page using `getPublishedPressItems` |
| Mock | seed array on `mock/store.ts` |
| White-label | no hardcoded brand name; use `brand.name` only in default titles if needed |

Keep the module self-contained. Do not reach into other domains’ tables from the page layer.

## Example C — New QR destination type

**Goal:** QR codes can open a Press article.

1. Extend `qrDestinationTypeEnum` in schema (+ migration).
2. Update `lib/rewards/constants.ts` labels/defaults.
3. Extend `QrDestinationConfig` JSON typing in schema.
4. Handle the new type in `qr-destination-router.tsx` and admin `rewards-admin-form.tsx`.
5. Dual-path create/update already stores `destinationType` + config — verify mock path accepts the new enum string.

Prefer extending the QR config JSON over a new join table unless you need relational queries.

## Example D — New public short route

**Goal:** `/p/[slug]` for press.

1. Add `src/app/p/[slug]/page.tsx` (RSC) calling `lib/data`.
2. Reuse `components/marketing` patterns; no new design system.
3. If ambassadors/QR should deep-link here, add destination support (Example C).
4. Middleware: leave public (do not add to `/admin` or `/ambassador` matchers).

## Example E — Brand clone (ops, not a feature PR)

See [white-label.md](white-label.md) clone playbook. Agents should not invent multi-tenant `brandId` columns for a one-off clone request — edit `brand.ts` + seeds + env instead.

## Review questions before merging

- Does mock mode still run with no `DATABASE_URL`?
- Are default strings brand-agnostic or sourced from `brand`?
- Did `revalidatePath` cover marketing + admin views?
- Is the change in the right layer (schema → data → action → UI)?
- Would a second brand fork merge this cleanly?
