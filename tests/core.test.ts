import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {WorldPackSchema} from "../lib/world-schema.ts";
import {screenBoardText,screenMessage} from "../lib/safety.ts";
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
  assert.equal(SubmissionSchema.safeParse({heardFrom:"fellowship",feedback:{ease:4,change:"More stories"}}).success,true);
  assert.equal(SubmissionSchema.safeParse({heardFrom:"fellowship",feedback:{}}).success,false,"empty feedback alone is rejected");
  const w={plan:"school",intent:"likely",lockFoundingPrice:false,wantsUpdates:false,name:"Pat Lee",email:"pat@example.test",students:300};
  assert.equal(SubmissionSchema.safeParse({heardFrom:"fellowship",waitlist:w,source:"fellows"}).success,true);
  assert.equal(SubmissionSchema.safeParse({heardFrom:"fellowship",waitlist:{...w,email:"pat@"}}).success,false,"invalid email");
  assert.equal(SubmissionSchema.safeParse({heardFrom:"fellowship",waitlist:{...w,students:undefined}}).success,false,"school needs a student count");
  assert.equal(SubmissionSchema.safeParse({heardFrom:"fellowship",waitlist:{...w,plan:"explorer",students:undefined}}).success,true,"explorer does not");
  assert.equal(SubmissionSchema.safeParse({heardFrom:"fellowship",waitlist:{...w,intent:undefined}}).success,false,"intent is required");
  assert.equal(SubmissionSchema.safeParse({heardFrom:"fellowship",waitlist:w,source:"Bad Ref!"}).success,false,"ref values are slugs only");
  assert.equal(SubmissionSchema.safeParse({waitlist:w}).success,false,"how they heard about Text Lab is required");
  assert.equal(SubmissionSchema.safeParse({heardFrom:"radio",feedback:{ease:4}}).success,false,"only the listed answers");
});

