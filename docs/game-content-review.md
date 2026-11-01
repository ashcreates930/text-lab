# Game content for review: Spot the Lie and the Final Verdict

Draft content for your approval. Everything here is read from each story's `worlds/<story>/world.json` (`scenes[].lie` and `verdict`); `npm run validate:worlds` checks that every truth line appears word for word in its paragraph, matches exactly one of the clue's evidence lines, that the false claim appears in the testimony, and that no lie uses a paragraph with a content note.

How a lie plays: the character's testimony appears first and plays in their voice. The student taps the evidence line that disproves the false sentence. A miss says "Not quite. Look for a line about [topic]." After two misses the right paragraph is gently highlighted (never the exact line).

## The Legend of Sleepy Hollow

### Spot the Lie

#### Scene 1 (`empty-schoolhouse`) · Hans Van Ripper

- **Clue:** Ichabod's belongings (`ichabods-belongings`)
- **Testimony:** I looked through the schoolmaster's bundle myself. Inside were some shirts, a rusty razor, and a brand-new pitch-pipe. His books of magic went straight into the fire.
- **False claim:** Inside were some shirts, a rusty razor, and a brand-new pitch-pipe.
- **Truth line** (¶ 69): They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe.
- **Explanation:** Hans said the pitch-pipe was brand-new, but the story says it was broken.
- **Hint topic** (after a miss): "Not quite. Look for a line about what was in Ichabod's bundle."

#### Scene 2 (`van-tassel-party`) · Brom Bones

- **Clue:** Brom's tale of racing the Horseman (`broms-race-tale`)
- **Testimony:** I'm not afraid of that headless rider. One night I raced him for a bowl of punch, and my horse Daredevil was winning. Then, just as we reached the old mill, the goblin bolted and vanished in a flash of fire.
- **False claim:** Then, just as we reached the old mill, the goblin bolted and vanished in a flash of fire.
- **Truth line** (¶ 55): He affirmed that on returning one night from the neighboring village of Sing Sing, he had been overtaken by this midnight trooper; that he had offered to race with him for a bowl of punch, and should have won it too, for Daredevil beat the goblin horse all hollow, but just as they came to the church bridge, the Hessian bolted, and vanished in a flash of fire.
- **Explanation:** Brom said the goblin vanished at the old mill, but the story says it vanished at the church bridge.
- **Hint topic** (after a miss): "Not quite. Look for a line about where Brom's race ended."

#### Scene 3 (`the-road-home`) · Brom Bones

- **Clue:** Major André's tree (`andre-tree`)
- **Testimony:** Everybody knows Major André's tree is haunted. When the schoolmaster rode past it that night, a ghost dressed in white was hanging in its branches. No wonder he was shaking in his saddle.
- **False claim:** When the schoolmaster rode past it that night, a ghost dressed in white was hanging in its branches.
- **Truth line** (¶ 60): As he approached a little nearer, he thought he saw something white, hanging in the midst of the tree: he paused and ceased whistling but, on looking more narrowly, perceived that it was a place where the tree had been scathed by lightning, and the white wood laid bare.
- **Explanation:** Brom said a ghost in white hung in the tree, but the story says the white thing was bare wood where lightning had struck.
- **Hint topic** (after a miss): "Not quite. Look for a line about the white thing in the tree."

#### Scene 4 (`the-towns-verdict`) · Hans Van Ripper

- **Clue:** The old wives' ghost story (`old-wives-tale`)
- **Testimony:** The old wives still tell that ghost story by the fire every winter. The road to the church still crosses that old bridge, the same as it always has. Folks are silly to be scared of it.
- **False claim:** The road to the church still crosses that old bridge, the same as it always has.
- **Truth line** (¶ 72): The bridge became more than ever an object of superstitious awe; and that may be the reason why the road has been altered of late years, so as to approach the church by the border of the millpond.
- **Explanation:** Hans said the road still crosses the old bridge, but the story says the road was changed to go by the millpond.
- **Hint topic** (after a miss): "Not quite. Look for a line about the road to the church."

### Final Verdict

**Question:** What really happened to Ichabod Crane?

| Theory | Description |
| --- | --- |
| Brom's prank | Brom Bones dressed up as the Headless Horseman and threw a pumpkin to scare his rival out of Sleepy Hollow. |
| The Headless Horseman | The ghostly Galloping Hessian really chased Ichabod that night and carried him away. |
| He ran away | Frightened and turned down by Katrina, Ichabod left on his own and started a new life far away. |

## Trifles

### Spot the Lie

#### Scene 1 (`kitchen`) · Mr. Hale

- **Clue:** Mr. Hale's account (`mr-hales-account`)
- **Testimony:** Harry and I were driving to town that morning with a load of corn. I stopped at the Wright place to ask John about getting a party telephone. I knocked twice before I went in.
- **False claim:** Harry and I were driving to town that morning with a load of corn.
- **Truth line** (¶ 19): Harry and I had started to town with a load of potatoes.
- **Explanation:** Mr. Hale said they were carrying corn, but the story says it was a load of potatoes.
- **Hint topic** (after a miss): "Not quite. Look for a line about what Mr. Hale was taking to town."

#### Scene 2 (`minnie-foster`) · Mrs. Peters

- **Clue:** The apron and the little shawl (`apron-and-shawl`)
- **Testimony:** Mrs. Wright asked me to bring her an apron and her little shawl. She said the apron was in the bottom drawer of the cupboard. I found the shawl hanging behind the door.
- **False claim:** She said the apron was in the bottom drawer of the cupboard.
- **Truth line** (¶ 127): She said they was in the top drawer in this cupboard.
- **Explanation:** Mrs. Peters said the apron was in the bottom drawer, but the story says it was in the top drawer.
- **Hint topic** (after a miss): "Not quite. Look for a line about where the apron was kept."

#### Scene 3 (`the-law-and-the-women`) · Mrs. Peters

- **Clue:** Two kinds of crime (`two-kinds-of-crime`)
- **Testimony:** Mrs. Hale knew Minnie Foster long ago, before she married. She told me Minnie used to wear a red dress with yellow ribbons. Back then, Minnie sang in the choir.
- **False claim:** She told me Minnie used to wear a red dress with yellow ribbons.
- **Truth line** (¶ 298): I wish you’d seen Minnie Foster when she wore a white dress with blue ribbons and stood up there in the choir and sang.
- **Explanation:** Mrs. Peters said Minnie wore a red dress with yellow ribbons, but the story says it was a white dress with blue ribbons.
- **Hint topic** (after a miss): "Not quite. Look for a line about what Minnie Foster wore in the choir."

#### Scene 4 (`the-last-word`) · Mr. Hale

- **Clue:** The bundle for the jail (`married-to-the-law`)
- **Testimony:** The county attorney laughed at the apron the women picked out for Mrs. Wright. He joked that a sheriff's wife is married to the law. Then he called the sheriff into the other room to look at the back door.
- **False claim:** Then he called the sheriff into the other room to look at the back door.
- **Truth line** (¶ 323): We ought to take a look at these windows.
- **Explanation:** Mr. Hale said they went to look at the back door, but the story says they went to look at the windows.
- **Hint topic** (after a miss): "Not quite. Look for a line about what the men went to look at."

### Final Verdict

**Question:** Should Mrs. Hale and Mrs. Peters have hidden the evidence?

| Theory | Description |
| --- | --- |
| Yes, it was fair | They understood how lonely and mistreated Minnie was, and hiding the bird kept her story from being used against her. |
| No, the law comes first | Hiding evidence was wrong; the truth should go to court so the law can decide fairly. |
| They stood by Minnie | The men laughed at the women and ignored what they noticed, so the women chose to stand by Minnie instead. |

## The Tell-Tale Heart

### Spot the Lie

#### Scene 1 (`arrival`) · Officer

- **Clue:** Street door and four o’clock (`arrival-door-time`)
- **Testimony:** A neighbor heard a shriek in the night, so we were sent to search the house. We knocked at the street door just after midnight. The man who let us in was calm and polite.
- **False claim:** We knocked at the street door just after midnight.
- **Truth line** (¶ 25): When I had made an end of these labors, it was four o'clock — still dark as midnight.
- **Explanation:** The officer said they knocked just after midnight, but the story says it was four o'clock.
- **Hint topic** (after a miss): "Not quite. Look for a line about what time the officers arrived."

#### Scene 2 (`search`) · The Narrator

- **Clue:** Treasures, secure and undisturbed (`search-treasures`)
- **Testimony:** I welcomed the officers with a smile. I told them the old man was away visiting the city. Then I showed them his treasures, safe and untouched.
- **False claim:** I told them the old man was away visiting the city.
- **Truth line** (¶ 27): The old man, I mentioned, was absent in the country.
- **Explanation:** The narrator said he told the officers the old man was in the city, but the story says he told them the old man was away in the country.
- **Hint topic** (after a miss): "Not quite. Look for a line about where the narrator said the old man was."

#### Scene 3 (`room`) · The Narrator

- **Clue:** Closed shutters (`room-shutters`)
- **Testimony:** Every night I opened his door a little at a time. His shutters were wide open, so moonlight filled the room. Still, he never once saw me.
- **False claim:** His shutters were wide open, so moonlight filled the room.
- **Truth line** (¶ 9): His room was as black as pitch with the thick darkness, (for the shutters were close fastened, through fear of robbers,) and so I knew that he could not see the opening of the door, and I kept on pushing it steadily, steadily.
- **Explanation:** The narrator said the shutters were open, but the story says they were fastened shut and the room was pitch black.
- **Hint topic** (after a miss): "Not quite. Look for a line about the old man's shutters."

#### Scene 4 (`confession`) · The Narrator

- **Clue:** The officers’ calm (`confession-officers-calm`)
- **Testimony:** A low, dull sound grew louder and louder in my ears. By then the officers had stopped talking and were sitting in silence. I could not bear it any longer.
- **False claim:** By then the officers had stopped talking and were sitting in silence.
- **Truth line** (¶ 32): And still the men chatted pleasantly, and smiled.
- **Explanation:** The narrator said the officers had stopped talking, but the story says they kept chatting and smiling.
- **Hint topic** (after a miss): "Not quite. Look for a line about what the officers were doing."

### Final Verdict

**Question:** Why did the narrator confess?

| Theory | Description |
| --- | --- |
| Guilt | His guilty conscience made him hear the beating heart until he could not keep the secret any longer. |
| His nerves tricked him | His overexcited nerves made him imagine the sound, and panic, not guilt, made him shout. |
| He thought they knew | He believed the officers heard the sound and were mocking him, so he confessed to end their game. |

## Notes for review

- Every false claim is a concrete detail (an object, a place, a time, an action) that one line of the story disproves.
- No lie uses a paragraph with a content note (Sleepy Hollow ¶34, ¶47 and ¶48), and none is about a death, violence or another sensitive subject. The Trifles lies stay with potatoes, a drawer, a dress and the windows; the Tell-Tale Heart lies stay with the time, a place, the shutters and the officers' chatting.
- Some story lines in Trifles are split oddly at stage directions and at "Mrs."; each truth line here is chosen so the line the student taps reads cleanly.
- The judge scores every verdict with one rubric (a claim that matches the theory, evidence that supports it, reasoning that connects them) and never says a theory is wrong.

## Live class mode (squads on phones)

Fixed lines students and the class see. Nothing here is generated; the testimony in live Spot the Lie is the reviewed scene testimony above, or a classmate's lie the teacher approved.

| Where | Text |
| --- | --- |
| Join (guests) | Pick your detective name. Tap one to join. No real names here. |
| Lobby | You're in. Your teacher is putting everyone into squads. Eyes on the board. The round starts soon. |
| Roles | Lead Investigator: Submit your squad's answer once everyone has done their part. · Evidence Keeper: Pin the line from the story. · Skeptic: Approve the answer, or object so your squad fixes it. · Reporter: Write the one-sentence explanation. |
| Squad purpose | Spot the Lie: Catch the false claim with one line from the story. · Verdict Vote: Defend your theory with three pieces of evidence. · Objection!: Counter the other squad's evidence with a better line from the text. |
| Objection! vote | Sustained or overruled? Did (squad)'s line beat (squad)'s evidence? |
| Objection! result | Your counter beat their evidence · Their evidence held · Their counter beat your evidence · Your evidence held |
| Hidden writing | Hidden for the teacher to review. |
| Scoreboard | Points come from evidence and reasoning. Speed is only a small bonus on correct answers. |

## Plant a Lie

| Where | Text |
| --- | --- |
| Scene, after proving a clue (class students) | Plant a lie about this clue for your class |
| Plant a lie screen | Write one false sentence a character might say about this clue. Then tap the line from the story that proves it false. A good lie is catchable: one line disproves it. |
| Checks | Write a full sentence, at least 5 words. · Write just one sentence. · Pick a character who speaks in this scene. · Tap the line from the story that proves it false. · Pick a line from a different paragraph. That one has a content note. · That line appears more than once in this clue. Pick a different one. · Change the sentence so it says something false. |
| Sent | Sent to your teacher. If your teacher approves it, it goes into your class's Lie bank. Your squad earns points when a classmate catches it with the right line and a good explanation. |
| Live round, writer's squad | Your squad planted this lie. Watch the board. Your squad earns points for every squad that catches it with the right line and a sound explanation. |
| Reveal (planted lie) | A classmate wrote this lie. The line from the story shows what really happened. |

- A planted lie is one sentence by a speaking character in the clue's scene (never a non-speaking character), disproved by exactly one evidence line, never from a paragraph with a content note. Every planted lie is screened; a flagged one is shown to the teacher only.
- The writer's squad sits out its own lie and earns 25 points for each other squad that catches it with the right line and a sound explanation; nothing when it stumps everyone.

## Hologram mode

| Where | Text |
| --- | --- |
| Clue screen | Hologram (opens the character on this clue with their latest line, or their testimony) |
| Hologram screen | Turn brightness all the way up and dim the room. · Size · Center gap · Play in 3 seconds · Mirror |
| Hologram errors | There's nothing for them to say yet. · The voice isn't available right now. |
| Witness stand phone | (character) takes the stand · Set this phone flat under the hologram pyramid. Turn brightness all the way up and dim the room. · Start the Witness stand · Waiting for a testimony · The witness appears when your teacher starts Spot the Lie. |
| Host screen | Witness stand · Play on the Witness stand · Play on the board instead · Scan with the phone that goes under the hologram pyramid, then tap Start on it. The testimony will play there. |

- Hologram figures are generated once per speaking character (`npm run generate-assets -- --holograms`), from the same descriptions and period notes as the portraits. The Tell-Tale Heart narrator stays a faceless silhouette. Non-speaking characters have no hologram.

## Students in the story

Each story gives the student a part to play (`student_role` in the world file) and a personal frame on every choice point (`choice_point.role_frame`). Teachers can turn roles and angles off per class.

### The Legend of Sleepy Hollow

| Field | Text |
| --- | --- |
| Role | The newest student in Ichabod's class |
| Setup (sent to characters) | You are the newest student in Ichabod Crane's schoolhouse, and you saw something near the bridge the night he vanished. |
| Starts in | `empty-schoolhouse` |
| Intro card | You are the newest student in Ichabod Crane's one-room schoolhouse. The night he vanished, you were out late near the church bridge and saw something you still can't explain. This morning his seat is empty, and the whole valley has a theory. What you saw is only a start. The story is your proof. |
| Never plays | Ichabod Crane, Katrina Van Tassel, Baltus Van Tassel, Headless Horseman |
| Choice frame, `empty-schoolhouse` | This morning you found his desk empty. Last night you saw something near the bridge. Which do you check first? |
| Choice frame, `van-tassel-party` | Everyone at the party heard the ghost stories, and so did you. You know which road Ichabod took home. |
| Choice frame, `the-road-home` | This is the bridge where you saw something that night. Now you can test it against what the town found. |

### Trifles

| Field | Text |
| --- | --- |
| Role | The young deputy watching the kitchen |
| Setup (sent to characters) | You are the sheriff's young deputy, told to keep watch in the Wright kitchen while the men search. |
| Starts in | `kitchen` |
| Intro card | You are the sheriff's youngest deputy. This cold morning your job is to keep watch in the Wright farmhouse kitchen while the sheriff and the county attorney search upstairs and in the barn. The men call the kitchen things trifles. You get to watch what Mrs. Hale and Mrs. Peters notice, and decide what counts as evidence. |
| Never plays | Minnie Wright, John Wright, Mrs. Hale, Mrs. Peters, Mr. Hale, Sheriff, County Attorney |
| Choice frame, `kitchen` | From your post by the door, you watched the women find the first clues. Which question would you follow? |
| Choice frame, `minnie-foster` | The women seem to forget you are in the room. Their talk is turning serious. |
| Choice frame, `the-law-and-the-women` | You can hear the men on the stairs. You are the officer in the kitchen. What do you watch? |

### The Tell-Tale Heart

| Field | Text |
| --- | --- |
| Role | The neighbor who heard the shriek |
| Setup (sent to characters) | You live next door, and the shriek you heard in the night is why the police came. |
| Starts in | `arrival` |
| Intro card | You live next door to the old man's house. In the dead of night you heard a shriek, and the police were sent for. Now the officers are inside, and the man who let them in says the shriek was his own, in a dream. You know what you heard. Find out whether his story holds up. |
| Never plays | old man, narrator |
| Choice frame, `arrival` | You are the one who heard the shriek. The man at the door is smiling. Where do you start? |
| Choice frame, `search` | He is showing everyone around as if he has nothing to hide. You heard that shriek. What do you question? |
| Choice frame, `room` | You know what you heard that night. How do you test what he says? |

### What's your angle?

| Question | Choices |
| --- | --- |
| What fires you up? | Unfairness · Being underestimated · Loyalty · Winning · Money |
| What's your lane? | Sports · Music · Gaming · Fashion · Social media |
| How do you play? | Solo detective · Squad · Rival |

- Screen text: What's your angle? · Three quick taps, so the characters know how to talk to you. Only these three answers are shared. · Skip · Step into the story · Your part in (story) · You are (part).
- What characters are told (lib/student-role.ts): the role's name and one-line setup, with the rule that the part adds no new events and every fact must come from the source passages; and the three choices, with permission for at most one short, plain comparison and never to change story facts. No free text from the student is ever sent.
- Teacher setting (class page): Roles and angles · Student roles: Each student plays a part in the story, and characters speak to them in it. · What's your angle?: Three quick choices that help characters make a point clearer. Only those choices reach the AI.

## Story Mode: The Legend of Sleepy Hollow, scene 1 (`empty-schoolhouse`)

Authored in `worlds/sleepy-hollow/world.json` (`scenes[0].story_mode`), checked by `validate:worlds`. Nothing here is generated by AI.

| Part | Text |
| --- | --- |
| Intro | It is the morning after. You walk into the schoolhouse, and Ichabod's seat is empty. Listen closely and keep the lines that matter. |
| Round 1 focus question | Tap 3 lines that show Ichabod's belongings were left behind. |
| Round 1 answers (100 points each; any other evidence line scores 0 with the note "True to the story, but it doesn't answer the question.") | “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.” / “Hans Van Ripper as executor of his estate, examined the bundle which contained all his worldly effects.” / “They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe.” / “As to the books and furniture of the schoolhouse, they belonged to the community, excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling; in which last was a sheet of foolscap much scribbled and blotted in several fruitless attempts to make a copy of verses in honor of the heiress of Van Tassel.” |
| Round 1 prompt | Listen, then tap the lines that answer the question. Your Evidence pouch holds 3. |
| Round 1 reading | Paragraphs p068, p069, p070, narrated one at a time |
| Round 2 speaker | Brom Bones (`brom-bones`) |
| Round 2 confrontation | You're the new one in the schoolmaster's class, and I hear you were out near the bridge the night he vanished. The whole valley is telling tales this morning. So what do you say happened to him? |
| Action: Point out the hat and the shattered pumpkin by the brook | Reaction: Brom bursts into a hearty laugh at the word pumpkin, then changes the subject. Trust -1. Backed by: “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.” |
| Action: Say his horse came home without its saddle | Reaction: Brom shrugs. "Old Gunpowder always finds his way home. The rider is another matter." Trust +1. Backed by: “The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate.” or “Hans Van Ripper now began to feel some uneasiness about the fate of poor Ichabod, and his saddle.” |
| Action: Say the town thinks the Galloping Hessian carried him off | Reaction: Brom grins and nods slowly. "Now you sound like a true son of Sleepy Hollow." Trust +2. Backed by: “The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian.” |
| Round 3 | The scene's Spot the Lie testimony (Hans Van Ripper), above |
| Round 4 question | Ichabod is gone. What do you think happened to him? |
| Theory: Brom's prank | Someone played a trick on Ichabod to scare him out of Sleepy Hollow. Supported by: “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.” / “The brook was searched, but the body of the schoolmaster was not to be discovered.” |
| Theory: The Headless Horseman | The ghostly Galloping Hessian really chased Ichabod and carried him away. Supported by: “The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian.” / “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.” / “Knots of gazers and gossips were collected in the churchyard, at the bridge, and at the spot where the hat and pumpkin had been found.” |
| Theory: He ran away | Ichabod left on his own and started a new life somewhere else. Supported by: “Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance.” / “The brook was searched, but the body of the schoolmaster was not to be discovered.” / “The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate.” |

### Story Mode screens (all scenes that have Story Mode)

