# Explorable room scenes: plan (Part 2, not built)

Status: plan only, awaiting approval. The mockup of Room 1, Chamber 1 is in `Claude outputs/scene-plan-1366.png` and `scene-plan-390.png`.

## How a chamber plays

1. **The chamber opens as a painted scene** of that place in the story. The painting is accurate, with no deliberate mistakes (Fix the Painting stays a separate puzzle).
2. **Items sit at spots around the scene.** Each item is a literal object or place in that chunk's text, never taken from a simile or metaphor, and is tied to one chunk and its lock.
   - **Opening an item.** Tapping it opens its reading and lock exactly as today: read, answer, prove. Proving it opens the item, adds its contents (the proof line, the sorted pieces, or the puzzle lines) to the Case File, and checks it off in the scene.
   - **Story order.** The next item in story order glows, but the student finds and taps it themselves. Tapping a later item says it opens after the glowing one. A missed lock still opens only with the shown proof.
   - **Opened items stay explorable.** Tapping one reopens its reading and shows its proof.
   - **Hidden bonus items.** Each chamber has two or three, each a literal thing in that chamber's text. Each opens its line as a discovery for coins, never points or mastery.
3. **Witnesses and doors.**
   - **Witnesses** stand in the scene at their meeting point and step forward when their lock comes up. Tapping one starts the conversation (the current "Tap to ask" screen). Before then they aren't in the scene.
   - **Puzzle locks** (Fix the Painting, the code lock, Inspect the Scene) appear as places in the scene: a frame on the path, the gate, an object.
   - **The inner door and exit door** are places in the scene, locked until the chamber is cleared.
4. **Live games.** The board shows the scene with the class's current item lit and opened items checked. Phones open that item's reading and lock as they do now. The host moves the class item by item, so story order holds.
5. **Phones and access.**
   - **Phones:** the scene pans and pinches, and opens on the next item.
   - **Item list:** below the scene, every item, witness and door is also a button in a list, so keyboards, screen readers and small screens work without the picture.
   - **Reduced motion:** no glow pulse; a still ring marks the next item.
   - **Resume:** works as now, with the scene restoring opened items.

Every reading rule holds:
- proof is required;
- story order is intact;
- no item, bonus item, witness spot or painted detail draws on a content-noted paragraph (¶34 in Room 7, ¶47 and ¶48 in Room 9);
- scene objects are literal things in the story, and the validator checks every item.

## Room 1, Chamber 1 (the mockup)

| Item | Lock and reading | Into the Case File |
|---|---|---|
| 1 · The inn at Tarry Town, on the river cove | Lock 1 · ¶3 s1 to s3 | The proof line |
| 2 · The little brook | Lock 2 · ¶3 s4 to s5 | The proof line |
| 3 · The walnut grove | Lock 3 · ¶4 s1 to s3 | The proof line |
| Fix the Painting (a frame on the path) | After lock 3 | The 2 disproving lines |
| 4 · The haze over the land | Lock 4 · ¶5 s1 to s2 | The proof line |
| 5 · The farmhouse porch | Lock 5 · ¶5 s3 to s4 | The sorted pieces |
| The gate | Inner door · the code lock | Chamber 1 escaped |

- **Hidden bonus items:** the woodpecker and the quail (¶3), and a squirrel in the walnut grove (¶4).
- **Witness:** Hans stands on the road by the inn and steps forward at lock 1.

## Art each room needs

One painted scene per chamber, at 1536 × 1024 and high quality, in the style of the current room art. The same image serves solo, phones (pan and zoom) and the live board. Items and bonus items are painted into the scene and placed by hand, so they need no separate art.

| Room | Chamber 1 scene | Chamber 2 scene |
|---|---|---|
| 1 Tarry Town and the glen | The glen above Tarry Town (¶3 to ¶5) | The old church and the valley at night (¶5 to ¶9) |
| 2 The schoolhouse | The log schoolhouse and its room (¶10 to ¶12) | A farmhouse where he boards, and the church choir (¶13 to ¶15) |
| 3 Fireside tales | A churchyard Sunday and the walk home (¶15 to ¶18) | Winter firesides (¶18 to ¶20) |
| 4 The Van Tassel farm | The farm by the river (¶21 to ¶23) | The farmhouse hall (¶23 to ¶24) |
| 5 A rival appears | The farmyard and its riches (¶25 to ¶26) | Brom's arrival at the gate (¶27 to ¶28) |
| 6 The feud | The courting at the Van Tassels' (¶28 to ¶31) | The piazza at evening (¶31 to ¶33) |
| 7 The invitation | The pranked schoolhouse (¶33 to ¶35; ¶34 is content-noted and is never drawn on) | Getting ready to ride (¶35 to ¶37) |
| 8 The ride to the party | The autumn road (¶37 to ¶40) | Guests arriving at the farm (¶40 to ¶42) |
| 9 The feast and the dance | The tea-table feast (¶43 to ¶45) | The dance hall and porch (¶46 to ¶50; ¶47 and ¶48 are content-noted and are never drawn on) |
| 10 Ghost stories | The porch storytellers (¶50 to ¶53) | The church and its bridge in the tales (¶53 to ¶55) |
| 11 The lonely road | The party ending (¶56 to ¶57) | The midnight road and André's tree (¶58 to ¶60) |
| 12 The Headless Horseman | The swamp and the stream (¶61 to ¶63) | The chase to the church bridge (¶63 to ¶65) |
| 13 Gone | The morning search (¶66 to ¶67) | The empty schoolhouse and his belongings (¶68 to ¶70) |
| 14 The postscript | The valley years later (¶71 to ¶75) | The storyteller in the city (¶75 to ¶81) |

That is 28 scenes, plus about 10 redraws. The puzzle art took about one redraw for every three images, so call it about 38 images in all.

## OpenAI credits

- **Price assumption:** I can't see your OpenAI billing. OpenAI's published price for a high-quality 1536 × 1024 image has been about $0.25 (gpt-image-1); gpt-image-2 may differ.
- **Estimate:** at that rate, 38 images come to about **$10**. Allow **$15 to $20** for extra redraws.
- **How to confirm:** I'd make Room 1's two scenes first and you can read the real cost on your billing page before the other 26.

## Phases and time estimates

| Phase | What | Estimate |
|---|---|---|
| 0 · Scene data and rules | Items per chunk (spot, label, alt text), bonus items with their lines, witness spots, door spots; validator rules for story order, literal objects, content notes, and every chunk having exactly one item | About half a day |
| 1 · Solo scene | The scene screen, item states (next, later, opened), item list, pan and zoom on phones, witnesses and doors in the scene, resume, reduced motion; tests | 1 to 1.5 days |
| 2 · Room 1 art | Two scenes, item placement by eye, browser checks. **Stop for your review.** | About half a day, plus your review |
| 3 · Live | The board shows the scene with the class's item lit; phones unchanged; tests | About 1 day |
| 4 · Rooms 2 to 14 | Items and bonus items for 26 chambers, 26 scenes, placement, the content review document. **Stop for your review.** | About 2 days, plus your review |
| 5 · Finish | Every check, Chromium and WebKit at 390 px and 1366 × 768 for solo and live, playtest kit update | About half a day |

In total, about 5 to 6 working days plus your two review stops. Nothing is built until you approve.
