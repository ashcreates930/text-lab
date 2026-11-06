// Sleepy Hollow Expeditions 3 to 14 rebuilt to the phase 3 rules and the lessons from the review of Expeditions 1 and
// 2 (scripts/expeditions/rebuilt.ts): a bank question on every chunk that tests something different, two drag and
// drops never back to back, a choose-two, a chunk where every question is written (so every student writes), the twist
// (Catch the Lie) mid-expedition, the boss in level 2 at the map's landmark, proof sentences on every two-part question
// (clue words when the sentence holds the word itself), quoted story words in quotation marks, theme questions about
// ideas, and lightning beats that recall an earlier chunk (never the proof of the chunk just before the beat).
import type { Rebuilt } from "./rebuilt.ts";

const R = (k: string, n: number) => [k, n] as [string, number];

export const REBUILT_MORE: Record<string, Rebuilt> = {
  // Expedition 3: whose eyes, between the lines, match the character (drag and drop), choose two, figure it out, find
  // it, Catch the Lie (twist), theme in writing, shades of meaning (boss), cause and effect (drag and drop).
  "tales-by-the-fire": {
    lightning: [{ id: "tea-table", chunk: 2, after: 4, question: "What extra treat appears when the schoolmaster visits a farmhouse?", answer: [R("p016", 1)] },
      { id: "clover-bed", chunk: 5, after: 8, question: "Where did Ichabod like to stretch out and read after school?", answer: [R("p018", 3)] }],
    chunks: [
      // 1 · Whose Eyes? (warm-up): the original (the singing), and who thinks his life is easy.
      { bank: [{ type: "whose_eyes", prompt: "According to the narrator, who thinks the schoolmaster's living is simple?", keywords: ["According to the narrator"],
        choices: [["Only people who know nothing of mental work", true], ["Every parent who sends a child to his school"], ["The parson, who envies all of his many jobs"]],
        lines: [R("p015", 3)], hint: "Read the end of the sentence about his makeshifts.", why: "Only those \"who understood nothing of the labor of headwork\" think he has an easy life: the narrator hints the farmers misjudge him.", standards: ["R.1.3", "K12.EE.1.1"] }] },
      // 2 · Between the lines (warm-up): the original (best dishes), and why the women look up to him.
      { bank: [{ type: "between_lines", prompt: "Why might the farm women look up to the new teacher?", keywords: ["look up to"],
        choices: [["He seems finer than the rough local young men", true], ["He owns the largest farm in the whole valley"], ["He comes from a famous and wealthy family"]],
        lines: [R("p016", 0)], hint: "Compare him with the other young men of the neighborhood.", why: "They think him gentlemanlike, of far superior taste to the rough country swains, and second in learning only to the parson.", standards: ["K12.EE.3.1", "K12.EE.1.1"] }] },
      // 3 · Character Clue, drag and drop: match each action to Ichabod or the bashful country boys.
      { q: { type: "character_clue", format: "dnd", prompt: "Match each action in the Sunday churchyard to the person who does it.",
          dnd: { kind: "match_character", slots: [{ id: "ichabod", label: "Ichabod" }, { id: "boys", label: "The bashful country boys" }],
            items: [{ id: "grapes", text: "Gathers wild grapes for the young women", slot: "ichabod", line: R("p016", 3) },
              { id: "epitaphs", text: "Recites the words on the tombstones to amuse them", slot: "ichabod", line: R("p016", 3) },
              { id: "hang", text: "Hangs back sheepishly", slot: "boys", line: R("p016", 3) },
              { id: "envy", text: "Envies another man's elegance", slot: "boys", line: R("p016", 3) }] },
          hint: "Who shows off, and who watches from the side?", why: "Ichabod gathers grapes and recites epitaphs for the young women, while the bashful country boys hang back, envying his elegance.", standards: ["R.1.1", "K12.EE.1.1"] },
        bank: [{ type: "character_clue", prompt: "What does his Sunday behavior with the young women reveal about him?", keywords: ["reveal"],
          choices: [["He loves to show off and be admired", true], ["He is shy and tongue-tied around them"], ["He is rude and bored by their company"]],
          lines: [R("p016", 3)], hint: "Look at all the ways he entertains them.", why: "He gathers grapes, recites epitaphs and strolls with a whole bevy of them, showing off his elegance.", standards: ["R.1.1", "K12.EE.1.1"] }] },
      // 4 · Between the lines, choose two: why he is welcome; and what his favorite book suggests.
      { q: { type: "between_lines", format: "multi", pick: 2, prompt: "Which two reasons make the farm wives glad to see him at their doors?", keywords: ["glad to see him"],
          choices: [["He brings news and gossip from every house", true], ["They think he is a man of great learning", true], ["He pays each family well for his meals"], ["He mends their broken spinning wheels"]],
          hint: "Look at what he brings with him, and what the women think of him.", why: "He is a travelling gazette full of local gossip, and the women esteem him as a man of great erudition.", standards: ["K12.EE.3.1", "K12.EE.1.1"] },
        bank: [{ type: "between_lines", prompt: "What does his favorite author tell you about Ichabod's own beliefs?", keywords: ["favorite author"],
          choices: [["He is ready to believe in the supernatural", true], ["He doubts every ghost story he hears"], ["He cares only for practical farming advice"]],
          lines: [R("p017", 1)], hint: "What is Cotton Mather's book about, and how much does Ichabod trust it?", why: "He is a perfect master of Mather's history of witchcraft, in which he most firmly and potently believes.", standards: ["K12.EE.3.1", "K12.EE.1.1"] }] },
      // 5 · Figure It Out: the original ("capacious swallow", quoted), and the whimpering brook.
      { q: { type: "figure_it_out", focus: "for his capacious swallow", prompt: "Read the words \"for his capacious swallow.\" What kind of figurative language is this?", keywords: ["capacious swallow"],
          choices: [["Metaphor: believing stories is described as swallowing food", true], ["Simile: it compares stories to food using like or as"], ["Onomatopoeia: the word swallow imitates a gulping sound"]],
          choices2: { prompt: "What does it mean?", options: [["He will believe any tale, however wild", true], ["He eats huge meals while reading stories"], ["He tells his stories much too fast"]] },
          hint: "Can you really swallow a story? Think about what he does with the tales he hears.", why: "He swallows tales the way a big eater swallows food: no story is too monstrous for him to believe.", standards: ["R.3.1"], reviewed: true },
        bank: [{ type: "figure_it_out", focus: "whimpered", prompt: "The narrator says the little brook \"whimpered.\" Which device is this?", keywords: ["whimpered"],
          choices: [["Personification: the brook is given a human cry", true], ["Simile: the brook is compared using like or as"], ["Alliteration: the same first sound repeats"]],
          choices2: { prompt: "What does it suggest about the brook?", options: [["It makes a soft, sad little sound", true], ["It floods the schoolhouse every spring"], ["It is too loud for him to read by"]] },
          hint: "Who usually whimpers?", why: "Only people and animals whimper: the brook gets a soft, sad, human sound.", standards: ["R.3.1"] }] },
      // 6 · Find It: the original (the beetle), and the night sounds.
      { bank: [{ type: "find_it", prompt: "Which line lists the night noises that make his mind run wild?", keywords: ["night noises"], lines: [R("p018", 4)],
        hint: "Look for a list of birds, toads and rustling.", why: "The whip-poor-will, the tree toad, the screech owl and the rustling in the thicket all flutter his excited imagination.", standards: ["K12.EE.1.1"] }] },
      // 7 · Catch the Lie (the twist): Brom on why he sang, and Hans on whether anyone heard.
      { q: { type: "catch_lie", prompt: "Brom Bones explains why the schoolmaster made music at night. Part of what he says is false. Tap the sentence that proves it.",
          testimony: { speaker: "brom-bones", text: "He only sang on those walks home to show off his voice to the farmers along the road." },
          lines: [R("p018", 6)], hint: "Why did he sing when he was alone at night?", why: "He sang psalm tunes to drown thought or drive away evil spirits, not to show off.", standards: ["K12.EE.1.1"] },
        bank: [{ type: "catch_lie", prompt: "Hans Van Ripper remembers it differently. One detail is untrue. Tap the sentence that shows it.",
          testimony: { speaker: "hans-van-ripper", text: "Nobody ever heard him. He sang so softly on that dark road that not a note reached the houses." },
          lines: [R("p018", 6)], hint: "What did the people sitting by their doors hear?", why: "The good people sitting by their doors were filled with awe at hearing his nasal melody floating from the distant hill.", standards: ["K12.EE.1.1"] }] },
      // 8 · Theme Thread, written (every student writes): the pleasure of fear, and why people believe strange stories.
      { q: { type: "theme_thread", format: "written", prompt: "In one sentence, explain what these cozy nights suggest about why people enjoy being scared.",
          written: { key_ideas: [["scare", "scary", "fear", "fright", "terror", "spook", "eerie", "ghost", "goblin", "creepy"], ["enjoy", "pleasure", "love", "fun", "delight", "thrill", "exciting", "like", "entertain"]],
            model: "People enjoy being scared by stories because fear feels thrilling when they are safe and warm among friends." },
          lines: [R("p019", 0)], hint: "Notice the words \"fearful pleasure.\"", why: "Listening to tales of ghosts and goblins is a \"fearful pleasure\": a scare can be fun when it is shared by a warm fire.", standards: ["R.1.2", "K12.EE.1.1"] },
        bank: [{ type: "theme_thread", format: "written", prompt: "Using your own words, tell in one sentence what these gatherings suggest about why people believe strange stories.",
          written: { key_ideas: [["believ", "trust", "accept", "convinc", "credul", "true", "real"], ["everyone", "together", "share", "each other", "others", "group", "neighbor", "around them", "same", "community"]],
            model: "People believe strange stories more easily when everyone around them shares and trusts the same stories." },
          lines: [R("p019", 0)], hint: "Who tells the tales, and who believes them?", why: "The old wives share their marvellous tales and Ichabod adds his own: a whole circle that believes makes the stories feel true.", standards: ["R.1.2", "K12.EE.1.1"] }] },
      // 9 · Shades of Meaning (the boss): wistful (proof: the snug fireside), and "ghastly glare" (clue words).
      { q: { type: "shades", focus: "wistful", prompt: "Why does the narrator call his look wistful instead of just sad?", keywords: ["wistful"],
          choices: [["It shows a longing for the warm, safe homes he sees", true], ["It shows he is angry at the people inside"], ["It shows he is bored by the cold, empty fields he crosses"]],
          lines: [R("p020", 0)], hint: "Where was he snug and safe earlier that evening?", why: "After snugly cuddling in a glowing chimney corner, he eyes every distant window with longing.", standards: ["V.1.3", "R.3.1"] },
        bank: [{ type: "shades", focus: "ghastly glare", prompt: "Why might the narrator call the snowy light a \"ghastly glare\" rather than a bright shine?", keywords: ["ghastly glare"],
          choices: [["It makes the light seem eerie and scary", true], ["It shows the moon is shining warmly"], ["It means the snow is melting quickly"]],
          lines: [R("p020", 1)], clues: ["fearful shapes and shadows"], hint: "What does that light show him on the path?", why: "The light shows \"fearful shapes and shadows\": ghastly means ghostly and terrifying, not just bright.", standards: ["V.1.3", "R.3.1"], reviewed: true }] },
      // 10 · Story Order, drag and drop: cause and effect on the walk home.
      { q: { type: "story_structure", format: "dnd", prompt: "Connect each sight or sound on his walk to the fear it stirs up.",
          dnd: { kind: "cause_effect", slots: [{ id: "shrub", label: "A shrub covered with snow" }, { id: "steps", label: "The crunch of his own steps" }, { id: "blast", label: "A rushing blast howling in the trees" }],
            items: [{ id: "sheet", text: "He thinks a ghost in a sheet blocks his path", slot: "shrub", line: R("p020", 3) },
              { id: "shoulder", text: "He is afraid to look over his shoulder", slot: "steps", line: R("p020", 4) },
              { id: "hessian", text: "He thinks the Galloping Hessian is riding by", slot: "blast", line: R("p020", 5) }] },
          hint: "Each \"How often\" sentence pairs something he notices with what he fears.", why: "The snowy shrub looks like a sheeted spectre, his own steps make him dread looking back, and the wind sounds like the Hessian.", standards: ["R.1.1", "K12.EE.3.1"] },
        bank: [{ type: "story_structure", prompt: "What do the three frights on his walk build up to?", keywords: ["build up to"],
          choices: [["His worst fear: the Galloping Hessian is near", true], ["His plan to move closer to the schoolhouse"], ["His choice to stop visiting the old wives"]],
          lines: [R("p020", 5)], hint: "Which fear comes last, and which is the biggest?", why: "The frights grow from a shrub to his own footsteps to the wind he takes for the Galloping Hessian himself.", standards: ["R.1.1", "K12.EE.3.1"] }] },
    ],
  },
  // Expedition 4: whose eyes, word detective, character clue, find it, build the case (drag and drop), figure it out,
  // Catch the Lie (twist), feeling of the word (drag and drop), choose two, theme in writing (boss).
  "the-van-tassel-farm": {
    lightning: [{ id: "eighteen", chunk: 2, after: 4, question: "How old is Katrina when Ichabod meets her?", answer: [R("p022", 1)] },
      { id: "elm-spring", chunk: 5, after: 8, question: "What bubbles up at the foot of the great elm?", answer: [R("p023", 5)] }],
    chunks: [
      // 1 · Whose Eyes? (warm-up): the original (the joke about a woman), and the narrator's view of the night frights.
      { bank: [{ type: "whose_eyes", prompt: "What does the narrator believe about the scary things Ichabod saw?", keywords: ["narrator believe"],
        choices: [["They were made up inside his own head", true], ["They were real spirits haunting the roads"], ["They were tricks the farm boys played"]],
        lines: [R("p021", 0)], hint: "What does the narrator call them at the start of the sentence?", why: "He calls them \"mere terrors of the night, phantoms of the mind\": the narrator treats them as imagined.", standards: ["R.1.3", "K12.EE.1.1"] }] },
      // 2 · Word Detective: the original (vast expectations, proved by her father's wealth), and blooming (clue words).
      { q: { type: "word_detective", focus: "vast expectations", prompt: "In this chunk, what do the words vast expectations mean?", keywords: ["vast expectations"],
          choices: [["A large fortune she is expected to inherit", true], ["Very high hopes for her lovely singing voice"], ["A long list of chores she must finish"]],
          lines: [R("p022", 0)], hint: "Whose only child is she?", why: "As the only child of a substantial farmer, she expects to inherit his fortune.", standards: ["V.1.3", "K12.EE.1.1"], reviewed: true },
        bank: [{ type: "word_detective", focus: "blooming", prompt: "Which meaning of blooming fits Katrina?", keywords: ["blooming"],
          choices: [["Healthy and fresh, in the bloom of youth", true], ["Covered with flowers from her garden"], ["Pale and tired from too much work"]],
          lines: [R("p022", 1)], clues: ["fresh eighteen", "rosy-cheeked"], hint: "Find the words nearby that describe her age and her cheeks.", why: "She is \"fresh eighteen\" and \"rosy-cheeked\": blooming means healthy and in the bloom of youth.", standards: ["V.1.3", "K12.EE.1.1"], reviewed: true }] },
      // 3 · Character Clue: the original (coquette, proved by the sentence), and her jewelry.
      { q: { type: "character_clue", prompt: "Which trait do Katrina's clothes reveal?", keywords: ["trait"],
          choices: [["She likes to be noticed and admired", true], ["She doesn't care at all how she looks"], ["She wears only plain work clothes"]],
          lines: [R("p022", 2)], hint: "What does the narrator call her, and why does she mix her fashions?", why: "She is \"a little of a coquette,\" choosing whatever fashions best set off her charms.", standards: ["R.1.1", "K12.EE.1.1"] },
        bank: [{ type: "character_clue", prompt: "What does Katrina's choice of jewelry show about her?", keywords: ["jewelry"],
          choices: [["She proudly shows off old family wealth", true], ["She cannot afford any jewelry of her own"], ["She dislikes anything old-fashioned"]],
          lines: [R("p022", 3)], hint: "Where did the gold come from?", why: "She wears the pure gold her great-great-grandmother brought from Saardam: family wealth on show.", standards: ["R.1.1", "K12.EE.1.1"] }] },
      // 4 · Find It: the original (Baltus summed up), and how far his thoughts go.
      { bank: [{ type: "find_it", prompt: "Which line shows Baltus rarely thinks past his own fences?", keywords: ["own fences"], lines: [R("p023", 2)],
        hint: "Look for the word boundaries.", why: "He seldom sent his eyes or his thoughts beyond the boundaries of his own farm.", standards: ["K12.EE.1.1"] }] },
      // 5 · Weigh the Evidence, drag and drop: build the case that Baltus is content (one piece belongs nowhere).
      { q: { type: "weigh_evidence", format: "dnd", prompt: "Build the case that Baltus is happy with the life he has.",
          dnd: { kind: "build_case", slots: [{ id: "claim", label: "Claim" }, { id: "proof", label: "Proof sentence" }, { id: "reason", label: "Reason" }],
            items: [{ id: "claim", text: "Baltus is happy with the life he has", slot: "claim" },
              { id: "proof", text: "\"He was satisfied with his wealth, but not proud of it\"", slot: "proof", line: R("p023", 3) },
              { id: "reason", text: "He enjoys plenty without needing to show off", slot: "reason", line: R("p023", 3) },
              { id: "elm", text: "A great elm tree spreads its branches over the house", slot: null }] },
          hint: "A case needs a claim, a quotation that proves it, and a reason that connects them.", why: "The quotation shows he is satisfied, the reason explains it (plenty, not style), and the elm tree proves nothing about his feelings.", standards: ["K12.EE.1.1", "K12.EE.3.1"] },
        bank: [{ type: "weigh_evidence", prompt: "Which detail best supports the claim that the farm has everything it needs close at hand?", keywords: ["close at hand"],
          choices: [["A spring of the sweetest water bubbles up under the elm", true], ["Baltus is satisfied with his wealth but not proud"], ["Dutch farmers like to settle in sheltered spots"]],
          lines: [R("p023", 5)], hint: "Which detail is about something useful right beside the house?", why: "Fresh water bubbles up right at the foot of the elm by the house; the other details are about feelings or about farmers in general.", standards: ["K12.EE.1.1", "K12.EE.3.1"] }] },
      // 6 · Figure It Out: the original (the barn and the church, quoted), and the bowing pigeons.
      { q: { type: "figure_it_out", focus: "might have served for a church", prompt: "Read the words \"might have served for a church.\" What kind of figurative language is this?", keywords: ["served for a church"],
          choices: [["Hyperbole: the barn is so huge it could be a church", true], ["Simile: it compares the barn to a church using like"], ["Personification: the barn prays like a person"]],
          choices2: { prompt: "What does it mean?", options: [["The barn is enormous", true], ["The barn holds Sunday worship"], ["The barn is quiet and peaceful"]] },
          hint: "Could a barn really hold a whole congregation? Think about its size.", why: "The barn is exaggerated to the size of a church: it is enormous.", standards: ["R.3.1"], reviewed: true },
        bank: [{ type: "figure_it_out", focus: "bowing about their dames", prompt: "Some pigeons are \"bowing about their dames.\" Which device is this?", keywords: ["bowing"],
          choices: [["Personification: birds act like gentlemen", true], ["Simile: birds compared using like or as"], ["Hyperbole: a wild exaggeration of size"]],
          choices2: { prompt: "What does it show about the farm?", options: [["It feels lively, cozy and content", true], ["The pigeons are about to fly off"], ["The barn is falling into ruin"]] },
          hint: "Who usually bows to a lady?", why: "The pigeons bow to their mates like gentlemen: the whole farm seems happy and well mannered.", standards: ["R.3.1"] }] },
      // 7 · Catch the Lie (the twist): the original (Brom on the animals), and Katrina on the guinea fowls.
      { bank: [{ type: "catch_lie", prompt: "Katrina adds her own memory of the animals. One detail is untrue. Tap the sentence that shows it.",
        testimony: { speaker: "katrina-van-tassel", text: "Our farmyard birds were the gentlest things. Even the guinea fowls never made a sound." },
        lines: [R("p023", 8)], hint: "What noise do the guinea fowls make?", why: "The guinea fowls fret about the farmyard with a peevish, discontented cry.", standards: ["K12.EE.1.1"] }] },
      // 8 · Shades, drag and drop: the rooster's pride and his care; the bank asks about gallant (clue words).
      { q: { type: "shades", format: "dnd", prompt: "Sort each phrase about the rooster: does it show his pride, or his care for his family?",
          dnd: { kind: "word_feeling", slots: [{ id: "pride", label: "Shows his pride" }, { id: "care", label: "Shows his care for his family" }],
            items: [{ id: "strut", text: "Struts before the barn door", slot: "pride", line: R("p023", 9) },
              { id: "wings", text: "Claps his shining wings", slot: "pride", line: R("p023", 9) },
              { id: "crow", text: "Crows with pride and gladness", slot: "pride", line: R("p023", 9) },
              { id: "call", text: "Calls his hungry family over", slot: "care", line: R("p023", 9) },
              { id: "share", text: "Shares the tasty morsel he found", slot: "care", line: R("p023", 9) }] },
          hint: "Is he showing himself off, or looking after the others?", why: "Strutting, wing-clapping and crowing show off his pride; calling his family to the morsel shows his care.", standards: ["V.1.3", "R.3.1"] },
        bank: [{ type: "shades", focus: "gallant", prompt: "Why does the narrator call the rooster gallant instead of just proud?", keywords: ["gallant"],
          choices: [["It makes him sound like a brave, polite gentleman", true], ["It makes him sound weak and too tired to crow"], ["It makes him sound lazy and sleepy"]],
          lines: [R("p023", 9)], clues: ["a warrior and a fine gentleman", "generously calling"], hint: "Find the words nearby that make him sound like a hero.", why: "He is \"a warrior and a fine gentleman\" who generously calls his family: gallant means brave and courteous.", standards: ["V.1.3", "R.3.1"], reviewed: true }] },
      // 9 · Between the lines, choose two: what his daydream reveals; the original as its bank.
      { q: { type: "between_lines", format: "multi", pick: 2, prompt: "Which two things does Ichabod's daydream at the farm reveal about him?", keywords: ["daydream"],
          choices: [["He thinks about food nearly all the time", true], ["He has a lively, vivid imagination", true], ["He feels sorry for the farm animals"], ["He hopes to work as a butcher"]],
          hint: "What does he picture, and how detailed is the picture?", why: "His mouth waters as he pictures every animal as a richly detailed dish: food is always on his mind, and his imagination runs wild.", standards: ["K12.EE.3.1", "K12.EE.1.1"] },
        bank: ["original"] },
      // 10 · Theme Thread (the boss), written (every student writes): wanting something shapes what people see; greed.
      { q: { type: "theme_thread", format: "written", prompt: "In one sentence, explain what this scene suggests about how wanting something changes what people see.",
          written: { key_ideas: [["want", "desire", "greed", "hunger", "hungry", "appetite", "wish", "long"], ["see", "view", "look", "imagin", "picture", "everything", "world", "the way", "notice"]],
            model: "When people want something badly, they see the world through that desire, the way hungry Ichabod sees every animal as a meal." },
          lines: [R("p024", 2)], hint: "What does he see when he looks at a living rooster?", why: "Even the proud rooster becomes a side dish in his eyes: what a person wants shapes everything they see.", standards: ["R.1.2", "K12.EE.1.1"] },
        bank: [{ type: "theme_thread", format: "written", prompt: "Using your own words, tell in one sentence what lesson about greed this scene suggests.",
          written: { key_ideas: [["greed", "greedy", "hunger", "appetite", "want", "desire"], ["everything", "anything", "see", "turn", "take", "consume", "use", "living", "alive"]],
            model: "Greed can turn everything a person sees into something to take or consume, even creatures that are alive and happy." },
          lines: [R("p024", 2)], hint: "Look at what happens to each happy animal in his mind.", why: "Pigs, turkeys and even chanticleer become bacon, sausages and side dishes: greed turns living things into things to devour.", standards: ["R.1.2", "K12.EE.1.1"] }] },
    ],
  },
  // Expedition 5: word detective, find it, word detective, shades, build the case (drag and drop), whose eyes, theme in
  // writing (boss), find it, Catch the Lie (twist), match the character (drag and drop).
  "a-rival-appears": {
    lightning: [{ id: "kentucky", chunk: 2, after: 4, question: "Where does Ichabod picture himself riding off to?", answer: [R("p025", 1)] },
      { id: "ostrich-egg", chunk: 5, after: 8, question: "What hangs from the centre of the best parlor?", answer: [R("p026", 6)] }],
    chunks: [
      // 1 · Word Detective (warm-up): enraptured (clue words); the original inference as its bank.
      { q: { type: "word_detective", focus: "enraptured", prompt: "Which meaning of enraptured fits Ichabod here?", keywords: ["enraptured"],
          choices: [["Filled with delight, carried away by joy", true], ["Trapped inside the farmhouse by a storm"], ["Angry and jealous of the farmer's riches"]],
          lines: [R("p025", 0)], clues: ["his heart yearned", "his imagination expanded"], hint: "Find the words that show what his heart and imagination do.", why: "His heart yearns and his imagination expands: enraptured means carried away with delight.", standards: ["V.1.3", "K12.EE.1.1"], reviewed: true },
        bank: [{ type: "word_detective", focus: "domains", prompt: "What does domains mean here?", keywords: ["domains"],
          choices: [["Lands and property she will own", true], ["Kingdoms ruled by a faraway king"], ["Rooms inside the big farmhouse"]],
          lines: [R("p025", 0)], clues: ["fat meadow lands", "rich fields of wheat", "orchards burdened with ruddy fruit"], hint: "Look at the list of what surrounds the house.", why: "Meadows, fields and orchards surround the house: her domains are the lands she will inherit.", standards: ["V.1.3", "K12.EE.1.1"], reviewed: true }] },
      // 2 · Find It (warm-up): the original (the move out west), and how he would travel.
      { bank: [{ type: "find_it", prompt: "Which line shows how they would travel on their way west?", keywords: ["travel"], lines: [R("p025", 1)],
        hint: "Look for a wagon and a horse.", why: "Katrina and the children ride on a loaded wagon while Ichabod bestrides a pacing mare.", standards: ["K12.EE.1.1"] }] },
      // 3 · Word Detective: the original (piazza), and husbandry (clue words).
      { bank: [{ type: "word_detective", focus: "husbandry", prompt: "What does husbandry mean in this chunk?", keywords: ["husbandry"],
        choices: [["Farming and the care of the land", true], ["Being a good husband to a wife"], ["Saving money for hard times"]],
        lines: [R("p026", 2)], clues: ["flails", "harness", "nets for fishing"], hint: "Look at the other tools hung up beside them.", why: "Flails, harness and fishing nets hang with them: husbandry means farming.", standards: ["V.1.3", "K12.EE.1.1"], reviewed: true }] },
      // 4 · Shades: the original (wondering, proved by the dazzling pewter), and resplendent (clue words).
      { q: { type: "shades", focus: "wondering", prompt: "Why does the narrator call him the wondering Ichabod instead of just Ichabod?", keywords: ["wondering"],
          choices: [["It shows he is amazed by everything he sees", true], ["It shows he is lost and cannot find the hall"], ["It shows he suspects the family of something"]],
          lines: [R("p026", 5)], hint: "What happens to his eyes when he steps inside?", why: "The pewter dazzles his eyes: he is full of wonder at everything in the house.", standards: ["V.1.3", "R.3.1"] },
        bank: [{ type: "shades", focus: "resplendent", prompt: "Why might the narrator call the pewter \"resplendent\" rather than simply clean?", keywords: ["resplendent"],
          choices: [["It shines so brightly it dazzles him", true], ["It is old and dented, and dull to look at"], ["It is far too heavy for anyone to lift"]],
          lines: [R("p026", 5)], clues: ["dazzled his eyes"], hint: "What does the pewter do to his eyes?", why: "The pewter dazzles his eyes: resplendent means brilliantly shining.", standards: ["V.1.3", "R.3.1"], reviewed: true }] },
      // 5 · Weigh the Evidence, drag and drop: build the case that the house shows off its wealth; the bank asks about "shone like mirrors".
      { q: { type: "weigh_evidence", format: "dnd", prompt: "Build the case that the Van Tassels like visitors to see their riches.",
          dnd: { kind: "build_case", slots: [{ id: "claim", label: "Claim" }, { id: "proof", label: "Proof sentence" }, { id: "reason", label: "Reason" }],
            items: [{ id: "claim", text: "The Van Tassels like visitors to see their riches", slot: "claim" },
              { id: "proof", text: "\"a corner cupboard, knowingly left open, displayed immense treasures of old silver and well-mended china\"", slot: "proof", line: R("p026", 6) },
              { id: "reason", text: "The cupboard is left open on purpose, so guests can admire what is inside", slot: "reason", line: R("p026", 6) },
              { id: "wool", text: "A huge bag of wool stands ready to be spun", slot: null }] },
          hint: "Which detail shows something displayed on purpose?", why: "The cupboard is \"knowingly left open\" to display the silver and china; the bag of wool shows work, not showing off.", standards: ["K12.EE.1.1", "K12.EE.3.1"] },
        bank: [{ type: "weigh_evidence", prompt: "Which detail most strongly supports the claim that this rich household also works hard?", keywords: ["works hard"],
          choices: [["Cloth sits in a corner fresh from the loom", true], ["The mahogany tables gleam like mirrors"], ["Shells decorate the parlor mantelpiece"]],
          lines: [R("p026", 6)], hint: "Which detail shows a job just finished?", why: "Linsey-woolsey just from the loom and wool ready to be spun show the family at work; the tables and shells only show comfort.", standards: ["K12.EE.1.1", "K12.EE.3.1"] }] },
      // 6 · Whose Eyes?: why the narrator brings up knights, and his tone.
      { q: { type: "whose_eyes", prompt: "What point is the narrator making by bringing up heroes from old romances?", keywords: ["old romances"],
          choices: [["To joke that real rivals are harder than dragons", true], ["To show that Ichabod once fought in a real war"], ["To prove that Katrina loves tales of knights"]],
          lines: [R("p027", 1)], hint: "How hard were the knights' battles, according to him?", why: "Giants and dragons were \"easily conquered adversaries\": he jokes that Ichabod's task is harder.", standards: ["R.1.3", "K12.EE.1.1"] },
        bank: [{ type: "whose_eyes", prompt: "What is the narrator's tone when he calls dragons \"easily conquered adversaries\"?", keywords: ["tone"],
          choices: [["Playful and mocking", true], ["Serious and respectful"], ["Fearful and grim"]],
          lines: [R("p027", 1)], hint: "Are dragons really easy to beat?", why: "Calling dragons easy, like carving a Christmas pie, is a playful joke at the old romances.", standards: ["R.1.3", "K12.EE.1.1"], reviewed: true }] },
      // 7 · Theme Thread (the boss), written (every student writes): real life is harder than old tales; winning love.
      { q: { type: "theme_thread", format: "written", prompt: "In one sentence, explain what this chunk suggests about everyday life compared with old tales of heroes.",
          written: { key_ideas: [["real", "actual", "everyday", "life", "people"], ["hard", "difficult", "trouble", "complicat", "struggle", "tougher", "more than", "messier"]],
            model: "Everyday life can be harder than old tales of heroes, because real people and real rivals cause more trouble than any dragon." },
          lines: [R("p027", 2)], hint: "What does Ichabod face instead of dragons?", why: "Instead of easily beaten giants, he faces a whimsical coquette and real rivals of flesh and blood: real life is harder than the romances.", standards: ["R.1.2", "K12.EE.1.1"] },
        bank: [{ type: "theme_thread", format: "written", prompt: "Using your own words, tell in one sentence what this chunk suggests about winning someone's love.",
          written: { key_ideas: [["love", "win", "court", "affection", "someone"], ["hard", "difficult", "change", "whim", "rival", "compet", "others", "trouble", "patience"]],
            model: "Winning someone's love is hard when that person keeps changing and many others want the same thing." },
          lines: [R("p027", 2)], hint: "Think about Katrina's whims and the rivals at every door.", why: "A labyrinth of whims and a host of angry rivals stand in his way: love is hard to win.", standards: ["R.1.2", "K12.EE.1.1"] }] },
      // 8 · Find It: the original (the nickname), and his looks and mood.
      { bank: [{ type: "find_it", prompt: "Which line describes Brom's looks and his mood?", keywords: ["looks"], lines: [R("p028", 1)],
        hint: "Look for his hair, his shoulders and his face.", why: "Broad-shouldered, curly-haired, with a mingled air of fun and arrogance.", standards: ["K12.EE.1.1"] }] },
      // 9 · Catch the Lie (the twist): the original (Hans on his riding), and Katrina on the races.
      { bank: [{ type: "catch_lie", prompt: "Katrina has her own story about Brom. One detail is untrue. Tap the sentence that shows it.",
        testimony: { speaker: "katrina-van-tassel", text: "At the races Brom always hung back and let the other young men win." },
        lines: [R("p028", 4)], hint: "Where was Brom at every race?", why: "He was foremost at all races and cock fights, not hanging back.", standards: ["K12.EE.1.1"] }] },
      // 10 · Character Clue, drag and drop: Brom or his companions; and the mix of traits in Brom.
      { q: { type: "character_clue", format: "dnd", prompt: "Match each description to Brom or to his band of friends.",
          dnd: { kind: "match_character", slots: [{ id: "brom", label: "Brom" }, { id: "friends", label: "His three or four friends" }],
            items: [{ id: "fight", text: "Always ready for a fight or a frolic", slot: "brom", line: R("p028", 5) },
              { id: "mischief", text: "Has more mischief than ill-will in him", slot: "brom", line: R("p028", 5) },
              { id: "model", text: "Look up to him as their model", slot: "friends", line: R("p028", 6) },
              { id: "follow", text: "Ride behind him to every feud or party", slot: "friends", line: R("p028", 6) }] },
          hint: "One person leads; the others follow and admire.", why: "Brom is ready for a fight or a frolic and full of mischief; his boon companions regard him as their model and follow him everywhere.", standards: ["R.1.1", "K12.EE.1.1"] },
        bank: [{ type: "character_clue", prompt: "What mix of traits does the narrator give Brom?", keywords: ["mix of traits"],
          choices: [["Rough, but more playful than cruel", true], ["Cruel, wanting to hurt everyone he meets"], ["Quiet and gentle, keeping to himself"]],
          lines: [R("p028", 5)], hint: "What lies at the bottom of all his roughness?", why: "With all his overbearing roughness, there is a strong dash of waggish good humor at bottom.", standards: ["R.1.1", "K12.EE.1.1"] }] },
    ],
  },
};
