// Builds world.json "expeditions" from the spec below. Proof lines are given as [paragraph, sentence index] and copied
// exactly from source.md, so they can never drift from the story. Run: node --experimental-strip-types scripts/build-expeditions.ts
import { readFileSync, writeFileSync } from "node:fs";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { evidenceSentences } from "../lib/lies.ts";
import { SLEEPY_HOLLOW_MORE } from "./expeditions/sleepy-hollow.ts";
import { theVultureEye } from "./expeditions/tell-tale-heart.ts";
import { theWrightKitchen } from "./expeditions/trifles.ts";
import { REBUILT } from "./expeditions/rebuilt.ts";

export type Ref = [string, number];
// format, pick, dnd and written: the phase 3 formats (lib/formats.ts); a drag-and-drop piece's line is the sentence
// that backs it, as [paragraph, sentence index].
export type Q = { type: string; format?: string; pick?: number; dnd?: { kind: string; slots: { id: string; label: string }[]; items: { id: string; text: string; slot: string | null; line?: Ref }[] }; written?: { key_ideas: string[][]; model: string }; prompt: string; keywords?: string[]; focus?: string; choices?: [string, boolean?][]; choices2?: { prompt: string; options: [string, boolean?][] }; lines?: Ref[]; words?: string[]; testimony?: { speaker: string; text: string }; theories?: { id: string; name: string; lines: Ref[] }[]; hint: string; why: string; standards: string[]; reviewed?: boolean; note?: string; clues?: string[] };
export type C = { seg: [string, number, number][]; gist: [string, boolean?][]; discovery: [string, "figurative" | "vocabulary", string]; q: Q };
export type S = { text: string; lines: Ref[]; gesture?: "laughing" | "head-shake" };
export type W = { character: string; cards: [string, string]; truth: S; lie: S; caught: string };
// lightning: a recall beat from an approved sprint (by id), or written out with its answer sentence(s).
export type E = { id: string; title: string; chunks: C[]; interview?: W[]; lightning?: { sprint?: string; id?: string; chunk: number; after: number; question?: string; answer?: Ref[] }[] };

