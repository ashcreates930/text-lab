// Every new screen opens at the top with keyboard focus on its main heading (AGENTS.md). The app calls this when the
// screen changes; the scene game also calls it when a clue opens or closes, since that swaps the whole screen.
let pendingHeadingObserver: MutationObserver | null = null;
// iPhone Safari: a scroll to the top made while the page is still gliding from a flick (momentum), or before the new
// screen has its full height, can be undone, so the new screen opens partway down. The jump is made again on the next
// frames (up to about half a second), unless the student starts scrolling themselves.
let topToken = 0;
function toTop() {
  const root = document.documentElement, previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0); if (document.scrollingElement) document.scrollingElement.scrollTop = 0;
  root.style.scrollBehavior = previous;
}
function holdTop() {
  const token = ++topToken, stop = () => { topToken++; off(); };
  const off = () => { window.removeEventListener("touchstart", stop); window.removeEventListener("wheel", stop); window.removeEventListener("keydown", stop); };
  window.addEventListener("touchstart", stop, { passive: true, once: true }); window.addEventListener("wheel", stop, { passive: true, once: true }); window.addEventListener("keydown", stop, { once: true });
  const again = (n: number) => { if (token !== topToken) return; if (window.scrollY !== 0) toTop(); if (n > 0) requestAnimationFrame(() => again(n - 1)); else off(); };
  requestAnimationFrame(() => again(30));
}
// A new step inside the same screen (the proof step of a question): the heading takes focus so a screen reader
// announces it, and the page stays where the student is.
export function focusHeading() {
  const heading = document.querySelector<HTMLElement>("main h1");
  if (!heading) return;
  if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
  heading.focus({ preventScroll: true });
}
export function focusScreenTop() {
  toTop(); holdTop();
  // A screen can name the field to start in (the join screen starts in the nickname box).
  const autofocus = document.querySelector<HTMLElement>("main [data-autofocus]");
  if (autofocus) { pendingHeadingObserver?.disconnect(); pendingHeadingObserver = null; autofocus.focus({ preventScroll: true }); return; }
  const heading = document.querySelector<HTMLElement>("main h1");
  if (heading) {
    pendingHeadingObserver?.disconnect();
    pendingHeadingObserver = null;
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  } else {
    pendingHeadingObserver?.disconnect();
    const main = document.querySelector("main");
    if (main) {
      pendingHeadingObserver = new MutationObserver(() => {
        const loadedHeading = main.querySelector<HTMLElement>("h1");
        if (!loadedHeading) return;
        pendingHeadingObserver?.disconnect();
        pendingHeadingObserver = null;
        if (!loadedHeading.hasAttribute("tabindex")) loadedHeading.setAttribute("tabindex", "-1");
        loadedHeading.focus({ preventScroll: true });
      });
      pendingHeadingObserver.observe(main, { childList: true, subtree: true });
    }
  }
}
