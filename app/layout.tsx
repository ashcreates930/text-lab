import type { Metadata, Viewport } from "next";
import { Barlow, Fredoka, Literata, Nunito, Oswald } from "next/font/google";
import "./globals.css";
import {brand} from "@/config/brand";
// The game look's three typefaces (lib/design-tokens.ts FONTS): Fredoka for headings, numbers and buttons, Nunito for
// interface text, Literata for the story text only.
const fredoka=Fredoka({subsets:["latin"],weight:["600","700"],variable:"--font-fredoka",display:"swap"});
const nunito=Nunito({subsets:["latin","latin-ext","vietnamese"],weight:["700","800"],variable:"--font-nunito",display:"swap"});
// The mission briefing (app/mission-briefing.tsx): a bold condensed headline font and a clean sans for its labels.
const oswald=Oswald({subsets:["latin"],weight:["500","600","700"],variable:"--font-oswald",display:"swap"});
const barlow=Barlow({subsets:["latin"],weight:["500","600","700"],variable:"--font-barlow",display:"swap"});
const literata=Literata({subsets:["latin","latin-ext","vietnamese"],weight:["400","500","600"],style:["normal","italic"],variable:"--font-literata",display:"swap"});
export const metadata:Metadata={title:`${brand.name} | ${brand.organization}`,description:"Step into the story. Question the voices. Decide what to believe."};
export const viewport:Viewport={themeColor:"#15122E",colorScheme:"dark"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-look="mature" className={`${fredoka.variable} ${nunito.variable} ${literata.variable} ${oswald.variable} ${barlow.variable}`}><body>{children}</body></html>}
