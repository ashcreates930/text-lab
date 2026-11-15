"use client";
// The world map: the story's painted map (no words on it) with everything else drawn in code on top, in the map's own
// pixels, so stops line up exactly: region badges (overview), one region's trail and stops (zoomed in), fog over locked
// regions, place names, landmarks (the twist, the boss question and the Name the Liar finale), secrets to find on a
// return visit, and investigator tokens that walk the trail. Sizes that must stay readable (badges, stops, tokens,
// labels) are set in screen pixels, so the map reads the same on a phone and on the projector. Pan by dragging (or
// with the arrow keys when the map has focus), zoom with the buttons or a pinch. Reduced motion: no walking, drifting
// or pulsing. Rules: lib/world-map.ts. MapList is the same map as a list, for screen readers and keyboards.
import {useCallback,useEffect,useLayoutEffect,useMemo,useRef,useState} from "react";
import {Crown,DoorClosed,DoorOpen,Lock,LockOpen,Minus,Plus,Sparkles,Star,Zap,Maximize2,X} from "lucide-react";
import type {MapRegionView,MapStopView,TokenAt,WorldMapData} from "@/lib/world-map";
import {pointOf,raceRegions,raceTokenAt,regionFrame,trailOf} from "@/lib/world-map";
import type {WorldPack} from "@/lib/world-schema";
import {reducedMotion} from "./proof-race";

export type MapToken={id:string;name:string;portrait?:string|null;at:TokenAt;me?:boolean;glow?:boolean};
type Box={x:number;y:number;w:number;h:number};
const STATE_LABEL:Record<MapStopView["state"],string>={locked:"Locked",ahead:"Shut",next:"Next lock",proven:"Open"};
const LANDMARK_LABEL={twist:"Twist: a witness interrupts",boss:"Boss question"} as const;

export function stopLabel(r:Pick<MapRegionView,"number">,s:MapStopView){
 return `Lock ${s.chunk}, ${s.placeName}. ${STATE_LABEL[s.state]}${s.state==="proven"?`, ${s.stars} of 3 stars`:""}${s.landmark?`. ${LANDMARK_LABEL[s.landmark]}`:""}${s.secret==="hidden"?". A discovery is hidden here":s.secret==="found"?". Discovery found":""}`;
}
const regionLabel=(r:MapRegionView)=>`Room ${r.number}: ${r.title}, ${r.name}. ${r.state==="locked"?"Locked":r.state==="current"?"Your next room":`Escaped, ${r.stars} of 3 stars`}${r.assigned?`. Assigned${r.assigned.due?`, due ${r.assigned.due}`:""}`:""}`;

// The frame for a box at the container's shape (grown, never cropped), kept on the map.
function fit(b:Box,aspect:number,map:{width:number;height:number}):Box{
 let {x,y,w,h}=b;if(w/h<aspect){const nw=h*aspect;x-=(nw-w)/2;w=nw}else{const nh=w/aspect;y-=(nh-h)/2;h=nh}
 if(w>map.width){x=(map.width-w)/2}else x=Math.max(0,Math.min(map.width-w,x));
 if(h>map.height){y=(map.height-h)/2}else y=Math.max(0,Math.min(map.height-h,y));
 return {x,y,w,h};
}

