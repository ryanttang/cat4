# Brand clone & sync

This folder tracks **lineage** and the **platform vs skin** path split used by:

```bash
npm run brand:clone
npm run brand:sync -- pull --from ../CAT4
npm run brand:sync -- push --to ../other-brand
npm run brand:diff -- --peer ../other-brand
npm run brand:status
npm run brand:doctor
```

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
# or non-interactive:
npm run brand:clone -- --name "Acme" --id acme --dir ../acme --url https://acme.example.com --yes
```

The wizard copies the tree, writes `src/lib/brand.ts`, patches theme hex, sets `package.json` name, writes `.brand/lineage.json` + `CLONE_CHECKLIST.md`, and optionally `git init` with a `platform` remote.

## Pull platform updates into a clone

```bash
cd ../acme
npm run brand:sync -- pull --from ../CAT4 --dry-run   # preview
npm run brand:sync -- pull --from ../CAT4             # apply (confirm)
```

## Push a feature from a clone back to the platform

```bash
cd ../acme
npm run brand:sync -- push --to ../CAT4 --path src/lib/data/surveys.ts
# or push all platform drift:
npm run brand:sync -- push --to ../CAT4 --dry-run
```

Prefer small `--path` ports for mixed work. After applying, run `npm test` / `npm run lint` in the destination and commit there.

## When you add features on the platform

1. Put shared code under an existing **platform** prefix (see `paths.json`), or update `paths.json`.
2. Put brand identity/copy under **skin** paths (or behind `brand.*`).
3. Clones run `brand:sync pull` to receive the change.

## Files

| File | Purpose |
|------|---------|
| `paths.json` | Platform / skin / never globs (synced as platform) |
| `lineage.json` | Role, brand id, clone provenance (skin — not overwritten by sync) |
| `CLONE_CHECKLIST.md` | Per-clone next steps (created by wizard) |
