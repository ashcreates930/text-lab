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

// Evidence view sample: a fictional 7th-grade class reading The Legend of Sleepy Hollow. Each answer has the same shape
// as a real student's saved progress (notice = the line from the story, interpret = the explanation, craft = whether
// the line "supports" or "contradicts" the character the student questioned). Every quote appears in
// worlds/sleepy-hollow/source.md (checked by tests/core.test.ts).
type SampleAnswer = { notice: string; interpret: string; craft?: "supports" | "contradicts" };
const q = {
  lock: "It was most ingeniously secured at vacant hours, by a withe twisted in the handle of the door, and stakes set against the window shutters",
  belongings: "a rusty razor; a book of psalm tunes full of dog’s-ears; and a broken pitch-pipe",
  books: "These magic books and the poetic scrawl were forthwith consigned to the flames by Hans Van Ripper",
  saddleRoad: "In one part of the road leading to the church was found the saddle trampled in the dirt",
  feast: "chuckling with the possibility that he might one day be lord of all this scene of almost unimaginable luxury and splendor",
  brooding: "Brom Bones, sorely smitten with love and jealousy, sat brooding by himself in one corner",
  shouldHaveWon: "should have won it too",
  chapfallen: "he certainly sallied forth, after no very great interval, with an air quite desolate and chapfallen",
  tree: "it was but a blast sweeping sharply through the dry branches",
  headless: "Ichabod was horror-struck on perceiving that he was headless",
  knowing: "was observed to look exceedingly knowing whenever the story of Ichabod was related",
};
export const sampleEvidenceClass = { name: "Period 2 · English 7", worldId: "sleepy-hollow", grade: 7 };
export const sampleEvidenceStudents: { nickname: string; answers: Record<string, SampleAnswer> | null }[] = [
  { nickname: "Amara", answers: {
    "empty-schoolhouse": { notice: q.lock, interpret: "Ichabod locks up a schoolhouse that has nothing worth stealing. It shows he worries a lot, even about small things." },
    "ichabods-belongings": { notice: q.belongings, interpret: "Everything he owns fits in one bundle and most of it is worn out. He was really poor, which is why the Van Tassel farm mattered so much to him.", craft: "supports" },
    "ichabods-own-books": { notice: q.books, interpret: "Hans burns the books right away. I think he blames the ghost books for filling Ichabod's head with fear." },
    "party-feast": { notice: q.feast, interpret: "He is not just enjoying the food. He is imagining owning all of it, so he wants Katrina partly for the farm." },
    "broms-corner": { notice: q.brooding, interpret: "Brom sits alone while Ichabod dances with Katrina. He is jealous, which gives him a reason to scare Ichabod later." },
    "broms-race-tale": { notice: q.shouldHaveWon, interpret: "Brom told me he beat the Horseman and won the punch. The story says he only should have won, so he never actually won. He was bragging.", craft: "contradicts" },
    "private-talk": { notice: q.chapfallen, interpret: "Brom told me the talk went great for Ichabod. This line shows Ichabod left looking crushed, so Brom was wrong. Katrina must have turned him down.", craft: "contradicts" },
    "andre-tree": { notice: q.tree, interpret: "Every scary sound at the tree has a normal cause, like the wind. Ichabod is scaring himself." },
    "fallen-saddle": { notice: q.saddleRoad, interpret: "The saddle is in the road, so something really happened on the ride home. It is not just a rumor." },
  } },
  { nickname: "Ben", answers: {
    "empty-schoolhouse": { notice: q.lock, interpret: "The locks are silly because a thief could get in easily. Irving is making fun of Ichabod." },
    "party-feast": { notice: q.feast, interpret: "Ichabod thinks about being the lord of the farm while he eats. He cares about money." },
    "broms-corner": { notice: q.brooding, interpret: "Brom is jealous and alone in the corner.", craft: "supports" },
    "private-talk": { notice: q.chapfallen, interpret: "Brom said Ichabod left the party happy. This line says he looked desolate and chapfallen, so Brom was wrong.", craft: "contradicts" },
    "shadowy-rider": { notice: q.headless, interpret: "The rider has no head on his shoulders. That is what makes Ichabod panic." },
    "broms-knowing-look": { notice: q.knowing, interpret: "Brom looks like he knows a secret whenever people tell the story. I think he was the rider." },
  } },
  { nickname: "Carmen", answers: {
    "empty-schoolhouse": { notice: q.lock, interpret: "He secures the door with a twisted stick and stakes. It shows how careful he is." },
    "ichabods-belongings": { notice: q.belongings, interpret: "He did not own much. His things were old and broken." },
    "party-feast": { notice: q.feast, interpret: "He dreams of owning the whole farm.", craft: "supports" },
    "andre-tree": { notice: q.tree, interpret: "The sound was just the wind, not a ghost." },
    "fallen-saddle": { notice: q.saddleRoad, interpret: "They found the saddle in the dirt on the road to the church." },
  } },
  { nickname: "Diego", answers: {
    "empty-schoolhouse": { notice: q.lock, interpret: "It was locked with a stick and stakes." },
    "broms-corner": { notice: q.brooding, interpret: "Brom is jealous of Ichabod dancing with Katrina." },
    "andre-tree": { notice: q.tree, interpret: "The noise was the wind blowing through the branches." },
    "shadowy-rider": { notice: q.headless, interpret: "Ichabod sees that the rider is headless and gets terrified." },
  } },
  { nickname: "Ella", answers: {
    "empty-schoolhouse": { notice: q.lock, interpret: "The schoolhouse is easy to get into but hard to get out of." },
    "shadowy-rider": { notice: q.headless, interpret: "The character I asked said the rider was just another traveler on the road. This line shows he had no head, so that was wrong.", craft: "contradicts" },
    "fallen-saddle": { notice: q.saddleRoad, interpret: "The saddle being trampled shows there was a wild chase." },
  } },
  { nickname: "Felix", answers: {
    "empty-schoolhouse": { notice: q.lock, interpret: "He locks the school with a withe." },
    "party-feast": { notice: q.feast, interpret: "Ichabod is greedy at the feast." },
  } },
  { nickname: "Grace", answers: {
    "empty-schoolhouse": { notice: q.lock, interpret: "Ichabod is careful about locking the schoolhouse even though there is nothing to steal." },
  } },
  // Started reading and saved progress, but has not proven a clue yet: flagged "Needs help".
  { nickname: "Hugo", answers: {} },
];
