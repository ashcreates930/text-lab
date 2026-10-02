import type { Metadata } from "next";
import "./globals.css";
import {brand} from "@/config/brand";
export const metadata:Metadata={title:`${brand.name} | ${brand.organization}`,description:"Step into the story. Question the voices. Decide what to believe."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