export function WorldMap({map,regions,focus=null,onFocus,tokens=[],travel,onStop,interactive=true,className="",label="Story map",lifting=null}:{lifting?:string|null;map:WorldMapData;regions:MapRegionView[];focus?:string|null;onFocus?:(id:string|null)=>void;tokens?:MapToken[];travel?:{id:string;from:TokenAt;to:TokenAt}|null;onStop?:(r:MapRegionView,s:MapStopView|"finale")=>void;interactive?:boolean;className?:string;label?:string}){
 const wrap=useRef<HTMLDivElement>(null),[size,setSize]=useState({w:0,h:0});
 useLayoutEffect(()=>{const el=wrap.current;if(!el)return;const set=()=>setSize({w:el.clientWidth,h:el.clientHeight});set();const ro=new ResizeObserver(set);ro.observe(el);return()=>ro.disconnect()},[]);
 const aspect=size.w&&size.h?size.w/size.h:map.width/map.height;
 const region=focus?regions.find(r=>r.expedition===focus)??null:null;
 // Where the map looks: one region, or the whole map centred on the student's token (or the current region).
 const target=useMemo<Box>(()=>{
  if(region){
   // The whole region if its stops stay apart at that size; otherwise (a phone) zoom in on the token, the next stop or
   // the region's main place, and the student pans for the rest.
   const whole=fit(regionFrame(map,region),aspect,map),maxW=size.w?size.w*1.3:whole.w;
   if(whole.w<=maxW)return whole;
   const me=tokens.find(t=>t.me&&t.at.expedition===region.expedition),p=me?pointOf(regions,me.at):null,next=region.stops.find(s=>s.state==="next");
   const counts=new Map<string,number>();for(const s of region.stops)counts.set(s.place,(counts.get(s.place)??0)+1);
   const main=[...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0],at=region.stops.filter(s=>s.place===main);
   const c=p??next??{x:at.reduce((a,s)=>a+s.x,0)/at.length,y:at.reduce((a,s)=>a+s.y,0)/at.length};
   return fit({x:c.x-maxW/2,y:c.y-maxW/aspect/2,w:maxW,h:maxW/aspect},aspect,map);
  }
  const me=tokens.find(t=>t.me)??tokens[0],p=me?pointOf(regions,me.at):null,cur=regions.find(r=>r.state==="current")?.label;
  const c=p??cur??{x:map.width/2,y:map.height/2};
  // Fill the frame with the map (cropping its long side) so there are no empty bars on a wide or a tall screen.
  const w=Math.min(map.width,map.height*aspect),h=w/aspect;
  return fit({x:c.x-w/2,y:c.y-h/2,w,h},aspect,map);
 },[region,aspect,map,regions,tokens,size.w]);
 const [vb,setVb]=useState<Box>(target);
 // Glide to a new frame (at once under reduced motion).
 const anim=useRef(0);
 useEffect(()=>{cancelAnimationFrame(anim.current);if(reducedMotion()||!size.w){setVb(target);return}
  const from={...vbRef.current},t0=performance.now(),D=550;
  const step=(t:number)=>{const k=Math.min(1,(t-t0)/D),e=1-Math.pow(1-k,3);setVb({x:from.x+(target.x-from.x)*e,y:from.y+(target.y-from.y)*e,w:from.w+(target.w-from.w)*e,h:from.h+(target.h-from.h)*e});if(k<1)anim.current=requestAnimationFrame(step)};
  anim.current=requestAnimationFrame(step);return()=>cancelAnimationFrame(anim.current)},[target.x,target.y,target.w,target.h,size.w]);// eslint-disable-line react-hooks/exhaustive-deps
 const vbRef=useRef(vb);vbRef.current=vb;
 const u=size.w?vb.w/size.w:map.width/1000;// map pixels per screen pixel
 // Pan and zoom.
 const clampBox=useCallback((b:Box)=>{const minW=map.width/7;let w=Math.max(minW,Math.min(map.width*1.2,b.w));const h=w/aspect;const cx=b.x+b.w/2,cy=b.y+b.h/2;return fit({x:cx-w/2,y:cy-h/2,w,h},aspect,map)},[aspect,map]);
 const zoom=(f:number)=>setVb(b=>clampBox({x:b.x+b.w*(1-f)/2,y:b.y+b.h*(1-f)/2,w:b.w*f,h:b.h*f}));
 const pointers=useRef(new Map<number,{x:number;y:number}>()),pinch=useRef<number|null>(null),dragged=useRef(false);
 function down(e:React.PointerEvent){if(!interactive)return;pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});dragged.current=false;if(pointers.current.size===2){const [a,b]=[...pointers.current.values()];pinch.current=Math.hypot(a.x-b.x,a.y-b.y)}}
 function move(e:React.PointerEvent){if(!interactive)return;const last=pointers.current.get(e.pointerId);if(!last)return;
  if(pointers.current.size===2&&pinch.current){pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});const [a,b]=[...pointers.current.values()],d=Math.hypot(a.x-b.x,a.y-b.y);if(d>0){zoom(pinch.current/d);pinch.current=d}dragged.current=true;return}
  const dx=e.clientX-last.x,dy=e.clientY-last.y;if(Math.abs(dx)+Math.abs(dy)>3){dragged.current=true;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)}
  pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});if(dragged.current)setVb(b=>fit({...b,x:b.x-dx*u,y:b.y-dy*u},aspect,map))}
 function up(e:React.PointerEvent){pointers.current.delete(e.pointerId);if(pointers.current.size<2)pinch.current=null}
 function keys(e:React.KeyboardEvent){if(!interactive||e.target!==e.currentTarget)return;const d=60*u,m:Record<string,[number,number]>={ArrowLeft:[-d,0],ArrowRight:[d,0],ArrowUp:[0,-d],ArrowDown:[0,d]};
  if(m[e.key]){e.preventDefault();const [dx,dy]=m[e.key];setVb(b=>fit({...b,x:b.x+dx,y:b.y+dy},aspect,map))}else if(e.key==="+"||e.key==="="){e.preventDefault();zoom(0.8)}else if(e.key==="-"){e.preventDefault();zoom(1.25)}}
 const tap=(fn:()=>void)=>()=>{if(!dragged.current)fn()};

 // The token walk: along the trail from one stop to the next.
 const [walk,setWalk]=useState<{id:string;p:{x:number;y:number}}|null>(null);
 useEffect(()=>{if(!travel)return;const r=regions.find(g=>g.expedition===travel.to.expedition);if(!r)return;
  const trail=trailOf(r),idx=(at:TokenAt)=>at.stop==="finale"?trail.length-1:at.stop,a=travel.from.expedition===travel.to.expedition?idx(travel.from):0,b=idx(travel.to);
  const pts=trail.slice(Math.min(a,b),Math.max(a,b)+1);if(a>b)pts.reverse();
  if(reducedMotion()||pts.length<2){setWalk(null);return}
  const seg=pts.slice(1).map((p,i)=>Math.hypot(p.x-pts[i].x,p.y-pts[i].y)),total=seg.reduce((x,y)=>x+y,0)||1;
  let raf=0;const t0=performance.now(),D=Math.min(1600,500+total*3);
  const step=(t:number)=>{const k=Math.min(1,(t-t0)/D),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;let d=e*total,i=0;while(i<seg.length-1&&d>seg[i]){d-=seg[i];i++}const f=seg[i]?d/seg[i]:1;
   setWalk({id:travel.id,p:{x:pts[i].x+(pts[i+1].x-pts[i].x)*f,y:pts[i].y+(pts[i+1].y-pts[i].y)*f}});if(k<1)raf=requestAnimationFrame(step);else setWalk(null)};
  setWalk({id:travel.id,p:pts[0]});const start=setTimeout(()=>{raf=requestAnimationFrame(step)},350);return()=>{clearTimeout(start);cancelAnimationFrame(raf)}},[travel?.id,travel?.from.expedition,travel?.from.stop,travel?.to.expedition,travel?.to.stop]);// eslint-disable-line react-hooks/exhaustive-deps

 // Tokens at the same point fan out around it.
 const placed=useMemo(()=>{const groups=new Map<string,MapToken[]>();for(const t of tokens){const p=pointOf(regions,t.at);if(!p)continue;const k=`${Math.round(p.x)},${Math.round(p.y)}`;groups.set(k,[...(groups.get(k)??[]),t])}
  return [...groups.entries()].flatMap(([k,ts])=>{const [x,y]=k.split(",").map(Number);return ts.map((t,i)=>{const n=ts.length,ring=n>1?Math.min(3,1+Math.floor(i/10)):0,a=(i%10)/Math.min(10,n)*Math.PI*2-Math.PI/2;return {t,x,y,ox:ring?Math.cos(a)*ring*24:0,oy:ring?Math.sin(a)*ring*24:0}})})},[tokens,regions]);

 const placesHere=region?map.places.filter(p=>!p.label_only&&(region.stops.some(s=>s.place===p.id)||region.finale?.placeName===p.name)):map.places.filter(p=>p.label_only);
 const fog=region?[]:regions.filter(r=>r.state==="locked");
 // Overview: region badges closer than a tap target on this screen merge into one marker with a count (the six
 // expeditions at the Van Tassel farm on a phone); zooming in or a wider screen separates them again.
 const groups=useMemo(()=>{if(region)return [];const gap=46*u,out:MapRegionView[][]=[];
  // An area (the farm) merges as a whole when any two of its badges are too close; then anything else that is too close.
  const areas=new Map<string,MapRegionView[]>();for(const r of regions)if(r.area)areas.set(r.area,[...(areas.get(r.area)??[]),r]);
  const taken=new Set<string>();for(const g of areas.values())if(g.length>1&&g.some((a,i)=>g.some((b,j)=>j>i&&Math.hypot(a.label.x-b.label.x,a.label.y-b.label.y)<gap))){out.push([...g].sort((a,b)=>a.number-b.number));g.forEach(r=>taken.add(r.expedition))}
  const left=regions.filter(r=>!taken.has(r.expedition));
  while(left.length){const g=[left.shift()!];for(let i=0;i<g.length;i++)for(let j=left.length-1;j>=0;j--)if(Math.hypot(left[j].label.x-g[i].label.x,left[j].label.y-g[i].label.y)<gap)g.push(...left.splice(j,1));out.push(g.sort((a,b)=>a.number-b.number))}
  return out},[region,regions,u]);
 const grouped=new Set(groups.filter(g=>g.length>1).flat().map(r=>r.expedition));
 const [picker,setPicker]=useState<string[]|null>(null);
 const pickerFirst=useRef<HTMLButtonElement>(null),pickerFrom=useRef<Element|null>(null);
 useEffect(()=>{if(picker)pickerFirst.current?.focus()},[picker]);
 useEffect(()=>{if(region)setPicker(null)},[region]);
 const closePicker=()=>{setPicker(null);(pickerFrom.current as HTMLElement|null)?.focus?.()};
 const areaName=(g:MapRegionView[])=>{const a=g[0]?.area;return a&&g.every(r=>r.area===a)?map.areas?.find(x=>x.id===a)?.name??null:null};
 const placeNear=(x:number,y:number)=>map.places.filter(p=>!p.label_only).reduce((a,p)=>Math.hypot(p.x-x,p.y-y)<Math.hypot(a.x-x,a.y-y)?p:a);
 return <div ref={wrap} className={`world-map relative overflow-hidden rounded-card bg-deep ${className}`}>
  <svg role="group" aria-label={label} tabIndex={interactive?0:-1} onKeyDown={keys} viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`} preserveAspectRatio="xMidYMid meet" className={`block h-full w-full select-none ${interactive?"cursor-grab touch-none active:cursor-grabbing":""} outline-none focus-visible:ring-4 focus-visible:ring-highlight`}
   onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
   <defs>
    <radialGradient id="wm-fog"><stop offset="0" stopColor="#d9d3f2" stopOpacity=".78"/><stop offset=".55" stopColor="#b9b0e0" stopOpacity=".5"/><stop offset="1" stopColor="#9a90c8" stopOpacity="0"/></radialGradient>
    <radialGradient id="wm-glow"><stop offset="0" stopColor="#ffc562" stopOpacity=".95"/><stop offset="1" stopColor="#ffc562" stopOpacity="0"/></radialGradient>
    <clipPath id="wm-face" clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".5"/></clipPath>
   </defs>
   <image href={map.image} x={0} y={0} width={map.width} height={map.height} preserveAspectRatio="none"/>
   {/* Fog over every locked region. */}
   {(()=>{const l=regions.find(r=>r.expedition===lifting&&r.state!=="locked");return l?<g className="fog-lift" aria-hidden><ellipse cx={l.label.x} cy={l.label.y+20} rx={150} ry={110} fill="url(#wm-fog)"/><ellipse cx={l.label.x+60} cy={l.label.y-10} rx={100} ry={70} fill="url(#wm-fog)"/>{l.stops.map(s=><circle key={s.chunk} cx={s.x} cy={s.y} r={60} fill="url(#wm-fog)"/>)}</g>:null})()}
   {fog.map((r,i)=><g key={r.expedition} className="map-fog" style={{animationDelay:`${-i*1.7}s`}} aria-hidden>
    <ellipse cx={r.label.x} cy={r.label.y+20} rx={130} ry={95} fill="url(#wm-fog)"/><ellipse cx={r.label.x+60} cy={r.label.y-10} rx={90} ry={60} fill="url(#wm-fog)"/></g>)}
   {/* Place names. */}
   {placesHere.map(p=>{const at=region?region.stops.filter(s=>s.place===p.id):[],x=at.length?at.reduce((a,s)=>a+s.x,0)/at.length:p.x,y=at.length?Math.max(...at.map(s=>s.y))+34*u:p.y;
    return <text key={p.id} x={x} y={y} textAnchor="middle" fontSize={(region?14:15)*u} className="map-label" aria-hidden>{p.name}</text>})}
   {/* Overview: one badge per region. Zoomed in: the other regions stay as small badges. */}
   {groups.filter(g=>g.length>1).map(g=>{const x=g.reduce((a,r)=>a+r.label.x,0)/g.length,y=g.reduce((a,r)=>a+r.label.y,0)/g.length,R=22*u,cur=g.some(r=>r.state==="current"),locked=g.every(r=>r.state==="locked"),ids=g.map(r=>r.expedition),place=areaName(g)??placeNear(x,y).name;
    const open=(e:React.SyntheticEvent)=>{pickerFrom.current=e.currentTarget;setPicker(ids)};
    return <g key={ids.join()} role="button" tabIndex={0} aria-haspopup="dialog" aria-label={`${g.length} expeditions near ${place}: ${g.map(r=>r.number).join(", ")}. Choose one.`} className="map-hit cursor-pointer outline-none" onClick={e=>{if(!dragged.current)open(e)}} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();open(e)}}}>
     <circle cx={x} cy={y} r={26*u} fill="transparent"/>
     {cur&&<circle cx={x} cy={y} r={R*1.5} className="map-pulse" fill="none" stroke="var(--color-primary)" strokeWidth={3*u}/>}
     <circle cx={x} cy={y} r={R} fill={cur?"var(--color-primary)":locked?"#3b3463":"var(--color-success)"} stroke={locked?"#8d84bd":"#fff7e6"} strokeWidth={2.5*u}/>
     <text x={x} y={y+7*u} textAnchor="middle" fontSize={20*u} fontWeight={800} fill={cur?"var(--color-on-primary)":locked?"#e6e0ff":"var(--color-on-success)"} className="font-display">{g.length}</text>
     <text x={x} y={y+R+15*u} textAnchor="middle" fontSize={13*u} className="map-label map-label-strong">{g.length} expeditions</text>
    </g>})}
   {regions.map(r=>{if(region&&r.expedition===region.expedition)return null;if(grouped.has(r.expedition))return null;const small=!!region,R=(small?13:20)*u,cur=r.state==="current",locked=r.state==="locked";
    return <g key={r.expedition} role="button" tabIndex={0} aria-label={regionLabel(r)} className="map-hit cursor-pointer outline-none" onClick={tap(()=>onFocus?.(r.expedition))} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onFocus?.(r.expedition)}}}>
     <circle cx={r.label.x} cy={r.label.y} r={Math.max(R,22*u)} fill="transparent"/>
     {cur&&!small&&<circle cx={r.label.x} cy={r.label.y} r={R*1.55} className="map-pulse" fill="none" stroke="var(--color-primary)" strokeWidth={3*u}/>}
     <circle cx={r.label.x} cy={r.label.y} r={R} fill={cur?"var(--color-primary)":locked?"#3b3463":"var(--color-success)"} stroke={locked?"#8d84bd":"#fff7e6"} strokeWidth={2.5*u} opacity={small?.85:1}/>
     {locked?<Lock x={r.label.x-7*u*(small?.8:1)} y={r.label.y-7*u*(small?.8:1)} width={14*u*(small?.8:1)} height={14*u*(small?.8:1)} color="#cfc8f0" aria-hidden/>
      :<text x={r.label.x} y={r.label.y+(small?4.5:6.5)*u} textAnchor="middle" fontSize={(small?12:18)*u} fontWeight={800} fill={cur?"var(--color-on-primary)":"var(--color-on-success)"} className="font-display">{r.number}</text>}
     {!small&&!locked&&<text x={r.label.x} y={r.label.y+R+15*u} textAnchor="middle" fontSize={13*u} className="map-label map-label-strong">{r.title}</text>}
     {!small&&r.state==="proven"&&<g aria-hidden>{[0,1,2].map(i=><path key={i} d={starPath(r.label.x+(i-1)*12*u,r.label.y-R-8*u,5*u)} fill={i<r.stars?"var(--color-gold)":"#2a2450"} stroke="#fff7e6" strokeWidth={.8*u}/>)}</g>}
    </g>})}
   {/* One region: the trail, the stops and the finale. */}
   {region&&<RegionLayer r={region} u={u} tap={tap} onStop={onStop}/>}
   {/* Tokens. */}
   {placed.map(({t,x,y,ox,oy})=>{// Tokens stand just above their stop, like a pin, so the stop stays readable.
    const w=walk&&walk.id===t.id?walk.p:null,R=(t.me?17:14)*u,cx=(w?.x??x)+(w?0:ox*u),cy=(w?.y??y)+(w?0:oy*u)-(R+12*u);
    return <g key={t.id} aria-label={`${t.me?"You":t.name}${t.glow?", proved this stop":""}`} role="img" className={t.me?"map-token-me":""}>
     {t.glow&&<circle cx={cx} cy={cy} r={R*2.8} fill="url(#wm-glow)"/>}
     <circle cx={cx} cy={cy+2*u} r={R} fill="rgba(0,0,0,.45)"/>
     <circle cx={cx} cy={cy} r={R} fill="var(--color-reading)" stroke={t.me?"var(--color-primary)":t.glow?"var(--color-gold)":"#fff7e6"} strokeWidth={(t.me||t.glow?4:2.5)*u}/>
     {t.portrait?<image href={t.portrait} x={cx-R+1.5*u} y={cy-R+1.5*u} width={(R-1.5*u)*2} height={(R-1.5*u)*2} clipPath="url(#wm-face)" preserveAspectRatio="xMidYMid slice"/>
      :<text x={cx} y={cy+5*u} textAnchor="middle" fontSize={(t.me?15:13)*u} fontWeight={800} fill="var(--color-reading-ink)" className="font-display">{t.me?"You".slice(0,1):t.name.slice(0,1).toUpperCase()}</text>}
    </g>})}
  </svg>
  {picker&&(()=>{const list=picker.map(id=>regions.find(r=>r.expedition===id)!).filter(Boolean),c=list[0]?areaName(list)??placeNear(list.reduce((a,r)=>a+r.label.x,0)/list.length,list.reduce((a,r)=>a+r.label.y,0)/list.length).name:"";
   return <div role="dialog" aria-modal="false" aria-labelledby="wm-pick-h" onKeyDown={e=>{if(e.key==="Escape"){e.preventDefault();closePicker()}}} className="absolute inset-x-2 bottom-2 z-10 max-h-[80%] overflow-y-auto rounded-card border border-edge bg-panel-2 p-3 shadow-[0_10px_30px_rgba(0,0,0,.45)]">
    <div className="flex items-start justify-between gap-2"><p id="wm-pick-h" className="font-display text-[18px] font-bold leading-tight">{list.length} expeditions<span className="block text-[13px] font-semibold text-muted">near {c}</span></p>
     <button type="button" onClick={closePicker} aria-label="Close" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-panel"><X size={18} aria-hidden/></button></div>
    <ol className="mt-2 grid gap-1.5">{list.map((r,i)=><li key={r.expedition}><button ref={i===0?pickerFirst:undefined} type="button" onClick={()=>{setPicker(null);onFocus?.(r.expedition)}}
     className={`flex min-h-11 w-full items-center gap-2 rounded-row px-3 py-2 text-left text-[15px] ${r.state==="current"?"bg-primary text-on-primary":"bg-panel text-ink"}`}>
     <span aria-hidden className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-display font-bold ${r.state==="current"?"bg-on-primary text-highlight":r.state==="locked"?"bg-deep text-muted":"bg-success text-on-success"}`}>{r.state==="locked"?<Lock size={14}/>:r.number}</span>
     <span className="min-w-0 flex-1"><span className="block font-bold leading-tight">Room {r.number}: {r.title}</span><span className={`block text-[13px] ${r.state==="current"?"":"text-muted"}`}>{r.state==="locked"?"Locked":r.state==="current"?"Your next room":`Escaped, ${r.stars} of 3 stars`}</span></span>
     {r.state==="proven"&&<span aria-hidden className="flex shrink-0">{[0,1,2].map(k=><Star key={k} size={14} className={k<r.stars?"fill-gold text-gold":"text-muted"}/>)}</span>}</button></li>)}</ol>
   </div>})()}
  {interactive&&<div className="absolute right-2 top-2 flex flex-col gap-1.5">
   <button type="button" onClick={()=>zoom(0.75)} className="map-ctl" aria-label="Zoom in"><Plus size={20} aria-hidden/></button>
   <button type="button" onClick={()=>zoom(1.33)} className="map-ctl" aria-label="Zoom out"><Minus size={20} aria-hidden/></button>
   {onFocus&&<button type="button" onClick={()=>{onFocus(null);setVb(target)}} className="map-ctl" aria-label="Whole map"><Maximize2 size={18} aria-hidden/></button>}
  </div>}
 </div>;
}

