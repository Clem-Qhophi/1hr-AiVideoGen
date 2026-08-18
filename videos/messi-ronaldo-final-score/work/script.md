# Messi vs Ronaldo: The Final Score — narration script

Format: Showdown, 8 rounds, round 8 = double points.
Voice: THE SCOREKEEPER (permanent channel voice). Pace 4-6 words/sec, never flat.
Every reveal is preceded by 0.3-0.8s of silence (rendered as "..." pauses + edit gaps).
Numbers are rounded to 3 significant figures in speech; charts carry full precision.
Moment-Class tags are for the director, never spoken.

## Cold Open — 0:00-0:24 [C0_COLD_OPEN]

Five, four. Ronaldo, five. Messi, four.

After twenty years of arguments, the numbers have voted. And the winner is not who most people would have guessed.

This is Messi versus Ronaldo. The Final Score.

[beat: final scoreboard slams in, belt emblem, then rewind to round one]

## The Rules — 0:24-0:48

Two legends. Eight rounds. Every category decided by verified numbers, not opinions.

All of it official records, as of July 2026.

One point per round. Round eight is worth double.

And the winner takes the first belt in Data League history.

The Scorekeeper has the cards.

[beat: rules card, eight empty slots, belt on the line]

## Round 1 — The Record Book — 0:48-1:36 [C6_RECORD]

Round one. The record book.

A category of pure volume. Career goals, including international football.

Ronaldo has scored nine hundred seventy six goals for club and country.

No man in history has scored more. Not Pelé. Not Müller. Nobody.

Messi is not far behind. Nine hundred nineteen.

But this round belongs to Ronaldo.

One point to Ronaldo. One, nothing. And the chase is on.

[beat: RaceLine goals, Ronaldo bar 976 vs Messi 919, scoreboard updates]

## Round 2 — The Artist — 1:36-2:24 [C3_BLOWOUT]

Round two. The artistry category. Assists.

And this is where the contest gets uncomfortable for one side.

Messi has provided four hundred eighteen career assists. Ronaldo, two hundred sixty one.

Sources differ by a single assist on Messi's count. We're using four hundred eighteen, shown here.

The gap is over one hundred fifty.

This is not a close race. It is a walk.

The creator beats the finisher in the only stat that measures pure generosity.

One point to Messi. One, one. We have a fight.

[beat: H2HMeter assists, 418 vs 261, scoreboard updates]

## Round 3 — The Trophy Room — 2:24-3:00 [C6_RECORD]

Round three. The individual trophy room. The Ballon d'Or.

Messi has won it eight times. That is the all-time record. Nobody alive is within three of him.

Ronaldo has five. Which is more than almost anyone in history.

This is the category where genius is rewarded with a golden ball.

And the numbers say the genius is Messi.

Two points to one. Messi ahead.

