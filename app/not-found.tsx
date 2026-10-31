import Link from "next/link";
import {Wordmark} from "./wordmark";
// The 404 page in the game look.
export default function NotFound(){
 return <main className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center gap-4 px-4 py-10">
  <Wordmark className="text-[28px]" byline/>
  <p className="text-[12px] font-extrabold uppercase tracking-[.08em] text-highlight">Page not found</p>
  <h1 className="text-[36px] leading-tight">This page isn't in the story.</h1>
  <p className="text-[17px] text-muted">The link may be old or mistyped. Head back to the home page to find your case.</p>
  <Link href="/" className="btn btn-primary mt-2">Go to the home page</Link>
 </main>;
}
