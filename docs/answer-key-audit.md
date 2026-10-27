# Answer-key audit

How this works: `scripts/answer-key-audit.ts <world> <scene>` prints each scene's full key: every question as students see it, every accepted line with its ¶, every near miss with its hint, and the exact-words key words. `scripts/scene-passages.ts <world> <scene>` prints the scene's tappable lines. Each scene was reviewed twice against the passage, with every question checked as a careful 7th grader would read it. Flags:

- **A**: a fair line that isn't accepted.
- **B**: an accepted line that doesn't answer.
- **C**: the wording doesn't match the answers.
- **D**: "Tap 3" when fewer than 3 lines answer.
- **E**: exact-words or support lists are too narrow.

Status:
- **Fixed on answer-key-fixes**: changed on the branch, waiting for your OK to merge.
- **Proposed**: no change made yet; waiting for your approval.

## Sleepy Hollow · Scene 1 (the live demo)

Reviews:
- **First review**: Claude, the session that builds the game.
- **Second review**: an independent reviewer that saw only the key and the passage, never the first review.

The second review's report came in while the first was being finished, so the first review saw it before it was done.

### Flags

| # | Question (as students see it) | Problem | Proposed fix | Found by | Status |
|---|---|---|---|---|---|
| 1 | R2 (Brom): "Ghost or man, I wonder." What detail by the stream hints a person was there? | Only "close beside it a shattered pumpkin" counted. "a shattered pumpkin" was marked wrong. | Any span holding the key words "shattered pumpkin" counts. A span missing them says "Right line! Mark the words that prove it" with no try used. Key words were authored for all 66 exact-words answers in the three stories. | Both, and you | Fixed on answer-key-fixes |
| 2 | R2: "I wonder if the town looked hard at the facts." Which line shows how they reached a verdict? | The exact words were only "compared them … shook their heads". "The stories of Brouwer, of Bones … were called to mind" is the real proof of matching old tales. | Keys: "compared them with the symptoms" or "stories of Brouwer, of Bones". | Both | Fixed on answer-key-fixes |
| 3 | R4: every Build the case theory | Each theory accepted only its 2 or 3 authored lines. ¶70.2 ("Knots of gazers…") was listed as support for "The Headless Horseman" and "Something took him", but a crowd gathering supports neither. | Broad lists (below). Any 2 lines from the list count. ¶70.2 is now used only for "The hat and pumpkin". | Both, and you | Fixed on answer-key-fixes; please review the lists |
| 4 | R1: Tap 3 lines that show what Ichabod owned that was left behind. | ¶69.5 ("These magic books and the poetic scrawl were … consigned to the flames") is his property, left behind, and marked wrong. Both near-miss hints say "Check ¶66", which isn't in the reading. | Accept ¶69.5. Change the hints to "That saddle was Hans's, not Ichabod's. Check ¶69." | Both | Proposed |
| 5 | R2: "Maybe he just packed up and left." Which line hints he might have gone on his own? | "Packed up" clashes with ¶69.2–3: his whole bundle was left behind. ¶69.1 ("The brook was searched, but the body … was not to be discovered") also fairly hints he left alive. | Reword to "Maybe he just left on his own." Which line hints he might have gone? Accept ¶69.1 (key "not to be discovered"). | Both | Proposed |
| 6 | Clue · Belongings: Apart from reading material, what did Ichabod own? Name what he wore. | It says "apart from reading material", but the answer line includes a psalm book, and "what he wore" includes a razor and a pitch-pipe. The old exact words left out the corduroy small-clothes. | Reword to "What clothes were in his bundle?" Keys: any clothing item, including small-clothes (already authored). | Both | Rewording proposed (keys fixed) |
| 7 | Clue · Empty schoolhouse: What kind of teacher was Ichabod with children who misbehaved? | ¶11.6 ("Ichabod Crane's scholars certainly were not spoiled") answers it (strict) but isn't accepted. ¶11.4 (menace and the birch) is a near miss, but it fairly shows a strict teacher. | Accept ¶11.6. Keep ¶11.4 as a near miss with a fairer hint: "That shows he was strict. How does the narrator judge his fairness? Check ¶12." | Both (different fixes) | Proposed |
| 8 | Clue · Own books: Who was the unfinished poem for? | It's tagged "infer", but the line says it outright. | Retag as locate. Students don't see the tag. | Reviewer | Proposed (cosmetic) |
| 9 | Your Turn demo · Style Ichabod from his bundle | "His hat, found by the brook" is accepted, but the prompt says to choose only from the bundle. The hat wasn't in it. | Remove the hat piece; there are still 4 real pieces. | Reviewer | Proposed |
| 10 | Your Turn demo · Ghost or ran away: Hans says "If something took him, we would have found him by now." | The accepted ¶69.1 ("body … not to be discovered") agrees with Hans instead of answering him. | Reword the claim to "He just fell in the brook and drowned, plain and simple." ¶69.1 then answers it. | Reviewer | Proposed |
| 11 | Your Turn demo · Ghost or ran away: Brom says "A man running away would have taken his things." | ¶69.3 (the list of things left behind) supports Brom's claim instead of rebutting it. | Reword to "He had nothing to run away with." Accept ¶69.6 (his pay was on him). | Reviewer | Proposed |
| 12 | Your Turn demo · Ghost or ran away: Hans says "Nothing strange happened on that road." | ¶68.1 (the horse came home with no saddle and the bridle under its feet) also answers it. | Accept ¶68.1. | Reviewer | Proposed |
| 13 | Your Turn · Prove them wrong (full game and demo): "Nobody thought much of him." | ¶14.4, ¶16.2, ¶17.1 and ¶17.2 (he found favor with the mothers, his visits caused a stir, he was "greeted with satisfaction" and "esteemed by the women") also answer it. | Accept them. | Reviewer | Proposed |
| 14 | Your Turn · Prove them wrong: "He couldn't even earn his keep." | ¶15.4 (he "got on tolerably enough") and ¶13.3 (boarded and lodged by the farmers) also answer it. | Accept them. | Reviewer | Proposed |
| 15 | Clue · Searchers' report and Own books: near misses from ¶69 and ¶70 | The reviewer thought these paragraphs couldn't be tapped. | No change. The clue screen shows the clue's paragraphs plus their neighbors, so these lines can be tapped. | Disagreement (see below) | No change |

