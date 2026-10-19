// Hologram mode: a character shown four times around a central square on a black screen, for a clear four-sided
// pyramid (Pepper's ghost) set point-down on the phone. Each copy faces outward, so whoever looks into a side of the
// pyramid sees the figure upright; the mirror toggle flips them for pyramids that show a reversed image.
// Pure math and file checks, shared by the view, the world validator and the tests.

export type HologramCopy = { side: "top" | "right" | "bottom" | "left"; x: number; y: number; size: number; rotate: number; mirror: boolean; clip: string };
export type HologramOptions = { width: number; height: number; size: number; gap: number; mirror: boolean };

// size: each copy's side as a share (0.2 to 1) of the largest that fits; gap: the central square's side as a share
// (0 to 0.5) of the shorter screen edge. x and y are each copy's centre in pixels.
export const HOLOGRAM_DEFAULTS = { size: 0.9, gap: 0.16, mirror: false };
export function hologramLayout({ width, height, size, gap, mirror }: HologramOptions): HologramCopy[] {
  const short = Math.max(0, Math.min(width, height));
  const g = Math.min(0.5, Math.max(0, gap)) * short;
  const room = Math.max(0, (short - g) / 2); // from the central square to the screen edge
  const side = room * Math.min(1, Math.max(0.2, size));
  const cx = width / 2, cy = height / 2, d = g / 2 + side / 2;
  const clip = faceClip(side, g);
  return [
    { side: "top", x: cx, y: cy - d, size: side, rotate: 0, mirror, clip },
    { side: "right", x: cx + d, y: cy, size: side, rotate: 90, mirror, clip },
    { side: "bottom", x: cx, y: cy + d, size: side, rotate: 180, mirror, clip },
    { side: "left", x: cx - d, y: cy, size: side, rotate: 270, mirror, clip },
  ];
}
// Each copy is cut to its own face of the pyramid (the wedge between the two diagonals), so neighbouring copies never
// overlap at the corners. In the copy's own frame its inner edge is at the bottom, g/2 from the centre.
export function faceClip(side: number, g: number) {
  if (side <= 0) return "none";
  const pct = (n: number) => `${+(Math.min(1, Math.max(0, n)) * 100).toFixed(2)}%`;
  const half = Math.min(0.5, g / 2 / side), meet = Math.min(1, 0.5 + g / 2 / side);
  return `polygon(0% 0%, 100% 0%, 100% ${pct(meet)}, ${pct(0.5 + half)} 100%, ${pct(0.5 - half)} 100%, 0% ${pct(meet)})`;
}
// The CSS transform for one copy: flip first (in the figure's own frame), then turn it to face outward.
export const copyTransform = (c: HologramCopy) => `translate(-50%, -50%) rotate(${c.rotate}deg)${c.mirror ? " scaleX(-1)" : ""}`;

// Voice level (0 to 1) from an analyser's time-domain samples, for the glow. Root mean square, lightly boosted.
export function voiceLevel(samples: ArrayLike<number>) {
  if (!samples.length) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) { const v = (samples[i] - 128) / 128; sum += v * v; }
  return Math.min(1, Math.sqrt(sum / samples.length) * 3);
}

// validate:worlds: a hologram must be an 8-bit PNG with transparency (RGBA, or a palette with a tRNS chunk) whose corner
// pixel is fully transparent, so nothing but the figure shows on the black screen. The first pixel of the first row
// reads the same under every PNG filter.
export async function hologramPngProblem(png: Uint8Array, inflate: (data: Uint8Array) => Uint8Array): Promise<string | null> {
  const sig = [137, 80, 78, 71, 13, 10, 26, 10];
  if (png.length < 33 || sig.some((b, i) => png[i] !== b)) return "is not a PNG";
  const view = new DataView(png.buffer, png.byteOffset, png.byteLength);
  const depth = png[24], colorType = png[25];
  if ((colorType !== 6 && colorType !== 3) || depth !== 8) return "needs a transparent background (8-bit RGBA or palette PNG)";
  const idat: Uint8Array[] = [];
  let trns: Uint8Array | null = null;
  for (let at = 8; at + 8 <= png.length;) {
    const len = view.getUint32(at), type = String.fromCharCode(...png.subarray(at + 4, at + 8));
    if (type === "IDAT") idat.push(png.subarray(at + 8, at + 8 + len));
    if (type === "tRNS") trns = png.subarray(at + 8, at + 8 + len);
    if (type === "IEND") break;
    at += 12 + len;
  }
  const joined = new Uint8Array(idat.reduce((n, c) => n + c.length, 0));
  let o = 0; for (const c of idat) { joined.set(c, o); o += c.length; }
  const raw = inflate(joined);
  if (colorType === 3) {
    if (!trns) return "needs a transparent background (the palette has no transparency)";
    if (raw.length < 2) return "has no image data";
    if ((trns[raw[1]] ?? 255) !== 0) return "has a background: its corner is not transparent";
    return null;
  }
  if (raw.length < 5) return "has no image data";
  if (raw[4] !== 0) return "has a background: its corner is not transparent";
  return null;
}