| Where | Text |
| --- | --- |
| Ready card, round 1 | Read and notice · Your question: (the focus question) · Listen to the story and tap the lines that answer the question. Your Evidence pouch holds 3, so choose carefully. |
| Round 1 screen | Read and notice · Your question: (the focus question, above the passage) · (the round 1 prompt) |
| Jump to round 3 (home page "Catch the lie") | You're starting at round N. Play the whole scene any time with "Play this scene again" at the end. |
| Ready card, round 2 | Something happens to you: Someone confronts you. Pick what you do, then back it up with one line from your pouch or the passage. |
| Ready card, round 3 | Catch the lie: A witness gives testimony. One thing is false. Tap the line that proves it, then say why in one sentence. |
| Ready card, round 4 | Make your call: Answer the big question. Pick a theory and pin 2 lines from your pouch that support it. |
| Ready card | Relaxed timer (2x time) · Start round N · Your teacher gave you extra time. · No timer for you: take the time you need. · Teachers: open the Case file view instead. |
| Power-ups | Lantern · 2: Highlights the paragraph that holds a correct line. · Second look · 1: Replays the last part of the reading. · Double down · 3: Doubles the next round's points if your proof is valid. Lose your speed bonus if it isn't. · Ready for this round. · Not used in this round. |
| Timer | Time · Paused · Ns left · Time! You can still add proof for half points · No timer. Take the time you need. Screen readers hear "30 seconds left", "10 seconds left" and "5 seconds left" only. |
| Pouch | Evidence pouch · N of 3 · Empty. Tap a line in the story to keep it. · Your pouch is full. Take a line out to swap it. · You can only pin lines you kept in your pouch in round 1. |
| Round 2 | What do you do? · Back it up with one line · Or pick a line from the passage · (your Lantern is lit) · Back it up · Go without proof |
| Round 3 | One thing is false. Tap the line in the story that proves it. · Lie caught. Now say why in one sentence. · Why does this line prove it false? · I'm stuck, move on · Hints use the existing Spot the Lie wording. |
| Round 4 | Your theory · Make my call |
| Results | Proof N · Speed +N · Streak xN · Doubled · +N coins · Streak: N rounds in a row with proof · Streak reset. Back your next answer with a line from the story. · Trust with (character): up N / down N / no change · Your proof · Next round · See your scene results |
| Results, round 1 | True to the story, but it doesn't answer the question. · Your pouch · +100: answers the question · 0 points: true to the story, but it doesn't answer the question |
| Round results lines | N of N lines answer the question · Your proof backs your move · That line doesn't back this move · No proof from the story · Not the line that disproves it · Right line, sound explanation · Right line · Both lines support your theory · N valid lines pinned · No theory chosen · half points after time |
| Leaderboard | Leaderboard · top 5 · Squad leaderboard · top 5 · (you) · You're #N with N · up N spots |
| Class pulse | Class pulse (class) · Today's players (demo) · Round 1: Answered the question / Not yet · Strongest proof: (a line from the story). Percentages only; no student names or writing. |
| Scene cleared | Scene cleared · points · Best streak · Rank · Coins left · Your Evidence pouch · No lines kept this time. · Play this scene again · On to the next scene |
| Teacher | Story Mode (switch) · Story Mode leaderboard: Individual / Squads / Off · Squads come from your most recent live round. · Story Mode time: Standard / 1.5x / 2x / Untimed · Mark absent / Absent today (tap to undo) |
| Not set up | If Story Mode's tables aren't available, scenes open in the Case file view for everyone, with no error screen. The reason is logged on the server only. |
| Left out on purpose | Scene 1's "where do you begin?" choice is not part of Story Mode. There are no power-ups in live Story Mode. |

### Story Mode, live (teacher-hosted)

| Where | Text |
| --- | --- |
| Host picker | Story Mode: Everyone plays the scene at once: four timed rounds on the board, controls on their phones, and a leaderboard between rounds. · Rank squads instead of players |
| Host round | Round N of 4 · (round name) · Ns / Time! · Confronts the class / Testimony · (speaker) · N of N answered on their phones. · Show the leaderboard · Start round N: (name) · Finish Story Mode · Play on the Witness stand · Witness stand code · Scan with the phone under the hologram pyramid. The speaker in rounds 2 and 3 appears there. |
| Host board | Leaderboard · Top 5 · N players / Squads · N squads · No answers yet. · Story Mode: final leaderboard |
| Host round 1 | (the focus question, above the projected passage) |
| Mark absent (host) | Mark absent · N absent · Squads score their members' average. Silent members count as 0; students marked absent are left out. · (name): absent |
| Purpose line | Play the scene together: read, answer, catch the lie and make your call. |
| Phone | Story Mode · Round N of 4 · (name) · N seconds left · (round 1: the focus question) · Lock in N lines · Your pouch is full. Tap a kept line to take it out. · What do you do? · Back it up with one line · Or pick a line from the passage · Back it up · Go without proof · Tap the line that proves it false · Lie caught. Now say why in one sentence. · Why does it prove it false? · Submit / I'm stuck, move on · Pin 2 lines from your pouch · Make my call · Locked in. · Eyes on the board. Your points show at the leaderboard. · No answer this round · (round 1 note) True to the story, but it doesn't answer the question. · N points · you're #N of N / your squad is #N of N · up N · Eyes on the board for the top 5. · Story Mode complete |
| Errors | That isn't this round. · You've already answered this round. · Time's up for this round. · This story has no Story Mode yet. |

## The clue screen: The Legend of Sleepy Hollow

Authored in `worlds/sleepy-hollow/world.json` and checked by `validate:worlds` (lib/clue-game.ts). Lines are copied exactly from the story, and a tappable line never ends mid-sentence (a title such as "Mrs." keeps its name, and a lowercase continuation stays with its sentence); Irving's "--" shows as a dash on screen only. Characters deliver an off claim in their own voice on one of their first three answers about a clue (picked per student); answers are cut at three sentences; students catch it with "Something's off" and the line that corrects it.

### Off claims (one per clue)

| Scene | Clue | Who | Off claim | Lines that correct it (any one counts) |
| --- | --- | --- | --- | --- |
| 1 | The empty schoolhouse | Brom Bones | That schoolhouse was a fine big place, with plenty of rooms for all his scholars. | ¶11 “His schoolhouse was a low building of one large room, rudely constructed of logs; the windows partly glazed, and partly patched with leaves of old copybooks.” |
| 1 | Ichabod's belongings | Hans Van Ripper | He left every coin of his quarter's pay behind in that bundle. | ¶69 “Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance.” |
| 1 | Ichabod's own books and the unfinished poem | Hans Van Ripper | I kept his books on the schoolhouse shelf. Waste not, want not. | ¶69 “These magic books and the poetic scrawl were forthwith consigned to the flames by Hans Van Ripper; who, from that time forward, determined to send his children no more to school, observing that he never knew any good come of this same reading and writing.” |
| 1 | The searchers' report | Brom Bones | They found his saddle hanging neatly on the bridge rail. | ¶68 “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.” |
| 2 | The Van Tassel feast | Brom Bones | The schoolmaster ate like a bird at the party and hardly touched a thing. | ¶44 “Happily, Ichabod Crane was not in so great a hurry as his historian, but did ample justice to every dainty.” |
| 2 | Brom Bones, the brooding rival | Brom Bones | I never played a single trick on that schoolmaster. Not my style. | ¶33 “There was something extremely provoking in this obstinately pacific system; it left Brom no alternative but to draw upon the funds of rustic waggery in his disposition, and to play off boorish practical jokes upon his rival.” or ¶33 “They harried his hitherto peaceful domains; smoked out his singing school by stopping up the chimney; broke into the schoolhouse at night, in spite of its formidable fastenings of withe and window stakes, and turned everything topsy-turvy, so that the poor schoolmaster began to think all the witches in the country held their meetings there.” |
| 2 | Brom's tale of racing the Horseman | Brom Bones | The schoolmaster laughed my story off. It didn't scare him one bit. | ¶56 “All these tales, told in that drowsy undertone with which men talk in the dark, the countenances of the listeners only now and then receiving a casual gleam from the glare of a pipe, sank deep in the mind of Ichabod.” |
| 2 | Ichabod's private talk with Katrina | Brom Bones | He came out of Katrina's house grinning, sure he had won her. | ¶57 “Something, however, I fear me, must have gone wrong, for he certainly sallied forth, after no very great interval, with an air quite desolate and chapfallen.” |
| 3 | Major André's tree | Brom Bones | That old tree is a skinny thing. You'd ride right past it without noticing. | ¶59 “In the centre of the road stood an enormous tulip-tree, which towered like a giant above all the other trees of the neighborhood, and formed a kind of landmark.” |
| 3 | The shadowy rider | Brom Bones | That rider chatted with him the whole way, friendly as a neighbor. | ¶64 “There was something in the moody and dogged silence of this pertinacious companion that was mysterious and appalling.” |
| 3 | Hans Van Ripper's saddle | Hans Van Ripper | He lost my everyday saddle, the old worn one. Small matter. | ¶66 “For a moment the terror of Hans Van Ripper’s wrath passed across his mind,—for it was his Sunday saddle; but this was no time for petty fears; the goblin was hard on his haunches; and (unskilful rider that he was!) he had much ado to maintain his seat; sometimes slipping on one side, sometimes on another, and sometimes jolted on the high ridge of his horse’s backbone, with a violence that he verily feared would cleave him asunder.” |
| 3 | The head hurled at the bridge | Brom Bones | The rider threw that head at him before he ever reached the bridge. | ¶67 “Another convulsive kick in the ribs, and old Gunpowder sprang upon the bridge; he thundered over the resounding planks; he gained the opposite side; and now Ichabod cast a look behind to see if his pursuer should vanish, according to rule, in a flash of fire and brimstone.” or ¶67 “Just then he saw the goblin rising in his stirrups, and in the very act of hurling his head at him.” |
| 4 | The report from New York | Hans Van Ripper | Nobody ever heard one word about him again. Not one. | ¶71 “It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court.” |
| 4 | Brom's laugh at the pumpkin | Brom Bones | I never laugh about that pumpkin business. It's no joke to me. | ¶71 “Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell.” |
| 4 | The old wives' ghost story | Hans Van Ripper | They fixed up the old schoolhouse, and children still learn there today. | ¶72 “The schoolhouse being deserted soon fell to decay, and was reported to be haunted by the ghost of the unfortunate pedagogue and the plowboy, loitering homeward of a still summer evening, has often fancied his voice at a distance, chanting a melancholy psalm tune among the tranquil solitudes of Sleepy Hollow.” |
| 4 | The storyteller's doubt | Hans Van Ripper | I hear the man who told this tale swore every word of it was true. | ¶81 ““Faith, sir,” replied the story-teller, “as to that matter, I don’t believe one-half of it myself.”” |

### Character cards (traits unlock as the student reaches each paragraph)

| Character | Role | Trait | Line from the story |
| --- | --- | --- | --- |
| Hans Van Ripper | A practical farmer and Ichabod’s former host. | Ichabod's landlord, in charge of his things | ¶69 “Hans Van Ripper as executor of his estate, examined the bundle which contained all his worldly effects.” |
| Hans Van Ripper | A practical farmer and Ichabod’s former host. | Worries about his saddle | ¶68 “Hans Van Ripper now began to feel some uneasiness about the fate of poor Ichabod, and his saddle.” |
| Hans Van Ripper | A practical farmer and Ichabod’s former host. | Has no use for books | ¶69 “These magic books and the poetic scrawl were forthwith consigned to the flames by Hans Van Ripper; who, from that time forward, determined to send his children no more to school, observing that he never knew any good come of this same reading and writing.” |
| Brom Bones | Abraham Van Brunt, known as Brom Bones: the boldest rider around Sleepy Hollow, Ichabod's rival for Katrina Van Tassel, and later her husband. | Part of the town's ghost stories | ¶70 “The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian.” |
| Brom Bones | Abraham Van Brunt, known as Brom Bones: the boldest rider around Sleepy Hollow, Ichabod's rival for Katrina Van Tassel, and later her husband. | Famous for his strength | ¶28 “Among these, the most formidable was a burly, roaring, roystering blade, of the name of Abraham, or, according to the Dutch abbreviation, Brom Van Brunt, the hero of the country round, which rang with his feats of strength and hardihood.” |
| Brom Bones | Abraham Van Brunt, known as Brom Bones: the boldest rider around Sleepy Hollow, Ichabod's rival for Katrina Van Tassel, and later her husband. | Blamed for every prank | ¶28 “The neighbors looked upon him with a mixture of awe, admiration, and good-will; and, when any madcap prank or rustic brawl occurred in the vicinity, always shook their heads, and warranted Brom Bones was at the bottom of it.” |

### Computer players (demo rival and squad modes, always labeled)

| Part | Name |
| --- | --- |
| Computer rival (lantern emblem) | The Lantern Ghost |
| Computer teammates | Lantern Scout, Hollow Scout |

### How characters answer (all stories)

Characters answer in their own voice with an opinion, memory or claim in two or three short sentences, never a summary of the passage, and end by sending the student to the text ("Read what the book says about the windows, then tell me I'm wrong."). Plain standard English, no dialect. Only the off claim above may go beyond the passages.

### Clue screen wording (all stories)

| Where | Text |
| --- | --- |
| Task line | Tap the line that proves or disproves (character), then Prove it. · One thing (character) said is false. Tap the line that proves it, then Prove it. · Proven. Now explain what it shows. |
| Right line | That's the proof. +N points, +N coins. Streak N! · Lie caught. You proved (character) wrong. |
| Wrong line | Not that one. This clue is about (clue). Look again in ¶N. · Not quite. Look for a line about (topic). Look again in ¶N. (after two misses) |
| Something's off | Something's off · Tap the line that shows what (character) got wrong, then Check. · You caught (character)'s mistake. +N points, +N coins. · Saved for your teacher to look at. No points either way. |
| Mark-up | Mark this line · Clue · Word to know · Question · Keep in my pouch / Take out of my pouch · Done |
| Character card | What the story shows · One more trait unlocks later in the story. · Hologram · Ask (name) |
| Pouch | Evidence pouch · N of 3 |

### Mode screens (all stories)

| Where | Text |
| --- | --- |
| Solo mission | Solo · (role badge) · Mission: (goal) · Coins · Streak · correct proofs in a row · (first name)'s trust · Wary / Friendly · Next stop · Go to scene N |
| Rival face-off | Face-off · Same claim, same passage. The right line wins the point; speed only breaks a tie. A wrong tap locks you out for 3 seconds. · You · VS · (rival) · Computer rival · I'm ready · 3, 2, 1 · Points come from the right line, never from speed alone. |
| Rival race | Race: tap the line that proves (character) wrong. · (rival) (computer rival) is reading… · (rival) tapped a wrong line and is locked out. · Locked out: Ns · You win the point! · (rival) found it first. Keep going: find the line yourself to prove the clue. |
| Squad huddle | Your squad · Each of you reads a different part. Pins light up on everyone's screen. · Squad progress · Ready / Answering / Absent · Computer teammate · Your job: (job). (instructions) · Read your part |
| Squad jobs | Reader: Pin the key line from your part of the passage. · Fact-checker: Test the character's claim against the pinned lines. React with "This proves…" or "I disagree because…". · Connector: Link a pinned line to an earlier clue with a "This connects to…" reaction. |
| Reactions | This proves… · I disagree because… · This connects to… · finish the sentence (80 characters) · Add my reaction · That reaction is saved for your teacher to see. Try different words for your squad. |
| Squad vote | Vote: best proof · Ties go to the line with the most reactions, then the Fact-checker's vote. · N votes · leading · Lock in the squad's pick · Vote before you lock in |
| Teacher Evidence | Marked lines and flagged answers · Caught the mistake / Needs your review · Pinned "…" · Reacted: (stem) (ending) · Voted for "…" |

## Freeze (rival and squad-vs-squad play)

Rules (lib/freeze.ts): earned only by reading (one for every 3 right proofs in a row, never bought, hold one); one per player per round; not the same opponent twice in a row; a frozen player or squad is shielded for the rest of the round; never against teammates; the frozen side's timer pauses. Demo and class rival play: always on, and the computer rival never freezes anyone. Live class: squads only, host toggle, off by default. Solo play: none. Every freeze is logged in the Evidence view (who, whom, when).

| Where | Text |
| --- | --- |
| Host (Story Mode picker) | ❄ Freezes · Off by default. A student earns one with 3 right proofs in a row. It holds another squad's lock-in for 5 seconds; reading and pins keep working. Never teammates. Every freeze is logged in Evidence. |
| Phone, holding one | ❄ You have a Freeze · Hold another squad's lock-in for 5 seconds. Use it once this round. · ❄ Freeze · One Freeze per round. · Shielded this round. · Not twice in a row. · Never your own team. |
| Phone, frozen | Lock-in held: N seconds · (squad) froze your squad's lock-in. Pins, reactions and votes still work, and your timer is paused. · ❄ Lock in (in N seconds) · 🛡 Your squad is shielded for the rest of this round · Screen reader: "… froze your squad's lock-in for N seconds. Keep reading; your timer is paused." then "Your squad can lock in again." |
| Rival race | ❄ Three right proofs in a row: you earned a Freeze. Use it in your next face-off. · ❄ Freeze (rival) · ❄ (rival) is frozen: Ns · You froze (rival) for 5 seconds. It can't tap; you can. · ❄ Freeze ready · (reason) |
| Face-off | ❄ You have a Freeze: pause (rival)'s taps for 5 seconds once this face-off. |
| Evidence | ❄ Freezes this round · (student) (squad) froze (squad) · Story Mode round N · time · ❄ Freezes used · (student) froze (rival) · (clue) · time |

## Your Turn: The Legend of Sleepy Hollow

After the game, the student picks one of the two activities that match their "What's your angle?" answers (what fires them up, then their lane, then how they play; a student who skipped gets the cold case file). In live class the teacher starts it for everyone from the host screen. Characters may answer in their own voice, but anything scored is an authored line below. Every activity ends with 2 or 3 sentences citing at least one exact line, screened like character questions, and saved to the Evidence view.

### Call out what's unfair (unfairness, talk, 6 minutes)

Brom Bones thinks he played fair with Ichabod. Answer each claim with a line from the story.

| Brom Bones says | Lines that answer it |
| --- | --- |
| A few jokes on the schoolmaster? Harmless fun. Name one that wasn't. | ¶33 “They harried his hitherto peaceful domains; smoked out his singing school by stopping up the chimney; broke into the schoolhouse at night, in spite of its formidable fastenings of withe and window stakes, and turned everything topsy-turvy, so that the poor schoolmaster began to think all the witches in the country held their meetings there.” or ¶33 “But what was still more annoying, Brom took all opportunities of turning him into ridicule in presence of his mistress, and had a scoundrel dog whom he taught to whine in the most ludicrous manner, and introduced as a rival of Ichabod’s, to instruct her in psalmody.” |
| He could have stood up to me man to man. He chose not to, so whatever happened is on him. | ¶33 “Brom, who had a degree of rough chivalry in his nature, would fain have carried matters to open warfare and have settled their pretensions to the lady, according to the mode of those most concise and simple reasoners, the knights-errant of yore,—by single combat; but Ichabod was too conscious of the superior might of his adversary to enter the lists against him; he had overheard a boast of Bones, that he would “double the schoolmaster up, and lay him on a shelf of his own schoolhouse;” and he was too wary to give him an opportunity.” |
| Nobody in the valley ever pointed a finger at me for anything. | ¶28 “The neighbors looked upon him with a mixture of awe, admiration, and good-will; and, when any madcap prank or rustic brawl occurred in the vicinity, always shook their heads, and warranted Brom Bones was at the bottom of it.” |
| Katrina chose me fair and square. There was nothing hidden about it. | ¶71 “Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell.” |

Writing prompt: Was Brom fair to Ichabod? Write 2 or 3 sentences and cite at least one line.

### Prove them wrong about Ichabod (underestimated, talk, 6 minutes)

Brom says the schoolmaster was good for nothing. Show him what the story says Ichabod could do.

| Brom Bones says | Lines that answer it |
| --- | --- |
| He couldn't even earn his keep. A schoolmaster's pay feeds nobody. | ¶14 “He assisted the farmers occasionally in the lighter labors of their farms, helped to make hay, mended the fences, took the horses to water, drove the cows from pasture, and cut wood for the winter fire.” or ¶15 “In addition to his other vocations, he was the singing-master of the neighborhood, and picked up many bright shillings by instructing the young folks in psalmody.” |
| Nobody in the valley thought much of him. | ¶16 “Our man of letters, therefore, was peculiarly happy in the smiles of all the country damsels.” or ¶16 “The schoolmaster is generally a man of some importance in the female circle of a rural neighborhood; being considered a kind of idle, gentlemanlike personage, of vastly superior taste and accomplishments to the rough country swains, and, indeed, inferior in learning only to the parson.” |
| I bet he was cruel to those children. | ¶12 “I would not have it imagined, however, that he was one of those cruel potentates of the school who joy in the smart of their subjects; on the contrary, he administered justice with discrimination rather than severity; taking the burden off the backs of the weak, and laying it on those of the strong.” |
| He never did one thing worth remembering. | ¶71 “It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court.” |

Writing prompt: Was Ichabod underestimated? Write 2 or 3 sentences and cite at least one line.

### Was anyone loyal to Ichabod? (loyalty, talk, 6 minutes)

Talk it over with Hans Van Ripper: was anyone in the valley loyal to Ichabod? Answer each of his claims with a line.

| Hans Van Ripper says | Lines that answer it |
| --- | --- |
| I gave him a roof and looked after his things when he was gone. That's loyalty enough. | ¶69 “These magic books and the poetic scrawl were forthwith consigned to the flames by Hans Van Ripper; who, from that time forward, determined to send his children no more to school, observing that he never knew any good come of this same reading and writing.” |
| The whole town kept looking for him for months. | ¶70 “As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead.” |
| At least his old horse never let him down. | ¶68 “The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate.” |
| And Katrina stood by him to the very end. | ¶57 “Something, however, I fear me, must have gone wrong, for he certainly sallied forth, after no very great interval, with an air quite desolate and chapfallen.” or ¶71 “Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell.” |

Writing prompt: Was anyone loyal to Ichabod? Write 2 or 3 sentences and cite at least one line.

### Win the debate (winning, debate, 7 minutes)

Pick your side. A character argues the other one. Win each round with a line that holds up.

Student's side: The Headless Horseman. Hans Van Ripper argues against it.

| Claim | Lines that answer it |
| --- | --- |
| A ghost? Nonsense. Ghosts don't trample saddles in the dirt. | ¶64 “On mounting a rising ground, which brought the figure of his fellow-traveller in relief against the sky, gigantic in height, and muffled in a cloak, Ichabod was horror-struck on perceiving that he was headless!—but his horror was still more increased on observing that the head, which should have rested on his shoulders, was carried before him on the pommel of his saddle!” or ¶67 “Just then he saw the goblin rising in his stirrups, and in the very act of hurling his head at him.” |
| That so-called head was a pumpkin, found smashed by the brook. | ¶64 “On mounting a rising ground, which brought the figure of his fellow-traveller in relief against the sky, gigantic in height, and muffled in a cloak, Ichabod was horror-struck on perceiving that he was headless!—but his horror was still more increased on observing that the head, which should have rested on his shoulders, was carried before him on the pommel of his saddle!” |
| A farmer from New York says he's alive and well. | ¶72 “The old country wives, however, who are the best judges of these matters, maintain to this day that Ichabod was spirited away by supernatural means; and it is a favorite story often told about the neighborhood round the winter evening fire.” |
| Nobody sensible believes in that goblin anymore. | ¶72 “The bridge became more than ever an object of superstitious awe; and that may be the reason why the road has been altered of late years, so as to approach the church by the border of the millpond.” or ¶70 “The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian.” |

Student's side: He ran away. Brom Bones argues against it.

