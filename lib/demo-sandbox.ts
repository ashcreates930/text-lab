export const DEMO_SANDBOX_TTL_MS=24*60*60*1000;
export function isDemoSandboxExpired(createdAt:number,now=Date.now()){return !Number.isFinite(createdAt)||createdAt>now||now-createdAt>=DEMO_SANDBOX_TTL_MS}
export function createDemoSandboxId(){return globalThis.crypto.randomUUID()}
