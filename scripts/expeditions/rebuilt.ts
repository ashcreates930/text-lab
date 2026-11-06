// Expeditions rebuilt to the phase 3 rules (lib/formats.ts, lib/pacing.ts), laid over the base specs in
// scripts/build-expeditions.ts and scripts/expeditions/*.ts: each chunk keeps its segments, Gist check and discovery,
// and gets its question (q; absent: the original) and a bank of other questions on the same skill (bank; "original":
// the chunk's original question). The arc: warm-ups first, the twist (Catch the Lie) mid-expedition, the boss in level 2
// at the map's landmark, about two drag and drops never back to back, a written answer for the deepest question, the
// same type never twice in a row, and two lightning beats from the approved Proof Race sprints.
// Expedition 1: whose eyes, find it, shades, word detective, fact or claim (drag and drop), choose two, Catch the Lie
// (twist), cause and effect (drag and drop), theme in writing (boss), read between the lines.
// Expedition 2: find it, figure it out, sort the evidence (drag and drop), character clue, Catch the Lie (twist),
// choose two, build the case (drag and drop), find it, character clue (boss), theme in writing.
import type { Q } from "../build-expeditions.ts";

type Lightning = { sprint?: string; id?: string; chunk: number; after: number; question?: string; answer?: [string, number][] };export type Rebuilt = { chunks: { q?: Q; bank?: (Q | "original")[] }[]; lightning?: Lightning[] };

// The teacher's discussion note (the user's wording), shown with every question that brings up Irving's description of the "old Indian chief".
const POWWOW_NOTE = "Teacher note: Irving, writing in 1820, describes Native people through the stereotypes of his time (\"powwows,\" \"the prophet or wizard of his tribe\"). Consider pausing here: Whose voice tells this story? How might a Native person describe this land and its history?";

