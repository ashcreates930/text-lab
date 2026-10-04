// Bilingual supports. The story stays in English; home-language text appears beside it as a support.
// Story translations are prebuilt files (worlds/<id>/translations/<lang>.json) keyed by a hash of the English text,
// so a changed English line simply shows without a translation until it is translated again.
import type { WorldPack } from "./world-schema.ts";

export const homeLanguages = ["es", "ht", "pt", "vi"] as const;
export type HomeLanguage = (typeof homeLanguages)[number];
export const languageNames: Record<HomeLanguage, { native: string; english: string }> = {
  es: { native: "Español", english: "Spanish" },
  ht: { native: "Kreyòl ayisyen", english: "Haitian Creole" },
  pt: { native: "Português", english: "Portuguese" },
  vi: { native: "Tiếng Việt", english: "Vietnamese" },
};
export function isHomeLanguage(value: unknown): value is HomeLanguage {
  return typeof value === "string" && (homeLanguages as readonly string[]).includes(value);
}

// FNV-1a, 64-bit, as 16 hex characters. Synchronous and identical in Node and the browser.
export function textKey(text: string) {
  let h = 0xcbf29ce484222325n;
  for (const ch of text.normalize("NFC").trim()) { h ^= BigInt(ch.codePointAt(0)!); h = (h * 0x100000001b3n) & 0xffffffffffffffffn; }
  return h.toString(16).padStart(16, "0");
}

export type TranslationFile = { language: HomeLanguage; status: "draft" | "reviewed"; reviewed_by: string | null; note?: string; strings: Record<string, string> };

// Every English string in a story that students may see with a home-language support. Questions use the plain-language
// version when one exists, so the home-language support is the clearest wording at every grade.
export function translatableStrings(world: WorldPack): string[] {
  const out: string[] = [];
  const add = (t: string | undefined | null) => { if (t && t.trim()) out.push(t.trim()); };
  for (const r of world.roles) { add(r.name); add(r.description); add(r.goal); add(r.briefing); add(r.final_task); r.what_you_will_do.forEach(add); r.skills.forEach((s) => { add(s.name); add(s.description); }); }
  for (const s of world.scenes) {
    add(s.summary); add(s.reading_note); add(s.narration); add(s.dok_task); add(s.choice_point?.prompt); s.choice_point?.options.forEach((o) => add(o.label));
    for (const a of s.artifacts) {
      add(a.name);
      for (const q of a.questions) for (const r of world.roles) add(q.prompt_by_role_plain?.[r.id] ?? q.prompt_by_role[r.id]);
    }
  }
  for (const g of world.glossary) { add(g.term); add(g.student_friendly_definition); }
  return [...new Set(out)];
}

export function translator(file: TranslationFile | null) {
  return (english: string | undefined | null) => (english && file ? file.strings[textKey(english)] ?? null : null);
}

