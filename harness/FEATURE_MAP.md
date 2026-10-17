# FEATURE_MAP — The Bart & Willie Show

Load this first, then only the files the task needs. Harness files live in `harness/`; not imported by the app.

- **Live:** https://bart-and-willie-show.vercel.app · **Repo:** artistdbjohnson/bart-and-willie-show · **Vercel:** `bart-and-willie-show` · **Owner:** Bart & Willie
- **Stack:** Next.js 16 App Router, React 19, Tailwind, motion + animejs. EN default, PT under `/pt`.
- **Commands:** `npm install` · `npm run dev` · `npm run build` · `npm run check:youtube`
- **Check:** `node harness/harness-check.mjs https://bart-and-willie-show.vercel.app $(grep -v '^#' harness/check-paths.txt)`
- **Automations:** Vercel cron `/api/cron/daily` 10:00 UTC; GitHub workflows `refresh-show.yml` (every 15 min revalidate) and `episode-day-refresh.yml` (Mon/Fri).

## Routes
| Path | Purpose | Key file |
|---|---|---|
| `/` , `/pt` | Home | `app/page.tsx`, `components/home-page.tsx` |
| `/shop`, `/pt/shop` | Merch shop | `app/shop/page.tsx`, `components/shop-page.tsx` |
| `/api/episodes`, `/api/now-playing`, `/api/revalidate-show`, `/api/cron/daily` | Show data / refresh | `app/api/*`, `lib/youtube*.ts`, `lib/now-playing.ts` |
| `/api/subscribe`, `/api/subscribers` | Roster signup | `lib/subscribers.ts`, `components/subscribe-form.tsx` |
| `/api/ig-image`, `/api/ig-media` | Instagram proxy | `lib/instagram.ts` |
| `/api/shop-order` | Shop orders | `lib/shop-orders.ts` |

## Sections / components (home order)
| Section | File | Notes |
|---|---|---|
| Header / liquid-glass nav + iHeart player, marquee, tray | `site-header.tsx`, `player.tsx`, `marquee.tsx` | |
| Hero (official logline) | `hero.tsx`, `hero-cycle.tsx`, `hero-enter.tsx`, `intro-once.tsx` | logline is also meta/OG (`lib/seo.ts`) |
| Latest / episodes | `latest-nest.tsx`, `episode-stage.tsx`, `youtube-rail.tsx`, `watch-dialog.tsx` | data `data/youtube-latest.json` fallback |
| Listen list | `listen-row.tsx` | |
| Hosts / story | `about-hosts.tsx`, `prose-blocks.tsx`, `lib/story.ts`, `lib/copy.ts` | editorial biographer voice |
| Jets | `jets-section.tsx` | |
| Instagram | `instagram-rail.tsx` | |
| Join the Roster | `subscribe-form.tsx` | headline only "JOIN THE ROSTER" |
| Footer + Playmaker band, BUILT BY DGLXSS, back-to-top (liquid glass) | `site-footer.tsx`, `playmaker-social.tsx`, `to-top.tsx` | |

## Locks (no change without Doug)
Current look and function, copy voice, logline, nav player, roster headline.

## Harness-check paths
See `harness/check-paths.txt`.
