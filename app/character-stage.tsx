"use client";
// A witness on the dark stage: the 3D model (three.js, loaded only when this mounts) framed from the knees up in warm
// lantern light, or the animated portrait when WebGL is missing, memory is low or the model takes over 4 seconds.
// He has no mouth shapes, so he talks with his body: the talking clip while a line plays, laughing or the head shake
// where the line calls for it, and the lantern glow follows his voice. Under reduced motion: no camera moves, a
// minimal idle and a steady glow. Rules: lib/character-motion.ts.
import {useCallback,useEffect,useRef,useState} from "react";
import {MODEL_TIMEOUT_MS,chooseStage,glowFor,idleTracks} from "@/lib/character-motion";

export type StageClip="idle"|"talking"|"laughing"|"head-shake";
export type CharacterModel={src:string;clips:Partial<Record<Exclude<StageClip,"idle">,string>>};
export type StageMode="loading"|"3d"|"portrait";

function hasWebGL(){try{const c=document.createElement("canvas");return !!(c.getContext("webgl2")??c.getContext("webgl"))}catch{return false}}
export function detectStage(){
 const nav=navigator as Navigator&{deviceMemory?:number;connection?:{saveData?:boolean}};
 return chooseStage({webgl:hasWebGL(),deviceMemory:nav.deviceMemory??null,saveData:!!nav.connection?.saveData});
}
const prefersReduced=()=>typeof window!=="undefined"&&(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches||document.documentElement.dataset.motion==="reduced");

