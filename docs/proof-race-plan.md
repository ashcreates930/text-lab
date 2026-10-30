# Proof Race: plan for review

A new game mode that keeps reading as the only way to score and adds a fast reward loop. Mockups: `Claude outputs/proof-race-mockups.html` (phone and projector for every screen). Nothing is built until you OK it.

## The loop (every 20 to 30 seconds)

1. **Sprint.**
   - One question and one short chunk: the answer's paragraph, plus one neighbor so there's a real choice.
   - The student taps one line. 30 seconds (scaled by the student's time setting), and the timer starts at the first tap.
   - No exact-words step and no Prove it, so it stays fast.
2. **Instant feedback, under 1 second.**
   - The proven line turns green, coins burst, the combo meter steps up, and a chime plays if Sound is on.
   - A miss is "Not yet": one more tap on the same chunk for half coins. A second miss shows the line, for 0 coins.
3. **Rank card, 2 seconds or until tapped.**
   - "You're #3, up 2 places", with the 3 players around you.
   - The demo labels computer players: "The Lantern Ghost (computer)".
4. **Chest pick** after a proven line (see Chance).
5. **Every 4 sprints, one long round.**
   - Infer, Catch the lie or Build the case, in rotation, exactly as in Story Mode.
   - Then the Case Shop opens between sets.

A set is about 3.5 minutes: 4 sprints of about 30 seconds each, a long round of about 90 seconds, and the shop. A 10-minute game is about 3 sets, and a 20-minute game about 5 sets, which is about 22 sprints.

## Economy (Gimkit-style, proof only)

- **Sprint coins:**
  - Proven on the first try: 80 × combo.
  - Proven on the second try: 40, and the combo resets.
  - Shown: 0.
- **Long rounds:** the Story Mode points, converted at 1 coin per point ÷ 5.
- **Combo:** x1, x1.25, x1.5 and up to x2.5. It grows only with first-try proofs. Speed never adds coins.
- **Points vs. coins:** Points on the leaderboard equal coins earned from proofs. Shop spending lowers your coin balance, never your points.
- **Case Shop** (between sets). Each price rises by about 1.6 each time you buy:

| Item | What it does | Starting price |
|---|---|---|
| Multiplier | x1.1 → x1.3 → x1.5 → x1.75 → x2 on proof coins | 150 |
| Streak bonus | +10 coins per combo step | 120 |
| Insurance | Keeps your combo once after a miss | 150 |
| Lantern | Names the paragraph with the proof, for one sprint | 120 |
| Avatar items | Hat, lantern, magnifying glass, coat (original art, looks only) | 300 |

## Chance (Blooket-style, never points without a proof)

- **When:** after each proven line, pick 1 of 3 chests.
- **What's inside** (authored odds):
  - +20 to +60 coins (45%)
  - Double your next proof (20%)
  - Freeze, live only (15%)
  - A Case card (20%)
- **Rules:**
  - Chests appear only after a proof, so chance never replaces reading.
  - Steal and Swap are off by default (a teacher toggle).
  - When on, they never target the same player twice in a row.
  - They never touch points, only spendable coins.

## Collection

- **Case cards:**
  - Each card is a character, clue or quote, and every quote card carries its line and ¶.
  - They unlock from chests, mission pieces and first-try streaks.
  - They're saved with the student's progress: 18 per story to start.
- **Avatar items:** bought with coins, shown on the rank card and the podium. Original art only.

## Live class (Kahoot-style board)

- **Game length:** the teacher picks 10, 15 or 20 minutes. Students play continuously, with no waiting between questions.
- **Board:**
  - a big countdown and the live top 5
  - the answer spread after each sprint closes for the class
  - the class first-try rate
  - background music with Mute
  - a 3, 2, 1 podium at the end
- **Squad version:**
  - Squad coins pool together, and squads rank by their average.
  - Jobs still apply: the Reader gets the chunk first, and the Fact-checker confirms the tap.
- **Teacher phone:** Pause, Mute and End now.

## Public demo

- **Opponents:** 3 to 5 computer players, clearly labeled, with names like The Lantern Ghost.
- **Timing:** authored, the same way as today's computer rival: a set first-try rate and reading speed per player, so the race feels real and the student can win.

## Rules carried over

- Never points without a proven line. Speed only breaks ties.
- Reduced motion turns the bursts and podium into static screens. The Sound toggle covers effects and music.
- Every tap target is at least 44px, and everything has an accessible name.
- Rank changes are announced politely; the rest is not announced every second.
- The teacher's Evidence view gets every proof, try, chest, purchase, card and rank change, with times.
- Test runs stay off real leaderboards.

## Sprint questions needed (scene 1 of each story)

Target: 24 per scene, enough for a 20-minute game without repeats. After that, questions repeat in a new order for half coins. Existing clue-bank questions are reused as sprints, without their exact-words and Prove it steps.

| Story | Existing single-line questions in scene 1 | New sprint questions needed |
|---|---|---|
| The Legend of Sleepy Hollow | 12 | 12 (drafted below) |
| The Tell-Tale Heart | 6 | 18 |
| Trifles | 15 | 9 |

New sprints follow every bank rule: one thing per question, no shared word roots with the answer (checked with the same `sharedRoots` the validator uses; all 12 drafts below pass), one accepted line or more, and `validate:worlds` checks.

## Draft: Sleepy Hollow scene 1, 12 new sprint questions (for your review)

| # | Question | Accepted line(s) | Chunk shown |
|---|---|---|---|
| 1 | About how long a walk is it from the river port to the hollow? | ¶3.4 "Not far from this village, perhaps about two miles, there is a little valley…" | ¶3 |
| 2 | Which birds are nearly the only noise in that glen? | ¶3.5 "…the occasional whistle of a quail or tapping of a woodpecker…" | ¶3 |
| 3 | What scared the narrator on his first hunt as a boy? | ¶4.2 "…startled by the roar of my own gun…" | ¶4 |
| 4 | Which figures from long ago are blamed for the magic over this land? | ¶5.3 "Some say that the place was bewitched by a High German doctor… others, that an old Indian chief…" | ¶5 |
| 5 | Which ghost outranks every other in these parts? | ¶6.1 "…the apparition of a figure on horseback, without a head." | ¶6 |
| 6 | How was the rider wounded long ago? | ¶6.2 "…whose head had been carried away by a cannon-ball…" | ¶6 |
| 7 | What is the phantom searching for after dark? | ¶6.4 "…the ghost rides forth to the scene of battle in nightly quest of his head…" | ¶6 |
| 8 | What happens to people who move here from elsewhere? | ¶8.1 and ¶8.2 (they "inhale the witching influence… and see apparitions") | ¶8 |
| 9 | Where was Ichabod born? | ¶10.2 "He was a native of Connecticut…" | ¶10 |
| 10 | How was Ichabod built? | ¶10.4 "He was tall, but exceedingly lank…" (near miss ¶10.5, his head: "That's his head. What about his body?") | ¶10 |
| 11 | How did Ichabod get his meals and a bed? | ¶13.3 "…he was… boarded and lodged at the houses of the farmers…" | ¶13 |
| 12 | What did Ichabod teach on the side for coins? | ¶15.1 "…the singing-master of the neighborhood… instructing the young folks in psalmody." | ¶15 |

The 12 existing scene 1 clue-bank questions (classroom, burglar, discipline, clothing, Hans's role, cash, titles, burned books, the poem, stream bank, the town's explanation, why they gave up) become sprints as they are, once the answer-key fixes for this scene are approved.

## Build order (after your OK)

1. Sprint engine and scoring in `lib/` (pure, tested), using the existing banks. The authored sprint questions go in world.json and are checked by `validate:worlds`.
2. The solo screens: sprint, feedback, rank card, chest, shop, collection.
3. The demo's computer players.
4. The live host board, podium and music; the squad pool.
5. Evidence view rows. Test every playable world at 375×812 and at projector size.
