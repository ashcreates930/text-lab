// Sleepy Hollow expeditions 2 onward (expedition 1 is in scripts/build-expeditions.ts). Same format: proof lines are
// [paragraph, sentence index] and are copied exactly from source.md by the build.
import type { E } from "../build-expeditions.ts";
import { talesByTheFire } from "./sh-03.ts";
import { vanTasselFarm } from "./sh-04.ts";
import { aRivalAppears } from "./sh-05.ts";
import { theFeud } from "./sh-06.ts";
import { theInvitation } from "./sh-07.ts";
import { theRideToTheParty } from "./sh-08.ts";
import { theFeastAndTheDance } from "./sh-09.ts";
import { ghostStories } from "./sh-10.ts";
import { theLonelyRoad } from "./sh-11.ts";
import { theHeadlessHorseman } from "./sh-12.ts";
import { gone } from "./sh-13.ts";
import { thePostscript } from "./sh-14.ts";

const schoolmaster: E = {
  id: "the-schoolmaster", title: "The Schoolmaster", chunks: [
    { seg: [["p010", 0, 2]],
      gist: [["A Connecticut schoolmaster named Ichabod Crane came to teach the Hollow's children.", true], ["A Connecticut farmer named Ichabod Crane came to clear the Hollow's forests."], ["A traveling preacher named Ichabod Crane came to build the Hollow a new church."]],
      discovery: ["worthy wight", "vocabulary", "Wight: an old word for a person. A worthy wight is a fine fellow, said with a wink."],
      q: { type: "find_it", prompt: "Where was the new teacher born?", keywords: ["born"], lines: [["p010", 1]],
        hint: "Look for the place he comes from.", why: "He was a native of Connecticut.", standards: ["K12.EE.1.1"] } },
    { seg: [["p010", 3, 5]],
      gist: [["The narrator describes Ichabod as tall, skinny and loosely put together, like a scarecrow.", true], ["The narrator describes Ichabod as short, stout and strong, like the village blacksmith."], ["The narrator describes Ichabod as handsome, neat and well dressed, like a city gentleman."]],
      discovery: ["genius of famine", "figurative", "The genius of famine: Ichabod looks so bony he could be the spirit of hunger itself."],
      q: { type: "figure_it_out", focus: "looked like a weather-cock", prompt: "Read the words looked like a weather-cock. What kind of figurative language is this?", keywords: ["weather-cock"],
        choices: [["Simile: it compares his head to a weather vane using like", true], ["Metaphor: it says his head is a weather vane, without like"], ["Personification: it gives a weather vane human feelings"]],
        choices2: { prompt: "What does it mean?", options: [["His small head sits high on a thin neck, turning this way and that", true], ["He always knows exactly what tomorrow's weather will be"], ["He spins around quickly whenever the wind starts to blow hard"]] },
        hint: "A weather vane sits on top of a pole and swings around. Picture his head and neck.", why: "Like a weather-cock on a spindle: a small head perched high on a thin neck.", standards: ["R.3.1"], reviewed: true } },
    { seg: [["p011", 0, 1]],
      gist: [["The schoolhouse is a rough log room that is easy to get into but hard to leave.", true], ["The schoolhouse is a stone hall with strong iron locks on every single door."], ["The schoolhouse has burned down, so the classes now meet in the church."]],
      discovery: ["mystery of an eelpot", "vocabulary", "An eelpot is a trap eels swim into easily but can't get out of, just like the schoolhouse for a thief."],
      q: { type: "between_lines", prompt: "What can you infer about where Ichabod holds class?", keywords: ["infer"],
        choices: [["It is plain and patched together from whatever was at hand", true], ["It is the grandest and best built hall in the valley"], ["It is brand new, put up by skilled workers from town"]],
        lines: [["p011", 0]], hint: "Look at what fills the window holes.", why: "It is rudely built of logs, with windows patched with old copybook pages.", standards: ["K12.EE.3.1", "K12.EE.1.1"] } },
    { seg: [["p011", 2, 5]],
      gist: [["Ichabod's lonely schoolhouse hums with lessons, and he is quick to use the switch.", true], ["Ichabod's busy schoolhouse is silent because he never lets anyone speak."], ["Ichabod's pupils run the school by themselves while he naps under the birch tree."]],
      discovery: ["like the hum of a beehive", "figurative", "A simile: the pupils' murmuring voices sound like busy bees."],
      q: { type: "character_clue", prompt: "Which trait fits Ichabod in the classroom?", keywords: ["trait"],
        choices: [["Strict, quick to punish with the birch switch", true], ["Gentle, never raising his voice at any pupil"], ["Lazy, letting the children do as they like"]],
        words: ["the appalling sound of the birch", "Spare the rod and spoil the child"], hint: "Listen for the sounds that break into the lessons.", why: "The appalling sound of the birch and his motto, spare the rod, show he punishes often.", standards: ["R.1.1", "K12.EE.1.1"] } },
    { seg: [["p012", 0, 2]],
      gist: [["The narrator says Ichabod punished fairly, sparing weak boys and doubling it for tough ones.", true], ["The narrator says Ichabod never punished anyone, even the rudest boys in class."], ["The narrator says the parents scolded Ichabod for punishing their sons far too harshly."]],
      discovery: ["cruel potentates", "vocabulary", "Potentate: a powerful ruler. The narrator jokes that a schoolmaster rules his class like a king."],
      q: { type: "whose_eyes", prompt: "How does the narrator want readers to see Ichabod's punishments?", keywords: ["narrator"],
        choices: [["As fair in Ichabod's own eyes, while the narrator teases him", true], ["As cruel acts that the narrator plainly condemns and regrets"], ["As rare events that almost never really happened"]],
        lines: [["p012", 0]], hint: "Notice how the narrator defends him, and how grand the words get.", why: "The narrator insists he was no cruel potentate and did justice with discrimination, a playful defense.", standards: ["R.1.3", "K12.EE.1.1"] } },
    { seg: [["p013", 0, 1]],
      gist: [["After school, Ichabod befriends pupils, especially those with good cooks or pretty sisters.", true], ["After school, Ichabod locks himself in the schoolhouse to study his books."], ["After school, Ichabod works in the fields until dark to earn a second small salary."]],
      discovery: ["comforts of the cupboard", "figurative", "The comforts of the cupboard: a funny way to say good food at home."],
      q: { type: "between_lines", prompt: "Why might Ichabod pick certain children to escort after class?", keywords: ["escort"],
        choices: [["He hopes for a good meal or a chance to meet pretty sisters", true], ["He wants to keep the youngest pupils safe from ghosts"], ["He is paid a few extra pennies for every child he brings home"]],
        lines: [["p013", 0]], hint: "Look at which families he chooses.", why: "He walks home the ones with pretty sisters or mothers noted for the comforts of the cupboard.", standards: ["K12.EE.3.1", "K12.EE.1.1"] } },
    { seg: [["p013", 2, 3]],
      gist: [["Ichabod is poorly paid and eats a lot, so he lives a week at a time with each farm family.", true], ["Ichabod is wealthy and eats little, so he buys a fine house beside the church."], ["Ichabod is poorly paid, so he quietly takes food from the farmers' cellars at night."]],
      discovery: ["worldly effects", "vocabulary", "Worldly effects: everything a person owns. Ichabod's fit in one handkerchief."],
      q: { type: "between_lines", prompt: "Why might Ichabod stay with a different family each week?", keywords: ["different family"],
        choices: [["His pay is too small to feed such a big eater", true], ["He wants to learn farming from every neighbor"], ["A town law makes teachers move every week"]],
        lines: [["p013", 2]], hint: "Look at his pay and at his appetite.", why: "His pay was scarcely enough for such a huge feeder, so he was boarded at the farmers' houses.", standards: ["K12.EE.3.1", "K12.EE.1.1"] } },
    { seg: [["p014", 0, 1]],
      gist: [["Ichabod makes himself useful to farm families by helping with the lighter chores.", true], ["Ichabod refuses to help on the farms because he thinks chores are beneath him."], ["Ichabod hires local boys to do the farm chores in exchange for free lessons."]],
      discovery: ["mere drones", "vocabulary", "Drones are male bees that do no work. Some farmers think teachers are just as idle."],
      q: { type: "find_it", prompt: "Which line lists the work Ichabod did to earn his keep?", keywords: ["earn his keep"], lines: [["p014", 1]],
        hint: "Look for a list of jobs.", why: "He helped make hay, mended the fences, watered the horses, drove the cows and cut wood.", standards: ["K12.EE.1.1"] } },
    { seg: [["p014", 2, 3]],
      gist: [["Away from school, Ichabod turns gentle and wins over mothers by caring for their children.", true], ["Away from school, Ichabod stays strict and frightens the youngest children of the house."], ["Away from school, Ichabod avoids the children and spends his time talking with the farmers."]],
      discovery: ["the lion bold", "figurative", "Like the lion bold: Ichabod, lord of the schoolroom, turns as gentle as a lion holding a lamb."],
      q: { type: "catch_lie", prompt: "Hans Van Ripper remembers the schoolmaster. One thing he says is false. Tap the line that proves it.", keywords: ["false"],
        testimony: { speaker: "hans-van-ripper", text: "That schoolmaster was a stern one even in our homes. He had no patience for little ones and would never so much as hold a baby." },
        lines: [["p014", 3]], hint: "Hans sounds sure. Check how Ichabod treated the youngest children.", why: "He petted the youngest and would sit with a child on one knee, rocking a cradle for hours.", standards: ["K12.EE.1.1"] } },
    { seg: [["p015", 0, 1]],
      gist: [["Ichabod also teaches singing and proudly leads the church choir on Sundays.", true], ["Ichabod also preaches sermons and takes the parson's place on Sundays."], ["Ichabod also plays the fiddle at every barn dance held in the valley."]],
      discovery: ["carried away the palm", "figurative", "Carried away the palm: won the prize. Ichabod believes he outshines the parson."],
      q: { type: "theme_thread", prompt: "Which idea about Ichabod keeps showing up?", keywords: ["keeps showing up"],
        choices: [["He thinks highly of himself and enjoys being admired", true], ["He is shy and hides from attention whenever he can"], ["He cares only about money and never about any praise"]],
        lines: [["p015", 1]], hint: "Look at how he feels standing before the singers.", why: "It was a matter of no little vanity to him, and in his own mind he outshone the parson.", standards: ["R.1.2", "K12.EE.1.1"] } },
  ],
  interview: [
    { character: "brom-bones", cards: ["What do you make of the new schoolmaster?", "Tell me about the schoolhouse."],
      truth: { text: "That little log school? Any robber could slip inside without trouble, but he'd have a terrible time escaping again.", lines: [["p011", 1]] },
      lie: { text: "That beanpole? Folks say he's built as solid and stocky as a blacksmith, with tiny fists to match.", lines: [["p010", 3]], gesture: "laughing" },
      caught: "Ha! Fine, he's a beanpole through and through. I was just having fun." },
    { character: "hans-van-ripper", cards: ["How does the schoolmaster earn his keep?", "What is he like when he stays with a family?"],
      truth: { text: "He moves from one family to the next every seven days, and everything he owns fits in one bundle.", lines: [["p013", 3]] },
      lie: { text: "He never lifts a finger for us, not one chore. He just sits by the hearth and eats.", lines: [["p014", 1]], gesture: "head-shake" },
      caught: "Hmph. All right, he helped now and then. I'll grant him that." },
    { character: "katrina-van-tassel", cards: ["What is he like at church?", "Does he teach anything besides lessons?"],
      truth: { text: "On the Lord's day he plants himself before the choir loft with his best voices, sure he outshines the minister.", lines: [["p015", 1]] },
      lie: { text: "He has no ear for music at all and never gives lessons in it, not for any amount of coin.", lines: [["p015", 0]] },
      caught: "Oh, you checked! He does teach music. I wanted to see who was paying attention." },
  ],
};

export const SLEEPY_HOLLOW_MORE: E[] = [schoolmaster, talesByTheFire, vanTasselFarm, aRivalAppears, theFeud, theInvitation, theRideToTheParty, theFeastAndTheDance, ghostStories, theLonelyRoad, theHeadlessHorseman, gone, thePostscript];
