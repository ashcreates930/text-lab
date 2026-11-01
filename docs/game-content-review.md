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

#### Expedition: The Schoolmaster (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "What do you make of the new schoolmaster?" / "Tell me about the schoolhouse."
- True: "That little log school? Any robber could slip inside without trouble, but he'd have a terrible time escaping again."
  - Confirmed by: "It was most ingeniously secured at vacant hours, by a withe twisted in the handle of the door, and stakes set against the window shutters; so that though a thief might get in with perfect ease, he would find some embarrassment in getting out,--an idea most probably borrowed by the architect, Yost Van Houten, from the mystery of an eelpot."
- False (laughing): "That beanpole? Folks say he's built as solid and stocky as a blacksmith, with tiny fists to match."
  - Disproved by: "He was tall, but exceedingly lank, with narrow shoulders, long arms and legs, hands that dangled a mile out of his sleeves, feet that might have served for shovels, and his whole frame most loosely hung together."
- When caught: "Ha! Fine, he's a beanpole through and through. I was just having fun."

**Hans Van Ripper**

- Question cards: "How does the schoolmaster earn his keep?" / "What is he like when he stays with a family?"
- True: "He moves from one family to the next every seven days, and everything he owns fits in one bundle."
  - Confirmed by: "With these he lived successively a week at a time, thus going the rounds of the neighborhood, with all his worldly effects tied up in a cotton handkerchief."
- False (head shake): "He never lifts a finger for us, not one chore. He just sits by the hearth and eats."
  - Disproved by: "He assisted the farmers occasionally in the lighter labors of their farms, helped to make hay, mended the fences, took the horses to water, drove the cows from pasture, and cut wood for the winter fire."
- When caught: "Hmph. All right, he helped now and then. I'll grant him that."

**Katrina Van Tassel**

- Question cards: "What is he like at church?" / "Does he teach anything besides lessons?"
- True: "On the Lord's day he plants himself before the choir loft with his best voices, sure he outshines the minister."
  - Confirmed by: "It was a matter of no little vanity to him on Sundays, to take his station in front of the church gallery, with a band of chosen singers; where, in his own mind, he completely carried away the palm from the parson."
- False: "He has no ear for music at all and never gives lessons in it, not for any amount of coin."
  - Disproved by: "In addition to his other vocations, he was the singing-master of the neighborhood, and picked up many bright shillings by instructing the young folks in psalmody."
- When caught: "Oh, you checked! He does teach music. I wanted to see who was paying attention."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Find It

**Chunk 1** (¶10 sentences 1 to 3; 97 words)

- Question: Where was the new teacher born?
- Key words highlighted: born
- Proof line: "He was a native of Connecticut, a State which supplies the Union with pioneers for the mind as well as for the forest, and sends forth yearly its legions of frontier woodmen and country schoolmasters."
- Refresher hint: Look for the place he comes from.
- Why: He was a native of Connecticut.
- Standards: ELA.K12.EE.1.1
- Gist check: A Connecticut schoolmaster named Ichabod Crane came to teach the Hollow's children. ✓ / A Connecticut farmer named Ichabod Crane came to clear the Hollow's forests. / A traveling preacher named Ichabod Crane came to build the Hollow a church.
- Discovery (vocabulary): "worthy wight". Wight: an old word for a person. A worthy wight is a fine fellow, said with a wink.

**Chunk 8** (¶14 sentences 1 to 2; 79 words)

- Question: Which line lists the work Ichabod did to earn his keep?
- Key words highlighted: earn his keep
- Proof line: "He assisted the farmers occasionally in the lighter labors of their farms, helped to make hay, mended the fences, took the horses to water, drove the cows from pasture, and cut wood for the winter fire."
- Refresher hint: Look for a list of jobs.
- Why: He helped make hay, mended the fences, watered the horses, drove the cows and cut wood.
- Standards: ELA.K12.EE.1.1
- Gist check: Ichabod makes himself useful to farm families by helping with the lighter chores. ✓ / Ichabod refuses to help on the farms because he thinks chores are beneath him. / Ichabod hires workers to do the farm chores in exchange for lessons.
- Discovery (vocabulary): "mere drones". Drones are male bees that do no work. Some farmers think teachers are just as idle.

##### Figure It Out

**Chunk 2** (¶10 sentences 4 to 6; 119 words) · shared words reviewed

- Question: Read the words looked like a weather-cock. What kind of figurative language is this?
- Key words highlighted: weather-cock
- Choices: Simile: it compares his head to a weather vane using like ✓ / Metaphor: it says his head is a weather vane, without like / Personification: it gives a weather vane human feelings
- What does it mean? His small head sits high on a thin neck, turning this way and that ✓ / He always knows exactly what tomorrow's weather will be / His head is painted in bright colors like a barn roof
- Refresher hint: A weather vane sits on top of a pole and swings around. Picture his head and neck.
- Why: Like a weather-cock on a spindle: a small head perched high on a thin neck.
- Standards: ELA.7.R.3.1
- Gist check: The narrator describes Ichabod as tall, skinny and loosely put together, like a scarecrow. ✓ / The narrator describes Ichabod as short, stout and strong, like the village blacksmith. / The narrator describes Ichabod as handsome and neat, like a gentleman from the city.
- Discovery (figurative): "genius of famine". The genius of famine: Ichabod looks so bony he could be the spirit of hunger itself.

##### Read Between the Lines

**Chunk 3** (¶11 sentences 1 to 2; 86 words)

- Question: What can you infer about where Ichabod holds class?
- Key words highlighted: infer
- Choices: It is plain and patched together from whatever was at hand ✓ / It is the grandest place in the whole valley / It is brand new, put up by skilled workers from town
- Proof line: "His schoolhouse was a low building of one large room, rudely constructed of logs; the windows partly glazed, and partly patched with leaves of old copybooks."
- Refresher hint: Look at what fills the window holes.
- Why: It is rudely built of logs, with windows patched with old copybook pages.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The schoolhouse is a rough log room that is easy to get into but hard to leave. ✓ / The schoolhouse is a stone hall with strong locks on every single door. / The schoolhouse has burned down, so the classes now meet in the church.
- Discovery (vocabulary): "mystery of an eelpot". An eelpot is a trap eels swim into easily but can't get out of, just like the schoolhouse for a thief.

**Chunk 6** (¶13 sentences 1 to 2; 58 words)

- Question: Why might Ichabod pick certain children to escort after class?
- Key words highlighted: escort
- Choices: He hopes for a good meal or a chance to meet pretty sisters ✓ / He wants to keep the youngest pupils safe from ghosts / He is paid extra for every child he brings back
- Proof line: "When school hours were over, he was even the companion and playmate of the larger boys; and on holiday afternoons would convoy some of the smaller ones home, who happened to have pretty sisters, or good housewives for mothers, noted for the comforts of the cupboard."
- Refresher hint: Look at which families he chooses.
- Why: He walks home the ones with pretty sisters or mothers noted for the comforts of the cupboard.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: After school, Ichabod befriends pupils, especially those with good cooks or pretty sisters. ✓ / After school, Ichabod locks himself in the schoolhouse to study his books. / After school, Ichabod works in the fields to earn a second salary.
- Discovery (figurative): "comforts of the cupboard". The comforts of the cupboard: a funny way to say good food at home.

##### Character Clue

**Chunk 4** (¶11 sentences 3 to 6; 130 words)

- Question: Which trait fits Ichabod in the classroom?
- Key words highlighted: trait
- Choices: Strict, quick to punish with the birch switch ✓ / Gentle, never raising his voice at anyone / Lazy, letting the children do as they like
- Proof words (any one): "the appalling sound of the birch", "Spare the rod and spoil the child"
- Refresher hint: Listen for the sounds that break into the lessons.
- Why: The appalling sound of the birch and his motto, spare the rod, show he punishes often.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Ichabod's lonely schoolhouse hums with lessons, and he is quick to use the switch. ✓ / Ichabod's busy schoolhouse is silent because he never lets anyone speak. / Ichabod's pupils run the school while he naps under the birch tree.
- Discovery (figurative): "like the hum of a beehive". A simile: the pupils' murmuring voices sound like busy bees.

##### Whose Eyes?

**Chunk 5** (¶12 sentences 1 to 3; 149 words)

- Question: How does the narrator want readers to see Ichabod's punishments?
- Key words highlighted: narrator
- Choices: As fair in Ichabod's own eyes, while the narrator teases him ✓ / As cruel acts the narrator plainly condemns / As rare events that almost never really happened
- Proof line: "I would not have it imagined, however, that he was one of those cruel potentates of the school who joy in the smart of their subjects; on the contrary, he administered justice with discrimination rather than severity; taking the burden off the backs of the weak, and laying it on those of the strong."
- Refresher hint: Notice how the narrator defends him, and how grand the words get.
- Why: The narrator insists he was no cruel potentate and did justice with discrimination, a playful defense.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: The narrator says Ichabod punished fairly, sparing weak boys and doubling it for tough ones. ✓ / The narrator says Ichabod never punished anyone, even the rudest boys in class. / The narrator says the parents punished Ichabod for being far too strict.
- Discovery (vocabulary): "cruel potentates". Potentate: a powerful ruler. The narrator jokes that a schoolmaster rules his class like a king.

##### Word Detective

**Chunk 7** (¶13 sentences 3 to 4; 92 words) · shared words reviewed

- Question: In this chunk, what does dilating mean?
- Key words highlighted: dilating
- Choices: Stretching wider to hold more ✓ / Shrinking smaller and smaller / Shining brightly in the dark
- Proof words (any one): "a huge feeder", "anaconda"
- Refresher hint: Find the words around it about how much he eats.
- Why: He is a huge feeder with the dilating powers of an anaconda: his stomach stretches to hold a feast.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: Ichabod is poorly paid and eats a lot, so he lives a week at a time with each farm family. ✓ / Ichabod is wealthy and eats little, so he buys a fine house beside the church. / Ichabod is poorly paid, so he takes food from the farmers' cellars at night.
- Discovery (vocabulary): "worldly effects". Worldly effects: everything a person owns. Ichabod's fit in one handkerchief.

##### Catch the Lie

**Chunk 9** (¶14 sentences 3 to 4; 77 words)

- Question: Hans Van Ripper remembers the schoolmaster. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Hans Van Ripper): "That schoolmaster was a stern one even in our homes. He had no patience for little ones and would never so much as hold a baby."
- Proof line: "He found favor in the eyes of the mothers by petting the children, particularly the youngest; and like the lion bold, which whilom so magnanimously the lamb did hold, he would sit with a child on one knee, and rock a cradle with his foot for whole hours together."
- Refresher hint: Hans sounds sure. Check how Ichabod treated the youngest children.
- Why: He petted the youngest and would sit with a child on one knee, rocking a cradle for hours.
- Standards: ELA.K12.EE.1.1
- Gist check: Away from school, Ichabod turns gentle and wins over mothers by caring for their children. ✓ / Away from school, Ichabod stays strict and frightens the youngest children of the house. / Away from school, Ichabod avoids the children and talks only with the farmers.
- Discovery (figurative): "the lion bold". Like the lion bold: Ichabod, lord of the schoolroom, turns as gentle as a lion holding a lamb.

##### Theme Thread

**Chunk 10** (¶15 sentences 1 to 2; 68 words)

- Question: Which idea about Ichabod keeps showing up?
- Key words highlighted: keeps showing up
- Choices: He thinks highly of himself and enjoys being admired ✓ / He is shy and hides from attention whenever he can / He cares only about money and never about praise
- Proof line: "It was a matter of no little vanity to him on Sundays, to take his station in front of the church gallery, with a band of chosen singers; where, in his own mind, he completely carried away the palm from the parson."
- Refresher hint: Look at how he feels standing before the singers.
- Why: It was a matter of no little vanity to him, and in his own mind he outshone the parson.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: Ichabod also teaches singing and proudly leads the church choir on Sundays. ✓ / Ichabod also preaches sermons and takes the parson's place on Sundays. / Ichabod also plays the fiddle at every barn dance in the valley.
- Discovery (figurative): "carried away the palm". Carried away the palm: won the prize. Ichabod believes he outshines the parson.

#### Expedition: Tales by the Fire (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "What does the schoolmaster believe in?" / "What frightens him most?"
- True: "He keeps an old volume about sorcery in the colonies and trusts every word of it."
  - Confirmed by: "He was, moreover, esteemed by the women as a man of great erudition, for he had read several books quite through, and was a perfect master of Cotton Mather’s “History of New England Witchcraft,” in which, by the way, he most firmly and potently believed."
- False (laughing): "Bugs don't bother him one bit. A June bug could smack right into his face and he'd just laugh."
  - Disproved by: "The fireflies, too, which sparkled most vividly in the darkest places, now and then startled him, as one of uncommon brightness would stream across his path; and if, by chance, a huge blockhead of a beetle came winging his blundering flight against him, the poor varlet was ready to give up the ghost, with the idea that he was struck with a witch’s token."
- When caught: "Ha! You're right, a bug nearly finished him off. I wish I'd seen it."

**Hans Van Ripper**

- Question cards: "How does he spend his evenings?" / "What does he talk about with the old folks?"
- True: "He scares the grandmothers silly, telling them the earth spins about and they spend part of each day upside down."
  - Confirmed by: "He would delight them equally by his anecdotes of witchcraft, and of the direful omens and portentous sights and sounds in the air, which prevailed in the earlier times of Connecticut; and would frighten them woefully with speculations upon comets and shooting stars; and with the alarming fact that the world did absolutely turn round, and that they were half the time topsy-turvy!"
- False (head shake): "He keeps to himself when the snow comes and won't spend his nights chatting with the grandmothers."
  - Disproved by: "Another of his sources of fearful pleasure was to pass long winter evenings with the old Dutch wives, as they sat spinning by the fire, with a row of apples roasting and spluttering along the hearth, and listen to their marvellous tales of ghosts and goblins, and haunted fields, and haunted brooks, and haunted bridges, and haunted houses, and particularly of the headless horseman, or Galloping Hessian of the Hollow, as they sometimes called him."
- When caught: "Hmph. Fine. He was at every fireside in the valley, eating apples."

**Katrina Van Tassel**

- Question cards: "What do the young ladies think of him?" / "How does he act after Sunday worship?"
- True: "After worship he strolls past the graves with us girls, picking us fruit and reading the stones aloud."
  - Confirmed by: "How he would figure among them in the churchyard, between services on Sundays; gathering grapes for them from the wild vines that overran the surrounding trees; reciting for their amusement all the epitaphs on the tombstones; or sauntering, with a whole bevy of them, along the banks of the adjacent millpond; while the more bashful country bumpkins hung sheepishly back, envying his superior elegance and address."
- False: "The ladies around here think a teacher is nothing special, no finer than any plowboy."
  - Disproved by: "The schoolmaster is generally a man of some importance in the female circle of a rural neighborhood; being considered a kind of idle, gentlemanlike personage, of vastly superior taste and accomplishments to the rough country swains, and, indeed, inferior in learning only to the parson."
- When caught: "Caught me. We do think a teacher is rather grand. Don't tell him I said so."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Whose Eyes?

**Chunk 1** (¶15 sentences 3 to 4; 108 words)

- Question: How does the narrator treat Ichabod's singing?
- Key words highlighted: narrator
- Choices: As a joke, tracing odd church sounds back to his nose ✓ / As serious praise for a truly gifted performer / As a ghost story told to frighten the children
- Proof line: "Certain it is, his voice resounded far above all the rest of the congregation; and there are peculiar quavers still to be heard in that church, and which may even be heard half a mile off, quite to the opposite side of the millpond, on a still Sunday morning, which are said to be legitimately descended from the nose of Ichabod Crane."
- Refresher hint: Where does the narrator say those strange quavers come from?
- Why: The quavers still heard half a mile off are said to descend from the nose of Ichabod Crane, a playful exaggeration.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: Ichabod sings louder than everyone, and he gets by through many small, clever jobs. ✓ / Ichabod sings so softly that nobody in the church can ever hear him. / Ichabod gets rich from one big job and stops working altogether.
- Discovery (figurative): "by hook and by crook". By hook and by crook: by any means he can manage.

##### Read Between the Lines

**Chunk 2** (¶16 sentences 1 to 2; 80 words)

- Question: What can you infer about how families treat a visiting teacher?
- Key words highlighted: infer
- Choices: They put out their best dishes to impress him ✓ / They hide their food so he won't eat it all / They ignore him and keep working in the barn
- Proof line: "His appearance, therefore, is apt to occasion some little stir at the tea-table of a farmhouse, and the addition of a supernumerary dish of cakes or sweetmeats, or, peradventure, the parade of a silver teapot."
- Refresher hint: Look at what appears on the table when he arrives.
- Why: His arrival brings an extra dish of cakes, or even the silver teapot.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Country women think the schoolmaster is refined, so families bring out treats when he visits. ✓ / Country women think the schoolmaster is rude, so families lock their doors when he visits. / Country women think the schoolmaster is poor, so families send him food every night.
- Discovery (vocabulary): "supernumerary dish". Supernumerary: extra. The family adds an extra dish of cakes for the guest.

**Chunk 7** (¶18 sentences 7 to 7; 62 words)

- Question: What can you infer about why Ichabod bursts into song on lonely walks?
- Key words highlighted: infer
- Choices: He is trying to calm his own fear ✓ / He wants the farmers to hire him / He is practicing for a singing contest
- Proof line: "His only resource on such occasions, either to drown thought or drive away evil spirits, was to sing psalm tunes and the good people of Sleepy Hollow, as they sat by their doors of an evening, were often filled with awe at hearing his nasal melody, “in linked sweetness long drawn out,” floating from the distant hill, or along the dusky road."
- Refresher hint: What does singing chase away?
- Why: Singing psalm tunes was his only way to drown thought or drive away evil spirits.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: To fight his fear, Ichabod sings hymns, and neighbors hear his nasal voice in the dark. ✓ / To show off, Ichabod sings love songs, and neighbors throw open their windows. / To earn money, Ichabod sings at doors, and neighbors pay him in apples.
- Discovery (vocabulary): "nasal melody". Nasal melody: singing through the nose. Ichabod's hymns float over the hills.

##### Character Clue

**Chunk 3** (¶16 sentences 3 to 4; 82 words)

- Question: Which trait does Ichabod show with the young women?
- Key words highlighted: trait
- Choices: Showy and eager to impress ✓ / Shy and tongue-tied around them / Rude and bored by their company
- Proof words (any one): "superior elegance and address", "reciting for their amusement"
- Refresher hint: Look at how he performs for them, and how the other young men feel.
- Why: He recites for their amusement, and the bumpkins envy his superior elegance and address.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: The young women adore Ichabod, who entertains them while the shy farm boys look on jealously. ✓ / The young women laugh at Ichabod, who hides from them behind the church on Sundays. / The young women ignore Ichabod, who spends his Sundays reading alone by the millpond.
- Discovery (vocabulary): "a whole bevy of them". Bevy: a group, often of young women, like a flock of birds.

##### Word Detective

**Chunk 4** (¶17 sentences 1 to 2; 77 words) · shared words reviewed

- Question: In this chunk, what does erudition mean?
- Key words highlighted: erudition
- Choices: Deep learning from reading many books ✓ / A loud and pleasant singing voice / A habit of gossiping about neighbors
- Proof words (any one): "read several books quite through"
- Refresher hint: What has he done that makes the women think he is learned?
- Why: He had read several books quite through, so they think him a man of great erudition: great learning.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: Ichabod carries gossip from house to house and is admired for reading books on witchcraft. ✓ / Ichabod refuses to gossip and is mocked for never reading a single book. / Ichabod prints a newspaper and sells copies to every family in the valley.
- Discovery (figurative): "travelling gazette". A traveling gazette: Ichabod is like a walking newspaper, spreading news as he goes.

##### Figure It Out

**Chunk 5** (¶18 sentences 1 to 4; 105 words) · shared words reviewed

- Question: Read the words for his capacious swallow. What kind of figurative language is this?
- Key words highlighted: capacious swallow
- Choices: Metaphor: believing stories is described as swallowing food ✓ / Simile: it compares stories to food using like or as / Onomatopoeia: the word swallow imitates a sound
- What does it mean? He will believe any tale, however wild ✓ / He eats huge meals while reading stories / He tells his stories much too fast
- Refresher hint: Is he really eating the tales? Think about what he does with a story he hears.
- Why: His capacious swallow means his huge appetite for believing marvels: no tale is too wild for him.
- Standards: ELA.7.R.3.1
- Gist check: Ichabod is clever yet believes every wild tale, and he reads ghost stories until dark. ✓ / Ichabod is foolish and doubts every tale, so he never reads ghost stories. / Ichabod is clever and writes ghost stories that he sells in town.
- Discovery (vocabulary): "simple credulity". Credulity: being too ready to believe things.

##### Find It

**Chunk 6** (¶18 sentences 5 to 6; 136 words)

- Question: Which line describes a bug that nearly frightens him to death?
- Key words highlighted: bug
- Proof line: "The fireflies, too, which sparkled most vividly in the darkest places, now and then startled him, as one of uncommon brightness would stream across his path; and if, by chance, a huge blockhead of a beetle came winging his blundering flight against him, the poor varlet was ready to give up the ghost, with the idea that he was struck with a witch’s token."
- Refresher hint: Look for something with wings that crashes into him.
- Why: A huge blockhead of a beetle flies against him, and he is ready to give up the ghost.
- Standards: ELA.K12.EE.1.1
- Gist check: Walking home at dusk, Ichabod jumps at every bird, toad and beetle he hears. ✓ / Walking home at dusk, Ichabod calmly names each bird, toad and beetle he hears. / Walking home at dusk, Ichabod hunts birds and toads for his supper.
- Discovery (figurative): "give up the ghost". Give up the ghost: to die. A beetle bumping him nearly scares him to death.

##### Theme Thread

**Chunk 8** (¶19 sentences 1 to 2; 138 words)

- Question: Which idea keeps coming up in these pages?
- Key words highlighted: keeps coming up
- Choices: People in the valley love to share and believe eerie stories ✓ / Hard work on the farm matters more than school / Neighbors in the Hollow distrust every outsider
- Proof line: "Another of his sources of fearful pleasure was to pass long winter evenings with the old Dutch wives, as they sat spinning by the fire, with a row of apples roasting and spluttering along the hearth, and listen to their marvellous tales of ghosts and goblins, and haunted fields, and haunted brooks, and haunted bridges, and haunted houses, and particularly of the headless horseman, or Galloping Hessian of the Hollow, as they sometimes called him."
- Refresher hint: What do Ichabod and the old wives trade all evening?
- Why: They trade marvellous tales of ghosts, goblins and the headless horseman, again showing the valley's love of the uncanny.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: On winter nights Ichabod trades ghost tales with old Dutch wives by the fire. ✓ / On winter nights Ichabod teaches old Dutch wives to read by the fire. / On winter nights Ichabod goes to bed early and avoids the old Dutch wives.
- Discovery (figurative): "fearful pleasure". Fearful pleasure: he loves being scared, both at once.