[beat: Counter Ballon d'Ors, 8 golden balls vs 5, scoreboard updates]

## Round 4 — The World Stage — 3:00-3:50 [C6_RECORD] [MARQUEE ROUND]

Round four. The one everyone fights about. The World Cup.

Messi has scored nineteen World Cup goals. That is the all-time record.

He has played six World Cups. He has lifted the trophy itself, in twenty twenty two.

Ronaldo has scored eleven World Cup goals, in six tournaments. And the trophy has never come home with him.

It is the only mountain he never conquered.

Messi takes the round. And the lead. Three, one.

[beat: RaceLine World Cup goals 19 vs 11, trophy silhouette, scoreboard updates]

## Round 5 — The Money — 3:50-4:40 [C6_RECORD]

Round five. The money round.

Career earnings, on and off the pitch, before tax. Estimates, per Forbes.

Ronaldo is the first active athlete ever to pass two billion dollars in career earnings. Two point one billion, as of this year.

Messi is at one point eight billion.

Both are billionaires. Both are beyond normal numbers.

But this round belongs to the man who turned his name into a global brand. And it is not close.

Ronaldo takes it. Three, two.

[beat: Counter $2.1B vs $1.8B, both marked "ESTIMATE", scoreboard updates]

## Round 6 — The Crowd — 4:40-5:30 [C6_RECORD]

Round six. The popularity round. Instagram followers.

Ronaldo is the most followed human being on the planet. Six hundred seventy seven million.

Messi, five hundred fifteen million.

The gap is one hundred sixty two million people. Bigger than the population of most countries.

And on YouTube, the same story in slow motion. Ronaldo's channel, eighty two million subscribers. Messi's, four point eight million.

The internet belongs to Ronaldo.

And the scoreboard now says three, three. Level. With two rounds to go.

[beat: RaceLine followers, 677M vs 515M, YouTube mini-cards, scoreboard updates]

## Round 7 — The Efficiency — 5:30-6:20 [C5 PHOTO-FINISH register]

Round seven. The efficiency round. Goals per game.

And this is the closest race of the night.

Messi scores zero point seven nine goals per appearance. Ronaldo, zero point seven three.

On the surface, a rounding error.

But over more than a thousand appearances each, that tiny difference is the signature of the player who does more with every touch.

Messi takes the round by the smallest margin in Data League history.

Four, three.

And it all comes down to the final round.

[beat: H2HMeter ratio 0.79 vs 0.73 with zoomed gap callout, scoreboard updates]

## Round 8 — The Hat-Trick — DOUBLE POINTS — 6:20-7:30 [C9_FINAL_ROUND]

Round eight. Double points.

Everything we have measured tonight comes down to one category. Hat-tricks. Three goals in one game. The purest explosion of scoring.

Ronaldo trails on the scoreboard. Four, three.

Win this, and it is his. Lose it, and the belt belongs to Messi.

Ronaldo has sixty six career hat-tricks...

Messi, sixty one.

Sixty six beats sixty one. And the final round is worth two.

[C4_COMEBACK register] Down on the scoreboard. Won with one swing. Cristiano Ronaldo takes the Final Score. Five, four.

And for the first time in Data League history... a champion is crowned.

[beat: SuddenDeath tension, BeltReveal, confetti, final scoreboard 5-4]

## The Verdict — 7:30-8:15 [C10_VERDICT]

The numbers have spoken. And they are fair.

Messi owns the glory. World Cup. Ballon d'Or. Assists. Efficiency.

Ronaldo owns the volume. Goals. Money. Fame. Hat-tricks.

The data does not say who was greater. It says who won. And the belt goes to Ronaldo, by a single point.

Now the championship belt is his to defend.

And you get to choose the next contender. Comment your pick. And subscribe, because every title fight ends the same way here.

The numbers have spoken.

[beat: belt card, poll CTA, end card, sign-off]

---

## Beat plan (NOT spoken — visual mapping for /make-tsx)

| Beat | Time | Shot (chart-kit) | Notes |
|------|------|------------------|-------|
| Cold open | 0:00-0:24 | WordmarkShot → Scoreboard 5-4 slam | Final score FIRST, then rewind |
| Rules | 0:24-0:48 | MatchHeader + 8 empty round slots + belt emblem | "The belt is on the line" |
| R1 | 0:48-1:36 | MatchHeader + RaceLine (goals) + Scoreboard | Ronaldo bar 976 wins |
| R2 | 1:36-2:24 | MatchHeader + H2HMeter (assists) + Scoreboard | Blowout meter, gap callout |
| R3 | 2:24-3:00 | MatchHeader + Counter (Ballon d'Or) + Scoreboard | 8 balls vs 5 |
| R4 | 3:00-3:50 | MatchHeader + RaceLine (WC goals) + Scoreboard | Trophy silhouette, marquee |
| R5 | 3:50-4:40 | MatchHeader + Counter (earnings, ESTIMATE tags) + Scoreboard | $2.1B vs $1.8B |
| R6 | 4:40-5:30 | MatchHeader + RaceLine (followers) + Scoreboard | YouTube mini-cards |
| R7 | 5:30-6:20 | MatchHeader + H2HMeter (ratio) + Scoreboard | Zoom gap callout |
| R8 | 6:20-7:30 | SuddenDeath tension → BeltReveal → Scoreboard 5-4 | Confetti, crowd-pop |
| Verdict | 7:30-8:15 | Belt card + poll CTA + sign-off | End card |

Sources: The Week/Yahoo (2026-07-20), MessivsRonaldo.app, Forbes (estimates), Social Blade (July 2026), IBTimes, The Mirror US. Full sheet: work/data-sheet.md.
