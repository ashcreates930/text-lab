// Builds the 3D characters: npm run build:characters
// Brom Bones: three Mixamo FBX exports (assets-src/characters/brom/, kept out of git) become ONE optimized GLB at
// public/characters/brom/brom.glb: one skinned mesh, its textures (2048 px or smaller, WebP), meshopt compression, and
// the clips talking, laughing and head-shake. His skeleton has only index-finger bones, which deform badly: every finger
// track is removed and every finger bone is locked in a relaxed, half-closed pose. The idle clip is made in code at
// play time (lib/brom-idle.ts). Prints the triangle count, texture sizes and the file size.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS, EXTMeshoptCompression } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, quantize, textureCompress, weld } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import sharp from "sharp";

const CHARACTERS = {
  brom: { dir: "assets-src/characters/brom", clips: { talking: "brom-talking.fbx", laughing: "brom-laughing.fbx", "head-shake": "brom-head-shake.fbx" }, out: "public/characters/brom/brom.glb" },
};
const MAX_TRIANGLES = 60000, MAX_TEXTURE = 2048, MAX_BYTES = 6 * 1024 * 1024;
export const FINGER = /Hand(Index|Middle|Ring|Pinky|Thumb)\d/;
// Relaxed, half-closed: each finger joint curls a little more toward the tip (radians, about the bone's local Z;
// the left and right hands curl in opposite directions).
const CURL = [0.55, 0.75, 0.5];

const fbx2gltf = join("node_modules", "fbx2gltf", "bin", process.platform === "win32" ? "Windows_NT" : process.platform === "darwin" ? "Darwin" : "Linux", process.platform === "win32" ? "FBX2glTF.exe" : "FBX2glTF");
await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder, "meshopt.decoder": MeshoptDecoder });
const quatMul = (a, b) => [a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1], a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0], a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3], a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
const aroundZ = (r) => [0, 0, Math.sin(r / 2), Math.cos(r / 2)];

for (const [name, c] of Object.entries(CHARACTERS)) {
  const tmp = mkdtempSync(join(tmpdir(), `char-${name}-`));
  const docs = {};
  for (const [clip, file] of Object.entries(c.clips)) {
    execFileSync(fbx2gltf, ["--binary", "--input", join(c.dir, file), "--output", join(tmp, clip)], { stdio: "ignore" });
    docs[clip] = await io.read(join(tmp, `${clip}.glb`));
  }
  // The first clip's document is the base: its mesh, skin and textures. Each clip's channels move onto the base's joints by name.
  // The base is a separate read of the first clip, so its own clip can still be copied from docs.
  const [baseClip] = Object.keys(c.clips), doc = await io.read(join(tmp, `${baseClip}.glb`)), root = doc.getRoot();
  const nodes = new Map(root.listNodes().map((n) => [n.getName(), n]));
  for (const a of root.listAnimations()) a.dispose();
  const buffer = root.listBuffers()[0];
  let removed = 0;
  for (const [clip, src] of Object.entries(docs)) {
    const anim = doc.createAnimation(clip);
    for (const a of src.getRoot().listAnimations()) for (const ch of a.listChannels()) {
      const target = ch.getTargetNode()?.getName() ?? "";
      if (FINGER.test(target)) { removed++; continue; }
      const node = nodes.get(target); if (!node) continue;
      const s = ch.getSampler();
      const input = doc.createAccessor().setType("SCALAR").setArray(s.getInput().getArray().slice()).setBuffer(buffer);
      const output = doc.createAccessor().setType(s.getOutput().getType()).setArray(s.getOutput().getArray().slice()).setBuffer(buffer);
      const sampler = doc.createAnimationSampler().setInput(input).setOutput(output).setInterpolation(s.getInterpolation());
      anim.addSampler(sampler).addChannel(doc.createAnimationChannel().setTargetNode(node).setTargetPath(ch.getTargetPath()).setSampler(sampler));
    }
  }
  // Lock every finger bone in a relaxed, half-closed pose (no track moves them).
  for (const n of root.listNodes()) {
    const m = n.getName().match(/(Left|Right)Hand(Index|Middle|Ring|Pinky|Thumb)(\d)/); if (!m) continue;
    const curl = CURL[Number(m[3]) - 1] ?? 0.5, sign = m[1] === "Left" ? 1 : -1;
    n.setRotation(quatMul(n.getRotation(), aroundZ(sign * curl)));
  }
  // Textures: 2048 px or smaller, WebP. Mesh: welded, quantized, meshopt-compressed.
  await doc.transform(dedup(), weld(), textureCompress({ encoder: sharp, targetFormat: "webp", resize: [MAX_TEXTURE, MAX_TEXTURE], quality: 85 }), prune(), quantize(), meshopt({ encoder: MeshoptEncoder, level: "medium" }));
  doc.createExtension(EXTMeshoptCompression).setRequired(true);
  mkdirSync(c.out.replace(/\/[^/]+$/, ""), { recursive: true });
  await io.write(c.out, doc);
  // Report.
  const check = await io.read(c.out), r = check.getRoot();
  let tris = 0; for (const mesh of r.listMeshes()) for (const p of mesh.listPrimitives()) tris += (p.getIndices()?.getCount() ?? p.getAttribute("POSITION").getCount()) / 3;
  const bytes = statSync(c.out).size;
  const report = { character: name, file: c.out, megabytes: +(bytes / 1048576).toFixed(2), triangles: tris, meshes: r.listMeshes().length, skins: r.listSkins().length, joints: r.listSkins()[0]?.listJoints().length ?? 0,
    textures: r.listTextures().map((t) => `${t.getMimeType()} ${t.getSize()?.join("x")}`), clips: r.listAnimations().map((a) => `${a.getName()} (${a.listChannels().length} tracks)`),
    fingerTracksRemoved: removed, fingerTracksLeft: r.listAnimations().flatMap((a) => a.listChannels()).filter((ch) => FINGER.test(ch.getTargetNode()?.getName() ?? "")).length };
  console.log(JSON.stringify(report, null, 1));
  writeFileSync(c.out.replace(/\.glb$/, ".report.json"), JSON.stringify(report, null, 1) + "\n");
  if (tris > MAX_TRIANGLES) throw new Error(`${name}: ${tris} triangles is over ${MAX_TRIANGLES}`);
  if (bytes > MAX_BYTES) throw new Error(`${name}: ${(bytes / 1048576).toFixed(2)} MB is over 6 MB`);
  if (report.fingerTracksLeft) throw new Error(`${name}: finger tracks remain`);
}