##### Shades of Meaning

**Chunk 9** (¶20 sentences 1 to 3; 93 words) · shared words reviewed

- Question: Why does the narrator call his look wistful instead of just sad?
- Key words highlighted: wistful
- Choices: It shows a longing for the warm, safe homes he sees ✓ / It shows he is angry at the people inside / It shows he is bored by the empty fields
- Proof words (any one): "snugly cuddling in the chimney corner"
- Refresher hint: Think about where he would rather be. Find the cozy place he just left.
- Why: Wistful means longing: he has just left snugly cuddling in the chimney corner, and every lit window reminds him of it.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: Ichabod enjoys the cozy fireside tales but pays for them with a terrifying walk home. ✓ / Ichabod hates the fireside tales but enjoys a peaceful walk home afterward. / Ichabod stays the night by the fire so he never has to walk home.
- Discovery (figurative): "dearly purchased". Dearly purchased: the fun had a high price, paid in fear on the way home.

##### Catch the Lie

**Chunk 10** (¶20 sentences 4 to 6; 92 words)

- Question: Katrina describes his winter walks. One thing she says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Katrina Van Tassel): "Poor Ichabod would stroll home through the snow without a care in the world, never once glancing behind him."
- Proof line: "How often did he shrink with curdling awe at the sound of his own steps on the frosty crust beneath his feet; and dread to look over his shoulder, lest he should behold some uncouth being tramping close behind him!"
- Refresher hint: Check how he felt about his own steps, and whether he looked behind him.
- Why: He shrank at the sound of his own steps and dreaded looking over his shoulder.
- Standards: ELA.K12.EE.1.1
- Gist check: Snowy bushes, his own footsteps and the wind all make Ichabod think a ghost is near. ✓ / Snowy bushes, his own footsteps and the wind all make Ichabod feel calm and sleepy. / Snowy bushes, his own footsteps and the wind all help Ichabod find the road home.
- Discovery (figurative): "like a sheeted spectre". A simile: a snow-covered bush looks like a ghost wrapped in a sheet.

#### Expedition: The Van Tassel Farm (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "What is Katrina's family like?" / "What does the schoolmaster want?"
- True: "She has no brothers or sisters, and her pa is about the richest man in these parts."
  - Confirmed by: "Among the musical disciples who assembled, one evening in each week, to receive his instructions in psalmody, was Katrina Van Tassel, the daughter and only child of a substantial Dutch farmer."
- False (laughing): "The schoolmaster saw all that livestock and never once thought about supper. Not him."
  - Disproved by: "The pedagogue’s mouth watered as he looked upon this sumptuous promise of luxurious winter fare."
- When caught: "Ha! Of course he thought about supper. He thinks of nothing else."

**Hans Van Ripper**

- Question cards: "What is old Baltus like?" / "Tell me about the Van Tassel place."
- True: "He hardly ever thinks past his own fences, but inside them all is cozy and in good order."
  - Confirmed by: "He seldom, it is true, sent either his eyes or his thoughts beyond the boundaries of his own farm; but within those everything was snug, happy and well-conditioned."
- False (head shake): "His place sits up on a bare, windy hilltop, miles from any water."
  - Disproved by: "His stronghold was situated on the banks of the Hudson, in one of those green, sheltered, fertile nooks in which the Dutch farmers are so fond of nestling."
- When caught: "Hmph. It's in a snug green nook by the water. I misspoke."

**Katrina Van Tassel**

- Question cards: "How do you like to dress?" / "Where did your family's jewelry come from?"
- True: "The jewelry I wear crossed the ocean with my family long ago, all the way from Holland."
  - Confirmed by: "She wore the ornaments of pure yellow gold, which her great-great-grandmother had brought over from Saardam; the tempting stomacher of the olden time, and withal a provokingly short petticoat, to display the prettiest foot and ankle in the country round."
- False: "I only ever wear the newest styles. Nothing from the past for me."
  - Disproved by: "She was withal a little of a coquette, as might be perceived even in her dress, which was a mixture of ancient and modern fashions, as most suited to set off her charms."
- When caught: "You noticed. I do like mixing the past and the present. It suits me."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Whose Eyes?

**Chunk 1** (¶21 sentences 1 to 1; 102 words)

- Question: What does the narrator's joke at the end of this chunk suggest?
- Key words highlighted: narrator's joke
- Choices: That a woman will trouble Ichabod more than any ghost ✓ / That Ichabod will soon meet the real Headless Horseman / That Ichabod plans to leave the Hollow forever
- Proof line: "All these, however, were mere terrors of the night, phantoms of the mind that walk in darkness; and though he had seen many spectres in his time, and been more than once beset by Satan in divers shapes, in his lonely perambulations, yet daylight put an end to all these evils; and he would have passed a pleasant life of it, in despite of the Devil and all his works, if his path had not been crossed by a being that causes more perplexity to mortal man than ghosts, goblins, and the whole race of witches put together, and that was--a woman."
- Refresher hint: Read the very last words of the chunk. What causes more perplexity than ghosts?
- Why: The narrator says a woman causes more perplexity than ghosts, goblins and witches put together.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: Daylight ends Ichabod's night fears, but a woman is about to cause him real trouble. ✓ / Daylight brings new fears to Ichabod, but a woman helps him feel brave again. / Daylight never reaches the Hollow, so Ichabod's fears never leave him at all.
- Discovery (figurative): "phantoms of the mind". Phantoms of the mind: ghosts that exist only in his imagination.

##### Word Detective

**Chunk 2** (¶22 sentences 1 to 2; 66 words) · shared words reviewed

- Question: In this chunk, what do the words vast expectations mean?
- Key words highlighted: vast expectations
- Choices: A large fortune she is expected to inherit ✓ / Very high hopes for her singing voice / A long list of chores she must finish
- Proof words (any one): "only child of a substantial Dutch farmer"
- Refresher hint: Whose daughter is she, and how many children does he have?
- Why: As the only child of a substantial farmer, she can expect to inherit everything.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: Katrina, the only child of a rich farmer, joins Ichabod's singing class and is famous in the valley. ✓ / Katrina, the youngest of ten poor children, sweeps Ichabod's schoolhouse every evening. / Katrina, a traveler from the city, teaches the singing class in Ichabod's place.
- Discovery (figurative): "plump as a partridge". A simile comparing Katrina to a plump little bird.

##### Character Clue

**Chunk 3** (¶22 sentences 3 to 4; 73 words)

- Question: Which trait do Katrina's clothes reveal?
- Key words highlighted: trait
- Choices: She likes to be noticed and admired ✓ / She doesn't care at all how she looks / She wears only plain work clothes
- Proof words (any one): "a little of a coquette"
- Refresher hint: The narrator names it outright. Find the word for someone who enjoys attention.
- Why: She is a little of a coquette: she enjoys being admired, and her outfit is chosen to set off her charms.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Katrina dresses to catch the eye, mixing old family gold with new fashions. ✓ / Katrina dresses plainly, hiding her family's old gold away in a chest. / Katrina sells her family's old gold to buy the newest city fashions.
- Discovery (vocabulary): "brought over from Saardam". Saardam: a town in Holland. The gold came with her family from the old country.

##### Find It

**Chunk 4** (¶23 sentences 1 to 3; 83 words)

- Question: Which line sums up what kind of man Katrina's father is?
- Key words highlighted: Katrina's father
- Proof line: "Old Baltus Van Tassel was a perfect picture of a thriving, contented, liberal-hearted farmer."
- Refresher hint: Look for a quick picture of him, full of describing words.
- Why: Old Baltus Van Tassel was a perfect picture of a thriving, contented, liberal-hearted farmer.
- Standards: ELA.K12.EE.1.1
- Gist check: Ichabod falls for Katrina, and her father turns out to be a happy, generous, well-off farmer. ✓ / Ichabod falls for Katrina, but her father turns out to be a stingy and angry farmer. / Ichabod ignores Katrina, but her father hires him to manage the whole farm.
- Discovery (vocabulary): "paternal mansion". Paternal mansion: her father's big house.

##### Read Between the Lines

**Chunk 5** (¶23 sentences 4 to 6; 107 words)

- Question: What can you infer about how Baltus feels about his riches?
- Key words highlighted: infer
- Choices: He enjoys plenty but has no need to show off ✓ / He worries constantly about losing his money / He loves to boast about how rich he is
- Proof line: "He was satisfied with his wealth, but not proud of it; and piqued himself upon the hearty abundance, rather than the style in which he lived."
- Refresher hint: Does he care more about having plenty, or about looking grand?
- Why: He was satisfied with his wealth but not proud of it, prizing abundance over style.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Baltus is content with his wealth, and his farm sits in a green, sheltered spot by the river. ✓ / Baltus is ashamed of being poor, and his farm sits on a dry, rocky hill far from water. / Baltus is bored with his wealth, and his farm sits in a crowded town square.
- Discovery (figurative): "His stronghold". Stronghold: a fort. The narrator jokes that the farmhouse is a castle.

**Chunk 9** (¶24 sentences 1 to 2; 85 words)

- Question: What can you infer Ichabod sees when he studies the animals?
- Key words highlighted: infer
- Choices: Future feasts he hopes to enjoy ✓ / Pets he would like to care for / Chores he would rather avoid
- Proof line: "The pedagogue’s mouth watered as he looked upon this sumptuous promise of luxurious winter fare."
- Proof line: "In his devouring mind’s eye, he pictured to himself every roasting-pig running about with a pudding in his belly, and an apple in his mouth; the pigeons were snugly put to bed in a comfortable pie, and tucked in with a coverlet of crust; the geese were swimming in their own gravy; and the ducks pairing cosily in dishes, like snug married couples, with a decent competency of onion sauce."
- Refresher hint: What happens to his mouth as he looks?
- Why: His mouth watered, and in his mind's eye every pig and pigeon was already roasted or baked in a pie.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Ichabod looks at the animals and imagines them all cooked and served as dinner. ✓ / Ichabod looks at the animals and imagines them all as his loyal pets. / Ichabod looks at the animals and imagines selling them at the market.
- Discovery (figurative): "coverlet of crust". A coverlet is a blanket: the pigeons are tucked into a pie under a crust blanket.

##### Figure It Out

**Chunk 6** (¶23 sentences 7 to 7; 93 words) · shared words reviewed

- Question: Read the words might have served for a church. What kind of figurative language is this?
- Key words highlighted: served for a church
- Choices: Hyperbole: the barn is so huge it could be a church ✓ / Simile: it compares the barn to a church using like / Personification: the barn prays like a person
- What does it mean? The barn is enormous ✓ / The barn holds Sunday worship / The barn is quiet and peaceful
- Refresher hint: Is it really a church? Think about why someone would say it could be one.
- Why: The barn is so vast it might have served for a church: an exaggeration showing its size.
- Standards: ELA.7.R.3.1
- Gist check: A huge barn overflows with the harvest while birds of every kind crowd its roof. ✓ / A tiny barn sits empty while a few birds peck at its broken roof. / A burned barn stands silent while the birds fly far away from the farm.
- Discovery (figurative): "bursting forth with the treasures of the farm". The barn is so full that the harvest seems to burst out of every crack.

##### Catch the Lie

**Chunk 7** (¶23 sentences 8 to 9; 69 words)

- Question: Brom Bones describes the Van Tassel place. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Brom Bones): "Old Van Tassel's place is a sorry sight. A couple of skinny hogs, and not a single goose in sight."
- Proof line: "Sleek unwieldy porkers were grunting in the repose and abundance of their pens, from whence sallied forth, now and then, troops of sucking pigs, as if to snuff the air."
- Proof line: "A stately squadron of snowy geese were riding in an adjoining pond, convoying whole fleets of ducks; regiments of turkeys were gobbling through the farmyard, and Guinea fowls fretting about it, like ill-tempered housewives, with their peevish, discontented cry."
- Refresher hint: Brom talks big. Check the pigs, and check the pond.
- Why: The porkers are sleek and grunting in abundance, and a stately squadron of snowy geese rides on the pond.
- Standards: ELA.K12.EE.1.1
- Gist check: Fat pigs, geese, ducks, turkeys and fussy guinea fowl fill the busy farmyard. ✓ / A few thin goats and one tired horse wander the quiet farmyard. / Wolves have chased every last animal out of the empty farmyard.
- Discovery (figurative): "like ill-tempered housewives". A simile: the noisy guinea fowl fuss like cranky people.

##### Shades of Meaning

**Chunk 8** (¶23 sentences 10 to 10; 60 words) · shared words reviewed

- Question: Why does the narrator call the rooster gallant instead of just proud?
- Key words highlighted: gallant
- Choices: It makes him sound like a brave, polite gentleman ✓ / It makes him sound sick and weak / It makes him sound lazy and sleepy
- Proof words (any one): "generously calling his ever-hungry family"
- Refresher hint: Gallant is a word for a fine gentleman. Find what he does with the food he discovers.
- Why: Gallant suggests a courteous gentleman, and he generously calls his ever-hungry family to share his find.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: A proud rooster struts by the barn and shares the food he finds with his family. ✓ / A sick rooster hides behind the barn and refuses to eat any food. / A greedy rooster eats all the food and chases his family away.
- Discovery (figurative): "pattern of a husband". The rooster is described like a model husband and gentleman.

##### Theme Thread

**Chunk 10** (¶24 sentences 3 to 3; 70 words)

- Question: Which idea about Ichabod keeps coming back?
- Key words highlighted: keeps coming back
- Choices: His hunger and greed shape how he sees the world ✓ / His courage helps him face every single danger / His kindness wins him friends wherever he goes
- Proof line: "In the porkers he saw carved out the future sleek side of bacon, and juicy relishing ham; not a turkey but he beheld daintily trussed up, with its gizzard under its wing, and, peradventure, a necklace of savory sausages; and even bright chanticleer himself lay sprawling on his back, in a side dish, with uplifted claws, as if craving that quarter which his chivalrous spirit disdained to ask while living."
- Refresher hint: Even the proud rooster from before ends up somewhere. Where?
- Why: Even bright chanticleer lies in a side dish: his appetite rules what he sees.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: In his mind every pig, turkey and even the rooster ends up on a platter. ✓ / In his mind every pig, turkey and rooster becomes a friend to talk with. / In his mind every pig, turkey and rooster belongs back in the wild woods.
- Discovery (vocabulary): "bright chanticleer". Chanticleer: an old storybook name for a rooster.

#### Expedition: A Rival Appears (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "Who are you, exactly?" / "What are you good at?"
- True: "I'm built wide and strong, with a dark mop on my head and a grin that's half joke, half swagger."
  - Confirmed by: "He was broad-shouldered and double-jointed, with short curly black hair, and a bluff but not unpleasant countenance, having a mingled air of fun and arrogance."
- False (laughing): "I'm no rider. Give me my own two feet any day."
  - Disproved by: "He was famed for great knowledge and skill in horsemanship, being as dexterous on horseback as a Tartar."
- When caught: "Ha! As if I could stay off a saddle. You got me."

**Hans Van Ripper**

- Question cards: "What did the schoolmaster think of the Van Tassel house?" / "Where does the schoolmaster dream of going?"
- True: "He dreamed of hauling all their belongings and a brood of little ones off to the frontier."
  - Confirmed by: "Nay, his busy fancy already realized his hopes, and presented to him the blooming Katrina, with a whole family of children, mounted on the top of a wagon loaded with household trumpery, with pots and kettles dangling beneath; and he beheld himself bestriding a pacing mare, with a colt at her heels, setting out for Kentucky, Tennessee,--or the Lord knows where!"
- False (head shake): "When he stepped through that door he was not impressed one bit."
  - Disproved by: "When he entered the house, the conquest of his heart was complete."
- When caught: "Hmph. The place took his heart in one look. I was wrong."

**Katrina Van Tassel**

- Question cards: "What do you think of your admirers?" / "What are the young men like around you?"
- True: "The young fellows who call on me glare at one another, but they all team up the moment a newcomer shows his face."
  - Confirmed by: "Ichabod, on the contrary, had to win his way to the heart of a country coquette, beset with a labyrinth of whims and caprices, which were forever presenting new difficulties and impediments; and he had to encounter a host of fearful adversaries of real flesh and blood, the numerous rustic admirers, who beset every portal to her heart, keeping a watchful and angry eye upon each other, but ready to fly out in the common cause against any new competitor."
- False: "The young men around here are all quiet and small. Not one of them is bold or loud."
  - Disproved by: "Among these, the most formidable was a burly, roaring, roystering blade, of the name of Abraham, or, according to the Dutch abbreviation, Brom Van Brunt, the hero of the country round, which rang with his feats of strength and hardihood."
- When caught: "All right, I know one who is very loud indeed. You were listening."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Read Between the Lines

**Chunk 1** (¶25 sentences 1 to 1; 90 words)

- Question: What can you infer Ichabod really prizes about Katrina?
- Key words highlighted: infer
- Choices: The land and riches she will inherit ✓ / Her lovely voice in the singing class / Her kindness to the pupils at school
- Proof line: "As the enraptured Ichabod fancied all this, and as he rolled his great green eyes over the fat meadow lands, the rich fields of wheat, of rye, of buckwheat, and Indian corn, and the orchards burdened with ruddy fruit, which surrounded the warm tenement of Van Tassel, his heart yearned after the damsel who was to inherit these domains, and his imagination expanded with the idea, how they might be readily turned into cash, and the money invested in immense tracts of wild land, and shingle palaces in the wilderness."
- Refresher hint: What is he looking at while his heart yearns? What does he plan to do with it?
- Why: He yearns for the damsel who will inherit these domains and imagines turning them into cash.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Gazing at the rich farm, Ichabod dreams of marrying Katrina and turning the land into money. ✓ / Gazing at the poor farm, Ichabod decides Katrina must work hard to earn money. / Gazing at the rich farm, Ichabod plans to buy it all with his small teaching pay.
- Discovery (figurative): "shingle palaces in the wilderness". Shingle palaces: grand houses of wooden shingles. He dreams big about a frontier fortune.

##### Find It

**Chunk 2** (¶25 sentences 2 to 2; 61 words)

- Question: Which line shows Ichabod picturing a move out west?
- Key words highlighted: out west
- Proof line: "Nay, his busy fancy already realized his hopes, and presented to him the blooming Katrina, with a whole family of children, mounted on the top of a wagon loaded with household trumpery, with pots and kettles dangling beneath; and he beheld himself bestriding a pacing mare, with a colt at her heels, setting out for Kentucky, Tennessee,--or the Lord knows where!"
- Refresher hint: Look for faraway places he might ride off to.
- Why: He sees himself setting out for Kentucky, Tennessee, or the Lord knows where.
- Standards: ELA.K12.EE.1.1
- Gist check: Ichabod pictures himself leading Katrina and their children west on a loaded wagon. ✓ / Ichabod pictures himself staying forever as the Hollow's poor schoolteacher. / Ichabod pictures Katrina leaving him to marry a rich man in New York.
- Discovery (vocabulary): "household trumpery". Trumpery: odds and ends of little value, here all their household stuff.

**Chunk 8** (¶28 sentences 1 to 3; 88 words)

- Question: Which line explains why folks call him Brom Bones?
- Key words highlighted: call him
- Proof line: "From his Herculean frame and great powers of limb he had received the nickname of BROM BONES, by which he was universally known."
- Refresher hint: Look for what his body is like.
- Why: From his Herculean frame and great powers of limb he got the nickname Brom Bones.
- Standards: ELA.K12.EE.1.1
- Gist check: Ichabod's toughest rival is Brom Van Brunt, a big, strong local hero called Brom Bones. ✓ / Ichabod's only friend is Brom Van Brunt, a quiet, small farmer called Brom Bones. / Ichabod's toughest rival is a rich merchant from the city who hates horses.
- Discovery (vocabulary): "roystering blade". A roystering blade: a loud, rowdy young man who loves a good time.

##### Word Detective

**Chunk 3** (¶26 sentences 1 to 3; 72 words) · shared words reviewed

- Question: In this chunk, what does piazza mean?
- Key words highlighted: piazza
- Choices: A covered porch along the front of the house ✓ / A large bowl of fresh fruit / A barn for storing the harvest
- Proof words (any one): "the low projecting eaves"
- Refresher hint: What forms it? Look at the words just before it.
- Why: The low projecting eaves form a piazza along the front: a covered porch.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: The old Dutch farmhouse, with its long porch full of tools and nets, wins Ichabod's heart. ✓ / The new city mansion, with its marble steps and fountains, wins Ichabod's heart. / The run-down shack, with its broken roof and empty porch, frightens Ichabod away.
- Discovery (vocabulary): "utensils of husbandry". Husbandry: farming. These are farm tools.

##### Shades of Meaning

**Chunk 4** (¶26 sentences 4 to 6; 69 words) · shared words reviewed

- Question: Why does the narrator say the pewter is resplendent instead of just shiny?
- Key words highlighted: resplendent
- Choices: It makes the dishes seem dazzling and grand ✓ / It makes the dishes seem old and dusty / It makes the dishes seem cheap and plain
- Proof words (any one): "dazzled his eyes"
- Refresher hint: What does the pewter do to Ichabod?
- Why: Resplendent means brilliantly shining: the pewter dazzled his eyes.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: The busy porch leads to a main hall where rows of shining pewter dazzle Ichabod. ✓ / The empty porch leads to a dark hall where Ichabod trips over broken dishes. / The busy porch leads to a kitchen where Ichabod is put to work churning.
- Discovery (vocabulary): "a churn". A churn turns cream into butter.

##### Figure It Out

**Chunk 5** (¶26 sentences 7 to 7; 129 words) · shared words reviewed

- Question: Read the words shone like mirrors. What kind of figurative language is this?
- Key words highlighted: shone like mirrors
- Choices: Simile: the polished tables are compared to mirrors with like ✓ / Metaphor: the tables are called mirrors, without like / Hyperbole: the tables are bigger than the house
- What does it mean? The furniture is polished until it gleams ✓ / The room is full of real mirrors / The tables are made of clear glass
- Refresher hint: Look for the word like. What are the tables being compared to, and why?
- Why: Shone like mirrors: a simile showing furniture polished to a gleam.
- Standards: ELA.7.R.3.1
- Gist check: The house overflows with food, cloth and treasures, from shining tables to old silver. ✓ / The house is nearly empty, with only one chair and a single cracked plate. / The house is covered in dust because the family never cleans it.
- Discovery (vocabulary): "gay festoons". Festoons: decorations hung in loops along the walls.

##### Whose Eyes?

**Chunk 6** (¶27 sentences 1 to 2; 138 words)

