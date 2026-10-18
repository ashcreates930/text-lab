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

test("sentences never break after titles or initials, and Tell-Tale Heart's sentences are unchanged", async()=>{
  const {splitSentences}=await import("../lib/storybook.ts");
  assert.deepEqual(splitSentences("Now, Mr. Hale, explain to Mr. Henderson. Then go."),["Now, Mr. Hale, explain to Mr. Henderson.","Then go."]);
  assert.deepEqual(splitSentences("the protection of St. Nicholas when they crossed. D. K."),["the protection of St. Nicholas when they crossed.","D. K."]);
  // The rule the case flow has always used, for a story with no titles or initials.
  const {parseSourcePassages}=await import("../lib/source-passages.ts");
  const old=(t:string)=>(t.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g)??[t]).map(x=>x.trim()).filter(Boolean);
  for(const p of parseSourcePassages(await readFile(new URL("../worlds/tell-tale-heart/source.md",import.meta.url),"utf8")))assert.deepEqual(splitSentences(p.text),old(p.text),p.id);
});

test("play scripts: speakers join their lines, stage directions are italic pieces, and spoken emphasis stays in the sentence", async()=>{
  const {pageUnits,scriptPieces}=await import("../lib/storybook.ts");
  const pieces=scriptPieces("[_With rising voice._] We don’t know who killed him. We don’t _know_.");
  assert.deepEqual(pieces.map(p=>[p.text,!!p.stage]),[["[With rising voice.]",true],["We don’t know who killed him.",false],["We don’t _know_.",false]]);
  assert.equal(pieces[2].full,"We don’t know.");
  // Some stage-only paragraphs in this edition lack the closing bracket.
  assert.deepEqual(scriptPieces("[_They all look at the rocker._").map(p=>[p.text,!!p.stage]),[["[They all look at the rocker.]",true]]);
  // The long unbracketed SCENE description is a stage direction, not speech.
  assert.equal(scriptPieces("SCENE: _The kitchen in the now abandoned farmhouse of JOHN WRIGHT, a gloomy kitchen._")[1].stage,true);
  const passages=[{id:"p001",text:"MRS. PETERS"},{id:"p002",text:"[_After taking a step forward._] I’m not--cold."}];
  const units=pageUnits(passages,{id:"x",section:"s",start:"p001",end:"p002",mode:"student",characters_met:[],restatements:{}},"script");
  assert.equal(units.length,1);assert.equal(units[0].speaker,"MRS. PETERS");assert.equal(units[0].items[1].text,"I’m not--cold.");
});

test("bridge pages are named between story pages, and the shelf Peek skips headings", async()=>{
  const {storyPageNames,openingLines}=await import("../lib/storybook.ts");
  const {parseSourcePassages}=await import("../lib/source-passages.ts");
  const page=(id:string,bridge=false)=>({id,section:"s",start:"p001",end:"p001",mode:"illustrated" as const,characters_met:[],restatements:{},...(bridge?{bridge:{summary:"x"}}:{})});
  assert.deepEqual(storyPageNames([page("a"),page("b",true),page("c")]),["page 1","the summary between pages 1 and 2","page 2"]);
  for(const [id,start] of [["tell-tale-heart","TRUE!"],["trifles","The kitchen in the now abandoned farmhouse"],["sleepy-hollow","A pleasing land of drowsy head"]]){
    const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
    const opening=openingLines(world,parseSourcePassages(await readFile(new URL(`../worlds/${id}/source.md`,import.meta.url),"utf8")));
    assert.ok(opening.startsWith(start),`${id}: ${opening.slice(0,60)}`);assert.ok(!/[_\[\]]/.test(opening),id);
  }
});

test("storybook AI characters are met on a page before they can be asked, and bridges hold no clues", async()=>{
  const {cluesByPage}=await import("../lib/storybook.ts");
  for(const id of ["tell-tale-heart","sleepy-hollow","trifles"]){
    const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
    const pages=world.storybook!.pages,gates=cluesByPage(world);
    const metOn=new Map(pages.flatMap((p,i)=>p.characters_met.map(c=>[c.id,i] as const)));
    for(const c of world.characters)assert.ok(metOn.has(c.id),`${id}: ${c.id} is never met, so it could never be asked`);
    for(const [i,p] of pages.entries())if(p.bridge)assert.equal(gates[i].length,0,`${id} ${p.id}`);
    // The reader offers a scene's characters only once met (app/clue-steps.ts), so a page's chat list is this:
    const askable=(i:number,scene:typeof world.scenes[number])=>scene.available_characters.filter(c=>(metOn.get(c)??Infinity)<=i);
    for(const [i] of pages.entries())for(const {scene} of gates[i])for(const c of askable(i,scene))assert.ok(metOn.get(c)!<=i);
  }
  // Brom Bones is first met on Sleepy Hollow's page with ¶28, so no earlier clue page can offer him.
  const sh=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8")));
  const bromAt=sh.storybook!.pages.findIndex(p=>p.characters_met.some(c=>c.id==="brom-bones"));
  assert.equal(sh.storybook!.pages[bromAt].start,"p028");
});

