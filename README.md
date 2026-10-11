# Text Lab

AmplifiED's immersive literature experience: AI characters are a way into the text; the text is the authority; the student's writing is the product.

## Start locally

1. Install Node.js 20 or later.
2. Copy `.env.example` to `.env.local` and add credentials for the services you intend to enable.
3. Run `npm install`, `npm run assets`, `npm run validate:worlds`, then `npm run dev`.
4. Visit `http://localhost:3000`. “Try the demo” opens an isolated browser sandbox; it needs no account or class code.

Without provider keys, the demo remains navigable, the safety checks still run, AI characters use a text-grounded fallback, narration uses browser speech, Jev uses sample results, and fluency checks fall back to teacher scoring. OpenAI and ElevenLabs keys are read only on the server. The student story experience uses no microphone or upload; the only microphone use is the teacher-run fluency check described below.

## Fluency checks

Teacher Studio has a **Fluency Checks** tab for intensive reading students. A teacher sits with one student, picks a passage, and presses Start; the student reads aloud for one minute.

- **Passages:** six original leveled passages (`lib/fluency-passages.ts`, about 250 words each, Flesch-Kincaid levels 2 to 11 checked in tests), excerpts from playable stories, or a passage the teacher pastes.
- **Scoring:** the recording goes once to `POST /api/fluency/score`, which transcribes it with OpenAI (`OPENAI_TRANSCRIBE_MODEL`, default `whisper-1`, for word timestamps) and returns only the transcript. `lib/fluency.ts` aligns the transcript to the passage in the browser: substitutions and omissions are errors, insertions are ignored, and words after the last word read are unread. The teacher confirms the draft by tapping words. The passage is never sent as a transcription prompt, because that would hide real errors. Speech recognition tends to "hear" the intended word, so the teacher review step is required, not optional.
- **Without AI:** if the key is missing, the cap is reached, or the microphone is blocked, the teacher times the reading and marks the last word and errors by tapping.
- **Results:** words correct per minute, accuracy with independent/instructional/frustration bands, an optional four-part prosody rating (Multidimensional Fluency Scale), Hasbrouck and Tindal (2017) norms for reference (grade 6 norms for older students), weekly growth after three checks, a goal line, and FAST ELA Reading PM1 to PM3 entries alongside. Export to CSV or print.
- **Privacy:** audio is held in browser memory for playback during review and is never written to disk, the database, or logs. Records (nickname, numbers, notes) are stored in the teacher's browser (`localStorage`) in this preview. Before classroom rollout, move them to Supabase behind teacher authentication. The route sits behind the demo gate and uses the `fluency` demo cap (30 per sandbox, 90 per device, per day).

## Course alignment

Each `world.json` may list `courses`: `best_ela`, `ap_lit`, `ap_lang`, `aice_lit` (Cambridge 9695), `aice_lang` (9093), `igcse_lit` (0475). The story picker filters by course; the tag means the tasks build that course's skills, not that the text is a set text. `lib/standards.ts` holds official B.E.S.T. wording for R.1.1, R.1.2, R.1.3, and C.1.2 in grades 6 to 12, plus the K-12 expectations. Question benchmarks use grade-free family codes (`ELA.R.1.3`, `ELA.C.1.2`) or K-12 codes and resolve to the student's grade on the role briefing screen. Spot-check wording against CPALMS after any FLDOE revision.

## Display settings

"Text size" (top right of every screen; bottom right on the landing page) offers larger text, high contrast, and reduced motion, saved per device.

## Migrations added

Apply `supabase/migrations/202610030001_waitlist_homeschool_roles.sql` to accept the homeschool parent and microschool leader waitlist roles. Until it runs, those sign-ups are saved as `other` with the role noted in the organization field.

## Classes, assigned mini lessons, and live class analysis

Teachers sign in from **Teacher sign in** on the landing page (Supabase email magic link, redirect `/?teacher=1`) and open **My classes**.

