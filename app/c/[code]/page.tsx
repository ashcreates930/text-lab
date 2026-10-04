import {redirect} from "next/navigation";
// Class link: textlab.../c/ABC123 opens the join screen with the code already filled in, so students never type it.
export default async function ClassLink({params}:{params:Promise<{code:string}>}){
 const {code}=await params;
 redirect(`/?join=${encodeURIComponent(decodeURIComponent(code).toUpperCase().replace(/[^A-Z0-9-]/g,"").slice(0,24))}`);
}
