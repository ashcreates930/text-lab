import type {Metadata} from "next";
import {WitnessStand} from "../../witness-stand";

// The Witness stand phone for a live round (Hologram mode), opened from the QR code on the host screen.
export const metadata:Metadata={title:"Witness stand | Text Lab"};
export default async function Witness({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 return <WitnessStand sessionId={id}/>;
}