// onCanvas: the rendered canvas, for screens that copy each frame (the hologram's four views).
export function CharacterStage({model,portrait,name,clip="idle",gesture=null,level=0,className="",onMode,onCanvas,forcePortrait=false,height=360}:{model?:CharacterModel|null;portrait?:string|null;name:string;clip?:StageClip;gesture?:{clip:"laughing"|"head-shake";key:number}|null;level?:number;className?:string;onMode?:(m:StageMode,ms?:number)=>void;onCanvas?:(c:HTMLCanvasElement|null)=>void;forcePortrait?:boolean;height?:number}){
 const box=useRef<HTMLDivElement>(null);
 const [mode,setMode]=useState<StageMode>(model&&!forcePortrait?"loading":"portrait");
 const api=useRef<{play:(c:StageClip)=>void;gesture:(c:StageClip)=>void;glow:(v:number)=>void}|null>(null);
 const reduced=useRef(false);
 useEffect(()=>{reduced.current=prefersReduced()},[]);
 // Load the model (or fall back).
 useEffect(()=>{
  if(!model||forcePortrait){setMode("portrait");onMode?.("portrait");return}
  if(detectStage()==="portrait"){setMode("portrait");onMode?.("portrait");return}
  let cancelled=false,dispose=()=>{};const t0=performance.now();performance.mark?.("stage-start");
  const timer=window.setTimeout(()=>{if(!cancelled){cancelled=true;performance.mark?.("stage-timeout");setMode("portrait");onMode?.("portrait",performance.now()-t0);dispose()}},MODEL_TIMEOUT_MS);
  (async()=>{
   const THREE=await import("three");
   const {GLTFLoader}=await import("three/examples/jsm/loaders/GLTFLoader.js");
   const {MeshoptDecoder}=await import("three/examples/jsm/libs/meshopt_decoder.module.js");
   const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
   const gltf=await loader.loadAsync(model.src);
   if(cancelled||!box.current)return;
   window.clearTimeout(timer);
   // A busy page can hold the timer back: a load that took over 4 seconds still counts as too slow.
   if(performance.now()-t0>MODEL_TIMEOUT_MS){cancelled=true;performance.mark?.("stage-timeout");setMode("portrait");onMode?.("portrait",performance.now()-t0);return}
   const el=box.current,w=el.clientWidth||360,h=el.clientHeight||height;
   const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:"low-power",preserveDrawingBuffer:!!onCanvas});
   renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));renderer.setSize(w,h);renderer.outputColorSpace=THREE.SRGBColorSpace;
   renderer.domElement.setAttribute("aria-hidden","true");
   el.appendChild(renderer.domElement);
   const scene=new THREE.Scene();
   const root=gltf.scene;scene.add(root);
   // Clips: the model's own, plus the idle made in code. The model's rest pose is a T-pose, so the idle holds the
   // talking clip's first frame (arms down) and adds small rotations to it; no finger bones.
   const mixer=new THREE.AnimationMixer(root);
   const clips:Record<string,import("three").AnimationClip>={};
   for(const [k,v] of Object.entries(model.clips))if(v){const c=gltf.animations.find(a=>a.name===v);if(c)clips[k]=c}
   const base=new Map<string,number[]>();
   for(const t of (clips.talking??gltf.animations[0])?.tracks??[])base.set(t.name,Array.from(t.values.slice(0,t.getValueSize())));
   const bones:import("three").Bone[]=[];root.traverse(o=>{if((o as import("three").Bone).isBone)bones.push(o as import("three").Bone)});
   const moving=new Set<string>();
   const tracks:import("three").KeyframeTrack[]=idleTracks(reduced.current).flatMap(t=>{const b=bones.find(x=>new RegExp(`${t.bone}$`).test(x.name));if(!b)return [];
    const name=`${b.name}.quaternion`,start=base.get(name),rest=start?new THREE.Quaternion().fromArray(start):b.quaternion.clone();moving.add(name);
    const values=t.euler.flatMap(([x,y,z])=>rest.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(x,y,z))).toArray());
    return [new THREE.QuaternionKeyframeTrack(name,t.times,values)]});
   for(const [name,v] of base)if(!moving.has(name))tracks.push(name.endsWith(".quaternion")?new THREE.QuaternionKeyframeTrack(name,[0],v):new THREE.VectorKeyframeTrack(name,[0],v));
   clips.idle=new THREE.AnimationClip("idle",-1,tracks);
   let current=mixer.clipAction(clips.idle);current.play();mixer.update(0);
   // Frame from the knees up: the model's height, the camera at the middle of what shows.
   // The posed (skinned) bounds, not the mesh's bind-pose bounds.
   root.updateMatrixWorld(true);const bb=new THREE.Box3();
   root.traverse(o=>{const m=o as import("three").SkinnedMesh;if(!m.isSkinnedMesh&&!(o as import("three").Mesh).isMesh)return;if(m.isSkinnedMesh)m.skeleton.update();m.computeBoundingBox();bb.union(m.boundingBox!.clone().applyMatrix4(m.matrixWorld))});
   const H=bb.max.y-bb.min.y,cx=(bb.min.x+bb.max.x)/2,cz=(bb.min.z+bb.max.z)/2;
   const bottom=bb.min.y+0.27*H,top=bb.max.y+0.04*H,midY=(bottom+top)/2,span=top-bottom;
   const camera=new THREE.PerspectiveCamera(28,w/h,0.01,100);
   const dist=(span/2)/Math.tan(THREE.MathUtils.degToRad(28/2))*Math.max(1,(h/w)*0.62);
   camera.position.set(cx,midY,cz+dist);camera.lookAt(cx,midY,cz);
   // Warm lantern light: a soft fill from the sky and the stage, a warm key, and the lantern whose glow follows his voice.
   scene.add(new THREE.HemisphereLight(0xffd9a8,0x15122e,1.1));
   const key=new THREE.DirectionalLight(0xffc27a,1.6);key.position.set(cx-H*0.6,bb.max.y,cz+H);scene.add(key);
   const rim=new THREE.DirectionalLight(0x8c7cff,0.6);rim.position.set(cx+H,bb.max.y,cz-H);scene.add(rim);
   const lantern=new THREE.PointLight(0xff8a1f,0.6,H*3,1.2);lantern.position.set(cx+H*0.35,midY,cz+H*0.5);scene.add(lantern);
   // A looping clip (idle or talking) is what he returns to; a gesture (laughing, head shake) plays once, then back.
   let want:StageClip="idle",inGesture=false;
   const fade=(c:StageClip,once:boolean)=>{const action=mixer.clipAction(clips[c]??clips.idle);if(action===current&&!once)return;
    action.reset();action.setLoop(once?THREE.LoopOnce:THREE.LoopRepeat,Infinity);action.clampWhenFinished=false;
    action.crossFadeFrom(current,reduced.current?0.15:0.35,false).play();current=action};
   const play=(c:StageClip)=>{want=c;if(!inGesture)fade(c,false)};
   const gesture=(c:StageClip)=>{if(!clips[c])return;inGesture=true;fade(c,true)};
   mixer.addEventListener("finished",()=>{inGesture=false;fade(want,false)});
   let glowTarget=glowFor(0,reduced.current);
   api.current={play,gesture,glow:v=>{glowTarget=glowFor(v,reduced.current)}};
   const clock=new THREE.Clock();let raf=0;
   const tick=()=>{const dt=clock.getDelta();mixer.update(dt);lantern.intensity+=((glowTarget*2.2)-lantern.intensity)*Math.min(1,dt*8);renderer.render(scene,camera);raf=requestAnimationFrame(tick)};tick();
   const ro=new ResizeObserver(()=>{const W=el.clientWidth||w,Hh=el.clientHeight||h;renderer.setSize(W,Hh);camera.aspect=W/Hh;camera.updateProjectionMatrix()});ro.observe(el);
   dispose=()=>{cancelAnimationFrame(raf);ro.disconnect();mixer.stopAllAction();renderer.dispose();scene.traverse(o=>{const m=o as import("three").Mesh;m.geometry?.dispose?.();const mat=m.material as import("three").Material|import("three").Material[]|undefined;(Array.isArray(mat)?mat:mat?[mat]:[]).forEach(x=>x.dispose())});renderer.domElement.remove()};
   setMode("3d");performance.mark?.("stage-3d");onMode?.("3d",performance.now()-t0);onCanvas?.(renderer.domElement);
  })().catch(()=>{if(!cancelled){cancelled=true;window.clearTimeout(timer);setMode("portrait");onMode?.("portrait")}});
  return()=>{cancelled=true;window.clearTimeout(timer);dispose();api.current=null;onCanvas?.(null)};
 },[model?.src,forcePortrait]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{api.current?.play(clip)},[clip,mode]);
 useEffect(()=>{if(gesture)api.current?.gesture(gesture.clip)},[gesture?.key,mode]);// eslint-disable-line react-hooks/exhaustive-deps
 useEffect(()=>{api.current?.glow(level)},[level]);
 const glow=glowFor(level,reduced.current);
 return <div className={`relative overflow-hidden rounded-card bg-deep ${className}`} style={{height}} role="img" aria-label={`${name}${clip==="talking"?", talking":clip==="laughing"?", laughing":clip==="head-shake"?", shaking his head":""}`}>
  <div ref={box} className={`absolute inset-0 ${mode==="3d"?"":"invisible"}`}/>
  {mode!=="3d"&&<div className="absolute inset-0 grid place-items-center">
   <div className={`relative grid place-items-center rounded-full ${clip!=="idle"&&!reduced.current?"portrait-talk":""}`} style={{width:Math.min(220,height*0.62),height:Math.min(220,height*0.62),boxShadow:`0 0 ${30+60*glow}px ${8+22*glow}px rgba(255,138,31,${0.18+0.4*glow})`}}>
    {portrait?<img src={portrait} alt="" className="h-full w-full rounded-full border-4 border-panel object-cover"/>:<span className="grid h-full w-full place-items-center rounded-full bg-reading font-display text-[64px] font-bold text-reading-ink">{name.slice(0,1)}</span>}
   </div>
   {mode==="loading"&&<p className="absolute bottom-3 text-[13px] text-muted">Bringing {name} to the stand…</p>}
  </div>}
 </div>;
}