| Claim | Lines that answer it |
| --- | --- |
| The whole valley agreed at church: the Galloping Hessian carried him off. | ¶71 “It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court.” |
| A man who runs away takes his things. His bundle stayed right here. | ¶69 “Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance.” |
| Nobody living could hurl a head like that rider did. | ¶68 “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.” |
| If he were alive, somebody would have seen him. | ¶71 “It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court.” |

Student's side: Brom's prank. Brom Bones argues against it.

| Claim | Lines that answer it |
| --- | --- |
| Me, play a trick? Folks know I'm an honest fellow. | ¶28 “The neighbors looked upon him with a mixture of awe, admiration, and good-will; and, when any madcap prank or rustic brawl occurred in the vicinity, always shook their heads, and warranted Brom Bones was at the bottom of it.” |
| That was a real head he saw, not some vegetable. | ¶68 “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.” |
| I don't know a thing about that night. | ¶71 “Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell.” |
| I never had any reason to scare him off. | ¶33 “There was something extremely provoking in this obstinately pacific system; it left Brom no alternative but to draw upon the funds of rustic waggery in his disposition, and to play off boorish practical jokes upon his rival.” or ¶71 “Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell.” |

Writing prompt: Who won the debate, and why? Write 2 or 3 sentences and cite at least one line.

### Advise Ichabod about the farm (money, pick, 6 minutes)

Ichabod dreams of the Van Tassel farm. Pick 3 cards for your advice, with at least one thing he wants and one thing it costs him, and back each with a line.

| Piece | Lines that back it |
| --- | --- |
| Sell the farm for cash and wild land (What he wants) | ¶25 “As the enraptured Ichabod fancied all this, and as he rolled his great green eyes over the fat meadow lands, the rich fields of wheat, of rye, of buckwheat, and Indian corn, and the orchards burdened with ruddy fruit, which surrounded the warm tenement of Van Tassel, his heart yearned after the damsel who was to inherit these domains, and his imagination expanded with the idea, how they might be readily turned into cash, and the money invested in immense tracts of wild land, and shingle palaces in the wilderness.” |
| Move west with Katrina and the children (What he wants) | ¶25 “Nay, his busy fancy already realized his hopes, and presented to him the blooming Katrina, with a whole family of children, mounted on the top of a wagon loaded with household trumpery, with pots and kettles dangling beneath; and he beheld himself bestriding a pacing mare, with a colt at her heels, setting out for Kentucky, Tennessee,—or the Lord knows where!” |
| Eat like a king all winter (What he wants) | ¶24 “The pedagogue’s mouth watered as he looked upon this sumptuous promise of luxurious winter fare.” or ¶24 “In his devouring mind’s eye, he pictured to himself every roasting-pig running about with a pudding in his belly, and an apple in his mouth; the pigeons were snugly put to bed in a comfortable pie, and tucked in with a coverlet of crust; the geese were swimming in their own gravy; and the ducks pairing cosily in dishes, like snug married couples, with a decent competency of onion sauce.” |
| Win the heiress, win the farm (What he wants) | ¶27 “From the moment Ichabod laid his eyes upon these regions of delight, the peace of his mind was at an end, and his only study was how to gain the affections of the peerless daughter of Van Tassel.” |
| Turn his back on the schoolhouse (What it costs him) | ¶45 “Then, he thought, how soon he’d turn his back upon the old schoolhouse; snap his fingers in the face of Hans Van Ripper, and every other niggardly patron, and kick any itinerant pedagogue out of doors that should dare to call him comrade!” |
| Take on a powerful rival (What it costs him) | ¶28 “Among these, the most formidable was a burly, roaring, roystering blade, of the name of Abraham, or, according to the Dutch abbreviation, Brom Van Brunt, the hero of the country round, which rang with his feats of strength and hardihood.” |
| Win over a country coquette (What it costs him) | ¶27 “Ichabod, on the contrary, had to win his way to the heart of a country coquette, beset with a labyrinth of whims and caprices, which were forever presenting new difficulties and impediments; and he had to encounter a host of fearful adversaries of real flesh and blood, the numerous rustic admirers, who beset every portal to her heart, keeping a watchful and angry eye upon each other, but ready to fly out in the common cause against any new competitor.” |
| Farm the land himself for years (What he wants) | Decoy: the story doesn't support it |
| Katrina already promised to marry him (What it costs him) | Decoy: the story doesn't support it |

Writing prompt: What is your advice to Ichabod? Write 2 or 3 sentences and cite at least one line.

### Instant replay: the chase (sports, order, 6 minutes)

Call the chase play by play. Tap the moments in the order they happen, then back each one with a line.

| Piece (in order) | Lines that back it |
| --- | --- |
| The rider appears by the bridge | ¶62 “In the dark shadow of the grove, on the margin of the brook, he beheld something huge, misshapen and towering.” or ¶63 “He appeared to be a horseman of large dimensions, and mounted on a black horse of powerful frame.” |
| The saddle slips away | ¶66 “As yet the panic of the steed had given his unskilful rider an apparent advantage in the chase, but just as he had got half way through the hollow, the girths of the saddle gave way, and he felt it slipping from under him.” or ¶66 “He seized it by the pommel, and endeavored to hold it firm, but in vain; and had just time to save himself by clasping old Gunpowder round the neck, when the saddle fell to the earth, and he heard it trampled under foot by his pursuer.” |
| Gunpowder crosses the church bridge | ¶67 “Another convulsive kick in the ribs, and old Gunpowder sprang upon the bridge; he thundered over the resounding planks; he gained the opposite side; and now Ichabod cast a look behind to see if his pursuer should vanish, according to rule, in a flash of fire and brimstone.” |
| The head is hurled | ¶67 “Just then he saw the goblin rising in his stirrups, and in the very act of hurling his head at him.” or ¶67 “It encountered his cranium with a tremendous crash,—he was tumbled headlong into the dust, and Gunpowder, the black steed, and the goblin rider, passed by like a whirlwind.” |

Writing prompt: Call the play that mattered most. Write 2 or 3 sentences and cite at least one line.

### Liner notes for a ballad (music, lines, 5 minutes)

You're writing a ballad about Ichabod's ride home. Pick the 3 lines from the story your song needs most.

Any 3 lines from ¶58, ¶59, ¶60, ¶63, ¶64, ¶67.

Writing prompt: Liner notes: why do these lines belong in your song? Write 2 or 3 sentences and cite at least one line.

### Design the road-home level (gaming, pick, 6 minutes)

Build the level for Ichabod's ride home. Pick 3 checkpoints that are really in the story, and prove each danger with a line.

| Piece | Lines that back it |
| --- | --- |
| Major André's tree | ¶59 “In the centre of the road stood an enormous tulip-tree, which towered like a giant above all the other trees of the neighborhood, and formed a kind of landmark.” or ¶59 “It was connected with the tragical story of the unfortunate André, who had been taken prisoner hard by; and was universally known by the name of Major André’s tree.” |
| The bridge at Wiley's Swamp | ¶61 “About two hundred yards from the tree, a small brook crossed the road, and ran into a marshy and thickly-wooded glen, known by the name of Wiley’s Swamp.” or ¶61 “To pass this bridge was the severest trial.” |
| The sandy hollow where the saddle fell | ¶65 “This road leads through a sandy hollow shaded by trees for about a quarter of a mile, where it crosses the bridge famous in goblin story; and just beyond swells the green knoll on which stands the whitewashed church.” or ¶66 “As yet the panic of the steed had given his unskilful rider an apparent advantage in the chase, but just as he had got half way through the hollow, the girths of the saddle gave way, and he felt it slipping from under him.” |
| The church bridge | ¶67 ““If I can but reach that bridge,” thought Ichabod, “I am safe.”” |
| The old mill | Decoy: the story doesn't support it |
| A haunted cave | Decoy: the story doesn't support it |

Writing prompt: Which checkpoint is the boss level, and why? Write 2 or 3 sentences and cite at least one line.

### Style Ichabod for the party (fashion, pick, 6 minutes)

Style Ichabod for the Van Tassel party from this closet. Pick 3 pieces and back each with a line that describes him. The story decides, not you.

| Piece | Lines that back it |
| --- | --- |
| 🧥 Rusty black suit | ¶36 “The gallant Ichabod now spent at least an extra half hour at his toilet, brushing and furbishing up his best, and indeed only suit of rusty black, and arranging his locks by a bit of broken looking-glass that hung up in the schoolhouse.” |
| 👔 Sleeves that are too short | ¶10 “He was tall, but exceedingly lank, with narrow shoulders, long arms and legs, hands that dangled a mile out of his sleeves, feet that might have served for shovels, and his whole frame most loosely hung together.” |
| 🎩 Small wool hat | ¶37 “A small wool hat rested on the top of his nose, for so his scanty strip of forehead might be called, and the skirts of his black coat fluttered out almost to the horses tail.” |
| 🪞 A broken looking-glass | ¶36 “The gallant Ichabod now spent at least an extra half hour at his toilet, brushing and furbishing up his best, and indeed only suit of rusty black, and arranging his locks by a bit of broken looking-glass that hung up in the schoolhouse.” |
| 🐴 A borrowed plow-horse | ¶36 “The animal he bestrode was a broken-down plow-horse, that had outlived almost everything but its viciousness.” or ¶36 “That he might make his appearance before his mistress in the true style of a cavalier, he borrowed a horse from the farmer with whom he was domiciliated, a choleric old Dutchman of the name of Hans Van Ripper, and, thus gallantly mounted, issued forth like a knight-errant in quest of adventures.” |
| 🎀 A fancy silk bow | Decoy: the story doesn't support it |
| 👢 Shiny new boots | Decoy: the story doesn't support it |

Writing prompt: Describe your look for Ichabod. Write 2 or 3 sentences and cite at least one line.

### Fact-check the feed (social-media, factcheck, 5 minutes)

Three villagers posted about the missing schoolmaster. One post is false. Find it and prove it with a line.

| Post | |
| --- | --- |
| @HollowNews: Schoolmaster missing! His hat and a smashed pumpkin were found by the brook. | True |
| @VanRipperFarm: Went through his bundle: two shirts and a half, a rusty razor, a broken pitch-pipe. | True |
| @ValleyGossip: They pulled the schoolmaster's body out of the brook this morning. | False. Disproved by ¶69 “The brook was searched, but the body of the schoolmaster was not to be discovered.” |

Writing prompt: Write your own post about what happened. 2 or 3 sentences, and cite at least one line.

### Cold case file (solo, exhibits, 5 minutes)

Close the case on paper. Pick your 3 strongest exhibits: lines from the story you proved.

3 lines the student proved (or from ¶68, ¶69, ¶70, ¶71).

Writing prompt: Sum up the case. Write 2 or 3 sentences and cite at least one line.

### Squad report (squad, exhibits, 5 minutes)

Write your squad's report. Pick 3 lines your squad would put in front of the town.

3 lines the student proved (or from ¶68, ¶69, ¶70, ¶71).

Writing prompt: Your squad's report to the town. Write 2 or 3 sentences and cite at least one line.

### Rebuttal (rival, talk, 5 minutes)

The Lantern Ghost has a theory, and it's wrong. Knock down each claim with a line.

| The Lantern Ghost (computer rival) says | Lines that answer it |
| --- | --- |
| Ichabod drowned in the brook. Case closed. | ¶69 “The brook was searched, but the body of the schoolmaster was not to be discovered.” |
| He left his money behind, so he never meant to leave. | ¶69 “Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance.” |
| Nobody ever heard from him again. | ¶71 “It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court.” |
| Children still learn in his old schoolhouse. | ¶72 “The schoolhouse being deserted soon fell to decay, and was reported to be haunted by the ghost of the unfortunate pedagogue and the plowboy, loitering homeward of a still summer evening, has often fancied his voice at a distance, chanting a melancholy psalm tune among the tranquil solitudes of Sleepy Hollow.” |

Writing prompt: Sum up why the Lantern Ghost was wrong. Write 2 or 3 sentences and cite at least one line.

| Screen | Text |
| --- | --- |
| Case closed card | 5 to 7 minutes · Your Turn · One more trip into the story, picked from your answers to "What's your angle?": (activity) or (activity). · Start Your Turn / Do another |
| Picker | Your Turn · 5 to 7 minutes · Pick your activity · Chosen from your answers to "What's your angle?". Both send you back into the story. · Not now |
| Answers | That holds up. · True to the story, maybe, but it doesn't answer that. Look again in ¶N. · The story doesn't support this one. · Not yet. What happens before that? · Move on · Answer with this line |
| Writing | Write it up · Lines you cite · Tap a line in the story below to cite it. · Your 2 or 3 sentences · Write 2 or 3 sentences. · Cite at least one line from the story: tap it in the passage. · Save for my teacher · Saved for your teacher |
| Host | Your Turn · A 5 to 7 minute activity on every phone, picked from each student's angle answers. Every one ends with 2 or 3 sentences citing the story, saved to Evidence. · Start Your Turn for everyone · Your Turn is on. N of N saved so far. |

## Fair play: The Legend of Sleepy Hollow

Students score only by reading. Generated from `worlds/sleepy-hollow/world.json` by
`node --experimental-strip-types scripts/fair-play-review.ts sleepy-hollow`, so it always matches what students get.
`validate:worlds` checks every line and phrase against `source.md`, near misses (on the passage, with a hint that names
a paragraph), 4 Prove it choices, 3 or 4 questions per bank, and that no question shares a key word (by word root) with
its answers. The searchers' report question keeps "found" and "bank" as reviewed exceptions.

- Ladder: each clue's bank has two locate questions and one infer question. Story Mode, scene 1: round 1 locate,
  round 2 infer (Brom asks), round 3 catch the lie, round 4 build the case.
- Scoring: full points on the first try, half on the second, none after; 25 off per wrong line (never below 0 for the
  round). A miss is an amber "Not yet" (try 2 names the paragraph, try 3 the part of it). After three misses the
  answer is shown and the proof step still comes, for 0 points ("shown answer" in the Evidence view).
- Long lines (over 25 words) need their exact words marked, with 2 words of tolerance at each edge. Prove it: one of
  4 authored choices (shuffled on screen), or "This proves ___ because ___", saved for the teacher and never scored.
- No Prove it choice relies on anything from a later scene. Points come from evidence: no speed bonus, and a rival
  win earns a coin only. Speed flags (a tap within 4 seconds, more than 4 swaps) go to the teacher only.
- Word cards: discrimination (good judgment), executor, consigned and forthwith, wherever they appear.
- Writing: the Notice, Interpret and Craft questions are one task per scene (the clue named below).

### Missions: how the verdict works (for teachers and reviewers; not shown to students)

- Order: pick a theory, pin at least 2 lines (pieces, or any lines from the story when fewer than 2 pieces were found), write 2 or 3 sentences, then the payoff is revealed.
- The verdict is checked like Your Turn: sentence count, cited lines, the safety screen. It is never graded or AI-scored.
- After the reveal, for each cited line the student taps "Points the same way" or "Points somewhere else". The taps are saved to the Evidence view and never scored.
- Citing the payoff line before the reveal shows "You found it before the reveal" and is logged in the Evidence view.

#### Mission: Find Ichabod

Prove what really happened to Ichabod Crane.

- Sealed clue: `new-york-report`; payoff: “It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court.”
- Theories: He left the valley alive, He drowned in the brook, The Horseman carried him off
- Piece `pay` (empty-schoolhouse): “Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance.” · Lead: Find the line that suggests his wages went wherever he went.
- Piece `no-body` (empty-schoolhouse): “The brook was searched, but the body of the schoolmaster was not to be discovered.” · Lead: Find the line that tells what the hunt in the water turned up.
- Piece `chapfallen` (van-tassel-party): “Something, however, I fear me, must have gone wrong, for he certainly sallied forth, after no very great interval, with an air quite desolate and chapfallen.” · Lead: Find the line that shows how he looked as he walked out after his talk with Katrina.
- Piece `hans-wrath` (the-road-home): “For a moment the terror of Hans Van Ripper’s wrath passed across his mind,--for it was his Sunday saddle; but this was no time for petty fears; the goblin was hard on his haunches; and (unskilful rider that he was!) he had much ado to maintain his seat; sometimes slipping on one side, sometimes on another, and sometimes jolted on the high ridge of his horse’s backbone, with a violence that he verily feared would cleave him asunder.” · Lead: Find the line that shows whose anger he dreaded during the ride.
- Piece `tumbled` (the-road-home): “It encountered his cranium with a tremendous crash,--he was tumbled headlong into the dust, and Gunpowder, the black steed, and the goblin rider, passed by like a whirlwind.” · Lead: Find the line that shows what happened to him on the far side of the crossing.

#### Mission: Unmask the Horseman

Prove whether the rider was a ghost or a person.

- Sealed clue: `broms-knowing-look`; payoff: “Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell.”
- Theories: A real ghost, Brom Bones in disguise, Some other rider
- Piece `pumpkin` (empty-schoolhouse): “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.” · Lead: Find the line that names the odd object next to what he left by the stream.
- Piece `jokes` (van-tassel-party): “There was something extremely provoking in this obstinately pacific system; it left Brom no alternative but to draw upon the funds of rustic waggery in his disposition, and to play off boorish practical jokes upon his rival.” · Lead: Find the line that shows how Brom fought back without a real fight.
- Piece `brag` (van-tassel-party): “He affirmed that on returning one night from the neighboring village of Sing Sing, he had been overtaken by this midnight trooper; that he had offered to race with him for a bowl of punch, and should have won it too, for Daredevil beat the goblin horse all hollow, but just as they came to the church bridge, the Hessian bolted, and vanished in a flash of fire.” · Lead: Find the line where Brom boasts about where his ghostly rival disappeared.
- Piece `big-rider` (the-road-home): “He appeared to be a horseman of large dimensions, and mounted on a black horse of powerful frame.” · Lead: Find the line that describes how big the stranger and the animal under him were.
- Piece `thrown` (the-road-home): “Just then he saw the goblin rising in his stirrups, and in the very act of hurling his head at him.” · Lead: Find the line where the pursuer throws something at Ichabod.

#### Mission: Clear the schoolhouse

Prove why the valley believes the schoolhouse is haunted.

- Sealed clue: `old-wives-tale`; payoff: “The schoolhouse being deserted soon fell to decay, and was reported to be haunted by the ghost of the unfortunate pedagogue and the plowboy, loitering homeward of a still summer evening, has often fancied his voice at a distance, chanting a melancholy psalm tune among the tranquil solitudes of Sleepy Hollow.”
- Theories: A real ghost haunts it, Old stories and fear, Pranks made it seem haunted
- Piece `town-decides` (empty-schoolhouse): “The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian.” · Lead: Find the line that shows how the townspeople explained his disappearance.
- Piece `moved` (empty-schoolhouse): “As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead.” · Lead: Find the line that tells where the lessons moved after he was gone.
- Piece `witches` (van-tassel-party): “They harried his hitherto peaceful domains; smoked out his singing school by stopping up the chimney; broke into the schoolhouse at night, in spite of its formidable fastenings of withe and window stakes, and turned everything topsy-turvy, so that the poor schoolmaster began to think all the witches in the country held their meetings there.” · Lead: Find the line that shows what the pranksters did to the building after dark.
- Piece `haunt` (van-tassel-party): “Such was one of the favorite haunts of the Headless Horseman, and the place where he was most frequently encountered.” · Lead: Find the line that names the spot the Horseman liked best.
- Piece `superstition` (the-road-home): “The common people regarded it with a mixture of respect and superstition, partly out of sympathy for the fate of its ill-starred namesake, and partly from the tales of strange sights, and doleful lamentations, told concerning it.” · Lead: Find the line that shows how ordinary folks felt about the old landmark.
- Piece `half` (the-towns-verdict): ““Faith, sir,” replied the story-teller, “as to that matter, I don’t believe one-half of it myself.”” · Lead: Find the line where the man who spun the yarn admits his own doubts.

### Scene 1 (`empty-schoolhouse`)

Scene writing (Notice, Interpret, Craft): the questions from **The searchers' report**.

#### Clue: The empty schoolhouse

**Locate. How was Ichabod's classroom put together?**

Answers:

> ¶11: “His schoolhouse was a low building of one large room, rudely constructed of logs; the windows partly glazed, and partly patched with leaves of old copybooks.”
>
> Proof phrase: *rudely constructed of logs; the windows partly glazed, and partly patched with leaves of old copybooks*

Near misses:

> ¶11: “The schoolhouse stood in a rather lonely but pleasant situation, just at the foot of a woody hill, with a brook running close by, and a formidable birch-tree growing at one end of it.”
>
> Hint: That tells where it stood, not what it was made of. Check ¶11.

Prove it (✓ is right; shuffled on screen):

1. The school was poor and roughly put together. ✓
2. The school was the finest building in the valley.
3. Ichabod built the school himself.
4. Children broke the windows playing ball.

**Locate. Why would a burglar have trouble once inside the room?**

Answers:

> ¶11: “It was most ingeniously secured at vacant hours, by a withe twisted in the handle of the door, and stakes set against the window shutters; so that though a thief might get in with perfect ease, he would find some embarrassment in getting out,—an idea most probably borrowed by the architect, Yost Van Houten, from the mystery of an eelpot.”
>
> Proof phrase: *though a thief might get in with perfect ease, he would find some embarrassment in getting out*

Near misses:

> ¶11: “His schoolhouse was a low building of one large room, rudely constructed of logs; the windows partly glazed, and partly patched with leaves of old copybooks.”
>
> Hint: That is how it was put together. How was it shut at night? Check ¶11.

Prove it (✓ is right; shuffled on screen):

1. A burglar could get in easily but would struggle to escape. ✓
2. The school had strong iron locks.
3. Nobody could ever get inside.
4. Ichabod slept at the school to guard it.

**Infer. What kind of teacher was Ichabod with children who misbehaved?**

Answers:

> ¶11: “Truth to say, he was a conscientious man, and ever bore in mind the golden maxim, “Spare the rod and spoil the child.””

> ¶12: “I would not have it imagined, however, that he was one of those cruel potentates of the school who joy in the smart of their subjects; on the contrary, he administered justice with discrimination rather than severity; taking the burden off the backs of the weak, and laying it on those of the strong.”
>
> Proof phrase: *he administered justice with discrimination rather than severity*

Near misses:

> ¶11: “From hence the low murmur of his pupils’ voices, conning over their lessons, might be heard in a drowsy summer’s day, like the hum of a beehive; interrupted now and then by the authoritative voice of the master, in the tone of menace or command, or, peradventure, by the appalling sound of the birch, as he urged some tardy loiterer along the flowery path of knowledge.”
>
> Hint: That is the sound of the classroom. How does the narrator judge his punishments? Check ¶12.

Prove it (✓ is right; shuffled on screen):

1. He was strict but tried to be fair, going easier on the weak. ✓
2. He never punished anyone.
3. He was cruel and enjoyed it.
4. Parents made him stop punishing.