// draft: written to draft_expeditions for the teacher's review (students never see them); rules: an approved exception.
const SPEC: Record<string, { front_matter: string[]; expeditions: E[]; draft?: boolean; rules?: { max_sentences?: number; arc_pending?: string[] } }> = {
  "sleepy-hollow": {
    front_matter: ["p001", "p002", "p073", "p074", "p082"],
    // Expeditions still to be rebuilt to the arc (lib/pacing.ts); validate:worlds checks the arc on every other one.
    rules: { arc_pending: ["tales-by-the-fire", "the-van-tassel-farm", "a-rival-appears", "the-feud", "the-invitation", "the-ride-to-the-party", "the-feast-and-the-dance", "ghost-stories", "the-lonely-road", "the-headless-horseman", "gone", "the-postscript"] },
    expeditions: [{
      id: "into-the-hollow", title: "Into the Hollow",
      // Lightning beats (lib/pacing.ts): recall, one tap, 10 seconds; from the approved Proof Race sprints.
      lightning: [{ sprint: "walk", chunk: 2, after: 4 }, { sprint: "wounded", chunk: 7, after: 8 }],
      chunks: [
        { seg: [["p003", 0, 2]],
          gist: [["A river town got its name, the narrator says, from husbands who lingered at the tavern.", true], ["A river town is famous for sailors who pray to St. Nicholas."], ["The narrator proves the town was named by Dutch sailors who stopped there to trade."]],
          discovery: ["inveterate propensity", "vocabulary", "Inveterate propensity: a habit so old and strong it can't be broken."],
          q: { type: "whose_eyes", prompt: "How sure is the storyteller about where the town's name came from?", keywords: ["How sure", "storyteller"],
            choices: [["Not sure: he passes on a story he heard without promising it's true", true], ["Completely sure, because he was there when it was named"], ["Very sure: he checked the old town records himself and found proof"]],
            lines: [["p003", 2]], hint: "Read his own words closely. Does he ever promise the story is true?", why: "He says he does not vouch for the fact, so he is repeating a story, not swearing to it.", standards: ["R.1.3", "K12.EE.1.1"] } },
        { seg: [["p003", 3, 4]],
          gist: [["A very quiet valley sits about two miles from the village.", true], ["A noisy brook floods the valley every spring."], ["A noisy mill town sits about twenty miles from the village."]],
          discovery: ["lull one to repose", "figurative", "Lull one to repose: the brook is so soft it could rock you to sleep."],
          q: { type: "find_it", prompt: "About how long a walk is it from the river port to the hollow?", keywords: ["how long a walk"], lines: [["p003", 3]],
            hint: "Look for a distance, counted in miles.", why: "The valley is perhaps about two miles from the village.", standards: ["K12.EE.1.1"] } },
        { seg: [["p004", 0, 2]],
          gist: [["The narrator remembers how still the valley was, even to a boy out hunting.", true], ["The narrator remembers being chased out of the valley by a ghost one night."], ["The narrator remembers hunting with his father every Sunday in the valley."]],
          discovery: ["angry echoes", "figurative", "Angry echoes: the echoes get a human feeling, as if the quiet woods were annoyed by the noise."],
          q: { type: "shades", focus: "stripling", prompt: "The narrator calls his younger self a stripling. Why that word instead of plain boy?", keywords: ["stripling"],
            choices: [["It makes him sound young and new at hunting", true], ["It shows he was already the most skilled hunter around"], ["It suggests he was frail and often sick as a boy"]],
            lines: [["p004", 1]], hint: "How does the boy react to the sound of his own gun?", why: "He was startled by the roar of his own gun: a stripling is young and untested.", standards: ["V.1.3", "R.3.1"], reviewed: true } },
        { seg: [["p005", 0, 1]],
          gist: [["The valley's sleepy mood gave Sleepy Hollow its name.", true], ["The Dutch settlers left the Hollow because it was too quiet."], ["Boys from the Hollow are known for their hard work."]],
          discovery: ["sequestered glen", "vocabulary", "Sequestered glen: a hidden, out-of-the-way valley."],
          q: { type: "word_detective", focus: "listless", prompt: "In this chunk, what does listless mean?", keywords: ["listless"],
            choices: [["Lacking energy; slow and sleepy", true], ["Without a list or any plan"], ["Full of nervous, jumpy worry"]],
            lines: [["p005", 1]], hint: "Find the sentence that feels sleepy.", why: "A drowsy, dreamy influence hangs over the land: listless means low on energy.", standards: ["V.1.3", "K12.EE.1.1"], reviewed: true } },
        { seg: [["p005", 2, 3]],
          gist: [["People blame old magic for the spell that still hangs over the valley.", true], ["A doctor cured the settlers of a strange sleeping sickness."], ["Henry Hudson drove an old wizard out, and the valley woke up for good."]],
          discovery: ["continual reverie", "vocabulary", "Reverie: a daydream. A continual reverie means drifting through life half-dreaming."],
          q: { type: "figure_it_out", focus: "holds a spell over the minds of the good people", prompt: "Read the words holds a spell over the minds of the good people. What kind of figurative language is this?", keywords: ["holds a spell over the minds"],
            choices: [["Metaphor: the valley's mood is called a spell, without like or as", true], ["Simile: the spell is compared to sleep using the word like"], ["Hyperbole: a wild exaggeration for a laugh"]],
            choices2: { prompt: "What does it mean?", options: [["Something about the place shapes what people think and believe", true], ["A real witch is casting nightly spells on the farmers' crops"], ["The people are tired from working too hard"]] },
            hint: "Does a spell have to be real magic? Think about what keeps their minds dreamy.", why: "The spell stands for the dreamy mood that rules how people think.", standards: ["R.3.1"], reviewed: true } },
        { seg: [["p005", 4, 5]],
          gist: [["The people of the Hollow accept strange sights, and the valley is full of spooky tales.", true], ["The people of the Hollow laugh at strange sights, and they doubt every spooky tale."], ["Scientists come to the valley to study stars and meteors."]],
          discovery: ["with her whole ninefold", "figurative", "The nightmare is pictured as a creature with her nine children, playing over the valley at night."],
          q: { type: "between_lines", prompt: "What can you infer about the people of the Hollow?", keywords: ["infer"],
            choices: [["They are quick to accept the uncanny as real", true], ["They are afraid to leave home after dark"], ["They doubt every tale they are told"]],
            lines: [["p005", 4], ["p005", 5]], hint: "Look at what they see and hear that nobody else does.", why: "They hold marvellous beliefs and see strange sights, so they accept the uncanny easily.", standards: ["K12.EE.3.1", "K12.EE.1.1"] } },
        { seg: [["p006", 0, 1]],
          gist: [["The valley's main ghost is a headless horseman, said to be a soldier killed in battle.", true], ["A general of the Revolutionary War still rides through the Hollow."], ["The valley's main ghost is a farmer who lost his horse in a storm long ago."]],
          discovery: ["on the wings of the wind", "figurative", "As if on the wings of the wind: the rider moves so fast he seems to fly."],
          q: { type: "catch_lie", prompt: "Brom Bones tells the tale. One thing he says is false. Tap the line that proves it.", keywords: ["false"],
            testimony: { speaker: "brom-bones", text: "Every child in the Hollow knows this one. The Headless Horseman was a Hessian trooper who lost his head to a sword in some battle, and folks see him tearing through the dark at night." },
            lines: [["p006", 1]], hint: "Brom tells it with flair. Check exactly what took the trooper's head.", why: "The story says a cannon-ball carried his head away, not a sword.", standards: ["K12.EE.1.1"] } },
        { seg: [["p006", 2, 3]],
          gist: [["The ghost rides out each night to look for his head and hurries back before dawn.", true], ["The ghost guards the church so no one can go inside."], ["Historians proved the ghost is a story invented by a farmer to scare thieves."]],
          discovery: ["like a midnight blast", "figurative", "Like a midnight blast: a simile. The rider rushes past like a sudden gust of night wind."],
          q: { type: "character_clue", prompt: "Which trait fits the headless spirit in this chunk?", keywords: ["trait"],
            choices: [["Driven and pressed for time, racing to beat the dawn", true], ["Calm and patient, waiting quietly for travelers to pass"], ["Lost, unable to find his way home"]],
            words: ["in a hurry to get back to the churchyard before daybreak", "rushing speed"], hint: "Look at how fast he moves, and why.", why: "He passes with rushing speed, in a hurry to get back to the churchyard before daybreak.", standards: ["R.1.1", "K12.EE.1.1"] } },
        { seg: [["p007", 0, 0], ["p008", 0, 1]],
          gist: [["Everyone who lives in the Hollow, even newcomers, soon starts to dream and see ghosts.", true], ["Newcomers to the Hollow stay wide awake and laugh at the legend."], ["Only the old Dutch families dream and see ghosts, while every newcomer stays wide awake and sensible."]],
          discovery: ["region of shadows", "figurative", "Region of shadows: a dark, mysterious place where wild stories grow."],
          q: { type: "theme_thread", prompt: "Which idea keeps coming back in the story so far?", keywords: ["keeps coming back"],
            choices: [["This valley's dreamy spell takes hold of anyone who stays there", true], ["Hard work always wins out over idle dreaming in the end"], ["Strangers are never welcome in small towns"]],
            lines: [["p008", 1], ["p008", 0]], hint: "Even folks who arrive wide awake don't stay that way. Find where it says so.", why: "The same dreamy spell shows up again: anyone who stays begins to dream dreams and see apparitions.", standards: ["R.1.2", "K12.EE.1.1"] } },
        { seg: [["p009", 0, 2]],
          gist: [["The narrator praises the Hollow as a quiet place that never seems to change.", true], ["The narrator warns that the Hollow is changing too fast and losing its old ways."], ["The narrator says he never wants to see the Hollow again."]],
          discovery: ["nooks of still water", "figurative", "Nooks of still water: the valley is a calm pool beside a rushing river of change."],
          q: { type: "between_lines", prompt: "What can you infer about how the narrator feels about the busy world beyond the Hollow?", keywords: ["infer", "busy world"],
            choices: [["He treasures quiet places that stay the same while the rest of the country hurries on", true], ["He is excited by every new improvement and wishes the valley would hurry to catch up"], ["He pities the Hollow for being left behind and forgotten"]],
            lines: [["p009", 0], ["p009", 1]], hint: "Look at the words he picks for change and for the valley. Which does he praise?", why: "He praises the valley with all possible laud because its customs remain fixed while a restless country sweeps by.", standards: ["K12.EE.3.1", "K12.EE.1.1"] } },
      ],
      // The Interview: each witness's truth is confirmed, and lie disproved, by exact lines in this expedition.
      interview: [
        { character: "brom-bones", cards: ["Tell me about the Headless Horseman.", "Where would a traveler run into him?"],
          truth: { text: "He doesn't keep to the Hollow, not him. He's out on the highways too, and the ground around the old meeting house is where he likes to prowl.", lines: [["p006", 2]] },
          lie: { text: "He's out searching for the horse he lost, see, and he's never pressed. He takes his own sweet time getting home, slow as you please.", lines: [["p006", 3]], gesture: "laughing" },
          caught: "Ha! All right, you got me. I just like to see folks jump." },
        { character: "hans-van-ripper", cards: ["What should a newcomer know about this part of the country?", "Tell me about the town and the valley near it."],
          truth: { text: "The farm wives christened the town, on account of their men loitering at the inn whenever they went in to sell their crops.", lines: [["p003", 1]] },
          lie: { text: "That hollow is a full day's journey from town, and I'll tell you plainly, it's the noisiest spot in all the county.", lines: [["p003", 3]], gesture: "head-shake" },
          caught: "Hmph. Fine. I may have stretched it a little." },
        { character: "katrina-van-tassel", cards: ["Do the old tales take hold of people here?", "Who believes the stories told in this valley?"],
          truth: { text: "Folks who come here clear-headed and sensible don't stay that way. Give them a season, and they start spotting ghosts too.", lines: [["p008", 1]] },
          lie: { text: "Only the families born in the Hollow believe those tales. Anyone who moves here from outside just laughs at them.", lines: [["p008", 0], ["p008", 1]] },
          caught: "Oh, you caught that? Clever. I only wanted to see if you were listening." },
      ] }, ...SLEEPY_HOLLOW_MORE],
  },
  // Drafts wait for review and their rebuild to the phase 3 rules (arc_pending).
  "tell-tale-heart": { front_matter: [], expeditions: [theVultureEye], draft: true, rules: { max_sentences: 10, arc_pending: ["the-vulture-eye"] } },
  trifles: { front_matter: [], expeditions: [theWrightKitchen], draft: true, rules: { max_sentences: 15, arc_pending: ["the-wright-kitchen"] } },
};

