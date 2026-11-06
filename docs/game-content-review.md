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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 5; level 2: chunks 6 to 10. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 4 (10 seconds, recalls chunk 2): About how long a walk is it from the river port to the hollow? Answer: "Not far from this village, perhaps about two miles, there is a little valley or rather lap of land among high hills, which is one of the quietest places in the whole world."
- Lightning beat after chunk 8 (10 seconds, recalls chunk 3): What startled the young hunter in the quiet grove? Answer: "I had wandered into it at noontime, when all nature is peculiarly quiet, and was startled by the roar of my own gun, as it broke the Sabbath stillness around and was prolonged and reverberated by the angry echoes."

**Chunk 1** (¶3 sentences 1 to 3; 138 words) · warm-up

- Question (Whose Eyes?, two-part evidence): How sure is the storyteller about where the town's name came from?
  - Key words highlighted: How sure, storyteller
  - Choices: Very sure: he checked the old town records himself and found proof / Not sure: he passes on a story he heard without promising it's true ✓ / Completely sure, because he was there when it was named
  - Proof sentence: "Be that as it may, I do not vouch for the fact, but merely advert to it, for the sake of being precise and authentic."
  - Hint: Read his own words closely. Does he ever promise the story is true?
  - Why: He says he does not vouch for the fact, so he is repeating a story, not swearing to it.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Bank question (Whose Eyes?, two-part evidence): Who first came up with the explanation the narrator passes along?
  - Key words highlighted: passes along
  - Choices: The Dutch sailors who crossed the Tappan Zee / The farm wives nearby, or so the story goes ✓ / The narrator himself, on his very first visit
  - Proof sentence: "This name was given, we are told, in former days, by the good housewives of the adjacent country, from the inveterate propensity of their husbands to linger about the village tavern on market days."
  - Hint: Look for the words that show he heard this from other people.
  - Why: "We are told" shows the explanation came from the local housewives, passed along by others.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: The narrator proves the town was named by Dutch sailors who stopped there to trade. / A river town got its name, the narrator says, from husbands who lingered at the tavern. ✓ / A river town is famous for sailors who pray to St. Nicholas.
- Discovery (vocabulary): "inveterate propensity". Inveterate propensity: a habit so old and strong it can't be broken.

**Chunk 2** (¶3 sentences 4 to 5; 73 words) · warm-up

- Question (Find It, tap the sentence): About how long a walk is it from the river port to the hollow?
  - Key words highlighted: how long a walk
  - Proof sentence: "Not far from this village, perhaps about two miles, there is a little valley or rather lap of land among high hills, which is one of the quietest places in the whole world."
  - Hint: Look for a distance, counted in miles.
  - Why: The valley is perhaps about two miles from the village.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which sentence tells you what noises a visitor might hear there?
  - Key words highlighted: noises
  - Proof sentence: "A small brook glides through it, with just murmur enough to lull one to repose; and the occasional whistle of a quail or tapping of a woodpecker is almost the only sound that ever breaks in upon the uniform tranquillity."
  - Hint: Listen for birds.
  - Why: Only a quail's whistle or a woodpecker's tapping breaks the quiet.
  - Standards: ELA.K12.EE.1.1
- Discovery (figurative): "lull one to repose". Lull one to repose: the brook is so soft it could rock you to sleep.

**Chunk 3** (¶4 sentences 1 to 3; 102 words) · surprise double points

- Question (Shades of Meaning, two-part evidence): The narrator calls his younger self a stripling. Why that word instead of plain boy?
  - Key words highlighted: stripling
  - Choices: It makes him sound young and new at hunting ✓ / It shows he was already the most skilled hunter around / It suggests he was frail and often sick as a boy
  - Proof sentence: "I had wandered into it at noontime, when all nature is peculiarly quiet, and was startled by the roar of my own gun, as it broke the Sabbath stillness around and was prolonged and reverberated by the angry echoes."
  - Hint: How does the boy react to the sound of his own gun?
  - Why: He was startled by the roar of his own gun: a stripling is young and untested.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Bank question (Shades of Meaning, two-part evidence): Why might he call the valley a retreat rather than just a spot?
  - Key words highlighted: retreat
  - Choices: It suggests the narrator once lost a fight in the valley / It suggests a quiet hiding place to rest from the world ✓ / It suggests a place where soldiers fall back in battle
  - Part B: tap the clue words that show the meaning (any one): "steal from the world and its distractions"
  - Proof sentence: "If ever I should wish for a retreat whither I might steal from the world and its distractions, and dream quietly away the remnant of a troubled life, I know of none more promising than this little valley."
  - Hint: Read the sentence where he imagines escaping from the world.
  - Why: He would steal away from the world and its distractions to dream quietly there: a retreat is a peaceful place to get away.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Discovery (figurative): "angry echoes". Angry echoes: the echoes get a human feeling, as if the quiet woods were annoyed by the noise.

**Chunk 4** (¶5 sentences 1 to 2; 66 words)

- Question (Word Detective, two-part evidence): In this chunk, what does listless mean?
  - Key words highlighted: listless
  - Choices: Lacking energy; slow and sleepy ✓ / Without a list or any plan / Full of nervous, jumpy worry
  - Proof sentence: "A drowsy, dreamy influence seems to hang over the land, and to pervade the very atmosphere."
  - Hint: Find the sentence that feels sleepy.
  - Why: A drowsy, dreamy influence hangs over the land: listless means low on energy.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Bank question (Word Detective, two-part evidence): Which meaning of drowsy fits this land?
  - Key words highlighted: drowsy
  - Choices: Sleepy and slow, as if ready to doze off ✓ / Wet and gloomy, as if always under rain / Loud and lively, as if never at rest
  - Part B: tap the clue words that show the meaning (any one): "dreamy", "listless repose"
  - Proof sentence: "A drowsy, dreamy influence seems to hang over the land, and to pervade the very atmosphere."
  - Hint: Find the words nearby that feel sleepy.
  - Why: A drowsy, dreamy influence hangs over the land and fills the air: drowsy means sleepy.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: The Dutch settlers left the Hollow because it was too quiet. / Boys from the Hollow are known for their hard work. / The valley's sleepy mood gave Sleepy Hollow its name. ✓
- Discovery (vocabulary): "sequestered glen". Sequestered glen: a hidden, out-of-the-way valley.

**Chunk 5** (¶5 sentences 3 to 4; 78 words) · checkpoint after this chunk, then the burst

- Question (Weigh the Evidence, drag and drop: Fact or witness claim): Sort what the narrator states as certain from what only some people claim.
  - Slots: The text says it is so / Only some people claim it
  - Piece: A High German doctor put a spell on the place → Only some people claim it (backed by "Some say that the place was bewitched by a High German doctor, during the early days of th…")
  - Piece: An old chief held his powwows there long ago → Only some people claim it (backed by "Some say that the place was bewitched by a High German doctor, during the early days of th…")
  - Piece: A witching power still rules the place → The text says it is so (backed by "Certain it is, the place still continues under the sway of some witching power, that holds…")
  - Piece: The people walk about in a constant daydream → The text says it is so (backed by "Certain it is, the place still continues under the sway of some witching power, that holds…")
  - Discussion note (shown with the question): Teacher note: Irving, writing in 1820, describes Native people through the stereotypes of his time ("powwows," "the prophet or wizard of his tribe"). Consider pausing here: Whose voice tells this story? How might a Native person describe this land and its history?
  - Hint: Watch for the words "some say" and "certain it is."
  - Why: "Some say" and "others" mark rumors; "certain it is" marks what the narrator states as fact.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Bank question (Weigh the Evidence, two-part evidence): Which detail does the narrator present as sure, not just gossip?
  - Choices: An old chief held his meetings in the glen / Some witching power still holds the place ✓ / A German doctor once cast a spell on it
  - Discussion note (shown with the question): Teacher note: Irving, writing in 1820, describes Native people through the stereotypes of his time ("powwows," "the prophet or wizard of his tribe"). Consider pausing here: Whose voice tells this story? How might a Native person describe this land and its history?
  - Proof sentence: "Certain it is, the place still continues under the sway of some witching power, that holds a spell over the minds of the good people, causing them to walk in a continual reverie."
  - Hint: One sentence begins by saying it is certain.
  - Why: "Certain it is": the witching power is stated as fact, while the doctor and the chief are only what some say.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Discovery (vocabulary): "continual reverie". Reverie: a daydream. A continual reverie means drifting through life half-dreaming.

**Chunk 6** (¶5 sentences 5 to 6; 74 words)

- Question (Read Between the Lines, choose two): Which habits show the people here are ready to believe in marvels?
  - Key words highlighted: believe in marvels
  - Choices (choose 2): They laugh at every ghost story they hear / They move away whenever meteors appear / They often see strange sights and hear voices ✓ / They tell many tales of haunted spots ✓
  - Hint: Find two things they do or say, not things they avoid.
  - Why: They see strange sights, hear voices in the air, and fill the valley with tales of haunted spots.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): What does the restless sky suggest about this region?
  - Choices: The weather here is the finest in the whole country / Sailors use these stars to find their way home / Even nature seems stranger here than anywhere else ✓
  - Proof sentence: "The whole neighborhood abounds with local tales, haunted spots, and twilight superstitions; stars shoot and meteors glare oftener across the valley than in any other part of the country, and the nightmare, with her whole ninefold, seems to make it the favorite scene of her gambols."
  - Hint: Compare this valley's sky with the rest of the country.
  - Why: Stars shoot and meteors glare more often here than anywhere: even nature seems haunted.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Discovery (figurative): "with her whole ninefold". The nightmare is pictured as a creature with her nine children, playing over the valley at night.

**Chunk 7** (¶6 sentences 1 to 2; 88 words) · the twist

- Question (Catch the Lie, tap the sentence): Brom Bones tells the tale. One thing he says is false. Tap the line that proves it.
  - Key words highlighted: false
  - Testimony (Brom Bones): "Every child in the Hollow knows this one. The Headless Horseman was a Hessian trooper who lost his head to a sword in some battle, and folks see him tearing through the dark at night."
  - Proof sentence: "It is said by some to be the ghost of a Hessian trooper, whose head had been carried away by a cannon-ball, in some nameless battle during the Revolutionary War, and who is ever and anon seen by the country folk hurrying along in the gloom of night, as if on the wings of the wind."
  - Hint: Brom tells it with flair. Check exactly what took the trooper's head.
  - Why: The story says a cannon-ball carried his head away, not a sword.
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Hans Van Ripper tells it differently. Part of what he says is false. Tap the sentence that shows it.
  - Testimony (Hans Van Ripper): "The ghost that rules this valley is a lady in white who drifts along without a sound."
  - Proof sentence: "The dominant spirit, however, that haunts this enchanted region, and seems to be commander-in-chief of all the powers of the air, is the apparition of a figure on horseback, without a head."
  - Hint: What does the ruling spirit look like?
  - Why: The ruling spirit is a figure on horseback without a head, not a lady in white.
  - Standards: ELA.K12.EE.1.1
- Gist check: The valley's main ghost is a headless horseman, said to be a soldier killed in battle. ✓ / A general of the Revolutionary War still rides through the Hollow. / The valley's main ghost is a farmer who lost his horse in a storm long ago.
- Discovery (figurative): "on the wings of the wind". As if on the wings of the wind: the rider moves so fast he seems to fly.

**Chunk 8** (¶6 sentences 3 to 4; 115 words)

- Question (Story Order, drag and drop: Cause and effect): Match each cause to what it leads the rider to do.
  - Slots: His body lies buried in the churchyard / He is searching for his lost head / He is running late
  - Piece: He hurries back before daybreak → His body lies buried in the churchyard (backed by "Indeed, certain of the most authentic historians of those parts, who have been careful in …")
  - Piece: He rides out to the old battlefield each night → He is searching for his lost head (backed by "Indeed, certain of the most authentic historians of those parts, who have been careful in …")
  - Piece: He rushes through the Hollow like a midnight blast → He is running late (backed by "Indeed, certain of the most authentic historians of those parts, who have been careful in …")
  - Hint: Read the long sentence slowly: each reason comes with what it makes him do.
  - Why: Buried in the churchyard, he must be back by dawn; seeking his head, he rides out each night; running late, he speeds like a blast.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Bank question (Story Order, two-part evidence): What makes the phantom race the way he does?
  - Choices: He is late getting back to his grave by dawn ✓ / He is chasing travelers out of the valley / He is racing another rider to the church
  - Proof sentence: "Indeed, certain of the most authentic historians of those parts, who have been careful in collecting and collating the floating facts concerning this spectre, allege that the body of the trooper having been buried in the churchyard, the ghost rides forth to the scene of battle in nightly quest of his head, and that the rushing speed with which he sometimes passes along the Hollow, like a midnight blast, is owing to his being belated, and in a hurry to get back to the churchyard before daybreak."
  - Hint: Look at the end of the long sentence.
  - Why: He is belated and must get back to the churchyard before daybreak.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Discovery (figurative): "like a midnight blast". Like a midnight blast: a simile. The rider rushes past like a sudden gust of night wind.

**Chunk 9** (¶7 sentences 1 to 1, ¶8 sentences 1 to 2; 115 words) · the boss (double points)

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what the Hollow does to anyone who settles there.
  - A strong answer: Anyone who stays in the Hollow for a while starts to dream and see ghosts, because the valley's sleepy, witching air gets into them.
  - Key ideas (one from each group): dream, imagin, vision, ghost, apparition, see things, fanc, superstit, strange, spell, witch, haunt | every, anyone, newcomer, people, those who, outsider, visitor, settle, come, move, live, stay
  - Proof sentence: "It is remarkable that the visionary propensity I have mentioned is not confined to the native inhabitants of the valley, but is unconsciously imbibed by every one who resides there for a time."
  - Proof sentence: "However wide awake they may have been before they entered that sleepy region, they are sure, in a little time, to inhale the witching influence of the air, and begin to grow imaginative, to dream dreams, and see apparitions."
  - Hint: Think about newcomers, not just the people born there.
  - Why: Even newcomers soon breathe in the valley's witching air and start to dream and see apparitions.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using your own words, tell in one sentence what happens to newcomers who settle in the Hollow.
  - A strong answer: Newcomers who settle in the Hollow soon begin to imagine things and see ghosts, because its dreamy air takes hold of them.
  - Key ideas (one from each group): dream, imagin, vision, ghost, apparition, see things, fanc, superstit, strange, spell, witch, haunt | newcomer, anyone, every, people, those who, outsider, visitor, settle, come, move, live, stay, arriv
  - Proof sentence: "However wide awake they may have been before they entered that sleepy region, they are sure, in a little time, to inhale the witching influence of the air, and begin to grow imaginative, to dream dreams, and see apparitions."
  - Proof sentence: "It is remarkable that the visionary propensity I have mentioned is not confined to the native inhabitants of the valley, but is unconsciously imbibed by every one who resides there for a time."
  - Hint: Even people who arrive wide awake don't stay that way.
  - Why: However wide awake they were before, newcomers soon inhale the witching influence and begin to dream dreams and see apparitions.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Discovery (figurative): "region of shadows". Region of shadows: a dark, mysterious place where wild stories grow.

**Chunk 10** (¶9 sentences 1 to 3; 138 words)

- Question (Read Between the Lines, two-part evidence): What can you infer about how the narrator feels about the busy world beyond the Hollow?
  - Key words highlighted: infer, busy world
  - Choices: He treasures quiet places that stay the same while the rest of the country hurries on ✓ / He is excited by every new improvement and wishes the valley would hurry to catch up / He pities the Hollow for being left behind and forgotten
  - Proof sentence: "I mention this peaceful spot with all possible laud, for it is in such little retired Dutch valleys, found here and there embosomed in the great State of New York, that population, manners, and customs remain fixed, while the great torrent of migration and improvement, which is making such incessant changes in other parts of this restless country, sweeps by them unobserved."
  - Proof sentence: "They are like those little nooks of still water, which border a rapid stream, where we may see the straw and bubble riding quietly at anchor, or slowly revolving in their mimic harbor, undisturbed by the rush of the passing current."
  - Hint: Look at the words he picks for change and for the valley. Which does he praise?
  - Why: He praises the valley with all possible laud because its customs remain fixed while a restless country sweeps by.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): How does the narrator hope the valley will be if he ever returns?
  - Choices: Grown into a busy, modern market town / Empty, since everyone moved away long ago / Unchanged, as if no time had passed at all ✓
  - Proof sentence: "Though many years have elapsed since I trod the drowsy shades of Sleepy Hollow, yet I question whether I should not still find the same trees and the same families vegetating in its sheltered bosom."
  - Hint: Read his last sentence about coming back.
  - Why: He expects to find the same trees and the same families, as if nothing had changed.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The narrator says he never wants to see the Hollow again. / The narrator praises the Hollow as a quiet place that never seems to change. ✓ / The narrator warns that the Hollow is changing too fast and losing its old ways.
- Discovery (figurative): "nooks of still water". Nooks of still water: the valley is a calm pool beside a rushing river of change.

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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 5; level 2: chunks 6 to 10. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 3 (10 seconds, recalls chunk 1): Where was Ichabod born? Answer: "He was a native of Connecticut, a State which supplies the Union with pioneers for the mind as well as for the forest, and sends forth yearly its legions of frontier woodmen and country schoolmasters."
- Lightning beat after chunk 8 (10 seconds, recalls chunk 5): What did Ichabod tell a boy after punishing him? Answer: "All this he called “doing his duty by their parents;” and he never inflicted a chastisement without following it by the assurance, so consolatory to the smarting urchin, that “he would remember it and thank him for it the longest day he had to live.”"

**Chunk 1** (¶10 sentences 1 to 3; 97 words) · warm-up

- Question (Find It, tap the sentence): Where was the new teacher born?
  - Key words highlighted: born
  - Proof sentence: "He was a native of Connecticut, a State which supplies the Union with pioneers for the mind as well as for the forest, and sends forth yearly its legions of frontier woodmen and country schoolmasters."
  - Hint: Look for the place he comes from.
  - Why: He was a native of Connecticut.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Tap the sentence that explains why his last name suits him.
  - Key words highlighted: last name
  - Proof sentence: "The cognomen of Crane was not inapplicable to his person."
  - Hint: Look for a word that means family name.
  - Why: "Cognomen" means name: a crane, a tall thin bird, fits the way he looks.
  - Standards: ELA.K12.EE.1.1
- Gist check: A Connecticut farmer named Ichabod Crane came to clear the Hollow's forests. / A traveling preacher named Ichabod Crane came to build the Hollow a new church. / A Connecticut schoolmaster named Ichabod Crane came to teach the Hollow's children. ✓
- Discovery (vocabulary): "worthy wight". Wight: an old word for a person. A worthy wight is a fine fellow, said with a wink.

**Chunk 2** (¶10 sentences 4 to 6; 119 words) · warm-up

- Question (Figure It Out, multiple choice): Read the words "looked like a weather-cock." What kind of figurative language is this?
  - Key words highlighted: weather-cock
  - Choices: Personification: it gives a weather vane human feelings / Simile: it compares his head to a weather vane using like ✓ / Metaphor: it says his head is a weather vane, without like
  - What does it mean? He spins around quickly whenever the wind starts to blow hard / His small head sits high on a thin neck, turning this way and that ✓ / He always knows exactly what tomorrow's weather will be
  - Hint: A weather vane sits on top of a pole and swings around. Picture his head and neck.
  - Why: Like a weather-cock on a spindle: a small head perched high on a thin neck.
  - Standards: ELA.7.R.3.1
- Bank question (Figure It Out, multiple choice): His hands dangled a mile out of his sleeves. Which device is the narrator using?
  - Key words highlighted: a mile out of his sleeves
  - Choices: Simile: a comparison using like or as / Personification: giving a thing human feelings / Hyperbole: a huge exaggeration for effect ✓
  - What does the exaggeration show? He likes to stretch to reach high shelves / His arms are far too long for his clothes ✓ / His coat sleeves were sewn a mile long
  - Hint: Could anything really hang a mile out of a sleeve?
  - Why: A mile is an exaggeration: it shows how long and gangly his arms are.
  - Standards: ELA.7.R.3.1
- Discovery (figurative): "genius of famine". The genius of famine: Ichabod looks so bony he could be the spirit of hunger itself.

**Chunk 3** (¶11 sentences 1 to 2; 86 words)

- Question (Weigh the Evidence, drag and drop: Sort the evidence): Sort each detail: does it support or disprove the claim that the schoolhouse is hard to break into?
  - Slots: Supports the claim / Disproves the claim
  - Piece: A twisted branch holds the door shut → Supports the claim (backed by "It was most ingeniously secured at vacant hours, by a withe twisted in the handle of the d…")
  - Piece: Stakes are set against the window shutters → Supports the claim (backed by "It was most ingeniously secured at vacant hours, by a withe twisted in the handle of the d…")
  - Piece: A thief could get in with perfect ease → Disproves the claim (backed by "It was most ingeniously secured at vacant hours, by a withe twisted in the handle of the d…")
  - Piece: Some windows are patched with paper pages → Disproves the claim (backed by "His schoolhouse was a low building of one large room, rudely constructed of logs; the wind…")
  - Hint: Ask of each detail: does it make getting in harder, or easier?
  - Why: The twisted branch and the stakes make the door and shutters harder to open, but a thief could get in with perfect ease, and paper-patched windows would keep no one out.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Bank question (Weigh the Evidence, two-part evidence): Which detail about the building does the narrator only suppose?
  - Choices: That it was a single room made of logs / That its lock was copied from an eel trap ✓ / That its windows were patched with paper
  - Proof sentence: "It was most ingeniously secured at vacant hours, by a withe twisted in the handle of the door, and stakes set against the window shutters; so that though a thief might get in with perfect ease, he would find some embarrassment in getting out,--an idea most probably borrowed by the architect, Yost Van Houten, from the mystery of an eelpot."
  - Hint: One detail comes with "most probably."
  - Why: The eelpot idea is "most probably" borrowed: a guess, not a fact.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Discovery (vocabulary): "mystery of an eelpot". An eelpot is a trap eels swim into easily but can't get out of, just like the schoolhouse for a thief.

**Chunk 4** (¶11 sentences 3 to 6; 130 words) · surprise double points

- Question (Character Clue, two-part evidence): Which trait fits Ichabod in the classroom?
  - Key words highlighted: trait
  - Choices: Gentle, never raising his voice at any pupil / Lazy, letting the children do as they like / Strict, quick to punish with the birch switch ✓
  - Proof sentence: "From hence the low murmur of his pupils’ voices, conning over their lessons, might be heard in a drowsy summer’s day, like the hum of a beehive; interrupted now and then by the authoritative voice of the master, in the tone of menace or command, or, peradventure, by the appalling sound of the birch, as he urged some tardy loiterer along the flowery path of knowledge."
  - Hint: Listen for the sounds that break into the lessons.
  - Why: The appalling sound of the birch and his motto, spare the rod, show he punishes often.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Bank question (Character Clue, two-part evidence): Ichabod lives by an old saying about punishment. How does he see his own strictness?
  - Key words highlighted: old saying
  - Choices: As a secret pleasure he hides from the parents / As a bad habit he means to break soon / As a duty he owes the children, not as cruelty ✓
  - Proof sentence: "Truth to say, he was a conscientious man, and ever bore in mind the golden maxim, “Spare the rod and spoil the child.”"
  - Hint: Find the old saying, and what kind of man the narrator calls him.
  - Why: A conscientious man follows his conscience: Ichabod believes the rod is good for children, so punishing feels like his duty.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Ichabod's busy schoolhouse is silent because he never lets anyone speak. / Ichabod's pupils run the school by themselves while he naps under the birch tree. / Ichabod's lonely schoolhouse hums with lessons, and he is quick to use the switch. ✓
- Discovery (figurative): "like the hum of a beehive". A simile: the pupils' murmuring voices sound like busy bees.

**Chunk 5** (¶12 sentences 1 to 3; 149 words) · the twist, checkpoint after this chunk, then the burst

- Question (Catch the Lie, tap the sentence): Brom Bones remembers Ichabod's punishments. Part of what he says is false. Tap the sentence that proves it.
  - Testimony (Brom Bones): "That schoolmaster went easy on the big, tough boys and saved his birch for the little weak ones."
  - Proof sentence: "I would not have it imagined, however, that he was one of those cruel potentates of the school who joy in the smart of their subjects; on the contrary, he administered justice with discrimination rather than severity; taking the burden off the backs of the weak, and laying it on those of the strong."
  - Proof sentence: "Your mere puny stripling, that winced at the least flourish of the rod, was passed by with indulgence; but the claims of justice were satisfied by inflicting a double portion on some little tough wrong-headed, broad-skirted Dutch urchin, who sulked and swelled and grew dogged and sullen beneath the birch."
  - Hint: Who got the lighter punishments: the weak or the strong?
  - Why: Ichabod took the burden off the weak and laid it on the strong, the opposite of what Brom says.
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Katrina adds her own memory of the schoolroom. One detail is untrue. Tap the sentence that shows it.
  - Testimony (Katrina Van Tassel): "He never explained himself. He would punish a boy and say nothing at all about it afterward."
  - Proof sentence: "All this he called “doing his duty by their parents;” and he never inflicted a chastisement without following it by the assurance, so consolatory to the smarting urchin, that “he would remember it and thank him for it the longest day he had to live.”"
  - Hint: What did he tell the boys after a punishment?
  - Why: He always followed a punishment with a promise that the boy would thank him for it one day.
  - Standards: ELA.K12.EE.1.1
- Discovery (vocabulary): "cruel potentates". Potentate: a powerful ruler. The narrator jokes that a schoolmaster rules his class like a king.

**Chunk 6** (¶13 sentences 1 to 2; 58 words)

- Question (Read Between the Lines, choose two): Which reasons might lie behind his choice of after-school companions?
  - Key words highlighted: after-school companions
  - Choices (choose 2): Some of them had pretty older sisters ✓ / Some had mothers known for their cooking ✓ / They lived closest to the schoolhouse / They were the best readers in the class
  - Hint: Look at whom he walked home, and what their families had.
  - Why: He walked home children with pretty sisters or mothers famous for the comforts of the cupboard.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): Why would a teacher want to stay friendly with his students here?
  - Choices: The school paid him extra for every friendship / He had no friends his own age in the valley / It brought him meals and company in their homes ✓
  - Proof sentence: "Indeed, it behooved him to keep on good terms with his pupils."
  - Hint: What did those families have that he wanted?
  - Why: It paid him to keep on good terms with his pupils: their families fed and welcomed him.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Discovery (figurative): "comforts of the cupboard". The comforts of the cupboard: a funny way to say good food at home.

**Chunk 7** (¶13 sentences 3 to 4; 92 words)

- Question (Weigh the Evidence, drag and drop: Build the case): Build the case that Ichabod depends on the farm families to get by.
  - Slots: Claim / Proof sentence / Reason
  - Piece: Ichabod depends on the farm families to get by → Claim
  - Piece: "The revenue arising from his school was small, and would have been scarcely sufficient to furnish him with daily bread" → Proof sentence (backed by "The revenue arising from his school was small, and would have been scarcely sufficient to …")
  - Piece: With pay that small, he needs the farmers to give him meals and a bed → Reason (backed by "The revenue arising from his school was small, and would have been scarcely sufficient to …")
  - Piece: The schoolhouse was a single room of logs → belongs nowhere
  - Hint: A case needs a claim, a quotation that proves it, and a reason that connects them.
  - Why: The claim is that he depends on the farmers; the quotation shows his pay was small; the reason links them, since so little money meant boarding with the families. The log schoolhouse proves nothing about it.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Bank question (Weigh the Evidence, two-part evidence): Which detail best shows that his teaching could not support him?
  - Choices: He earned shillings for singing lessons / It would scarcely buy him his daily bread ✓ / He owned more books than he could carry
  - Proof sentence: "The revenue arising from his school was small, and would have been scarcely sufficient to furnish him with daily bread, for he was a huge feeder, and, though lank, had the dilating powers of an anaconda; but to help out his maintenance, he was, according to country custom in those parts, boarded and lodged at the houses of the farmers whose children he instructed."
  - Hint: Look at what his school revenue could buy.
  - Why: His revenue was small, scarcely enough for daily bread.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Gist check: Ichabod is poorly paid, so he quietly takes food from the farmers' cellars at night. / Ichabod is poorly paid and eats a lot, so he lives a week at a time with each farm family. ✓ / Ichabod is wealthy and eats little, so he buys a fine house beside the church.
- Discovery (vocabulary): "worldly effects". Worldly effects: everything a person owns. Ichabod's fit in one handkerchief.

**Chunk 8** (¶14 sentences 1 to 2; 79 words)

- Question (Find It, tap the sentence): Which line lists the work Ichabod did to earn his keep?
  - Key words highlighted: earn his keep
  - Proof sentence: "He assisted the farmers occasionally in the lighter labors of their farms, helped to make hay, mended the fences, took the horses to water, drove the cows from pasture, and cut wood for the winter fire."
  - Hint: Look for a list of jobs.
  - Why: He helped make hay, mended the fences, watered the horses, drove the cows and cut wood.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which sentence tells why he worked so hard to please the farm families?
  - Key words highlighted: please
  - Proof sentence: "That all this might not be too onerous on the purses of his rustic patrons, who are apt to consider the costs of schooling a grievous burden, and schoolmasters as mere drones, he had various ways of rendering himself both useful and agreeable."
  - Hint: Look for what the farmers thought of the cost of schooling.
  - Why: The farmers thought schooling a grievous burden, so he made himself useful and agreeable.
  - Standards: ELA.K12.EE.1.1
- Discovery (vocabulary): "mere drones". Drones are male bees that do no work. Some farmers think teachers are just as idle.

**Chunk 9** (¶14 sentences 3 to 4; 77 words) · the boss (double points)

- Question (Character Clue, two-part evidence): Away from the classroom, which side of Ichabod comes out with the families?
  - Choices: Soft and charming, eager to win the mothers over ✓ / Bossy and loud, just as he is with his class / Shy and nervous, hiding away from the parents
  - Proof sentence: "He laid aside, too, all the dominant dignity and absolute sway with which he lorded it in his little empire, the school, and became wonderfully gentle and ingratiating."
  - Proof sentence: "He found favor in the eyes of the mothers by petting the children, particularly the youngest; and like the lion bold, which whilom so magnanimously the lamb did hold, he would sit with a child on one knee, and rock a cradle with his foot for whole hours together."
  - Hint: Compare the master in school with the man rocking a cradle.
  - Why: He drops his lordly ways and turns gentle, petting the children and rocking a cradle to win the mothers' favor.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Bank question (Character Clue, two-part evidence): The narrator compares Ichabod with a fierce animal gently carrying a young one. What does that picture say about him?
  - Key words highlighted: fierce animal
  - Choices: He keeps animals on the farms where he stays / A stern man turns tender when he wants favor ✓ / He is fierce and dangerous to small children
  - Proof sentence: "He found favor in the eyes of the mothers by petting the children, particularly the youngest; and like the lion bold, which whilom so magnanimously the lamb did hold, he would sit with a child on one knee, and rock a cradle with his foot for whole hours together."
  - Hint: Find the lion in the sentence about the cradle.
  - Why: Like a lion gently holding a lamb, the stern master turns wonderfully gentle and ingratiating.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Discovery (figurative): "the lion bold". Like the lion bold: Ichabod, lord of the schoolroom, turns as gentle as a lion holding a lamb.

