import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {WorldPackSchema} from "../lib/world-schema.ts";
import {screenMessage} from "../lib/safety.ts";
import {characterReply} from "../lib/llm.ts";
import {generateResumePhrase,hashResumePhrase} from "../lib/resume.ts";
import {createDemoSandboxId,isDemoSandboxExpired} from "../lib/demo-sandbox.ts";
import {isOwnerEmailAllowed} from "../lib/owner-auth.ts";

test("Tell-Tale Heart pack validates and every authored branch points to a scene",async()=>{
  const raw=JSON.parse(await readFile(new URL("../worlds/tell-tale-heart/world.json",import.meta.url),"utf8"));
  const pack=WorldPackSchema.parse(raw);const ids=new Set(pack.scenes.map(s=>s.id));
  assert.equal(pack.pack_type,"literature");assert.equal(pack.scenes.length,4);
  for(const scene of pack.scenes)for(const option of scene.choice_point?.options??[])assert.ok(ids.has(option.next_scene_id));
});

test("safety layer steps out for danger and redirects personal or sexual requests",()=>{
  const danger=screenMessage("I might hurt myself tonight");assert.equal(danger.action,"support");assert.equal(danger.flag,"self_harm");
  assert.equal(screenMessage("What is your phone number?").action,"redirect");
  assert.equal(screenMessage("Will you date me?").action,"redirect");
  assert.equal(screenMessage("What happens in the story?").action,"allow");
});

test("an unsupported question receives a deterministic grounded refusal",async()=>{
  const result=await characterReply({question:"What is the old man's secret phone number?",scene:"arrival",passages:[],character:{name:"The Narrator",personality:"nervous",speech_style:"emphatic",knowledge_limits:"only the story",never_reveal:[]}});
  assert.match(result.text,/cannot say|no passage/i);
});

test("resume codes have four words, and hashing is normalized",()=>{
  const phrase=generateResumePhrase();assert.equal(phrase.split("-").length,4);assert.equal(hashResumePhrase(phrase),hashResumePhrase(phrase.toUpperCase()));assert.notEqual(hashResumePhrase(phrase),phrase);
});

test("demo tabs receive isolated IDs and their data expires after 24 hours",()=>{
  const a=createDemoSandboxId(),b=createDemoSandboxId();assert.notEqual(a,b);
  const now=Date.now();assert.equal(isDemoSandboxExpired(now,now+1000),false);assert.equal(isDemoSandboxExpired(now,now+24*60*60*1000),true);
});

test("waitlist owner matching is case-insensitive and rejects other accounts",()=>{
  assert.equal(isOwnerEmailAllowed("OWNER@example.org","owner@example.org"),true);
  assert.equal(isOwnerEmailAllowed("demo@example.org","owner@example.org"),false);
  assert.equal(isOwnerEmailAllowed(undefined,"owner@example.org"),false);
});

test("demo access codes are case-insensitive and tokens are signed with the configured code", async()=>{
  const {demoCodeMatches,createDemoAccessToken,verifyDemoAccessToken,demoAccessDevice}=await import("../lib/demo-access.ts");
  const previous=process.env.DEMO_ACCESS_CODE;
  try{
    delete process.env.DEMO_ACCESS_CODE;
    assert.equal(await demoCodeMatches("anything"),false);
    process.env.DEMO_ACCESS_CODE="Lantern-42";
    assert.equal(await demoCodeMatches(" lantern-42 "),true);
    assert.equal(await demoCodeMatches("lantern-43"),false);
    const token=await createDemoAccessToken();
    assert.equal(await verifyDemoAccessToken(token),true);
    const [device,,signature]=token.split(".");
    assert.equal(await demoAccessDevice(token),device);
    assert.notEqual(device,(await createDemoAccessToken()).split(".")[0]);
    assert.equal(await verifyDemoAccessToken(`${crypto.randomUUID()}.${token.split(".")[1]}.${signature}`),false);
    assert.equal(await verifyDemoAccessToken(token.replace(/.$/,c=>c==="0"?"1":"0")),false);
    assert.equal(await verifyDemoAccessToken(`${device}.${Date.now()-1}.${signature}`),false);
    process.env.DEMO_ACCESS_CODE="rotated-code";
    assert.equal(await verifyDemoAccessToken(token),false);
  }finally{if(previous===undefined)delete process.env.DEMO_ACCESS_CODE;else process.env.DEMO_ACCESS_CODE=previous}
});

