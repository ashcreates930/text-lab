// Daily caps for demo AI calls, and the usage call each request makes. No server imports, so tests can check them.
export type DemoAiKind="character"|"feedback"|"voice"|"fluency"|"frame_check"|"frame_image"|"verdict"|"live_judge"|"live_room";
// Daily caps; days follow US Eastern midnight (computed in consume_demo_ai). Voice narration has no caps of its own in the brief, so it shares the character-reply caps.
// Storyboard frames: a frame check is a short text call; a frame picture is the most expensive call in the app, so it has
// the tightest caps: 2 attempts per frame (its "sandbox" scope is the frame), 6 a day per device, and its own daily
// ceiling for the whole demo inside the global one.
export const limits:Record<DemoAiKind,{sandbox:number;device:number}>={character:{sandbox:40,device:120},feedback:{sandbox:60,device:180},voice:{sandbox:40,device:120},fluency:{sandbox:30,device:90},frame_check:{sandbox:40,device:120},frame_image:{sandbox:2,device:6},verdict:{sandbox:4,device:4},
 // Live class mode: judge calls are counted per live session (its "sandbox" scope is the session), so one room of
 // squads shares one cap however many phones are playing; demo rooms are limited per device per day.
 live_judge:{sandbox:40,device:400},live_room:{sandbox:1000,device:6}};
export function globalCeiling(){const value=Number(process.env.DEMO_DAILY_AI_CEILING);return Number.isFinite(value)&&value>0?Math.floor(value):3000}
export function imageCeiling(){const value=Number(process.env.DEMO_DAILY_IMAGE_CEILING);return Math.min(globalCeiling(),Number.isFinite(value)&&value>0?Math.floor(value):150)}

// The usage call for one request. Frame pictures go through consume_demo_ai_capped (supabase/migrations/202610180001),
// which also checks the image ceiling.
export function usageCall(kind:DemoAiKind,sandboxId:string,device:string,frame?:string){
  const base={p_kind:kind,p_device:device,p_sandbox_limit:limits[kind].sandbox,p_device_limit:limits[kind].device,p_global_limit:globalCeiling()};
  if(kind==="frame_image")return {fn:"consume_demo_ai_capped",args:{...base,p_sandbox:`${sandboxId}:${frame??""}`,p_kind_global_limit:imageCeiling()}};
  return {fn:"consume_demo_ai",args:{...base,p_sandbox:sandboxId}};
}