- Question: Why does the narrator bring up heroes from old romances?
- Key words highlighted: old romances
- Choices: To joke that Ichabod's task is harder than slaying dragons ✓ / To show that Ichabod is a real knight in armor / To warn that dragons live near the Hollow
- Proof line: "In this enterprise, however, he had more real difficulties than generally fell to the lot of a knight-errant of yore, who seldom had anything but giants, enchanters, fiery dragons, and such like easily conquered adversaries, to contend with and had to make his way merely through gates of iron and brass, and walls of adamant to the castle keep, where the lady of his heart was confined; all which he achieved as easily as a man would carve his way to the centre of a Christmas pie; and then the lady gave him her hand as a matter of course."
- Refresher hint: What did those heroes face, and how easily did they win?
- Why: Knights faced giants and dragons that were easily conquered: the narrator jokes Ichabod has it harder.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: Ichabod sets his heart on winning Katrina, a task the narrator calls harder than a knight's. ✓ / Ichabod gives up on Katrina, a task the narrator calls too easy to bother with. / Ichabod fights a real dragon to win Katrina, just like a knight of old.
- Discovery (vocabulary): "walls of adamant". Adamant: an imaginary stone too hard to break.

##### Character Clue

**Chunk 7** (¶27 sentences 3 to 3; 80 words)

- Question: Which trait does the narrator give Katrina in this chunk?
- Key words highlighted: trait
- Choices: Changeable, full of whims that keep suitors guessing ✓ / Steady, always saying exactly what she means / Shy, refusing to speak to any young man
- Proof words (any one): "a labyrinth of whims and caprices"
- Refresher hint: Find the maze the narrator says Ichabod must get through.
- Why: She is a country coquette in a labyrinth of whims and caprices that keep changing.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Katrina's changing moods and a crowd of jealous rivals stand between Ichabod and her heart. ✓ / Katrina's steady kindness and her father's blessing make Ichabod's path easy. / Katrina's strict father and a locked gate keep every suitor far away.
- Discovery (figurative): "every portal to her heart". Portal: a door. Her admirers guard every door to her heart.

##### Catch the Lie

**Chunk 9** (¶28 sentences 4 to 5; 67 words)

- Question: Hans Van Ripper sizes up Brom Bones. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Hans Van Ripper): "Brom? He can barely stay in the saddle. I've seen him tumble off at a trot."
- Proof line: "He was famed for great knowledge and skill in horsemanship, being as dexterous on horseback as a Tartar."
- Refresher hint: Check what the story says about his riding.
- Why: He was famed for skill in horsemanship, as dexterous on horseback as a Tartar.
- Standards: ELA.K12.EE.1.1
- Gist check: Brom is a superb rider and the strong man who settles every local argument. ✓ / Brom is a poor rider who avoids races and every local argument. / Brom is a judge from town who settles arguments with law books.
- Discovery (figurative): "as dexterous on horseback as a Tartar". A simile: he rides as skillfully as the famous horsemen of Central Asia.

##### Theme Thread

**Chunk 10** (¶28 sentences 6 to 7; 70 words)

- Question: Which idea about Brom do these pages keep returning to?
- Key words highlighted: keep returning
- Choices: He is rough and wild, but more playful than cruel ✓ / He is cruel and wants to hurt everyone he meets / He is quiet and keeps to himself at home
- Proof line: "He was always ready for either a fight or a frolic; but had more mischief than ill-will in his composition; and with all his overbearing roughness, there was a strong dash of waggish good humor at bottom."
- Refresher hint: Is he out to hurt people, or to have fun?
- Why: He had more mischief than ill-will, with a strong dash of waggish good humor.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: Brom loves fights and fun, but means mischief more than harm, and his friends follow him everywhere. ✓ / Brom hates fights and fun, so he stays home alone and avoids his neighbors. / Brom means real harm, and his friends are terrified of him.
- Discovery (vocabulary): "boon companions". Boon companions: close, cheerful friends.

#### Expedition: The Feud (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "What happened between you and the schoolmaster?" / "Why didn't you just fight him?"
- True: "I'd have gladly met him fist to fist to end it, but the sly fellow wouldn't come near me."
  - Confirmed by: "Brom, who had a degree of rough chivalry in his nature, would fain have carried matters to open warfare and have settled their pretensions to the lady, according to the mode of those most concise and simple reasoners, the knights-errant of yore,--by single combat; but Ichabod was too conscious of the superior might of his adversary to enter the lists against him; he had overheard a boast of Bones, that he would “double the schoolmaster up, and lay him on a shelf of his own schoolhouse;” and he was too wary to give him an opportunity."
- False (laughing): "I kept calling on her every week of the year, same as always, schoolmaster or no."
  - Disproved by: "Certain it is, this was not the case with the redoubtable Brom Bones; and from the moment Ichabod Crane made his advances, the interests of the former evidently declined: his horse was no longer seen tied to the palings on Sunday nights, and a deadly feud gradually arose between him and the preceptor of Sleepy Hollow."
- When caught: "Ha! All right, I stayed away a while. Don't rub it in."

**Hans Van Ripper**

- Question cards: "How do the Van Tassels raise their daughter?" / "What does the mother of the house say?"
- True: "His missus says the birds in the yard need watching, but a young lady can mind herself."
  - Confirmed by: "His notable little wife, too, had enough to do to attend to her housekeeping and manage her poultry; for, as she sagely observed, ducks and geese are foolish things, and must be looked after, but girls can take care of themselves."
- False (head shake): "Old Baltus rules that girl with an iron hand. She can't do a thing without his say."
  - Disproved by: "Balt Van Tassel was an easy indulgent soul; he loved his daughter better even than his pipe, and, like a reasonable man and an excellent father, let her have her way in everything."
- When caught: "Hmph. He's soft as butter with her. Everyone knows it."

**Katrina Van Tassel**

- Question cards: "Who comes calling on you?" / "What do folks think of Brom?"
- True: "When a particular steed is tethered at our gate on the Lord's day evening, the other young men just keep walking."
  - Confirmed by: "Certain it is, his advances were signals for rival candidates to retire, who felt no inclination to cross a lion in his amours; insomuch, that when his horse was seen tied to Van Tassel’s paling, on a Sunday night, a sure sign that his master was courting, or, as it is termed, “sparking,” within, all other suitors passed by in despair, and carried the war into other quarters."
- False: "Folks around here can't stand Brom. Nobody has a kind word for him."
  - Disproved by: "The neighbors looked upon him with a mixture of awe, admiration, and good-will; and, when any madcap prank or rustic brawl occurred in the vicinity, always shook their heads, and warranted Brom Bones was at the bottom of it."
- When caught: "Fine, they rather like him. Even the ones he plays tricks on."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Find It

**Chunk 1** (¶28 sentences 8 to 9; 100 words)

- Question: Which line describes what Brom puts on his head in winter?
- Key words highlighted: on his head
- Proof line: "In cold weather he was distinguished by a fur cap, surmounted with a flaunting fox’s tail; and when the folks at a country gathering descried this well-known crest at a distance, whisking about among a squad of hard riders, they always stood by for a squall."
- Refresher hint: Look for something furry with a tail.
- Why: In cold weather he wore a fur cap topped with a flaunting fox's tail.
- Standards: ELA.K12.EE.1.1
- Gist check: Brom's fox-tail cap warns folks he's coming, and his gang gallops past farms at midnight. ✓ / Brom's tall black hat hides his face, and his gang sleeps quietly every night. / Brom's fox-tail cap is stolen, and his gang searches every farm at midnight.
- Discovery (figurative): "like a troop of Don Cossacks". A simile: Brom's gang rides like wild Cossack horsemen.

##### Read Between the Lines

**Chunk 2** (¶28 sentences 10 to 10, ¶29 sentences 1 to 1; 86 words)

- Question: What can you infer about how Katrina feels about Brom?
- Key words highlighted: infer
- Choices: She may like him more than she lets on ✓ / She is afraid of him and avoids him / She has never even met him
- Proof line: "This rantipole hero had for some time singled out the blooming Katrina for the object of his uncouth gallantries, and though his amorous toyings were something like the gentle caresses and endearments of a bear, yet it was whispered that she did not altogether discourage his hopes."
- Refresher hint: What was whispered about her and his hopes?
- Why: It was whispered that she did not altogether discourage his hopes.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Neighbors admire Brom and blame him for every prank, and he has set his heart on Katrina. ✓ / Neighbors fear Brom and ban him from town, and he has given up on Katrina. / Neighbors ignore Brom, and he has set his heart on moving to the city.
- Discovery (figurative): "the gentle caresses and endearments of a bear". Brom's clumsy affection is compared to a bear's hug.

**Chunk 5** (¶31 sentences 1 to 3; 82 words)

- Question: What can you infer about why Ichabod courts Katrina so softly?
- Key words highlighted: infer
- Choices: He knows openly challenging Brom would be dangerous ✓ / He is too shy to speak to Katrina at all / He must keep it secret from her strict father
- Proof line: "To have taken the field openly against his rival would have been madness; for he was not a man to be thwarted in his amours, any more than that stormy lover, Achilles."
- Refresher hint: What would it be to take the field openly against his rival?
- Why: Taking the field openly against Brom would have been madness.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Afraid to challenge Brom openly, Ichabod courts Katrina quietly during his singing visits. ✓ / Eager to fight Brom openly, Ichabod challenges him to a duel at the singing school. / Afraid of Katrina's parents, Ichabod sends her secret letters instead of visiting.
- Discovery (vocabulary): "that stormy lover, Achilles". Achilles: a fierce Greek hero from Homer's poems who would not be crossed.

##### Word Detective

**Chunk 3** (¶29 sentences 2 to 2; 68 words) · shared words reviewed

- Question: In this chunk, what does sparking mean?
- Key words highlighted: sparking
- Choices: Visiting a young woman to court her ✓ / Starting a fire in the fireplace / Shoeing a horse at the blacksmith's
- Proof words (any one): "his master was courting"
- Refresher hint: The narrator explains it right before the word.
- Why: His master was courting, or, as it is termed, sparking.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: When Brom's horse is tied at the Van Tassels' on Sunday night, other suitors give up and leave. ✓ / When Brom's horse is tied at the Van Tassels' on Sunday night, the family sends for the sheriff. / When Brom's horse runs away on Sunday night, the other suitors chase it down the road.
- Discovery (figurative): "cross a lion in his amours". Rivals won't cross a lion: Brom is too fierce to compete with.

##### Figure It Out

**Chunk 4** (¶30 sentences 1 to 2; 89 words) · shared words reviewed

- Question: Read the words in form and spirit like a supple-jack. What kind of figurative language is this?
- Key words highlighted: supple-jack
- Choices: Simile: Ichabod is compared to a bendy stick using like ✓ / Metaphor: Ichabod is called a tree, without like / Alliteration: words that begin with the same sound
- What does it mean? He bends under pressure but always springs back ✓ / He snaps easily when anyone pushes him / He is stiff and refuses to move at all
- Refresher hint: A supple-jack is a springy cane. What happens when you bend one and let go?
- Why: Like a supple-jack, yielding but tough: he bends, but never breaks.
- Standards: ELA.7.R.3.1
- Gist check: Brom is a fearsome rival, but Ichabod bends without breaking and keeps trying. ✓ / Brom is a weak rival, so Ichabod wins Katrina without any effort at all. / Brom is a fearsome rival, so Ichabod quits and leaves the Hollow at once.
- Discovery (figurative): "carried his head as high as ever". He bounces back with his pride whole.

##### Character Clue

**Chunk 6** (¶31 sentences 4 to 5; 74 words)

- Question: Which trait fits the man of the house?
- Key words highlighted: trait
- Choices: Easygoing and generous, letting her do as she likes ✓ / Strict and watchful, guarding her every move / Cold and distant, ignoring his own family
- Proof words (any one): "an easy indulgent soul", "let her have her way in everything"
- Refresher hint: How does he treat his daughter?
- Why: He was an easy indulgent soul who let her have her way in everything.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Katrina's easygoing father and busy mother leave her free to go her own way. ✓ / Katrina's strict father and watchful mother never let her out of their sight. / Katrina's father and mother argue all day about which suitor she should marry.
- Discovery (vocabulary): "sagely observed". Sagely: wisely, though the narrator is joking.

##### Catch the Lie

**Chunk 7** (¶31 sentences 6 to 7; 95 words)

- Question: Brom Bones describes the schoolmaster's calls. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Brom Bones): "The schoolmaster only ever saw her indoors, with the old folks keeping an eye on him from across the room."
- Proof line: "In the mean time, Ichabod would carry on his suit with the daughter by the side of the spring under the great elm, or sauntering along in the twilight, that hour so favorable to the lover’s eloquence."
- Refresher hint: Where did Ichabod and Katrina actually talk?
- Why: He courted her by the spring under the great elm, or sauntering in the twilight.
- Standards: ELA.K12.EE.1.1
- Gist check: While her parents keep busy, Ichabod courts Katrina by the spring and on twilight walks. ✓ / While her parents watch closely, Ichabod sits silently in the parlor with Katrina. / While her parents are away, Ichabod repairs the barn roof for Katrina.
- Discovery (figurative): "a little wooden warrior". A weathervane soldier fighting the wind on the barn roof.

##### Whose Eyes?

**Chunk 8** (¶32 sentences 1 to 5; 115 words)

- Question: What does the narrator admit about himself here?
- Key words highlighted: admit
- Choices: He doesn't understand how hearts are won ✓ / He is an expert at winning hearts / He once married Katrina himself
- Proof line: "I profess not to know how women’s hearts are wooed and won."
- Refresher hint: Read his very first sentence.
- Why: He professes not to know how women's hearts are wooed and won.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: The narrator jokes that winning hearts is a puzzle, and keeping a flirt's heart takes a hero. ✓ / The narrator explains that winning hearts is easy, and anyone can do it in a day. / The narrator says only soldiers can win hearts, by fighting real battles.
- Discovery (figurative): "matters of riddle and admiration". Hearts are a riddle to him: puzzling and amazing.

##### Theme Thread

**Chunk 9** (¶32 sentences 6 to 6; 56 words)

- Question: Which idea keeps coming back as the rivalry grows?
- Key words highlighted: rivalry
- Choices: Competition for Katrina turns the two men into enemies ✓ / Friendship between the two men grows stronger each week / Katrina decides to leave the valley for good
- Proof line: "Certain it is, this was not the case with the redoubtable Brom Bones; and from the moment Ichabod Crane made his advances, the interests of the former evidently declined: his horse was no longer seen tied to the palings on Sunday nights, and a deadly feud gradually arose between him and the preceptor of Sleepy Hollow."
- Refresher hint: What arises between Brom and the teacher?
- Why: A deadly feud gradually arose between him and the preceptor of Sleepy Hollow.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: As Ichabod gains ground, Brom stops visiting and a bitter feud begins between them. ✓ / As Ichabod gains ground, Brom happily wishes him luck and they become friends. / As Ichabod loses ground, Brom visits every night and wins Katrina's hand.
- Discovery (vocabulary): "preceptor of Sleepy Hollow". Preceptor: a teacher. A fancy title for Ichabod.

##### Shades of Meaning

**Chunk 10** (¶33 sentences 1 to 1; 96 words) · shared words reviewed

- Question: Why does the narrator call Ichabod wary instead of just scared?
- Key words highlighted: wary
- Choices: It suggests he is careful and alert to danger ✓ / It suggests he is lazy and sleepy / It suggests he is angry and eager to fight
- Proof words (any one): "too conscious of the superior might of his adversary"
- Refresher hint: What does Ichabod know about Brom's strength?
- Why: Wary means watchful: he was too conscious of Brom's superior might to give him a chance.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: Brom wants to settle things with a fight, but Ichabod is too careful to give him the chance. ✓ / Brom wants to settle things with a race, and Ichabod eagerly agrees to ride. / Brom wants to make peace, but Ichabod insists on settling things with a fight.
- Discovery (vocabulary): "single combat". Single combat: a one-on-one fight to settle a quarrel.

#### Expedition: The Invitation (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "What did you do to the schoolmaster?" / "How did you get back at him?"
- True: "We plugged up the flue so his music class had to flee in a cloud of soot."
  - Confirmed by: "They harried his hitherto peaceful domains; smoked out his singing school by stopping up the chimney; broke into the schoolhouse at night, in spite of its formidable fastenings of withe and window stakes, and turned everything topsy-turvy, so that the poor schoolmaster began to think all the witches in the country held their meetings there."
- False (laughing): "I never pulled a single trick on him. Wasn't my style."
  - Disproved by: "There was something extremely provoking in this obstinately pacific system; it left Brom no alternative but to draw upon the funds of rustic waggery in his disposition, and to play off boorish practical jokes upon his rival."
- When caught: "Ha! Guilty. Every trick in the book, and I'd do it again."

**Hans Van Ripper**

- Question cards: "Did you lend the schoolmaster anything?" / "Tell me about your old mount."
- True: "He rode off on my old animal to court the girl, dressed up as a hero from a storybook."
  - Confirmed by: "That he might make his appearance before his mistress in the true style of a cavalier, he borrowed a horse from the farmer with whom he was domiciliated, a choleric old Dutchman of the name of Hans Van Ripper, and, thus gallantly mounted, issued forth like a knight-errant in quest of adventures."
- False (head shake): "That beast of mine never had a spark of spirit, not even as a colt."
  - Disproved by: "Still he must have had fire and mettle in his day, if we may judge from the name he bore of Gunpowder."
- When caught: "Hmph. He was a firecracker once. Still is, on a bad day."

**Katrina Van Tassel**

- Question cards: "How did the schoolmaster get ready for the party?" / "What happened at the school that afternoon?"
- True: "I hear he fussed for ages fixing up the one set of clothes he owns, peering into a cracked mirror."
  - Confirmed by: "The gallant Ichabod now spent at least an extra half hour at his toilet, brushing and furbishing up his best, and indeed only suit of rusty black, and arranging his locks by a bit of broken looking-glass that hung up in the schoolhouse."
- False: "He kept the children late that day, finishing every lesson properly."
  - Disproved by: "Books were flung aside without being put away on the shelves, inkstands were overturned, benches thrown down, and the whole school was turned loose an hour before the usual time, bursting forth like a legion of young imps, yelping and racketing about the green in joy at their early emancipation."
- When caught: "Oh, he let them go early. He couldn't wait. I'm flattered, really."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Find It

**Chunk 1** (¶33 sentences 2 to 3; 52 words)

- Question: Which line shows how Brom fights back without his fists?
- Key words highlighted: without his fists
- Proof line: "There was something extremely provoking in this obstinately pacific system; it left Brom no alternative but to draw upon the funds of rustic waggery in his disposition, and to play off boorish practical jokes upon his rival."
- Refresher hint: Look for what Brom turns to when there's no fight.
- Why: With no other choice, he plays boorish practical jokes on his rival.
- Standards: ELA.K12.EE.1.1
- Gist check: Since Ichabod won't fight, Brom and his gang torment him with rough practical jokes. ✓ / Since Ichabod won't fight, Brom leaves him alone and finds a new sweetheart. / Since Ichabod wants to fight, Brom hides from him at the Van Tassel farm.
- Discovery (vocabulary): "rustic waggery". Waggery: mischievous joking. Brom's country-style pranks.

**Chunk 5** (¶34 sentences 6 to 6, ¶35 sentences 1 to 1; 90 words)

- Question: Which line describes the sudden change once the news arrives?
- Key words highlighted: sudden change
- Proof line: "All was now bustle and hubbub in the late quiet schoolroom."
- Refresher hint: Look for the noise that replaces the quiet.
- Why: All was now bustle and hubbub in the late quiet schoolroom.
- Standards: ELA.K12.EE.1.1
- Gist check: An invitation arrives to an evening party at the Van Tassels', and the quiet room turns to bustle. ✓ / A warning arrives about the Headless Horseman, and the busy room falls silent. / A letter arrives dismissing Ichabod, and the quiet room turns to tears.
- Discovery (vocabulary): "quilting frolic". Quilting frolic: a party where neighbors gather, often with music and dancing.

**Chunk 7** (¶36 sentences 1 to 2; 95 words)

- Question: Which line tells whose animal Ichabod rides?
- Key words highlighted: whose animal
- Proof line: "That he might make his appearance before his mistress in the true style of a cavalier, he borrowed a horse from the farmer with whom he was domiciliated, a choleric old Dutchman of the name of Hans Van Ripper, and, thus gallantly mounted, issued forth like a knight-errant in quest of adventures."
- Refresher hint: Whose stable does it come from?
- Why: He borrowed a horse from Hans Van Ripper, the farmer he was staying with.
- Standards: ELA.K12.EE.1.1
- Gist check: Ichabod grooms his one shabby suit and borrows a horse from Hans Van Ripper to ride to the party. ✓ / Ichabod buys a fine new suit and a fast horse in town to ride to the party. / Ichabod refuses to dress up and walks to the party in his work clothes.
- Discovery (figurative): "issued forth like a knight-errant". A simile: Ichabod rides out like a knight in an old romance, with mock grandeur.

##### Catch the Lie

**Chunk 2** (¶33 sentences 4 to 5; 102 words)

- Question: Katrina remembers the pranks. One thing she says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Katrina Van Tassel): "Brom never once made fun of the schoolmaster when I was around. He was a perfect gentleman about it."
- Proof line: "But what was still more annoying, Brom took all opportunities of turning him into ridicule in presence of his mistress, and had a scoundrel dog whom he taught to whine in the most ludicrous manner, and introduced as a rival of Ichabod’s, to instruct her in psalmody."
- Refresher hint: Check what Brom did whenever Katrina was present.
- Why: Brom took every chance to turn Ichabod into ridicule in front of her, with a whining dog as a rival.
- Standards: ELA.K12.EE.1.1
- Gist check: Brom's gang wrecks the schoolhouse, and Brom mocks Ichabod in front of Katrina with a whining dog. ✓ / Brom's gang repairs the schoolhouse, and Brom praises Ichabod in front of Katrina. / Brom's gang steals the schoolhouse bell, and Ichabod wins Katrina with a song.
- Discovery (figurative): "scoundrel dog". Brom teaches his dog to whine so it can play a fake singing teacher.

##### Figure It Out

**Chunk 3** (¶34 sentences 1 to 3; 116 words) · shared words reviewed

- Question: Read the words that sceptre of despotic power. What kind of figurative language is this?
- Key words highlighted: sceptre
- Choices: Metaphor: his ruler is called a king's sceptre ✓ / Simile: his ruler is compared to a sceptre using as / Onomatopoeia: the words copy a sound
- What does it mean? Ichabod rules his classroom like a stern king ✓ / Ichabod carries a real golden sceptre / Ichabod is afraid of his own students
- Refresher hint: A sceptre is what a king holds. What is Ichabod holding, and what does that make him?
- Why: The ferule is called a sceptre of despotic power: Ichabod rules the room like a king.
- Standards: ELA.7.R.3.1
- Gist check: On an autumn afternoon Ichabod sits like a king over his classroom, surrounded by confiscated toys. ✓ / On an autumn afternoon Ichabod naps in the meadow while his pupils play outside. / On a winter morning Ichabod hands out toys as prizes to his best pupils.
- Discovery (vocabulary): "contraband articles". Contraband: forbidden items, here toys taken from students.

##### Read Between the Lines

**Chunk 4** (¶34 sentences 4 to 5; 90 words)