test("how did you hear: old ?ref= links preselect the matching answer", async()=>{
  const {heardFromRef,heardChoices}=await import("../lib/feedback.ts");
  assert.deepEqual(heardChoices.map(c=>c[1]),["Fellowship cohort","Women's group","Homeschool group","Mentor or educator network","Social media","Other"]);
  assert.equal(heardFromRef("fellows"),"fellowship");
  assert.equal(heardFromRef("womens-group"),"womens-group");
  assert.equal(heardFromRef("homeschool-coop"),"homeschool");
  assert.equal(heardFromRef("educators"),"mentor-network");
  assert.equal(heardFromRef("instagram"),"social-media");
  assert.equal(heardFromRef("x"),"social-media");
  assert.equal(heardFromRef("newsletter"),undefined,"an unknown ref leaves the question unanswered");
  assert.equal(heardFromRef(null),undefined);
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

test("Spot the Lie: the right line catches it; a wrong line names the topic; two misses name the paragraph", async()=>{
  const {tryLine,testimonyParts,isTruthLine}=await import("../lib/lies.ts");
  const {world}=await storyWorld("sleepy-hollow");
  const lie=world.scenes[0].lie!;
  assert.equal(lie.character_id,"hans-van-ripper");
  let r=tryLine(lie,"The brook was searched, but the body of the schoolmaster was not to be discovered.",0);
  assert.deepEqual(r,{result:"miss",misses:1,message:"Not quite. Look for a line about what was in Ichabod's bundle."});
  r=tryLine(lie,"Hans Van Ripper as executor of his estate, examined the bundle which contained all his worldly effects.",r.misses);
  assert.equal(r.result,"miss");
  assert.deepEqual(r,{result:"miss",misses:2,message:"Not quite. Look for a line about what was in Ichabod's bundle. Look again in ¶69."},"the paragraph is named, never highlighted");
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

test("Spot the Lie hint: a miss names the detail, two misses name the paragraph, and no line is ever highlighted", async()=>{
  const {tryLine,hintFor,isHighlighted,evidenceSentences,isTruthLine}=await import("../lib/lies.ts");
  const {parseSourcePassages}=await import("../lib/source-passages.ts");
  const world=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/sleepy-hollow/world.json",import.meta.url),"utf8")));
  const passages=parseSourcePassages(await readFile(new URL("../worlds/sleepy-hollow/source.md",import.meta.url),"utf8"));
  const evidenceOf=(sceneIndex:number)=>{const s=world.scenes[sceneIndex];const clue=s.artifacts.find(a=>a.id===s.lie!.clue_id)!;return passages.filter(p=>clue.source_anchor.includes(p.id))};
  // Scene 1: Ichabod's belongings has one paragraph (¶69, six lines); the answer is line 3.
  const lie=world.scenes[0].lie!,evidence=evidenceOf(0);
  assert.equal(evidence.length,1);
  let r=tryLine(lie,"not this line",0,evidence);assert.equal(r.result==="miss"&&r.highlight,undefined,"no highlight after one miss");
  assert.ok(r.result==="miss"&&!r.message.includes("¶"));
  r=tryLine(lie,"not this line either",1,evidence);
  const lines=evidenceSentences(evidence[0].text);
  assert.ok(r.result==="miss"&&r.highlight===undefined,"never a highlight");
  assert.match(r.result==="miss"?r.message:"",/Look again in ¶69\./);
  assert.ok(isTruthLine(lie,lines[2]));void isHighlighted;
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

test("what's your angle: characters hear only the part and how the student plays, and the teacher's settings turn roles and angles off", async()=>{
  const sr=await import("../lib/student-role.ts");
  const world=await roleWorld("sleepy-hollow");
  const p=sr.personaPrompt(world,{firedUpBy:"underestimated",lane:"music",style:"rival"});
  assert.match(p,/newest student in Ichabod's class/);assert.match(p,/rival/);
  assert.doesNotMatch(p,/underestimated/,"interest answers never reach a character");assert.doesNotMatch(p,/music/);
  assert.match(p,/must still come from the source passages/);
  assert.equal(sr.personaPrompt(world,{lane:"music"},{rolesOn:false,anglesOn:false}),"");
  assert.doesNotMatch(sr.personaPrompt(world,{style:"rival"},{rolesOn:true,anglesOn:false}),/rival/);
  assert.doesNotMatch(sr.personaPrompt(world,null,{rolesOn:false,anglesOn:true}),/playing a part/);
  // Anything but the listed choices is refused: no free text can ride along.
  assert.equal(sr.AngleSchema.safeParse({lane:"my name is Sam"}).success,false);
  assert.equal(sr.AngleSchema.safeParse({lane:"music",note:"hi"}).success,false);
  assert.equal(sr.personaPrompt(world,{lane:"I live on Elm St"} as never).includes("Elm"),false);
  assert.equal(sr.choiceFrame(world,world.scenes[0].choice_point,{rolesOn:false,anglesOn:true}),"");
  assert.equal(sr.ANGLE_STEPS.length,3);
  assert.deepEqual(Object.values(sr.ANGLE_OPTIONS.firedUpBy.options),["Unfairness","Being underestimated","Loyalty","Winning","Money"]);
  assert.deepEqual(Object.values(sr.ANGLE_OPTIONS.lane.options),["Sports","Music","Gaming","Fashion","Social media"]);
  assert.deepEqual(Object.values(sr.ANGLE_OPTIONS.style.options),["Solo","Rival","Squad","Proof Race"]);
  assert.equal(sr.ANGLE_OPTIONS.style.label,"How do you want to play?");
  assert.deepEqual([sr.PLAY_STEP,...sr.INTEREST_STEPS],["style","firedUpBy","lane"],"play mode before the game; interests before Your Turn");
  assert.deepEqual(sr.UNLOCK,{title:"Unlock your challenge",line:"Two quick taps and we'll pick a challenge that fits you."});
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

test("story mode content: four banks, validated, anchored in scene 1's evidence lines", async()=>{
  const {world,passages,sm,scene,c}=await storyKit();
  assert.deepEqual(sm.storyModeProblems(world,passages),[]);
  assert.deepEqual([c.read.bank.length,c.infer.bank.length,sm.sceneLies(scene).length,c.call.bank.length],[3,3,3,3],"3 questions per round");
  assert.equal(c.infer.character_id,"brom-bones","Brom Bones asks in round 2");
  assert.deepEqual(c.call.bank[0].theories.map(t=>t.id),world.verdict!.theories.map(t=>t.id),"the first case question uses the Final Verdict's theories");
  assert.ok(!JSON.stringify(c).includes("—"),"no em dashes");
  // validate:worlds catches an answer that isn't exact and a question that gives its answer away.
  const bad=structuredClone(world);const b=bad.scenes[0].story_mode!;
  b.infer.bank[0].answers[0].line=b.infer.bank[0].answers[0].line.replace("pumpkin","squash");
  b.read.bank[0].focus="Tap 3 lines about the bundle he left";
  const p=sm.storyModeProblems(bad,passages).join(" | ");
  assert.match(p,/not copied exactly/);assert.match(p,/shares key words with its answers \(bundl/);
});

test("fair play rules: word roots, exact words, hints, question picks, goal levels and speed flags", async()=>{
  const fp=await import("../lib/fair-play.ts");const {passages,line,world}=await storyKit();
  // Word roots: "belongings" and "belonged" are the same word; names never count.
  assert.equal(fp.wordRoot("belongings"),fp.wordRoot("belonged"));
  const names=fp.nameWords(world);
  assert.deepEqual(fp.sharedRoots("Which belongings did he leave?",[line("p069",3)],names),[fp.wordRoot("belonged")]);
  assert.deepEqual(fp.sharedRoots("What did Ichabod own?",[line("p069",2)],names),[],"a name in both is fine");
  assert.deepEqual(fp.sharedRoots("What was found on the stream bank?",[line("p068",5)],names,["found","bank"]),[],"reviewed exceptions");
  // Exact words: Irving's "--" stands alone; any span holding a key phrase counts, a span missing it doesn't.
  const l=line("p067",9),r=fp.phraseRange(l,"he was tumbled headlong into the dust")!;
  assert.ok(r);assert.equal(fp.lineTokens(l).slice(r[0],r[1]+1).join(" "),"he was tumbled headlong into the dust,");
  const ans={phrase:"he was tumbled headlong into the dust",key:"tumbled headlong"};
  assert.equal(fp.phraseMatches(l,ans,[r[0]-2,r[1]+2]),true);assert.equal(fp.phraseMatches(l,ans,[r[0]+2,r[0]+3]),true,"just the key words");
  assert.equal(fp.phraseMatches(l,ans,[r[0]+3,r[1]]),false,"misses the key words");
  // The demo's pumpkin: "a shattered pumpkin" holds the key.
  const pl=line("p068",5),pr=fp.phraseRange(pl,"a shattered pumpkin")!;
  assert.equal(fp.phraseMatches(pl,{phrase:"close beside it a shattered pumpkin",key:"shattered pumpkin"},pr),true);
  assert.equal(fp.needsPhrase(line("p068",5)),true);assert.equal(fp.needsPhrase(line("p069",1)),false);
  // Tries: full, half, none; wrong lines cost 25, never below 0.
  assert.deepEqual([1,2,3,4].map(fp.tryFactor),[1,0.5,0,0]);
  assert.equal(fp.afterWrongLines(100,2),50);assert.equal(fp.afterWrongLines(40,3),0);
  // Hints: try 2 names the paragraph; try 3 names the part of it. The line itself never appears.
  const target={pid:"p069",line:line("p069",5)};
  assert.equal(fp.missHint(2,target,passages),"Not that one. Look again in ¶69.");
  assert.equal(fp.missHint(3,target,passages),"Look in the last part of ¶69.");
  assert.equal(fp.missHint(2,target,passages,"That saddle was Hans's, not Ichabod's. Check ¶69."),"That saddle was Hans's, not Ichabod's. Check ¶69.");
  // Picks: a replay gets an unseen question; neighbors in the roster get different ones; a squad chunk is respected.
  const bank=[{id:"a",pids:["p1"]},{id:"b",pids:["p2"]},{id:"c",pids:["p3"]}];
  assert.equal(fp.pickQuestion(bank,{seed:"x",seen:["a","b"]}).id,"c");
  assert.notEqual(fp.pickQuestion(bank,{seed:"x",seat:0}).id,fp.pickQuestion(bank,{seed:"x",seat:1}).id);
  assert.equal(fp.pickQuestion(bank,{seed:"x",chunk:["p2"],answerPids:q=>q.pids}).id,"b");
  // Goal levels at 40%, 70% and 90%.
  assert.deepEqual([399,400,700,900,1000].map(t=>fp.levelFor(t,1000)?.id??null),[null,"opened","built","cracked","cracked"]);
  // Speed flags (teacher only): a tap within 4 seconds, more than 4 swaps.
  assert.deepEqual(fp.speedFlags(3000,5),["fast","swaps"]);assert.deepEqual(fp.speedFlags(9000,4),[]);
  // Prove it: a stable shuffle with all four; a typed proof needs both blanks.
  const p={right:"R",wrong:["W1","W2","W3"]};
  assert.deepEqual(fp.proveChoices(p,"s").slice().sort(),["R","W1","W2","W3"]);assert.deepEqual(fp.proveChoices(p,"s"),fp.proveChoices(p,"s"));
  assert.equal(fp.typedProof("he left","his pay was gone"),"This proves he left because his pay was gone");assert.equal(fp.typedProof("x",""),"");
});

const PICKS={read:"left-behind",confront:"person",lie:"lie",call:"what-happened"} as const;
test("story mode round 1, locate: lines lock as they're found, Not yet in between, the rest shown after three misses", async()=>{
  const {world,passages,sm,scene,line}=await storyKit();
  const go=(a:import("../lib/story-mode.ts").Attempt,pouch:string[],extra={})=>sm.attemptRound(world,passages,scene,PICKS,a,{kind:"read",pouch,...extra},{seed:"t"});
  // All three on the first try: 300.
  const full=go(sm.newAttempt(),[line("p068",5),line("p069",1),line("p069",2)]);
  assert.ok(full.status==="done");if(full.status==="done")assert.deepEqual([full.score.base,full.score.valid,full.score.tries],[300,true,0]);
  // Two right and a saddle line: Not yet, try 2, with the saddle hint; the two right lines stay locked.
  const t1=go(sm.newAttempt(),[line("p068",5),line("p069",1),line("p068",0)]);
  assert.ok(t1.status==="notYet");if(t1.status!=="notYet")return;
  assert.equal(t1.tryNo,2);assert.match(t1.hint,/That saddle was Hans's, not Ichabod's\. Check ¶69\./);assert.match(t1.hint,/One more line to find/);
  assert.equal(t1.attempt.locked.length,2);
  // The third line on try 2: 100 + 100 + 50, minus 25 for the wrong line.
  const t2=go(t1.attempt,[line("p068",5),line("p069",1),line("p069",3)]);
  assert.ok(t2.status==="done");if(t2.status==="done")assert.deepEqual([t2.score.base,t2.score.valid,t2.score.wrong],[225,true,1]);
  // Three misses: the rest are shown, the round isn't valid, and the pouch still gets the answer lines.
  let a=sm.newAttempt();for(let i=0;i<2;i++){const r=go(a,[line("p070",0)]);assert.ok(r.status==="notYet");if(r.status==="notYet")a=r.attempt}
  const last=go(a,[line("p070",0)]);
  assert.ok(last.status==="done");if(last.status==="done"){assert.deepEqual([last.score.base,last.score.valid,last.score.shown],[0,false,true]);assert.equal(last.shown!.length,3);assert.equal(last.score.proof.length,3)}
  // Speed flags ride along for the teacher: a tap 2 seconds in, 6 swaps.
  const flagged=go(sm.newAttempt(),[line("p068",5),line("p069",1),line("p069",2)],{firstTapMs:2000,swaps:6});
  if(flagged.status==="done")assert.deepEqual(flagged.score.flags,["fast","swaps"]);
});

test("story mode round 2, infer: the line, its exact words, then Prove it; Brom's trust falls on each miss", async()=>{
  const {world,passages,sm,scene,line}=await storyKit();const fp=await import("../lib/fair-play.ts");
  const q=sm.inferQ(scene,PICKS),answer=q.answers[0];
  const go=(a:import("../lib/story-mode.ts").Attempt,input:Omit<Extract<import("../lib/story-mode.ts").RoundInput,{kind:"confront"}>,"kind">)=>sm.attemptRound(world,passages,scene,PICKS,a,{kind:"confront",...input},{seed:"t"});
  // A wrong line: Not yet, trust down.
  const m1=go(sm.newAttempt(),{line:line("p070",2)});
  assert.ok(m1.status==="notYet");if(m1.status!=="notYet")return;
  assert.equal(m1.attempt.trust,-1);assert.match(m1.hint,/That's what the town believed/);
  // The right line (over 25 words): mark the words next.
  const s1=go(m1.attempt,{line:answer.line});assert.ok(s1.status==="next"&&s1.step==="phrase");if(s1.status!=="next")return;
  const range=fp.phraseRange(answer.line,answer.phrase!)!;
  // Words that miss the proof: mark again, with no try, no trust lost and no reaction.
  const m2=go(s1.attempt,{line:answer.line,marked:[0,5]});assert.ok(m2.status==="next"&&m2.step==="phrase");if(m2.status!=="next")return;
  assert.equal(m2.note,fp.MARK_AGAIN);assert.deepEqual([m2.attempt.tries,m2.attempt.trust],[s1.attempt.tries,s1.attempt.trust]);
  // Any span holding a key phrase counts: the whole line, or just the key words.
  for(const k of fp.phraseKeys(answer)){const kr=fp.phraseRange(answer.line,k)!;const ok=go(m2.attempt,{line:answer.line,marked:kr});assert.ok(ok.status==="next"&&ok.step==="prove",k)}
  const whole=go(m2.attempt,{line:answer.line,marked:[0,fp.lineTokens(answer.line).length-1]});assert.ok(whole.status==="next"&&whole.step==="prove");
  const s2=go(m2.attempt,{line:answer.line,marked:range});assert.ok(s2.status==="next"&&s2.step==="prove"&&s2.choices!.length===4);if(s2.status!=="next")return;
  // Wrong choices are misses: the third miss shows the answer and Prove it still comes.
  const m3=go(s2.attempt,{line:answer.line,prove:{choice:q.prove.wrong[0]}});assert.ok(m3.status==="notYet");if(m3.status!=="notYet")return;
  const shown=go(m3.attempt,{line:answer.line,prove:{choice:q.prove.wrong[1]}});
  assert.ok(shown.status==="next"&&shown.step==="prove"&&shown.shown?.length===1);if(shown.status!=="next")return;
  const done=go(shown.attempt,{line:answer.line,prove:{choice:q.prove.right}});
  assert.ok(done.status==="done");if(done.status==="done")assert.deepEqual([done.score.base,done.score.valid,done.score.shown],[0,false,true]);
  // First try, right words, right choice: 400. A typed proof is accepted and saved, never scored as text.
  const a=go(sm.newAttempt(),{line:answer.line});if(a.status!=="next")return assert.fail("phrase step");
  const b=go(a.attempt,{line:answer.line,marked:range});if(b.status!=="next")return assert.fail("prove step");
  const c1=go(b.attempt,{line:answer.line,prove:{choice:q.prove.right}});assert.ok(c1.status==="done"&&c1.score.base===400&&c1.score.valid);
  const c2=go(b.attempt,{line:answer.line,prove:{proves:"someone was there",because:"a ghost wouldn't leave a pumpkin"}});
  assert.ok(c2.status==="done"&&c2.score.typed==="This proves someone was there because a ghost wouldn't leave a pumpkin");
});

test("story mode rounds 3 and 4: the lie's line then why; a case needs two supporting lines", async()=>{
  const {world,passages,sm,scene,line}=await storyKit();
  const lie=(a:import("../lib/story-mode.ts").Attempt,l:string,explanation?:string)=>sm.attemptRound(world,passages,scene,PICKS,a,{kind:"lie",line:l,explanation},{seed:"t"});
  const hit=lie(sm.newAttempt(),scene.lie!.truth_line);assert.ok(hit.status==="next"&&hit.step==="explain");if(hit.status!=="next")return;
  const sound=lie(hit.attempt,scene.lie!.truth_line,"Hans said the pitch-pipe was brand-new, but the story says it was broken.");
  assert.ok(sound.status==="done"&&sound.score.base===600);
  assert.ok(lie(hit.attempt,scene.lie!.truth_line,"").status==="invalid","say why first");
  const miss=lie(sm.newAttempt(),line("p069",0));assert.ok(miss.status==="notYet"&&/Look again in ¶69/.test(miss.hint));
  const call=(a:import("../lib/story-mode.ts").Attempt,theoryId:string,pins:string[],extra={})=>sm.attemptRound(world,passages,scene,PICKS,a,{kind:"call",theoryId,pins,...extra},{seed:"t"});
  const th=sm.callQ(scene,PICKS).theories[0];
  const right=call(sm.newAttempt(),th.id,th.supports.slice(0,2));assert.ok(right.status==="done"&&right.score.base===600&&right.score.choice===`what-happened|${th.id}`);
  const wrong=call(sm.newAttempt(),th.id,[line("p068",1),line("p068",2)]);assert.ok(wrong.status==="notYet");
  // A try whose time ran out with nothing locked in is a miss, not an error.
  assert.equal(call(sm.newAttempt(),"",[],{timeout:true}).status,"notYet");
  assert.equal(call(sm.newAttempt(),"",[]).status,"invalid");
});

test("story mode points: streaks, Double down (doubled, or the bet comes off), coins, and the points possible", async()=>{
  const {sm}=await storyKit();
  const score=(base:number,valid=true,kind:import("../lib/story-mode.ts").RoundKind="read")=>({kind,base,speed:0,valid,coinsEarned:valid?1:0,detail:"",choice:"",proof:[],tries:0,wrong:0,shown:!valid,qid:"q"});
  let s=sm.newRun();
  s=sm.applyRound(s,score(100));assert.deepEqual([s.rounds[0].multiplier,s.total,s.streak],[1,100,1]);
  s=sm.applyRound(s,score(100));assert.deepEqual([s.rounds[1].multiplier,s.total],[1.2,220]);
  s=sm.applyRound(s,score(100));assert.equal(s.rounds[2].multiplier,1.5);
  s=sm.applyRound(s,score(100,false));assert.deepEqual([s.streak,s.rounds[3].multiplier,s.bestStreak],[0,1,3],"an invalid round resets the streak");
  // Power-ups cost coins and last one round.
  let r=sm.newRun();r={...r,coins:3};
  assert.equal(sm.buy({...r,coins:1},"lantern"),"You need 2 coins for Lantern.");
  const lit=sm.buy(r,"lantern") as typeof r;assert.deepEqual([lit.coins,lit.lantern],[1,true]);
  assert.equal(sm.applyRound(lit,score(100)).lantern,false,"the Lantern lights one round");
  assert.match(sm.POWER_UPS.lantern.what,/Names the paragraph/);assert.match(sm.POWER_UPS["double-down"].what,/you lose the points you bet/);
  // Double down: valid doubles; invalid takes the round's most off the total (never below 0).
  const dd={...(sm.buy(r,"double-down") as typeof r),total:900};
  const won=sm.applyRound(dd,score(400,true,"confront"));assert.deepEqual([won.rounds[0].points,won.rounds[0].doubled,won.total],[800,true,1700]);
  const lost=sm.applyRound(dd,score(0,false,"lie"));assert.deepEqual([lost.rounds[0].lost,lost.total],[600,300]);
  assert.equal(sm.applyRound({...dd,total:100},score(0,false,"lie")).total,0);
  // The points possible: every round right on the first try, no power-ups.
  assert.equal(sm.maxPoints(),300+Math.round(400*1.2)+Math.round(600*1.5)+Math.round(600*1.5));
  assert.equal(sm.maxPoints(2),600+Math.round(600*1.2),"starting at round 3");
  // Trust and the pouch are saved on the run.
  const t=sm.applyRound(sm.newRun(),score(500),{trust:{characterId:"brom-bones",delta:-1},pouch:["a","b","a","c","d"]});
  assert.deepEqual(t.trust,{"brom-bones":-1});assert.deepEqual(t.pouch,["a","b","c"]);
  // Time: the timer stretches; screen readers hear 30, 10 and 5 seconds only.
  assert.equal(sm.phaseSeconds(60,"1.5"),90);assert.equal(sm.phaseSeconds(60,"untimed"),null);
  assert.equal(sm.timeAnnouncement(31,30),"30 seconds left");assert.equal(sm.timeAnnouncement(30,29),"");
});

test("story mode leaderboard: students see the top 5 and their own rank; the pulse waits for 5 players", async()=>{
  const {sm}=await storyKit();
  const rows=["Ana R","Ben T","Cy L","Di M","Ed K","Flo P","Gus Q","Hal Z"].map((n,i)=>({id:`s${i}`,name:sm.boardName(n),score:1000-i*100}));
  const me=sm.studentBoard(rows,"s6",9);
  assert.equal(me.top.length,5);assert.deepEqual(me.me,{rank:7,score:400,movement:2},"+2 spots");
  assert.ok(!JSON.stringify(me).includes("Flo")&&!JSON.stringify(me).includes("Hal"),"no one outside the top 5 but me");
  assert.equal(sm.boardName("  rosa   maria  p "),"rosa P.");
  const opts=[{key:"a",label:"A"},{key:"b",label:"B"}];
  const four=[{choice:"a",valid:true,proof:["L1"]},{choice:"a",valid:true,proof:["L1"]},{choice:"b",valid:true,proof:["L3"]},{choice:"a",valid:false,proof:["L2"]}];
  assert.deepEqual(sm.classPulse(four,opts),[],"one player never shows as 100%");
  const five=[...four,{choice:"b",valid:true,proof:["L3"]}];
  assert.deepEqual(sm.classPulse(five,opts).map(p=>[p.key,p.pct,p.strongest]),[["a",60,"L1"],["b",40,"L3"]]);
});

test("story mode server: questions picked per run, Not yet saves nothing, late first tries score half, boards", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {world,passages,scene,line,sm}=await storyKit();
  const {memoryStoryStore}=await import("../lib/story-store.ts");const srv=await import("../lib/story-server.ts");
  const store=memoryStoryStore({runs:[],rounds:[]});
  const who=(i:number)=>({scope:"class" as const,classId:"c1",worldId:world.id,studentId:`st${i}`,nickname:["Ana Ruiz","Ben Tate","Cy Lu","Di Moss","Ed Kim","Flo Park","Gus Quinn"][i],timeSetting:"1" as const,leaderboard:"individual" as const,seat:i});
  const [a,b]=await Promise.all([srv.startRun(store,world,scene,who(0)),srv.startRun(store,world,scene,who(0))]);
  assert.equal((a as {id:string}).id,(b as {id:string}).id,"two starts at once make one run");
  let run=a as import("../lib/story-store.ts").StoryRun;
  assert.ok(run.state.picks,"questions are picked when the run starts");
  const neighbor=(await srv.startRun(store,world,scene,who(1))) as import("../lib/story-store.ts").StoryRun;
  assert.notEqual(neighbor.state.picks!.read,run.state.picks!.read,"the student beside you gets a different question");
  const play=async(body:Parameters<typeof srv.playRound>[5])=>{const r=await srv.playRound(store,world,passages,scene,run,body);if(r.run)run=r.run;return r};
  assert.deepEqual(await play({round:2,input:{kind:"confront",line:""},elapsedMs:0,grace:false,relaxed:false}),{error:"That round is already scored."},"rounds go in order");
  const q=sm.readQ(scene,run.state.picks);
  // A miss: Not yet, nothing scored, and the client never sees the answers.
  const miss=await play({round:1,input:{kind:"read",pouch:[q.answers[0],line("p070",0)]},elapsedMs:30000,grace:false,relaxed:false});
  assert.ok("notYet" in miss&&miss.notYet&&miss.notYet.tryNo===2);assert.equal(run.state.round,0);
  assert.ok(!JSON.stringify(srv.publicRun(run)).includes("attempt"),"the round in progress stays on the server");
  assert.equal(srv.resumeRound(scene,run)!.tryNo,2,"a reload picks up at try 2");
  const done=await play({round:1,input:{kind:"read",pouch:q.answers.slice(0,3)},elapsedMs:5000,grace:false,relaxed:false});
  assert.ok("record" in done&&done.record);if(!("record" in done)||!done.record)return;
  assert.equal(done.record.points,afterWrong(100+50+50,1),"first line on try 1, the other two on try 2, one wrong line");assert.equal(run.state.round,1);
  // Round 2, first try at 100 seconds of a 90-second round: half points.
  const iq=sm.inferQ(scene,run.state.picks),ans=iq.answers[0];
  const fp=await import("../lib/fair-play.ts");
  const s1=await play({round:2,input:{kind:"confront",line:ans.line},elapsedMs:100000,grace:false,relaxed:false});
  if(fp.needsPhrase(ans.line))await play({round:2,input:{kind:"confront",line:ans.line,marked:fp.phraseRange(ans.line,ans.phrase!)!},elapsedMs:0,grace:false,relaxed:false});
  void s1;
  const r2=await play({round:2,input:{kind:"confront",line:ans.line,prove:{choice:iq.prove.right}},elapsedMs:0,grace:false,relaxed:false});
  assert.ok("record" in r2&&r2.record);if("record" in r2&&r2.record){assert.equal(r2.record.base,200,"late first try: half of 400");assert.equal(r2.reaction?.trust,1)}
  assert.equal(run.state.trust["brom-bones"],1);
  // Seven students: each sees the top 5 and their own rank; the teacher sees everyone, with tries and shown answers.
  for(let i=2;i<7;i++){const r=(await srv.startRun(store,world,scene,who(i))) as import("../lib/story-store.ts").StoryRun;const rq=sm.readQ(scene,r.state.picks);await srv.playRound(store,world,passages,scene,r,{round:1,input:{kind:"read",pouch:rq.answers.slice(0,3)},elapsedMs:1000,grace:false,relaxed:false})}
  const board=await srv.boardFor(store,run,"individual",null);
  assert.equal(board!.top.length,5);assert.equal(board!.players,7);
  const teacher=await srv.teacherBoard(store,"c1",world,scene);const ana=teacher.find(t=>t.nickname==="Ana Ruiz")!;
  assert.equal(ana.rounds[0].tries,1);assert.equal(ana.max,sm.maxPoints());
  const pulse=await srv.pulseFor(store,run,scene,1) as {pulse:unknown[];answered:number};assert.equal(pulse.answered,6);assert.equal(pulse.pulse.length,2);
  // Playing again keeps the best score and gives questions not seen yet.
  const again=(await srv.startRun(store,world,scene,who(0),true)) as import("../lib/story-store.ts").StoryRun;
  assert.equal(again.state.round,0);assert.equal(again.bestTotal,run.bestTotal);assert.notEqual(again.state.picks!.read,run.state.picks!.read);
});
const afterWrong=(p:number,w:number)=>Math.max(0,p-25*w);

test("story mode live: shared questions, retries until the timer, the answer revealed on the board", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {line,scene,sm}=await storyKit();
  const {memoryLiveStore}=await import("../lib/live/store.ts");const server=await import("../lib/live/server.ts");const ls=await import("../lib/live/story.ts");
  const store=memoryLiveStore({sessions:[],squads:[],players:[],responses:[]});
  const s=await store.createSession({code:"STORY1",teacherId:null,classId:null,demo:true,worldId:"sleepy-hollow",status:"lobby",paused:false,roundIndex:-1,rounds:[],roundStartedAt:null,hostHash:"x",expiresAt:new Date(Date.now()+36e5).toISOString()});
  const ids:string[]=[];
  for(const n of ["Detective Owl","Inspector Fox","Sleuth Raven"]){const r=await server.join(store,s,{nickname:n,studentId:null});ids.push(r.player!.id)}
  let st=(await server.loadState(store,s.id))!;await server.hostAct(store,st,{action:"squads.auto"});st=(await server.loadState(store,s.id))!;
  assert.equal(await server.hostAct(store,st,{action:"round.start",type:"story"}),null);st=(await server.loadState(store,s.id))!;
  const act=async(pid:string,input:unknown,deps={judgeAllowed:async()=>false})=>{st=(await server.loadState(store,s.id))!;return server.playerAct(store,st,pid,{kind:"story",payload:{input}},deps)};
  const picks=ls.livePicks(scene),q=sm.readQ(scene,picks);
  const pub=JSON.stringify(server.playerView(st,ids[0]).round);
  assert.ok(pub.includes(q.focus),"the shared focus question");assert.ok(!pub.includes("answers")&&!pub.includes("supports"),"answers stay on the server");
  // A miss is a try: the phone shows Not yet; retrying until right scores the round.
  assert.equal(await act(ids[0],{kind:"read",pouch:[q.answers[0],line("p070",0)]}),null);
  st=(await server.loadState(store,s.id))!;
  const v=server.playerView(st,ids[0]).story!;assert.equal(v.answered,false);assert.equal(v.try?.notYet?.tryNo,2);assert.deepEqual(v.try?.locked,[q.answers[0]]);
  assert.equal(await act(ids[0],{kind:"read",pouch:q.answers.slice(0,3)}),null);
  assert.equal(await act(ids[1],{kind:"read",pouch:q.answers.slice(0,3)}),null);
  st=(await server.loadState(store,s.id))!;assert.equal(server.hostView(st).storyAnswered,2,"a student still trying never holds up the round");
  // The board: the lines that prove it, then the leaderboard.
  await server.hostAct(store,st,{action:"round.stage"});st=(await server.loadState(store,s.id))!;
  const board=server.hostView(st).round as {reveal?:string[]};assert.deepEqual(board.reveal,q.answers.slice(0,3));
  assert.equal(server.playerView(st,ids[1]).story!.last?.points,300);
  // Round 2: Brom asks on the board and the Witness stand.
  await server.hostAct(store,st,{action:"round.stage"});st=(await server.loadState(store,s.id))!;
  assert.equal(server.witnessView(st).story?.character.id,"brom-bones");
  // Time's up after the round and its grace.
  const round=st.session.rounds[st.session.roundIndex] as import("../lib/live/story.ts").LiveStoryRound;
  await store.updateSession(s.id,{rounds:[{...round,stepStartedAt:new Date(Date.now()-150000).toISOString()}]});
  assert.equal(await act(ids[2],{kind:"confront",line:line("p068",5)}),"Time's up for this round.");
});


test("story mode squads: silent members count as 0, absent members are left out", async()=>{
  const {squadMembersCounted,storySquadScores,sessionScores}=await import("../lib/live/engine.ts");
  const {liveStoryBoard}=await import("../lib/live/story.ts");
  const srv=await import("../lib/story-server.ts");
  const players=["a","b","c","d"].map((id,i)=>({id,nickname:`P${id}`,squadId:i<3?"s1":"s2",studentId:`st-${id}`,joinedAt:""}));
  const squads=[{id:"s1",name:"Squad Lantern",position:0},{id:"s2",name:"Squad Quill",position:1}];
  const row=(playerId:string,squadId:string,points:number)=>({id:playerId,sessionId:"x",roundIndex:0,squadId,playerId,role:null,kind:"story" as const,payload:{step:0,record:{points}},flagged:false,createdAt:""});
  const responses=[row("a","s1",300),row("d","s2",200)];
  // Squad Lantern: a answered 300, b and c silent: 300 / 3.
  assert.deepEqual(storySquadScores(squads,responses,0,players).map(s=>s.points),[100,200]);
  // c marked absent: 300 / 2.
  assert.deepEqual(storySquadScores(squads,responses,0,players,["c"]).map(s=>s.points),[150,200]);
  // An absent mark on someone who answered after all doesn't drop their points.
  assert.deepEqual(storySquadScores(squads,responses,0,players,["a","c"]).map(s=>s.points),[150,200]);
  assert.equal(squadMembersCounted("s1",players,["b","c"],responses).size,1);
  // The live board uses the same rule.
  const b=liveStoryBoard(responses as never,0,players,squads,true,["c"]);
  assert.deepEqual(b.rows.map(r=>[r.name,r.score]),[["Squad Quill",200],["Squad Lantern",150]]);
  assert.deepEqual(liveStoryBoard(responses as never,0,players,squads,true).rows.map(r=>r.score),[200,100]);
  // Session totals count Story Mode rounds the same way.
  const {world}=await storyKit();
  const session={id:"x",code:"X",teacherId:null,classId:null,demo:true,worldId:"sleepy-hollow",status:"reveal",paused:false,roundIndex:0,rounds:[{type:"story",sceneId:"empty-schoolhouse",step:3,showing:"board",stepStartedAt:"",squadsOn:true}],roundStartedAt:null,createdAt:"",expiresAt:""};
  assert.deepEqual(sessionScores(world,session as never,squads,responses,players,["c"]).map(s=>[s.name,s.points]),[["Squad Quill",200],["Squad Lantern",150]]);
  // Solo class board in squad mode: every member counts (0 if they haven't played), absent members left out.
  const map=new Map([["st-a","Squad Lantern"],["st-b","Squad Lantern"],["st-c","Squad Lantern"],["st-d","Squad Quill"]]);
  const scores=new Map([["st-a",900],["st-d",400]]);
  assert.deepEqual(srv.squadAverages(map,scores).map(r=>[r.name,r.score]),[["Squad Lantern",300],["Squad Quill",400]]);
  assert.deepEqual(srv.squadAverages(map,scores,["st-b","st-c"]).map(r=>[r.name,r.score]),[["Squad Lantern",900],["Squad Quill",400]]);
});

test("mark absent: the teacher marks a student absent for today from the class page or the live host screen", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {getClassroomStore,absentDay}=await import("../lib/classroom/store.ts");
  const store=getClassroomStore()!;
  const t=await store.ensureTeacher("test:absent","absent@example.com");
  const cls=await store.createClass(t.id,{name:"Period 3",worldId:"sleepy-hollow",grade:7});
  const kid=(await store.createStudent(cls.id,"Ana Ruiz","h1")) as {id:string},kid2=(await store.createStudent(cls.id,"Ben Tate","h2")) as {id:string};
  const today=absentDay();
  await store.setStudentAbsent(kid.id,true);
  assert.deepEqual(await store.getAbsentOn(cls.id,today),[kid.id]);
  await store.setStudentAbsent(kid.id,false);assert.deepEqual(await store.getAbsentOn(cls.id,today),[]);
  // One row per absence: a new day's mark doesn't erase an earlier one.
  await store.setStudentAbsent(kid.id,true,"2026-10-20");await store.setStudentAbsent(kid.id,true,"2026-10-21");await store.setStudentAbsent(kid.id,true,"2026-10-21");
  assert.deepEqual(await store.getAbsentOn(cls.id,"2026-10-20"),[kid.id]);assert.deepEqual(await store.getAbsentOn(cls.id,"2026-10-21"),[kid.id]);
  // New York date: 11 pm Eastern on the 23rd is the 24th in UTC.
  assert.equal(absentDay(new Date("2026-10-24T03:00:00Z")),"2026-10-23");assert.equal(absentDay(new Date("2026-10-24T15:00:00Z")),"2026-10-24");
  // Live: the host marks a class student absent; the live state leaves them out.
  const {memoryLiveStore}=await import("../lib/live/store.ts");const server=await import("../lib/live/server.ts");
  const live=memoryLiveStore({sessions:[],squads:[],players:[],responses:[]});
  const s=await live.createSession({code:"ABSNT1",teacherId:t.id,classId:cls.id,demo:false,worldId:"sleepy-hollow",status:"lobby",paused:false,roundIndex:-1,rounds:[],roundStartedAt:null,hostHash:"x",expiresAt:new Date(Date.now()+36e5).toISOString()});
  const p1=(await server.join(live,s,{nickname:"Ana Ruiz",studentId:kid.id})).player!,p2=(await server.join(live,s,{nickname:"Ben Tate",studentId:kid2.id})).player!;
  const guest=(await server.join(live,s,{nickname:"Visitor",studentId:null})).player!;
  let st=(await server.loadState(live,s.id))!;
  assert.equal(await server.hostAct(live,st,{action:"player.absent",playerId:p2.id,absent:true}),null);
  st=(await server.loadState(live,s.id))!;
  assert.deepEqual(st.absent,[p2.id]);assert.deepEqual(await store.getAbsentOn(cls.id,absentDay(new Date(s.createdAt))),[kid2.id],"the class page sees the same mark");
  // An older session uses its own day's absences, so later marks don't change its totals.
  const old=await live.createSession({code:"ABSNT0",teacherId:t.id,classId:cls.id,demo:false,worldId:"sleepy-hollow",status:"lobby",paused:false,roundIndex:-1,rounds:[],roundStartedAt:null,hostHash:"x",expiresAt:new Date(Date.now()+36e5).toISOString()});
  await live.updateSession(old.id,{createdAt:"2026-10-20T14:00:00.000Z"} as never);
  const oldKid=(await server.join(live,old,{nickname:"Ana Ruiz",studentId:kid.id})).player!;
  const oldSt=(await server.loadState(live,old.id))!;
  assert.equal(oldSt.session.createdAt.slice(0,10),"2026-10-20");assert.deepEqual(oldSt.absent,[oldKid.id],"absent on the 20th, when that session ran");
  assert.deepEqual(server.hostView(st).roster.map(r=>[r.nickname,r.canMark,r.absent]),[["Ana Ruiz",true,false],["Ben Tate",true,true],["Visitor",false,false]]);
  assert.match((await server.hostAct(live,st,{action:"player.absent",playerId:guest.id,absent:true}))??"",/Only students in your class/);
  void p1;
});

test("story mode: Catch the lie opens a demo run at round 3; Brom's trust and the goal level are saved with progress", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {world,passages,scene,sm,line}=await storyKit();
  const {memoryStoryStore}=await import("../lib/story-store.ts");const srv=await import("../lib/story-server.ts");
  const store=memoryStoryStore({runs:[],rounds:[]});
  const demo={scope:"demo" as const,sandboxId:crypto.randomUUID()};
  const run=(await srv.startRun(store,world,scene,demo,false,"lie")) as import("../lib/story-store.ts").StoryRun;
  assert.deepEqual([run.state.round,run.state.skipped,run.total],[2,2,0]);
  assert.equal(srv.publicRun(run).goal.max,sm.maxPoints(2),"the points possible count only the rounds played");
  const lie=sm.lieOf(scene,run.state.picks);
  const hit=await srv.playRound(store,world,passages,scene,run,{round:3,input:{kind:"lie",line:lie.truth_line},elapsedMs:10000,grace:false,relaxed:false});
  assert.ok("step" in hit&&hit.step?.name==="explain");
  // A class student can't skip.
  const cls=(await srv.startRun(store,world,scene,{scope:"class",classId:"c9",worldId:world.id,studentId:"s9",nickname:"Kim Lee",timeSetting:"1",leaderboard:"individual"},false,"lie")) as {state:{round:number}};
  assert.equal(cls.state.round,0);
  // Brom's trust goes down on a miss, on the server run.
  const fresh=(await srv.startRun(store,world,scene,{scope:"demo",sandboxId:crypto.randomUUID()})) as import("../lib/story-store.ts").StoryRun;
  const q=sm.readQ(scene,fresh.state.picks);
  const r1=await srv.playRound(store,world,passages,scene,fresh,{round:1,input:{kind:"read",pouch:q.answers.slice(0,3)},elapsedMs:0,grace:false,relaxed:false});
  const r2=await srv.playRound(store,world,passages,scene,r1.run!,{round:2,input:{kind:"confront",line:line("p068",1)},elapsedMs:0,grace:false,relaxed:false});
  assert.ok("notYet" in r2&&r2.reaction&&r2.reaction.trust===-1);
  assert.equal((await store.getRun(fresh.id))!.state.trust["brom-bones"],-1,"saved on the server run");
  const {StudentProgressSchema}=await import("../lib/classroom/progress.ts");
  const saved=StudentProgressSchema.parse({v:1,worldId:"sleepy-hollow",scene:0,submitted:false,readerProgress:{},artifactAnswers:{},savedTextEvidence:[],storyFrames:{},story:{"empty-schoolhouse":{runId:fresh.id,total:300,bestStreak:1,trust:{"brom-bones":-1},pouch:[],cleared:true,max:2580,level:"opened"}},updatedAt:new Date().toISOString()});
  assert.equal(saved.story!["empty-schoolhouse"].level,"opened","the goal level is saved with progress");
});

// ---------- The clue game (lib/clue-game.ts) ----------
test("clue game content: one off claim per Sleepy Hollow clue, traits and correcting lines copied exactly", async()=>{
  const {world,passages,line}=await storyKit();
  const cg=await import("../lib/clue-game.ts");const {evidenceSentences}=await import("../lib/lies.ts");
  assert.deepEqual(cg.clueGameProblems(world,passages),[]);
  for(const sc of world.scenes)for(const c of sc.artifacts){
    assert.ok(c.off_claim,`${c.id} has an off claim`);
    const o=c.off_claim!;
    assert.ok(evidenceSentences(passages.find(p=>p.id===o.paragraph)!.text).includes(o.line),`${c.id} line is exact`);
    assert.ok(c.source_anchor.includes(o.paragraph)&&sc.available_characters.includes(o.character_id));
    assert.ok(!o.claim.includes("—"));
  }
  for(const ch of world.characters){assert.ok((ch.traits?.length??0)>=2&&(ch.traits?.length??0)<=3,ch.id);for(const t of ch.traits!)assert.ok(evidenceSentences(passages.find(p=>p.id===t.paragraph)!.text).includes(t.line),t.name)}
  // validate:worlds catches an edited line, a line from outside the clue, a non-speaking character and an em dash.
  const bad=structuredClone(world);const a=bad.scenes[0].artifacts[0];
  a.off_claim={...a.off_claim!,line:a.off_claim!.line.replace("low","small"),claim:"It was big — really big."};
  bad.scenes[0].artifacts[1].off_claim={...bad.scenes[0].artifacts[1].off_claim!,character_id:"ichabod-crane",paragraph:"p068",line:line("p068",0)};
  bad.characters[0].traits![0].line="Hans liked books.";
  const p=cg.clueGameProblems(bad,passages).join(" | ");
  assert.match(p,/not copied exactly from p011/);assert.match(p,/no em dashes/);assert.match(p,/must be a speaking character/);assert.match(p,/clue's own paragraphs/);assert.match(p,/trait .*not copied exactly/);
});

test("reading panel text: display cleanup only, paragraph numbers, and proof checks that point back to the passage", async()=>{
  const {world,passages,line}=await storyKit();
  const cg=await import("../lib/clue-game.ts");
  assert.equal(cg.displayLine("getting out,--an idea\nmost probably"),"getting out,—an idea most probably");
  assert.equal(cg.displayLine("a dog's-\nears book"),"a dog's-ears book");
  assert.equal(cg.paragraphLabel("p028"),"¶28");
  const clue=world.scenes[0].artifacts.find(a=>a.id==="ichabods-own-books")!;
  assert.deepEqual(cg.checkProof(world,passages,clue,line("p069",4)),{ok:true});
  const wrong=cg.checkProof(world,passages,clue,line("p068",1));
  assert.ok(!wrong.ok&&/¶69/.test(wrong.hint)&&!wrong.hint.includes("flames"),"names the paragraph, never the line");
  // The panel shows the clue's paragraphs plus neighbours from the scene's reading, so not every line answers it.
  const panel=cg.cluePanel(world,passages,world.scenes[0],clue).map(p=>p.id);
  assert.ok(panel.includes("p069")&&panel.length>1);
  // Character cards are spoiler-safe: in scene 1 Brom shows only the trait from the reading so far.
  const brom=world.characters.find(c=>c.id==="brom-bones")!;
  const early=cg.characterCard(world,passages,brom,0),later=cg.characterCard(world,passages,brom,1);
  assert.deepEqual([early.traits.length,early.locked],[1,2]);assert.deepEqual([later.traits.length,later.locked],[3,0]);
});

test("clue game scoring: right proofs earn once, streaks build, a wrong proof ends the streak; off claims land on turn 1 or 2", async()=>{
  const {world}=await storyKit();
  const cg=await import("../lib/clue-game.ts");
  let r=cg.earn(undefined,"proof","a");assert.deepEqual([r.points,r.coins,r.game.streak],[100,1,1]);
  r=cg.earn(r.game,"offClaim","a");assert.deepEqual([r.points,r.coins,r.game.streak],[360,2,2],"x1.2 for the second in a row");
  r=cg.earn(r.game,"proof","b");assert.equal(r.points,150,"x1.5 from the third");
  assert.equal(cg.earn(r.game,"proof","b").points,0,"the same award counts once");
  const m=cg.miss(r.game);assert.deepEqual([m.streak,m.points,m.bestStreak],[0,r.game.points,3]);
  const clue=world.scenes[0].artifacts[2];
  for(const seed of ["a","b","c","d"]){const t=cg.offClaimTurn(seed,clue.id);assert.ok(t>=1&&t<=3);assert.equal(cg.offClaimTurn(seed,clue.id),t)}
  assert.equal(new Set(Array.from({length:30},(_,i)=>cg.offClaimTurn(`s${i}`,clue.id))).size,3,"unpredictable: any of the first three answers");
  assert.ok(cg.correctsOffClaim(clue,clue.off_claim!.line));assert.ok(!cg.correctsOffClaim(clue,"Something else."));
  assert.equal(cg.offClaimFor(clue,clue.off_claim!.character_id)?.claim,clue.off_claim!.claim);
  const {offClaimInstruction,ANSWER_STYLE}=await import("../lib/llm.ts");
  assert.match(offClaimInstruction("He kept the books."),/as if it were true: "He kept the books\."/);
  assert.match(ANSWER_STYLE,/Never retell or summarize/);assert.match(ANSWER_STYLE,/no dialect/);
  const {capSentences}=await import("../lib/llm.ts");
  assert.equal(capSentences("One. Two! Three? Four. Five."),"One. Two! Three?");
  assert.equal(capSentences("I think he ran. Folks talk. The valley is odd. I kept his books on the schoolhouse shelf.","I kept his books on the schoolhouse shelf. Waste not, want not."),"I think he ran. Folks talk. I kept his books on the schoolhouse shelf. Waste not, want not.","a cut never drops the off claim");
  assert.equal(capSentences("I kept his books on the shelf. Waste not. Read the book. Then argue.","I kept his books on the schoolhouse shelf. Waste not, want not."),"I kept his books on the shelf. Waste not. Read the book.","the claim was kept in its own words");
});

test("rival: the right line wins, speed only breaks a tie, a wrong tap locks out for 3 seconds; the computer uses authored lines", async()=>{
  const {world,passages}=await storyKit();
  const cg=await import("../lib/clue-game.ts");const {lineWords,evidenceSentences}=await import("../lib/lies.ts");
  assert.equal(cg.rivalOutcome(9000,null),"you","only you found it");
  assert.equal(cg.rivalOutcome(null,4000),"rival");
  assert.equal(cg.rivalOutcome(9000,4000),"rival","both right: the faster one");
  assert.equal(cg.rivalOutcome(4000,4000),"tie");assert.equal(cg.rivalOutcome(null,null),"none");
  assert.equal(cg.RIVAL_LOCKOUT_MS,3000);
  for(const sc of world.scenes)for(const clue of sc.artifacts){
    const panel=cg.cluePanel(world,passages,sc,clue),plan=cg.computerRivalPlan(clue,panel)!;
    const lines=panel.flatMap(p=>evidenceSentences(p.text));
    assert.ok(cg.sameLine(plan.target,clue.off_claim!.line));
    assert.ok(plan.correctMs>=6000&&plan.correctMs<=25000+cg.RIVAL_LOCKOUT_MS);
    if(plan.wrong){assert.ok(!cg.sameLine(plan.wrong.line,plan.target));assert.ok(lines.some(l=>lineWords(l)===lineWords(plan.wrong!.line)),"a line from the panel");assert.ok(plan.wrong.atMs<plan.correctMs)}
  }
});

test("squads: jobs, chunks, computer teammates never pin the answer, and vote ties", async()=>{
  const {world,passages}=await storyKit();
  const cg=await import("../lib/clue-game.ts");const {matchEvidence}=await import("../lib/evidence-check.ts");
  assert.deepEqual([...cg.squadJobs(["a","b","c","d"]).values()],["reader","fact-checker","connector","reader"]);
  assert.deepEqual(cg.squadChunks(["p068","p069","p070"],3),[["p068"],["p069"],["p070"]]);
  assert.deepEqual(cg.squadChunks(["p068","p069","p070"],2),[["p068","p069"],["p070"]]);
  for(const job of Object.values(cg.SQUAD_JOBS))assert.ok(job.does.length>10);
  for(const sc of world.scenes)for(const clue of sc.artifacts){
    const panel=cg.cluePanel(world,passages,sc,clue);
    for(const l of cg.computerPins(world,passages,clue,panel)){assert.equal(matchEvidence(world,passages,l,{clueId:clue.id}),null,clue.id);assert.ok(!cg.sameLine(l,clue.off_claim!.line))}
  }
  const pins=[{line:"A.",reactions:1},{line:"B.",reactions:2},{line:"C.",reactions:2}];
  assert.equal(cg.voteWinner(pins,[{voter:"x",line:"A."},{voter:"y",line:"A."},{voter:"z",line:"B."}],"z"),"A.","most votes");
  assert.equal(cg.voteWinner(pins,[{voter:"x",line:"A."},{voter:"y",line:"B."}],"y"),"B.","tie: most reactions");
  assert.equal(cg.voteWinner(pins,[{voter:"x",line:"B."},{voter:"fc",line:"C."}],"fc"),"C.","still tied: the Fact-checker's vote");
  assert.equal(cg.voteWinner([],[],null),null);
});

test("live squads read together: pins with names, screened reactions, a vote, and all of it in the Evidence view", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {line,c}=await storyKit();
  const {memoryLiveStore}=await import("../lib/live/store.ts");const server=await import("../lib/live/server.ts");const {liveRoundEvidence}=await import("../lib/live/evidence.ts");
  const store=memoryLiveStore({sessions:[],squads:[],players:[],responses:[]});
  const s=await store.createSession({code:"READ01",teacherId:null,classId:null,demo:true,worldId:"sleepy-hollow",status:"lobby",paused:false,roundIndex:-1,rounds:[],roundStartedAt:null,hostHash:"x",expiresAt:new Date(Date.now()+36e5).toISOString()});
  const ids:string[]=[];for(const n of ["Detective Owl","Inspector Fox","Sleuth Raven"]){ids.push((await server.join(store,s,{nickname:n,studentId:null})).player!.id);await new Promise(r=>setTimeout(r,5))}
  let st=(await server.loadState(store,s.id))!;await server.hostAct(store,st,{action:"squads.auto"});st=(await server.loadState(store,s.id))!;
  const sq=await store.replaceSquads(s.id,["Squad Lantern"]);await store.setSquads(s.id,ids.map(playerId=>({playerId,squadId:sq[0].id})));
  st=(await server.loadState(store,s.id))!;await server.hostAct(store,st,{action:"round.start",type:"story",squads:true} as never);
  const act=async(pid:string,kind:string,payload:Record<string,unknown>)=>{st=(await server.loadState(store,s.id))!;return server.playerAct(store,st,pid,{kind:kind as never,payload},{judgeAllowed:async()=>false})};
  st=(await server.loadState(store,s.id))!;
  const view0=server.playerView(st,ids[0]).story!.reading!;
  assert.deepEqual(view0.members.map(m=>m.job),["reader","fact-checker","connector"]);
  assert.deepEqual(view0.myChunk,["p068"]);assert.deepEqual(server.playerView(st,ids[1]).story!.reading!.myChunk,["p069"]);
  assert.equal(await act(ids[0],"story_pin",{line:line("p068",5)}),null);
  assert.equal(await act(ids[0],"story_pin",{line:"Not in the reading."}),"Pick a line from the reading.");
  assert.equal(await act(ids[1],"story_pin",{line:line("p069",2)}),null);
  assert.equal(await act(ids[1],"story_react",{line:line("p068",5),stem:"proves",body:"someone rode fast to the bridge."}),null);
  assert.match((await act(ids[2],"story_react",{line:line("p068",5),stem:"disagree",body:"where do you live, Ben?"}))??"",/saved for your teacher/);
  st=(await server.loadState(store,s.id))!;
  const v1=server.playerView(st,ids[1]).story!.reading!;
  assert.deepEqual(v1.pins.map(p=>[p.by,p.mine]),[["Detective Owl",false],["Inspector Fox",true]]);
  assert.equal(v1.reactions.length,1,"a flagged reaction never reaches teammates");
  assert.equal(server.playerView(st,ids[2]).story!.reading!.reactions.length,2,"the writer still sees their own");
  // The vote: one each, so the tie goes to the line with the most reactions.
  await act(ids[0],"story_vote",{line:line("p069",2)});await act(ids[1],"story_vote",{line:line("p068",5)});
  st=(await server.loadState(store,s.id))!;
  const v2=server.playerView(st,ids[2]).story!.reading!;
  assert.ok(v2.winner&&v2.winner.startsWith("In one part of the road"),"tied 1 to 1: the reacted line wins");
  assert.equal(v2.everyoneVoted,false);
  const ev=liveRoundEvidence({session:st.session,world:st.world,squads:st.squads,players:st.players,responses:st.responses});
  const acts=ev[0].squads[0].members.flatMap(m=>m.actions).join(" | ");
  assert.match(acts,/Round 1: pinned "In one part of the road/);assert.match(acts,/Round 1: reacted: This proves… someone rode fast/);assert.match(acts,/reacted \(flagged\)/);assert.match(acts,/Round 1: voted for "They consisted/);
  void c;
});

test("saved progress keeps clue game points, marks and flags, and the Evidence view shows them", async()=>{
  const {StudentProgressSchema}=await import("../lib/classroom/progress.ts");const {buildEvidence}=await import("../lib/classroom/evidence.ts");
  const {world}=await storyKit();
  const p=StudentProgressSchema.parse({v:1,worldId:"sleepy-hollow",scene:0,submitted:false,readerProgress:{},artifactAnswers:{},savedTextEvidence:[],storyFrames:{},updatedAt:"2026-10-24T12:00:00Z",
    game:{points:460,coins:3,streak:2,bestStreak:2,rivalWins:1,rivalLosses:0,earned:["proof:a","offClaim:a"]},
    marks:{"p069#2":{tag:"word",pid:"p069",text:"They consisted of two shirts and a half.",clueId:"ichabods-belongings",at:"2026-10-24T12:00:00Z"}},
    claimFlags:[{clueId:"ichabods-own-books",characterId:"hans-van-ripper",answer:"I kept his books.",line:"These magic books…",pid:"p069",matched:true,at:"x"},{clueId:"empty-schoolhouse",characterId:"brom-bones",answer:"It had a bell.",line:"It was most ingeniously secured…",pid:"p011",matched:false,at:"y"}],missionSeen:["empty-schoolhouse"]});
  assert.equal(p.game!.points,460);assert.equal(p.marks!["p069#2"].tag,"word");
  const e=buildEvidence(world,[{id:"s1",nickname:"Ana Ruiz",answers:{},marks:p.marks,claimFlags:p.claimFlags}]);
  assert.deepEqual(e.students[0].marks,[{tag:"Word to know",paragraph:"¶69",text:"They consisted of two shirts and a half."}]);
  assert.deepEqual(e.students[0].claimFlags.map(f=>[f.clue,f.character,f.matched]),[["Ichabod's own books and the unfinished poem","Hans Van Ripper",true],["The empty schoolhouse","Brom Bones",false]]);
});

test("live squads read together in every round: jobs move round by round, pins and votes belong to their round", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {line}=await storyKit();
  const {memoryLiveStore}=await import("../lib/live/store.ts");const server=await import("../lib/live/server.ts");const {liveRoundEvidence}=await import("../lib/live/evidence.ts");
  const store=memoryLiveStore({sessions:[],squads:[],players:[],responses:[]});
  const s=await store.createSession({code:"READ02",teacherId:null,classId:null,demo:true,worldId:"sleepy-hollow",status:"lobby",paused:false,roundIndex:-1,rounds:[],roundStartedAt:null,hostHash:"x",expiresAt:new Date(Date.now()+36e5).toISOString()});
  const ids:string[]=[];for(const n of ["Detective Owl","Inspector Fox","Sleuth Raven"]){ids.push((await server.join(store,s,{nickname:n,studentId:null})).player!.id);await new Promise(r=>setTimeout(r,5))}
  const sq=await store.replaceSquads(s.id,["Squad Lantern"]);await store.setSquads(s.id,ids.map(playerId=>({playerId,squadId:sq[0].id})));
  let st=(await server.loadState(store,s.id))!;await server.hostAct(store,st,{action:"round.start",type:"story",squads:true} as never);
  const host=async(a:Record<string,unknown>)=>{st=(await server.loadState(store,s.id))!;return server.hostAct(store,st,a as never)};
  const act=async(pid:string,kind:string,payload:Record<string,unknown>)=>{st=(await server.loadState(store,s.id))!;return server.playerAct(store,st,pid,{kind:kind as never,payload},{judgeAllowed:async()=>false})};
  const view=async(pid:string)=>{st=(await server.loadState(store,s.id))!;return server.playerView(st,pid).story!.reading!};
  assert.equal(await act(ids[0],"story_pin",{line:line("p068",5)}),null,"round 1");
  // Round 2: the confrontation. Jobs have moved on; round 1's pin isn't carried over.
  await host({action:"round.stage"});await host({action:"round.stage"});
  let v=await view(ids[0]);
  assert.deepEqual(v.members.map(m=>m.job),["connector","reader","fact-checker"]);
  assert.equal(v.pins.length,0,"pins belong to their round");
  assert.equal(await act(ids[1],"story_pin",{line:line("p070",2)}),null);
  assert.equal(await act(ids[0],"story_react",{line:line("p070",2),stem:"proves",body:"the town blamed the Hessian."}),null);
  assert.equal(await act(ids[2],"story_vote",{line:line("p070",2)}),null);
  v=await view(ids[0]);assert.equal(v.pins.length,1);assert.equal(v.reactions.length,1);assert.equal(v.votes[0].votes,1);
  // Round 3: Catch the lie reads the testimony's clue, so a line from elsewhere is refused.
  await host({action:"round.stage"});await host({action:"round.stage"});
  assert.equal(await act(ids[1],"story_pin",{line:line("p068",5)}),"Pick a line from the reading.");
  assert.equal(await act(ids[1],"story_pin",{line:line("p069",2)}),null);
  v=await view(ids[2]);assert.deepEqual(v.myChunk,["p069"]);assert.equal(v.pins[0].by,"Inspector Fox");
  // Round 4.
  await host({action:"round.stage"});await host({action:"round.stage"});
  assert.equal(await act(ids[2],"story_pin",{line:line("p069",1)}),null);
  v=await view(ids[0]);assert.deepEqual(v.members.map(m=>m.job),["reader","fact-checker","connector"],"round 4: back where round 1 started");
  const acts=liveRoundEvidence({session:st.session,world:st.world,squads:st.squads,players:st.players,responses:st.responses})[0].squads[0].members.flatMap(m=>m.actions).join(" | ");
  for(const r of [1,2,3,4])assert.match(acts,new RegExp(`Round ${r}: pinned`));
  assert.match(acts,/Round 2: reacted: This proves… the town blamed/);assert.match(acts,/Round 2: voted for/);
});

test("tappable lines never end mid-sentence, in every story, and stay exact slices of the source", async()=>{
  const {evidenceSentences}=await import("../lib/lies.ts");const {parseSourcePassages}=await import("../lib/source-passages.ts");
  assert.deepEqual(evidenceSentences("and (unskilful rider that he was!)\nhe had much ado to keep his seat."),["and (unskilful rider that he was!)\nhe had much ado to keep his seat."]);
  assert.deepEqual(evidenceSentences("I said, “How do, Mrs. Wright, it’s cold, ain’t it?” “Ain’t he home?” says I."),["I said, “How do, Mrs. Wright, it’s cold, ain’t it?”","“Ain’t he home?” says I."]);
  assert.deepEqual(evidenceSentences("the protection of St. Nicholas when they crossed. Next."),["the protection of St. Nicholas when they crossed.","Next."]);
  assert.deepEqual(evidenceSentences("myself.” D. K."),["myself.”","D. K."]);
  assert.deepEqual(evidenceSentences("[_They all look at the rocker._] Then."),["[_They all look at the rocker._]","Then."]);
  for(const w of ["sleepy-hollow","tell-tale-heart","trifles"]){
    const ps=parseSourcePassages(await readFile(new URL(`../worlds/${w}/source.md`,import.meta.url),"utf8"));
    for(const p of ps){const ls=evidenceSentences(p.text);ls.forEach((l,i)=>{
      assert.ok(p.text.includes(l),`${w} ${p.id}: an exact slice`);
      const body=l.replace(/^[“"‘'(\[_—–\-\s]+/,"");
      if(i>0)assert.ok(!/^[a-z]/.test(body),`${w} ${p.id} line ${i} starts mid-sentence: ${l.slice(0,40)}`);
      assert.ok(!/(?:^|\s)(Mr|Mrs|St|Dr|MRS)\.$/.test(l)||i===ls.length-1&&/^MRS\.$/.test(l)===false,`${w} ${p.id} line ${i} ends on a title`);
      assert.ok(/[A-Za-z0-9]/.test(l)||ls.length===1,`${w} ${p.id} line ${i} is only punctuation (a whole-paragraph section break is fine)`);
    })}
  }
});

test("off claims accept their alternative correcting lines (#6 and #12), and #5 uses Ichabod's appetite", async()=>{
  const {world,passages}=await storyKit();const cg=await import("../lib/clue-game.ts");
  const clue=(id:string)=>world.scenes.flatMap(s=>s.artifacts).find(a=>a.id===id)!;
  assert.match(clue("party-feast").off_claim!.line,/did ample justice to every dainty/);
  assert.ok(cg.checkProof(world,passages,clue("party-feast"),clue("party-feast").off_claim!.line).ok,"the feast clue includes ¶44");
  assert.ok(cg.correctsOffClaim(clue("broms-corner"),clue("broms-corner").off_claim!.also![0].line));
  assert.ok(clue("broms-corner").off_claim!.also!.some(a=>/smoked out his singing school/.test(a.line.replace(/\s+/g," "))));
  assert.ok(cg.correctsOffClaim(clue("hurled-head"),clue("hurled-head").off_claim!.also![0].line));
  assert.match(clue("fallen-saddle").off_claim!.line.replace(/\s+/g," "),/\(unskilful rider that he was!\) he had much ado/);
});

test("freeze rules: earned by 3 right proofs in a row, hold one, one per round, not the same opponent twice, timers pause", async()=>{
  const fz=await import("../lib/freeze.ts");const cg=await import("../lib/clue-game.ts");
  assert.deepEqual([1,2,3,4,5,6].map(n=>fz.earnsFreeze(n,false)),[false,false,true,false,false,true]);
  assert.equal(fz.earnsFreeze(3,true),false,"hold at most one");
  const base={holding:true,usedThisRound:false,target:"q2",teammate:false,shielded:false,last:null,round:2};
  assert.deepEqual(fz.canFreeze(base),{ok:true});
  assert.match((fz.canFreeze({...base,holding:false}) as {reason:string}).reason,/3 right proofs in a row/);
  assert.match((fz.canFreeze({...base,teammate:true}) as {reason:string}).reason,/Never your own team/);
  assert.match((fz.canFreeze({...base,usedThisRound:true}) as {reason:string}).reason,/One Freeze per round/);
  assert.match((fz.canFreeze({...base,shielded:true}) as {reason:string}).reason,/Shielded/);
  assert.match((fz.canFreeze({...base,last:{target:"q2",round:1}}) as {reason:string}).reason,/twice in a row/);
  assert.deepEqual(fz.canFreeze({...base,last:{target:"q2",round:0}}),{ok:true},"a round in between is fine");
  assert.equal(fz.frozenMs([1000],0,10000),5000);assert.equal(fz.frozenMs([1000],0,3000),2000,"still frozen: counts so far");
  assert.equal(fz.freezeLeft(1000,3500),3);assert.equal(fz.freezeLeft(null,0),0);
  // Rival play: the third right proof in a row earns one, never in solo, never while holding one.
  let g=cg.newClueGame();for(const k of ["a","b","c"]){const r=cg.earn(g,"proof",k);g=cg.withFreeze(r.game,true,r.points>0)}
  assert.equal(g.freezeHeld,true);
  let solo=cg.newClueGame();for(const k of ["a","b","c"]){const r=cg.earn(solo,"proof",k);solo=cg.withFreeze(r.game,false,r.points>0)}
  assert.equal(!!solo.freezeHeld,false,"solo play has no freezes");
});

test("live freezes: host toggle, squads only, never teammates, holds the other squad's lock-in but not their reading, logged", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {line}=await storyKit();
  const {memoryLiveStore}=await import("../lib/live/store.ts");const server=await import("../lib/live/server.ts");const {liveRoundEvidence}=await import("../lib/live/evidence.ts");
  const store=memoryLiveStore({sessions:[],squads:[],players:[],responses:[]});
  const s=await store.createSession({code:"FRZ001",teacherId:null,classId:null,demo:true,worldId:"sleepy-hollow",status:"lobby",paused:false,roundIndex:-1,rounds:[],roundStartedAt:null,hostHash:"x",expiresAt:new Date(Date.now()+36e5).toISOString()});
  const ids:string[]=[];for(const n of ["Detective Owl","Inspector Fox","Sleuth Raven","Agent Quill"]){ids.push((await server.join(store,s,{nickname:n,studentId:null})).player!.id);await new Promise(r=>setTimeout(r,5))}
  const sq=await store.replaceSquads(s.id,["Squad Lantern","Squad Quill"]);
  await store.setSquads(s.id,[{playerId:ids[0],squadId:sq[0].id},{playerId:ids[1],squadId:sq[0].id},{playerId:ids[2],squadId:sq[1].id},{playerId:ids[3],squadId:sq[1].id}]);
  let st=(await server.loadState(store,s.id))!;
  // Freezes need squads: asking for freezes without squads leaves them off.
  await server.hostAct(store,st,{action:"round.start",type:"story",squads:false,freezes:true} as never);
  st=(await server.loadState(store,s.id))!;assert.equal((st.session.rounds[0] as {freezesOn?:boolean}).freezesOn,false);
  await store.updateSession(s.id,{rounds:[{...(st.session.rounds[0] as object),squadsOn:true,freezesOn:true} as never]});
  const act=async(pid:string,kind:string,payload:Record<string,unknown>)=>{st=(await server.loadState(store,s.id))!;return server.playerAct(store,st,pid,{kind:kind as never,payload},{judgeAllowed:async()=>false})};
  // No Freeze yet.
  assert.match((await act(ids[0],"story_freeze",{targetSquadId:sq[1].id}))??"",/3 right proofs in a row/);
  // Owl has 3 right proofs in a row (from earlier steps of this round).
  for(const step of [0,1,2])await store.addResponse(s.id,{roundIndex:0,squadId:sq[0].id,playerId:ids[0],role:null,kind:"story",payload:{step:step+10,record:{round:step+1,points:100,valid:true,streak:step+1,multiplier:1,doubled:false,base:100,speed:0,coinsEarned:1,detail:"",choice:"",proof:[],kind:"read"}},flagged:false});
  st=(await server.loadState(store,s.id))!;
  const v=server.playerView(st,ids[0]).story!.freeze!;
  assert.equal(v.holding,true);assert.deepEqual(v.targets.map(t=>[t.name,t.ok]),[["Squad Quill",true]],"never your own squad");
  assert.match((await act(ids[0],"story_freeze",{targetSquadId:sq[0].id}))??"",/own team/);
  assert.equal(await act(ids[0],"story_freeze",{targetSquadId:sq[1].id}),null);
  // Quill's lock-in waits; their pins still work; Owl's Freeze is spent.
  assert.match((await act(ids[2],"story",{input:{kind:"read",pouch:[line("p068",5)]}}))??"",/frozen for \d more seconds/);
  assert.equal(await act(ids[2],"story_pin",{line:line("p068",5)}),null);
  st=(await server.loadState(store,s.id))!;
  const q=server.playerView(st,ids[2]).story!.freeze!;assert.ok(q.frozen&&q.frozen.by==="Squad Lantern");assert.equal(q.shielded,true);
  assert.equal(server.playerView(st,ids[0]).story!.freeze!.holding,false);
  // Once the 5 seconds pass, they lock in; the frozen time didn't count against them.
  await store.updateSession(s.id,{rounds:[{...(st.session.rounds[0] as object),stepStartedAt:new Date(Date.now()-7000).toISOString()} as never]});
  st=(await server.loadState(store,s.id))!;
  const {answerStep}=await import("../lib/live/story.ts");
  const r=answerStep(st.world,st.passages!,st.world.scenes[0],st.session.rounds[0] as never,st.responses,0,ids[3],{kind:"read",pouch:[line("p068",5)]},Date.now()+6000,"1",sq[1].id);
  assert.ok(typeof r!=="string");
  const ev=liveRoundEvidence({session:st.session,world:st.world,squads:st.squads,players:st.players,responses:st.responses});
  assert.match(ev[0].freezes!.join(" "),/Detective Owl \(Squad Lantern\) froze Squad Quill · Story Mode round 1 · \d+:\d\d:\d\d [AP]M/);
});

test("rival freezes are logged for the teacher", async()=>{
  const {buildEvidence}=await import("../lib/classroom/evidence.ts");const {world}=await storyKit();
  const e=buildEvidence(world,[{id:"s1",nickname:"Ana Ruiz",answers:{},freezes:[{target:"The Lantern Ghost",clueId:"empty-schoolhouse",at:"2026-10-24T15:04:05Z"}]}]);
  assert.deepEqual(e.students[0].freezes,["Ana Ruiz froze The Lantern Ghost · The empty schoolhouse · 11:04:05 AM"]);
});

test("Your Turn content: one activity per angle option, every scored line exact, validated", async()=>{
  const {world,passages}=await storyKit();const yt=await import("../lib/your-turn.ts");
  assert.deepEqual(yt.yourTurnProblems(world,passages),[]);
  assert.deepEqual(Object.keys(world.your_turn!.activities).sort(),yt.ANGLE_OPTION_IDS.filter(id=>id!=="race").sort(),"every option of all three questions (Proof Race is a way to play, not a challenge)");
  assert.equal(world.your_turn!.activities.loyalty.kind,"talk");assert.equal(world.your_turn!.activities.loyalty.character_id,"hans-van-ripper");
  assert.equal(world.your_turn!.activities.winning.kind,"debate");
  for(const a of Object.values(world.your_turn!.activities))assert.ok(a.minutes>=5&&a.minutes<=7);
  const bad=structuredClone(world);const u=bad.your_turn!.activities.unfairness;
  u.exchanges![0].accept[0].line=u.exchanges![0].accept[0].line.replace("harried","bothered");u.title="Call out — what's unfair";
  bad.your_turn!.activities["always-right"]={...u};
  (bad.your_turn!.activities.winning.sides as Record<string,unknown>)["aliens"]=bad.your_turn!.activities.winning.sides!["ran-away"];
  const p=yt.yourTurnProblems(bad,passages).join(" | ");
  assert.match(p,/not copied exactly/);assert.match(p,/no em dashes/);assert.match(p,/always-right: not a "What's your angle\?" option/);assert.match(p,/side aliens is not a Final Verdict theory/);
});

test("Your Turn: two activities from the angle, answers checked against authored lines, 2 or 3 cited sentences", async()=>{
  const {world,passages,line}=await storyKit();const yt=await import("../lib/your-turn.ts");
  assert.deepEqual(yt.yourTurnChoices(world,{firedUpBy:"money",lane:"fashion",style:"rival"}),["money","fashion"]);
  assert.deepEqual(yt.yourTurnChoices(world,{style:"rival"}),["solo"],"how they play doesn't pick a challenge");
  assert.deepEqual(yt.yourTurnChoices(world,null),["solo"],"skipped the angle: the cold case file");
  const fashion=world.your_turn!.activities.fashion;
  const suit=fashion.items!.find(i=>i.id==="suit")!,bow=fashion.items!.find(i=>i.id==="bow")!;
  assert.deepEqual(yt.checkAnswer(suit.accept,suit.accept[0].line),{ok:true});
  const miss=yt.checkAnswer(suit.accept,line("p010",0));assert.ok(!miss.ok&&/¶36/.test(miss.hint));
  const decoy=yt.checkAnswer(bow.accept,line("p036",0));assert.ok(!decoy.ok&&/doesn't support/.test(decoy.hint),"a decoy piece the story doesn't support");
  const cite=[line("p036",0)];
  assert.deepEqual(yt.checkWriting(passages,"He wore his only suit.",cite),{ok:false,error:"Write 2 or 3 sentences."});
  assert.deepEqual(yt.checkWriting(passages,"One. Two. Three. Four.",cite),{ok:false,error:"Write 2 or 3 sentences."});
  assert.match((yt.checkWriting(passages,"He wore a rusty suit. It was his only one.",[]) as {error:string}).error,/Cite at least one line/);
  assert.match((yt.checkWriting(passages,"He wore a rusty suit. It was his only one.",["Ichabod wore a tuxedo."]) as {error:string}).error,/Cite at least one line/);
  const ok=yt.checkWriting(passages,"He wore a rusty suit. It was his only one.",cite);assert.ok(ok.ok);
  assert.match((yt.checkWriting(passages,"He wore a suit. Where do you live?",cite) as {error:string}).error,/private information/,"screened like character questions");
});

test("Your Turn live: the host starts it for everyone; each phone saves one of its own activities to the student's progress", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {line}=await storyKit();
  const {getClassroomStore}=await import("../lib/classroom/store.ts");const cls_=getClassroomStore()!;
  const t=await cls_.ensureTeacher("test:yt","yt@example.com");const cls=await cls_.createClass(t.id,{name:"Period 5",worldId:"sleepy-hollow",grade:7});
  const kid=(await cls_.createStudent(cls.id,"Rosa Park","h")) as {id:string};
  await cls_.saveProgress(kid.id,{v:1,worldId:"sleepy-hollow",scene:3,submitted:true,readerProgress:{},artifactAnswers:{},savedTextEvidence:[],storyFrames:{},angle:{firedUpBy:"loyalty",lane:"fashion"},updatedAt:new Date().toISOString()});
  const {memoryLiveStore}=await import("../lib/live/store.ts");const server=await import("../lib/live/server.ts");
  const store=memoryLiveStore({sessions:[],squads:[],players:[],responses:[]});
  const s=await store.createSession({code:"YT0001",teacherId:t.id,classId:cls.id,demo:false,worldId:"sleepy-hollow",status:"lobby",paused:false,roundIndex:0,rounds:[],roundStartedAt:null,hostHash:"x",expiresAt:new Date(Date.now()+36e5).toISOString()});
  const p=(await server.join(store,s,{nickname:"Rosa Park",studentId:kid.id})).player!;await store.updateSession(s.id,{status:"ended"});
  let st=(await server.loadState(store,s.id))!;
  assert.equal(server.playerView(st,p.id).yourTurn,null,"not until the host starts it");
  assert.equal(await server.hostAct(store,st,{action:"yourturn.start"}),null,"even after the session has ended");
  st=(await server.loadState(store,s.id))!;
  assert.deepEqual(server.playerView(st,p.id).yourTurn,{ask:true,choices:[],done:[]},"each phone asks the two questions first, even with saved answers");
  assert.match((await server.playerAct(store,st,p.id,{kind:"your_turn",payload:{activity:"fashion"}},{judgeAllowed:async()=>false}))??"",/Unlock your challenge first/);
  assert.match((await server.playerAct(store,st,p.id,{kind:"your_turn_angle",payload:{lane:"my name is Rosa"}},{judgeAllowed:async()=>false}))??"",/Pick one/);
  assert.equal(await server.playerAct(store,st,p.id,{kind:"your_turn_angle",payload:{firedUpBy:"loyalty",lane:"fashion"}},{judgeAllowed:async()=>false}),null);
  st=(await server.loadState(store,s.id))!;
  assert.deepEqual(server.playerView(st,p.id).yourTurn,{ask:false,choices:["loyalty","fashion"],done:[]});
  assert.deepEqual(server.hostView(st).yourTurn,{started:true,saved:0});
  const act=async(payload:Record<string,unknown>)=>{st=(await server.loadState(store,s.id))!;return server.playerAct(store,st,p.id,{kind:"your_turn",payload},{judgeAllowed:async()=>false})};
  assert.match((await act({activity:"money",writing:"A. B.",cited:[]}))??"",/one of your two/);
  assert.match((await act({activity:"fashion",writing:"He wore his only suit.",cited:[line("p036",0)]}))??"",/2 or 3 sentences/);
  assert.equal(await act({activity:"fashion",writing:"Ichabod only had one suit. It was rusty black.",cited:[line("p036",0)],results:[{label:"Rusty black suit",line:line("p036",0),ok:true},{label:"Fake",line:"Not in the story.",ok:true}]}),null);
  const saved=(await cls_.getProgress(kid.id))!.yourTurn!;
  assert.equal(saved.length,1);assert.equal(saved[0].title,"Style Ichabod for the party");assert.equal(saved[0].results.length,1,"only real lines are kept");
  st=(await server.loadState(store,s.id))!;assert.deepEqual(server.playerView(st,p.id).yourTurn!.done,["Style Ichabod for the party"]);
  const {loadClassEvidence}=await import("../lib/classroom/evidence-server.ts");const {evidenceCsv}=await import("../lib/classroom/evidence.ts");
  const ev=(await loadClassEvidence(cls_,t.id,cls.id))!;
  const y=ev.students.find(x=>x.nickname==="Rosa Park")!.yourTurn[0];
  assert.deepEqual([y.title,y.heldUp,y.writing],["Style Ichabod for the party","1 of 1","Ichabod only had one suit. It was rusty black."]);
  assert.match(evidenceCsv(ev),/Your Turn,Rosa Park,Style Ichabod for the party,1 of 1,Ichabod only had one suit/);
});

test("Story Mode needs no access code for public demo visitors (usage caps stay)", async()=>{
  const prev=process.env.CLASSROOM_DEV_STORE;delete process.env.CLASSROOM_DEV_STORE;
  try{
    const {storyIdentity}=await import("../lib/story-api.ts");
    const id="11111111-2222-4333-8444-555555555555";
    const req={headers:new Headers(),cookies:{get:()=>undefined}} as never;
    assert.deepEqual(await storyIdentity(req,id),{scope:"demo",sandboxId:id},"no cookie, no code");
    assert.deepEqual(await storyIdentity(req,"not-a-sandbox"),{error:"Start the demo again.",status:400});
    const srv=await import("../lib/story-server.ts");assert.equal(srv.MAX_RESTARTS,20,"the per-day restart cap is unchanged");
  }finally{if(prev!==undefined)process.env.CLASSROOM_DEV_STORE=prev}
});

test("story mode: a fractional browser timer is saved as whole milliseconds", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {world,passages,scene,sm}=await storyKit();
  const {memoryStoryStore}=await import("../lib/story-store.ts");const srv=await import("../lib/story-server.ts");
  const mem={runs:[] as unknown[],rounds:[] as {elapsedMs:number}[]};const store=memoryStoryStore(mem as never);
  const run=(await srv.startRun(store,world,scene,{scope:"class" as const,classId:"c9",worldId:world.id,studentId:"st9",nickname:"Ana Ruiz",timeSetting:"1" as const,leaderboard:"individual" as const})) as import("../lib/story-store.ts").StoryRun;
  const q=sm.readQ(scene,run.state.picks);
  await srv.playRound(store,world,passages,scene,run,{round:1,input:{kind:"read",pouch:q.answers.slice(0,3)},elapsedMs:22001.300000000745,grace:false,relaxed:false});
  assert.ok(Number.isInteger(mem.rounds[0].elapsedMs),"elapsed_ms is an integer column");
});

test("fair play on the clue screen: bank questions, first-try points, shown answers, coin-only rival wins, word cards", async()=>{
  const {world,passages,line}=await storyKit();
  const cg=await import("../lib/clue-game.ts");const fp=await import("../lib/fair-play.ts");const ev=await import("../lib/evidence-check.ts");
  const clue=world.scenes[0].artifacts.find(a=>a.id==="empty-schoolhouse")!;
  const q=clue.bank!.find(x=>x.id==="discipline")!;
  // A bank answer beside the clue's own paragraph (¶12) is a real proof line for it, so saved proofs stay valid.
  assert.ok(ev.matchEvidence(world,passages,line("p012",0),{clueId:clue.id}));
  // checkProof answers the student's own question; a miss names the paragraph, then the part of it.
  assert.equal(cg.checkProof(world,passages,clue,line("p012",0),q).ok,true);
  const m2=cg.checkProof(world,passages,clue,line("p011",0),q,2),m3=cg.checkProof(world,passages,clue,line("p011",0),q,3);
  assert.ok(!m2.ok&&/¶11/.test(m2.hint));assert.ok(!m3.ok&&/part of ¶11/.test(m3.hint));
  const near=cg.checkProof(world,passages,clue,line("p011",3),q,2);assert.ok(!near.ok&&/How does the narrator judge his fairness\? Check ¶12\./.test(near.hint));
  assert.equal(cg.checkProof(world,passages,clue,line("p011",5),q).ok,true,"\"scholars certainly were not spoiled\" also answers it");
  // Points: full, half, none; 25 off per wrong line; a shown answer earns nothing and ends the streak.
  assert.equal(cg.earn(undefined,"proof","a").points,100);
  assert.equal(cg.earn(undefined,"proof","a",{tries:1,wrong:1}).points,25);
  assert.equal(cg.earn(undefined,"proof","a",{tries:2,wrong:2}).points,0);
  const shownGame=cg.earn({...cg.newClueGame(),streak:2},"proof","a",{shown:true});assert.deepEqual([shownGame.points,shownGame.game.streak],[0,0]);
  // A rival win is a coin, not points.
  const won=cg.earn(undefined,"rivalWin","a");assert.deepEqual([won.points,won.coins],[0,1]);
  // Stories without a bank yet: one question that any of the clue's evidence lines answers.
  const tth=WorldPackSchema.parse(JSON.parse(await readFile(new URL("../worlds/tell-tale-heart/world.json",import.meta.url),"utf8")));
  const c2={...tth.scenes[0].artifacts[0],bank:undefined};const b2=fp.clueBank(tth,[],c2,"What do you notice?");
  assert.deepEqual([b2.length,b2[0].question,b2[0].prove],[1,"What do you notice?",null]);
  // Words to know: the glossary words in the passage on screen.
  const {wordsToKnow}=fp;
  assert.deepEqual(wordsToKnow(passages.filter(p=>p.id==="p069"),world.glossary).map(g=>g.term).filter(t=>["executor","consigned","forthwith"].includes(t)),["executor","forthwith","consigned"]);
  assert.deepEqual(wordsToKnow(passages.filter(p=>p.id==="p012"),world.glossary).map(g=>g.term),["discrimination"]);
  // One writing task per scene, after its clues.
  const {nextStep}=await import("../lib/next-step.ts");
  const done=[{id:"a",name:"A",done:true,locked:false}];
  assert.equal(nextStep({clues:done,writing:{saved:false},last:false,hasChoice:false}).action.kind,"writing");
  assert.equal(nextStep({clues:done,writing:{saved:true},last:false,hasChoice:false}).action.kind,"next");
  // Saved with progress, and in the teacher's view: tries, a shown answer and speed flags.
  const {StudentProgressSchema}=await import("../lib/classroom/progress.ts");
  const p=StudentProgressSchema.parse({v:1,worldId:"sleepy-hollow",scene:0,submitted:false,readerProgress:{},artifactAnswers:{[clue.id]:{notice:line("p012",0),interpret:"He was strict but fair.",craft:"",technique:"",revisions:[],fair:{qid:"discipline",tries:1,shown:false,flags:["fast"]}}},savedTextEvidence:[],storyFrames:{},clueQs:{[clue.id]:"discipline"},clueSeen:{[clue.id]:["built"]},sceneWriting:{"empty-schoolhouse":{notice:"n",interpret:"i",craft:"c",technique:"pacing",saved_at:"2026-10-25T00:00:00Z"}},updatedAt:new Date().toISOString()});
  const {buildEvidence,evidenceDetail}=await import("../lib/classroom/evidence.ts");
  const e=buildEvidence(world,[{id:"s1",nickname:"Ana Ruiz",answers:p.artifactAnswers}],7);
  assert.deepEqual([e.students[0].cells[clue.id].tries,e.students[0].cells[clue.id].flags],[1,["fast"]]);
  assert.deepEqual(evidenceDetail(e,"s1",clue.id)!.flags,["Tapped a line within 4 seconds of opening the passage"]);
});

test("story mode round intros: name a first-try success, coach after retries, never praise a shown answer", async()=>{
  const {sm}=await storyKit();
  const r=(o:Partial<{kind:import("../lib/story-mode.ts").RoundKind;valid:boolean;shown:boolean;tries:number;wrong:number}>)=>({kind:"read" as const,valid:true,shown:false,tries:0,wrong:0,...o});
  assert.match(sm.roundIntroLine(r({}),0),/3 of 3 lines|all 3 lines|all 3 lines/i);
  assert.match(sm.roundIntroLine(r({kind:"lie"}),1),/lie|testimony/i);
  for(let seed=0;seed<3;seed++){
    assert.match(sm.roundIntroLine(r({tries:1}),seed),/tries|Read each line|check each line/i);
    const shown=sm.roundIntroLine(r({valid:false,shown:true}),seed);
    assert.doesNotMatch(shown,/great|nice|well done|first try|good job/i,"a shown answer is never praised");
  }
  // Different versions, so the line doesn't repeat every round.
  assert.notEqual(sm.roundIntroLine(r({tries:1}),0),sm.roundIntroLine(r({tries:1}),1));
  assert.equal(sm.goalLine(200,1200),"200 / 1,200 · 280 more for Case Opened.");
  assert.equal(sm.goalLine(1100,1200),"1,100 / 1,200 · Case Cracked");
  assert.equal(sm.goalLine(1300,1200),"1,300 / 1,200 · Bonus");
});

test("story missions: pieces collected in play, the payoff sealed until the verdict, verdicts never scored", async()=>{
  const {world,passages,line}=await storyKit();
  const ms=await import("../lib/missions.ts");const fp=await import("../lib/fair-play.ts");
  assert.deepEqual(ms.missionProblems(world,passages),[]);
  assert.equal(world.missions!.length,3);
  const m=ms.missionFor(world,"find-ichabod")!;
  // A piece counts when its line is proven; shown answers count, marked shown; nothing else collects.
  const a=ms.collectPieces(m,undefined,[line("p069",0),line("p070",0)],{via:"story:read"})!;
  assert.deepEqual(Object.keys(a),["no-body"]);
  const b=ms.collectPieces(m,a,[line("p069",5)],{shown:true,via:"lead"})!;
  assert.equal(b.pay.shown,true);assert.equal(ms.collectPieces(m,b,[line("p069",0)],{via:"x"}),null,"already found");
  // Sealed: the payoff clue, and no question or near miss in this student's banks points to the payoff line.
  assert.equal(ms.sealedClue(m),"new-york-report");
  const brom=world.scenes[3].artifacts.find(c=>c.id==="broms-knowing-look")!;
  const safe=ms.withoutPayoff(fp.clueBank(world,passages,brom,""),m);
  assert.ok(safe.every(q=>!q.answers.some(x=>ms.isPayoff(m,x.line))&&!q.near_misses.some(n=>ms.isPayoff(m,n.line))));
  assert.equal(ms.revealsPayoff(m,"They say he's still\nalive somewhere."),true);assert.equal(ms.revealsPayoff(m,"Look at the bridge."),false);
  // The verdict: a theory, at least 2 pins, 2 or 3 sentences. Never scored.
  assert.deepEqual(ms.verdictProblems({theoryId:"left-alive",pinned:["a","b"],writing:"He left. His pay went too."}),[]);
  assert.deepEqual(ms.verdictProblems({theoryId:"",pinned:["a"],writing:"He left."}),["Pick your theory.","Pin at least 2 lines.","Write 2 or 3 sentences."]);
  assert.match(ms.verdictNote(5,5),/all 5/);assert.doesNotMatch(ms.verdictNote(1,5),/great|well done/i);
  // validate:worlds: a lead that gives its line away, or a payoff used in Story Mode, is caught.
  const bad=structuredClone(world);bad.missions![0].pieces[0].lead="Find the line about the money he possessed.";bad.missions![0].payoff.line=bad.scenes[0].lie!.truth_line;
  const p=ms.missionProblems(bad,passages).join(" | ");assert.match(p,/shares key words/);assert.match(p,/sealed/);
  // One question, one thing.
  const two=structuredClone(world);two.scenes[0].artifacts[0].bank![0].question="Where was it, and what was it made of?";
  assert.match(fp.bankProblems(two,passages,(sc,c)=>passages.filter(x=>c.source_anchor.includes(x.id))).join(" "),/ask one thing/);
  // Runs started on a preview are tagged (previews share the production database).
  process.env.CLASSROOM_DEV_STORE="memory";const {memoryStoryStore}=await import("../lib/story-store.ts");const srv=await import("../lib/story-server.ts");
  const was=process.env.VERCEL_ENV;process.env.VERCEL_ENV="preview";
  const run=(await srv.startRun(memoryStoryStore({runs:[],rounds:[]}),world,world.scenes[0],{scope:"demo",sandboxId:crypto.randomUUID()})) as {state:{env?:string}};
  process.env.VERCEL_ENV=was??"";if(was===undefined)delete process.env.VERCEL_ENV;
  assert.equal(run.state.env,"preview");
  // The scene's next step offers its open mission leads after the clues.
  const {nextStep}=await import("../lib/next-step.ts");
  assert.equal(nextStep({clues:[{id:"a",name:"A",done:true,locked:false}],leads:2,writing:{saved:false},last:false,hasChoice:false}).action.label,"Follow your mission leads (2)");
  // Live: the teacher assigns one mission, or squads choose; a squad's pieces come from its members' proof.
  const lm=await import("../lib/live/missions.ts");
  const row=(kind:string,payload:Record<string,unknown>,extra={})=>({id:crypto.randomUUID(),sessionId:"s",roundIndex:0,squadId:null,playerId:null,role:null,kind,payload,flagged:false,createdAt:new Date().toISOString(),...extra}) as never;
  assert.equal(lm.missionPick(world,[row("mission",{missionId:"find-ichabod",squadsChoose:false})],"q1","unmask-horseman"),"Your teacher picks the mission.");
  const rs=[row("mission",{missionId:null,squadsChoose:true}),row("mission_pick",{missionId:"find-ichabod"},{squadId:"q1"}),row("story",{step:0,record:{proof:[line("p069",0),line("p069",5)]}},{playerId:"p1",squadId:"q1"})];
  assert.deepEqual(lm.liveMissionPieces(world,rs,"q1",["p1"]),{id:"find-ichabod",title:"Find Ichabod",problem:m.problem,found:2,total:5});
});

test("streaks count first-try rounds only", async()=>{
  const {sm}=await storyKit();const cg=await import("../lib/clue-game.ts");
  const sc=(tries:number)=>({kind:"read" as const,base:100,speed:0,valid:true,coinsEarned:1,detail:"",choice:"",proof:[],tries,wrong:0,shown:false,qid:"q"});
  let s=sm.applyRound(sm.newRun(),sc(0));s=sm.applyRound(s,sc(1));assert.deepEqual([s.streak,s.rounds[1].multiplier,s.total],[0,1,200],"the base is already halved by the try; no streak multiplier");
  const g=cg.earn({...cg.newClueGame(),streak:2},"proof","a",{tries:1});assert.deepEqual([g.game.streak,g.points],[0,50]);
});

test("mission verdict compare: each cited line is marked same way or somewhere else, saved for the teacher, never scored", async()=>{
  const {world,line}=await storyKit();
  const {StudentProgressSchema}=await import("../lib/classroom/progress.ts");const {buildEvidence}=await import("../lib/classroom/evidence.ts");
  const l1=line("p069",5),l2=line("p069",0);
  const p=StudentProgressSchema.parse({v:1,worldId:"sleepy-hollow",scene:3,submitted:false,readerProgress:{},artifactAnswers:{},savedTextEvidence:[],storyFrames:{},mission:"find-ichabod",missionPieces:{pay:{at:"x",shown:false,via:"lead"},"no-body":{at:"x",shown:true,via:"story:read"}},missionVerdict:{mission_id:"find-ichabod",theory_id:"left-alive",pinned:[{line:l1,pid:"p069",piece:"pay"},{line:l2,pid:"p069",piece:"no-body"}],writing:"He left. His pay went with him.",early:false,saved_at:"x",compare:{[l1]:"same",[l2]:"else"}},updatedAt:new Date().toISOString()});
  const e=buildEvidence(world,[{id:"s1",nickname:"Ana Ruiz",answers:{},mission:{mission:p.mission,pieces:p.missionPieces,verdict:p.missionVerdict}}],7);
  const m=e.students[0].mission!;
  assert.deepEqual([m.found.length,m.found.find(f=>f.line===l2)!.shown,m.verdict!.compare[l1],m.verdict!.compare[l2]],[2,true,"same","else"]);
});

test("story mode ready card and rival: one-line goal, a fixed computer rival time, and the face-off never touches points", async()=>{
  const sm=await import("../lib/story-mode.ts");
  assert.equal(sm.nextGoal(0,2580),"Goal: 1,032 for Case Opened");
  assert.equal(sm.nextGoal(1100,2580),"Goal: 1,806 for Case Built");
  assert.equal(sm.nextGoal(2400,2580),"Goal reached: Case Cracked");
  const a=sm.storyRivalMs("empty-schoolhouse","read","1");
  assert.equal(a,sm.storyRivalMs("empty-schoolhouse","read","1"),"the same every time");
  assert.ok(a>=120000*0.45&&a<=120000*0.71,"partway through the round's first-try time");
  assert.equal(sm.storyRivalMs("empty-schoolhouse","read","2"),a*2,"scaled by the student's extra time");
  const right={valid:true,tries:0,shown:false};
  assert.equal(sm.storyRivalOutcome(right,a-1,a),"you");
  assert.equal(sm.storyRivalOutcome(right,a+1,a),"rival");
  assert.equal(sm.storyRivalOutcome({...right,tries:1},10,a),"rival","only a first-try proof wins the face-off");
  assert.equal(sm.storyRivalOutcome({...right,shown:true},10,a),"rival");
});

test("three-tap start: Try a case now, a mode card, a mission card, then the passage, in every playable world", async(t)=>{
  const {tapsToPassage,preGameScreen,firstClue}=await import("../lib/pregame.ts");
  const sm=await import("../lib/story-mode.ts");
  for(const id of ["sleepy-hollow","tell-tale-heart","trifles"]){
    const world=await roleWorld(id);
    const taps=tapsToPassage(world);
    t.diagnostic(`${id}: ${taps} taps from "Try a case now" to the first passage line`);
    assert.ok(taps<=3,`${id} takes ${taps} taps`);
    assert.equal(preGameScreen(world,{}),"role-and-mode","the role story and the mode cards share one screen");
    const sc=world.scenes[Math.max(0,world.scenes.findIndex(s=>s.id===world.student_role?.start_scene))];
    // The last tap opens the passage: Story Mode's round 1 with no ready card, or the scene's first clue.
    if(sc.story_mode)assert.equal(sm.storyOpening({finished:false,state:sm.newRun()},false,false,false),"play");
    else assert.ok(firstClue(sc),`${id} opens a clue`);
  }
});

test("welcome back: a saved run opens on Keep playing or Start over, once per visit, never straight into a try", async()=>{
  const sm=await import("../lib/story-mode.ts");
  const played={finished:false,state:{...sm.newRun(),round:1,rounds:[{}]}};
  assert.equal(sm.storyOpening(played,false,false,false),"welcome");
  assert.equal(sm.storyOpening({finished:false,state:sm.newRun()},true,false,false),"welcome","a try in progress too");
  assert.equal(sm.storyOpening(played,false,true,false),"play","shown once per visit");
  assert.equal(sm.storyOpening(played,false,false,true),"play","Start over goes straight in");
  assert.equal(sm.storyOpening({finished:false,state:{...sm.newRun(),round:2,skipped:2}},false,false,false),"play","Catch the lie's jump is not progress");
  assert.equal(sm.storyOpening({...played,finished:true},false,false,false),"cleared");
});

test("demo ending: only for the public demo after the start scene, once, and never after the last scene", async()=>{
  const {demoEndingDue}=await import("../lib/pregame.ts");
  const world=await roleWorld("sleepy-hollow");
  assert.equal(demoEndingDue({},world,0),true);
  assert.equal(demoEndingDue({classAuth:{token:"x"}},world,0),false,"class students keep the four-scene flow");
  assert.equal(demoEndingDue({demoEnding:"done"},world,0),false,"once");
  assert.equal(demoEndingDue({},world,1),false,"only after scene 1");
  assert.equal(demoEndingDue({},world,world.scenes.length-1),false);
});

test("demo ending Your Turn: scene 1 lines only, activities that can't work are hidden, the cold case file otherwise", async()=>{
  const {world,passages}=await storyKit();const yt=await import("../lib/your-turn.ts");
  const {readingPortions}=await import("../lib/source-passages.ts");const {revealsPayoff}=await import("../lib/missions.ts");
  const pids=new Set(readingPortions(passages,world.scenes)[0].map(p=>p.id));
  const hides=(t:string)=>(world.missions??[]).some(m=>revealsPayoff(m,t));
  const r=yt.sceneYourTurn(world,null,pids,hides);
  assert.deepEqual(Object.keys(r.activities).sort(),["fashion","loyalty","money","rival","social-media","solo","squad","underestimated","winning"]);
  assert.equal(r.activities.fashion.title,"Style Ichabod from his bundle","the authored demo version");
  assert.deepEqual(Object.keys(r.activities.winning.sides!).sort(),["ran-away","the-horseman"]);
  // The validator checks every demo line, and that it comes from scene 1.
  const bad=structuredClone(world);bad.your_turn!.activities.money.demo!.items![0].accept=[{paragraph:"p025",line:"Not in the story."}];
  const probs=yt.yourTurnProblems(bad,passages);
  assert.ok(probs.some(p=>p.includes("money/demo: a line is not copied exactly")),probs.join("; "));
  for(const a of Object.values(r.activities)){
    assert.ok(a.paragraphs.every(p=>pids.has(p)),"reading is scene 1 only");
    const lines=[...(a.exchanges??[]).flatMap(e=>e.accept),...Object.values(a.sides??{}).flatMap(s=>s.exchanges.flatMap(e=>e.accept)),...(a.items??[]).flatMap(i=>i.accept),...(a.posts??[]).flatMap(p=>p.accept??[])];
    assert.ok(lines.every(l=>pids.has(l.paragraph)),"every scored line is from scene 1");
    if(a.kind==="talk")assert.ok((a.exchanges??[]).length>=3);
  }
  assert.deepEqual(yt.sceneYourTurn(world,{firedUpBy:"loyalty",lane:"social-media"},pids,hides).choices,["loyalty","social-media"]);
  assert.deepEqual(yt.sceneYourTurn(world,{firedUpBy:"money",lane:"fashion"},pids,hides).choices,["money","fashion"]);
  assert.deepEqual(yt.sceneYourTurn(world,{firedUpBy:"unfairness",lane:"music"},pids,hides).choices,["solo"],"hidden matches: the cold case file");
  assert.deepEqual(yt.sceneYourTurn(world,{firedUpBy:"underestimated",lane:"music"},pids,hides).choices,["underestimated"]);
});

test("test runs are tagged and never share a leaderboard with real players", async()=>{
  const srv=await import("../lib/story-server.ts");
  const prev={v:process.env.VERCEL_ENV,n:process.env.NODE_ENV};
  try{
    delete process.env.VERCEL_ENV;(process.env as Record<string,string|undefined>).NODE_ENV="production";
    assert.deepEqual(srv.testTag(),{});assert.deepEqual(srv.testTag(true),{env:"test"});
    (process.env as Record<string,string|undefined>).NODE_ENV="development";assert.deepEqual(srv.testTag(),{env:"dev"});
    process.env.VERCEL_ENV="preview";assert.deepEqual(srv.testTag(),{env:"preview"});
  }finally{if(prev.v===undefined)delete process.env.VERCEL_ENV;else process.env.VERCEL_ENV=prev.v;if(prev.n===undefined)delete (process.env as Record<string,string|undefined>).NODE_ENV;else (process.env as Record<string,string|undefined>).NODE_ENV=prev.n}
  const real={state:{}} as never,tester={state:{env:"test"}} as never,dev={state:{env:"dev"}} as never;
  assert.deepEqual(srv.sameEnv([real,tester,dev],real),[real]);
  assert.deepEqual(srv.sameEnv([real,tester,dev],tester),[tester,dev]);
  const {PlayFeedbackSchema}=await import("../lib/feedback.ts");
  assert.equal(PlayFeedbackSchema.safeParse({world:"sleepy-hollow"}).success,false,"at least one answer");
  assert.equal(PlayFeedbackSchema.safeParse({world:"sleepy-hollow",fun:"kind_of",playAgain:"yes"}).success,true);
});

test("build the case: any 2 lines from a theory's authored list count, and the third miss shows the answer", async()=>{
  const {world,passages,scene,sm}=await storyKit();
  const q=scene.story_mode!.call.bank.find(b=>b.id==="key-clue")!,th=q.theories.find(t=>t.id==="hat-pumpkin")!;
  assert.ok(th.supports.length>=3,"a broad list");
  const PICKS={...sm.pickRound(scene,{seed:"x",seen:[],seat:null}),call:q.id};
  const go=(a:import("../lib/story-mode.ts").Attempt,pins:string[])=>sm.attemptRound(world,passages,scene,PICKS,a,{kind:"call",theoryId:th.id,pins},{seed:"t"});
  for(const pair of [[th.supports[0],th.supports[1]],[th.supports[1],th.supports[2]],[th.supports[0],th.supports[2]]]){const r=go(sm.newAttempt(),pair);assert.equal(r.status,"done");if(r.status==="done")assert.equal(r.score.valid,true)}
  const off="Ichabod did not make his appearance at breakfast; dinner-hour\ncame, but no Ichabod.";
  let a=sm.newAttempt();for(let i=0;i<2;i++){const r=go(a,[th.supports[0],off]);assert.equal(r.status,"notYet");if(r.status==="notYet")a=r.attempt}
  const last=go(a,[th.supports[0],off]);assert.equal(last.status,"done");if(last.status==="done")assert.deepEqual([last.score.valid,last.score.shown],[false,true]);
});

test("the pumpkin claim is weighed, not rebutted, and scene 1's Proof Race sprints are valid content", async()=>{
  const {world,passages}=await storyKit();const yt=await import("../lib/your-turn.ts");
  const ex=world.your_turn!.activities.winning.sides!["the-horseman"].exchanges.find(e=>/pumpkin/.test(e.say))!;
  assert.ok(ex.weigh,"a two-step claim");
  assert.equal(yt.checkAnswer(ex.accept,ex.accept[0].line).ok,true);assert.match(ex.accept[0].line.replace(/\s+/g," "),/shattered pumpkin/);
  assert.equal(yt.checkAnswer(ex.weigh!.uncertain,ex.weigh!.uncertain[0].line).ok,true);assert.match(ex.weigh!.uncertain[0].line.replace(/\s+/g," "),/pommel/);
  assert.equal(ex.weigh!.feedback,"Irving never settles it. That's the point.");
  assert.deepEqual(yt.yourTurnProblems(world,passages),[]);
  const sprints=world.scenes[0].sprints!;assert.equal(sprints.length,12);
  assert.ok(sprints.every(s=>s.near_misses.length===1&&/¶\d+/.test(s.near_misses[0].hint)));
  const fp=await import("../lib/fair-play.ts");const {readingPortions}=await import("../lib/source-passages.ts");
  const bad=structuredClone(world);bad.scenes[0].sprints![0].near_misses[0].line="Not in the story.";bad.scenes[0].sprints![1].question="Which birds whistle in that glen?";
  const probs=fp.sprintProblems(bad,passages,(i)=>new Set((readingPortions(passages,bad.scenes)[i]??[]).map(p=>p.id)));
  assert.ok(probs.some(p=>/sprint\/walk: near miss/.test(p))&&probs.some(p=>/sprint\/birds: the question shares key words/.test(p)),probs.join("; "));
});


test("proof race: chunks, settings, scoring (speed bonus, near-miss retry, extended time), readiness, board and podium", async()=>{
  const {world,passages}=await storyKit();const pr=await import("../lib/proof-race.ts");
  const all=pr.raceChunks(world,passages,pr.DEFAULT_RACE);
  assert.equal(all.length,12);assert.ok(pr.hasProofRace(world));
  // Every third chunk asks for a question; the others check the gist (unless it repeats the same passage).
  assert.equal(all[2].process,"question");assert.ok(all.filter(c=>c.process==="gist").length>=5);
  assert.ok(all.every(c=>c.passages.length>=1&&c.answers.length>=1));
  assert.ok(all.some(c=>c.samePassage),"two sprints share a paragraph in paragraph size");
  const six=pr.raceChunks(world,passages,{...pr.DEFAULT_RACE,chunks:6,questions:false});
  assert.equal(six.length,6);assert.ok(six.every(c=>c.process!=="question"));
  const off=pr.raceChunks(world,passages,{...pr.DEFAULT_RACE,gist:false,questions:false});assert.ok(off.every(c=>c.process===null));
  // Sentence size: 2 to 4 sentences, the answer inside.
  const short=pr.raceChunks(world,passages,{...pr.DEFAULT_RACE,chunkSize:"sentences"});
  const {evidenceSentences,lineWords}=await import("../lib/lies.ts");
  for(const c of short){const n=c.passages.flatMap(p=>evidenceSentences(p.text)).length;assert.ok(n>=2&&n<=4,`${c.sprintId}: ${n} sentences`);assert.ok(c.passages.some(p=>lineWords(p.text).includes(lineWords(c.answers[0]))))}
  assert.deepEqual(pr.parseRaceSettings({chunks:9,seconds:45,chunkSize:"sentences",gist:false,questions:true,autoAdvance:true}),{chunkSize:"sentences",chunks:9,gist:false,questions:true,seconds:45,autoAdvance:true});
  assert.deepEqual(pr.parseRaceSettings({chunks:7,seconds:5}),pr.DEFAULT_RACE,"anything else falls back");
  // Scoring: 700 plus up to 300 for speed, only when right; a near miss allows one retry for 350.
  const c=all[0],limit=pr.raceLimitMs(20,"1");
  assert.deepEqual(pr.raceTap(c,c.answers[0],1,0,limit),{result:"right",points:1000});
  assert.deepEqual(pr.raceTap(c,c.answers[0],1,10000,limit),{result:"right",points:850});
  assert.deepEqual(pr.raceTap(c,c.answers[0],1,25000,limit),{result:"right",points:700});
  const near=pr.raceTap(c,c.nearMisses[0].line,1,1000,limit);assert.equal(near.result,"near");assert.equal(near.points,0);
  assert.deepEqual(pr.raceTap(c,c.answers[0],2,15000,limit),{result:"retryRight",points:350});
  assert.deepEqual(pr.raceTap(c,c.nearMisses[0].line,2,15000,limit),{result:"wrong",points:0});
  assert.equal(pr.raceTap(c,"Not a line at all.",1,0,limit).result,"wrong");
  // Extended time: the bonus is measured against the student's own time.
  assert.equal(pr.raceLimitMs(20,"2"),40000);assert.equal(pr.speedBonus(20000,pr.raceLimitMs(20,"2")),pr.speedBonus(10000,limit));
  assert.equal(pr.raceLimitMs(20,"untimed"),60000);
  assert.equal(pr.gistPoints(c,c.gist!.best),100);assert.equal(pr.gistPoints(c,(c.gist!.best+1)%3),0);
  // Readiness: auto-advance at 90% only when it's on.
  assert.deepEqual(pr.readiness(["a","b"],["a","b","c"],true),{ready:2,total:3,advance:false});
  assert.equal(pr.readiness(Array.from({length:9},(_,k)=>String(k)),Array.from({length:10},(_,k)=>String(k)),true).advance,true);
  assert.equal(pr.readiness(Array.from({length:10},(_,k)=>String(k)),Array.from({length:10},(_,k)=>String(k)),false).advance,false);
  // The board: ranks with moves; the podium is the top 3 with points.
  const names=new Map([["a","Ana"],["b","Ben"],["c","Cy"]]);
  const rows=pr.raceBoard(new Map([["a",1000],["b",500],["c",0]]),new Map([["a",1000],["b",1850],["c",700]]),names);
  assert.deepEqual(rows.map(r=>[r.name,r.rank,r.prevRank,r.move,r.gained]),[["Ben",1,2,1,1350],["Ana",2,1,-1,0],["Cy",3,3,0,700]]);
  assert.deepEqual(pr.podium(rows).map(r=>r.name),["Ben","Ana","Cy"]);
  assert.equal(pr.raceBoard(new Map(),new Map([["a",100]]),names)[0].prevRank,null,"no moves before anyone scores");
  const sq=pr.squadTotals(new Map([["a",900],["b",300],["c",600]]),new Map([["a","s1"],["b","s1"],["c","s2"]]));assert.deepEqual([...sq],[["s1",600],["s2",600]]);
  const st=pr.chunkStats([{index:0,question:"Q0"},{index:1,question:"Q1"}],[{chunk:0,playerId:"a",correct:true},{chunk:1,playerId:"a",correct:false},{chunk:0,playerId:"b",correct:true}],2);
  assert.deepEqual(st.rows.map(r=>r.pct),[100,0]);assert.equal(st.hardest[0].index,1);
  // The demo rival: authored and steady per chunk.
  assert.deepEqual(pr.rivalPlay("x",3,limit),pr.rivalPlay("x",3,limit));
});

test("proof race live: expedition beats, readiness, gist and question saving, one-shot answers scored on the server with extra time, pause, the board and podium", async()=>{
  process.env.CLASSROOM_DEV_STORE="memory";
  const {memoryLiveStore}=await import("../lib/live/store.ts");const server=await import("../lib/live/server.ts");const {liveRoundEvidence}=await import("../lib/live/evidence.ts");
  const {chunkTokens,phraseRange}=await import("../lib/expedition.ts");
  const store=memoryLiveStore({sessions:[],squads:[],players:[],responses:[]});
  const s=await store.createSession({code:"RACE01",teacherId:null,classId:null,demo:true,worldId:"sleepy-hollow",status:"lobby",paused:false,roundIndex:-1,rounds:[],roundStartedAt:null,hostHash:"x",expiresAt:new Date(Date.now()+36e5).toISOString()});
  const ids:string[]=[];for(const n of ["Ana Ruiz","Ben Cole","Cy Park"]){const r=await server.join(store,s,{nickname:n,studentId:null});ids.push(r.player!.id)}
  let st=(await server.loadState(store,s.id))!;
  const act=async(pid:string,kind:string,payload:Record<string,unknown>={},timeSetting="1")=>{st=(await server.loadState(store,s.id))!;const e=await server.playerAct(store,st,pid,{kind:kind as never,payload},{judgeAllowed:async()=>false,timeSetting:timeSetting as never});st=(await server.loadState(store,s.id))!;return e};
  const host=async(a:Record<string,unknown>)=>{st=(await server.loadState(store,s.id))!;const e=await server.hostAct(store,st,a as never);st=(await server.loadState(store,s.id))!;return e};
  type Pub={beat:string;step:number;total:number;beatMs:number|null;question:{type:string;choices:string[]|null}|null;reveal:{pct:number;lines:string[];words:number[]}|null;board:{top:{name:string;rank:number}[]}|null;pinned:string|null;finish:{podium:{name:string}[];stats:{rows:unknown[];hardest:unknown[]}}|null};
  const pub=()=>server.hostView(st).round as unknown as Pub;
  // Lobby: an avatar from the story's characters, before any round.
  assert.equal(await act(ids[0],"avatar",{characterId:"brom-bones"}),null);assert.match((await act(ids[0],"avatar",{characterId:"nobody"}))??"",/Pick one/);
  assert.equal(server.hostView(st).lobby.find(p=>p.id===ids[0])!.avatar!.name,"Brom Bones");
  // Start expedition 1 without squads; extra time for Cy from the host.
  assert.equal(await host({action:"round.start",type:"race",settings:{expeditionId:"into-the-hollow",gradeBand:"6-8",questions:true}}),null);
  assert.equal(await host({action:"player.time",playerId:ids[2],setting:"2"}),null);
  // The Interview comes first (tests/interview.test.ts covers it); the host moves through it.
  assert.equal(pub().beat,"vote");
  for(let k=0;k<6&&pub().beat!=="read";k++)await host({action:"race.next"});
  assert.deepEqual([pub().beat,pub().step,pub().total,pub().question,pub().beatMs],["read",0,10,null,null],"no question and no timer while reading");
  // Reading: ready, and the host sees the count.
  assert.equal(await act(ids[0],"race_ready"),null);assert.match((await act(ids[0],"race_ready"))??"",/already/);
  assert.match((await act(ids[0],"race_tap",{answer:{lines:["x"]}}))??"",/isn't open/);
  assert.deepEqual(server.hostView(st).race!.ready,{ready:1,total:3,advance:false});
  // Gist check (20 seconds).
  assert.equal(await host({action:"race.next"}),null);assert.deepEqual([pub().beat,pub().beatMs],["process",20000]);
  const exp=st.world.expeditions![0],c0=exp.chunks[0],best=c0.gist.options.findIndex(o=>o.best);
  assert.equal(await act(ids[0],"race_gist",{choice:best}),null);
  assert.equal(await act(ids[1],"race_gist",{choice:(best+1)%3}),null);
  assert.match((await act(ids[1],"race_gist",{choice:best}))??"",/already/);
  // The question (Whose Eyes?, 45 seconds): the phones get the choices but never which one is best.
  assert.equal(await host({action:"race.next"}),null);assert.equal(pub().beat,"race");assert.equal(pub().beatMs,45000);
  assert.equal(pub().question!.type,"whose_eyes");assert.ok(!JSON.stringify(pub().question).includes("\"best\""));
  const chunks=(await import("../lib/live/race.ts")).liveRaceChunks(st.world,st.passages!,st.session.rounds.at(-1) as never);
  const tokens=chunkTokens(chunks[0].lines),r=phraseRange(tokens,c0.question.proof!.words![0])!,proof=Array.from({length:r[1]-r[0]+1},(_,k)=>r[0]+k);
  const right=c0.question.choices!.findIndex(o=>o.best);
  assert.equal(await act(ids[0],"race_tap",{answer:{choice:right,words:proof}}),null);
  // Ben: the right answer with the wrong proof scores 0. One shot: no second try.
  assert.equal(await act(ids[1],"race_tap",{answer:{choice:right,words:[0,1]}}),null);
  assert.match((await act(ids[1],"race_tap",{answer:{choice:right,words:proof}}))??"",/already answered/);
  assert.equal(await act(ids[2],"race_tap",{answer:{choice:right,words:proof}},"2"),null);
  assert.equal(server.playerView(st,ids[2]).race!.extraTime,true);assert.equal(server.playerView(st,ids[2]).race!.scale,2);
  const tot=(pid:string)=>server.playerView(st,pid).race!.total;
  assert.ok(tot(ids[0])>=1090&&tot(ids[0])<=1100,`fast right plus gist: ${tot(ids[0])}`);assert.equal(tot(ids[1]),0);assert.ok(tot(ids[2])>=990);
  assert.equal(server.playerView(st,ids[1]).race!.mine.tap!.answerRight,true);assert.equal(server.playerView(st,ids[1]).race!.mine.tap!.proofRight,false);
  // Pause holds the beat clock: resuming moves the beat's start by the time paused.
  const before=(st.session.rounds.at(-1) as {beatStartedAt:string}).beatStartedAt;
  assert.equal(await host({action:"pause"}),null);assert.equal(pub().beat,"race");
  await new Promise(res=>setTimeout(res,40));
  assert.equal(await host({action:"resume"}),null);
  assert.ok(Date.parse((st.session.rounds.at(-1) as {beatStartedAt:string}).beatStartedAt)>Date.parse(before),"the clock moved forward");
  // The proof (3 seconds), the board (5) and the countdown (3).
  assert.equal(await host({action:"race.next"}),null);assert.deepEqual([pub().beat,pub().beatMs],["reveal",3000]);
  assert.equal(pub().reveal!.pct,67);assert.ok(pub().reveal!.words.length>0);
  assert.equal(await host({action:"race.next"}),null);assert.deepEqual([pub().beat,pub().beatMs],["board",5000]);
  assert.equal(pub().board!.top[0].name,"Ana Ruiz");assert.equal(pub().board!.top.at(-1)!.name,"Ben Cole");
  assert.equal(server.playerView(st,ids[1]).race!.place!.rank,3);
  assert.equal(await host({action:"race.next"}),null);assert.deepEqual([pub().beat,pub().beatMs],["countdown",3000]);
  // Chunk 3 asks for a question (60 seconds): saved, screened, and the host can pin it.
  for(let k=0;k<30&&!(pub().step===2&&pub().beat==="ask");k++)await host({action:"race.next"});
  assert.deepEqual([pub().step,pub().beat,pub().beatMs],[2,"ask",60000]);
  assert.equal(await act(ids[0],"race_question",{text:"Why did the narrator go hunting alone?"}),null);
  assert.equal(await act(ids[1],"race_question",{text:"Where do you live?"}),null);
  assert.equal(await act(ids[2],"race_question",{text:"this story is stupid and so are you"}),null);
  const qs=server.hostView(st).race!.questions;assert.equal(qs.length,1,"a flagged question never reaches the board");
  assert.equal(await host({action:"race.pin",questionId:qs[0].id}),null);assert.equal(pub().pinned,"Why did the narrator go hunting alone?");
  // Finish: the podium and class stats; the Evidence view keeps every question, flagged ones marked, and each answer.
  for(let k=0;k<80&&st.session.status!=="ended";k++)await host({action:"race.next"});
  const fin=pub().finish!;
  assert.equal(fin.podium[0].name,"Ana Ruiz");assert.equal(fin.stats.rows.length,10);assert.equal(fin.stats.hardest.length,3);
  const ev=liveRoundEvidence({session:st.session,world:st.world,squads:st.squads,players:st.players,responses:st.responses});
  const race=ev.find(rd=>rd.type==="Proof Race")!;assert.equal(race.questions!.length,3);assert.equal(race.questions!.filter(q=>q.flagged).length,2);assert.equal(race.questions!.find(q=>q.flagged)!.text,"Where do you live?");
  assert.ok(race.squads[0].members.find(m=>m.nickname==="Ben Cole")!.actions.some(a=>/right answer, proof missed/.test(a)));
  assert.match(race.prompt,/Into the Hollow · grades 6 to 8/);
});

test("production fixes: mission questions hold the student's pieces, and round 1 counts the pouch's 3 lines", async()=>{
  const {world,scene,sm}=await storyKit();
  const m=world.missions!.find(x=>x.id==="find-ichabod")!,lines=m.pieces.filter(p=>p.scene_id===scene.id).map(p=>p.line);
  const {lineWords}=await import("../lib/lies.ts");const has=(xs:string[])=>xs.some(x=>lines.some(l=>lineWords(l)===lineWords(x)));
  for(const seed of ["a","b","c","d","e","f"]){const p=sm.pickRound(scene,{seed,pieceLines:lines});assert.ok(has(sm.readQ(scene,p).answers),`round 1 holds a piece (${seed})`);assert.ok(has(sm.inferQ(scene,p).answers.map(a=>a.line)),`round 2 holds a piece (${seed})`)}
  assert.equal(sm.POUCH_MAX,3,"the button asks for the pouch's lines");
});

test("board questions: put-downs and swearing stay off the class board, story questions pass", ()=>{
  for(const t of ["this story is stupid and so are you","you suck","wtf is this"])assert.notEqual(screenBoardText(t).action,"allow",t);
  for(const t of ["Why did the class laugh at Ichabod?","Was the Horseman really a ghost?","Who passed the glass of cider?"])assert.equal(screenBoardText(t).action,"allow",t);
});
