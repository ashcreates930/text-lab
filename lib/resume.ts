import {createHash,randomBytes} from "node:crypto";
import {wordlist} from "@scure/bip39/wordlists/english.js";
const MASK=(1n<<44n)-1n;
export function generateResumePhrase(){let bits=BigInt(`0x${randomBytes(6).toString("hex")}`)&MASK;const words:string[]=[];for(let i=0;i<4;i++){words.push(wordlist[Number(bits&2047n)]);bits>>=11n}return words.join("-")}
export function hashResumePhrase(phrase:string){return createHash("sha256").update(phrase.trim().toLowerCase()).digest("hex")}
