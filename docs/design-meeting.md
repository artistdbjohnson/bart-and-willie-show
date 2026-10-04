# Design meeting

Domain: UI/UX — factory client.

The look was not treated as final until this note existed. Research on the hosts, the YouTube channel, the Instagram profile, and the logo colors was already done and is kept here.

## Table meeting

Looked through the shelf. Look only. No assets, logos, or layouts were copied.

| Reference | What it actually is | Vote |
| --- | --- | --- |
| https://posts.design | A feed of social announcement cards from product companies. | Rejected. A card feed would turn the show into a startup launch grid. |
| https://noiced.com | A short, numbered, dated list of videos. Quiet, but it is an index of design talks. | Rejected as the reference. The numbering is someone else's layout. |
| https://deck.gallery | A curated deck archive. Free titles include sports identity manuals (Formula 1, Nike, Strava). The full archive is paid. | Rejected. No paid decks, and no other brand's manual. |
| https://logosystem.co | A logo gallery. Mobbin is a sponsor on the page. | Rejected. Their mark already exists. No Mobbin screenshots. |
| https://visualjournal.it | Alessandro Scarpellini's journal of branding and editorial work. Reductive, modernist, no ads. One project is given room, then the evidence. | **Voted.** |
| https://brandguidelines.net | A directory of other companies' guidelines, plus paid templates. | Rejected. Paid templates stay out. Another brand's system stays out. |
| https://recent.design | A board of product-designer portfolios. | Rejected. That is a hiring wall, not a broadcast. |

Vote: https://visualjournal.it

What was taken: the pace of a case study. One dominant mark, then a measured sequence, with margin doing as much work as the objects. Type and the material carry the page.

What was not taken: his personal site chrome, his project photography, his typefaces, and any layout.

## Sports pacing

Separate from the shelf vote. Looked at https://www.theringer.com/ for pacing only.

What was taken: one dominant feature, then recent pieces in reverse chronological order, with air between them so a lead does not weigh the same as a short.

What was not taken: The Ringer's black-and-white page, GT America, sky-blue pills, or any of their story templates.

## Craft shelf

Motionsites seed: creative-studio, plus the episode rail from blog-showcase.

Applied from creative-studio: a fullscreen hero video that autoplays muted and loops, uppercase tracked labels, a quiet stats row, mobile first.

Applied from blog-showcase: one featured episode (the real player and the real title), then a responsive grid. The picture scales on hover. It is not a flat dump of equal cards.

The seed files `Creative_Studio.md` and `Blog_Showcase.md` in the public prompt mirror returned 404. The craft named in the brief was applied anyway. Not pasted: the seed's purple, an Inter-only page, stock CloudFront video, or Viktor Oddy copy.

## Free shelves

Looked before the look froze. Shipped only free MIT pieces that are actually on the page. They are restyled to field green and signal yellow. The library look is not on the site.

| Shelf | Looked | Decision |
| --- | --- | --- |
| shadcn/ui (MIT, copyright 2023 shadcn) | Button, Input, Label. Composition is Slot, cva, and the Label primitive. | **Shipped**, restyled. Sharp corners, tracked uppercase, signal yellow and chalk. Default zinc, radius, and shadow are not used. |
| Magic UI free (MIT, copyright Magic UI) | Blur Fade. Marquee, shine borders, and gradient text were in the same library. | **Shipped Blur Fade only**, slowed to an ease-out fade. The decorative pieces were rejected. |
| Motion Primitives (MIT, copyright 2024 ibelick) | In View. Text shimmer, border trail, and infinite sliders were the kind of motion on that shelf. | **Shipped In View only**, opacity, slow ease-out. Shimmer, trails, and auto-marquees were rejected. |
| Anime.js 4.5 (MIT, copyright Julian Garnier) | SVG `draw` for a path. | **Shipped** for the chalk play, which draws on once. |
| Uiverse | Community widgets: glass cards, glowing buttons, loaders. | Rejected. They would paste a kit over the brand. |
| Motionsites | Free-seed craft above. Paid prompts were not opened and are not in the repo. | Craft only. |

