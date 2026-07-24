# Brand clone & sync

This folder tracks **lineage**, clone destination config, and the **platform vs skin** path split used by:

```bash
npm run brand:clone
npm run brand:sync -- pull --from /Users/ryantang/Documents/programming/CAT4
npm run brand:sync -- push --to /Users/ryantang/white-label/acme
npm run brand:diff -- --peer /Users/ryantang/white-label/acme
npm run brand:status
npm run brand:doctor
```

## Clones root

New brands default to **`/Users/ryantang/white-label/<brand-id>/`** (configured in `.brand/config.json` → `clonesRoot`).

Each clone is its own directory: `brand.ts`, `.env.local`, `npm install`, git init + `platform` remote — ready for `npm run dev`.

## Mental model

| Layer | What | Sync? |
|-------|------|-------|
| **Platform** | Schema, data layer, actions, admin/ambassador UI, surveys, most app routes | Yes — `brand:sync` |
| **Skin** | `brand.ts`, theme hex, seeds, homepage defaults, `public/`, catalog data | No (unless `--include-skin`) |
| **Never** | `node_modules`, `.next`, `.env*`, `.git` | Never |

Keep Tailwind **class names** as `cat4-*` across clones (fast path). Only change hex values in `tailwind.config.ts` + `brand.colors`. That keeps platform diffs mergeable.

## Clone a new brand

From the platform repo:

```bash
npm run brand:clone
# or non-interactive (lands in /Users/ryantang/white-label/acme):
npm run brand:clone -- --name "Acme" --id acme --url https://acme.example.com --yes
```

Override destination with `--dir` if needed. Use `--skip-install` to skip `npm install`.

**Catalog:** clones do **not** copy CAT4 products (`data/`, `public/products/`, product seed). `MOCK_PRODUCTS` starts as `[]` — add products in Admin → Products.

## Pull platform updates into a clone

```bash
cd /Users/ryantang/white-label/acme
npm run brand:sync -- pull --from /Users/ryantang/Documents/programming/CAT4 --dry-run
npm run brand:sync -- pull --from /Users/ryantang/Documents/programming/CAT4
```

## Push a feature from a clone back to the platform

```bash
cd /Users/ryantang/white-label/acme
npm run brand:sync -- push --to /Users/ryantang/Documents/programming/CAT4 --path src/lib/data/surveys.ts
```

Prefer small `--path` ports for mixed work. After applying, run `npm test` / `npm run lint` in the destination and commit there.

## When you add features on the platform

1. Put shared code under an existing **platform** prefix (see `paths.json`), or update `paths.json`.
2. Put brand identity/copy under **skin** paths (or behind `brand.*`).
3. Clones run `brand:sync pull` to receive the change.

## Files

| File | Purpose |
|------|---------|
| `config.json` | `clonesRoot` default parent for new brands |
| `paths.json` | Platform / skin / never globs (synced as platform) |
| `lineage.json` | Role, brand id, clone provenance (skin — not overwritten by sync) |
| `CLONE_CHECKLIST.md` | Per-clone next steps (created by wizard) |