test("fluency alignment counts substitutions and omissions, ignores insertions, and stops at the last word read",async()=>{
  const {alignTranscript,scoreMarks,passageWords,setLastWord,toggleWord}=await import("../lib/fluency.ts");
  const passage=passageWords("The old turtle crawled slowly up the dark beach toward the dunes.");
  const marks=alignTranscript(passage,"the old turtle uh crawled slow up the dark beach".split(" "));
  assert.deepEqual(marks,["correct","correct","correct","correct","error","correct","correct","correct","correct","unread","unread","unread"]);
  const score=scoreMarks(marks,60);
  assert.equal(score.attempted,9);assert.equal(score.errors,1);assert.equal(score.wcpm,8);assert.equal(score.accuracy,88.9);
  const omitted=alignTranscript(passage,"the old crawled slowly up".split(" "));assert.equal(omitted[2],"error");assert.equal(scoreMarks(omitted,60).attempted,6);assert.equal(scoreMarks(omitted,60).errors,1);
  const halfMinute=scoreMarks(marks,30);assert.equal(halfMinute.wcpm,16);
  const moved=setLastWord(marks,11);assert.equal(moved[11],"correct");assert.equal(moved[4],"error");
  assert.deepEqual(toggleWord(marks,11),marks);assert.equal(toggleWord(marks,4)[4],"correct");
  assert.equal(alignTranscript(passage,[]).every(m=>m==="unread"),true);
});

test("fluency norms, growth, and leveled passages are in range",async()=>{
  const {normFor,weeklyGrowth,fleschKincaidGrade,passageWords}=await import("../lib/fluency.ts");
  const {fluencyPassages}=await import("../lib/fluency-passages.ts");
  assert.equal(normFor(4,new Date("2026-10-05T12:00:00")).p50,94);
  const older=normFor(9,new Date("2027-01-15T12:00:00"));assert.equal(older.normGrade,6);assert.equal(older.p50,145);assert.equal(older.usesGrade6,true);
  assert.equal(weeklyGrowth([{date:"2026-09-01",wcpm:80}]),null);
  assert.equal(weeklyGrowth([{date:"2026-09-01",wcpm:80},{date:"2026-09-08",wcpm:82},{date:"2026-09-15",wcpm:84}]),2);
  for(const p of fluencyPassages){const words=passageWords(p.text).length;assert.ok(words>=220,`${p.id} has ${words} words`);assert.ok(Math.abs(fleschKincaidGrade(p.text)-p.targetGrade)<=1.6,`${p.id} level ${fleschKincaidGrade(p.text)}`)}
});

test("B.E.S.T. benchmark families resolve to official grade-level codes, and built worlds carry no placeholder codes",async()=>{
  const {resolveBenchmark}=await import("../lib/standards.ts");
  assert.deepEqual(resolveBenchmark("ELA.C.1.2",8),{code:"ELA.8.C.1.2",description:"Write personal or fictional narratives using narrative techniques, varied transitions, and a clearly established point of view."});
  assert.equal(resolveBenchmark("ELA.R.1.3",10)?.code,"ELA.10.R.1.1");
  assert.equal(resolveBenchmark("ELA.K12.EE.1.1",7)?.description,"Cite evidence to explain and justify reasoning.");
  assert.equal(resolveBenchmark("RL.1",9),null);
  for(const id of ["tell-tale-heart","sleepy-hollow","trifles"]){
    const pack=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
    const codes=[...pack.benchmarks.map(b=>b.code),...pack.scenes.flatMap(s=>s.artifacts.flatMap(a=>a.questions.map(q=>q.benchmark.code)))];
    for(const code of codes)assert.ok(resolveBenchmark(code,pack.grade_band.min),`${id}: ${code} is not a B.E.S.T. code`);
    for(const b of pack.benchmarks)assert.doesNotMatch(b.description,/PENDING/);
  }
});

