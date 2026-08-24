# Project Rules

- AI may only create or edit files inside the `teyvat-personality/` folder.
- Do not modify, create, or delete files under `genshin-db/` or `paimon-moe/`; treat them as read-only references.
- If a task requires changes outside `teyvat-personality/`, stop and ask the user first instead of editing those files.

## Project References

- Read `CONTEXT.md` before changing architecture, data models, quiz logic, scoring, or personality interpretation.
- Use `docs/scope.md` as the product-scope reference.
- Use `README.md` as the authoritative technology and deployment reference.
- Use `docs/character-data-import-plan.md` for character import and source-mapping rules.
- Use `docs/lore-research-workflow.md` when creating or continuing character lore research from Wiki Profile and Voice-Overs pages.
- When documents disagree, follow the document dedicated to that topic and update stale summaries rather than duplicating detailed rules.

## Current Technical Constraints

- The application is a Vite, React, and TypeScript static web app.
- The frontend connects directly to Firebase through the Firebase Web SDK. Do not introduce a Backend API or store Firebase Admin credentials in frontend code.
- Hosting targets GitHub Pages. Keep asset paths and routing compatible with repository-based static hosting.
- Use pnpm through Corepack for dependency management.
- Unit tests are deferred; do not add a test framework unless the user explicitly asks for it.
- Preserve the separation between factual character data, lore/research data, personality interpretation, and quiz-engine logic.
