# Story pack authoring rules

- Use only texts published in the United States before 1931, in original English or a public-domain English translation. Record and verify the exact source edition before building.
- When `teacher_preview_required` is true, hide a world from students in real class sessions until a teacher opens it in preview and enables it for that session. Adult demo visitors may browse it.
- AI characters never generate dialect. Characters from dialect texts speak in plain standard English; original dialect appears only in quoted source text. ElevenLabs voices must never use exaggerated or caricatured accents.
- Characters marked non-speaking in `PLANNING.md` must never be voiced by AI. Students learn about them through the text and artifacts only. A character becomes speaking only when the teacher approves it and `PLANNING.md` says so (Katrina Van Tassel in Sleepy Hollow, approved 2026-10-31; the neighbor in The Tell-Tale Heart, approved 2026-11-01); a speaking character's lines rest on what the text shows about them and add no new plot.
- Coming-soon worlds contain library metadata and `PLANNING.md` only. Do not add source text, scenes, questions, audio, or generated art before a full build is approved.
- Preview worlds stop after their approved scene range and display the preview end screen while retaining the Case File.
- New screens must open at the top instantly and move keyboard focus to the screen's main heading. Apply this at the app level to all student and teacher screens, including browser Back and in-app Back navigation. Actions within the same screen must preserve scroll position and focus.
- No feature is complete until it works in every playable and preview world and passes `validate:worlds`. Never write world-specific logic in components.
