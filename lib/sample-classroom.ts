// Static sample data for the teacher demo ("Period 3 · English 10" reading The Tell-Tale Heart).
// Everything here is fictional and fixed: no AI, no database, nothing is created, and it resets on reload.
// Students are first names only. Counts (clues, sections) are derived from the story's real pages and clues.
// Every quote below appears in worlds/tell-tale-heart/source.md (checked by tests/core.test.ts).

export const sampleClass = { name: "Period 3 · English 10", worldId: "tell-tale-heart", grade: 10, code: "TELL-7K2Q" };

// page: furthest page reached (1-19). provenHere: clues proven on that page. minutesHere: time on that page.
export const sampleStudents: { name: string; page: number; provenHere: number; minutesHere: number; finished?: boolean }[] = [
  { name: "Maya", page: 19, provenHere: 2, minutesHere: 3, finished: true },
  { name: "Jonah", page: 15, provenHere: 1, minutesHere: 4 },
  { name: "Priya", page: 13, provenHere: 2, minutesHere: 2 },
  { name: "Luis", page: 9, provenHere: 0, minutesHere: 14 },
  { name: "Ava", page: 11, provenHere: 0, minutesHere: 3 },
  { name: "Marcus", page: 6, provenHere: 0, minutesHere: 18 },
  { name: "Sofia", page: 14, provenHere: 1, minutesHere: 6 },
  { name: "Eli", page: 4, provenHere: 1, minutesHere: 2 },
  { name: "Nadia", page: 17, provenHere: 0, minutesHere: 5 },
  { name: "Theo", page: 2, provenHere: 0, minutesHere: 11 },
  { name: "Imani", page: 10, provenHere: 0, minutesHere: 7 },
  { name: "Caleb", page: 7, provenHere: 0, minutesHere: 4 },
];
export const STUCK_MINUTES = 10;

// One student's case file. Tags name benchmark codes from the world's benchmark list.
export const sampleCaseFile = {
  student: "Priya",
  entries: [
    { clueId: "search-motive", stance: "contradicts", quote: "Object there was none.", explanation: "He says he had no reason, but then he says it was the eye. So he did have a reason, it just wasn't a normal one. That makes me trust him less.", tags: ["ELA.K12.EE.1.1", "ELA.10.R.1.1"] },
    { clueId: "room-lantern-ray", stance: "supports", quote: "a single thin ray fell upon the vulture eye", explanation: "The light only shows the eye, so the narrator only sees the part he hates. He is not seeing the old man as a person at all.", tags: ["ELA.K12.EE.1.1", "ELA.K12.EE.3.1"] },
    { clueId: "room-shutters", stance: "supports", quote: "the shutters were close fastened, through fear of robbers", explanation: "The old man shut the shutters to be safe from robbers, but the danger was already inside the house. That is why nobody outside could see what was happening.", tags: ["ELA.K12.EE.3.1", "ELA.10.R.1.1"] },
  ],
};

// Sample picture frames: what students described and the line that supports it.
export const sampleFrames = [
  { student: "Eli", page: 4, kind: "Added detail", description: "A thin yellow line of lantern light landing right on the old man's cloudy eye while he sleeps.", quote: "a single thin ray fell upon the vulture eye" },
  { student: "Imani", page: 10, kind: "Illustrated page", description: "Only the narrator's hand and the lantern in the dark, held perfectly still, with the old man sitting up in bed in the shadows.", quote: "I held the lantern motionless." },
  { student: "Priya", page: 13, kind: "Mood and setting (writing only)", description: "Grey light before morning. The floorboards are back in place and look perfectly normal, which is the creepiest part.", quote: "I then replaced the boards so cleverly, so cunningly" },
];

// Live lesson preview: one Stop-and-Talk card the teacher can put up for the whole class.
export const sampleStopAndTalk = { page: 6, prompt: "Stop and talk: The narrator keeps telling us how careful and calm he is. Find one line on this page that makes you doubt him. Tell your partner why.", minutes: 3 };