**Chunk 10** (¶15 sentences 1 to 2; 68 words)

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what Ichabod's pride in leading the choir suggests about how people see themselves.
  - A strong answer: Pride can make people see themselves as greater than they really are, just as Ichabod believes his choir leading outshines even the parson.
  - Key ideas (one from each group): pride, proud, vain, vanity, conceit, full of himself, think highly, ego, admir, show off | see themselves, see himself, own mind, imagin, believ, think, picture, better than, greater, than they, really, truly, others
  - Proof sentence: "It was a matter of no little vanity to him on Sundays, to take his station in front of the church gallery, with a band of chosen singers; where, in his own mind, he completely carried away the palm from the parson."
  - Hint: Notice the words "in his own mind."
  - Why: Leading the choir is "a matter of no little vanity," and only "in his own mind" does he beat the parson: pride shapes how he sees himself.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using one sentence, state the lesson about people that Ichabod's pride in leading the choir suggests.
  - A strong answer: Pride can make people believe they are better than they really are, the way Ichabod thinks he outdoes the parson.
  - Key ideas (one from each group): pride, proud, vain, vanity, conceit, full of himself, think highly, ego, admir, show off | see themselves, see himself, own mind, imagin, believ, think, picture, better than, greater, than they, really, truly, others
  - Proof sentence: "It was a matter of no little vanity to him on Sundays, to take his station in front of the church gallery, with a band of chosen singers; where, in his own mind, he completely carried away the palm from the parson."
  - Hint: Whose opinion is it that he beats the parson?
  - Why: Only "in his own mind" does he carry away the palm from the parson: vanity colors how he sees himself.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: Ichabod also preaches sermons and takes the parson's place on Sundays. / Ichabod also plays the fiddle at every barn dance held in the valley. / Ichabod also teaches singing and proudly leads the church choir on Sundays. ✓
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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 5; level 2: chunks 6 to 10. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 4 (10 seconds, recalls chunk 2): What extra treat appears when the schoolmaster visits a farmhouse? Answer: "His appearance, therefore, is apt to occasion some little stir at the tea-table of a farmhouse, and the addition of a supernumerary dish of cakes or sweetmeats, or, peradventure, the parade of a silver teapot."
- Lightning beat after chunk 8 (10 seconds, recalls chunk 5): Where did Ichabod like to stretch out and read after school? Answer: "It was often his delight, after his school was dismissed in the afternoon, to stretch himself on the rich bed of clover bordering the little brook that whimpered by his schoolhouse, and there con over old Mather’s direful tales, until the gathering dusk of evening made the printed page a mere mist before his eyes."

**Chunk 1** (¶15 sentences 3 to 4; 108 words) · warm-up

- Question (Whose Eyes?, two-part evidence): How does the narrator treat Ichabod's singing?
  - Key words highlighted: narrator
  - Choices: As a ghost story told to frighten the children / As a joke, tracing odd church sounds back to his nose ✓ / As serious praise for a truly gifted church performer
  - Proof sentence: "Certain it is, his voice resounded far above all the rest of the congregation; and there are peculiar quavers still to be heard in that church, and which may even be heard half a mile off, quite to the opposite side of the millpond, on a still Sunday morning, which are said to be legitimately descended from the nose of Ichabod Crane."
  - Hint: Where does the narrator say those strange quavers come from?
  - Why: The quavers still heard half a mile off are said to descend from the nose of Ichabod Crane, a playful exaggeration.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Bank question (Whose Eyes?, two-part evidence): According to the narrator, who thinks the schoolmaster's living is simple?
  - Key words highlighted: According to the narrator
  - Choices: The parson, who envies all of his many jobs / Only people who know nothing of mental work ✓ / Every parent who sends a child to his school
  - Proof sentence: "Thus, by divers little makeshifts, in that ingenious way which is commonly denominated “by hook and by crook,” the worthy pedagogue got on tolerably enough, and was thought, by all who understood nothing of the labor of headwork, to have a wonderfully easy life of it."
  - Hint: Read the end of the sentence about his makeshifts.
  - Why: Only those "who understood nothing of the labor of headwork" think he has an easy life: the narrator hints the farmers misjudge him.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: Ichabod sings so softly that nobody in the church can ever hear him. / Ichabod earns a fortune from one big job and stops working small jobs altogether. / Ichabod sings louder than everyone, and he gets by through many small, clever jobs. ✓
- Discovery (figurative): "by hook and by crook". By hook and by crook: by any means he can manage.

**Chunk 2** (¶16 sentences 1 to 2; 80 words) · warm-up

- Question (Read Between the Lines, two-part evidence): What can you infer about how families treat a visiting teacher?
  - Key words highlighted: infer
  - Choices: They ignore him and keep working in the barn / They put out their best dishes to impress him ✓ / They hide their best food so he won't eat it all
  - Proof sentence: "His appearance, therefore, is apt to occasion some little stir at the tea-table of a farmhouse, and the addition of a supernumerary dish of cakes or sweetmeats, or, peradventure, the parade of a silver teapot."
  - Hint: Look at what appears on the table when he arrives.
  - Why: His arrival brings an extra dish of cakes, or even the silver teapot.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): Why might the farm women look up to the new teacher?
  - Key words highlighted: look up to
  - Choices: He comes from a famous and wealthy family / He seems finer than the rough local young men ✓ / He owns the largest farm in the whole valley
  - Proof sentence: "The schoolmaster is generally a man of some importance in the female circle of a rural neighborhood; being considered a kind of idle, gentlemanlike personage, of vastly superior taste and accomplishments to the rough country swains, and, indeed, inferior in learning only to the parson."
  - Hint: Compare him with the other young men of the neighborhood.
  - Why: They think him gentlemanlike, of far superior taste to the rough country swains, and second in learning only to the parson.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Discovery (vocabulary): "supernumerary dish". Supernumerary: extra. The family adds an extra dish of cakes for the guest.

**Chunk 3** (¶16 sentences 3 to 4; 82 words)

- Question (Character Clue, drag and drop: Match the character): Match each action in the Sunday churchyard to the person who does it.
  - Slots: Ichabod / The bashful country boys
  - Piece: Gathers wild grapes for the young women → Ichabod (backed by "How he would figure among them in the churchyard, between services on Sundays; gathering g…")
  - Piece: Recites the words on the tombstones to amuse them → Ichabod (backed by "How he would figure among them in the churchyard, between services on Sundays; gathering g…")
  - Piece: Hangs back sheepishly → The bashful country boys (backed by "How he would figure among them in the churchyard, between services on Sundays; gathering g…")
  - Piece: Envies another man's elegance → The bashful country boys (backed by "How he would figure among them in the churchyard, between services on Sundays; gathering g…")
  - Hint: Who shows off, and who watches from the side?
  - Why: Ichabod gathers grapes and recites epitaphs for the young women, while the bashful country boys hang back, envying his elegance.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Bank question (Character Clue, two-part evidence): What does his Sunday behavior with the young women reveal about him?
  - Key words highlighted: reveal
  - Choices: He is rude and bored by their company / He loves to show off and be admired ✓ / He is shy and tongue-tied around them
  - Proof sentence: "How he would figure among them in the churchyard, between services on Sundays; gathering grapes for them from the wild vines that overran the surrounding trees; reciting for their amusement all the epitaphs on the tombstones; or sauntering, with a whole bevy of them, along the banks of the adjacent millpond; while the more bashful country bumpkins hung sheepishly back, envying his superior elegance and address."
  - Hint: Look at all the ways he entertains them.
  - Why: He gathers grapes, recites epitaphs and strolls with a whole bevy of them, showing off his elegance.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Discovery (vocabulary): "a whole bevy of them". Bevy: a group, often of young women, like a flock of birds.

**Chunk 4** (¶17 sentences 1 to 2; 77 words) · surprise double points

- Question (Read Between the Lines, choose two): Which two reasons make the farm wives glad to see him at their doors?
  - Key words highlighted: glad to see him
  - Choices (choose 2): He brings news and gossip from every house ✓ / They think he is a man of great learning ✓ / He pays each family well for his meals / He mends their broken spinning wheels
  - Hint: Look at what he brings with him, and what the women think of him.
  - Why: He is a travelling gazette full of local gossip, and the women esteem him as a man of great erudition.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): What does his favorite author tell you about Ichabod's own beliefs?
  - Key words highlighted: favorite author
  - Choices: He cares only for practical farming advice / He is ready to believe in the supernatural ✓ / He doubts every ghost story he hears
  - Proof sentence: "He was, moreover, esteemed by the women as a man of great erudition, for he had read several books quite through, and was a perfect master of Cotton Mather’s “History of New England Witchcraft,” in which, by the way, he most firmly and potently believed."
  - Hint: What is Cotton Mather's book about, and how much does Ichabod trust it?
  - Why: He is a perfect master of Mather's history of witchcraft, in which he most firmly and potently believes.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Ichabod carries gossip from house to house and is admired for reading books on witchcraft. ✓ / Ichabod refuses to carry gossip and is mocked by the women for never reading a single book. / Ichabod prints a newspaper and sells copies to every family in the valley.
- Discovery (figurative): "travelling gazette". A traveling gazette: Ichabod is like a walking newspaper, spreading news as he goes.

**Chunk 5** (¶18 sentences 1 to 4; 105 words) · checkpoint after this chunk, then the burst

- Question (Figure It Out, multiple choice): Read the words "for his capacious swallow." What kind of figurative language is this?
  - Key words highlighted: capacious swallow
  - Choices: Onomatopoeia: the word swallow imitates a gulping sound / Metaphor: believing stories is described as swallowing food ✓ / Simile: it compares stories to food using like or as
  - What does it mean? He eats huge meals while reading stories / He tells his stories much too fast / He will believe any tale, however wild ✓
  - Hint: Can you really swallow a story? Think about what he does with the tales he hears.
  - Why: He swallows tales the way a big eater swallows food: no story is too monstrous for him to believe.
  - Standards: ELA.7.R.3.1
- Bank question (Figure It Out, multiple choice): The narrator says the little brook "whimpered." Which device is this?
  - Key words highlighted: whimpered
  - Choices: Simile: the brook is compared using like or as / Alliteration: the same first sound repeats / Personification: the brook is given a human cry ✓
  - What does it suggest about the brook? It is too loud for him to read by / It makes a soft, sad little sound ✓ / It floods the schoolhouse every spring
  - Hint: Who usually whimpers?
  - Why: Only people and animals whimper: the brook gets a soft, sad, human sound.
  - Standards: ELA.7.R.3.1
- Discovery (vocabulary): "simple credulity". Credulity: being too ready to believe things.

**Chunk 6** (¶18 sentences 5 to 6; 136 words)

- Question (Find It, tap the sentence): Which line describes a bug that nearly frightens him to death?
  - Key words highlighted: bug
  - Proof sentence: "The fireflies, too, which sparkled most vividly in the darkest places, now and then startled him, as one of uncommon brightness would stream across his path; and if, by chance, a huge blockhead of a beetle came winging his blundering flight against him, the poor varlet was ready to give up the ghost, with the idea that he was struck with a witch’s token."
  - Hint: Look for something with wings that crashes into him.
  - Why: A huge blockhead of a beetle flies against him, and he is ready to give up the ghost.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line lists the night noises that make his mind run wild?
  - Key words highlighted: night noises
  - Proof sentence: "Then, as he wended his way by swamp and stream and awful woodland, to the farmhouse where he happened to be quartered, every sound of nature, at that witching hour, fluttered his excited imagination,--the moan of the whip-poor-will from the hillside, the boding cry of the tree toad, that harbinger of storm, the dreary hooting of the screech owl, or the sudden rustling in the thicket of birds frightened from their roost."
  - Hint: Look for a list of birds, toads and rustling.
  - Why: The whip-poor-will, the tree toad, the screech owl and the rustling in the thicket all flutter his excited imagination.
  - Standards: ELA.K12.EE.1.1
- Discovery (figurative): "give up the ghost". Give up the ghost: to die. A beetle bumping him nearly scares him to death.

**Chunk 7** (¶18 sentences 7 to 7; 62 words) · the twist

- Question (Catch the Lie, tap the sentence): Brom Bones explains why the schoolmaster made music at night. Part of what he says is false. Tap the sentence that proves it.
  - Testimony (Brom Bones): "He only sang on those walks home to show off his voice to the farmers along the road."
  - Proof sentence: "His only resource on such occasions, either to drown thought or drive away evil spirits, was to sing psalm tunes and the good people of Sleepy Hollow, as they sat by their doors of an evening, were often filled with awe at hearing his nasal melody, “in linked sweetness long drawn out,” floating from the distant hill, or along the dusky road."
  - Hint: Why did he sing when he was alone at night?
  - Why: He sang psalm tunes to drown thought or drive away evil spirits, not to show off.
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Hans Van Ripper remembers it differently. One detail is untrue. Tap the sentence that shows it.
  - Testimony (Hans Van Ripper): "Nobody ever heard him. He sang so softly on that dark road that not a note reached the houses."
  - Proof sentence: "His only resource on such occasions, either to drown thought or drive away evil spirits, was to sing psalm tunes and the good people of Sleepy Hollow, as they sat by their doors of an evening, were often filled with awe at hearing his nasal melody, “in linked sweetness long drawn out,” floating from the distant hill, or along the dusky road."
  - Hint: What did the people sitting by their doors hear?
  - Why: The good people sitting by their doors were filled with awe at hearing his nasal melody floating from the distant hill.
  - Standards: ELA.K12.EE.1.1
- Gist check: To show off, Ichabod sings love songs, and neighbors throw open their windows. / To earn money, Ichabod sings at farmhouse doors, and the neighbors pay him in apples. / To fight his fear, Ichabod sings hymns, and neighbors hear his nasal voice in the dark. ✓
- Discovery (vocabulary): "nasal melody". Nasal melody: singing through the nose. Ichabod's hymns float over the hills.

**Chunk 8** (¶19 sentences 1 to 2; 138 words)

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what these cozy nights suggest about why people enjoy being scared.
  - A strong answer: People enjoy being scared by stories because fear feels thrilling when they are safe and warm among friends.
  - Key ideas (one from each group): scare, scary, fear, fright, terror, spook, eerie, ghost, goblin, creepy | enjoy, pleasure, love, fun, delight, thrill, exciting, like, entertain
  - Proof sentence: "Another of his sources of fearful pleasure was to pass long winter evenings with the old Dutch wives, as they sat spinning by the fire, with a row of apples roasting and spluttering along the hearth, and listen to their marvellous tales of ghosts and goblins, and haunted fields, and haunted brooks, and haunted bridges, and haunted houses, and particularly of the headless horseman, or Galloping Hessian of the Hollow, as they sometimes called him."
  - Hint: Notice the words "fearful pleasure."
  - Why: Listening to tales of ghosts and goblins is a "fearful pleasure": a scare can be fun when it is shared by a warm fire.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using your own words, tell in one sentence what these gatherings suggest about why people believe strange stories.
  - A strong answer: People believe strange stories more easily when everyone around them shares and trusts the same stories.
  - Key ideas (one from each group): believ, trust, accept, convinc, credul, true, real | everyone, together, share, each other, others, group, neighbor, around them, same, community
  - Proof sentence: "Another of his sources of fearful pleasure was to pass long winter evenings with the old Dutch wives, as they sat spinning by the fire, with a row of apples roasting and spluttering along the hearth, and listen to their marvellous tales of ghosts and goblins, and haunted fields, and haunted brooks, and haunted bridges, and haunted houses, and particularly of the headless horseman, or Galloping Hessian of the Hollow, as they sometimes called him."
  - Hint: Who tells the tales, and who believes them?
  - Why: The old wives share their marvellous tales and Ichabod adds his own: a whole circle that believes makes the stories feel true.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Discovery (figurative): "fearful pleasure". Fearful pleasure: he loves being scared, both at once.

**Chunk 9** (¶20 sentences 1 to 3; 93 words) · the boss (double points)

- Question (Shades of Meaning, two-part evidence): Why does the narrator call his look wistful instead of just sad?
  - Key words highlighted: wistful
  - Choices: It shows he is angry at the people inside / It shows he is bored by the cold, empty fields he crosses / It shows a longing for the warm, safe homes he sees ✓
  - Proof sentence: "But if there was a pleasure in all this, while snugly cuddling in the chimney corner of a chamber that was all of a ruddy glow from the crackling wood fire, and where, of course, no spectre dared to show its face, it was dearly purchased by the terrors of his subsequent walk homewards."
  - Hint: Where was he snug and safe earlier that evening?
  - Why: After snugly cuddling in a glowing chimney corner, he eyes every distant window with longing.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Bank question (Shades of Meaning, two-part evidence): Why might the narrator call the snowy light a "ghastly glare" rather than a bright shine?
  - Key words highlighted: ghastly glare
  - Choices: It shows the moon is shining warmly / It means the snow is melting quickly / It makes the light seem eerie and scary ✓
  - Part B: tap the clue words that show the meaning (any one): "fearful shapes and shadows"
  - Proof sentence: "What fearful shapes and shadows beset his path, amidst the dim and ghastly glare of a snowy night!"
  - Hint: What does that light show him on the path?
  - Why: The light shows "fearful shapes and shadows": ghastly means ghostly and terrifying, not just bright.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Discovery (figurative): "dearly purchased". Dearly purchased: the fun had a high price, paid in fear on the way home.

**Chunk 10** (¶20 sentences 4 to 6; 92 words)

- Question (Story Order, drag and drop: Cause and effect): Connect each sight or sound on his walk to the fear it stirs up.
  - Slots: A shrub covered with snow / The crunch of his own steps / A rushing blast howling in the trees
  - Piece: He thinks a ghost in a sheet blocks his path → A shrub covered with snow (backed by "How often was he appalled by some shrub covered with snow, which, like a sheeted spectre, …")
  - Piece: He is afraid to look over his shoulder → The crunch of his own steps (backed by "How often did he shrink with curdling awe at the sound of his own steps on the frosty crus…")
  - Piece: He thinks the Galloping Hessian is riding by → A rushing blast howling in the trees (backed by "And how often was he thrown into complete dismay by some rushing blast, howling among the …")
  - Hint: Each "How often" sentence pairs something he notices with what he fears.
  - Why: The snowy shrub looks like a sheeted spectre, his own steps make him dread looking back, and the wind sounds like the Hessian.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Bank question (Story Order, two-part evidence): What do the three frights on his walk build up to?
  - Key words highlighted: build up to
  - Choices: His worst fear: the Galloping Hessian is near ✓ / His plan to move closer to the schoolhouse / His choice to stop visiting the old wives
  - Proof sentence: "And how often was he thrown into complete dismay by some rushing blast, howling among the trees, in the idea that it was the Galloping Hessian on one of his nightly scourings!"
  - Hint: Which fear comes last, and which is the biggest?
  - Why: The frights grow from a shrub to his own footsteps to the wind he takes for the Galloping Hessian himself.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Gist check: Snowy bushes, his own footsteps and the wind all help Ichabod find the right road home. / Snowy bushes, his own footsteps and the wind all make Ichabod think a ghost is near. ✓ / Snowy bushes, his own footsteps and the wind all make Ichabod feel calm and sleepy.
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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 5; level 2: chunks 6 to 10. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 4 (10 seconds, recalls chunk 2): How old is Katrina when Ichabod meets her? Answer: "She was a blooming lass of fresh eighteen; plump as a partridge; ripe and melting and rosy-cheeked as one of her father’s peaches, and universally famed, not merely for her beauty, but her vast expectations."
- Lightning beat after chunk 8 (10 seconds, recalls chunk 5): What bubbles up at the foot of the great elm? Answer: "A great elm tree spread its broad branches over it, at the foot of which bubbled up a spring of the softest and sweetest water, in a little well formed of a barrel; and then stole sparkling away through the grass, to a neighboring brook, that babbled along among alders and dwarf willows."

**Chunk 1** (¶21 sentences 1 to 1; 102 words) · warm-up

- Question (Whose Eyes?, two-part evidence): What does the narrator's joke at the end of this chunk suggest?
  - Key words highlighted: narrator's joke
  - Choices: That a woman will trouble Ichabod more than any ghost ✓ / That Ichabod will soon meet the real Headless Horseman / That Ichabod plans to leave the Hollow forever
  - Proof sentence: "All these, however, were mere terrors of the night, phantoms of the mind that walk in darkness; and though he had seen many spectres in his time, and been more than once beset by Satan in divers shapes, in his lonely perambulations, yet daylight put an end to all these evils; and he would have passed a pleasant life of it, in despite of the Devil and all his works, if his path had not been crossed by a being that causes more perplexity to mortal man than ghosts, goblins, and the whole race of witches put together, and that was--a woman."
  - Hint: Read the very last words of the chunk. What causes more perplexity than ghosts?
  - Why: The narrator says a woman causes more perplexity than ghosts, goblins and witches put together.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Bank question (Whose Eyes?, two-part evidence): What does the narrator believe about the scary things Ichabod saw?
  - Key words highlighted: narrator believe
  - Choices: They were real spirits haunting the roads / They were tricks the farm boys played / They were made up inside his own head ✓
  - Proof sentence: "All these, however, were mere terrors of the night, phantoms of the mind that walk in darkness; and though he had seen many spectres in his time, and been more than once beset by Satan in divers shapes, in his lonely perambulations, yet daylight put an end to all these evils; and he would have passed a pleasant life of it, in despite of the Devil and all his works, if his path had not been crossed by a being that causes more perplexity to mortal man than ghosts, goblins, and the whole race of witches put together, and that was--a woman."
  - Hint: What does the narrator call them at the start of the sentence?
  - Why: He calls them "mere terrors of the night, phantoms of the mind": the narrator treats them as imagined.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: Daylight brings new fears to Ichabod, but a kind woman helps him feel brave again. / Daylight never reaches the Hollow, so Ichabod's fears never leave him at all. / Daylight ends Ichabod's night fears, but a woman is about to cause him real trouble. ✓
- Discovery (figurative): "phantoms of the mind". Phantoms of the mind: ghosts that exist only in his imagination.

**Chunk 2** (¶22 sentences 1 to 2; 66 words) · warm-up

- Question (Word Detective, two-part evidence): In this chunk, what do the words vast expectations mean?
  - Key words highlighted: vast expectations
  - Choices: Very high hopes for her lovely singing voice / A long list of chores she must finish / A large fortune she is expected to inherit ✓
  - Proof sentence: "Among the musical disciples who assembled, one evening in each week, to receive his instructions in psalmody, was Katrina Van Tassel, the daughter and only child of a substantial Dutch farmer."
  - Hint: Whose only child is she?
  - Why: As the only child of a substantial farmer, she expects to inherit his fortune.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Bank question (Word Detective, two-part evidence): Which meaning of blooming fits Katrina?
  - Key words highlighted: blooming
  - Choices: Pale and tired from too much work / Healthy and fresh, in the bloom of youth ✓ / Covered with flowers from her garden
  - Part B: tap the clue words that show the meaning (any one): "fresh eighteen", "rosy-cheeked"
  - Proof sentence: "She was a blooming lass of fresh eighteen; plump as a partridge; ripe and melting and rosy-cheeked as one of her father’s peaches, and universally famed, not merely for her beauty, but her vast expectations."
  - Hint: Find the words nearby that describe her age and her cheeks.
  - Why: She is "fresh eighteen" and "rosy-cheeked": blooming means healthy and in the bloom of youth.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Discovery (figurative): "plump as a partridge". A simile comparing Katrina to a plump little bird.

**Chunk 3** (¶22 sentences 3 to 4; 73 words) · surprise double points

- Question (Character Clue, two-part evidence): Which trait do Katrina's clothes reveal?
  - Key words highlighted: trait
  - Choices: She doesn't care at all how she looks / She wears only plain work clothes / She likes to be noticed and admired ✓
  - Proof sentence: "She was withal a little of a coquette, as might be perceived even in her dress, which was a mixture of ancient and modern fashions, as most suited to set off her charms."
  - Hint: What does the narrator call her, and why does she mix her fashions?
  - Why: She is "a little of a coquette," choosing whatever fashions best set off her charms.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Bank question (Character Clue, two-part evidence): What does Katrina's choice of jewelry show about her?
  - Key words highlighted: jewelry
  - Choices: She cannot afford any jewelry of her own / She dislikes anything old-fashioned / She proudly shows off old family wealth ✓
  - Proof sentence: "She wore the ornaments of pure yellow gold, which her great-great-grandmother had brought over from Saardam; the tempting stomacher of the olden time, and withal a provokingly short petticoat, to display the prettiest foot and ankle in the country round."
  - Hint: Where did the gold come from?
  - Why: She wears the pure gold her great-great-grandmother brought from Saardam: family wealth on show.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Discovery (vocabulary): "brought over from Saardam". Saardam: a town in Holland. The gold came with her family from the old country.

**Chunk 4** (¶23 sentences 1 to 3; 83 words)

- Question (Find It, tap the sentence): Which line sums up what kind of man Katrina's father is?
  - Key words highlighted: Katrina's father
  - Proof sentence: "Old Baltus Van Tassel was a perfect picture of a thriving, contented, liberal-hearted farmer."
  - Hint: Look for a quick picture of him, full of describing words.
  - Why: Old Baltus Van Tassel was a perfect picture of a thriving, contented, liberal-hearted farmer.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line shows Baltus rarely thinks past his own fences?
  - Key words highlighted: own fences
  - Proof sentence: "He seldom, it is true, sent either his eyes or his thoughts beyond the boundaries of his own farm; but within those everything was snug, happy and well-conditioned."
  - Hint: Look for the word boundaries.
  - Why: He seldom sent his eyes or his thoughts beyond the boundaries of his own farm.
  - Standards: ELA.K12.EE.1.1
- Gist check: Ichabod falls for Katrina, and her father turns out to be a happy, generous, well-off farmer. ✓ / Ichabod falls for Katrina, but her father turns out to be a stingy and angry farmer. / Ichabod ignores Katrina, but her stern father hires him to manage the whole farm.
- Discovery (vocabulary): "paternal mansion". Paternal mansion: her father's big house.

**Chunk 5** (¶23 sentences 4 to 6; 107 words) · checkpoint after this chunk, then the burst

- Question (Weigh the Evidence, drag and drop: Build the case): Build the case that Baltus is happy with the life he has.
  - Slots: Claim / Proof sentence / Reason
  - Piece: Baltus is happy with the life he has → Claim
  - Piece: "He was satisfied with his wealth, but not proud of it" → Proof sentence (backed by "He was satisfied with his wealth, but not proud of it; and piqued himself upon the hearty …")
  - Piece: He enjoys plenty without needing to show off → Reason (backed by "He was satisfied with his wealth, but not proud of it; and piqued himself upon the hearty …")
  - Piece: A great elm tree spreads its branches over the house → belongs nowhere
  - Hint: A case needs a claim, a quotation that proves it, and a reason that connects them.
  - Why: The quotation shows he is satisfied, the reason explains it (plenty, not style), and the elm tree proves nothing about his feelings.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Bank question (Weigh the Evidence, two-part evidence): Which detail best supports the claim that the farm has everything it needs close at hand?
  - Key words highlighted: close at hand
  - Choices: Baltus is satisfied with his wealth but not proud / Dutch farmers like to settle in sheltered spots / A spring of the sweetest water bubbles up under the elm ✓
  - Proof sentence: "A great elm tree spread its broad branches over it, at the foot of which bubbled up a spring of the softest and sweetest water, in a little well formed of a barrel; and then stole sparkling away through the grass, to a neighboring brook, that babbled along among alders and dwarf willows."
  - Hint: Which detail is about something useful right beside the house?
  - Why: Fresh water bubbles up right at the foot of the elm by the house; the other details are about feelings or about farmers in general.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Discovery (figurative): "His stronghold". Stronghold: a fort. The narrator jokes that the farmhouse is a castle.

**Chunk 6** (¶23 sentences 7 to 7; 93 words)

- Question (Figure It Out, multiple choice): Read the words "might have served for a church." What kind of figurative language is this?
  - Key words highlighted: served for a church
  - Choices: Personification: the barn prays like a person / Hyperbole: the barn is so huge it could be a church ✓ / Simile: it compares the barn to a church using like
  - What does it mean? The barn is enormous ✓ / The barn holds Sunday worship / The barn is quiet and peaceful
  - Hint: Could a barn really hold a whole congregation? Think about its size.
  - Why: The barn is exaggerated to the size of a church: it is enormous.
  - Standards: ELA.7.R.3.1
- Bank question (Figure It Out, multiple choice): Some pigeons are "bowing about their dames." Which device is this?
  - Key words highlighted: bowing
  - Choices: Hyperbole: a wild exaggeration of size / Personification: birds act like gentlemen ✓ / Simile: birds compared using like or as
  - What does it show about the farm? The pigeons are about to fly off / The barn is falling into ruin / It feels lively, cozy and content ✓
  - Hint: Who usually bows to a lady?
  - Why: The pigeons bow to their mates like gentlemen: the whole farm seems happy and well mannered.
  - Standards: ELA.7.R.3.1
- Discovery (figurative): "bursting forth with the treasures of the farm". The barn is so full that the harvest seems to burst out of every crack.

**Chunk 7** (¶23 sentences 8 to 9; 69 words) · the twist

- Question (Catch the Lie, tap the sentence): Brom Bones describes the Van Tassel place. One thing he says is false. Tap the line that proves it.
  - Key words highlighted: false
  - Testimony (Brom Bones): "Old Van Tassel's place is a sorry sight. A couple of skinny hogs, and not a single goose in sight."
  - Proof sentence: "Sleek unwieldy porkers were grunting in the repose and abundance of their pens, from whence sallied forth, now and then, troops of sucking pigs, as if to snuff the air."
  - Proof sentence: "A stately squadron of snowy geese were riding in an adjoining pond, convoying whole fleets of ducks; regiments of turkeys were gobbling through the farmyard, and Guinea fowls fretting about it, like ill-tempered housewives, with their peevish, discontented cry."
  - Hint: Brom talks big. Check the pigs, and check the pond.
  - Why: The porkers are sleek and grunting in abundance, and a stately squadron of snowy geese rides on the pond.
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Katrina adds her own memory of the animals. One detail is untrue. Tap the sentence that shows it.
  - Testimony (Katrina Van Tassel): "Our farmyard birds were the gentlest things. Even the guinea fowls never made a sound."
  - Proof sentence: "A stately squadron of snowy geese were riding in an adjoining pond, convoying whole fleets of ducks; regiments of turkeys were gobbling through the farmyard, and Guinea fowls fretting about it, like ill-tempered housewives, with their peevish, discontented cry."
  - Hint: What noise do the guinea fowls make?
  - Why: The guinea fowls fret about the farmyard with a peevish, discontented cry.
  - Standards: ELA.K12.EE.1.1
- Gist check: Wolves have chased every last animal out of the empty farmyard. / Fat pigs, geese, ducks, turkeys and fussy guinea fowl fill the busy farmyard. ✓ / A few thin goats and one tired old horse wander the quiet, empty farmyard.
- Discovery (figurative): "like ill-tempered housewives". A simile: the noisy guinea fowl fuss like cranky people.

**Chunk 8** (¶23 sentences 10 to 10; 60 words)

