import { z } from "zod";
const choice = z.object({ id:z.string(), label:z.string(), consequence_narration:z.string(), next_scene_id:z.string(), unlocks:z.array(z.string()) });
const artifactQuestion = z.object({id:z.enum(["notice","interpret","craft"]),label:z.enum(["NOTICE","INTERPRET","CRAFT"]),dok_level:z.number(),skill:z.string(),benchmark:z.object({code:z.string(),description:z.string()}),prompt_by_role:z.record(z.string(),z.string()),prompt_by_role_plain:z.record(z.string(),z.string()).optional(),requires_text_evidence:z.boolean(),requires_claim_link:z.boolean(),technique_options:z.array(z.string())}).superRefine((question,ctx)=>{if(question.id!=='craft'&&!question.prompt_by_role_plain)ctx.addIssue({code:'custom',message:'NOTICE and INTERPRET require plain-language role prompts',path:['prompt_by_role_plain']})});
const position = z.object({x:z.number(),y:z.number(),width:z.number().min(4.4),height:z.number().min(6.8)}).superRefine((box,ctx)=>{if(box.x<0||box.y<0||box.x+box.width>100||box.y+box.height>100)ctx.addIssue({code:'custom',message:'Artifact hotspot must fit inside its scene',path:['x']})});
// Off claim (lib/clue-game.ts): once per clue, the character says something slightly wrong; line is the exact story line
// that corrects it. The AI only delivers the claim in the character's voice.
// also: other lines that correct it just as well (each accepted).
const offClaim=z.object({character_id:z.string(),claim:z.string().min(1),paragraph:z.string().regex(/^p\d{3}$/),line:z.string().min(1),also:z.array(z.object({paragraph:z.string().regex(/^p\d{3}$/),line:z.string().min(1)})).optional()});
// Your Turn activities: talk (a character's claims, each answered with a line), debate (one side per Final Verdict
// theory), pick and order (authored pieces, each backed by a line; pieces with no lines are decoys), lines (any lines),
// factcheck (posts, one false), exhibits (the student's own proven lines). Every one ends with the write prompt.
const ytLine=z.object({paragraph:z.string().regex(/^p\d{3}$/),line:z.string().min(1)});
const ytExchange=z.object({say:z.string().min(1),accept:z.array(ytLine)});
const ytContent={character_id:z.string().nullable().optional(),exchanges:z.array(ytExchange).optional(),sides:z.record(z.string(),z.object({character_id:z.string(),exchanges:z.array(ytExchange)})).optional(),
 need:z.number().int().min(1).max(5).optional(),groups:z.record(z.string(),z.string()).optional(),items:z.array(z.object({id:z.string(),label:z.string().min(1),icon:z.string().optional(),group:z.string().optional(),accept:z.array(ytLine)})).optional(),
 posts:z.array(z.object({author:z.string(),text:z.string().min(1),false:z.boolean(),accept:z.array(ytLine).optional()})).optional()};
// demo: the version for the public demo's ending after the start scene, authored from that scene's lines only (it
// replaces the fields it names; lib/your-turn.ts sceneYourTurn).
const yourTurnActivity=z.object({title:z.string().min(1),minutes:z.number().int(),kind:z.enum(["talk","debate","pick","order","lines","factcheck","exhibits"]),intro:z.string().min(1),paragraphs:z.array(z.string().regex(/^p\d{3}$/)).min(1),write:z.string().min(1),
 ...ytContent,demo:z.object({title:z.string().min(1).optional(),intro:z.string().min(1).optional(),write:z.string().min(1).optional(),paragraphs:z.array(z.string().regex(/^p\d{3}$/)).min(1),...ytContent}).optional()});