test("a brand-new reader is stopped by the first clue in every storybook", async()=>{
  const {cluesByPage,firstLockedPage}=await import("../lib/storybook.ts");
  for(const id of ["tell-tale-heart","sleepy-hollow","trifles"]){
    const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
    const gates=cluesByPage(world),firstClue=gates.findIndex(g=>g.length>0);
    // Nothing proven and no frames saved: the gate is the first page that holds a clue (or an earlier required frame).
    const locked=firstLockedPage(world,()=>false,()=>false);
    assert.ok(locked>=0&&locked<=firstClue,`${id}: locked at ${locked}, first clue at ${firstClue}`);
    // Proving everything opens the whole story.
    assert.equal(firstLockedPage(world,()=>true,()=>true),-1,id);
  }
});

test("saved work from another version of a story is cleared; current work and other stories are kept", async()=>{
  const {reconcileSaved,frameKey}=await import("../lib/storybook.ts");
  const read=async(id:string)=>WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
  const sh=await read("sleepy-hollow"),tth=await read("tell-tale-heart");
  const shClue=sh.scenes[0].artifacts[0].id,tthClue=tth.scenes[0].artifacts[0].id,answer={notice:"a",interpret:"b"};
  // A session saved before versions existed (for example, the old case flow) that answered a Sleepy Hollow clue.
  const old={worldId:"sleepy-hollow",submitted:true,artifactAnswers:{[shClue]:answer,[tthClue]:answer},savedTextEvidence:[{artifactId:shClue},{artifactId:tthClue}],storyFrames:{"page-04":{},[frameKey("sleepy-hollow","page-06")]:{}},readerProgress:{"sleepy-hollow":{page:9,furthest:9}}};
  const r=reconcileSaved(sh,old);
  assert.equal(sh.storybook!.version,"2");
  assert.deepEqual(Object.keys(r.artifactAnswers),[tthClue],"Sleepy Hollow answers cleared, Tell-Tale Heart kept");
  assert.deepEqual(r.savedTextEvidence,[{artifactId:tthClue}]);
  assert.deepEqual(r.storyFrames,{},"old page-only and Sleepy Hollow frames cleared");
  assert.deepEqual(r.readerProgress["sleepy-hollow"],{version:"2"});
  assert.equal(r.submitted,false);
  // Current-version work stays exactly as it is.
  const current={...old,readerProgress:{"sleepy-hollow":{version:"2",page:9}}};
  assert.equal(reconcileSaved(sh,current),current);
  // Tell-Tale Heart is still version 1, so a class student's saved work from before versions existed is kept, and
  // an old page-only frame key moves to the story key.
  const tthOld={worldId:"tell-tale-heart",artifactAnswers:{[tthClue]:answer},storyFrames:{"page-04":{description:"x"}} as Record<string,unknown>,readerProgress:{"tell-tale-heart":{page:5}}};
  const t=reconcileSaved(tth,tthOld);
  assert.deepEqual(Object.keys(t.artifactAnswers),[tthClue]);
  assert.deepEqual(t.storyFrames[frameKey("tell-tale-heart","page-04")],{description:"x"});
  assert.equal(t.readerProgress["tell-tale-heart"].page,5);
});

test("evidence view: proven counts, character checks, and the needs-help rule", async()=>{
  const {buildEvidence,findingOf,findingSentence,evidenceCsv}=await import("../lib/classroom/evidence.ts");
  const {sampleEvidenceStudents}=await import("../lib/sample-classroom.ts");
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8")));
  const e=buildEvidence(world,[
    ...sampleEvidenceStudents.map((s,i)=>({id:`s${i}`,nickname:s.nickname,answers:s.answers})),
    {id:"half",nickname:"Half",answers:{"empty-schoolhouse":{notice:"a line",interpret:"  "}}},
    {id:"new",nickname:"New",answers:null},
  ]);
  const row=(n:string)=>e.students.find(s=>s.nickname===n)!;
  // Proven only when both the line and the explanation have text (same rule as isDone).
  assert.equal(row("Amara").proven,9);assert.equal(row("Grace").proven,1);assert.equal(row("Half").proven,0);
  assert.equal(e.summary.totalClues,16);assert.equal(e.summary.joined,10);
  // Character checks: "contradicts" proved a character wrong; "supports" backed them up; anything else is no check.
  assert.equal(findingOf({craft:"contradicts"}),"proved-wrong");assert.equal(findingOf({craft:"supports"}),"backed-up");assert.equal(findingOf({craft:""}),null);
  assert.equal(row("Amara").provedWrong,2);assert.equal(row("Ella").cells["shadowy-rider"].finding,"proved-wrong");
  assert.equal(e.summary.provedWrongStudents,3);
  // The party scene has one character to question, so the line names him; the road home has two.
  const party=e.scenes.find(s=>s.id==="van-tassel-party"),road=e.scenes.find(s=>s.id==="the-road-home");
  assert.equal(findingSentence("proved-wrong",party),"This line proved Brom Bones wrong.");
  assert.equal(findingSentence("proved-wrong",road),"This line proved the character they questioned wrong.");
  // Needs help: saved progress but nothing proven. A student who never saved progress has not started.
  assert.equal(row("Hugo").needsHelp,true);assert.equal(row("Half").needsHelp,true);
  assert.equal(row("New").needsHelp,false);assert.equal(row("New").started,false);assert.equal(row("Amara").needsHelp,false);
  assert.equal(e.summary.needsHelp,2);
  // Spreadsheet: one row per student and clue, with commas and quotes escaped.
  const csv=evidenceCsv(e).split("\r\n");
  assert.equal(csv.length,1+10*16);
  assert.match(csv[0],/^Student,Scene,Clue,Proven,Line from the story,Student explanation,Character check$/);
  assert.ok(csv.some(l=>l.startsWith("Amara,")&&l.includes("Proved Brom Bones wrong")));
});