test("every course tag fits the story's grade band, so course filters only show usable stories",async()=>{
  const {courseFitsBand,gradesFor}=await import("../lib/standards.ts");
  const {readdir}=await import("node:fs/promises");
  for(const dir of await readdir(new URL("../worlds/",import.meta.url))){
    const w=JSON.parse(await readFile(new URL(`../worlds/${dir}/world.json`,import.meta.url),"utf8"));
    for(const c of w.courses??[])assert.ok(courseFitsBand(c,w.grade_band),`${dir} is tagged ${c} but is grades ${w.grade_band.min}-${w.grade_band.max}`);
  }
  assert.deepEqual(gradesFor({min:8,max:12},["ap_lit","ap_lang"]),[11,12]);
  assert.deepEqual(gradesFor({min:8,max:12},[]),[8,9,10,11,12]);
});

test("mini lessons are complete, have one correct answer per question, and story recommendations exist",async()=>{
  const {miniLessons,lessonById}=await import("../lib/mini-lessons.ts");
  const {resolveBenchmark}=await import("../lib/standards.ts");
  const ids=new Set<string>();
  for(const l of miniLessons){
    assert.ok(!ids.has(l.id),`duplicate ${l.id}`);ids.add(l.id);
    assert.ok(l.cards.length>=2&&l.model.steps.length>=2&&l.checks.length>=2,`${l.id} is incomplete`);
    for(const c of l.checks)assert.equal(c.options.filter(o=>o.correct).length,1,`${l.id}: "${c.question}" needs exactly one correct answer`);
    for(const b of l.benchmarks)assert.ok(resolveBenchmark(b,8),`${l.id}: ${b}`);
    assert.ok(l.grades.min>=6&&l.grades.max<=12);
  }
  for(const id of ["tell-tale-heart","sleepy-hollow","trifles"]){
    const pack=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
    for(const lessonId of pack.mini_lessons??[]){const l=lessonById(lessonId);assert.ok(l,`${id}: ${lessonId}`);assert.ok(l!.grades.min<=pack.grade_band.max&&l!.grades.max>=pack.grade_band.min)}
  }
});

test("stories split into ordered reading portions with no paragraph lost",async()=>{
  const {parseSourcePassages,splitIntoPortions}=await import("../lib/source-passages.ts");
  const passages=parseSourcePassages(await readFile(new URL("../worlds/tell-tale-heart/source.md",import.meta.url),"utf8"));
  const portions=splitIntoPortions(passages,4);
  assert.equal(portions.length,4);
  assert.deepEqual(portions.flat().map(p=>p.id),passages.map(p=>p.id));
  assert.ok(portions.every(p=>p.length>0));
  assert.equal(splitIntoPortions(passages.slice(0,2),5).length,2);
});