// Fair play (lib/fair-play.ts): a clue's bank of 3 or 4 authored questions. Each answer is an exact evidence line of the
// clue, with the exact words that prove it when the line is over 25 words; near misses look right but aren't, each with
// a hint naming a paragraph; Prove it has one right choice and three wrong ones. shared_ok: key words the question may
// share with its answers (reviewed by hand).
const nearMiss=z.object({line:z.string(),hint:z.string().min(1)});
const proveIt=z.object({right:z.string().min(1),wrong:z.array(z.string().min(1)).length(3)});
const bankAnswer=z.object({line:z.string(),phrase:z.string().optional()});
const bankQuestion=z.object({id:z.string(),ladder:z.enum(["locate","infer"]),question:z.string().min(1),answers:z.array(bankAnswer).min(1),near_misses:z.array(nearMiss).default([]),prove:proveIt.nullable(),shared_ok:z.array(z.string()).optional()});
const artifact = z.object({off_claim:offClaim.optional(),bank:z.array(bankQuestion).optional(),id:z.string(),name:z.string(),scene_id:z.string(),evidence_type:z.enum(["observed","claimed","reported"]),secondary_evidence_type:z.enum(["observed","claimed","reported"]).optional(),position,image:z.string().optional(),closeup_image:z.string().optional(),source_anchor:z.array(z.string()),unlock_condition:z.string().nullable(),questions:z.array(artifactQuestion).length(3)});
// Spot the Lie: once per scene, a character testifies with one false claim that one line of the story disproves.
const lie=z.object({clue_id:z.string(),character_id:z.string(),testimony:z.string(),false_claim:z.string(),truth_paragraph:z.string().regex(/^p\d{3}$/),truth_line:z.string(),explanation:z.string(),topic:z.string()});
// The Final Verdict: the question the student answers after the last scene, with three theories the text can support.
const verdict=z.object({question:z.string(),theories:z.array(z.object({id:z.string(),name:z.string(),description:z.string()})).length(3)});
// Story Mode (lib/story-mode.ts): a scene played as four rounds, each with a bank of authored questions (a student gets
// one): round 1 locate (read.bank: a focus question and the evidence lines that answer it), round 2 infer (infer.bank:
// a character asks; one line, its exact words when long, and Prove it; the character's reaction and trust follow right or
// wrong), round 3 catch the lie (the scene's lie plus lies), round 4 build the case (call.bank: a question, three theories
// and the lines that support each). Everything is authored here, never generated.
const storyRead=z.object({id:z.string(),focus:z.string().min(1),answers:z.array(z.string()).min(3),near_misses:z.array(nearMiss).default([])});
const storyInfer=z.object({id:z.string(),question:z.string().min(1),answers:z.array(bankAnswer).min(1),near_misses:z.array(nearMiss).default([]),prove:proveIt,shared_ok:z.array(z.string()).optional()});
const storyCall=z.object({id:z.string(),question:z.string().min(1),theories:z.array(z.object({id:z.string(),name:z.string(),description:z.string(),supports:z.array(z.string()).min(2)})).length(3)});
const storyMode=z.object({intro:z.string(),
 read:z.object({chunks:z.array(z.string().regex(/^p\d{3}$/)).min(1),prompt:z.string(),bank:z.array(storyRead).min(1)}),
 infer:z.object({character_id:z.string(),reaction:z.object({right:z.string().min(1),wrong:z.string().min(1)}),bank:z.array(storyInfer).min(1)}),
 lies:z.array(lie.extend({id:z.string()})).default([]),
 call:z.object({bank:z.array(storyCall).min(1)})});
// Story missions (lib/missions.ts): a mission built on a real problem in the text. pieces: exact lines collected when
// proven in play (lead: the piece's own paraphrased question); payoff: the line revealed after the verdict (keywords:
// phrases from it that no character reply may use); sealed_clue: the clue that holds the payoff, opened at the verdict.
const mission=z.object({id:z.string(),title:z.string().min(1),problem:z.string().min(1),sealed_clue:z.string(),payoff:z.object({line:z.string(),keywords:z.array(z.string()).min(1)}),theories:z.array(z.object({id:z.string(),name:z.string(),description:z.string()})).length(3),pieces:z.array(z.object({id:z.string(),scene_id:z.string(),line:z.string(),lead:z.string().min(1),shared_ok:z.array(z.string()).optional()})).min(1)});
// writing_clue: the clue whose Notice, Interpret and Craft questions are the scene's one writing task (default: the first).
const scene = z.object({id:z.string(),writing_clue:z.string().optional(),narration:z.string(),summary:z.string().optional(),art_direction:z.string().optional(),reading:z.array(z.object({start:z.string(),end:z.string()})).optional(),reading_note:z.string().optional(),background_image:z.string(),narration_audio:z.string().nullable().optional(),ambient_audio:z.string().nullable(),available_characters:z.array(z.string()),lie:lie.optional(),story_mode:storyMode.optional(),choice_point:z.object({prompt:z.string(),dok_level:z.number(),options:z.array(choice),role_frame:z.string().optional()}).nullable(),dok_task:z.string(),passage_anchors:z.array(z.string()).default([]),artifacts:z.array(artifact).default([])}).superRefine((value,ctx)=>{for(let i=0;i<value.artifacts.length;i++)for(let j=i+1;j<value.artifacts.length;j++){const a=value.artifacts[i].position,b=value.artifacts[j].position;if(a.x<b.x+b.width&&b.x<a.x+a.width&&a.y<b.y+b.height&&b.y<a.y+a.height)ctx.addIssue({code:'custom',message:`Hotspots ${value.artifacts[i].id} and ${value.artifacts[j].id} overlap`,path:['artifacts',j,'position']})}});
// Storybook reader: pages in reading order, each a contiguous paragraph range of source.md.
// mode: "illustrated" shows the curated picture; "add_detail" shows it with one text-supported detail left out for the
// student to add; "student" is an empty frame the student describes. no_generation keeps a frame writing-only.
// frame_required makes the frame part of the page's gate; other frames are optional and can be skipped.
const storyIllustration=z.object({src:z.string().optional(),alt:z.string(),scene_description:z.string().optional(),missing_detail:z.string().optional(),status:z.enum(["planned","approved","generated"]).default("planned")});
const storyPage=z.object({id:z.string(),section:z.string(),start:z.string().regex(/^p\d{3}$/),end:z.string().regex(/^p\d{3}$/),mode:z.enum(["illustrated","add_detail","student"]),illustration:storyIllustration.optional(),no_generation:z.boolean().optional(),no_generation_reason:z.string().optional(),frame_required:z.boolean().optional(),frame_prompt:z.string().optional(),characters_met:z.array(z.object({id:z.string(),name:z.string(),description:z.string(),offstage:z.boolean().optional()})).default([]),restatements:z.record(z.string(),z.string()).default({}),
 // A bridge page summarizes skipped paragraphs (start..end) in our words, clearly labeled; the original text stays one tap away.
 bridge:z.object({summary:z.string().min(1)}).optional(),
 // A note students see once before this page's text (on a bridge, before its full text): for example, a warning
 // about hurtful content in the original.
 content_note:z.string().optional()});