- Question (Shades of Meaning, drag and drop: Feeling of the word): Sort each phrase about the rooster: does it show his pride, or his care for his family?
  - Slots: Shows his pride / Shows his care for his family
  - Piece: Struts before the barn door → Shows his pride (backed by "Before the barn door strutted the gallant cock, that pattern of a husband, a warrior and a…")
  - Piece: Claps his shining wings → Shows his pride (backed by "Before the barn door strutted the gallant cock, that pattern of a husband, a warrior and a…")
  - Piece: Crows with pride and gladness → Shows his pride (backed by "Before the barn door strutted the gallant cock, that pattern of a husband, a warrior and a…")
  - Piece: Calls his hungry family over → Shows his care for his family (backed by "Before the barn door strutted the gallant cock, that pattern of a husband, a warrior and a…")
  - Piece: Shares the tasty morsel he found → Shows his care for his family (backed by "Before the barn door strutted the gallant cock, that pattern of a husband, a warrior and a…")
  - Hint: Is he showing himself off, or looking after the others?
  - Why: Strutting, wing-clapping and crowing show off his pride; calling his family to the morsel shows his care.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Bank question (Shades of Meaning, two-part evidence): Why does the narrator call the rooster gallant instead of just proud?
  - Key words highlighted: gallant
  - Choices: It makes him sound weak and too tired to crow / It makes him sound lazy and sleepy / It makes him sound like a brave, polite gentleman ✓
  - Part B: tap the clue words that show the meaning (any one): "a warrior and a fine gentleman", "generously calling"
  - Proof sentence: "Before the barn door strutted the gallant cock, that pattern of a husband, a warrior and a fine gentleman, clapping his burnished wings and crowing in the pride and gladness of his heart,--sometimes tearing up the earth with his feet, and then generously calling his ever-hungry family of wives and children to enjoy the rich morsel which he had discovered."
  - Hint: Find the words nearby that make him sound like a hero.
  - Why: He is "a warrior and a fine gentleman" who generously calls his family: gallant means brave and courteous.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Discovery (figurative): "pattern of a husband". The rooster is described like a model husband and gentleman.

**Chunk 9** (¶24 sentences 1 to 2; 85 words)

- Question (Read Between the Lines, choose two): Which two things does Ichabod's daydream at the farm reveal about him?
  - Key words highlighted: daydream
  - Choices (choose 2): He hopes to work as a butcher / He thinks about food nearly all the time ✓ / He has a lively, vivid imagination ✓ / He feels sorry for the farm animals
  - Hint: What does he picture, and how detailed is the picture?
  - Why: His mouth waters as he pictures every animal as a richly detailed dish: food is always on his mind, and his imagination runs wild.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): What can you infer Ichabod sees when he studies the animals?
  - Key words highlighted: infer
  - Choices: Pets he would like to care for / Hard chores he would rather avoid / Future feasts he hopes to enjoy ✓
  - Proof sentence: "The pedagogue’s mouth watered as he looked upon this sumptuous promise of luxurious winter fare."
  - Proof sentence: "In his devouring mind’s eye, he pictured to himself every roasting-pig running about with a pudding in his belly, and an apple in his mouth; the pigeons were snugly put to bed in a comfortable pie, and tucked in with a coverlet of crust; the geese were swimming in their own gravy; and the ducks pairing cosily in dishes, like snug married couples, with a decent competency of onion sauce."
  - Hint: What happens to his mouth as he looks?
  - Why: His mouth watered, and in his mind's eye every pig and pigeon was already roasted or baked in a pie.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Discovery (figurative): "coverlet of crust". A coverlet is a blanket: the pigeons are tucked into a pie under a crust blanket.

**Chunk 10** (¶24 sentences 3 to 3; 70 words) · the boss (double points)

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what this scene suggests about how wanting something changes what people see.
  - A strong answer: When people want something badly, they see the world through that desire, the way hungry Ichabod sees every animal as a meal.
  - Key ideas (one from each group): want, desire, greed, hunger, hungry, appetite, wish, long | see, view, look, imagin, picture, everything, world, the way, notice
  - Proof sentence: "In the porkers he saw carved out the future sleek side of bacon, and juicy relishing ham; not a turkey but he beheld daintily trussed up, with its gizzard under its wing, and, peradventure, a necklace of savory sausages; and even bright chanticleer himself lay sprawling on his back, in a side dish, with uplifted claws, as if craving that quarter which his chivalrous spirit disdained to ask while living."
  - Hint: What does he see when he looks at a living rooster?
  - Why: Even the proud rooster becomes a side dish in his eyes: what a person wants shapes everything they see.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using your own words, tell in one sentence what lesson about greed this scene suggests.
  - A strong answer: Greed can turn everything a person sees into something to take or consume, even creatures that are alive and happy.
  - Key ideas (one from each group): greed, greedy, hunger, appetite, want, desire | everything, anything, see, turn, take, consume, use, living, alive
  - Proof sentence: "In the porkers he saw carved out the future sleek side of bacon, and juicy relishing ham; not a turkey but he beheld daintily trussed up, with its gizzard under its wing, and, peradventure, a necklace of savory sausages; and even bright chanticleer himself lay sprawling on his back, in a side dish, with uplifted claws, as if craving that quarter which his chivalrous spirit disdained to ask while living."
  - Hint: Look at what happens to each happy animal in his mind.
  - Why: Pigs, turkeys and even chanticleer become bacon, sausages and side dishes: greed turns living things into things to devour.
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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 5; level 2: chunks 6 to 10. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 4 (10 seconds, recalls chunk 2): Where does Ichabod picture himself riding off to? Answer: "Nay, his busy fancy already realized his hopes, and presented to him the blooming Katrina, with a whole family of children, mounted on the top of a wagon loaded with household trumpery, with pots and kettles dangling beneath; and he beheld himself bestriding a pacing mare, with a colt at her heels, setting out for Kentucky, Tennessee,--or the Lord knows where!"
- Lightning beat after chunk 8 (10 seconds, recalls chunk 5): What hangs from the centre of the best parlor? Answer: "In one corner stood a huge bag of wool, ready to be spun; in another, a quantity of linsey-woolsey just from the loom; ears of Indian corn, and strings of dried apples and peaches, hung in gay festoons along the walls, mingled with the gaud of red peppers; and a door left ajar gave him a peep into the best parlor, where the claw-footed chairs and dark mahogany tables shone like mirrors; andirons, with their accompanying shovel and tongs, glistened from their covert of asparagus tops; mock-oranges and conch-shells decorated the mantelpiece; strings of various-colored birds eggs were suspended above it; a great ostrich egg was hung from the centre of the room, and a corner cupboard, knowingly left open, displayed immense treasures of old silver and well-mended china."

**Chunk 1** (¶25 sentences 1 to 1; 90 words) · warm-up

- Question (Word Detective, two-part evidence): Which meaning of enraptured fits Ichabod here?
  - Key words highlighted: enraptured
  - Choices: Filled with delight, carried away by joy ✓ / Trapped inside the farmhouse by a storm / Angry and jealous of the farmer's riches
  - Part B: tap the clue words that show the meaning (any one): "his heart yearned", "his imagination expanded"
  - Proof sentence: "As the enraptured Ichabod fancied all this, and as he rolled his great green eyes over the fat meadow lands, the rich fields of wheat, of rye, of buckwheat, and Indian corn, and the orchards burdened with ruddy fruit, which surrounded the warm tenement of Van Tassel, his heart yearned after the damsel who was to inherit these domains, and his imagination expanded with the idea, how they might be readily turned into cash, and the money invested in immense tracts of wild land, and shingle palaces in the wilderness."
  - Hint: Find the words that show what his heart and imagination do.
  - Why: His heart yearns and his imagination expands: enraptured means carried away with delight.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Bank question (Word Detective, two-part evidence): What does domains mean here?
  - Key words highlighted: domains
  - Choices: Rooms inside the big farmhouse / Lands and property she will own ✓ / Kingdoms ruled by a faraway king
  - Part B: tap the clue words that show the meaning (any one): "fat meadow lands", "rich fields of wheat", "orchards burdened with ruddy fruit"
  - Proof sentence: "As the enraptured Ichabod fancied all this, and as he rolled his great green eyes over the fat meadow lands, the rich fields of wheat, of rye, of buckwheat, and Indian corn, and the orchards burdened with ruddy fruit, which surrounded the warm tenement of Van Tassel, his heart yearned after the damsel who was to inherit these domains, and his imagination expanded with the idea, how they might be readily turned into cash, and the money invested in immense tracts of wild land, and shingle palaces in the wilderness."
  - Hint: Look at the list of what surrounds the house.
  - Why: Meadows, fields and orchards surround the house: her domains are the lands she will inherit.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: Gazing at the poor farm, Ichabod decides Katrina must work hard to earn her own money. / Gazing at the rich farm, Ichabod plans to buy it all with his small teaching pay. / Gazing at the rich farm, Ichabod dreams of marrying Katrina and turning the land into money. ✓
- Discovery (figurative): "shingle palaces in the wilderness". Shingle palaces: grand houses of wooden shingles. He dreams big about a frontier fortune.

**Chunk 2** (¶25 sentences 2 to 2; 61 words) · warm-up

- Question (Find It, tap the sentence): Which line shows Ichabod picturing a move out west?
  - Key words highlighted: out west
  - Proof sentence: "Nay, his busy fancy already realized his hopes, and presented to him the blooming Katrina, with a whole family of children, mounted on the top of a wagon loaded with household trumpery, with pots and kettles dangling beneath; and he beheld himself bestriding a pacing mare, with a colt at her heels, setting out for Kentucky, Tennessee,--or the Lord knows where!"
  - Hint: Look for faraway places he might ride off to.
  - Why: He sees himself setting out for Kentucky, Tennessee, or the Lord knows where.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line shows how they would travel on their way west?
  - Key words highlighted: travel
  - Proof sentence: "Nay, his busy fancy already realized his hopes, and presented to him the blooming Katrina, with a whole family of children, mounted on the top of a wagon loaded with household trumpery, with pots and kettles dangling beneath; and he beheld himself bestriding a pacing mare, with a colt at her heels, setting out for Kentucky, Tennessee,--or the Lord knows where!"
  - Hint: Look for a wagon and a horse.
  - Why: Katrina and the children ride on a loaded wagon while Ichabod bestrides a pacing mare.
  - Standards: ELA.K12.EE.1.1
- Discovery (vocabulary): "household trumpery". Trumpery: odds and ends of little value, here all their household stuff.

**Chunk 3** (¶26 sentences 1 to 3; 72 words)

- Question (Word Detective, two-part evidence): In this chunk, what does piazza mean?
  - Key words highlighted: piazza
  - Choices: A covered porch along the front of the house ✓ / A large wooden bowl of fresh fruit / A barn used for storing the year's whole harvest
  - Proof sentence: "Under this were hung flails, harness, various utensils of husbandry, and nets for fishing in the neighboring river."
  - Hint: What hangs under it?
  - Why: Flails, harness and fishing nets were hung under it: a covered porch along the front.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Bank question (Word Detective, two-part evidence): What does husbandry mean in this chunk?
  - Key words highlighted: husbandry
  - Choices: Farming and the care of the land ✓ / Being a good husband to a wife / Saving money for hard times
  - Part B: tap the clue words that show the meaning (any one): "flails", "harness", "nets for fishing"
  - Proof sentence: "Under this were hung flails, harness, various utensils of husbandry, and nets for fishing in the neighboring river."
  - Hint: Look at the other tools hung up beside them.
  - Why: Flails, harness and fishing nets hang with them: husbandry means farming.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Discovery (vocabulary): "utensils of husbandry". Husbandry: farming. These are farm tools.

**Chunk 4** (¶26 sentences 4 to 6; 69 words) · surprise double points

- Question (Shades of Meaning, two-part evidence): Why does the narrator call him the wondering Ichabod instead of just Ichabod?
  - Key words highlighted: wondering
  - Choices: It shows he is amazed by everything he sees ✓ / It shows he is lost and cannot find the hall / It shows he suspects the family of something
  - Proof sentence: "Here rows of resplendent pewter, ranged on a long dresser, dazzled his eyes."
  - Hint: What happens to his eyes when he steps inside?
  - Why: The pewter dazzles his eyes: he is full of wonder at everything in the house.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Bank question (Shades of Meaning, two-part evidence): Why might the narrator call the pewter "resplendent" rather than simply clean?
  - Key words highlighted: resplendent
  - Choices: It is old and dented, and dull to look at / It is far too heavy for anyone to lift / It shines so brightly it dazzles him ✓
  - Part B: tap the clue words that show the meaning (any one): "dazzled his eyes"
  - Proof sentence: "Here rows of resplendent pewter, ranged on a long dresser, dazzled his eyes."
  - Hint: What does the pewter do to his eyes?
  - Why: The pewter dazzles his eyes: resplendent means brilliantly shining.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: The busy porch leads to a main hall where rows of shining pewter dazzle Ichabod. ✓ / The empty porch leads to a dark hall where Ichabod trips over broken dishes. / The busy porch leads to a kitchen where Ichabod is put straight to work churning.
- Discovery (vocabulary): "a churn". A churn turns cream into butter.

**Chunk 5** (¶26 sentences 7 to 7; 129 words) · checkpoint after this chunk, then the burst

- Question (Weigh the Evidence, drag and drop: Build the case): Build the case that the Van Tassels like visitors to see their riches.
  - Slots: Claim / Proof sentence / Reason
  - Piece: The Van Tassels like visitors to see their riches → Claim
  - Piece: "a corner cupboard, knowingly left open, displayed immense treasures of old silver and well-mended china" → Proof sentence (backed by "In one corner stood a huge bag of wool, ready to be spun; in another, a quantity of linsey…")
  - Piece: The cupboard is left open on purpose, so guests can admire what is inside → Reason (backed by "In one corner stood a huge bag of wool, ready to be spun; in another, a quantity of linsey…")
  - Piece: A huge bag of wool stands ready to be spun → belongs nowhere
  - Hint: Which detail shows something displayed on purpose?
  - Why: The cupboard is "knowingly left open" to display the silver and china; the bag of wool shows work, not showing off.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Bank question (Weigh the Evidence, two-part evidence): Which detail most strongly supports the claim that this rich household also works hard?
  - Key words highlighted: works hard
  - Choices: Cloth sits in a corner fresh from the loom ✓ / The mahogany tables gleam like mirrors / Shells decorate the parlor mantelpiece
  - Proof sentence: "In one corner stood a huge bag of wool, ready to be spun; in another, a quantity of linsey-woolsey just from the loom; ears of Indian corn, and strings of dried apples and peaches, hung in gay festoons along the walls, mingled with the gaud of red peppers; and a door left ajar gave him a peep into the best parlor, where the claw-footed chairs and dark mahogany tables shone like mirrors; andirons, with their accompanying shovel and tongs, glistened from their covert of asparagus tops; mock-oranges and conch-shells decorated the mantelpiece; strings of various-colored birds eggs were suspended above it; a great ostrich egg was hung from the centre of the room, and a corner cupboard, knowingly left open, displayed immense treasures of old silver and well-mended china."
  - Hint: Which detail shows a job just finished?
  - Why: Linsey-woolsey just from the loom and wool ready to be spun show the family at work; the tables and shells only show comfort.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Discovery (vocabulary): "gay festoons". Festoons: decorations hung in loops along the walls.

**Chunk 6** (¶27 sentences 1 to 2; 138 words)

- Question (Whose Eyes?, two-part evidence): What point is the narrator making by bringing up heroes from old romances?
  - Key words highlighted: old romances
  - Choices: To joke that real rivals are harder than dragons ✓ / To show that Ichabod once fought in a real war / To prove that Katrina loves tales of knights
  - Proof sentence: "In this enterprise, however, he had more real difficulties than generally fell to the lot of a knight-errant of yore, who seldom had anything but giants, enchanters, fiery dragons, and such like easily conquered adversaries, to contend with and had to make his way merely through gates of iron and brass, and walls of adamant to the castle keep, where the lady of his heart was confined; all which he achieved as easily as a man would carve his way to the centre of a Christmas pie; and then the lady gave him her hand as a matter of course."
  - Hint: How hard were the knights' battles, according to him?
  - Why: Giants and dragons were "easily conquered adversaries": he jokes that Ichabod's task is harder.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Bank question (Whose Eyes?, two-part evidence): What is the narrator's tone when he calls dragons "easily conquered adversaries"?
  - Key words highlighted: tone
  - Choices: Fearful and grim / Playful and mocking ✓ / Serious and respectful
  - Proof sentence: "In this enterprise, however, he had more real difficulties than generally fell to the lot of a knight-errant of yore, who seldom had anything but giants, enchanters, fiery dragons, and such like easily conquered adversaries, to contend with and had to make his way merely through gates of iron and brass, and walls of adamant to the castle keep, where the lady of his heart was confined; all which he achieved as easily as a man would carve his way to the centre of a Christmas pie; and then the lady gave him her hand as a matter of course."
  - Hint: Are dragons really easy to beat?
  - Why: Calling dragons easy, like carving a Christmas pie, is a playful joke at the old romances.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Discovery (vocabulary): "walls of adamant". Adamant: an imaginary stone too hard to break.

**Chunk 7** (¶27 sentences 3 to 3; 80 words) · the boss (double points)

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what this chunk suggests about everyday life compared with old tales of heroes.
  - A strong answer: Everyday life can be harder than old tales of heroes, because real people and real rivals cause more trouble than any dragon.
  - Key ideas (one from each group): real, actual, everyday, life, people | hard, difficult, trouble, complicat, struggle, tougher, more than, messier
  - Proof sentence: "Ichabod, on the contrary, had to win his way to the heart of a country coquette, beset with a labyrinth of whims and caprices, which were forever presenting new difficulties and impediments; and he had to encounter a host of fearful adversaries of real flesh and blood, the numerous rustic admirers, who beset every portal to her heart, keeping a watchful and angry eye upon each other, but ready to fly out in the common cause against any new competitor."
  - Hint: What does Ichabod face instead of dragons?
  - Why: Instead of easily beaten giants, he faces a whimsical coquette and real rivals of flesh and blood: real life is harder than the romances.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using your own words, tell in one sentence what this chunk suggests about winning someone's love.
  - A strong answer: Winning someone's love is hard when that person keeps changing and many others want the same thing.
  - Key ideas (one from each group): love, win, court, affection, someone | hard, difficult, change, whim, rival, compet, others, trouble, patience
  - Proof sentence: "Ichabod, on the contrary, had to win his way to the heart of a country coquette, beset with a labyrinth of whims and caprices, which were forever presenting new difficulties and impediments; and he had to encounter a host of fearful adversaries of real flesh and blood, the numerous rustic admirers, who beset every portal to her heart, keeping a watchful and angry eye upon each other, but ready to fly out in the common cause against any new competitor."
  - Hint: Think about Katrina's whims and the rivals at every door.
  - Why: A labyrinth of whims and a host of angry rivals stand in his way: love is hard to win.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: Katrina's changing moods and a crowd of jealous rivals stand between Ichabod and her heart. ✓ / Katrina's steady kindness and her father's blessing make Ichabod's path easy. / Katrina's strict father and a locked iron gate keep every suitor far away from her.
- Discovery (figurative): "every portal to her heart". Portal: a door. Her admirers guard every door to her heart.

**Chunk 8** (¶28 sentences 1 to 3; 88 words)

- Question (Find It, tap the sentence): Which line explains why folks call him Brom Bones?
  - Key words highlighted: call him
  - Proof sentence: "From his Herculean frame and great powers of limb he had received the nickname of BROM BONES, by which he was universally known."
  - Hint: Look for what his body is like.
  - Why: From his Herculean frame and great powers of limb he got the nickname Brom Bones.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line describes Brom's looks and his mood?
  - Key words highlighted: looks
  - Proof sentence: "He was broad-shouldered and double-jointed, with short curly black hair, and a bluff but not unpleasant countenance, having a mingled air of fun and arrogance."
  - Hint: Look for his hair, his shoulders and his face.
  - Why: Broad-shouldered, curly-haired, with a mingled air of fun and arrogance.
  - Standards: ELA.K12.EE.1.1
- Discovery (vocabulary): "roystering blade". A roystering blade: a loud, rowdy young man who loves a good time.

**Chunk 9** (¶28 sentences 4 to 5; 67 words) · the twist

- Question (Catch the Lie, tap the sentence): Hans Van Ripper sizes up Brom Bones. One thing he says is false. Tap the line that proves it.
  - Key words highlighted: false
  - Testimony (Hans Van Ripper): "Brom? He can barely stay in the saddle. I've seen him tumble off at a trot."
  - Proof sentence: "He was famed for great knowledge and skill in horsemanship, being as dexterous on horseback as a Tartar."
  - Hint: Check what the story says about his riding.
  - Why: He was famed for skill in horsemanship, as dexterous on horseback as a Tartar.
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Katrina has her own story about Brom. One detail is untrue. Tap the sentence that shows it.
  - Testimony (Katrina Van Tassel): "At the races Brom always hung back and let the other young men win."
  - Proof sentence: "He was foremost at all races and cock fights; and, with the ascendancy which bodily strength always acquires in rustic life, was the umpire in all disputes, setting his hat on one side, and giving his decisions with an air and tone that admitted of no gainsay or appeal."
  - Hint: Where was Brom at every race?
  - Why: He was foremost at all races and cock fights, not hanging back.
  - Standards: ELA.K12.EE.1.1
- Discovery (figurative): "as dexterous on horseback as a Tartar". A simile: he rides as skillfully as the famous horsemen of Central Asia.

**Chunk 10** (¶28 sentences 6 to 7; 70 words)

- Question (Character Clue, drag and drop: Match the character): Match each description to Brom or to his band of friends.
  - Slots: Brom / His three or four friends
  - Piece: Always ready for a fight or a frolic → Brom (backed by "He was always ready for either a fight or a frolic; but had more mischief than ill-will in…")
  - Piece: Has more mischief than ill-will in him → Brom (backed by "He was always ready for either a fight or a frolic; but had more mischief than ill-will in…")
  - Piece: Look up to him as their model → His three or four friends (backed by "He had three or four boon companions, who regarded him as their model, and at the head of …")
  - Piece: Ride behind him to every feud or party → His three or four friends (backed by "He had three or four boon companions, who regarded him as their model, and at the head of …")
  - Hint: One person leads; the others follow and admire.
  - Why: Brom is ready for a fight or a frolic and full of mischief; his boon companions regard him as their model and follow him everywhere.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Bank question (Character Clue, two-part evidence): What mix of traits does the narrator give Brom?
  - Key words highlighted: mix of traits
  - Choices: Quiet and gentle, keeping to himself / Rough, but more playful than cruel ✓ / Cruel, wanting to hurt everyone he meets
  - Proof sentence: "He was always ready for either a fight or a frolic; but had more mischief than ill-will in his composition; and with all his overbearing roughness, there was a strong dash of waggish good humor at bottom."
  - Hint: What lies at the bottom of all his roughness?
  - Why: With all his overbearing roughness, there is a strong dash of waggish good humor at bottom.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Brom loves fights and fun, but means mischief more than harm, and his friends follow him everywhere. ✓ / Brom hates fights and fun, so he stays home alone and avoids his neighbors. / Brom means real harm to everyone he meets, and even his own friends are terrified of him.
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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 5; level 2: chunks 6 to 10. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 4 (10 seconds, recalls chunk 1): What tops Brom's fur cap in cold weather? Answer: "In cold weather he was distinguished by a fur cap, surmounted with a flaunting fox’s tail; and when the folks at a country gathering descried this well-known crest at a distance, whisking about among a squad of hard riders, they always stood by for a squall."
- Lightning beat after chunk 8 (10 seconds, recalls chunk 6): What does Balt love his daughter even more than? Answer: "Balt Van Tassel was an easy indulgent soul; he loved his daughter better even than his pipe, and, like a reasonable man and an excellent father, let her have her way in everything."

**Chunk 1** (¶28 sentences 8 to 9; 100 words) · warm-up

- Question (Find It, tap the sentence): Which line describes what Brom puts on his head in winter?
  - Key words highlighted: on his head
  - Proof sentence: "In cold weather he was distinguished by a fur cap, surmounted with a flaunting fox’s tail; and when the folks at a country gathering descried this well-known crest at a distance, whisking about among a squad of hard riders, they always stood by for a squall."
  - Hint: Look for something furry with a tail.
  - Why: In cold weather he wore a fur cap topped with a flaunting fox's tail.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line shows what the old women say when the riders go by after dark?
  - Key words highlighted: old women
  - Proof sentence: "Sometimes his crew would be heard dashing along past the farmhouses at midnight, with whoop and halloo, like a troop of Don Cossacks; and the old dames, startled out of their sleep, would listen for a moment till the hurry-scurry had clattered by, and then exclaim, “Ay, there goes Brom Bones and his gang!”"
  - Hint: Look for words in quotation marks.
  - Why: Startled from sleep, the old dames exclaim, "Ay, there goes Brom Bones and his gang!"
  - Standards: ELA.K12.EE.1.1
- Gist check: Brom's fox-tail cap is stolen, and his angry gang searches every farm at midnight. / Brom's fox-tail cap warns folks he's coming, and his gang gallops past farms at midnight. ✓ / Brom's tall black hat hides his face, and his gang sleeps quietly every night.
- Discovery (figurative): "like a troop of Don Cossacks". A simile: Brom's gang rides like wild Cossack horsemen.

**Chunk 2** (¶28 sentences 10 to 10, ¶29 sentences 1 to 1; 86 words) · warm-up

- Question (Read Between the Lines, choose two): Which two feelings do the neighbors have toward Brom?
  - Key words highlighted: two feelings
  - Choices (choose 2): They think he is lazy and dull / They are a little afraid of him ✓ / They like and admire him ✓ / They want him to leave the Hollow
  - Hint: Look at the three words for how they look upon him.
  - Why: They look upon him with a mixture of awe, admiration and good-will.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): How might Katrina really feel about Brom?
  - Key words highlighted: really feel
  - Choices: She may like him more than she lets on ✓ / She is afraid of him and avoids him / She has never even met him once
  - Proof sentence: "This rantipole hero had for some time singled out the blooming Katrina for the object of his uncouth gallantries, and though his amorous toyings were something like the gentle caresses and endearments of a bear, yet it was whispered that she did not altogether discourage his hopes."
  - Hint: What was whispered about her and his hopes?
  - Why: It was whispered that she did not altogether discourage his hopes.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Discovery (figurative): "the gentle caresses and endearments of a bear". Brom's clumsy affection is compared to a bear's hug.

**Chunk 3** (¶29 sentences 2 to 2; 68 words) · surprise double points

- Question (Word Detective, two-part evidence): In this chunk, what does sparking mean?
  - Key words highlighted: sparking
  - Choices: Starting a fire in the fireplace / Shoeing a horse at the blacksmith's / Visiting a young woman to court her ✓
  - Part B: tap the clue words that show the meaning (any one): "his master was courting"
  - Proof sentence: "Certain it is, his advances were signals for rival candidates to retire, who felt no inclination to cross a lion in his amours; insomuch, that when his horse was seen tied to Van Tassel’s paling, on a Sunday night, a sure sign that his master was courting, or, as it is termed, “sparking,” within, all other suitors passed by in despair, and carried the war into other quarters."
  - Hint: Find the words just before it that say what Brom is doing inside.
  - Why: "His master was courting, or, as it is termed, sparking": sparking means courting.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Bank question (Word Detective, two-part evidence): What does retire mean in this sentence?
  - Key words highlighted: retire
  - Choices: Stop working because of old age / Go to bed early for the night / Give up and step back ✓
  - Part B: tap the clue words that show the meaning (any one): "passed by in despair", "carried the war into other quarters"
  - Proof sentence: "Certain it is, his advances were signals for rival candidates to retire, who felt no inclination to cross a lion in his amours; insomuch, that when his horse was seen tied to Van Tassel’s paling, on a Sunday night, a sure sign that his master was courting, or, as it is termed, “sparking,” within, all other suitors passed by in despair, and carried the war into other quarters."
  - Hint: What do the other suitors do when they see Brom's horse?
  - Why: The other suitors pass by in despair and court elsewhere: to retire is to give up and withdraw.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Discovery (figurative): "cross a lion in his amours". Rivals won't cross a lion: Brom is too fierce to compete with.

**Chunk 4** (¶30 sentences 1 to 2; 89 words)

- Question (Figure It Out, multiple choice): Read the words "in form and spirit like a supple-jack." What kind of figurative language is this?
  - Key words highlighted: supple-jack
  - Choices: Alliteration: words that begin with the same sound / Simile: Ichabod is compared to a bendy stick using like ✓ / Metaphor: Ichabod is called a tall tree, without using like
  - What does it mean? He snaps and gives up when anyone pushes him / He is stiff and refuses to move at all / He bends under pressure but always springs back ✓
  - Hint: A supple-jack is a springy cane. Look for like.
  - Why: Like a supple-jack he is yielding but tough: he bends but never breaks.
  - Standards: ELA.7.R.3.1
- Bank question (Figure It Out, multiple choice): The narrator adds "though he bent, he never broke." How does that phrase build on the comparison?
  - Key words highlighted: he never broke
  - Choices: Metaphor: it keeps picturing him as a springy cane ✓ / Simile: it adds a new comparison using as / Onomatopoeia: the words copy a snapping sound
  - What does that phrase show about Ichabod? He gives up as soon as he is pushed / He is stronger than Brom in a fight / He always recovers from a setback ✓
  - Hint: A cane bends; does it snap?
  - Why: "Though he bent, he never broke" keeps describing him as a springy cane: knocked down, he pops right back.
  - Standards: ELA.7.R.3.1
- Gist check: Brom is a fearsome rival, so Ichabod quits and leaves the Hollow at once. / Brom is a fearsome rival, but Ichabod bends without breaking and keeps trying. ✓ / Brom is a weak rival, so Ichabod wins Katrina without any effort.
- Discovery (figurative): "carried his head as high as ever". He bounces back with his pride whole.

**Chunk 5** (¶31 sentences 1 to 3; 82 words) · checkpoint after this chunk, then the burst

- Question (Read Between the Lines, two-part evidence): What can you infer about why Ichabod courts Katrina so softly?
  - Key words highlighted: infer
  - Choices: He must keep it secret from her strict father / He knows openly challenging Brom would be dangerous ✓ / He is far too shy to speak to Katrina at all
  - Proof sentence: "To have taken the field openly against his rival would have been madness; for he was not a man to be thwarted in his amours, any more than that stormy lover, Achilles."
  - Hint: What would it be to take the field openly against his rival?
  - Why: Taking the field openly against Brom would have been madness.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): Why doesn't Katrina's family stand between her and Ichabod?
  - Key words highlighted: stand between
  - Choices: They have already promised her to Brom / They have left the valley on a long trip / They let their daughter make her own choices ✓
  - Proof sentence: "Under cover of his character of singing-master, he made frequent visits at the farmhouse; not that he had anything to apprehend from the meddlesome interference of parents, which is so often a stumbling-block in the path of lovers."
  - Hint: Does he have anything to fear from her parents?
  - Why: He has nothing to fear from the meddlesome interference of parents: they leave the choice to her.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Discovery (vocabulary): "that stormy lover, Achilles". Achilles: a fierce Greek hero from Homer's poems who would not be crossed.

**Chunk 6** (¶31 sentences 4 to 5; 74 words)

