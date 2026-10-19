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
  // Amara proved four characters wrong, two of them by catching a Spot the Lie testimony.
  assert.equal(row("Amara").provedWrong,4);assert.equal(row("Ella").cells["shadowy-rider"].finding,"proved-wrong");
  assert.equal(e.summary.provedWrongStudents,5);
  // The party scene has one character to question, so the line names him; the road home has two.
  const party=e.scenes.find(s=>s.id==="van-tassel-party"),road=e.scenes.find(s=>s.id==="the-road-home");
  assert.equal(findingSentence("proved-wrong",party),"This line proved Brom Bones wrong.");
  assert.equal(findingSentence("proved-wrong",road),"This line proved the character they questioned wrong.");
  // Needs help: saved progress but nothing proven. A student who never saved progress has not started.
  assert.equal(row("Hugo").needsHelp,true);assert.equal(row("Half").needsHelp,true);
  assert.equal(row("New").needsHelp,false);assert.equal(row("New").started,false);assert.equal(row("Amara").needsHelp,false);
  assert.equal(e.summary.needsHelp,2);
  // Spreadsheet: one row per student and clue, plus one Final Verdict row per student, with commas and quotes escaped.
  const csv=evidenceCsv(e).split("\r\n");
  assert.equal(csv.length,1+10*16+10);
  assert.match(csv[0],/^Student,Scene,Clue,Proven,Line from the story,Student explanation,Character check,Lie caught$/);
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
    // <scene>-ambient.mp3, or -vN.mp3 once a track has been regenerated (a new name, so no cache keeps the old one).
    for(const s of world.scenes){assert.match(s.ambient_audio??"",new RegExp(`^/worlds/${id}/${s.id}-ambient(-v\\d+)?\\.mp3$`));await readFile(new URL(`../public${s.ambient_audio}`,import.meta.url))}
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
  assert.equal(cards.filter(c=>c.factCheck).length,4,"two caught lies and two other characters proved wrong");
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

