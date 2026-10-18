// Every new screen opens at the top with keyboard focus on its main heading (AGENTS.md). The app calls this when the
// screen changes; the scene game also calls it when a clue opens or closes, since that swaps the whole screen.
let pendingHeadingObserver: MutationObserver | null = null;
export function focusScreenTop() {
  const root = document.documentElement;
  const previousScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  root.style.scrollBehavior = previousScrollBehavior;
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