test("the detail panel names the character the student questioned", async()=>{
  const {buildEvidence,evidenceDetail,sceneTitle}=await import("../lib/classroom/evidence.ts");
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8")));
  const quote="Ichabod was horror-struck on perceiving that he was headless";
  const e=buildEvidence(world,[
    {id:"new",nickname:"Ella",answers:{"shadowy-rider":{notice:quote,interpret:"He had no head.",craft:"contradicts",character:"hans-van-ripper"}}},
    // An older save without the character, in a scene with two characters to question.
    {id:"old",nickname:"Old",answers:{"shadowy-rider":{notice:quote,interpret:"He had no head.",craft:"contradicts"}}},
  ]);
  const saved=evidenceDetail(e,"new","shadowy-rider")!;
  assert.equal(saved.findingLine,"This line proved Hans Van Ripper wrong.");
  assert.equal(saved.title,"Ella · The shadowy rider");
  assert.equal(evidenceDetail(e,"old","shadowy-rider")!.findingLine,"This line proved the character they questioned wrong.");
  // The scene label keeps the story's own spelling.
  assert.equal(e.scenes.find(s=>s.id==="the-towns-verdict")!.title,"Scene 4 · The town’s verdict");
  assert.equal(sceneTitle("the-towns-verdict",3,""),"Scene 4 · The towns verdict");
});

test("saved answers load with or without the questioned character", async()=>{
  const {StudentProgressSchema}=await import("../lib/classroom/progress.ts");
  const base={v:1,worldId:"sleepy-hollow",scene:0,submitted:false,readerProgress:{},savedTextEvidence:[],storyFrames:{},updatedAt:"2026-10-17T12:00:00.000Z"};
  const answer={notice:"a line",interpret:"why",craft:"contradicts",technique:"",revisions:[]};
  assert.ok(StudentProgressSchema.safeParse({...base,artifactAnswers:{"shadowy-rider":answer}}).success,"older save without a character");
  const withCharacter=StudentProgressSchema.safeParse({...base,artifactAnswers:{"shadowy-rider":{...answer,character:"hans-van-ripper"}}});
  assert.ok(withCharacter.success);
  assert.equal(withCharacter.data!.artifactAnswers["shadowy-rider"].character,"hans-van-ripper");
});

test("evidence sample class quotes Sleepy Hollow exactly and has the mix the demo promises", async()=>{
  const {sampleEvidenceStudents}=await import("../lib/sample-classroom.ts");
  const {quoteInText}=await import("../lib/storybook.ts");
  const world=JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8"));
  const source=await readFile(new URL("../worlds/sleepy-hollow/source.md",import.meta.url),"utf8");
  const clueIds=new Set(world.scenes.flatMap((s:{artifacts:{id:string}[]})=>s.artifacts.map(a=>a.id)));
  assert.equal(sampleEvidenceStudents.length,8);
  for(const s of sampleEvidenceStudents)for(const [id,a] of Object.entries(s.answers??{})){assert.ok(clueIds.has(id),id);assert.ok(quoteInText(a.notice,source),a.notice)}
  assert.ok(sampleEvidenceStudents.filter(s=>Object.values(s.answers??{}).some(a=>a.craft==="contradicts")).length>=2);
  assert.equal(sampleEvidenceStudents.filter(s=>s.answers&&!Object.keys(s.answers).length).length,1);
  // Every sample student with work questioned a character the scene allows, so the sample always shows names.
  const sceneOf=new Map<string,string[]>(world.scenes.flatMap((s:{available_characters:string[];artifacts:{id:string}[]})=>s.artifacts.map(a=>[a.id,s.available_characters] as const)));
  for(const s of sampleEvidenceStudents.filter(x=>x.answers&&Object.keys(x.answers).length)){
    assert.ok(Object.values(s.answers!).some(a=>a.character),`${s.nickname} questioned a character`);
    for(const [id,a] of Object.entries(s.answers!))if(a.craft){assert.ok(a.character,`${s.nickname} ${id}`);assert.ok(sceneOf.get(id)!.includes(a.character!),`${s.nickname} ${id} ${a.character}`)}
  }
});