Not shipped, and not imported: Colir, Zoxilsi exports, Aceternity, paid packs, Rize, Mobbin screenshots.

## Components on the page

Each of these is its own component, with type, spacing, hover, focus, empty, and a small-screen layout.

- Navigation. Official mark, tracked links, current page, day/night, English/Portuguese. On a small screen the menu opens in the flow under the bar. It is not a sticky trap.
- Episode stage. Featured player held at 16:9, title beside it from the medium breakpoint up. Choosing another episode swaps the player in that same frame. Grid pictures scale on hover when the device can hover and motion is allowed.
- YouTube rail. Horizontal snap scroll of the public channel feed, shorts labeled, previous and next buttons, empty state if the feed fails.
- Instagram rail. Same scroll behavior, different card: square frame, post or clip, caption, link. Empty state names the block honestly and links to the profile.
- About and the Jets years. Prose, not cards. The Jets seasons are a section with their own page, not a line under a bio.
- Owned list. Name and email, inline errors, sending state, success that says where the row actually went, export, and an empty export state.

Motion is slow and ease-out. Nothing bounces. The field color itself eases over 700ms when day and night change, because `--field` is a registered color and the page reads that variable. The featured player fades in over 640ms inside the same 16:9 frame. Rails scroll smoothly. `prefers-reduced-motion` removes the chalk draw, the fade distance, the hover scale, the hero autoplay, the player fade, the color ease, and smooth scrolling. The hero video is muted. The featured player does not autoplay. Language changes do not slide the page. The header is not sticky.

## Color

Sampled from the supplied mark and banner. The yellow block's common pixels sit at about `#F4DC00`. The open field in the mark's corner samples to `#369D59`. Black in the wordmark is near `#111111`. Chalk in the UI is `#F7F4EA`.

Checker: https://colorable.jxnblk.com/ is a client-side checker. Its homepage loads. A deep link such as `https://colorable.jxnblk.com/111111/f4dc00` is not a static file (the host returns 404), so the ratios below were computed with the WCAG 2 relative-luminance formula that checker uses. No ramp was imported.

| Pair | Ratio | WCAG |
| --- | --- | --- |
| `#111111` on `#F4DC00` | 13.56 | AAA. This is the wordmark. |
| `#F4DC00` on `#369D59` | 2.46 | Fails, including large text. |
| `#FFFFFF` on `#369D59` | 3.43 | AA for large text only. |
| `#F7F4EA` on `#145C32` | 7.32 | AAA. Day reading surface. |
| `#F4DC00` on `#145C32` | 5.79 | AA, and AAA for large text. |
| `#F7F4EA` on `#0C3D24` | 11.17 | AAA. Night reading surface. |
| `#F4DC00` on `#0C3D24` | 8.83 | AAA. |
| `#CED9C9` on `#145C32` | 5.51 | AA. Quiet labels, day. |
| `#CDD3C6` on `#0C3D24` | 8.04 | AAA. Quiet labels, night. |

`#145C32` and `#0C3D24` are darker steps of the sampled field hue, not a new palette. The bright `#369D59` stays in the hero wash and the yard lines, where it is material rather than body text. Signal yellow is the lockup fill behind black type. It is not used as small text on the bright field.

Small labels use `--quiet`, which is chalk mixed 82% onto the current field. That mix is `#CED9C9` on the day field (ratio 5.51, AA) and `#CDD3C6` on the night field (ratio 8.04, AAA). Chalk at 55% opacity was about 3.40 on the day field, so it is not used for type.

## Expensive

The material is turf and chalk. Yard lines, a faint hash, and a chalk play drawn on with Anime.js. The play is a line of scrimmage, a back, a receiver, and two routes, stroked heavy enough to read over the hero. The yellow blocks are flat ink, not a gradient card. Spacing is wide. Corners are square.

## Tool pass

