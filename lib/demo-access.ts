// Shared by middleware (Edge) and route handlers (Node), so only Web Crypto is used.
export const DEMO_ACCESS_COOKIE="itt_demo_access";
export const DEMO_ACCESS_MAX_AGE=7*24*60*60;
export const DEMO_LOCKOUT_MESSAGE="Too many tries. Please wait and try again later.";
const encoder=new TextEncoder();
function configuredCode(){return process.env.DEMO_ACCESS_CODE?.trim().toLowerCase()||""}
async function sign(value:string,secret:string){const key=await crypto.subtle.importKey("raw",encoder.encode(`itt-demo-access:${secret}`),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return Array.from(new Uint8Array(await crypto.subtle.sign("HMAC",key,encoder.encode(value))),b=>b.toString(16).padStart(2,"0")).join("")}
function equal(a:string,b:string){if(a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0}
export function demoAccessConfigured(){return !!configuredCode()}
// Codes are compared case-insensitively because phone keyboards auto-capitalize.
export async function demoCodeMatches(input:string){const code=configuredCode();if(!code)return false;return equal(await sign("code",input.trim().toLowerCase()),await sign("code",code))}
// Token: <random device id>.<expiry ms>.<signature>. It is signed with the configured code, so changing DEMO_ACCESS_CODE signs everyone out.
// The device id is random per browser and is used only for the per-device daily AI caps.
export async function createDemoAccessToken(){const device=crypto.randomUUID(),expires=String(Date.now()+DEMO_ACCESS_MAX_AGE*1000);return `${device}.${expires}.${await sign(`${device}.${expires}`,configuredCode())}`}
export async function demoAccessDevice(token:string|undefined){const code=configuredCode();if(!code||!token)return null;const [device,expires,signature]=token.split(".");if(!device||!expires||!signature||!(Number(expires)>Date.now()))return null;return equal(signature,await sign(`${device}.${expires}`,code))?device:null}
export async function verifyDemoAccessToken(token:string|undefined){return !!(await demoAccessDevice(token))}
// Keyed hash so lockout rows never hold a raw IP address.
export async function hashClientAddress(address:string){return sign(`ip:${address}`,process.env.SUPABASE_SERVICE_ROLE_KEY||configuredCode())}
export function clientAddress(headers:Headers){return headers.get("x-forwarded-for")?.split(",")[0]?.trim()||headers.get("x-real-ip")||"unknown"}
