// Where a visitor starts when they open the site without a class link, teacher sign-in, or owner link.
// Everyone who is not resuming a story lands on the home page, whatever side they chose last time. The book view
// (app/book-home.tsx) stays in the code but is no longer part of the home flow.
// Returns null when the visitor is resuming: their saved screen is restored instead.
export function homeStartView(_lastSide: "student" | "teacher" | null, resuming: boolean): "landing" | null {
  return resuming ? null : "landing";
}