test("live class analysis plans come from a scene's clues, include Stop and Chat, and advance in order",async()=>{
  const {buildPlan,advanceState,expectedResponse,secondsLeft}=await import("../lib/classroom/plan.ts");
  const pack=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/tell-tale-heart/world.json",import.meta.url),"utf8")));
  const plan=buildPlan(pack,{sceneId:"arrival",roleId:pack.roles[0].id,grade:9,stages:["notice","interpret"],chatAfterEachClue:true,chatSeconds:90});
  const clues=pack.scenes[0].artifacts.length;
  assert.equal(plan.steps.filter(s=>s.kind==="question").length,clues*2);
  assert.equal(plan.steps.filter(s=>s.kind==="chat").length,clues);
  const lastChat=plan.steps.at(-1)!;assert.equal(lastChat.kind,"chat");assert.ok(lastChat.kind==="chat"&&lastChat.realWorld);
  let s={step:0,phase:"answer" as const,chatStartedAt:null,status:"active" as const} as Parameters<typeof advanceState>[1];
  assert.equal(expectedResponse(plan,s),"answer");
  s=advanceState(plan,s,"reveal");assert.equal(s.phase,"reveal");assert.equal(expectedResponse(plan,s),null);
  s=advanceState(plan,s,"next");s=advanceState(plan,s,"next");assert.equal(plan.steps[s.step].kind,"chat");assert.equal(s.phase,"chat");
  s=advanceState(plan,s,"start_timer",new Date("2026-10-04T12:00:00Z"));assert.equal(secondsLeft(plan.steps[s.step],s.chatStartedAt,Date.parse("2026-10-04T12:00:30Z")),60);
  s=advanceState(plan,s,"takeaway");assert.equal(expectedResponse(plan,s),"takeaway");
  const minimal=buildPlan(pack,{sceneId:"arrival",roleId:"x",grade:11,stages:["craft"],chatAfterEachClue:false,chatSeconds:9999});
  assert.equal(minimal.steps.filter(x=>x.kind==="chat").length,1);assert.ok(minimal.steps.every(x=>x.kind==="chat"?x.seconds===300:x.stage==="craft"));
  let end={step:minimal.steps.length-1,phase:"chat" as const,chatStartedAt:null,status:"active" as const} as Parameters<typeof advanceState>[1];
  assert.equal(advanceState(minimal,end,"next").status,"ended");
});

test("student class tokens verify and resist tampering",async()=>{
  process.env.CLASS_TOKEN_SECRET="test-secret";
  const {createStudentToken,verifyStudentToken}=await import("../lib/classroom/auth.ts");
  const token=createStudentToken("abc-123");assert.equal(verifyStudentToken(token),"abc-123");
  assert.equal(verifyStudentToken(token.replace("abc","abd")),null);assert.equal(verifyStudentToken("nope"),null);assert.equal(verifyStudentToken(null),null);
});

test("bilingual supports: every playable story has a complete translation file for each home language",async()=>{
  const {homeLanguages,textKey,translatableStrings,translator}=await import("../lib/bilingual.ts");
  assert.equal(textKey(" Hello "),textKey("Hello"));assert.notEqual(textKey("Hello"),textKey("Hello."));
  for(const id of ["tell-tale-heart","sleepy-hollow","trifles"]){
    const pack=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
    const lines=translatableStrings(pack);
    for(const lang of homeLanguages){
      const file=JSON.parse(await readFile(new URL(`../worlds/${id}/translations/${lang}.json`,import.meta.url),"utf8"));
      assert.equal(file.language,lang);
      const tr=translator(file);
      const missing=lines.filter(l=>!tr(l));
      assert.equal(missing.length,0,`${id} ${lang} is missing: ${missing.slice(0,2).join(" | ")}`);
    }
  }
});

test("scene reading ranges give each scene its own portion, in the order listed",async()=>{
  const {readFileSync}=await import("node:fs");
  const {parseSourcePassages,readingPortions,describePortion}=await import("../lib/source-passages.ts");
  const world=JSON.parse(readFileSync("worlds/sleepy-hollow/world.json","utf8"));
  const portions=readingPortions(parseSourcePassages(readFileSync("worlds/sleepy-hollow/source.md","utf8")),world.scenes);
  assert.equal(portions.length,world.scenes.length);
  assert.equal(portions[0][0].id,"p068");
  assert.equal(describePortion(portions[0]),"¶ 68 to 70, then ¶ 1 to 20");
  assert.equal(portions[1][0].id,"p021");
});