// A witness's voice: plays one pre-recorded line at a time and reports how loud it is (0 to 1) for the glow. If the
// audio can't play, the caption still shows and the line counts as heard.
export function useVoice(){
 const [playing,setPlaying]=useState<string|null>(null),[level,setLevel]=useState(0);
 const ref=useRef<{audio:HTMLAudioElement;ctx?:AudioContext;raf:number}|null>(null);
 const stop=useCallback(()=>{const r=ref.current;if(!r)return;cancelAnimationFrame(r.raf);r.audio.pause();r.audio.src="";r.ctx?.close().catch(()=>{});ref.current=null;setPlaying(null);setLevel(0)},[]);
 const play=useCallback((src:string,onEnd?:()=>void)=>{
  stop();const audio=new Audio(src);audio.preload="auto";const r:{audio:HTMLAudioElement;ctx?:AudioContext;raf:number}={audio,raf:0};ref.current=r;setPlaying(src);
  const done=()=>{if(ref.current!==r)return;stop();onEnd?.()};
  audio.onended=done;audio.onerror=done;
  try{const AC=window.AudioContext??(window as unknown as {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(AC){const ctx=new AC(),srcNode=ctx.createMediaElementSource(audio),an=ctx.createAnalyser();an.fftSize=512;srcNode.connect(an);an.connect(ctx.destination);r.ctx=ctx;
   const buf=new Uint8Array(an.fftSize);const tick=()=>{an.getByteTimeDomainData(buf);let sum=0;for(const v of buf){const x=(v-128)/128;sum+=x*x}setLevel(Math.min(1,Math.sqrt(sum/buf.length)*4));r.raf=requestAnimationFrame(tick)};tick()}}catch{}
  audio.play().catch(done);
 },[stop]);
 useEffect(()=>stop,[stop]);
 return {play,stop,playing,level};
}