- Question (Character Clue, drag and drop: Match the character): Match each detail to Balt Van Tassel or to his wife.
  - Slots: Balt / His wife
  - Piece: Loves his daughter better than his pipe → Balt (backed by "Balt Van Tassel was an easy indulgent soul; he loved his daughter better even than his pip…")
  - Piece: Lets her have her way in everything → Balt (backed by "Balt Van Tassel was an easy indulgent soul; he loved his daughter better even than his pip…")
  - Piece: Is busy with the housekeeping and the poultry → His wife (backed by "His notable little wife, too, had enough to do to attend to her housekeeping and manage he…")
  - Piece: Believes girls can take care of themselves → His wife (backed by "His notable little wife, too, had enough to do to attend to her housekeeping and manage he…")
  - Hint: One sentence is about each parent.
  - Why: Balt loves his daughter and indulges her; his wife minds the house and the birds, sure that girls can look after themselves.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Bank question (Character Clue, two-part evidence): Which trait fits the head of the Van Tassel household?
  - Key words highlighted: head of the Van Tassel household
  - Choices: Strict and watchful, guarding her every move / Cold and distant, ignoring his own wife and daughter / Easygoing and generous, letting her do as she likes ✓
  - Proof sentence: "Balt Van Tassel was an easy indulgent soul; he loved his daughter better even than his pipe, and, like a reasonable man and an excellent father, let her have her way in everything."
  - Hint: How does he treat his daughter's wishes?
  - Why: He is an easy, indulgent soul who lets her have her way in everything.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Discovery (vocabulary): "sagely observed". Sagely: wisely, though the narrator is joking.

**Chunk 7** (¶31 sentences 6 to 7; 95 words) · the twist

- Question (Catch the Lie, tap the sentence): Brom Bones describes the schoolmaster's calls. One thing he says is false. Tap the line that proves it.
  - Key words highlighted: false
  - Testimony (Brom Bones): "The schoolmaster only ever saw her indoors, with the old folks keeping an eye on him from across the room."
  - Proof sentence: "In the mean time, Ichabod would carry on his suit with the daughter by the side of the spring under the great elm, or sauntering along in the twilight, that hour so favorable to the lover’s eloquence."
  - Hint: Where did Ichabod and Katrina actually talk?
  - Why: He courted her by the spring under the great elm, or sauntering in the twilight.
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Hans Van Ripper recalls the Van Tassel farm. One detail is untrue. Tap the sentence that shows it.
  - Testimony (Hans Van Ripper): "Old Balt never took his eyes off his daughter. He watched every minute of that courting."
  - Proof sentence: "Thus, while the busy dame bustled about the house, or plied her spinning-wheel at one end of the piazza, honest Balt would sit smoking his evening pipe at the other, watching the achievements of a little wooden warrior, who, armed with a sword in each hand, was most valiantly fighting the wind on the pinnacle of the barn."
  - Hint: What was Balt watching while he smoked?
  - Why: Balt sat smoking his pipe, watching the little wooden warrior fight the wind on top of the barn.
  - Standards: ELA.K12.EE.1.1
- Gist check: While her parents watch closely, Ichabod sits silently in the parlor with Katrina. / While her parents are away in town, Ichabod repairs the leaking barn roof for Katrina. / While her parents keep busy, Ichabod courts Katrina by the spring and on twilight walks. ✓
- Discovery (figurative): "a little wooden warrior". A weathervane soldier fighting the wind on the barn roof.

**Chunk 8** (¶32 sentences 1 to 5; 115 words)

- Question (Whose Eyes?, two-part evidence): What does the narrator admit about himself here?
  - Key words highlighted: admit
  - Choices: He is an expert at winning hearts / He once married Katrina himself, long ago / He doesn't understand how hearts are won ✓
  - Proof sentence: "I profess not to know how women’s hearts are wooed and won."
  - Hint: Read his very first sentence.
  - Why: He professes not to know how women's hearts are wooed and won.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Bank question (Whose Eyes?, two-part evidence): The narrator talks of battling "at every door and window." What does he suggest about keeping a coquette's heart?
  - Key words highlighted: every door and window
  - Choices: It needs real soldiers to guard it / It is a constant fight to hold on to it ✓ / It is easy once she says yes
  - Proof sentence: "It is a great triumph of skill to gain the former, but a still greater proof of generalship to maintain possession of the latter, for man must battle for his fortress at every door and window."
  - Hint: Is the battle won once, or fought again and again?
  - Why: A man "must battle for his fortress at every door and window": keeping a coquette's heart is a never-ending fight.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Discovery (figurative): "matters of riddle and admiration". Hearts are a riddle to him: puzzling and amazing.

**Chunk 9** (¶32 sentences 6 to 6; 56 words) · the boss (double points)

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what the rivalry over Katrina suggests about competition among people.
  - A strong answer: Competition for the same prize can turn people into bitter enemies, even when it starts quietly.
  - Key ideas (one from each group): compet, rival, contest, both want, same, jealous | enem, feud, hate, bitter, conflict, fight, hostil, divide, anger
  - Proof sentence: "Certain it is, this was not the case with the redoubtable Brom Bones; and from the moment Ichabod Crane made his advances, the interests of the former evidently declined: his horse was no longer seen tied to the palings on Sunday nights, and a deadly feud gradually arose between him and the preceptor of Sleepy Hollow."
  - Hint: What grows between the two men?
  - Why: As Ichabod advances, a deadly feud gradually arises: competing for the same person turns rivals into enemies.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using your own words, tell in one sentence what this chunk suggests about how jealousy changes people.
  - A strong answer: Jealousy can turn a quiet rivalry into a deadly feud between people who want the same thing.
  - Key ideas (one from each group): jealous, envy, rival, compet | feud, enem, hate, bitter, change, turn, fight, anger, deadly
  - Proof sentence: "Certain it is, this was not the case with the redoubtable Brom Bones; and from the moment Ichabod Crane made his advances, the interests of the former evidently declined: his horse was no longer seen tied to the palings on Sunday nights, and a deadly feud gradually arose between him and the preceptor of Sleepy Hollow."
  - Hint: How does Brom's interest change, and what grows instead?
  - Why: Brom's horse stops appearing on Sunday nights and a deadly feud arises: jealousy turns rivals bitter.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Discovery (vocabulary): "preceptor of Sleepy Hollow". Preceptor: a teacher. A fancy title for Ichabod.

**Chunk 10** (¶33 sentences 1 to 1; 96 words)

- Question (Story Order, drag and drop: Cause and effect): Connect each cause to what happens between the rivals.
  - Slots: Brom's rough sense of honor / Ichabod knows Brom is far stronger / Ichabod overhears Brom's boast
  - Piece: Brom wants to settle it in single combat → Brom's rough sense of honor (backed by "Brom, who had a degree of rough chivalry in his nature, would fain have carried matters to…")
  - Piece: Ichabod will not agree to a duel → Ichabod knows Brom is far stronger (backed by "Brom, who had a degree of rough chivalry in his nature, would fain have carried matters to…")
  - Piece: Ichabod is careful never to give him a chance → Ichabod overhears Brom's boast (backed by "Brom, who had a degree of rough chivalry in his nature, would fain have carried matters to…")
  - Hint: Read the long sentence for each reason and what follows from it.
  - Why: Brom's rough chivalry wants single combat; Ichabod, knowing Brom's might, won't fight; having heard the boast, he never gives him an opening.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Bank question (Story Order, two-part evidence): Why does the quarrel never come to blows?
  - Key words highlighted: come to blows
  - Choices: Ichabod is too wary to give Brom a chance ✓ / The parson forbids any fighting in the Hollow / Katrina makes the two of them shake hands
  - Proof sentence: "Brom, who had a degree of rough chivalry in his nature, would fain have carried matters to open warfare and have settled their pretensions to the lady, according to the mode of those most concise and simple reasoners, the knights-errant of yore,--by single combat; but Ichabod was too conscious of the superior might of his adversary to enter the lists against him; he had overheard a boast of Bones, that he would “double the schoolmaster up, and lay him on a shelf of his own schoolhouse;” and he was too wary to give him an opportunity."
  - Hint: What does Brom want, and what does Ichabod do about it?
  - Why: Brom would settle it by single combat, but Ichabod is too wary to give him the opportunity.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Gist check: Brom wants to make peace, but Ichabod insists on settling things with a fight. / Brom wants to settle things with a fight, but Ichabod is too careful to give him the chance. ✓ / Brom wants to settle things with a horse race, and Ichabod eagerly agrees to ride Gunpowder.
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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 5; level 2: chunks 6 to 10. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 4 (10 seconds, recalls chunk 2): How did the gang smoke out the singing school? Answer: "They harried his hitherto peaceful domains; smoked out his singing school by stopping up the chimney; broke into the schoolhouse at night, in spite of its formidable fastenings of withe and window stakes, and turned everything topsy-turvy, so that the poor schoolmaster began to think all the witches in the country held their meetings there."
- Lightning beat after chunk 8 (10 seconds, recalls chunk 6): How much earlier than usual was the school let out? Answer: "Books were flung aside without being put away on the shelves, inkstands were overturned, benches thrown down, and the whole school was turned loose an hour before the usual time, bursting forth like a legion of young imps, yelping and racketing about the green in joy at their early emancipation."

**Chunk 1** (¶33 sentences 2 to 3; 52 words) · warm-up

- Question (Find It, tap the sentence): Which line shows how Brom fights back without his fists?
  - Key words highlighted: without his fists
  - Proof sentence: "There was something extremely provoking in this obstinately pacific system; it left Brom no alternative but to draw upon the funds of rustic waggery in his disposition, and to play off boorish practical jokes upon his rival."
  - Hint: Look for what Brom turns to when there's no fight.
  - Why: With no other choice, he plays boorish practical jokes on his rival.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line shows who Brom's pranks are aimed at?
  - Key words highlighted: aimed at
  - Proof sentence: "Ichabod became the object of whimsical persecution to Bones and his gang of rough riders."
  - Hint: Look for the word persecution.
  - Why: Ichabod became the object of whimsical persecution to Bones and his gang of rough riders.
  - Standards: ELA.K12.EE.1.1
- Gist check: Since Ichabod wants to fight, Brom hides from him at the Van Tassel farm for weeks. / Since Ichabod won't fight, Brom and his gang torment him with rough practical jokes. ✓ / Since Ichabod won't fight, Brom leaves him alone and finds a new sweetheart.
- Discovery (vocabulary): "rustic waggery". Waggery: mischievous joking. Brom's country-style pranks.

**Chunk 2** (¶33 sentences 4 to 5; 102 words) · warm-up

- Question (Weigh the Evidence, two-part evidence): Which detail best supports the claim that Brom wants to shame Ichabod in front of Katrina?
  - Key words highlighted: in front of Katrina
  - Choices: He stops up the singing school chimney / He breaks into the schoolhouse at night / He mocks Ichabod whenever she is there ✓
  - Proof sentence: "But what was still more annoying, Brom took all opportunities of turning him into ridicule in presence of his mistress, and had a scoundrel dog whom he taught to whine in the most ludicrous manner, and introduced as a rival of Ichabod’s, to instruct her in psalmody."
  - Hint: Which prank happens when she is present?
  - Why: Brom takes every chance to ridicule him "in presence of his mistress"; the other pranks happen when she isn't there.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Bank question (Weigh the Evidence, two-part evidence): What evidence suggests the pranks fill Ichabod's head with the supernatural?
  - Key words highlighted: supernatural
  - Choices: He hears a dog whining like a singer / He suspects witches meet in his school ✓ / He finds his singing school full of smoke
  - Proof sentence: "They harried his hitherto peaceful domains; smoked out his singing school by stopping up the chimney; broke into the schoolhouse at night, in spite of its formidable fastenings of withe and window stakes, and turned everything topsy-turvy, so that the poor schoolmaster began to think all the witches in the country held their meetings there."
  - Hint: What does he begin to think after the break-in?
  - Why: After everything is turned topsy-turvy, he begins to think all the witches in the country held their meetings there.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Discovery (figurative): "scoundrel dog". Brom teaches his dog to whine so it can play a fake singing teacher.

**Chunk 3** (¶34 sentences 1 to 3; 116 words) · surprise double points

- Question (Figure It Out, multiple choice): Read the words "that sceptre of despotic power." What kind of figurative language is this?
  - Key words highlighted: sceptre
  - Choices: Simile: his ruler is compared to a sceptre using as / Onomatopoeia: the words copy a sound / Metaphor: his ruler is called a king's sceptre ✓
  - What does it mean? Ichabod rules his classroom like a stern king ✓ / Ichabod carries a real golden sceptre to class / Ichabod is afraid of his own students
  - Hint: Who usually holds a sceptre? Is the ruler really one?
  - Why: The ruler is called a sceptre: Ichabod rules his little classroom like a stern king.
  - Standards: ELA.7.R.3.1
- Bank question (Figure It Out, multiple choice): The switch is called "the birch of justice." Which device is this?
  - Key words highlighted: birch of justice
  - Choices: Alliteration: the words share a first sound / Metaphor: the switch is treated as a judge's tool ✓ / Simile: the switch is compared using like
  - What does it suggest about the classroom? The birch tree outside is very old / Ichabod plays a judge punishing wrongdoers ✓ / The class holds real trials every afternoon
  - Hint: Where does justice usually happen?
  - Why: The switch becomes a tool of justice, a constant terror to evil doers: Ichabod plays judge over his pupils.
  - Standards: ELA.7.R.3.1
- Discovery (vocabulary): "contraband articles". Contraband: forbidden items, here toys taken from students.

**Chunk 4** (¶34 sentences 4 to 5; 90 words)

- Question (Read Between the Lines, choose two): Which two clues suggest someone was just punished?
  - Key words highlighted: just punished
  - Choices (choose 2): A broken switch lies on the classroom floor / Ichabod is laughing out loud at his desk / Every pupil is suddenly hard at work on a book ✓ / Some pupils keep one eye fixed on the master ✓
  - Hint: How are the pupils behaving, and who are they watching?
  - Why: The scholars are busily intent on their books or whispering with one eye on the master: an appalling act of justice has just happened.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): How do the pupils seem to feel this afternoon?
  - Key words highlighted: seem to feel
  - Choices: Excited about a coming holiday / Nervous, as if afraid of trouble ✓ / Bored and sleepy after lunch
  - Proof sentence: "Apparently there had been some appalling act of justice recently inflicted, for his scholars were all busily intent upon their books, or slyly whispering behind them with one eye kept upon the master; and a kind of buzzing stillness reigned throughout the schoolroom."
  - Hint: Where do they keep one eye?
  - Why: They stay busy or whisper with one eye on the master: they are wary of more punishment.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The class runs outside to play until Brom Bones rides up to the school. / The class sits in nervous quiet until a rider arrives at the school. ✓ / The class bursts into song until the parson arrives at the school.
- Discovery (figurative): "buzzing stillness". Buzzing stillness: a quiet full of tiny whispers.

**Chunk 5** (¶34 sentences 6 to 6, ¶35 sentences 1 to 1; 90 words) · checkpoint after this chunk, then the burst

- Question (Find It, tap the sentence): Which line describes the sudden change once the news arrives?
  - Key words highlighted: sudden change
  - Proof sentence: "All was now bustle and hubbub in the late quiet schoolroom."
  - Hint: Look for the noise that replaces the quiet.
  - Why: All was now bustle and hubbub in the late quiet schoolroom.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line shows the room had been calm only moments before?
  - Key words highlighted: calm
  - Proof sentence: "All was now bustle and hubbub in the late quiet schoolroom."
  - Hint: Look for the word late.
  - Why: Bustle and hubbub fill "the late quiet schoolroom": it had just been still.
  - Standards: ELA.K12.EE.1.1
- Discovery (vocabulary): "quilting frolic". Quilting frolic: a party where neighbors gather, often with music and dancing.

**Chunk 6** (¶35 sentences 2 to 3; 96 words)

- Question (Story Order, drag and drop: Put events in order): Put the end of the school day in the order it happens.
  - Slots: First / Next / Then / Last
  - Piece: Lessons are rushed through, skipping trifles → First (backed by "The scholars were hurried through their lessons without stopping at trifles; those who wer…")
  - Piece: Books are flung aside and inkstands tipped over → Next (backed by "Books were flung aside without being put away on the shelves, inkstands were overturned, b…")
  - Piece: The school is let out an hour early → Then (backed by "Books were flung aside without being put away on the shelves, inkstands were overturned, b…")
  - Piece: The children race yelping about the green → Last (backed by "Books were flung aside without being put away on the shelves, inkstands were overturned, b…")
  - Hint: Follow the two sentences from start to finish.
  - Why: The lessons are hurried, books and benches go flying, the school is turned loose early, and the children burst out onto the green.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Bank question (Story Order, two-part evidence): Why do the slow pupils get "a smart application now and then in the rear"?
  - Key words highlighted: slow pupils
  - Choices: To punish a stolen apple / To wake them from a nap / To make them finish faster ✓
  - Proof sentence: "The scholars were hurried through their lessons without stopping at trifles; those who were nimble skipped over half with impunity, and those who were tardy had a smart application now and then in the rear, to quicken their speed or help them over a tall word."
  - Hint: Read to the end of that sentence.
  - Why: The smacks are meant "to quicken their speed or help them over a tall word": Ichabod wants the lessons over.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Discovery (figurative): "like a legion of young imps". A simile: the freed children burst out like a crowd of little devils.

**Chunk 7** (¶36 sentences 1 to 2; 95 words) · the twist

- Question (Catch the Lie, tap the sentence): Hans Van Ripper talks about the schoolmaster's ride. Part of what he says is false. Tap the sentence that proves it.
  - Testimony (Hans Van Ripper): "I never lent that schoolmaster anything, least of all one of my horses."
  - Proof sentence: "That he might make his appearance before his mistress in the true style of a cavalier, he borrowed a horse from the farmer with whom he was domiciliated, a choleric old Dutchman of the name of Hans Van Ripper, and, thus gallantly mounted, issued forth like a knight-errant in quest of adventures."
  - Hint: Whose horse does Ichabod borrow?
  - Why: Ichabod borrowed a horse from the farmer he lodged with, Hans Van Ripper himself.
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Brom Bones mocks the schoolmaster's preparations. One detail is untrue. Tap the sentence that shows it.
  - Testimony (Brom Bones): "He set off just as he was. He didn't so much as comb his hair."
  - Proof sentence: "The gallant Ichabod now spent at least an extra half hour at his toilet, brushing and furbishing up his best, and indeed only suit of rusty black, and arranging his locks by a bit of broken looking-glass that hung up in the schoolhouse."
  - Hint: How long did he spend getting ready?
  - Why: He spent an extra half hour brushing his suit and arranging his locks in a broken looking-glass.
  - Standards: ELA.K12.EE.1.1
- Gist check: Ichabod buys a fine new suit and a fast horse in town to ride to the party. / Ichabod refuses to dress up and walks all the way to the party in his dusty work clothes. / Ichabod grooms his one shabby suit and borrows a horse from Hans Van Ripper to ride to the party. ✓
- Discovery (figurative): "issued forth like a knight-errant". A simile: Ichabod rides out like a knight in an old romance, with mock grandeur.

**Chunk 8** (¶36 sentences 3 to 5; 92 words)

- Question (Shades of Meaning, drag and drop: Feeling of the word): Sort each detail about the horse: does it make him seem worn out, or still fierce?
  - Slots: Worn out / Still fierce
  - Piece: A broken-down plow-horse → Worn out (backed by "The animal he bestrode was a broken-down plow-horse, that had outlived almost everything b…")
  - Piece: Gaunt and shaggy, with a ewe neck → Worn out (backed by "He was gaunt and shagged, with a ewe neck, and a head like a hammer; his rusty mane and ta…")
  - Piece: A mane knotted with burs → Worn out (backed by "He was gaunt and shagged, with a ewe neck, and a head like a hammer; his rusty mane and ta…")
  - Piece: Outlived everything but its viciousness → Still fierce (backed by "The animal he bestrode was a broken-down plow-horse, that had outlived almost everything b…")
  - Piece: One eye with the gleam of a devil → Still fierce (backed by "He was gaunt and shagged, with a ewe neck, and a head like a hammer; his rusty mane and ta…")
  - Hint: Which details show age, and which show a temper?
  - Why: He is broken-down, gaunt and burred, yet he keeps his viciousness and a devilish gleam in one eye.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Bank question (Shades of Meaning, two-part evidence): Why might the narrator call one eye "glaring and spectral" rather than just blind?
  - Key words highlighted: glaring and spectral
  - Choices: It shows the horse is calm and gentle / It means the horse can see in the dark / It makes the horse look ghostly and wild ✓
  - Part B: tap the clue words that show the meaning (any one): "gleam of a genuine devil"
  - Proof sentence: "He was gaunt and shagged, with a ewe neck, and a head like a hammer; his rusty mane and tail were tangled and knotted with burs; one eye had lost its pupil, and was glaring and spectral, but the other had the gleam of a genuine devil in it."
  - Hint: What is in his other eye?
  - Why: Next to "the gleam of a genuine devil," a glaring, spectral eye makes the horse look ghostly and wild.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Discovery (figurative): "a head like a hammer". A simile: the horse's head is long and blocky like a hammer.

**Chunk 9** (¶36 sentences 6 to 7; 79 words)

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what the old horse suggests about judging by appearances.
  - A strong answer: Appearances can fool us, since something that looks old and worn out may still have plenty of fire inside.
  - Key ideas (one from each group): appear, look, seem, outside, judge, cover | fool, deceiv, mislead, wrong, inside, really, hidden, still, fire, spirit
  - Proof sentence: "He had, in fact, been a favorite steed of his master’s, the choleric Van Ripper, who was a furious rider, and had infused, very probably, some of his own spirit into the animal; for, old and broken-down as he looked, there was more of the lurking devil in him than in any young filly in the country."
  - Hint: Notice the words "old and broken-down as he looked."
  - Why: Old and broken-down as he looked, Gunpowder had more lurking devil in him than any young filly: looks can deceive.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using your own words, tell in one sentence what Gunpowder suggests about fire and energy in old age.
  - A strong answer: A fiery spirit can last even when the body grows old and worn.
  - Key ideas (one from each group): spirit, fire, fiery, mettle, devil, energy, wild, temper | old, age, worn, broken, last, remain, still, even, never
  - Proof sentence: "He had, in fact, been a favorite steed of his master’s, the choleric Van Ripper, who was a furious rider, and had infused, very probably, some of his own spirit into the animal; for, old and broken-down as he looked, there was more of the lurking devil in him than in any young filly in the country."
  - Hint: What is still inside the old horse?
  - Why: Old and broken-down, he still has more of the lurking devil in him than any young filly: spirit can outlast age.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Discovery (figurative): "the lurking devil in him". A hidden wild streak, as if a little devil lives inside.

**Chunk 10** (¶37 sentences 1 to 2; 65 words) · the boss (double points)

- Question (Character Clue, two-part evidence): How does Ichabod come across as he rides?
  - Key words highlighted: come across
  - Choices: Awkward and comical, all elbows ✓ / Strong and dashing, a true horseman / Rich and stylish, dressed like a lord
  - Proof sentence: "He rode with short stirrups, which brought his knees nearly up to the pommel of the saddle; his sharp elbows stuck out like grasshoppers’; he carried his whip perpendicularly in his hand, like a sceptre, and as his horse jogged on, the motion of his arms was not unlike the flapping of a pair of wings."
  - Hint: Look at his knees, his elbows and his arms.
  - Why: Knees up to the saddle, elbows like a grasshopper's, arms flapping like wings: he looks awkward and comical.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Bank question (Character Clue, two-part evidence): The narrator calls Ichabod "a suitable figure for such a steed." What does he mean?
  - Key words highlighted: suitable figure
  - Choices: Ichabod is the finest rider in the county / The horse was chosen to fit his height / Rider and horse are equally odd-looking ✓
  - Proof sentence: "Ichabod was a suitable figure for such a steed."
  - Hint: What was the horse like?
  - Why: A gangly rider suits a broken-down horse: the two are an equally odd pair.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Seated in a closed carriage, Ichabod hides from view as the horse trots along. / Perched on short stirrups with flapping elbows, Ichabod looks as odd as his horse. ✓ / Seated tall with steady hands, Ichabod looks like a handsome cavalry officer.
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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 5; level 2: chunks 6 to 10. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 4 (10 seconds, recalls chunk 2): What colors had the frost turned the tender trees? Answer: "The forests had put on their sober brown and yellow, while some trees of the tenderer kind had been nipped by the frosts into brilliant dyes of orange, purple, and scarlet."
- Lightning beat after chunk 7 (10 seconds, recalls chunk 5): Where were the gathered apples going? Answer: "On all sides he beheld vast store of apples; some hanging in oppressive opulence on the trees; some gathered into baskets and barrels for the market; others heaped up in rich piles for the cider-press."

**Chunk 1** (¶37 sentences 3 to 4; 72 words) · warm-up

- Question (Whose Eyes?, two-part evidence): How does the narrator want us to picture Ichabod setting off?
  - Key words highlighted: picture
  - Choices: As a brave knight riding out to win a battle / As a sad figure leaving the Hollow and its people forever / As a ridiculous sight, almost like a ghost by day ✓
  - Proof sentence: "Such was the appearance of Ichabod and his steed as they shambled out of the gate of Hans Van Ripper, and it was altogether such an apparition as is seldom to be met with in broad daylight."
  - Hint: What does the narrator call the pair, and when is such a thing seldom seen?
  - Why: He calls them an apparition seldom met in broad daylight: a joke about how strange they look.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Bank question (Whose Eyes?, two-part evidence): The narrator calls Ichabod's forehead a "scanty strip." What does that show about the narrator's attitude?
  - Key words highlighted: scanty strip
  - Choices: He admires Ichabod's handsome face / He pities Ichabod for being ill / He enjoys poking fun at Ichabod's looks ✓
  - Proof sentence: "A small wool hat rested on the top of his nose, for so his scanty strip of forehead might be called, and the skirts of his black coat fluttered out almost to the horses tail."
  - Hint: Is the description kind or teasing?
  - Why: A hat resting on his nose, since his scanty strip of forehead might be called one: the narrator is teasing.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: With no hat or coat at all, Ichabod and his horse sneak away from the farm late at night. / With his tiny hat and flapping coat, Ichabod and his horse make a strange sight leaving the farm. ✓ / With his tall hat and neat coat, Ichabod and his horse make a fine sight leaving the farm.
- Discovery (figurative): "rested on the top of his nose". The narrator jokes that his forehead is so small the hat sits on his nose.

**Chunk 2** (¶38 sentences 1 to 2; 64 words) · warm-up

- Question (Figure It Out, multiple choice): Read the words "nature wore that rich and golden livery." What kind of figurative language is this?
  - Key words highlighted: golden livery
  - Choices: Simile: nature is compared to gold using like / Hyperbole: the whole countryside is said to be made of real gold / Personification: nature is dressed like a person in golden clothes ✓
  - What does it mean? The trees are hung with real gold coins for the harvest / The autumn countryside glows with rich gold colors ✓ / The farmers wear gold uniforms at harvest
  - Hint: Livery is a uniform. Who wears clothes?
  - Why: Nature is dressed in golden livery like a person: the autumn land glows gold.
  - Standards: ELA.7.R.3.1
- Bank question (Figure It Out, multiple choice): Some trees were "nipped by the frosts." Which device is this?
  - Key words highlighted: nipped
  - Choices: Simile: frost is compared using like / Onomatopoeia: the word copies a sound / Personification: frost bites like a beast ✓
  - What does it show? Farmers have cut the old trees right down / Animals have chewed the green leaves away / The cold has turned the leaves bright colors ✓
  - Hint: What usually nips?
  - Why: The frost nips like a creature with teeth, and the bitten leaves turn orange, purple and scarlet.
  - Standards: ELA.7.R.3.1
- Discovery (figurative): "nipped by the frosts". Frost nips the leaves like a little bite, turning them bright colors.

**Chunk 3** (¶38 sentences 3 to 3, ¶39 sentences 1 to 2; 79 words) · surprise double points

- Question (Read Between the Lines, choose two): Which two signs show that the season is changing?
  - Key words highlighted: season is changing
  - Choices (choose 2): Wild ducks stream high across the sky ✓ / Small birds hold their last big feasts ✓ / Snow already covers the stubble fields / Every tree in the grove has lost its leaves
  - Hint: What are the birds doing, and why now?
  - Why: Wild ducks fly over in streaming files and small birds take their farewell banquets: birds are leaving before winter.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): What do the words "farewell banquets" suggest the small birds will soon do?
  - Key words highlighted: farewell banquets
  - Choices: Fight over the last seeds / Leave for the winter ✓ / Build nests for spring
  - Proof sentence: "The small birds were taking their farewell banquets."
  - Hint: Why would you say farewell?
  - Why: A farewell feast comes before going away: the birds will soon fly south.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Discovery (figurative): "farewell banquets". The birds' last feasts before they fly south for winter.

**Chunk 4** (¶39 sentences 3 to 3; 95 words)

- Question (Shades of Meaning, two-part evidence): Why does the narrator call the blue jay a noisy coxcomb?
  - Key words highlighted: noisy coxcomb
  - Choices: It shows off like a vain, loud dresser ✓ / It is shy and hides among the leaves / It is sick and cannot sing well at all
  - Part B: tap the clue words that show the meaning (any one): "gay light blue coat", "pretending to be on good terms"
  - Proof sentence: "There was the honest cock robin, the favorite game of stripling sportsmen, with its loud querulous note; and the twittering blackbirds flying in sable clouds; and the golden-winged woodpecker with his crimson crest, his broad black gorget, and splendid plumage; and the cedar bird, with its red-tipt wings and yellow-tipt tail and its little monteiro cap of feathers; and the blue jay, that noisy coxcomb, in his gay light blue coat and white underclothes, screaming and chattering, nodding and bobbing and bowing, and pretending to be on good terms with every songster of the grove."
  - Hint: Look at how the jay is dressed and how it behaves.
  - Why: In his gay light blue coat, bowing and pretending to be everyone's friend, the jay is a vain show-off.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Bank question (Shades of Meaning, two-part evidence): Why might the narrator describe the blackbirds as "sable clouds"?
  - Key words highlighted: sable clouds
  - Choices: They bring the rain with them / They fly in dark, thick flocks ✓ / They are made of drifting smoke
  - Part B: tap the clue words that show the meaning (any one): "blackbirds"
  - Proof sentence: "There was the honest cock robin, the favorite game of stripling sportsmen, with its loud querulous note; and the twittering blackbirds flying in sable clouds; and the golden-winged woodpecker with his crimson crest, his broad black gorget, and splendid plumage; and the cedar bird, with its red-tipt wings and yellow-tipt tail and its little monteiro cap of feathers; and the blue jay, that noisy coxcomb, in his gay light blue coat and white underclothes, screaming and chattering, nodding and bobbing and bowing, and pretending to be on good terms with every songster of the grove."
  - Hint: What color are these birds?
  - Why: Sable means black: the blackbirds fly in dark, cloud-like flocks.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: The narrator describes many colorful birds, ending with a showy, chattering blue jay. ✓ / The narrator describes one dull brown bird that sings alone at dawn. / The narrator describes hunters shooting nearly every bird in the grove for supper.
- Discovery (vocabulary): "sable clouds". Sable: black. The blackbirds fly in dark clouds.

**Chunk 5** (¶40 sentences 1 to 2; 61 words) · checkpoint after this chunk, then the burst

