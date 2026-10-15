# RehabPharm — seven-day pharmacology reviewer

A responsive learning website for **Charles D. Ciccone, _Pharmacology in Rehabilitation_, fifth edition (2016)**. It contains original key-point notes aligned to every chapter of the supplied book, plus an eve-powered AI study coach.

## Included

- **38 chapter modules:** learning focus, key points, class/mechanism comparisons, rehabilitation implications, common confusion, a new clinical connection, personal notes, and chapter-level printed/PDF page references.
- **Seven-day course:** approximately **23 focused hours**, excluding breaks. Dense days require close to four hours. It is an intensive review target, not a guarantee of mastery or a substitute for the full book.
- **114 flashcards:** self-rated spaced review, with difficult cards returning in 10 minutes and understood cards scheduled at 1, 3, or 7 days.
- **76 original multiple-choice questions:** scored chapter/day practice and a **38-question final exam with one question from every chapter**. The final exam reveals explanations after submission.
- **Adaptive priorities:** recent practice accuracy, difficult cards, unfinished chapters, and current-day alignment determine review order.
- **Search, bookmarks, printable chapter notes, progress charts, and validated JSON backup/restore.**
- **Three appendix orientations:** local drug delivery, drugs of abuse, and case-study consolidation.
- **AI coach:** plan → retrieve → teach → check → adapt. Five bounded tools retrieve modules, search concepts, allocate time, choose stored questions, and grade the selected option against the answer key.

Study materials and the practice room need no AI credentials. The coach requires model access and its server configuration.

## Quick local study preview (no dependencies)

Requires Node.js 24 or later:

```sh
npm run preview:study
```

Open `http://localhost:3000`. This serves the complete study interface; `/coach` shows a setup explanation because this lightweight preview does not run Next/eve. Stop it before starting the full application on the same port.

## Full application

```sh
npm ci
cp .env.example .env.local
```

Set these variables in `.env.local` locally, or in the Vercel project environment for hosting:

| Variable | Purpose |
| --- | --- |
| `AI_GATEWAY_MODEL` | An exact tool-capable model ID from `https://ai-gateway.vercel.sh/v1/models`. The example default was present when authored; check current availability and team access. |
| `AI_GATEWAY_API_KEY` | Local AI Gateway authentication. A Vercel deployment can instead use its project OIDC authentication where enabled. Model access and available credits are still required. |
| `STUDY_ACCESS_CODE` | A unique code of at least 16 characters, shared with the intended learner to unlock the coach. This is separate from any API key. |
| `STUDY_SESSION_SECRET` | A separate random signing secret of at least 32 characters. Keep it server-side. |

Never commit actual secrets or put them in a `NEXT_PUBLIC_` variable. Generate the signing secret locally with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and place it directly in your private environment settings.

```sh
npm run dev
```

Open `http://localhost:3000` for the study space and `/coach` for AI coaching.

The coach authenticates each browser session with a signed, HttpOnly, SameSite cookie valid for 12 hours. Each successful unlock creates a distinct principal. It rejects anonymous requests. The shared access code is a small-cohort access mechanism, not a complete public multi-user identity system. Do not publish the code; use platform rate limiting and spend controls when opening access to a larger audience.

## Deploy from GitHub to Vercel

1. Create an empty GitHub repository, preferably named `rehabpharm-reviewer`. Upload this folder’s contents at the repository root, including `.gitignore` and `.env.example`. Do **not** upload your PDF, actual `.env.local`, or `node_modules`.
2. In Vercel, select **Add New → Project**, import the repository, and choose **Next.js**. Keep the root at the repository root. Use **Node.js 24.x** and `npm run build`.
3. Add the environment variables above to the intended Preview/Production environments. Set model access and AI Gateway credentials or enable the supported Vercel OIDC path.
4. Deploy. `next.config.mjs` uses the documented `withEve` integration to build the app and mount the agent at `/eve/v1/*` as part of the same Vercel project. Do not replace it with an unrelated catch-all rewrite.
5. Open `/index.html` and test chapters, cards, practice, and progress. Open `/coach`, unlock it, ask for a session plan, and answer a stored question. Confirm a chapter reference is shown.
6. Keep the supplied `package-lock.json` in GitHub. Dependencies are pinned to the versions used for the successful local builds.

You can also push the prepared local directory:

```sh
git init -b main
git add .
git commit -m "Build RehabPharm seven-day study companion"
git remote add origin https://github.com/YOUR_ACCOUNT/rehabpharm-reviewer.git
git push -u origin main
```

The source does not require a database for student progress. Progress belongs to the browser and can be moved through a backup. eve manages the coach’s durable conversations through its runtime; those are separate from local quiz and flashcard state.

## Seven-day course

| Day | New chapters | Focus | Approx. focused time |
| --- | --- | --- | --- |
| 1 | 1–5 | Principles, pharmacokinetics, receptors, CNS foundations | 2h 50m |
| 2 | 6–10 | Sleep/anxiety, mood, psychosis, epilepsy, Parkinson disease | 2h 50m |
| 3 | 11–17 | Anesthesia, muscle relaxants, analgesia, arthritis, PCA | 3h 46m |
| 4 | 18–25 | Autonomic and cardiovascular pharmacology | 4h 08m |
| 5 | 26–32 | Respiratory, GI, endocrine, bone, diabetes | 3h 52m |
| 6 | 33–36 | Antibacterial, antiviral, antifungal/antiparasitic, cancer | 2h 46m |
| 7 | 37–38 | Immunity, supplements, full-book retrieval and final practice | 2h 29m |

Times come from the structured course file; confirm the current values with `public/content.json` if you edit the curriculum. Break up longer days into multiple sessions. Day 7’s cross-book review is retrieval-focused and is not a second detailed reading of 36 chapters.

## Architecture

```text
public/                 Dependency-free study UI, data, and shared learning logic
app/                    Next.js shell, AI coach, access/status routes
agent/                  eve configuration, instructions, restricted study tools
lib/                    Shared retrieval, planning, grading, and signed-session logic
scripts/                Content generation, validation, lightweight preview
tests/                  Node tests for coverage, scheduling, planning, grading, auth
```

- `public/content.json` is the single runtime study corpus. Rebuild it after editing `scripts/write-content.py` with `npm run content`.
- Every module uses original educational language. The full PDF, extracted textbook text, publisher tables, and textbook case answers are not distributed.
- A learner can connect their own local PDF from Study settings. It stays in that browser tab and is never uploaded. In the supplied PDF, the PDF page number equals the printed page plus 30.
- The AI receives progress only when the learner sends a message with sharing enabled. Personal chapter notes are omitted. Coach MCQ responses do not silently change scored practice history.
- Tool-backed retrieval is lexical over the curated modules, with no external vector database. The coach must acknowledge when the notes do not support a detail. References identify the whole chapter range, not a pinpoint quotation.
- Default shell, file, web, and delegation tools are disabled. The coach has five study tools only. The in-process just-bash environment is configured to avoid remote VM provisioning; no shell or file tool is exposed to the model. No patient records, medication ordering, or prescription editing is supported.
- The coach includes per-session usage limits. These do not replace account-wide AI Gateway budget controls, per-user identity, or rate limits for a large public deployment.

## Validation

```sh
npm run check
npm test
npm run build
npm run build:agent
```

`check` verifies chapter coverage, seven-day assignments, page mappings, flashcard counts, and valid question options. The 23 Node tests exercise answer-key grading, balanced final exams, retrieval, bounded session planning, adaptive priorities, spaced repetition, backup validation, and authentication/CSRF behavior.

**Authoring verification:** dependency installation, syntax/content checks, all 23 Node tests, the Next.js production build, and the eve agent production build passed. The code-level interface tests exercise all 38 chapter routes; they are not visual browser QA. No live AI request or hosted Vercel deployment was tested because model credentials and a destination were not supplied. The included tests do not establish clinical correctness or validate generated AI answers.

## Content boundaries

This is an educational key-point reviewer tied to a **2016 edition**. Drug examples and historical treatment descriptions are not current prescribing algorithms. All 38 chapters receive a module, but selected key points do not reproduce every detail, indication, table, or reference in a 737-page text. The full textbook remains the primary study source. Verify current clinical practice using authoritative, up-to-date resources and the responsible qualified clinician.

## Framework references

- [eve Next.js integration](https://eve.dev/docs/guides/frontend/nextjs)
- [eve frontend and session behavior](https://eve.dev/docs/guides/frontend/overview)
- [eve authentication](https://eve.dev/docs/guides/auth-and-route-protection)
- [eve Vercel deployment](https://eve.dev/docs/guides/deployment/vercel)
- [AI Gateway model catalog](https://ai-gateway.vercel.sh/v1/models)
