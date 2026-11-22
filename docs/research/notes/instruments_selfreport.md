# Validated instruments for musical skill / sophistication, and accuracy of musicians' self-assessment

Scope note: these notes feed the guitar-elo self-assessment quiz (25 slider questions → typical practice hours → chess-Elo). "Secondary" marks a number I saw only in a search snippet or a third-party summary, not in the primary paper. "Inference" marks my own reasoning. Several primary pages (PMC for some articles, Nature/Springer full texts) were blocked by reCAPTCHA or login redirects. What they would have provided is listed under Gaps.

## 1. Goldsmiths Musical Sophistication Index (Gold-MSI): structure, items, scoring, BBC norms, reliability, how training and practice are asked

### Takeaway
Gold-MSI is a 38-item, 7-point self-report with five subscales plus an 18-item General factor, normed on about 147k BBC respondents. Its Musical Training subscale, made of countable facts (years, peak hours per day, number of instruments), is the most reliable part: α = .903, test-retest r = .974. Even so, self-report correlates only about .26–.38 with objective listening tests in the big sample. Self-report is stable, but it is a noisy proxy for measured skill.

### Cited Findings
**Sample and structure**
- The sample size is reported inconsistently within the same paper. The abstract says n = 147,636. The Methods say 147,633 after excluding 404 low-variance respondents from 148,037 completers. A later part of the page says 147,663 (the fetch placed it in the second half of the article, near Study 5; exact location not confirmed). — [Müllensiefen et al. 2014, PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0089642)
- Sample split: Study 1 (training) had n = 73,894, 45.2% female, mean age 35.2 (SD 15). Study 2 (test) had n = 73,739. — [Müllensiefen et al. 2014](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0089642)
- Development history: the pilot had 111 items, then a 70-item, 7-factor version. The final instrument has 38 items in 5 subscales, and an 18-item General factor draws mostly on Musical Training and Singing. — [Müllensiefen et al. 2014](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0089642)
- The five subscales are Active Engagement, Perceptual Abilities, Musical Training, Singing Abilities and Emotions. All materials are free to use. — [Goldsmiths Gold-MSI page](https://gold.ac.uk/music-mind-brain/gold-msi); [gold-msi.org](http://gold-msi.org/)
- Item counts per subscale, from the Goldsmiths psyquest implementation's item bank: Active Engagement 9, Perceptual Abilities 9, Musical Training 7, Singing 7, Emotions 6, General 18. — [psyquest GMS_item_bank.csv](https://github.com/klausfrieler/psyquest/blob/master/data_raw/item_banks/GMS_item_bank.csv)
- Scoring: each item uses a 7-point scale from "Completely disagree" to "Completely agree" with a neutral midpoint. Subscale scores are unit-weighted sums of raw item scores. Reverse items are scored as 8 − x. — [Müllensiefen et al. 2014](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0089642); [psyquest item bank (score_func)](https://github.com/klausfrieler/psyquest/blob/master/data_raw/item_banks/GMS_item_bank.csv)

**Musical Training items (7 items, range 7–49), exact English wording and options** — [psyquest GMS_dict.csv](https://github.com/klausfrieler/psyquest/blob/master/data_raw/dicts/GMS_dict.csv)
- "I engaged in regular, daily practice of a musical instrument (including voice) for the following number of years:" Options: 0 / 1 / 2 / 3 / 4-5 / 6-9 / 10 or more. Also loads on General.
- "At the peak of my interest, I practised my primary instrument (including voice) for the following number of hours per day:" Options: 0 / 0.5 / 1 / 1.5 / 2 / 3-4 / 5 or more. Also loads on General.
- "I have had formal training in music theory for the following number of years" Options: 0 / 0.5 / 1 / 2 / 3 / 4-6 / 7 or more.
- "I have had formal training on a musical instrument (including voice) during my lifetime for the following number of years:" Options: 0 / 1 / 2 / 3 / 4-5 / 6-9 / 10 or more.
- "I can play the following number of musical instruments (including voice):" Options: 0 / 1 / 2 / 3 / 4 / 5 / 6 or more. Also loads on General.
- "I have never been complimented for my talents as a musical performer." Reverse-scored, also loads on General.
- "I would not consider myself a musician." Reverse-scored, also loads on General.
- Note: Gold-MSI never asks for lifetime cumulative hours. It asks for years of regular daily practice and hours per day at the peak of interest, both on non-linear binned scales.

**Perceptual Abilities items (9 items, range 9–63)** — [psyquest GMS_dict.csv](https://github.com/klausfrieler/psyquest/blob/master/data_raw/dicts/GMS_dict.csv)
- "I am able to judge whether someone is a good singer or not."
- "I usually know when I'm hearing a song for the first time."
- "I find it difficult to spot mistakes in a performance of a song even if I know the tune." (reversed)
- "I can compare and discuss differences between two performances or versions of the same piece of music." (also General)
- "I have trouble recognizing a familiar song when played in a different way or by a different performer." (reversed)
- "I can tell when people sing or play out of time with the beat."
- "I can tell when people sing or play out of tune."
- "When I sing, I have no idea whether I'm in tune or not." (reversed, also General)
- "When I hear a piece of music I can usually identify its genre."
- Discrepancy: psyquest tags "When I sing, I have no idea whether I'm in tune or not" as Perceptual Abilities + General, but [Correia et al. 2023](https://sites.utm.utoronto.ca/sites/sites.utm.utoronto.ca.glenn_website/files/download/CorreiaEtAl2023_PACA.pdf) cite it as the example Singing Abilities item. I did not check this against the original paper's File S1.

**BBC norms (Table 2, n = 147,633): mean (SD), possible range, α / ω total / Guttman λ6** — [Müllensiefen et al. 2014 (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC3935919/)

| Scale | Mean (SD) | Range | α | ω | λ6 |
|---|---|---|---|---|---|
| Active Engagement | 41.52 (10.36) | 9–63 | .872 | .874 | .864 |
| Perceptual Abilities | 50.20 (7.86) | 9–63 | .873 | .874 | .867 |
| Musical Training | 26.52 (11.44) | 7–49 | .903 | .904 | .905 |
| Singing Abilities | 31.67 (8.72) | 7–49 | .870 | .871 | .866 |
| Emotions | 34.66 (5.04) | 6–42 | .791 | .792 | .768 |
| General Sophistication | 81.58 (20.62) | 18–126 | .926 | .927 | .938 |

- Full percentile norms are in Table S3 of File S1, which I could not retrieve. See Gaps. — [PMC3935919](https://pmc.ncbi.nlm.nih.gov/articles/PMC3935919/)
- In the reduced Study 1 subscales, α ranges from .789 to .900. Hierarchical-model ω is .74 on the training data and .721–.834 across solutions. — [Müllensiefen et al. 2014](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0089642)

**Test-retest (Study 3b, lab, n = 53, about 64 days apart; Table 3)**
- Active Engagement .899, Perceptual Abilities .894, Musical Training .974, Singing .940, Emotions .857, General .972. — [PMC3935919](https://pmc.ncbi.nlm.nih.gov/articles/PMC3935919/)
- Conflict: the PLOS text summary says test-retest r falls "between .857 and .972", but Table 3 lists Musical Training at .974. — [PLOS ONE text](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0089642) vs [Table 3 on PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3935919/)

**Self-report vs objective listening tests**
- Large online sample (n = 136,924–139,062, Table 6), correlations with Melodic Memory / Beat Perception:
  - Active Engagement .103 / .224
  - Perceptual Abilities .261 / .342
  - Musical Training .301 / .356
  - Singing .259 / .305
  - Emotions .128 / .218
  - General .285 / .375

  — [PMC3935919](https://pmc.ncbi.nlm.nih.gov/articles/PMC3935919/)
- Small lab subsample (n = 34, a separate result): General correlates r = .38 with beat perception and r = .51 with melodic memory. — [Müllensiefen et al. 2014](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0089642)
- In the structural model, General predicts beat perception (.37) and melodic memory (.28). — [Müllensiefen et al. 2014](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0089642)
- Reliability of the listening tests differs. Melodic memory is weak: 11 items, α .61/.68. Beat perception is good: 15 items, α .87/.92. — [Müllensiefen et al. 2014](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0089642)

**Demographics**
- Random forests using all socio-economic variables explained only 4.7%–13.6% of variance. — [Müllensiefen et al. 2014](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0089642)
- For beat perception, musical training was the most important predictor. Age was negatively related, and women scored significantly lower than men. — [Müllensiefen et al. 2014](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0089642)
- For melodic memory, the top predictors were training, age, occupation, occupational status and education. Older and more trained participants scored better. — [Müllensiefen et al. 2014](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0089642)

**Other samples and translations**
- In a small study, Gold-MSI Musical Training averaged 42.4 (SD 3.1) for musicians and 10.9 (SD 3.2) for non-musicians. Secondary: search snippet of a table. — [PMC9612920 table](https://pmc.ncbi.nlm.nih.gov/articles/PMC9612920/table/T1)
- A mixed sample (n = 104) had Musical Training M = 26.96, SD = 12.34, range 7–49, and General 82.16 (21.84). Secondary. — [PMC7536169 table](https://pmc.ncbi.nlm.nih.gov/articles/PMC7536169/table/Tab4)
- The Taiwanese adaptation publishes percentile norms. Secondary. — [research.gold.ac.uk/26880](https://research.gold.ac.uk/26880)
- Danish Gold-MSI (2024): the bifactor structure replicated. The effect of self-reported training on listening abilities "diminished with increasing sample representativeness." Secondary: DOAJ abstract snippet. — [Music & Science 2024 (DOAJ)](https://doaj.org/article/3934a3b5be1e4ecd9dd5e2c6d94638f0)

### Inferences
- **Factual, countable items are the most reliable self-report.** Gold-MSI's best subscale (α .903, retest .974) is built from counts with fixed, non-linear bins (0/0.5/1/1.5/2/3-4/5+). The quiz's style of "I can play X bpm 16ths" or "I hold tempo for N bars" is closer to these countable items than to agree/disagree items, which is good. Using concrete numeric bins with wider steps at the top (like 3-4 and 5+) mirrors Gold-MSI.
- **Retest stability is not accuracy.** People answer the same way twice (r ≈ .9+), but self-report predicts measured perceptual skill only at about r = .26–.38 in a population sample. A quiz built on self-report should show a wide ± and not imply precision.
- **Ask about peak and duration, not lifetime totals.** Gold-MSI asks peak hours per day and years of regular practice. If the quiz needs lifetime hours, years × peak daily hours is a ceiling-style estimate that will overstate (see section 3).
- **Reverse-keyed identity items** ("I would not consider myself a musician") are cheap checks against acquiescence and straight-lining. If all 25 quiz sliders point the same direction (more = better, not verified here), a couple of reverse-anchored or consistency items could flag careless answering.
- **Gold-MSI norms come from a general population of mostly non-musicians.** They cannot place a guitarist among guitarists, only among the BBC-visiting public. Musical Training mean 26.5 (SD 11.4) could serve as a coarse "population" reference point.

### Gaps
- Gold-MSI percentile tables (File S1, Table S3) were not retrievable. Only means, SDs and ranges are confirmed.
- The psyquest `benchmarks.csv` in the same repo holds child (age-10, LongGold) per-item-mean norms, not BBC adult norms. Do not reuse it as BBC percentiles.
- The exact Perceptual Abilities vs Singing assignment of "When I sing, I have no idea whether I'm in tune" was not verified against the original File S1.

## 2. Other instruments: OMSI, PROMS/Mini-PROMS, Musical Ear Test, BAT/CA-BAT, H-BAT, Mistuning Perception Test, Melodic Discrimination Test — what they measure, IRT use, how they scale difficulty

### Takeaway
Objective tests split into two families:
- **Classical same/different batteries** (PROMS, MET) with fixed items and sum scores.
- **Modern adaptive IRT tests from Goldsmiths** (CA-BAT, MPT, MDT), where item difficulty is predicted from stimulus features (explanatory IRT), items are picked to match the current ability estimate, and every score comes with a standard error.

CA-BAT gives a sobering benchmark. Even 25 adaptive items reached only test-retest r = .67 in the lab and about .30 online.

### Cited Findings
**OMSI (Ollen 2006)**
- A "ten-question standardised test for evaluating musical skills" from Joy Ollen's Ohio State PhD dissertation. An online version was hosted by MARCS. — [arj.no on OMSI](https://www.arj.no/2011/10/25/omsi/)
- Zhang & Schubert (2019, *Music Perception* 36(5):457–467) found the OMSI "musician rank" single item ("which title best describes you") to be the best single-item predictor of both OMSI and Gold-MSI scores. They recommend it for face validity, correlation with sophistication, and a plausible split into three musical identity categories: no musical identity, musical identity and strong musical identity. Abstract-level. — [x-mol abstract](https://www.x-mol.com/paper/1346200114461528064)

**PROMS family (Law & Zentner 2012; Zentner & Strauss 2017; Strauss et al. 2024)** — [PROMS User Guide (developers)](https://musemap.org/wp-content/uploads/2025/10/PROMS_User_Guide.pdf)
- Measures perception in 9 domains: Melody, Pitch, Timbre, Tuning, Rhythm, Embedded Rhythm, Metric Accent, Tempo, Loudness. Every item is a same/different judgement.
- Versions:
  - Full-PROMS: 9 subtests, about 60 min.
  - PROMS-S: 8 subtests, about 35 min.
  - Mini-PROMS: Melody, Accent, Tempo, Tuning; about 15 min.
  - Micro-PROMS: about 10 min, overall score only.
- Psychometrics: composite internal consistency and test-retest > .85; subtests .56–.85. Criterion validity with external musical-proficiency indicators is .38–.62 across three studies. A non-musical auditory discrimination task gave −.05 (ns), supporting discriminant validity. Convergent validity was shown with Gordon's AMMA/MAP and with MET rhythm. This is the developers' own summary.
- Scoring is confidence-weighted. A correct, sure answer earns 2 points and a correct but "probably" answer earns 1. The 5 response options run from "definitely same", "probably same", "I don't know", "probably different" to "definitely different".
- The Micro-PROMS correlated r = .51 with Gold-MSI General. Secondary: search snippet of the abstract. — [Strauss et al. 2024, BRM](https://link.springer.com/article/10.3758/s13428-023-02130-4)
- Mini-PROMS shows "large differences between musicians and nonmusicians." Secondary snippet; it is one of the search results, and the pairing with this URL is not confirmed. — [Strauss et al. 2024](https://link.springer.com/article/10.3758/s13428-023-02130-4)
- An independent evaluation of the Brief-PROMS exists: Kunert, Willems & Hagoort 2016, *PLOS ONE* e0159103. — [PROMS User Guide refs](https://musemap.org/wp-content/uploads/2025/10/PROMS_User_Guide.pdf)

**Musical Ear Test (MET; Wallentin et al. 2010)**
- Same/different task with two subtests: short melodies and rhythmic patterns. Whole-test α = .85. Secondary: a Brazilian paper citing Wallentin. — [rsdjournal](https://rsdjournal.org/index.php/rsd/article/download/33331/28186)
- In Correia et al. (N = 256 adults), melody α = .767, rhythm α = .713, and melody and rhythm correlated r = .521. — [Correia et al. 2023](https://sites.utm.utoronto.ca/sites/sites.utm.utoronto.ca.glenn_website/files/download/CorreiaEtAl2023_PACA.pdf)
- Online administration (608 participants) kept the internal reliability seen in person. Secondary; it is one of the search results, and the pairing with this URL is not confirmed. — [Correia et al. 2022](https://sites.utm.utoronto.ca/sites/sites.utm.utoronto.ca.glenn_website/files/download/CorreiaEtAl_2022.pdf)
- The MET reportedly separates professionals, amateurs and non-musicians with no ceiling effect even for professionals. Secondary. — [rsdjournal](https://rsdjournal.org/index.php/rsd/article/download/33331/28186); [Gingras masterclass slides](https://www.mcg.uva.nl/musicality2019/ewExternalFiles/Gingras_KNAW_Masterclass_20190619.pdf)

**CA-BAT (Harrison & Müllensiefen 2018, *Sci Rep*)** — [PMC6097996](https://pmc.ncbi.nlm.nih.gov/articles/PMC6097996/)
- Task: a 2-AFC beat alignment test. The listener hears a target (beeps on the beat of real music) and a lure (beeps displaced), and picks the one on the beat.
- IRT model: explanatory IRT. Guessing is fixed at 1/2 and inattention at 1, with a common discrimination (Study 1 3PL a = 1.616, SE .158; final model a = 1.166).
- Difficulty formula: difficulty = −5.393 + 7.247 × beep-track accuracy − 0.576 × direction. Beep-track accuracy is d_r = cos⁴(πP), where P is the offset in beats. Ahead-of-the-beat lures are harder.
- Item bank: 2,916 items (27 tracks × 27 accuracy levels × 2 directions × 2 orders), extended to 10,000 items (100 accuracy levels).
- Adaptive procedure: 25 items. The first item is set at difficulty −0.01. The interim estimate is Bayes modal with an N(0,1) prior. The next item is chosen at random among items closest to the current estimate (Urry's rule), and no musical track repeats. The final score is the weighted ML estimate. Implemented with catR and Concerto.
- Precision vs length (lab, Study 3): mean SE was 1.62 after 5 items, 0.88 after 15 and 0.67 after 25. Test-retest r was .09, .51 and .67 [.48, .80] at the same points, with "no clear plateau".
- Online (Study 4): SE was 0.87 at 25 items and test-retest r(40) = .30 [.00, .55], p = .052. The authors conclude CA-BAT is "currently only suitable for laboratory use" because listening conditions vary online.
- Validity:
  - With Gold-MSI Musical Training: r = .454 (N = 197) and r = .41 (N = 71). Other Gold-MSI subscales plateau around r ≈ .4. Singing correlates r = .19 (ns).
  - With a 20-item adaptive melodic discrimination test: r = .45–.48.
  - Online, there was no significant correlation with Musical Training.
- Samples: Study 1 N = 197; Study 2 N = 223 + 6; Study 3 N = 71/52; Study 4 N = 185/42.
- Reliability in IRT depends on which items were given and on the person's ability; it is not a fixed property of the test. Secondary summary. — [Goldsmiths eprint](https://research.gold.ac.uk/24106)

**Harvard Beat Assessment Test (H-BAT; Fujii & Schlaug 2013)** — [Frontiers Hum Neurosci](https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2013.00771/full)
- Four subtests:
  - Music Tapping Test: tapping to real music at 100, 120 and 140 BPM, scored for accuracy and consistency.
  - Beat Saliency Test: duple vs triple meter, threshold in dB of accent.
  - Beat Interval Test: detecting speeding up vs slowing down, threshold in ms.
  - Beat Finding and Interval Test: the same judgement inside a non-isochronous rhythm.
- Each subtest is measured for both perception and production.
- Staircase: adaptive 2-AFC, 2-down-1-up (Levitt 1971). The step halves after two correct answers and doubles after one error. Each run stops after 6 reversals, and the threshold is the mean of the reversals.
- Example thresholds: Beat Interval perception 1.83 ms (0.366% of the ISI); production 0.48 ms (0.096%).
- Sample: N = 30, training 0–31 years (mean 11.8). Estimated lifetime practice hours ranged 0–33,945 (mean 9,607 ± 9,375).
- Estimated practice hours correlated with tapping consistency at ρ = .62 and with the Beat Interval production threshold at ρ = −.51.
- No reliability data are reported.

**Mistuning Perception Test (MPT; Larrouy-Maestri, Harrison & Müllensiefen 2019, BRM 51:663–675)** — [Goldsmiths eprint abstract](https://research.gold.ac.uk/id/eprint/26140)
- Stimuli: 6–12 s excerpts of pop music from MedleyDB with the vocal track pitch-shifted relative to the backing. 2-AFC: in-tune vs out-of-tune.
- Calibrated with explanatory IRT on 333 listeners; validation with 66 participants. Reports "evidence of reliability, convergent validity, and divergent validity."
- The R package reports `ability_sem`, the standard error of the ability estimate. — [pmcharrison/mpt](https://rdrr.io/github/pmcharrison/mpt/f/README.md)

**Melodic Discrimination Test (MDT; Harrison, Collins & Müllensiefen 2017, *Sci Rep* 7:3618)**
- Applies IRT, computerised adaptive testing and automatic item generation to melodic discrimination. Four studies; the second pair recalibrated the test with extra easy items. Reports "strong reliability and construct validity". Abstract-level only. — [Goldsmiths eprint](https://research.gold.ac.uk/id/eprint/20570); [Cambridge listing](https://cms.mus.cam.ac.uk/publications/harrison-collins-mullensiefen-psychometric-techniques/)

### Inferences
- **Difficulty is a function of a physical parameter.** CA-BAT models difficulty as a smooth function of a stimulus feature (offset), not as hand-assigned item levels. The quiz's sliders map directly onto that idea: bpm of 16ths, number of silent bars held, number of keys, and so on. Each slider position could get a difficulty from a formula (for example on a log-bpm scale) fitted to anchor data, instead of a hand-set hours table.
- **Adding a fixed task does not buy much precision.** In CA-BAT, the only case with numbers here, it took about 15–25 adaptive items to bring θ-scale SE down to about 0.67–0.88 and retest reliability to about .5–.67. An embedded audio mini-test in the quiz (ear quiz, fretboard quiz) will be noisy, especially online. Weight it modestly and report its SE.
- **Confidence-weighted answers.** PROMS gives 2/1/0 points for sure-correct, unsure-correct and wrong. The quiz could add a "sure / roughly" toggle per slider to widen the per-item uncertainty.
- **A single "musician rank" item is a strong prior.** It is the best single predictor of OMSI and Gold-MSI scores. A "Which best describes you: non-musician / amateur / serious amateur / semi-pro / pro" item could seed the starting point before the 25 sliders.

### Gaps
- OMSI item content and scoring rule (score range, cutoff) were not found in any accessible source. The Ollen 2006 dissertation would need to be read.
- The original BAT (Iversen & Patel 2008) was not opened. Its format is known here only via the CA-BAT paper.
- MPT and MDT reliability coefficients, test lengths and correlations were not retrieved: PMC served reCAPTCHA, Nature and Springer redirected to login.
- Law & Zentner 2012 and Zentner & Strauss 2017 primary numbers were not opened; the PROMS figures above are the developers' guide summary.
- Wallentin et al. 2010 primary alpha and group differences were not opened.

## 3. How accurate is musicians' self-assessment? (Dunning–Kruger-type effects, self vs teacher/jury, self-report vs measured skill, reliability of self-reported practice hours)

### Takeaway
Self-evaluation of performances correlates poorly with faculty or peer ratings, while faculty and peers agree with each other. Even highly trained singers overrate their own pitch accuracy, and better singers judge themselves more accurately. In general adults, global self-rated musicality tracks pitch/melody ability (r ≈ .36) but not rhythm (r ≈ .07). It is inflated more by men and by people with lower cognitive ability.

Retrospective practice-hour estimates correlate fairly well with diaries (reported r ≈ .74, secondary) but run high (about 21% overestimate reported, secondary). They may be partly inferred from perceived skill, which makes hours→skill mappings circular. I found no study that splits musicians by skill quartile in Dunning–Kruger style.

### Cited Findings
**Self vs teacher/jury/peer ratings of performance**
- Bergee & Cecconi-Roberts (2002): undergraduate self-evaluation of performance "correlates poorly" with instructor and peer evaluation. Peer ratings were higher than instructor ratings, and peer feedback did not consistently improve self-assessment accuracy. Secondary: summary blog. — [UBC blog summary](https://blogs.ubc.ca/lindatkaastra/?p=52)
- A Bergee study reports faculty–peer correlations from .61 to .98 and says "self-evaluation correlated poorly with both faculty and peer evaluation." Secondary: search snippet. It is unconfirmed whether this is Bergee 1993 (brass juries, JRME 41:19–27) or 1997 (JRME 45:601–612). — [JRME search result](https://journals.sagepub.com/doi/10.2307/3345802); [JRME search result](https://journals.sagepub.com/doi/abs/10.2307/3345476)
- A separate abstract on applied brass juries reports peer-panel reliability of .83–.89 and faculty–peer r = .86–.91. This likely matches Bergee 1993. Secondary; it is one of the search results, and the pairing with this URL is not confirmed. — [proxied SAGE search result](https://https-sage-cnpereading-com-443.webvpn1.xju.edu.cn/doi/10.1177/10570837050150010103)
- Hewitt (2005, JRME 53:148–161): high-school instrumentalists were more accurate self-evaluators than junior-high students. Secondary. — [Frontiers 2025 citing Hewitt](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1568021/pdf)
- Hewitt (2011): student judgements agreed less with experts' judgements. Secondary. — [same Frontiers 2025 source](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2025.1568021/pdf)
- Kruse (2006), sixth-grade band: instruction in using a rating scale brought self-ratings closer to expert ratings. Secondary. — [VRME, Kruse](https://digitalcommons.lib.uconn.edu/context/vrme/article/1033/viewcontent/VRME_Submission.Kruse.pdf)
- Morijiri & Welch (piano): participants rated their own performances significantly higher than any other pianist's. Secondary. — [OUCI listing](https://ouci.dntb.gov.ua/works/4Y12VZV4)
- Secondary-school band: higher-performing students underrated their performance, the opposite direction of the classic Dunning–Kruger pattern. Secondary snippet. — [Bohrium summary](https://www.bohrium.com/en/paper-details/self-efficacy-self-evaluation-and-music-performance-of-secondary-level-band-students/814603670824943616-5172)
- Larrouy-Maestri, Wang, Vairo Nunes & Poeppel (2021, *J Voice*), "Are you your own best judge?":
  - Design: 18 highly trained sopranos rated the pitch accuracy of peers' recordings and their own ("Happy Birthday") in a pairwise paradigm.
  - Result: most rated their own singing as more accurate than it was, and better singers evaluated themselves more accurately.
  - Press-release level. — [MPI for Empirical Aesthetics news](https://www.aesthetics.mpg.de/en/newsroom/news/news-article/article/hitting-the-right-note.html); [idw](https://idw-online.de/en/news770944)

**Global self-rated musicality vs measured ability (general adults)** — [Correia, Lima & Schellenberg 2023, *Psychol Aesthet Creat Arts*](https://sites.utm.utoronto.ca/sites/sites.utm.utoronto.ca.glenn_website/files/download/CorreiaEtAl2023_PACA.pdf)
- Sample: N = 256 Portuguese-speaking adults (195 women, 61 men); 117 had no formal training.
- Question format: four questions, "how musical compared with family / friends / work-school colleagues / general population", on a 1 (far below average) to 7 (far above average) scale with 4 = average.
- Means by reference group:
  - vs family: M = 4.79, d = .595 (above average)
  - vs colleagues: M = 4.37, d = .256 (above average)
  - vs friends: M = 4.22, d = .156, p = .054
  - vs general population: M = 3.98, d = −.014 (not above average)
- Partial correlations of aggregate self-rating with Gold-MSI (gender and education held constant): General .694, Music Training .595, Singing .583, Perceptual .566, Active Engagement .455, Emotions .367. Self-rating also correlated with years of training at r = .412.
- Self-rating correlated with MET melody at r = .359 (p < .001) but with MET rhythm at only r = .066 (p = .308).
- Cognitive ability (matrix reasoning) did not predict self-rating, but it did predict MET melody (r = .269) and rhythm (r = .324).
- Overestimation, measured as z(self-rating) − z(MET melody), was larger with lower cognitive ability (r = −.190, p = .003).
- Men rated themselves higher (F(1,253) = 10.64, partial η² = .040) despite no sex difference on the MET.
- Authors' summary: self-ratings "tended to be exaggerated, however, particularly for men and for participants with lower cognitive ability."
- Other self-report vs objective correlations, all secondary search snippets:
  - Gold-MSI Perceptual Abilities vs an auditory pitch-imagery test (aPIAT): r ≈ .44 (N = 143); General r = .53. — [PMC8049941 table](https://pmc.ncbi.nlm.nih.gov/articles/PMC8049941/table/Tab6)
  - Gold-MSI vs auditory working-memory precision for frequency: r(98) = .46. — [Research Square preprint](https://www.researchsquare.com/article/rs-776888/latest.pdf)
- See also section 1: in the BBC sample, Perceptual Abilities self-report correlates only .261 / .342 with melodic memory / beat tests.

**Reliability of self-reported practice hours**
- A review of retrospective-recall methods reports two findings for Ericsson, Krampe & Tesch-Römer (1993): musicians overestimated practice hours by about 21%, and diary and estimated hours correlated r = .74. It also says the "typical finding is that participants on average somewhat overestimate."
  - Secondary: seen only as a search snippet. The underlying review was not opened; it appeared alongside [Springer BRM s13428-011-0120-x](https://link.springer.com/article/10.3758/s13428-011-0120-x) and [Queen's Univ. PDF on retrospective interviews](https://www.queensu.ca/sportpsych/sites/splwww/files/uploaded_files/Tracing%20the%20Development%20of%20Athletes%20Using%20Retrospective%20Interview%20Methods%20A%20Proposed%20Interview%20and%20Validation%20Procedure%20for%20Reported%20Information.pdf).
  - Caution: the same snippet gives r = .74 again for chess "serious play", where the diary mean (6.31 h) exceeded the estimate (5.36 h), i.e. underestimation. The figures may be conflated.
- Directly observed figure skaters (Deakin & Cobley 2003, n = 24) overestimated their practice. Secondary, same snippet set. — [Springer BRM s13428-011-0120-x](https://link.springer.com/article/10.3758/s13428-011-0120-x) / [Queen's PDF](https://www.queensu.ca/sportpsych/sites/splwww/files/uploaded_files/Tracing%20the%20Development%20of%20Athletes%20Using%20Retrospective%20Interview%20Methods%20A%20Proposed%20Interview%20and%20Validation%20Procedure%20for%20Reported%20Information.pdf) (it is one of these two; not confirmed which)
- Limits of diaries as the comparison standard: a diary week may be unrepresentative of the year, diaries themselves may be inaccurate, samples are small, and validation usually covers only the current year. Accuracy over long careers is "less certain." Secondary, same snippet set. — [Springer BRM s13428-011-0120-x](https://link.springer.com/article/10.3758/s13428-011-0120-x) / [Queen's PDF](https://www.queensu.ca/sportpsych/sites/splwww/files/uploaded_files/Tracing%20the%20Development%20of%20Athletes%20Using%20Retrospective%20Interview%20Methods%20A%20Proposed%20Interview%20and%20Validation%20Procedure%20for%20Reported%20Information.pdf) (it is one of these two; not confirmed which)
- A self-report questionnaire of self-regulated practice behaviours lacked predictive validity for all three observed practice dimensions ("But I did practice!", BU). Secondary snippet. — [BU OpenBU](https://open.bu.edu/items/6a4e02ef-3c43-4cdc-b1a3-d446f5491900)
- The Ericsson et al. 1993 structured-interview method is "potentially prone to experimenter bias and response bias." Secondary snippet. — [Macnamara & Maitra 2019 PDF](https://hhs.purdue.edu/skill-learning-and-performance-lab/wp-content/uploads/sites/43/2024/08/macnamara-maitra-2019-the-role-of-deliberate-practice-in-expert-performance-revisiting-ericsson-krampe-tesch-romer.pdf)
- Deliberate practice vs musical achievement:
  - Platz et al. (2014), 13 studies: r = .61 corrected for unreliability (r² ≈ .37). — as reported in the [Hambrick et al. commentary, Frontiers 2014](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.00751/full)
  - Hambrick et al. say practice "accounted for about one-third of the reliable variance." They warn that retrospective questionnaires can inflate practice–skill correlations "if people base practice estimates on their skill rather than recollections." Platz et al. call time estimates "only approximate indicators of deliberate practice." — [Frontiers 2014](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2014.00751/full)
- Sloboda et al. (1996): 94 participants kept a practice diary for 42 weeks. Its diary-vs-retrospective correlation was not found. Secondary abstract snippet. — [Univ. Melbourne record](https://findanexpert.unimelb.edu.au/scholarlywork/1346170-the-role-of-practice-in-the-development-of-performing-musicians)
- Estimated lifetime practice hours do carry signal for objective timing skill: ρ = .62 with tapping consistency in the H-BAT (N = 30). — [Fujii & Schlaug 2013](https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2013.00771/full)

### Inferences
- **Expect upward bias and widen the band.** Self-evaluations are biased upward for most people (pianists favour their own recordings, sopranos overrate their pitch accuracy, men overrate). The quiz's point estimate should be read as an upper-leaning estimate, with an asymmetric or widened band, unless items are anchored to verifiable criteria.
- **Behaviourally anchored, checkable items reduce bias.** Correia et al. found self-awareness is decent for pitch and poor for rhythm. That argues against vague items like "my timing is good". It supports concrete, checkable criteria ("hold tempo for N silent bars with a click returning on the downbeat"). Kruse's finding that rating-scale instruction helps also supports precise wording and examples.
- **Reference group matters.** People rate themselves above family and colleagues but at average against the general population. Statements should be absolute ("I can …") rather than comparative ("better than most guitarists").
- **Hours are a circular input.** If users estimate hours from how good they feel, and the quiz then maps hours → Elo, the mapping inherits self-perception bias (the Hambrick et al. warning). If the quiz derives hours only from skill statements (not verified here), it avoids double-counting. If it also asks hours directly for calibration, the two should be treated as non-independent.
- **Correct overestimates, but don't over-correct experts.** The evidence supports only the direction of the bias: retrospective hours tend to run high. The ~21% figure is unverified and possibly conflated, so no discount percentage should be hard-coded until Ericsson et al. 1993 is checked. The reverse pattern in high-performing band students warns against penalising top answers.
- **No Dunning–Kruger quartile split found.** I found no music study that splits accuracy by skill quartile. Claims that "beginners overrate, experts underrate" in guitar are unsupported by music-specific data. The singer study suggests better performers judge themselves more accurately, but still overrate.

### Gaps
- Primary Bergee 1993/1997 and Hewitt 2005 coefficients (self vs faculty r values) were not accessed.
- No Kostka self-assessment study was located.
- No music-specific Dunning–Kruger analysis by performance quartile was found.
- The Ericsson 1993 diary-vs-estimate r = .74 and the 21% figure were not verified in the primary text, and the snippet may conflate studies.
- No test-retest reliability of retrospective practice estimates in musicians was found.

## 4. Instruments specific to guitar or popular-music skill

### Takeaway
There is no widely used, validated self-report scale of guitar skill level. The closest things are:
- an expert-judge guitar performance rating scale (Russell 2010, 32 items, α .962);
- regional self-efficacy scales (mostly Turkish, one guitar-accompaniment-specific);
- rock/pop graded-exam criteria (Trinity), with no published validation.

The Goldsmiths MPT is the one validated objective test built on pop-music stimuli.

### Cited Findings
- Russell (2010), Guitar Performance Rating Scale, *Bulletin of the Council for Research in Music Education* 184:21–34. Facet-factorial approach:
  - 99 item statements (from literature, earlier scales, guitarists and teachers) on 5-point Likert scales.
  - 67 judges rated 100 recorded performances.
  - The final 32 items were selected by factor loadings, with α = .962. One secondary source says the factors explain 71% of variance.
  - Abstract-level; factor names not confirmed. — [CAS catalogue record](https://katalog.lib.cas.cz/KNAV/EdsRecord/edsair,edsair.doi...........180b505aaba1a4c1e0ec962e21c26ba8); [Scribd copy](https://www.scribd.com/document/460522049/Russel-Development)
- Guitar accompaniment self-efficacy scale (Turkey, 2024): 242 participants from 21 universities; three subscales (creativity, technical skill, motivation); whole-scale α = .96. Turkish source, abstract-level; it is one of the search results, and the pairing with this URL is not confirmed. — [DergiPark](https://dergipark.org.tr/en/download/article-file/3874057)
- Instrument Performance Self-Efficacy Belief Scale (Turkey): 313 music-teacher candidates, 20 five-point items, three dimensions; self-efficacy subscale α = .86. General instruments, also used in a classical-guitar study. Secondary snippet; it is one of the search results, and the pairing with this URL is not confirmed. — [DergiPark](https://dergipark.org.tr/en/download/article-file/983839)
- Portuguese musical self-efficacy scale for instrumentalists and singers: 22 items built on Bandura's four sources, 150 students. — [RPEA](https://rpea.madeira.gov.pt/index.php/rpea/en/article/view/155)
- Self-Efficacy for Musical Studies (SEMS), 2003 BYU thesis, a general music scale. It is one of the search results, and the pairing with this URL is not confirmed. — [BYU ScholarsArchive](https://scholarsarchive.byu.edu/etd/114)
- Trinity College London publishes overall-performance assessment criteria (the PDF title says "Digital Grades and Diplomas"; the search summary said Rock & Pop, which is not confirmed); no validation data were found. — [Trinity criteria PDF](https://blog.trinitycollege.co.uk/hubfs/Assessment%20Criteria%20-%20Overall%20Performance%20-%20Digital%20Grades%20and%20Diplomas.pdf)
- Other rubrics:
  - A university guitar performance rubric. — [EKU guitar rubric](https://www.eku.edu/musicprogram/wp-content/uploads/sites/59/2023/08/Guitar_PerformRubric1_31_20.pdf)
  - A popular-music conservatory audition rubric. — [OCSA rubric](https://www.ocsarts.net/Portals/0/PDFs/Admissions/2025-2026/Extended%20Sessions/Popular%20Music%20Conservatory%20-%20Instrumentalists%202026-2027%20Rubric.pdf)
  - Both are practitioner documents with no psychometrics.
- A validated analytic rubric for solo-performance competitions (essential unidimensionality confirmed; Fernández-Alonso et al. 2021). Not guitar-specific. Secondary; it is one of the search results, and the pairing with this URL is not confirmed. — [ERIC record](https://searchworks.jioinstitute.edu.in/articles/eric__EJ1283597)
- A weighted large-ensemble festival rubric: internal consistency .88, total-score reliability W = .80. Secondary. — [Univ. Iowa record](https://iro.uiowa.edu/esploro/outputs/journalArticle/Reliability-and-Perceived-Pedagogical-Utility-of/9984024570802771)
- The Mistuning Perception Test uses pop-music excerpts with a pitch-shifted vocal track, so it is the most "popular-music-ecological" validated perception test found. — [Goldsmiths eprint](https://research.gold.ac.uk/id/eprint/26140)

### Inferences
- **Guitar Elo has no off-the-shelf criterion.** Calibrating the quiz against "real" guitar skill would need its own anchor data, for example teacher ratings of recorded playing using a Russell-style multi-item rubric. Self-efficacy scales measure confidence, not skill.
- **Rubric factors give content coverage.** Russell's approach (literature + expert item pool → judges rate recordings → factor analysis → keep high-loading items) is a template for pruning the 25 sliders to those that load on a common "skill" factor.

### Gaps
- Russell 2010 factor names and per-factor reliabilities were not confirmed.
- No validated rock/pop guitar performance rubric and no guitarist-specific self-report skill inventory were found.
- No published norms of tempo/speed benchmarks (e.g. bpm of 16ths by level) from validated sources were found in this search.

## 5. Methods for turning many items into one score with uncertainty (IRT, adaptive testing)

### Takeaway
The validated adaptive music tests share one workflow:
1. Model the probability of success as a function of person ability minus item difficulty.
2. Predict item difficulty from item features.
3. Estimate ability with a prior (Bayes modal, N(0,1)) during the test and with weighted ML at the end.
4. Report the standard error.

In CA-BAT, the SE on the test's ability (θ) scale shrank from 1.62 to 0.88 to 0.67 at 5, 15 and 25 items. That is a realistic yardstick for how much 25 answers can pin someone down, even with objective items.

### Cited Findings
- CA-BAT uses an explanatory IRT model with item difficulty as a linear function of stimulus features. The guessing floor is fixed at 0.5 because the task is 2-AFC. — [PMC6097996](https://pmc.ncbi.nlm.nih.gov/articles/PMC6097996/)
- Interim ability uses Bayes modal estimation with a Gaussian N(0,1) prior; final ability uses weighted maximum likelihood. Items are picked near the current estimate (Urry's criterion) with randomisation among the closest items. — [PMC6097996](https://pmc.ncbi.nlm.nih.gov/articles/PMC6097996/)
- SE of the ability estimate on the θ scale, by test length (lab): 1.62 at 5 items, 0.88 at 15, 0.67 at 25. Online: 1.89, 1.08, 0.87. Retest r at 25 items: .67 in the lab and .30 online. — [PMC6097996](https://pmc.ncbi.nlm.nih.gov/articles/PMC6097996/)
- In IRT, reliability depends on which items a person received and on their ability level; it is not a single fixed property. Secondary summary. — [Goldsmiths eprint](https://research.gold.ac.uk/24106)
- MPT and MDT also use explanatory IRT calibration plus adaptive administration. The MPT software reports `ability_sem` per person. — [MPT eprint](https://research.gold.ac.uk/id/eprint/26140); [mpt README](https://rdrr.io/github/pmcharrison/mpt/f/README.md); [MDT eprint](https://research.gold.ac.uk/id/eprint/20570)
- H-BAT uses classic psychophysical staircases (2-down-1-up, multiplicative steps, mean of 6 reversals) instead of IRT. — [Fujii & Schlaug 2013](https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2013.00771/full)
- Gold-MSI uses classical test theory (unit-weighted sums, α/ω, test-retest) rather than IRT for its self-report scales. — [Müllensiefen et al. 2014](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0089642)

### Inferences
Everything in this subsection is my own reasoning, not sourced findings.
- **A polytomous IRT model fits the sliders.** Each slider is an ordered-category item, so a graded-response or partial-credit model would treat each slider position as a threshold on a latent skill scale. The latent θ could then be mapped to Elo with a monotone link. This replaces "map each answer to hours, then average" with a model that weights items by how well they discriminate.
- **Without response data**, a pragmatic approximation is:
  - Treat each slider answer as an interval (hours_low, hours_high) on log-hours.
  - Combine the intervals as a precision-weighted mean on the log scale.
  - Add a between-item spread term (the SD of the per-item log-hours estimates) to the ±.
  - Inflate for the known self-report upward bias.
- **The ± should not shrink as 1/√25.** CA-BAT's 25 objective items still left SE ≈ 0.67 on its θ scale. Since its interim prior was N(0,1), that is roughly two-thirds of a population SD; this is my reading, not stated in the paper. The 25 sliders are likely correlated (one underlying "how good I think I am"), so the ± should not shrink as if they were independent. A floor on the reported uncertainty is defensible.
- **Use a prior.** A Bayes-modal or EAP estimate with a population prior (e.g. a typical hobby-guitarist distribution) keeps sparse or extreme answer patterns from producing extreme Elos. Reporting the posterior SD as the ± is the standard approach in these tests.
- **Calibration with response data.** Once data exist (e.g. answers from 1,000+ users), fitting item thresholds and discriminations would show which statements separate levels best. The CA-BAT and Gold-MSI precedent is to drop items with low loading or discrimination.
- **Inconsistency is a signal.** Disagreement across items (e.g. claiming 16ths at 160 bpm but failing to keep tempo for 4 bars) could be flagged as low person-fit, either widening the ± or prompting a re-check.

### Gaps
- No published polytomous-IRT calibration of an instrumental-skill self-report scale was found.
- No music-specific evidence was found on how strongly self-report sliders inter-correlate (the effective number of independent items).
- Gold-MSI was not found to have an IRT recalibration in the sources accessed. Later Goldsmiths work, such as psyquest and LongGold, may have one; not checked.
