# THE DATA LEAGUE Brand — the house visual style

> Style contract for every video The Data League produces. Every visual step reads this
> file so all videos feel like one channel: a dark-arena sports broadcast where data
> settles rivalries. Reference polish: scoreboard graphics, title-fight broadcast
> design, stadium night lighting — with a data-lab's precision.
>
> This is YOUR brand — customize it. Change colors, fonts, motion, and the wordmark
> in `remotion/src/brand.ts` + `remotion/src/fonts.ts` to make videos look like
> YOUR channel, not the default.

## 1. Identity & voice

- **Positioning:** "Every debate ends in a score." The world's biggest rivalries are
  broadcast as title fights — verified data, live-match energy, zero filler.
- **Voice:** broadcast commentator energy. Confident, dramatic, fair. Numbers are the
  stars; the commentator narrates like a title fight, never like a spreadsheet.
- **Energy for video:** loud but disciplined. Celebration moments pop hard (scoreboard
  hits, volt flashes), analysis moments are calm and readable. Never constant chaos.

## 2. Logo / wordmark

- **Wordmark:** set in `BRAND.wordmark` in `remotion/src/brand.ts`. Renders in three parts
  with the middle part in the accent color: `['THE DATA','LEAGUE','']` → "LEAGUE" in volt.
- **Mark:** shield crest concept — two opposing chevrons colliding, score line cut in.
  Wordmark is the primary lockup; crest is a supporting badge (thumbnails, belt).
- **Sign-off:** "And the numbers have spoken." — used on end cards.

## 3. Color palette (exact hex)

Dark-arena base. Volt scoreboard green is the signature.

| Role | Name | Hex | Use in video |
|---|---|---|---|
| **Primary accent** | volt | `#C8FF30` | key words, scoreboard numbers, CTA, winning side |
| Secondary accent | cyan | `#29D8FF` | gradients, second combatant accent, secondary emphasis |
| Success / positive | emerald | `#3DDB8A` | confirms, checkmarks, positive callouts |
| Warn / attention | amber | `#FFB547` | photo-finish flags, "neck and neck" moments |
| Danger / contrast | red | `#FF4D5E` | upsets, danger moments, loss side flashes |
| Ink (text/dark) | near-white | `#F2F5FA` | primary text on dark base |
| Muted text | slate | `#8B97AC` | secondary text, captions, axis labels |
| Surface (bg) | arena | `#0A0F1E` | the dark studio arena floor |
| Surface 2 (panel) | panel | `#111B2E` | cards, panels |
| Hairline | line | `#1E2B45` | borders, chart gridlines |

**Deep scale (void/deepest):** `#070C16` (void) · `#0A0F1E` (panel) · `#1E2B45` (border) ·
`#8B97AC` (dim text) · `#C7D0E0` (text).

**Signature gradient:** volt to cyan (`#C8FF30` to `#29D8FF`) — scoreboard glow.

### 3b. Combatant colors — the color-language system

The palette above is the arena. Each **combatant** (player, club, company) gets a fixed
color zone for the match — set once in `lib/dataleague.tsx`, never random. Examples:
Messi = sky/Argentina blue, Ronaldo = Portugal red, Mbappé = France blue, Haaland =
Norway red, Real Madrid = white, Man City = cyan. Colors become a language: viewers
read the scoreboard by color before reading the names.

Client-work vibes in `remotion/src/lib/vibes.tsx` still exist for agency shots and
override the house palette on purpose — but The Data League's own videos use the
arena + combatant system only.

## 4. Typography (3-font system)

| Role | Font | Weights | Use |
|---|---|---|---|
| **Display** | Anton | 400 | titles, scoreboards, wordmark, category cards |
| **Body / UI** | Archivo | 400 / 500 / 600 / 700 | subtitles, labels, commentary captions |
| **Code / mono** | JetBrains Mono | 400 / 500 / 700 | numbers, counters, data readouts, source chips |

Numbers are the star: big data readouts always use JetBrains Mono at large sizes.

All load from `@remotion/google-fonts` — nothing to install.

## 5. Shape & depth

- **Radius:** ~16px cards, fully rounded pills. Scoreboard panels slightly sharper.
- **Depth:** soft deep shadows (`0 8px 32px rgba(7,12,22,.55)`), 1px hairline borders
  (`#1E2B45`). Panels feel like glass over the arena floor.
- **Never:** light-mode cards, pastel fills, thin light borders on dark, sticker/pop look.

## 6. Motion language

Translated to video (Remotion, 30fps for generated, 60fps for recorded):
- **Entrances:** fast rise + fade. `opacity 0` to `1` and `translateY 32px` to `0` over
  ~10 frames, ease-out. Broadcast energy, not airy drift.
- **Scoreboard updates:** hard impact — count-up numbers, brief scale pop (1.0 → 1.08 → 1.0)
  on the changed value, volt flash behind the updated side.
- **Celebrations:** 2s max — confetti/particles, camera shake, volt burst. Then back to calm.
- **Emphasis:** underline wipe or volt highlight sweep behind a key word, ~6 frames.
- **Stagger:** 3-4 frames between list items.
- **Feel:** punchy at the moments, disciplined between them. Silence (0.3-0.8s) before every reveal.

## 7. Video delivery specs

- **Canvas:** 1920x1080 (1080p) for generated videos, 3840x2160 (4K) for recorded.
- **Frame rate:** 30fps generated / 60fps recorded — must match the master cut.
- **Safe margins:** keep text >= 5% from edges.
- **Overlay types:** lower-third, keyword callout, full-screen statement, animated diagram,
  scoreboard, head-to-head race chart, category card, source chip.
- **Captions:** overlays only (not word-level) for long-form.

## 8. Sound design

Punchy broadcast, disciplined. Whistle stingers and scoreboard hits at the moments,
crowd/energy under celebrations, everything UNDER the voice. The 3-note sonic logo
(whistle → brass hit) marks every scoreboard update. Silence is part of the mix —
0.3-0.8s of nothing before every big reveal is the strongest tool.

### LIVELINESS CONTRACT (mandatory — calm is slop)

The Data League NEVER sounds flat. The energy target is a live auctioneer / football
commentator: fast, bright, alive, relentless. Measured gates:

- **VO delivery**: read rate equivalent ≥ 3 words/sec energy. Temp Edge voices ship at
  `--speed >= 1.12 --pitch-hz >= +8 --volume >= +3` — a slow calm read is a defect, not a
  placeholder. ElevenLabs final voices ship at `--speed >= 1.08`.
- **Music bed**: MANDATORY under the whole video (driving pulse preferred; calm pads are a
  last resort). A bed-less delivery is a defect.
- **SFX**: every scoreboard beat gets the 3-note logo; stat locks get pops; transitions get
  whooshes. Silence is for pre-reveal beats only.
- **Dead air**: > 0.8s of narration-less dead air mid-video is a defect.
- **Gate**: if the VO cannot be regenerated energetic, BLOCK delivery and say why. Flat
  voiceover = rejection, not a draft.