function RegionLayer({r,u,tap,onStop}:{r:MapRegionView;u:number;tap:(fn:()=>void)=>()=>void;onStop?:(r:MapRegionView,s:MapStopView|"finale")=>void}){
 const pts=trailOf(r),path=smooth(pts),proven=r.state==="proven",R=15*u;
 const press=(s:MapStopView|"finale")=>(e:React.KeyboardEvent)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onStop?.(r,s)}};
 return <g>
  <path d={path} fill="none" stroke="rgba(10,8,30,.75)" strokeWidth={9*u} strokeLinecap="round" strokeLinejoin="round"/>
  <path d={path} fill="none" stroke={proven?"var(--color-gold)":"#d8cfa8"} strokeWidth={4*u} strokeDasharray={proven?undefined:`${2*u} ${9*u}`} strokeLinecap="round" strokeLinejoin="round" opacity={proven?.95:.85}/>
  {r.stops.map(s=>{const st=s.state,fill=st==="proven"?"var(--color-success)":st==="next"?"var(--color-primary)":st==="locked"?"#3b3463":"#2a2450";
   return <g key={s.chunk} role="button" tabIndex={0} aria-label={stopLabel(r,s)} className="map-hit cursor-pointer outline-none" onClick={tap(()=>onStop?.(r,s))} onKeyDown={press(s)}>
    <circle cx={s.x} cy={s.y} r={22*u} fill="transparent"/>
    {st==="next"&&<circle cx={s.x} cy={s.y} r={R*1.6} className="map-pulse" fill="none" stroke="var(--color-primary)" strokeWidth={3*u}/>}
    {s.landmark&&<circle cx={s.x} cy={s.y} r={R+5*u} fill="none" stroke={s.landmark==="boss"?"var(--color-gold)":"var(--color-violet)"} strokeWidth={3*u}/>}
    <circle cx={s.x} cy={s.y} r={R} fill={fill} stroke="#fff7e6" strokeWidth={2*u}/>
    {s.landmark==="boss"?<Crown x={s.x-8*u} y={s.y-8*u} width={16*u} height={16*u} color={st==="proven"?"var(--color-on-success)":"#ffe6b0"} aria-hidden/>
     :s.landmark==="twist"?<Zap x={s.x-8*u} y={s.y-8*u} width={16*u} height={16*u} color={st==="proven"?"var(--color-on-success)":"#e6deff"} aria-hidden/>
     :<text x={s.x} y={s.y+5*u} textAnchor="middle" fontSize={14*u} fontWeight={800} fill={st==="proven"?"var(--color-on-success)":st==="next"?"var(--color-on-primary)":"#cfc8f0"} className="font-display">{s.chunk}</text>}
    {st==="proven"&&s.stars>=0&&<g aria-hidden>{[0,1,2].map(i=><path key={i} d={starPath(s.x+(i-1)*10*u,s.y+R+7*u,4.2*u)} fill={i<s.stars?"var(--color-gold)":"#2a2450"} stroke="#fff7e6" strokeWidth={.7*u}/>)}</g>}
    {st!=="proven"?<g aria-hidden><circle cx={s.x+R*.85} cy={s.y-R*.85} r={7.5*u} fill="#140f33" stroke="#fff7e6" strokeWidth={1.2*u}/><Lock x={s.x+R*.85-4.5*u} y={s.y-R*.85-4.5*u} width={9*u} height={9*u} color={st==="next"?"#ffe6b0":"#cfc8f0"}/></g>
     :<g aria-hidden><circle cx={s.x+R*.85} cy={s.y-R*.85} r={7.5*u} fill="var(--color-success)" stroke="#fff7e6" strokeWidth={1.2*u}/><LockOpen x={s.x+R*.85-4.5*u} y={s.y-R*.85-4.5*u} width={9*u} height={9*u} color="var(--color-on-success)"/></g>}
    {s.secret==="hidden"&&<g className="map-twinkle" aria-hidden><Sparkles x={s.x+R*0.55} y={s.y-R*1.6} width={15*u} height={15*u} color="#ffe6b0"/></g>}
    {s.secret==="found"&&<path d={starPath(s.x+R,s.y-R,4*u)} fill="#9ee7ff" stroke="#fff" strokeWidth={.7*u} aria-hidden/>}
   </g>})}
  {r.finale&&<g role="button" tabIndex={0} aria-label={`Exit door, Name the Liar, ${r.finale.placeName}. ${STATE_LABEL[r.finale.state]}${r.finale.solved===true?", case solved":r.finale.solved===false?", not solved yet":""}`} className="map-hit cursor-pointer outline-none" onClick={tap(()=>onStop?.(r,"finale"))} onKeyDown={press("finale")}>
   <circle cx={r.finale.x} cy={r.finale.y} r={24*u} fill="transparent"/>
   <rect x={r.finale.x-14*u} y={r.finale.y-14*u} width={28*u} height={28*u} rx={5*u} transform={`rotate(45 ${r.finale.x} ${r.finale.y})`} fill={r.finale.solved?"var(--color-gold)":r.finale.state==="proven"?"var(--color-success)":"#3b3463"} stroke="#fff7e6" strokeWidth={2.5*u}/>
   <text x={r.finale.x} y={r.finale.y+6*u} textAnchor="middle" fontSize={17*u} fontWeight={800} fill={r.finale.solved?"var(--color-on-gold)":"#fff7e6"} className="font-display" aria-hidden>?</text>
   {r.finale.state==="proven"?<DoorOpen x={r.finale.x+10*u} y={r.finale.y-24*u} width={14*u} height={14*u} color="var(--color-gold)" aria-hidden/>:<DoorClosed x={r.finale.x+10*u} y={r.finale.y-24*u} width={14*u} height={14*u} color="#cfc8f0" aria-hidden/>}
  </g>}
 </g>;
}