- Question: What can you infer just happened in the classroom before this moment?
- Key words highlighted: infer
- Choices: Someone was punished, so everyone is acting busy ✓ / A party was held, so everyone is tired / A storm hit, so everyone is hiding
- Proof line: "Apparently there had been some appalling act of justice recently inflicted, for his scholars were all busily intent upon their books, or slyly whispering behind them with one eye kept upon the master; and a kind of buzzing stillness reigned throughout the schoolroom."
- Refresher hint: Why are the scholars all so busy, with one eye on the master?
- Why: Some appalling act of justice had recently been inflicted, so everyone is intent on their books.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The class sits in nervous quiet until a rider arrives at the school. ✓ / The class bursts into song until the parson arrives at the school. / The class runs outside until Brom Bones rides up to the school.
- Discovery (figurative): "buzzing stillness". Buzzing stillness: a quiet full of tiny whispers.

##### Character Clue

**Chunk 6** (¶35 sentences 2 to 3; 96 words)

- Question: Which trait does Ichabod show by rushing the afternoon?
- Key words highlighted: trait
- Choices: Eager and impatient to get to the party ✓ / Careful and patient with every lesson / Calm and in no hurry at all
- Proof words (any one): "hurried through their lessons", "an hour before the usual time"
- Refresher hint: How does he treat the lessons, and when does school end?
- Why: The scholars were hurried through their lessons and turned loose an hour before the usual time.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Ichabod rushes the lessons and lets the children out an hour early, and they race off cheering. ✓ / Ichabod adds extra lessons and keeps the children an hour late, and they sulk home. / Ichabod cancels the party and makes the children scrub the schoolhouse.
- Discovery (figurative): "like a legion of young imps". A simile: the freed children burst out like a crowd of little devils.

##### Whose Eyes?

**Chunk 8** (¶36 sentences 3 to 5; 92 words)

- Question: What tone does the narrator take toward Ichabod's ride?
- Key words highlighted: tone
- Choices: Mocking, treating a broken-down nag like a grand charger ✓ / Admiring, praising a fine and noble war horse / Fearful, warning that the animal is a ghost
- Proof line: "The animal he bestrode was a broken-down plow-horse, that had outlived almost everything but its viciousness."
- Refresher hint: He promises a romantic account. Then what does he describe?
- Why: In the true spirit of romantic story he presents a broken-down plow-horse that outlived everything but its viciousness.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: Ichabod's horse is an old, bony, mean-tempered plow horse with one wild eye. ✓ / Ichabod's horse is a young, sleek, gentle racehorse with bright eyes. / Ichabod's horse is a tiny pony that his pupils lend him for the day.
- Discovery (figurative): "a head like a hammer". A simile: the horse's head is long and blocky like a hammer.

##### Shades of Meaning

**Chunk 9** (¶36 sentences 6 to 7; 79 words) · shared words reviewed

- Question: Why might the horse be called Gunpowder instead of a gentle name?
- Key words highlighted: Gunpowder
- Choices: It hints he was once fiery and explosive ✓ / It hints he is slow and very sleepy / It hints he is gray like a puff of smoke
- Proof words (any one): "fire and mettle in his day"
- Refresher hint: What does the narrator judge from the name?
- Why: He must have had fire and mettle in his day, judging from the name Gunpowder.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: The horse, named Gunpowder, still has a wild spirit from his hot-tempered owner. ✓ / The horse, named Gunpowder, is gentle and calm like his peaceful owner. / The horse, named Gunpowder, was bought from a soldier at the old fort.
- Discovery (figurative): "the lurking devil in him". A hidden wild streak, as if a little devil lives inside.

##### Theme Thread

**Chunk 10** (¶37 sentences 1 to 2; 65 words)

- Question: Which idea about Ichabod's looks keeps coming back?
- Key words highlighted: keeps coming back
- Choices: He looks awkward and comical, all bony limbs ✓ / He looks strong and dashing, a true horseman / He looks rich and stylish, dressed like a lord
- Proof line: "He rode with short stirrups, which brought his knees nearly up to the pommel of the saddle; his sharp elbows stuck out like grasshoppers’; he carried his whip perpendicularly in his hand, like a sceptre, and as his horse jogged on, the motion of his arms was not unlike the flapping of a pair of wings."
- Refresher hint: Remember the scarecrow from earlier. What do his elbows look like now?
- Why: With knees at the pommel and elbows like grasshoppers', he is as gangly and comic as ever.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: Perched on short stirrups with flapping elbows, Ichabod looks as odd as his horse. ✓ / Seated tall with steady hands, Ichabod looks like a handsome cavalry officer. / Seated in a carriage, Ichabod hides from view as the horse trots along.
- Discovery (figurative): "his sharp elbows stuck out". His sharp, bent elbows stick out like grasshopper legs.

#### Expedition: The Ride to the Party (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "What did the schoolmaster look like riding out?" / "What was the weather like that evening?"
- True: "His little cap perched way down near his beak, and the back of his jacket flapped clear to his mount's rump."
  - Confirmed by: "A small wool hat rested on the top of his nose, for so his scanty strip of forehead might be called, and the skirts of his black coat fluttered out almost to the horses tail."
- False (laughing): "The wind was howling that evening, whipping everything every which way."
  - Disproved by: "A few amber clouds floated in the sky, without a breath of air to move them."
- When caught: "Ha! Still as a pond, it was. I just like a stormy tale."

**Hans Van Ripper**

- Question cards: "What did folks wear to the party?" / "Who came to the Van Tassel place?"
- True: "The grandfathers came in home-woven jackets, with great clumsy footwear and big shiny clasps."
  - Confirmed by: "Old farmers, a spare leathern-faced race, in homespun coats and breeches, blue stockings, huge shoes, and magnificent pewter buckles."
- False (head shake): "Hardly a soul turned up. The house was half empty all night."
  - Disproved by: "It was toward evening that Ichabod arrived at the castle of the Heer Van Tassel, which he found thronged with the pride and flower of the adjacent country."
- When caught: "Hmph. Packed to the rafters. I just don't like crowds."

**Katrina Van Tassel**

- Question cards: "What did the girls wear?" / "What did you think of the young men's hair?"
- True: "The boys bind their pigtails with the hide of an eel. They swear it makes it grow thicker."
  - Confirmed by: "The sons, in short square-skirted coats, with rows of stupendous brass buttons, and their hair generally queued in the fashion of the times, especially if they could procure an eel-skin for the purpose, it being esteemed throughout the country as a potent nourisher and strengthener of the hair."
- False: "We girls all dressed in the very newest town fashions, head to toe."
  - Disproved by: "Buxom lasses, almost as antiquated as their mothers, excepting where a straw hat, a fine ribbon, or perhaps a white frock, gave symptoms of city innovation."
- When caught: "Well, maybe a ribbon or two was new. You caught me fibbing."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Whose Eyes?

**Chunk 1** (¶37 sentences 3 to 4; 72 words)

- Question: How does the narrator want us to picture Ichabod setting off?
- Key words highlighted: picture
- Choices: As a ridiculous sight, almost like a ghost by day ✓ / As a brave knight riding out to win a battle / As a sad figure leaving the Hollow forever
- Proof line: "Such was the appearance of Ichabod and his steed as they shambled out of the gate of Hans Van Ripper, and it was altogether such an apparition as is seldom to be met with in broad daylight."
- Refresher hint: What does the narrator call the pair, and when is such a thing seldom seen?
- Why: He calls them an apparition seldom met in broad daylight: a joke about how strange they look.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: With his tiny hat and flapping coat, Ichabod and his horse make a strange sight leaving the farm. ✓ / With his tall hat and neat coat, Ichabod and his horse make a fine sight leaving the farm. / With no hat or coat at all, Ichabod and his horse sneak away from the farm at night.
- Discovery (figurative): "rested on the top of his nose". The narrator jokes that his forehead is so small the hat sits on his nose.

##### Figure It Out

**Chunk 2** (¶38 sentences 1 to 2; 64 words) · shared words reviewed

- Question: Read the words nature wore that rich and golden livery. What kind of figurative language is this?
- Key words highlighted: golden livery
- Choices: Personification: nature is dressed like a person in golden clothes ✓ / Simile: nature is compared to gold using like / Hyperbole: nature is made of real gold
- What does it mean? The autumn countryside glows with rich gold colors ✓ / The farmers wear gold uniforms at harvest / The trees are covered in gold coins
- Refresher hint: Livery is a servant's uniform. Who is wearing it here?
- Why: Nature wears golden livery like a person in fine clothes: the land glows gold in autumn.
- Standards: ELA.7.R.3.1
- Gist check: It is a clear, golden autumn day, and the forests blaze with orange, purple and scarlet. ✓ / It is a gray, rainy spring day, and the forests are bare and dripping. / It is a snowy winter night, and the forests are white and silent.
- Discovery (figurative): "nipped by the frosts". Frost nips the leaves like a little bite, turning them bright colors.

##### Find It

**Chunk 3** (¶38 sentences 3 to 3, ¶39 sentences 1 to 2; 79 words)

- Question: Which line shows flocks heading south across the sky?
- Key words highlighted: heading south
- Proof line: "Streaming files of wild ducks began to make their appearance high in the air; the bark of the squirrel might be heard from the groves of beech and hickory-nuts, and the pensive whistle of the quail at intervals from the neighboring stubble field."
- Refresher hint: Look high in the air.
- Why: Streaming files of wild ducks began to appear high in the air.
- Standards: ELA.K12.EE.1.1
- Gist check: Ducks fly overhead and small birds feast and flit about before leaving for the winter. ✓ / Hawks circle overhead and small birds hide quietly from the cold winter. / Geese land on the pond and small birds build nests for the spring.
- Discovery (figurative): "farewell banquets". The birds' last feasts before they fly south for winter.

**Chunk 9** (¶42 sentences 1 to 3; 72 words)

- Question: Which line tells when Ichabod reaches the gathering?
- Key words highlighted: reaches
- Proof line: "It was toward evening that Ichabod arrived at the castle of the Heer Van Tassel, which he found thronged with the pride and flower of the adjacent country."
- Refresher hint: Look for a time of day.
- Why: It was toward evening that Ichabod arrived at the castle of the Heer Van Tassel.
- Standards: ELA.K12.EE.1.1
- Gist check: Ichabod arrives at dusk to find the Van Tassel home crowded with farmers and their wives. ✓ / Ichabod arrives at dawn to find the Van Tassel home empty and locked. / Ichabod arrives at noon to find only Brom waiting at the gate.
- Discovery (figurative): "leathern-faced race". Leathern-faced: faces tanned and tough as leather from outdoor work.

##### Shades of Meaning

**Chunk 4** (¶39 sentences 3 to 3; 95 words) · shared words reviewed

- Question: Why does the narrator call the blue jay a noisy coxcomb?
- Key words highlighted: coxcomb
- Choices: It shows off like a vain, loud dresser ✓ / It is shy and hides among the leaves / It is sick and cannot sing well
- Proof words (any one): "in his gay light blue coat and white underclothes"
- Refresher hint: A coxcomb is a showy dresser. Find his outfit.
- Why: He struts in his gay light blue coat and white underclothes, screaming and bowing: a vain show-off.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: The narrator describes many colorful birds, ending with a showy, chattering blue jay. ✓ / The narrator describes one dull brown bird that sings alone at dawn. / The narrator describes hunters shooting every bird in the grove.
- Discovery (vocabulary): "sable clouds". Sable: black. The blackbirds fly in dark clouds.

##### Character Clue

**Chunk 5** (¶40 sentences 1 to 2; 61 words)

- Question: Which trait shows in what Ichabod notices on his ride?
- Key words highlighted: trait
- Choices: Greedy for food, always spotting the next meal ✓ / Curious about birds, counting every one he sees / Worried about the weather, watching the clouds
- Proof words (any one): "every symptom of culinary abundance"
- Refresher hint: What is his eye always open to?
- Why: His eye was ever open to every symptom of culinary abundance.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Riding along, Ichabod happily eyes the apples piled everywhere for market and cider. ✓ / Riding along, Ichabod sadly notices the apple trees are bare this year. / Riding along, Ichabod picks apples to give to his pupils at school.
- Discovery (figurative): "oppressive opulence". So many apples that the branches seem weighed down by riches.

##### Read Between the Lines

**Chunk 6** (¶40 sentences 3 to 3; 99 words)

- Question: What can you infer Ichabod daydreams about near the end of this chunk?
- Key words highlighted: infer
- Choices: Katrina serving him pancakes as his wife ✓ / Winning a prize at the harvest fair / Selling the corn crop for a fortune
- Proof line: "Farther on he beheld great fields of Indian corn, with its golden ears peeping from their leafy coverts, and holding out the promise of cakes and hasty-pudding; and the yellow pumpkins lying beneath them, turning up their fair round bellies to the sun, and giving ample prospects of the most luxurious of pies; and anon he passed the fragrant buckwheat fields breathing the odor of the beehive, and as he beheld them, soft anticipations stole over his mind of dainty slapjacks, well buttered, and garnished with honey or treacle, by the delicate little dimpled hand of Katrina Van Tassel."
- Refresher hint: Whose hand serves the slapjacks in his mind?
- Why: He imagines dainty slapjacks served by the delicate little hand of Katrina Van Tassel.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Fields of corn, pumpkins and buckwheat make Ichabod dream of pies, pancakes and Katrina. ✓ / Fields of corn, pumpkins and buckwheat make Ichabod worry about hard farm work. / Fields of corn, pumpkins and buckwheat remind Ichabod of the Headless Horseman.
- Discovery (figurative): "turning up their fair round bellies to the sun". Personification: the pumpkins lie like people sunbathing.

##### Word Detective

**Chunk 7** (¶41 sentences 1 to 3; 74 words) · shared words reviewed

- Question: In this chunk, what does undulation mean?
- Key words highlighted: undulation
- Choices: A gentle wave or ripple ✓ / A loud crash of thunder / A sudden burst of sunlight
- Proof words (any one): "waved and prolonged the blue shadow"
- Refresher hint: What does the undulation do to the water's shadow?
- Why: A gentle undulation waved and prolonged the shadow: a soft ripple on still water.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: Lost in sweet daydreams, Ichabod rides above the Hudson as the sun sets over still water. ✓ / Lost in fearful thoughts, Ichabod rides through a storm as waves crash on the Hudson. / Lost in his books, Ichabod rides past the Hudson without looking up once.
- Discovery (figurative): "sugared suppositions". Sweet daydreams, as if his thoughts were candy.

##### Catch the Lie

**Chunk 8** (¶41 sentences 4 to 7; 115 words)

- Question: Brom Bones remembers that evening. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Brom Bones): "That evening was a wild one. The wind whipped the river into whitecaps the whole way."
- Proof line: "A few amber clouds floated in the sky, without a breath of air to move them."
- Proof line: "A sloop was loitering in the distance, dropping slowly down with the tide, her sail hanging uselessly against the mast; and as the reflection of the sky gleamed along the still water, it seemed as if the vessel was suspended in the air."
- Refresher hint: Was there any wind? Look at the clouds and the boat's sail.
- Why: The clouds floated without a breath of air to move them, and the sloop's sail hung uselessly.
- Standards: ELA.K12.EE.1.1
- Gist check: The sunset sky glows gold and green over a calm river where a still boat seems to float in air. ✓ / The sunset sky turns black over a stormy river where a small boat sinks in the waves. / The midday sky burns bright over a dry river where boats sit stuck in the mud.
- Discovery (figurative): "the vessel was suspended in the air". The reflection makes the boat look like it hangs in the sky.

##### Theme Thread

**Chunk 10** (¶42 sentences 4 to 5; 74 words)

- Question: Which idea keeps coming back in the way the narrator describes valley folk?
- Key words highlighted: keeps coming back
- Choices: Old ways hold on, with only small touches of change ✓ / Everyone rushes to copy the newest fashions / The valley folk are poor and dress in rags
- Proof line: "Buxom lasses, almost as antiquated as their mothers, excepting where a straw hat, a fine ribbon, or perhaps a white frock, gave symptoms of city innovation."
- Refresher hint: Remember the quiet valley where customs stay fixed. How new are the girls' clothes?
- Why: The lasses are almost as antiquated as their mothers, with only small symptoms of city innovation.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: The young women wear old styles with a few city touches, and the young men wear brass buttons and eel-skin pigtails. ✓ / The young women wear the latest city gowns, and the young men wear white powdered wigs. / The young women and men all wear plain gray work clothes to the party.
- Discovery (figurative): "symptoms of city innovation". Hints of new city fashion, described like signs of an illness.

#### Expedition: The Feast and the Dance (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "What did you ride to the party?" / "How did you feel watching the dancing?"
- True: "I stayed off alone in a nook, stewing while she twirled with that beanpole."
  - Confirmed by: "The lady of his heart was his partner in the dance, and smiling graciously in reply to all his amorous oglings; while Brom Bones, sorely smitten with love and jealousy, sat brooding by himself in one corner."
- False (laughing): "I came on a gentle old mare that any child could ride."
  - Disproved by: "Brom Bones, however, was the hero of the scene, having come to the gathering on his favorite steed Daredevil, a creature, like himself, full of mettle and mischief, and which no one but himself could manage."
- When caught: "Ha! Gentle? Daredevil would throw anyone but me. You knew that."

**Hans Van Ripper**

- Question cards: "What did old Baltus do at the party?" / "How did the schoolmaster eat?"
- True: "Baltus didn't fuss. A firm grip, a clap on the back, a hearty roar, and he told everyone to dig in."
  - Confirmed by: "His hospitable attentions were brief, but expressive, being confined to a shake of the hand, a slap on the shoulder, a loud laugh, and a pressing invitation to “fall to, and help themselves.”"
- False (head shake): "The schoolmaster hardly touched a crumb all night. Barely ate."
  - Disproved by: "Happily, Ichabod Crane was not in so great a hurry as his historian, but did ample justice to every dainty."
- When caught: "Hmph. He ate enough for three. I'll not deny it."

**Katrina Van Tassel**

- Question cards: "What was on the tea table?" / "Whose arm were you on that evening?"
- True: "We had fried rings of dough, twisted pastries, and every sort of treat you can name."
  - Confirmed by: "There was the doughty doughnut, the tender oly koek, and the crisp and crumbling cruller; sweet cakes and short cakes, ginger cakes and honey cakes, and the whole family of cakes."
- False: "I spent the whole evening on Brom's arm and barely glanced at the schoolmaster."
  - Disproved by: "The lady of his heart was his partner in the dance, and smiling graciously in reply to all his amorous oglings; while Brom Bones, sorely smitten with love and jealousy, sat brooding by himself in one corner."
- When caught: "Oh, all right. I was the schoolmaster's partner. Brom sulked all night."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Character Clue

**Chunk 1** (¶43 sentences 1 to 2; 75 words)

- Question: Which trait does Brom's choice of steed reveal?
- Key words highlighted: trait
- Choices: Daring, he loves danger and a challenge ✓ / Careful, he always picks the safest ride / Lazy, he would rather walk everywhere
- Proof words (any one): "unworthy of a lad of spirit"
- Refresher hint: What does he think of a calm, well-trained horse?
- Why: He held a tractable, well-broken horse unworthy of a lad of spirit.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Brom arrives on Daredevil, a wild horse that only he can handle. ✓ / Brom arrives on foot, having sold his horse to pay a debt. / Brom arrives on a gentle old mare that anyone could ride.
- Discovery (figurative): "full of mettle and mischief". Mettle: courage and spirit. The horse is as bold and tricky as Brom.

##### Whose Eyes?

**Chunk 2** (¶44 sentences 1 to 3; 80 words)

- Question: What does the narrator say dazzles Ichabod most when he walks in?
- Key words highlighted: narrator
- Choices: The food, more than the young women ✓ / The music, more than the food / Katrina's father, most of all
- Proof line: "Not those of the bevy of buxom lasses, with their luxurious display of red and white; but the ample charms of a genuine Dutch country tea-table, in the sumptuous time of autumn."
- Refresher hint: The narrator says not those of the lasses, but what?
- Why: Not the buxom lasses, but the ample charms of a genuine Dutch country tea-table.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: Entering the parlor, Ichabod is dazzled less by the girls than by the heaps of Dutch cakes. ✓ / Entering the parlor, Ichabod is dazzled by the girls and ignores the food completely. / Entering the parlor, Ichabod finds the table bare and the guests hungry.
- Discovery (vocabulary): "sumptuous time of autumn". Sumptuous: rich and splendid.

##### Figure It Out

**Chunk 3** (¶44 sentences 4 to 5; 104 words) · shared words reviewed

- Question: Read the words the motherly teapot. What kind of figurative language is this?
- Key words highlighted: motherly teapot
- Choices: Personification: the teapot is described like a caring mother ✓ / Simile: the teapot is compared to a mother using like / Hyperbole: the teapot is bigger than the room
- What does it mean? The steaming teapot feels warm and welcoming at the center ✓ / The teapot belongs to Katrina's mother / The teapot is broken and leaking everywhere
- Refresher hint: Can a teapot be a mother? What feeling does the word give the table?
- Why: The motherly teapot is given a mother's warmth, steaming at the heart of the feast.
- Standards: ELA.7.R.3.1
- Gist check: The table is piled with doughnuts, cakes, pies, meats and preserves in a happy jumble. ✓ / The table holds a single loaf of bread and a pitcher of water. / The table is covered with books and papers instead of any food.
- Discovery (vocabulary): "higgledy-piggledy". Higgledy-piggledy: in a cheerful mess, all mixed up.

##### Shades of Meaning

**Chunk 4** (¶44 sentences 6 to 7, ¶45 sentences 1 to 1; 74 words) · shared words reviewed

- Question: Why does the narrator say Ichabod did ample justice to every dainty instead of just ate?
- Key words highlighted: ample justice
- Choices: It jokes that he honored the food by eating plenty ✓ / It means he judged the cakes in a contest / It means he punished the cooks for bad food
- Proof words (any one): "whose spirits rose with eating"
- Refresher hint: Is anyone on trial? Look at what eating does to him.
- Why: Doing ample justice is a grand way to say he ate his fill: his spirits rose with eating.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: The narrator hurries on, but Ichabod takes his time and grows happier with every bite. ✓ / The narrator lingers on the feast, but Ichabod eats nothing and leaves early. / The narrator and Ichabod both lose their appetite at the sight of the food.
- Discovery (vocabulary): "his historian". His historian: the narrator, calling himself the recorder of Ichabod's story.

##### Catch the Lie

**Chunk 5** (¶45 sentences 2 to 3; 79 words)

- Question: Hans Van Ripper speaks up for the schoolmaster. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Hans Van Ripper): "The schoolmaster was grateful to all of us who gave him a roof. He'd never dream of turning on his old friends."
- Proof line: "Then, he thought, how soon he’d turn his back upon the old schoolhouse; snap his fingers in the face of Hans Van Ripper, and every other niggardly patron, and kick any itinerant pedagogue out of doors that should dare to call him comrade!"
- Refresher hint: What does Ichabod imagine doing once he is rich?
- Why: He pictures snapping his fingers in the face of Hans Van Ripper and every other patron.
- Standards: ELA.K12.EE.1.1
- Gist check: Eating, Ichabod dreams of owning it all and snubbing everyone who once looked down on him. ✓ / Eating, Ichabod decides to give his pay to the poorer farmers in the valley. / Eating, Ichabod plans to stay a humble schoolmaster for the rest of his life.
- Discovery (figurative): "lord of all this scene". He imagines himself ruling the whole rich farm like a lord.

