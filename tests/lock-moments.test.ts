// Locking and unlocking (teacher, 2026-11-15): one padlock and one door (app/lock-art.tsx), used everywhere. A first-try
// proof springs the shackle open with "Proved. The lock opens." and a soft click; opening after a miss is quiet; reduced
// motion swaps straight to open with the same words.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = (f: string) => readFileSync(f, "utf8");
const art = src("app/lock-art.tsx"), css = src("app/globals.css");

test("one padlock and one door, in the home page's line style, with the home page's words", () => {
  assert.match(art, /export function Padlock\(/); assert.match(art, /export function DoorGlyph\(/); assert.match(art, /export function DoorScene\(/);
  assert.match(art, /strokeWidth=1\.75/); assert.match(art, /className=\{`lock-badge grid \$\{box\} /, "the badge is large (56 px on a lock screen)"); assert.match(art, /className="padlock-shackle"/);
  assert.match(art, /PROVED_WORDS="Proved\. The lock opens\."/); assert.match(art, /QUIET_WORDS="Opened with the proof\. Try it again in the Refresher\."/);
  assert.match(src("app/escape-peek.tsx"), /<LockBadge state=\{proved\?"proved":"closed"\}\/>/, "the home page's escape moment uses the same padlock");
  assert.doesNotMatch(art, /\b(?:bg|text|border)-\[#/, "tokens only");
});

test("the shackle springs open; quiet and reduced motion swap with no movement; the door swings after its padlock opens", () => {
  assert.match(css, /\.padlock\[data-open="true"\] \.padlock-shackle\{transform:translateY\(-2px\) rotate\(-18deg\)\}/);
  assert.match(css, /\.padlock-quiet \.padlock-shackle\{transition:none\}/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\.padlock \.padlock-shackle,\.lock-badge,\.door-leaf\{transition:none\}/);
  assert.match(art, /if\(reducedMotion\(\)\)\{setOpen\(true\);return\}/, "reduced motion: open at once");
  assert.match(art, /setTimeout\(\(\)=>setLockOpen\(true\),300\),b=setTimeout\(\(\)=>setSwing\(true\),1000\)/, "padlock first, then the swing");
  assert.match(art, /if\(open&&kind==="proved"\)lockClick\(sound\)/, "a soft click, proved only, when Sound is on");
  assert.match(art, /if\(!on\|\|typeof window==="undefined"\)return;/);
});

test("every lock screen opens with a large closed padlock; puzzle locks too", () => {
  assert.match(src("app/room-ui.tsx"), /export function LockBanner[\s\S]{0,140}<LockBadge state="closed"\/>/);
  assert.match(src("app/puzzle-locks.tsx"), /<LockBadge state=\{opened===null\?"closed":opened\?"proved":"quiet"\}\/>/);
  assert.match(src("app/puzzle-locks.tsx"), /<LockMoment kind=\{all\?"proved":"quiet"\}/);
});

test("solo: proved springs open and holds about a second; opened after a miss is quiet, with no chime", () => {
  const race = src("app/expedition-race.tsx");
  assert.match(race, /<LockMoment kind="proved" sound=\{sound\} headingId="ex-h"\/>/); assert.match(race, /<Held key=\{k\}>/);
  assert.match(race, /<Held key=\{"rest"\+k\} skip=\{!record\.correct\}>/, "the rest of the result waits for the moment");
  assert.match(race, /setQuietAt\(k\);setTimeout\(afterResult,QUIET_HOLD_MS\);return true\}/);
  assert.doesNotMatch(race, /recovered:true\};return n\}\);cue\(sound,"chime"\)/, "no celebration for a quiet opening");
  assert.match(race, /<LockMoment kind="quiet" headingId="ex-h"\/>/);
  assert.match(race, /if\(!res\.correct\)cue\(sound,"reveal"\)/, "the soft click replaces the chime on a first-try proof");
});

test("live: the board opens the class's lock; each phone opens its own, proved or quiet", () => {
  const live = src("app/live/race-live.tsx");
  assert.match(live, /<LockMoment key=\{round\.step\} kind="proved" words="The proof opens the class's lock\."/);
  assert.match(live, /<LockMoment key=\{round\.step\} kind="proved" sound=\{sound\} headingId="rp-h"\/>/);
  assert.match(live, /:mine\.opened\?<div className="mt-6"><LockMoment kind="quiet" headingId="rp-h"\/><\/div>/);
  assert.match(live, /\(round\.beat==="board"\|\|round\.beat==="countdown"\)&&!mine\.tap\?\.correct&&mine\.opened&&q&&<LockMoment kind="quiet" size="md"/, "opened after the reveal: still quiet");
  assert.match(live, /sound=\{sound\} submit=\{a=>\{act\("race_puzzle"/);
});

test("the map and the room scenes: closed padlocks on what's locked, open ones on what's opened; doors carry one too", () => {
  const scene = src("app/room-scene-view.tsx"), map = src("app/world-map.tsx"), ui = src("app/room-ui.tsx");
  assert.match(scene, /lock=\{st==="open"\?"open":"closed"\} label=/); assert.match(scene, /lock=\{p\.doorState==="next"\?"open":"closed"\}/);
  assert.match(scene, /<DoorGlyph open=\{p\.doorState==="next"\} size=\{16\}\/>/);
  assert.match(map, /<Padlock open quiet x=\{s\.x/); assert.match(map, /<DoorGlyph open=\{r\.finale\.state==="proven"\}/);
  assert.match(map, /r\.state==="proven"&&<g aria-hidden><circle[\s\S]{0,200}<Padlock open quiet/, "an escaped room shows an open padlock");
  assert.match(ui, /<DoorScene open behind="Chamber 2"/); assert.match(ui, /<DoorScene open behind=\{next\?`Room \$\{next\.number\}`:"Out"\}/);
  for (const f of ["app/room-ui.tsx", "app/room-scene-view.tsx", "app/world-map.tsx", "app/escape-peek.tsx", "app/puzzle-locks.tsx"]) assert.doesNotMatch(src(f), /\b(?:Lock|LockOpen|DoorClosed|DoorOpen)\b,|,(?:Lock|LockOpen|DoorClosed|DoorOpen)\}/, `${f}: only the shared padlock and door`);
});