### Where the two reviews disagree

- **¶12 and ¶70 near misses (Empty schoolhouse, Own books, Searchers' report).** The second review flagged them as untappable. I checked: they can be tapped, because the clue screen shows the clue's paragraphs plus their neighbors. The second review was told only about the clue paragraphs, so this is a briefing gap, not a key error. The key generator now lists each clue's tappable paragraphs.
- **R1 trail ("Tap 3 lines that show the trail people followed to find him").** The second review called ¶69.1 (the brook search) borderline. The first review counts the search of the brook as part of the trail they followed. Both agree exactly 3 lines answer it. Your call: keep it, or reword it to "the trail and the search."
- **Teacher discipline (#7).** The second review would accept ¶11.4 (menace and the birch). The first review keeps it as a near miss with a fairer hint, because the Prove it answer is about fairness. Your call.
- **Your Turn claims that cite ¶57, ¶71 or ¶72 (Loyalty: Katrina; Rebuttal: "nobody ever heard from him").** The second review flagged them for scene 1. In the demo ending, claims without a scene 1 line are already left out automatically. They remain in the full game, where ¶71 and ¶72 are in the reading. No change for the demo. Accepting ¶70.4 for "Children still learn in his old schoolhouse" is proposed (it says the school was moved).

### Round 4 support lists (now on answer-key-fixes, for your review)

Any 2 lines from a theory's list count. ¶ and sentence number refer to `scripts/scene-passages.ts sleepy-hollow 1`.

**Ichabod is gone. What do you think happened to him?**
- **Brom's prank:**
  - ¶68.6 saddle trampled, tracks, hat and shattered pumpkin
  - ¶69.1 no body found
  - ¶69.4 verses "in honor of the heiress of Van Tassel" (a rival's motive)
- **The Headless Horseman:**
  - ¶70.3 the town's conclusion: "carried off by the Galloping Hessian"
  - ¶68.6 tracks "at furious speed" to the bridge
  - ¶69.1 no body found
  - ¶68.1 the horse came home without its rider
- **He ran away:**
  - ¶69.6 his quarter's pay "about his person"
  - ¶69.1 no body found
  - ¶68.1 the horse came home
  - ¶70.4 a bachelor "in nobody's debt" (nothing held him)

**Did Ichabod leave Sleepy Hollow alive?**
- **He left alive:** ¶69.6, ¶69.1, ¶70.4
- **He drowned:** ¶68.6 (the trail ends at water "deep and black"), ¶68.1
- **Something took him:** ¶70.3, ¶68.6, ¶69.1

**Which clue should the town have looked at hardest?**
- **The hat and pumpkin:**
  - ¶68.6 the hat and the shattered pumpkin
  - ¶70.2 "Knots of gazers… at the spot where the hat and pumpkin had been found"
  - ¶68.5 the inquiry "came upon his traces"
- **The missing pay:**
  - ¶69.6 his pay
  - ¶70.4 in nobody's debt
  - ¶69.2 Hans examined the bundle
  - ¶69.3 the list of his things (no money)
- **The empty brook:**
  - ¶69.1 no body
  - ¶68.5 the inquiry found his traces
  - ¶68.6 the trail to the brook

### The full key (after the changes on answer-key-fixes)


Reading: ¶68, ¶69, ¶70, ¶1, ¶2, ¶3, ¶4, ¶5, ¶6, ¶7, ¶8, ¶9, ¶10, ¶11, ¶12, ¶13, ¶14, ¶15, ¶16, ¶17, ¶18, ¶19, ¶20

#### Clue: The empty schoolhouse (empty-schoolhouse)

Clue paragraphs: ¶11 · tappable on the clue screen: ¶10, ¶11, ¶12

- **Off claim** (Brom Bones says): "That schoolhouse was a fine big place, with plenty of rooms for all his scholars."
  - Accepted (corrects it): ¶11: "His schoolhouse was a low building of one large room, rudely constructed of logs; the windows partly glazed, and partly patched with leaves of old copybooks."

- **Question (locate)**: How was Ichabod's classroom put together?
  - Accepted: ¶11: "His schoolhouse was a low building of one large room, rudely constructed of logs; the windows partly glazed, and partly patched with leaves of old copybooks." · exact words: "rudely constructed of logs; the windows partly glazed, and partly patched with leaves of old copybooks" · key (any span holding one counts): "rudely constructed of logs"
  - Near miss: ¶11: "The schoolhouse stood in a rather lonely but pleasant situation, just at the foot of a woody hill, with a brook running close by, and a formidable birch-tree growing at one end of it." · hint: "That tells where it stood, not what it was made of. Check ¶11."
  - Prove it: right "The school was poor and roughly put together." · wrong: "The school was the finest building in the valley."; "Ichabod built the school himself."; "Children broke the windows playing ball."

- **Question (locate)**: Why would a burglar have trouble once inside the room?
  - Accepted: ¶11: "It was most ingeniously secured at vacant hours, by a withe twisted in the handle of the door, and stakes set against the window shutters; so that though a thief might get in with perfect ease, he would find some embarrassment in getting out,--an idea most probably borrowed by the architect, Yost Van Houten, from the mystery of an eelpot." · exact words: "though a thief might get in with perfect ease, he would find some embarrassment in getting out" · key (any span holding one counts): "embarrassment in getting out"
  - Near miss: ¶11: "His schoolhouse was a low building of one large room, rudely constructed of logs; the windows partly glazed, and partly patched with leaves of old copybooks." · hint: "That is how it was put together. How was it shut at night? Check ¶11."
  - Prove it: right "A burglar could get in easily but would struggle to escape." · wrong: "The school had strong iron locks."; "Nobody could ever get inside."; "Ichabod slept at the school to guard it."

- **Question (infer)**: What kind of teacher was Ichabod with children who misbehaved?
  - Accepted: ¶11: "Truth to say, he was a conscientious man, and ever bore in mind the golden maxim, “Spare the rod and spoil the child.”"
  - Accepted: ¶12: "I would not have it imagined, however, that he was one of those cruel potentates of the school who joy in the smart of their subjects; on the contrary, he administered justice with discrimination rather than severity; taking the burden off the backs of the weak, and laying it on those of the strong." · exact words: "he administered justice with discrimination rather than severity" · key (any span holding one counts): "discrimination rather than severity"
  - Near miss: ¶11: "From hence the low murmur of his pupils’ voices, conning over their lessons, might be heard in a drowsy summer’s day, like the hum of a beehive; interrupted now and then by the authoritative voice of the master, in the tone of menace or command, or, peradventure, by the appalling sound of the birch, as he urged some tardy loiterer along the flowery path of knowledge." · hint: "That is the sound of the classroom. How does the narrator judge his punishments? Check ¶12."
  - Prove it: right "He was strict but tried to be fair, going easier on the weak." · wrong: "He never punished anyone."; "He was cruel and enjoyed it."; "Parents made him stop punishing."

#### Clue: Ichabod's belongings (ichabods-belongings)

Clue paragraphs: ¶69 · tappable on the clue screen: ¶68, ¶69, ¶70

- **Off claim** (Hans Van Ripper says): "He left every coin of his quarter's pay behind in that bundle."
  - Accepted (corrects it): ¶69: "Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance."

- **Question (locate)**: Apart from reading material, what did Ichabod own? Name what he wore.
  - Accepted: ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe." · exact words: "two shirts and a half; two stocks for the neck; a pair or two of worsted stockings" · key (any span holding one counts): "two shirts and a half" or "two stocks for the neck" or "worsted stockings" or "corduroy small-clothes"
  - Near miss: ¶69: "As to the books and furniture of the schoolhouse, they belonged to the community, excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling; in which last was a sheet of foolscap much scribbled and blotted in several fruitless attempts to make a copy of verses in honor of the heiress of Van Tassel." · hint: "Those are his books. What else did he own? Check ¶69."
  - Near miss: ¶69: "Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance." · hint: "Money isn't on the list of his things. Check ¶69."
  - Prove it: right "Ichabod owned very little and lived plainly." · wrong: "Ichabod was secretly rich."; "Hans Van Ripper took his clothes."; "Ichabod packed his things to run away."

- **Question (locate)**: What role did Hans take on after the schoolmaster vanished?
  - Accepted: ¶69: "Hans Van Ripper as executor of his estate, examined the bundle which contained all his worldly effects."
  - Near miss: ¶68: "Hans Van Ripper now began to feel some uneasiness about the fate of poor Ichabod, and his saddle." · hint: "Hans worries there, but what job does he take on? Check ¶69."
  - Prove it: right "Hans was put in charge of what Ichabod left." · wrong: "Hans was Ichabod's brother."; "Hans was the town judge."; "Hans was looking for his saddle in the bundle."

- **Question (infer)**: Was Ichabod carrying cash when he vanished? Find the line that suggests it.
  - Accepted: ¶69: "Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance." · exact words: "he must have had about his person at the time of his disappearance" · key (any span holding one counts): "about his person"
  - Near miss: ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe." · hint: "That list has no money in it. Where does the narrator talk about his pay? Check ¶69."
  - Prove it: right "His pay wasn't left behind, so he likely had it with him." · wrong: "He left all his money in the bundle."; "He had no money at all."; "Hans took his money."

#### Clue: Ichabod's own books and the unfinished poem (ichabods-own-books)

Clue paragraphs: ¶69 · tappable on the clue screen: ¶68, ¶69, ¶70

- **Off claim** (Hans Van Ripper says): "I kept his books on the schoolhouse shelf. Waste not, want not."
  - Accepted (corrects it): ¶69: "These magic books and the poetic scrawl were forthwith consigned to the flames by Hans Van Ripper; who, from that time forward, determined to send his children no more to school, observing that he never knew any good come of this same reading and writing."

- **Question (locate)**: Which titles were Ichabod's personal property rather than the town's?
  - Accepted: ¶69: "As to the books and furniture of the schoolhouse, they belonged to the community, excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling; in which last was a sheet of foolscap much scribbled and blotted in several fruitless attempts to make a copy of verses in honor of the heiress of Van Tassel." · exact words: "excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling" · key (any span holding one counts): "History of Witchcraft" or "New England Almanac" or "book of dreams and fortune-telling"
  - Near miss: ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe." · hint: "That music book is on his list, but which books does the narrator single out from the school's? Check ¶69."
  - Prove it: right "He owned books about witchcraft and fortune-telling, so he believed in the supernatural." · wrong: "The books all belonged to the school."; "Ichabod hated ghost stories."; "Ichabod wrote the almanac himself."

- **Question (locate)**: What became of his spellbooks and verses?
  - Accepted: ¶69: "These magic books and the poetic scrawl were forthwith consigned to the flames by Hans Van Ripper; who, from that time forward, determined to send his children no more to school, observing that he never knew any good come of this same reading and writing." · exact words: "These magic books and the poetic scrawl were forthwith consigned to the flames" · key (any span holding one counts): "consigned to the flames"
  - Near miss: ¶69: "As to the books and furniture of the schoolhouse, they belonged to the community, excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling; in which last was a sheet of foolscap much scribbled and blotted in several fruitless attempts to make a copy of verses in honor of the heiress of Van Tassel." · hint: "That names the books. What did Hans do with them? Check ¶69."
  - Prove it: right "Hans burned them because he thought reading did no good." · wrong: "Hans kept them on the school shelf."; "Hans gave them to Katrina."; "Ichabod took them with him."

- **Question (infer)**: Who was the unfinished poem for?
  - Accepted: ¶69: "As to the books and furniture of the schoolhouse, they belonged to the community, excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling; in which last was a sheet of foolscap much scribbled and blotted in several fruitless attempts to make a copy of verses in honor of the heiress of Van Tassel." · exact words: "in honor of the heiress of Van Tassel" · key (any span holding one counts): "heiress of Van Tassel"
  - Near miss: ¶70: "As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead." · hint: "That says he never married. Who was he writing for? Check ¶69."
  - Prove it: right "He was trying to win the Van Tassel heiress, which could give someone a reason to want him gone." · wrong: "The poem was for his mother."; "Katrina wrote the poem."; "The poem was about the Horseman."

#### Clue: The searchers' report (searchers-report)

Clue paragraphs: ¶68, ¶70 · tappable on the clue screen: ¶68, ¶69, ¶70

- **Off claim** (Brom Bones says): "They found his saddle hanging neatly on the bridge rail."
  - Accepted (corrects it): ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."

- **Question (locate)**: What was found on the stream bank, past where the hoofprints led?
  - Accepted: ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin." · exact words: "was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin" · key (any span holding one counts): "shattered pumpkin" or "hat of the unfortunate Ichabod"
  - Near miss: ¶70: "Knots of gazers and gossips were collected in the churchyard, at the bridge, and at the spot where the hat and pumpkin had been found." · hint: "That's people gathering later. Where were these first found? Check ¶68."
  - Prove it: right "A smashed pumpkin lay beside his hat, which could point to a trick." · wrong: "His body was found."; "The Horseman's head was found."; "Nothing at all was found."

- **Question (locate)**: How did folks in the valley explain where he went?
  - Accepted: ¶70: "The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian." · exact words: "Ichabod had been carried off by the Galloping Hessian" · key (any span holding one counts): "carried off by the Galloping Hessian"
  - Near miss: ¶70: "Knots of gazers and gossips were collected in the churchyard, at the bridge, and at the spot where the hat and pumpkin had been found." · hint: "They gathered and gossiped. What did they decide? Check ¶70."
  - Prove it: right "The town believed a ghost took him, based on old stories." · wrong: "The town proved a ghost took him."; "The town blamed Brom."; "The town thought he ran away."

- **Question (infer)**: Why did people give up on him so quickly?
  - Accepted: ¶70: "As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead." · exact words: "As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him" · key (any span holding one counts): "bachelor" or "in nobody’s debt"
  - Near miss: ¶69: "The brook was searched, but the body of the schoolmaster was not to be discovered." · hint: "That's the search itself. Why did people stop caring? Check ¶70."
  - Prove it: right "He had no wife or debts, so no one had a reason to keep looking." · wrong: "They found him alive."; "The town was afraid of the bridge."; "Hans forbade a search."

#### Spot the Lie (clue ichabods-belongings)

- **Testimony** (Hans Van Ripper): "I looked through the schoolmaster's bundle myself. Inside were some shirts, a rusty razor, and a brand-new pitch-pipe. His books of magic went straight into the fire."
  - False claim: "Inside were some shirts, a rusty razor, and a brand-new pitch-pipe."
  - Accepted (disproves it): ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."

#### Story Mode

Round 1 reading (in parts): ¶68, ¶69, ¶70

##### Round 1 · Locate

- **Question**: Tap 3 lines that show what Ichabod owned that was left behind.
  - Accepted: ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."
  - Accepted: ¶69: "Hans Van Ripper as executor of his estate, examined the bundle which contained all his worldly effects."
  - Accepted: ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."
  - Accepted: ¶69: "As to the books and furniture of the schoolhouse, they belonged to the community, excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling; in which last was a sheet of foolscap much scribbled and blotted in several fruitless attempts to make a copy of verses in honor of the heiress of Van Tassel."
  - Near miss: ¶68: "The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate." · hint: "Whose saddle was it? Check ¶66."
  - Near miss: ¶68: "Hans Van Ripper now began to feel some uneasiness about the fate of poor Ichabod, and his saddle." · hint: "Whose saddle was it? Check ¶66."

- **Question**: Tap 3 lines that show how people realized he was gone.
  - Accepted: ¶68: "The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate."
  - Accepted: ¶68: "Ichabod did not make his appearance at breakfast; dinner-hour came, but no Ichabod."
  - Accepted: ¶68: "The boys assembled at the schoolhouse, and strolled idly about the banks of the brook; but no schoolmaster."
  - Accepted: ¶68: "Hans Van Ripper now began to feel some uneasiness about the fate of poor Ichabod, and his saddle."
  - Near miss: ¶70: "The mysterious event caused much speculation at the church on the following Sunday." · hint: "That's the Sunday after. What happened that first day? Check ¶68."

- **Question**: Tap 3 lines that show the trail people followed to find him.
  - Accepted: ¶68: "An inquiry was set on foot, and after diligent investigation they came upon his traces."
  - Accepted: ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."
  - Accepted: ¶69: "The brook was searched, but the body of the schoolmaster was not to be discovered."
  - Near miss: ¶70: "Knots of gazers and gossips were collected in the churchyard, at the bridge, and at the spot where the hat and pumpkin had been found." · hint: "That's the crowd days later. Where did the search go? Check ¶68."

##### Round 2 · Infer (Brom Bones asks)

- **Question**: "Ghost or man, I wonder." What detail by the stream hints a person was there?
  - Accepted: ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin." · exact words: "close beside it a shattered pumpkin" · key (any span holding one counts): "shattered pumpkin"
  - Near miss: ¶70: "The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian." · hint: "That's what the town believed. What object was left behind? Check ¶68."
  - Prove it: right "A smashed pumpkin beside his hat is an odd thing for a ghost to leave." · wrong: "Pumpkins are signs of ghosts."; "Ichabod was carrying a pumpkin for dinner."; "The pumpkin proves the Horseman is real."

- **Question**: "Maybe he just packed up and left." Which line hints he might have gone on his own?
  - Accepted: ¶69: "Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance." · exact words: "he must have had about his person at the time of his disappearance" · key (any span holding one counts): "about his person"
  - Near miss: ¶68: "The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate." · hint: "The horse came home, but what about his pay? Check ¶69."
  - Prove it: right "His pay wasn't found, so he may have taken it and gone." · wrong: "He left all his money behind."; "He had nothing to take."; "Hans paid him to leave."

- **Question**: "I wonder if the town looked hard at the facts." Which line shows how they reached a verdict?
  - Accepted: ¶70: "The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian." · exact words: "compared them with the symptoms of the present case, they shook their heads" · key (any span holding one counts): "compared them with the symptoms" or "stories of Brouwer, of Bones"
  - Near miss: ¶70: "The mysterious event caused much speculation at the church on the following Sunday." · hint: "That's the talk starting. How did they decide? Check ¶70."
  - Prove it: right "They matched the case to old tales instead of weighing evidence." · wrong: "They found the Horseman's tracks."; "They asked Ichabod's family."; "They waited for a judge."

##### Round 3 · Catch the lie

- **Testimony** (Hans Van Ripper): "We searched high and low for the poor man. At last we pulled his body out of the brook. It was a sad day for the valley."
  - False claim: "At last we pulled his body out of the brook."
  - Accepted (disproves it): ¶69: "The brook was searched, but the body of the schoolmaster was not to be discovered."

- **Testimony** (Brom Bones): "I heard all about the search. They found his hat by the water and a fresh-baked pie beside it. Odd thing to leave lying about."
  - False claim: "They found his hat by the water and a fresh-baked pie beside it."
  - Accepted (disproves it): ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."

- **Testimony** (Hans Van Ripper): "I looked through the schoolmaster's bundle myself. Inside were some shirts, a rusty razor, and a brand-new pitch-pipe. His books of magic went straight into the fire."
  - False claim: "Inside were some shirts, a rusty razor, and a brand-new pitch-pipe."
  - Accepted (disproves it): ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."

##### Round 4 · Build the case (pick a theory, pin 2 lines)

- **Question**: Ichabod is gone. What do you think happened to him?
  - Theory "Brom's prank" (Someone played a trick on Ichabod to scare him out of Sleepy Hollow.)
    - Supports: ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."
    - Supports: ¶69: "The brook was searched, but the body of the schoolmaster was not to be discovered."
    - Supports: ¶69: "As to the books and furniture of the schoolhouse, they belonged to the community, excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling; in which last was a sheet of foolscap much scribbled and blotted in several fruitless attempts to make a copy of verses in honor of the heiress of Van Tassel."
  - Theory "The Headless Horseman" (The ghostly Galloping Hessian really chased Ichabod and carried him away.)
    - Supports: ¶70: "The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian."
    - Supports: ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."
    - Supports: ¶69: "The brook was searched, but the body of the schoolmaster was not to be discovered."
    - Supports: ¶68: "The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate."
  - Theory "He ran away" (Ichabod left on his own and started a new life somewhere else.)
    - Supports: ¶69: "Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance."
    - Supports: ¶69: "The brook was searched, but the body of the schoolmaster was not to be discovered."
    - Supports: ¶68: "The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate."
    - Supports: ¶70: "As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead."

- **Question**: Did Ichabod leave Sleepy Hollow alive?
  - Theory "He left alive" (His pay went with him and no body was found, so he may have left on his own.)
    - Supports: ¶69: "Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance."
    - Supports: ¶69: "The brook was searched, but the body of the schoolmaster was not to be discovered."
    - Supports: ¶70: "As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead."
  - Theory "He drowned" (The trail ends at deep, dark water and his horse came home without him.)
    - Supports: ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."
    - Supports: ¶68: "The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate."
  - Theory "Something took him" (The town decided the Galloping Hessian carried him off.)
    - Supports: ¶70: "The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian."
    - Supports: ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."
    - Supports: ¶69: "The brook was searched, but the body of the schoolmaster was not to be discovered."

- **Question**: Which clue should the town have looked at hardest?
  - Theory "The hat and pumpkin" (A hat and a shattered pumpkin by the brook could mean a trick, not a ghost.)
    - Supports: ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."
    - Supports: ¶70: "Knots of gazers and gossips were collected in the churchyard, at the bridge, and at the spot where the hat and pumpkin had been found."
    - Supports: ¶68: "An inquiry was set on foot, and after diligent investigation they came upon his traces."
  - Theory "The missing pay" (His pay was never found, and no one kept looking for him.)
    - Supports: ¶69: "Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance."
    - Supports: ¶70: "As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead."
    - Supports: ¶69: "Hans Van Ripper as executor of his estate, examined the bundle which contained all his worldly effects."
    - Supports: ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."
  - Theory "The empty brook" (The searchers followed his trail, but the brook gave up no body.)
    - Supports: ¶69: "The brook was searched, but the body of the schoolmaster was not to be discovered."
    - Supports: ¶68: "An inquiry was set on foot, and after diligent investigation they came upon his traces."
    - Supports: ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."

#### Your Turn activities that use this scene's reading (demo versions where authored)

- **Prove them wrong about Ichabod** (underestimated, talk): Brom says the schoolmaster was good for nothing. Show him what the story says Ichabod could do.
  - Claim (Brom Bones): "He couldn't even earn his keep. A schoolmaster's pay feeds nobody."
    - Accepted: ¶14: "He assisted the farmers occasionally in the lighter labors of their farms, helped to make hay, mended the fences, took the horses to water, drove the cows from pasture, and cut wood for the winter fire."
    - Accepted: ¶15: "In addition to his other vocations, he was the singing-master of the neighborhood, and picked up many bright shillings by instructing the young folks in psalmody."
  - Claim (Brom Bones): "Nobody in the valley thought much of him."
    - Accepted: ¶16: "Our man of letters, therefore, was peculiarly happy in the smiles of all the country damsels."
    - Accepted: ¶16: "The schoolmaster is generally a man of some importance in the female circle of a rural neighborhood; being considered a kind of idle, gentlemanlike personage, of vastly superior taste and accomplishments to the rough country swains, and, indeed, inferior in learning only to the parson."
  - Claim (Brom Bones): "I bet he was cruel to those children."
    - Accepted: ¶12: "I would not have it imagined, however, that he was one of those cruel potentates of the school who joy in the smart of their subjects; on the contrary, he administered justice with discrimination rather than severity; taking the burden off the backs of the weak, and laying it on those of the strong."
  - Claim (Brom Bones): "He never did one thing worth remembering."
    - Accepted: ¶71: "It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court."

- **Was anyone loyal to Ichabod?** (loyalty, talk): Talk it over with Hans Van Ripper: was anyone in the valley loyal to Ichabod? Answer each of his claims with a line.
  - Claim (Hans Van Ripper): "I gave him a roof and looked after his things when he was gone. That's loyalty enough."
    - Accepted: ¶69: "These magic books and the poetic scrawl were forthwith consigned to the flames by Hans Van Ripper; who, from that time forward, determined to send his children no more to school, observing that he never knew any good come of this same reading and writing."
  - Claim (Hans Van Ripper): "The whole town kept looking for him for months."
    - Accepted: ¶70: "As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead."
  - Claim (Hans Van Ripper): "At least his old horse never let him down."
    - Accepted: ¶68: "The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate."
  - Claim (Hans Van Ripper): "And Katrina stood by him to the very end."
    - Accepted: ¶57: "Something, however, I fear me, must have gone wrong, for he certainly sallied forth, after no very great interval, with an air quite desolate and chapfallen."
    - Accepted: ¶71: "Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell."

- **Ghost or ran away?** (winning, debate): Pick your side: the Headless Horseman took him, or he ran away. A character argues the other one. Win each round with a line from this morning's search.
  - Side the-horseman, claim (Hans Van Ripper): "A ghost? Nonsense. Nobody sensible in this valley believes that."
    - Accepted: ¶70: "The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian."
  - Side the-horseman, claim (Hans Van Ripper): "Nothing strange happened on that road. He just rode off."
    - Accepted: ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."
  - Side the-horseman, claim (Hans Van Ripper): "He packed up his things and left like any man would."
    - Accepted: ¶69: "Hans Van Ripper as executor of his estate, examined the bundle which contained all his worldly effects."
    - Accepted: ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."
  - Side the-horseman, claim (Hans Van Ripper): "If something took him, we would have found him by now."
    - Accepted: ¶69: "The brook was searched, but the body of the schoolmaster was not to be discovered."
  - Side ran-away, claim (Brom Bones): "The Galloping Hessian took him. The whole church agreed on it."
    - Accepted: ¶69: "Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance."
  - Side ran-away, claim (Brom Bones): "He drowned in that black water by the bridge."
    - Accepted: ¶69: "The brook was searched, but the body of the schoolmaster was not to be discovered."
  - Side ran-away, claim (Brom Bones): "A man running away would have taken his things with him."
    - Accepted: ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."
  - Side ran-away, claim (Brom Bones): "Someone in the valley would have gone after him."
    - Accepted: ¶70: "As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead."

- **Advise Ichabod about his pay** (money, pick): Ichabod was paid a day or two before he vanished. Pick 3 cards for your advice, with at least one thing he had and one thing he left behind, and back each with a line.
  - Piece "His quarter's pay, just paid" (had)
    - Accepted: ¶69: "Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance."
  - Piece "No debts to anyone" (had)
    - Accepted: ¶70: "As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead."
  - Piece "A bundle of all his worldly things" (left)
    - Accepted: ¶69: "Hans Van Ripper as executor of his estate, examined the bundle which contained all his worldly effects."
  - Piece "A book of psalm tunes and a broken pitch-pipe" (left)
    - Accepted: ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."
  - Piece "His own books, burned by Hans" (left)
    - Accepted: ¶69: "These magic books and the poetic scrawl were forthwith consigned to the flames by Hans Van Ripper; who, from that time forward, determined to send his children no more to school, observing that he never knew any good come of this same reading and writing."
  - Piece "A box of savings under the schoolhouse" (had): decoy, no line supports it
  - Piece "Money owed to him by the Van Tassels" (had): decoy, no line supports it

- **Style Ichabod from his bundle** (fashion, pick): Hans Van Ripper opened the bundle that held everything Ichabod owned. Style Ichabod for the party from what was really in it. Pick 3 pieces and back each with the line that lists it. The story decides, not you.
  - Piece "Two and a half shirts"
    - Accepted: ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."
  - Piece "Two neck stocks"
    - Accepted: ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."
  - Piece "Worsted stockings"
    - Accepted: ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."
  - Piece "Old corduroy small-clothes"
    - Accepted: ¶69: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."
  - Piece "His hat, found by the brook"
    - Accepted: ¶68: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."
  - Piece "A velvet cape": decoy, no line supports it
  - Piece "Silver shoe buckles": decoy, no line supports it

- **Fact-check the feed** (social-media, factcheck): Three villagers posted about the missing schoolmaster. One post is false. Find it and prove it with a line.
  - Post (@HollowNews): "Schoolmaster missing! His hat and a smashed pumpkin were found by the brook."
  - Post (@VanRipperFarm): "Went through his bundle: two shirts and a half, a rusty razor, a broken pitch-pipe."
  - Post (@ValleyGossip, FALSE): "They pulled the schoolmaster's body out of the brook this morning."
    - Accepted (disproves it): ¶69: "The brook was searched, but the body of the schoolmaster was not to be discovered."

- **Cold case file** (solo, exhibits): Close the case on paper. Pick your 3 strongest exhibits: lines from the story you proved.
  - Any 3 lines from ¶68, ¶69, ¶70, ¶71

- **Squad report** (squad, exhibits): Write your squad's report. Pick 3 lines your squad would put in front of the town.
  - Any 3 lines from ¶68, ¶69, ¶70, ¶71

- **Rebuttal** (rival, talk): The Lantern Ghost has a theory, and it's wrong. Knock down each claim with a line.
  - Claim (): "Ichabod drowned in the brook. Case closed."
    - Accepted: ¶69: "The brook was searched, but the body of the schoolmaster was not to be discovered."
  - Claim (): "He left his money behind, so he never meant to leave."
    - Accepted: ¶69: "Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance."
  - Claim (): "Nobody ever heard from him again."
    - Accepted: ¶71: "It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court."
  - Claim (): "Children still learn in his old schoolhouse."
    - Accepted: ¶72: "The schoolhouse being deserted soon fell to decay, and was reported to be haunted by the ghost of the unfortunate pedagogue and the plowboy, loitering homeward of a still summer evening, has often fancied his voice at a distance, chanting a melancholy psalm tune among the tranquil solitudes of Sleepy Hollow."



---

## Sleepy Hollow scenes 2 to 4, The Tell-Tale Heart, Trifles

Method: two independent reviewers per story, each blind to the other, checked every key against the passage. The keys and passages come from `scripts/answer-key-audit.ts` and `scripts/scene-passages.ts` (regenerate them to see every question in full).

- **Both** marks a flag both reviewers raised.
- **A only** and **B only** mark disagreements, flags one reviewer raised and the other passed.

Status: everything below is **Proposed**. Nothing has changed in these keys yet. These scenes have no Story Mode, so the Round 1 and Round 4 checks don't apply.

### Sleepy Hollow · Scene 2 (Van Tassel party)

| Question | Problem | Proposed fix | Found by |
|---|---|---|---|
| Off claim: "ate like a bird" | ¶45.1 ("He was a kind and thankful creature… spirits rose with eating") also disproves it. | Accept ¶45.1. | Both |
| What would he do to his old job and his old employer? | The key "snap his fingers" covers only the employer half. | Add key "turn his back upon the old schoolhouse". | Both |
| Off claim: Brom "never played a single trick" | ¶33.3–¶33.5 (smoked out the singing school, the dog taught to whine) prove tricks more directly than the accepted line. | Accept them. | Both |
| Why didn't the two men have it out with their fists? | The key misses "too wary to give him an opportunity" and "double the schoolmaster up". | Add keys "too wary" and "double the schoolmaster up". | Both (B named both) |
| In Brom's tale, where did the rider disappear? | The keys don't name a place. A span on "the church bridge", the actual answer, fails. | Add key "church bridge". Drop "the Hessian bolted". | Both |
| Why share the boast with Ichabod in the room? | ¶55.2 ("He affirmed that… church bridge…") plants the idea the Prove it names, but it isn't accepted. | Accept ¶55.2. | Both |
| Off claim: Ichabod "came out grinning" | ¶57.11 ("stole forth with the air of one who had been sacking a henroost") also disproves it. | Accept ¶57.11 (and ¶57.12). | Both |
| Your Turn · Money: "Turn his back on the schoolhouse" filed as a cost | The text shows it as a gleeful wish. | Relabel it as a want, or reword it to "Give up his only steady job". | Both |
| Your Turn · Money: "Take on a powerful rival" | ¶30.1 ("Such was the formidable rival…") fits better. | Accept ¶30.1. | B only |
| Your Turn · Money: "Eat like a king" | ¶24.3 (the porkers and bacon) is the same daydream. | Accept ¶24.3. | Both |
| Your Turn · Loyalty: "Katrina stood by him" | ¶71.1 ("dismissed by the heiress") is the most direct rebuttal. | Accept ¶71.1 (and ¶57.9). | Both |
| Your Turn · Loyalty: "His old horse never let him down" | ¶62 (the "perverse old animal") and ¶65 (Gunpowder "possessed with a demon") answer it better than ¶68. | Accept ¶62.1 and ¶65.1. | Both |
| Wants Katrina or her family's wealth? | The key misses "Not those of the bevy of buxom lasses". | Add that key. | A only |
| What pranks? | The keys miss "turned everything topsy-turvy" and "turning him into ridicule". | Add both keys. | A only |
| Mood leaving the house | ¶57.12 also shows it. | Accept it. | A only |
| Your Turn · Unfair: "Katrina chose me fair and square" | ¶57.9 (her encouragement "a mere sham") fits better. | Accept ¶57.9. | A only |
| Your Turn · Debate (Brom's prank): two claims | ¶33.2/¶33.4 (tricks) and ¶48.5/¶32.6 (jealousy, feud) answer them. | Accept them. | A only |

### Sleepy Hollow · Scene 3 (The road home)

| Question | Problem | Proposed fix | Found by |
|---|---|---|---|
| Why was he frightened before the landmark? | ¶59.4 ("approaching the very place where many of the scenes of the ghost stories had been laid") answers it directly. | Accept ¶59.4. | Both |
| Off claim: the rider "chatted… friendly" | ¶63.12 ("made no offer of molestation or sociability") and ¶63.5 and ¶63.7 ("no reply", "no answer") disprove it. | Accept them. | Both |
| How did the figure respond when called? | The near-miss hint asks "What did he see there?", which doesn't fit the question. | Change the hint to "That's history. How did it answer him? Check ¶63." | Both |
| Details that fit a flesh-and-blood rider | ¶62.4 (the "plashy tramp" of hoofs), ¶63.9 and ¶63.12 fit a real rider. | Accept them. | Both |
| What went wrong with Ichabod's seat as he fled? | ¶66.3 ("he had much ado to maintain his seat") literally answers it. | Accept ¶66.3, or reword to "What happened to the saddle as he fled?" | Both |
| Your Turn · Road home: "prove each danger" | The danger lines aren't accepted: ¶59.8 (André's tree), ¶61.6 (the "haunted stream"), and ¶65.2 and ¶67.7/¶67.8 (the bridge). The accepted lines mostly give locations. | Accept the danger lines. | Both |
| Your Turn · Ballad lines | The paragraph list skips ¶62, ¶65 and ¶66, the core of the ride. | Widen the list to ¶58–¶67. | Both |
| Your Turn · Replay: "The rider appears" | ¶62.4 and ¶63.9 aren't accepted. | Accept them. | Both |
| What did Ichabod notice about the stranger on the slope? | The key misses "carried before him on the pommel". | Add that key. | A only |
| Off claim: the tree was "skinny" and he rode "right past" | ¶59.6 and ¶59.7 disprove it. | Accept them. | A only |
| Off claim: the head was thrown before the bridge | ¶67.8 also corrects it. | Accept it. | A only |
| Your Turn · Debate: "That head was a pumpkin" | ¶64 (the head on the pommel) doesn't rebut a pumpkin. | Pick a line that does, or rephrase the claim. | B only |

### Sleepy Hollow · Scene 4 (The town's verdict)

| Question | Problem | Proposed fix | Found by |
|---|---|---|---|
| What careers did he take up afterward? | A span on "written for the newspapers", "justice of the Ten Pound Court" or "kept school" fails. | Add those keys. | Both |
| What does the doubter want to know? | ¶80.2 (his "doubts") fairly answers it as worded. Only the hint says "first". | Reword to "What does the doubter first demand to know?" | Both |
| Your Turn · Rebuttal: "Children still learn in his old schoolhouse" | ¶70.4 (the school was moved) refutes it. | Accept ¶70.4. | B only (and the scene 1 reviewer) |
| How does Brom react each time it's retold? | The key misses "look exceedingly knowing". | Add that key. | A only |
| One listener's reaction while others laughed | ¶75.5 ("never laugh but upon good grounds") also answers it. | Accept it. | B only |

### The Tell-Tale Heart

| Question | Problem | Proposed fix | Found by |
|---|---|---|---|
| S2 · What feature of the old man bothered him? | ¶2.10 ("Whenever it fell upon me, my blood ran cold…") also answers it. | Accept it. | Both |
| S3 · Did he stop? (shutters) | The near miss ¶9.2 ends "I kept on pushing it steadily", which is the answer. "When he got close" doesn't match the text. | Accept ¶9.2 with key "kept on pushing it steadily". Reword to "Did he stop after the old man stirred?" | Both (A reworded it) |
| S3 · How was his last visit different? | ¶8.2 (slower than a minute-hand) and ¶8.3 ("Never, before that night…") answer it. | Accept them. | Both |
| S3 · How does his mood change? | ¶8.6 ("I fairly chuckled at the idea") isn't accepted. | Accept it. | Both |
| S3 · What does the seat choice reveal? | Only "wild audacity" counts. | Add keys "enthusiasm of my confidence" and "perfect triumph". | Both |
| S3 · Where did he choose to sit? | The key misses "beneath which reposed the corpse". | Add that key. | Both |
| S3 · Why walk us through every step? | The key misses "think so no longer". | Add that key. | Both |
| S3 · Bragging rather than reporting | ¶23.1 and ¶24.3 ("I had been too wary for that") are boasts. | Accept them. | Both |
| S4 · Why might the sound be coming from inside him? | The accepted ¶33.3 ("They heard! — they suspected!") argues the opposite. Better lines aren't accepted: ¶32.7 (they "chatted pleasantly"), ¶33.1 and ¶29.6. | Remove ¶33.3. Accept ¶32.7 and ¶33.1, and consider ¶29.6. | Both |
| S4 · What pushes him to the breaking point? | ¶33.5 and ¶33.6 (the "hypocritical smiles", the "derision") are also what pushes him. | Accept them. Change the Prove it to "The sound and their smiles". | Both |
| S4 · Spot the Lie: "the officers had stopped talking" | ¶29.6 ("still they sat and still chatted") also disproves it. | Accept it. | Both |
| S1 · Spot the Lie: "knocked just after midnight" | ¶25's "As the bell sounded the hour" line also helps disprove it. | Accept both ¶25 lines. | A only |
| S1 · Someone next door noticed | The key misses "A shriek had been heard". | Add that key. | A only |
| S2 · What did he say he wanted? | The question assumes he wanted something. The answer is that he wanted nothing. | Reword to "Did he say he wanted anything from the old man?" | A only |
| S3 · How well did he cover his work? | ¶24 ("nothing to wash out") also answers it. | Accept it. | A only |
| S4 · Where did the sound come from? | ¶34.3 is tappable and answers it. | Reword the question, or accept ¶34.3. | A only |

### Trifles

| Question | Problem | Proposed fix | Found by |
|---|---|---|---|
| S1 · What does her concern for these jars suggest? | The near miss ¶58.5 ("her jars would break") shows the concern too, and its hint doesn't fit. | Accept ¶58.5. | Both |
| S1 · Why is a cage with no pet strange? | ¶205 "It's broke." isn't accepted, but "One hinge is pulled apart" is. | Accept "It's broke." | Both |
| S1 · Why hide it among sewing things? | The question asks why, but the answer ("It's the bird.") says what. | Reword to "What was hidden among the sewing things?" Keep the why for Prove it. | Both |
| S2 · Why does Mrs. Hale think Minnie is innocent? | The accepted "Well, I don't think she did" is her conclusion, not her reason. The near miss "Worrying about her fruit" is the reason. | Swap them, and reword the question to "What makes Mrs. Hale doubt Minnie did it?" | Both |
| S2 · What kept her from visiting? | ¶220 ("I've never liked this place", "a lonesome place") isn't accepted. ¶82 ("Farmers' wives have their hands full") fairly answers it as worded. | Accept ¶220. Reword to "What does she finally admit kept her away?" | Both |
| S2 · What does Mrs. Hale regret? | ¶216 ("wish I had") and ¶220 aren't accepted. The Prove it answer doesn't answer "regret". | Accept them. Change the Prove it to "Not visiting Minnie when she was lonely." | Both |
| S2 · Her opinion of him vs. his reputation | ¶229.4 ("Like a raw wind that gets to the bone") isn't accepted. | Accept it. | Both |
| S3 · What does Mrs. Peters say must happen to wrongdoers? | "The law is the law" doesn't say what must happen. The near miss points to ¶292, which can't be tapped. | Reword to "What does Mrs. Peters say about the law?" Point the near miss at ¶296.1. | Both |
| S3 · What does Mrs. Hale call the real wrong? | "That was a crime!" appears twice, and only one is accepted. The "I wish I'd come over" line isn't accepted. | Accept both "crime" lines and ¶298.4. | Both |
| S3 · Why does she repeat those words? | ¶285.2 ("Choked the life out of him") isn't accepted. | Accept it. | Both |
| S4 · What evidence does he hope for? | ¶309.3 ("If there was some definite thing") isn't accepted. | Accept it. | Both |
| S4 · Why can Mrs. Peters go unwatched? | ¶319 ("doesn't need supervising") is the decision, not the reason. | Make it a near miss. | Both |
| S4 · Spot the Lie: the attorney calls the sheriff away | The claim has two false details. ¶323.4 disproves one of them but isn't accepted. | Accept ¶323.4, or change the claim so only one detail is false. | Both |
| S2 · What did Mrs. Wright request? | ¶138 ("Asking for an apron and her little shawl") isn't accepted. | Accept it. | A only |
| S3 · What would the quiet feel like? | The key misses "still, after the bird was still". | Add that key. | B only |
| S1 · Hauling "to market" and "his son" | The text says "to town" and never says the boy is his son. | Reword to "hauling to town" and "Hale and Harry". | B only (wording note) |
