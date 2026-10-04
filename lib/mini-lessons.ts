// Mini lessons: short, skill-first lessons students take before (or while) reading a story.
// Every passage below is original writing by AmplifiED for Text Lab, so lessons carry no copyright risk.
// Benchmark codes are grade-free families that resolveBenchmark() (lib/standards.ts) turns into the student's grade.

export type LessonCheck = { question: string; options: { text: string; correct?: boolean; why: string }[] };
export type MiniLesson = {
  id: string;
  title: string;
  group: "Reading closely" | "Story elements" | "Author's craft" | "Writing";
  minutes: number;
  grades: { min: number; max: number };
  goal: string; // "I can" statement
  why: string; // why this matters before reading, in student language
  benchmarks: string[];
  courseLink: string; // how it connects to AP and Cambridge
  cards: { heading: string; body: string; points?: string[] }[];
  model: { passage: string; steps: string[] };
  checks: LessonCheck[];
  goingFurther: string; // extension for grades 9 to 12
  useInStory: string; // what to do with the skill inside Text Lab
  aiTip: string; // AI as a resource, not the source
};

export const miniLessons: MiniLesson[] = [
  {
    id: "what-is-analysis", title: "What Is Text Analysis?", group: "Reading closely", minutes: 7, grades: { min: 6, max: 12 },
    goal: "I can make a claim about a text and support it with evidence and reasoning.",
    why: "Summary tells what happened. Analysis explains how and why. Every task in Text Lab asks you to analyze.",
    benchmarks: ["ELA.K12.EE.1.1", "ELA.K12.EE.3.1"],
    courseLink: "AP: Literary Argumentation, Claims and Evidence. Cambridge: AO1 knowledge and understanding, AO3 personal response.",
    cards: [
      { heading: "Summary versus analysis", body: "A summary retells events. Analysis makes a point about them that a reader could disagree with.", points: ["Summary: Mara hides the letter.", "Analysis: Mara hides the letter because she fears the truth more than the lie."] },
      { heading: "Claim, evidence, reasoning", body: "Analysis has three parts.", points: ["Claim: your arguable idea about the text.", "Evidence: the exact words from the text that support it.", "Reasoning: how the evidence proves the claim. This is where most of the thinking happens."] },
      { heading: "The reasoning test", body: "If you can delete your reasoning sentence and the paragraph still makes sense, it was not reasoning. Reasoning connects the quote to the claim with words like because, which shows, and this suggests." },
    ],
    model: {
      passage: "Jonah laughed louder than anyone at the party. When the music stopped, he checked his phone, frowned, and laughed again, a beat too late.",
      steps: ["Claim: Jonah is pretending to be happier than he is.", "Evidence: he laughs “a beat too late” after frowning at his phone.", "Reasoning: a late laugh right after a frown suggests he is performing joy, not feeling it."],
    },
    checks: [
      { question: "Which sentence is analysis, not summary?", options: [
        { text: "Jonah laughs at the party and checks his phone.", why: "This retells events. Nobody could disagree with it." },
        { text: "Jonah's late laugh shows he is hiding bad news.", correct: true, why: "It makes an arguable point and explains what a detail means." },
        { text: "The party has music.", why: "This is a fact from the text, not an idea about it." },
      ] },
      { question: "What is the job of reasoning?", options: [
        { text: "To repeat the quote in different words.", why: "Restating the quote adds nothing new." },
        { text: "To explain how the evidence proves the claim.", correct: true, why: "Reasoning is the bridge between the quote and your idea." },
        { text: "To add a second quote.", why: "More evidence helps, but it does not replace explaining the first." },
      ] },
    ],
    goingFurther: "Grades 9 to 12: make your claim about the author's choices, not only the character. “The author delays the laugh to reveal Jonah's performance” moves from character analysis to craft analysis.",
    useInStory: "Your INTERPRET answers on each clue are claims with reasoning. Your final writing should use at least three of them.",
    aiTip: "An AI character can give you an opinion, but it cannot give you evidence. Only the text can do that.",
  },
  {
    id: "inference", title: "Making Inferences", group: "Reading closely", minutes: 6, grades: { min: 6, max: 12 },
    goal: "I can combine text clues with what I know to figure out what the author does not say directly.",
    why: "Authors leave gaps on purpose. Detectives, lawyers, and readers fill those gaps with evidence.",
    benchmarks: ["ELA.K12.EE.3.1", "ELA.K12.EE.1.1"],
    courseLink: "AP: Character and Narration skills depend on inference. Cambridge: AO1, reading beneath the surface.",
    cards: [
      { heading: "The inference equation", body: "Text clue + what you already know = inference.", points: ["Clue: her umbrella is dripping.", "Knowledge: umbrellas drip after rain.", "Inference: it is raining, or it just was."] },
      { heading: "Strong versus weak inferences", body: "A strong inference is supported by more than one clue and does not ignore clues that point elsewhere. A weak inference is a guess that the text cannot support." },
      { heading: "Say how sure you are", body: "Use careful words: probably, suggests, it seems. Save “proves” for when the text states it." },
    ],
    model: {
      passage: "Ms. Ortiz set three plates on the table, then slowly put one back in the cabinet. She did not turn on the radio that night.",
      steps: ["Clue: she sets three plates, then removes one.", "Clue: she skips the radio, which seems to be her routine.", "Inference: someone who usually eats with her is gone, and she feels the loss."],
    },
    checks: [
      { question: "“Dev's hands shook as he opened the envelope from the college.” What is the strongest inference?", options: [
        { text: "Dev is nervous about the decision inside.", correct: true, why: "Shaking hands plus a college envelope point to nerves about the result." },
        { text: "Dev was rejected.", why: "Nothing yet tells us the result. This is a guess." },
        { text: "Dev is cold.", why: "Possible, but it ignores the envelope, the clue that matters most." },
      ] },
      { question: "Which word fits an inference best?", options: [
        { text: "proves", why: "Inferences are reasoned conclusions, so absolute words overstate them." },
        { text: "suggests", correct: true, why: "It shows you are reasoning from clues, not reading a stated fact." },
        { text: "obviously", why: "If it were obvious, it would not need inferring." },
      ] },
    ],
    goingFurther: "Grades 9 to 12: look for inferences the author invites and then overturns. Ask why the author let you believe the first reading.",
    useInStory: "Use NOTICE for the clue and INTERPRET for the inference. Keep them separate so your teacher can see your thinking.",
    aiTip: "If you ask a character to confirm your inference, check its answer against a line in the text before you trust it.",
  },
  {
    id: "characterization", title: "Characterization", group: "Story elements", minutes: 8, grades: { min: 6, max: 12 },
    goal: "I can explain how an author reveals a character through direct and indirect characterization.",
    why: "You will question characters in every story. Knowing how authors build them helps you decide who to believe.",
    benchmarks: ["ELA.R.1.1", "ELA.K12.EE.3.1"],
    courseLink: "AP: Character skill category. Cambridge: AO2, analysis of how writers create character.",
    cards: [
      { heading: "Direct characterization", body: "The narrator tells you what a character is like. “Mr. Hale was stingy.” It is quick, but you are trusting the narrator." },
      { heading: "Indirect characterization: STEAL", body: "Usually, authors show instead of tell. Look for:", points: ["Speech: what the character says and how.", "Thoughts: what goes on inside their head.", "Effect on others: how other characters react to them.", "Actions: what they do, especially under pressure.", "Looks: appearance, clothing, and body language."] },
      { heading: "Round, flat, dynamic, static", body: "A round character is complex; a flat one has one trait. A dynamic character changes; a static one stays the same. Changes usually point to the theme." },
    ],
    model: {
      passage: "Mr. Hale counted the change twice, then slid a quarter back across the counter. “You gave me too much,” he said. The cashier, who had braced for a complaint, smiled for the first time all day.",
      steps: ["Action: he counts the change twice, which suggests he is careful with money.", "Speech: he returns the extra quarter, which shows honesty.", "Effect on others: the cashier expected a complaint, so others may see him as difficult, which makes his honesty a surprise."],
    },
    checks: [
      { question: "“When the dog limped over, Rosa knelt in the mud in her new dress.” Which STEAL trait is this?", options: [
        { text: "Speech", why: "Rosa does not say anything here." },
        { text: "Actions", correct: true, why: "Kneeling in mud in a new dress is an action that reveals kindness." },
        { text: "Looks", why: "The dress is mentioned, but the choice to kneel is what reveals character." },
      ] },
      { question: "A character who learns to forgive by the end of the story is:", options: [
        { text: "Dynamic", correct: true, why: "Dynamic characters change in an important way." },
        { text: "Static", why: "Static characters stay the same." },
        { text: "Flat", why: "Flat describes depth, not change." },
      ] },
    ],
    goingFurther: "Grades 9 to 12: ask why the author chose indirect over direct characterization at a key moment, and what a reader would miss if the narrator simply told us.",
    useInStory: "When you question a character, notice their speech and what they avoid saying. That is characterization in action.",
    aiTip: "An AI character can be wrong about itself. Compare what it claims with what it does in the text.",
  },
  {
    id: "plot", title: "Elements of Plot", group: "Story elements", minutes: 7, grades: { min: 6, max: 10 },
    goal: "I can identify the parts of a plot and explain how each one moves the story forward.",
    why: "Knowing where you are in a story helps you predict, notice turning points, and choose your next move in the case.",
    benchmarks: ["ELA.R.1.1"],
    courseLink: "AP: Structure skill category. Cambridge: AO2, how structure shapes meaning.",
    cards: [
      { heading: "The plot line", body: "Most stories follow five parts:", points: ["Exposition: characters, setting, and the situation before trouble.", "Rising action: complications that build tension.", "Climax: the turning point, where the main conflict peaks.", "Falling action: the results of the climax.", "Resolution: how things settle, or fail to."] },
      { heading: "The climax is a turn, not just a loud moment", body: "Ask: after this moment, can things go back to how they were? If not, you have probably found the climax." },
      { heading: "Not every story is in order", body: "Authors use flashback (jumping back) and foreshadowing (hints of what is coming) to control what you know and when." },
    ],
    model: {
      passage: "Lena found the key in March. She told no one until June, when the shed burned down and the key was the only thing left that fit the old lock in her grandmother's desk.",
      steps: ["Exposition: Lena finds a key.", "Rising action: she keeps it secret for months.", "Climax: the shed burns, and the key suddenly matters.", "What comes next (the desk) is the falling action the author makes us wait for."],
    },
    checks: [
      { question: "Where does a story introduce its characters and setting?", options: [
        { text: "Exposition", correct: true, why: "Exposition sets up the world before the conflict builds." },
        { text: "Climax", why: "The climax is the turning point, usually later." },
        { text: "Resolution", why: "The resolution comes at the end." },
      ] },
      { question: "Which question best helps you find the climax?", options: [
        { text: "Which part is the most exciting?", why: "Exciting moments can happen anywhere in the rising action." },
        { text: "After which moment can things never go back to how they were?", correct: true, why: "The climax is the point of no return." },
        { text: "Which part is the longest?", why: "Length has nothing to do with the climax." },
      ] },
    ],
    goingFurther: "Grades 9 to 10: some stories end without a resolution. Ask what the author gains by leaving you unsettled.",
    useInStory: "Each scene in a story is one step on the plot line. Before you make a choice, ask: is this rising action or the turn?",
    aiTip: "Do not ask an AI character what happens next. Make a prediction, then let the text prove you right or wrong.",
  },
  {
    id: "conflict", title: "Types of Conflict", group: "Story elements", minutes: 5, grades: { min: 6, max: 10 },
    goal: "I can identify internal and external conflicts and explain how they drive the plot.",
    why: "Conflict is the engine of every story. Find it, and you find what the story is really about.",
    benchmarks: ["ELA.R.1.1"],
    courseLink: "AP: Character and Structure. Cambridge: AO1, understanding how tension is built.",
    cards: [
      { heading: "External conflict", body: "A struggle with something outside the character.", points: ["Character versus character", "Character versus nature", "Character versus society", "Character versus technology or the supernatural"] },
      { heading: "Internal conflict", body: "A struggle inside a character's mind: guilt, fear, a hard choice, two things they want at once." },
      { heading: "Conflicts layer", body: "The best stories pair an outer conflict with an inner one. The outer one creates the plot; the inner one creates the meaning." },
    ],
    model: {
      passage: "The flood gauge read four feet and rising. Marcus could save the generator or his brother's guitar, not both, and his brother would never know which one he chose.",
      steps: ["External: Marcus versus nature (the flood).", "Internal: a choice between what is practical and what is loyal.", "The detail “would never know” sharpens the internal conflict: the choice is about Marcus's own conscience."],
    },
    checks: [
      { question: "A girl must decide whether to report her best friend for cheating. This is mainly:", options: [
        { text: "Character versus nature", why: "Nothing in nature is involved." },
        { text: "Internal conflict", correct: true, why: "The struggle is a hard choice inside her mind." },
        { text: "Character versus technology", why: "No technology is involved." },
      ] },
      { question: "Why do authors pair outer and inner conflicts?", options: [
        { text: "The outer one drives the plot and the inner one carries the meaning.", correct: true, why: "Readers follow the action but remember the choice." },
        { text: "To make the story longer.", why: "Length is not the purpose." },
        { text: "Because every story must have exactly two conflicts.", why: "There is no such rule." },
      ] },
    ],
    goingFurther: "Grades 9 to 10: look for conflicts that are never resolved, and ask what the author is saying about problems that do not go away.",
    useInStory: "Your role in each story has its own conflict. Name it in your final writing.",
    aiTip: "Ask a character how they feel about a choice, then check whether their actions in the text match their answer.",
  },
  {
    id: "setting-mood", title: "Setting, Mood, and Tone", group: "Story elements", minutes: 7, grades: { min: 6, max: 12 },
    goal: "I can explain how setting creates mood and how word choice reveals tone.",
    why: "Every story world in Text Lab was built from its setting. Reading the setting tells you how to feel and what to watch for.",
    benchmarks: ["ELA.R.1.1", "ELA.K12.EE.3.1"],
    courseLink: "AP: Setting skill category. Cambridge: AO2, language and atmosphere.",
    cards: [
      { heading: "Setting is more than a place", body: "Setting includes time, place, weather, social rules, and history. Ask what is possible, and impossible, in this setting." },
      { heading: "Mood versus tone", body: "Mood is how the reader feels. Tone is the author's or narrator's attitude toward the subject.", points: ["Mood words: tense, gloomy, peaceful, eerie.", "Tone words: mocking, admiring, bitter, detached."] },
      { heading: "Find it in the words", body: "Circle sensory details and strong verbs. Ask what feeling they share. That shared feeling is the mood." },
    ],
    model: {
      passage: "The hallway light buzzed and flickered. Somewhere below, a pipe knocked twice, then stopped, as if listening.",
      steps: ["Setting details: buzzing light, a hallway, a pipe below.", "Word choice: “flickered,” “knocked,” and “as if listening” make the building seem alive.", "Mood: uneasy and suspenseful."],
    },
    checks: [
      { question: "Mood is:", options: [
        { text: "The author's attitude toward the subject.", why: "That is tone." },
        { text: "The feeling the reader gets from the text.", correct: true, why: "Mood lives in the reader's experience." },
        { text: "The time and place of the story.", why: "That is setting, which helps create mood." },
      ] },
      { question: "“The meadow hummed with bees, and the afternoon stretched out like a cat in the sun.” The mood is:", options: [
        { text: "Peaceful", correct: true, why: "Humming bees and a stretching cat suggest calm warmth." },
        { text: "Tense", why: "Nothing here creates danger or worry." },
        { text: "Gloomy", why: "The light and warmth point the other way." },
      ] },
    ],
    goingFurther: "Grades 9 to 12: notice when tone and mood clash, such as a cheerful narrator describing something terrible. That gap is often where irony and meaning live.",
    useInStory: "Turn on Show clues in a scene and read the setting before you open a clue. Ask what this place makes possible.",
    aiTip: "A character's description of a place reflects their mood. The narration may describe it differently. Compare both.",
  },
  {
    id: "point-of-view", title: "Point of View and Reliable Narrators", group: "Story elements", minutes: 8, grades: { min: 6, max: 12 },
    goal: "I can identify point of view and judge whether a narrator can be trusted.",
    why: "Several stories here are told by narrators who may not be telling the truth. Your job is to decide.",
    benchmarks: ["ELA.R.1.3", "ELA.K12.EE.1.1"],
    courseLink: "AP: Narration skill category. Cambridge: AO2, narrative voice and perspective.",
    cards: [
      { heading: "Who is telling the story?", body: "Point of view controls what you know.", points: ["First person (I, me): inside one character, limited to what they know and admit.", "Third person limited (he, she, they): close to one character.", "Third person omniscient: knows everything, including many characters' thoughts."] },
      { heading: "Unreliable narrators", body: "A narrator may be lying, mistaken, biased, too young to understand, or not thinking clearly. Watch for:", points: ["Claims that the narrator's own actions contradict.", "Other characters who react differently than the narrator expects.", "A narrator who insists too hard."] },
      { heading: "Observed, reported, claimed", body: "In your Case File, observed evidence is strongest, reported evidence is secondhand, and claimed evidence depends on trusting the speaker. Sort what a narrator says the same way." },
    ],
    model: {
      passage: "I am the calmest person in this office. I only threw the stapler because it was broken, and I only shouted because no one was listening.",
      steps: ["Claim: the narrator says they are “the calmest person.”", "Contradiction: they threw a stapler and shouted.", "Judgment: the narrator is unreliable; their actions disprove their claim, and the excuses (“only” twice) show them insisting too hard."],
    },
    checks: [
      { question: "A story uses “I” and “me.” What point of view is it?", options: [
        { text: "First person", correct: true, why: "First person uses I and me." },
        { text: "Third person omniscient", why: "Omniscient narrators use he, she, and they and know everyone's thoughts." },
        { text: "Second person", why: "Second person uses you." },
      ] },
      { question: "Which is the best sign of an unreliable narrator?", options: [
        { text: "The narrator uses long sentences.", why: "Style alone does not make a narrator unreliable." },
        { text: "The narrator's actions contradict what they say about themselves.", correct: true, why: "A gap between claims and actions is the clearest warning sign." },
        { text: "The narrator describes the weather.", why: "Description is normal for any narrator." },
      ] },
    ],
    goingFurther: "Grades 9 to 12: ask why the author chose an unreliable narrator. What does the reader experience that a trustworthy narrator could not create? Connect to irony.",
    useInStory: "Before you question a narrator character, write down one claim they make. Then hunt for an action that supports or contradicts it.",
    aiTip: "AI characters are built to stay in role, so an unreliable narrator's AI version may defend itself. The text is the authority.",
  },
  {
    id: "theme", title: "Theme Versus Topic", group: "Reading closely", minutes: 6, grades: { min: 6, max: 12 },
    goal: "I can state a theme as a complete idea and support it with evidence from across the text.",
    why: "Theme is what a story says about life. It is what your final writing should leave your reader thinking about.",
    benchmarks: ["ELA.R.1.2", "ELA.K12.EE.1.1"],
    courseLink: "AP: Literary Argumentation, interpreting meaning. Cambridge: AO1 and AO3, informed interpretation.",
    cards: [
      { heading: "Topic is a word; theme is a sentence", body: "A topic is a subject like guilt or family. A theme is what the story says about it.", points: ["Topic: guilt.", "Theme: hiding guilt can become more painful than confessing it."] },
      { heading: "Rules for a strong theme", body: "Write it as a complete sentence. Do not name characters. Avoid commands like “you should.” Make sure the whole story supports it, not one scene." },
      { heading: "Where themes hide", body: "Look at what a character learns, how the conflict ends, the title, and any repeated images or words." },
    ],
    model: {
      passage: "Every year, Theo built the tallest sandcastle on the beach, and every year the tide took it. This year, he built it with his little sister, and he watched the water come in without frowning.",
      steps: ["Topic: loss, or sharing.", "What changed: Theo no longer frowns when the castle is lost.", "Theme: what we build with others matters more than what lasts."],
    },
    checks: [
      { question: "Which is a theme, not a topic?", options: [
        { text: "Friendship", why: "One word names a topic, not a message." },
        { text: "True friends tell hard truths even when it costs them.", correct: true, why: "It is a complete, arguable idea about friendship." },
        { text: "Theo and his sister build a castle.", why: "This is a summary of events." },
      ] },
      { question: "Why should a theme statement avoid character names?", options: [
        { text: "Because a theme is a message about life beyond this one story.", correct: true, why: "Themes apply to people in general." },
        { text: "Because names are hard to spell.", why: "Spelling is not the reason." },
        { text: "Because characters are not important.", why: "Characters carry the theme; the statement just reaches beyond them." },
      ] },
    ],
    goingFurther: "Grades 9 to 12: track two themes that pull against each other and explain how the ending favors one.",
    useInStory: "Use the Recall check and real-world connection after the final scene to test your theme against your own life.",
    aiTip: "Ask an AI character what they learned, then decide for yourself whether the text supports their lesson.",
  },
  {
    id: "figurative-language", title: "Figurative Language and Imagery", group: "Author's craft", minutes: 7, grades: { min: 6, max: 12 },
    goal: "I can identify figurative language and explain the effect it creates.",
    why: "Older stories are packed with comparisons and images. Decoding them turns hard passages into clues.",
    benchmarks: ["ELA.R.1.1", "ELA.K12.EE.3.1"],
    courseLink: "AP: Figurative Language skill category. Cambridge: AO2, language choices and effects.",
    cards: [
      { heading: "The main tools", body: "Each one compares or exaggerates to make meaning.", points: ["Simile: a comparison using like or as.", "Metaphor: a comparison that says one thing is another.", "Personification: human traits given to something not human.", "Hyperbole: exaggeration for effect.", "Imagery: details that appeal to the five senses."] },
      { heading: "Naming is step one; effect is the point", body: "“This is a simile” earns little credit. “This simile makes the room feel like a trap” is analysis." },
      { heading: "Ask what the comparison carries over", body: "If a voice is “like gravel,” what qualities of gravel move into the voice? Rough, harsh, worn down." },
    ],
    model: {
      passage: "Her silence was a locked door, and I had lost the key years ago.",
      steps: ["Tool: metaphor (silence is a locked door).", "What carries over: a locked door keeps people out and cannot be opened without a key.", "Effect: the narrator feels shut out, and “lost the key years ago” suggests the distance is old and maybe the narrator's fault."],
    },
    checks: [
      { question: "“The wind whispered secrets to the trees.” This is:", options: [
        { text: "Simile", why: "There is no like or as." },
        { text: "Personification", correct: true, why: "Wind cannot whisper secrets; it is given a human action." },
        { text: "Hyperbole", why: "Nothing is exaggerated." },
      ] },
      { question: "Which response is analysis of figurative language?", options: [
        { text: "This is a metaphor.", why: "Naming the tool is only the first step." },
        { text: "The metaphor of the locked door shows how shut out the narrator feels.", correct: true, why: "It names the tool and explains its effect." },
        { text: "The author uses words.", why: "This says nothing specific." },
      ] },
    ],
    goingFurther: "Grades 9 to 12: follow an extended metaphor or image pattern across a whole text and explain how it shifts.",
    useInStory: "Tap glossary words in older texts first; many figurative phrases are hiding behind one unfamiliar word.",
    aiTip: "Ask a character what a phrase means to them, then check: does their meaning fit the rest of the paragraph?",
  },
  {
    id: "irony", title: "Irony", group: "Author's craft", minutes: 6, grades: { min: 7, max: 12 },
    goal: "I can identify verbal, situational, and dramatic irony and explain why the author uses it.",
    why: "Several stories in Text Lab turn on irony. If you miss it, you miss the point.",
    benchmarks: ["ELA.R.1.3", "ELA.R.1.1"],
    courseLink: "AP: Narration and Literary Argumentation. Cambridge: AO2, effects of narrative technique.",
    cards: [
      { heading: "Three kinds of irony", body: "Irony is a gap between what is expected and what is real.", points: ["Verbal: saying the opposite of what you mean. “Great weather,” in a hurricane.", "Situational: the opposite of what you expect happens.", "Dramatic: the reader knows something a character does not."] },
      { heading: "Irony is not just bad luck", body: "Rain on your birthday is unlucky. A fire station burning down is ironic, because the place built to stop fires becomes one." },
      { heading: "Why authors use it", body: "Irony creates suspense, humor, or a sharp message. Ask what the gap reveals about the characters or the world." },
    ],
    model: {
      passage: "Coach Ray spent all season warning the team about overconfidence. At the final game, he left early to beat the traffic, certain the lead was safe.",
      steps: ["Expectation: the coach who warns against overconfidence will stay humble.", "Reality: he becomes overconfident himself.", "Type and effect: situational irony that makes a point about how easy it is to ignore our own advice."],
    },
    checks: [
      { question: "In a movie, viewers see the villain hiding in the closet, but the hero does not. This is:", options: [
        { text: "Dramatic irony", correct: true, why: "The audience knows something the character does not." },
        { text: "Verbal irony", why: "No one is saying the opposite of what they mean." },
        { text: "Situational irony", why: "Nothing unexpected has happened yet." },
      ] },
      { question: "“Oh, wonderful,” Kim said, staring at her flat tire. This is:", options: [
        { text: "Verbal irony", correct: true, why: "She says the opposite of what she means." },
        { text: "Dramatic irony", why: "The reader does not know more than Kim here." },
        { text: "Personification", why: "Nothing is given human traits." },
      ] },
    ],
    goingFurther: "Grades 9 to 12: connect irony to an unreliable narrator. When a narrator does not see what the reader sees, the irony becomes the author's argument.",
    useInStory: "When a character says something you know is false from the text, label it in your Case File. That is dramatic irony you can write about.",
    aiTip: "An AI character speaking in role may not recognize its own irony. That is your job as the reader.",
  },
  {
    id: "symbolism", title: "Symbolism", group: "Author's craft", minutes: 6, grades: { min: 7, max: 12 },
    goal: "I can explain how an object, place, or action stands for a bigger idea.",
    why: "Many clues in your Case File are objects. Some of them mean more than they seem.",
    benchmarks: ["ELA.R.1.1", "ELA.R.1.2"],
    courseLink: "AP: Figurative Language (symbol). Cambridge: AO2, how details shape meaning.",
    cards: [
      { heading: "A symbol is real and more than real", body: "A symbol works in the story as a real thing and also points to an idea. A caged bird is a bird, and it may also stand for someone who is trapped." },
      { heading: "How to spot one", body: "Look for objects that:", points: ["Appear more than once.", "Show up at important moments.", "Get extra description or attention.", "Change when a character changes."] },
      { heading: "Avoid symbol hunting", body: "Not every object is a symbol. You need evidence from the text that the author gives it extra weight." },
    ],
    model: {
      passage: "The porch light stayed on every night the year her brother was away. On the night he came home, she finally switched it off.",
      steps: ["Repeated: the light is on every night for a year.", "Change: it is switched off when the brother returns.", "Meaning: the light stands for hope and waiting; turning it off shows the waiting is over."],
    },
    checks: [
      { question: "Which detail most likely works as a symbol?", options: [
        { text: "A clock mentioned once in a list of furniture.", why: "One passing mention gives no evidence of extra weight." },
        { text: "A broken clock the main character stares at in three key scenes.", correct: true, why: "Repetition at key moments suggests a larger meaning." },
        { text: "The color of the bus.", why: "Nothing suggests the author gives it importance." },
      ] },
      { question: "What makes a symbol interpretation strong?", options: [
        { text: "Evidence that the author gives the object attention.", correct: true, why: "Symbol claims need the same evidence as any claim." },
        { text: "A creative idea, even if the text does not support it.", why: "Creativity without evidence is a guess." },
        { text: "Knowing that colors always mean the same thing.", why: "Symbols depend on context, not fixed codes." },
      ] },
    ],
    goingFurther: "Grades 9 to 12: track how a symbol's meaning changes from the beginning to the end of a text.",
    useInStory: "When a clue appears in more than one scene, open it again and ask whether its meaning has changed.",
    aiTip: "An AI character may tell you an object is “just” an object. The author decides what matters, not the character.",
  },
  {
    id: "citing-evidence", title: "Citing and Explaining Evidence", group: "Writing", minutes: 6, grades: { min: 6, max: 12 },
    goal: "I can choose strong evidence, blend quotes into my sentences, and explain them.",
    why: "Your final writing is judged on how well you use the text. This is the skill that earns the most points.",
    benchmarks: ["ELA.K12.EE.1.1"],
    courseLink: "AP: Claims and Evidence, Literary Argumentation. Cambridge: AO4, a supported response.",
    cards: [
      { heading: "Choose the strongest evidence", body: "The best quote is short, specific, and directly connected to your claim. Avoid quotes that only retell events." },
      { heading: "Blend the quote", body: "Never drop a quote alone in a sentence. Introduce it.", points: ["Dropped: The narrator is nervous. “I paced the floor.”", "Blended: The narrator's claim of calm falls apart when he admits, “I paced the floor.”"] },
      { heading: "Explain more than you quote", body: "A good rule: write at least two sentences of explanation for every quote. Explanation is where your thinking shows." },
    ],
    model: {
      passage: "“I'm fine,” Ava said, pulling her sleeves over her hands.",
      steps: ["Choose: the action, “pulling her sleeves over her hands,” is stronger than the words “I'm fine.”", "Blend: Although Ava insists she is fine, she pulls “her sleeves over her hands.”", "Explain: hiding her hands is a protective gesture, so her body tells a different story than her words."],
    },
    checks: [
      { question: "Which sentence blends the quote correctly?", options: [
        { text: "Ava is upset. “Pulling her sleeves over her hands.”", why: "The quote is dropped in alone." },
        { text: "Ava says she is fine but pulls “her sleeves over her hands,” a sign she is hiding something.", correct: true, why: "The quote sits inside the writer's sentence and is explained." },
        { text: "“I'm fine,” “pulling her sleeves.”", why: "Two fragments with no sentence around them." },
      ] },
      { question: "About how much explanation should follow each quote?", options: [
        { text: "None; the quote speaks for itself.", why: "Quotes never speak for themselves in analysis." },
        { text: "At least two sentences.", correct: true, why: "Explanation is where you earn credit." },
        { text: "Another quote.", why: "Stacking quotes without explaining weakens the writing." },
      ] },
    ],
    goingFurther: "Grades 9 to 12: embed short phrases (two to five words) instead of full sentences, and analyze single word choices.",
    useInStory: "Save quotes with the passage panel as you read. They appear in your Case File and can be dragged into your writing.",
    aiTip: "Never quote an AI character as evidence. The app blocks it for a reason: only the author's words count.",
  },
  {
    id: "narrative-techniques", title: "Narrative Techniques for Your Own Writing", group: "Writing", minutes: 7, grades: { min: 6, max: 12 },
    goal: "I can use dialogue, description, and pacing to write a narrative grounded in a text.",
    why: "Every story ends with you writing an account from your role. These are the tools for that piece.",
    benchmarks: ["ELA.C.1.2"],
    courseLink: "Cambridge 9093: imaginative and descriptive writing. AP: understanding craft from the writer's side.",
    cards: [
      { heading: "Dialogue", body: "Use dialogue to reveal character or raise tension, not to pass along information. Keep it short and give each speaker a new paragraph." },
      { heading: "Description", body: "Choose one or two precise sensory details instead of five general ones. “The floorboard groaned” beats “the old, creepy, dark room.”" },
      { heading: "Pacing", body: "Slow down for important moments with detail and short sentences. Speed up through less important time with summary." , points: ["Slow: The handle turned. Stopped. Turned again.", "Fast: Three weeks passed before anyone spoke of it."] },
    ],
    model: {
      passage: "I asked the officer what he had seen. “Nothing,” he said, but his eyes went to the floorboards and stayed there.",
      steps: ["Dialogue: one word, “Nothing,” creates tension because it is so short.", "Description: his eyes going to the floorboards contradicts his words.", "Pacing: “and stayed there” slows the moment so the reader notices."],
    },
    checks: [
      { question: "Which line uses pacing to slow down a key moment?", options: [
        { text: "The year went by quickly.", why: "This speeds time up." },
        { text: "The envelope. My name. His handwriting.", correct: true, why: "Short fragments slow the reader at an important moment." },
        { text: "We drove home and had dinner and went to bed.", why: "Summary speeds through events." },
      ] },
      { question: "Strong dialogue usually:", options: [
        { text: "Reveals character or raises tension.", correct: true, why: "Dialogue earns its place by doing work." },
        { text: "Explains every detail of the plot.", why: "That makes dialogue stiff and unnatural." },
        { text: "Uses many speakers in one paragraph.", why: "Each speaker should get a new paragraph." },
      ] },
    ],
    goingFurther: "Grades 9 to 12: write from a perspective that conflicts with another character's, and let the reader see both sides through your choices.",
    useInStory: "Pick your CRAFT technique on each clue with your final writing in mind. Using three different techniques unlocks the narrative.",
    aiTip: "You can ask a character how a moment felt, but write the scene in your own words. Your teacher sees how much of your writing you typed yourself.",
  },
];

export const lessonGroups = ["Reading closely", "Story elements", "Author's craft", "Writing"] as const;
export function lessonsForGrade(grade: number | null) {
  return grade == null ? miniLessons : miniLessons.filter((l) => grade >= l.grades.min && grade <= l.grades.max);
}
export function lessonById(id: string) {
  return miniLessons.find((l) => l.id === id);
}
