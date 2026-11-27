# Guitar Elo

A 25-question self-assessment for guitarists, answered with sliders, in English at <https://guitar-elo.lipu.dev/> and in Russian at <https://guitar-elo.lipu.dev/ru/>. Each answer stands for the practice hours a guitarist typically needs to reach that skill; the hours are turned into a chess-style Elo rating on a single curve. The result is an Elo *equivalent*: the rating of a chess player who put in the same number of hours. Real Elo comes from games, and there are no games here.

## How the score works

1. Every slider stop carries a typical number of practice hours (`QDEF` in `site/common.js`). These hours are the author's estimates, not measurements: only the hours → Elo curve below is anchored on data. Every slider runs up to professional level (at least 12 000 h), so a strong player is not pulled down by a short scale.
2. Hours map to Elo by piecewise-linear interpolation in log(hours) through the anchors in `curveAnchors()`.
3. The rating is the weighted mean over answered questions, taken in log hours (the curve's x axis) and put through the curve once; the per-category ratings are computed the same way. Averaging each answer's Elo instead would let the steep 1 404–11 053 h stretch pull uneven answers up. Each slider starts at "silly question, I'd rather not answer"; a question left there is not counted, so a classical player is not penalised for not using a pick. An answer set by an on-page test counts `MEASURED_WEIGHT` (1.5) times as much while the slider stays on the stop the test showed; moved elsewhere, it is a self-report again. The rating appears after six answers. The ± is the weighted spread of the answers; above `GRADE8_HOURS` (3 300 h, the practice measured for Grade 8 by Sloboda et al. 1996, the only measured figure; see `docs/research/`) it also grows by half the Elo distance above that point, and the page shows the hours as a range, because no guitar measurements exist up there.
4. Practice time the visitor enters is not part of the score; it is only shown for comparison.

Five questions come with a self-test on the page, so the answer can be checked rather than guessed: a one-minute timer for the C↔G chord-change count; a gap-click metronome (two bars of clicks, then one bar of clicks and 1–16 silent bars, repeated) for holding the tempo in silence, with clicks scheduled on the Web Audio clock and nothing on screen moving during the silent bars; a ten-note fretboard quiz that measures accuracy and answer time; and a chord-by-ear quiz in three levels of ten chords (major/minor, then 7/maj7/m7, then dim/aug/sus2/sus4; a level passes at 8 of 10); and a tap-along rhythm test under the metronome question in three levels (clicks on every beat, on 2 and 4 only, once a bar; the player taps every beat for eight bars after a two-bar count-in). The rhythm test scores only the spread of the taps around the beat (SD as a share of a beat; a level passes at 5 % with at most two missed beats), never their mean offset, so output latency, Bluetooth and touch delay do not matter; taps use the event's own time stamp. During a run nothing on screen marks the beat: the pad lights and counts only the player's own taps, and a progress bar fills smoothly over the whole run (hidden with reduced motion; the text names the wait). Stopping before the end gives no result and says so. When any test finishes, its result line scrolls into view, since on a phone the buttons the player was looking at disappear below it. The 5 % mark is an assumption: with independent tap errors it is an inter-tap CV of about 0.07, between percussionists (0.052) and other trained musicians (0.115) in Cameron & Grahn (2014), whose beat-finding task was harder. Tapping along with a click on every beat separates amateurs from non-musicians weakly (Repp 2010), so the first level says the least. Chords are synthesised in the browser: a strummed sawtooth pluck with a closing low-pass, the root doubled in the bass, roots between G3 and F#4 so phone speakers carry them. The timer and the gap metronome never set an answer. The fretboard, chord and rhythm tests suggest a slider stop and set it only when the visitor presses "Set it"; the top stops (intervals, extended chords, playing ahead of or behind the beat) are not tested and never suggested.

The page also lists reference points converted on the same curve: hours of a five-year music-school guitar programme by grade (from the programme's hour norms), violin students from Ericsson et al. (1993) and the 2019 replication, and a grandmaster at 2500. It adds a guessed answer sheet for Vladimir Vysotsky to show how a mixed profile averages out.

## Where the curve comes from

From Gobet & Campitelli (2007), 104 Argentine players rated 1490–2473 on the Argentine national scale (r = .89 with FIDE):

| Hours | Elo | Basis |
|---|---|---|
| 0 | 400 | assumption |
| 100 | 750 | assumption |
| 1 404 (3 years × 3 a week × 3 h) | 1250 | derived: hours typical for a player of this rating (Table 1 geometric group means and Table 2 give 1231 and 1261; table rounding allows 1100–1400). Below the sample floor, so an extrapolation. Adjustable on the page. |
| 11 053 | 2200 | measured: mean hours when players first reached 2200 (n = 34, range 3 016–23 608) |
| 25 000 | 2500 | assumption |
| 50 000 | 2750 | assumption; the scale stops at 2850 |

The curve answers "how many hours does a player of this rating typically have", because the questionnaire works the same way (skill → typical hours to reach it). The opposite question, "average rating of a player with these hours", gives about 1650–1800 for 1 404 h from the paper's own regression, but that figure is inflated: players below 1490 were not sampled.

### Hours and rating: three different lines

The page draws a chart (hours on a log scale, all hours = total practice) with three things that are easy to confuse, all from the same 104 players in Gobet & Campitelli (2007):

- **The site's curve**: hours typically needed to *reach* a rating. Measured at one point only: players first reached 2200 after 11 053 h on average (range 3 016–23 608, n = 34). The other anchors are assumptions.
- **Title groups** (Table 1): hours *accumulated by players now at* a rating, at the time of the survey — 8 303 h at 1780, 11 715 at 2030, 19 618 at 2165 (FIDE masters), 27 929 at 2300 (IMs). They sit right of the curve because players keep practising after their rating levels off, and arithmetic means of skewed hours run high.
- **Rating expected for given hours**: least squares from the paper's r = .57 between rating and log10 total hours (means 1991 and 3.9, SDs 221.5 and 0.4): about 300 Elo per tenfold hours, residual SD ≈ 182. The paper prints the log SDs rounded to 0.4, so the slope is uncertain by about a fifth (the same derivation for group hours gives 299 against the paper's exact 252). Much flatter either way: 1 404 h → about 1750–1800, 11 053 h → about 2040; the 1490 rating floor of the sample also lifts its low end.

The gap between the lines is what a moderate correlation looks like. Hours explain about a third of rating differences here (r² = .33); meta-analyses give 26 % for games and 21 % for music, about a third after correcting for unreliable self-reports (Macnamara, Hambrick & Oswald 2014; Hambrick et al. 2014). Players with equal hours differ by about ±200 Elo (1 SD); the hours needed to reach 2200 differ eightfold, and some players passed 25 000 h without reaching it. In music, Grade 8 took about 3 300 h on average (Howe, Davidson & Sloboda 1998), with some students at every grade practising under a fifth of the mean and others over four times as much. The 25 000 h → 2500 and 50 000 h → 2750 anchors have no data behind them; eight grandmasters who reached the world top ten had about 14 000 h at their peak (Howard, as reported by Hambrick et al. 2014).

Sources: F. Gobet, G. Campitelli, [The role of domain-specific practice, handedness, and starting age in chess](https://bura.brunel.ac.uk/bitstream/2438/611/1/Gobet_DevPsyc_Final.pdf), Developmental Psychology 43 (2007), 159–172. N. Charness et al., [The role of deliberate practice in chess expertise](https://doi.org/10.1002/acp.1106), Applied Cognitive Psychology 19 (2005), 151–165.

A wider literature review (graded exams, practice hours, self-report accuracy, lab tests, rating scales) is in [docs/research/](docs/research/): the report in Russian, the working notes in English.

## Run locally

```sh
python3 -m http.server 8000 -d site
node tests/model.test.mjs
```

No build step: `site/` is served as it is. GitHub Pages deploys it on every push to `main` (`.github/workflows/pages.yml`) after the model tests pass; the deploy replaces `?v=dev` in every page with the commit, so a cached old script never meets a new page, and sets the sitemap's `lastmod` to the date of the last commit that changed `site/`. It stops if a page is left without its four stamps or is missing from the sitemap.

## Search and sharing

- Each page has its own canonical URL, `hreflang` alternates (en, ru, x-default; the sitemap lists the same), a description and a 1200×630 preview image. The two quiz pages also carry a `WebApplication` JSON-LD block. The tests check that these agree.
- The preview images `site/og-en.png` and `site/og-ru.png` are rendered from `og/og.html` by `python3 og/render.py` (Playwright). They name no question count, so they need no update when questions are added.
- `/` carries the Bing verification meta tag; the 32-hex `.txt` file at the site root is the IndexNow key for this host. After each deploy that changed `site/`, the workflow submits every sitemap URL to IndexNow (Bing, Yandex); a push that changes only README or tests submits nothing, and a manual run (`workflow_dispatch`) always submits.

## Languages

- Three pages per language: the quiz (`site/index.html`, `site/ru/index.html`), "How it is scored" (`method/`: the curve, its calibration and chart) and "Scale and comparisons" (`compare/`: rating bands, the reference table, Vysotsky). The Russian pages sit under `site/ru/` at the same paths. Each page holds its own static text and loads its strings, then the shared logic, then its own script.
- `site/common.js` has the model and every number: hours per slider stop, weights, the curve, the chart data. It also keeps the calibration, which has its own saved value (`guitar-elo-cal`), so a change on `method/` reaches the quiz, including in another tab or after Back. `site/app.js` runs the quiz, `site/about.js` the two reading pages. None of them contains visible text.
- `site/i18n/en.js` and `site/i18n/ru.js` define `T`, all strings the scripts show, keyed by question id and in stop order.
- Both languages share one saved state (slider positions as indices), so their keys, option counts and table lengths must match; `tests/model.test.mjs` checks that and runs every model test once per language. An English label has to name the same skill as its Russian twin, since both carry the same hours.
- The English pages stay English unless the visitor picked Russian with the switch (remembered in `localStorage`); then each goes to the same page under `/ru/`. A Russian-language browser without a saved choice sees a hint linking to that page, never an automatic redirect.

## License

Code: MIT ([`LICENSE`](LICENSE)).