- Question (Character Clue, two-part evidence): Which trait shows in what Ichabod notices on his ride?
  - Key words highlighted: trait
  - Choices: Curious about birds, counting every one he sees / Worried about the weather, watching the clouds / Greedy for food, always spotting the next meal ✓
  - Proof sentence: "As Ichabod jogged slowly on his way, his eye, ever open to every symptom of culinary abundance, ranged with delight over the treasures of jolly autumn."
  - Hint: What is his eye always open to?
  - Why: His eye is "ever open to every symptom of culinary abundance": food is what he notices.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Bank question (Character Clue, two-part evidence): What does his unhurried ride suggest about his mood?
  - Key words highlighted: unhurried
  - Choices: He is nervous about being late / He is angry at the borrowed horse / He is relaxed and enjoying himself ✓
  - Proof sentence: "As Ichabod jogged slowly on his way, his eye, ever open to every symptom of culinary abundance, ranged with delight over the treasures of jolly autumn."
  - Hint: How does he feel as he looks around?
  - Why: He jogs slowly while his eye ranges with delight over jolly autumn: he is in no hurry and happy.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Discovery (figurative): "oppressive opulence". So many apples that the branches seem weighed down by riches.

**Chunk 6** (¶40 sentences 3 to 3; 99 words)

- Question (Story Order, drag and drop: Cause and effect): Connect each crop Ichabod sees to the treat it makes him imagine.
  - Slots: Golden ears of Indian corn / Yellow pumpkins in the sun / Fragrant buckwheat fields
  - Piece: Cakes and hasty-pudding → Golden ears of Indian corn (backed by "Farther on he beheld great fields of Indian corn, with its golden ears peeping from their …")
  - Piece: The most luxurious of pies → Yellow pumpkins in the sun (backed by "Farther on he beheld great fields of Indian corn, with its golden ears peeping from their …")
  - Piece: Buttered slapjacks served by Katrina → Fragrant buckwheat fields (backed by "Farther on he beheld great fields of Indian corn, with its golden ears peeping from their …")
  - Hint: Follow the long sentence crop by crop.
  - Why: The corn promises cakes and pudding, the pumpkins pies, and the buckwheat slapjacks from Katrina's dimpled hand.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Bank question (Story Order, two-part evidence): Where does Ichabod's chain of food thoughts end up?
  - Key words highlighted: end up
  - Choices: With Katrina serving him pancakes ✓ / With selling the crops at market / With a feast for the whole school
  - Proof sentence: "Farther on he beheld great fields of Indian corn, with its golden ears peeping from their leafy coverts, and holding out the promise of cakes and hasty-pudding; and the yellow pumpkins lying beneath them, turning up their fair round bellies to the sun, and giving ample prospects of the most luxurious of pies; and anon he passed the fragrant buckwheat fields breathing the odor of the beehive, and as he beheld them, soft anticipations stole over his mind of dainty slapjacks, well buttered, and garnished with honey or treacle, by the delicate little dimpled hand of Katrina Van Tassel."
  - Hint: Whose hand appears at the very end of the sentence?
  - Why: The daydream ends with dainty slapjacks served by the dimpled little hand of Katrina Van Tassel.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Discovery (figurative): "turning up their fair round bellies to the sun". Personification: the pumpkins lie like people sunbathing.

**Chunk 7** (¶41 sentences 1 to 3; 74 words)

- Question (Find It, tap the sentence): Which line shows the river lying perfectly still?
  - Key words highlighted: perfectly still
  - Proof sentence: "The wide bosom of the Tappan Zee lay motionless and glassy, excepting that here and there a gentle undulation waved and prolonged the blue shadow of the distant mountain."
  - Hint: Look at the water.
  - Why: The wide bosom of the Tappan Zee lay motionless and glassy.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line shows evening coming on?
  - Key words highlighted: evening coming on
  - Proof sentence: "The sun gradually wheeled his broad disk down in the west."
  - Hint: Look to the west.
  - Why: The sun gradually wheeled his broad disk down in the west.
  - Standards: ELA.K12.EE.1.1
- Gist check: Lost in fearful thoughts, Ichabod rides through a storm as waves crash on the Hudson. / Lost in his witchcraft books, Ichabod rides past the Hudson without looking up once. / Lost in sweet daydreams, Ichabod rides above the Hudson as the sun sets over still water. ✓
- Discovery (figurative): "sugared suppositions". Sweet daydreams, as if his thoughts were candy.

**Chunk 8** (¶41 sentences 4 to 7; 115 words) · the twist

- Question (Catch the Lie, tap the sentence): Brom Bones remembers that evening. One thing he says is false. Tap the line that proves it.
  - Key words highlighted: false
  - Testimony (Brom Bones): "That evening was a wild one. The wind whipped the river into whitecaps the whole way."
  - Proof sentence: "A few amber clouds floated in the sky, without a breath of air to move them."
  - Proof sentence: "A sloop was loitering in the distance, dropping slowly down with the tide, her sail hanging uselessly against the mast; and as the reflection of the sky gleamed along the still water, it seemed as if the vessel was suspended in the air."
  - Hint: Was there any wind? Look at the clouds and the boat's sail.
  - Why: The clouds floated without a breath of air to move them, and the sloop's sail hung uselessly.
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Katrina describes the river that night. One detail is untrue. Tap the sentence that shows it.
  - Testimony (Katrina Van Tassel): "By then every boat on the river had been tied up and left empty for the night."
  - Proof sentence: "A sloop was loitering in the distance, dropping slowly down with the tide, her sail hanging uselessly against the mast; and as the reflection of the sky gleamed along the still water, it seemed as if the vessel was suspended in the air."
  - Hint: Is anything moving on the water?
  - Why: A sloop was loitering in the distance, drifting slowly down with the tide.
  - Standards: ELA.K12.EE.1.1
- Discovery (figurative): "the vessel was suspended in the air". The reflection makes the boat look like it hangs in the sky.

**Chunk 9** (¶42 sentences 1 to 3; 72 words)

- Question (Character Clue, drag and drop: Match the character): Match each detail to the old farmers or to their wives.
  - Slots: The old farmers / Their wives
  - Piece: Homespun coats and huge shoes → The old farmers (backed by "Old farmers, a spare leathern-faced race, in homespun coats and breeches, blue stockings, …")
  - Piece: Magnificent pewter buckles → The old farmers (backed by "Old farmers, a spare leathern-faced race, in homespun coats and breeches, blue stockings, …")
  - Piece: Close-crimped caps → Their wives (backed by "Their brisk, withered little dames, in close-crimped caps, long-waisted short gowns, homes…")
  - Piece: Gay calico pockets hung outside → Their wives (backed by "Their brisk, withered little dames, in close-crimped caps, long-waisted short gowns, homes…")
  - Hint: One sentence describes the men, the next their wives.
  - Why: The farmers wear homespun, huge shoes and pewter buckles; their dames wear crimped caps and calico pockets.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Bank question (Character Clue, two-part evidence): What do the husbands' clothes suggest about them?
  - Key words highlighted: husbands
  - Choices: They are rich merchants from the city / They are soldiers just home from war / They are plain, hardworking country people ✓
  - Proof sentence: "Old farmers, a spare leathern-faced race, in homespun coats and breeches, blue stockings, huge shoes, and magnificent pewter buckles."
  - Hint: Who made their coats?
  - Why: A spare, leathern-faced race in homespun coats: weathered country people who make their own clothes.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Discovery (figurative): "leathern-faced race". Leathern-faced: faces tanned and tough as leather from outdoor work.

**Chunk 10** (¶42 sentences 4 to 5; 74 words) · the boss (double points)

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what the young guests' clothing suggests about old ways and change.
  - A strong answer: Old ways can hold on for a long time, with only small signs of change creeping in.
  - Key ideas (one from each group): old, tradition, past, antiquated, same, custom | change, new, innovation, modern, city, small, creep, slowly, little
  - Proof sentence: "Buxom lasses, almost as antiquated as their mothers, excepting where a straw hat, a fine ribbon, or perhaps a white frock, gave symptoms of city innovation."
  - Hint: Look for the few signs of the city.
  - Why: The lasses are almost as antiquated as their mothers, except for a hat or ribbon showing city innovation: old ways linger while change creeps in.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using your own words, tell in one sentence what these fashions suggest about how new ideas spread.
  - A strong answer: New ideas spread slowly into quiet places, showing up first in small details like a ribbon or a hat.
  - Key ideas (one from each group): new, city, modern, innovation, fashion, change, idea | slow, little, small, detail, few, bit, gradual, creep
  - Proof sentence: "Buxom lasses, almost as antiquated as their mothers, excepting where a straw hat, a fine ribbon, or perhaps a white frock, gave symptoms of city innovation."
  - Hint: Which small items came from the city?
  - Why: Only a straw hat, a ribbon or a white frock shows city innovation: change arrives a little at a time.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: The young women wear the latest city gowns, and the young men wear white powdered wigs. / The young women and men all wear the same plain gray work clothes, with no buttons or ribbons at all. / The young women wear old styles with a few city touches, and the young men wear brass buttons and eel-skin pigtails. ✓
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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 5; level 2: chunks 6 to 10. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 4 (10 seconds, recalls chunk 1): What is the name of Brom's horse? Answer: "Brom Bones, however, was the hero of the scene, having come to the gathering on his favorite steed Daredevil, a creature, like himself, full of mettle and mischief, and which no one but himself could manage."
- Lightning beat after chunk 7 (10 seconds, recalls chunk 6): How does Baltus invite his guests to eat? Answer: "His hospitable attentions were brief, but expressive, being confined to a shake of the hand, a slap on the shoulder, a loud laugh, and a pressing invitation to “fall to, and help themselves.”"

**Chunk 1** (¶43 sentences 1 to 2; 75 words) · warm-up

- Question (Find It, tap the sentence): Which line names Brom's horse and describes its nature?
  - Key words highlighted: names
  - Proof sentence: "Brom Bones, however, was the hero of the scene, having come to the gathering on his favorite steed Daredevil, a creature, like himself, full of mettle and mischief, and which no one but himself could manage."
  - Hint: Look for the horse's name.
  - Why: He came on his favorite steed Daredevil, full of mettle and mischief like himself.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line explains Brom's taste in mounts?
  - Key words highlighted: taste in mounts
  - Proof sentence: "He was, in fact, noted for preferring vicious animals, given to all kinds of tricks which kept the rider in constant risk of his neck, for he held a tractable, well-broken horse as unworthy of a lad of spirit."
  - Hint: Look for what he thinks a lad of spirit should ride.
  - Why: He prefers vicious animals, holding a well-broken horse unworthy of a lad of spirit.
  - Standards: ELA.K12.EE.1.1
- Gist check: Brom arrives on a gentle old mare that anyone could ride. / Brom arrives on Daredevil, a wild horse that only he can handle. ✓ / Brom arrives on foot, having sold his horse to pay a debt.
- Discovery (figurative): "full of mettle and mischief". Mettle: courage and spirit. The horse is as bold and tricky as Brom.

**Chunk 2** (¶44 sentences 1 to 3; 80 words) · warm-up

- Question (Whose Eyes?, two-part evidence): What does the narrator say dazzles Ichabod most when he walks in?
  - Key words highlighted: narrator
  - Choices: The food, more than the young women ✓ / The music, much more than the food / Katrina's father, most of all
  - Proof sentence: "Not those of the bevy of buxom lasses, with their luxurious display of red and white; but the ample charms of a genuine Dutch country tea-table, in the sumptuous time of autumn."
  - Hint: The narrator says not those of the lasses, but what?
  - Why: Not the buxom lasses, but the ample charms of a genuine Dutch country tea-table.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Bank question (Whose Eyes?, two-part evidence): The narrator calls the cakes "almost indescribable." What is his tone?
  - Key words highlighted: tone
  - Choices: Bored by the plain country food / Disgusted by the messy table / Playfully amazed at the huge spread ✓
  - Proof sentence: "Such heaped up platters of cakes of various and almost indescribable kinds, known only to experienced Dutch housewives!"
  - Hint: Is he complaining, or marveling?
  - Why: Heaped-up platters of cakes "of various and almost indescribable kinds": he is happily amazed.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Discovery (vocabulary): "sumptuous time of autumn". Sumptuous: rich and splendid.

**Chunk 3** (¶44 sentences 4 to 5; 104 words) · surprise double points

- Question (Figure It Out, multiple choice): Read the words "the motherly teapot." What kind of figurative language is this?
  - Key words highlighted: motherly teapot
  - Choices: Hyperbole: the teapot is said to be bigger than the whole room / Personification: the teapot is described like a caring mother ✓ / Simile: the teapot is compared to a mother using like
  - What does it mean? The teapot belongs to Katrina's mother and was a gift / The teapot is broken and leaking everywhere / The steaming teapot feels warm and welcoming at the center ✓
  - Hint: Can a teapot be a mother? Think about how it sits in the middle of everything.
  - Why: The teapot is described like a mother at the center of her family: warm and welcoming.
  - Standards: ELA.7.R.3.1
- Bank question (Figure It Out, multiple choice): The narrator writes "the doughty doughnut." Which device is this?
  - Key words highlighted: doughty doughnut
  - Choices: Onomatopoeia: the words copy a sizzle / Alliteration: the repeated d sound is fun ✓ / Simile: the doughnut is compared using like
  - What effect does it have? It shows the narrator dislikes sweets / It makes the list of food playful ✓ / It warns that the doughnuts are burnt
  - Hint: Say it out loud. What sound repeats?
  - Why: Doughty doughnut, tender oly koek, crisp crumbling cruller: repeated sounds make the feast sound playful.
  - Standards: ELA.7.R.3.1
- Discovery (vocabulary): "higgledy-piggledy". Higgledy-piggledy: in a cheerful mess, all mixed up.

**Chunk 4** (¶44 sentences 6 to 7, ¶45 sentences 1 to 1; 74 words)

- Question (Shades of Meaning, two-part evidence): Why does the narrator say Ichabod did ample justice to every dainty instead of just ate?
  - Key words highlighted: ample justice
  - Choices: It means he punished the cooks for bad food / It jokes that he honored the food by eating plenty ✓ / It means he judged the cakes in a baking contest
  - Proof sentence: "He was a kind and thankful creature, whose heart dilated in proportion as his skin was filled with good cheer, and whose spirits rose with eating, as some men’s do with drink."
  - Hint: How does eating make him feel?
  - Why: His spirits rose with eating: he "did justice" to the food by eating a great deal of it.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Bank question (Shades of Meaning, two-part evidence): What does it mean that Ichabod's heart "dilated" as he ate?
  - Key words highlighted: dilated
  - Choices: His heart swells with happiness ✓ / His heart is sick from the rich food / His heart races with sudden fear
  - Part B: tap the clue words that show the meaning (any one): "spirits rose with eating"
  - Proof sentence: "He was a kind and thankful creature, whose heart dilated in proportion as his skin was filled with good cheer, and whose spirits rose with eating, as some men’s do with drink."
  - Hint: What else rises as he eats?
  - Why: His spirits rose with eating: his heart swells with good cheer as his stomach fills.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: The narrator lingers on the feast, but Ichabod eats nothing and leaves early. / The narrator and Ichabod both lose their appetite at the sight of so much rich food. / The narrator hurries on, but Ichabod takes his time and grows happier with every bite. ✓
- Discovery (vocabulary): "his historian". His historian: the narrator, calling himself the recorder of Ichabod's story.

**Chunk 5** (¶45 sentences 2 to 3; 79 words) · the twist, checkpoint after this chunk, then the burst

- Question (Catch the Lie, tap the sentence): Hans Van Ripper speaks up for the schoolmaster. One thing he says is false. Tap the line that proves it.
  - Key words highlighted: false
  - Testimony (Hans Van Ripper): "The schoolmaster was grateful to all of us who gave him a roof. He'd never dream of turning on his old friends."
  - Proof sentence: "Then, he thought, how soon he’d turn his back upon the old schoolhouse; snap his fingers in the face of Hans Van Ripper, and every other niggardly patron, and kick any itinerant pedagogue out of doors that should dare to call him comrade!"
  - Hint: What does Ichabod imagine doing once he is rich?
  - Why: He pictures snapping his fingers in the face of Hans Van Ripper and every other patron.
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Brom Bones claims to know what was on Ichabod's mind at the feast. One detail is untrue. Tap the sentence that shows it.
  - Testimony (Brom Bones): "All through that feast he sat thinking about his pupils and the lessons he'd teach the next day."
  - Proof sentence: "Then, he thought, how soon he’d turn his back upon the old schoolhouse; snap his fingers in the face of Hans Van Ripper, and every other niggardly patron, and kick any itinerant pedagogue out of doors that should dare to call him comrade!"
  - Hint: What does he imagine doing to the old schoolhouse?
  - Why: He imagines how soon he would turn his back upon the old schoolhouse, not teach in it.
  - Standards: ELA.K12.EE.1.1
- Discovery (figurative): "lord of all this scene". He imagines himself ruling the whole rich farm like a lord.

**Chunk 6** (¶46 sentences 1 to 2; 58 words)

- Question (Read Between the Lines, choose two): Which two actions show Baltus is a warm host?
  - Key words highlighted: warm host
  - Choices (choose 2): He urges everyone to help themselves ✓ / He gives a long and very formal speech / He serves every plate of food himself / He shakes hands and slaps shoulders ✓
  - Hint: What does he do as he moves among the guests?
  - Why: His welcome is a shake of the hand, a slap on the shoulder, a loud laugh, and a pressing invitation to fall to.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): Why might Baltus keep his welcome to guests so short?
  - Key words highlighted: so short
  - Choices: He has lost his voice tonight / He wants them to start eating ✓ / He is angry that so many came
  - Proof sentence: "His hospitable attentions were brief, but expressive, being confined to a shake of the hand, a slap on the shoulder, a loud laugh, and a pressing invitation to “fall to, and help themselves.”"
  - Hint: What does he press them to do?
  - Why: His attentions are brief, ending in a pressing invitation to "fall to, and help themselves."
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Discovery (figurative): "round and jolly as the harvest moon". A simile: his happy face is as round and bright as a full moon.

**Chunk 7** (¶47 sentences 1 to 4; 90 words)

- Question (Find It, tap the sentence): Which line tells what calls everyone onto the floor?
  - Key words highlighted: onto the floor
  - Proof sentence: "And now the sound of the music from the common room, or hall, summoned to the dance."
  - Hint: Listen for a sound coming from the hall.
  - Why: The sound of the music from the common room summoned to the dance.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line shows what part of the house the tunes come from?
  - Key words highlighted: tunes
  - Proof sentence: "And now the sound of the music from the common room, or hall, summoned to the dance."
  - Hint: Look for the common room, or hall.
  - Why: The sound of the music from the common room, or hall, summoned to the dance.
  - Standards: ELA.K12.EE.1.1
- Gist check: Music from the hall calls the guests in to dance. ✓ / A bell from the church calls the guests home to bed. / A shout from the barn calls the guests out to a fire.
- Discovery (vocabulary): "summoned to the dance". Summoned: called to come.

**Chunk 8** (¶48 sentences 1 to 2; 58 words)

- Question (Shades of Meaning, drag and drop: Feeling of the word): Sort each phrase: does it show Ichabod's pride, or his wild motion?
  - Slots: Shows his pride / Shows his wild motion
  - Piece: Prides himself on his dancing → Shows his pride (backed by "Ichabod prided himself upon his dancing as much as upon his vocal powers.")
  - Piece: As proud of it as of his singing → Shows his pride (backed by "Ichabod prided himself upon his dancing as much as upon his vocal powers.")
  - Piece: Not a limb was idle → Shows his wild motion (backed by "Not a limb, not a fibre about him was idle; and to have seen his loosely hung frame in ful…")
  - Piece: Clattering about the room → Shows his wild motion (backed by "Not a limb, not a fibre about him was idle; and to have seen his loosely hung frame in ful…")
  - Hint: Is the phrase about how he feels, or how he moves?
  - Why: He prides himself on his dancing as much as his singing; on the floor every limb flies as he clatters about.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Bank question (Shades of Meaning, two-part evidence): Why compare Ichabod's dancing to "St. Vitus himself"?
  - Key words highlighted: St. Vitus
  - Choices: His dancing is wild, jerky and nonstop ✓ / He dances slowly, like a saint at prayer / He refuses to dance with anyone
  - Part B: tap the clue words that show the meaning (any one): "not a fibre about him was idle", "clattering about the room"
  - Proof sentence: "Not a limb, not a fibre about him was idle; and to have seen his loosely hung frame in full motion, and clattering about the room, you would have thought St. Vitus himself, that blessed patron of the dance, was figuring before you in person."
  - Hint: Find the words that show how much of him is moving.
  - Why: Not a limb, not a fibre is idle as he clatters about: like the patron of the dance, he never stops moving.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Discovery (vocabulary): "St. Vitus himself". St. Vitus: a saint linked to dancing; a joke about wild, jerky moves.

**Chunk 9** (¶48 sentences 3 to 5; 104 words) · the boss (double points)

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what the evening suggests about how one person's success can affect a rival.
  - A strong answer: One person's success can stir up jealousy and resentment in a rival who is left watching.
  - Key ideas (one from each group): success, win, happy, favor, partner, smil, joy | jealous, envy, resent, brood, bitter, hurt, rival, angry, sulk
  - Proof sentence: "The lady of his heart was his partner in the dance, and smiling graciously in reply to all his amorous oglings; while Brom Bones, sorely smitten with love and jealousy, sat brooding by himself in one corner."
  - Hint: Where is Brom while Katrina dances with Ichabod?
  - Why: Katrina smiles at Ichabod while Brom, sorely smitten with love and jealousy, broods alone in a corner.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using your own words, tell in one sentence what Brom's sulking suggests about envy.
  - A strong answer: Jealousy can make even a proud, lively person pull away and brood alone.
  - Key ideas (one from each group): jealous, envy, resent | alone, brood, withdraw, sulk, quiet, corner, isolat, silent, apart
  - Proof sentence: "The lady of his heart was his partner in the dance, and smiling graciously in reply to all his amorous oglings; while Brom Bones, sorely smitten with love and jealousy, sat brooding by himself in one corner."
  - Hint: What does the hero of the gathering end up doing?
  - Why: Brom, the hero of the scene, ends up brooding by himself in a corner, sorely smitten with jealousy.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Discovery (figurative): "sorely smitten with love and jealousy". Smitten: struck hard, here by love and jealousy.

**Chunk 10** (¶49 sentences 1 to 1, ¶50 sentences 1 to 2; 97 words)

- Question (Story Order, drag and drop: Cause and effect): Connect each cause to what follows from it.
  - Slots: The dance comes to an end / The war's front line ran nearby / The neighborhood is full of great men
  - Piece: Ichabod drifts over to the older guests → The dance comes to an end (backed by "When the dance was at an end, Ichabod was attracted to a knot of the sager folks, who, wit…")
  - Piece: Raiders and refugees roamed the area → The war's front line ran nearby (backed by "The British and American line had run near it during the war; it had, therefore, been the …")
  - Piece: It abounds with tales and history → The neighborhood is full of great men (backed by "This neighborhood, at the time of which I am speaking, was one of those highly favored pla…")
  - Hint: Read each sentence for what made what happen.
  - Why: When the dance ends Ichabod joins the old folks; the nearby front line brought raiders; and a place of great men is rich in chronicle.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Bank question (Story Order, two-part evidence): What pulls Ichabod over to the older guests later that evening?
  - Key words highlighted: pulls
  - Choices: Their offer of better-paid work / A fight that breaks out among them / Their long stories about the war ✓
  - Proof sentence: "When the dance was at an end, Ichabod was attracted to a knot of the sager folks, who, with Old Van Tassel, sat smoking at one end of the piazza, gossiping over former times, and drawing out long stories about the war."
  - Hint: What are the old men doing as they smoke?
  - Why: They sit smoking, gossiping over former times and drawing out long stories about the war.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Gist check: After the dance, Ichabod joins the young men racing horses in the moonlight. / After the dance, Ichabod goes home early to prepare the next day's spelling lessons. / After the dance, Ichabod joins the old men trading stories of the war fought nearby. ✓
- Discovery (figurative): "border chivalry". Border chivalry: raiders and rough fighters along the war line, called knights as a joke.

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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 5; level 2: chunks 6 to 10. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 4 (10 seconds, recalls chunk 2): What did the rich old gentleman say he turned a musket-ball aside with? Answer: "And there was an old gentleman who shall be nameless, being too rich a mynheer to be lightly mentioned, who, in the battle of White Plains, being an excellent master of defence, parried a musket-ball with a small sword, insomuch that he absolutely felt it whiz round the blade, and glance off at the hilt; in proof of which he was ready at any time to show the sword, with the hilt a little bent."
- Lightning beat after chunk 8 (10 seconds, recalls chunk 6): Where did the woman in white perish? Answer: "Some mention was made also of the woman in white, that haunted the dark glen at Raven Rock, and was often heard to shriek on winter nights before a storm, having perished there in the snow."

**Chunk 1** (¶50 sentences 3 to 3, ¶51 sentences 1 to 1; 70 words) · warm-up

- Question (Whose Eyes?, two-part evidence): How does the narrator feel about the old men's war memories?
  - Key words highlighted: narrator
  - Choices: Bored, since none of them ever fought in the war at all / Amused, since they stretch the truth to look like heroes ✓ / Impressed, since every account is perfectly accurate
  - Proof sentence: "Just sufficient time had elapsed to enable each storyteller to dress up his tale with a little becoming fiction, and, in the indistinctness of his recollection, to make himself the hero of every exploit."
  - Hint: What has time allowed each one to add?
  - Why: Each storyteller dresses up his tale with a little becoming fiction and makes himself the hero.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Bank question (Whose Eyes?, two-part evidence): According to the narrator, who ends up the hero of each old man's story?
  - Key words highlighted: hero
  - Choices: General Washington himself / A British sea captain / The man telling the story ✓
  - Proof sentence: "Just sufficient time had elapsed to enable each storyteller to dress up his tale with a little becoming fiction, and, in the indistinctness of his recollection, to make himself the hero of every exploit."
  - Hint: What has time let each storyteller do?
  - Why: With a little becoming fiction, each storyteller makes himself the hero of every exploit.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: The old men refuse to talk about the war because the memories are too painful. / The old men read aloud from a history book about a British ship sinking in the river. / The old men pad their war stories with fiction, like Doffue Martling, who almost captured a ship. ✓
- Discovery (figurative): "a little becoming fiction". Becoming fiction: a few flattering made-up details.

**Chunk 2** (¶51 sentences 2 to 3; 108 words) · warm-up

- Question (Find It, tap the sentence): Which line shows an old man offering an object to back up his story?
  - Key words highlighted: back up
  - Proof sentence: "And there was an old gentleman who shall be nameless, being too rich a mynheer to be lightly mentioned, who, in the battle of White Plains, being an excellent master of defence, parried a musket-ball with a small sword, insomuch that he absolutely felt it whiz round the blade, and glance off at the hilt; in proof of which he was ready at any time to show the sword, with the hilt a little bent."
  - Hint: What is he always ready to show?
  - Why: He is ready at any time to show the sword, with the hilt a little bent.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line shows every old soldier believes he helped end the war?
  - Key words highlighted: helped end the war
  - Proof sentence: "There were several more that had been equally great in the field, not one of whom but was persuaded that he had a considerable hand in bringing the war to a happy termination."
  - Hint: Look for the words a considerable hand.
  - Why: Not one of them but was persuaded he had a considerable hand in bringing the war to a happy termination.
  - Standards: ELA.K12.EE.1.1
- Discovery (vocabulary): "an excellent master of defence". Master of defence: an expert swordsman.

**Chunk 3** (¶52 sentences 1 to 3; 54 words)

- Question (Read Between the Lines, choose two): Which two ideas about legends does the narrator suggest?
  - Key words highlighted: legends
  - Choices (choose 2): They fade where people keep moving away ✓ / They are written down in the church records / They are only told by small children / They thrive in quiet, long-settled places ✓
  - Hint: Where do local tales do best, and where are they trampled?
  - Why: Local tales thrive in sheltered, long-settled retreats, but are trampled under foot by a shifting population.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): How do the spooky stories compare with the war stories before them?
  - Key words highlighted: compare
  - Choices: They are all about the war / They are even more thrilling ✓ / They are shorter and duller
  - Proof sentence: "But all these were nothing to the tales of ghosts and apparitions that succeeded."
  - Hint: What were the war stories next to them?
  - Why: All the war stories "were nothing to" the tales of ghosts that followed.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Discovery (figurative): "legendary treasures". Stories are the neighborhood's treasure.

**Chunk 4** (¶52 sentences 4 to 5; 77 words) · surprise double points

- Question (Figure It Out, multiple choice): Read the words "finish their first nap." What kind of figurative language is this?
  - Key words highlighted: first nap
  - Choices: Onomatopoeia: the word nap copies a sound / Personification: ghosts nap like living people ✓ / Simile: ghosts are compared to sleepers using like
  - What does it mean? Ghosts sleep all day long and never come out at night / Villages hire guards to keep ghosts away / In busy towns, people move away before ghosts can visit them ✓
  - Hint: Who takes naps? Then ask why the ghosts find no friends left.
  - Why: Ghosts barely finish a nap before their friends have moved away: in busy towns nobody stays long enough to be haunted.
  - Standards: ELA.7.R.3.1
- Bank question (Figure It Out, multiple choice): Ghosts "turn out at night to walk their rounds." Which device is this?
  - Key words highlighted: walk their rounds
  - Choices: Simile: ghosts are compared using like / Alliteration: the words share a first sound / Personification: ghosts act like night watchmen ✓
  - What does it suggest about the ghosts? They keep habits, like people with jobs ✓ / They are guarding a treasure in town / They are afraid of the dark
  - Hint: Who walks rounds at night?
  - Why: Like a watchman on his rounds, the ghost has a routine of visits, but no one is left to call on.
  - Standards: ELA.7.R.3.1
- Gist check: The narrator warns that ghosts in busy villages are the most dangerous of all. / The narrator claims, quite seriously, that ghosts never existed anywhere in the country. / The narrator jokes that ghosts in busy villages find all their friends have moved away. ✓
- Discovery (figurative): "walk their rounds". Ghosts making their nightly rounds like a watchman.

**Chunk 5** (¶53 sentences 1 to 3; 71 words) · checkpoint after this chunk, then the burst

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what this chunk suggests about how beliefs travel from place to place.
  - A strong answer: Beliefs can spread like a sickness, passing from one place and person to the next until a whole area shares them.
  - Key ideas (one from each group): belief, believ, story, stories, dream, fanc, idea, superstit, legend | spread, pass, catch, contag, infect, everyone, neighbor, whole, others, sickness, travel
  - Proof sentence: "There was a contagion in the very air that blew from that haunted region; it breathed forth an atmosphere of dreams and fancies infecting all the land."
  - Hint: Notice the words "contagion" and "infecting."
  - Why: A contagion in the air from the haunted Hollow infects all the land with dreams and fancies: beliefs spread like a disease.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using your own words, tell in one sentence what this suggests about where people live and what they believe.
  - A strong answer: Where people live can shape what they believe, since a dreamy, haunted place fills its neighbors' heads with ghost stories.
  - Key ideas (one from each group): place, live, where, land, region, surround, home, nearby | believ, belief, imagin, dream, fanc, stories, think, shape, ghost
  - Proof sentence: "There was a contagion in the very air that blew from that haunted region; it breathed forth an atmosphere of dreams and fancies infecting all the land."
  - Hint: What blows over from the Hollow?
  - Why: Living near the Hollow, people breathe an atmosphere of dreams and fancies: the place shapes their beliefs.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Discovery (figurative): "a contagion in the very air". Contagion: something catching, like a sickness. The Hollow's fancies spread through the air.