##### Word Detective

**Chunk 6** (¶46 sentences 1 to 2; 58 words) · shared words reviewed

- Question: In this chunk, what does hospitable mean?
- Key words highlighted: hospitable
- Choices: Welcoming and generous to guests ✓ / Sick and in need of a doctor / Shy and nervous around strangers
- Proof words (any one): "fall to, and help themselves"
- Refresher hint: What does he invite everyone to do?
- Why: His hospitable attentions end with a pressing invitation to fall to and help themselves: he is welcoming.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: Old Baltus beams like the harvest moon and cheerfully tells his guests to help themselves. ✓ / Old Baltus frowns at his guests and counts every cake they eat. / Old Baltus hides in his room and lets the servants greet the guests.
- Discovery (figurative): "round and jolly as the harvest moon". A simile: his happy face is as round and bright as a full moon.

##### Find It

**Chunk 7** (¶47 sentences 1 to 4; 90 words)

- Question: Which line tells what calls everyone onto the floor?
- Key words highlighted: onto the floor
- Proof line: "And now the sound of the music from the common room, or hall, summoned to the dance."
- Refresher hint: Listen for a sound coming from the hall.
- Why: The sound of the music from the common room summoned to the dance.
- Standards: ELA.K12.EE.1.1
- Gist check: Music from the hall calls the guests in to dance. ✓ / A bell from the church calls the guests home to bed. / A shout from the barn calls the guests out to a fire.
- Discovery (vocabulary): "summoned to the dance". Summoned: called to come.

**Chunk 10** (¶49 sentences 1 to 1, ¶50 sentences 1 to 2; 97 words)

- Question: Which line explains why the old men here have so many battle tales?
- Key words highlighted: battle tales
- Proof line: "The British and American line had run near it during the war; it had, therefore, been the scene of marauding and infested with refugees, cowboys, and all kinds of border chivalry."
- Refresher hint: Look for where the fighting lines ran.
- Why: The British and American line had run near it during the war.
- Standards: ELA.K12.EE.1.1
- Gist check: After the dance, Ichabod joins the old men trading stories of the war fought nearby. ✓ / After the dance, Ichabod joins the young men racing horses in the moonlight. / After the dance, Ichabod goes home early to prepare the next day's lessons.
- Discovery (figurative): "border chivalry". Border chivalry: raiders and rough fighters along the war line, called knights as a joke.

##### Read Between the Lines

**Chunk 8** (¶48 sentences 1 to 2; 58 words)

- Question: What can you infer about Ichabod's moves on the floor?
- Key words highlighted: infer
- Choices: Wild, with every bony limb flying ✓ / Stiff, barely moving his feet / Graceful, like a trained performer
- Proof line: "Not a limb, not a fibre about him was idle; and to have seen his loosely hung frame in full motion, and clattering about the room, you would have thought St. Vitus himself, that blessed patron of the dance, was figuring before you in person."
- Refresher hint: Is any part of him still?
- Why: Not a limb, not a fibre was idle: his loosely hung frame clatters about the room.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Ichabod is proud of his dancing and flings every limb about the room. ✓ / Ichabod is shy about his dancing and sits quietly by the wall. / Ichabod refuses to dance and sings a hymn by the fire instead.
- Discovery (vocabulary): "St. Vitus himself". St. Vitus: a saint linked to dancing; a joke about wild, jerky moves.

##### Theme Thread

**Chunk 9** (¶48 sentences 3 to 5; 104 words)

- Question: Which idea about the rivalry keeps coming back?
- Key words highlighted: keeps coming back
- Choices: Ichabod's success with Katrina stirs Brom's jealousy ✓ / Brom and Ichabod become friends at the dance / Katrina ignores both men all evening
- Proof line: "The lady of his heart was his partner in the dance, and smiling graciously in reply to all his amorous oglings; while Brom Bones, sorely smitten with love and jealousy, sat brooding by himself in one corner."
- Refresher hint: Where is Brom while Katrina smiles at Ichabod?
- Why: While she smiles at Ichabod, Brom, sorely smitten with love and jealousy, broods alone.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: Katrina dances with Ichabod and smiles at him, while a jealous Brom sulks alone in a corner. ✓ / Katrina dances with Brom all night, while Ichabod sulks alone in a corner. / Katrina refuses to dance, while Brom and Ichabod argue by the door.
- Discovery (figurative): "sorely smitten with love and jealousy". Smitten: struck hard, here by love and jealousy.

#### Expedition: Ghost Stories (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "Have you ever met the Headless Horseman?" / "What happened on your way home one night?"
- True: "I dared that rider to a contest for a drink, and my brute left his mount in the dust, till he burst into flame and was gone."
  - Confirmed by: "He affirmed that on returning one night from the neighboring village of Sing Sing, he had been overtaken by this midnight trooper; that he had offered to race with him for a bowl of punch, and should have won it too, for Daredevil beat the goblin horse all hollow, but just as they came to the church bridge, the Hessian bolted, and vanished in a flash of fire."
- False (laughing): "I'd never joke about that rider. He frightens me more than anything."
  - Disproved by: "This story was immediately matched by a thrice marvellous adventure of Brom Bones, who made light of the Galloping Hessian as an arrant jockey."
- When caught: "Ha! Frightened? Me? I call him a jockey to his face. Well, to his neck."

**Hans Van Ripper**

- Question cards: "What happened to old Brouwer?" / "Where is the ghost seen most?"
- True: "Brouwer scoffed at spooks till he had to ride double with one, and got pitched into the water."
  - Confirmed by: "The tale was told of old Brouwer, a most heretical disbeliever in ghosts, how he met the Horseman returning from his foray into Sleepy Hollow, and was obliged to get up behind him; how they galloped over bush and brake, over hill and swamp, until they reached the bridge; when the Horseman suddenly turned into a skeleton, threw old Brouwer into the brook, and sprang away over the tree-tops with a clap of thunder."
- False (head shake): "That ghost keeps well clear of the old wooden crossing. Folks only see him up on the mountain."
  - Disproved by: "Such was one of the favorite haunts of the Headless Horseman, and the place where he was most frequently encountered."
- When caught: "Hmph. That crossing is his favorite spot. I'd not go near it."

**Katrina Van Tassel**

- Question cards: "Why are there so many ghost stories here?" / "Who told stories at the party?"
- True: "Some neighbors from up the valley came, spinning their spooky stories as they always do."
  - Confirmed by: "Several of the Sleepy Hollow people were present at Van Tassel’s, and, as usual, were doling out their wild and wonderful legends."
- False: "Ghost stories never last in a quiet old valley like ours. They fade right away."
  - Disproved by: "Local tales and superstitions thrive best in these sheltered, long-settled retreats; but are trampled under foot by the shifting throng that forms the population of most of our country places."
- When caught: "You're right, they never fade here. That's half the fun of living in the valley."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Whose Eyes?

**Chunk 1** (¶50 sentences 3 to 3, ¶51 sentences 1 to 1; 70 words)

- Question: How does the narrator feel about the old men's war memories?
- Key words highlighted: narrator
- Choices: Amused, since they stretch the truth to look like heroes ✓ / Impressed, since every account is perfectly accurate / Bored, since none of them ever fought at all
- Proof line: "Just sufficient time had elapsed to enable each storyteller to dress up his tale with a little becoming fiction, and, in the indistinctness of his recollection, to make himself the hero of every exploit."
- Refresher hint: What has time allowed each one to add?
- Why: Each storyteller dresses up his tale with a little becoming fiction and makes himself the hero.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: The old men pad their war stories with fiction, like Doffue Martling, who almost captured a ship. ✓ / The old men refuse to talk about the war because the memories are too painful. / The old men read aloud from a history book about a ship sinking in the river.
- Discovery (figurative): "a little becoming fiction". Becoming fiction: a few flattering made-up details.

##### Catch the Lie

**Chunk 2** (¶51 sentences 2 to 3; 108 words)

- Question: Brom Bones retells an old soldier's tale. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Brom Bones): "That rich old gentleman? He just ducked for cover like everybody else, and he never told a tall tale about it."
- Proof line: "And there was an old gentleman who shall be nameless, being too rich a mynheer to be lightly mentioned, who, in the battle of White Plains, being an excellent master of defence, parried a musket-ball with a small sword, insomuch that he absolutely felt it whiz round the blade, and glance off at the hilt; in proof of which he was ready at any time to show the sword, with the hilt a little bent."
- Refresher hint: What does the old gentleman claim he did, and what will he show you?
- Why: He claims he parried a musket-ball with a small sword, and is ready to show the bent hilt as proof.
- Standards: ELA.K12.EE.1.1
- Gist check: One old man claims he blocked a musket ball with his sword, and every veteran thinks he won the war. ✓ / One old man admits he hid during the battle, and every veteran agrees he was a coward. / One old man shows a medal from the king, and every veteran stands to salute him.
- Discovery (vocabulary): "an excellent master of defence". Master of defence: an expert swordsman.

##### Read Between the Lines

**Chunk 3** (¶52 sentences 1 to 3; 54 words)

- Question: What can you infer about why this valley keeps its old legends?
- Key words highlighted: infer
- Choices: Families stay put for generations, so the stories stay too ✓ / A library in town collects and prints every story / Visitors bring brand new tales every single week
- Proof line: "Local tales and superstitions thrive best in these sheltered, long-settled retreats; but are trampled under foot by the shifting throng that forms the population of most of our country places."
- Refresher hint: Where do such tales thrive, and what tramples them?
- Why: Local tales thrive in sheltered, long-settled retreats but are trampled by shifting crowds elsewhere.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Ghost tales take over, since old settled places like this keep their local legends alive. ✓ / Ghost tales are banned, since the new settlers want to forget the past. / Ghost tales are rare here, since most families move away every year.
- Discovery (figurative): "legendary treasures". Stories are the neighborhood's treasure.

**Chunk 9** (¶54 sentences 7 to 8; 94 words)

- Question: What can you infer the storytellers want listeners to think about the crossing?
- Key words highlighted: infer
- Choices: That it is the most dangerous place to meet the ghost ✓ / That it is a safe shortcut on stormy nights / That it is being rebuilt by the church
- Proof line: "Such was one of the favorite haunts of the Headless Horseman, and the place where he was most frequently encountered."
- Refresher hint: What is the place to the Horseman?
- Why: It was one of his favorite haunts, the place where he was most frequently encountered.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The bridge is the Horseman's favorite haunt, where he once threw a doubter named Brouwer into the brook. ✓ / The bridge is where the Horseman lost his head, and Brouwer found it in the brook. / The bridge is where Brouwer, a believer, caught the Horseman and tied him up.
- Discovery (vocabulary): "a most heretical disbeliever in ghosts". Heretical: going against what everyone believes. Brouwer refused to believe in ghosts.

##### Figure It Out

**Chunk 4** (¶52 sentences 4 to 5; 77 words) · shared words reviewed

- Question: Read the words finish their first nap. What kind of figurative language is this?
- Key words highlighted: first nap
- Choices: Personification: ghosts nap like living people ✓ / Simile: ghosts are compared to sleepers using like / Onomatopoeia: the word nap copies a sound
- What does it mean? In busy towns, people move away before ghosts can visit them ✓ / Ghosts sleep all day and never come out / Villages hire guards to keep ghosts away
- Refresher hint: Ghosts don't really nap. What has happened by the time they wake?
- Why: Before a ghost can finish its first nap, its friends have traveled away: no one is left to haunt.
- Standards: ELA.7.R.3.1
- Gist check: The narrator jokes that ghosts in busy villages find all their friends have moved away. ✓ / The narrator warns that ghosts in busy villages are the most dangerous of all. / The narrator claims that ghosts never existed anywhere in the country.
- Discovery (figurative): "walk their rounds". Ghosts making their nightly rounds like a watchman.

##### Theme Thread

**Chunk 5** (¶53 sentences 1 to 3; 71 words)

- Question: Which idea from the very start of the story returns here?
- Key words highlighted: very start
- Choices: The Hollow's dreamy air spreads its spell to everyone nearby ✓ / Hard work always pays off in the end / Strangers are never welcome in the valley
- Proof line: "There was a contagion in the very air that blew from that haunted region; it breathed forth an atmosphere of dreams and fancies infecting all the land."
- Refresher hint: Remember the spell over the valley in the first expedition. What spreads from the haunted region?
- Why: A contagion in the air breathed forth dreams and fancies infecting all the land, just like the valley's spell.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: The nearness of Sleepy Hollow, whose air seems to spread dreams, explains all the ghost stories. ✓ / The distance from Sleepy Hollow, whose air is clear and fresh, explains why no one tells ghost stories. / A traveling storyteller from the city explains why everyone tells ghost stories.
- Discovery (figurative): "a contagion in the very air". Contagion: something catching, like a sickness. The Hollow's fancies spread through the air.

##### Find It

**Chunk 6** (¶53 sentences 4 to 6; 112 words)

- Question: Which line describes a pale lady and the cliff where she was lost?
- Key words highlighted: pale lady
- Proof line: "Some mention was made also of the woman in white, that haunted the dark glen at Raven Rock, and was often heard to shriek on winter nights before a storm, having perished there in the snow."
- Refresher hint: Look for a color and a rock.
- Why: The woman in white haunted the dark glen at Raven Rock, having perished there in the snow.
- Standards: ELA.K12.EE.1.1
- Gist check: The guests trade tales of mourning cries, a woman in white and the Headless Horseman in the churchyard. ✓ / The guests trade jokes about the harvest, the weather and the price of corn at market. / The guests trade news of a wedding, a new baby and a barn raising nearby.
- Discovery (vocabulary): "funeral trains". Funeral trains: long lines of mourners following a coffin.

##### Shades of Meaning

**Chunk 7** (¶54 sentences 1 to 3; 77 words) · shared words reviewed

- Question: Why does the narrator say the church walls shine modestly instead of brightly?
- Key words highlighted: modestly
- Choices: It makes the church seem humble and quietly good ✓ / It makes the church seem proud and showy / It makes the church seem dirty and old
- Proof words (any one): "like Christian purity beaming through the shades of retirement"
- Refresher hint: What are the walls compared to?
- Why: Modestly suggests humble goodness: the walls shine like purity beaming through the shade.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: The lonely church sits on a hill among trees, its white walls overlooking water and distant hills. ✓ / The busy church sits in the town square, its red walls facing a crowded market. / The ruined church sits in a swamp, its broken walls covered in vines.
- Discovery (figurative): "a silver sheet of water". Metaphor: the calm pond looks like a sheet of silver.

##### Word Detective

**Chunk 8** (¶54 sentences 4 to 6; 104 words) · shared words reviewed

- Question: In this chunk, what does dell mean?
- Key words highlighted: dell
- Choices: A small wooded valley ✓ / A tall stone tower / A wide sandy beach
- Proof words (any one): "along which raves a large brook"
- Refresher hint: What runs along it, and what grows there?
- Why: A wide woody dell with a brook raving along it: a small valley with trees.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: Beside the peaceful churchyard, a dark wooden bridge crosses a deep stream under thick trees. ✓ / Beside the busy churchyard, a bright stone bridge crosses a dry creek in open sun. / Beside the peaceful churchyard, a new road runs straight to the village market.
- Discovery (figurative): "the sunbeams seem to sleep". Personification: sunlight rests as if asleep.

##### Character Clue

**Chunk 10** (¶55 sentences 1 to 2; 92 words)

- Question: Which trait does Brom show in his own spooky tale?
- Key words highlighted: trait
- Choices: Boastful and bold, claiming he beat the ghost ✓ / Timid, admitting he fled in terror / Honest, saying he saw nothing at all
- Proof words (any one): "Daredevil beat the goblin horse all hollow"
- Refresher hint: Who wins the race in Brom's version?
- Why: He claims Daredevil beat the goblin horse all hollow: a boast.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Brom tops the tale by boasting he raced the Horseman, and the ghost vanished in fire at the bridge. ✓ / Brom admits he once fled from the Horseman and hid in a ditch until dawn. / Brom says the Horseman is only a story and laughs at everyone who believes it.
- Discovery (vocabulary): "an arrant jockey". Arrant: complete. Brom calls the ghost nothing but a common rider.

#### Expedition: The Lonely Road (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "How did the party end?" / "Did you see the schoolmaster leave?"
- True: "He stormed off to the barn and woke that poor beast with a smack and a boot."
  - Confirmed by: "Without looking to the right or left to notice the scene of rural wealth, on which he had so often gloated, he went straight to the stable, and with several hearty cuffs and kicks roused his steed most uncourteously from the comfortable quarters in which he was soundly sleeping, dreaming of mountains of corn and oats, and whole valleys of timothy and clover."
- False (laughing): "Everyone stayed the night at the Van Tassels'. Not a soul headed off till morning."
  - Disproved by: "The old farmers gathered together their families in their wagons, and were heard for some time rattling along the hollow roads, and over the distant hills."
- When caught: "Ha! They all rattled off home. I just wanted to see if you'd notice."

**Hans Van Ripper**

- Question cards: "What did the schoolmaster tell at the party?" / "What was the night like when he rode back?"
- True: "He told them bits from that old Puritan writer and wonders from back where he grew up."
  - Confirmed by: "He repaid them in kind with large extracts from his invaluable author, Cotton Mather, and added many marvellous events that had taken place in his native State of Connecticut, and fearful sights which he had seen in his nightly walks about Sleepy Hollow."
- False (head shake): "It was a pleasant time for a ride, cheerful as could be."
  - Disproved by: "The hour was as dismal as himself."
- When caught: "Hmph. Gloomy as a grave, that night. I'll own it."

**Katrina Van Tassel**

- Question cards: "How did the young people get home?" / "What do folks think of the old tulip tree?"
- True: "Folks pass that old tree with a mix of awe and fear, half for the poor soldier and half for the stories."
  - Confirmed by: "The common people regarded it with a mixture of respect and superstition, partly out of sympathy for the fate of its ill-starred namesake, and partly from the tales of strange sights, and doleful lamentations, told concerning it."
- False: "The young people went home quietly that night without a peep."
  - Disproved by: "Some of the damsels mounted on pillions behind their favorite swains, and their light-hearted laughter, mingling with the clatter of hoofs, echoed along the silent woodlands, sounding fainter and fainter, until they gradually died away,--and the late scene of noise and frolic was all silent and deserted."
- When caught: "Oh, we were giggling the whole way. You can't keep a secret from you."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Read Between the Lines

**Chunk 1** (¶56 sentences 1 to 2; 84 words)

- Question: What can you infer about how the evening's stories affect Ichabod?
- Key words highlighted: infer
- Choices: They are sinking in and stirring up his fears ✓ / They bore him while he waits to go home / They strike him as silly lies to ignore
- Proof line: "All these tales, told in that drowsy undertone with which men talk in the dark, the countenances of the listeners only now and then receiving a casual gleam from the glare of a pipe, sank deep in the mind of Ichabod."
- Refresher hint: Where do the tales go?
- Why: The tales, told in a drowsy undertone in the dark, sank deep in the mind of Ichabod.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The hushed ghost stories sink deep into Ichabod, and he adds spooky tales of his own. ✓ / The loud, cheerful jokes make Ichabod laugh, and he heads home in high spirits. / The ghost stories bore Ichabod, so he leaves the room to look for Katrina.
- Discovery (vocabulary): "drowsy undertone". Undertone: a low, quiet voice.

##### Find It

**Chunk 2** (¶57 sentences 1 to 3; 79 words)

- Question: Which line shows how some young women rode home?
- Key words highlighted: rode home
- Proof line: "Some of the damsels mounted on pillions behind their favorite swains, and their light-hearted laughter, mingling with the clatter of hoofs, echoed along the silent woodlands, sounding fainter and fainter, until they gradually died away,--and the late scene of noise and frolic was all silent and deserted."
- Refresher hint: Look for who sat behind whom.
- Why: Some of the damsels mounted on pillions behind their favorite swains.
- Standards: ELA.K12.EE.1.1
- Gist check: The party ends, and families and couples ride off until the farm grows silent. ✓ / The party grows louder, and more families arrive as the night goes on. / The party moves to the barn, where everyone dances until sunrise.
- Discovery (vocabulary): "on pillions". Pillion: a cushion behind a rider's saddle for a second person.

**Chunk 10** (¶60 sentences 1 to 4; 121 words)

- Question: Which line explains the pale thing he spots in the tree?
- Key words highlighted: pale thing
- Proof line: "As he approached a little nearer, he thought he saw something white, hanging in the midst of the tree: he paused and ceased whistling but, on looking more narrowly, perceived that it was a place where the tree had been scathed by lightning, and the white wood laid bare."
- Refresher hint: Look for what lightning did.
- Why: It was a place where lightning had scathed the tree and laid the white wood bare.
- Standards: ELA.K12.EE.1.1
- Gist check: Every scary sign at the tree turns out to be wind, lightning damage or rubbing branches. ✓ / Every scary sign at the tree turns out to be Brom's gang playing a trick. / Every scary sign at the tree turns out to be a real ghost waiting for him.
- Discovery (figurative): "his knees smote against the saddle". His knees knock together in fear.

##### Whose Eyes?

**Chunk 3** (¶57 sentences 4 to 6; 74 words)

- Question: What does the narrator admit about Ichabod's talk with Katrina?
- Key words highlighted: admit
- Choices: He doesn't know what was said between them ✓ / He heard every word through the door / He was the one who carried their notes
- Proof line: "What passed at this interview I will not pretend to say, for in fact I do not know."
- Refresher hint: Read what he says he will not pretend.
- Why: What passed at this interview he will not pretend to say, for in fact he does not know.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: Ichabod stays behind to speak with Katrina alone, but leaves soon after looking crushed. ✓ / Ichabod stays behind to dance with Katrina until dawn and leaves overjoyed. / Ichabod leaves first, and Katrina chases after him down the road.
- Discovery (figurative): "the high road to success". He thinks he is on the fast path to winning her.

##### Figure It Out

**Chunk 4** (¶57 sentences 7 to 11; 65 words) · shared words reviewed

- Question: Read the words sacking a henroost. What kind of figurative language is this?
- Key words highlighted: henroost
- Choices: Comparison: he leaves looking like a guilty chicken thief ✓ / Personification: the hens chase him out of the house / Onomatopoeia: the words copy a chicken's cluck
- What does it mean? He sneaks away ashamed and defeated ✓ / He leaves carrying stolen chickens / He runs off proud of his success
- Refresher hint: Who sneaks out of a henhouse at night, and how do they look?
- Why: He had the air of one who had been sacking a henroost rather than winning a heart: sneaking off in shame.
- Standards: ELA.7.R.3.1
- Gist check: The narrator wonders whether Katrina was only using Ichabod, and Ichabod slinks away in shame. ✓ / The narrator explains exactly what Katrina said, and Ichabod leaves engaged. / The narrator blames Brom for everything, and Ichabod leaves to find him.
- Discovery (figurative): "Heaven only knows". A way of saying nobody can tell.

