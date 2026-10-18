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