**Chunk 6** (¶53 sentences 4 to 6; 112 words) · the twist

- Question (Catch the Lie, tap the sentence): Katrina recalls the spooky talk at the party. One thing she says is false. Tap the sentence that proves it.
  - Testimony (Katrina Van Tassel): "Nobody so much as mentioned the Headless Horseman that night. The guests stuck to other ghosts."
  - Proof sentence: "The chief part of the stories, however, turned upon the favorite spectre of Sleepy Hollow, the Headless Horseman, who had been heard several times of late, patrolling the country; and, it was said, tethered his horse nightly among the graves in the churchyard."
  - Hint: Which spectre did most of the stories turn on?
  - Why: The chief part of the stories turned upon the favorite spectre of Sleepy Hollow, the Headless Horseman.
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Hans Van Ripper remembers the tales differently. One detail is untrue. Tap the sentence that shows it.
  - Testimony (Hans Van Ripper): "The only ghost anyone spoke of was the Horseman. Not one word about any other spirit."
  - Proof sentence: "Some mention was made also of the woman in white, that haunted the dark glen at Raven Rock, and was often heard to shriek on winter nights before a storm, having perished there in the snow."
  - Hint: Who haunted the glen at Raven Rock?
  - Why: The guests also told of the woman in white who haunted the dark glen at Raven Rock.
  - Standards: ELA.K12.EE.1.1
- Discovery (vocabulary): "funeral trains". Funeral trains: long lines of mourners following a coffin.

**Chunk 7** (¶54 sentences 1 to 3; 77 words)

- Question (Word Detective, two-part evidence): In this chunk, what does sequestered mean?
  - Key words highlighted: sequestered
  - Choices: Crowded with visitors every day / Built only a year ago / Hidden away and set apart ✓
  - Proof sentence: "It stands on a knoll, surrounded by locust-trees and lofty elms, from among which its decent, whitewashed walls shine modestly forth, like Christian purity beaming through the shades of retirement."
  - Hint: What surrounds the church?
  - Why: Surrounded by locust-trees and lofty elms, the church is tucked away and set apart.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Bank question (Word Detective, two-part evidence): Which meaning of knoll fits the church's spot?
  - Key words highlighted: knoll
  - Choices: A small, rounded hill ✓ / A deep, rocky hollow / A flat, muddy field
  - Proof sentence: "A gentle slope descends from it to a silver sheet of water, bordered by high trees, between which, peeps may be caught at the blue hills of the Hudson."
  - Hint: What goes down from the church to the water?
  - Why: A gentle slope descends from it to the water: the church sits on a small hill.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: The ruined church sits in a muddy swamp, its broken gray walls covered in thick, tangled vines. / The lonely church sits on a hill among trees, its white walls overlooking water and distant hills. ✓ / The busy church sits in the town square, its red walls facing a crowded market.
- Discovery (figurative): "a silver sheet of water". Metaphor: the calm pond looks like a sheet of silver.

**Chunk 8** (¶54 sentences 4 to 6; 104 words)

- Question (Shades of Meaning, drag and drop: Feeling of the word): Sort each detail near the church: does it feel peaceful, or gloomy?
  - Slots: Peaceful / Gloomy
  - Piece: Sunbeams seem to sleep quietly in the yard → Peaceful (backed by "To look upon its grass-grown yard, where the sunbeams seem to sleep so quietly, one would …")
  - Piece: The dead might rest in peace → Peaceful (backed by "To look upon its grass-grown yard, where the sunbeams seem to sleep so quietly, one would …")
  - Piece: A brook raves among broken rocks → Gloomy (backed by "On one side of the church extends a wide woody dell, along which raves a large brook among…")
  - Piece: Trees cast a gloom even by day → Gloomy (backed by "Over a deep black part of the stream, not far from the church, was formerly thrown a woode…")
  - Piece: A fearful darkness falls at night → Gloomy (backed by "Over a deep black part of the stream, not far from the church, was formerly thrown a woode…")
  - Hint: Does the detail make you feel calm, or uneasy?
  - Why: The sleepy sunbeams and resting dead feel peaceful; the raving brook, the gloom and the fearful darkness by the bridge feel menacing.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Bank question (Shades of Meaning, two-part evidence): Why might the narrator say the brook "raves" instead of flows?
  - Key words highlighted: raves
  - Choices: It has nearly dried up / It rushes wildly and loudly ✓ / It runs slowly and softly
  - Part B: tap the clue words that show the meaning (any one): "broken rocks", "trunks of fallen trees"
  - Proof sentence: "On one side of the church extends a wide woody dell, along which raves a large brook among broken rocks and trunks of fallen trees."
  - Hint: What does the brook crash over?
  - Why: Rushing among broken rocks and fallen trunks, the brook roars wildly like someone raving.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Discovery (figurative): "the sunbeams seem to sleep". Personification: sunlight rests as if asleep.

**Chunk 9** (¶54 sentences 7 to 8; 94 words)

- Question (Story Order, two-part evidence): How does old Brouwer's ride with the Horseman end?
  - Key words highlighted: end
  - Choices: He is thrown into the brook ✓ / He wins a race against the Horseman / He rides safely home before dawn
  - Proof sentence: "The tale was told of old Brouwer, a most heretical disbeliever in ghosts, how he met the Horseman returning from his foray into Sleepy Hollow, and was obliged to get up behind him; how they galloped over bush and brake, over hill and swamp, until they reached the bridge; when the Horseman suddenly turned into a skeleton, threw old Brouwer into the brook, and sprang away over the tree-tops with a clap of thunder."
  - Hint: What happens when they reach the bridge?
  - Why: At the bridge the Horseman turns into a skeleton and throws old Brouwer into the brook.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Bank question (Story Order, two-part evidence): Why does the tale begin by calling Brouwer a disbeliever in ghosts?
  - Key words highlighted: disbeliever
  - Choices: It makes his ride a lesson for doubters ✓ / It explains why he owned a fast horse / It shows he was the Horseman's friend
  - Proof sentence: "The tale was told of old Brouwer, a most heretical disbeliever in ghosts, how he met the Horseman returning from his foray into Sleepy Hollow, and was obliged to get up behind him; how they galloped over bush and brake, over hill and swamp, until they reached the bridge; when the Horseman suddenly turned into a skeleton, threw old Brouwer into the brook, and sprang away over the tree-tops with a clap of thunder."
  - Hint: What happens to the man who said ghosts aren't real?
  - Why: The most heretical disbeliever is the one carried off and dumped in the brook: the tale warns doubters.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Discovery (vocabulary): "a most heretical disbeliever in ghosts". Heretical: going against what everyone believes. Brouwer refused to believe in ghosts.

**Chunk 10** (¶55 sentences 1 to 2; 92 words) · the boss (double points)

- Question (Weigh the Evidence, drag and drop: Fact or witness claim): Sort what the narrator reports from what only Brom claims.
  - Slots: The narrator reports it / Only Brom claims it
  - Piece: Brom's story follows right after Brouwer's tale → The narrator reports it (backed by "This story was immediately matched by a thrice marvellous adventure of Brom Bones, who mad…")
  - Piece: Brom makes light of the Galloping Hessian → The narrator reports it (backed by "This story was immediately matched by a thrice marvellous adventure of Brom Bones, who mad…")
  - Piece: Daredevil beat the goblin horse easily → Only Brom claims it (backed by "He affirmed that on returning one night from the neighboring village of Sing Sing, he had …")
  - Piece: The Hessian vanished in a flash of fire → Only Brom claims it (backed by "He affirmed that on returning one night from the neighboring village of Sing Sing, he had …")
  - Hint: Look for "he affirmed that": everything after it is Brom's own word.
  - Why: The narrator tells us Brom's tale matched Brouwer's and that he made light of the Hessian; the race and the flash of fire are only what Brom "affirmed."
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Bank question (Weigh the Evidence, two-part evidence): Which detail most strongly suggests Brom's story is a boast?
  - Key words highlighted: boast
  - Choices: He was riding home from Sing Sing / The race ended near the church bridge / He says Daredevil beat the goblin horse ✓
  - Proof sentence: "He affirmed that on returning one night from the neighboring village of Sing Sing, he had been overtaken by this midnight trooper; that he had offered to race with him for a bowl of punch, and should have won it too, for Daredevil beat the goblin horse all hollow, but just as they came to the church bridge, the Hessian bolted, and vanished in a flash of fire."
  - Hint: Which detail makes Brom look best?
  - Why: He claims Daredevil beat the goblin horse all hollow and would have won the punch: a boast that makes him the hero.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Gist check: Brom admits he once fled from the Horseman and hid in a muddy ditch until the sun came up. / Brom says the Horseman is only a story and laughs at everyone who believes it. / Brom tops the tale by boasting he raced the Horseman, and the ghost vanished in fire at the bridge. ✓
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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 5; level 2: chunks 6 to 10. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 4 (10 seconds, recalls chunk 1): Whose book did Ichabod quote from to repay the old men's tales? Answer: "He repaid them in kind with large extracts from his invaluable author, Cotton Mather, and added many marvellous events that had taken place in his native State of Connecticut, and fearful sights which he had seen in his nightly walks about Sleepy Hollow."
- Lightning beat after chunk 8 (10 seconds, recalls chunk 6): What spread out far below him on the ride home? Answer: "Far below him the Tappan Zee spread its dusky and indistinct waste of waters, with here and there the tall mast of a sloop, riding quietly at anchor under the land."

**Chunk 1** (¶56 sentences 1 to 2; 84 words) · warm-up

- Question (Find It, tap the sentence): Which line shows how Ichabod answered the old men's stories?
  - Key words highlighted: answered
  - Proof sentence: "He repaid them in kind with large extracts from his invaluable author, Cotton Mather, and added many marvellous events that had taken place in his native State of Connecticut, and fearful sights which he had seen in his nightly walks about Sleepy Hollow."
  - Hint: Look for what he added from his own reading and walks.
  - Why: He repaid them in kind with extracts from Cotton Mather and fearful sights from his own nightly walks.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line shows the old men's words staying with Ichabod?
  - Key words highlighted: staying with
  - Proof sentence: "All these tales, told in that drowsy undertone with which men talk in the dark, the countenances of the listeners only now and then receiving a casual gleam from the glare of a pipe, sank deep in the mind of Ichabod."
  - Hint: Where did the tales sink?
  - Why: All these tales sank deep in the mind of Ichabod.
  - Standards: ELA.K12.EE.1.1
- Gist check: The loud, cheerful jokes make Ichabod laugh, and he heads home in high spirits. / The ghost stories bore Ichabod, so he slips out of the room to go and look for Katrina. / The hushed ghost stories sink deep into Ichabod, and he adds spooky tales of his own. ✓
- Discovery (vocabulary): "drowsy undertone". Undertone: a low, quiet voice.

**Chunk 2** (¶57 sentences 1 to 3; 79 words) · warm-up

- Question (Word Detective, two-part evidence): What are the pillions the young women ride on?
  - Key words highlighted: pillions
  - Choices: Small carts pulled by goats / Lanterns carried on a pole / Seats behind a rider on a horse ✓
  - Part B: tap the clue words that show the meaning (any one): "behind their favorite swains"
  - Proof sentence: "Some of the damsels mounted on pillions behind their favorite swains, and their light-hearted laughter, mingling with the clatter of hoofs, echoed along the silent woodlands, sounding fainter and fainter, until they gradually died away,--and the late scene of noise and frolic was all silent and deserted."
  - Hint: Where do the young women sit?
  - Why: The damsels ride on pillions "behind their favorite swains": a pillion is a seat behind the rider.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Bank question (Word Detective, two-part evidence): Which meaning of revel fits this chunk?
  - Key words highlighted: revel
  - Choices: A neighbors' quarrel / A lively party ✓ / A church service
  - Proof sentence: "Some of the damsels mounted on pillions behind their favorite swains, and their light-hearted laughter, mingling with the clatter of hoofs, echoed along the silent woodlands, sounding fainter and fainter, until they gradually died away,--and the late scene of noise and frolic was all silent and deserted."
  - Hint: What was the scene full of before it went silent?
  - Why: When it breaks up, "the late scene of noise and frolic" goes silent: a revel is a lively party.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Discovery (vocabulary): "on pillions". Pillion: a cushion behind a rider's saddle for a second person.

**Chunk 3** (¶57 sentences 4 to 6; 74 words)

- Question (Whose Eyes?, two-part evidence): What does the narrator admit about Ichabod's talk with Katrina?
  - Key words highlighted: admit
  - Choices: He was the one who carried their notes / He doesn't know what was said between them ✓ / He heard every word through the parlor door
  - Proof sentence: "What passed at this interview I will not pretend to say, for in fact I do not know."
  - Hint: Read what he says he will not pretend.
  - Why: What passed at this interview he will not pretend to say, for in fact he does not know.
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Bank question (Whose Eyes?, two-part evidence): How does the narrator guess that the talk with Katrina went badly?
  - Key words highlighted: guess
  - Choices: From the way Ichabod looks as he leaves ✓ / From a letter Katrina wrote to him / From what Brom told him the next day
  - Proof sentence: "Something, however, I fear me, must have gone wrong, for he certainly sallied forth, after no very great interval, with an air quite desolate and chapfallen."
  - Hint: What does Ichabod look like coming out?
  - Why: Something must have gone wrong, for he sallied forth "quite desolate and chapfallen."
  - Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Discovery (figurative): "the high road to success". He thinks he is on the fast path to winning her.

**Chunk 4** (¶57 sentences 7 to 11; 65 words)

- Question (Figure It Out, multiple choice): Read the words "sacking a henroost." What kind of figurative language is this?
  - Key words highlighted: henroost
  - Choices: Onomatopoeia: the words copy the sound of a chicken's cluck / Comparison: he leaves looking like a guilty chicken thief ✓ / Personification: the hens chase him out of the house
  - What does it mean? He leaves carrying stolen chickens / He runs off proud of his great success / He sneaks away ashamed and defeated ✓
  - Hint: How would a chicken thief slip away? Compare that with a winning suitor.
  - Why: He steals away like a chicken thief rather than a man who won a lady's heart: ashamed and defeated.
  - Standards: ELA.7.R.3.1
- Bank question (Figure It Out, multiple choice): The narrator asks whether Katrina was "playing off any of her coquettish tricks." Which device is this?
  - Key words highlighted: coquettish tricks
  - Choices: Simile: Katrina is compared using like / Hyperbole: a huge exaggeration for fun / Rhetorical question: it hints, not tells ✓
  - What does it suggest? Katrina wrote Ichabod a secret note / The narrator is sure of what happened / Katrina may have used him to stir Brom ✓
  - Hint: Does the narrator answer his own question?
  - Why: He asks whether her encouragement was a sham to win his rival, then says only Heaven knows: he hints without telling.
  - Standards: ELA.7.R.3.1
- Gist check: The narrator wonders whether Katrina was only using Ichabod, and Ichabod slinks away in shame. ✓ / The narrator explains exactly what Katrina said, and Ichabod leaves engaged. / The narrator blames Brom for everything, and Ichabod storms out of the house to go and find him.
- Discovery (figurative): "Heaven only knows". A way of saying nobody can tell.

**Chunk 5** (¶57 sentences 12 to 12; 63 words) · surprise double points, checkpoint after this chunk, then the burst

- Question (Shades of Meaning, drag and drop: Feeling of the word): Sort each detail: does it show Ichabod's hopeful mood before the talk, or his bitter mood after?
  - Slots: Hopeful, before / Bitter, after
  - Piece: He had often gloated over the farm's wealth → Hopeful, before (backed by "Without looking to the right or left to notice the scene of rural wealth, on which he had …")
  - Piece: He goes straight to the stable, looking neither way → Bitter, after (backed by "Without looking to the right or left to notice the scene of rural wealth, on which he had …")
  - Piece: He rouses the horse with cuffs and kicks → Bitter, after (backed by "Without looking to the right or left to notice the scene of rural wealth, on which he had …")
  - Hint: Is the detail about what he used to do, or what he does now?
  - Why: He used to gloat over the farm's riches; now he looks neither left nor right and kicks his horse awake.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Bank question (Shades of Meaning, two-part evidence): Why might the narrator say he woke his horse "most uncourteously"?
  - Key words highlighted: uncourteously
  - Choices: He wakes the horse with a gentle song / He lets the tired horse sleep on / He wakes the horse rudely and roughly ✓
  - Part B: tap the clue words that show the meaning (any one): "several hearty cuffs and kicks"
  - Proof sentence: "Without looking to the right or left to notice the scene of rural wealth, on which he had so often gloated, he went straight to the stable, and with several hearty cuffs and kicks roused his steed most uncourteously from the comfortable quarters in which he was soundly sleeping, dreaming of mountains of corn and oats, and whole valleys of timothy and clover."
  - Hint: How does he wake the horse?
  - Why: With several hearty cuffs and kicks: uncourteous means rude, with no manners at all.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Discovery (vocabulary): "whole valleys of timothy and clover". Timothy: a grass grown for hay. The horse dreams of feasts.

**Chunk 6** (¶58 sentences 1 to 3; 77 words)

- Question (Word Detective, two-part evidence): In this chunk, what does crestfallen mean?
  - Key words highlighted: crestfallen
  - Choices: Sleepy and ready for bed / Sad and ashamed after a letdown ✓ / Proud and full of fresh hope
  - Proof sentence: "The hour was as dismal as himself."
  - Hint: What is the hour as dismal as?
  - Why: The hour was as dismal as himself: crestfallen means downcast after a disappointment.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Bank question (Word Detective, two-part evidence): Which meaning of dusky fits the water below him?
  - Key words highlighted: dusky
  - Choices: Rough and stormy / Dark and dim ✓ / Bright and sparkling
  - Part B: tap the clue words that show the meaning (any one): "indistinct"
  - Proof sentence: "Far below him the Tappan Zee spread its dusky and indistinct waste of waters, with here and there the tall mast of a sloop, riding quietly at anchor under the land."
  - Hint: Can he see the water clearly?
  - Why: The water is a "dusky and indistinct waste": dusky means dark and hard to see.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Discovery (figurative): "the very witching time of night". Witching time: midnight, when spirits are said to roam.

**Chunk 7** (¶58 sentences 4 to 6; 114 words) · the twist

- Question (Catch the Lie, tap the sentence): Hans Van Ripper describes the ride back. One thing he says is false. Tap the line that proves it.
  - Key words highlighted: false
  - Testimony (Hans Van Ripper): "That night the way was lively. Dogs barked right beside him and farm folk were still out and about."
  - Proof sentence: "In the dead hush of midnight, he could even hear the barking of the watchdog from the opposite shore of the Hudson; but it was so vague and faint as only to give an idea of his distance from this faithful companion of man."
  - Proof sentence: "No signs of life occurred near him, but occasionally the melancholy chirp of a cricket, or perhaps the guttural twang of a bullfrog from a neighboring marsh, as if sleeping uncomfortably and turning suddenly in his bed."
  - Hint: How far away was the dog? Was anyone near him?
  - Why: The watchdog barked from the opposite shore, faint and far, and no signs of life occurred near him.
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Katrina imagines his ride home. One detail is untrue. Tap the sentence that shows it.
  - Testimony (Katrina Van Tassel): "Every creature was sound asleep. Not one sound broke the silence the whole way."
  - Proof sentence: "Now and then, too, the long-drawn crowing of a cock, accidentally awakened, would sound far, far off, from some farmhouse away among the hills--but it was like a dreaming sound in his ear."
  - Hint: What did he hear far off among the hills?
  - Why: Now and then the long-drawn crowing of a cock sounded far off among the hills.
  - Standards: ELA.K12.EE.1.1
- Gist check: The night is filled with fiddle music and laughter from a nearby farm dance on the hill. / The night is so still that Ichabod hears only faraway dogs, roosters, crickets and frogs. ✓ / The night is so noisy that Ichabod cannot hear his own horse's hooves.
- Discovery (figurative): "faithful companion of man". A fancy name for a dog.

**Chunk 8** (¶59 sentences 1 to 4; 71 words)

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what Ichabod's lonely ride suggests about how the tales we hear shape our fears.
  - A strong answer: Frightening tales we hear can come back to haunt us, making ordinary darkness feel full of danger.
  - Key ideas (one from each group): tale, stor, heard, hear, legend | fear, terror, scar, fright, haunt, danger, dread
  - Proof sentence: "All the stories of ghosts and goblins that he had heard in the afternoon now came crowding upon his recollection."
  - Hint: What comes crowding back as the night grows darker?
  - Why: All the ghost stories he heard come crowding upon his recollection: the tales now feed his terror.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using your own words, tell in one sentence what this chunk suggests about being alone at night.
  - A strong answer: Being alone in the dark makes the mind run wild, turning every memory into a fear.
  - Key ideas (one from each group): alone, lonely, dark, night, by himself, isolat | mind, imagin, fear, wild, memor, scare, dread, run
  - Proof sentence: "All the stories of ghosts and goblins that he had heard in the afternoon now came crowding upon his recollection."
  - Hint: What does his mind do as he rides alone?
  - Why: He never felt so lonely and dismal, and every story comes crowding back: alone in the dark, the mind runs wild.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Discovery (figurative): "came crowding upon his recollection". The memories push in on him like a crowd.

**Chunk 9** (¶59 sentences 5 to 8; 121 words) · the boss (double points)

- Question (Read Between the Lines, two-part evidence): Why might people feel both respect and fear around the great tree?
  - Key words highlighted: respect and fear
  - Choices: It is tied to a sad death and to eerie tales ✓ / It is the oldest tree the Dutch planted / Its bark is used to cure sickness
  - Proof sentence: "The common people regarded it with a mixture of respect and superstition, partly out of sympathy for the fate of its ill-starred namesake, and partly from the tales of strange sights, and doleful lamentations, told concerning it."
  - Hint: Whose fate is it named for, and what is told about it?
  - Why: People feel sympathy for the fate of Major André and fear from the tales of strange sights told about the tree.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): What does calling the tree "a kind of landmark" suggest?
  - Key words highlighted: landmark
  - Choices: Everyone in the area knows it ✓ / It marks a buried treasure / It is a dangerous place to stop
  - Proof sentence: "In the centre of the road stood an enormous tulip-tree, which towered like a giant above all the other trees of the neighborhood, and formed a kind of landmark."
  - Hint: What is a landmark used for?
  - Why: It towers above every other tree: a landmark everyone knows and finds their way by.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Discovery (vocabulary): "gnarled and fantastic". Gnarled: twisted and knotty.

**Chunk 10** (¶60 sentences 1 to 4; 121 words)

- Question (Story Order, drag and drop: Cause and effect): Connect each real cause at the tree to the fright it gives Ichabod.
  - Slots: A blast of wind in the dry branches / A lightning scar on the trunk / Two boughs rubbing together
  - Piece: He thinks his whistle is answered → A blast of wind in the dry branches (backed by "As Ichabod approached this fearful tree, he began to whistle; he thought his whistle was a…")
  - Piece: He thinks something white hangs in the tree → A lightning scar on the trunk (backed by "As he approached a little nearer, he thought he saw something white, hanging in the midst …")
  - Piece: He hears a groan and his teeth chatter → Two boughs rubbing together (backed by "Suddenly he heard a groan--his teeth chattered, and his knees smote against the saddle: it…")
  - Hint: Each sentence gives a fright and then what it really was.
  - Why: The wind sounds like an answering whistle, the bare lightning scar looks like something white, and rubbing boughs groan.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Bank question (Story Order, two-part evidence): What do all three frights at the tree turn out to be?
  - Key words highlighted: turn out to be
  - Choices: Real ghosts from the old fireside tales / Tricks played on him by Brom's gang / Ordinary sights and sounds of nature ✓
  - Proof sentence: "Suddenly he heard a groan--his teeth chattered, and his knees smote against the saddle: it was but the rubbing of one huge bough upon another, as they were swayed about by the breeze."
  - Hint: What was the groan, really?
  - Why: Each fright is something natural: wind, a lightning scar, and boughs rubbing in the breeze.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Gist check: Every scary sign at the tree turns out to be a real ghost waiting for him. / Every scary sign at the tree turns out to be wind, lightning damage or rubbing branches. ✓ / Every scary sign at the tree turns out to be Brom's gang hiding in the branches to play a trick.
- Discovery (figurative): "his knees smote against the saddle". His knees knock together in fear.

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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 5; level 2: chunks 6 to 10. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 4 (10 seconds, recalls chunk 1): What served as the bridge at Wiley's Swamp? Answer: "A few rough logs, laid side by side, served for a bridge over this stream."
- Lightning beat after chunk 8 (10 seconds, recalls chunk 6): What did Ichabod burst into, with his eyes shut? Answer: "Once more he cudgelled the sides of the inflexible Gunpowder, and, shutting his eyes, broke forth with involuntary fervor into a psalm tune."

**Chunk 1** (¶61 sentences 1 to 3; 72 words) · warm-up

- Question (Find It, tap the sentence): Which line describes what the crossing is made of?
  - Key words highlighted: made of
  - Proof sentence: "A few rough logs, laid side by side, served for a bridge over this stream."
  - Hint: Look for what was laid side by side.
  - Why: A few rough logs, laid side by side, served for a bridge.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line shows how dark the trees made the spot?
  - Key words highlighted: how dark
  - Proof sentence: "On that side of the road where the brook entered the wood, a group of oaks and chestnuts, matted thick with wild grape-vines, threw a cavernous gloom over it."
  - Hint: Look for oaks, chestnuts and grape-vines.
  - Why: Oaks and chestnuts matted with wild grape-vines threw a cavernous gloom over it.
  - Standards: ELA.K12.EE.1.1
- Gist check: Past the tree, a stone bridge crosses a wide river into a sunny meadow. / Past the tree, the road ends at a locked gate beside the church. / Past the tree, a log bridge crosses a brook into a dark, swampy glen. ✓
- Discovery (figurative): "a cavernous gloom". So dark under the trees it feels like a cave.

**Chunk 2** (¶61 sentences 4 to 6; 62 words) · warm-up

- Question (Read Between the Lines, two-part evidence): What can you infer about why travelers dread this crossing?
  - Key words highlighted: infer
  - Choices: It is badly broken and about to fall into the water / It is guarded by soldiers who stop every traveler / It is tied to a real capture and many haunted tales ✓
  - Proof sentence: "It was at this identical spot that the unfortunate André was captured, and under the covert of those chestnuts and vines were the sturdy yeomen concealed who surprised him."
  - Proof sentence: "This has ever since been considered a haunted stream, and fearful are the feelings of the schoolboy who has to pass it alone after dark."
  - Hint: What happened here long ago, and what has it been considered ever since?
  - Why: André was captured at this very spot, and it has ever since been considered a haunted stream.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): What does the detail about the schoolboy add to the scene?
  - Key words highlighted: schoolboy
  - Choices: Children like to play games at the stream / The school stands right beside the bridge / Even locals fear the spot alone at night ✓
  - Proof sentence: "This has ever since been considered a haunted stream, and fearful are the feelings of the schoolboy who has to pass it alone after dark."
  - Hint: How does the boy feel passing it alone?
  - Why: Fearful are the feelings of the schoolboy who has to pass it alone after dark: everyone who knows the place dreads it.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Discovery (vocabulary): "sturdy yeomen". Yeomen: farmers who owned their land; here, the men who caught André.

**Chunk 3** (¶62 sentences 1 to 2; 108 words)

- Question (Character Clue, two-part evidence): Which trait does Gunpowder show at the water?
  - Key words highlighted: trait
  - Choices: Sleepy, lying down right in the middle of the road / Stubborn, refusing to go where he's steered ✓ / Obedient, trotting straight ahead at once
  - Proof sentence: "As he approached the stream, his heart began to thump; he summoned up, however, all his resolution, gave his horse half a score of kicks in the ribs, and attempted to dash briskly across the bridge; but instead of starting forward, the perverse old animal made a lateral movement, and ran broadside against the fence."
  - Hint: What does the horse do instead of starting forward?
  - Why: The perverse old animal makes a sideways move and runs against the fence instead of crossing.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Bank question (Character Clue, two-part evidence): What does all his frantic effort show about Ichabod at the bridge?
  - Key words highlighted: frantic effort
  - Choices: He is desperate to get across fast ✓ / He is angry at the horse for no reason / He is calm and fully in control
  - Proof sentence: "Ichabod, whose fears increased with the delay, jerked the reins on the other side, and kicked lustily with the contrary foot: it was all in vain; his steed started, it is true, but it was only to plunge to the opposite side of the road into a thicket of brambles and alder bushes."
  - Hint: What happens to his fears as he waits?
  - Why: His fears increase with the delay, and he jerks the reins and kicks lustily, all in vain.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Discovery (figurative): "his heart began to thump". Thump: the sound of his heart pounding with fear.

**Chunk 4** (¶62 sentences 3 to 6; 102 words) · surprise double points

- Question (Figure It Out, multiple choice): Read the words "like some gigantic monster ready to spring." What kind of figurative language is this?
  - Key words highlighted: gigantic monster
  - Choices: Simile: the dark shape is compared to a monster using like ✓ / Metaphor: the shape is called a monster, without like / Personification: the old bridge seems to leap up at him
  - What does it mean? A real monster has lived under the bridge for years / The shape is a friendly neighbor waving / The shape looks huge, threatening and ready to attack ✓
  - Hint: Look for the word like. What would a monster ready to spring do?
  - Why: The shape is compared to a monster gathered to pounce: huge, still and threatening.
  - Standards: ELA.7.R.3.1
- Bank question (Figure It Out, multiple choice): The narrator writes "a plashy tramp." Which device is this?
  - Key words highlighted: plashy tramp
  - Choices: Simile: the sound is compared using like / Personification: the brook walks / Onomatopoeia: the words copy a wet step ✓
  - What does Ichabod hear? Something heavy stepping in wet ground ✓ / Rain pattering down on the old log bridge / A small frog jumping into the water
  - Hint: Say it out loud. What does it sound like?
  - Why: Plashy tramp sounds like a heavy foot splashing in mud: something large is moving by the brook.
  - Standards: ELA.7.R.3.1
- Gist check: Gunpowder stops at the bridge, and Ichabod sees a huge dark shape looming by the brook. ✓ / Gunpowder races over the bridge, and Ichabod sees Katrina waiting by the brook. / Gunpowder slips and falls into the brook, and Ichabod swims hard to the other side.
- Discovery (vocabulary): "a plashy tramp". Plashy: splashing. He hears a heavy step in the wet ground.

**Chunk 5** (¶63 sentences 1 to 5; 68 words) · the twist, checkpoint after this chunk, then the burst

- Question (Catch the Lie, tap the sentence): Brom Bones tells what Ichabod did next. One thing he says is false. Tap the line that proves it.
  - Key words highlighted: false
  - Testimony (Brom Bones): "The schoolmaster wheeled around and galloped off the moment he saw the stranger. Never said a word to him."
  - Proof sentence: "To turn and fly was now too late; and besides, what chance was there of escaping ghost or goblin, if such it was, which could ride upon the wings of the wind?"
  - Proof sentence: "Summoning up, therefore, a show of courage, he demanded in stammering accents, “Who are you?”"
  - Hint: Could he still flee? And did he speak?
  - Why: It was too late to turn and fly, so he summoned a show of courage and stammered, Who are you?
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Hans Van Ripper tells it another way. One detail is untrue. Tap the sentence that shows it.
  - Testimony (Hans Van Ripper): "The stranger answered him straight off and told him his name."
  - Proof sentence: "He received no reply."
  - Hint: What came back when Ichabod asked who it was?
  - Why: He received no reply.
  - Standards: ELA.K12.EE.1.1