#### Clue: Ichabod's belongings

**Locate. Apart from reading material, what did Ichabod own? Name what he wore.**

Answers:

> ¶69: “They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe.”
>
> Proof phrase: *two shirts and a half; two stocks for the neck; a pair or two of worsted stockings*

Near misses:

> ¶69: “As to the books and furniture of the schoolhouse, they belonged to the community, excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling; in which last was a sheet of foolscap much scribbled and blotted in several fruitless attempts to make a copy of verses in honor of the heiress of Van Tassel.”
>
> Hint: Those are his books. What else did he own? Check ¶69.

> ¶69: “Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance.”
>
> Hint: Money isn't on the list of his things. Check ¶69.

Prove it (✓ is right; shuffled on screen):

1. Ichabod owned very little and lived plainly. ✓
2. Ichabod was secretly rich.
3. Hans Van Ripper took his clothes.
4. Ichabod packed his things to run away.

**Locate. What role did Hans take on after the schoolmaster vanished?**

Answers:

> ¶69: “Hans Van Ripper as executor of his estate, examined the bundle which contained all his worldly effects.”

Near misses:

> ¶68: “Hans Van Ripper now began to feel some uneasiness about the fate of poor Ichabod, and his saddle.”
>
> Hint: Hans worries there, but what job does he take on? Check ¶69.

Prove it (✓ is right; shuffled on screen):

1. Hans was put in charge of what Ichabod left. ✓
2. Hans was Ichabod's brother.
3. Hans was the town judge.
4. Hans was looking for his saddle in the bundle.

**Infer. Was Ichabod carrying cash when he vanished? Find the line that suggests it.**

Answers:

> ¶69: “Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance.”
>
> Proof phrase: *he must have had about his person at the time of his disappearance*

Near misses:

> ¶69: “They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe.”
>
> Hint: That list has no money in it. Where does the narrator talk about his pay? Check ¶69.

Prove it (✓ is right; shuffled on screen):

1. His pay wasn't left behind, so he likely had it with him. ✓
2. He left all his money in the bundle.
3. He had no money at all.
4. Hans took his money.

#### Clue: Ichabod's own books and the unfinished poem

**Locate. Which titles were Ichabod's personal property rather than the town's?**

Answers:

> ¶69: “As to the books and furniture of the schoolhouse, they belonged to the community, excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling; in which last was a sheet of foolscap much scribbled and blotted in several fruitless attempts to make a copy of verses in honor of the heiress of Van Tassel.”
>
> Proof phrase: *excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling*

Near misses:

> ¶69: “They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe.”
>
> Hint: That music book is on his list, but which books does the narrator single out from the school's? Check ¶69.

Prove it (✓ is right; shuffled on screen):

1. He owned books about witchcraft and fortune-telling, so he believed in the supernatural. ✓
2. The books all belonged to the school.
3. Ichabod hated ghost stories.
4. Ichabod wrote the almanac himself.

**Locate. What became of his spellbooks and verses?**

Answers:

> ¶69: “These magic books and the poetic scrawl were forthwith consigned to the flames by Hans Van Ripper; who, from that time forward, determined to send his children no more to school, observing that he never knew any good come of this same reading and writing.”
>
> Proof phrase: *These magic books and the poetic scrawl were forthwith consigned to the flames*

Near misses:

> ¶69: “As to the books and furniture of the schoolhouse, they belonged to the community, excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling; in which last was a sheet of foolscap much scribbled and blotted in several fruitless attempts to make a copy of verses in honor of the heiress of Van Tassel.”
>
> Hint: That names the books. What did Hans do with them? Check ¶69.

Prove it (✓ is right; shuffled on screen):

1. Hans burned them because he thought reading did no good. ✓
2. Hans kept them on the school shelf.
3. Hans gave them to Katrina.
4. Ichabod took them with him.

**Infer. Who was the unfinished poem for?**

Answers:

> ¶69: “As to the books and furniture of the schoolhouse, they belonged to the community, excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling; in which last was a sheet of foolscap much scribbled and blotted in several fruitless attempts to make a copy of verses in honor of the heiress of Van Tassel.”
>
> Proof phrase: *in honor of the heiress of Van Tassel*

Near misses:

> ¶70: “As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead.”
>
> Hint: That says he never married. Who was he writing for? Check ¶69.

Prove it (✓ is right; shuffled on screen):

1. He was trying to win the Van Tassel heiress, which could give someone a reason to want him gone. ✓
2. The poem was for his mother.
3. Katrina wrote the poem.
4. The poem was about the Horseman.

#### Clue: The searchers' report

**Locate. What was found on the stream bank, past where the hoofprints led?**

Answers:

> ¶68: “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.”
>
> Proof phrase: *was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin*

Near misses:

> ¶70: “Knots of gazers and gossips were collected in the churchyard, at the bridge, and at the spot where the hat and pumpkin had been found.”
>
> Hint: That's people gathering later. Where were these first found? Check ¶68.

Prove it (✓ is right; shuffled on screen):

1. A smashed pumpkin lay beside his hat, which could point to a trick. ✓
2. His body was found.
3. The Horseman's head was found.
4. Nothing at all was found.

**Locate. How did folks in the valley explain where he went?**

Answers:

> ¶70: “The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian.”
>
> Proof phrase: *Ichabod had been carried off by the Galloping Hessian*

Near misses:

> ¶70: “Knots of gazers and gossips were collected in the churchyard, at the bridge, and at the spot where the hat and pumpkin had been found.”
>
> Hint: They gathered and gossiped. What did they decide? Check ¶70.

Prove it (✓ is right; shuffled on screen):

1. The town believed a ghost took him, based on old stories. ✓
2. The town proved a ghost took him.
3. The town blamed Brom.
4. The town thought he ran away.

**Infer. Why did people give up on him so quickly?**

Answers:

> ¶70: “As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead.”
>
> Proof phrase: *As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him*

Near misses:

> ¶69: “The brook was searched, but the body of the schoolmaster was not to be discovered.”
>
> Hint: That's the search itself. Why did people stop caring? Check ¶70.

Prove it (✓ is right; shuffled on screen):

1. He had no wife or debts, so no one had a reason to keep looking. ✓
2. They found him alive.
3. The town was afraid of the bridge.
4. Hans forbade a search.

#### Story Mode, round 1: locate (3 lines each)

**Tap 3 lines that show what Ichabod owned that was left behind.**

Answers:

> ¶68: “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.”

> ¶69: “Hans Van Ripper as executor of his estate, examined the bundle which contained all his worldly effects.”

> ¶69: “They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe.”

> ¶69: “As to the books and furniture of the schoolhouse, they belonged to the community, excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling; in which last was a sheet of foolscap much scribbled and blotted in several fruitless attempts to make a copy of verses in honor of the heiress of Van Tassel.”

Near misses:

> ¶68: “The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate.”
>
> Hint: Whose saddle was it? Check ¶66.

> ¶68: “Hans Van Ripper now began to feel some uneasiness about the fate of poor Ichabod, and his saddle.”
>
> Hint: Whose saddle was it? Check ¶66.

**Tap 3 lines that show how people realized he was gone.**

Answers:

> ¶68: “The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate.”

> ¶68: “Ichabod did not make his appearance at breakfast; dinner-hour came, but no Ichabod.”

> ¶68: “The boys assembled at the schoolhouse, and strolled idly about the banks of the brook; but no schoolmaster.”

> ¶68: “Hans Van Ripper now began to feel some uneasiness about the fate of poor Ichabod, and his saddle.”

Near misses:

> ¶70: “The mysterious event caused much speculation at the church on the following Sunday.”
>
> Hint: That's the Sunday after. What happened that first day? Check ¶68.

**Tap 3 lines that show the trail people followed to find him.**

Answers:

> ¶68: “An inquiry was set on foot, and after diligent investigation they came upon his traces.”

> ¶68: “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.”

> ¶69: “The brook was searched, but the body of the schoolmaster was not to be discovered.”

Near misses:

> ¶70: “Knots of gazers and gossips were collected in the churchyard, at the bridge, and at the spot where the hat and pumpkin had been found.”
>
> Hint: That's the crowd days later. Where did the search go? Check ¶68.

#### Story Mode, round 2: infer (Brom Bones asks; tap one line, then Prove it)

Right: Brom raises an eyebrow. "Huh. You read closer than most folks around here."

Wrong: Brom snorts. "That's not what the story says. Read it again."

**"Ghost or man, I wonder." What detail by the stream hints a person was there?**

Answer:

> ¶68: “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.”
>
> Proof phrase: *close beside it a shattered pumpkin*

Near misses:

> ¶70: “The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian.”
>
> Hint: That's what the town believed. What object was left behind? Check ¶68.

Prove it (✓ is right; shuffled on screen):

1. A smashed pumpkin beside his hat is an odd thing for a ghost to leave. ✓
2. Pumpkins are signs of ghosts.
3. Ichabod was carrying a pumpkin for dinner.
4. The pumpkin proves the Horseman is real.

**"Maybe he just packed up and left." Which line hints he might have gone on his own?**

Answer:

> ¶69: “Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance.”
>
> Proof phrase: *he must have had about his person at the time of his disappearance*

Near misses:

> ¶68: “The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate.”
>
> Hint: The horse came home, but what about his pay? Check ¶69.

Prove it (✓ is right; shuffled on screen):

1. His pay wasn't found, so he may have taken it and gone. ✓
2. He left all his money behind.
3. He had nothing to take.
4. Hans paid him to leave.

**"I wonder if the town looked hard at the facts." Which line shows how they reached a verdict?**

Answer:

> ¶70: “The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian.”
>
> Proof phrase: *compared them with the symptoms of the present case, they shook their heads*

Near misses:

> ¶70: “The mysterious event caused much speculation at the church on the following Sunday.”
>
> Hint: That's the talk starting. How did they decide? Check ¶70.

Prove it (✓ is right; shuffled on screen):

1. They matched the case to old tales instead of weighing evidence. ✓
2. They found the Horseman's tracks.
3. They asked Ichabod's family.
4. They waited for a judge.

#### Story Mode, round 3: catch the lie

**Hans Van Ripper**: I looked through the schoolmaster's bundle myself. Inside were some shirts, a rusty razor, and a brand-new pitch-pipe. His books of magic went straight into the fire.

- False claim: *Inside were some shirts, a rusty razor, and a brand-new pitch-pipe.*
- Disproved by: ¶0: “They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe.”

**Hans Van Ripper**: We searched high and low for the poor man. At last we pulled his body out of the brook. It was a sad day for the valley.

- False claim: *At last we pulled his body out of the brook.*
- Disproved by: ¶69: “The brook was searched, but the body of the schoolmaster was not to be discovered.”

**Brom Bones**: I heard all about the search. They found his hat by the water and a fresh-baked pie beside it. Odd thing to leave lying about.

- False claim: *They found his hat by the water and a fresh-baked pie beside it.*
- Disproved by: ¶68: “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.”

#### Story Mode, round 4: build the case (pick a theory, pin 2 lines)

**Ichabod is gone. What do you think happened to him?**

- Brom's prank: Someone played a trick on Ichabod to scare him out of Sleepy Hollow.
  > ¶68: “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.”
  > ¶69: “The brook was searched, but the body of the schoolmaster was not to be discovered.”

- The Headless Horseman: The ghostly Galloping Hessian really chased Ichabod and carried him away.
  > ¶70: “The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian.”
  > ¶68: “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.”
  > ¶70: “Knots of gazers and gossips were collected in the churchyard, at the bridge, and at the spot where the hat and pumpkin had been found.”

- He ran away: Ichabod left on his own and started a new life somewhere else.
  > ¶69: “Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance.”
  > ¶69: “The brook was searched, but the body of the schoolmaster was not to be discovered.”
  > ¶68: “The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate.”

**Did Ichabod leave Sleepy Hollow alive?**

- He left alive: His pay went with him and no body was found, so he may have left on his own.
  > ¶69: “Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance.”
  > ¶69: “The brook was searched, but the body of the schoolmaster was not to be discovered.”

- He drowned: The trail ends at deep, dark water and his horse came home without him.
  > ¶68: “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.”
  > ¶68: “The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate.”

- Something took him: The town decided the Galloping Hessian carried him off.
  > ¶70: “The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian.”
  > ¶70: “Knots of gazers and gossips were collected in the churchyard, at the bridge, and at the spot where the hat and pumpkin had been found.”

**Which clue should the town have looked at hardest?**

- The hat and pumpkin: A hat and a shattered pumpkin by the brook could mean a trick, not a ghost.
  > ¶68: “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.”
  > ¶70: “Knots of gazers and gossips were collected in the churchyard, at the bridge, and at the spot where the hat and pumpkin had been found.”

- The missing pay: His pay was never found, and no one kept looking for him.
  > ¶69: “Whatever money the schoolmaster possessed, and he had received his quarter’s pay but a day or two before, he must have had about his person at the time of his disappearance.”
  > ¶70: “As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead.”

- The empty brook: The searchers followed his trail, but the brook gave up no body.
  > ¶69: “The brook was searched, but the body of the schoolmaster was not to be discovered.”
  > ¶68: “An inquiry was set on foot, and after diligent investigation they came upon his traces.”

### Scene 2 (`van-tassel-party`)

Scene writing (Notice, Interpret, Craft): the questions from **Brom Bones, the brooding rival**.

#### Clue: The Van Tassel feast

**Locate. What does Ichabod daydream about owning as he eats?**

Answers:

> ¶45: “He could not help, too, rolling his large eyes round him as he ate, and chuckling with the possibility that he might one day be lord of all this scene of almost unimaginable luxury and splendor.”
>
> Proof phrase: *he might one day be lord of all this scene of almost unimaginable luxury and splendor*

Near misses:

> ¶44: “Happily, Ichabod Crane was not in so great a hurry as his historian, but did ample justice to every dainty.”
>
> Hint: That shows him eating. What is he dreaming of? Check ¶45.

Prove it (✓ is right; shuffled on screen):

1. He imagined owning the Van Tassel wealth. ✓
2. He wanted to become a baker.
3. He worried there wasn't enough food.
4. He planned to buy the farm with his pay.

**Locate. What would he do to his old job and his old employer if he became rich?**

Answers:

> ¶45: “Then, he thought, how soon he’d turn his back upon the old schoolhouse; snap his fingers in the face of Hans Van Ripper, and every other niggardly patron, and kick any itinerant pedagogue out of doors that should dare to call him comrade!”
>
> Proof phrase: *snap his fingers in the face of Hans Van Ripper*

Near misses:

> ¶46: “Old Baltus Van Tassel moved about among his guests with a face dilated with content and good humor, round and jolly as the harvest moon.”
>
> Hint: That's Katrina's father. What does Ichabod plan? Check ¶45.

Prove it (✓ is right; shuffled on screen):

1. He would quit teaching and look down on his former employers. ✓
2. He would give money to the school.
3. He would thank Hans for his help.
4. He would stay a teacher forever.

**Infer. Does the feast show Ichabod wants Katrina, or what her family owns?**

Answers:

> ¶44: “Not those of the bevy of buxom lasses, with their luxurious display of red and white; but the ample charms of a genuine Dutch country tea-table, in the sumptuous time of autumn.”
>
> Proof phrase: *the ample charms of a genuine Dutch country tea-table*

> ¶45: “He could not help, too, rolling his large eyes round him as he ate, and chuckling with the possibility that he might one day be lord of all this scene of almost unimaginable luxury and splendor.”
>
> Proof phrase: *lord of all this scene of almost unimaginable luxury and splendor*

Near misses:

> ¶44: “There was the doughty doughnut, the tender oly koek, and the crisp and crumbling cruller; sweet cakes and short cakes, ginger cakes and honey cakes, and the whole family of cakes.”
>
> Hint: That lists the food. What catches his eye most? Check ¶44.

Prove it (✓ is right; shuffled on screen):

1. The food and wealth draw him more than the young women do. ✓
2. He only cares about Katrina's kindness.
3. He is not hungry at all.
4. Brom set the table to tempt him.

#### Clue: Brom Bones, the brooding rival

**Locate. How did Ichabod's rival feel while the music played?**

Answers:

> ¶48: “The lady of his heart was his partner in the dance, and smiling graciously in reply to all his amorous oglings; while Brom Bones, sorely smitten with love and jealousy, sat brooding by himself in one corner.”
>
> Proof phrase: *Brom Bones, sorely smitten with love and jealousy, sat brooding by himself in one corner*

Near misses:

> ¶47: “And now the sound of the music from the common room, or hall, summoned to the dance.”
>
> Hint: That's the music starting. Where is Brom during the dance? Check ¶48.

Prove it (✓ is right; shuffled on screen):

1. Brom was jealous, watching Katrina dance with Ichabod. ✓
2. Brom was dancing happily.
3. Brom left the party early.
4. Brom was playing the fiddle.

**Locate. What pranks did Brom and his friends pull on the teacher?**

Answers:

> ¶33: “They harried his hitherto peaceful domains; smoked out his singing school by stopping up the chimney; broke into the schoolhouse at night, in spite of its formidable fastenings of withe and window stakes, and turned everything topsy-turvy, so that the poor schoolmaster began to think all the witches in the country held their meetings there.”
>
> Proof phrase: *smoked out his singing school by stopping up the chimney*

> ¶33: “But what was still more annoying, Brom took all opportunities of turning him into ridicule in presence of his mistress, and had a scoundrel dog whom he taught to whine in the most ludicrous manner, and introduced as a rival of Ichabod’s, to instruct her in psalmody.”
>
> Proof phrase: *had a scoundrel dog whom he taught to whine in the most ludicrous manner*

Near misses:

> ¶33: “Brom, who had a degree of rough chivalry in his nature, would fain have carried matters to open warfare and have settled their pretensions to the lady, according to the mode of those most concise and simple reasoners, the knights-errant of yore,—by single combat; but Ichabod was too conscious of the superior might of his adversary to enter the lists against him; he had overheard a boast of Bones, that he would “double the schoolmaster up, and lay him on a shelf of his own schoolhouse;” and he was too wary to give him an opportunity.”
>
> Hint: That's a threat, not a prank they pulled. Check ¶33.

Prove it (✓ is right; shuffled on screen):

1. Brom had a history of playing tricks on Ichabod. ✓
2. Brom never bothered Ichabod.
3. Ichabod pranked Brom first.
4. Ghosts did the pranks.

**Infer. Why didn't the two men simply have it out with their fists?**

Answers:

> ¶33: “Brom, who had a degree of rough chivalry in his nature, would fain have carried matters to open warfare and have settled their pretensions to the lady, according to the mode of those most concise and simple reasoners, the knights-errant of yore,—by single combat; but Ichabod was too conscious of the superior might of his adversary to enter the lists against him; he had overheard a boast of Bones, that he would “double the schoolmaster up, and lay him on a shelf of his own schoolhouse;” and he was too wary to give him an opportunity.”
>
> Proof phrase: *Ichabod was too conscious of the superior might of his adversary to enter the lists against him*

Near misses:

> ¶32: “Certain it is, this was not the case with the redoubtable Brom Bones; and from the moment Ichabod Crane made his advances, the interests of the former evidently declined: his horse was no longer seen tied to the palings on Sunday nights, and a deadly feud gradually arose between him and the preceptor of Sleepy Hollow.”
>
> Hint: That shows the feud began. Why was there no fight? Check ¶33.

Prove it (✓ is right; shuffled on screen):

1. Ichabod knew Brom was stronger, so Brom turned to tricks instead. ✓
2. They were good friends.
3. Brom was afraid of Ichabod.
4. The town banned fighting.

#### Clue: Brom's tale of racing the Horseman

**Locate. In Brom's own adventure, where did the rider disappear?**

Answers:

> ¶55: “He affirmed that on returning one night from the neighboring village of Sing Sing, he had been overtaken by this midnight trooper; that he had offered to race with him for a bowl of punch, and should have won it too, for Daredevil beat the goblin horse all hollow, but just as they came to the church bridge, the Hessian bolted, and vanished in a flash of fire.”
>
> Proof phrase: *just as they came to the church bridge, the Hessian bolted, and vanished in a flash of fire*

Near misses:

> ¶54: “The tale was told of old Brouwer, a most heretical disbeliever in ghosts, how he met the Horseman returning from his foray into Sleepy Hollow, and was obliged to get up behind him; how they galloped over bush and brake, over hill and swamp, until they reached the bridge; when the Horseman suddenly turned into a skeleton, threw old Brouwer into the brook, and sprang away over the tree-tops with a clap of thunder.”
>
> Hint: That's old Brouwer's tale. What did Brom claim? Check ¶55.

Prove it (✓ is right; shuffled on screen):

1. Brom bragged that the ghost vanished at the bridge. ✓
2. Brom lost the race.
3. Brom said he had never seen the Horseman.
4. The Horseman vanished at the mill.

**Locate. How did the spooky stories that night affect the schoolmaster?**

Answers:

> ¶56: “All these tales, told in that drowsy undertone with which men talk in the dark, the countenances of the listeners only now and then receiving a casual gleam from the glare of a pipe, sank deep in the mind of Ichabod.”
>
> Proof phrase: *sank deep in the mind of Ichabod*

Near misses:

> ¶56: “He repaid them in kind with large extracts from his invaluable author, Cotton Mather, and added many marvellous events that had taken place in his native State of Connecticut, and fearful sights which he had seen in his nightly walks about Sleepy Hollow.”
>
> Hint: That's what he told back. How did their stories stay with him? Check ¶56.

Prove it (✓ is right; shuffled on screen):

1. The stories stuck in his mind and stayed with him. ✓
2. He forgot them right away.
3. He laughed them off.
4. He wrote them down for his pupils.

**Infer. Why might Brom share his boast while Ichabod was in the room?**

Answers:

> ¶55: “This story was immediately matched by a thrice marvellous adventure of Brom Bones, who made light of the Galloping Hessian as an arrant jockey.”

> ¶56: “All these tales, told in that drowsy undertone with which men talk in the dark, the countenances of the listeners only now and then receiving a casual gleam from the glare of a pipe, sank deep in the mind of Ichabod.”
>
> Proof phrase: *sank deep in the mind of Ichabod*

Near misses:

> ¶54: “Such was one of the favorite haunts of the Headless Horseman, and the place where he was most frequently encountered.”
>
> Hint: That's where the Horseman is said to ride. What did Brom add? Check ¶55.

Prove it (✓ is right; shuffled on screen):

1. Brom could plant the idea of the church bridge in Ichabod's mind. ✓
2. Brom wanted to warn him kindly.
3. Brom didn't know Ichabod was there.
4. Brom was scared himself.

#### Clue: Ichabod's private talk with Katrina

**Locate. Why did Ichabod remain after the guests went home?**

Answers:

