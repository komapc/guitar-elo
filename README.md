# Guitar Elo

A 24-question self-assessment for guitarists, in Russian, answered with sliders, at <https://guitar-elo.lipu.dev/>. Each answer stands for the practice hours a guitarist typically needs to reach that skill; the hours are turned into a chess-style Elo rating on a single curve. The result is an Elo *equivalent*: the rating of a chess player who put in the same number of hours. Real Elo comes from games, and there are no games here.

## How the score works

1. Every slider stop carries a typical number of practice hours (`QUESTIONS` in `site/index.html`). These hours are the author's estimates, not measurements: only the hours → Elo curve below is anchored on data. Every slider runs up to professional level (at least 12 000 h), so a strong player is not pulled down by a short scale.
2. Hours map to Elo by piecewise-linear interpolation in log(hours) through the anchors in `curveAnchors()`.
3. The rating is the weighted mean over answered questions. Each slider starts at "silly question, I'd rather not answer"; a question left there is not counted, so a classical player is not penalised for not using a pick. The rating appears after six answers.
4. Practice time the visitor enters is not part of the score; it is only shown for comparison.

Three questions come with a self-test on the page, so the answer can be checked rather than guessed: a one-minute timer for the C↔G chord-change count; a gap-click metronome (two bars of clicks, then one bar of clicks and 1–16 silent bars, repeated) for holding the tempo in silence, with clicks scheduled on the Web Audio clock and nothing on screen moving during the silent bars; and a ten-note fretboard quiz that measures accuracy and answer time. The timer and the metronome never set an answer. The quiz suggests a slider stop and sets it only when the visitor presses «Поставить».

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

Sources: F. Gobet, G. Campitelli, [The role of domain-specific practice, handedness, and starting age in chess](https://bura.brunel.ac.uk/bitstream/2438/611/1/Gobet_DevPsyc_Final.pdf), Developmental Psychology 43 (2007), 159–172. N. Charness et al., [The role of deliberate practice in chess expertise](https://doi.org/10.1002/acp.1106), Applied Cognitive Psychology 19 (2005), 151–165.

## Run locally

```sh
python3 -m http.server 8000 -d site
node tests/model.test.mjs
```

No build step: `site/` is served as it is. GitHub Pages deploys it on every push to `main` (`.github/workflows/pages.yml`) after the model tests pass.

## License

Code: MIT ([`LICENSE`](LICENSE)).
