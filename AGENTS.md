# AGENTS.md

Guidance for AI agents working in this repository.

## Knowledge base (source of truth)

Project skill (read first):

- [`.cursor/skills/cat4-platform/SKILL.md`](.cursor/skills/cat4-platform/SKILL.md)

References:

| Doc | Use when |
|-----|----------|
| [architecture.md](.cursor/skills/cat4-platform/architecture.md) | Layers, mock/DB, auth, actions vs API |
| [modularity.md](.cursor/skills/cat4-platform/modularity.md) | Where code belongs, coupling, scale |
| [conventions.md](.cursor/skills/cat4-platform/conventions.md) | Naming, checklists, anti-patterns |
| [domain-map.md](.cursor/skills/cat4-platform/domain-map.md) | Domain → files/routes |
| [white-label.md](.cursor/skills/cat4-platform/white-label.md) | Cloning for another brand |
| [extending.md](.cursor/skills/cat4-platform/extending.md) | Worked examples for new fields/domains |
| [`.brand/README.md`](.brand/README.md) | **Clone wizard + sync/migrate between brands** |

Always-on Cursor rules:

- [`.cursor/rules/cat4-platform.mdc`](.cursor/rules/cat4-platform.mdc)
- [`.cursor/rules/brand-clone-sync.mdc`](.cursor/rules/brand-clone-sync.mdc) — use whenever cloning or syncing brands


## One-line architecture

UI → Server Actions (Zod + auth) → `lib/data` (mock **or** Drizzle) → Neon.  
Domain contract: `src/lib/db/schema.ts`. Brand skin: `src/lib/brand.ts`.

## White-label

This is a **base build** meant to be cloned per brand (separate Neon + Vercel + `brand.ts`). Do not introduce multi-tenant `brandId` columns unless the product explicitly becomes multi-tenant.

```bash
npm run brand:clone                          # new brand deploy
npm run brand:sync -- pull --from ../CAT4    # pull platform updates into a clone
npm run brand:sync -- push --to ../CAT4      # port clone platform work upstream
```

Path split: `.brand/paths.json`. Workflow: `.brand/README.md`.

## Do not

- Query the DB from pages/components
- Ship data helpers that only work in mock **or** only in DB mode
- Add REST CRUD that duplicates Server Actions
- Hardcode brand name/consent strings — use `brand` from `@/lib/brand`
- Invent a separate polls table or merge homepage CMS with `hero_blocks` without an explicit decision

## Human docs

`README.md` covers local setup, features, and deploy.