> ¶57: “Ichabod only lingered behind, according to the custom of country lovers, to have a tête-à-tête with the heiress; fully convinced that he was now on the high road to success.”
>
> Proof phrase: *to have a tête-à-tête with the heiress*

Near misses:

> ¶57: “The revel now gradually broke up.”
>
> Hint: That's when the party ends. Why does he remain? Check ¶57.

Prove it (✓ is right; shuffled on screen):

1. He hoped to win Katrina's hand. ✓
2. He was helping clean up.
3. He was too scared to ride home.
4. He was waiting for Brom.

**Locate. What was his mood when he came out of the house?**

Answers:

> ¶57: “Something, however, I fear me, must have gone wrong, for he certainly sallied forth, after no very great interval, with an air quite desolate and chapfallen.”
>
> Proof phrase: *with an air quite desolate and chapfallen*

> ¶57: “Let it suffice to say, Ichabod stole forth with the air of one who had been sacking a henroost, rather than a fair lady’s heart.”

Near misses:

> ¶57: “Ichabod only lingered behind, according to the custom of country lovers, to have a tête-à-tête with the heiress; fully convinced that he was now on the high road to success.”
>
> Hint: That's how he felt going in. How did he leave? Check ¶57.

Prove it (✓ is right; shuffled on screen):

1. Something went badly in his talk with Katrina. ✓
2. He was happy and proud.
3. He was angry at Brom.
4. He was sick from the feast.

**Infer. What does the narrator suspect Katrina was up to all along?**

Answers:

> ¶57: “Could that girl have been playing off any of her coquettish tricks?”

> ¶57: “Was her encouragement of the poor pedagogue all a mere sham to secure her conquest of his rival?”

Near misses:

> ¶57: “What passed at this interview I will not pretend to say, for in fact I do not know.”
>
> Hint: That's the narrator saying he doesn't know. What does he guess? Check ¶57.

Prove it (✓ is right; shuffled on screen):

1. Katrina may have used Ichabod to make Brom jealous. ✓
2. Katrina truly loved Ichabod.
3. Katrina was a ghost.
4. Katrina told Ichabod to leave town.

### Scene 3 (`the-road-home`)

Scene writing (Notice, Interpret, Craft): the questions from **The shadowy rider**.

#### Clue: Major André's tree

**Locate. What did the pale shape in the branches turn out to be?**

Answers:

> ¶60: “As he approached a little nearer, he thought he saw something white, hanging in the midst of the tree: he paused and ceased whistling but, on looking more narrowly, perceived that it was a place where the tree had been scathed by lightning, and the white wood laid bare.”
>
> Proof phrase: *a place where the tree had been scathed by lightning, and the white wood laid bare*

Near misses:

> ¶59: “The common people regarded it with a mixture of respect and superstition, partly out of sympathy for the fate of its ill-starred namesake, and partly from the tales of strange sights, and doleful lamentations, told concerning it.”
>
> Hint: That's what people say about the tree. What did he really see? Check ¶60.

Prove it (✓ is right; shuffled on screen):

1. The scary shape was a lightning scar, so his fear was fooling him. ✓
2. It was a real ghost.
3. It was Brom in a sheet.
4. It was Major André's coat.

**Locate. What was the moaning noise really?**

Answers:

> ¶60: “Suddenly he heard a groan—his teeth chattered, and his knees smote against the saddle: it was but the rubbing of one huge bough upon another, as they were swayed about by the breeze.”
>
> Proof phrase: *it was but the rubbing of one huge bough upon another*

Near misses:

> ¶60: “As Ichabod approached this fearful tree, he began to whistle; he thought his whistle was answered; it was but a blast sweeping sharply through the dry branches.”
>
> Hint: That's his whistle. Which line explains the groan? Check ¶60.

Prove it (✓ is right; shuffled on screen):

1. The noise came from tree limbs, not a spirit. ✓
2. A ghost was crying.
3. Brom was hiding in the tree.
4. His horse made the noise.

**Infer. Why was Ichabod already frightened before he reached the landmark?**

Answers:

> ¶59: “All the stories of ghosts and goblins that he had heard in the afternoon now came crowding upon his recollection.”

> ¶59: “He had never felt so lonely and dismal.”

Near misses:

> ¶58: “Far below him the Tappan Zee spread its dusky and indistinct waste of waters, with here and there the tall mast of a sloop, riding quietly at anchor under the land.”
>
> Hint: That's the view of the river. What filled his mind? Check ¶59.

Prove it (✓ is right; shuffled on screen):

1. The ghost stories from the party made him expect to see ghosts. ✓
2. He had seen a ghost there before.
3. Brom had warned him to go home.
4. The night was bright and cheerful.

#### Clue: The shadowy rider

**Locate. How did the figure respond when Ichabod called out?**

Answers:

> ¶63: “He received no reply.”

> ¶63: “Still there was no answer.”

Near misses:

> ¶61: “It was at this identical spot that the unfortunate André was captured, and under the covert of those chestnuts and vines were the sturdy yeomen concealed who surprised him.”
>
> Hint: That's the history of the spot. What did he see there? Check ¶62.

> ¶62: “In the dark shadow of the grove, on the margin of the brook, he beheld something huge, misshapen and towering.”
>
> Hint: That's where he saw it. How did it reply? Check ¶63.

Prove it (✓ is right; shuffled on screen):

1. It waited in the shadows and stayed silent, which made it more frightening. ✓
2. It greeted him by name.
3. It appeared in the middle of the church.
4. It answered that it was the Horseman.

**Locate. When they climbed the slope, what did Ichabod notice about the stranger?**

Answers:

> ¶64: “On mounting a rising ground, which brought the figure of his fellow-traveller in relief against the sky, gigantic in height, and muffled in a cloak, Ichabod was horror-struck on perceiving that he was headless!—but his horror was still more increased on observing that the head, which should have rested on his shoulders, was carried before him on the pommel of his saddle!”
>
> Proof phrase: *Ichabod was horror-struck on perceiving that he was headless*

Near misses:

> ¶63: “He appeared to be a horseman of large dimensions, and mounted on a black horse of powerful frame.”
>
> Hint: That's his size. What did Ichabod see on the hill? Check ¶64.

Prove it (✓ is right; shuffled on screen):

1. The rider seemed to have no head, so it looked like the Horseman. ✓
2. The rider took off his hat.
3. The rider was Ichabod's friend.
4. The rider rode away.

**Infer. Which details could fit a big flesh-and-blood rider rather than a spirit?**

Answers:

> ¶63: “He appeared to be a horseman of large dimensions, and mounted on a black horse of powerful frame.”

> ¶64: “The stranger, however, quickened his horse to an equal pace.”

> ¶64: “Ichabod pulled up, and fell into a walk, thinking to lag behind,—the other did the same.”

Near misses:

> ¶64: “On mounting a rising ground, which brought the figure of his fellow-traveller in relief against the sky, gigantic in height, and muffled in a cloak, Ichabod was horror-struck on perceiving that he was headless!—but his horror was still more increased on observing that the head, which should have rested on his shoulders, was carried before him on the pommel of his saddle!”
>
> Hint: That detail makes him seem a ghost. Which lines show an ordinary rider? Check ¶63.

Prove it (✓ is right; shuffled on screen):

1. A large rider who keeps pace could be a real person, like Brom. ✓
2. Only a ghost can ride a horse.
3. The rider floated above the road.
4. The rider walked through a tree.

#### Clue: Hans Van Ripper's saddle

**Locate. What went wrong with Ichabod's seat as he fled?**

Answers:

> ¶66: “As yet the panic of the steed had given his unskilful rider an apparent advantage in the chase, but just as he had got half way through the hollow, the girths of the saddle gave way, and he felt it slipping from under him.”
>
> Proof phrase: *the girths of the saddle gave way*

> ¶66: “He seized it by the pommel, and endeavored to hold it firm, but in vain; and had just time to save himself by clasping old Gunpowder round the neck, when the saddle fell to the earth, and he heard it trampled under foot by his pursuer.”
>
> Proof phrase: *the saddle fell to the earth, and he heard it trampled under foot by his pursuer*

Near misses:

> ¶65: “They had now reached the road which turns off to Sleepy Hollow; but Gunpowder, who seemed possessed with a demon, instead of keeping up it, made an opposite turn, and plunged headlong downhill to the left.”
>
> Hint: That's the horse turning. What gave way? Check ¶66.

Prove it (✓ is right; shuffled on screen):

1. The saddle fell and was trampled, which matches what searchers later found. ✓
2. Ichabod threw the saddle away.
3. The saddle was stolen at the party.
4. The horse ran off with the saddle.

**Locate. What worry flashed through Ichabod's head during the chase?**

Answers:

> ¶66: “For a moment the terror of Hans Van Ripper’s wrath passed across his mind,—for it was his Sunday saddle; but this was no time for petty fears; the goblin was hard on his haunches; and (unskilful rider that he was!) he had much ado to maintain his seat; sometimes slipping on one side, sometimes on another, and sometimes jolted on the high ridge of his horse’s backbone, with a violence that he verily feared would cleave him asunder.”
>
> Proof phrase: *the terror of Hans Van Ripper’s wrath passed across his mind*

Near misses:

> ¶68: “Hans Van Ripper now began to feel some uneasiness about the fate of poor Ichabod, and his saddle.”
>
> Hint: That's Hans the next day. What did Ichabod fear during the ride? Check ¶66.

Prove it (✓ is right; shuffled on screen):

1. The saddle belonged to Hans, and Ichabod feared his anger. ✓
2. The saddle was Ichabod's own.
3. The saddle belonged to Brom.
4. Ichabod didn't care about the saddle.

**Infer. Why does this piece of tack help show the ride happened as told?**

Answers:

> ¶66: “He seized it by the pommel, and endeavored to hold it firm, but in vain; and had just time to save himself by clasping old Gunpowder round the neck, when the saddle fell to the earth, and he heard it trampled under foot by his pursuer.”
>
> Proof phrase: *he heard it trampled under foot by his pursuer*

> ¶68: “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.”
>
> Proof phrase: *was found the saddle trampled in the dirt*

Near misses:

> ¶68: “The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate.”
>
> Hint: That shows the horse came home. Where was the saddle itself found? Check ¶68.

Prove it (✓ is right; shuffled on screen):

1. It was trampled in the chase and found trampled the next day, so two parts of the story match. ✓
2. It proves a ghost was there.
3. It proves Ichabod drowned.
4. It proves nothing happened.

#### Clue: The head hurled at the bridge

**Locate. What did Ichabod hope would happen once he crossed over?**

Answers:

> ¶67: ““If I can but reach that bridge,” thought Ichabod, “I am safe.””

> ¶67: “Another convulsive kick in the ribs, and old Gunpowder sprang upon the bridge; he thundered over the resounding planks; he gained the opposite side; and now Ichabod cast a look behind to see if his pursuer should vanish, according to rule, in a flash of fire and brimstone.”
>
> Proof phrase: *to see if his pursuer should vanish, according to rule, in a flash of fire and brimstone*

Near misses:

> ¶67: “He recollected the place where Brom Bones’s ghostly competitor had disappeared.”
>
> Hint: That's what he remembered. What did he expect to see? Check ¶67.

Prove it (✓ is right; shuffled on screen):

1. He expected the ghost to vanish, as in Brom's tale. ✓
2. He expected Brom to stop him.
3. He expected to fall in the water.
4. He expected to meet Katrina.

**Locate. What did the pursuer do instead of vanishing?**

Answers:

> ¶67: “Just then he saw the goblin rising in his stirrups, and in the very act of hurling his head at him.”

Near misses:

> ¶67: “Just then he heard the black steed panting and blowing close behind him; he even fancied that he felt his hot breath.”
>
> Hint: That's the chase. What was thrown? Check ¶67.

> ¶67: “It encountered his cranium with a tremendous crash,—he was tumbled headlong into the dust, and Gunpowder, the black steed, and the goblin rider, passed by like a whirlwind.”
>
> Hint: That's what happened to Ichabod. What did the pursuer do? Check ¶67.

Prove it (✓ is right; shuffled on screen):

1. The rider threw something and knocked him down instead of vanishing. ✓
2. The rider vanished in fire.
3. Ichabod escaped safely home.
4. The rider stopped and talked.

**Infer. What turned up the next day that might explain the thrown "head"?**

Answers:

> ¶68: “In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin.”
>
> Proof phrase: *close beside it a shattered pumpkin*

Near misses:

> ¶68: “The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate.”
>
> Hint: That's the horse. What lay beside the hat? Check ¶68.

Prove it (✓ is right; shuffled on screen):

1. A smashed pumpkin suggests the "head" could be a pumpkin thrown by a living rider. ✓
2. A real head was found.
3. Nothing was found by the brook.
4. The pumpkin was from the party table.

### Scene 4 (`the-towns-verdict`)

Scene writing (Notice, Interpret, Craft): the questions from **The storyteller's doubt**.

#### Clue: The report from New York

**Locate. According to the traveler, why did Ichabod go away?**

Answers:

> ¶71: “It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court.”
>
> Proof phrase: *he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress*

Near misses:

> ¶72: “The old country wives, however, who are the best judges of these matters, maintain to this day that Ichabod was spirited away by supernatural means; and it is a favorite story often told about the neighborhood round the winter evening fire.”
>
> Hint: That's what the old wives say. What did the farmer report? Check ¶71.

Prove it (✓ is right; shuffled on screen):

1. A farmer reported him alive and gone for fear and shame, but it is secondhand news. ✓
2. He was carried off by a ghost.
3. He drowned in the brook.
4. He married Katrina.

**Locate. What careers did he take up afterward?**

Answers:

> ¶71: “It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court.”
>
> Proof phrase: *had kept school and studied law at the same time; had been admitted to the bar; turned politician*

Near misses:

> ¶72: “The schoolhouse being deserted soon fell to decay, and was reported to be haunted by the ghost of the unfortunate pedagogue and the plowboy, loitering homeward of a still summer evening, has often fancied his voice at a distance, chanting a melancholy psalm tune among the tranquil solitudes of Sleepy Hollow.”
>
> Hint: That's a ghost story about him. What did he become? Check ¶71.

Prove it (✓ is right; shuffled on screen):

1. He made a new life elsewhere, which fits running away. ✓
2. He became a ghost.
3. He went back to Connecticut to farm.
4. He stayed a schoolmaster in Sleepy Hollow.

**Infer. Why should a detective be careful with this news?**

Answers:

> ¶71: “It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court.”
>
> Proof phrase: *an old farmer, who had been down to New York on a visit several years after*

Near misses:

> ¶71: “Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell.”
>
> Hint: That's Brom. Who brought the news, and when? Check ¶71.

Prove it (✓ is right; shuffled on screen):

1. It came years later from one person, so it isn't firsthand proof. ✓
2. Farmers always lie.
3. Ichabod wrote it himself.
4. The whole town saw him in New York.

#### Clue: Brom's laugh at the pumpkin

**Locate. What did Brom do soon after Ichabod was gone?**

Answers:

> ¶71: “Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell.”
>
> Proof phrase: *conducted the blooming Katrina in triumph to the altar*

Near misses:

> ¶71: “It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court.”
>
> Hint: That's news of Ichabod. What did Brom do? Check ¶71.

Prove it (✓ is right; shuffled on screen):

1. Brom married Katrina, so he gained from Ichabod leaving. ✓
2. Brom left the valley.
3. Brom searched for Ichabod.
4. Brom became a teacher.

**Locate. How does Brom react each time people retell what happened?**

Answers:

> ¶71: “Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell.”
>
> Proof phrase: *always burst into a hearty laugh at the mention of the pumpkin*

Near misses:

> ¶72: “The old country wives, however, who are the best judges of these matters, maintain to this day that Ichabod was spirited away by supernatural means; and it is a favorite story often told about the neighborhood round the winter evening fire.”
>
> Hint: That's the old wives. How does Brom act? Check ¶71.

Prove it (✓ is right; shuffled on screen):

1. His laugh at the pumpkin hints he knows it was a trick. ✓
2. He cries whenever it comes up.
3. He refuses to listen.
4. He swears it was a ghost.

**Infer. Why is Brom's behavior a clue but not proof?**

Answers:

> ¶71: “Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell.”
>
> Proof phrase: *which led some to suspect that he knew more about the matter than he chose to tell*

Near misses:

> ¶72: “The bridge became more than ever an object of superstitious awe; and that may be the reason why the road has been altered of late years, so as to approach the church by the border of the millpond.”
>
> Hint: That's about the bridge. What do people think about Brom? Check ¶71.

Prove it (✓ is right; shuffled on screen):

1. People only suspect him; no one saw him do it. ✓
2. Brom confessed to everything.
3. A judge found Brom guilty.
4. Brom was out of town that night.

#### Clue: The old wives' ghost story

**Locate. What do the elderly women of the valley say became of him?**

Answers:

> ¶72: “The old country wives, however, who are the best judges of these matters, maintain to this day that Ichabod was spirited away by supernatural means; and it is a favorite story often told about the neighborhood round the winter evening fire.”
>
> Proof phrase: *Ichabod was spirited away by supernatural means*

Near misses:

> ¶71: “It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court.”
>
> Hint: That's the farmer's report. What do the old wives claim? Check ¶72.

Prove it (✓ is right; shuffled on screen):

1. They believe a ghost took him, and they keep retelling it. ✓
2. They say he moved to New York.
3. They say Brom scared him off.
4. They say he drowned.

**Locate. Why did the town move travelers away from the old crossing?**

Answers:

> ¶72: “The bridge became more than ever an object of superstitious awe; and that may be the reason why the road has been altered of late years, so as to approach the church by the border of the millpond.”
>
> Proof phrase: *The bridge became more than ever an object of superstitious awe*

Near misses:

> ¶72: “The schoolhouse being deserted soon fell to decay, and was reported to be haunted by the ghost of the unfortunate pedagogue and the plowboy, loitering homeward of a still summer evening, has often fancied his voice at a distance, chanting a melancholy psalm tune among the tranquil solitudes of Sleepy Hollow.”
>
> Hint: That's the schoolhouse. What happened to the route? Check ¶72.

Prove it (✓ is right; shuffled on screen):

1. People feared the bridge so much that the route was changed. ✓
2. The bridge washed away in a flood.
3. Brom tore down the bridge.
4. The bridge was rebuilt in stone.

**Infer. Is the narrator serious when he praises these women's wisdom?**

Answers:

> ¶72: “The old country wives, however, who are the best judges of these matters, maintain to this day that Ichabod was spirited away by supernatural means; and it is a favorite story often told about the neighborhood round the winter evening fire.”
>
> Proof phrase: *who are the best judges of these matters*

Near misses:

> ¶72: “The schoolhouse being deserted soon fell to decay, and was reported to be haunted by the ghost of the unfortunate pedagogue and the plowboy, loitering homeward of a still summer evening, has often fancied his voice at a distance, chanting a melancholy psalm tune among the tranquil solitudes of Sleepy Hollow.”
>
> Hint: That's about the school. Where does he praise the old wives? Check ¶72.

Prove it (✓ is right; shuffled on screen):

1. He is likely joking, which makes their ghost claim less trustworthy. ✓
2. He means it, so the ghost is proven.
3. He never mentions them.
4. He says they saw the ghost themselves.

#### Clue: The storyteller's doubt

**Locate. What does the man who told it admit when a listener calls it far-fetched?**

Answers:

> ¶81: ““Faith, sir,” replied the story-teller, “as to that matter, I don’t believe one-half of it myself.””

Near misses:

> ¶76: “The story-teller, who was just putting a glass of wine to his lips, as a refreshment after his toils, paused for a moment, looked at his inquirer with an air of infinite deference, and, lowering the glass slowly to the table, observed that the story was intended most logically to prove—”
>
> Hint: He starts to explain. What does he finally admit? Check ¶81.

Prove it (✓ is right; shuffled on screen):

1. Even the man who told it doesn't believe all of it, so parts may be made up. ✓
2. He swears it is all true.
3. He gets angry and leaves.
4. He says Ichabod told him.

**Locate. How did one listener react while the others laughed?**

Answers:

> ¶75: “There was, however, one tall, dry-looking old gentleman, with beetling eyebrows, who maintained a grave and rather severe face throughout, now and then folding his arms, inclining his head, and looking down upon the floor, as if turning a doubt over in his mind.”
>
> Proof phrase: *maintained a grave and rather severe face throughout*

Near misses:

> ¶75: “When his story was concluded, there was much laughter and approbation, particularly from two or three deputy aldermen, who had been asleep the greater part of the time.”
>
> Hint: That's the others laughing. Who stayed serious? Check ¶75.

Prove it (✓ is right; shuffled on screen):

1. One listener doubted the story and wanted proof. ✓
2. Everyone believed it.
3. The listener fell asleep.
4. The listener told his own ghost story.

**Infer. What does the doubter want to know about it?**

Answers:

> ¶75: “When the mirth of the rest of the company had subsided, and silence was restored, he leaned one arm on the elbow of his chair, and sticking the other akimbo, demanded, with a slight, but exceedingly sage motion of the head, and contraction of the brow, what was the moral of the story, and what it went to prove?”
>
> Proof phrase: *what was the moral of the story, and what it went to prove*

Near misses:

> ¶80: “At length he observed that all this was very well, but still he thought the story a little on the extravagant—there were one or two points on which he had his doubts.”
>
> Hint: That comes after his answer. What did he first ask? Check ¶75.

Prove it (✓ is right; shuffled on screen):

1. He asks what the story proves, like a detective weighing evidence. ✓
2. He asks for another story.
3. He asks who the Horseman was.
4. He asks to meet Ichabod.

## Fair play: The Tell-Tale Heart

Generated from `worlds/tell-tale-heart/world.json` (same rules as Sleepy Hollow).

#### Mission: Test the narrator

Prove whether he is the calm, sane man he claims to be.

- Sealed clue: `confession-floorboards`; payoff: “I admit the deed! — tear up the planks! — here, here! — it is the beating of his hideous heart!””
- Theories: He is calm and sane, Guilt is breaking him, He is not in his right mind
- Piece `no-object` (search): “Object there was none.” · Lead: Find the line where he says he had no reason for the deed.
- Piece `the-eye` (search): “I think it was his eye! — yes, it was this!” · Lead: Find the line where he names what drove him to it.
- Piece `triumph` (room): “I could scarcely contain my feelings of triumph.” · Lead: Find the line that shows how proud he felt while sneaking in.
- Piece `precautions` (room): “If, still, you think me mad, you will think so no longer when I describe the wise precautions I took for the concealment of the body.” · Lead: Find the line where he promises to prove he isn't crazy by how carefully he hid what he had done.
- Piece `heard-not` (confession): “I gasped for breath — and yet the officers heard it not.” · Lead: Find the line that shows the visitors noticed nothing while he struggled.