// version: bump whenever pages, sections, or clues change. Saved progress from any other version (or saved before
// versions existed, read as "1") is reset for that story so old answers can never open new gates.
// ai_exclude: paragraphs AI characters never receive (for example, racist caricature in the original text).
const storybook=z.object({version:z.string().default("1"),ai_exclude:z.array(z.string().regex(/^p\d{3}$/)).default([]),format:z.enum(["prose","script"]).default("prose"),review_status:z.enum(["draft","reviewed"]),spanish_status:z.enum(["draft","reviewed"]),art_style:z.string().optional(),sections:z.array(z.object({id:z.string(),title:z.string()})).min(1),pages:z.array(storyPage).min(1),vocabulary:z.array(z.object({term:z.string(),forms:z.array(z.string()).default([]),part_of_speech:z.string().optional(),definition:z.string(),es_term:z.string().optional(),es_definition:z.string().optional()})).default([])});
const roleSkill=z.object({name:z.string(),description:z.string()});
const role=z.object({id:z.string(),name:z.string(),description:z.string(),goal:z.string(),dok_focus:z.string(),briefing:z.string().min(1),what_you_will_do:z.array(z.string()).length(3),skills:z.array(roleSkill).min(3).max(4),final_task:z.string().min(1)});
export const WorldPackSchema = z.object({
  id:z.string(), title:z.string(), author:z.string(), hook:z.string().min(1), status:z.enum(["playable","preview","coming_soon"]).optional(), teacher_preview_required:z.boolean().optional(), content_notes:z.string().optional(), pack_type:z.literal("literature"), grade_band:z.object({min:z.number(),max:z.number()}), courses:z.array(z.enum(["best_ela","ap_lit","ap_lang","aice_lit","aice_lang","igcse_lit"])).optional(), mini_lessons:z.array(z.string()).optional(), estimated_minutes:z.number(), public_domain_note:z.string(),
  adaptations:z.array(z.object({grade:z.number(),glossary:z.enum(["open","on_request"]),hints:z.boolean(),sentence_starters:z.boolean(),description:z.string()})).min(1),
  benchmarks:z.array(z.object({code:z.string(),description:z.string()})),
  roles:z.array(role),
  // Your Turn (lib/your-turn.ts): one activity per "What's your angle?" option, after the game.
  your_turn:z.object({activities:z.record(z.string(),yourTurnActivity)}).optional(),missions:z.array(mission).optional(),
  // Demo rival and squad modes: the computer players' names (clearly labeled as computer players on screen).
  computer_players:z.object({rival:z.object({name:z.string().min(1),emblem:z.enum(["lantern","rider"])}),teammates:z.array(z.string().min(1)).min(2).max(3)}).optional(),
  // Students in the story: the part the student plays (see lib/student-role.ts). never: people the student must never be.
  student_role:z.object({name:z.string(),setup:z.string(),start_scene:z.string(),intro:z.string(),never:z.array(z.string()).optional()}).optional(),
  characters:z.array(z.object({id:z.string(),name:z.string(),gender:z.string(),description:z.string(),personality:z.string(),knowledge_limits:z.string(),speech_style:z.string(),never_reveal:z.array(z.string()),voice_id:z.string(),portrait:z.string().optional(),traits:z.array(z.object({name:z.string().min(1),paragraph:z.string().regex(/^p\d{3}$/),line:z.string().min(1)})).min(2).max(3).optional(),hologram:z.string().regex(/^\/worlds\/[a-z0-9-]+\/holograms\/[a-z0-9-]+\.png$/).optional()})),
  glossary:z.array(z.object({term:z.string(),student_friendly_definition:z.string(),part_of_speech:z.string().optional(),definition:z.string().optional(),plain_definition:z.string().optional(),example_sentence:z.string().optional(),text_sentence:z.string().optional()})),
  scenes:z.array(scene),
  storybook:storybook.optional(),
  verdict:verdict.optional(),
  recall_checks:z.array(z.string()), real_world_connection:z.object({prompt:z.string()}), narrative_task:z.object({prompt_by_role:z.record(z.string(),z.string()),requirements:z.array(z.string()),rubric:z.array(z.object({criterion:z.string(),levels:z.array(z.object({score:z.number(),descriptor:z.string()}))}))}), dok4_extension:z.object({prompt:z.string(),requirements:z.array(z.string())}).optional()
});
export type WorldPack = z.infer<typeof WorldPackSchema>;
