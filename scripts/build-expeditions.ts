// Builds world.json "expeditions" from the spec below. Proof lines are given as [paragraph, sentence index] and copied
// exactly from source.md, so they can never drift from the story. Run: node --experimental-strip-types scripts/build-expeditions.ts
import { readFileSync, writeFileSync } from "node:fs";
import { parseSourcePassages } from "../lib/source-passages.ts";
import { evidenceSentences } from "../lib/lies.ts";

type Ref = [string, number];
type Q = { type: string; prompt: string; keywords?: string[]; choices?: [string, boolean?][]; choices2?: { prompt: string; options: [string, boolean?][] }; lines?: Ref[]; words?: string[]; testimony?: { speaker: string; text: string }; theories?: { id: string; name: string; lines: Ref[] }[]; hint: string; why: string; standards: string[]; reviewed?: boolean };
type C = { seg: [string, number, number][]; gist: [string, boolean?][]; discovery: [string, "figurative" | "vocabulary", string]; q: Q };
type E = { id: string; title: string; chunks: C[] };

const SPEC: Record<string, { front_matter: string[]; expeditions: E[] }> = {
  "sleepy-hollow": {
    front_matter: ["p001", "p002"],
    expeditions: [{
      id: "into-the-hollow", title: "Into the Hollow", chunks: [
        { seg: [["p003", 0, 2]],
          gist: [["A river town got its name, the narrator says, from husbands who lingered at the tavern.", true], ["A river town is famous for sailors who pray to St. Nicholas."], ["The narrator proves exactly how Tarry Town got its name."]],
          discovery: ["inveterate propensity", "vocabulary", "Inveterate propensity: a habit so old and strong it can't be broken."],
          q: { type: "whose_eyes", prompt: "How sure is the storyteller about where the town's name came from?", keywords: ["How sure", "storyteller"],
            choices: [["Not sure: he passes on a story he heard without promising it's true", true], ["Completely sure, because he was there when it was named"], ["Sure, because the housewives told him themselves"]],
            words: ["I do not vouch for the fact"], hint: "Read his own words closely. Does he ever promise the story is true?", why: "He says he does not vouch for the fact, so he is repeating a story, not swearing to it.", standards: ["R.1.3", "K12.EE.1.1"] } },
        { seg: [["p003", 3, 4]],
          gist: [["A very quiet valley sits about two miles from the village.", true], ["A noisy brook floods the valley every spring."], ["The valley is far away and hard to reach."]],
          discovery: ["lull one to repose", "figurative", "Lull one to repose: the brook is so soft it could rock you to sleep."],
          q: { type: "find_it", prompt: "About how long a walk is it from the river port to the hollow?", keywords: ["how long a walk"], lines: [["p003", 3]],
            hint: "Look for a distance, counted in miles.", why: "The valley is perhaps about two miles from the village.", standards: ["K12.EE.1.1"] } },
        { seg: [["p004", 0, 2]],
          gist: [["The narrator remembers how still the valley was, even to a boy out hunting.", true], ["The narrator remembers being chased out of the valley by a ghost one night."], ["The narrator remembers hunting with his father every Sunday in the valley."]],
          discovery: ["angry echoes", "figurative", "Angry echoes: the echoes get a human feeling, as if the quiet woods were annoyed by the noise."],
          q: { type: "shades", prompt: "The narrator calls his younger self a stripling. Why that word instead of plain boy?", keywords: ["stripling", "instead of plain boy"],
            choices: [["It makes him sound young and untested, new at hunting", true], ["It shows he was the best hunter in the valley"], ["It means he was sickly and weak"]],
            words: ["my first exploit"], hint: "Would an old hand call it his first try? Find his own words about the hunt.", why: "Stripling paints a young, untested boy, and he calls the hunt his first exploit.", standards: ["V.1.3", "R.3.1"], reviewed: true } },
        { seg: [["p005", 0, 1]],
          gist: [["The valley's sleepy mood gave Sleepy Hollow its name.", true], ["The Dutch settlers left the Hollow because it was too quiet."], ["Boys from the Hollow are known for their hard work."]],
          discovery: ["sequestered glen", "vocabulary", "Sequestered glen: a hidden, out-of-the-way valley."],
          q: { type: "word_detective", prompt: "In this chunk, what does listless mean?", keywords: ["listless"],
            choices: [["Lacking energy; slow and sleepy", true], ["Without a list or a plan"], ["Full of nervous worry"]],
            words: ["drowsy, dreamy influence", "repose", "drowsy", "dreamy"], hint: "Find the words around it that feel sleepy.", why: "Repose and a drowsy, dreamy influence tell you listless means low on energy.", standards: ["V.1.3", "K12.EE.1.1"], reviewed: true } },
        { seg: [["p005", 2, 3]],
          gist: [["People blame old magic for the spell that still hangs over the valley.", true], ["A doctor cured the settlers of a strange sleeping sickness."], ["Henry Hudson drove a wizard out of the valley."]],
          discovery: ["continual reverie", "vocabulary", "Reverie: a daydream. A continual reverie means drifting through life half-dreaming."],
          q: { type: "figure_it_out", prompt: "Read the words holds a spell over the minds of the good people. What kind of figurative language is this?", keywords: ["holds a spell over the minds"],
            choices: [["Metaphor: the valley's mood is called a spell, without like or as", true], ["Simile: a comparison that uses like or as"], ["Hyperbole: a wild exaggeration for a laugh"]],
            choices2: { prompt: "What does it mean?", options: [["Something about the place shapes what people think and believe", true], ["A real witch is casting spells on the town"], ["The people are tired from working too hard"]] },
            hint: "Does a spell have to be real magic? Think about what keeps their minds dreamy.", why: "The spell stands for the dreamy mood that rules how people think.", standards: ["R.3.1"], reviewed: true } },
        { seg: [["p005", 4, 5]],
          gist: [["The people of the Hollow accept strange sights, and the valley is full of spooky tales.", true], ["The people of the Hollow laugh at ghost stories."], ["Scientists come to the valley to study stars and meteors."]],
          discovery: ["with her whole ninefold", "figurative", "The nightmare is pictured as a creature with her nine children, playing over the valley at night."],
          q: { type: "between_lines", prompt: "What can you infer about the people of the Hollow?", keywords: ["infer"],
            choices: [["They are quick to accept the uncanny as real", true], ["They are afraid to leave home after dark"], ["They don't trust tales they hear"]],
            lines: [["p005", 4], ["p005", 5]], hint: "Look at what they see and hear that nobody else does.", why: "They hold marvellous beliefs and see strange sights, so they accept the uncanny easily.", standards: ["K12.EE.3.1", "K12.EE.1.1"] } },
        { seg: [["p006", 0, 1]],
          gist: [["The valley's main ghost is a headless horseman, said to be a soldier killed in battle.", true], ["A general of the Revolutionary War still rides through the Hollow."], ["The ghost is a farmer who lost his horse in a storm."]],
          discovery: ["on the wings of the wind", "figurative", "As if on the wings of the wind: the rider moves so fast he seems to fly."],
          q: { type: "catch_lie", prompt: "Brom Bones tells the tale. One thing he says is false. Tap the line that proves it.", keywords: ["false"],
            testimony: { speaker: "brom-bones", text: "Every child in the Hollow knows this one. The Headless Horseman was a Hessian trooper who lost his head to a sword in some battle, and folks see him tearing through the dark at night." },
            lines: [["p006", 1]], hint: "Brom tells it with flair. Check exactly what took the trooper's head.", why: "The story says a cannon-ball carried his head away, not a sword.", standards: ["K12.EE.1.1"] } },
        { seg: [["p006", 2, 3]],
          gist: [["The ghost rides out each night to look for his head and hurries back before dawn.", true], ["The ghost guards the church so no one can go inside."], ["Historians proved the ghost is only a story."]],
          discovery: ["like a midnight blast", "figurative", "Like a midnight blast: a simile. The rider rushes past like a sudden gust of night wind."],
          q: { type: "character_clue", prompt: "Which trait fits the headless spirit in this chunk?", keywords: ["trait"],
            choices: [["Driven and pressed for time, racing to beat the dawn", true], ["Calm and patient with travelers"], ["Lost, unable to find his way home"]],
            words: ["in a hurry to get back to the churchyard before daybreak", "rushing speed"], hint: "Look at how fast he moves, and why.", why: "He passes with rushing speed, in a hurry to get back to the churchyard before daybreak.", standards: ["R.1.1", "K12.EE.1.1"] } },
        { seg: [["p007", 0, 0], ["p008", 0, 1]],
          gist: [["Everyone who lives in the Hollow, even newcomers, soon starts to dream and see ghosts.", true], ["Newcomers to the Hollow stay wide awake and laugh at the legend."], ["The Headless Horseman story is only told to children."]],
          discovery: ["region of shadows", "figurative", "Region of shadows: a dark, mysterious place where wild stories grow."],
          q: { type: "theme_thread", prompt: "Which idea keeps coming back in the story so far?", keywords: ["keeps coming back"],
            choices: [["This valley's dreamy spell takes hold of anyone who stays there", true], ["Hard work always wins in the end"], ["Strangers are never welcome in small towns"]],
            lines: [["p008", 1], ["p008", 0]], hint: "Even folks who arrive wide awake don't stay that way. Find where it says so.", why: "The same dreamy spell shows up again: anyone who stays begins to dream dreams and see apparitions.", standards: ["R.1.2", "K12.EE.1.1"] } },
        { seg: [["p009", 0, 2]],
          gist: [["The narrator praises the Hollow as a quiet place that never seems to change.", true], ["The narrator warns that the Hollow is changing too fast."], ["The narrator says he never wants to see the Hollow again."]],
          discovery: ["nooks of still water", "figurative", "Nooks of still water: the valley is a calm pool beside a rushing river of change."],
          q: { type: "make_call", prompt: "Make the call: what is the Headless Horseman?", keywords: ["Make the call"],
            theories: [
              { id: "real-ghost", name: "A real ghost haunts the Hollow", lines: [["p006", 0], ["p006", 1], ["p006", 3]] },
              { id: "valley-story", name: "A story the dreamy valley tells itself", lines: [["p005", 3], ["p005", 4], ["p008", 1], ["p007", 0]] },
              { id: "grew-from-truth", name: "A real soldier's death that grew into a legend", lines: [["p006", 1], ["p007", 0], ["p005", 5]] },
            ],
            hint: "Any call can win. Pin the two lines that back yours best.", why: "Each theory has lines that support it; the proof decides.", standards: ["K12.EE.1.1", "K12.EE.3.1"] } },
      ] }],
  },
};