// Interface text in the student path. English first; the home language appears beside it.
export const ui = {
  languageHelp: { en: "Language help", es: "Ayuda en tu idioma", ht: "Èd nan lang ou", pt: "Ajuda no seu idioma", vi: "Hỗ trợ ngôn ngữ" },
  englishOnly: { en: "English only", es: "Solo inglés", ht: "Angle sèlman", pt: "Só inglês", vi: "Chỉ tiếng Anh" },
  chooseRole: { en: "Who will you be in the story?", es: "¿Quién serás en la historia?", ht: "Kiyès ou pral ye nan istwa a?", pt: "Quem você será na história?", vi: "Bạn sẽ là ai trong câu chuyện?" },
  roleHelp: { en: "Choose a role. The text stays the same; the details you notice are yours.", es: "Elige un papel. El texto es el mismo; los detalles que notes son tuyos.", ht: "Chwazi yon wòl. Tèks la rete menm jan an; detay ou remake yo se pou ou.", pt: "Escolha um papel. O texto é o mesmo; os detalhes que você notar são seus.", vi: "Hãy chọn một vai. Văn bản vẫn giữ nguyên; những chi tiết bạn nhận ra là của bạn." },
  whatYoullDo: { en: "What you'll do", es: "Lo que harás", ht: "Sa ou pral fè", pt: "O que você vai fazer", vi: "Những việc bạn sẽ làm" },
  skills: { en: "Skills you'll practice", es: "Habilidades que practicarás", ht: "Konpetans ou pral pratike", pt: "Habilidades que você vai praticar", vi: "Kỹ năng bạn sẽ luyện tập" },
  finalTask: { en: "Your final task", es: "Tu tarea final", ht: "Dènye travay ou", pt: "Sua tarefa final", vi: "Nhiệm vụ cuối cùng của bạn" },
  beginCase: { en: "Begin the case", es: "Empezar el caso", ht: "Kòmanse ka a", pt: "Começar o caso", vi: "Bắt đầu vụ án" },
  sceneSummary: { en: "What happens in this scene", es: "Qué pasa en esta escena", ht: "Sa k ap pase nan sèn sa a", pt: "O que acontece nesta cena", vi: "Điều gì xảy ra trong cảnh này" },
  yourInvestigation: { en: "Your investigation", es: "Tu investigación", ht: "Envestigasyon ou", pt: "Sua investigação", vi: "Cuộc điều tra của bạn" },
  caseFileIntro: { en: "These are the clues in this scene. Open one to answer three short questions.", es: "Estas son las pistas de esta escena. Abre una para responder tres preguntas cortas.", ht: "Men endis ki nan sèn sa a. Louvri youn pou reponn twa ti kesyon.", pt: "Estas são as pistas desta cena. Abra uma para responder três perguntas curtas.", vi: "Đây là các manh mối trong cảnh này. Mở một manh mối để trả lời ba câu hỏi ngắn." },
  notice: { en: "Notice: what does the text say?", es: "Observa: ¿qué dice el texto?", ht: "Remake: kisa tèks la di?", pt: "Observe: o que o texto diz?", vi: "Nhận biết: văn bản nói gì?" },
  interpret: { en: "Interpret: what does it mean?", es: "Interpreta: ¿qué significa?", ht: "Entèprete: kisa sa vle di?", pt: "Interprete: o que isso significa?", vi: "Diễn giải: điều đó có nghĩa là gì?" },
  craft: { en: "Craft: how did the author write it, and how will you?", es: "Técnica: ¿cómo lo escribió el autor y cómo lo escribirás tú?", ht: "Teknik: kijan otè a ekri l, e kijan ou pral ekri l?", pt: "Técnica: como o autor escreveu isso e como você vai escrever?", vi: "Kỹ thuật: tác giả đã viết như thế nào, và bạn sẽ viết ra sao?" },
  question: { en: "Question", es: "Pregunta", ht: "Kesyon", pt: "Pergunta", vi: "Câu hỏi" },
  writeHomeFirst: { en: "You may write your ideas in your language first. Then try one sentence in English.", es: "Puedes escribir tus ideas primero en tu idioma. Luego intenta una oración en inglés.", ht: "Ou ka ekri lide ou nan lang ou anvan. Apre sa, eseye ekri yon fraz an angle.", pt: "Você pode escrever suas ideias primeiro no seu idioma. Depois tente uma frase em inglês.", vi: "Bạn có thể viết ý của mình bằng ngôn ngữ của bạn trước. Sau đó hãy thử viết một câu bằng tiếng Anh." },
  englishFrames: { en: "English sentence starters", es: "Para empezar en inglés", ht: "Pou kòmanse an angle", pt: "Para começar em inglês", vi: "Mẫu câu để bắt đầu bằng tiếng Anh" },
  saveContinue: { en: "Save and continue", es: "Guardar y continuar", ht: "Anrejistre epi kontinye", pt: "Salvar e continuar", vi: "Lưu và tiếp tục" },
  nextPortion: { en: "Next portion of the text", es: "Siguiente parte del texto", ht: "Pwochen pati tèks la", pt: "Próxima parte do texto", vi: "Phần tiếp theo của văn bản" },
  nextPortionLocked: { en: "Finish the questions on this scene's clues to open it.", es: "Termina las preguntas de las pistas de esta escena para abrirla.", ht: "Fini kesyon yo sou endis sèn sa a pou w ka louvri l.", pt: "Termine as perguntas das pistas desta cena para abri-la.", vi: "Hãy làm xong các câu hỏi về manh mối của cảnh này để mở phần đó." },
  readNext: { en: "Read the next portion of the text", es: "Leer la siguiente parte del texto", ht: "Li pwochen pati tèks la", pt: "Ler a próxima parte do texto", vi: "Đọc phần tiếp theo của văn bản" },
  goToClues: { en: "Go to my clues", es: "Ir a mis pistas", ht: "Ale nan endis mwen yo", pt: "Ir para minhas pistas", vi: "Đến các manh mối của tôi" },
  draftNote: { en: "Translation draft: your teacher may update the wording.", es: "Borrador de traducción: tu maestro puede mejorar las palabras.", ht: "Bouyon tradiksyon: pwofesè w ka amelyore mo yo.", pt: "Rascunho de tradução: seu professor pode melhorar as palavras.", vi: "Bản dịch nháp: giáo viên của bạn có thể chỉnh sửa từ ngữ." },
} as const satisfies Record<string, Record<"en" | HomeLanguage, string>>;
export type UiKey = keyof typeof ui;

// English frames shown when a student drafts in their home language, nudging toward an English sentence.
export const englishFrames = ["The text says…", "This detail shows…", "I think this means… because…", "The author uses… to…"];
