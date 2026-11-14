# Escape room playtest kit (Room 1, over two class periods)

For the student playtest after escape-room Phase 3. Testers stay anonymous: use nicknames only, and keep any notes or photos free of names and faces.

## Before the first period

1. Run the migration `supabase/migrations/202611140001_class_look.sql` in Supabase (the class's Look switch). Without it, everyone gets the mature look and the switch is hidden.
2. Open the preview: https://text-lab-git-escape-room-aye-teach.vercel.app (Vercel sign-in for you; students use the class link).
3. In My classes, create a test class (Sleepy Hollow, grade 7) and note the class code. **Look: Mature** is the default. If you want to compare looks, set one class to Classic.
4. Decide solo or live for each period:
   - **Solo:** students join with the class code. "Stop at the inner door" is on, so each student stops after Chamber 1 and resumes in Chamber 2 next time.
   - **Live:** Start a live round, pick **Room 1: Into the Hollow** and **Chamber 1** in period 1, then a new live round with **Chamber 2** in period 2. The class keeps its liar across both.

## Period 1: Chamber 1 (about 20 to 30 minutes)

The door, the Interview, locks 1 to 5, Fix the Painting (the glen at noon), a quick latch, search the room, and the code lock at the inner door.

## Period 2: Chamber 2 (about 20 to 35 minutes)

The Case File recap, locks 6 to 10, a quick latch, Inspect the Scene (the churchyard at dusk), Name the Liar at the exit door, the escape, the skill report, Back through the room (the Refresher) and the Case File.

## What to watch for (tick or note per student, by nickname)

| | Watch for | Notes |
|---|---|---|
| Time | Minutes for Chamber 1; minutes for Chamber 2 (fast, typical, slower readers) | |
| Resume | Did period 2 open on the Case File recap at Chamber 2, with nothing lost? | |
| Locks | After a miss, did students understand "open the lock with the proof"? | |
| Puzzles | Fix the Painting: did they reread to find the mistakes, or guess? | |
| | Code lock: did they read the line to find the word, or hunt for letters? | |
| | Inspect the Scene: did they match by meaning, or by matching words? | |
| Back to the text | How often did a puzzle send a student back into the passage or the Case File? | |
| Case File | Did they open it during play? When? | |
| Name the Liar | Did they use the Case File to find the disproving line? | |
| Live (if used) | Could phones keep up? Was the time to open a missed lock (reveal to next lock) long enough? | |
| Confusion | Any screen where a student asked "what do I do?" | |

## Ask middle school testers (after period 2)

1. **Does this look like it's for your age?** (Too young / About right / Too old) Why?
2. What was the hardest lock or puzzle? What made it hard?
3. Did any puzzle feel like a guessing game?
4. Did you go back to the story to solve the puzzles? Which ones?
5. Would you want to play the next room? Why or why not?

## Evidence to check afterward (My classes > the class > Evidence, and the CSV)

- First-try results per lock, and locks opened with the proof after a miss ("opened with the shown proof", 0 points).
- Puzzle locks: how many dials, mistakes and objects each student got on the first try.
- Name the Liar: who they named and the line they chose.
- Refresher fixes, skill levels, and the one-sentence reflection.

Bring back: the times, the "for your age" answers, and any screen where students got stuck.