for (const [worldId, spec] of Object.entries(SPEC)) {
  const path = `worlds/${worldId}/world.json`, world = JSON.parse(readFileSync(path, "utf8"));
  const passages = parseSourcePassages(readFileSync(`public/worlds/${worldId}/source.md`, "utf8"));
  const line = ([p, i]: Ref) => { const x = passages.find((q) => q.id === p); const s = x ? evidenceSentences(x.text)[i] : undefined; if (!s) throw new Error(`${worldId}: no sentence ${p}[${i}]`); return s; };
  const opts = (o: [string, boolean?][]) => o.map(([text, best]) => (best ? { text, best: true } : { text }));
  world.front_matter = spec.front_matter;
  world.expeditions = spec.expeditions.map((e) => ({ id: e.id, title: e.title, chunks: e.chunks.map((c, k) => {
    const q = c.q;
    return { id: `${e.id}-${String(k + 1).padStart(2, "0")}`, segments: c.seg.map(([p, from, to]) => ({ p, from, to })), gist: { options: opts(c.gist) },
      discovery: { phrase: c.discovery[0], kind: c.discovery[1], note: c.discovery[2] },
      question: { type: q.type, prompt: q.prompt, keywords: q.keywords ?? [], ...(q.choices ? { choices: opts(q.choices) } : {}), ...(q.choices2 ? { choices2: { prompt: q.choices2.prompt, options: opts(q.choices2.options) } } : {}),
        ...(q.lines || q.words ? { proof: { ...(q.lines ? { lines: q.lines.map(line) } : {}), ...(q.words ? { words: q.words } : {}) } } : {}),
        ...(q.testimony ? { testimony: q.testimony } : {}), ...(q.theories ? { theories: q.theories.map((t) => ({ id: t.id, name: t.name, lines: t.lines.map(line) })) } : {}),
        hint: q.hint, why: q.why, standards: q.standards, ...(q.reviewed ? { reviewed: true } : {}) } };
  }) }));
  writeFileSync(path, JSON.stringify(world, null, 2) + "\n");
  console.log(`${worldId}: ${world.expeditions.length} expedition(s), ${world.expeditions.reduce((a: number, e: { chunks: unknown[] }) => a + e.chunks.length, 0)} chunks`);
}
