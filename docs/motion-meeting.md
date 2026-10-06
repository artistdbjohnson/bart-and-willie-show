# Motion meeting

Domain: motion — factory client. The look in `docs/design-meeting.md` stays. This note is only the pass on top of it.

## Shelf

https://www.prompt-motion.com/ — look only, for attitude and timing.

The index calls itself a collection of short motion films. In this environment the live page stopped at a bot check, so no film was played, no file was saved, and no prompt was copied. Indexed entries were read for stance, not for their text: a bookkeeping film, a frame-by-frame launch, a principles reel, a skill-launch film.

What was taken: one idea, then air. A move arrives on an ease-out. It does not bounce and it is not linear. Starts overlap, so two things do not clap on the same frame or finish as a chorus. Nothing is added because it looks busy.

What was not taken: videos, prompts, palettes, type, layouts, and any shot.

## Already on the board

These stay. They are not replaced and they are not retimed.

- Hero title-frame cycle. The still holds, then a short, then the still. Fade is 1100ms. The still hold is 3s.
- Chalk play. Anime.js draw, 2400ms, stagger 90ms, `inOutSine`. Hero and the list panel.
- Blur Fade and In View. Opacity, slow ease-out.
- Homepage nest. Scroll only. 12px edges.
- Rail tickers. Touch and pause still hold them.

The lockup rise is 0.7s on `cubic-bezier(0.22, 1, 0.36, 1)`. The rule under the intro starts at 0.72s and runs 0.55s. Sentences start at 0.48s.

## Table

| Seat | Concern |
| --- | --- |
| Vale | One object, late, then still. The margin already has the work. Do not open the page twice. |
| Reed | The title frame is the feature. A new move has to rest before that frame gives way to a short. Do not weigh a second open the same as the lead. |
| Glyph | Turf and chalk are the material. Do not redraw the mark. Do not add a second play. Do not retune the chalk that already ships. |
| Ash | Reduced motion is a settled board. An intro plays once in the tab, then it is done. |
| Axiom | Same on `/` and `/pt`. Day and night do not get a different move. The distance is the 12px this site already uses. |

## Rejected

| Proposal | Why it lost |
| --- | --- |
| Poster splash, the Farmington kind | A full-frame hit before the hero. The lockup already rises. A second splash stacks an open on an open. |
| Crest draw, the LP kind | Stroking the official mark. The mark is the file. It is not redrawn. |
| Quiet-open, the Batley kind | Fading the whole page in on every route. The field is already the page. A page fade is a template, and it would replay. |
| Ken Burns, the Boho kind | A slow zoom on the title frame and the episode stills. Those pictures stay published and still. A zoom fights the cycle. |
| Chalk dust, a second diagram, a nav tick, a chain under every heading | Particles, a new play, or a repeated rule. The hero rule and the chalk play already do that job. |

## Vote

**Spot the forty.** Unanimous.

The numeral `40` is already in the hero, top left, chalk at the same faint weight as the yard lines. It is a yard marker, not a line of copy. On the first view in a tab it travels 12px into the place it already rests, once.

Timing, so it does not open with the lockup:

- Delay 1.2s. The lockup has started. The rule has started. The chalk is in the middle of the draw. This is an overlap, not a new downbeat.
- Duration 1.5s. Curve `cubic-bezier(0.22, 1, 0.36, 1)`, the same as the lockup rise.
- It is done around 2.7s, with air before the still gives way to a short.
- The travel is transform only. Opacity stays on `.hero-quiet`, so a short can still fade the numeral with the rest of the type.

Once in the tab: `sessionStorage` key `baw-intro`. The flag is written when the intro starts, so this view still plays. The next full load adds `intro-seen` on `html` before paint. A return to the homepage in the same tab does the same before paint. `intro-seen` settles the lockup rise, the sentences, the rule, the chalk draw, and the forty. It does not stop the title-frame cycle. Reduced motion never sets the flag and never plays the travel. The numeral is where it rests. The intro is already settled.

Day and night are untouched. The mark, the type, the colors, and the chrome are untouched.