- **Classes:** a teacher creates a class (name, story, grade) and gets a six-character class code. Students join with the code and a nickname only; the join route returns a signed class token (`CLASS_TOKEN_SECRET`, falling back to the service role key) that the browser keeps for the session. Stories with content notes stay closed until the teacher enables them after previewing.
- **Assigned mini lessons:** teachers assign lessons to the whole class with an optional due date. Students see them on their class page; finishing one records first-try accuracy, and the teacher sees who finished.
- **Live class analysis:** the teacher picks a scene, a role lens, which questions (Notice, Interpret, Craft), and Stop and Chat timing. The projected presenter shows one question at a time with the passage, a live count of answers, then the answers without names (names are a teacher toggle; responses that trip the safety screen are held for private review). Stop and Chat shows the prompt, a talk timer, talk moves, and the story's real-world connection, followed by a one-sentence takeaway from every student. Students answer on their own devices; other students' answers are never sent to student devices. Teacher and student screens poll every 2 seconds.
- **Setup:** apply `supabase/migrations/202610040001_classroom.sql`, and add `https://<your-domain>/?teacher=1` to Supabase Auth's allowed redirect URLs. Optional `TEACHER_EMAILS` or `TEACHER_EMAIL_DOMAINS` limit who can create classes. For local development without Supabase, run `CLASSROOM_DEV_STORE=memory npm run dev` and open `/?teacher=1&devTeacher=you@example.org`; this in-memory store is disabled in production and on Vercel.

## Bilingual supports

Students pick **Language help** (English only, Español, Kreyòl ayisyen, Português, Tiếng Việt) on the role screen or in the story sidebar. The story stays in English. In the chosen language they also see: role cards and briefings, a short scene summary (`summary` on each scene), scene narration and investigation prompts, choice buttons, clue names, every Notice / Interpret / Craft question (translated from the plain-language version), glossary words and definitions, and key directions. In each clue they may draft in their language first, with English sentence starters to move toward an English sentence.

Translations are prebuilt files in `worlds/<id>/translations/<lang>.json`, keyed by a hash of the English line (`lib/bilingual.ts`), so editing an English line simply shows it without a translation until it is translated again. `node --experimental-strip-types scripts/translations.ts` writes `source.json` (the English lines) and reports coverage; add `--check` to fail on missing lines. Every file starts as `"status": "draft"`; after a fluent speaker reviews it (Teacher Studio, **Bilingual Supports**, prints English and translation side by side), set `"status": "reviewed"` and `"reviewed_by"`. New stories need their translation files before the support appears.

## Supabase setup

The schema migration is in `supabase/migrations/202609300001_initial.sql`. Apply it only to the Supabase project created for Text Lab. It deliberately revokes direct browser grants; trusted server routes use the service role after authorization. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. Teacher and owner access must use email magic-link authentication. Configure `OWNER_EMAIL` to the one owner email. The local demo preset store is separate from classroom data.

## Environment variables

See `.env.example` for the OpenAI text, image and embedding model settings, ElevenLabs, owner email, Jev mock/live adapter, and Supabase keys. Provider credentials must never use a `NEXT_PUBLIC_` prefix.

## World packs

Add a folder under `worlds/<id>/` with `world.json`, the full public-domain `source.md`, and generated scene assets. World packs provide a `hook` and per-grade `adaptations` for glossary access, hints, and sentence starters. Validate packs and run `npm run assets`; the asset script builds the world index and prepares every scene background. Incomplete folders remain in the story picker as locked “Coming soon” cards. If `OPENAI_API_KEY` is set, it requests images using `OPENAI_IMAGE_MODEL`; otherwise it creates local SVG artwork. The student experience reads the world pack, authored choices, prompts, and glossary from that generated index. The Zod schema is in `lib/world-schema.ts`. `worlds/` is the only source to edit; `public/worlds/` is generated output. `npm run dev` and `npm run build` run `sync:worlds` first, which copies every pack's `world.json` and `source.md` into `public/worlds/` and rebuilds the index without calling any image or audio provider. The Tell-Tale Heart source follows the 1843 Pioneer printing documented by the [Edgar Allan Poe Society of Baltimore](https://www.eapoe.org/works/tales/thearta.htm).

## Jev

`lib/jev.ts` defaults to the mock provider. Live requests stay disabled until `JEV_LIVE_ENABLED=true` and `/docs/jev-api.md` supplies the API contract. Add the contract before using live mode; the adapter contains a TODO for its response mapping.

