"use client";
// Reading preferences for the storybook reader, remembered for this browser session only.
import {useEffect,useState} from "react";

export type ReaderPrefs={view:"art"|"text";size:0|1|2|3;spacing:0|1|2;font:"standard"|"dyslexia"};
const KEY="textlab-reader-prefs";
const defaults:ReaderPrefs={view:"art",size:1,spacing:1,font:"standard"};
export const textSizes=[16,18,21,24] as const;
export const lineSpacings=[1.55,1.85,2.15] as const;
export const fontStacks={standard:'Georgia,"Times New Roman",serif',dyslexia:'Lexend,"Plus Jakarta Sans",ui-sans-serif,system-ui,sans-serif'};

export function useReaderPrefs(){
 const [prefs,setPrefs]=useState<ReaderPrefs>(defaults);
 useEffect(()=>{try{const saved=sessionStorage.getItem(KEY);if(saved)setPrefs({...defaults,...JSON.parse(saved)})}catch{}},[]);
 // Lexend loads only when a student picks the dyslexia-friendly font.
 useEffect(()=>{if(prefs.font!=="dyslexia"||document.getElementById("sb-lexend"))return;const link=document.createElement("link");link.id="sb-lexend";link.rel="stylesheet";link.href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;600&display=swap";document.head.appendChild(link)},[prefs.font]);
 function update(patch:Partial<ReaderPrefs>){setPrefs(cur=>{const next={...cur,...patch};try{sessionStorage.setItem(KEY,JSON.stringify(next))}catch{}return next})}
 return [prefs,update] as const;
}
