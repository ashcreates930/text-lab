# Room 1 scenes, for review

The art is made with `scripts/scene-art.mjs` (fixes with `scripts/scene-art-edits.mjs`). It uses the poster and André's tree only as style references: painterly, moody oil, muted colours, golden hour or moonlight. Each scene is accurate to its chamber's text, with no deliberate mistakes, no lettering, and adults or teens only. Nothing is drawn from a content-noted paragraph.

Previews are in `Claude outputs/scenes/`:
- `*.jpg`: the clean painting.
- `*-play.jpg`: how a student sees it, with subtle markers. A brass ring with a soft lantern glow is on the next item, small brass checks are on opened items, and later or hidden items have no marker.
- `*-key.jpg`: the placement key, for review only.

## Chamber 1: the glen (¶3 to ¶5), golden hour. Finished.

| Spot | What it is | Opens |
|---|---|---|
| 1 · The inn at Tarry Town | The tavern by the river cove (its sign has no lettering) | Lock 1 · ¶3 s1 to s3 |
| 2 · The little brook | The brook under the stone bridge | Lock 2 · ¶3 s4 to s5 |
| 3 · The walnut grove | The tall trees on the hillside | Lock 3 · ¶4 s1 to s3 |
| Fix the Painting | A brass frame marker on the road (the puzzle stays its own screen) | After lock 3 |
| 4 · The haze over the land | The drowsy haze over the valley fields | Lock 4 · ¶5 s1 to s2 |
| 5 · The farmhouse porch | Two country folk sitting idle, lost in a daydream | Lock 5 · ¶5 s3 to s4 |
| The gate | The farm gate where the road leaves the valley | Inner door · the code lock |
| Hans | The old farmer in a brown coat on the road by the inn | Steps forward at lock 1 |

## Chamber 2: the hollow at night (¶5 to ¶9), moonlight. One fix pending.

| Spot | What it is | Opens |
|---|---|---|
| 6 · The meteor | A meteor streaking across the starry sky | Lock 6 · ¶5 s5 to s6 |
| 7 · The rider on the road | A cloaked rider far down the road, a silhouette in the mist | Lock 7 · ¶6 s1 to s2 |
| 8 · The churchyard | The old graves below the church | Lock 8 · ¶6 s3 to s4 |
| 9 · The lit farmhouse windows | Farmhouses where families tell tales by the fire | Lock 9 · ¶7 to ¶8 |
| 10 · The still nook | The calm water by the rapid stream, with a straw afloat | Lock 10 · ¶9 |
| Inspect the Scene | The churchyard gate | After lock 10 |
| The church door | The exit door: Name the Liar | After the scene |
| Brom | The young man on the road | Steps forward at lock 7 |
| Katrina | The young woman with the lantern by the churchyard gate | Steps forward at lock 9 |

**Pending fix:** the distant rider must be clearly headless (the text says so). In this draft his silhouette still shows a head and hat, and Brom should be broad-shouldered with his fur cap, as in his portrait. An edit for both is written. It needs OpenAI credits: the account returned "no credits remaining" partway through.

## Bonus items: a reading task before any coins

Each bonus item is a literal thing in the chamber's text. Tapping it asks one small reading task: tap the word in its line that answers a question. It pays coins only when the student taps the right word, never for the tap alone, and never points or mastery.

Each bonus opens only after the lock whose reading contains its line, so a bonus never previews an answer. The questions follow the code-lock rules: the answer word appears once in the line, and the question shares no word or root with the line. All five pass.

| Bonus | Line | Question | Tap |
|---|---|---|---|
| Squirrel (Chamber 1) | ¶4 s1 | What did the narrator hunt as a boy? | squirrel-shooting |
| Woodpecker (Chamber 1) | ¶3 s5 | Which bird makes a knocking noise? | woodpecker |
| Quail (Chamber 1) | ¶3 s5 | Which bird is heard calling now and then? | quail |
| Cannon-ball (Chamber 2) | ¶6 s2 | In which war did the rider lose his life? | Revolutionary |
| Bubble (Chamber 2) | ¶9 s2 | What does the narrator call that calm pool, as if it were a port for boats? | harbor |

## Next, after approval

Build the scene engine (phases 0 and 1 in `docs/scene-plan.md`) on Room 1. Then make the other 26 scenes only after you approve these two.