### Scene 1 (`arrival`)

Scene writing (Notice, Interpret, Craft): the questions from **Officers’ shriek report**.

#### Clue: Street door and four o’clock

**Locate. How late was it when his work was finished?**

Answers:

> ¶25: “When I had made an end of these labors, it was four o'clock — still dark as midnight.”

Near misses:

> ¶25: “As the bell sounded the hour, there came a knocking at the street door.”
>
> Hint: That's the knock. When did he finish? Check ¶25.

Prove it (✓ is right; shuffled on screen):

1. He finished before dawn, while it was still dark. ✓
2. He finished at noon.
3. He never finished.
4. He finished at sunset.

**Locate. What did the visitors say they were?**

Answers:

> ¶25: “There entered three men, who introduced themselves, with perfect suavity, as officers of the police.”

Near misses:

> ¶25: “I went down to open it with a light heart, — for what had I now to fear?”
>
> Hint: That's how he felt going down. Who came in? Check ¶25.

Prove it (✓ is right; shuffled on screen):

1. Three police officers arrived, and they were very polite. ✓
2. Neighbors came to visit.
3. The old man came home.
4. One rude soldier came in.

**Infer. How did he feel about answering?**

Answers:

> ¶25: “I went down to open it with a light heart, — for what had I now to fear?”

Near misses:

> ¶25: “When I had made an end of these labors, it was four o'clock — still dark as midnight.”
>
> Hint: That's the time. How did he feel? Check ¶25.

Prove it (✓ is right; shuffled on screen):

1. He felt carefree, as if he had nothing to fear at all. ✓
2. He was terrified of the knock.
3. He refused to open up.
4. He was asleep and missed it.

#### Clue: Officers’ shriek report

**Locate. What did someone next door notice in the dark hours?**

Answers:

> ¶26: “A shriek had been heard by a neighbor during the night; suspicion of foul play had been aroused; information had been lodged at the police-office, and they (the officers) had been deputed to search the premises.”
>
> Proof phrase: *A shriek had been heard by a neighbor during the night*

Prove it (✓ is right; shuffled on screen):

1. A neighbor heard a scream. ✓
2. A neighbor saw a fire.
3. A neighbor heard music.
4. A neighbor saw a thief.

**Locate. What were the visitors sent to do?**

Answers:

> ¶26: “A shriek had been heard by a neighbor during the night; suspicion of foul play had been aroused; information had been lodged at the police-office, and they (the officers) had been deputed to search the premises.”
>
> Proof phrase: *they (the officers) had been deputed to search the premises*

Prove it (✓ is right; shuffled on screen):

1. They were sent to look through the house. ✓
2. They were sent to arrest the old man.
3. They were sent to deliver a letter.
4. They came to buy the house.

**Infer. Why does a report from next door matter more than his word alone?**

Answers:

> ¶26: “A shriek had been heard by a neighbor during the night; suspicion of foul play had been aroused; information had been lodged at the police-office, and they (the officers) had been deputed to search the premises.”
>
> Proof phrase: *A shriek had been heard by a neighbor during the night*

Prove it (✓ is right; shuffled on screen):

1. Someone else heard something, so his story can be checked. ✓
2. The neighbor saw everything happen.
3. The neighbor wrote the story.
4. No one heard anything at all.

### Scene 2 (`search`)

Scene writing (Notice, Interpret, Craft): the questions from **No stated motive**.

#### Clue: Treasures, secure and undisturbed

**Locate. Where did he say the old man had gone?**

Answers:

> ¶27: “The old man, I mentioned, was absent in the country.”

Near misses:

> ¶27: “The shriek, I said, was my own in a dream.”
>
> Hint: That explains the scream. Where did he say the old man was? Check ¶27.

Prove it (✓ is right; shuffled on screen):

1. He claimed the old man was away in the country. ✓
2. He said the old man was asleep upstairs.
3. He said the old man had moved to the city.
4. He said he didn't know.

**Locate. How did he explain the scream?**

Answers:

> ¶27: “The shriek, I said, was my own in a dream.”

Near misses:

> ¶27: “I smiled, — for what had I to fear?”
>
> Hint: That's his smile. What did he say about the noise? Check ¶27.

Prove it (✓ is right; shuffled on screen):

1. He claimed he cried out himself while dreaming. ✓
2. He blamed a cat.
3. He said the neighbor imagined it.
4. He admitted the old man screamed.

**Infer. Why might he show the visitors the old man's valuables?**

Answers:

> ¶27: “I showed them his treasures, secure, undisturbed.”

Near misses:

> ¶27: “I took my visitors all over the house.”
>
> Hint: That's the tour. What did he show them in the chamber? Check ¶27.

Prove it (✓ is right; shuffled on screen):

1. Untouched valuables suggest nothing was stolen, so nothing seems wrong. ✓
2. He wanted to sell them.
3. The valuables were missing.
4. The officers asked to count the money.

#### Clue: No stated motive

**Locate. What did he say he wanted from the old man?**

Answers:

> ¶2: “For his gold I had no desire.”

> ¶2: “Object there was none.”

Near misses:

> ¶2: “I loved the old man.”
>
> Hint: That's how he felt about him. Did he want anything? Check ¶2.

Prove it (✓ is right; shuffled on screen):

1. He says he wanted nothing from him, not even his money. ✓
2. He wanted his gold.
3. He wanted his house.
4. He wanted revenge for an insult.

**Locate. What feature of the old man bothered him?**

Answers:

> ¶2: “I think it was his eye! — yes, it was this!”

> ¶2: “He had the eye of a vulture — a pale blue eye, with a film over it.”

Near misses:

> ¶2: “He had never wronged me.”
>
> Hint: That's what the old man didn't do. What bothered him? Check ¶2.

Prove it (✓ is right; shuffled on screen):

1. The old man's clouded eye frightened and disgusted him. ✓
2. His voice was too loud.
3. He snored at night.
4. He owed money.

**Infer. What did he decide to do about the old man?**

Answers:

> ¶2: “Whenever it fell upon me, my blood ran cold; and so, by degrees — very gradually — I made up my mind to take the life of the old man, and thus rid myself of the eye forever.”
>
> Proof phrase: *I made up my mind to take the life of the old man, and thus rid myself of the eye forever*

Near misses:

> ¶2: “It is impossible to say how first the idea entered my brain; but, once conceived, it haunted me day and night.”
>
> Hint: That's how the idea began. What did he decide? Check ¶2.

Prove it (✓ is right; shuffled on screen):

1. He planned to kill a man he loved just to escape his eye. ✓
2. He planned to move away.
3. He decided to steal the gold.
4. He decided to help the old man.

### Scene 3 (`room`)

Scene writing (Notice, Interpret, Craft): the questions from **Death-watches in the wall**.

#### Clue: Lantern’s single thin ray

**Locate. How long did it take him just to get inside the gap?**

Answers:

> ¶5: “It took me an hour to place my whole head within the opening so far that I could see the old man as he lay upon his bed.”
>
> Proof phrase: *It took me an hour to place my whole head within the opening*

Near misses:

> ¶5: “Ha! — would a madman have been so wise as this?”
>
> Hint: That's him boasting. How long did it take? Check ¶5.

Prove it (✓ is right; shuffled on screen):

1. He moved incredibly slowly, taking a whole hour. ✓
2. He rushed straight in.
3. He waited outside all night.
4. He came in through the window.

**Locate. Where did the beam land?**

Answers:

> ¶5: “And then, when my head was well in the room, I undid the lantern cautiously — oh, so cautiously (for the hinges creaked) — I undid it just so much that a single thin ray fell upon the vulture eye.”
>
> Proof phrase: *a single thin ray fell upon the vulture eye*

Near misses:

> ¶5: “It took me an hour to place my whole head within the opening so far that I could see the old man as he lay upon his bed.”
>
> Hint: That's his head going in. Where did the ray fall? Check ¶5.

Prove it (✓ is right; shuffled on screen):

1. He aimed the light only at the eye. ✓
2. He lit the whole room.
3. He shone it on the bed.
4. He kept it dark.

**Infer. What does his bragging about being careful suggest about how he sees himself?**

Answers:

> ¶5: “Ha! — would a madman have been so wise as this?”

Near misses:

> ¶5: “And then, when my head was well in the room, I undid the lantern cautiously — oh, so cautiously (for the hinges creaked) — I undid it just so much that a single thin ray fell upon the vulture eye.”
>
> Hint: That's the lantern. Where does he brag? Check ¶5.

Prove it (✓ is right; shuffled on screen):

1. He believes his care proves he is not mad. ✓
2. He admits he is mad.
3. He thinks the old man is wise.
4. He is joking with the officers.

#### Clue: Door opened night after night

**Locate. At what hour did he start his visits?**

Answers:

> ¶4: “And every night, about midnight, I turned the latch of his door and opened it — oh so gently!”

Near misses:

> ¶4: “Oh, you would have laughed to see how cunningly I thrust it in!”
>
> Hint: That's him boasting. When did he start? Check ¶4.

Prove it (✓ is right; shuffled on screen):

1. He came around twelve, in the middle of the night. ✓
2. At sunrise.
3. At dinnertime.
4. Only once, at noon.

**Locate. How was his last visit different from the others?**

Answers:

> ¶8: “Upon the eighth night I was more than usually cautious in opening the door.”

Near misses:

> ¶8: “I fairly chuckled at the idea.”
>
> Hint: That's his laugh. How was he different that time? Check ¶8.

Prove it (✓ is right; shuffled on screen):

1. He was even more careful than usual. ✓
2. He was careless and loud.
3. He knocked first.
4. He brought the officers.

**Infer. How does his mood change as the visits go on?**

Answers:

> ¶8: “I could scarcely contain my feelings of triumph.”

> ¶8: “Never, before that night, had I felt the extent of my own powers — of my sagacity.”

Near misses:

> ¶8: “And perhaps the old man heard me; for he moved in the bed suddenly, as if startled.”
>
> Hint: That's the old man moving. How does the narrator feel? Check ¶8.

Prove it (✓ is right; shuffled on screen):

1. He grows proud and thrilled with his own cleverness. ✓
2. He grows sorry.
3. He grows bored.
4. He gives up.

#### Clue: Heavy bed

**Locate. What did he use to hold the old man down?**

Answers:

> ¶21: “In an instant I dragged him to the floor, and pulled the heavy bed over him.”

Near misses:

> ¶20: “With a loud yell, I threw open the lantern and leaped into the room.”
>
> Hint: That's him leaping in. What held the old man down? Check ¶21.

Prove it (✓ is right; shuffled on screen):

1. He used the heavy bed. ✓
2. A blanket.
3. A door.
4. Nothing at all.

**Locate. How did he feel right after, sitting there?**

Answers:

> ¶21: “I then sat upon the bed and smiled gaily, to find the deed so far done.”

Near misses:

> ¶21: “But, for many minutes, the heart beat on, with a muffled sound.”
>
> Hint: That's the sound going on. How did he feel? Check ¶21.

Prove it (✓ is right; shuffled on screen):

1. He was cheerful about what he had done. ✓
2. He cried.
3. He ran away.
4. He called for help.

**Infer. Why didn't the beating trouble him at first?**

Answers:

> ¶21: “This, however, did not vex me; it would not be heard through the walls.”

Near misses:

> ¶20: “And now a new anxiety seized me — the sound would be heard by a neighbor!”
>
> Hint: That was before. Why didn't it bother him now? Check ¶21.

Prove it (✓ is right; shuffled on screen):

1. He believed it could not get past the walls. ✓
2. He couldn't hear it.
3. He wanted to be caught.
4. The officers were coming.

#### Clue: Chairs and the narrator’s seat

**Locate. What did he bring in for the visitors?**

Answers:

> ¶28: “In the enthusiasm of my confidence, I brought chairs into the room, and desired them here to rest from their fatigues; while I myself, in the wild audacity of my perfect triumph, placed my own seat upon the very spot beneath which reposed the corpse of the victim.”
>
> Proof phrase: *I brought chairs into the room*

Prove it (✓ is right; shuffled on screen):

1. He acted like a relaxed host and offered seats. ✓
2. He refused them seats.
3. He made them stand outside.
4. He sent them away.

**Locate. Where did he choose to sit?**

Answers:

> ¶28: “In the enthusiasm of my confidence, I brought chairs into the room, and desired them here to rest from their fatigues; while I myself, in the wild audacity of my perfect triumph, placed my own seat upon the very spot beneath which reposed the corpse of the victim.”
>
> Proof phrase: *placed my own seat upon the very spot beneath which reposed the corpse of the victim*

Prove it (✓ is right; shuffled on screen):

1. Right over the hidden body. ✓
2. By the window.
3. At the door.
4. Far from the boards.

**Infer. What does that choice reveal about his state of mind?**

Answers:

> ¶28: “In the enthusiasm of my confidence, I brought chairs into the room, and desired them here to rest from their fatigues; while I myself, in the wild audacity of my perfect triumph, placed my own seat upon the very spot beneath which reposed the corpse of the victim.”
>
> Proof phrase: *in the wild audacity of my perfect triumph*

Prove it (✓ is right; shuffled on screen):

1. He was so sure of himself that he took a reckless risk. ✓
2. He was too tired to move.
3. He wanted to protect the officers.
4. He forgot what lay below.

#### Clue: Three floorboards

**Locate. Where did he put what was left of the victim?**

Answers:

> ¶23: “I then took up three planks from the flooring of the chamber, and deposited all between the scantlings.”

Near misses:

> ¶23: “I cut off the head and the arms and the legs.”
>
> Hint: That's what he did first. Where did he hide it? Check ¶23.

Prove it (✓ is right; shuffled on screen):

1. He hid it under the floor. ✓
2. He buried it in the garden.
3. He threw it in the river.
4. He locked it in a trunk.

**Locate. How well did he say he covered his work?**

Answers:

> ¶24: “I then replaced the boards so cleverly, so cunningly, that no human eye — not even his — could have detected anything wrong.”

Near misses:

> ¶24: “I had been too wary for that.”
>
> Hint: That's him being wary. How well did he put things back? Check ¶24.

Prove it (✓ is right; shuffled on screen):

1. He claims no one could spot anything wrong. ✓
2. He left a mess.
3. He asked for help.
4. He marked the spot.

**Infer. Why does he walk us through every step of what he did with the remains?**

Answers:

> ¶23: “If, still, you think me mad, you will think so no longer when I describe the wise precautions I took for the concealment of the body.”
>
> Proof phrase: *you will think so no longer when I describe the wise precautions*

Near misses:

> ¶22: “His eye would trouble me no more.”
>
> Hint: That's about the eye. Why does he explain his steps? Check ¶23.

Prove it (✓ is right; shuffled on screen):

1. He thinks careful planning proves he is sane. ✓
2. He wants to be caught.
3. He is confessing to the police.
4. He feels sorry.

#### Clue: Tub

**Locate. What does he say kept the floor clean?**

Answers:

> ¶24: “A tub had caught all — ha! ha!”

Near misses:

> ¶24: “There was nothing to wash out — no stain of any kind — no blood-spot whatever.”
>
> Hint: That's the result. What did the work? Check ¶24.

Prove it (✓ is right; shuffled on screen):

1. He says a tub took everything. ✓
2. A rug.
3. A bucket of water.
4. A cloth.

**Locate. What did he say was left to clean up?**

Answers:

> ¶24: “There was nothing to wash out — no stain of any kind — no blood-spot whatever.”

Near misses:

> ¶24: “A tub had caught all — ha! ha!”
>
> Hint: That's what took it all. What was left behind? Check ¶24.

Prove it (✓ is right; shuffled on screen):

1. He claims there was nothing at all to clean. ✓
2. Blood everywhere.
3. A broken lamp.
4. Footprints.

**Infer. What in his telling sounds more like bragging than reporting?**

Answers:

> ¶24: “A tub had caught all — ha! ha!”

> ¶24: “I then replaced the boards so cleverly, so cunningly, that no human eye — not even his — could have detected anything wrong.”

Near misses:

> ¶23: “The night waned, and I worked hastily, but in silence.”
>
> Hint: That's the work at night. Where does he gloat? Check ¶24.

Prove it (✓ is right; shuffled on screen):

1. He laughs and boasts, so this is his own account, not proof. ✓
2. He shows real evidence.
3. The officers confirm it.
4. He sounds ashamed.

#### Clue: Closed shutters

**Locate. What blocked out all light in the bedroom?**

Answers:

> ¶9: “His room was as black as pitch with the thick darkness, (for the shutters were close fastened, through fear of robbers,) and so I knew that he could not see the opening of the door, and I kept on pushing it steadily, steadily.”
>
> Proof phrase: *the shutters were close fastened, through fear of robbers*

Near misses:

> ¶9: “Now you may think that I drew back — but no.”
>
> Hint: That's him not stopping. Why was the room so dark? Check ¶9.

Prove it (✓ is right; shuffled on screen):

1. Shutters closed tight against thieves. ✓
2. A moonless sky.
3. A broken lantern.
4. Heavy curtains he hung.

**Locate. Did he stop when he got close?**

Answers:

> ¶9: “Now you may think that I drew back — but no.”

Near misses:

> ¶9: “His room was as black as pitch with the thick darkness, (for the shutters were close fastened, through fear of robbers,) and so I knew that he could not see the opening of the door, and I kept on pushing it steadily, steadily.”
>
> Hint: That explains the dark. Did he stop? Check ¶9.

Prove it (✓ is right; shuffled on screen):

1. He kept going instead of pulling back. ✓
2. He ran away.
3. He woke the old man.
4. He waited a week.

**Infer. Why did he feel safe going on?**

Answers:

> ¶9: “His room was as black as pitch with the thick darkness, (for the shutters were close fastened, through fear of robbers,) and so I knew that he could not see the opening of the door, and I kept on pushing it steadily, steadily.”
>
> Proof phrase: *I knew that he could not see the opening of the door*

Near misses:

> ¶9: “Now you may think that I drew back — but no.”
>
> Hint: That's him not drawing back. Why did he feel safe? Check ¶9.

Prove it (✓ is right; shuffled on screen):

1. He knew the old man couldn't see him in the dark. ✓
2. The old man was deaf.
3. The officers were with him.
4. The door was gone.

#### Clue: Death-watches in the wall

**Locate. What was the old man doing instead of sleeping?**

Answers:

> ¶11: “He was still sitting up in the bed, listening; — just as I have done, night after night, hearkening to the death-watches in the wall.”

Near misses:

> ¶11: “For another hour I did not move a muscle, and in the meantime I did not hear the old man lie down.”
>
> Hint: That's the narrator waiting. What was the old man doing? Check ¶11.

Prove it (✓ is right; shuffled on screen):

1. He sat up in bed, listening in fear. ✓
2. He was asleep.
3. He was reading.
4. He called the police.

**Locate. How long did the narrator stay frozen?**

Answers:

> ¶11: “For another hour I did not move a muscle, and in the meantime I did not hear the old man lie down.”

Near misses:

> ¶11: “I kept quite still and said nothing.”
>
> Hint: That's him keeping quiet at first. How long? Check ¶11.

Prove it (✓ is right; shuffled on screen):

1. He stood still for another whole hour. ✓
2. A second.
3. He left at once.
4. Until morning.

**Infer. How is the old man like the narrator in this moment?**

Answers:

> ¶11: “He was still sitting up in the bed, listening; — just as I have done, night after night, hearkening to the death-watches in the wall.”

Near misses:

> ¶11: “I kept quite still and said nothing.”
>
> Hint: That's the narrator. How are they alike? Check ¶11.

Prove it (✓ is right; shuffled on screen):

1. Both lie awake, listening in the dark. ✓
2. Both are asleep.
3. Both are laughing.
4. Neither can hear.

### Scene 4 (`confession`)

Scene writing (Notice, Interpret, Craft): the questions from **The officers’ calm**.

#### Clue: Floorboards at the confession

**Locate. What name does he call the officers?**

Answers:

> ¶34: ““Villains!””

Near misses:

> ¶34: “I shrieked, “dissemble no more!”
>
> Hint: That's what he orders. What does he call them? Check ¶34.

Prove it (✓ is right; shuffled on screen):

1. He calls them villains. ✓
2. Friends.
3. Gentlemen.
4. Neighbors.

**Locate. What does he order them to stop doing?**

Answers:

> ¶34: “I shrieked, “dissemble no more!”

Near misses:

> ¶34: ““Villains!””
>
> Hint: That's the name he calls them. What does he demand? Check ¶34.

Prove it (✓ is right; shuffled on screen):

1. He orders them to stop pretending. ✓
2. To stop talking.
3. To leave.
4. To search.

**Infer. What pushes him to the breaking point just before he speaks?**

Answers:

> ¶33: “I felt that I must scream or die! — and now — again! — hark! louder! louder! louder! louder!”

Near misses:

> ¶33: “Was it possible they heard not?”
>
> Hint: That's his question. What pushes him over? Check ¶33.

Prove it (✓ is right; shuffled on screen):

1. The sound grows unbearable and he must scream. ✓
2. The officers accuse him.
3. The old man walks in.
4. The clock strikes.

#### Clue: The officers’ calm

**Locate. What did he realize about where the sound came from?**

Answers:

> ¶30: “The ringing became more distinct: I talked more freely, to get rid of the feeling; but it continued and gained definiteness — until, at length, I found that the noise was not within my ears.”
>
> Proof phrase: *I found that the noise was not within my ears*

Near misses:

> ¶29: “My head ached, and I fancied a ringing in my ears: but still they sat and still chatted.”
>
> Hint: That's when it starts. What does he realize? Check ¶30.

Prove it (✓ is right; shuffled on screen):

1. He decided the noise wasn't just in his head. ✓
2. He knew it was the clock.
3. He thought it was rain.
4. He never noticed it.

**Locate. How did the visitors behave while he grew frantic?**

Answers:

> ¶32: “And still the men chatted pleasantly, and smiled.”

Near misses:

> ¶31: “I gasped for breath — and yet the officers heard it not.”
>
> Hint: That's him gasping. What were the officers doing? Check ¶32.

Prove it (✓ is right; shuffled on screen):

1. They stayed calm and friendly, seeming to notice nothing. ✓
2. They drew their weapons.
3. They left.
4. They shouted at him.

**Infer. Why might the sound be coming from inside him rather than the floor?**

Answers:

> ¶31: “I gasped for breath — and yet the officers heard it not.”

> ¶33: “They heard! — they suspected! — they knew! — they were making a mockery of my horror! — this I thought, and this I think.”

Near misses:

> ¶32: “I swung the chair upon which I had sat, and grated it upon the boards; — but the noise arose over all and continually increased.”
>
> Hint: That's him scraping the chair. Who notices the sound? Check ¶31.

Prove it (✓ is right; shuffled on screen):

