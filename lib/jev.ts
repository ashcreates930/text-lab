export type JevQuestion={question:string;answer:string;probability:number};
export async function getJevReport(state:Record<string,unknown>):Promise<JevQuestion[]> {
  if(process.env.JEV_PROVIDER!=="live") return [
    {question:"Did scaffolds support comprehension?",answer:"Students who opened the glossary revisited scenes more often.",probability:0.82},
    {question:"Did students retain key details?",answer:"Most students recalled the late-night watch and the visitor's reported shriek.",probability:0.76},
    {question:"Did students make real-world connections?",answer:"Connection responses often linked trust to observable evidence.",probability:0.71}
  ];
  if(process.env.JEV_LIVE_ENABLED!=="true") throw new Error("Jev live is disabled until the API contract is available in /docs/jev-api.md");
  // TODO: implement request/response mapping when the owner supplies /docs/jev-api.md.
  const response=await fetch(process.env.JEV_API_URL!,{method:"POST",headers:{Authorization:`Bearer ${process.env.JEV_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({state,questions:["Did scaffolds support comprehension?","Did students retain key details?","Did students make real-world connections?"]})});
  if(!response.ok) throw new Error("Jev request failed"); return response.json() as Promise<JevQuestion[]>;
}
