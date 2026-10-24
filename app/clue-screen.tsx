"use client";
// The clue screen: the passage is the main panel, always readable, and the scene picture is a small banner. Characters
// make claims; the student checks them by tapping lines in the story (kept in the Evidence pouch, the same tap as Story
// Mode) and pressing Prove it. A right line earns points, coins and builds the streak; a wrong one gets a hint back to
// the passage. "Something's off" flags an answer: if it was the clue's authored off claim and the student taps the line
// that corrects it, they earn the catch; otherwise the flag waits for the teacher (no points, no penalty).
// Rival and squad modes (demo: computer players) race or read together before the same save. Rules: lib/clue-game.ts.
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {ArrowLeft,ArrowRight,Check,Flag,MessageCircle,Square,Volume2,Vote} from "lucide-react";
import type {WorldPack} from "@/lib/world-schema";
import type {SourcePassage} from "@/lib/source-passages";
import type {Demo} from "./page";
import {useClueSteps,evidenceLabel,CLASS_AI_OFF,type Clue,type Scene} from "./clue-steps";
import {contentNotes} from "@/lib/content-notes";
import {lieFor,tryLine,testimonyParts,lineWords} from "@/lib/lies";
import {withFreeze,inSentence,REACTION_MAX,REACTION_STEMS,RIVAL_LOCKOUT_MS,RIVAL_SECONDS,SQUAD_JOBS,checkProof,cluePanel,computerPins,computerRivalPlan,correctsOffClaim,displayLine,earn,markKey,miss,newClueGame,paragraphLabel,rivalOutcome,squadJobs,voteWinner,type ClaimFlag,type MarkTag,type ReactionStem} from "@/lib/clue-game";
import {screenMessage} from "@/lib/safety";
import {squadName} from "@/lib/live/engine";
import {voiceButtonFor} from "@/lib/voice-control";
import {ReadingPanel,MarkSheet,type PanelLine,type PanelPin,type PanelReaction} from "./reading-panel";
import {CharacterCard} from "./character-card";
import {FaceOff,GameChips,Huddle,RivalEmblem,SQUAD_SOLO_NOTE,TugBar,playMode,squadSoloToday,trustMeter,type HuddleMember} from "./mode-screens";
import {Portrait,SoundToggle,useCharacterVoice,useSoundPref} from "./game-feel";
import {HologramView} from "./hologram-view";
import {focusScreenTop} from "./screen-focus";
import {playStamp} from "./case-game";
import {FREEZE_MS,canFreeze,freezeLeft} from "@/lib/freeze";

type Info={solves:boolean;factCheck:boolean};
type Props={world:WorldPack;scene:Scene;sceneIndex:number;clue:Clue;roleId:string;demo:Demo;setDemo:React.Dispatch<React.SetStateAction<Demo>>;passages:SourcePassage[];onClose:(saved:boolean,info?:Info)=>void};

export function ClueScreen(p:Props){
 const mode=playMode(p.demo);
 const raced=(p.demo.game?.earned??[]).some(e=>e.endsWith(`:${p.clue.id}`)&&e.startsWith("rival"))||(p.demo.game?.earned??[]).includes(`rivalLoss:${p.clue.id}`);
 const needsIntro=(mode==="rival"&&!!p.clue.off_claim&&!raced)||mode==="squad";
 const [intro,setIntro]=useState(needsIntro);
 const squad=useMemo(()=>mode==="squad"?demoSquad(p.world,p.passages,p.scene,p.clue):null,[mode,p.world,p.passages,p.scene,p.clue]);
 const go=()=>{setIntro(false);setTimeout(()=>focusScreenTop(),0)};
 if(intro&&mode==="rival")return <FaceOff world={p.world} demo={p.demo} clueName={p.clue.name} onGo={go}/>;
 if(intro&&mode==="squad"&&squad)return <Huddle squad={squad.name} clueName={p.clue.name} members={squad.members} progress={{done:p.scene.artifacts.filter(a=>p.demo.artifactAnswers[a.id]?.interpret?.trim()).length,total:p.scene.artifacts.length}} onGo={go} demo={p.demo}/>;
 return <CluePlay {...p} mode={mode} race={mode==="rival"&&!!p.clue.off_claim&&!raced} squad={squad}/>;
}

// A demo squad: the student is the Reader of the clue's own paragraphs; two computer teammates (Fact-checker and
// Connector) read the paragraphs around it and only ever pin lines that don't answer the clue.
type DemoSquad={name:string;members:HuddleMember[];mine:SourcePassage[];teammates:{name:string;job:"fact-checker"|"connector";chunk:SourcePassage[];pin:string|null}[]};
function demoSquad(world:WorldPack,passages:SourcePassage[],scene:Scene,clue:Clue):DemoSquad{
 const panel=cluePanel(world,passages,scene,clue),mine=panel.filter(x=>clue.source_anchor.includes(x.id)),rest=panel.filter(x=>!clue.source_anchor.includes(x.id));
 const names=world.computer_players?.teammates??["Computer teammate 1","Computer teammate 2"];
 const jobs=squadJobs(["me","t1","t2"]);
 const half=Math.ceil(rest.length/2),chunks=[rest.slice(0,half),rest.slice(half)];
 const teammates=(["t1","t2"] as const).map((id,i)=>({name:names[i],job:jobs.get(id) as "fact-checker"|"connector",chunk:chunks[i],pin:computerPins(world,passages,clue,chunks[i])[0]??null}));
 const part=(c:SourcePassage[])=>c.length?c.map(x=>paragraphLabel(x.id)).join(", "):"Links pins to earlier clues";
 return {name:squadName(0),mine,teammates,members:[{id:"me",name:"You",job:"reader",part:part(mine),status:"ready",me:true},...teammates.map((t,i)=>({id:`t${i+1}`,name:t.name,job:t.job,part:part(t.chunk),status:"ready" as const,computer:true}))]};
}