test("narration reads exactly the reading panel's paragraphs (and content notes) for every scene, one file per part", async()=>{
  const {sceneReading,sceneReadingItems,narrationParts}=await import("../lib/narration.ts");
  const {parseSourcePassages}=await import("../lib/source-passages.ts");
  for(const id of ["sleepy-hollow","trifles","tell-tale-heart"]){
    const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
    const passages=parseSourcePassages(await readFile(new URL(`../worlds/${id}/source.md`,import.meta.url),"utf8"));
    for(const scene of world.scenes){
      const panel=sceneReadingItems(world,scene,passages),parts=narrationParts(world,scene,passages);
      assert.ok(panel.length>0,`${id}/${scene.id} has no reading`);
      assert.deepEqual(panel.filter(i=>i.kind==="passage").map(i=>i.id),sceneReading(passages,scene).map(p=>p.id));
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

test("content notes: every flagged paragraph shown in a scene, clue or frame has its note directly before it", async()=>{
  const {contentNotes,withContentNotes}=await import("../lib/content-notes.ts");
  const {sceneReadingItems,narrationParts}=await import("../lib/narration.ts");
  const {pagePassages}=await import("../lib/storybook.ts");
  const {parseSourcePassages}=await import("../lib/source-passages.ts");
  let flaggedShown=0;
  for(const id of ["sleepy-hollow","trifles","tell-tale-heart"]){
    const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
    const passages=parseSourcePassages(await readFile(new URL(`../worlds/${id}/source.md`,import.meta.url),"utf8"));
    const notes=contentNotes(world);
    // A flagged paragraph's note is either directly before it or before the flagged paragraph just ahead of it under the same note.
    const check=(items:ReturnType<typeof withContentNotes>,where:string)=>items.forEach((item,i)=>{
      if(item.kind!=="passage"||!notes.has(item.id))return;
      flaggedShown++;
      let j=i-1;while(j>=0&&items[j].kind==="passage"&&notes.get(items[j].id)===notes.get(item.id))j--;
      const before=items[j];
      assert.ok(before?.kind==="note"&&before.text===notes.get(item.id),`${where}: ${item.id} has no content note before it`);
    });
    for(const scene of world.scenes){
      const items=sceneReadingItems(world,scene,passages);
      check(items,`${id}/${scene.id} reading`);
      // Narration reads the note first, then the paragraph.
      const parts=narrationParts(world,scene,passages);
      for(const [i,item] of items.entries())if(item.kind==="note")assert.equal(parts[i+1].id,item.before);
      for(const clue of scene.artifacts)check(withContentNotes(passages.filter(p=>clue.source_anchor.includes(p.id)),notes),`${id}/${clue.id} clue`);
    }
    for(const page of world.storybook?.pages??[])check(withContentNotes(pagePassages(passages,page),notes),`${id}/${page.id} frame`);
  }
  assert.ok(flaggedShown>0);
  // Sleepy Hollow flags ¶34, ¶47 and ¶48; scene 2's reading shows ¶48 with its note.
  const sh=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8")));
  assert.deepEqual([...contentNotes(sh).keys()].sort(),["p034","p047","p048"]);
  const shPassages=parseSourcePassages(await readFile(new URL("../worlds/sleepy-hollow/source.md",import.meta.url),"utf8"));
  const scene2=sceneReadingItems(sh,sh.scenes[1],shPassages).map(i=>i.id);
  assert.equal(scene2[scene2.indexOf("p048")-1],"note-p048");
  // ¶47 and ¶48 together share one note.
  assert.deepEqual(withContentNotes(shPassages.filter(p=>["p046","p047","p048"].includes(p.id)),contentNotes(sh)).map(i=>i.id),["p046","note-p047","p047","p048"]);
});

// A fake ambient engine and clock: counts live tracks and records every fade, so the tests can follow the sound.
async function ambientRig(){
  const {createAmbientController}=await import("../lib/ambient.ts");
  let now=0;const timers:{at:number;fn:()=>void;id:number}[]=[];let nextId=1;
  const clock={after:(ms:number,fn:()=>void)=>{const id=nextId++;timers.push({at:now+ms,fn,id});return id},cancel:(h:unknown)=>{const i=timers.findIndex(t=>t.id===h);if(i>=0)timers.splice(i,1)}};
  const tick=(ms:number)=>{now+=ms;for(let t=timers.filter(t=>t.at<=now).sort((a,b)=>a.at-b.at)[0];t;t=timers.filter(t=>t.at<=now).sort((a,b)=>a.at-b.at)[0]){timers.splice(timers.indexOf(t),1);t.fn()}};
  const live=new Set<{src:string}>();let started=0,maxLive=0;const fades:{src:string;volume:number;seconds:number}[]=[];
  const engine={start(src:string){started++;const track={src,fade(volume:number,seconds:number){fades.push({src,volume,seconds})},stop(){live.delete(track)}};live.add(track);maxLive=Math.max(maxLive,live.size);return track}};
  const c=createAmbientController(engine,clock);
  return {c,tick,live,fades,get started(){return started},get maxLive(){return maxLive}};
}

test("ambient sound: fades out over half a second and stops on every screen change that hides the scene", async()=>{
  const {sceneScreenShowing,AMBIENT_VOLUME}=await import("../lib/ambient.ts");
  const scene={inCase:true,clueOpen:false,frameOpen:false,boardOpen:false,consequence:false};
  const changes:Record<string,(s:typeof scene)=>typeof scene>={
    "opens a clue":s=>({...s,clueOpen:true}),
    "opens the case board":s=>({...s,boardOpen:true}),
    "opens a storyboard frame":s=>({...s,frameOpen:true}),
    "sees a choice consequence":s=>({...s,consequence:true}),
    "leaves the case":s=>({...s,inCase:false}),
  };
  for(const [what,change] of Object.entries(changes)){
    const r=await ambientRig();
    r.c.set({src:"/a.mp3",on:true,unlocked:true,visible:true,showing:sceneScreenShowing(scene)});
    assert.equal(r.live.size,1,what);
    assert.deepEqual(r.fades.at(-1),{src:"/a.mp3",volume:AMBIENT_VOLUME,seconds:2.5});
    r.c.set({showing:sceneScreenShowing(change(scene))});
    assert.deepEqual(r.fades.at(-1),{src:"/a.mp3",volume:0,seconds:0.5},what);
    assert.equal(r.live.size,1,`${what}: still fading`);
    r.tick(500);
    assert.equal(r.live.size,0,`${what}: stopped completely`);
    assert.equal(r.c.track,null);
  }
  // Switching to another browser tab.
  const r=await ambientRig();
  r.c.set({src:"/a.mp3",on:true,unlocked:true,showing:true});
  r.c.set({visible:false});r.tick(500);
  assert.equal(r.live.size,0);
  // Sound off stops it too; and nothing plays before the student's first tap.
  const q=await ambientRig();
  q.c.set({src:"/a.mp3",on:true,showing:true});assert.equal(q.started,0);
  q.c.set({unlocked:true});assert.equal(q.live.size,1);
  q.c.set({on:false});q.tick(500);assert.equal(q.live.size,0);
});

test("ambient sound: comes back on return, dips for narration, and never plays two tracks", async()=>{
  const {AMBIENT_VOLUME}=await import("../lib/ambient.ts");
  const r=await ambientRig();
  r.c.set({src:"/a.mp3",on:true,unlocked:true,showing:true});
  // Clue opened and closed: the track stops, then a fresh one fades back in.
  r.c.set({showing:false});r.tick(500);assert.equal(r.live.size,0);
  r.c.set({showing:true});
  assert.equal(r.live.size,1);assert.equal(r.started,2);
  assert.deepEqual(r.fades.at(-1),{src:"/a.mp3",volume:AMBIENT_VOLUME,seconds:2.5});
  // Back before the fade-out finished: the same track comes back up; no second copy.
  r.c.set({showing:false});r.tick(200);r.c.set({showing:true});r.tick(1000);
  assert.equal(r.started,2);assert.equal(r.live.size,1);
  assert.deepEqual(r.fades.at(-1),{src:"/a.mp3",volume:AMBIENT_VOLUME,seconds:1});
  // Narration dips to a third and back.
  r.c.set({narrating:true});assert.equal(r.fades.at(-1)!.volume,AMBIENT_VOLUME/3);
  r.c.set({narrating:false});assert.equal(r.fades.at(-1)!.volume,AMBIENT_VOLUME);
  // Toggling the scene screen quickly many times (and React's double mount) never stacks tracks.
  for(let i=0;i<20;i++){r.c.set({showing:i%2===0?false:true});r.tick(i%3===0?600:100)}
  r.c.set({showing:true});r.tick(1000);
  // The next scene's track starts only after this one has stopped.
  r.c.set({src:"/b.mp3"});
  assert.equal(r.live.size,1);assert.equal([...r.live][0].src,"/a.mp3");
  r.tick(500);
  assert.equal(r.live.size,1);assert.equal([...r.live][0].src,"/b.mp3");
  assert.equal(r.maxLive,1);
});

test("Next step: the button points to the next thing to do in every state of a scene", async()=>{
  const {nextStep}=await import("../lib/next-step.ts");
  const names=["The empty schoolhouse","Ichabod's belongings","Ichabod's own books and the unfinished poem","The searchers' report"];
  const clues=(done:number,lockedFrom=99)=>names.map((name,i)=>({id:`c${i+1}`,name,done:i<done,locked:i>=lockedFrom&&i>=done}));
  const frame=(saved:boolean)=>({key:"sleepy-hollow:page-06",saved});
  const base={last:false,hasChoice:true,choicePrompt:"The trail leads back to the night before. Where do you begin?"};
  // No clues proven.
  let s=nextStep({...base,clues:clues(0),requiredFrame:frame(false)});
  assert.equal(s.progress,"Clues 0 of 4 · Frame 0 of 1");
  assert.deepEqual(s.action,{kind:"clue",clueId:"c1",number:1,label:"Open Clue 1: The empty schoolhouse"});
  // Some proven.
  s=nextStep({...base,clues:clues(1),requiredFrame:frame(false)});
  assert.equal(s.progress,"Clues 1 of 4 · Frame 0 of 1");
  assert.equal(s.action.label,"Open Clue 2: Ichabod's belongings");
  // A locked clue is skipped while an open one waits.
  s=nextStep({...base,clues:clues(1).map((c,i)=>i===1?{...c,locked:true}:c),requiredFrame:frame(false)});
  assert.equal(s.action.kind==="clue"&&s.action.clueId,"c3");
  // All proven, frame missing.
  s=nextStep({...base,clues:clues(4),requiredFrame:frame(false)});
  assert.equal(s.progress,"Clues 4 of 4 · Frame 0 of 1");
  assert.deepEqual(s.action,{kind:"frame",frameKey:"sleepy-hollow:page-06",label:"Complete your frame"});
  assert.equal(s.solved,false);
  // Scene solved: the scene's choice, or the next scene.
  s=nextStep({...base,clues:clues(4),requiredFrame:frame(true)});
  assert.equal(s.progress,"Clues 4 of 4 · Frame 1 of 1");
  assert.deepEqual(s.action,{kind:"choice",label:base.choicePrompt});
  assert.equal(s.solved,true);
  assert.deepEqual(nextStep({...base,hasChoice:false,clues:clues(4),requiredFrame:frame(true)}).action,{kind:"next",label:"Next scene"});
  // A scene without a required frame needs only its clues, and the line leaves the frame out.
  s=nextStep({...base,hasChoice:false,clues:clues(4)});
  assert.equal(s.progress,"Clues 4 of 4");assert.equal(s.action.kind,"next");
  // Last scene solved.
  assert.deepEqual(nextStep({...base,last:true,clues:clues(4),requiredFrame:frame(true)}).action,{kind:"close",label:"Close the case"});
});

test("scene 1 ambient: Sleepy Hollow's schoolhouse plays the busy-classroom track, never the old creaking one", async()=>{
  const {existsSync}=await import("node:fs");
  for(const dir of ["worlds","public/worlds"]){
    const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../${dir}/sleepy-hollow/world.json`,import.meta.url),"utf8")));
    assert.equal(world.scenes[0].id,"empty-schoolhouse");
    assert.equal(world.scenes[0].ambient_audio,"/worlds/sleepy-hollow/empty-schoolhouse-ambient-v2.mp3",`${dir} still points at an old track`);
  }
  assert.ok(existsSync(new URL("../public/worlds/sleepy-hollow/empty-schoolhouse-ambient-v2.mp3",import.meta.url)));
  // The wind-and-creaking track is gone, so no page or cache can fetch it by its old name.
  assert.equal(existsSync(new URL("../public/worlds/sleepy-hollow/empty-schoolhouse-ambient.mp3",import.meta.url)),false);
  const script=await readFile(new URL("../scripts/generate-assets.ts",import.meta.url),"utf8");
  assert.match(script,/"sleepy-hollow\/empty-schoolhouse":"A busy one-room schoolhouse in 1790s rural New York/);
});

test("character voice: the reply button plays, stops, never double-plays, and stops on leave, new question or switch", async()=>{
  const {createSoundChannel}=await import("../lib/sound-channel.ts");
  const {voiceButton,toggleVoice,stopVoice}=await import("../lib/voice-control.ts");
  const channel=createSoundChannel();let started=0,halted=0;
  const play=(id:string)=>()=>{started++;channel.begin("voice",id,()=>{halted++})};
  assert.deepEqual(voiceButton(channel.state,"brom-bones","Brom Bones"),{playing:false,label:"Play",aria:"Hear Brom Bones say it again"});
  // Play.
  assert.equal(toggleVoice(channel,"brom-bones",play("brom-bones")),"playing");
  assert.deepEqual(voiceButton(channel.state,"brom-bones","Brom Bones"),{playing:true,label:"Stop",aria:"Stop voice"});
  // Tapping again while it plays stops it at once, and never starts a second copy.
  assert.equal(toggleVoice(channel,"brom-bones",play("brom-bones")),"stopped");
  assert.equal(started,1);assert.equal(halted,1);assert.equal(channel.state.kind,null);
  // A new reply (another character) stops the old one: only one voice at a time.
  toggleVoice(channel,"brom-bones",play("brom-bones"));
  toggleVoice(channel,"hans-van-ripper",play("hans-van-ripper"));
  assert.equal(halted,2);assert.equal(channel.state.id,"hans-van-ripper");
  assert.equal(voiceButton(channel.state,"brom-bones","Brom Bones").playing,false);
  // Leaving the clue screen, asking a new question and switching characters each stop it.
  for(const why of ["leave","new-question","switch-character"] as const){
    toggleVoice(channel,"brom-bones",play("brom-bones"));
    stopVoice(channel,why);
    assert.equal(channel.state.kind,null,why);
  }
  // Story narration takes the shared channel, so it stops a voice too; a voice stop never stops narration.
  toggleVoice(channel,"brom-bones",play("brom-bones"));
  channel.begin("narration","empty-schoolhouse",()=>{});
  assert.equal(channel.state.kind,"narration");
  stopVoice(channel,"leave");
  assert.equal(channel.state.kind,"narration");
});

async function storyWorld(id:string){
  const {parseSourcePassages}=await import("../lib/source-passages.ts");
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
  const passages=parseSourcePassages(await readFile(new URL(`../worlds/${id}/source.md`,import.meta.url),"utf8"));
  return {world,passages};
}

test("Spot the Lie: every scene's lie passes validation, and broken lies are caught", async()=>{
  const {lieProblems}=await import("../lib/lies.ts");
  for(const id of ["sleepy-hollow","trifles","tell-tale-heart"]){
    const {world,passages}=await storyWorld(id);
    assert.equal(world.scenes.filter(s=>s.lie).length,4,`${id} needs a lie in every scene`);
    assert.deepEqual(lieProblems(world,passages),[],id);
    assert.equal(world.verdict?.theories.length,3);
  }
  const {world,passages}=await storyWorld("sleepy-hollow");
  const broken=(change:(l:NonNullable<typeof world.scenes[0]["lie"]>)=>void)=>{const w=structuredClone(world);change(w.scenes[0].lie!);return lieProblems(w,passages).join(" | ")};
  assert.match(broken(l=>{l.truth_line="The pitch-pipe was shiny and new."}),/does not appear word for word/);
  assert.match(broken(l=>{l.false_claim="Something he never said."}),/false_claim does not appear/);
  assert.match(broken(l=>{l.truth_paragraph="p068"}),/not one of the clue's evidence paragraphs/);
  assert.match(broken(l=>{l.character_id="katrina"}),/not available in this scene/);
  assert.match(broken(l=>{l.testimony=l.false_claim}),/needs 2 to 3/);
  // A paragraph with a content note can never hold a lie's answer.
  const w=structuredClone(world);const party=w.scenes[1];party.lie={...party.lie!,clue_id:"broms-corner",truth_paragraph:"p048",truth_line:"Ichabod prided himself upon his dancing as much as upon his vocal powers."};
  assert.match(lieProblems(w,passages).join(" | "),/content note/);
});

test("Spot the Lie: the right line catches it; a wrong line names the topic; two misses highlight the paragraph", async()=>{
  const {tryLine,testimonyParts,isTruthLine}=await import("../lib/lies.ts");
  const {world}=await storyWorld("sleepy-hollow");
  const lie=world.scenes[0].lie!;
  assert.equal(lie.character_id,"hans-van-ripper");
  let r=tryLine(lie,"The brook was searched, but the body of the schoolmaster was not to be discovered.",0);
  assert.deepEqual(r,{result:"miss",misses:1,message:"Not quite. Look for a line about what was in Ichabod's bundle."});
  r=tryLine(lie,"Hans Van Ripper as executor of his estate, examined the bundle which contained all his worldly effects.",r.misses);
  assert.equal(r.result,"miss");
  assert.deepEqual(r.result==="miss"&&r.highlight,{paragraph:"p069"},"without the clue evidence, the paragraph is highlighted");
  // The line as the clue screen shows it, with the source's line breaks, still matches.
  const tapped="They consisted of two shirts and a half; two stocks for the neck; a pair or\ntwo of worsted stockings; an old pair of corduroy small-clothes; a rusty\nrazor; a book of psalm tunes full of dog's-ears; and a broken pitch-pipe.";
  assert.equal(isTruthLine(lie,tapped),true);
  assert.deepEqual(tryLine(lie,tapped,2),{result:"caught",misses:2});
  // Caught: the false sentence is the one struck through.
  assert.deepEqual(testimonyParts(lie).filter(p=>p.false).map(p=>p.text),[lie.false_claim]);
});

test("Spot the Lie: a caught lie counts as proving the character wrong (Fact Checker) and shows in the Evidence view", async()=>{
  const {caseBoardCards}=await import("../lib/game-feel.ts");
  const {buildEvidence}=await import("../lib/classroom/evidence.ts");
  const {world}=await storyWorld("sleepy-hollow");
  const lie=world.scenes[0].lie!;
  // What the clue screen saves after a catch: the truth line, "contradicts", and the character who testified.
  const answers={[lie.clue_id]:{notice:lie.truth_line,interpret:"Hans said it was new, but it was broken.",craft:"contradicts",character:lie.character_id}};
  const card=caseBoardCards(world,answers)[0];
  assert.equal(card.factCheck,true);assert.equal(card.character,"Hans Van Ripper");
  const e=buildEvidence(world,[{id:"a",nickname:"Ava",answers,lies:{[world.scenes[0].id]:{clue_id:lie.clue_id,caught:true}}},{id:"b",nickname:"Bo",answers:{},lies:null}],7);
  assert.equal(e.students[0].provedWrong,1);
  assert.equal(e.students[0].liesCaught["empty-schoolhouse"],true);
  assert.equal(e.students[1].liesCaught["empty-schoolhouse"],false);
  assert.deepEqual(e.scenes[0].lie,{clueId:"ichabods-belongings",character:"Hans Van Ripper"});
  assert.deepEqual(e.verdict?.standards,["Florida B.E.S.T. ELA.K12.EE.1.1: cite evidence to explain and justify reasoning","Florida B.E.S.T. ELA.7.C.1.4: argumentative writing"]);
});

test("Final Verdict: exactly 3 pinned clues, a theory, and 2 to 4 sentences are required; one revision", async()=>{
  const {togglePin,canSubmit,verdictProblems,canRevise}=await import("../lib/verdict.ts");
  let pins:string[]=[];
  for(const id of ["a","b","c","d"])pins=togglePin(pins,id);
  assert.deepEqual(pins,["a","b","c"],"a fourth pin is refused");
  assert.deepEqual(togglePin(pins,"b"),["a","c"]);
  const argument="I believe Brom did it because he wanted Katrina. The strongest evidence is his prank on the schoolhouse.";
  assert.equal(canSubmit({theoryId:"brom-prank",pinned:pins,argument}),true);
  assert.equal(canSubmit({theoryId:"brom-prank",pinned:["a","b"],argument}),false);
  assert.match(verdictProblems({theoryId:"brom-prank",pinned:["a","b"],argument}).join(" "),/exactly 3/);
  assert.equal(canSubmit({theoryId:"",pinned:pins,argument}),false);
  assert.equal(canSubmit({theoryId:"x",pinned:pins,argument:"Too short."}),false);
  assert.equal(canSubmit({theoryId:"x",pinned:pins,argument:"One. Two. Three. Four. Five."}),false);
  const saved={world_id:"sleepy-hollow",theory_id:"brom-prank",pinned:[],argument,feedback:null,submissions:1,saved_at:""};
  assert.equal(canRevise(saved),true);assert.equal(canRevise({...saved,submissions:2}),false);
});

test("Final Verdict: 4 judge calls per device a day, and a saved verdict when the judge is unavailable", async()=>{
  const {limits,usageCall}=await import("../lib/demo-limits.ts");
  const {judgeVerdict,SAVED_WITHOUT_FEEDBACK,VERDICT_OFF_STORY}=await import("../lib/verdict.ts");
  assert.equal(limits.verdict.device,4);
  assert.equal(usageCall("verdict","sb","dev").args.p_device_limit,4);
  const feedback={strength:"Solid" as const,strength_note:"You used the saddle.",next_step:"Explain the pumpkin."};
  let judged=0;
  const deps=(screen:"ok"|"flagged"|"unavailable",allow=true,ok=true)=>({screen:async()=>screen,allow:async()=>allow,judge:async()=>{judged++;if(!ok)throw new Error("down");return feedback}});
  assert.deepEqual(await judgeVerdict("arg",deps("ok")),{status:"judged",feedback});
  // Moderation runs first: a flagged argument is never judged.
  assert.deepEqual(await judgeVerdict("arg",deps("flagged")),{status:"flagged",message:VERDICT_OFF_STORY});
  // Unavailable judge, cap reached, or no safety check: saved without feedback, never an error.
  for(const d of [deps("ok",true,false),deps("ok",false),deps("unavailable")])assert.deepEqual(await judgeVerdict("arg",d),{status:"saved",message:SAVED_WITHOUT_FEEDBACK});
  assert.equal(judged,2);
});

test("Final Verdict: older saves without lies or a verdict still load; the Next step offers the verdict before closing", async()=>{
  const {StudentProgressSchema}=await import("../lib/classroom/progress.ts");
  const {nextStep}=await import("../lib/next-step.ts");
  const {buildEvidence}=await import("../lib/classroom/evidence.ts");
  const older={v:1,worldId:"sleepy-hollow",scene:3,submitted:false,readerProgress:{},artifactAnswers:{},savedTextEvidence:[],storyFrames:{},updatedAt:"2026-10-01T12:00:00.000Z"};
  const p=StudentProgressSchema.parse(older);
  assert.equal(p.lies,undefined);assert.equal(p.verdict,undefined);
  const withNew=StudentProgressSchema.parse({...older,lies:{"empty-schoolhouse":{clue_id:"ichabods-belongings",caught:true,misses:1}},verdict:{world_id:"sleepy-hollow",theory_id:"ran-away",pinned:[1,2,3].map(i=>({clue_id:`c${i}`,quote:"q"})),argument:"a. b.",feedback:null,submissions:1,saved_at:"x"}});
  assert.equal(withNew.verdict?.theory_id,"ran-away");
  assert.throws(()=>StudentProgressSchema.parse({...older,verdict:{...withNew.verdict!,pinned:withNew.verdict!.pinned.slice(0,2)}}));
  const clues=[{id:"c1",name:"One",done:true,locked:false}];
  assert.deepEqual(nextStep({clues,last:true,hasChoice:false,verdict:{done:false}}).action,{kind:"verdict",label:"Final verdict"});
  assert.deepEqual(nextStep({clues,last:true,hasChoice:false,verdict:{done:true}}).action,{kind:"close",label:"Close the case"});
  assert.deepEqual(nextStep({clues,last:true,hasChoice:false}).action,{kind:"close",label:"Close the case"});
  // The Evidence view: theory and case strength, the pinned quotes and the argument; another story's verdict is ignored.
  const {world}=await storyWorld("sleepy-hollow");
  const e=buildEvidence(world,[{id:"a",nickname:"Ava",answers:{},verdict:{world_id:"sleepy-hollow",theory_id:"brom-prank",pinned:[{clue_id:"broms-corner",quote:"They harried his hitherto peaceful domains"}],argument:"Brom did it.",feedback:{strength:"Strong"}}},{id:"b",nickname:"Bo",answers:{},verdict:{world_id:"trifles",theory_id:"brom-prank"}}]);
  assert.deepEqual(e.students[0].verdict,{theory:"Brom's prank",strength:"Strong",pinned:[{clue:"Brom Bones, the brooding rival",quote:"They harried his hitherto peaceful domains"}],argument:"Brom did it."});
  assert.equal(e.students[1].verdict,null);
});

test("sample class: realistic lies caught and verdicts in the Evidence view", async()=>{
  const {buildEvidence,evidenceCsv}=await import("../lib/classroom/evidence.ts");
  const {sampleEvidenceStudents,sampleEvidenceClass}=await import("../lib/sample-classroom.ts");
  const {world}=await storyWorld("sleepy-hollow");
  const e=buildEvidence(world,sampleEvidenceStudents.map((s,i)=>({id:`s${i}`,nickname:s.nickname,answers:s.answers,lies:s.lies,verdict:s.verdict})),sampleEvidenceClass.grade);
  const row=(n:string)=>e.students.find(s=>s.nickname===n)!;
  assert.equal(Object.values(row("Amara").liesCaught).filter(Boolean).length,3);
  assert.equal(row("Amara").verdict?.strength,"Strong");
  assert.equal(row("Carmen").verdict?.strength,"Needs more evidence");
  assert.equal(row("Hugo").verdict,null);
  // Every pinned sample quote is one of the clues that student proved.
  for(const s of sampleEvidenceStudents)for(const p of s.verdict?.pinned??[])assert.ok(p.quote&&s.answers?.[p.clue_id]?.notice===p.quote,`${s.nickname} pinned ${p.clue_id}`);
  // A caught sample lie quotes the story's line exactly.
  const {isTruthLine}=await import("../lib/lies.ts");
  for(const s of sampleEvidenceStudents)for(const [sceneId,l] of Object.entries(s.lies??{}))if(l.caught){const lie=world.scenes.find(x=>x.id===sceneId)!.lie!;assert.ok(isTruthLine(lie,s.answers![l.clue_id].notice),`${s.nickname} ${sceneId}`)}
  assert.ok(evidenceCsv(e).split("\r\n").some(l=>l.startsWith("Amara,Final verdict,Brom's prank,Strong,")));
});

test("Final Verdict: the case strength comes from the rubric, checked against the student's own words", async()=>{
  const {strengthFromRubric,feedbackFromJudge}=await import("../lib/verdict.ts");
  assert.equal(strengthFromRubric({claim:true,evidence:true,reasoning:true}),"Strong");
  assert.equal(strengthFromRubric({claim:true,evidence:true,reasoning:false}),"Solid");
  assert.equal(strengthFromRubric({claim:true,evidence:false,reasoning:false}),"Needs more evidence");
  const notes={strength_note:"You stated your theory.",next_step:"Say what the quote shows."};
  const weak="I think Ichabod ran away. Katrina turned him down.";
  const strong="I believe Ichabod ran away on his own. He left Katrina's house looking desolate and chapfallen, which shows he had a reason to leave.";
  // Reasoning words must really be in the argument, be more than a restated claim, and run at least six words.
  assert.equal(feedbackFromJudge({claim:true,supporting_quotes:[1,2],reasoning_words:"Katrina turned him down",...notes},weak)?.strength,"Solid");
  assert.equal(feedbackFromJudge({claim:true,supporting_quotes:[1,2],reasoning_words:"I think Ichabod ran away",...notes},weak)?.strength,"Solid");
  assert.equal(feedbackFromJudge({claim:true,supporting_quotes:[1,2],reasoning_words:"he left because the evidence clearly proves it",...notes},weak)?.strength,"Solid","words that aren't in the argument don't count");
  assert.equal(feedbackFromJudge({claim:true,supporting_quotes:[1,2],reasoning_words:"He left Katrina's house looking desolate and chapfallen, which shows he had a reason to leave",...notes},strong)?.strength,"Strong");
  assert.equal(feedbackFromJudge({claim:true,supporting_quotes:[1],reasoning_words:"",...notes},strong)?.strength,"Needs more evidence");
  // A reply that skips the rubric, or rates the theory itself, is treated as the judge being unavailable.
  assert.equal(feedbackFromJudge({strength:"Strong",...notes},strong),null);
  assert.equal(feedbackFromJudge({claim:true,supporting_quotes:[1,2,3],reasoning_words:"",strength_note:"",next_step:"y"},strong),null);
});

test("Spot the Lie hint: a one-paragraph clue highlights three lines around the answer; several paragraphs highlight the paragraph", async()=>{
  const {tryLine,hintFor,isHighlighted,evidenceSentences,isTruthLine}=await import("../lib/lies.ts");
  const {parseSourcePassages}=await import("../lib/source-passages.ts");
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8")));
  const passages=parseSourcePassages(await readFile(new URL("../worlds/sleepy-hollow/source.md",import.meta.url),"utf8"));
  const evidenceOf=(sceneIndex:number)=>{const s=world.scenes[sceneIndex];const clue=s.artifacts.find(a=>a.id===s.lie!.clue_id)!;return passages.filter(p=>clue.source_anchor.includes(p.id))};
  // Scene 1: Ichabod's belongings has one paragraph (¶69, six lines); the answer is line 3.
  const lie=world.scenes[0].lie!,evidence=evidenceOf(0);
  assert.equal(evidence.length,1);
  let r=tryLine(lie,"not this line",0,evidence);assert.equal(r.result==="miss"&&r.highlight,undefined,"no highlight after one miss");
  r=tryLine(lie,"not this line either",1,evidence);
  const lines=evidenceSentences(evidence[0].text);
  assert.ok(r.result==="miss"&&r.highlight&&"lines" in r.highlight);
  const lit=lines.filter(t=>isHighlighted(r.result==="miss"?r.highlight:undefined,{text:t,pid:"p069"}));
  assert.equal(lit.length,3,"three lines, not the whole paragraph");
  assert.deepEqual(lit,lines.slice(1,4),"the answer with one line on each side");
  assert.ok(isTruthLine(lie,lit[1]));
  // At the edge of a paragraph it still shows three lines.
  const first={...lie,truth_line:lines[0]};assert.deepEqual(hintFor(first,evidence),{lines:lines.slice(0,3)});
  const last={...lie,truth_line:lines.at(-1)!};assert.deepEqual(hintFor(last,evidence),{lines:lines.slice(-3)});
  // Scene 2: Brom's race tale cites two paragraphs (¶55 and ¶56), so the paragraph with the answer is highlighted.
  const party=world.scenes[1].lie!,partyEvidence=evidenceOf(1);
  assert.equal(partyEvidence.length,2);
  assert.deepEqual(hintFor(party,partyEvidence),{paragraph:"p055"});
  assert.equal(isHighlighted({paragraph:"p055"},{text:"anything",pid:"p055"}),true);
  assert.equal(isHighlighted({paragraph:"p055"},{text:"anything",pid:"p056"}),false);
});

test("testimony and reply voices: each button stops only its own words, and the shared player never plays two", async()=>{
  const {createSoundChannel}=await import("../lib/sound-channel.ts");
  const {voiceButtonFor,toggleVoiceKey,voiceKey,stopVoice}=await import("../lib/voice-control.ts");
  const channel=createSoundChannel();let playing:string|null=null,live=0,maxLive=0;
  const play=(id:string,text:string)=>()=>{channel.begin("voice",id,()=>{live--});live++;maxLive=Math.max(maxLive,live);playing=voiceKey(id,text)};
  const testimony="I looked through the schoolmaster's bundle myself.",reply="I burned his books, and good riddance.";
  assert.equal(voiceButtonFor(playing,"hans",testimony,"Hans","testimony").aria,"Hear Hans's testimony again");
  // The testimony plays (autoplay or the button): its button reads Stop; the reply's button from the same character does not.
  toggleVoiceKey(channel,playing,"hans",testimony,play("hans",testimony));
  assert.deepEqual(voiceButtonFor(playing,"hans",testimony,"Hans","testimony"),{playing:true,label:"Stop",aria:"Stop voice"});
  assert.equal(voiceButtonFor(playing,"hans",reply,"Hans").playing,false);
  // Playing the reply stops the testimony first: never two at once.
  toggleVoiceKey(channel,playing,"hans",reply,play("hans",reply));
  assert.equal(maxLive,1);assert.equal(live,1);
  assert.equal(voiceButtonFor(playing,"hans",reply,"Hans").label,"Stop");
  // Stop stops at once; a second tap on a playing button never starts a second copy.
  assert.equal(toggleVoiceKey(channel,playing,"hans",reply,play("hans",reply)),"stopped");
  assert.equal(live,0);assert.equal(channel.state.kind,null);
  // Asking a new question, leaving the clue, or starting narration all stop the testimony too.
  for(const why of ["new-question","leave"] as const){toggleVoiceKey(channel,null,"hans",testimony,play("hans",testimony));stopVoice(channel,why);assert.equal(live,0,why)}
  toggleVoiceKey(channel,null,"hans",testimony,play("hans",testimony));channel.begin("narration","empty-schoolhouse",()=>{});
  assert.equal(live,0);assert.equal(channel.state.kind,"narration");
});

// ---------- Live class mode ----------
async function liveKit(){
  const engine=await import("../lib/live/engine.ts");
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8")));
  let t=0;const at=()=>new Date(Date.UTC(2026,9,19,14,0,t++)).toISOString();
  const rows:import("../lib/live/engine.ts").LiveResponse[]=[];
  const add=(r:Omit<import("../lib/live/engine.ts").LiveResponse,"id"|"createdAt"|"flagged">&{flagged?:boolean})=>{const row={...r,flagged:r.flagged??false,id:`r${rows.length}`,createdAt:at()};rows.push(row);return row};
  return {engine,world,rows,add};
}

test("live squads: groups of 3 or 4, dealt round-robin; roles rotate every round", async()=>{
  const {engine}=await liveKit();
  assert.deepEqual(engine.squadSizes(8),[4,4]);assert.deepEqual(engine.squadSizes(10),[4,3,3]);assert.deepEqual(engine.squadSizes(9),[3,3,3]);assert.deepEqual(engine.squadSizes(13),[4,3,3,3]);
  assert.deepEqual(engine.squadSizes(3),[3]);assert.deepEqual(engine.squadSizes(0),[]);
  const squads=engine.buildSquads(["a","b","c","d","e","f","g","h","i","j"]);
  assert.deepEqual(squads.map(s=>s.length),[4,3,3]);assert.deepEqual(squads[0],["a","d","g","j"]);
  // A squad of 4: one role each, and everyone's role changes next round.
  const r0=engine.rolesFor(["a","b","c","d"],0)!,r1=engine.rolesFor(["a","b","c","d"],1)!;
  assert.deepEqual(r0,{lead:"a",keeper:"b",skeptic:"c",reporter:"d"});
  assert.ok(engine.ROLES.every(r=>r0[r]!==r1[r]));
  // A squad of 3: someone holds two roles, and who that is rotates.
  const holders=(n:number)=>{const r=engine.rolesFor(["a","b","c"],n)!;return ["a","b","c"].find(p=>engine.rolesOf(r,p).length===2)};
  assert.deepEqual([0,1,2].map(holders),["a","b","c"]);
  assert.equal(engine.squadPurpose("lie"),"Catch the false claim with one line from the story.");
});

test("live roles: a squad can't submit until every role has acted, and the Skeptic approves after the last change", async()=>{
  const {engine,add,rows}=await liveKit();
  const round={type:"lie" as const,sceneId:"empty-schoolhouse"};const roles=engine.rolesFor(["a","b","c","d"],0)!;
  const progress=()=>engine.squadProgress(round,rows,"s1",0);
  assert.deepEqual(progress().waitingFor,["keeper","reporter","skeptic","lead"]);
  // Only the role holder may act: the Lead can't pin, and nobody can submit yet.
  assert.equal(engine.mayAct(round,roles,"a","pin",progress()),false);
  assert.equal(engine.mayAct(round,roles,"b","pin",progress()),true);
  assert.equal(engine.mayAct(round,roles,"a","submit",progress()),false);
  assert.equal(engine.mayAct(round,roles,"c","approve",progress()),false,"nothing to approve yet");
  add({roundIndex:0,squadId:"s1",playerId:"b",role:"keeper",kind:"pin",payload:{quote:"a line"}});
  add({roundIndex:0,squadId:"s1",playerId:"d",role:"reporter",kind:"explain",payload:{text:"This shows the claim is false."}});
  assert.equal(engine.mayAct(round,roles,"c","approve",progress()),true);
  add({roundIndex:0,squadId:"s1",playerId:"c",role:"skeptic",kind:"object",payload:{note:"wrong line"}});
  assert.equal(progress().canSubmit,false);
  // Fixing the evidence after an approval needs a fresh approval.
  add({roundIndex:0,squadId:"s1",playerId:"c",role:"skeptic",kind:"approve",payload:{}});
  assert.equal(progress().canSubmit,true);
  add({roundIndex:0,squadId:"s1",playerId:"b",role:"keeper",kind:"pin",payload:{quote:"a better line"}});
  assert.equal(progress().canSubmit,false);assert.deepEqual(progress().waitingFor,["skeptic","lead"]);
  add({roundIndex:0,squadId:"s1",playerId:"c",role:"skeptic",kind:"approve",payload:{}});
  assert.equal(engine.mayAct(round,roles,"a","submit",progress()),true);
  add({roundIndex:0,squadId:"s1",playerId:"a",role:"lead",kind:"submit",payload:{}});
  assert.equal(engine.mayAct(round,roles,"b","pin",progress()),false,"no changes after submitting");
  // Every action records who did it and in which role.
  assert.deepEqual(rows.map(r=>`${r.playerId}:${r.role}:${r.kind}`),["b:keeper:pin","d:reporter:explain","c:skeptic:object","c:skeptic:approve","b:keeper:pin","c:skeptic:approve","a:lead:submit"]);
});

test("live scoring: Spot the Lie rewards the right line and a sound explanation; speed is a small bonus on correct answers only", async()=>{
  const {engine,world,add,rows}=await liveKit();
  const lie=world.scenes[0].lie!;
  const submit=(squad:string,quote:string,text:string)=>{add({roundIndex:0,squadId:squad,playerId:`${squad}k`,role:"keeper",kind:"pin",payload:{quote}});add({roundIndex:0,squadId:squad,playerId:`${squad}r`,role:"reporter",kind:"explain",payload:{text}});add({roundIndex:0,squadId:squad,playerId:`${squad}s`,role:"skeptic",kind:"approve",payload:{}});add({roundIndex:0,squadId:squad,playerId:`${squad}l`,role:"lead",kind:"submit",payload:{}})};
  submit("fast-wrong","The brook was searched, but the body of the schoolmaster was not to be discovered.","Hans was wrong about everything in the bundle he found.");
  submit("right-sound",lie.truth_line,"Hans said the pitch-pipe was brand-new, but the story says it was broken.");
  submit("right-thin",lie.truth_line,"Because.");
  const squads=["fast-wrong","right-sound","right-thin","silent"].map((id,position)=>({id,name:id,position}));
  const scores=Object.fromEntries(engine.scoreLieRound(lie,squads,rows,0).map(s=>[s.squadId,s]));
  assert.equal(scores["fast-wrong"].points,0,"speed never rewards a wrong answer");
  assert.equal(scores["right-sound"].points,100+10);
  assert.equal(scores["right-thin"].points,50+7,"the right line alone earns half");
  assert.equal(scores["silent"].points,0);
  assert.equal(engine.soundExplanation("Hans said the pitch-pipe was brand-new, but the story says it was broken.",lie),true);
  assert.equal(engine.soundExplanation("I think it is this one because it is.",lie),false);
  // The teacher can mark an explanation sound or not at the reveal.
  add({roundIndex:0,squadId:"right-thin",playerId:null,role:"host",kind:"override",payload:{key:"sound",value:true}});
  assert.equal(engine.scoreLieRound(lie,squads,rows,0).find(s=>s.squadId==="right-thin")!.points,100+7);
});

test("live scoring: Verdict Vote scores the judge's case strength; Objection! is decided by the class vote or the teacher", async()=>{
  const {engine,world,add,rows}=await liveKit();
  const squads=[{id:"s1",name:"Squad Lantern",position:0},{id:"s2",name:"Squad Quill",position:1}];
  for(const p of ["a","b","c"])add({roundIndex:0,squadId:"s1",playerId:p,role:null,kind:"vote",payload:{theoryId:"brom-prank"}});
  add({roundIndex:0,squadId:"s2",playerId:"d",role:null,kind:"vote",payload:{theoryId:"ran-away"}});
  add({roundIndex:0,squadId:"s1",playerId:"a",role:null,kind:"vote",payload:{theoryId:"ran-away"}});// a changed their vote
  assert.deepEqual(engine.tallyVotes(world,rows,0).map(v=>v.votes),[2,0,2]);
  const argue=(sq:string,theory:string,text:string)=>{add({roundIndex:0,squadId:sq,playerId:`${sq}k`,role:"keeper",kind:"pins",payload:{pins:[{quote:"q1"},{quote:"q2"},{quote:"q3"}]}});add({roundIndex:0,squadId:sq,playerId:`${sq}r`,role:"reporter",kind:"argument",payload:{text}});add({roundIndex:0,squadId:sq,playerId:`${sq}s`,role:"skeptic",kind:"approve",payload:{}});add({roundIndex:0,squadId:sq,playerId:`${sq}l`,role:"lead",kind:"submit",payload:{theoryId:theory}})};
  argue("s1","brom-prank","Brom did it. He wanted Katrina.");argue("s2","ran-away","Ichabod left. He was turned down.");
  add({roundIndex:0,squadId:"s1",playerId:null,role:"system",kind:"judged",payload:{feedback:{strength:"Strong",strength_note:"x",next_step:"y"}}});
  add({roundIndex:0,squadId:"s2",playerId:null,role:"system",kind:"judged",payload:{feedback:null}});
  const v=engine.scoreVerdictRound(squads,rows,0);
  assert.deepEqual(v.map(x=>x.points),[100,50],"judge unavailable: saved for 50");
  assert.deepEqual([...engine.strongestByTheory(v).keys()].sort(),["brom-prank","ran-away"]);
  // Objection!
  const round={type:"objection" as const,stage:"vote" as const,defendSquadId:"s1",objectSquadId:"s2",pin:{quote:"q1"},endsAt:new Date().toISOString()};
  add({roundIndex:1,squadId:"s2",playerId:"s2k",role:"keeper",kind:"pin",payload:{quote:"a counter line"}});add({roundIndex:1,squadId:"s2",playerId:"s2r",role:"reporter",kind:"explain",payload:{text:"This line shows Brom was home."}});add({roundIndex:1,squadId:"s2",playerId:"s2s",role:"skeptic",kind:"approve",payload:{}});add({roundIndex:1,squadId:"s2",playerId:"s2l",role:"lead",kind:"submit",payload:{}});
  for(const [p,s] of [["a",true],["b",true],["c",false]] as const)add({roundIndex:1,squadId:null,playerId:p,role:null,kind:"counter_vote",payload:{sustain:s}});
  let o=engine.objectionResult(round,rows,1);
  assert.equal(o.sustained,true);assert.deepEqual(o.scores,[{squadId:"s2",points:60},{squadId:"s1",points:0}]);
  add({roundIndex:1,squadId:null,playerId:null,role:"host",kind:"override",payload:{key:"objection",value:false}});
  o=engine.objectionResult(round,rows,1);
  assert.equal(o.sustained,false);assert.equal(o.overridden,true);assert.deepEqual(o.scores,[{squadId:"s2",points:0},{squadId:"s1",points:40}]);
});

test("live boards rank classes, never students; guests pick generated nicknames", async()=>{
  const {engine}=await liveKit();
  const now=new Date("2026-10-19T12:00:00Z");
  const board=engine.classBoard([{classId:"p1",className:"Period 1",createdAt:"2026-10-18T10:00:00Z",points:300},{classId:"p2",className:"Period 2",createdAt:"2026-10-17T10:00:00Z",points:450},{classId:"p1",className:"Period 1",createdAt:"2026-10-19T09:00:00Z",points:200},{classId:"p2",className:"Period 2",createdAt:"2026-10-01T10:00:00Z",points:999}],now);
  assert.deepEqual(board.map(b=>[b.className,b.points,b.rounds]),[["Period 1",500,2],["Period 2",450,1]],"last week only");
  assert.ok(board.every(b=>Object.keys(b).sort().join()==="classId,className,points,rounds"),"no student fields");
  const names=engine.nicknameChoices(42,[]);
  assert.equal(names.length,3);assert.ok(names.every(engine.isGeneratedNickname));
  assert.equal(engine.isGeneratedNickname("Jordan Smith"),false);
  assert.ok(!engine.nicknameChoices(42,[names[0]]).includes(names[0]));
});

test("live server: tokens, joining, role-gated actions, moderation and the per-session judge", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {memoryLiveStore}=await import("../lib/live/store.ts");
  const server=await import("../lib/live/server.ts");
  const store=memoryLiveStore({sessions:[],squads:[],players:[],responses:[]});
  const host=server.newHostToken();
  const s=await store.createSession({code:"TEST01",teacherId:null,classId:null,demo:true,worldId:"sleepy-hollow",status:"lobby",paused:false,roundIndex:-1,rounds:[],roundStartedAt:null,hostHash:server.hashHostToken(host),expiresAt:new Date(Date.now()+36e5).toISOString()});
  assert.equal(server.isHost(s,host),true);assert.equal(server.isHost(s,"guess"),false);
  const ids:string[]=[];
  for(const n of ["Detective Owl","Inspector Fox","Sleuth Raven","Agent Quill"]){const r=await server.join(store,s,{nickname:n,studentId:null});assert.ok(r.player);ids.push(r.player.id)}
  assert.deepEqual(await server.join(store,s,{nickname:"Detective Owl",studentId:null}),{error:"That detective name was just taken. Pick another."});
  const tok=server.playerToken(s.id,ids[0]);assert.equal(server.playerFromToken(s.id,tok),ids[0]);assert.equal(server.playerFromToken("other",tok),null);
  let st=(await server.loadState(store,s.id))!;
  assert.equal(await server.hostAct(store,st,{action:"squads.auto"}),null);
  st=(await server.loadState(store,s.id))!;
  assert.equal(await server.hostAct(store,st,{action:"round.start",type:"lie",sceneId:"empty-schoolhouse"}),null);
  st=(await server.loadState(store,s.id))!;
  const roles=server.hostView(st).squads[0].members;
  const who=(r:string)=>roles.find(m=>m.roles.includes(r as never))!.id;
  const act=async(pid:string,kind:string,payload:Record<string,unknown>={})=>{st=(await server.loadState(store,s.id))!;return server.playerAct(store,st,pid,{kind:kind as never,payload},{judgeAllowed:async()=>false})};
  assert.equal(await act(who("lead"),"pin",{quote:"x"}),"That's another role's job right now.");
  const lie=st.world.scenes[0].lie!;
  assert.equal(await act(who("keeper"),"pin",{quote:lie.truth_line,pid:lie.truth_paragraph}),null);
  // A flagged explanation is kept for the teacher but hidden from the host screen.
  assert.equal(await act(who("reporter"),"explain",{text:"tell me your home address now please"}),null);
  st=(await server.loadState(store,s.id))!;
  assert.equal(st.responses.find(r=>r.kind==="explain")!.flagged,true);
  assert.equal(server.playerView(st,who("skeptic")).progress!.explanation,"Hidden for the teacher to review.");
  assert.equal(server.hostView(st).flagged,1);
});

test("live evidence: per-student role actions and squad answers, in the Evidence view and the CSV", async()=>{
  const {world,add,rows}=await liveKit();
  const {liveRoundEvidence}=await import("../lib/live/evidence.ts");
  const {evidenceCsv}=await import("../lib/classroom/evidence.ts");
  const lie=world.scenes[0].lie!;
  add({roundIndex:0,squadId:"s1",playerId:"p2",role:"keeper",kind:"pin",payload:{quote:lie.truth_line}});
  add({roundIndex:0,squadId:"s1",playerId:"p3",role:"reporter",kind:"explain",payload:{text:"Hans said the pitch-pipe was brand-new, but the story says it was broken."}});
  add({roundIndex:0,squadId:"s1",playerId:"p1",role:"skeptic",kind:"approve",payload:{}});
  add({roundIndex:0,squadId:"s1",playerId:"p1",role:"lead",kind:"submit",payload:{}});
  const players=[{id:"p1",nickname:"Ana R.",squadId:"s1",studentId:"st1",joinedAt:""},{id:"p2",nickname:"Ben T.",squadId:"s1",studentId:"st2",joinedAt:""},{id:"p3",nickname:"Cy L.",squadId:"s1",studentId:"st3",joinedAt:""}];
  const session={id:"L1",code:"ABCDEF",worldId:"sleepy-hollow",classId:"c1",demo:false,status:"reveal" as const,paused:false,roundIndex:0,rounds:[{type:"lie" as const,sceneId:world.scenes[0].id}],roundStartedAt:null,createdAt:"2026-10-19T14:00:00Z",expiresAt:""};
  const live=liveRoundEvidence({session,world,squads:[{id:"s1",name:"Squad Lantern",position:0}],players,responses:rows});
  assert.equal(live.length,1);assert.equal(live[0].type,"Live Spot the Lie");
  const sq=live[0].squads[0];
  assert.equal(sq.points,110);assert.equal(sq.answer,lie.truth_line);
  assert.deepEqual(sq.members.map(m=>[m.nickname,m.actions.length]),[["Ana R.",2],["Ben T.",1],["Cy L.",1]]);
  assert.match(sq.members[0].actions.join(),/Skeptic: approved,Lead Investigator: submitted/);
  const csv=evidenceCsv({story:{id:"x",title:"x"},scenes:[],students:[],summary:{joined:0,totalClues:0,averageProven:0,provedWrongStudents:0,needsHelp:0,anyProven:false},live});
  assert.match(csv,/Live round,Date,Round type/);assert.equal(csv.split("\r\n").filter(l=>l.startsWith("1,2026-10-19")).length,3);
});

// ---------- Plant a Lie ----------
async function plantKit(worldId="sleepy-hollow"){
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${worldId}/world.json`,import.meta.url),"utf8")));
  const {parseSourcePassages}=await import("../lib/source-passages.ts");
  const passages=parseSourcePassages(await readFile(new URL(`../worlds/${worldId}/source.md`,import.meta.url),"utf8"));
  const planted=await import("../lib/planted-lies.ts");const lies=await import("../lib/lies.ts");
  return {world,passages,planted,lies};
}

test("plant a lie: a catchable lie passes; it must be one sentence, by a speaking character, disproved by exactly one line", async()=>{
  const {world,passages,planted,lies}=await plantKit();
  const scene=world.scenes[0],clue=scene.artifacts.find(a=>a.id===scene.lie!.clue_id)!;
  const p=passages.find(x=>x.id===scene.lie!.truth_paragraph)!;
  const line=lies.evidenceSentences(p.text).find(s=>s.includes("rusty razor"))!;
  const ok={sceneId:scene.id,clueId:clue.id,characterId:scene.lie!.character_id,sentence:"The schoolmaster packed a golden razor and a brand-new flute.",truthParagraph:p.id,truthLine:line};
  assert.deepEqual(planted.plantedLieProblems(world,passages,ok),[]);
  const problems=(x:Partial<typeof ok>)=>planted.plantedLieProblems(world,passages,{...ok,...x});
  assert.match(problems({sentence:"A razor."}).join(),/at least 5 words/);
  assert.match(problems({sentence:"He packed a golden razor. He also packed a flute and a hat."}).join(),/just one sentence/);
  assert.match(problems({characterId:"ichabod"}).join(),/speaks in this scene/,"non-speaking characters are never voiced");
  assert.match(problems({truthLine:"Something the story never says."}).join(),/proves it false/);
  assert.match(problems({truthParagraph:"p001"}).join(),/this clue's evidence/);
  assert.match(problems({sentence:line}).join(),/says something false/);
  // Exactly one tappable line may match: a line that appears twice in the clue's evidence is refused.
  const twice=[...passages,{...p,id:"p999"}];
  const w2=structuredClone(world);w2.scenes[0].artifacts.find(a=>a.id===clue.id)!.source_anchor.push("p999");
  assert.match(planted.plantedLieProblems(w2,twice,ok).join(),/more than once/);
});

test("plant a lie: never on a paragraph with a content note", async()=>{
  const {world,passages,planted,lies}=await plantKit();
  const scene=world.scenes[0],pid=scene.lie!.truth_paragraph;
  const line=lies.evidenceSentences(passages.find(x=>x.id===pid)!.text).find(x=>x.includes("rusty razor"))!;
  const input={sceneId:scene.id,clueId:scene.lie!.clue_id,characterId:scene.lie!.character_id,sentence:"The schoolmaster packed a golden razor and a brand-new flute.",truthParagraph:pid,truthLine:line};
  assert.deepEqual(planted.plantedLieProblems(world,passages,input),[]);
  // The same lie, once its paragraph carries a content note, is refused.
  const noted=structuredClone(world);
  noted.storybook={...(noted.storybook??{pages:[]}),ai_exclude:[...(noted.storybook?.ai_exclude??[]),pid],pages:[...(noted.storybook?.pages??[]),{id:"noted",section:"x",start:pid,end:pid,mode:"student",content_note:"A test note."} as never]} as never;
  assert.match(planted.plantedLieProblems(noted,passages,input).join(),/content note/);
});

test("plant a lie: the writer's squad sits out and earns only when other squads catch it soundly", async()=>{
  const {world,planted}=await plantKit();
  const engine=await import("../lib/live/engine.ts");
  const scene=world.scenes[0];
  const lie=planted.asLie({sceneId:scene.id,clueId:scene.lie!.clue_id,characterId:scene.lie!.character_id,sentence:"He packed a golden razor and a new flute.",truthParagraph:scene.lie!.truth_paragraph,truthLine:scene.lie!.truth_line},world);
  let t=0;const rows:import("../lib/live/engine.ts").LiveResponse[]=[];
  const add=(sq:string,kind:string,payload:Record<string,unknown>)=>rows.push({id:`r${t}`,roundIndex:0,squadId:sq,playerId:`${sq}-${kind}`,role:null,kind:kind as never,payload,flagged:false,createdAt:new Date(Date.UTC(2026,9,19,14,0,t++)).toISOString()});
  const answer=(sq:string,quote:string,text:string)=>{add(sq,"pin",{quote});add(sq,"explain",{text});add(sq,"approve",{});add(sq,"submit",{})};
  const squads=["writer","a","b","c"].map((id,position)=>({id,name:id,position}));
  // Nobody catches it soundly: the writer earns nothing.
  answer("a",lie.truth_line,"Because.");
  let s=Object.fromEntries(engine.scoreLieRound(lie,squads,rows,0,"writer").map(x=>[x.squadId,x]));
  assert.equal(s.writer.points,0);assert.equal(s.writer.writer,true);assert.equal(s.a.points,50+10,"right line only, first in");
  answer("b",lie.truth_line,"He said the razor was golden, but the story says it was a rusty razor.");
  answer("c","The brook was searched, but the body of the schoolmaster was not to be discovered.","The razor was rusty in the story, not golden at all.");
  answer("writer",lie.truth_line,"The story says the razor was rusty, so the golden razor is false.");
  s=Object.fromEntries(engine.scoreLieRound(lie,squads,rows,0,"writer").map(x=>[x.squadId,x]));
  assert.equal(s.writer.points,planted.PLANTED_LIE_POINTS,"one other squad caught it soundly; the writer's own answer doesn't count");
  assert.equal(s.a.points,50+10);assert.equal(s.b.points,100+7);assert.equal(s.c.points,0);
  assert.equal(planted.writerPoints([{squadId:"x",correct:true,sound:true}],null),0);
});

test("plant a lie: approved lies become live rounds, and the answer never reaches the phones", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {world,lies}=await plantKit();
  const {memoryLiveStore}=await import("../lib/live/store.ts");
  const {memoryLieBankStore}=await import("../lib/lie-bank-store.ts");
  const server=await import("../lib/live/server.ts");
  const bank=memoryLieBankStore([]);
  const scene=world.scenes[0];
  const p=await bank.add({classId:"c1",studentId:"st-writer",worldId:"sleepy-hollow",sceneId:scene.id,clueId:scene.lie!.clue_id,characterId:scene.lie!.character_id,sentence:"He packed a golden razor and a new flute.",truthParagraph:scene.lie!.truth_paragraph,truthLine:scene.lie!.truth_line,status:"pending"});
  await bank.setStatus(p.id,"approved");
  const store=memoryLiveStore({sessions:[],squads:[],players:[],responses:[]});
  const s=await store.createSession({code:"PLANT1",teacherId:"t1",classId:"c1",demo:false,worldId:"sleepy-hollow",status:"lobby",paused:false,roundIndex:-1,rounds:[],roundStartedAt:null,hostHash:"x",expiresAt:new Date(Date.now()+36e5).toISOString()});
  const ids:string[]=[];
  for(const [n,sid] of [["Ana","st-writer"],["Ben",null],["Cy",null],["Di",null],["Ed",null],["Flo",null]] as const){const r=await server.join(store,s,{nickname:n,studentId:sid});assert.ok(r.player);ids.push(r.player.id)}
  let st={...(await server.loadState(store,s.id))!,bank:[(await bank.get(p.id))!]};
  await server.hostAct(store,st,{action:"squads.auto"});
  st={...(await server.loadState(store,s.id))!,bank:st.bank};
  assert.equal(server.hostView(st).lieBank.length,1);
  assert.equal(await server.hostAct(store,st,{action:"round.start",type:"lie",plantedId:p.id}),null);
  st={...(await server.loadState(store,s.id))!,bank:st.bank};
  const writerSquad=st.players.find(x=>x.id===ids[0])!.squadId;
  assert.equal(server.hostView(st).writerSquadId,writerSquad);
  assert.equal(server.hostView(st).counters.squadsAnswering,1,"the writer's squad sits out");
  const view=server.playerView(st,ids[0]);
  assert.equal(view.plantedByMySquad,true);assert.equal(view.answering,false);
  assert.ok(!JSON.stringify(server.playerView(st,ids[1]).round).includes(lies.lineWords(scene.lie!.truth_line).slice(0,30)),"no truth line on the phones");
  assert.equal(await server.playerAct(store,st,ids[0],{kind:"pin",payload:{quote:"x"}},{judgeAllowed:async()=>false}),"Your squad planted this lie. Watch who catches it.");
});

// ---------- Hologram mode ----------
test("hologram layout: four copies around a central square, each turned to face outward", async()=>{
  const h=await import("../lib/hologram.ts");
  const copies=h.hologramLayout({width:400,height:800,size:1,gap:0.2,mirror:false});
  assert.deepEqual(copies.map(c=>[c.side,c.rotate]),[["top",0],["right",90],["bottom",180],["left",270]]);
  // The shorter edge (400) sets the scale: an 80px central square, and copies that reach the screen edge.
  const [top,right,bottom,left]=copies;
  assert.equal(top.size,160);assert.equal(top.x,200);assert.equal(top.y,400-40-80);
  assert.equal(bottom.y,400+40+80);assert.equal(left.x,200-40-80);assert.equal(right.x,200+40+80);
  assert.equal(left.x-left.size/2,0,"the left copy reaches the screen edge");
  // Symmetric: every copy sits the same distance from the centre, and none overlaps the central square.
  const dist=copies.map(c=>Math.hypot(c.x-200,c.y-400));assert.ok(dist.every(d=>d===dist[0]));
  assert.ok(copies.every(c=>Math.max(Math.abs(c.x-200),Math.abs(c.y-400))-c.size/2>=40));
});

test("hologram layout: the gap and size sliders, and the mirror toggle", async()=>{
  const h=await import("../lib/hologram.ts");
  const at=(gap:number,size=1)=>h.hologramLayout({width:600,height:600,size,gap,mirror:false})[0];
  assert.ok(at(0.4).size<at(0.1).size,"a wider gap leaves less room");
  assert.equal(at(0).y+at(0).size/2,300,"no gap: the top copy touches the centre");
  assert.equal(at(0.9).size,at(0.5).size,"the gap is capped at half the screen");
  assert.equal(at(0.2,0.5).size,at(0.2,1).size/2);
  assert.equal(at(0.2,0.01).size,at(0.2,1).size*0.2,"size is at least 20%");
  const mirrored=h.hologramLayout({width:600,height:600,size:1,gap:0.2,mirror:true});
  assert.ok(mirrored.every(c=>c.mirror));
  assert.equal(h.copyTransform(mirrored[1]),"translate(-50%, -50%) rotate(90deg) scaleX(-1)");
  assert.equal(h.copyTransform(at(0.2) as never),"translate(-50%, -50%) rotate(0deg)");
  assert.deepEqual(h.hologramLayout({width:0,height:0,...h.HOLOGRAM_DEFAULTS}).map(c=>c.size),[0,0,0,0]);
});

test("hologram glow follows the voice level; holograms must be transparent PNGs", async()=>{
  const h=await import("../lib/hologram.ts");
  const {deflateSync,inflateSync}=await import("node:zlib");
  assert.equal(h.voiceLevel(new Uint8Array(512).fill(128)),0,"silence");
  assert.ok(h.voiceLevel(Uint8Array.from({length:512},(_,i)=>i%2?200:56))>0.9,"loud");
  // A tiny PNG built by hand: 8-bit RGBA, one row of two pixels.
  const png=(colorType:number,firstAlpha:number)=>{
    const chunk=(type:string,data:Buffer)=>{const len=Buffer.alloc(4);len.writeUInt32BE(data.length);return Buffer.concat([len,Buffer.from(type),data,Buffer.alloc(4)])};
    const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(2,0);ihdr.writeUInt32BE(1,4);ihdr[8]=8;ihdr[9]=colorType;
    const row=Buffer.from([1,10,20,30,firstAlpha,5,5,5,5]);// filter "Sub" on the first row
    return new Uint8Array(Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",ihdr),chunk("IDAT",deflateSync(row)),chunk("IEND",Buffer.alloc(0))]));
  };
  const inflate=(d:Uint8Array)=>new Uint8Array(inflateSync(d));
  assert.equal(await h.hologramPngProblem(png(6,0),inflate),null);
  assert.match(String(await h.hologramPngProblem(png(6,255),inflate)),/corner is not transparent/);
  assert.match(String(await h.hologramPngProblem(png(2,0),inflate)),/transparent background/);
  assert.match(String(await h.hologramPngProblem(new Uint8Array(40),inflate)),/not a PNG/);
  // Palette PNGs (what generate-assets saves) are checked through their transparency chunk.
  const {default:sharp}=await import("sharp");
  const rgba=Buffer.alloc(8*8*4);for(let i=0;i<64;i++)if(i>=27&&i<=36)rgba.writeUInt32BE(0x88eeffff,i*4);
  const pal=new Uint8Array(await sharp(rgba,{raw:{width:8,height:8,channels:4}}).png({palette:true}).toBuffer());
  assert.equal(pal[25],3,"a palette PNG");assert.equal(await h.hologramPngProblem(pal,inflate),null);
  const solid=new Uint8Array(await sharp({create:{width:8,height:8,channels:3,background:"#000"}}).png({palette:true}).toBuffer());
  assert.match(String(await h.hologramPngProblem(solid,inflate)),/transparent background|not transparent/);
  // Every story's holograms pass, and the schema only accepts files in the story's holograms folder.
  for(const id of ["sleepy-hollow","trifles","tell-tale-heart"]){
    const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));
    for(const c of world.characters){assert.ok(c.hologram,`${id}/${c.id} has a hologram`);assert.equal(await h.hologramPngProblem(new Uint8Array(await readFile(new URL(`../public${c.hologram}`,import.meta.url))),inflate),null)}
  }
  const base=JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8"));
  base.characters[0].hologram="https://example.com/x.png";
  assert.equal(WorldPackSchema.safeParse(base).success,false);
});

test("witness stand: a signed read-only link that plays the testimony on the host's cue", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {memoryLiveStore}=await import("../lib/live/store.ts");
  const server=await import("../lib/live/server.ts");
  const store=memoryLiveStore({sessions:[],squads:[],players:[],responses:[]});
  const s=await store.createSession({code:"HOLO01",teacherId:null,classId:null,demo:true,worldId:"sleepy-hollow",status:"lobby",paused:false,roundIndex:-1,rounds:[],roundStartedAt:null,hostHash:"x",expiresAt:new Date(Date.now()+36e5).toISOString()});
  assert.equal(server.isWitness(s.id,server.witnessToken(s.id)),true);
  assert.equal(server.isWitness(s.id,server.witnessToken("another")),false);
  for(const n of ["Detective Owl","Inspector Fox","Sleuth Raven"])await server.join(store,s,{nickname:n,studentId:null});
  let st=(await server.loadState(store,s.id))!;
  assert.equal(server.witnessView(st).witness,null,"nothing on the stand in the lobby");
  assert.equal(await server.hostAct(store,st,{action:"witness.play"}),"The Witness stand plays during Spot the Lie.");
  await server.hostAct(store,st,{action:"squads.auto"});st=(await server.loadState(store,s.id))!;
  await server.hostAct(store,st,{action:"round.start",type:"lie",sceneId:"empty-schoolhouse"});st=(await server.loadState(store,s.id))!;
  const w=server.witnessView(st);
  assert.equal(w.witness?.character.id,"hans-van-ripper");assert.equal(w.witness?.line,st.world.scenes[0].lie!.testimony);assert.ok(w.witness?.character.hologram);
  assert.equal(w.playKey,null);
  assert.equal(await server.hostAct(store,st,{action:"witness.play"}),null);st=(await server.loadState(store,s.id))!;
  const first=server.witnessView(st).playKey;assert.ok(first);
  await server.hostAct(store,st,{action:"witness.play"});st=(await server.loadState(store,s.id))!;
  assert.notEqual(server.witnessView(st).playKey,first,"each cue plays again");
  assert.ok(!JSON.stringify(server.witnessView(st)).includes(st.world.scenes[0].lie!.truth_line.slice(0,40)),"the stand never sees the answer");
});

