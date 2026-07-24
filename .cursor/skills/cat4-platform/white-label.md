# White-label & multi-brand cloning

This repo is a **single-brand deploy** of a reusable brand platform. CAT4 is the reference skin. The intended growth path is **clone → rebrand → new Neon/Vercel project**, not multi-tenant runtime (one DB serving many brands).

## Platform vs brand skin

| Layer | Belongs to | Examples |
|-------|------------|----------|
| **Platform (keep shared)** | Product architecture | Schema, `lib/data` dual-path, Server Actions, auth roles, route shapes (`/l`, `/r`, `/a`), admin domains, Vitest patterns |
| **Brand skin (swap per clone)** | Identity & content | `src/lib/brand.ts`, Tailwind `cat4.*` colors, fonts, logo, seed/mock copy, homepage CMS defaults, product catalog, Blob media |
| **Deploy config** | Per environment | `.env`, Neon DB, Auth URL, Blob store, domain |

Do not fork platform logic per brand. Fork the repo (or a clean template branch), then swap the skin.

## Brand SSOT

**`src/lib/brand.ts`** — display name, tagline, colors (documented), consent/copy defaults, storage key namespace via `brand.id`.

**Rules for new code:**

1. Never hardcode `"CAT4"` in UI chrome, metadata, consent defaults, or reward prefixes — use `brand` / `brand.defaults`.
2. Cookie / localStorage / BroadcastChannel keys go through `brandStorageKeys` (or `AGE_GATE_COOKIE_NAME` which already does).
3. CMS-editable copy (homepage JSON, about sections, products) stays in DB/mock seeds — not in `brand.ts`.
4. Tailwind class prefix is still `cat4-*` (historical). When cloning, either:
   - **Fast path:** change hex values in `tailwind.config.ts` + `brand.colors` and leave class names, or
   - **Clean path:** rename tokens to `brand-*` in Tailwind + classnames (one-time mechanical refactor).

Keep `brand.colors` hex values in sync with Tailwind when you change them.

## Clone playbook (wizard)

Preferred: run the interactive wizard from this repo:

```bash
npm run brand:clone
```

It copies the tree to a new directory, writes `src/lib/brand.ts`, patches Tailwind hex (keeps `cat4-*` class names for mergeable sync), updates `package.json` name, and writes `.brand/lineage.json` + `.brand/CLONE_CHECKLIST.md`.

Docs for sync/pull/push: [`.brand/README.md`](../../../.brand/README.md).

### Manual checklist (if not using the wizard)

```
- [ ] Clone repo / create brand branch
- [ ] Edit src/lib/brand.ts (id, name, tagline, defaults, colors)
- [ ] Update tailwind.config.ts + globals.css tokens to match brand.colors
- [ ] Replace logos / favicon / public assets
- [ ] Replace mock seeds + data/ product import for the new catalog
- [ ] Rewrite DEFAULT_HOMEPAGE_CONTENT + about/education seed copy
- [ ] Rename brand-coupled content keys if present (e.g. homepage `whatIsCat4` → generic `whatIsBrand`)
- [ ] New .env: AUTH_*, DATABASE_URL, BLOB_*, SEED_ADMIN_*
- [ ] package.json name → new brand slug (optional)
- [ ] Fresh Neon + Vercel project; db:push / migrate + db:seed
- [ ] npm run brand:doctor — clear leftover source-brand strings
```

## Syncing features between platform and clones

Path split lives in `.brand/paths.json` (**platform** vs **skin**).

```bash
# In a clone — preview then pull platform updates from CAT4
npm run brand:sync -- pull --from ../CAT4 --dry-run
npm run brand:sync -- pull --from ../CAT4

# Port a feature built on a clone back into the platform
npm run brand:sync -- push --to ../CAT4 --path src/lib/data/surveys.ts

# See drift both ways
npm run brand:diff -- --peer ../acme
```

Skin files (`brand.ts`, seeds, `public/`, homepage defaults, theme hex) are never overwritten by sync unless you pass `--include-skin`.

## What not to do

- **Multi-tenant `brandId` on every table** — out of scope until you need one deploy for many brands. Prefer separate DBs per clone.
- **Per-brand feature flags in core domains** — keep the platform feature set identical; hide via CMS content or simple env only if unavoidable.
- **Copy-paste divergent `lib/data` forks** — upstream platform fixes should remain mergeable.
- **Embed retailer-specific pricing logic in schema** — keep catalog fields generic; put partner quirks in seed/import scripts.

## Known CAT4-coupled debt (clean up on clone or before template freeze)

| Item | Location | Guidance |
|------|----------|----------|
| Tailwind namespace `cat4.*` | `tailwind.config.ts`, classnames | Keep names for sync; change hex only (or rename to `brand.*` when ready) |
| Homepage field `whatIsCat4` | `lib/homepage.ts` | Rename to brand-agnostic key before multi-brand template |
| Hardcoded `"CAT4"` in UI | marketing/admin components | Use `brand.name` / `brand.defaults`; find with `npm run brand:doctor` |
| Mock/seed prose | `lib/mock/*`, `lib/homepage.ts` defaults | Replace per brand (wizard soft-replaces many) |
| Product import script | `scripts/import-catalyst-products.mjs` | Swap for brand-specific importer |
| README / package name | root | Updated by clone wizard |

## Scalability model for many brands

```
platform repo (this codebase)
    ├── deploy: cat4.example.com     → Neon A + Blob A + brand.ts = CAT4
    ├── deploy: acme.example.com     → Neon B + Blob B + brand.ts = Acme
    └── deploy: …
```

Share improvements with `npm run brand:sync` (path-filtered copy of platform files), git remotes (`platform` upstream), or PR merges into each brand fork.

## Agent rules

- When the user asks to **clone**, **rebrand**, **white-label**, or **sync/migrate** features across brands: read [`.brand/README.md`](../../../.brand/README.md) and use `npm run brand:clone` / `brand:sync` (see `.cursor/rules/brand-clone-sync.mdc`). Do not hand-copy the repo.
- When adding user-visible default strings that mention the brand, add them to `brand.defaults` (or read `brand.name`).
- When adding browser storage keys, namespace with `brand.id`.
- Prefer generic domain names in schema (`brand_ambassadors` is fine as a domain term; do not add `cat4_` table prefixes).
- When adding shared platform code, keep it under a **platform** path in `.brand/paths.json` (or update that file).
- Treat white-label readiness as a review criterion for architecture changes — see [modularity.md](modularity.md).
