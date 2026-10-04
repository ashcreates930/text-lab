// The Text Lab wordmark: bold geometric letters, teal fading to slate, matching the chosen logo.
export function Wordmark({className=""}:{className?:string}){
 return <span aria-label="Text Lab" className={`inline-block bg-clip-text font-sans font-extrabold tracking-[-.03em] text-transparent ${className}`} style={{backgroundImage:"linear-gradient(90deg,#5cc0aa 0%,#4fa595 45%,#7b97a3 100%)"}}>TextLab</span>;
}