##### Character Clue

**Chunk 5** (¶57 sentences 12 to 12; 63 words)

- Question: Which trait shows in how Ichabod treats Gunpowder now?
- Key words highlighted: trait
- Choices: Angry and bitter, taking it out on his mount ✓ / Gentle and patient, stroking his mount / Cheerful and proud, singing to his mount
- Proof words (any one): "several hearty cuffs and kicks"
- Refresher hint: How does he wake the sleeping horse?
- Why: He roused his steed most uncourteously, with several hearty cuffs and kicks.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Ignoring the riches he once admired, Ichabod storms to the stable and roughly wakes his horse. ✓ / Admiring the riches one last time, Ichabod strolls to the stable and gently saddles his horse. / Ignoring his horse entirely, Ichabod decides to walk home through the fields.
- Discovery (vocabulary): "whole valleys of timothy and clover". Timothy: a grass grown for hay. The horse dreams of feasts.

##### Word Detective

**Chunk 6** (¶58 sentences 1 to 3; 77 words) · shared words reviewed

- Question: In this chunk, what does crestfallen mean?
- Key words highlighted: crestfallen
- Choices: Sad and ashamed after a letdown ✓ / Proud and full of hope / Sleepy and ready for bed
- Proof words (any one): "heavy-hearted"
- Refresher hint: Look at the word paired with it.
- Why: Heavy-hearted and crestfallen: low in spirits after his disappointment.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: At midnight a heartbroken Ichabod rides home above the dark river. ✓ / At noon a cheerful Ichabod rides home beside the sparkling river. / At dawn a sleepy Ichabod rows home across the wide river.
- Discovery (figurative): "the very witching time of night". Witching time: midnight, when spirits are said to roam.

##### Catch the Lie

**Chunk 7** (¶58 sentences 4 to 6; 114 words)

- Question: Hans Van Ripper describes the ride back. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Hans Van Ripper): "That night the way was lively. Dogs barked right beside him and farm folk were still out and about."
- Proof line: "In the dead hush of midnight, he could even hear the barking of the watchdog from the opposite shore of the Hudson; but it was so vague and faint as only to give an idea of his distance from this faithful companion of man."
- Proof line: "No signs of life occurred near him, but occasionally the melancholy chirp of a cricket, or perhaps the guttural twang of a bullfrog from a neighboring marsh, as if sleeping uncomfortably and turning suddenly in his bed."
- Refresher hint: How far away was the dog? Was anyone near him?
- Why: The watchdog barked from the opposite shore, faint and far, and no signs of life occurred near him.
- Standards: ELA.K12.EE.1.1
- Gist check: The night is so still that Ichabod hears only faraway dogs, roosters, crickets and frogs. ✓ / The night is so noisy that Ichabod cannot hear his own horse's hooves. / The night is filled with music from a nearby farm dance.
- Discovery (figurative): "faithful companion of man". A fancy name for a dog.

##### Theme Thread

**Chunk 8** (¶59 sentences 1 to 4; 71 words)

- Question: Which idea returns as Ichabod rides on by himself?
- Key words highlighted: by himself
- Choices: Tales heard by the fire now feed his terror in the dark ✓ / Hard work always brings its own reward / True friends appear when you need them
- Proof line: "All the stories of ghosts and goblins that he had heard in the afternoon now came crowding upon his recollection."
- Refresher hint: What comes back to him from the afternoon?
- Why: All the stories of ghosts and goblins he had heard came crowding upon his recollection.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: As the night darkens, every ghost story Ichabod heard comes rushing back to him. ✓ / As the night brightens, Ichabod forgets every ghost story he ever heard. / As the night darkens, Ichabod makes up a new ghost story to tell his class.
- Discovery (figurative): "came crowding upon his recollection". The memories push in on him like a crowd.

##### Shades of Meaning

**Chunk 9** (¶59 sentences 5 to 8; 121 words) · shared words reviewed

- Question: Why does the narrator call the tree's limbs gnarled instead of just bent?
- Key words highlighted: gnarled
- Choices: It makes them sound twisted, knotty and eerie ✓ / It makes them sound smooth and young / It makes them sound straight and tidy
- Proof words (any one): "twisting down almost to the earth"
- Refresher hint: How do the limbs move?
- Why: Gnarled means knotted and twisted: the limbs go twisting down almost to the earth.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: On the road stands a giant twisted tulip tree linked to the sad fate of Major André. ✓ / On the road stands a small young apple tree planted by the schoolchildren. / On the road stands a stone statue honoring the victory at White Plains.
- Discovery (figurative): "towered like a giant". A simile: the tulip tree rises above the rest like a giant.

#### Expedition: The Headless Horseman (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "What did the stranger on the road look like?" / "Have you heard what happened that night?"
- True: "A huge rider, I hear, on a dark and mighty steed."
  - Confirmed by: "He appeared to be a horseman of large dimensions, and mounted on a black horse of powerful frame."
- False (laughing): "When the schoolmaster sped up, that other rider fell far behind."
  - Disproved by: "The stranger, however, quickened his horse to an equal pace."
- When caught: "Ha! That rider stuck to him like a burr. Or so I hear."

**Hans Van Ripper**

- Question cards: "What happened at the brook crossing?" / "How did my old horse behave?"
- True: "My old horse bolted sideways into the briars instead of crossing."
  - Confirmed by: "Ichabod, whose fears increased with the delay, jerked the reins on the other side, and kicked lustily with the contrary foot: it was all in vain; his steed started, it is true, but it was only to plunge to the opposite side of the road into a thicket of brambles and alder bushes."
- False (head shake): "He trotted straight over the planks without a moment's fuss."
  - Disproved by: "As he approached the stream, his heart began to thump; he summoned up, however, all his resolution, gave his horse half a score of kicks in the ribs, and attempted to dash briskly across the bridge; but instead of starting forward, the perverse old animal made a lateral movement, and ran broadside against the fence."
- When caught: "Hmph. He fought that schoolmaster every step. He's like me that way."

**Katrina Van Tassel**

- Question cards: "Why is that crossing so feared?" / "What happened there in the war?"
- True: "That's the very place the British officer was taken, by farmers hiding in the leaves."
  - Confirmed by: "It was at this identical spot that the unfortunate André was captured, and under the covert of those chestnuts and vines were the sturdy yeomen concealed who surprised him."
- False: "Boys cross that water on their own after sunset without a second thought."
  - Disproved by: "This has ever since been considered a haunted stream, and fearful are the feelings of the schoolboy who has to pass it alone after dark."
- When caught: "No, the boys run past it shaking. I was only teasing."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Find It

**Chunk 1** (¶61 sentences 1 to 3; 72 words)

- Question: Which line describes what the crossing is made of?
- Key words highlighted: made of
- Proof line: "A few rough logs, laid side by side, served for a bridge over this stream."
- Refresher hint: Look for what was laid side by side.
- Why: A few rough logs, laid side by side, served for a bridge.
- Standards: ELA.K12.EE.1.1
- Gist check: Past the tree, a log bridge crosses a brook into a dark, swampy glen. ✓ / Past the tree, a stone bridge crosses a wide river into a sunny meadow. / Past the tree, the road ends at a locked gate beside the church.
- Discovery (figurative): "a cavernous gloom". So dark under the trees it feels like a cave.

**Chunk 10** (¶65 sentences 1 to 2; 75 words)

- Question: Which line shows Gunpowder heading the other way from home?
- Key words highlighted: other way
- Proof line: "They had now reached the road which turns off to Sleepy Hollow; but Gunpowder, who seemed possessed with a demon, instead of keeping up it, made an opposite turn, and plunged headlong downhill to the left."
- Refresher hint: Which way does he go at the road to Sleepy Hollow?
- Why: Instead of keeping up the road to Sleepy Hollow, he plunged headlong downhill to the left.
- Standards: ELA.K12.EE.1.1
- Gist check: Instead of the road home, Gunpowder plunges downhill toward the haunted bridge and the church. ✓ / Taking the road home, Gunpowder trots safely to Hans Van Ripper's farm. / Instead of running, Gunpowder stops and refuses to move another step.
- Discovery (figurative): "possessed with a demon". The horse acts as if a demon were driving it.

##### Read Between the Lines

**Chunk 2** (¶61 sentences 4 to 6; 62 words)

- Question: What can you infer about why travelers dread this crossing?
- Key words highlighted: infer
- Choices: It is tied to a real capture and many haunted tales ✓ / It is broken and about to fall into the water / It is guarded by soldiers who stop every traveler
- Proof line: "It was at this identical spot that the unfortunate André was captured, and under the covert of those chestnuts and vines were the sturdy yeomen concealed who surprised him."
- Proof line: "This has ever since been considered a haunted stream, and fearful are the feelings of the schoolboy who has to pass it alone after dark."
- Refresher hint: What happened here long ago, and what has it been considered ever since?
- Why: André was captured at this very spot, and it has ever since been considered a haunted stream.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: This bridge, where Major André was captured, is the scariest spot of all on the road. ✓ / This bridge, newly built by the farmers, is the safest spot of all on the road. / This bridge, where Brom once fell in, is a favorite place for swimming.
- Discovery (vocabulary): "sturdy yeomen". Yeomen: farmers who owned their land; here, the men who caught André.

**Chunk 7** (¶63 sentences 11 to 12, ¶64 sentences 1 to 2; 96 words)

- Question: What can you infer about the newcomer from the way he keeps up?
- Key words highlighted: infer
- Choices: He means to stay with Ichabod no matter what ✓ / He is lost and needs directions home / He wants to race Ichabod for a prize
- Proof line: "The stranger, however, quickened his horse to an equal pace."
- Refresher hint: What happens when Ichabod speeds up?
- Why: The stranger quickened his horse to an equal pace: he will not be left behind.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The figure is a big rider on a black horse who keeps pace with Ichabod however he rides. ✓ / The figure is a small boy on a pony who quickly falls far behind. / The figure is a farmer with a cart who waves and turns down a lane.
- Discovery (vocabulary): "jogging along on the blind side". Blind side: the side the horse can't see, since Gunpowder has one blind eye.

##### Character Clue

**Chunk 3** (¶62 sentences 1 to 2; 108 words)

- Question: Which trait does Gunpowder show at the water?
- Key words highlighted: trait
- Choices: Stubborn, refusing to go where he's steered ✓ / Obedient, trotting straight ahead at once / Sleepy, lying down right in the road
- Proof words (any one): "the perverse old animal made a lateral movement"
- Refresher hint: What does the horse do instead of starting forward?
- Why: Instead of starting forward, the perverse old animal made a lateral movement into the fence.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Ichabod kicks his horse toward the bridge, but Gunpowder swerves into the fence and the bushes. ✓ / Ichabod gently guides his horse, and Gunpowder trots calmly over the bridge. / Ichabod jumps off his horse and wades across the brook on foot.
- Discovery (figurative): "his heart began to thump". Thump: the sound of his heart pounding with fear.

##### Figure It Out

**Chunk 4** (¶62 sentences 3 to 6; 102 words) · shared words reviewed

- Question: Read the words like some gigantic monster ready to spring. What kind of figurative language is this?
- Key words highlighted: gigantic monster
- Choices: Simile: the dark shape is compared to a monster using like ✓ / Metaphor: the shape is called a monster, without like / Personification: the bridge leaps at him
- What does it mean? The shape looks huge, threatening and ready to attack ✓ / A real monster lives under the bridge / The shape is a friendly neighbor waving
- Refresher hint: Look for the word like. What does the shape seem about to do?
- Why: Like some gigantic monster ready to spring: a simile making the shadow feel huge and threatening.
- Standards: ELA.7.R.3.1
- Gist check: Gunpowder stops at the bridge, and Ichabod sees a huge dark shape looming by the brook. ✓ / Gunpowder races over the bridge, and Ichabod sees Katrina waiting by the brook. / Gunpowder falls into the brook, and Ichabod swims to the other side.
- Discovery (vocabulary): "a plashy tramp". Plashy: splashing. He hears a heavy step in the wet ground.

##### Catch the Lie

**Chunk 5** (¶63 sentences 1 to 5; 68 words)

- Question: Brom Bones tells what Ichabod did next. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Brom Bones): "The schoolmaster wheeled around and galloped off the moment he saw the stranger. Never said a word to him."
- Proof line: "To turn and fly was now too late; and besides, what chance was there of escaping ghost or goblin, if such it was, which could ride upon the wings of the wind?"
- Proof line: "Summoning up, therefore, a show of courage, he demanded in stammering accents, “Who are you?”"
- Refresher hint: Could he still flee? And did he speak?
- Why: It was too late to turn and fly, so he summoned a show of courage and stammered, Who are you?
- Standards: ELA.K12.EE.1.1
- Gist check: Too frightened to flee, Ichabod stammers out a question, but the shape gives no answer. ✓ / Too angry to be afraid, Ichabod shouts a challenge, and the shape runs away. / Too tired to care, Ichabod falls asleep in the saddle by the brook.
- Discovery (figurative): "upon the wings of the wind". So fast it seems to fly on the wind.

##### Shades of Meaning

**Chunk 6** (¶63 sentences 6 to 10; 85 words) · shared words reviewed

- Question: Why does the narrator call Gunpowder inflexible instead of just tired?
- Key words highlighted: inflexible
- Choices: It shows the horse stubbornly won't budge ✓ / It shows the horse is weak and sick / It shows the horse is calm and happy
- Proof words (any one): "Once more he cudgelled the sides"
- Refresher hint: How many times has Ichabod had to beat him?
- Why: Inflexible means unbending: once more Ichabod must cudgel him, and still he won't move.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: Ichabod sings a psalm in fear, and the shadow suddenly leaps into the middle of the road. ✓ / Ichabod whistles a jig in joy, and the shadow slowly melts into the trees. / Ichabod stays silent, and the shadow turns out to be his own reflection.
- Discovery (vocabulary): "with involuntary fervor". Involuntary: without meaning to. He bursts into song from pure fear.

##### Word Detective

**Chunk 8** (¶64 sentences 3 to 7; 134 words) · shared words reviewed

- Question: In this chunk, what does pertinacious mean?
- Key words highlighted: pertinacious
- Choices: Stubbornly sticking close ✓ / Kind and very talkative / Small and easily scared
- Proof words (any one): "did the same"
- Refresher hint: What does the companion do when Ichabod slows down?
- Why: When Ichabod lagged behind, the other did the same: a companion who stubbornly sticks close.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: Against the sky Ichabod sees that the silent rider has no head and carries it on his saddle. ✓ / Against the sky Ichabod sees that the silent rider is Brom Bones grinning at him. / Against the sky Ichabod sees that the rider is only a scarecrow tied to a horse.
- Discovery (figurative): "clove to the roof of his mouth". His mouth is so dry with fear that his tongue sticks.

##### Theme Thread

**Chunk 9** (¶64 sentences 8 to 10; 75 words)

- Question: Which idea about Ichabod reaches its peak in this chase?
- Key words highlighted: chase
- Choices: His belief in ghost tales turns into pure terror ✓ / His greed finally wins him a fortune / His bravery makes him a hero at last
- Proof line: "His terror rose to desperation; he rained a shower of kicks and blows upon Gunpowder, hoping by a sudden movement to give his companion the slip; but the spectre started full jump with him."
- Refresher hint: What has his fear grown into?
- Why: His terror rose to desperation: every tale he believed has come to life.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: Ichabod gallops off in terror, but the headless rider chases him with sparks flying. ✓ / Ichabod stops to talk, and the headless rider politely rides away. / Ichabod chases the headless rider, who flees into the woods.
- Discovery (figurative): "through thick and thin". Through everything in their way.

#### Expedition: Gone (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "What did the searchers turn up?" / "Did the schoolmaster's horse come home?"
- True: "Down by the creek lay the fellow's cap, and next to it a busted gourd."
  - Confirmed by: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."
- False (laughing): "That old nag never made it back. Ran off for good."
  - Disproved by: "The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate."
- When caught: "Ha! He was munching grass at the gate by morning. Lazy old thing."

**Hans Van Ripper**

- Question cards: "What did the schoolmaster leave behind?" / "What did you do with his things?"
- True: "I tossed his conjuring volumes and that scribbled poem in the fire, and my young ones are done with lessons."
  - Confirmed by: "These magic books and the poetic scrawl were forthwith consigned to the flames by Hans Van Ripper; who, from that time forward, determined to send his children no more to school, observing that he never knew any good come of this same reading and writing."
- False (head shake): "He left a trunk stuffed with fine suits and silver."
  - Disproved by: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."
- When caught: "Hmph. Two shirts and a half. That's the truth of it."

**Katrina Van Tassel**

- Question cards: "What did people say at church that Sunday?" / "Who teaches the children now?"
- True: "Since he owed no one and had no wife, people soon stopped thinking about him, and a new teacher took over."
  - Confirmed by: "As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead."
- False: "At church everyone agreed he had simply run away. No one blamed any ghost."
  - Disproved by: "The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian."
- When caught: "Oh, they all blamed the Hessian. Every last one of them."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Find It

**Chunk 1** (¶66 sentences 1 to 2; 90 words)

- Question: Which line shows the moment his seat starts to fail?
- Key words highlighted: seat starts to fail
- Proof line: "As yet the panic of the steed had given his unskilful rider an apparent advantage in the chase, but just as he had got half way through the hollow, the girths of the saddle gave way, and he felt it slipping from under him."
- Refresher hint: Look for straps giving way.
- Why: The girths of the saddle gave way, and he felt it slipping from under him.
- Standards: ELA.K12.EE.1.1
- Gist check: Halfway through the hollow the saddle slips off, and Ichabod clings to Gunpowder's neck. ✓ / Halfway through the hollow the horse stops, and Ichabod climbs a tree to hide. / Halfway through the hollow Ichabod buys a new saddle from a passing farmer.
- Discovery (vocabulary): "the girths of the saddle gave way". Girths: straps under a horse's belly that hold the saddle on.

**Chunk 8** (¶69 sentences 1 to 3; 73 words)

- Question: Which line lists everything Ichabod owned?
- Key words highlighted: owned
- Proof line: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."
- Refresher hint: Look for a list of clothes and odds and ends.
- Why: Two shirts and a half, two stocks, stockings, small-clothes, a rusty razor, a psalm book and a broken pitch-pipe.
- Standards: ELA.K12.EE.1.1
- Gist check: No body is found, and Hans sorts through Ichabod's few shabby belongings. ✓ / Ichabod's body is found, and Hans buries him behind the church. / No body is found, and Hans discovers a fortune hidden in the bundle.
- Discovery (vocabulary): "a broken pitch-pipe". Pitch-pipe: a small pipe used to find the right note for singing.

##### Read Between the Lines

**Chunk 2** (¶66 sentences 3 to 3; 78 words)

- Question: What can you infer about Ichabod's worries even in the middle of the chase?
- Key words highlighted: infer
- Choices: He still fears Hans will be furious about the lost saddle ✓ / He worries he left the schoolhouse door unlocked / He fears Katrina will laugh at his old horse
- Proof line: "For a moment the terror of Hans Van Ripper’s wrath passed across his mind,--for it was his Sunday saddle; but this was no time for petty fears; the goblin was hard on his haunches; and (unskilful rider that he was!) he had much ado to maintain his seat; sometimes slipping on one side, sometimes on another, and sometimes jolted on the high ridge of his horse’s backbone, with a violence that he verily feared would cleave him asunder."
- Refresher hint: Whose saddle was it, and which one?
- Why: The terror of Hans Van Ripper's wrath passed across his mind, for it was his Sunday saddle.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Ichabod briefly fears Hans's anger over the saddle, then struggles to stay on the bare horse. ✓ / Ichabod forgets the saddle completely and rides perfectly on the bare horse. / Ichabod jumps down to rescue the saddle, then runs the rest of the way.
- Discovery (vocabulary): "petty fears". Petty: small and unimportant, next to a goblin chase.

**Chunk 10** (¶70 sentences 1 to 4; 126 words)

- Question: What can you infer about how much the village misses Ichabod?
- Key words highlighted: infer
- Choices: Not much: they gossip, then quickly move on ✓ / Deeply: they search for him for years / Angrily: they blame Katrina for everything
- Proof line: "As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead."
- Refresher hint: Who troubled about him afterward?
- Why: As he owed nobody, nobody troubled his head any more about him, and another pedagogue reigned in his stead.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The neighbors decide the Galloping Hessian carried Ichabod off, then forget him as a new teacher arrives. ✓ / The neighbors decide Ichabod ran off with Katrina and send a search party after them. / The neighbors decide Brom did it and run him out of the valley for good.
- Discovery (vocabulary): "a whole budget of others". Budget: here, a bundle or collection of stories.

##### Catch the Lie

**Chunk 3** (¶67 sentences 1 to 5; 74 words)

- Question: Hans Van Ripper guesses what the schoolmaster was thinking. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Hans Van Ripper): "He thought that bridge was the worst place to be caught, and he tried to keep far away from it."
- Proof line: "He recollected the place where Brom Bones’s ghostly competitor had disappeared."
- Proof line: "“If I can but reach that bridge,” thought Ichabod, “I am safe.”"
- Refresher hint: What did Ichabod remember about that spot, and what did he think?
- Why: He remembered where Brom's ghostly rival vanished and thought, If I can but reach that bridge, I am safe.
- Standards: ELA.K12.EE.1.1
- Gist check: Spotting the church bridge, Ichabod remembers Brom's tale and believes he'll be safe once he crosses. ✓ / Spotting the church bridge, Ichabod remembers it is broken and turns back in despair. / Spotting his schoolhouse, Ichabod rides inside and bars the door behind him.
- Discovery (figurative): "a silver star in the bosom of the brook". The star's reflection shines in the water like silver.

##### Shades of Meaning

**Chunk 4** (¶67 sentences 6 to 7; 70 words) · shared words reviewed

- Question: Why does the narrator say Gunpowder thundered over instead of crossed?
- Key words highlighted: thundered
- Choices: It shows how loud and fast the crossing is ✓ / It shows a storm is breaking overhead / It shows the horse is calm and slow
- Proof words (any one): "the resounding planks"
- Refresher hint: What sound do the planks make?
- Why: Thundered paints a loud, pounding gallop over the resounding planks.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: With the black horse breathing at his back, Ichabod gallops over the bridge and looks back. ✓ / With no one behind him, Ichabod walks his horse slowly over the bridge. / With the black horse beside him, Ichabod stops to rest on the bridge.
- Discovery (vocabulary): "fire and brimstone". Brimstone: burning sulfur, linked with demons in old stories.

##### Figure It Out

**Chunk 5** (¶67 sentences 8 to 10; 59 words) · shared words reviewed