// A gentle curve through the trail's points.
function smooth(p:{x:number;y:number}[]){if(p.length<2)return "";let d=`M${p[0].x},${p[0].y}`;for(let i=1;i<p.length;i++){const a=p[i-1],b=p[i],mx=(a.x+b.x)/2,my=(a.y+b.y)/2;d+=` Q${a.x},${a.y} ${mx},${my}`}const l=p.at(-1)!;return d+` L${l.x},${l.y}`}
function starPath(cx:number,cy:number,r:number){let d="";for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;d+=`${i?"L":"M"}${cx+Math.cos(a)*rr},${cy+Math.sin(a)*rr}`}return d+"Z"}

// The same map as a list: every region and stop in order, with the same states, for screen readers and keyboards.
export function MapList({regions,focus,onFocus,onStop}:{regions:MapRegionView[];focus?:string|null;onFocus?:(id:string)=>void;onStop?:(r:MapRegionView,s:MapStopView|"finale")=>void}){
 return <ol className="flex flex-col gap-2" aria-label="Stops in order">{regions.map(r=><li key={r.expedition} className="rounded-card bg-panel p-3">
  <button type="button" onClick={()=>onFocus?.(r.expedition)} aria-expanded={focus===r.expedition} className="flex w-full items-center justify-between gap-2 text-left">
   <span><span className="block text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Room {r.number} · {r.name}</span><span className="block font-display text-[19px] font-bold">{r.title}</span></span>
   <span className="shrink-0 text-[14px] font-bold text-muted">{r.state==="locked"?"Locked":r.state==="current"?"Next":`${r.stars} of 3 stars`}</span></button>
  {focus===r.expedition&&<ol className="mt-2 grid gap-1.5">{r.stops.map(s=><li key={s.chunk}><button type="button" onClick={()=>onStop?.(r,s)} className="flex min-h-11 w-full items-center gap-2 rounded-row bg-panel-2 px-3 py-2 text-left text-[15px]">
   <span aria-hidden className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-display font-bold ${s.state==="proven"?"bg-success text-on-success":s.state==="next"?"bg-primary text-on-primary":"bg-deep text-muted"}`}>{s.landmark==="boss"?<Crown size={15}/>:s.landmark==="twist"?<Zap size={15}/>:s.chunk}</span>
   <span className="min-w-0 flex-1">{stopLabel(r,s)}</span>
   {s.state==="proven"&&<span aria-hidden className="flex">{[0,1,2].map(i=><Star key={i} size={14} className={i<s.stars?"fill-gold text-gold":"text-muted"}/>)}</span>}</button></li>)}
   {r.finale&&<li><button type="button" onClick={()=>onStop?.(r,"finale")} className="flex min-h-11 w-full items-center gap-2 rounded-row bg-panel-2 px-3 py-2 text-left text-[15px]"><span aria-hidden className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-deep font-display font-bold text-gold">?</span>Name the Liar finale, {r.finale.placeName}. {STATE_LABEL[r.finale.state]}{r.finale.solved===true?", case solved":""}</button></li>}
  </ol>}
 </li>)}</ol>;
}

// The map between chunks: this expedition's region, with each token walking from the stop just played to the next.
// stars: one entry per stop played (0 to 3, or -1 for passed without stars). tokens: everyone on the map (the host
// board shows the whole class; a phone shows only its own).
export function RaceMap({world,expeditionId,stars,tokens,className="h-[34dvh] min-h-[220px]",label}:{world:WorldPack;expeditionId:string;stars:number[];tokens:{id:string;name:string;portrait?:string|null;me?:boolean;glow?:boolean}[];className?:string;label?:string}){
 const regions=useMemo(()=>raceRegions(world,expeditionId,stars),[world,expeditionId,stars.join(",")]);// eslint-disable-line react-hooks/exhaustive-deps
 const to=raceTokenAt(world,expeditionId,stars.length),from=stars.length?raceTokenAt(world,expeditionId,stars.length-1):null;
 const me=tokens.find(t=>t.me);
 if(!world.world_map)return null;
 return <WorldMap map={world.world_map} regions={regions} focus={expeditionId} interactive={false} className={className} label={label??"Map: the next stop"}
  tokens={tokens.map(t=>({...t,at:to}))} travel={me&&from?{id:me.id,from,to}:null}/>;
}
