# CAT4 Brand Platform

Reusable **single-brand** cannabis platform (reference deploy: **CAT4**) with public site, admin CMS, ambassador portal, promotions, surveys/polls, QR/rewards, analytics, and email capture — built on **Next.js 15**, **Neon PostgreSQL**, and **Vercel**.

Clone and white-label for other brands by swapping [`src/lib/brand.ts`](src/lib/brand.ts), theme tokens, and seeds. See [`AGENTS.md`](AGENTS.md) and [`.cursor/skills/cat4-platform/white-label.md`](.cursor/skills/cat4-platform/white-label.md).

## Brand Colors

Keep in sync with `src/lib/brand.ts` → `colors` and `tailwind.config.ts` → `cat4.*`.

| Token | Hex |
|-------|-----|
| Blue (primary) | `#2252d4` |
| Dark | `#1A1423` |
| Light | `#fdfdfd` |
| Surface | `#231c2e` |

## Features

### Public Site
- Homepage CMS (video hero, lineup, favorites, education preview, CTAs)
- Product catalog + PDPs across 5 categories (`flower`, `preroll`, `cartridge`, `extract`, `merch`)
- Education hub, About, store locator (`/find`), subscribe
- Age gate (21+)
- Promotions (`/l/[slug]`) — sweepstakes, raffles, giveaways, contests
- Surveys & polls (`/survey/[slug]`, `/poll/[slug]`) with optional live results
- QR / rewards destinations (`/r/[code]`) — product, link hub, claim, etc.
- Ambassador vanity hubs (`/a/[slug]`)

### Admin Dashboard (`/admin`)
- Email/password auth — **Admin**, **Staff** (and separate **Ambassador** portal)
- Homepage CMS, Hero media (Vercel Blob), Products, Locations, Education, About
- Promotions builder, Surveys, Polls
- Rewards / QR management + CSV exports
- Ambassadors management
- Captures (“Subscribes”) + CSV export
- Analytics (page views and related activity)
- User management (Admin only)

### Ambassador Portal (`/ambassador`)
- Dashboard and personal QR tooling for ambassador-role users

## Quick Start (Local Design — No Neon Required)

For local design work, the app runs in **mock mode** by default — no database needed.

```bash
cp .env.example .env.local   # already configured for mock mode
npm install
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)
- Login: `admin@cat4.com` / `changeme123`

Mock mode uses in-memory sample data. Admin edits persist until you restart the dev server. A yellow banner appears in admin when mock mode is active.

To switch to Neon later, set `DATABASE_URL` in `.env.local` and set `USE_MOCK_DATA=false`.

---

## Quick Start (With Neon)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `AUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `AUTH_URL` | `http://localhost:3000` (or production URL) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token for media uploads |
| `SEED_ADMIN_EMAIL` | Initial admin email (optional) |
| `SEED_ADMIN_PASSWORD` | Initial admin password (optional) |

### 3. Push database schema

```bash
npm run db:push
```

### 4. Seed sample data + admin user

```bash
npm run db:seed
```

Default admin: `admin@cat4.com` / `changeme123`

### 5. Run dev server

```bash
npm run dev
```

- Site: [http://localhost:3000](http://localhost:3000)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Deploy to Vercel + Neon

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
# create repo on GitHub, then:
git remote add origin git@github.com:YOUR_USER/CAT4.git
git push -u origin main
```

### 2. Create Neon database

1. Create a project at [console.neon.tech](https://console.neon.tech)
2. Copy the **pooled** connection string (`DATABASE_URL`)

### 3. Import in Vercel

1. [vercel.com/new](https://vercel.com/new) → import the GitHub repo
2. Framework preset: **Next.js** (auto-detected)
3. Add environment variables (Production + Preview):

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon pooled connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `AUTH_URL` | Your production URL (`https://….vercel.app` or custom domain) |
| `USE_MOCK_DATA` | `false` |
| `BLOB_READ_WRITE_TOKEN` | From Vercel Blob store (step 4) |
| `SEED_ADMIN_EMAIL` | Optional — only needed for seeding |
| `SEED_ADMIN_PASSWORD` | Optional — only needed for seeding |

4. Deploy

### 4. Vercel Blob

In the Vercel project → **Storage** → create a **Blob** store → connect to the project.  
This sets `BLOB_READ_WRITE_TOKEN` automatically (or paste it into env vars).

### 5. Push schema + seed (one-time, against production Neon)

```bash
DATABASE_URL="your-neon-pooled-url" npm run db:push
DATABASE_URL="your-neon-pooled-url" SEED_ADMIN_EMAIL="you@example.com" SEED_ADMIN_PASSWORD="strong-password" npm run db:seed
```

Then log in at `https://your-domain/admin` with those credentials. Change the password after first login if you used a temporary one.

### Neon + Vercel integration (optional)

You can also install the **Neon** integration from the Vercel marketplace — it can inject `DATABASE_URL` for you. Still run `db:push` + `db:seed` once after the first deploy.

## Project Structure

```
src/
  app/
    (marketing)/     # Public brand pages
    admin/           # Admin CMS
    ambassador/      # Ambassador portal
    api/             # Auth, upload, QR/card images, survey results
  components/
    ui/              # Shared primitives
    marketing/       # Public brand UI
    admin/           # CMS forms + sidebar
    surveys/         # Shared survey/poll UI
  lib/
    db/              # Drizzle schema + seed (domain SSOT)
    data/            # Mock + DB repository layer
    actions/         # Server Actions
    mock/            # In-memory fixtures for local design
```

Architecture, modularity, and agent conventions live in [`AGENTS.md`](AGENTS.md) and [`.cursor/skills/cat4-platform/`](.cursor/skills/cat4-platform/).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm test` | Run Vitest unit tests |
| `npm run db:push` | Push schema to Neon |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run import:products` | Regenerate product mock seed from `data/` |

## Roles

| Role | Access |
|------|--------|
| **Admin** | Full access including user management |
| **Staff** | Content, products, promotions, surveys, captures, rewards |
| **Ambassador** | Ambassador portal only (`/ambassador`) |

## v2 Roadmap

- Third-party store locator integration
- SMS capture (TCPA)
- Public live poll results
- ESP integration (Resend/SendGrid sync)
# cat4