type Message={kind:"hint"|"win"|"info";text:string}|null;
function CluePlay({world,scene,sceneIndex,clue,roleId,demo,setDemo,passages,onClose,mode,race,squad}:Props&{mode:"solo"|"rival"|"squad";race:boolean;squad:DemoSquad|null}){
 const lie=lieFor(scene,clue.id),liar=lie?world.characters.find(c=>c.id===lie.character_id):undefined;
 const s=useClueSteps({world,scene,clue,roleId,demo,setDemo,passages,testimony:lie&&{characterId:lie.character_id,text:lie.testimony}});
 const notes=useMemo(()=>contentNotes(world),[world]);
 const panel=useMemo(()=>squad?[...squad.mine,...squad.teammates.flatMap(t=>t.chunk)]:cluePanel(world,passages,scene,clue),[squad,world,passages,scene,clue]);
 const prior=demo.artifactAnswers[clue.id];
 const [pouch,setPouch]=useState<string[]>(()=>prior?.notice?[prior.notice]:[]);
 const [selected,setSelected]=useState<string|undefined>(prior?.notice);
 const [results,setResults]=useState<{line:string;ok:boolean}[]>(()=>prior?.notice?[{line:prior.notice,ok:true}]:[]);
 const [proven,setProven]=useState(!!prior?.notice);
 const [message,setMessage]=useState<Message>(null);
 // Squads read their part first, so the question box starts closed for them.
 const [flagging,setFlagging]=useState(false),[askOpen,setAskOpen]=useState(!lie&&!squad);
 const [card,setCard]=useState<string|null>(null),[markLine,setMarkLine]=useState<PanelLine|null>(null),[explainOpen,setExplainOpen]=useState(false),[holo,setHolo]=useState<string|null>(null);
 const [lieMisses,setLieMisses]=useState(demo.lies?.[scene.id]?.misses??0),[lieCaught,setLieCaught]=useState(!!demo.lies?.[scene.id]?.caught);
 const game=demo.game??newClueGame();
 // The screen fills the space under the app header exactly, so the page never scrolls; only the passage does.
 const fit=useFitHeight();
 // ---- Voices: a new answer plays once (voices on); the speaker button replays it ----
 const [voicesOn,toggleVoices]=useSoundPref("voices",demo.preset);
 const voice=useCharacterVoice(world.id,demo.id),voiced=useRef("");
 const replier=world.characters.find(c=>c.id===s.repliedBy)??s.char;
 useEffect(()=>{if(!s.reply||s.busy||voiced.current===s.reply||!replier)return;voiced.current=s.reply;if(voicesOn)voice.play(s.reply,replier.id)},[s.reply,s.busy,voicesOn,voice,replier]);
 useEffect(()=>{if(!voicesOn)voice.stop()},[voicesOn,voice]);
 const testified=useRef(false),playRef=useRef(voice.play);playRef.current=voice.play;
 useEffect(()=>{if(!lie||!liar||testified.current||!voicesOn||lieCaught)return;const t=setTimeout(()=>{testified.current=true;playRef.current(lie.testimony,liar.id)},200);return()=>clearTimeout(t)},[lie,liar,voicesOn,lieCaught]);
 useEffect(()=>()=>voice.stop(),[voice]);

 const rival=mode==="rival";
 const award=useCallback((kind:"proof"|"offClaim"|"lie"|"rivalWin",key:string)=>{const r=earn(demo.game,kind,key);const gotFreeze=withFreeze(r.game,rival,r.points>0).freezeHeld&&!r.game.freezeHeld;setDemo(d=>{const x=earn(d.game,kind,key);return {...d,game:withFreeze(x.game,rival,x.points>0)}});if(gotFreeze)setTimeout(()=>setFreezeNote(true),0);return r},[demo.game,setDemo,rival]);
 const [freezeNote,setFreezeNote]=useState(false);
 const say=(m:Message)=>setMessage(m);
 // ---- The one tap: keep (or take back) a line; the last one kept is the proof to check ----
 function tap(l:PanelLine){
  if(raceState&&!raceState.done){raceTap(l);return}
  if(proven&&!flagging)return;
  setMessage(null);
  const k=lineWords(l.text);
  if(pouch.some(x=>lineWords(x)===k)){setPouch(p=>p.filter(x=>lineWords(x)!==k));if(selected&&lineWords(selected)===k)setSelected(undefined);return}
  setPouch(p=>[...p.filter(x=>lineWords(x)!==k),l.text].slice(-3));setSelected(l.text);
 }
 // ---- Prove it ----
 function prove(){
  if(!selected)return;
  const line=selected,pid=panel.find(x=>x.text.includes(line.trim().slice(0,30)))?.id??clue.source_anchor[0];
  if(lie&&!lieCaught){
   const r=tryLine(lie,line,lieMisses);
   if(r.result==="caught"){setLieCaught(true);setResults(x=>[...x,{line,ok:true}]);s.setProof({text:line,pid});s.setStance("contradicts");setProven(true);playStamp(0);const g=award("lie",scene.id);
    setDemo(d=>({...d,lies:{...(d.lies??{}),[scene.id]:{clue_id:clue.id,caught:true,misses:r.misses,caught_at:new Date().toISOString()}}}));say({kind:"win",text:`Lie caught. You proved ${liar?.name??"them"} wrong.${g.points?` +${g.points} points, +${g.coins} coins.`:""}`});return}
   setLieMisses(r.misses);setResults(x=>[...x,{line,ok:false}]);setDemo(d=>({...d,game:miss(d.game),lies:{...(d.lies??{}),[scene.id]:{clue_id:clue.id,caught:false,misses:r.misses}}}));
   say({kind:"hint",text:r.message});return;
  }
  const c=checkProof(world,passages,clue,line);
  if(c.ok){setResults(x=>[...x,{line,ok:true}]);s.setProof({text:line,pid});setProven(true);const g=award("proof",clue.id);say({kind:"win",text:`That's the proof.${g.points?` +${g.points} points, +${g.coins} coin${g.coins===1?"":"s"}.`:""}${(demo.game?.streak??0)+1>=2&&g.points?` Streak ${(demo.game?.streak??0)+1}!`:""}`});return}
  setResults(x=>[...x,{line,ok:false}]);setDemo(d=>({...d,game:miss(d.game)}));say({kind:"hint",text:c.hint});
 }
 // ---- Something's off ----
 function flagCheck(){
  if(!selected)return;
  const line=selected,pid=panel.find(x=>x.text.includes(line.trim().slice(0,30)))?.id??"";
  const matched=s.replyOff&&clue.off_claim?.character_id===s.repliedBy&&correctsOffClaim(clue,line);
  const flag:ClaimFlag={clueId:clue.id,characterId:s.repliedBy,answer:s.reply,line,pid,matched,at:new Date().toISOString()};
  setDemo(d=>({...d,claimFlags:[...(d.claimFlags??[]),flag].slice(-200)}));
  setFlagging(false);
  if(matched){const g=award("offClaim",clue.id);setResults(x=>[...x,{line,ok:true}]);playStamp(0);say({kind:"win",text:`You caught ${replier?.name??"them"}'s mistake.${g.points?` +${g.points} points, +${g.coins} coins.`:""}`})}
  else say({kind:"info",text:"Saved for your teacher to look at. No points either way."});
 }
 // ---- Rival race (computer rival, authored plan) ----
 const plan=useMemo(()=>race?computerRivalPlan(clue,panel):null,[race,clue,panel]);
 // rivalDelay: how long the computer rival has been frozen (its clock pauses); raceNo: this race's number, for the
 // "not twice in a row" rule.
 const [raceState,setRaceState]=useState<{start:number;you:number|null;rival:number|null;lockUntil:number;rivalNote:string;done:boolean;outcome?:string;rivalDelay:number;frozenAt:number|null;raceNo:number}|null>(()=>race?{start:Date.now(),you:null,rival:null,lockUntil:0,rivalNote:"",done:false,rivalDelay:0,frozenAt:null,raceNo:(demo.game?.races??0)+1}:null);
 const counted=useRef(false);
 useEffect(()=>{if(!raceState||counted.current)return;counted.current=true;const n=raceState.raceNo;setDemo(d=>({...d,game:{...(d.game??newClueGame()),races:Math.max(d.game?.races??0,n)}}))},[raceState,setDemo]);
 const [now,setNow]=useState(Date.now());
 useEffect(()=>{if(!raceState||raceState.done)return;const t=setInterval(()=>setNow(Date.now()),250);return()=>clearInterval(t)},[raceState]);
 const rivalName=world.computer_players?.rival.name??"Computer rival";
 const finishRace=useCallback((you:number|null,rival:number|null)=>{
  const o=rivalOutcome(you,rival);
  setRaceState(r=>r?{...r,you,rival,done:true,outcome:o}:r);
  if(o==="you"){const g=award("rivalWin",clue.id);say({kind:"win",text:`You win the point!${g.points?` +${g.points} points.`:""}`})}
  else if(o==="rival"){setDemo(d=>{const g=d.game??newClueGame();return {...d,game:{...g,rivalLosses:g.rivalLosses+1,earned:[...g.earned,`rivalLoss:${clue.id}`]}}});say({kind:"info",text:`${rivalName} found it first. Keep going: find the line yourself to prove the clue.`})}
  else say({kind:"info",text:"Time's up. Find the line yourself to prove the clue."});
 },[award,clue.id,rivalName,setDemo]);
 useEffect(()=>{if(!raceState||raceState.done||!plan)return;const t0=raceState.start+raceState.rivalDelay;const timers:number[]=[];
  if(plan.wrong)timers.push(window.setTimeout(()=>setRaceState(r=>r&&!r.done?{...r,rivalNote:`${rivalName} tapped a wrong line and is locked out.`}:r),Math.max(0,t0+plan.wrong.atMs-Date.now())));
  timers.push(window.setTimeout(()=>setRaceState(r=>{if(!r||r.done)return r;setTimeout(()=>finishRace(null,plan.correctMs),0);return r}),Math.max(0,t0+plan.correctMs-Date.now())));
  timers.push(window.setTimeout(()=>setRaceState(r=>{if(!r||r.done)return r;setTimeout(()=>finishRace(null,null),0);return r}),Math.max(0,t0+RIVAL_SECONDS*1000-Date.now())));
  return()=>timers.forEach(clearTimeout)},[raceState?.start,raceState?.done,raceState?.rivalDelay,plan,rivalName,finishRace]);// eslint-disable-line react-hooks/exhaustive-deps
 // Freeze the computer rival: its taps and clock pause for 5 seconds; it is shielded for the rest of the race.
 const freezeCheck=raceState&&!raceState.done?canFreeze({holding:!!game.freezeHeld,usedThisRound:raceState.frozenAt!==null,target:"computer",teammate:false,shielded:raceState.frozenAt!==null,last:game.lastFreeze??null,round:raceState.raceNo}):null;
 function freezeRival(){
  if(!raceState||!freezeCheck?.ok)return;
  const at=Date.now();
  setRaceState(r=>r?{...r,frozenAt:at,rivalDelay:r.rivalDelay+FREEZE_MS}:r);
  setDemo(d=>{const g=d.game??newClueGame();return {...d,game:{...g,freezeHeld:false,lastFreeze:{target:"computer",round:raceState.raceNo},freezeLog:[...(g.freezeLog??[]),{target:rivalName,clueId:clue.id,at:new Date(at).toISOString()}].slice(-200)}}});
  say({kind:"info",text:`You froze ${rivalName} for 5 seconds. It can't tap; you can.`});
 }
 function raceTap(l:PanelLine){
  if(!raceState||raceState.done||!plan||Date.now()<raceState.lockUntil)return;
  const ms=Date.now()-raceState.start;
  if(correctsOffClaim(clue,l.text)){setPouch(p=>[...p.filter(x=>lineWords(x)!==lineWords(l.text)),l.text].slice(-3));setSelected(l.text);setResults(x=>[...x,{line:l.text,ok:true}]);
   // The catch, the proof and the point, applied in order so the streak counts each one.
   const proofOk=checkProof(world,passages,clue,l.text).ok;
   const kinds:("offClaim"|"proof"|"rivalWin")[]=["offClaim",...(proofOk?["proof" as const]:[]),"rivalWin"];
   const apply=(g:typeof demo.game)=>kinds.reduce((acc,k)=>{const r=earn(acc.game,k,clue.id);return {game:withFreeze(r.game,rival,r.points>0),points:acc.points+r.points,coins:acc.coins+r.coins}},{game:g??newClueGame(),points:0,coins:0});
   const total=apply(demo.game);if(total.game.freezeHeld&&!demo.game?.freezeHeld)setFreezeNote(true);
   setDemo(d=>({...d,game:apply(d.game).game}));
   if(proofOk){s.setProof({text:l.text,pid:l.pid});s.setStance("contradicts");setProven(true)}
   setRaceState(r=>r?{...r,you:ms,done:true,outcome:"you"}:r);playStamp(0);
   say({kind:"win",text:`You win the point and catch the mistake!${total.points?` +${total.points} points, +${total.coins} coins.`:""}`});return}
  setResults(x=>[...x,{line:l.text,ok:false}]);setRaceState(r=>r?{...r,lockUntil:Date.now()+RIVAL_LOCKOUT_MS}:r);say({kind:"hint",text:"Not that line. Locked out for 3 seconds."});
 }
 const locked=!!raceState&&!raceState.done&&now<raceState.lockUntil;
 // ---- Demo squad: computer pins (never the answer), reactions and the vote ----
 const [squadStart]=useState(Date.now());
 const [teamPins,setTeamPins]=useState<PanelPin[]>([]),[reactions,setReactions]=useState<PanelReaction[]>([]),[reactOpen,setReactOpen]=useState<string|null>(null),[voteOpen,setVoteOpen]=useState(false);
 useEffect(()=>{if(!squad)return;const timers=squad.teammates.map((t,i)=>t.pin?window.setTimeout(()=>setTeamPins(p=>p.some(x=>x.by===t.name)?p:[...p,{line:t.pin!,by:t.name,color:"#5E7FA8",computer:true}]),Math.max(0,squadStart+4000+i*5000+t.pin.split(/\s+/).length*80-Date.now())):0);return()=>timers.forEach(clearTimeout)},[squad,squadStart]);
 // A computer teammate reacts to the student's first pin a few seconds later, with an authored stem.
 const firstPin=pouch[0];
 useEffect(()=>{if(!squad||!firstPin)return;const earlier=scene.artifacts[Math.max(0,scene.artifacts.indexOf(clue)-1)];const who=world.characters.find(c=>c.id===clue.off_claim?.character_id)??s.char;
  const t=window.setTimeout(()=>setReactions(r=>r.some(x=>x.by===squad.teammates[0].name&&lineWords(x.line)===lineWords(firstPin))?r:[...r,{line:firstPin,by:squad.teammates[0].name,stem:REACTION_STEMS.proves,body:`we should check it against what ${who?.name??"the character"} said.`},...(earlier&&earlier!==clue?[{line:firstPin,by:squad.teammates[1].name,stem:REACTION_STEMS.connects,body:`the clue about ${inSentence(earlier.name)}.`}]:[])]),3500);
  return()=>clearTimeout(t)},[squad,firstPin,scene.artifacts,clue,world.characters,s.char]);
 const myPins:PanelPin[]=squad?pouch.map(line=>({line,by:"You",color:"#A0472C"})):[];

 function saveClue(){const info=s.save();if(info)onClose(true,info)}
 const holoChar=holo?world.characters.find(c=>c.id===holo):undefined;
 if(holoChar)return <HologramView character={holoChar} worldId={world.id} line={(holoChar.id===s.repliedBy&&s.reply)||(lie&&holoChar.id===lie.character_id?lie.testimony:"")} sandboxId={demo.id} title={clue.name} onClose={()=>{voice.stop();setHolo(null);setTimeout(()=>focusScreenTop(),0)}}/>;

 const speaking=lie&&!s.reply&&!s.busy?liar:replier;
 const askable=s.chars;
 const task=raceState&&!raceState.done?`Race: tap the line that proves ${world.characters.find(c=>c.id===clue.off_claim?.character_id)?.name??"them"} wrong.`
  :flagging?`Tap the line that shows what ${replier?.name??"they"} got wrong, then Check.`
  :lie&&!lieCaught?`One thing ${liar?.name} said is false. Tap the line that proves it, then Prove it.`
  :proven?"Proven. Now explain what it shows."
  :s.asked?`Tap the line that proves or disproves ${replier?.name??"them"}, then Prove it.`
  :s.notice;
 const trust=trustMeter(world,demo);
 const voiceToggle=s.reply&&replier?voiceButtonFor(voice.current,replier.id,s.reply,replier.name):null;

 return <div data-fill-screen className="case-ui relative flex flex-col bg-[#F6F0E3]" style={{height:fit??"calc(100dvh - 58px)"}}>
  {/* Top row: back, the clue banner (the scene picture, small) and points */}
  <div className="mx-auto flex w-full max-w-6xl items-stretch gap-2 px-3 pt-2 md:px-6">
   <button type="button" onClick={()=>onClose(false)} aria-label="Back to the scene" className="grid w-11 shrink-0 place-items-center rounded-2xl bg-[#EFE8D8] text-[#2A2620] hover:bg-[#E4DCCB]"><ArrowLeft size={20}/></button>
   <div className="relative flex min-h-[52px] min-w-0 flex-1 items-center gap-2 overflow-hidden rounded-2xl px-3 md:min-h-[72px]" style={{backgroundImage:`linear-gradient(90deg,rgba(42,38,32,.9),rgba(42,38,32,.45)),url('${scene.background_image}')`,backgroundSize:"cover",backgroundPosition:`${clue.position.x+clue.position.width/2}% ${clue.position.y+clue.position.height/2}%`}}>
    <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-bold uppercase tracking-wide text-[#F3C9B2] md:text-[11px]">Clue {scene.artifacts.indexOf(clue)+1} of {scene.artifacts.length} · {evidenceLabel[clue.evidence_type]}</p><h1 className="line-clamp-2 text-[16px] font-bold leading-tight text-white outline-none md:text-[22px]">{clue.name}</h1></div>
    <GameChips demo={demo} onDark/>
   </div>
  </div>
  <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col gap-2 px-3 pb-3 pt-2 md:flex-row md:gap-4 md:px-6">
   {/* Side column (top on phones): banner, the character's claim, the task */}
   <div className="flex shrink-0 flex-col gap-2 md:order-2 md:w-[400px] md:min-h-0 md:overflow-y-auto">
    {raceState&&<RaceBar state={raceState} now={now} rivalName={rivalName} emblem={world.computer_players?.rival.emblem??"lantern"} locked={locked} game={game} freeze={freezeCheck} onFreeze={freezeRival}/>}
    {freezeNote&&rival&&<p role="status" className="rounded-2xl border-2 border-[#9CC3E0] bg-[#E8F2FA] px-3 py-2 text-[13px] font-semibold text-[#2F5D80]">❄ Three right proofs in a row: you earned a Freeze. Use it in your next face-off.</p>}
    {squadSoloToday(demo)&&<p className="rounded-2xl bg-[#F4E1D6] px-3 py-1.5 text-[13px] font-semibold text-[#8A3B23]">{SQUAD_SOLO_NOTE}</p>}
    {squad&&<p className="rounded-2xl bg-[#F4E1D6] px-3 py-2 text-[13px] leading-5"><b>Reader:</b> {SQUAD_JOBS.reader.does} Your part: {squad.mine.map(x=>paragraphLabel(x.id)).join(", ")}.</p>}
    {/* The claim */}
    {speaking&&(lie&&!s.reply&&!s.busy?
     <Bubble who={liar!} label={lieCaught?"Testimony · lie caught":"Testimony"} onCard={()=>setCard(liar!.id)} speaking={voice.speaking===liar!.id} actions={lieCaught&&!askOpen?<button type="button" onClick={()=>setAskOpen(true)} className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-[#F3C9B2]"><MessageCircle size={14}/>Ask {liar!.name.split(" ")[0]} a question</button>:null}>{testimonyParts(lie).map((x,i)=>x.false&&lieCaught?<s key={i}>{x.text}</s>:<span key={i}>{x.text}</span>)}</Bubble>
     :raceState&&!raceState.done&&clue.off_claim?<Bubble who={world.characters.find(c=>c.id===clue.off_claim!.character_id)??speaking} label="Claim" onCard={()=>setCard(clue.off_claim!.character_id)}>{clue.off_claim.claim}</Bubble>
     :s.reply||s.busy?<Bubble who={replier??speaking} label={s.asked?`You asked: ${s.asked}`:""} onCard={()=>setCard((replier??speaking).id)} speaking={!!replier&&voice.speaking===replier.id}
       actions={!s.busy&&s.reply?<>
        {!flagging&&<button type="button" onClick={()=>{setFlagging(true);setMessage(null);setSelected(undefined)}} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-[#FFFDF8] px-3 text-[13px] font-bold text-[#A33B20]"><Flag size={14}/>Something's off</button>}
        {voiceToggle&&replier&&<button type="button" onClick={()=>voice.toggle(s.reply,replier.id)} aria-label={voiceToggle.aria} aria-pressed={voiceToggle.playing} className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-[#F3C9B2]">{voiceToggle.playing?<Square size={12} fill="currentColor"/>:<Volume2 size={15}/>}{voiceToggle.label}</button>}
        <button type="button" onClick={()=>setAskOpen(v=>!v)} aria-expanded={askOpen} className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-[13px] font-semibold text-[#F3C9B2]"><MessageCircle size={14}/>Ask</button></>:null}>
       {s.busy?"Thinking…":s.reply}</Bubble>
     :null)}
    {/* Asking */}
    {askOpen&&(!lie||lieCaught)&&!(raceState&&!raceState.done)&&!s.busy&&(askable.length?<div className="rounded-2xl bg-[#FFFDF8] p-3 shadow-[0_2px_10px_-6px_rgba(42,38,32,.3)]">
     <div className="flex items-center justify-between gap-2"><div className="flex flex-wrap gap-1.5">{askable.map(c=><span key={c.id} className="inline-flex items-center"><button type="button" onClick={()=>setCard(c.id)} aria-label={`${c.name}'s card`} className="rounded-full ring-2 ring-transparent hover:ring-[#A0472C]"><Portrait character={c} size={36}/></button><button type="button" onClick={()=>s.setCharacter(c.id)} aria-pressed={s.character===c.id} className={`ml-1 min-h-9 rounded-full px-2.5 text-[13px] font-bold ${s.character===c.id?"bg-[#2A2620] text-white":"bg-[#EFE8D8]"}`}>{c.name.split(" ")[0]}</button></span>)}</div><SoundToggle on={voicesOn} onToggle={toggleVoices} label="Voices"/></div>
     <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">{s.suggestions.map(q=><button key={q} type="button" onClick={()=>{s.ask(q);setAskOpen(false);setFlagging(false)}} className="min-h-10 shrink-0 rounded-full bg-[#F4E1D6] px-3 text-[13px] font-semibold text-[#2A2620]">{q}</button>)}</div>
     <form onSubmit={e=>{e.preventDefault();s.ask(s.question);setAskOpen(false);setFlagging(false)}} className="mt-1.5 flex gap-1.5"><label className="sr-only" htmlFor="clue-ask">Your question for {s.char?.name}</label><input id="clue-ask" value={s.question} onChange={e=>s.setQuestion(e.target.value)} maxLength={300} placeholder={`Ask ${s.char?.name?.split(" ")[0]??""}…`} className="min-h-11 min-w-0 flex-1 rounded-full border border-[#E4DCCB] bg-white px-4 text-[15px] outline-none focus:border-[#A0472C]"/><button disabled={!s.question.trim()} className="min-h-11 rounded-full bg-[#2A2620] px-4 text-[14px] font-bold text-white disabled:opacity-40">Ask</button></form>
     {!s.asked&&<button type="button" onClick={()=>setAskOpen(false)} className="mt-1 text-[13px] text-[#6B6457] underline underline-offset-4">Skip, I'll look myself</button>}
    </div>:<p className="rounded-2xl bg-[#FFFDF8] px-3 py-2 text-[14px]">{CLASS_AI_OFF}</p>)}
    <div aria-live="polite">{message?<p className={`rounded-2xl px-3 py-2 text-[14px] leading-5 ${message.kind==="win"?"bg-[#2F6B3A] font-semibold text-white":message.kind==="hint"?"border-l-4 border-[#A0472C] bg-[#FBF1EB]":"bg-[#EFE8D8]"}`}>{message.text}</p>
     :<p className="flex items-start gap-1.5 text-[14px] font-semibold leading-5 text-[#8A3B23]"><span aria-hidden>🔎</span>{task}</p>}</div>
    {trust&&mode==="solo"&&<span className="sr-only">{trust.name}'s trust is {trust.value}.</span>}
    {dock("hidden md:flex")}
   </div>
   {/* The passage */}
   <ReadingPanel className="min-h-0 flex-1 md:order-1" passages={panel} notes={notes} kept={pouch} selected={selected} results={results} marks={demo.marks} onTap={tap} onMark={l=>setMarkLine(l)} locked={locked} pins={squad?[...myPins,...teamPins]:[]} reactions={reactions}
    title={<><span>The story · {[...new Set(panel.map(x=>paragraphLabel(x.id)))].join(" ")}</span>{squad&&<span className="normal-case">Your part first</span>}</>}/>
   {dock("flex md:hidden")}
  </div>
  {card&&(()=>{const c=world.characters.find(x=>x.id===card);return c?<CharacterCard world={world} passages={passages} character={c} sceneIndex={sceneIndex} trust={trust&&trust.name===c.name?trust.value:undefined} onClose={()=>setCard(null)} onHologram={()=>{setCard(null);voice.stop();setHolo(c.id)}} onAsk={askable.some(a=>a.id===c.id)&&(!lie||lieCaught)?()=>{s.setCharacter(c.id);setAskOpen(true);setCard(null)}:undefined}/>:null})()}
  {markLine&&<MarkSheet line={markLine} current={demo.marks?.[markKey(markLine.pid,markLine.index)]} inPouch={pouch.some(x=>lineWords(x)===lineWords(markLine.text))} onClose={()=>setMarkLine(null)} onPouch={()=>{tap(markLine);setMarkLine(null)}}
   onTag={(tag:MarkTag|null)=>{const k=markKey(markLine.pid,markLine.index);setDemo(d=>{const m={...(d.marks??{})};if(tag)m[k]={tag,pid:markLine.pid,text:markLine.text,clueId:clue.id,at:new Date().toISOString()};else delete m[k];return {...d,marks:m}});setMarkLine(null)}}/>}
  {reactOpen&&squad&&<ReactSheet line={reactOpen} onClose={()=>setReactOpen(null)} onSend={(stem,body)=>{setReactions(r=>[...r,{line:reactOpen,by:"You",stem:REACTION_STEMS[stem],body}]);setReactOpen(null)}}/>}
  {voteOpen&&squad&&<VoteSheet pins={[...myPins,...teamPins]} reactions={reactions} factChecker={squad.teammates.find(t=>t.job==="fact-checker")?.name??null} onClose={()=>setVoteOpen(false)} onLock={line=>{setVoteOpen(false);proveLine(line)}}/>}
  {explainOpen&&<ExplainSheet s={s} who={replier?.name} asked={!!s.asked&&!lie} onClose={()=>setExplainOpen(false)} onSave={saveClue}/>}
 </div>;

 function proveLine(line:string){setSelected(line);
  const c=checkProof(world,passages,clue,line),pid=panel.find(x=>x.text.includes(line.trim().slice(0,30)))?.id??clue.source_anchor[0];
  if(c.ok){setResults(x=>[...x,{line,ok:true}]);s.setProof({text:line,pid});setProven(true);const g=award("proof",clue.id);say({kind:"win",text:`Your squad's pick is the proof.${g.points?` +${g.points} points, +${g.coins} coin${g.coins===1?"":"s"}.`:""}`})}
  else{setResults(x=>[...x,{line,ok:false}]);setDemo(d=>({...d,game:miss(d.game)}));say({kind:"hint",text:c.hint})}}

 // The bottom dock: the pouch and one clear action.
 function dock(className:string){
  const inRace=!!raceState&&!raceState.done;
  return <div className={`shrink-0 flex-col gap-1.5 ${className}`}>
   <div className="flex items-center justify-between rounded-2xl border-2 border-dashed border-[#C9B9A0] bg-[#FBF7EE] px-3 py-1.5 text-[13px] font-bold" aria-live="polite"><span>Evidence pouch · {pouch.length} of 3</span><span aria-hidden className="flex gap-1">{[0,1,2].map(i=><i key={i} className={`block h-2 w-5 rounded ${i<pouch.length?"bg-[#A0472C]":"bg-[#E4DCCB]"}`}/>)}</span></div>
   {squad&&!proven&&<div className="flex gap-1.5">{pouch.length>0||teamPins.length>0?<button type="button" onClick={()=>setReactOpen(teamPins.at(-1)?.line??pouch[0])} className="min-h-12 flex-1 rounded-full bg-[#F4E1D6] text-[15px] font-bold text-[#8A3B23]">React</button>:null}<button type="button" onClick={()=>setAskOpen(v=>!v)} aria-expanded={askOpen} className="min-h-12 flex-1 rounded-full bg-[#EFE8D8] text-[15px] font-bold">Ask</button><button type="button" disabled={!pouch.length} onClick={()=>setVoteOpen(true)} aria-label="Vote on the best proof" className="flex min-h-12 flex-[1.4] items-center justify-center gap-1.5 rounded-full bg-[#A0472C] text-[15px] font-bold text-white disabled:opacity-40"><Vote size={17}/>Vote</button></div>}
   {!squad&&!proven&&!flagging&&!inRace&&<button type="button" disabled={!selected} onClick={prove} className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-full bg-[#A0472C] text-[16px] font-bold text-white disabled:opacity-40">Prove it <ArrowRight size={18}/></button>}
   {flagging&&<div className="flex gap-1.5"><button type="button" onClick={()=>{setFlagging(false);setMessage(null)}} className="min-h-12 flex-1 rounded-full bg-[#EFE8D8] text-[15px] font-bold">Cancel</button><button type="button" disabled={!selected} onClick={flagCheck} className="flex min-h-12 flex-[2] items-center justify-center gap-1.5 rounded-full bg-[#A33B20] text-[15px] font-bold text-white disabled:opacity-40"><Flag size={16}/>Check</button></div>}
   {inRace&&<p className="text-center text-[13px] font-semibold text-[#6B6457]">{locked?"Locked out…":"Tap a line in the story."}</p>}
   {proven&&!flagging&&<>{s.asked&&!lie&&!s.stance&&<div className="grid grid-cols-2 gap-1.5">{[["supports","Backs them up"],["contradicts","Proves them wrong"]].map(([v,l])=><button key={v} type="button" onClick={()=>s.setStance(v)} className="min-h-12 rounded-full bg-[#EFE8D8] text-[14px] font-bold">{l}</button>)}</div>}
    <button type="button" disabled={!!s.asked&&!lie&&!s.stance} onClick={()=>setExplainOpen(true)} className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-full bg-[#A0472C] text-[16px] font-bold text-white disabled:opacity-40">Explain it in your words <ArrowRight size={18}/></button></>}
  </div>;
 }
}

function useFitHeight(){
 const [h,setH]=useState<number|null>(null);
 useEffect(()=>{const f=()=>{const top=document.querySelector("main > header")?.getBoundingClientRect().bottom??0;setH(Math.max(420,window.innerHeight-Math.max(0,top)))};f();window.addEventListener("resize",f);return()=>window.removeEventListener("resize",f)},[]);
 return h;
}
function Bubble({who,label,children,actions,onCard,speaking}:{who:WorldPack["characters"][number];label?:string;children:React.ReactNode;actions?:React.ReactNode;onCard:()=>void;speaking?:boolean}){
 return <div className="flex gap-2.5 rounded-2xl bg-[#2A2620] p-2.5 text-[#FFFDF8]">
  <button type="button" onClick={onCard} aria-label={`Open ${who.name}'s card`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full ring-2 ring-[#F3C9B2]"><Portrait character={who} size={40} speaking={speaking}/></button>
  <div className="min-w-0 flex-1"><p className="line-clamp-1 text-[11px] font-bold uppercase tracking-wide text-[#F3C9B2]">{who.name}{label?<span className="ml-1 font-semibold normal-case tracking-normal text-[#E8DDCB]"> · {label}</span>:null}</p>
   <p className="mt-0.5 max-h-[17dvh] overflow-y-auto text-[14.5px] leading-[1.4] md:max-h-none md:text-[15px]">{children}</p>
   {actions&&<div className="mt-1 flex flex-wrap items-center gap-0.5">{actions}</div>}</div>
 </div>;
}

function RaceBar({state,now,rivalName,emblem,locked,game,freeze,onFreeze}:{state:{start:number;you:number|null;rival:number|null;lockUntil:number;rivalNote:string;done:boolean;outcome?:string;frozenAt:number|null};now:number;rivalName:string;emblem:"lantern"|"rider";locked:boolean;game:{rivalWins:number;rivalLosses:number;freezeHeld?:boolean};freeze:{ok:boolean;reason?:string}|null;onFreeze:()=>void}){
 const frozenLeft=freezeLeft(state.frozenAt,now);
 const left=Math.max(0,Math.ceil(RIVAL_SECONDS-(now-state.start)/1000)),wait=Math.max(0,Math.ceil((state.lockUntil-now)/1000));
 const share=state.done?(state.outcome==="you"?0.8:state.outcome==="rival"?0.2:0.5):Math.min(0.85,Math.max(0.15,0.5+(state.you!==null?0.3:0)-(state.rival!==null?0.3:0)));
 return <div className="rounded-2xl bg-[#FFFDF8] p-2.5 shadow-[0_2px_10px_-6px_rgba(42,38,32,.3)]">
  <div className="flex items-center justify-between text-[13px] font-bold"><span className="text-[#8A3B23]">You</span><span className="tabular-nums text-[#6B6457]" aria-label={`${left} seconds left`}>{state.done?"Done":`${left}s`}</span><span className="flex items-center gap-1.5 text-[#3E5F86]">{rivalName}<span className="overflow-hidden rounded-full"><RivalEmblem kind={emblem} size={22}/></span></span></div>
  <TugBar share={share} you={game.rivalWins} them={game.rivalLosses} label="Face-off"/>
  <p className="mt-1 text-[12px] text-[#6B6457]" aria-live="polite">{locked?`Locked out: ${wait}s`:frozenLeft>0?`❄ ${rivalName} is frozen: ${frozenLeft}s`:state.rivalNote||`${rivalName} (computer rival) is reading…`}</p>
  {!state.done&&game.freezeHeld&&(freeze?.ok?<button type="button" onClick={onFreeze} className="mt-1.5 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full border-2 border-[#9CC3E0] bg-[#E8F2FA] text-[14px] font-bold text-[#2F5D80]">❄ Freeze {rivalName}</button>
   :<p className="mt-1 text-[12px] font-semibold text-[#2F5D80]">❄ Freeze ready · {freeze?.reason}</p>)}
 </div>;
}

// Reactions: pick a sentence stem and finish it (80 characters), screened by the same filter as character questions.
function ReactSheet({line,onSend,onClose}:{line:string;onSend:(stem:ReactionStem,body:string)=>void;onClose:()=>void}){
 const [stem,setStem]=useState<ReactionStem>("proves"),[body,setBody]=useState(""),[err,setErr]=useState("");
 const box=useRef<HTMLInputElement>(null);useEffect(()=>{box.current?.focus();const k=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};window.addEventListener("keydown",k);return()=>window.removeEventListener("keydown",k)},[onClose]);
 function send(){const t=body.trim();if(!t)return;const s=screenMessage(t);if(s.action!=="allow"){setErr(s.message??"Try different words.");return}onSend(stem,t)}
 return <Sheet label="React to a pin" onClose={onClose}>
  <p className="line-clamp-2 font-serif text-[15px] italic leading-6">“{displayLine(line)}”</p>
  <div className="mt-3 grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Sentence stem">{(Object.keys(REACTION_STEMS) as ReactionStem[]).map(k=><button key={k} type="button" role="radio" aria-checked={stem===k} onClick={()=>setStem(k)} className={`min-h-12 rounded-2xl px-2 text-[13px] font-bold ${stem===k?"bg-[#2A2620] text-white":"bg-[#F4E1D6] text-[#8A3B23]"}`}>{REACTION_STEMS[k]}</button>)}</div>
  <label htmlFor="react-box" className="mt-3 block text-[14px] font-bold">{REACTION_STEMS[stem]}</label>
  <input id="react-box" ref={box} value={body} onChange={e=>{setBody(e.target.value);setErr("")}} maxLength={REACTION_MAX} placeholder="finish the sentence" className="mt-1 min-h-12 w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 text-[16px]"/>
  <p className="mt-1 text-right text-[12px] text-[#6B6457]">{body.length}/{REACTION_MAX}</p>
  {err&&<p role="alert" className="text-[14px] text-[#A33B20]">{err}</p>}
  <button type="button" disabled={!body.trim()} onClick={send} className="case-primary mt-2 w-full disabled:opacity-40">Add my reaction</button>
 </Sheet>;
}
// The squad vote on its best proof line. Computer teammates vote for their own pins; ties follow voteWinner.
function VoteSheet({pins,reactions,factChecker,onLock,onClose}:{pins:PanelPin[];reactions:PanelReaction[];factChecker:string|null;onLock:(line:string)=>void;onClose:()=>void}){
 const unique=pins.filter((p,i)=>pins.findIndex(q=>lineWords(q.line)===lineWords(p.line))===i);
 const [mine,setMine]=useState<string|null>(null),[left,setLeft]=useState(45);
 useEffect(()=>{const t=setInterval(()=>setLeft(n=>Math.max(0,n-1)),1000);return()=>clearInterval(t)},[]);
 const votes=[...pins.filter(p=>p.computer).map(p=>({voter:p.by,line:p.line})),...(mine?[{voter:"You",line:mine}]:[])];
 const reacts=(line:string)=>reactions.filter(r=>lineWords(r.line)===lineWords(line)).length;
 const winner=voteWinner(unique.map(p=>({line:p.line,reactions:reacts(p.line)})),votes,factChecker);
 useEffect(()=>{if(left===0&&winner)onLock(winner)},[left,winner,onLock]);
 return <Sheet label="Vote: best proof" onClose={onClose}>
  <p className="text-[14px] text-[#4A4438]">Which line best proves it? Ties go to the line with the most reactions, then the Fact-checker's vote. <span className="font-bold tabular-nums">{left}s</span></p>
  <ul className="mt-2 max-h-[45dvh] space-y-2 overflow-y-auto">{unique.map(p=>{const n=votes.filter(v=>lineWords(v.line)===lineWords(p.line)).length;const lead=winner&&lineWords(winner)===lineWords(p.line);return <li key={p.line}><button type="button" aria-pressed={!!mine&&lineWords(mine)===lineWords(p.line)} onClick={()=>setMine(p.line)} className={`w-full rounded-2xl border-2 p-3 text-left ${mine&&lineWords(mine)===lineWords(p.line)?"border-[#A0472C] bg-[#FBEDE5]":"border-[#E4DCCB] bg-[#FFFDF8]"}`}>
   <span className="block font-serif text-[15px] leading-6">{displayLine(p.line)}</span>
   <span className="mt-1 flex flex-wrap justify-between gap-x-3 text-[12px] font-bold text-[#8A3B23]"><span>Pinned by {p.by}{p.computer?" (computer)":""} · {reacts(p.line)} reaction{reacts(p.line)===1?"":"s"}</span><span className="whitespace-nowrap">{n} vote{n===1?"":"s"}{lead?" · leading":""}</span></span></button></li>})}</ul>
  <button type="button" disabled={!mine||!winner} onClick={()=>winner&&onLock(winner)} className="case-primary mt-3 w-full disabled:opacity-40"><Check size={18}/>Lock in the squad's pick</button>
 </Sheet>;
}
function ExplainSheet({s,who,asked,onClose,onSave}:{s:ReturnType<typeof useClueSteps>;who?:string;asked:boolean;onClose:()=>void;onSave:()=>void}){
 const box=useRef<HTMLTextAreaElement>(null);useEffect(()=>{box.current?.focus()},[]);
 return <Sheet label="What does it show?" onClose={onClose}>
  <p className="text-[15px] leading-6 text-[#4A4438]">{s.interpret}</p>
  {s.proof&&<blockquote className="mt-2 rounded-2xl border-l-4 border-[#A0472C] bg-[#F4E1D6]/60 px-3 py-2 font-serif text-[15px] leading-6">{displayLine(s.proof.text)}</blockquote>}
  <div className="mt-2 flex flex-wrap gap-1.5">{["This line shows…","I think this means… because…",...(asked&&who?[`This proves ${who} was wrong because…`]:[])].map(t=><button key={t} type="button" onClick={()=>{s.setExplain(v=>v?`${v} ${t}`:t);box.current?.focus()}} className="min-h-10 rounded-full bg-[#EFE8D8] px-3 text-[13px]">{t}</button>)}</div>
  <label htmlFor="explain-box" className="sr-only">Your answer</label>
  <textarea id="explain-box" ref={box} value={s.explain} onChange={e=>s.setExplain(e.target.value)} rows={4} maxLength={1200} placeholder="Write it in your own words…" className="mt-2 w-full rounded-2xl border border-[#E4DCCB] bg-white px-4 py-3 text-[16px] leading-6"/>
  <button type="button" disabled={!s.explain.trim()||!s.proof} onClick={onSave} className="case-primary mt-2 w-full disabled:opacity-40"><Check size={18}/>Save this clue</button>
 </Sheet>;
}
function Sheet({label,children,onClose}:{label:string;children:React.ReactNode;onClose:()=>void}){
 const h=useRef<HTMLHeadingElement>(null);
 useEffect(()=>{const k=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose()};window.addEventListener("keydown",k);if(!document.activeElement||document.activeElement===document.body)h.current?.focus();return()=>window.removeEventListener("keydown",k)},[onClose]);
 return <div className="absolute inset-0 z-50 flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-labelledby="sheet-h">
  <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-[#2A2620]/45"/>
  <div className="relative max-h-[92%] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-[#FFFDF8] p-5 pb-7 md:rounded-3xl"><h2 id="sheet-h" ref={h} tabIndex={-1} className="text-[20px] font-bold outline-none">{label}</h2><div className="mt-2">{children}</div></div>
 </div>;
}
