# CAT4 Architecture

## System shape

Single **Next.js 15 App Router** app deployed on **Vercel**, data on **Neon PostgreSQL** via **Drizzle** (`neon-http` driver). No monorepo, no separate API service, no Redis/queue.

**White-label:** one brand per deploy. Identity/defaults live in `src/lib/brand.ts`; see [white-label.md](white-label.md).

```
┌─────────────────────────────────────────────────────────┐
│  Marketing RSC          Admin RSC         Ambassador RSC │
│  components/marketing   components/admin  (portal UI)    │
└────────────┬──────────────────┬─────────────────────────┘
             │                  │
             ▼                  ▼
      lib/actions/public   lib/actions/admin
      lib/actions/ambassador*  lib/actions/analytics
             │
             ▼
      Zod (lib/validations.ts) + auth-utils
             │
             ▼
      lib/data/*  ──isMockDataMode()──┬── mock/store + seeds
                                     └── getDb() + schema
```

## Dual data backend

`src/lib/config.ts`:

- `USE_MOCK_DATA=true` → mock
- `USE_MOCK_DATA=false` → DB (requires `DATABASE_URL`)
- unset → mock when no `DATABASE_URL`

Canonical dual-path pattern (`src/lib/data/products.ts`):

```ts
export async function getPublishedProducts(): Promise<Product[]> {
  if (isMockDataMode()) {
    return mockProducts().filter((p) => p.published) /* ... */;
  }
  return getDb().select().from(products).where(eq(products.published, true)) /* ... */;
}
```

Mock edits live in process memory until restart. Never assume mock state is durable or multi-instance safe.

## Server Actions pattern

From `src/lib/actions/admin.ts`:

1. `"use server"` at file top
2. `await requireAuth()` (or role helper)
3. `schema.safeParse(data)` → `{ success: false, error }` on failure
4. Call `*Record` / data-layer function (import aliased to avoid name clash)
5. `revalidatePath(...)` for every affected route
6. Return `{ success: boolean; error?: string; id?: string }`

Public mutations live in `lib/actions/public.ts`. Ambassador portal vs admin ambassador management are split: `ambassador.ts` vs `ambassador-admin.ts`.

## When to use `app/api`

| Route | Why HTTP |
|-------|----------|
| `/api/auth/[...nextauth]` | Auth.js |
| `/api/upload` | Authenticated Blob upload → `{ url }` |
| `/api/qr/[code]/image` | PNG bytes |
| `/api/ambassadors/[id]/card` | Card image |
| `/api/surveys/[id]/results` | Client-polled JSON |

Do not add CRUD REST mirrors of Server Actions.

## Auth model

- Auth.js v5 credentials + JWT session
- Roles: `admin` | `staff` | `ambassador`
- `middleware.ts` matcher: `/admin/:path*`, `/ambassador/:path*`
- Ambassadors blocked from admin; staff/admin blocked from ambassador portal
- User management: admin only (`canManageUsers`)

## State & caching

- Server state: RSC reads + `revalidatePath` after writes
- Client: local component state for forms
- Age gate: cookie `cat4-age-verified`
- Admin dashboard layouts use `force-dynamic` where needed

## UI composition

| Folder | Role |
|--------|------|
| `components/ui` | shadcn-style primitives (Button, Dialog, Tabs, …) |
| `components/marketing` | Public brand UI |
| `components/admin` | CMS tables/forms/sidebar |
| `components/surveys` | Shared survey/poll fields + results |

Brand tokens live in `tailwind.config.ts` (`cat4.*`) and `src/app/globals.css`. Prefer existing marketing/admin patterns over new design systems.

## Config & tooling

| File | Role |
|------|------|
| `next.config.ts` | Image hosts (Blob, CloudFront); memory webpack cache in dev |
| `drizzle.config.ts` | Schema → Neon |
| `vitest.config.ts` | Node env + `@/` alias |
| `tsconfig.json` | `@/*` → `./src/*` |

## Testing

- Vitest, colocated `src/lib/*.test.ts`
- Pure unit tests for helpers (categories, csv, …)
- No RTL / E2E suite yet — do not invent a second test runner; extend Vitest for lib logic