// Lightning beats recall a detail from earlier in the expedition, never the proof of the chunk just before the beat.
export const REBUILT: Record<string, Rebuilt> = {
  "into-the-hollow": {
    lightning: [{ sprint: "walk", chunk: 2, after: 4 }, { id: "gun-roar", chunk: 3, after: 8, question: "What startled the young hunter in the quiet grove?", answer: [["p004", 1]] }],
    chunks: [
      // 1 · Whose Eyes? (warm-up): the original, and who first gave the explanation.
      { bank: [{ type: "whose_eyes", prompt: "Who first came up with the explanation the narrator passes along?", keywords: ["passes along"],
        choices: [["The farm wives nearby, or so the story goes", true], ["The narrator himself, on his very first visit"], ["The Dutch sailors who crossed the Tappan Zee"]],
        lines: [["p003", 1]], hint: "Look for the words that show he heard this from other people.", why: "\"We are told\" shows the explanation came from the local housewives, passed along by others.", standards: ["R.1.3", "K12.EE.1.1"] }] },
      // 2 · Find It (warm-up): the original, and the sounds of the valley.
      { bank: [{ type: "find_it", prompt: "Which sentence tells you what noises a visitor might hear there?", keywords: ["noises"], lines: [["p003", 4]],
        hint: "Listen for birds.", why: "Only a quail's whistle or a woodpecker's tapping breaks the quiet.", standards: ["K12.EE.1.1"] }] },
      // 3 · Shades of Meaning: the original (stripling), and retreat.
      { bank: [{ type: "shades", prompt: "Why might he call the valley a retreat rather than just a spot?", keywords: ["retreat"], focus: "retreat",
        choices: [["It suggests a quiet hiding place to rest from the world", true], ["It suggests a place where soldiers fall back in battle"], ["It suggests the narrator once lost a fight in the valley"]],
        lines: [["p004", 2]], clues: ["steal from the world and its distractions"], hint: "Read the sentence where he imagines escaping from the world.", why: "He would steal away from the world and its distractions to dream quietly there: a retreat is a peaceful place to get away.", standards: ["V.1.3", "R.3.1"], reviewed: true }] },
      // 4 · Word Detective: the original (listless), and drowsy.
      { bank: [{ type: "word_detective", prompt: "Which meaning of drowsy fits this land?", keywords: ["drowsy"], focus: "drowsy",
        choices: [["Sleepy and slow, as if ready to doze off", true], ["Wet and gloomy, as if always under rain"], ["Loud and lively, as if never at rest"]],
        lines: [["p005", 1]], clues: ["dreamy", "listless repose"], hint: "Find the words nearby that feel sleepy.", why: "A drowsy, dreamy influence hangs over the land and fills the air: drowsy means sleepy.", standards: ["V.1.3", "K12.EE.1.1"], reviewed: true }] },
      // 5 · Weigh the Evidence, drag and drop: fact or claim.
      { q: { type: "weigh_evidence", format: "dnd", prompt: "Sort what the narrator states as certain from what only some people claim.",
          dnd: { kind: "fact_or_claim", slots: [{ id: "text", label: "The text says it is so" }, { id: "claim", label: "Only some people claim it" }],
            items: [{ id: "doctor", text: "A High German doctor put a spell on the place", slot: "claim", line: ["p005", 2] },
              { id: "chief", text: "An old chief held his powwows there long ago", slot: "claim", line: ["p005", 2] },
              { id: "power", text: "A witching power still rules the place", slot: "text", line: ["p005", 3] },
              { id: "reverie", text: "The people walk about in a constant daydream", slot: "text", line: ["p005", 3] }] },
          hint: "Watch for the words \"some say\" and \"certain it is.\"", why: "\"Some say\" and \"others\" mark rumors; \"certain it is\" marks what the narrator states as fact.", standards: ["K12.EE.1.1", "K12.EE.3.1"], note: POWWOW_NOTE },
        bank: [{ type: "weigh_evidence", prompt: "Which detail does the narrator present as sure, not just gossip?",
          choices: [["Some witching power still holds the place", true], ["A German doctor once cast a spell on it"], ["An old chief held his meetings in the glen"]],
          lines: [["p005", 3]], hint: "One sentence begins by saying it is certain.", why: "\"Certain it is\": the witching power is stated as fact, while the doctor and the chief are only what some say.", standards: ["K12.EE.1.1", "K12.EE.3.1"], note: POWWOW_NOTE }] },
      // 6 · Read Between the Lines, choose two.
      { q: { type: "between_lines", format: "multi", pick: 2, prompt: "Which habits show the people here are ready to believe in marvels?", keywords: ["believe in marvels"],
          choices: [["They often see strange sights and hear voices", true], ["They tell many tales of haunted spots", true], ["They laugh at every ghost story they hear"], ["They move away whenever meteors appear"]],
          hint: "Find two things they do or say, not things they avoid.", why: "They see strange sights, hear voices in the air, and fill the valley with tales of haunted spots.", standards: ["K12.EE.3.1", "K12.EE.1.1"] },
        bank: [{ type: "between_lines", prompt: "What does the restless sky suggest about this region?",
          choices: [["Even nature seems stranger here than anywhere else", true], ["The weather here is the finest in the whole country"], ["Sailors use these stars to find their way home"]],
          lines: [["p005", 5]], hint: "Compare this valley's sky with the rest of the country.", why: "Stars shoot and meteors glare more often here than anywhere: even nature seems haunted.", standards: ["K12.EE.3.1", "K12.EE.1.1"] }] },
      // 7 · Catch the Lie (the twist): the original (Brom), and Hans.
      { bank: [{ type: "catch_lie", prompt: "Hans Van Ripper tells it differently. Part of what he says is false. Tap the sentence that shows it.",
        testimony: { speaker: "hans-van-ripper", text: "The ghost that rules this valley is a lady in white who drifts along without a sound." },
        lines: [["p006", 0]], hint: "What does the ruling spirit look like?", why: "The ruling spirit is a figure on horseback without a head, not a lady in white.", standards: ["K12.EE.1.1"] }] },
      // 8 · Story Order, drag and drop: cause and effect.
      { q: { type: "story_structure", format: "dnd", prompt: "Match each cause to what it leads the rider to do.",
          dnd: { kind: "cause_effect", slots: [{ id: "buried", label: "His body lies buried in the churchyard" }, { id: "head", label: "He is searching for his lost head" }, { id: "late", label: "He is running late" }],
            items: [{ id: "dawn", text: "He hurries back before daybreak", slot: "buried", line: ["p006", 3] },
              { id: "battle", text: "He rides out to the old battlefield each night", slot: "head", line: ["p006", 3] },
              { id: "blast", text: "He rushes through the Hollow like a midnight blast", slot: "late", line: ["p006", 3] }] },
          hint: "Read the long sentence slowly: each reason comes with what it makes him do.", why: "Buried in the churchyard, he must be back by dawn; seeking his head, he rides out each night; running late, he speeds like a blast.", standards: ["R.1.1", "K12.EE.3.1"] },
        bank: [{ type: "story_structure", prompt: "What makes the phantom race the way he does?",
          choices: [["He is late getting back to his grave by dawn", true], ["He is chasing travelers out of the valley"], ["He is racing another rider to the church"]],
          lines: [["p006", 3]], hint: "Look at the end of the long sentence.", why: "He is belated and must get back to the churchyard before daybreak.", standards: ["R.1.1", "K12.EE.3.1"] }] },
      // 9 · Theme Thread (the boss), written; the original as its bank question.
      { q: { type: "theme_thread", format: "written", prompt: "In one sentence, explain what the Hollow does to anyone who settles there.",
          written: { key_ideas: [["dream", "imagin", "vision", "ghost", "apparition", "see things", "fanc", "superstit", "strange", "spell", "witch", "haunt"], ["every", "anyone", "newcomer", "people", "those who", "outsider", "visitor", "settle", "come", "move", "live", "stay"]],
            model: "Anyone who stays in the Hollow for a while starts to dream and see ghosts, because the valley's sleepy, witching air gets into them." },
          lines: [["p008", 0], ["p008", 1]], hint: "Think about newcomers, not just the people born there.", why: "Even newcomers soon breathe in the valley's witching air and start to dream and see apparitions.", standards: ["R.1.2", "K12.EE.1.1"] },
        bank: [{ type: "theme_thread", format: "written", prompt: "Using your own words, tell in one sentence what happens to newcomers who settle in the Hollow.",
          written: { key_ideas: [["dream", "imagin", "vision", "ghost", "apparition", "see things", "fanc", "superstit", "strange", "spell", "witch", "haunt"], ["newcomer", "anyone", "every", "people", "those who", "outsider", "visitor", "settle", "come", "move", "live", "stay", "arriv"]],
            model: "Newcomers who settle in the Hollow soon begin to imagine things and see ghosts, because its dreamy air takes hold of them." },
          lines: [["p008", 1], ["p008", 0]], hint: "Even people who arrive wide awake don't stay that way.", why: "However wide awake they were before, newcomers soon inhale the witching influence and begin to dream dreams and see apparitions.", standards: ["R.1.2", "K12.EE.1.1"] }] },
      // 10 · Read Between the Lines: the original, and the narrator's hope.
      { bank: [{ type: "between_lines", prompt: "How does the narrator hope the valley will be if he ever returns?",
        choices: [["Unchanged, as if no time had passed at all", true], ["Grown into a busy, modern market town"], ["Empty, since everyone moved away long ago"]],
        lines: [["p009", 2]], hint: "Read his last sentence about coming back.", why: "He expects to find the same trees and the same families, as if nothing had changed.", standards: ["K12.EE.3.1", "K12.EE.1.1"] }] },
    ],
  },
  "the-schoolmaster": {
    lightning: [{ sprint: "born", chunk: 1, after: 3 }, { id: "thank-him", chunk: 5, after: 8, question: "What did Ichabod tell a boy after punishing him?", answer: [["p012", 2]] }],
    chunks: [
      // 1 · Find It (warm-up): the original, and his name.
      { bank: [{ type: "find_it", prompt: "Tap the sentence that explains why his last name suits him.", keywords: ["last name"], lines: [["p010", 2]],
        hint: "Look for a word that means family name.", why: "\"Cognomen\" means name: a crane, a tall thin bird, fits the way he looks.", standards: ["K12.EE.1.1"] }] },
      // 2 · Figure It Out: the original (weather-cock), and the dangling hands.
      { bank: [{ type: "figure_it_out", prompt: "His hands dangled a mile out of his sleeves. Which device is the narrator using?", keywords: ["a mile out of his sleeves"], focus: "dangled a mile out of his sleeves",
        choices: [["Hyperbole: a huge exaggeration for effect", true], ["Simile: a comparison using like or as"], ["Personification: giving a thing human feelings"]],
        choices2: { prompt: "What does the exaggeration show?", options: [["His arms are far too long for his clothes", true], ["His coat sleeves were sewn a mile long"], ["He likes to stretch to reach high shelves"]] },
        hint: "Could anything really hang a mile out of a sleeve?", why: "A mile is an exaggeration: it shows how long and gangly his arms are.", standards: ["R.3.1"] }] },
      // 3 · Weigh the Evidence, drag and drop: sort the evidence (supports or disproves the claim).
      { q: { type: "weigh_evidence", format: "dnd", prompt: "Sort each detail: does it support or disprove the claim that the schoolhouse is hard to break into?",
          dnd: { kind: "sort_evidence", slots: [{ id: "supports", label: "Supports the claim" }, { id: "disproves", label: "Disproves the claim" }],
            items: [{ id: "withe", text: "A twisted branch holds the door shut", slot: "supports", line: ["p011", 1] },
              { id: "stakes", text: "Stakes are set against the window shutters", slot: "supports", line: ["p011", 1] },
              { id: "thief", text: "A thief could get in with perfect ease", slot: "disproves", line: ["p011", 1] },
              { id: "patched", text: "Some windows are patched with paper pages", slot: "disproves", line: ["p011", 0] }] },
          hint: "Ask of each detail: does it make getting in harder, or easier?", why: "The twisted branch and the stakes make the door and shutters harder to open, but a thief could get in with perfect ease, and paper-patched windows would keep no one out.", standards: ["K12.EE.1.1", "K12.EE.3.1"] },
        bank: [{ type: "weigh_evidence", prompt: "Which detail about the building does the narrator only suppose?",
          choices: [["That its lock was copied from an eel trap", true], ["That its windows were patched with paper"], ["That it was a single room made of logs"]],
          lines: [["p011", 1]], hint: "One detail comes with \"most probably.\"", why: "The eelpot idea is \"most probably\" borrowed: a guess, not a fact.", standards: ["K12.EE.1.1", "K12.EE.3.1"] }] },
      // 4 · Character Clue: the original (what he does: strict), and why he thinks strictness is right.
      { bank: [{ type: "character_clue", prompt: "Ichabod lives by an old saying about punishment. How does he see his own strictness?", keywords: ["old saying"],
        choices: [["As a duty he owes the children, not as cruelty", true], ["As a secret pleasure he hides from the parents"], ["As a bad habit he means to break soon"]],
        lines: [["p011", 4]], hint: "Find the old saying, and what kind of man the narrator calls him.", why: "A conscientious man follows his conscience: Ichabod believes the rod is good for children, so punishing feels like his duty.", standards: ["R.1.1", "K12.EE.1.1"] }] },
      // 5 · Catch the Lie (the twist): Brom, and Katrina.
      { q: { type: "catch_lie", prompt: "Brom Bones remembers Ichabod's punishments. Part of what he says is false. Tap the sentence that proves it.",
          testimony: { speaker: "brom-bones", text: "That schoolmaster went easy on the big, tough boys and saved his birch for the little weak ones." },
          lines: [["p012", 0], ["p012", 1]], hint: "Who got the lighter punishments: the weak or the strong?", why: "Ichabod took the burden off the weak and laid it on the strong, the opposite of what Brom says.", standards: ["K12.EE.1.1"] },
        bank: [{ type: "catch_lie", prompt: "Katrina adds her own memory of the schoolroom. One detail is untrue. Tap the sentence that shows it.",
          testimony: { speaker: "katrina-van-tassel", text: "He never explained himself. He would punish a boy and say nothing at all about it afterward." },
          lines: [["p012", 2]], hint: "What did he tell the boys after a punishment?", why: "He always followed a punishment with a promise that the boy would thank him for it one day.", standards: ["K12.EE.1.1"] }] },
      // 6 · Read Between the Lines, choose two.
      { q: { type: "between_lines", format: "multi", pick: 2, prompt: "Which reasons might lie behind his choice of after-school companions?", keywords: ["after-school companions"],
          choices: [["Some of them had pretty older sisters", true], ["Some had mothers known for their cooking", true], ["They lived closest to the schoolhouse"], ["They were the best readers in the class"]],
          hint: "Look at whom he walked home, and what their families had.", why: "He walked home children with pretty sisters or mothers famous for the comforts of the cupboard.", standards: ["K12.EE.3.1", "K12.EE.1.1"] },
        bank: [{ type: "between_lines", prompt: "Why would a teacher want to stay friendly with his students here?",
          choices: [["It brought him meals and company in their homes", true], ["The school paid him extra for every friendship"], ["He had no friends his own age in the valley"]],
          lines: [["p013", 1]], hint: "What did those families have that he wanted?", why: "It paid him to keep on good terms with his pupils: their families fed and welcomed him.", standards: ["K12.EE.3.1", "K12.EE.1.1"] }] },
      // 7 · Weigh the Evidence, drag and drop: build the case (the proof is the quotation; one piece belongs nowhere).
      { q: { type: "weigh_evidence", format: "dnd", prompt: "Build the case that Ichabod depends on the farm families to get by.",
          dnd: { kind: "build_case", slots: [{ id: "claim", label: "Claim" }, { id: "proof", label: "Proof sentence" }, { id: "reason", label: "Reason" }],
            items: [{ id: "claim", text: "Ichabod depends on the farm families to get by", slot: "claim" },
              { id: "proof", text: "\"The revenue arising from his school was small, and would have been scarcely sufficient to furnish him with daily bread\"", slot: "proof", line: ["p013", 2] },
              { id: "reason", text: "With pay that small, he needs the farmers to give him meals and a bed", slot: "reason", line: ["p013", 2] },
              { id: "logs", text: "The schoolhouse was a single room of logs", slot: null }] },
          hint: "A case needs a claim, a quotation that proves it, and a reason that connects them.", why: "The claim is that he depends on the farmers; the quotation shows his pay was small; the reason links them, since so little money meant boarding with the families. The log schoolhouse proves nothing about it.", standards: ["K12.EE.1.1", "K12.EE.3.1"] },
        bank: [{ type: "weigh_evidence", prompt: "Which detail best shows that his teaching could not support him?",
          choices: [["It would scarcely buy him his daily bread", true], ["He owned more books than he could carry"], ["He earned shillings for singing lessons"]],
          lines: [["p013", 2]], hint: "Look at what his school revenue could buy.", why: "His revenue was small, scarcely enough for daily bread.", standards: ["K12.EE.1.1", "K12.EE.3.1"] }] },
      // 8 · Find It: the original, and why he worked to please.
      { bank: [{ type: "find_it", prompt: "Which sentence tells why he worked so hard to please the farm families?", keywords: ["please"], lines: [["p014", 0]],
        hint: "Look for what the farmers thought of the cost of schooling.", why: "The farmers thought schooling a grievous burden, so he made himself useful and agreeable.", standards: ["K12.EE.1.1"] }] },
      // 9 · Character Clue (the boss): away from school, and the lion and the lamb.
      { q: { type: "character_clue", prompt: "Away from the classroom, which side of Ichabod comes out with the families?",
          choices: [["Soft and charming, eager to win the mothers over", true], ["Bossy and loud, just as he is with his class"], ["Shy and nervous, hiding away from the parents"]],
          lines: [["p014", 2], ["p014", 3]], hint: "Compare the master in school with the man rocking a cradle.", why: "He drops his lordly ways and turns gentle, petting the children and rocking a cradle to win the mothers' favor.", standards: ["R.1.1", "K12.EE.1.1"] },
        bank: [{ type: "character_clue", prompt: "The narrator compares Ichabod with a fierce animal gently carrying a young one. What does that picture say about him?", keywords: ["fierce animal"],
          choices: [["A stern man turns tender when he wants favor", true], ["He is fierce and dangerous to small children"], ["He keeps animals on the farms where he stays"]],
          lines: [["p014", 3]], hint: "Find the lion in the sentence about the cradle.", why: "Like a lion gently holding a lamb, the stern master turns wonderfully gentle and ingratiating.", standards: ["R.1.1", "K12.EE.1.1"] }] },
      // 10 · Theme Thread, written: pride and how people see themselves; a theme question in its bank too.
      { q: { type: "theme_thread", format: "written", prompt: "In one sentence, explain what Ichabod's pride in leading the choir suggests about how people see themselves.",
          written: { key_ideas: [["pride", "proud", "vain", "vanity", "conceit", "full of himself", "think highly", "ego", "admir", "show off"], ["see themselves", "see himself", "own mind", "imagin", "believ", "think", "picture", "better than", "greater", "than they", "really", "truly", "others"]],
            model: "Pride can make people see themselves as greater than they really are, just as Ichabod believes his choir leading outshines even the parson." },
          lines: [["p015", 1]], hint: "Notice the words \"in his own mind.\"", why: "Leading the choir is \"a matter of no little vanity,\" and only \"in his own mind\" does he beat the parson: pride shapes how he sees himself.", standards: ["R.1.2", "K12.EE.1.1"] },
        bank: [{ type: "theme_thread", format: "written", prompt: "Using one sentence, state the lesson about people that Ichabod's pride in leading the choir suggests.",
          written: { key_ideas: [["pride", "proud", "vain", "vanity", "conceit", "full of himself", "think highly", "ego", "admir", "show off"], ["see themselves", "see himself", "own mind", "imagin", "believ", "think", "picture", "better than", "greater", "than they", "really", "truly", "others"]],
            model: "Pride can make people believe they are better than they really are, the way Ichabod thinks he outdoes the parson." },
          lines: [["p015", 1]], hint: "Whose opinion is it that he beats the parson?", why: "Only \"in his own mind\" does he carry away the palm from the parson: vanity colors how he sees himself.", standards: ["R.1.2", "K12.EE.1.1"] }] },
    ],
  },
};