1. No one else notices it, so it may be his guilt. ✓
2. The officers notice it clearly.
3. It's a clock in the wall.
4. The old man is alive.

## Fair play: Trifles

Generated from `worlds/trifles/world.json` (same rules as Sleepy Hollow).

#### Mission: Find what the men miss

Prove why the women keep the evidence to themselves.

- Sealed clue: `knot-it`; payoff: “We call it--knot it, Mr. Henderson.”
- Theories: They understand Minnie, They are afraid, They aren't sure
- Piece `hinge` (kitchen): “One hinge is pulled apart.” · Lead: Find the line that shows the cage was damaged.
- Piece `the-bird` (kitchen): “It’s the bird.” · Lead: Find the line where the women discover what's inside the box.
- Piece `hard-man` (minnie-foster): “But he was a hard man, Mrs. Peters.” · Lead: Find the line where Mrs. Hale sums up what John Wright was like.
- Piece `rope` (the-law-and-the-women): “Killing a man while he slept, slipping a rope around his neck that choked the life out of him.” · Lead: Find the line that describes how John Wright died.
- Piece `no-reason` (the-last-word): “No, Peters, it’s all perfectly clear except a reason for doing it.” · Lead: Find the line where the lawyer says what the case still lacks.
- Piece `pocket` (the-last-word): “MRS. HALE snatches the box and puts it in the pocket of her big coat.” · Lead: Find the line that shows where the evidence ends up.

### Scene 1 (`kitchen`)

Scene writing (Notice, Interpret, Craft): the questions from **Mr. Hale's account**.

#### Clue: Mr. Hale's account

**Locate. What were Hale and his son hauling to market?**

Answers:

> ¶19: “Harry and I had started to town with a load of potatoes.”

Near misses:

> ¶19: “We came along the road from my place and as I got here I said, “I’m going to see if I can’t get John Wright to go in with me on a party telephone.””
>
> Hint: That's why he stopped. What were they carrying? Check ¶19.

Prove it (✓ is right; shuffled on screen):

1. They were taking potatoes to town. ✓
2. Corn to the mill.
3. Milk to a neighbor.
4. Nothing at all.

**Locate. Who was there when Hale walked in?**

Answers:

> ¶23: “I wasn’t sure, I’m not sure yet, but I opened the door—this door [_indicating the door by which the two women are still standing_] and there in that rocker—[_pointing to it_] sat Mrs. Wright.”
>
> Proof phrase: *sat Mrs. Wright*

Near misses:

> ¶23: “I didn’t hear or see anything; I knocked at the door, and still it was all quiet inside.”
>
> Hint: That's before he went in. Who did he find? Check ¶23.

Prove it (✓ is right; shuffled on screen):

1. Mrs. Wright, in her rocker. ✓
2. John Wright, at the table.
3. No one at all.
4. The sheriff.

**Infer. Why is Hale's story less than certain?**

Answers:

> ¶23: “So I knocked again, and I thought I heard somebody say, “Come in.””

> ¶23: “I wasn’t sure, I’m not sure yet, but I opened the door—this door [_indicating the door by which the two women are still standing_] and there in that rocker—[_pointing to it_] sat Mrs. Wright.”
>
> Proof phrase: *I wasn’t sure, I’m not sure yet*

Near misses:

> ¶23: “I knew they must be up, it was past eight o’clock.”
>
> Hint: That's the time. Where does he admit doubt? Check ¶23.

Prove it (✓ is right; shuffled on screen):

1. He isn't sure what he heard, so his account has gaps. ✓
2. He saw everything clearly.
3. He wasn't there.
4. He wrote it all down.

#### Clue: The broken jars of preserves

**Locate. What happened to the jars of food she had put up?**

Answers:

> ¶58: “Oh, her fruit; it did freeze.”

Near misses:

> ¶58: “She worried about that when it turned so cold.”
>
> Hint: That's her worry. What actually happened? Check ¶58.

Prove it (✓ is right; shuffled on screen):

1. The cold froze them. ✓
2. Someone stole them.
3. She ate them.
4. They were fine.

**Locate. What had she feared would happen when the weather turned?**

Answers:

> ¶58: “She said the fire’d go out and her jars would break.”

Near misses:

> ¶58: “Oh, her fruit; it did freeze.”
>
> Hint: That's what happened. What did she fear? Check ¶58.

Prove it (✓ is right; shuffled on screen):

1. The fire would die and her jars would crack. ✓
2. Robbers would come.
3. The sheriff would visit.
4. The roof would leak.

**Infer. What does her concern for these jars suggest about her?**

Answers:

> ¶58: “She worried about that when it turned so cold.”

Near misses:

> ¶58: “She said the fire’d go out and her jars would break.”
>
> Hint: That's what she said would happen. Who was thinking about it? Check ¶58.

Prove it (✓ is right; shuffled on screen):

1. She cared about her everyday work at home. ✓
2. She didn't care about her home.
3. She wanted to sell them.
4. She blamed her husband.

#### Clue: The quilt

**Locate. What was Mrs. Wright making with the scraps?**

Answers:

> ¶157: “She was piecing a quilt.”

Near misses:

> ¶160: “Pretty, isn’t it?”
>
> Hint: That's an opinion. What was she making? Check ¶157.

Prove it (✓ is right; shuffled on screen):

1. She was sewing a quilt. ✓
2. A dress.
3. Curtains.
4. A rug.

**Locate. What two ways could she finish it?**

Answers:

> ¶160: “I wonder if she was goin’ to quilt it or just knot it?”

Near misses:

> ¶160: “It’s log cabin pattern.”
>
> Hint: That's the pattern. What's the choice? Check ¶160.

Prove it (✓ is right; shuffled on screen):

1. She could either quilt it or knot it. ✓
2. Paint it or dye it.
3. Sell it or give it away.
4. Burn it or bury it.

**Infer. What is Mrs. Hale doing to the messy part of the sewing?**

Answers:

> ¶179: “Just pulling out a stitch or two that’s not sewed very good.”

Near misses:

> ¶179: “Bad sewing always made me fidgety.”
>
> Hint: That's how she feels. What is she doing? Check ¶179.

Prove it (✓ is right; shuffled on screen):

1. She is fixing the sewing, which changes the evidence. ✓
2. She is cutting the quilt apart.
3. She is packing it to take.
4. She is reading a letter.

#### Clue: The birdcage with the broken door

**Locate. What did Mrs. Peters come across on the shelf?**

Answers:

> ¶193: “Why, here’s a bird-cage.”

Near misses:

> ¶193: “Did she have a bird, Mrs. Hale?”
>
> Hint: That's her question. What did she find? Check ¶193.

Prove it (✓ is right; shuffled on screen):

1. An empty birdcage. ✓
2. A box of letters.
3. A broken jar.
4. A rope.

**Locate. What is wrong with the little gate?**

Answers:

> ¶205: “One hinge is pulled apart.”

> ¶205: “It’s broke.”

Near misses:

> ¶205: “Why, look at this door.”
>
> Hint: That points to it. What's wrong with it? Check ¶205.

Prove it (✓ is right; shuffled on screen):

1. A hinge is pulled apart, as if forced. ✓
2. It's painted.
3. It's locked.
4. It's brand new.

**Infer. Why is it strange that there's a cage but no pet in it?**

Answers:

> ¶193: “Did she have a bird, Mrs. Hale?”

> ¶205: “One hinge is pulled apart.”

Near misses:

> ¶193: “[_Looking in cupboard._]”
>
> Hint: That's where she looked. What makes it strange? Check ¶193.

Prove it (✓ is right; shuffled on screen):

1. A missing bird and a damaged cage raise questions about what happened. ✓
2. Birds always escape.
3. The cage was only for show.
4. Mrs. Wright hated birds.

#### Clue: The box with the canary

**Locate. Where do the women hunt for quilting supplies to bring to Minnie?**

Answers:

> ¶241: “[_They look in the sewing basket._”

Near misses:

> ¶250: “It’s the bird.”
>
> Hint: That's what they find. Where did they search? Check ¶241.

Prove it (✓ is right; shuffled on screen):

1. In the sewing basket. ✓
2. Under the bed.
3. In the barn.
4. In the stove.

**Locate. What is inside the box?**

Answers:

> ¶250: “It’s the bird.”

Near misses:

> ¶241: “[_They look in the sewing basket._”
>
> Hint: That's where they look. What do they find? Check ¶250.

Prove it (✓ is right; shuffled on screen):

1. The bird. ✓
2. Money.
3. A letter.
4. Thread.

**Infer. Why would someone hide this among sewing things?**

Answers:

> ¶250: “It’s the bird.”

Near misses:

> ¶241: “[_They look in the sewing basket._”
>
> Hint: That's where it was. What was hidden? Check ¶250.

Prove it (✓ is right; shuffled on screen):

1. Someone wanted to keep the bird where the men wouldn't look. ✓
2. It was put there by mistake.
3. The sheriff hid it.
4. It was a gift for Mrs. Hale.

### Scene 2 (`minnie-foster`)

Scene writing (Notice, Interpret, Craft): the questions from **Mrs. Hale's words about John Wright**.

#### Clue: The shabby skirt and the choir girl

**Locate. How does Mrs. Hale describe John Wright's way with money?**

Answers:

> ¶125: “Wright was close.”

Near misses:

> ¶125: “She didn’t even belong to the Ladies Aid.”
>
> Hint: That's about the Ladies Aid. What about money? Check ¶125.

Prove it (✓ is right; shuffled on screen):

1. He was stingy. ✓
2. He was generous.
3. He was rich.
4. He was in debt.

**Locate. What was Minnie like before she married?**

Answers:

> ¶125: “She used to wear pretty clothes and be lively, when she was Minnie Foster, one of the town girls singing in the choir.”

Near misses:

> ¶125: “But that—oh, that was thirty years ago.”
>
> Hint: That's how long ago. What was she like? Check ¶125.

Prove it (✓ is right; shuffled on screen):

1. Lively, prettily dressed, and singing in the choir. ✓
2. Shy and silent.
3. A teacher.
4. Always alone.

**Infer. What creature does Mrs. Hale compare Minnie to?**

Answers:

> ¶238: “She—come to think of it, she was kind of like a bird herself—real sweet and pretty, but kind of timid and—fluttery.”
>
> Proof phrase: *she was kind of like a bird herself*

Near misses:

> ¶238: “How?—she—did—change.”
>
> Hint: That's how she changed. What does Mrs. Hale compare her to? Check ¶238.

Prove it (✓ is right; shuffled on screen):

1. A bird: sweet and pretty, but timid. ✓
2. A cat: sly and quiet.
3. A horse: strong and wild.
4. A storm: loud and angry.

#### Clue: The apron and the little shawl

**Locate. What did Mrs. Wright request?**

Answers:

> ¶127: “She said she wanted an apron.”

> ¶127: “And then her little shawl that always hung behind the door.”

Near misses:

> ¶127: “Funny thing to want, for there isn’t much to get you dirty in jail, goodness knows.”
>
> Hint: That's Mrs. Peters' opinion. What did she ask for? Check ¶127.

Prove it (✓ is right; shuffled on screen):

1. An apron and her little shawl. ✓
2. Her quilt.
3. Her bird.
4. Her fruit.

**Locate. Where were the aprons kept?**

Answers:

> ¶127: “She said they was in the top drawer in this cupboard.”

Near misses:

> ¶127: “And then her little shawl that always hung behind the door.”
>
> Hint: That's the shawl. Where were the aprons? Check ¶127.

Prove it (✓ is right; shuffled on screen):

1. In the top drawer of the cupboard. ✓
2. In the bottom drawer.
3. Behind the door.
4. Upstairs.

**Infer. Why does Mrs. Hale believe these requests mean Minnie is innocent?**

Answers:

> ¶138: “Well, I don’t think she did.”

> ¶138: “Asking for an apron and her little shawl.”

Near misses:

> ¶138: “Worrying about her fruit.”
>
> Hint: That's the fruit. What does she conclude? Check ¶138.

Prove it (✓ is right; shuffled on screen):

1. Someone worried about everyday things doesn't seem like a killer to her. ✓
2. She has proof.
3. Minnie confessed.
4. The sheriff told her.

#### Clue: The lonesome house in the hollow

**Locate. How long since Mrs. Hale had visited?**

Answers:

> ¶78: “I’ve not been in this house—it’s more than a year.”

Near misses:

> ¶78: “I’ve not seen much of her of late years.”
>
> Hint: That's seeing her. How long since she came to the house? Check ¶78.

Prove it (✓ is right; shuffled on screen):

1. More than a year. ✓
2. Last week.
3. Never.
4. Yesterday.

**Locate. What kept her from visiting?**

Answers:

> ¶220: “I stayed away because it weren’t cheerful—and that’s why I ought to have come.”

> ¶86: “It never seemed a very cheerful place.”

Near misses:

> ¶82: “Farmers’ wives have their hands full, Mr. Henderson.”
>
> Hint: That's about farm work. What kept her away? Check ¶220.

Prove it (✓ is right; shuffled on screen):

1. The house was gloomy, so she avoided it. ✓
2. She was sick.
3. She was angry at Minnie.
4. She lived far away.

**Infer. What does Mrs. Hale regret?**

Answers:

> ¶220: “I wish I had come over to see Minnie Foster sometimes.”

> ¶216: “I wish I had come over sometimes when _she_ was here.”

Near misses:

> ¶220: “Maybe because it’s down in a hollow and you don’t see the road.”
>
> Hint: That's where the house is. What does she wish? Check ¶220.

Prove it (✓ is right; shuffled on screen):

1. Minnie was lonely, and no one visited her. ✓
2. Minnie was too busy for friends.
3. Minnie had many visitors.
4. Minnie moved away.

#### Clue: Mrs. Hale's words about John Wright

**Locate. What does Mrs. Hale grant in Wright's favor?**

Answers:

> ¶229: “Yes—good; he didn’t drink, and kept his word as well as most, I guess, and paid his debts.”

Near misses:

> ¶227: “They say he was a good man.”
>
> Hint: That's what people say. What does Mrs. Hale grant? Check ¶229.

Prove it (✓ is right; shuffled on screen):

1. He didn't drink, kept his word, and paid his debts. ✓
2. He was cheerful.
3. He loved birds.
4. He gave to the church.

**Locate. What does she compare spending time with him to?**

Answers:

> ¶229: “Like a raw wind that gets to the bone.”

Near misses:

> ¶229: “Just to pass the time of day with him—[_Shivers._]”
>
> Hint: That's her shiver. What does she compare it to? Check ¶229.

Prove it (✓ is right; shuffled on screen):

1. A cold wind that chills you to the bone. ✓
2. A warm fire.
3. A quiet song.
4. A sunny day.

**Infer. How does her opinion of him differ from his reputation?**

Answers:

> ¶229: “But he was a hard man, Mrs. Peters.”

> ¶227: “They say he was a good man.”

Near misses:

> ¶94: “But I don’t think a place’d be any cheerfuller for John Wright’s being in it.”
>
> Hint: That's about the place. Where does she weigh both views? Check ¶229.

Prove it (✓ is right; shuffled on screen):

1. People called him good, but she found him hard and cold. ✓
2. She agrees he was kind.
3. She never met him.
4. Everyone hated him.

### Scene 3 (`the-law-and-the-women`)

Scene writing (Notice, Interpret, Craft): the questions from **Two kinds of crime**.

#### Clue: Two kinds of crime

**Locate. What does Mrs. Peters say must happen to wrongdoers?**

Answers:

> ¶296: “The law has got to punish crime, Mrs. Hale.”

> ¶152: “But Mrs. Hale, the law is the law.”

Near misses:

> ¶292: “I know what stillness is.”
>
> Hint: That's her memory. What does she say about the rules? Check ¶296.

Prove it (✓ is right; shuffled on screen):

1. She says the law must punish crime. ✓
2. Forgive them.
3. Let the women decide.
4. Ignore it.

**Locate. What does Mrs. Hale regret not doing?**

Answers:

> ¶298: “Oh, I _wish_ I’d come over here once in a while!”

Near misses:

> ¶298: “I wish you’d seen Minnie Foster when she wore a white dress with blue ribbons and stood up there in the choir and sang.”
>
> Hint: That's a memory. What does she regret? Check ¶298.

Prove it (✓ is right; shuffled on screen):

1. Visiting Minnie now and then. ✓
2. Calling the sheriff.
3. Moving away.
4. Buying a bird.

**Infer. What does Mrs. Hale call the real wrong?**

Answers:

> ¶298: “That was a crime!”

Near misses:

> ¶298: “I wish you’d seen Minnie Foster when she wore a white dress with blue ribbons and stood up there in the choir and sang.”
>
> Hint: That's Minnie long ago. What wrong does she name? Check ¶298.

Prove it (✓ is right; shuffled on screen):

1. Leaving Minnie alone and lonely was a wrong no law answers for. ✓
2. The bird's death was legal.
3. Mrs. Peters broke the law.
4. Minnie did nothing at all.

#### Clue: The stillness in Dakota

**Locate. What loss does Mrs. Peters remember from Dakota?**

Answers:

> ¶292: “When we homesteaded in Dakota, and my first baby died—after he was two years old, and me with no other then—”

Near misses:

> ¶292: “I know what stillness is.”
>
> Hint: That's what she knows. What happened there? Check ¶292.

Prove it (✓ is right; shuffled on screen):

1. Her first baby died. ✓
2. Her house burned.
3. Her husband left.
4. Her bird flew away.

**Locate. What does Mrs. Hale say the quiet would feel like once the music in the house was gone?**

Answers:

> ¶290: “If there’d been years and years of nothing, then a bird to sing to you, it would be awful—still, after the bird was still.”
>
> Proof phrase: *then a bird to sing to you, it would be awful*

Near misses:

> ¶292: “I know what stillness is.”
>
> Hint: That's Mrs. Peters. What does Mrs. Hale imagine? Check ¶290.

Prove it (✓ is right; shuffled on screen):

1. Awful, because the one bright thing would be gone. ✓
2. Peaceful and restful.
3. Exciting.
4. Exactly the same as before.

**Infer. How does Mrs. Peters catch her own feelings and change the subject?**

Answers:

> ¶296: “[_Pulling herself back._]”

> ¶296: “The law has got to punish crime, Mrs. Hale.”

Near misses:

> ¶292: “I know what stillness is.”
>
> Hint: That's her memory. How does she change course? Check ¶296.

Prove it (✓ is right; shuffled on screen):

1. She turns from her grief to talk about the law. ✓
2. She starts to cry and leaves.
3. She calls the sheriff.
4. She laughs it off.

#### Clue: The rope and the bird's neck

**Locate. What does the lawyer say about strangers breaking in?**

Answers:

> ¶270: “No sign at all of anyone having come from the outside.”

Near misses:

> ¶270: “Their own rope.”
>
> Hint: That's about the rope. What about strangers? Check ¶270.

Prove it (✓ is right; shuffled on screen):

1. There's no sign anyone came in from outside. ✓
2. A stranger broke in.
3. The door was smashed.
4. Neighbors saw a man.

**Locate. How did John Wright die?**

Answers:

> ¶283: “Killing a man while he slept, slipping a rope around his neck that choked the life out of him.”

Near misses:

> ¶283: “It was an awful thing was done in this house that night, Mrs. Hale.”
>
> Hint: That's how awful it was. How was it done? Check ¶283.

Prove it (✓ is right; shuffled on screen):

1. Someone strangled him with a rope while he slept. ✓
2. He was shot.
3. He fell down the stairs.
4. He was poisoned.

**Infer. Why does Mrs. Hale repeat those words and reach out the way she does?**

Answers:

> ¶285: “His neck.”

> ¶286: “[_Her hand goes out and rests on the bird-cage._”

Near misses:

> ¶283: “It was an awful thing was done in this house that night, Mrs. Hale.”
>
> Hint: That's Mrs. Peters. What does Mrs. Hale do? Check ¶285.

Prove it (✓ is right; shuffled on screen):

1. She links how Wright died to how the bird died. ✓
2. She wants to clean it.
3. She is tired.
4. She is looking for the key.

#### Clue: Mrs. Peters's kitten memory

**Locate. What happened to Mrs. Peters' pet when she was young?**

Answers:

> ¶275: “When I was a girl—my kitten—there was a boy took a hatchet, and before my eyes—and before I could get there—[_Covers her face an instant._]”
>
> Proof phrase: *there was a boy took a hatchet, and before my eyes*

Near misses:

> ¶275: “If they hadn’t held me back I would have—[_Catches herself, looks upstairs where steps are heard, falters weakly_]—hurt him.”
>
> Hint: That's what she wanted to do. What happened first? Check ¶275.

Prove it (✓ is right; shuffled on screen):

1. A boy killed her kitten with a hatchet. ✓
2. It ran away.
3. It grew old.
4. It was given away.

**Locate. What does she say she would have done to the boy?**

Answers:

> ¶275: “If they hadn’t held me back I would have—[_Catches herself, looks upstairs where steps are heard, falters weakly_]—hurt him.”

Near misses:

> ¶275: “When I was a girl—my kitten—there was a boy took a hatchet, and before my eyes—and before I could get there—[_Covers her face an instant._]”
>
> Hint: That's what happened. What would she have done? Check ¶275.

Prove it (✓ is right; shuffled on screen):

1. She would have hurt him. ✓
2. Forgiven him.
3. Told his mother.
4. Laughed.

**Infer. What does she insist nobody can be sure of?**

Answers:

> ¶288: “We don’t know who killed him.”

> ¶279: “We don’t know who killed the bird.”

Near misses:

> ¶275: “If they hadn’t held me back I would have—[_Catches herself, looks upstairs where steps are heard, falters weakly_]—hurt him.”
>
> Hint: That's her memory. What does she insist? Check ¶288.

Prove it (✓ is right; shuffled on screen):

1. They can't be sure who killed him. ✓
2. Whether the bird could sing.
3. What day it is.
4. Where the sheriff went.

### Scene 4 (`the-last-word`)

Scene writing (Notice, Interpret, Craft): the questions from **The missing motive**.

#### Clue: The missing motive

**Locate. What does the lawyer say is the one thing they lack?**

Answers:

> ¶309: “No, Peters, it’s all perfectly clear except a reason for doing it.”

Near misses:

> ¶309: “But you know juries when it comes to women.”
>
> Hint: That's about juries. What's missing? Check ¶309.

Prove it (✓ is right; shuffled on screen):

1. A reason, a motive, for the killing. ✓
2. A witness.
3. The weapon.
4. A confession.

**Locate. What did the attorney say earlier was required to convict?**

Answers:

> ¶148: “Mr. Henderson said coming out that what was needed for the case was a motive; something to show anger, or—sudden feeling.”

Near misses:

> ¶309: “Something to show—something to make a story about—a thing that would connect up with this strange way of doing it—”
>
> Hint: That's what he says now. What did he say earlier? Check ¶148.

Prove it (✓ is right; shuffled on screen):

1. A motive: something showing anger or sudden feeling. ✓
2. Fingerprints.
3. A second rope.
4. Nothing more.

**Infer. What kind of evidence does he hope to find?**

Answers:

> ¶309: “Something to show—something to make a story about—a thing that would connect up with this strange way of doing it—”

Near misses:

> ¶309: “But you know juries when it comes to women.”
>
> Hint: That's about juries. What does he hope for? Check ¶309.

Prove it (✓ is right; shuffled on screen):

1. Something dramatic to tell a jury, tied to the strange method. ✓
2. Proof the women did it.
3. Money in the house.
4. A lost letter.

#### Clue: The bundle for the jail

**Locate. How does the lawyer judge the items the women chose?**

Answers:

> ¶319: “Oh, I guess they’re not very dangerous things the ladies have picked out.”

Near misses:

> ¶317: “[_The LAWYER goes to the table, picks up the apron, laughs._”
>
> Hint: That's him laughing. What does he say about them? Check ¶319.

Prove it (✓ is right; shuffled on screen):

1. He thinks they are harmless trifles. ✓
2. He thinks they are evidence.
3. He takes them away.
4. He reads every label.

**Locate. Why does he decide Mrs. Peters can go unwatched?**

Answers:

> ¶319: “No, Mrs. Peters doesn’t need supervising.”

> ¶319: “For that matter, a sheriff’s wife is married to the law.”

Near misses:

> ¶321: “Not—just that way.”
>
> Hint: That's her reply. What's his reason? Check ¶319.

Prove it (✓ is right; shuffled on screen):

1. A sheriff's wife is on the law's side, he says. ✓
2. She is too old.
3. She is leaving town.
4. She told him so.

**Infer. What does Mrs. Peters' short answer suggest?**

Answers:

> ¶321: “Not—just that way.”

Near misses:

> ¶323: “Married to the law.”
>
> Hint: That's the sheriff. What does Mrs. Peters say? Check ¶321.

Prove it (✓ is right; shuffled on screen):

1. She may not see herself only on the law's side anymore. ✓
2. She fully agrees.
3. She didn't hear him.
4. She is angry at the sheriff.

#### Clue: The box in Mrs. Hale's coat pocket

**Locate. Why can't Mrs. Peters hide it in her bag?**

Answers:

> ¶328: “It is too big.”

Near misses:

> ¶328: “Suddenly MRS. PETERS throws back quilt pieces and tries to put the box in the bag she is wearing.”
>
> Hint: That's her trying. Why didn't it work? Check ¶328.

Prove it (✓ is right; shuffled on screen):

1. It doesn't fit. ✓
2. The men are watching.
3. The bag is full of fruit.
4. She changes her mind at once.

**Locate. Where does it end up?**

Answers:

> ¶328: “MRS. HALE snatches the box and puts it in the pocket of her big coat.”

Near misses:

> ¶328: “She opens box, starts to take bird out, cannot touch it, goes to pieces, stands there helpless.”
>
> Hint: That's Mrs. Peters freezing. Who takes it? Check ¶328.

Prove it (✓ is right; shuffled on screen):

1. In Mrs. Hale's coat pocket. ✓
2. In the stove.
3. With the sheriff.
4. Back in the basket.

**Infer. How do the two women decide what to do without speaking?**

Answers:

> ¶328: “Then MRS. HALE rises, hands tight together, looking intensely at MRS. PETERS, whose eyes make a slow turn, finally meeting MRS. HALE’S.”

> ¶328: “A moment MRS. HALE holds her, then her own eyes point the way to where the box is concealed.”

Near misses:

> ¶328: “The SHERIFF follows the COUNTY ATTORNEY into the other room.”
>
> Hint: That's the men leaving. How do the women decide? Check ¶328.

Prove it (✓ is right; shuffled on screen):

1. They share a long look and agree without words. ✓
2. They argue loudly.
3. They write a note.
4. They flip a coin.

#### Clue: The last line: knot it

**Locate. What do the men mock the women for wondering?**

Answers:

> ¶163: “They wonder if she was going to quilt it or just knot it!”

Near misses:

> ¶164: “[_The men laugh, the women look abashed._”
>
> Hint: That's their reaction. What did they repeat? Check ¶163.

Prove it (✓ is right; shuffled on screen):

1. Whether she would quilt it or knot it. ✓
2. Whether it would rain.
3. What to cook.
4. Who owned the farm.

**Locate. What does the lawyer ask the women at the end?**

Answers:

> ¶330: “She was going to—what is it you call it, ladies?”

Near misses:

> ¶330: “Well, Henry, at least we found out that she was not going to quilt it.”
>
> Hint: That's his joke. What does he ask? Check ¶330.

Prove it (✓ is right; shuffled on screen):

1. What they call that kind of finishing. ✓
2. Where the bird is.
3. Who killed John Wright.
4. When they'll leave.

**Infer. What does the attorney think the search turned up?**

Answers:

> ¶330: “Well, Henry, at least we found out that she was not going to quilt it.”

Near misses:

> ¶330: “[_Facetiously._]”
>
> Hint: That's how he says it. What does he think they found out? Check ¶330.

Prove it (✓ is right; shuffled on screen):

1. He thinks the quilt is a joke, so he misses what matters. ✓
2. He solved the case.
3. He found the bird.
4. He respects their work.

## Proof Race sprints (content only; the game mode isn't built yet)

### The Legend of Sleepy Hollow · Scene 1 (`empty-schoolhouse`)

Twelve sprint questions, approved. They are in `worlds/sleepy-hollow/world.json` (`scenes[0].sprints`), and `validate:worlds` checks each one: exact lines, near misses in the chunk with a ¶ hint, one thing per question, and no word roots shared with the answer.

**Teacher note for sprint #4** ("Which figures from long ago are blamed for the magic over this land?", ¶5.3): Irving's 1820 description of Native people reflects his era; pause here for discussion.

### Proof Race chunks: Gist checks and chunk sizes

Each chunk is the sprint question's paragraph (or the 2 to 4 sentence chunk for the smaller size). Gist shows these 3 summaries; the best one is marked ✓. The wrong ones are meant to be plausible: each misreads a detail of the chunk rather than being silly. validate:worlds checks there are 3 different summaries with exactly one best, and that the short chunk is 2 to 4 sentences of the paragraph and holds the answer.

**1. About how long a walk is it from the river port to the hollow?** (chunk: ¶3, short: sentences 1 to 4)

1. A busy river town is known for its noisy market days.
2. A quiet valley lies a short way from a small river town. ✓
3. A traveler gets lost on the river and ends up in a strange valley.

**2. Which birds are nearly the only noise in that glen?** (chunk: ¶3, short: sentences 4 to 5)

1. A busy river town is known for its noisy market days.
2. A traveler gets lost on the river and ends up in a strange valley.
3. A quiet valley lies a short way from a small river town. ✓

**3. What scared the narrator on his first hunt as a boy?** (chunk: ¶4, short: sentences 1 to 2)

1. The narrator remembers how still the valley was, even to a boy out hunting. ✓
2. The narrator remembers being chased out of the valley by a ghost one night.
3. The narrator remembers hunting with his father every Sunday in the valley.

**4. Which figures from long ago are blamed for the magic over this land?** (chunk: ¶5, short: sentences 2 to 4)

1. People say a spell hangs over the valley and makes its people dreamy and full of strange beliefs. ✓
2. The people of the valley laugh at magic and ignore the old stories.
3. A doctor and a chief fought over who would rule the valley.

**5. Which ghost outranks every other in these parts?** (chunk: ¶6, short: sentences 1 to 3)

1. The valley's main ghost is a soldier who guards travelers on the church road.
2. The valley's main ghost is a headless horseman said to ride out searching for his head. ✓
3. Historians proved that a Hessian soldier still lives near the old church.

**6. How was the rider wounded long ago?** (chunk: ¶6, short: sentences 2 to 4)

1. The valley's main ghost is a soldier who guards travelers on the church road.
2. Historians proved that a Hessian soldier still lives near the old church.
3. The valley's main ghost is a headless horseman said to ride out searching for his head. ✓

**7. What is the phantom searching for after dark?** (chunk: ¶6, short: sentences 2 to 4)

1. The valley's main ghost is a headless horseman said to ride out searching for his head. ✓
2. The valley's main ghost is a soldier who guards travelers on the church road.
3. Historians proved that a Hessian soldier still lives near the old church.

**8. What happens to people who move here from elsewhere?** (chunk: ¶8, short: sentences 1 to 2)

1. Newcomers are the only people in the valley who never see ghosts.
2. Even newcomers to the valley soon start dreaming and seeing ghosts. ✓
3. The valley's people send strangers away before the spell can reach them.

**9. Where was Ichabod born?** (chunk: ¶10, short: sentences 1 to 2)

1. Ichabod Crane, a farmer born in the valley, is short and strong.
2. Ichabod Crane is a handsome soldier who came to teach after the war.
3. Ichabod Crane, a schoolteacher from Connecticut, is tall, skinny and odd-looking. ✓

**10. How was Ichabod built?** (chunk: ¶10, short: sentences 4 to 5)

1. Ichabod Crane, a schoolteacher from Connecticut, is tall, skinny and odd-looking. ✓
2. Ichabod Crane, a farmer born in the valley, is short and strong.
3. Ichabod Crane is a handsome soldier who came to teach after the war.

**11. How did Ichabod get his meals and a bed?** (chunk: ¶13, short: sentences 1 to 4)

1. Ichabod's pay was so large that he rented the finest house in the valley.
2. Ichabod's pay was small, so he lived with his students' families, a week at each house. ✓
3. Ichabod lived alone in the schoolhouse and cooked his own meals.

**12. What did Ichabod teach on the side for coins?** (chunk: ¶15, short: sentences 1 to 2)

1. Ichabod disliked singing and stayed away from church on Sundays.
2. Ichabod earned his living mainly by preaching in the village church.
3. Ichabod also earned money teaching singing, and he was proud of his voice in church. ✓

<!-- expeditions:start -->
## Proof Race expeditions

Generated from world.json by `scripts/content-review.ts`. ✓ marks the best option. Standards are verified B.E.S.T. benchmarks (grade 7 codes shown; the class's grade picks the code).

### The Legend of Sleepy Hollow

#### Expedition: Into the Hollow (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "Tell me about the Headless Horseman." / "Where would a traveler run into him?"
- True: "He doesn't keep to the Hollow, not him. He's out on the highways too, and the ground around the old meeting house is where he likes to prowl."
  - Confirmed by: "His haunts are not confined to the valley, but extend at times to the adjacent roads, and especially to the vicinity of a church at no great distance."
- False (laughing): "He's out searching for the horse he lost, see, and he's never pressed. He takes his own sweet time getting home, slow as you please."
  - Disproved by: "Indeed, certain of the most authentic historians of those parts, who have been careful in collecting and collating the floating facts concerning this spectre, allege that the body of the trooper having been buried in the churchyard, the ghost rides forth to the scene of battle in nightly quest of his head, and that the rushing speed with which he sometimes passes along the Hollow, like a midnight blast, is owing to his being belated, and in a hurry to get back to the churchyard before daybreak."
- When caught: "Ha! All right, you got me. I just like to see folks jump."

**Hans Van Ripper**

- Question cards: "What should a newcomer know about this part of the country?" / "Tell me about the town and the valley near it."
- True: "The farm wives christened the town, on account of their men loitering at the inn whenever they went in to sell their crops."
  - Confirmed by: "This name was given, we are told, in former days, by the good housewives of the adjacent country, from the inveterate propensity of their husbands to linger about the village tavern on market days."
- False (head shake): "That hollow is a full day's journey from town, and I'll tell you plainly, it's the noisiest spot in all the county."
  - Disproved by: "Not far from this village, perhaps about two miles, there is a little valley or rather lap of land among high hills, which is one of the quietest places in the whole world."
- When caught: "Hmph. Fine. I may have stretched it a little."

**Katrina Van Tassel**

- Question cards: "Do the old tales take hold of people here?" / "Who believes the stories told in this valley?"
- True: "Folks who come here clear-headed and sensible don't stay that way. Give them a season, and they start spotting ghosts too."
  - Confirmed by: "However wide awake they may have been before they entered that sleepy region, they are sure, in a little time, to inhale the witching influence of the air, and begin to grow imaginative, to dream dreams, and see apparitions."
- False: "Only the families born in the Hollow believe those tales. Anyone who moves here from outside just laughs at them."
  - Disproved by: "It is remarkable that the visionary propensity I have mentioned is not confined to the native inhabitants of the valley, but is unconsciously imbibed by every one who resides there for a time."
  - Disproved by: "However wide awake they may have been before they entered that sleepy region, they are sure, in a little time, to inhale the witching influence of the air, and begin to grow imaginative, to dream dreams, and see apparitions."
- When caught: "Oh, you caught that? Clever. I only wanted to see if you were listening."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Whose Eyes?

**Chunk 1** (¶3 sentences 1 to 3; 138 words)

- Question: How sure is the storyteller about where the town's name came from?
- Key words highlighted: How sure, storyteller
- Choices: Not sure: he passes on a story he heard without promising it's true ✓ / Completely sure, because he was there when it was named / Sure, because the housewives told him themselves
- Proof words (any one): "I do not vouch for the fact"
- Refresher hint: Read his own words closely. Does he ever promise the story is true?
- Why: He says he does not vouch for the fact, so he is repeating a story, not swearing to it.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: A river town got its name, the narrator says, from husbands who lingered at the tavern. ✓ / A river town is famous for sailors who pray to St. Nicholas. / The narrator proves exactly how Tarry Town got its name.
- Discovery (vocabulary): "inveterate propensity". Inveterate propensity: a habit so old and strong it can't be broken.

##### Find It

**Chunk 2** (¶3 sentences 4 to 5; 73 words)

- Question: About how long a walk is it from the river port to the hollow?
- Key words highlighted: how long a walk
- Proof line: "Not far from this village, perhaps about two miles, there is a little valley or rather lap of land among high hills, which is one of the quietest places in the whole world."
- Refresher hint: Look for a distance, counted in miles.
- Why: The valley is perhaps about two miles from the village.
- Standards: ELA.K12.EE.1.1
- Gist check: A very quiet valley sits about two miles from the village. ✓ / A noisy brook floods the valley every spring. / The valley is far away and hard to reach.
- Discovery (figurative): "lull one to repose". Lull one to repose: the brook is so soft it could rock you to sleep.

##### Shades of Meaning

**Chunk 3** (¶4 sentences 1 to 3; 102 words) · shared words reviewed

- Question: The narrator calls his younger self a stripling. Why that word instead of plain boy?
- Key words highlighted: stripling, instead of plain boy
- Choices: It makes him sound young and untested, new at hunting ✓ / It shows he was the best hunter in the valley / It means he was sickly and weak
- Proof words (any one): "my first exploit"
- Refresher hint: Would an old hand call it his first try? Find his own words about the hunt.
- Why: Stripling paints a young, untested boy, and he calls the hunt his first exploit.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: The narrator remembers how still the valley was, even to a boy out hunting. ✓ / The narrator remembers being chased out of the valley by a ghost one night. / The narrator remembers hunting with his father every Sunday in the valley.
- Discovery (figurative): "angry echoes". Angry echoes: the echoes get a human feeling, as if the quiet woods were annoyed by the noise.

##### Word Detective

**Chunk 4** (¶5 sentences 1 to 2; 66 words) · shared words reviewed

- Question: In this chunk, what does listless mean?
- Key words highlighted: listless
- Choices: Lacking energy; slow and sleepy ✓ / Without a list or a plan / Full of nervous worry
- Proof words (any one): "drowsy, dreamy influence", "repose", "drowsy", "dreamy"
- Refresher hint: Find the words around it that feel sleepy.
- Why: Repose and a drowsy, dreamy influence tell you listless means low on energy.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: The valley's sleepy mood gave Sleepy Hollow its name. ✓ / The Dutch settlers left the Hollow because it was too quiet. / Boys from the Hollow are known for their hard work.
- Discovery (vocabulary): "sequestered glen". Sequestered glen: a hidden, out-of-the-way valley.

##### Figure It Out

**Chunk 5** (¶5 sentences 3 to 4; 78 words) · shared words reviewed

- Question: Read the words holds a spell over the minds of the good people. What kind of figurative language is this?
- Key words highlighted: holds a spell over the minds
- Choices: Metaphor: the valley's mood is called a spell, without like or as ✓ / Simile: a comparison that uses like or as / Hyperbole: a wild exaggeration for a laugh
- What does it mean? Something about the place shapes what people think and believe ✓ / A real witch is casting spells on the town / The people are tired from working too hard
- Refresher hint: Does a spell have to be real magic? Think about what keeps their minds dreamy.
- Why: The spell stands for the dreamy mood that rules how people think.
- Standards: ELA.7.R.3.1
- Gist check: People blame old magic for the spell that still hangs over the valley. ✓ / A doctor cured the settlers of a strange sleeping sickness. / Henry Hudson drove a wizard out of the valley.
- Discovery (vocabulary): "continual reverie". Reverie: a daydream. A continual reverie means drifting through life half-dreaming.

##### Read Between the Lines

**Chunk 6** (¶5 sentences 5 to 6; 74 words)

- Question: What can you infer about the people of the Hollow?
- Key words highlighted: infer
- Choices: They are quick to accept the uncanny as real ✓ / They are afraid to leave home after dark / They don't trust tales they hear
- Proof line: "They are given to all kinds of marvellous beliefs, are subject to trances and visions, and frequently see strange sights, and hear music and voices in the air."
- Proof line: "The whole neighborhood abounds with local tales, haunted spots, and twilight superstitions; stars shoot and meteors glare oftener across the valley than in any other part of the country, and the nightmare, with her whole ninefold, seems to make it the favorite scene of her gambols."
- Refresher hint: Look at what they see and hear that nobody else does.
- Why: They hold marvellous beliefs and see strange sights, so they accept the uncanny easily.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The people of the Hollow accept strange sights, and the valley is full of spooky tales. ✓ / The people of the Hollow laugh at ghost stories. / Scientists come to the valley to study stars and meteors.
- Discovery (figurative): "with her whole ninefold". The nightmare is pictured as a creature with her nine children, playing over the valley at night.

**Chunk 10** (¶9 sentences 1 to 3; 138 words)

- Question: What can you infer about how the narrator feels about the busy world beyond the Hollow?
- Key words highlighted: infer, busy world
- Choices: He treasures quiet places that stay the same while the rest of the country hurries on ✓ / He is excited by every new improvement in the country / He thinks the Hollow should catch up with the rest of New York
- Proof line: "I mention this peaceful spot with all possible laud, for it is in such little retired Dutch valleys, found here and there embosomed in the great State of New York, that population, manners, and customs remain fixed, while the great torrent of migration and improvement, which is making such incessant changes in other parts of this restless country, sweeps by them unobserved."
- Proof line: "They are like those little nooks of still water, which border a rapid stream, where we may see the straw and bubble riding quietly at anchor, or slowly revolving in their mimic harbor, undisturbed by the rush of the passing current."
- Refresher hint: Look at the words he picks for change and for the valley. Which does he praise?
- Why: He praises the valley with all possible laud because its customs remain fixed while a restless country sweeps by.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The narrator praises the Hollow as a quiet place that never seems to change. ✓ / The narrator warns that the Hollow is changing too fast. / The narrator says he never wants to see the Hollow again.
- Discovery (figurative): "nooks of still water". Nooks of still water: the valley is a calm pool beside a rushing river of change.

##### Catch the Lie

**Chunk 7** (¶6 sentences 1 to 2; 88 words)

- Question: Brom Bones tells the tale. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Brom Bones): "Every child in the Hollow knows this one. The Headless Horseman was a Hessian trooper who lost his head to a sword in some battle, and folks see him tearing through the dark at night."
- Proof line: "It is said by some to be the ghost of a Hessian trooper, whose head had been carried away by a cannon-ball, in some nameless battle during the Revolutionary War, and who is ever and anon seen by the country folk hurrying along in the gloom of night, as if on the wings of the wind."
- Refresher hint: Brom tells it with flair. Check exactly what took the trooper's head.
- Why: The story says a cannon-ball carried his head away, not a sword.
- Standards: ELA.K12.EE.1.1
- Gist check: The valley's main ghost is a headless horseman, said to be a soldier killed in battle. ✓ / A general of the Revolutionary War still rides through the Hollow. / The ghost is a farmer who lost his horse in a storm.
- Discovery (figurative): "on the wings of the wind". As if on the wings of the wind: the rider moves so fast he seems to fly.

##### Character Clue

**Chunk 8** (¶6 sentences 3 to 4; 115 words)

- Question: Which trait fits the headless spirit in this chunk?
- Key words highlighted: trait
- Choices: Driven and pressed for time, racing to beat the dawn ✓ / Calm and patient with travelers / Lost, unable to find his way home
- Proof words (any one): "in a hurry to get back to the churchyard before daybreak", "rushing speed"
- Refresher hint: Look at how fast he moves, and why.
- Why: He passes with rushing speed, in a hurry to get back to the churchyard before daybreak.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: The ghost rides out each night to look for his head and hurries back before dawn. ✓ / The ghost guards the church so no one can go inside. / Historians proved the ghost is only a story.
- Discovery (figurative): "like a midnight blast". Like a midnight blast: a simile. The rider rushes past like a sudden gust of night wind.

##### Theme Thread

**Chunk 9** (¶7 sentences 1 to 1, ¶8 sentences 1 to 2; 115 words)

- Question: Which idea keeps coming back in the story so far?
- Key words highlighted: keeps coming back
- Choices: This valley's dreamy spell takes hold of anyone who stays there ✓ / Hard work always wins in the end / Strangers are never welcome in small towns
- Proof line: "However wide awake they may have been before they entered that sleepy region, they are sure, in a little time, to inhale the witching influence of the air, and begin to grow imaginative, to dream dreams, and see apparitions."
- Proof line: "It is remarkable that the visionary propensity I have mentioned is not confined to the native inhabitants of the valley, but is unconsciously imbibed by every one who resides there for a time."
- Refresher hint: Even folks who arrive wide awake don't stay that way. Find where it says so.
- Why: The same dreamy spell shows up again: anyone who stays begins to dream dreams and see apparitions.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: Everyone who lives in the Hollow, even newcomers, soon starts to dream and see ghosts. ✓ / Newcomers to the Hollow stay wide awake and laugh at the legend. / The Headless Horseman story is only told to children.
- Discovery (figurative): "region of shadows". Region of shadows: a dark, mysterious place where wild stories grow.

<!-- expeditions:end -->