for (const [worldId, spec] of Object.entries(SPEC)) {
  const path = `worlds/${worldId}/world.json`, world = JSON.parse(readFileSync(path, "utf8"));
  const passages = parseSourcePassages(readFileSync(`public/worlds/${worldId}/source.md`, "utf8"));
  const line = ([p, i]: Ref) => { const x = passages.find((q) => q.id === p); const s = x ? evidenceSentences(x.text)[i] : undefined; if (!s) throw new Error(`${worldId}: no sentence ${p}[${i}]`); return s; };
  // Stored option order is shuffled (seeded by the options, so a rebuild is stable): the best answer is not always first.
  const opts = (o: [string, boolean?][]) => { const list = o.map(([text, best]) => (best ? { text, best: true } : { text })); let h = 2166136261; for (const ch of o.map((x) => x[0]).join("|")) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); const r = (h >>> 0) % list.length; return [...list.slice(r), ...list.slice(0, r)]; };
  world.front_matter = spec.front_matter;
  if (spec.rules) world.expedition_rules = spec.rules;
  const question = (q: Q) => ({ type: q.type, ...(q.format ? { format: q.format } : {}), ...(q.pick ? { pick: q.pick } : {}),
        ...(q.dnd ? { dnd: { kind: q.dnd.kind, slots: q.dnd.slots, items: q.dnd.items.map((it) => ({ id: it.id, text: it.text, slot: it.slot, ...(it.line ? { line: line(it.line) } : {}) })) } } : {}),
        ...(q.written ? { written: q.written } : {}), prompt: q.prompt, keywords: q.keywords ?? [], ...(q.focus ? { focus: q.focus } : {}), ...(q.choices ? { choices: opts(q.choices) } : {}), ...(q.choices2 ? { choices2: { prompt: q.choices2.prompt, options: opts(q.choices2.options) } } : {}),
        ...(q.lines || q.words ? { proof: { ...(q.lines ? { lines: q.lines.map(line) } : {}), ...(q.words ? { words: q.words } : {}) } } : {}),
        ...(q.testimony ? { testimony: q.testimony } : {}), ...(q.theories ? { theories: q.theories.map((t) => ({ id: t.id, name: t.name, lines: t.lines.map(line) })) } : {}),
        hint: q.hint, why: q.why, standards: q.standards, ...(q.reviewed ? { reviewed: true } : {}), ...(q.note ? { note: q.note } : {}), ...(q.clues ? { clues: q.clues } : {}) });
  const built = spec.expeditions.map((e) => { const re = REBUILT[e.id]; return { id: e.id, title: e.title, chunks: e.chunks.map((c, k) => {
    const o = re?.chunks[k];
    return { id: `${e.id}-${String(k + 1).padStart(2, "0")}`, segments: c.seg.map(([p, from, to]) => ({ p, from, to })), gist: { options: opts(c.gist) },
      discovery: { phrase: c.discovery[0], kind: c.discovery[1], note: c.discovery[2] },
      question: question(o?.q ?? c.q), ...(o?.bank?.length ? { bank: o.bank.map((b) => question(b === "original" ? c.q : b)) } : {}) };
  }), ...(re?.lightning ?? e.lightning ? { lightning: (re?.lightning ?? e.lightning)!.map((l) => { const sp = l.sprint ? (world.scenes as { sprints?: { id: string; question: string; answers: string[] }[] }[]).flatMap((x) => x.sprints ?? []).find((x) => x.id === l.sprint) : null; if (l.sprint && !sp) throw new Error(`${e.id}: no sprint ${l.sprint}`);    return { id: l.id ?? l.sprint!, chunk: l.chunk, after: l.after, question: l.question ?? sp!.question, answer: l.answer ? l.answer.map(line) : sp!.answers }; }) } : {}), ...(e.interview ? { interview: { witnesses: e.interview.map((w) => {
    const st = (x: S) => ({ text: x.text, lines: x.lines.map(line), ...(x.gesture ? { gesture: x.gesture } : {}) });
    return { character: w.character, cards: w.cards, truth: st(w.truth), lie: st(w.lie), caught: w.caught };
  }) } } : {}) }; });
  if (spec.draft) world.draft_expeditions = built; else world.expeditions = built;
  writeFileSync(path, JSON.stringify(world, null, 2) + "\n");
  console.log(`${worldId}: ${built.length} ${spec.draft ? "draft " : ""}expedition(s), ${built.reduce((a: number, e: { chunks: unknown[] }) => a + e.chunks.length, 0)} chunks`);
}