- Discovery (figurative): "upon the wings of the wind". So fast it seems to fly on the wind.

**Chunk 6** (¶63 sentences 6 to 10; 85 words)

- Question (Story Order, drag and drop: Put events in order): Put the moments before the shape moves in order.
  - Slots: First / Next / Then / Last
  - Piece: He asks again, in a shakier voice → First (backed by "He repeated his demand in a still more agitated voice.")
  - Piece: Still there is no answer → Next (backed by "Still there was no answer.")
  - Piece: He shuts his eyes and bursts into a psalm → Then (backed by "Once more he cudgelled the sides of the inflexible Gunpowder, and, shutting his eyes, brok…")
  - Piece: The shape bounds into the middle of the road → Last (backed by "Just then the shadowy object of alarm put itself in motion, and with a scramble and a boun…")
  - Hint: Follow the sentences one by one.
  - Why: He repeats his demand, gets no answer, sings a psalm with his eyes shut, and then the shape springs into the road.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Bank question (Story Order, two-part evidence): What happens just as Ichabod begins his psalm?
  - Key words highlighted: just as
  - Choices: The shape leaps into the road ✓ / The shape calls him by name / The shape melts into the trees
  - Proof sentence: "Just then the shadowy object of alarm put itself in motion, and with a scramble and a bound stood at once in the middle of the road."
  - Hint: Read the sentence that starts "Just then."
  - Why: Just then the shadowy object put itself in motion and stood at once in the middle of the road.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Discovery (vocabulary): "with involuntary fervor". Involuntary: without meaning to. He bursts into song from pure fear.

**Chunk 7** (¶63 sentences 11 to 12, ¶64 sentences 1 to 2; 96 words)

- Question (Read Between the Lines, choose two): Which two things make the stranger seem threatening?
  - Key words highlighted: threatening
  - Choices (choose 2): He keeps pace whenever Ichabod speeds up ✓ / He rides silently on the horse's blind side ✓ / He offers to guide Ichabod safely home / He waves a lantern as a friendly greeting
  - Hint: What does he do, and what does he never do?
  - Why: He keeps aloof on Gunpowder's blind side without a word, and quickens his horse to match every change of pace.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): What does the rider's keeping up suggest he wants?
  - Key words highlighted: keeping up
  - Choices: To race Ichabod for a bowl of punch / To stay with Ichabod no matter what ✓ / To ask the way home through the dark
  - Proof sentence: "The stranger, however, quickened his horse to an equal pace."
  - Hint: What happens each time Ichabod tries to leave him behind?
  - Why: When Ichabod quickens his steed to leave him behind, the stranger quickens his horse to an equal pace.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The figure is a small farm boy on a pony who quickly falls far behind on the hill. / The figure is a farmer with a cart who waves and turns down a lane. / The figure is a big rider on a black horse who keeps pace with Ichabod however he rides. ✓
- Discovery (vocabulary): "jogging along on the blind side". Blind side: the side the horse can't see, since Gunpowder has one blind eye.

**Chunk 8** (¶64 sentences 3 to 7; 134 words)

- Question (Word Detective, two-part evidence): In this chunk, what does pertinacious mean?
  - Key words highlighted: pertinacious
  - Choices: Stubbornly sticking close ✓ / Kind, cheerful and very talkative / Small and easily scared
  - Proof sentence: "Ichabod pulled up, and fell into a walk, thinking to lag behind,--the other did the same."
  - Hint: What does the companion do every time Ichabod changes pace?
  - Why: Whenever Ichabod slows, "the other did the same": pertinacious means stubbornly holding on.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Bank question (Word Detective, two-part evidence): Which meaning of dogged fits the stranger's silence?
  - Key words highlighted: dogged
  - Choices: Stubborn and unbroken ✓ / Barking loudly and noisily / Friendly, warm and chatty
  - Proof sentence: "Ichabod pulled up, and fell into a walk, thinking to lag behind,--the other did the same."
  - Hint: Does the companion ever give up or speak?
  - Why: He copies every move and never says a word: a dogged silence is stubborn and unbroken.
  - Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Discovery (figurative): "clove to the roof of his mouth". His mouth is so dry with fear that his tongue sticks.

**Chunk 9** (¶64 sentences 8 to 10; 75 words) · the boss (double points)

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what the chase suggests about how fear can take over a person.
  - A strong answer: Fear can grow until it takes over completely, driving a person to desperate, reckless action.
  - Key ideas (one from each group): fear, terror, panic, scar, dread, fright | take over, grow, control, desperat, reckless, wild, overwhelm, swallow, consume, think
  - Proof sentence: "His terror rose to desperation; he rained a shower of kicks and blows upon Gunpowder, hoping by a sudden movement to give his companion the slip; but the spectre started full jump with him."
  - Hint: What does his terror rise to?
  - Why: His terror rises to desperation, and he rains kicks and blows on Gunpowder: fear takes over completely.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using your own words, tell in one sentence what this chase suggests about believing in ghost stories.
  - A strong answer: Believing too strongly in ghost stories can turn a frightening moment into pure panic.
  - Key ideas (one from each group): believ, belief, ghost, stor, tale, superstit | panic, terror, fear, scar, desperat, flee, run, worse
  - Proof sentence: "His terror rose to desperation; he rained a shower of kicks and blows upon Gunpowder, hoping by a sudden movement to give his companion the slip; but the spectre started full jump with him."
  - Hint: Think of all the tales he heard that evening.
  - Why: Full of the evening's tales, he believes the spectre is real and his terror rises to desperation.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Discovery (figurative): "through thick and thin". Through everything in their way.

**Chunk 10** (¶65 sentences 1 to 2; 75 words)

- Question (Story Order, drag and drop: Put events in order): Put the end of the chase in order.
  - Slots: First / Next / Last
  - Piece: They reach the road to Sleepy Hollow → First (backed by "They had now reached the road which turns off to Sleepy Hollow; but Gunpowder, who seemed …")
  - Piece: Gunpowder turns the opposite way, downhill → Next (backed by "They had now reached the road which turns off to Sleepy Hollow; but Gunpowder, who seemed …")
  - Piece: The road leads on toward the goblin bridge → Last (backed by "This road leads through a sandy hollow shaded by trees for about a quarter of a mile, wher…")
  - Hint: Which road should they take, and which do they take?
  - Why: They reach the Sleepy Hollow road, Gunpowder plunges the other way downhill, and that road leads to the bridge famous in goblin story.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Bank question (Story Order, two-part evidence): Why is Gunpowder's wrong turn bad news for Ichabod?
  - Key words highlighted: wrong turn
  - Choices: It heads to the bridge of goblin tales ✓ / It leads back to the Van Tassel farm / It ends at a deep, wide river
  - Proof sentence: "This road leads through a sandy hollow shaded by trees for about a quarter of a mile, where it crosses the bridge famous in goblin story; and just beyond swells the green knoll on which stands the whitewashed church."
  - Hint: What does this road cross?
  - Why: The road crosses "the bridge famous in goblin story," right where the Horseman is said to ride.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Gist check: Instead of running, Gunpowder stops in the road and refuses to move another single step. / Instead of the road home, Gunpowder plunges downhill toward the haunted bridge and the church. ✓ / Taking the road home, Gunpowder trots safely to Hans Van Ripper's farm.
- Discovery (figurative): "possessed with a demon". The horse acts as if a demon were driving it.

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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 5; level 2: chunks 6 to 10. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 4 (10 seconds, recalls chunk 2): Whose Sunday saddle did Ichabod lose? Answer: "For a moment the terror of Hans Van Ripper’s wrath passed across his mind,--for it was his Sunday saddle; but this was no time for petty fears; the goblin was hard on his haunches; and (unskilful rider that he was!) he had much ado to maintain his seat; sometimes slipping on one side, sometimes on another, and sometimes jolted on the high ridge of his horse’s backbone, with a violence that he verily feared would cleave him asunder."
- Lightning beat after chunk 8 (10 seconds, recalls chunk 6): Where was Gunpowder found the next morning? Answer: "The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate."

**Chunk 1** (¶66 sentences 1 to 2; 90 words) · warm-up

- Question (Find It, tap the sentence): Which line shows the moment his seat starts to fail?
  - Key words highlighted: seat starts to fail
  - Proof sentence: "As yet the panic of the steed had given his unskilful rider an apparent advantage in the chase, but just as he had got half way through the hollow, the girths of the saddle gave way, and he felt it slipping from under him."
  - Hint: Look for straps giving way.
  - Why: The girths of the saddle gave way, and he felt it slipping from under him.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line shows how Ichabod kept from tumbling off?
  - Key words highlighted: tumbling off
  - Proof sentence: "He seized it by the pommel, and endeavored to hold it firm, but in vain; and had just time to save himself by clasping old Gunpowder round the neck, when the saddle fell to the earth, and he heard it trampled under foot by his pursuer."
  - Hint: What does he grab hold of?
  - Why: He had just time to save himself by clasping old Gunpowder round the neck.
  - Standards: ELA.K12.EE.1.1
- Gist check: Halfway through the hollow the horse stops, and Ichabod climbs a tree to hide. / Halfway through the hollow Ichabod stops to buy a sturdy new saddle from a passing farmer. / Halfway through the hollow the saddle slips off, and Ichabod clings to Gunpowder's neck. ✓
- Discovery (vocabulary): "the girths of the saddle gave way". Girths: straps under a horse's belly that hold the saddle on.

**Chunk 2** (¶66 sentences 3 to 3; 78 words) · warm-up

- Question (Read Between the Lines, two-part evidence): What can you infer about Ichabod's worries even in the middle of the chase?
  - Key words highlighted: infer
  - Choices: He still fears Hans will be furious about the lost saddle ✓ / He worries he left the schoolhouse door unlocked / He fears Katrina will laugh at him and his tired old horse
  - Proof sentence: "For a moment the terror of Hans Van Ripper’s wrath passed across his mind,--for it was his Sunday saddle; but this was no time for petty fears; the goblin was hard on his haunches; and (unskilful rider that he was!) he had much ado to maintain his seat; sometimes slipping on one side, sometimes on another, and sometimes jolted on the high ridge of his horse’s backbone, with a violence that he verily feared would cleave him asunder."
  - Hint: Whose saddle was it, and which one?
  - Why: The terror of Hans Van Ripper's wrath passed across his mind, for it was his Sunday saddle.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): What does the aside "(unskilful rider that he was!)" suggest about the chase?
  - Key words highlighted: unskilful rider
  - Choices: He is the finest rider in the valley / He is riding a horse for the first time / Staying on the horse is a struggle for him ✓
  - Proof sentence: "For a moment the terror of Hans Van Ripper’s wrath passed across his mind,--for it was his Sunday saddle; but this was no time for petty fears; the goblin was hard on his haunches; and (unskilful rider that he was!) he had much ado to maintain his seat; sometimes slipping on one side, sometimes on another, and sometimes jolted on the high ridge of his horse’s backbone, with a violence that he verily feared would cleave him asunder."
  - Hint: How well does he keep his seat?
  - Why: He has much ado to keep his seat, slipping from side to side and jolted on the horse's backbone.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Discovery (vocabulary): "petty fears". Petty: small and unimportant, next to a goblin chase.

**Chunk 3** (¶67 sentences 1 to 5; 74 words) · the twist

- Question (Catch the Lie, tap the sentence): Hans Van Ripper guesses what the schoolmaster was thinking. One thing he says is false. Tap the line that proves it.
  - Key words highlighted: false
  - Testimony (Hans Van Ripper): "He thought that bridge was the worst place to be caught, and he tried to keep far away from it."
  - Proof sentence: "He recollected the place where Brom Bones’s ghostly competitor had disappeared."
  - Proof sentence: "“If I can but reach that bridge,” thought Ichabod, “I am safe.”"
  - Hint: What did Ichabod remember about that spot, and what did he think?
  - Why: He remembered where Brom's ghostly rival vanished and thought, If I can but reach that bridge, I am safe.
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Katrina imagines his flight. One detail is untrue. Tap the sentence that shows it.
  - Testimony (Katrina Van Tassel): "In that darkness he had no idea where he was. He never even saw the church."
  - Proof sentence: "He saw the walls of the church dimly glaring under the trees beyond."
  - Hint: What did he see beyond the trees?
  - Why: He saw the walls of the church dimly glaring under the trees beyond.
  - Standards: ELA.K12.EE.1.1
- Discovery (figurative): "a silver star in the bosom of the brook". The star's reflection shines in the water like silver.

**Chunk 4** (¶67 sentences 6 to 7; 70 words)

- Question (Read Between the Lines, choose two): Which two details show how close the pursuer has come?
  - Key words highlighted: how close
  - Choices (choose 2): It stops to drink at the brook / Ichabod hears it panting right behind him ✓ / He imagines he feels its hot breath ✓ / He sees it far back beside the church
  - Hint: What can he hear and feel?
  - Why: He hears the black steed panting and blowing close behind him, and even fancies he feels its hot breath.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): Why does Ichabod glance over his shoulder once he has crossed?
  - Key words highlighted: glance over his shoulder
  - Choices: He wants to wave goodbye to Katrina's house / He hopes to spot his fallen saddle / He expects the goblin to vanish, as in the tales ✓
  - Proof sentence: "Another convulsive kick in the ribs, and old Gunpowder sprang upon the bridge; he thundered over the resounding planks; he gained the opposite side; and now Ichabod cast a look behind to see if his pursuer should vanish, according to rule, in a flash of fire and brimstone."
  - Hint: What is supposed to happen "according to rule"?
  - Why: He looks to see if his pursuer will vanish, according to rule, in a flash of fire and brimstone, as in Brom's tale.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: With the black horse breathing at his back, Ichabod gallops over the bridge and looks back. ✓ / With no one behind him, Ichabod walks his horse slowly over the bridge. / With the black horse calmly beside him, Ichabod stops to rest and talk on the bridge.
- Discovery (vocabulary): "fire and brimstone". Brimstone: burning sulfur, linked with demons in old stories.

**Chunk 5** (¶67 sentences 8 to 10; 59 words) · surprise double points, checkpoint after this chunk, then the burst

- Question (Story Order, drag and drop: Put events in order): Put the goblin's attack in order.
  - Slots: First / Next / Then / Last
  - Piece: The goblin rises in his stirrups to throw his head → First (backed by "Just then he saw the goblin rising in his stirrups, and in the very act of hurling his hea…")
  - Piece: Ichabod tries to dodge, too late → Next (backed by "Ichabod endeavored to dodge the horrible missile, but too late.")
  - Piece: It strikes him with a tremendous crash → Then (backed by "It encountered his cranium with a tremendous crash,--he was tumbled headlong into the dust…")
  - Piece: The horses and rider sweep past like a whirlwind → Last (backed by "It encountered his cranium with a tremendous crash,--he was tumbled headlong into the dust…")
  - Hint: Follow the three sentences from start to finish.
  - Why: The goblin rises and hurls his head, Ichabod's dodge comes too late, it crashes against him, and everything sweeps past like a whirlwind.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Bank question (Story Order, two-part evidence): What finally knocks Ichabod to the ground?
  - Key words highlighted: knocks
  - Choices: The head the goblin hurls at him ✓ / A low branch over the bridge / Gunpowder bucking him off
  - Proof sentence: "It encountered his cranium with a tremendous crash,--he was tumbled headlong into the dust, and Gunpowder, the black steed, and the goblin rider, passed by like a whirlwind."
  - Hint: What hits his cranium?
  - Why: The horrible missile meets his cranium with a tremendous crash and he tumbles headlong into the dust.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Discovery (figurative): "the horrible missile". Missile: something thrown. The head becomes a weapon.

**Chunk 6** (¶68 sentences 1 to 4; 75 words)

- Question (Character Clue, two-part evidence): Which trait does Hans show when the teacher goes missing?
  - Key words highlighted: trait
  - Choices: Calm, sure that all is perfectly fine / Worried, though partly about his own saddle ✓ / Overjoyed to be rid of his hungry boarder
  - Proof sentence: "Hans Van Ripper now began to feel some uneasiness about the fate of poor Ichabod, and his saddle."
  - Hint: What is he uneasy about, besides Ichabod?
  - Why: He begins to feel uneasy about the fate of poor Ichabod, and his saddle: worried, but not only for his boarder.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Bank question (Character Clue, two-part evidence): What does Gunpowder's behavior the next morning suggest about him?
  - Key words highlighted: next morning
  - Choices: He is badly hurt and cannot stand up / He is calm, as if nothing much happened ✓ / He is wild and still running in terror
  - Proof sentence: "The next morning the old horse was found without his saddle, and with the bridle under his feet, soberly cropping the grass at his master’s gate."
  - Hint: What is he doing at the gate?
  - Why: He is found soberly cropping the grass at his master's gate: quite untroubled.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Discovery (figurative): "soberly cropping the grass". The horse grazes calmly, as if nothing happened.

**Chunk 7** (¶68 sentences 5 to 6; 87 words) · the boss (double points)

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what this mystery suggests about how people interpret evidence.
  - A strong answer: The same clues can be explained in different ways, and people tend to choose the explanation they already believe.
  - Key ideas (one from each group): clue, evidence, hat, pumpkin, sign, proof, track | different, explain, more than one, believ, choose, interpret, read, ways, decide, expect
  - Proof sentence: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."
  - Hint: Could a hat and a shattered pumpkin mean more than one thing?
  - Why: A trampled saddle, hoofprints, a hat and a shattered pumpkin could point to a ghost or to a trick: the clues alone don't decide it.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using your own words, tell in one sentence what an unsolved mystery suggests about people's need for answers.
  - A strong answer: When people face a mystery, they reach for an explanation, even a strange one, rather than live with not knowing.
  - Key ideas (one from each group): mystery, unknown, not know, question, unsolved, answer | explain, explanation, story, need, want, reach, guess, believ, fill
  - Proof sentence: "In one part of the road leading to the church was found the saddle trampled in the dirt; the tracks of horses’ hoofs deeply dented in the road, and evidently at furious speed, were traced to the bridge, beyond which, on the bank of a broad part of the brook, where the water ran deep and black, was found the hat of the unfortunate Ichabod, and close beside it a shattered pumpkin."
  - Hint: What do people do when they find clues but no body?
  - Why: With only clues by the brook, the village needs a story to explain them, and soon finds one.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: Searchers find Ichabod asleep under the bridge with his hat over his face. / Searchers find nothing at all on the road or by the brook, not even a single hoofprint or a button. / Searchers find the trampled saddle, hoofprints to the bridge, Ichabod's hat and a smashed pumpkin. ✓
- Discovery (vocabulary): "a shattered pumpkin". Shattered: smashed to pieces.

**Chunk 8** (¶69 sentences 1 to 3; 73 words)

- Question (Find It, tap the sentence): Which line lists everything Ichabod owned?
  - Key words highlighted: owned
  - Proof sentence: "They consisted of two shirts and a half; two stocks for the neck; a pair or two of worsted stockings; an old pair of corduroy small-clothes; a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe."
  - Hint: Look for a list of clothes and odds and ends.
  - Why: Two shirts and a half, two stocks, stockings, small-clothes, a rusty razor, a psalm book and a broken pitch-pipe.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line shows no one could locate him in the water?
  - Key words highlighted: locate
  - Proof sentence: "The brook was searched, but the body of the schoolmaster was not to be discovered."
  - Hint: What happened when the brook was searched?
  - Why: The brook was searched, but the body of the schoolmaster was not to be discovered.
  - Standards: ELA.K12.EE.1.1
- Discovery (vocabulary): "a broken pitch-pipe". Pitch-pipe: a small pipe used to find the right note for singing.

**Chunk 9** (¶69 sentences 4 to 6; 137 words)

- Question (Weigh the Evidence, drag and drop: Build the case): Build the case that Hans blames book learning for what happened.
  - Slots: Claim / Proof sentence / Reason
  - Piece: Hans blames book learning for Ichabod's fate → Claim
  - Piece: "he never knew any good come of this same reading and writing" → Proof sentence (backed by "These magic books and the poetic scrawl were forthwith consigned to the flames by Hans Van…")
  - Piece: So he burns the books and keeps his children home from school → Reason (backed by "These magic books and the poetic scrawl were forthwith consigned to the flames by Hans Van…")
  - Piece: Ichabod had been paid a day or two before → belongs nowhere
  - Hint: A case needs a claim, a quotation that proves it, and a reason that connects them.
  - Why: Hans says no good comes of reading and writing, so he burns the books and ends his children's schooling; the pay proves nothing about his view.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Bank question (Weigh the Evidence, two-part evidence): Which detail best supports the claim that Ichabod hoped to win Katrina with words?
  - Key words highlighted: win Katrina
  - Choices: He had just received a quarter's wages / He kept trying to write her a poem ✓ / He owned a book of dreams and fortunes
  - Proof sentence: "As to the books and furniture of the schoolhouse, they belonged to the community, excepting Cotton Mather’s “History of Witchcraft,” a “New England Almanac,” and a book of dreams and fortune-telling; in which last was a sheet of foolscap much scribbled and blotted in several fruitless attempts to make a copy of verses in honor of the heiress of Van Tassel."
  - Hint: What was scribbled on the sheet of foolscap?
  - Why: The sheet was blotted with several fruitless attempts at verses in honor of the heiress of Van Tassel.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Discovery (figurative): "consigned to the flames". Consigned to the flames: thrown into the fire.

**Chunk 10** (¶70 sentences 1 to 4; 126 words)

- Question (Read Between the Lines, two-part evidence): How much does the village seem to miss Ichabod?
  - Key words highlighted: miss
  - Choices: Not much: they gossip, then quickly move on ✓ / Deeply: they search the hills for him for years / Angrily: they blame Katrina for everything
  - Proof sentence: "As he was a bachelor, and in nobody’s debt, nobody troubled his head any more about him; the school was removed to a different quarter of the hollow, and another pedagogue reigned in his stead."
  - Hint: What happens to the school once he is gone?
  - Why: Since he owed no one, nobody troubled about him any more, and another teacher took his place.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): Why do the gossips decide the Galloping Hessian carried him off?
  - Key words highlighted: carried him off
  - Choices: His fate matches the old ghost stories ✓ / Brom confessed it in front of everyone / Ichabod left a note that said so
  - Proof sentence: "The stories of Brouwer, of Bones, and a whole budget of others were called to mind; and when they had diligently considered them all, and compared them with the symptoms of the present case, they shook their heads, and came to the conclusion that Ichabod had been carried off by the Galloping Hessian."
  - Hint: What did they compare the case with?
  - Why: They recall the stories of Brouwer, of Bones and others, compare them with the case, and decide the Hessian took him.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The neighbors decide Ichabod ran off with Katrina and send a search party after them. / The neighbors decide Brom did it and, after a stormy meeting, run him and his whole gang out of the valley for good. / The neighbors decide the Galloping Hessian carried Ichabod off, then forget him as a new teacher arrives. ✓
- Discovery (vocabulary): "a whole budget of others". Budget: here, a bundle or collection of stories.

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

Rebuilt to the phase 3 rules. Level 1: chunks 1 to 4; level 2: chunks 5 to 7. The Gist check comes on chunks 1, 4, 7 and 10. Each student gets one question per chunk from its bank (seeded by who they are; a replay gets another), at their version: easier (one wrong choice fewer, the hint shown) or harder (no highlighted key words, the proof step added), derived unless written out.

- Lightning beat after chunk 3 (10 seconds, recalls chunk 1): What post did Ichabod finally hold, according to the old farmer? Answer: "It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court."
- Lightning beat after chunk 5 (10 seconds, recalls chunk 4): Who slept through most of the storyteller's tale? Answer: "When his story was concluded, there was much laughter and approbation, particularly from two or three deputy aldermen, who had been asleep the greater part of the time."

**Chunk 1** (¶71 sentences 1 to 1; 116 words) · warm-up

- Question (Find It, tap the sentence): Which line reports Ichabod's later life far away?
  - Key words highlighted: later life
  - Proof sentence: "It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court."
  - Hint: Look for news brought back from New York.
  - Why: An old farmer brought word that Ichabod was alive, studied law and became a justice of the Ten Pound Court.
  - Standards: ELA.K12.EE.1.1
- Bank question (Find It, tap the sentence): Which line explains why Ichabod went away?
  - Key words highlighted: went away
  - Proof sentence: "It is true, an old farmer, who had been down to New York on a visit several years after, and from whom this account of the ghostly adventure was received, brought home the intelligence that Ichabod Crane was still alive; that he had left the neighborhood partly through fear of the goblin and Hans Van Ripper, and partly in mortification at having been suddenly dismissed by the heiress; that he had changed his quarters to a distant part of the country; had kept school and studied law at the same time; had been admitted to the bar; turned politician; electioneered; written for the newspapers; and finally had been made a justice of the Ten Pound Court."
  - Hint: Look for the words partly through fear.
  - Why: He left partly through fear of the goblin and Hans Van Ripper, and partly in mortification at being dismissed by the heiress.
  - Standards: ELA.K12.EE.1.1
- Gist check: Years later a farmer reports that Ichabod is alive and became a lawyer and a judge far away. ✓ / Years later a farmer reports that Ichabod's ghost haunts the schoolhouse at night. / Years later a farmer reports that Ichabod secretly married Katrina in New York and runs a shop.
- Discovery (vocabulary): "Ten Pound Court". A small local court that handled minor cases.

**Chunk 2** (¶71 sentences 2 to 2; 61 words) · warm-up

- Question (Weigh the Evidence, drag and drop: Fact or witness claim): Sort what the text reports about Brom from what some people only suspect.
  - Slots: The text reports it / Only some suspect it
  - Piece: Brom married Katrina soon after → The text reports it (backed by "Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katri…")
  - Piece: Brom looks knowing when the story is told → The text reports it (backed by "Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katri…")
  - Piece: Brom laughs heartily at any mention of the pumpkin → The text reports it (backed by "Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katri…")
  - Piece: Brom knew more than he chose to tell → Only some suspect it (backed by "Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katri…")
  - Hint: Look for the words "led some to suspect."
  - Why: The marriage, the knowing look and the laugh are reported; that he knew more is only what "some" suspect.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Bank question (Weigh the Evidence, two-part evidence): Which detail most strongly suggests Brom was behind Ichabod's fright?
  - Key words highlighted: behind
  - Choices: He marries Katrina soon after the ride / An old farmer later sees Ichabod in New York / He laughs heartily whenever the pumpkin comes up ✓
  - Proof sentence: "Brom Bones, too, who, shortly after his rival’s disappearance conducted the blooming Katrina in triumph to the altar, was observed to look exceedingly knowing whenever the story of Ichabod was related, and always burst into a hearty laugh at the mention of the pumpkin; which led some to suspect that he knew more about the matter than he chose to tell."
  - Hint: Which object was found by the brook?
  - Why: A shattered pumpkin lay by the hat, and Brom bursts into a hearty laugh at every mention of it.
  - Standards: ELA.K12.EE.1.1, ELA.K12.EE.3.1
- Discovery (figurative): "conducted the blooming Katrina in triumph to the altar". He marries her as if winning a prize.

**Chunk 3** (¶72 sentences 1 to 3; 130 words) · surprise double points

- Question (Theme Thread, one-sentence written answer): In one sentence, explain what the neighbors' choice suggests about why people prefer a thrilling tale to a plain answer.
  - A strong answer: People often prefer a thrilling tale to a plain explanation, because a good story is more fun to believe and to share.
  - Key ideas (one from each group): prefer, choose, rather, keep, believ, want | tale, story, stories, legend, ghost, thrill, exciting, fun, mystery, magic
  - Proof sentence: "The old country wives, however, who are the best judges of these matters, maintain to this day that Ichabod was spirited away by supernatural means; and it is a favorite story often told about the neighborhood round the winter evening fire."
  - Hint: What do the old wives maintain, and when do they tell it?
  - Why: The old wives insist he was spirited away, and it is a favorite story told round the winter fire: the thrilling version wins.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Bank question (Theme Thread, one-sentence written answer): Using your own words, tell in one sentence what this chunk suggests about how legends grow.
  - A strong answer: Legends grow as people keep retelling them, until even a bridge or an empty schoolhouse becomes part of the tale.
  - Key ideas (one from each group): legend, stor, tale, myth, ghost | grow, retell, repeat, spread, keep, change, bigger, place, haunt
  - Proof sentence: "The schoolhouse being deserted soon fell to decay, and was reported to be haunted by the ghost of the unfortunate pedagogue and the plowboy, loitering homeward of a still summer evening, has often fancied his voice at a distance, chanting a melancholy psalm tune among the tranquil solitudes of Sleepy Hollow."
  - Hint: What happens to the bridge and the old schoolhouse?
  - Why: The bridge becomes an object of awe and the deserted schoolhouse is reported haunted: the legend keeps spreading to new places.
  - Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Discovery (vocabulary): "an object of superstitious awe". Superstitious awe: fear and wonder based on belief in the supernatural.

**Chunk 4** (¶75 sentences 1 to 3; 98 words) · the twist, checkpoint after this chunk, then the burst

- Question (Catch the Lie, tap the sentence): Hans Van Ripper describes the man who first told this tale. One thing he says is false. Tap the sentence that proves it.
  - Testimony (Hans Van Ripper): "That storyteller was a rich man in fine clothes, with nothing to prove to anyone."
  - Proof sentence: "The narrator was a pleasant, shabby, gentlemanly old fellow, in pepper-and-salt clothes, with a sadly humourous face, and one whom I strongly suspected of being poor--he made such efforts to be entertaining."
  - Hint: How was the storyteller dressed, and why did he try so hard?
  - Why: He was a shabby old fellow in pepper-and-salt clothes, suspected of being poor because he tried so hard to entertain.
  - Standards: ELA.K12.EE.1.1
- Bank question (Catch the Lie, tap the sentence): Brom Bones claims to know how the tale went over. One detail is untrue. Tap the sentence that shows it.
  - Testimony (Brom Bones): "Every listener hung on each word and stayed wide awake to the very end."
  - Proof sentence: "When his story was concluded, there was much laughter and approbation, particularly from two or three deputy aldermen, who had been asleep the greater part of the time."
  - Hint: What were some of the deputy aldermen doing?
  - Why: Two or three deputy aldermen had been asleep the greater part of the time.
  - Standards: ELA.K12.EE.1.1
- Gist check: The postscript says the tale was found in a dead soldier's diary near the bridge. / The postscript says the tale was written down by Brom Bones himself to explain the smashed pumpkin. / The postscript says the tale was told at a city meeting by a shabby old fellow, to much laughter. ✓
- Discovery (vocabulary): "pepper-and-salt clothes". Pepper-and-salt: cloth speckled black and white.

**Chunk 5** (¶75 sentences 4 to 6; 125 words)

