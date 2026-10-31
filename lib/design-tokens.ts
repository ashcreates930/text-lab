// The game look: one source of truth for color, type and radius. app/globals.css declares the same values as CSS
// variables and the Tailwind v4 theme (tests/design-tokens.test.ts checks the two match and that every text and
// background pair the app uses meets WCAG contrast).
export const COLORS = {
  stage: "#15122E", deep: "#0E0C22", panel: "#2A2552", "panel-2": "#1F1B40", edge: "#3B3470",
  ink: "#FFFFFF", muted: "#C9C3F0", faint: "#8C84C8",
  primary: "#FF8A1F", "on-primary": "#1A0F00", "primary-shadow": "#9A4A00", highlight: "#FFB65C", "primary-soft": "#3A2440",
  success: "#34E0C0", "on-success": "#062B24", "success-shadow": "#12917A", "success-soft": "#123B3D",
  notyet: "#FF7A93", "on-notyet": "#3A0614", "notyet-shadow": "#B23A55", "notyet-soft": "#3E1A33",
  gold: "#FFCF3F", "on-gold": "#2B1F00", "gold-shadow": "#B88700", "gold-soft": "#3A3016",
  violet: "#8C7CFF", "on-violet": "#120A3A", "violet-shadow": "#5446C2", "violet-soft": "#2C2766",
  reading: "#FFF8EC", "reading-ink": "#241B12", "line-row": "#FFFFFF", "line-edge": "#EADCC6", "line-picked": "#FFE2B8", "line-right": "#E3FBF5", "line-right-edge": "#12917A", "line-wrong": "#FFE3EA", "line-wrong-edge": "#C23A5C",
} as const;
export type ColorToken = keyof typeof COLORS;

// Inside the reading card (.reading-scope) the neutral tokens turn light, so shared pieces read dark on cream there.
export const READING_SCOPE: Partial<Record<ColorToken, string>> = {
  stage: "#FFF8EC", deep: "#EADCC6", panel: "#FFFFFF", "panel-2": "#FFF8EC", edge: "#EADCC6",
  ink: "#241B12", muted: "#5E4A36", faint: "#5E4A36", highlight: "#8A3F00",
  "primary-soft": "#FFEBD6", "success-soft": "#E3FBF5", "notyet-soft": "#FFE3EA", "gold-soft": "#FFF3CC", "violet-soft": "#ECE9FF",
};

// Print: white paper, dark text.
export const PRINT_SCOPE: Partial<Record<ColorToken, string>> = {
  stage: "#FFFFFF", deep: "#FFFFFF", panel: "#FFFFFF", "panel-2": "#F4F4F4", edge: "#999999",
  ink: "#111111", muted: "#333333", faint: "#333333", highlight: "#7A3600",
};

export const FONTS = { display: "Fredoka", ui: "Nunito", story: "Literata" } as const;
export const RADII = { row: 12, button: 16, card: 22, pill: 999 } as const;

// WCAG relative luminance and contrast ratio.
export function luminance(hex: string) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrast(a: string, b: string) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
