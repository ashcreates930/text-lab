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
