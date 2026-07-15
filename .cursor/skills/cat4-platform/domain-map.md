# Domain Map

Quick map of product domains → schema → routes → primary modules.

## Products

| | |
|--|--|
| Tables | `products` |
| Data | `lib/data/products.ts` |
| Actions | `lib/actions/admin.ts` |
| Public | `/products`, `/products/[category]/[slug]` |
| Admin | `/admin/products` |
| Notes | Categories SSOT: `lib/categories.ts`. Creating a product also creates a product QR. |

## Homepage & hero

| | |
|--|--|
| Storage | `site_settings` key `"homepage"` (JSON) **and** `hero_blocks` |
| Helpers | `lib/homepage.ts` |
| Data | `lib/data/site-settings.ts`, `lib/data/hero.ts` |
| Admin | `/admin/home` (page CMS), `/admin/hero` (hero media) |
| Public | `/` via `BrandLanding` |
| Notes | Do not merge these two concepts. |

## Locations / education / about

| Domain | Data module | Admin | Public |
|--------|-------------|-------|--------|
| Locations | `lib/data/locations.ts` | `/admin/locations` | `/find` |
| Education | `lib/data/education.ts` | `/admin/education` | `/education` |
| About | `lib/data/about.ts` | `/admin/about` | `/about` |

## Promotions (landing pages)

| | |
|--|--|
| Tables | `landing_pages`, `landing_page_entries` |
| Types | sweepstakes, raffle, giveaway, contest |
| Data | `lib/data/landing-pages.ts` |
| Public | `/[slug]`, `/[slug]/enter` (legacy `/l/*` redirects) |
| Admin | `/admin/landing-pages` (UI: “Promotions”) |

## Surveys & polls

| | |
|--|--|
| Tables | `surveys`, `survey_questions`, `survey_responses`, `survey_answers` |
| Discriminator | `surveys.type`: `survey` \| `poll` \| `questionnaire` |
| Data | `lib/data/surveys.ts` |
| Helpers | `lib/surveys/` |
| Public | `/survey/[slug]`, `/poll/[slug]` (+ results) |
| Admin | `/admin/surveys`, `/admin/polls` |
| API | `/api/surveys/[id]/results` |
| UI shared | `components/surveys/*` |

## Captures / subscribe

| | |
|--|--|
| Tables | `captures`, `subscribers` |
| Sources | subscribe, landing_page, survey, manual, reward_claim, ambassador |
| Data | `lib/data/captures.ts` |
| Public | `/subscribe` + inline subscribe sections |
| Admin | captures / “Subscribes” dashboard + CSV export |

## Rewards / QR

| | |
|--|--|
| Tables | `qr_codes`, `qr_scans`, `reward_claims` |
| Destinations | product_page, link_hub, promotion, survey, poll, subscribe, claim_reward, external_url |
| Data | `lib/data/qr-codes.ts` |
| Helpers | `lib/rewards/` |
| Public | `/r/[code]` |
| Admin | `/admin/rewards` |
| API | `/api/qr/[code]/image` |

## Ambassadors

| | |
|--|--|
| Tables | `brand_ambassadors`, `ambassador_link_clicks` (+ optional `users` link) |
| Link modes | global, custom, merge |
| Data | `lib/data/ambassadors.ts` |
| Helpers | `lib/ambassadors/` |
| Public hub | `/a/[slug]` |
| Admin | `/admin/ambassadors` |
| Portal | `/ambassador/*` |
| Actions | `ambassador-admin.ts`, `ambassador.ts` |
| API | `/api/ambassadors/[id]/card` |

## Users & auth

| | |
|--|--|
| Tables | `users` |
| Roles | admin, staff, ambassador |
| Data | `lib/data/users.ts` |
| Auth | `lib/auth.ts`, `lib/auth.config.ts`, `lib/auth-utils.ts` |
| Admin | `/admin` login + user management (admin only) |
| API | `/api/auth/[...nextauth]` |

## Analytics

| | |
|--|--|
| Tables | `page_views` (+ QR scans / ambassador clicks) |
| Data | `lib/data/analytics.ts` |
| Actions | `lib/actions/analytics.ts` |
| Client | `components/marketing/page-view-tracker.tsx` |
| Notes | Append-oriented; keep reads bounded. |

## Short public route cheat sheet

| Prefix | Domain |
|--------|--------|
| `/[slug]` | Promotions |
| `/r/` | QR / rewards destinations |
| `/a/` | Ambassador vanity hubs |
| `/survey/` | Surveys |
| `/poll/` | Polls |