test("a teacher cannot read another teacher's class evidence", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {getClassroomStore}=await import("../lib/classroom/store.ts");
  const {loadClassEvidence}=await import("../lib/classroom/evidence-server.ts");
  const store=getClassroomStore();assert.ok(store,"memory store");
  const owner=await store.ensureTeacher("test:owner","owner@example.com"),other=await store.ensureTeacher("test:other","other@example.com");
  const cls=await store.createClass(owner.id,{name:"Period 1",worldId:"sleepy-hollow",grade:7});
  const student=await store.createStudent(cls.id,"Robin","hash");assert.notEqual(student,"taken");
  await store.saveProgress((student as {id:string}).id,{v:1,worldId:"sleepy-hollow",scene:0,submitted:false,readerProgress:{},artifactAnswers:{"empty-schoolhouse":{notice:"It was most ingeniously secured",interpret:"He locks it carefully.",craft:"contradicts",technique:"",revisions:[]}},savedTextEvidence:[],storyFrames:{},updatedAt:new Date().toISOString()});
  assert.equal(await loadClassEvidence(store,other.id,cls.id),null,"another teacher gets nothing");
  const mine=await loadClassEvidence(store,owner.id,cls.id);
  assert.equal(mine?.students.length,1);assert.equal(mine?.students[0].proven,1);assert.equal(mine?.students[0].provedWrong,1);
});

test("class students start a clue on the ask step when the scene has characters", async()=>{
  const React=(await import("react")).default;
  const {renderToString}=await import("react-dom/server");
  const {useClueSteps,clueStepPlan}=await import("../app/clue-steps.ts");
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8")));
  const scene=world.scenes.find(s=>s.available_characters.length)!,clue=scene.artifacts[0];
  const classDemo={id:"00000000-0000-4000-8000-000000000001",preset:"class_student",artifactAnswers:{},savedTextEvidence:[]} as never;
  let seen:{step:string;steps:string[]}|null=null;
  function Probe(){const s=useClueSteps({world,scene,clue,roleId:world.roles[0].id,demo:classDemo,setDemo:()=>{},passages:[]});seen={step:s.step,steps:s.steps};return null}
  renderToString(React.createElement(Probe));
  assert.deepEqual(seen,{step:"ask",steps:["ask","prove","explain"]});
  // A scene with no characters still starts at prove.
  assert.deepEqual(clueStepPlan(world,{...scene,available_characters:[]}).steps,["prove","explain"]);
});

test("a returning visitor with a saved side starts on the home page, not the book", async()=>{
  const {homeStartView}=await import("../app/home-start.ts");
  assert.equal(homeStartView("student",false),"landing");
  assert.equal(homeStartView("teacher",false),"landing");
  assert.equal(homeStartView(null,false),"landing");
  // Resuming a story keeps the saved screen instead.
  assert.equal(homeStartView("student",true),null);
  // page.tsx uses this decision and never sends the home flow to the book view.
  const page=await readFile(new URL("../app/page.tsx",import.meta.url),"utf8");
  assert.match(page,/homeStartView\(lastSide, restored\)/);
  assert.doesNotMatch(page,/setView\("book"\)/);
});

test("game layer: portraits fall back to initials, and every character has a portrait file", async()=>{
  const {initials,portraitFor}=await import("../lib/game-feel.ts");
  assert.equal(initials("Hans Van Ripper"),"HR");assert.equal(initials("Mrs. Hale"),"MH");assert.equal(initials("Brom Bones"),"BB");assert.equal(initials("The officer"),"O");
  assert.deepEqual(portraitFor({name:"Brom Bones"}),{kind:"initials",text:"BB"});
  assert.deepEqual(portraitFor({name:"Brom Bones",portrait:"/worlds/sleepy-hollow/characters/brom-bones.png"}),{kind:"image",src:"/worlds/sleepy-hollow/characters/brom-bones.png"});
  for(const id of ["sleepy-hollow","trifles","tell-tale-heart"]){
    const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
    for(const c of world.characters){assert.equal(c.portrait,`/worlds/${id}/characters/${c.id}.png`);await readFile(new URL(`../public${c.portrait}`,import.meta.url))}
  }
});

test("game layer: no two characters in a story share a voice, and every scene has its ambient track", async()=>{
  for(const id of ["sleepy-hollow","trifles","tell-tale-heart"]){
    const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
    const voices=world.characters.map(c=>c.voice_id);
    assert.equal(new Set(voices).size,voices.length,`${id} has two characters with the same voice`);
    for(const s of world.scenes){assert.equal(s.ambient_audio,`/worlds/${id}/${s.id}-ambient.mp3`);await readFile(new URL(`../public${s.ambient_audio}`,import.meta.url))}
  }
});

test("game layer: voices and ambient sound are on for the demo and off for class sessions", async()=>{
  const {soundOn,soundKey,soundDefault}=await import("../lib/game-feel.ts");
  for(const kind of ["voices","ambient"] as const){
    assert.equal(soundOn(kind,"student_first_visit",null),true);
    assert.equal(soundOn(kind,"class_student",null),false);
    // The student's own choice on this device wins, either way.
    assert.equal(soundOn(kind,"class_student","on"),true);assert.equal(soundOn(kind,"student_first_visit","off"),false);
    assert.notEqual(soundKey(kind,"class_student"),soundKey(kind,"student_first_visit"));
  }
  assert.equal(soundDefault("class_student"),false);
});

