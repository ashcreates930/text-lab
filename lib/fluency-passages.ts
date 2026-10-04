// Original passages written for Text Lab fluency checks (AmplifiED). Each runs about 250 words so that
// strong readers do not finish before one minute. Levels are Flesch-Kincaid estimates computed in tests;
// they guide passage choice and are not equivalent-form probes from a published assessment.
export type FluencyPassage = { id: string; title: string; band: string; targetGrade: number; text: string };

export const fluencyPassages: FluencyPassage[] = [
  { id: "turtle-night", title: "The Turtle Walk", band: "Grades 2 to 3", targetGrade: 2, text: `Mia and her dad went to the beach after dark. They did not bring a flashlight. Bright lights can scare sea turtles, so they used the light of the moon. A ranger met their group by the dunes. She told them to be quiet and stay close.

They walked on the cool sand for a long time. Mia heard the waves roll in and out. Then the ranger held up her hand. Everyone stopped. Up ahead, a huge shape was moving slowly out of the water. It was a loggerhead turtle. Her shell was as wide as a kitchen table.

The turtle pulled herself up the beach with her front flippers. She stopped near the dunes and began to dig. Sand flew behind her. Mia wanted to get closer, but she knew she had to wait. The ranger said the mother turtle would lay about one hundred eggs. Then she would cover the nest and go back to the sea.

After a while, the turtle turned around. She crawled back to the water and was gone. The next morning, Mia and her dad came back. A worker was putting a small fence around the nest. In about two months, the baby turtles would hatch. They would run to the ocean by the light of the moon, just like their mother.

Mia made a sign for her window. It said, "Lights out for turtles!" She wanted every neighbor to help.` },
  { id: "storm-ready", title: "Getting Storm Ready", band: "Grades 3 to 4", targetGrade: 3, text: `Every June, Jayden's family made a plan for hurricane season. His grandmother called it "getting storm ready," and she treated it like a holiday. She made a list, and everyone had a job.

Jayden's job was the supply box. He checked the flashlights and put in fresh batteries. He counted the water jugs and made sure there was enough for three days. He packed crackers, peanut butter, and canned fruit. His little sister, Nia, added a deck of cards and her favorite book. "We need something to do if the power goes out," she said.

Their mom checked the shutters and the car. She filled the gas tank and put important papers in a plastic bag. Grandma wrote phone numbers on a card, because phones do not always work after a storm.

In September, a real storm came. The news showed a swirling cloud moving across the ocean. The family did not panic. They closed the shutters, brought in the patio chairs, and stayed inside. The wind howled all night, and the lights flickered and went out.

Jayden turned on a flashlight, and Nia found the cards. They played games until they fell asleep. In the morning, branches covered the yard, but the house was safe. Grandma smiled and said, "That is why we get storm ready." Jayden was proud. His supply box had done its job.` },
  { id: "lagoon-manatee", title: "A Visitor in the Lagoon", band: "Grades 5 to 6", targetGrade: 5, text: `On a chilly January morning, Andre's science class took a field trip to a warm-water refuge near the lagoon. Their teacher, Ms. Carter, explained that manatees cannot survive in cold water for long. When the temperature drops, they gather in places where the water stays warm, such as springs and the outflow near power plants.

From the viewing platform, the students spotted gray shapes floating just below the surface. At first, Andre thought they were rocks. Then one of the shapes lifted its whiskered nose above the water and took a breath. A few students gasped, and someone whispered, "It looks like a potato with a tail."

Ms. Carter laughed and pointed out the scars on the manatee's back. Many manatees carry marks from boat propellers, she said, because they swim slowly and stay close to the surface. Scientists use these scars to identify individual animals, the way people might recognize a friend by a freckle.

Andre wrote in his notebook as fast as he could. He learned that manatees eat seagrass and that the lagoon had lost much of its seagrass in recent years. Without enough food, the animals struggle to stay healthy.

On the bus ride home, Andre kept thinking about the scars. He decided to make a poster for the marina in his neighborhood. It would remind boaters to slow down in shallow water. It was a small step, but he believed that small steps could add up to something important.` },
  { id: "robotics-club", title: "The Robot That Would Not Turn", band: "Grades 6 to 7", targetGrade: 7, text: `With three days left before the regional competition, the robotics club had a serious problem. Their robot could drive forward and backward perfectly, but whenever it tried to turn left, it spun in a slow, embarrassing circle. The team had tested the motors, replaced a wheel, and rewritten the code twice. Nothing worked.

Priya, the team captain, called an emergency meeting in the library. Instead of arguing about whose fault it was, she suggested that everyone write down exactly what they had observed. The notes revealed something surprising. The robot only spun when the battery was nearly full. When the battery was half drained, the turns were almost normal.

Marcus, who usually stayed quiet during meetings, raised his hand. He explained that a fully charged battery delivered more power, which made the left motor overshoot its target. Their code assumed the power would always be the same. The robot was not broken; it was following instructions that did not match reality.

The team rewrote the turning program so that it measured how far the robot had rotated instead of simply running the motor for a set amount of time. On the first test, the robot turned neatly and stopped exactly where it should. The library erupted in cheers, and the librarian, smiling, reminded them to keep it down.

At the competition, the robot did not win first place, but it completed every turn. Priya decided that their real victory had happened in the library, when the team stopped blaming and started observing.` },
  { id: "citrus-grove", title: "Grandpa's Grove", band: "Grades 7 to 8", targetGrade: 8, text: `For nearly forty years, my grandfather managed a citrus grove west of the river, and for most of my childhood I assumed the trees would outlast all of us. Every winter, the branches bent under the weight of oranges so bright they looked artificial. Then, gradually, the grove began to change.

The first sign was subtle: leaves with uneven yellow blotches, as though someone had splashed them with weak paint. Within a few seasons, the fruit grew small, lopsided, and bitter. My grandfather consulted researchers from the university, who confirmed what he had feared. The trees were infected with citrus greening, a bacterial disease spread by an insect smaller than a grain of rice. There was no cure.

I expected him to be devastated, and in some ways he was. Yet he spent the following year experimenting with remarkable patience. He tested nutritional sprays, planted rows of disease-resistant seedlings, and kept detailed records in a battered spiral notebook. Some experiments failed completely. A few showed modest promise, which he celebrated as though they were major victories.

When I asked him why he kept trying, he considered the question for a long moment. Farming, he explained, had never been about controlling nature; it was about responding to it intelligently. The grove he had known might be disappearing, but the knowledge he gathered could help the next generation of growers.

Today, a section of resistant trees grows near the old packing shed. They are not as tall as the originals, but they are producing fruit.` },
  { id: "first-speech", title: "The Speech", band: "Grades 9 to 10", targetGrade: 10, text: `When the principal announced that each eighth grader would deliver a three-minute persuasive speech to the entire grade, Lena experienced something close to physical panic. She was comfortable expressing opinions in writing, where she could revise every sentence until it sounded precisely right. Speaking in front of two hundred classmates, however, offered no opportunity for revision.

Her English teacher, Mr. Okafor, recognized her anxiety immediately. Rather than offering vague encouragement, he gave her a practical assignment: identify one argument she genuinely cared about and explain it to him in ordinary conversation, without notes. Lena chose the school's decision to eliminate its community garden. As she talked, her voice became steadier, and her examples grew more specific. Mr. Okafor pointed out that her conversational explanation was already more persuasive than her carefully polished draft.

Over the following weeks, Lena rehearsed in unconventional locations. She practiced in the shower, on walks with her dog, and in front of her skeptical younger brother, who interrupted constantly with challenging questions. Each interruption forced her to anticipate counterarguments and respond with evidence instead of emotion.

On the day of the presentation, her hands trembled as she approached the microphone. She took a deliberate breath, located a friendly face in the third row, and began. Halfway through, she realized that the audience was listening intently. Several students even nodded when she described how the garden had supplied vegetables for the cafeteria.

Afterward, Lena understood that confidence had not preceded the speech. It had developed gradually, through preparation, repetition, and a willingness to be imperfect in public.` },
];