Motionsites seeds, as above. https://www.footer.design/ was look-only: a gallery, not a footer to copy. The footer here is rebuilt as a large wordmark, three short columns, and one credit line. Rize was not added.

## Locks

- English is the default. Portuguese is a twin of every page: `/`, `/episodes`, `/jets`, `/about`, `/subscribe`, and the same paths under `/pt`.
- Day and night. The choice is stored in `localStorage` under `baw-theme`.
- The visible credit is exactly `built by dglxss`.

## Hosts and the Jets years

Facts used on the site come from:

- https://en.wikipedia.org/wiki/Bart_Scott
- https://www.pro-football-reference.com/players/S/ScotBa20.htm
- https://www.newyorkjets.com/news/where-are-they-now-bart-scott (Jim Gehman, Oct 23, 2025)
- https://en.wikipedia.org/wiki/Willie_Colon_(American_football)
- https://www.pro-football-reference.com/players/C/ColoWi20.htm
- https://gohofstra.com/honors/hofstra-athletics-hall-of-fame/willie-colon/125
- https://www.newyorkjets.com/news/where-are-they-now-willie-colon (Jim Gehman, Jun 13, 2024)

Wikipedia's Bart Scott infobox and career table do not agree on the career tackle total. That number is not printed. Counting stats are linked to Pro Football Reference.

The show's own YouTube descriptions say new episodes are Mondays and Fridays, and they describe Bart Scott as an 11-year NFL veteran and Willie Colon as a Super Bowl XLIII champion. The October 2, 2026 upload "Willie’s Honest Take on Jets" has a chapter titled "Jets Vibe Check." The site repeats that chapter title only as a chapter of that upload. It does not invent a standing segment name.

SNY Jets broadcasts mentioned in the Jets.com profiles are described as separate from this show.

## Hero

Channel id `UCynpQXiIDMLylarxGZZz9Dg`, from https://www.youtube.com/@bartandwillieshow and the public RSS `https://www.youtube.com/feeds/videos.xml?channel_id=UCynpQXiIDMLylarxGZZz9Dg`.

The hero is the latest full upload on that feed (not a Short), official iframe, muted, looping roughly the first 12 seconds, with a link to the same video on YouTube. There is no generated title sequence. The player is scaled inside a clipped frame so YouTube’s title bar, sign-in chip, and logo fall outside the hero. The lockup paints above that frame. If the feed fails, the hero is the field, the lockup, and the channel link.

## YouTube and Instagram

YouTube titles, thumbnails, links, and view counts come from that RSS. If it fails, the rail says so.

Instagram is the public `web_profile_info` response for `bartandwillieshow` (it loaded during research: name "The Bart and Willie Show," biography naming Monday and Friday episodes and `@therealbartscott` and `@williecolon66`). The server asks for that JSON with a normal browser user-agent. When Node’s client is refused, the same request is tried with `curl` if the host has it. Images are proxied only from Instagram’s CDN. If both requests fail, the page says the profile feed did not load and links to https://www.instagram.com/bartandwillieshow. Posts are not invented.

TikTok is the banner handle, linked as https://www.tiktok.com/@bartandwillieshow. No TikTok posts are fabricated.

## Subscribers

The list is first-party. Name and email. CSV export on the subscribe page. No Mailchimp, no YouTube follow button, no invented database secret.

Persistence: `POST /api/subscribe` appends to `data/subscribers.json` when the process can write that file. A long-running Node server can. Vercel serverless cannot keep a shared file: the project disk is read-only and `/tmp` is not a shared database. When the write fails, the API returns `persisted: false`, the browser keeps the row in `localStorage` under `baw-subscribers`, and the CSV export merges that browser list with whatever the server file actually returned. The interface says which of those happened. It does not say a row was stored on the show's list when it was not.

Limit, exactly: on Vercel, the owner cannot download other people's signups, because those rows never leave the visitor's browser. The export URL is unauthenticated when a writable server does have the file, because no auth secret is configured. `data/subscribers.json` is gitignored.