## Demo access code

Set `DEMO_ACCESS_CODE` to gate the preview. Visitors enter it before the landing page; the server compares it case-insensitively and sets a signed, HTTP-only cookie for 7 days. `middleware.ts` rejects the chat, voice, analysis, and answer APIs without that cookie. Pricing, waitlist, the owner screen, and class joining stay open; class joining is gated by its class code instead. Changing the code signs every device out. If the variable is unset, nobody can get past the gate. Ten wrong codes from one IP address within an hour block that address for an hour.

## Demo limits and feedback

Apply `supabase/migrations/202610020001_demo_limits.sql` and `202610020002_demo_limits_eastern_day.sql` before enabling AI in the demo. Days reset at midnight US Eastern time (America/New_York, following daylight saving). Per day, each sandbox gets 40 AI character replies and 60 AI feedback responses (the Analysis Report); each device gets 120 and 180 across all its sandboxes. ElevenLabs narration shares the character-reply caps and falls back to browser speech when capped. When all AI calls in a day reach `DEMO_DAILY_AI_CEILING` (default 3,000), AI pauses for everyone. If Supabase is configured but counting fails, AI stays off rather than running uncounted. Set `FEEDBACK_FORM_URL` to show the feedback banner on demo screens and the "Give feedback" button on preview end screens; leave it blank to hide both.

## Privacy: demo mode vs. class sessions

The app never stores a raw IP address, and it never collects a device ID or IP-derived value from a class session.

**Demo mode** (visitors who enter the demo access code) collects two things, only to protect the shared preview from abuse and runaway AI cost:

- **A random device ID** inside the signed access cookie. It is generated when the code is accepted, identifies no person, and lasts as long as the cookie (7 days). It is used only to count AI calls per device per day in `demo_ai_usage`, so opening new demo sandboxes does not reset the daily caps. Counter rows older than 7 days are deleted.
- **A keyed hash of the IP address**, stored only when someone enters a wrong access code. It is used only to block an address after 10 wrong codes in an hour. Rows in `demo_access_lockouts` are deleted a day after the last attempt.

**Class sessions** (students who join with a teacher's class code) collect neither. Class joining sits outside the demo gate, so class students never receive the demo cookie or a device ID, and the class-code check never records an IP address or anything derived from one. Because demo AI is metered per device, class sessions do not call the AI character, voice, or analysis services yet; they will need their own metering, keyed to the class session rather than the device, before AI is enabled there.

**Class reading progress** is the student's own work, saved in their class record (`students.progress`) so it resumes on any day or device: the page and screen they reached, clue answers and the lines they quoted, and picture-frame descriptions. It is saved through `/api/student/progress` with the student's signed class token, checked against a fixed schema (`lib/classroom/progress.ts`), and only for the class's own story. It resumes when they rejoin with the class code and nickname on the same device, or with their returning-student phrase on any device. It contains no device ID or IP-derived value. Demo visitors' progress stays in their browser tab and expires after 24 hours.

## Waitlist and deployment

Waitlist writes use the server-side service role and normalize email for duplicate prevention. The owner export route is restricted to the configured owner email after magic-link login. Before deployment, configure the environment values in Vercel and Supabase Auth's allowed redirect URLs, apply the migration to the dedicated project, then run `npm run build` and deploy through the linked Vercel project.

## Current boundaries

The committed migration has RLS enabled and no direct browser table grants. Classroom progress writes, teacher authentication/session creation, and production-scale safety monitoring still need configuration and completion. Classes, assigned lessons, and live class analysis are stored in Supabase. Story progress inside a class session still lives in the browser, and AI characters stay off in class sessions until they have their own usage limits. Demo data is per-tab session storage and expires after 24 hours.

## Assumptions

- The owner-supplied `/docs/best-benchmarks.md` was not present. World 1 includes the requested grade 8–12 benchmark codes with `PENDING: add official wording` descriptions until that file is provided.
- `/docs/jev-api.md` was not present. Jev uses realistic mock report data; live mode stays disabled pending the API contract.
