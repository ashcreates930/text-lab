# Escape room playtest kit (Room 1, over two class periods)

For the student playtest of the full escape-room build. Testers stay anonymous: use nicknames only, and keep any notes or photos free of names and faces.

## Before the first period

1. **Migrations.** All three are run in Supabase:
   - `202611140001_class_look.sql` (the class Look switch);
   - `202611150001_room_clock.sql` (the room clock);
   - `202611150002_investigator_profiles.sql` (saved investigators).
2. **Preview.** Open https://text-lab-git-escape-room-aye-teach.vercel.app (Vercel sign-in for you; students use the class link).
3. **Test class.** In My classes, create a test class (Sleepy Hollow, grade 7) and note the class code. On the class page, set:
   - **Look:** Mature is the default. To compare looks, set one class to Classic.
   - **Room clock:** Off is the default. To try it, choose Generous (or Extra time for classes that need it). It counts only while students work a lock or puzzle, pauses while they read or meet a witness, and never ends a room.
4. **Solo or live.** Decide for each period:
   - **Solo:** students join with the class code. "Stop at the inner door" is on, so each student stops after Chamber 1 and picks up in Chamber 2 next time.
   - **Live:** start a live round and pick **Room 1: Into the Hollow** and **Chamber 1** in period 1, then a new live round with **Chamber 2** in period 2. The class keeps its liar across both. Pick the **Room clock** in setup if you want it.
   - **Live with squads:** tap "Build squads of 3 or 4" in the lobby and turn squads on when you start. Each squad gets four roles (Reader, Evidence Keeper, Interviewer, Recorder) that move one seat each room. A squad of 2 or 3 shares out the extra roles.

## Period 1: Chamber 1 (about 20 to 30 minutes)

- **The door:** no Interview at the door any more.
- **Witnesses:** each witness steps into the room just before their lock and answers the room's one question ("What should a stranger know about this valley?"). In Room 1, Hans comes before lock 1.
- **The locks:**
  - locks 1 to 5, with **Request a clue** on every lock;
  - Fix the Painting (the glen at noon);
  - a quick latch;
  - search the room;
  - the code lock at the inner door.
- **The map:** students can choose an investigator on the map and see the gear shelf.

## Period 2: Chamber 2 (about 20 to 35 minutes)

- **The Case File recap:** in live games, the witnesses met in Chamber 1 speak again first.
- **The locks:**
  - locks 6 to 10, with Brom stepping in at lock 7 and Katrina at lock 9;
  - a quick latch;
  - Inspect the Scene (the churchyard at dusk).
- **Name the Liar** at the exit door, then the escape.
- **After the escape:** the skill report, Back through the room (the Refresher), the Case File, and any gear earned.

## Request a clue (on every lock)

- Three tiers, each opened on purpose, each costing points off that lock only. The clock is never touched.
  1. **Where to look:** the hint (−100).
  2. **Narrow it down:** the proof is one of two sentences, named by how they start (−150).
  3. **Show me where:** the proof sentence, and wrong answers crossed out (−200).
- A lock proved with no clue or tier 1 counts toward mastery; with tier 2 or 3 it counts as "not yet".
- The easier version already shows the hint, so tier 1 is free there.

## Squads (live only)

- Every student commits an answer privately on their own phone first. That is their own first try.
- Once the whole squad has committed, the squad sees everyone's answer, talks, and the Recorder locks in one of them for the squad (+300 when it proves the lock).
- The board lists each squad's roles at the start of a lock.
- Each phone shows its roles and the squad Case File.

## The investigator

- Students pick one of six investigators on the map. Until the revised avatar art is approved, plain icons stand in.
- Gear comes from proof only:

  | Gear | How to earn it |
  |---|---|
  | Lantern | Prove 5 locks with a line on the first try |
  | Quill | Back a written seal with its line |
  | Magnifying glass | Solve a puzzle lock with every part right on the first try |
  | Brass key | Catch a liar with the disproving line |
  | Pocket compass | Prove 15 locks |
  | Casebook | Prove 40 locks |

- Points, clues past tier 1, replays and coins never earn gear.

## What to watch for (tick or note per student, by nickname)

| | Watch for | Notes |
|---|---|---|
| Time | Minutes for Chamber 1; minutes for Chamber 2 (fast, typical, slower readers) | |
| Resume | Did period 2 open on the Case File recap at Chamber 2, with nothing lost? | |
| Witnesses | Did students listen when a witness stepped in mid-room, or skip straight to the lock? Did they connect a witness's claim to the lock that followed? | |
| Locks | After a miss, did students understand "open the lock with the proof"? | |
| Clues | Who asked for clues, how often, and which tier? Did anyone open all three without trying first? | |
| Room clock (if on) | Did it add urgency or stress? Did anyone notice it pause while reading? Did anyone reach overtime? | |
| Puzzles | Fix the Painting: did they reread to find the mistakes, or guess? | |
| | Code lock: did they read the line to find the word, or hunt for letters? | |
| | Inspect the Scene: did they match by meaning, or by matching words? | |
| Back to the text | How often did a puzzle or clue send a student back into the passage or the Case File? | |
| Case File | Did they open it during play? When? | |
| Name the Liar | Did they use the Case File to find the disproving line? | |
| Squads (if used) | Did members commit before talking? Did the Recorder lock in what the squad agreed, or their own answer? Did the Reader read aloud? | |
| Investigator | Did students choose an investigator? Did gear motivate them to prove on the first try rather than take clues? | |
| Live (if used) | Could phones keep up? Was the time to open a missed lock long enough? | |
| Confusion | Any screen where a student asked "what do I do?" | |

## Ask middle school testers (after period 2)

1. **Does this look like it's for your age?** (Too young / About right / Too old) Why?
2. What was the hardest lock or puzzle? What made it hard?
3. Did any puzzle feel like a guessing game?
4. Did you go back to the story to solve the puzzles? Which ones?
5. When did you ask for a clue? Was it worth the points?
6. When a witness stepped into the room, did you remember what they said by the exit door?
7. (Squads) Did your role give you something real to do?
8. Would you want to play the next room? Why or why not?

## Evidence to check afterward (My classes > the class > Evidence, and the CSV)

- **Escape rooms totals:** locks opened, puzzles solved on the first try, liars caught, rooms escaped, and which chamber each student reached.
- **Per student, per room:** the chamber reached, locks opened, proved first try, puzzles first try, the clue tiers used, the score and the liar.
- **Locks:** first-try results per lock, and locks opened with the proof after a miss ("opened with the shown proof", 0 points).
- **Name the Liar:** who they named and the line they chose.
- **Live squads:** each student's roles, how often the squad locked in their answer, and each Recorder lock-in.
- **Refresher and reflection:** Refresher fixes, skill levels, and the one-sentence reflection.

Bring back: the times, the "for your age" answers, how clues and the clock were used, and any screen where students got stuck.