- Question (Shades of Meaning, drag and drop: Feeling of the word): Sort the gentleman's gestures: is he thinking it over, or demanding an answer?
  - Slots: Thinking it over / Demanding an answer
  - Piece: Folds his arms and looks at the floor → Thinking it over (backed by "There was, however, one tall, dry-looking old gentleman, with beetling eyebrows, who maint…")
  - Piece: Turns a doubt over in his mind → Thinking it over (backed by "There was, however, one tall, dry-looking old gentleman, with beetling eyebrows, who maint…")
  - Piece: Sticks one arm akimbo → Demanding an answer (backed by "When the mirth of the rest of the company had subsided, and silence was restored, he leane…")
  - Piece: Asks what the story went to prove → Demanding an answer (backed by "When the mirth of the rest of the company had subsided, and silence was restored, he leane…")
  - Hint: Is he quietly weighing the tale, or challenging the teller?
  - Why: Folded arms, a lowered gaze and a doubt turned over show him thinking; the arm akimbo and his question demand an answer.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Bank question (Shades of Meaning, two-part evidence): Why might the narrator give the gentleman "beetling eyebrows" rather than plain ones?
  - Key words highlighted: beetling
  - Choices: They jut out over a stern face ✓ / They are thin, pale and hard to see / They twitch whenever he laughs
  - Part B: tap the clue words that show the meaning (any one): "grave and rather severe face"
  - Proof sentence: "There was, however, one tall, dry-looking old gentleman, with beetling eyebrows, who maintained a grave and rather severe face throughout, now and then folding his arms, inclining his head, and looking down upon the floor, as if turning a doubt over in his mind."
  - Hint: What kind of face are they part of?
  - Why: Beetling brows jut out heavily, matching his grave and rather severe face.
  - Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Discovery (vocabulary): "beetling eyebrows". Beetling: sticking out over the eyes, like a frown.

**Chunk 6** (¶76 sentences 1 to 1, ¶77 sentences 1 to 1, ¶78 sentences 1 to 1, ¶79 sentences 1 to 1; 115 words) · the boss (double points)

- Question (Story Order, two-part evidence): What does the storyteller's chain of "therefore" and "ergo" really prove?
  - Key words highlighted: really prove
  - Choices: Nothing serious: it is a joke dressed as logic ✓ / That ghosts are real and very dangerous / That teachers should marry rich heiresses
  - Proof sentence: "“Ergo, for a country schoolmaster to be refused the hand of a Dutch heiress is a certain step to high preferment in the state.”"
  - Hint: Does being refused by an heiress really lead to high office?
  - Why: "Ergo," being refused an heiress leads to high preferment: the solemn logic is a joke that proves nothing.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Bank question (Story Order, two-part evidence): What is the first step in the storyteller's argument?
  - Key words highlighted: first step
  - Choices: Goblin troopers always win their races / Heiresses never marry schoolteachers / Every situation has its pleasures ✓
  - Proof sentence: "“That there is no situation in life but has its advantages and pleasures--provided we will but take a joke as we find it:"
  - Hint: Read his first quoted sentence.
  - Why: He begins: there is no situation in life but has its advantages and pleasures, provided we take a joke as we find it.
  - Standards: ELA.7.R.1.1, ELA.K12.EE.3.1
- Discovery (vocabulary): "goblin troopers". Troopers: cavalry soldiers; here, ghostly riders.

**Chunk 7** (¶80 sentences 1 to 2, ¶81 sentences 1 to 2; 85 words)

- Question (Read Between the Lines, two-part evidence): What can you infer from the last words of the tale?
  - Key words highlighted: infer
  - Choices: The teller swears every word is true / The teller once saw the ghost himself / Even the teller doubts much of the tale ✓
  - Proof sentence: "“Faith, sir,” replied the story-teller, “as to that matter, I don’t believe one-half of it myself.”"
  - Hint: How much of it does he believe?
  - Why: He admits, I don't believe one-half of it myself.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Bank question (Read Between the Lines, two-part evidence): Why might the storyteller give the gentleman a "triumphant leer"?
  - Key words highlighted: triumphant leer
  - Choices: He is tired and about to fall asleep / He enjoys puzzling the serious gentleman ✓ / He is angry at being questioned so closely
  - Proof sentence: "The cautious old gentleman knit his brows tenfold closer after this explanation, being sorely puzzled by the ratiocination of the syllogism, while, methought, the one in pepper-and-salt eyed him with something of a triumphant leer."
  - Hint: How does the gentleman look after the explanation?
  - Why: As the gentleman knits his brows, sorely puzzled, the storyteller eyes him with a triumphant leer: he enjoys it.
  - Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The doubtful gentleman questions the tale, and the storyteller admits he believes only half of it. ✓ / The doubtful gentleman is convinced, and the storyteller swears it all happened. / The doubtful gentleman leaves in a huff, and the storyteller starts a brand new ghost tale.
- Discovery (vocabulary): "the ratiocination of the syllogism". Ratiocination: careful reasoning. The gentleman is puzzled by the joking logic.

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
- Gist check: The narrator insists he is nervous but not mad, and boasts that his hearing is unusually sharp. ✓ / The narrator admits he has gone completely mad and begs the listener to forgive him for it all. / The narrator says he is deaf and cannot hear anything around him.
- Discovery (figurative): "very, very dreadfully nervous". The repeated words show how worked up he is.

**Chunk 14** (¶17 sentences 1 to 2, ¶18 sentences 1 to 2; 124 words)

- Question: What does the narrator insist explains what he hears?
- Key words highlighted: insist
- Choices: The old man left a clock running / His senses are unusually sharp, not mad ✓ / A ghost is knocking inside the walls
- Proof line: "And now — have I not told you that what you mistake for madness is but over acuteness of the senses? — now, I say, there came to my ears a low, dull, quick sound — much such a sound as a watch makes when enveloped in cotton."
- Refresher hint: What does he say you mistake for madness?
- Why: He says what you mistake for madness is but over acuteness of the senses.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: The narrator sees the old man smiling and hears him begin to sing. / The narrator sees the eye wide open, grows furious, and then hears a low, quick beating sound. ✓ / The narrator sees the eye tightly closed, calms down at once, and hears only the silence of the house.
- Discovery (figurative): "a hideous veil over it". The cloudy film over the eye is described like a veil.

**Chunk 18** (¶21 sentences 8 to 10, ¶22 sentences 1 to 2, ¶23 sentences 1 to 5; 108 words)

- Question: What does the narrator claim his careful hiding shows?
- Key words highlighted: claim
- Choices: That he is truly sorry / That the old man deserved it / That he cannot be mad ✓
- Proof line: "If, still, you think me mad, you will think so no longer when I describe the wise precautions I took for the concealment of the body."
- Refresher hint: What will you think no longer once he describes it?
- Why: If you still think him mad, he says, you will think so no longer when he describes his precautions.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: The narrator says the eye still haunts him, so he runs next door at once to tell a neighbor everything. / The narrator says the old man recovered, and they shared breakfast at dawn. / The narrator says the eye will trouble him no more and boasts of how carefully he hid what he had done. ✓
- Discovery (vocabulary): "the wise precautions". Precautions: steps taken to avoid trouble.

##### Find It

**Chunk 2** (¶2 sentences 1 to 7; 52 words)

- Question: Which line shows money was not his reason?
- Key words highlighted: money
- Proof line: "For his gold I had no desire."
- Refresher hint: Look for what he says about the old man's wealth.
- Why: For his gold I had no desire.
- Standards: ELA.K12.EE.1.1
- Gist check: The narrator says he hated the old man from the first day because he stole the family gold. / The narrator says the idea haunted him even though the old man never wronged him. ✓ / The narrator says the old man cheated him out of his gold.
- Discovery (figurative): "it haunted me day and night". The idea follows him everywhere, like a ghost.

**Chunk 16** (¶19 sentences 9 to 9, ¶20 sentences 1 to 5; 79 words)

- Question: Which line shows the narrator suddenly worried that someone next door will notice?
- Key words highlighted: someone next door
- Proof line: "And now a new anxiety seized me — the sound would be heard by a neighbor!"
- Refresher hint: Look for a new anxiety.
- Why: A new anxiety seized him: the sound would be heard by a neighbor.
- Standards: ELA.K12.EE.1.1
- Gist check: As the beating fades away, the narrator decides to leave the house quietly before dawn. / As the beating grows louder, the narrator wakes the old man to warn him. / As the beating grows louder, the narrator suddenly fears that a neighbor will hear it. ✓
- Discovery (figurative): "the dead hour of the night". The deepest, stillest part of the night.

**Chunk 20** (¶26 sentences 1 to 1, ¶27 sentences 1 to 8; 100 words)

- Question: Which line explains what brought the visitors to the door?
- Key words highlighted: brought the visitors
- Proof line: "A shriek had been heard by a neighbor during the night; suspicion of foul play had been aroused; information had been lodged at the police-office, and they (the officers) had been deputed to search the premises."
- Refresher hint: Look for what was heard, and by whom.
- Why: A shriek had been heard by a neighbor during the night, and the officers were sent to search.
- Standards: ELA.K12.EE.1.1
- Gist check: A neighbor reported smoke and a fire, and the narrator admits that he started it by accident. / A neighbor reported a theft, and the narrator blames the old man. / A neighbor reported a shriek, and the narrator calmly claims it was his own nightmare. ✓
- Discovery (vocabulary): "secure, undisturbed". Undisturbed: left exactly as it was.

**Chunk 24** (¶33 sentences 3 to 7, ¶34 sentences 1 to 3; 93 words)

- Question: Which line shows the narrator finally confessing?
- Key words highlighted: confessing
- Proof line: "I admit the deed! — tear up the planks! — here, here! — it is the beating of his hideous heart!”"
- Refresher hint: Look for the words he cries out at the end.
- Why: I admit the deed! It is the beating of his hideous heart!
- Standards: ELA.K12.EE.1.1
- Gist check: Convinced he has won, the narrator laughs and goes upstairs to sleep. / Convinced the officers are mocking him, the narrator cries out a confession and tells them where to look. ✓ / Convinced the officers believe every word, the narrator thanks them warmly and shows them out the front door.
- Discovery (vocabulary): "hypocritical smiles". Hypocritical: pretending to feel something you don't.

##### Figure It Out

**Chunk 3** (¶2 sentences 8 to 10; 66 words) · shared words reviewed

- Question: Read the words the eye of a vulture. What kind of figurative language is this?
- Key words highlighted: vulture
- Choices: Simile: the eye is compared to a hungry bird using like / Onomatopoeia: the words copy a bird's cry / Metaphor: the old man's eye is called a vulture's eye ✓
- What does it mean? The old man can fly like a bird / The old man can see very sharply, even in the dark / The eye seems cold, hungry and threatening to him ✓
- Refresher hint: What does a vulture do, and how might its eye feel to someone it stares at?
- Why: A vulture's eye watches and waits: to the narrator the old man's eye feels cold and threatening.
- Standards: ELA.7.R.3.1
- Gist check: The narrator praises the old man's bright, kind eyes and decides to protect him from harm. / The narrator blames the old man's loud voice and decides to move away. / The narrator blames the old man's pale, filmy eye and decides to kill him to be rid of it. ✓
- Discovery (figurative): "my blood ran cold". Fear so strong he feels it in his veins.

**Chunk 12** (¶13 sentences 1 to 4, ¶14 sentences 1 to 3; 139 words) · shared words reviewed

- Question: Read the words had stalked with his black shadow before him. What kind of figurative language is this?
- Key words highlighted: stalked
- Choices: Personification: death moves toward the old man like a person ✓ / Simile: death is compared to a shadow using like / Onomatopoeia: the words copy the sound of heavy footsteps on the floor
- What does it mean? The lantern casts a real, tall shadow across the bedroom wall / The old man senses something deadly coming that he cannot see ✓ / A stranger is walking down the hall
- Refresher hint: Can death really walk? What does the old man feel coming?
- Why: Death stalks like a person casting a shadow: the old man feels danger closing in.
- Standards: ELA.7.R.3.1
- Gist check: The old man tries to explain away the noise as wind or a mouse, but his fear keeps growing. ✓ / The old man decides the noise is a burglar and runs down the stairs to fetch the neighbors for help. / The old man laughs at the noise and goes back to sleep at once.
- Discovery (vocabulary): "the wind in the chimney". One of the harmless explanations the old man tries to believe.

##### Word Detective

**Chunk 4** (¶3 sentences 1 to 6; 59 words) · shared words reviewed

- Question: In this chunk, what does dissimulation mean?
- Key words highlighted: dissimulation
- Choices: Careful counting and measuring of things / A sudden loss of all courage / Hiding one's true feelings or plans ✓
- Proof words (any one): "I was never kinder to the old man"
- Refresher hint: How does he act toward the old man while planning to harm him?
- Why: He was never kinder than the week before: he hid his true intent behind kindness.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: The narrator argues that his careful planning proves he is sane, and he acts extra kind to the old man. ✓ / The narrator admits his plan was sloppy and rushed, and that he was rude to the old man all week. / The narrator says he forgot his plan and spent the whole week traveling.
- Discovery (vocabulary): "with what foresight". Foresight: planning ahead.

**Chunk 21** (¶28 sentences 1 to 1, ¶29 sentences 1 to 6; 104 words) · shared words reviewed

- Question: In this chunk, what does audacity mean?
- Key words highlighted: audacity
- Choices: Shocking, reckless boldness ✓ / Deep and quiet sadness / Careful, gentle politeness
- Proof line: "I was singularly at ease."
- Refresher hint: How does he feel while the officers sit there?
- Why: He sits over the very spot and is singularly at ease: shocking boldness.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: The narrator rudely sends the officers away, and they leave satisfied. / The narrator invites the officers to stay the whole night, and they all fall asleep in their chairs. / The narrator boldly seats the officers in the room, but soon he grows pale and wishes they would leave. ✓
- Discovery (vocabulary): "a ringing in my ears". A ringing in the ears: a sound that seems to come from inside your own head.

##### Character Clue

**Chunk 5** (¶4 sentences 1 to 4; 85 words)

- Question: Which trait does the narrator show each midnight?
- Key words highlighted: trait
- Choices: Shy and nervous, turning back at once / Patient and sneaky, moving with great care ✓ / Careless and loud, rushing straight into the room
- Proof words (any one): "very, very slowly"
- Refresher hint: How fast does he move his head?
- Why: He moved it very, very slowly so he would not disturb the old man.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: Each midnight the narrator slowly eases his head and a covered lantern through the old man's door. ✓ / Each morning the narrator bursts noisily into the old man's room carrying a bright, uncovered lamp. / Each midnight the narrator locks the old man's door from the outside.
- Discovery (vocabulary): "a dark lantern". Dark lantern: a lantern with a cover that can block its light.

**Chunk 15** (¶18 sentences 3 to 4, ¶19 sentences 1 to 8; 91 words)

- Question: Which trait does the narrator show as the sound grows?
- Key words highlighted: trait
- Choices: Boredom with the long, quiet night / Rising fury that he struggles to hold back ✓ / Calm pity for the frightened old man in bed
- Proof words (any one): "It increased my fury"
- Refresher hint: What does the sound do to him, and does he act at once?
- Why: It increased his fury, yet he refrained and kept still.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: The narrator hears distant church bells, and their slow, steady ringing calms his growing fury. / The narrator hears the old man snoring, and the sound makes him laugh. / The narrator believes he hears the old man's heart, and its growing beat fills him with fury. ✓
- Discovery (vocabulary): "the hellish tattoo of the heart". Tattoo: a steady drumbeat.

##### Read Between the Lines

**Chunk 6** (¶5 sentences 1 to 3; 79 words)

- Question: What can you infer from how slowly he inches into the room?
- Key words highlighted: infer
- Choices: He is obsessed, spending ages on each tiny step ✓ / He is lazy and dozes off in the doorway / He is lost in the dark and cannot find the right room
- Proof line: "It took me an hour to place my whole head within the opening so far that I could see the old man as he lay upon his bed."
- Refresher hint: How long does one small step take him?
- Why: It took him an hour just to place his head inside: an obsession with every detail.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Taking an hour to peek in, the narrator shines one thin ray of light onto the vulture eye. ✓ / Taking only a minute to peek in, the narrator lights every single lamp in the old man's room. / Peering through the window, the narrator sees the old man awake and reading.
- Discovery (vocabulary): "a single thin ray". A ray: a narrow beam of light.

**Chunk 10** (¶9 sentences 2 to 2, ¶10 sentences 1 to 1; 77 words)

- Question: What can you infer from the old man's question in the blackness?
- Key words highlighted: infer
- Choices: He is talking in his sleep about a dream / He senses someone is there and is frightened ✓ / He is expecting a late visitor and is pleased
- Proof line: "I had got my head in, and was about to open the lantern, when my thumb slipped upon the tin fastening, and the old man sprang up in bed, crying out — “Who's there?”"
- Refresher hint: What does he do, and what does he call out?
- Why: He sprang up in bed crying out, Who's there? He senses someone in the room.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: In the pitch-dark room the narrator's thumb slips, and the old man sits up crying out. ✓ / In the bright room the narrator's lantern falls, and the old man sleeps through it. / In the pitch-dark room the narrator trips, and the old man calls for the police.
- Discovery (figurative): "as black as pitch". A simile: the room is as dark as tar.

**Chunk 11** (¶11 sentences 1 to 3, ¶12 sentences 1 to 5; 143 words)

- Question: What can you infer about the narrator from his familiarity with that sound?
- Key words highlighted: infer
- Choices: He once worked as a doctor who treated patients / He has never been afraid of anything at all / He has felt the same terror himself on many nights ✓
- Proof line: "Many a night, just at midnight, when all the world slept, it has welled up from my own bosom, deepening, with its dreadful echo, the terrors that distracted me."
- Refresher hint: Where has he heard it before?
- Why: Many a night it has welled up from his own bosom: he knows that terror himself.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The old man falls back asleep at once, and the narrator quietly leaves the room, closing the door behind him. / The old man calls for help, and the narrator hides under the bed. / The old man sits awake listening, and the narrator recognizes his groan of terror from his own nights. ✓
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
- Choices: The visitors are too polite to mention it / The sound may exist only in the narrator's mind ✓ / The visitors are deaf and cannot hear anything
- Proof line: "I gasped for breath — and yet the officers heard it not."
- Refresher hint: He gasps for breath. Who hears it?
- Why: He gasped for breath, and yet the officers heard it not.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: The ringing becomes a beating sound that grows louder, though the officers seem not to hear it. ✓ / The ringing stops completely, and the narrator relaxes and laughs along with the friendly officers. / The ringing turns out to be church bells, and everyone leaves for church.
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
- Gist check: For seven nights the eye stays shut, and each morning the narrator greets the old man warmly. ✓ / For seven nights the eye stays wide open, and each morning the narrator avoids the old man entirely. / For seven nights the narrator sleeps soundly and never visits the old man.
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
- Gist check: At noon the narrator finishes a late breakfast, and three friendly neighbors bring him a cake. / Before dawn the narrator packs his bags and slips out the back door. / Before dawn the narrator finishes hiding his crime, and three police officers knock at the door. ✓
- Discovery (vocabulary): "with perfect suavity". Suavity: smooth, polite manners.

##### Shades of Meaning

**Chunk 8** (¶7 sentences 1 to 1, ¶8 sentences 1 to 4; 77 words) · shared words reviewed

- Question: Why does the narrator call it sagacity instead of just cleverness?
- Key words highlighted: sagacity
- Choices: It makes his plotting sound wise and grand to himself ✓ / It makes him sound humble, nervous and unsure of himself / It makes him sound sleepy and slow
- Proof words (any one): "feelings of triumph"
- Refresher hint: How does he feel about his own skill?
- Why: Sagacity means deep wisdom: he can scarcely contain his feelings of triumph.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: On the eighth night the narrator moves slower than a clock hand and feels proud of his own cleverness. ✓ / On the eighth night the narrator rushes into the room and suddenly feels ashamed of his whole plan. / On the eighth night the narrator stays in bed and gives up his plan.
- Discovery (figurative): "the extent of my own powers". He feels almost superhuman in his cleverness.

**Chunk 13** (¶15 sentences 1 to 1, ¶16 sentences 1 to 2; 102 words) · shared words reviewed

- Question: Why does the narrator repeat stealthily instead of just saying quietly?
- Key words highlighted: stealthily
- Choices: It shows he is tired and moving clumsily / It shows he secretly wants the old man to hear him / It stresses how secret and sly every movement is ✓
- Proof words (any one): "a very, very little crevice"
- Refresher hint: How much does he open the lantern?
- Why: Stealthily means slyly and secretly: he opens only a very, very little crevice.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: After waiting only a moment, the narrator throws open the lantern and fills the whole room with light. / After waiting a long time, the narrator shuts the door and goes back to bed. / After waiting a long time, the narrator opens the lantern a crack and a thin ray falls on the eye. ✓
- Discovery (figurative): "like the thread of the spider". A simile: the ray of light is as thin as a spider's thread.

**Chunk 23** (¶32 sentences 1 to 7, ¶33 sentences 1 to 2; 98 words) · shared words reviewed

- Question: Why does the narrator stress that the men chatted pleasantly instead of just talked?
- Key words highlighted: pleasantly
- Choices: It shows they are growing angry and impatient with him / It shows they are about to leave / It shows how calm they stay while he falls apart ✓
- Proof words (any one): "I paced the floor to and fro"
- Refresher hint: Compare what he is doing with what they are doing.
- Why: He paces the floor to and fro while they chat pleasantly: their calm makes his panic worse.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: The narrator falls asleep as the sound stops, while the officers leave. / The narrator paces and shouts as the sound grows, while the officers keep chatting and smiling. ✓ / The narrator sits quietly as the sound fades, while the officers search the cellar with lanterns.
- Discovery (vocabulary): "with heavy strides". Strides: long steps.

##### Theme Thread

**Chunk 9** (¶8 sentences 5 to 7, ¶9 sentences 1 to 1; 60 words)

- Question: Which pattern keeps coming back in the narrator's telling?
- Key words highlighted: keeps coming back
- Choices: He keeps praising the old man's kindness / He keeps insisting on his own cleverness and calm ✓ / He keeps apologizing for everything he planned to do
- Proof line: "To think that there I was, opening the door, little by little, and the old man not even to dream of my secret deeds or thoughts."
- Proof line: "I fairly chuckled at the idea."
- Refresher hint: What does he find funny?
- Why: He gloats that the old man cannot dream of his secret, and chuckles at the idea.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: The narrator shouts his secret, the old man laughs, and they talk until dawn. / The narrator chuckles at his secret, the old man stirs as if startled, but the narrator does not retreat. ✓ / The narrator weeps over his secret, the old man sleeps soundly on, and the narrator quietly goes back to bed.
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
- Choices: A family is preparing for a big party / The rooms were scrubbed clean for the visitors / Someone left suddenly, in the middle of chores ✓
- Proof line: "SCENE: _The kitchen in the now abandoned farmhouse of JOHN WRIGHT, a gloomy kitchen, and left without having been put in order--unwashed pans under the sink, a loaf of bread outside the bread-box, a dish-towel on the table--other signs of incompleted work."
- Refresher hint: Look at the pans, the bread and the towel.
- Why: The kitchen was left without being put in order: unwashed pans, bread out, signs of incompleted work.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Three women enter the warm, tidy kitchen of a busy farmhouse and start baking bread together. / Two children play in the sunny kitchen of a brand new farmhouse. / Three men enter the cold, messy kitchen of an abandoned farmhouse and go straight to the stove. ✓
- Discovery (vocabulary): "signs of incompleted work". Incompleted work: chores someone started and never finished.

**Chunk 8** (¶37 sentences 1 to 1, ¶38 sentences 1 to 1, ¶39 sentences 1 to 1, ¶40 sentences 1 to 5; 84 words)

- Question: What can you infer about Mrs. Wright from her reply about the weather?
- Key words highlighted: infer
- Choices: She is eager to chat with a friendly neighbor / She is angry that Hale came so early / Her mind is far away from ordinary things ✓
- Proof line: "And she said, “Is it?”--and went on kind of pleating at her apron."
- Refresher hint: How does she answer a simple remark, and what do her hands keep doing?
- Why: She answers Is it? and goes on pleating at her apron, as if her mind is elsewhere.
- Standards: ELA.K12.EE.3.1, ELA.K12.EE.1.1
- Gist check: Mrs. Wright barely notices Hale, answers him oddly, and never invites him to the stove. ✓ / Mrs. Wright greets Hale warmly at the door and pours him a hot cup of coffee by the stove. / Mrs. Wright orders Hale to leave and slams the door in his face.
- Discovery (vocabulary): "pay much attention". She barely notices that Hale is there.

##### Character Clue

**Chunk 2** (¶1 sentences 4 to 6, ¶2 sentences 1 to 1, ¶3 sentences 1 to 3, ¶4 sentences 1 to 1, ¶5 sentences 1 to 2; 80 words)

- Question: Which trait do the stage directions give Mrs. Peters?
- Key words highlighted: trait
- Choices: Tall, loud and commanding / Thin and nervous-looking ✓ / Loud and cheerful
- Proof words (any one): "a thin nervous face"
- Refresher hint: Read how she is described as she comes in.
- Why: The sheriff's wife is a slight wiry woman with a thin nervous face.
- Standards: ELA.7.R.1.1, ELA.K12.EE.1.1
- Gist check: The two women rush straight to the stove, and Mrs. Peters says she is freezing from the long ride. / The two women stay outside in the wagon, refusing to enter the house. / The two women enter slowly and stay together by the door, and Mrs. Peters says she isn't cold. ✓
- Discovery (vocabulary): "slight wiry woman". Wiry: thin but tough.

##### Find It

**Chunk 3** (¶6 sentences 1 to 1, ¶7 sentences 1 to 2, ¶8 sentences 1 to 1, ¶9 sentences 1 to 2, ¶10 sentences 1 to 1, ¶11 sentences 1 to 3; 110 words)

- Question: Which line says whether anything in the room was disturbed?
- Key words highlighted: disturbed
- Proof line: "It’s just the same."
- Refresher hint: Listen for the sheriff's short answer.
- Why: It's just the same.
- Standards: ELA.K12.EE.1.1
- Gist check: The sheriff asks Hale to tell what he saw and says nothing has been moved except the stove fire. ✓ / The sheriff admits that everything in the kitchen has been moved and cleaned since yesterday morning. / The sheriff refuses to let Hale speak and sends everyone home.
- Discovery (vocabulary): "a big case on". A big case: an important crime to solve.

**Chunk 6** (¶20 sentences 1 to 1, ¶21 sentences 1 to 2, ¶22 sentences 1 to 1, ¶23 sentences 1 to 4; 105 words)

- Question: Which line tells where Hale first found the farmer's wife?
- Key words highlighted: first found
- Proof line: "I wasn’t sure, I’m not sure yet, but I opened the door--this door [_indicating the door by which the two women are still standing_] and there in that rocker--[_pointing to it_] sat Mrs. Wright."
- Refresher hint: Look for a piece of furniture he points to.
- Why: There in that rocker sat Mrs. Wright.
- Standards: ELA.K12.EE.1.1
- Gist check: Hale walked in without knocking and found Mrs. Wright cooking breakfast at the stove, humming. / Hale knocked twice, thought he heard someone answer, and found Mrs. Wright sitting in her rocker. ✓ / Hale knocked once, heard shouting, and found the whole house empty.
- Discovery (figurative): "all quiet inside". An eerie silence for a farm morning.

##### Shades of Meaning

**Chunk 4** (¶12 sentences 1 to 1, ¶13 sentences 1 to 1, ¶14 sentences 1 to 1, ¶15 sentences 1 to 3, ¶16 sentences 1 to 1, ¶17 sentences 1 to 1; 71 words) · shared words reviewed

- Question: Why does the sheriff say he had his hands full instead of just busy?
- Key words highlighted: hands full
- Choices: It stresses how overloaded and stretched thin he was ✓ / It means he was carrying heavy boxes into the jail / It means he hurt both of his hands
- Proof line: "I knew you could get back from Omaha by today and as long as I went over everything here myself--"
- Refresher hint: What does he say about checking the house?
- Why: He could only go over everything himself before the attorney got back: hands full means too much to do at once.
- Standards: ELA.7.V.1.3, ELA.7.R.3.1
- Gist check: The attorney praises the sheriff for guarding the house himself all night long in the bitter cold. / The attorney says the house should be sold, and the sheriff agrees. / The attorney says someone should have guarded the house, and the sheriff explains he was too busy. ✓
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
- Gist check: Hale stopped to buy potatoes from John Wright, who loved company, long visits and plenty of chatter. / Hale stopped to warn John Wright about a storm, but Wright was away in town. / Hale stopped to ask John Wright about a shared telephone line, though Wright wanted only peace and quiet. ✓
- Discovery (vocabulary): "a party telephone". Party telephone: one line shared by several homes.

##### Word Detective

**Chunk 7** (¶24 sentences 1 to 1, ¶25 sentences 1 to 1, ¶26 sentences 1 to 1, ¶27 sentences 1 to 1, ¶28 sentences 1 to 2, ¶29 sentences 1 to 1, ¶30 sentences 1 to 1, ¶31 sentences 1 to 1, ¶32 sentences 1 to 1, ¶33 sentences 1 to 1, ¶34 sentences 1 to 1, ¶35 sentences 1 to 1, ¶36 sentences 1 to 2; 66 words) · shared words reviewed

- Question: In this chunk, what does queer mean?
- Key words highlighted: queer
- Choices: Angry and loud / Strange or odd ✓ / Happy and relaxed
- Proof words (any one): "what she was going to do next"
- Refresher hint: How does Hale explain it when he's asked?
- Why: She looked as if she didn't know what she was going to do next: strange, not like herself.
- Standards: ELA.7.V.1.3, ELA.K12.EE.1.1
- Gist check: Hale says Mrs. Wright was asleep and he could not see her face. / Hale says Mrs. Wright was rocking and pleating her apron and looked strange and worn out. ✓ / Hale says Mrs. Wright was dancing around and singing and looked happy, rested and cheerful.
- Discovery (vocabulary): "her apron in her hand". She keeps folding her apron into pleats, over and over.

##### Theme Thread

**Chunk 9** (¶40 sentences 6 to 15; 66 words)

- Question: Which idea about Mrs. Wright keeps coming back in Hale's story?
- Key words highlighted: keeps coming back
- Choices: Her loud anger frightens everyone / Her cheerful chatter fills the whole room / Her strange calm makes her hard to read ✓
- Proof line: "“No,” she says, kind o’ dull like."
- Refresher hint: How does she say even the most shocking things?
- Why: She answers kind of dull like: the same strange calm Hale noticed from the start.
- Standards: ELA.7.R.1.2, ELA.K12.EE.1.1
- Gist check: Mrs. Wright cries loudly and tells Hale that John ran away to town. / Mrs. Wright smiles and tells Hale that John is out working in the barn with the cows. / Mrs. Wright laughs oddly and then flatly tells Hale that John is home but dead. ✓
- Discovery (vocabulary): "out of patience". Out of patience: tired of waiting.

##### Whose Eyes?

**Chunk 10** (¶40 sentences 16 to 24; 98 words)

- Question: Whose account of that morning are we hearing?
- Key words highlighted: account
- Choices: The sheriff's, read aloud from his notebook / Hale's, as he remembers it for the lawmen ✓ / Mrs. Wright's, written in a letter
- Proof line: "“Why--where is he?” says I, not knowing what to say."
- Refresher hint: Who is the I in these lines?
- Why: Says I, not knowing what to say: Hale is telling the lawmen what he saw.
- Standards: ELA.7.R.1.3, ELA.K12.EE.1.1
- Gist check: Calmly rocking, Mrs. Wright points upstairs and says John died of a rope around his neck. ✓ / Crying, Mrs. Wright runs upstairs and says John fell from a ladder. / Laughing, Mrs. Wright says John is only sleeping late and points out toward the barn.
- Discovery (figurative): "not getting a bit excited". She stays strangely calm.

<!-- expeditions:end -->