- Question: Read the words passed by like a whirlwind. What kind of figurative language is this?
- Key words highlighted: whirlwind
- Choices: Simile: the riders rush past like a whirlwind ✓ / Metaphor: the riders are called a storm, without like / Onomatopoeia: the words copy the sound of wind
- What does it mean? The horses and rider race past in a sudden, wild rush ✓ / A real tornado strikes the bridge / The riders slowly circle around Ichabod
- Refresher hint: Look for the word like. How fast and wild is a whirlwind?
- Why: Like a whirlwind: everything sweeps past in a sudden, violent rush.
- Standards: ELA.7.R.3.1
- Gist check: The goblin hurls his head at Ichabod, knocking him into the dust as the horses rush past. ✓ / The goblin tips his hat to Ichabod and rides away into the church. / The goblin drops his head in the brook, and Ichabod laughs and rides home.
- Discovery (figurative): "the horrible missile". Missile: something thrown. The head becomes a weapon.

##### Character Clue

**Chunk 6** (¶68 sentences 1 to 4; 75 words)

- Question: Which trait does Hans show when the teacher goes missing?
- Key words highlighted: trait
- Choices: Worried, though partly about his own saddle ✓ / Overjoyed to be rid of his boarder / Calm, sure that all is perfectly fine
- Proof words (any one): "the fate of poor Ichabod, and his saddle"
- Refresher hint: What two things is he uneasy about?
- Why: He began to feel some uneasiness about the fate of poor Ichabod, and his saddle.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Next morning Gunpowder is grazing at home, but Ichabod never shows up, and Hans grows uneasy. ✓ / Next morning Ichabod rides in for breakfast, and Hans scolds him for being late. / Next morning Gunpowder is gone too, and Hans calls it a lucky trade.
- Discovery (figurative): "soberly cropping the grass". The horse grazes calmly, as if nothing happened.

##### Theme Thread

**Chunk 7** (¶68 sentences 5 to 6; 87 words)

- Question: Which idea about the mystery keeps the story open?
- Key words highlighted: mystery
- Choices: The clues could point to a ghost or to a human trick ✓ / Every clue proves the ghost is real / The clues show Ichabod simply moved away happily
- Proof line: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."
- Refresher hint: Look at what lies beside the hat. Is it a ghost's head?
- Why: Hoofprints, a hat and a shattered pumpkin: the evidence fits the ghost story and a prankster just as well.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: Searchers find the trampled saddle, hoofprints to the bridge, Ichabod's hat and a smashed pumpkin. ✓ / Searchers find Ichabod asleep under the bridge with his hat over his face. / Searchers find nothing at all, not even a single hoofprint.
- Discovery (vocabulary): "a shattered pumpkin". Shattered: smashed to pieces.

##### Whose Eyes?

**Chunk 9** (¶69 sentences 4 to 6; 137 words)

- Question: How does the narrator want us to see Hans's decision about learning?
- Key words highlighted: narrator
- Choices: As a foolish overreaction, poking fun at Hans ✓ / As wise advice every parent should follow / As a sad choice forced by poverty
- Proof line: "These magic books and the poetic scrawl were forthwith consigned to the flames by Hans Van Ripper; who, from that time forward, determined to send his children no more to school, observing that he never knew any good come of this same reading and writing."
- Refresher hint: What does Hans conclude from one missing teacher?
- Why: He decides never to send his children to school, since he never knew any good come of reading and writing: the narrator is poking fun.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: Hans burns Ichabod's books and love poems and decides reading and writing do no good. ✓ / Hans keeps Ichabod's books and decides to become a teacher himself. / Hans sells Ichabod's books and gives the money to Katrina.
- Discovery (figurative): "consigned to the flames". Consigned to the flames: thrown into the fire.

#### Expedition: The Postscript (7 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Brom Bones**

- Question cards: "What happened after the schoolmaster left?" / "Is that old crossing still feared?"
- True: "Not long after he vanished, I walked Katrina down the aisle as my bride."
  - Confirmed by: "Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell."
- False (laughing): "Folks use that old crossing as easy as you please now. Nobody thinks twice."
  - Disproved by: "The bridge became more than ever an object of superstitious awe; and that may be the reason why the road has been altered of late years, so as to approach the church by the border of the millpond."
- When caught: "Ha! They even moved the road to stay clear of it. Can you blame them?"

**Hans Van Ripper**

- Question cards: "What do the grandmothers say happened?" / "What became of the old school?"
- True: "The old school went to ruin, and farm lads swear they still hear him humming hymns out there at dusk."
  - Confirmed by: "The schoolhouse being deserted soon fell to decay, and was reported to be haunted by the ghost of the unfortunate pedagogue and the plowboy, loitering homeward of a still summer evening, has often fancied his voice at a distance, chanting a melancholy psalm tune among the tranquil solitudes of Sleepy Hollow."
- False (head shake): "The grandmothers laugh at that ghost talk. They say he just ran off."
  - Disproved by: "The old country wives, however, who are the best judges of these matters, maintain to this day that Ichabod was spirited away by supernatural means; and it is a favorite story often told about the neighborhood round the winter evening fire."
- When caught: "Hmph. They swear he was spirited away. And who am I to argue?"

**Katrina Van Tassel**

- Question cards: "Have you heard news of the schoolmaster?" / "Did you ever marry?"
- True: "A neighbor back from the city says the schoolmaster lives on and even sits as a judge now."
  - Confirmed by: "It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court."
- False: "I never married anyone from the valley. I'm still waiting for the right one."
  - Disproved by: "Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell."
- When caught: "Oh, you know very well whom I married. I just like to keep people guessing."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Find It

**Chunk 1** (¶71 sentences 1 to 1; 116 words)

- Question: Which line reports Ichabod's later life far away?
- Key words highlighted: later life
- Proof line: "It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court."
- Refresher hint: Look for news brought back from New York.
- Why: An old farmer brought word that Ichabod was alive, studied law and became a justice of the Ten Pound Court.
- Standards: ELA.K12.EE.1.1
- Gist check: Years later a farmer reports that Ichabod is alive and became a lawyer and a judge far away. ✓ / Years later a farmer reports that Ichabod's ghost haunts the schoolhouse at night. / Years later a farmer reports that Ichabod married Katrina in New York.
- Discovery (vocabulary): "Ten Pound Court". A small local court that handled minor cases.

##### Read Between the Lines

**Chunk 2** (¶71 sentences 2 to 2; 61 words)

- Question: What can you infer about Brom's part in that night?
- Key words highlighted: infer
- Choices: He may have played the headless rider himself ✓ / He searched all night to save Ichabod / He was away in town and knew nothing
- Proof line: "Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell."
- Refresher hint: When does he laugh, and what did some suspect?
- Why: He bursts into a hearty laugh at the mention of the pumpkin, so some suspect he knew more than he chose to tell.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Brom marries Katrina and laughs knowingly whenever the pumpkin comes up. ✓ / Brom leaves the valley and never speaks of Ichabod again. / Brom marries a girl from town and avoids the Van Tassels forever.
- Discovery (figurative): "conducted the blooming Katrina in triumph to the altar". He marries her as if winning a prize.

**Chunk 7** (¶80 sentences 1 to 2, ¶81 sentences 1 to 2; 85 words)

- Question: What can you infer from the last words of the tale?
- Key words highlighted: infer
- Choices: Even the teller doubts much of the tale ✓ / The teller swears every word is true / The teller saw the ghost himself
- Proof line: "“Faith, sir,” replied the story-teller, “as to that matter, I don’t believe one-half of it myself.”"
- Refresher hint: How much of it does he believe?
- Why: He admits, I don't believe one-half of it myself.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The doubtful gentleman questions the tale, and the storyteller admits he believes only half of it. ✓ / The doubtful gentleman is convinced, and the storyteller swears it all happened. / The doubtful gentleman leaves, and the storyteller starts a brand new tale.
- Discovery (vocabulary): "the ratiocination of the syllogism". Ratiocination: careful reasoning. The gentleman is puzzled by the joking logic.

##### Theme Thread

**Chunk 3** (¶72 sentences 1 to 3; 130 words)

- Question: Which idea from the start of the story wins out in the end?
- Key words highlighted: wins out
- Choices: The valley prefers its ghost story to a plain explanation ✓ / Hard work always makes a poor man rich in the end / True love always conquers every obstacle in its way
- Proof line: "The old country wives, however, who are the best judges of these matters, maintain to this day that Ichabod was spirited away by supernatural means; and it is a favorite story often told about the neighborhood round the winter evening fire."
- Refresher hint: What do the old wives maintain, even with the farmer's news?
- Why: The old country wives maintain to this day that Ichabod was spirited away: the valley's spell holds.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: The old wives insist Ichabod was spirited away, and his ghost is said to haunt the empty schoolhouse. ✓ / The old wives insist Ichabod moved to the city, and the schoolhouse is rebuilt. / The old wives forget Ichabod, and the bridge becomes a picnic spot.
- Discovery (vocabulary): "an object of superstitious awe". Superstitious awe: fear and wonder based on belief in the supernatural.

##### Whose Eyes?

**Chunk 4** (¶75 sentences 1 to 3; 98 words)

- Question: Who does the postscript say first told this tale?
- Key words highlighted: postscript
- Choices: A shabby, cheerful old storyteller at a city meeting ✓ / Ichabod Crane himself, years after the ride / Katrina Van Tassel, at her wedding feast
- Proof line: "The narrator was a pleasant, shabby, gentlemanly old fellow, in pepper-and-salt clothes, with a sadly humourous face, and one whom I strongly suspected of being poor--he made such efforts to be entertaining."
- Refresher hint: Look for a description of the narrator who related it.
- Why: The narrator was a pleasant, shabby, gentlemanly old fellow, suspected of being poor.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: The postscript says the tale was told at a city meeting by a shabby old fellow, to much laughter. ✓ / The postscript says the tale was found in a dead soldier's diary near the bridge. / The postscript says the tale was written by Brom Bones to explain the pumpkin.
- Discovery (vocabulary): "pepper-and-salt clothes". Pepper-and-salt: cloth speckled black and white.

##### Character Clue

**Chunk 5** (¶75 sentences 4 to 6; 125 words)

- Question: Which trait fits the frowning listener?
- Key words highlighted: trait
- Choices: Serious and doubtful, slow to be amused ✓ / Jolly and quick to laugh at anything / Sleepy and not listening at all
- Proof words (any one): "maintained a grave and rather severe face throughout"
- Refresher hint: How does his face look while everyone else laughs?
- Why: He maintained a grave and rather severe face throughout, as if turning a doubt over in his mind.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: One stern old gentleman never smiles and demands to know the moral of the story. ✓ / One jolly old gentleman laughs loudest and asks to hear it again. / One sleepy old gentleman snores through the whole tale.
- Discovery (vocabulary): "beetling eyebrows". Beetling: sticking out over the eyes, like a frown.

##### Catch the Lie

**Chunk 6** (¶76 sentences 1 to 1, ¶77 sentences 1 to 1, ¶78 sentences 1 to 1, ¶79 sentences 1 to 1; 115 words)

- Question: Brom Bones explains the storyteller's lesson. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Brom Bones): "The fellow said the tale's lesson is plain: never tell jokes about ghosts."
- Proof line: "“That there is no situation in life but has its advantages and pleasures--provided we will but take a joke as we find it:"
- Refresher hint: What does the storyteller say about jokes?
- Why: He says every situation has its pleasures, provided we will but take a joke as we find it.
- Standards: ELA.K12.EE.1.1
- Gist check: The storyteller gives a joking moral: take life's jokes as they come, and losing an heiress can lead to success. ✓ / The storyteller gives a serious moral: ghosts are real, so stay home at night. / The storyteller refuses to give any moral and walks out of the room.
- Discovery (vocabulary): "goblin troopers". Troopers: cavalry soldiers; here, ghostly riders.

### The Tell-Tale Heart

#### DRAFT for review, not live: Expedition: The Vulture Eye (24 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**The Narrator**

- Question cards: "What did you tell the officers?" / "How did you feel while the officers stayed?"
- True: "I told those gentlemen the master of the house was away, visiting outside the city."
  - Confirmed by: "The old man, I mentioned, was absent in the country."
- False: "I was glad of their company. I would have kept those visitors talking until sunrise."
  - Disproved by: "But, ere long, I felt myself getting pale and wished them gone."
  - Disproved by: "Why would they not be gone?"
- When caught: "You noticed. Very sharp. Almost as sharp as my own hearing."

**Officer**

- Question cards: "Why did you go to the house?" / "What did you make of the man who let you in?"
- True: "My partners and I came calling before sunrise, once a report reached our station."
  - Confirmed by: "There entered three men, who introduced themselves, with perfect suavity, as officers of the police."
  - Confirmed by: "A shriek had been heard by a neighbor during the night; suspicion of foul play had been aroused; information had been lodged at the police-office, and they (the officers) had been deputed to search the premises."
- False: "We didn't believe a word that fellow said, right from the start."
  - Disproved by: "The officers were satisfied."
  - Disproved by: "My manner had convinced them."
- When caught: "True enough, he had us fooled at first. His manner was very smooth."

**The Neighbor**

- Question cards: "What did you notice that night?" / "Why did you go to the police?"
- True: "Somebody screamed over there after dark, so I sent word to the authorities, and they sent people round."
  - Confirmed by: "A shriek had been heard by a neighbor during the night; suspicion of foul play had been aroused; information had been lodged at the police-office, and they (the officers) had been deputed to search the premises."
  - Confirmed by: "There entered three men, who introduced themselves, with perfect suavity, as officers of the police."
- False: "I didn't catch a single noise. I only sent for the watch because the lamps were out."
  - Disproved by: "A shriek had been heard by a neighbor during the night; suspicion of foul play had been aroused; information had been lodged at the police-office, and they (the officers) had been deputed to search the premises."
- When caught: "All right, I did hear a cry. That is exactly why I went."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Whose Eyes?

**Chunk 1** (¶1 sentences 1 to 7; 80 words)

- Question: What does the narrator most want the listener to believe?
- Key words highlighted: narrator
- Choices: That he is not mad, only sharply alert ✓ / That he is truly sorry for what he did / That someone else is to blame for it all
- Proof line: "How, then, am I mad?"
- Refresher hint: What question does he keep asking?
- Why: How, then, am I mad? He argues his sharp senses prove he is sane.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: The narrator insists he is nervous but not mad, and boasts that his hearing is unusually sharp. ✓ / The narrator admits he is mad and begs the listener to forgive him. / The narrator says he is deaf and cannot hear anything around him.
- Discovery (figurative): "very, very dreadfully nervous". The repeated words show how worked up he is.

**Chunk 14** (¶17 sentences 1 to 2, ¶18 sentences 1 to 2; 124 words)

- Question: What does the narrator insist explains what he hears?
- Key words highlighted: insist
- Choices: His senses are unusually sharp, not mad ✓ / A ghost is knocking inside the walls / The old man left a clock running
- Proof line: "And now — have I not told you that what you mistake for madness is but over acuteness of the senses? — now, I say, there came to my ears a low, dull, quick sound — much such a sound as a watch makes when enveloped in cotton."
- Refresher hint: What does he say you mistake for madness?
- Why: He says what you mistake for madness is but over acuteness of the senses.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: The narrator sees the eye wide open, grows furious, and then hears a low, quick beating sound. ✓ / The narrator sees the eye closed, calms down, and hears only silence. / The narrator sees the old man smiling and hears him begin to sing.
- Discovery (figurative): "a hideous veil over it". The cloudy film over the eye is described like a veil.

**Chunk 18** (¶21 sentences 8 to 10, ¶22 sentences 1 to 2, ¶23 sentences 1 to 5; 108 words)

- Question: What does the narrator claim his careful hiding shows?
- Key words highlighted: claim
- Choices: That he cannot be mad ✓ / That he is truly sorry / That the old man deserved it
- Proof line: "If, still, you think me mad, you will think so no longer when I describe the wise precautions I took for the concealment of the body."
- Refresher hint: What will you think no longer once he describes it?
- Why: If you still think him mad, he says, you will think so no longer when he describes his precautions.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: The narrator says the eye will trouble him no more and boasts of how carefully he hid what he had done. ✓ / The narrator says the eye still haunts him and runs to tell a neighbor everything. / The narrator says the old man recovered, and they shared breakfast at dawn.
- Discovery (vocabulary): "the wise precautions". Precautions: steps taken to avoid trouble.

##### Find It

**Chunk 2** (¶2 sentences 1 to 7; 52 words)

- Question: Which line shows money was not his reason?
- Key words highlighted: money
- Proof line: "For his gold I had no desire."
- Refresher hint: Look for what he says about the old man's wealth.
- Why: For his gold I had no desire.
- Standards: ELA.K12.EE.1.1
- Gist check: The narrator says the idea haunted him even though the old man never wronged him. ✓ / The narrator says the old man cheated him out of his gold. / The narrator says he hated the old man from the very first day.
- Discovery (figurative): "it haunted me day and night". The idea follows him everywhere, like a ghost.

**Chunk 16** (¶19 sentences 9 to 9, ¶20 sentences 1 to 5; 79 words)

- Question: Which line shows the narrator suddenly worried that someone next door will notice?
- Key words highlighted: someone next door
- Proof line: "And now a new anxiety seized me — the sound would be heard by a neighbor!"
- Refresher hint: Look for a new anxiety.
- Why: A new anxiety seized him: the sound would be heard by a neighbor.
- Standards: ELA.K12.EE.1.1
- Gist check: As the beating grows louder, the narrator suddenly fears that a neighbor will hear it. ✓ / As the beating fades away, the narrator decides to leave the house quietly. / As the beating grows louder, the narrator wakes the old man to warn him.
- Discovery (figurative): "the dead hour of the night". The deepest, stillest part of the night.

**Chunk 20** (¶26 sentences 1 to 1, ¶27 sentences 1 to 8; 100 words)

- Question: Which line explains what brought the visitors to the door?
- Key words highlighted: brought the visitors
- Proof line: "A shriek had been heard by a neighbor during the night; suspicion of foul play had been aroused; information had been lodged at the police-office, and they (the officers) had been deputed to search the premises."
- Refresher hint: Look for what was heard, and by whom.
- Why: A shriek had been heard by a neighbor during the night, and the officers were sent to search.
- Standards: ELA.K12.EE.1.1
- Gist check: A neighbor reported a shriek, and the narrator calmly claims it was his own nightmare. ✓ / A neighbor reported a fire, and the narrator admits he started it. / A neighbor reported a theft, and the narrator blames the old man.
- Discovery (vocabulary): "secure, undisturbed". Undisturbed: left exactly as it was.

**Chunk 24** (¶33 sentences 3 to 7, ¶34 sentences 1 to 3; 93 words)

- Question: Which line shows the narrator finally confessing?
- Key words highlighted: confessing
- Proof line: "I admit the deed! — tear up the planks! — here, here! — it is the beating of his hideous heart!”"
- Refresher hint: Look for the words he cries out at the end.
- Why: I admit the deed! It is the beating of his hideous heart!
- Standards: ELA.K12.EE.1.1
- Gist check: Convinced the officers are mocking him, the narrator cries out a confession and tells them where to look. ✓ / Convinced the officers believe him, the narrator thanks them and shows them out. / Convinced he has won, the narrator laughs and goes upstairs to sleep.
- Discovery (vocabulary): "hypocritical smiles". Hypocritical: pretending to feel something you don't.

##### Figure It Out

**Chunk 3** (¶2 sentences 8 to 10; 66 words) · shared words reviewed

- Question: Read the words the eye of a vulture. What kind of figurative language is this?
- Key words highlighted: vulture
- Choices: Metaphor: the old man's eye is called a vulture's eye ✓ / Simile: the eye is compared to a bird using like / Onomatopoeia: the words copy a bird's cry
- What does it mean? The eye seems cold, hungry and threatening to him ✓ / The old man can fly like a bird / The old man has very sharp eyesight
- Refresher hint: What does a vulture do, and how might its eye feel to someone it stares at?
- Why: A vulture's eye watches and waits: to the narrator the old man's eye feels cold and threatening.
- Standards: ELA.7.R.3.1
- Gist check: The narrator blames the old man's pale, filmy eye and decides to kill him to be rid of it. ✓ / The narrator praises the old man's bright eyes and decides to protect him. / The narrator blames the old man's loud voice and decides to move away.
- Discovery (figurative): "my blood ran cold". Fear so strong he feels it in his veins.

**Chunk 12** (¶13 sentences 1 to 4, ¶14 sentences 1 to 3; 139 words) · shared words reviewed

- Question: Read the words had stalked with his black shadow before him. What kind of figurative language is this?
- Key words highlighted: stalked
- Choices: Personification: death moves toward the old man like a person ✓ / Simile: death is compared to a shadow using like / Onomatopoeia: the words copy the sound of footsteps
- What does it mean? The old man senses something deadly coming that he cannot see ✓ / A stranger is walking down the hall / The lantern casts a real shadow on the wall
- Refresher hint: Can death really walk? What does the old man feel coming?
- Why: Death stalks like a person casting a shadow: the old man feels danger closing in.
- Standards: ELA.7.R.3.1
- Gist check: The old man tries to explain away the noise as wind or a mouse, but his fear keeps growing. ✓ / The old man decides the noise is a burglar and runs to fetch help. / The old man laughs at the noise and goes back to sleep at once.
- Discovery (vocabulary): "the wind in the chimney". One of the harmless explanations the old man tries to believe.

##### Word Detective

**Chunk 4** (¶3 sentences 1 to 6; 59 words) · shared words reviewed

- Question: In this chunk, what does dissimulation mean?
- Key words highlighted: dissimulation
- Choices: Hiding one's true feelings or plans ✓ / Careful counting and measuring / A sudden loss of all courage
- Proof words (any one): "I was never kinder to the old man"
- Refresher hint: How does he act toward the old man while planning to harm him?
- Why: He was never kinder than the week before: he hid his true intent behind kindness.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: The narrator argues that his careful planning proves he is sane, and he acts extra kind to the old man. ✓ / The narrator admits his plan was sloppy and that he was rude to the old man. / The narrator says he forgot his plan and spent the whole week traveling.
- Discovery (vocabulary): "with what foresight". Foresight: planning ahead.

**Chunk 21** (¶28 sentences 1 to 1, ¶29 sentences 1 to 6; 104 words) · shared words reviewed

- Question: In this chunk, what does audacity mean?
- Key words highlighted: audacity
- Choices: Shocking, reckless boldness ✓ / Deep and quiet sadness / Careful, gentle politeness
- Proof words (any one): "placed my own seat upon the very spot"
- Refresher hint: Where does he choose to sit?
- Why: He placed his own seat upon the very spot: a shockingly bold act.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: The narrator boldly seats the officers in the room, but soon he grows pale and wishes they would leave. ✓ / The narrator rudely sends the officers away, and they leave satisfied. / The narrator invites the officers to stay the night, and they all fall asleep.
- Discovery (vocabulary): "a ringing in my ears". A ringing in the ears: a sound that seems to come from inside your own head.

##### Character Clue

**Chunk 5** (¶4 sentences 1 to 4; 85 words)

