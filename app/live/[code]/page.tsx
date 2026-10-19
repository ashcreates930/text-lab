import type {Metadata} from "next";
import {PlayerScreen} from "../player-screen";

// A player joins a live round here by scanning the QR code on the host screen (or with one tap from their class).
export const metadata:Metadata={title:"Live round | Text Lab"};
export default async function LivePlayer({params}:{params:Promise<{code:string}>}){
 const {code}=await params;
 return <PlayerScreen code={decodeURIComponent(code).toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,12)}/>;
}