test("game layer: older saves load without a choice, and chosen options read back as labels", async()=>{
  const {StudentProgressSchema}=await import("../lib/classroom/progress.ts");
  const {choicesMade}=await import("../lib/game-feel.ts");
  const base={v:1,worldId:"sleepy-hollow",scene:1,submitted:false,readerProgress:{},artifactAnswers:{},savedTextEvidence:[],storyFrames:{},updatedAt:"2026-10-17T12:00:00.000Z"};
  assert.ok(StudentProgressSchema.safeParse(base).success,"older save without choices");
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8")));
  const first=world.scenes[0],option=first.choice_point!.options[0];
  const withChoice=StudentProgressSchema.safeParse({...base,choices:{[first.id]:option.id}});
  assert.ok(withChoice.success);assert.equal(withChoice.data!.choices![first.id],option.id);
  assert.deepEqual(choicesMade(world,undefined),[]);
  assert.deepEqual(choicesMade(world,{[first.id]:option.id}),[{sceneId:first.id,label:option.label}]);
});

test("game layer: the case board has one card per proven clue, in scene order, with the Fact Checker mark", async()=>{
  const {caseBoardCards}=await import("../lib/game-feel.ts");
  const {sampleEvidenceStudents}=await import("../lib/sample-classroom.ts");
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8")));
  const answers={...sampleEvidenceStudents[0].answers!,"searchers-report":{notice:"a line",interpret:" "}};
  const cards=caseBoardCards(world,answers);
  assert.equal(cards.length,9,"one card per proven clue; the half-finished one is left off");
  assert.deepEqual(cards.map(c=>c.sceneIndex),[...cards.map(c=>c.sceneIndex)].sort((a,b)=>a-b));
  assert.equal(cards.filter(c=>c.factCheck).length,2);
  assert.equal(cards.find(c=>c.clueId==="broms-race-tale")!.character,"Brom Bones");
  assert.equal(caseBoardCards(world,{}).length,0);
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

test("Pitch tab math matches a hand calculation", async()=>{
  const {computePitch}=await import("../lib/pitch.ts");
  const row=(o:Record<string,unknown>)=>({id:String(Math.random()),created_at:"2026-10-11T00:00:00Z",name:"T",email:"t@example.test",role:null,organization:null,state:null,plan:null,intent:null,price_named:null,price_period:null,students:null,lock_founding_price:false,loi:null,pilot_commit:null,source:null,...o}) as never;
  const p=computePitch([
    row({name:"Ana",plan:"individual",intent:"buy_now",students:120,source:"fellows"}),        // buy now  $79
    row({name:"Ben",plan:"individual",intent:"likely",students:90,source:"mentor"}),           // likely   $79
    row({name:"Cy",plan:"family",intent:"likely",students:4,source:"homeschool"}),             // likely   $49
    row({name:"Dee",plan:"school",intent:"buy_now",students:300,organization:"Lake HS",lock_founding_price:true,loi:"yes",role:"school administrator"}), // buy now $1,500
    row({name:"Eli",plan:"district",intent:"likely",students:2000,organization:"Lake County SD"}), // likely 2,000 x $5 = $10,000
    row({name:"Fay",plan:"pilot",intent:"buy_now",students:250,organization:"Hill MS",pilot_commit:"yes",loi:"maybe"}), // buy now $500
    row({name:"Gus",plan:"individual",intent:"lower_price",price_named:5,price_period:"month",students:60}),   // $60 / year
    row({name:"Hal",plan:"individual",intent:"lower_price",price_named:"50",price_period:"year",students:30}), // $50 / year
    row({name:"Ivy",plan:"explorer",intent:"exploring"}),
    row({name:"Jo",plan:"pd",intent:"likely",organization:"Lake HS"}),                          // training, not in total
  ]);
  assert.equal(p.total,10);
  assert.deepEqual(p.revenue,{buyNow:79+1500+500,likely:79+49+10000,total:2079+10128});
  assert.equal(p.revenue.total,12207);
  assert.equal(p.students,120+90+4+300+2000+250+60+30);
  assert.deepEqual(p.locks,["Dee (Lake HS)"]);
  assert.deepEqual(p.lettersOfIntent,["Dee (Lake HS)"]);
  assert.deepEqual(p.pilotCommitments,["Fay (Hill MS)"]);
  assert.equal(p.schoolsAndDistricts,3);
  assert.equal(p.trainingInterest,1);
  assert.deepEqual(p.lowerPrice,[{plan:"individual",name:"Individual Teacher",count:2,median:55,min:50,max:60}]);
  assert.equal(p.intentByPlan.individual.buy_now,1);assert.equal(p.intentByPlan.individual.lower_price,2);
  assert.equal(p.bySource.fellows,1);assert.equal(p.bySource.direct,7);
});

test("feedback form validation: feedback alone needs no email; the waitlist needs a valid email and student count", async()=>{
  const {SubmissionSchema}=await import("../lib/feedback.ts");
  assert.equal(SubmissionSchema.safeParse({feedback:{ease:4,change:"More stories"}}).success,true);
  assert.equal(SubmissionSchema.safeParse({feedback:{}}).success,false,"empty feedback alone is rejected");
  const w={plan:"school",intent:"likely",lockFoundingPrice:false,wantsUpdates:false,name:"Pat Lee",email:"pat@example.test",students:300};
  assert.equal(SubmissionSchema.safeParse({waitlist:w,source:"fellows"}).success,true);
  assert.equal(SubmissionSchema.safeParse({waitlist:{...w,email:"pat@"}}).success,false,"invalid email");
  assert.equal(SubmissionSchema.safeParse({waitlist:{...w,students:undefined}}).success,false,"school needs a student count");
  assert.equal(SubmissionSchema.safeParse({waitlist:{...w,plan:"explorer",students:undefined}}).success,true,"explorer does not");
  assert.equal(SubmissionSchema.safeParse({waitlist:{...w,intent:undefined}}).success,false,"intent is required");
  assert.equal(SubmissionSchema.safeParse({waitlist:w,source:"Bad Ref!"}).success,false,"ref values are slugs only");
});

test("game layer: ambient loops have no seam and every track is brought to the same level", async()=>{
  const {ambientLevelGain,crossfadeLoop}=await import("../lib/game-feel.ts");
  const sr=1000,ramp=new Float32Array(4000).map((_,i)=>i/4000);
  const [looped]=crossfadeLoop([ramp],sr,0.5);
  assert.equal(looped.length,3500);
  // Playing past the end runs straight on into the blended start: the samples either side of the loop point are neighbours.
  assert.ok(Math.abs(looped[0]-looped[looped.length-1])<=2/4000);
  const tone=(amp:number)=>new Float32Array(sr*5).map((_,i)=>amp*Math.sin(i/3));
  const level=(a:Float32Array,g:number)=>10*Math.log10(a.reduce((s,x)=>s+(x*g)**2,0)/a.length);
  const quiet=tone(0.01),loud=tone(0.3);
  assert.ok(Math.abs(level(quiet,ambientLevelGain([quiet],sr))-level(loud,ambientLevelGain([loud],sr)))<1);
  assert.equal(ambientLevelGain([new Float32Array(sr)],sr),1);
});

test("sound channel: only one sound plays at a time; starting a new one stops the current one", async()=>{
  const {createSoundChannel}=await import("../lib/sound-channel.ts");
  const channel=createSoundChannel(),stopped:string[]=[];
  const reading=channel.begin("narration","empty-schoolhouse",()=>stopped.push("narration"));
  assert.deepEqual(channel.state,{kind:"narration",id:"empty-schoolhouse",part:-1});
  // Pressing Listen again, or replaying a character while the scene is read, starts a new sound: the old one stops.
  const voice=channel.begin("voice","brom-bones",()=>stopped.push("voice"));
  assert.deepEqual(stopped,["narration"]);
  assert.equal(reading.active,false);
  reading.part(3);reading.end(); // reports from a stopped sound are ignored
  assert.deepEqual(channel.state,{kind:"voice",id:"brom-bones",part:-1});
  channel.stop();
  assert.deepEqual(stopped,["narration","voice"]);
  assert.equal(voice.active,false);
  assert.equal(channel.state.kind,null);
});

test("narration reads exactly the reading panel's paragraphs for every scene, one file per paragraph", async()=>{
  const {sceneReading,narrationParts}=await import("../lib/narration.ts");
  const {parseSourcePassages}=await import("../lib/source-passages.ts");
  for(const id of ["sleepy-hollow","trifles","tell-tale-heart"]){
    const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
    const passages=parseSourcePassages(await readFile(new URL(`../worlds/${id}/source.md`,import.meta.url),"utf8"));
    for(const scene of world.scenes){
      const panel=sceneReading(passages,scene),parts=narrationParts(id,scene,passages);
      assert.ok(panel.length>0,`${id}/${scene.id} has no reading`);
      assert.deepEqual(parts.map(p=>p.text),panel.map(p=>p.text));
      assert.deepEqual(parts.map(p=>p.src),panel.map(p=>`/worlds/${id}/narration/${scene.id}/${p.id}.mp3`));
    }
  }
  // The panel's paragraphs are the scene's anchors, in story order.
  assert.deepEqual(sceneReading([{id:"p001",text:"a"},{id:"p002",text:"b"},{id:"p003",text:"c"}],{passage_anchors:["p003","p001"]}).map(p=>p.id),["p001","p003"]);
});

test("Listen button: Stop reading only while this scene's narration plays; missing files fall back to speech", async()=>{
  const {createSoundChannel}=await import("../lib/sound-channel.ts");
  const {listenButton,playNarration}=await import("../lib/narration.ts");
  const {ambientVolumeFor,AMBIENT_VOLUME}=await import("../lib/game-feel.ts");
  const channel=createSoundChannel();
  assert.deepEqual(listenButton(channel.state,"s1"),{playing:false,label:"Listen to the scene",part:-1});
  const heard:string[]=[];let release=()=>{};
  const io={
    clip:(src:string,signal:AbortSignal)=>new Promise<boolean>(resolve=>{
      if(src.endsWith("p2.mp3"))return resolve(false); // this paragraph's file is missing
      heard.push(`file ${src.split("/").pop()}`);release=()=>resolve(true);signal.addEventListener("abort",()=>resolve(true));
    }),
    speak:async(text:string)=>{heard.push(`speech ${text}`)},
  };
  const parts=["p1","p2","p3"].map(id=>({id,text:`text ${id}`,src:`/worlds/w/narration/s1/${id}.mp3`}));
  const done=playNarration(channel,"s1",parts,io);
  assert.deepEqual(listenButton(channel.state,"s1"),{playing:true,label:"Stop reading",part:0});
  assert.equal(listenButton(channel.state,"s2").playing,false);
  assert.equal(ambientVolumeFor(channel.state),AMBIENT_VOLUME/3);
  release();await new Promise(r=>setTimeout(r,0));
  assert.equal(channel.state.part,2);
  assert.deepEqual(heard,["file p1.mp3","speech text p2","file p3.mp3"]);
  // Pressing Stop reading stops it at once, and the button goes back to Listen.
  channel.stop();await done;
  assert.deepEqual(listenButton(channel.state,"s1"),{playing:false,label:"Listen to the scene",part:-1});
  assert.equal(ambientVolumeFor(channel.state),AMBIENT_VOLUME);
  assert.equal(heard.length,3);
});

async function storyFor(id:string){
  const {parseSourcePassages,readingPortions}=await import("../lib/source-passages.ts");
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
  const passages=parseSourcePassages(await readFile(new URL(`../worlds/${id}/source.md`,import.meta.url),"utf8"));
  return {world,passages,portions:readingPortions(passages,world.scenes)};
}

test("storyboard: pages map to the scene whose reading holds their first paragraph, at most 3 frames and 1 required per scene", async()=>{
  const {pagesByScene,sceneFrames}=await import("../lib/storyboard.ts");
  for(const id of ["sleepy-hollow","trifles","tell-tale-heart"]){
    const {world,passages,portions}=await storyFor(id);
    const byScene=pagesByScene(world,passages),seen=new Set<string>();
    world.scenes.forEach((scene,i)=>{
      const ids=new Set(portions[i].map(p=>p.id));
      for(const p of byScene[i]){assert.ok(ids.has(p.start),`${id}/${p.id} is not in ${scene.id}`);assert.ok(!seen.has(p.id),`${id}/${p.id} is in two scenes`);seen.add(p.id)}
      const frames=sceneFrames(world,passages,i);
      assert.ok(frames.length<=3,`${id}/${scene.id} shows ${frames.length} frames`);
      assert.ok(frames.filter(f=>f.required).length<=1);
      assert.ok(frames.every(f=>byScene[i].includes(f.page)&&!f.page.bridge));
      // Story order.
      const order=frames.map(f=>byScene[i].indexOf(f.page));assert.deepEqual(order,[...order].sort((a,b)=>a-b));
    });
    // Every story picture the strip shows has been generated.
    for(const i of world.scenes.keys())for(const f of sceneFrames(world,passages,i))if(f.kind!=="student"){assert.ok(f.picture,`${id}/${f.page.id} has no picture`);await readFile(new URL(`../public${f.picture}`,import.meta.url))}
  }
  const {world,passages}=await storyFor("sleepy-hollow");
  assert.deepEqual(sceneFrames(world,passages,0).map(f=>`${f.page.id}:${f.kind}${f.required?"*":""}`),["page-01:provided","page-04:add_detail","page-06:add_detail*"]);
  // The Tell-Tale Heart has no reading ranges: its pages are split across its 4 scenes in story order.
  const tth=await storyFor("tell-tale-heart");
  assert.ok(tth.world.scenes.every(s=>!s.reading));
  assert.deepEqual(pagesByScene(tth.world,tth.passages).map(l=>l.map(p=>p.id)[0]),["page-01","page-06","page-10","page-15"]);
});

test("storyboard: a scene is solved when its clues are proven and its required frame is saved, with or without a picture", async()=>{
  const {sceneFrames,sceneSolved,missionText,makeSavedFrame,storyboardSoFar}=await import("../lib/storyboard.ts");
  const {world,passages}=await storyFor("sleepy-hollow");
  const frames=sceneFrames(world,passages,0);
  assert.equal(missionText(4,frames),"Prove all 4 clues and complete 1 frame.");
  assert.equal(sceneSolved(true,frames,{}),false);
  assert.equal(sceneSolved(false,frames,{"sleepy-hollow:page-06":makeSavedFrame("add_detail","a line","A thin ray of light.")}),false);
  // Save without a picture: the frame still counts.
  const saved={"sleepy-hollow:page-06":makeSavedFrame("add_detail","With what wistful look did he eye every trembling ray of light","A thin, shaky ray of light crosses the fields.")};
  assert.equal(saved["sleepy-hollow:page-06"].image,undefined);
  assert.equal(sceneSolved(true,frames,saved),true);
  // An optional frame does not solve the scene on its own.
  assert.equal(sceneSolved(true,frames,{"sleepy-hollow:page-04":makeSavedFrame("add_detail","a line","A twisted branch in the door.")}),false);
  // A scene with no required frame needs only its clues.
  const tth=await storyFor("tell-tale-heart");
  const search=sceneFrames(tth.world,tth.passages,1);
  assert.ok(!search.some(f=>f.required));
  assert.equal(sceneSolved(true,search,undefined),true);
  assert.equal(missionText(4,search),"Prove all 4 clues to solve this scene.");
  // The board shows the story's pictures for reached scenes and the student's saved frame (with the story's picture
  // for an add-detail frame saved without one).
  const board=storyboardSoFar(world,passages,saved,0);
  assert.deepEqual(board.map(f=>[f.pageId,f.mine,!!f.picture]),[["page-01",false,true],["page-06",true,true]]);
});

test("storyboard: older saves without frames still load and play", async()=>{
  const {StudentProgressSchema}=await import("../lib/classroom/progress.ts");
  const {sceneFrames,sceneSolved,storyboardSoFar}=await import("../lib/storyboard.ts");
  const older={v:1,worldId:"sleepy-hollow",scene:1,submitted:false,readerProgress:{},artifactAnswers:{},savedTextEvidence:[],updatedAt:"2026-10-01T12:00:00.000Z"};
  const parsed=StudentProgressSchema.parse(older);
  assert.deepEqual(parsed.storyFrames,{});
  // A frame saved by the old storybook reader (no picture, no check) still counts.
  const withOldFrame=StudentProgressSchema.parse({...older,storyFrames:{"sleepy-hollow:page-06":{kind:"add_detail",description:"A ray of light.",quote:"every trembling ray of light",saved_at:"2026-10-01T12:00:00.000Z"}}});
  const {world,passages}=await storyFor("sleepy-hollow");
  assert.equal(sceneSolved(true,sceneFrames(world,passages,0),withOldFrame.storyFrames),true);
  assert.deepEqual(storyboardSoFar(world,passages,undefined,0).map(f=>f.pageId),["page-01"]);
});

test("frame caps: 6 pictures per device a day, 2 attempts per frame, and an image ceiling inside the global ceiling", async()=>{
  const {limits,usageCall,imageCeiling,globalCeiling}=await import("../lib/demo-limits.ts");
  assert.deepEqual(limits.frame_image,{sandbox:2,device:6});
  assert.ok(limits.frame_check.device>=limits.frame_check.sandbox);
  const image=usageCall("frame_image","sandbox-1","device-1","sleepy-hollow:page-06");
  assert.equal(image.fn,"consume_demo_ai_capped");
  assert.equal(image.args.p_sandbox,"sandbox-1:sleepy-hollow:page-06");
  assert.equal(image.args.p_device_limit,6);assert.equal(image.args.p_sandbox_limit,2);
  assert.ok("p_kind_global_limit" in image.args&&image.args.p_kind_global_limit<=globalCeiling());
  const check=usageCall("frame_check","sandbox-1","device-1");
  assert.equal(check.fn,"consume_demo_ai");assert.equal(check.args.p_sandbox,"sandbox-1");assert.equal(check.args.p_kind,"frame_check");
  const before={a:process.env.DEMO_DAILY_AI_CEILING,i:process.env.DEMO_DAILY_IMAGE_CEILING};
  try{process.env.DEMO_DAILY_AI_CEILING="100";process.env.DEMO_DAILY_IMAGE_CEILING="500";assert.equal(imageCeiling(),100)}
  finally{for(const [k,v] of [["DEMO_DAILY_AI_CEILING",before.a],["DEMO_DAILY_IMAGE_CEILING",before.i]] as const){if(v===undefined)delete process.env[k];else process.env[k]=v}}
});

test("frame pictures: a flagged description is never painted; writing-only pages never get a picture", async()=>{
  const {pictureForFrame,OFF_STORY_MESSAGE}=await import("../lib/frames-server.ts");
  let painted=0,counted=0;
  const deps=(flagged:boolean|"error")=>({moderate:async()=>{if(flagged==="error")throw new Error("down");return flagged},allow:async()=>{counted++;return true},paint:async()=>{painted++;return "https://example.test/frame.webp"}});
  const page={mode:"student"};
  assert.deepEqual(await pictureForFrame(page,"Ichabod rides past the church at midnight.",deps(true)),{image:null,blocked:true,message:OFF_STORY_MESSAGE});
  assert.equal((await pictureForFrame(page,"Ichabod rides past the church at midnight.",deps("error"))).image,null);
  // The app's own safety screen stops it too, before moderation is asked.
  assert.equal((await pictureForFrame(page,"what is your phone number",deps(false))).blocked,true);
  assert.equal(painted,0);assert.equal(counted,0);
  assert.equal((await pictureForFrame({mode:"student",no_generation:true},"A cold, gloomy kitchen.",deps(false))).image,null);
  assert.equal(painted,0);
  assert.equal((await pictureForFrame(page,"Ichabod rides past the church at midnight.",deps(false))).image,"https://example.test/frame.webp");
  assert.equal(painted,1);
});
