import type {Metadata} from "next";
import {HostScreen} from "../../host-screen";

// The host screen of a live round (teacher or demo host). The host token was saved on this device when the round started.
export const metadata:Metadata={title:"Live round · Host | Text Lab"};
export default async function LiveHost({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 return <HostScreen sessionId={id}/>;
}