test("storybook quote check is forgiving but only accepts words from the page", async()=>{
  const {quoteInText}=await import("../lib/storybook.ts");
  const page="I undid the lantern cautiously — oh, so cautiously (for the hinges creaked) — I undid it just so much that a single thin ray fell upon the vulture eye. It wasn't the old man.";
  assert.equal(quoteInText("“A SINGLE thin RAY fell upon the vulture eye”",page),true);
  assert.equal(quoteInText("single   thin ray  fell upon the vulture eye",page),true);
  assert.equal(quoteInText("for the hinges creaked",page),true);
  assert.equal(quoteInText("it wasn’t the old man",page),true);
  assert.equal(quoteInText("the old man was snoring",page),false);
  assert.equal(quoteInText("thin ray",page),false);
  assert.equal(quoteInText("ray fell upon the vulture eyes",page),false);
});

test("every Tell-Tale Heart clue lands on the storybook page that holds its last cited paragraph", async()=>{
  const {cluesByPage}=await import("../lib/storybook.ts");
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/tell-tale-heart/world.json",import.meta.url),"utf8")));
  const byPage=cluesByPage(world);
  assert.equal(byPage.flat().length,world.scenes.reduce((n,s)=>n+s.artifacts.length,0));
  const pages=world.storybook!.pages;
  for(const [i,items] of byPage.entries())for(const {clue} of items){
    const lastCited=Math.max(...clue.source_anchor.map(id=>Number(id.slice(1))));
    assert.ok(Number(pages[i].start.slice(1))<=lastCited&&lastCited<=Number(pages[i].end.slice(1)),clue.id);
  }
});

test("teacher demo sample data quotes the story exactly and tags real benchmarks", async()=>{
  const {sampleCaseFile,sampleFrames,sampleStudents}=await import("../lib/sample-classroom.ts");
  const {quoteInText}=await import("../lib/storybook.ts");
  const source=await readFile(new URL("../worlds/tell-tale-heart/source.md",import.meta.url),"utf8");
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/tell-tale-heart/world.json",import.meta.url),"utf8")));
  const codes=new Set(world.benchmarks.map(b=>b.code)),clues=new Set(world.scenes.flatMap(s=>s.artifacts.map(a=>a.id)));
  for(const e of sampleCaseFile.entries){assert.ok(quoteInText(e.quote,source),e.quote);assert.ok(clues.has(e.clueId),e.clueId);for(const t of e.tags)assert.ok(codes.has(t),t)}
  for(const f of sampleFrames)assert.ok(quoteInText(f.quote,source),f.quote);
  assert.equal(sampleStudents.length,12);
  for(const s of sampleStudents)assert.match(s.name,/^[A-Z][a-z]+$/);
});

test("class reading progress accepts the student's reading work and rejects anything else", async()=>{
  const {StudentProgressSchema}=await import("../lib/classroom/progress.ts");
  const good={v:1,worldId:"tell-tale-heart",scene:0,submitted:false,role:"investigator",readerProgress:{"tell-tale-heart":{page:2,part:1,furthest:3,briefed:true,sections:[],skippedFrames:["page-05"]}},artifactAnswers:{"search-motive":{notice:"Object there was none.",interpret:"He names the eye.",craft:"",technique:"",revisions:[]}},savedTextEvidence:[{id:"e1",paragraphId:"p002",text:"Object there was none.",artifactId:"search-motive"}],storyFrames:{"page-04":{kind:"add_detail",description:"A thin beam",quote:"a single thin ray",saved_at:"2026-10-11T00:00:00Z"}},updatedAt:"2026-10-11T00:00:00Z"};
  assert.equal(StudentProgressSchema.safeParse(good).success,true);
  assert.equal(StudentProgressSchema.safeParse({...good,v:2}).success,false);
  assert.equal(StudentProgressSchema.safeParse({...good,worldId:"../etc"}).success,false);
  assert.equal(StudentProgressSchema.safeParse({...good,deviceId:"abc"}).success,true,"unknown keys are dropped, not stored");
  assert.equal("deviceId" in StudentProgressSchema.parse({...good,deviceId:"abc"}),false);
  assert.equal(StudentProgressSchema.safeParse({...good,artifactAnswers:{x:{...good.artifactAnswers["search-motive"],interpret:"x".repeat(3001)}}}).success,false);
});