test("hologram faces: each copy is cut to its wedge of the pyramid, so neighbours never overlap", async()=>{
  const h=await import("../lib/hologram.ts");
  assert.equal(h.faceClip(100,0),"polygon(0% 0%, 100% 0%, 100% 50%, 50% 100%, 50% 100%, 0% 50%)","no gap: a triangle meeting at the centre");
  assert.equal(h.faceClip(100,40),"polygon(0% 0%, 100% 0%, 100% 70%, 70% 100%, 30% 100%, 0% 70%)","with a gap: a trapezoid as wide as the central square");
  assert.equal(h.faceClip(0,40),"none");
  assert.ok(h.hologramLayout({width:375,height:812,size:0.9,gap:0.16,mirror:false}).every(c=>c.clip.startsWith("polygon(")));
});

// ---------- Students in the story ----------
const roleWorld=async(id:string)=>WorldPackSchema.parse(JSON.parse(await readFile(new URL(`../worlds/${id}/world.json`,import.meta.url),"utf8")));

test("student roles load for every story: a part to play, a start scene, a second-person intro, and a frame on every choice", async()=>{
  const sr=await import("../lib/student-role.ts");
  const expected:Record<string,RegExp>={"sleepy-hollow":/newest student in Ichabod's class/i,"trifles":/young deputy watching the kitchen/i,"tell-tale-heart":/neighbor who heard the shriek/i};
  for(const [id,name] of Object.entries(expected)){
    const world=await roleWorld(id);const role=world.student_role!;
    assert.match(role.name,name);
    assert.ok(world.scenes.some(s=>s.id===role.start_scene));
    assert.match(role.intro,/^You /);assert.match(role.setup,/^You /);
    assert.deepEqual(sr.studentRoleProblems(world),[]);
    for(const s of world.scenes)if(s.choice_point)assert.ok(sr.choiceFrame(world,s.choice_point).length>10,`${id}/${s.id} has a personal frame`);
    // The public copy the app loads carries the same role.
    const pub=JSON.parse(await readFile(new URL(`../public/worlds/${id}/world.json`,import.meta.url),"utf8"));
    if(id!=="tell-tale-heart")assert.deepEqual(pub.student_role,role);
  }
  const tth=await roleWorld("tell-tale-heart");
  assert.ok(!/old man/i.test(tth.student_role!.name),"never the old man");
  assert.match(tth.student_role!.setup,/shriek/);
});

test("student roles are validated: a real start scene, one line of setup, never one of the story's people", async()=>{
  const sr=await import("../lib/student-role.ts");
  const world=await roleWorld("tell-tale-heart");
  const bad=(change:(w:typeof world)=>void)=>{const w=structuredClone(world);change(w);return sr.studentRoleProblems(w).join(" | ")};
  assert.match(bad(w=>{w.student_role!.start_scene="nowhere"}),/not a scene/);
  assert.match(bad(w=>{w.student_role!.setup="You heard it.\nThen more."}),/one line/);
  assert.match(bad(w=>{w.student_role!.intro="The neighbor heard a shriek."}),/second person/);
  assert.match(bad(w=>{w.student_role!.name="The old man"}),/can't play old man/);
  assert.match(bad(w=>{w.student_role!.name="The officer on duty"}),/can't play Officer/i);
  assert.match(bad(w=>{delete w.scenes[0].choice_point!.role_frame}),/without a role_frame/);
});

test("what's your angle: only the three choices reach the AI, and the teacher's settings turn roles and angles off", async()=>{
  const sr=await import("../lib/student-role.ts");
  const world=await roleWorld("sleepy-hollow");
  const p=sr.personaPrompt(world,{firedUpBy:"underestimated",lane:"music",style:"rival"});
  assert.match(p,/newest student in Ichabod's class/);assert.match(p,/being underestimated/);assert.match(p,/music/);assert.match(p,/rival/);
  assert.match(p,/must still come from the source passages/);
  assert.equal(sr.personaPrompt(world,{lane:"music"},{rolesOn:false,anglesOn:false}),"");
  assert.doesNotMatch(sr.personaPrompt(world,{lane:"music"},{rolesOn:true,anglesOn:false}),/music/);
  assert.doesNotMatch(sr.personaPrompt(world,null,{rolesOn:false,anglesOn:true}),/playing a part/);
  // Anything but the listed choices is refused: no free text can ride along.
  assert.equal(sr.AngleSchema.safeParse({lane:"my name is Sam"}).success,false);
  assert.equal(sr.AngleSchema.safeParse({lane:"music",note:"hi"}).success,false);
  assert.equal(sr.personaPrompt(world,{lane:"I live on Elm St"} as never).includes("Elm"),false);
  assert.equal(sr.choiceFrame(world,world.scenes[0].choice_point,{rolesOn:false,anglesOn:true}),"");
  assert.equal(sr.ANGLE_STEPS.length,3);
  assert.deepEqual(Object.values(sr.ANGLE_OPTIONS.firedUpBy.options),["Unfairness","Being underestimated","Loyalty","Winning","Money"]);
  assert.deepEqual(Object.values(sr.ANGLE_OPTIONS.lane.options),["Sports","Music","Gaming","Fashion","Social media"]);
  assert.deepEqual(Object.values(sr.ANGLE_OPTIONS.style.options),["Solo detective","Squad","Rival"]);
  // Saved with progress only.
  const {StudentProgressSchema}=await import("../lib/classroom/progress.ts");
  const base={v:1,worldId:"sleepy-hollow",scene:0,submitted:false,readerProgress:{},artifactAnswers:{},savedTextEvidence:[],updatedAt:"2026-10-19T00:00:00Z"};
  assert.equal(StudentProgressSchema.safeParse({...base,angle:{lane:"gaming"},roleIntroSeen:true}).success,true);
  assert.equal(StudentProgressSchema.safeParse({...base,angle:{lane:"anything"}}).success,false);
  const {personalSettings}=await import("../lib/classroom/store.ts");
  assert.deepEqual(personalSettings({}),{rolesOn:true,anglesOn:true},"on until the teacher turns them off");
  assert.deepEqual(personalSettings({roles_enabled:false,angles_enabled:true}),{rolesOn:false,anglesOn:true});
});

// ---------- Server checks: every pinned or tapped line is a real evidence line ----------
async function evidenceKit(){
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8")));
  const {parseSourcePassages}=await import("../lib/source-passages.ts");
  const passages=parseSourcePassages(await readFile(new URL("../worlds/sleepy-hollow/source.md",import.meta.url),"utf8"));
  const ev=await import("../lib/evidence-check.ts");const lies=await import("../lib/lies.ts");
  const scene=world.scenes[0],lie=scene.lie!;
  const truth=lies.evidenceSentences(passages.find(p=>p.id===lie.truth_paragraph)!.text).find(s=>lies.isTruthLine(lie,s))!;
  const other=world.scenes[0].artifacts.find(a=>a.id!==lie.clue_id&&a.source_anchor.every(id=>!world.scenes[0].artifacts.find(x=>x.id===lie.clue_id)!.source_anchor.includes(id)))!;
  const otherLine=ev.evidenceLines(world,passages,[other.id])[0];
  return {world,passages,ev,lies,lie,truth,other,otherLine};
}

test("evidence check: only an exact evidence line from the world file matches", async()=>{
  const {world,passages,ev,lie,truth,other,otherLine}=await evidenceKit();
  const m=ev.matchEvidence(world,passages,truth,{clueId:lie.clue_id});
  assert.deepEqual(m,{clueId:lie.clue_id,pid:lie.truth_paragraph,text:truth});
  // Spacing, line breaks, curly quotes and case don't matter; the stored text is the world file's.
  assert.equal(ev.matchEvidence(world,passages,"  "+truth.toUpperCase().replace(/ /g,"\n  ")+" ",{clueId:lie.clue_id})?.text,truth);
  assert.equal(ev.matchEvidence(world,passages,truth.slice(0,truth.length-12),{clueId:lie.clue_id}),null,"a fragment is not a line");
  assert.equal(ev.matchEvidence(world,passages,truth.replace("broken","brand-new"),{clueId:lie.clue_id}),null,"an edited line is not a line");
  assert.equal(ev.matchEvidence(world,passages,"Ichabod was carried off by the Horseman.",{}),null,"made-up text");
  assert.equal(ev.matchEvidence(world,passages,truth,{clueId:other.id}),null,"a line from a different clue");
  assert.equal(ev.matchEvidence(world,passages,truth,{clueId:lie.clue_id,pid:"p001"}),null,"the wrong paragraph");
  assert.equal(ev.matchEvidence(world,passages,truth,{clueId:"no-such-clue"}),null);
  assert.equal(ev.matchEvidence(world,passages,{quote:truth},{}),null,"not a string");
  assert.equal(ev.matchEvidence(world,passages,"   ",{}),null);
  assert.equal(ev.matchEvidence(world,passages,otherLine.text)?.clueId,other.id,"with no clue named, any clue's evidence");
});

test("evidence check: live rounds refuse pins that aren't evidence lines and store the world file's text", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {lie,truth,otherLine}=await evidenceKit();
  const {memoryLiveStore}=await import("../lib/live/store.ts");
  const server=await import("../lib/live/server.ts");const {NOT_EVIDENCE}=await import("../lib/evidence-check.ts");
  const store=memoryLiveStore({sessions:[],squads:[],players:[],responses:[]});
  const s=await store.createSession({code:"EVID01",teacherId:null,classId:null,demo:true,worldId:"sleepy-hollow",status:"lobby",paused:false,roundIndex:-1,rounds:[],roundStartedAt:null,hostHash:"x",expiresAt:new Date(Date.now()+36e5).toISOString()});
  for(const n of ["Detective Owl","Inspector Fox","Sleuth Raven","Agent Quill","Constable Ember","Detective Comet"])await server.join(store,s,{nickname:n,studentId:null});
  let st=(await server.loadState(store,s.id))!;
  await server.hostAct(store,st,{action:"squads.auto"});st=(await server.loadState(store,s.id))!;
  const roleHolder=(squad:number,role:string)=>server.hostView(st).squads[squad].members.find(m=>m.roles.includes(role as never))!.id;
  const act=async(pid:string,kind:string,payload:Record<string,unknown>)=>{st=(await server.loadState(store,s.id))!;return server.playerAct(store,st,pid,{kind:kind as never,payload},{judgeAllowed:async()=>false})};
  // Spot the Lie: only lines from the testimony's clue.
  await server.hostAct(store,st,{action:"round.start",type:"lie",sceneId:"empty-schoolhouse"});st=(await server.loadState(store,s.id))!;
  const keeper=roleHolder(0,"keeper");
  assert.equal(await act(keeper,"pin",{quote:"Hans said it was brand-new."}),NOT_EVIDENCE);
  assert.equal(await act(keeper,"pin",{quote:truth.slice(0,40)}),NOT_EVIDENCE,"a fragment of the right line");
  assert.equal(await act(keeper,"pin",{quote:otherLine.text}),NOT_EVIDENCE,"a real line from another clue");
  assert.equal(await act(keeper,"pin",{quote:truth.replace(/\s+/g,"  "),pid:lie.truth_paragraph}),null);
  const pinned=(await server.loadState(store,s.id))!.responses.find(r=>r.kind==="pin")!;
  assert.deepEqual(pinned.payload,{quote:truth,pid:lie.truth_paragraph,clueId:lie.clue_id},"stored as the world file's line");
  // Verdict Vote: three real, different lines from any clue.
  await server.hostAct(store,(await server.loadState(store,s.id))!,{action:"round.reveal"});
  st=(await server.loadState(store,s.id))!;
  await server.hostAct(store,st,{action:"round.start",type:"verdict"});st=(await server.loadState(store,s.id))!;
  await server.hostAct(store,st,{action:"round.stage"});st=(await server.loadState(store,s.id))!;
  const vk=roleHolder(1,"keeper");
  const {world,passages,ev,truth:truthLine,other:wrongClue}=await evidenceKit();
  const three=ev.evidenceLines(world,passages).filter((l,i,a)=>a.findIndex(x=>x.text===l.text)===i).slice(0,3);
  assert.equal(await act(vk,"pins",{pins:[...three.slice(0,2).map(l=>({clueId:l.clueId,quote:l.text})),{clueId:three[2].clueId,quote:"Brom did it."}]}),NOT_EVIDENCE);
  assert.equal(await act(vk,"pins",{pins:[three[0],three[0],three[1]].map(l=>({clueId:l.clueId,quote:l.text}))}),"Pin 3 different lines.");
  assert.equal(await act(vk,"pins",{pins:[{clueId:wrongClue.id,quote:truthLine},...three.slice(1).map(l=>({clueId:l.clueId,quote:l.text}))]}),NOT_EVIDENCE,"a line under the wrong clue");
  assert.equal(await act(vk,"pins",{pins:three.map(l=>({clueId:l.clueId,quote:l.text.toLowerCase()}))}),null);
  const saved=(await server.loadState(store,s.id))!.responses.find(r=>r.kind==="pins")!;
  assert.deepEqual((saved.payload.pins as {quote:string}[]).map(p=>p.quote),three.map(l=>l.text));
});

test("evidence check: the Final Verdict and planted lies refuse lines that aren't in the story", async()=>{
  const {world,passages,ev,lie,truth,other,otherLine}=await evidenceKit();
  const lines=ev.evidenceLines(world,passages);
  const pick=(id:string)=>lines.find(l=>l.clueId===id)!;
  const clues=world.scenes.flatMap(s=>s.artifacts).map(a=>pick(a.id)).filter((l,i,a)=>a.findIndex(x=>x.text===l.text)===i).slice(0,3);
  assert.deepEqual(ev.verdictPins(world,passages,clues.map(l=>({clue_id:l.clueId,quote:l.text}))),clues.map(l=>({clue_id:l.clueId,quote:l.text})));
  assert.equal(ev.verdictPins(world,passages,[...clues.slice(0,2).map(l=>({clue_id:l.clueId,quote:l.text})),{clue_id:clues[2].clueId,quote:"I made this up."}]),null);
  assert.equal(ev.verdictPins(world,passages,[{clue_id:clues[1].clueId,quote:clues[0].text},...clues.slice(1).map(l=>({clue_id:l.clueId,quote:l.text}))]),null,"quote under another clue");
  assert.equal(ev.verdictPins(world,passages,[clues[0],clues[0],clues[1]].map(l=>({clue_id:l.clueId,quote:l.text}))),null,"the same line twice");
  // Planted lies: the truth line must be exactly one of the clue's evidence lines, in the paragraph named.
  const {plantedLieProblems}=await import("../lib/planted-lies.ts");
  const base={sceneId:world.scenes[0].id,clueId:lie.clue_id,characterId:lie.character_id,sentence:"The schoolmaster packed a golden razor and a brand-new flute.",truthParagraph:lie.truth_paragraph,truthLine:truth};
  assert.deepEqual(plantedLieProblems(world,passages,base),[]);
  assert.match(plantedLieProblems(world,passages,{...base,truthLine:"a broken pitch-pipe."}).join(),/proves it false/,"a fragment of a real line");
  assert.match(plantedLieProblems(world,passages,{...base,truthLine:truth+" And a flute."}).join(),/proves it false/,"an edited line");
  assert.match(plantedLieProblems(world,passages,{...base,truthLine:otherLine.text,truthParagraph:otherLine.pid}).join(),/proves it false|this clue's evidence/,"a line from another clue");
  void other;
});

test("saved proofs: older quotes are upgraded to their exact evidence line, or marked to re-prove", async()=>{
  const {world,passages,ev,lie,truth}=await evidenceKit();
  const id=lie.clue_id;
  // Exact (spacing aside): kept as the world file's line.
  assert.equal(ev.upgradeQuote(world,passages,id,truth.replace(/\s+/g," ")).status,"exact");
  // A fragment that only one evidence line contains: upgraded to that line.
  const frag=ev.upgradeQuote(world,passages,id,"a book of psalm tunes full of dog's-ears");
  assert.equal(frag.status,"upgraded");assert.equal("line" in frag?frag.line.text:"",truth);
  // A whole paragraph saved as the proof contains several lines: no single match.
  const para=passages.find(p=>p.id===lie.truth_paragraph)!.text;
  assert.equal(ev.upgradeQuote(world,passages,id,para).status,"unmatched");
  // Too short, made up, or from another clue's evidence: no match.
  assert.equal(ev.upgradeQuote(world,passages,id,"razor").status,"unmatched");
  assert.equal(ev.upgradeQuote(world,passages,id,"He packed a golden flute and a hat.").status,"unmatched");
  // A phrase in more than one evidence line of the clue is ambiguous.
  const lines=ev.evidenceLines(world,passages,[id]);
  const shared=["the schoolmaster","of the"].find(w=>lines.filter(l=>l.text.toLowerCase().includes(w)).length>1);
  if(shared)assert.equal(ev.upgradeQuote(world,passages,id,shared+" was").status,"unmatched");

  const other=world.scenes[0].artifacts.find(a=>a.id!==id)!;
  const answers={[id]:{notice:"a book of psalm tunes full of dog's-ears",interpret:"It was broken.",craft:""},[other.id]:{notice:"Something nobody wrote.",interpret:"Because.",craft:""},"unproven-clue":{notice:"",interpret:""}};
  const evidence=[{id:"e1",artifactId:id,paragraphId:"p001",text:"a book of psalm tunes full of dog's-ears"}];
  const r=ev.upgradeSavedProofs(world,passages,answers,evidence);
  assert.equal(r.changed,true);
  assert.equal(r.answers[id].notice,truth);assert.equal(r.answers[id].interpret,"It was broken.","the explanation is kept");
  assert.deepEqual(r.evidence[0],{id:"e1",artifactId:id,paragraphId:lie.truth_paragraph,text:truth},"saved evidence follows");
  assert.deepEqual(r.reprove,[other.id]);
  assert.deepEqual(ev.cluesToReprove(world,passages,r.answers),[other.id]);
  assert.deepEqual(ev.cluesToReprove(world,[],r.answers),[],"nothing is marked before the story loads");
  // Running it again changes nothing.
  assert.equal(ev.upgradeSavedProofs(world,passages,r.answers,r.evidence).changed,false);
});

// ---------- Story Mode ----------
async function storyKit(){
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8")));
  const {parseSourcePassages}=await import("../lib/source-passages.ts");
  const passages=parseSourcePassages(await readFile(new URL("../worlds/sleepy-hollow/source.md",import.meta.url),"utf8"));
  const sm=await import("../lib/story-mode.ts");const ev=await import("../lib/evidence-check.ts");const {evidenceSentences}=await import("../lib/lies.ts");
  const scene=world.scenes[0],c=scene.story_mode!;
  const line=(pid:string,i:number)=>evidenceSentences(passages.find(p=>p.id===pid)!.text)[i];
  return {world,passages,sm,ev,scene,c,line};
}
const onTime={elapsedMs:5000,grace:false};

test("story mode content: authored, validated, anchored in scene 1's evidence lines", async()=>{
  const {world,passages,sm,scene,c,ev}=await storyKit();
  assert.deepEqual(sm.storyModeProblems(world,passages),[]);
  assert.equal(c.confront.character_id,"brom-bones","Brom Bones is available in scene 1");
  assert.match(c.confront.line,/\byou\b/i);
  for(const a of c.confront.actions)for(const s of a.supports)assert.ok(sm.sceneEvidence(world,passages,scene,s),`${a.id} support is an evidence line`);
  for(const t of c.call.theories)assert.ok(t.supports.length>=2&&t.supports.every(s=>sm.sceneEvidence(world,passages,scene,s)));
  assert.deepEqual(c.call.theories.map(t=>t.id),world.verdict!.theories.map(t=>t.id),"same theories as the Final Verdict");
  const all=JSON.stringify(c);assert.ok(!all.includes("—"),"no em dashes");
  // A support line that isn't evidence, or a missing confrontation "you", is caught.
  const bad=structuredClone(world);bad.scenes[0].story_mode!.confront.actions[0].supports=["He flew to the moon."];bad.scenes[0].story_mode!.confront.line="He was there.";
  const p=sm.storyModeProblems(bad,passages).join(" | ");assert.match(p,/not one of this scene's evidence lines/);assert.match(p,/speaks to the student/);
  void ev;
});

test("story mode scoring: rounds pay for proof, and speed is small and only on valid proof", async()=>{
  const {world,passages,sm,scene,c,line}=await storyKit();
  const score=(input:Parameters<typeof sm.scoreRound>[3],t=onTime,set:import("../lib/story-mode.ts").TimeSetting="1",pouch:string[]=[])=>sm.scoreRound(world,passages,scene,input,t,set,pouch);
  // Round 1: 100 per evidence line, at most 3, duplicates once.
  const r1=score({kind:"read",pouch:[line("p068",5),line("p068",5),"Not in the story at all.",line("p070",2),line("p069",0)]});
  assert.equal(r1.base,100,"only the first 3 count: the same evidence line twice (once) and one made up");assert.equal(r1.coinsEarned,1);
  assert.equal(score({kind:"read",pouch:[line("p068",5),line("p070",2),line("p069",5)]}).base,300);
  // Round 2: 500 for proof that backs the move, 100 for the move alone, speed only with valid proof.
  const hat=c.confront.actions[0];
  const r2=score({kind:"confront",actionId:hat.id,proof:hat.supports[0]},{elapsedMs:0,grace:false});
  assert.equal(r2.base,500);assert.equal(r2.speed,100);assert.equal(r2.valid,true);
  const wrong=score({kind:"confront",actionId:hat.id,proof:line("p070",2)});assert.deepEqual([wrong.base,wrong.speed,wrong.valid],[100,0,false],"a real line that doesn't back this move");
  assert.equal(score({kind:"confront",actionId:hat.id,proof:""}).base,100);
  // Round 3: 600 with a sound explanation, 300 for the line alone, nothing for a wrong line.
  const truth=line("p069",2);
  assert.equal(score({kind:"lie",line:truth,explanation:"Hans said the pitch-pipe was brand-new, but the story says it was broken."}).base,600);
  assert.equal(score({kind:"lie",line:truth,explanation:"Because."}).base,300);
  const miss=score({kind:"lie",line:line("p069",0),explanation:"Hans lied about the pitch-pipe being new."},{elapsedMs:0,grace:false});assert.deepEqual([miss.base,miss.speed],[0,0]);
  // Round 4: 200 per valid pinned pouch line, plus 200 when both support the theory.
  const pouch=[line("p068",5),line("p069",0),line("p070",2)];
  assert.equal(score({kind:"call",theoryId:"brom-prank",pins:[line("p068",5),line("p069",0)]},onTime,"1",pouch).base,600);
  assert.equal(score({kind:"call",theoryId:"ran-away",pins:[line("p068",5),line("p070",2)]},onTime,"1",pouch).base,400,"valid lines that don't support the theory");
  assert.equal(score({kind:"call",theoryId:"brom-prank",pins:[line("p068",5),line("p069",5)]},onTime,"1",pouch).base,200,"pins must come from the pouch");
  // Reading carefully always pays more than answering fast.
  assert.ok(sm.POINTS.speedMax<sm.POINTS.readLine*1.01&&sm.POINTS.speedMax<sm.POINTS.confrontProof-sm.POINTS.confrontAction);
});

test("story mode timeouts: proof in the grace period earns half and no speed bonus", async()=>{
  const {world,passages,sm,scene,c,line}=await storyKit();
  const grace={elapsedMs:65000,grace:true};
  const hat=c.confront.actions[0];
  const r=sm.scoreRound(world,passages,scene,{kind:"confront",actionId:hat.id,proof:hat.supports[0]},grace,"1");
  assert.deepEqual([r.base,r.speed,r.valid],[250,0,true]);
  assert.equal(sm.scoreRound(world,passages,scene,{kind:"read",pouch:[line("p068",5)]},grace,"1").base,50);
  assert.equal(sm.GRACE_SECONDS,20);
});

test("story mode streaks, coins and power-ups", async()=>{
  const {sm}=await storyKit();
  const ok=(base:number,coins=1,speed=0)=>({kind:"read" as const,base,speed,valid:true,coinsEarned:coins,detail:"",choice:"",proof:[]});
  const bad={kind:"read" as const,base:100,speed:0,valid:false,coinsEarned:0,detail:"",choice:"",proof:[]};
  let s=sm.newRun();
  s=sm.applyRound(s,ok(100));assert.deepEqual([s.rounds[0].multiplier,s.total,s.streak],[1,100,1]);
  s=sm.applyRound(s,ok(100));assert.deepEqual([s.rounds[1].multiplier,s.total],[1.2,220]);
  s=sm.applyRound(s,ok(100));assert.equal(s.rounds[2].multiplier,1.5);
  s=sm.applyRound(s,ok(100));assert.equal(s.rounds[3].multiplier,1.5,"capped at x1.5");
  assert.equal(s.bestStreak,4);assert.equal(s.coins,4);
  s=sm.applyRound(s,bad);assert.deepEqual([s.streak,s.rounds[4].multiplier,s.bestStreak],[0,1,4],"an invalid round resets the streak");
  // Power-ups cost coins and last one round.
  let r=sm.newRun();r={...r,coins:3};
  assert.equal(sm.buy({...r,coins:1},"lantern"),"You need 2 coins for Lantern.");
  const lit=sm.buy(r,"lantern") as typeof r;assert.deepEqual([lit.coins,lit.lantern],[1,true]);
  const after=sm.applyRound(lit,ok(100,0));assert.equal(after.lantern,false,"the Lantern lights one round");
  assert.equal((sm.buy({...r,coins:1},"second-look") as typeof r).coins,0);
  const dd=sm.buy(r,"double-down") as typeof r;assert.deepEqual([dd.coins,dd.doubleDown],[0,true]);
  const won=sm.applyRound(dd,ok(500,1,80));assert.deepEqual([won.rounds[0].points,won.rounds[0].doubled],[1160,true],"(500+80) doubled");
  const lost=sm.applyRound(dd,{...bad,speed:40});assert.deepEqual([lost.rounds[0].points,lost.rounds[0].speed,lost.doubleDown],[100,0,false],"no proof: no doubling, speed lost");
  // The trust meter and the pouch are saved on the run.
  const t=sm.applyRound(sm.newRun(),ok(500),{trust:{characterId:"brom-bones",delta:-1},pouch:["a","b","a","c","d"]});
  assert.deepEqual(t.trust,{"brom-bones":-1});assert.deepEqual(t.pouch,["a","b","c"]);
});

test("story mode extended time: the timer stretches and the speed bonus is measured against the student's own time", async()=>{
  const {sm}=await storyKit();
  assert.equal(sm.phaseSeconds(60,"1"),60);assert.equal(sm.phaseSeconds(60,"1.5"),90);assert.equal(sm.phaseSeconds(60,"2"),120);assert.equal(sm.phaseSeconds(60,"untimed"),null);
  // Answering at the same share of your own time earns the same bonus.
  assert.equal(sm.speedBonus(30000,60,"1"),50);assert.equal(sm.speedBonus(60000,60,"2"),50);assert.equal(sm.speedBonus(45000,60,"1.5"),50);
  assert.equal(sm.speedBonus(120000,60,"untimed"),0);assert.equal(sm.speedBonus(60000,60,"untimed"),50);
  assert.equal(sm.speedBonus(-5,60,"1"),0);
  // Screen readers hear the time at 30, 10 and 5 seconds, never every second.
  assert.equal(sm.timeAnnouncement(31,30),"30 seconds left");assert.equal(sm.timeAnnouncement(30,29),"");assert.equal(sm.timeAnnouncement(11,9),"10 seconds left");assert.equal(sm.timeAnnouncement(6,5),"5 seconds left");
});

test("story mode leaderboard: students see the top 5 and their own rank, never the full list", async()=>{
  const {sm}=await storyKit();
  const rows=["Ana R","Ben T","Cy L","Di M","Ed K","Flo P","Gus Q","Hal Z"].map((n,i)=>({id:`s${i}`,name:sm.boardName(n),score:1000-i*100}));
  const me=sm.studentBoard(rows,"s6",9);
  assert.equal(me.top.length,5);assert.deepEqual(me.top.map(r=>r.name),["Ana R.","Ben T.","Cy L.","Di M.","Ed K."]);
  assert.deepEqual(me.me,{rank:7,score:400,movement:2},"+2 spots");
  assert.ok(!JSON.stringify(me).includes("Flo")&&!JSON.stringify(me).includes("Hal"),"no one outside the top 5 but me");
  assert.equal(sm.studentBoard(rows,"s1").top.find(r=>r.me)?.name,"Ben T.");
  assert.equal(sm.boardName("  rosa   maria  p "),"rosa P.");assert.equal(sm.boardName("Jo"),"Jo");
  // Class pulse: percentages and the strongest line on each side, never student writing.
  const pulse=sm.classPulse([{choice:"a",valid:true,proof:["L1"]},{choice:"a",valid:true,proof:["L1"]},{choice:"a",valid:false,proof:["L2"]},{choice:"b",valid:true,proof:["L3"]}],[{key:"a",label:"A"},{key:"b",label:"B"},{key:"c",label:"C"}]);
  assert.deepEqual(pulse.map(p=>[p.key,p.pct,p.strongest]),[["a",75,"L1"],["b",25,"L3"],["c",0,""]]);
});