- Question: Which trait does the narrator show each midnight?
- Key words highlighted: trait
- Choices: Patient and sneaky, moving with great care ✓ / Careless and loud, rushing straight in / Shy and nervous, turning back at once
- Proof words (any one): "very, very slowly"
- Refresher hint: How fast does he move his head?
- Why: He moved it very, very slowly so he would not disturb the old man.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Each midnight the narrator slowly eases his head and a covered lantern through the old man's door. ✓ / Each morning the narrator bursts into the old man's room with a bright lamp. / Each midnight the narrator locks the old man's door from the outside.
- Discovery (vocabulary): "a dark lantern". Dark lantern: a lantern with a cover that can block its light.

**Chunk 15** (¶18 sentences 3 to 4, ¶19 sentences 1 to 8; 91 words)

- Question: Which trait does the narrator show as the sound grows?
- Key words highlighted: trait
- Choices: Rising fury that he struggles to hold back ✓ / Calm pity for the frightened old man / Boredom with the long, quiet night
- Proof words (any one): "It increased my fury"
- Refresher hint: What does the sound do to him, and does he act at once?
- Why: It increased his fury, yet he refrained and kept still.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: The narrator believes he hears the old man's heart, and its growing beat fills him with fury. ✓ / The narrator hears church bells, and their steady ringing calms his fury. / The narrator hears the old man snoring, and the sound makes him laugh.
- Discovery (vocabulary): "the hellish tattoo of the heart". Tattoo: a steady drumbeat.

##### Read Between the Lines

**Chunk 6** (¶5 sentences 1 to 3; 79 words)

- Question: What can you infer from how slowly he inches into the room?
- Key words highlighted: infer
- Choices: He is obsessed, spending ages on each tiny step ✓ / He is lazy and dozes off in the doorway / He is lost and cannot find the right room
- Proof line: "It took me an hour to place my whole head within the opening so far that I could see the old man as he lay upon his bed."
- Refresher hint: How long does one small step take him?
- Why: It took him an hour just to place his head inside: an obsession with every detail.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Taking an hour to peek in, the narrator shines one thin ray of light onto the vulture eye. ✓ / Taking a minute to peek in, the narrator lights every lamp in the old man's room. / Peering through the window, the narrator sees the old man awake and reading.
- Discovery (vocabulary): "a single thin ray". A ray: a narrow beam of light.

**Chunk 10** (¶9 sentences 2 to 2, ¶10 sentences 1 to 1; 77 words)

- Question: What can you infer from the old man's question in the blackness?
- Key words highlighted: infer
- Choices: He senses someone is there and is frightened ✓ / He is expecting a visitor and is pleased / He is talking in his sleep about a dream
- Proof line: "I had got my head in, and was about to open the lantern, when my thumb slipped upon the tin fastening, and the old man sprang up in bed, crying out — “Who's there?”"
- Refresher hint: What does he do, and what does he call out?
- Why: He sprang up in bed crying out, Who's there? He senses someone in the room.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: In the pitch-dark room the narrator's thumb slips, and the old man sits up crying out. ✓ / In the bright room the narrator's lantern falls, and the old man sleeps through it. / In the pitch-dark room the narrator trips, and the old man calls for the police.
- Discovery (figurative): "as black as pitch". A simile: the room is as dark as tar.

**Chunk 11** (¶11 sentences 1 to 3, ¶12 sentences 1 to 5; 143 words)

- Question: What can you infer about the narrator from his familiarity with that sound?
- Key words highlighted: infer
- Choices: He has felt the same terror himself on many nights ✓ / He once worked as a doctor who treated patients / He has never been afraid of anything at all
- Proof line: "Many a night, just at midnight, when all the world slept, it has welled up from my own bosom, deepening, with its dreadful echo, the terrors that distracted me."
- Refresher hint: Where has he heard it before?
- Why: Many a night it has welled up from his own bosom: he knows that terror himself.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The old man sits awake listening, and the narrator recognizes his groan of terror from his own nights. ✓ / The old man falls back asleep, and the narrator quietly leaves the room. / The old man calls for help, and the narrator hides under the bed.
- Discovery (vocabulary): "the death-watches in the wall". Death-watches: beetles that tick in walls; an old superstition said they warned of a death.

**Chunk 17** (¶20 sentences 6 to 8, ¶21 sentences 1 to 7; 101 words)

- Question: What can you infer worries the narrator most in this chunk?
- Key words highlighted: infer
- Choices: That a sound might give him away ✓ / That the old man's gold is missing / That the sun will rise too soon
- Proof line: "This, however, did not vex me; it would not be heard through the walls."
- Refresher hint: Why does the muffled sound not vex him?
- Why: It did not vex him because it would not be heard through the walls: being heard is his worry.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The narrator rushes into the room, and soon the old man's heartbeat stops. ✓ / The narrator runs out of the house, and the old man locks the door behind him. / The narrator lights every lamp, and the old man wakes up laughing.
- Discovery (vocabulary): "a muffled sound". Muffled: quiet and dull, as if wrapped up.

**Chunk 22** (¶30 sentences 1 to 1, ¶31 sentences 1 to 6; 128 words)

- Question: What can you infer from the fact that the visitors never react to the sound?
- Key words highlighted: infer
- Choices: The sound may exist only in the narrator's mind ✓ / The visitors are deaf and cannot hear anything / The visitors are too polite to mention it
- Proof line: "I gasped for breath — and yet the officers heard it not."
- Refresher hint: He gasps for breath. Who hears it?
- Why: He gasped for breath, and yet the officers heard it not.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The ringing becomes a beating sound that grows louder, though the officers seem not to hear it. ✓ / The ringing stops, and the narrator relaxes and laughs with the officers. / The ringing turns out to be church bells, and everyone leaves for church.
- Discovery (vocabulary): "violent gesticulations". Gesticulations: wild arm movements while talking.

##### Catch the Lie

**Chunk 7** (¶6 sentences 1 to 2; 79 words)

- Question: The officer describes how the two got along. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Officer): "From what we gathered, the two hardly spoke. He kept out of the old man's way every day."
- Proof line: "And every morning, when the day broke, I went boldly into his chamber, and spoke courageously to him, calling him by name in a hearty tone, and inquiring how he has passed the night."
- Refresher hint: What did the narrator do each day at dawn?
- Why: Every morning he went boldly into the chamber and spoke to the old man in a hearty tone.
- Standards: ELA.K12.EE.1.1
- Gist check: For seven nights the eye stays shut, and each morning the narrator greets the old man warmly. ✓ / For seven nights the eye stays open, and each morning the narrator avoids the old man. / For seven nights the narrator sleeps soundly and never visits the old man.
- Discovery (figurative): "his Evil Eye". Capitalized like a name, the eye becomes a villain in his mind.

**Chunk 19** (¶24 sentences 1 to 4, ¶25 sentences 1 to 4; 119 words)

- Question: The officer remembers arriving. One thing he says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Officer): "We came by in broad daylight, around noon, and the fellow was slow to open the door for us."
- Proof line: "When I had made an end of these labors, it was four o'clock — still dark as midnight."
- Proof line: "I went down to open it with a light heart, — for what had I now to fear?"
- Refresher hint: What time was it, and how did he come to the door?
- Why: It was four o'clock, still dark as midnight, and he went down to open it with a light heart.
- Standards: ELA.K12.EE.1.1
- Gist check: Before dawn the narrator finishes hiding his crime, and three police officers knock at the door. ✓ / At noon the narrator finishes breakfast, and three neighbors bring him a cake. / Before dawn the narrator packs his bags and slips out the back door.
- Discovery (vocabulary): "with perfect suavity". Suavity: smooth, polite manners.

##### Shades of Meaning

**Chunk 8** (¶7 sentences 1 to 1, ¶8 sentences 1 to 4; 77 words) · shared words reviewed

- Question: Why does the narrator call it sagacity instead of just cleverness?
- Key words highlighted: sagacity
- Choices: It makes his plotting sound wise and grand to himself ✓ / It makes him sound humble and unsure / It makes him sound sleepy and slow
- Proof words (any one): "feelings of triumph"
- Refresher hint: How does he feel about his own skill?
- Why: Sagacity means deep wisdom: he can scarcely contain his feelings of triumph.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: On the eighth night the narrator moves slower than a clock hand and feels proud of his own cleverness. ✓ / On the eighth night the narrator rushes in and feels ashamed of his plan. / On the eighth night the narrator stays in bed and gives up his plan.
- Discovery (figurative): "the extent of my own powers". He feels almost superhuman in his cleverness.

**Chunk 13** (¶15 sentences 1 to 1, ¶16 sentences 1 to 2; 102 words) · shared words reviewed

- Question: Why does the narrator repeat stealthily instead of just saying quietly?
- Key words highlighted: stealthily
- Choices: It stresses how secret and sly every movement is ✓ / It shows he is tired and moving clumsily / It shows he wants the old man to hear him
- Proof words (any one): "you cannot imagine how"
- Refresher hint: What does he say you cannot imagine?
- Why: Stealthily means slyly and secretly, and he insists you cannot imagine how much so.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: After waiting a long time, the narrator opens the lantern a crack and a thin ray falls on the eye. ✓ / After waiting a moment, the narrator throws open the lantern and fills the room with light. / After waiting a long time, the narrator shuts the door and goes back to bed.
- Discovery (figurative): "like the thread of the spider". A simile: the ray of light is as thin as a spider's thread.

**Chunk 23** (¶32 sentences 1 to 7, ¶33 sentences 1 to 2; 98 words) · shared words reviewed

- Question: Why does the narrator stress that the men chatted pleasantly instead of just talked?
- Key words highlighted: pleasantly
- Choices: It shows how calm they stay while he falls apart ✓ / It shows they are angry with him / It shows they are about to leave
- Proof words (any one): "I paced the floor to and fro"
- Refresher hint: Compare what he is doing with what they are doing.
- Why: He paces the floor to and fro while they chat pleasantly: their calm makes his panic worse.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: The narrator paces and shouts as the sound grows, while the officers keep chatting and smiling. ✓ / The narrator sits quietly as the sound fades, while the officers search the cellar. / The narrator falls asleep as the sound stops, while the officers leave.
- Discovery (vocabulary): "with heavy strides". Strides: long steps.

##### Theme Thread

**Chunk 9** (¶8 sentences 5 to 7, ¶9 sentences 1 to 1; 60 words)

- Question: Which pattern keeps coming back in the narrator's telling?
- Key words highlighted: keeps coming back
- Choices: He keeps insisting on his own cleverness and calm ✓ / He keeps apologizing for what he planned / He keeps praising the old man's kindness
- Proof line: "To think that there I was, opening the door, little by little, and the old man not even to dream of my secret deeds or thoughts."
- Proof line: "I fairly chuckled at the idea."
- Refresher hint: What does he find funny?
- Why: He gloats that the old man cannot dream of his secret, and chuckles at the idea.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: The narrator chuckles at his secret, the old man stirs as if startled, but the narrator does not retreat. ✓ / The narrator weeps at his secret, the old man sleeps soundly, and the narrator goes home. / The narrator shouts his secret, the old man laughs, and they talk until dawn.
- Discovery (vocabulary): "I fairly chuckled at the idea". Chuckled: laughed quietly.

### Trifles

#### DRAFT for review, not live: Expedition: The Wright Kitchen (10 chunks)

##### The Interview and Name the Liar

Each student picks one card per witness; one witness, picked at random per student, gives the lie and the other two the truth. Name the Liar needs the liar and a proof line. Audio is pre-recorded in each witness's voice.

**Mr. Hale**

- Question cards: "Why were you on the road that morning?" / "What time did you reach the house?"
- True: "My boy and I were hauling spuds to market that morning."
  - Confirmed by: "Harry and I had started to town with a load of potatoes."
- False (head shake): "It was barely dawn when I got there, so early I figured they'd still be asleep."
  - Disproved by: "I knew they must be up, it was past eight o’clock."
- When caught: "You're right. It was well past breakfast time. I misremembered."

**Mrs. Peters**

- Question cards: "How did you feel coming into the kitchen?" / "Was anything moved before you arrived?"
- True: "I told the attorney I wasn't chilly, even standing back there away from the fire."
  - Confirmed by: "I’m not--cold."
- False: "My husband had the whole place tidied up before anyone arrived."
  - Disproved by: "It’s just the same."
- When caught: "No, he left it all as it was. He's careful about that. I spoke too quickly."

**Mrs. Hale**

- Question cards: "What did you notice when you walked in?" / "What did your husband say Mrs. Wright was doing?"
- True: "I came in uneasy, I'll admit, glancing all around that sad room."
  - Confirmed by: "MRS. HALE is larger and would ordinarily be called more comfortable looking, but she is disturbed now and looks fearfully about as she enters."
- False: "He says she sat there with empty, idle fingers the whole time."
  - Disproved by: "She had her apron in her hand and was kind of--pleating it."
- When caught: "No. She was working at her apron the whole time. I know that."

Screen text: "One witness will lie to you. Listen closely: after the race you'll name the liar and prove it with a line from the story." · "Which witness lied?" · "Tap the line anywhere in the expedition that shows this is false, then lock in." · "Case solved" · "Not this time." · "It's in your Refresher." · Live: "What should we ask [witness]?" · "Locked in" · "Nothing is revealed until everyone has locked in. Watch the board."

##### Read Between the Lines

**Chunk 1** (¶1 sentences 1 to 3; 89 words)

- Question: What can you infer about this home from the opening stage directions?
- Key words highlighted: infer
- Choices: Someone left suddenly, in the middle of chores ✓ / A family is preparing for a big party / The rooms were scrubbed clean for visitors
- Proof line: "SCENE: _The kitchen in the now abandoned farmhouse of JOHN WRIGHT, a gloomy kitchen, and left without having been put in order--unwashed pans under the sink, a loaf of bread outside the bread-box, a dish-towel on the table--other signs of incompleted work."
- Refresher hint: Look at the pans, the bread and the towel.
- Why: The kitchen was left without being put in order: unwashed pans, bread out, signs of incompleted work.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Three men enter the cold, messy kitchen of an abandoned farmhouse and go straight to the stove. ✓ / Three women enter the warm, tidy kitchen of a busy farmhouse and start baking. / Two children play in the sunny kitchen of a brand new farmhouse.
- Discovery (vocabulary): "signs of incompleted work". Incompleted work: chores someone started and never finished.

**Chunk 8** (¶37 sentences 1 to 1, ¶38 sentences 1 to 1, ¶39 sentences 1 to 1, ¶40 sentences 1 to 5; 84 words)

- Question: What can you infer about Mrs. Wright from her reply about the weather?
- Key words highlighted: infer
- Choices: Her mind is far away from ordinary things ✓ / She is eager to chat with a neighbor / She is angry that Hale came so early
- Proof line: "And she said, “Is it?”--and went on kind of pleating at her apron."
- Refresher hint: How does she answer a simple remark, and what do her hands keep doing?
- Why: She answers Is it? and goes on pleating at her apron, as if her mind is elsewhere.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Mrs. Wright barely notices Hale, answers him oddly, and never invites him to the stove. ✓ / Mrs. Wright greets Hale warmly and pours him a hot cup of coffee. / Mrs. Wright orders Hale to leave and slams the door in his face.
- Discovery (vocabulary): "pay much attention". She barely notices that Hale is there.

##### Character Clue

**Chunk 2** (¶1 sentences 4 to 6, ¶2 sentences 1 to 1, ¶3 sentences 1 to 3, ¶4 sentences 1 to 1, ¶5 sentences 1 to 2; 80 words)

- Question: Which trait do the stage directions give Mrs. Peters?
- Key words highlighted: trait
- Choices: Thin and nervous-looking ✓ / Loud and cheerful / Tall and commanding
- Proof words (any one): "a thin nervous face"
- Refresher hint: Read how she is described as she comes in.
- Why: The sheriff's wife is a slight wiry woman with a thin nervous face.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: The two women enter slowly and stay together by the door, and Mrs. Peters says she isn't cold. ✓ / The two women rush to the stove, and Mrs. Peters says she is freezing. / The two women stay outside in the wagon, refusing to enter the house.
- Discovery (vocabulary): "slight wiry woman". Wiry: thin but tough.

##### Find It

**Chunk 3** (¶6 sentences 1 to 1, ¶7 sentences 1 to 2, ¶8 sentences 1 to 1, ¶9 sentences 1 to 2, ¶10 sentences 1 to 1, ¶11 sentences 1 to 3; 110 words)

- Question: Which line says whether anything in the room was disturbed?
- Key words highlighted: disturbed
- Proof line: "It’s just the same."
- Refresher hint: Listen for the sheriff's short answer.
- Why: It's just the same.
- Standards: ELA.K12.EE.1.1
- Gist check: The sheriff asks Hale to tell what he saw and says nothing has been moved except the stove fire. ✓ / The sheriff admits everything has been moved and cleaned since yesterday. / The sheriff refuses to let Hale speak and sends everyone home.
- Discovery (vocabulary): "a big case on". A big case: an important crime to solve.

**Chunk 6** (¶20 sentences 1 to 1, ¶21 sentences 1 to 2, ¶22 sentences 1 to 1, ¶23 sentences 1 to 4; 105 words)

- Question: Which line tells where Hale first found the farmer's wife?
- Key words highlighted: first found
- Proof line: "I wasn’t sure, I’m not sure yet, but I opened the door--this door [_indicating the door by which the two women are still standing_] and there in that rocker--[_pointing to it_] sat Mrs. Wright."
- Refresher hint: Look for a piece of furniture he points to.
- Why: There in that rocker sat Mrs. Wright.
- Standards: ELA.K12.EE.1.1
- Gist check: Hale knocked twice, thought he heard someone answer, and found Mrs. Wright sitting in her rocker. ✓ / Hale knocked once, heard shouting, and found the whole house empty. / Hale walked in without knocking and found Mrs. Wright cooking breakfast.
- Discovery (figurative): "all quiet inside". An eerie silence for a farm morning.

##### Shades of Meaning

**Chunk 4** (¶12 sentences 1 to 1, ¶13 sentences 1 to 1, ¶14 sentences 1 to 1, ¶15 sentences 1 to 3, ¶16 sentences 1 to 1, ¶17 sentences 1 to 1; 71 words) · shared words reviewed

- Question: Why does the sheriff say he had his hands full instead of just busy?
- Key words highlighted: hands full
- Choices: It stresses how overloaded and stretched thin he was ✓ / It means he was carrying heavy boxes / It means he hurt both of his hands
- Proof words (any one): "When I had to send Frank to Morris Center"
- Refresher hint: What else did he have to handle that day?
- Why: He had to send Frank to Morris Center for another case: hands full means too much to do at once.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: The attorney says someone should have guarded the house, and the sheriff explains he was too busy. ✓ / The attorney praises the sheriff for guarding the house all night long. / The attorney says the house should be sold, and the sheriff agrees.
- Discovery (vocabulary): "from Omaha". Omaha: a city in Nebraska, where the attorney had been.

##### Catch the Lie

**Chunk 5** (¶18 sentences 1 to 1, ¶19 sentences 1 to 3; 119 words)

- Question: Mrs. Hale describes the man of the farmhouse. One thing she says is false. Tap the line that proves it.
- Key words highlighted: false
- Testimony (Mrs. Hale): "My husband says that man was a great talker and loved having folks drop by."
- Proof line: "I spoke to Wright about it once before and he put me off, saying folks talked too much anyway, and all he asked was peace and quiet--I guess you know about how much he talked himself; but I thought maybe if I went to the house and talked about it before his wife, though I said to Harry that I didn’t know as what his wife wanted made much difference to John--"
- Refresher hint: What did he say when Hale brought up the telephone?
- Why: He put Hale off, saying folks talked too much anyway, and all he asked was peace and quiet.
- Standards: ELA.K12.EE.1.1
- Gist check: Hale stopped to ask John Wright about a shared telephone line, though Wright wanted only peace and quiet. ✓ / Hale stopped to buy potatoes from John Wright, who loved company and chatter. / Hale stopped to warn John Wright about a storm, but Wright was away in town.
- Discovery (vocabulary): "a party telephone". Party telephone: one line shared by several homes.

##### Word Detective

**Chunk 7** (¶24 sentences 1 to 1, ¶25 sentences 1 to 1, ¶26 sentences 1 to 1, ¶27 sentences 1 to 1, ¶28 sentences 1 to 2, ¶29 sentences 1 to 1, ¶30 sentences 1 to 1, ¶31 sentences 1 to 1, ¶32 sentences 1 to 1, ¶33 sentences 1 to 1, ¶34 sentences 1 to 1, ¶35 sentences 1 to 1, ¶36 sentences 1 to 2; 66 words) · shared words reviewed

- Question: In this chunk, what does queer mean?
- Key words highlighted: queer
- Choices: Strange or odd ✓ / Happy and relaxed / Angry and loud
- Proof words (any one): "what she was going to do next"
- Refresher hint: How does Hale explain it when he's asked?
- Why: She looked as if she didn't know what she was going to do next: strange, not like herself.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: Hale says Mrs. Wright was rocking and pleating her apron and looked strange and worn out. ✓ / Hale says Mrs. Wright was dancing and singing and looked happy and rested. / Hale says Mrs. Wright was asleep and he could not see her face.
- Discovery (vocabulary): "her apron in her hand". She keeps folding her apron into pleats, over and over.

##### Theme Thread

**Chunk 9** (¶40 sentences 6 to 15; 66 words)

- Question: Which idea about Mrs. Wright keeps coming back in Hale's story?
- Key words highlighted: keeps coming back
- Choices: Her strange calm makes her hard to read ✓ / Her loud anger frightens everyone / Her cheerful chatter fills the room
- Proof line: "“No,” she says, kind o’ dull like."
- Refresher hint: How does she say even the most shocking things?
- Why: She answers kind of dull like: the same strange calm Hale noticed from the start.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: Mrs. Wright laughs oddly and then flatly tells Hale that John is home but dead. ✓ / Mrs. Wright cries loudly and tells Hale that John ran away to town. / Mrs. Wright smiles and tells Hale that John is out working in the barn.
- Discovery (vocabulary): "out of patience". Out of patience: tired of waiting.

##### Whose Eyes?

**Chunk 10** (¶40 sentences 16 to 24; 98 words)

- Question: Whose account of that morning are we hearing?
- Key words highlighted: account
- Choices: Hale's, as he remembers it for the lawmen ✓ / Mrs. Wright's, written in a letter / The sheriff's, read from his notebook
- Proof line: "“Why--where is he?” says I, not knowing what to say."
- Refresher hint: Who is the I in these lines?
- Why: Says I, not knowing what to say: Hale is telling the lawmen what he saw.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: Calmly rocking, Mrs. Wright points upstairs and says John died of a rope around his neck. ✓ / Crying, Mrs. Wright runs upstairs and says John fell from a ladder. / Laughing, Mrs. Wright says John is only sleeping and points to the barn.
- Discovery (figurative): "not getting a bit excited". She stays strangely calm.

<!-- expeditions:end -->
