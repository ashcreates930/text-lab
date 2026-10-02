export type PacketSection = { title: string; body: string };
export type StudentPacket = { name: string; role: string; narrative: string; sections: PacketSection[] };

function toAscii(value: string) {
  return value
    .replace(/[“”]/g, '"').replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-").replace(/…/g, "...")
    .normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "?");
}

function wrap(value: string, limit = 86) {
  const lines: string[] = [];
  for (const paragraph of toAscii(value).split(/\r?\n/)) {
    let line = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (line && `${line} ${word}`.length > limit) { lines.push(line); line = word; }
      else line = line ? `${line} ${word}` : word;
    }
    lines.push(line);
  }
  return lines;
}

function escapePdf(text: string) { return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)"); }

export function downloadStudentPacket(packet: StudentPacket) {
  const lines = ["Inside the Text - Student Submission Packet", packet.name, packet.role, "", "Narrative", ...wrap(packet.narrative || "No narrative submitted.")];
  for (const section of packet.sections) lines.push("", section.title, ...wrap(section.body || "None recorded."));
  const pages: string[][] = [];
  for (let index = 0; index < lines.length; index += 48) pages.push(lines.slice(index, index + 48));
  const pageCount = Math.max(1, pages.length);
  const fontObject = 3 + pageCount * 2;
  const objects: string[] = [];
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pageCount} >>`;
  pages.forEach((page, index) => {
    const pageObject = 3 + index * 2;
    const contentObject = pageObject + 1;
    const commands = ["BT", "/F1 11 Tf", "50 748 Td", "14 TL", ...page.map((line) => `(${escapePdf(line)}) Tj T*`), "ET"].join("\n");
    objects[pageObject] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObject} 0 R >> >> /Contents ${contentObject} 0 R >>`;
    objects[contentObject] = `<< /Length ${commands.length} >>\nstream\n${commands}\nendstream`;
  });
  objects[fontObject] = "<< /Type /Font /Subtype /Type1 /BaseFont /Times-Roman /Encoding /WinAnsiEncoding >>";
  let document = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id++) { offsets[id] = document.length; document += `${id} 0 obj\n${objects[id]}\nendobj\n`; }
  const xref = document.length;
  document += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id++) document += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  document += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([document], { type: "application/pdf" }));
  const link = window.document.createElement("a");
  link.href = url;
  link.download = `${packet.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-submission-packet.pdf`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
