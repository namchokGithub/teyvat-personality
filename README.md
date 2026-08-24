# Teyvat Personality

[![Version](https://img.shields.io/badge/version-0.1.0-4c7cff)](package.json)
[![Status: Project Scaffold](https://img.shields.io/badge/status-project%20scaffold-4c7cff)](docs/scope.md)
[![Characters](https://img.shields.io/badge/characters-125-8b5cf6)](src/data/characters/_characters.json)
[![Elements](https://img.shields.io/badge/elements-7-00a896)](src/data/masters/elements.json)
[![License: MIT](https://img.shields.io/badge/license-MIT-2ea44f)](LICENSE)

Teyvat Personality is a fan-made personality quiz inspired by **Genshin Impact**. It matches a user's personality profile with Genshin characters and independently estimates their elemental Vision affinity.

> This project uses its own personality model. It is not an MBTI-to-character mapper.

## What it explores

| Result | How it is determined |
| --- | --- |
| Character match | Compares the user's personality profile with fan-made character personality profiles. |
| Vision affinity | Compares the user's traits with each element's weighted trait profile. |

Character matching and Vision affinity are separate results. A matching character's in-game element does not determine the user's Vision affinity.

## Personality model

The initial model uses six dimensions:

| Dimension | Lower end | Higher end |
| --- | --- | --- |
| Social | Introverted | Extroverted |
| Decision | Emotional | Rational |
| Lifestyle | Spontaneous / Flexible | Structured / Planned |
| Adventure | Cautious | Adventurous |
| Responsibility | Free-spirited | Duty-driven |
| Expression | Reserved | Expressive |

Elemental profiles use weighted traits rather than treating every trait equally. For example, an element's primary trait has a higher influence than its supporting traits.

## Tech stack

- Vite, React, and TypeScript
- Tailwind CSS v4, with custom design-token CSS (light/dark theme via CSS custom properties and a `data-theme` attribute; no shadcn/ui adopted)
- React Router (hash-based, for GitHub Pages compatibility)
- Zod
- Firebase Web SDK connected directly from the frontend; no Backend API
- GitHub Pages deployment
- pnpm via Corepack

Unit testing is intentionally deferred until a later development phase.

## Features

- 24-question personality quiz with independent Character Match and Vision Affinity results
- Character directory with search and filters across all 125 characters
- Shareable result cards
- Light and dark theme, following the system preference until manually switched, with the choice remembered
- Decorative Landing Page particle background covering all 7 elements, switchable from a single picker

## Getting started

Requirements: Node.js 20+ and Corepack.

```bash
corepack prepare pnpm@9.15.4 --activate
corepack pnpm install
corepack pnpm dev
```

For Firebase integration, copy `.env.example` to `.env.local` and fill in the public Firebase Web configuration. Never place Firebase Admin SDK credentials or service-account keys in frontend environment files.

Available commands:

```bash
corepack pnpm dev          # Start the development server
corepack pnpm build        # Type-check and create a production build
corepack pnpm lint         # Run ESLint
corepack pnpm format       # Format files with Prettier
corepack pnpm preview      # Preview the production build
```

## Data layout

```text
src/
├── components/                  # Shared, quiz, and result components
├── data/
│   ├── characters/              # Character index and factual data
│   ├── lore/                    # Lore and research scaffolds
│   ├── masters/                 # Elements, regions, weapons, and lookup data
│   └── personality/             # Trait catalog, character profiles, and element profiles
├── engine/                      # Scoring and matching logic
├── hooks/
├── lib/                         # Firebase and external integrations
├── pages/
├── schemas/                     # Zod schemas
├── styles/
├── types/
└── utils/
```

Character files separate factual game data from personality interpretation. When a factual value is unavailable from a reference source, it is stored as `null` rather than guessed.

## Project documentation

- [Project scope](docs/scope.md) explains the quiz concept and personality dimensions.
- [Character data import plan](docs/character-data-import-plan.md) documents the source mapping, fallbacks, and safe re-run behavior.
- [Lore research workflow](docs/lore-research-workflow.md) explains how to research Profile and Voice-Overs pages, validate lore files, and resume from the saved checkpoint.
- [Project context](CONTEXT.md) records the broader data-model and matching-system decisions.
- [Agent rules](AGENTS.md) contains concise repository rules for AI-assisted work.

## Deployment

The production target is GitHub Pages. Vite applies the repository base path during GitHub Actions builds, and the application uses hash-based routing so client-side routes remain compatible with static hosting.

## Data credits

Character and master data are normalized from these reference repositories. They are used as read-only source datasets and are not runtime dependencies of this project.

- [theBowja/genshin-db](https://github.com/theBowja/genshin-db) — character facts, localized game data, and master-data references.
- [MadeBaruna/paimon-moe](https://github.com/MadeBaruna/paimon-moe) — supplementary character data and birthday references.

Please review and respect the licenses and attribution requirements of these upstream projects when reusing derived data.

## Image credits

The artwork manifest records a per-image source and project usage policy. 248 head/full character images exactly match [MadeBaruna/paimon-moe](https://github.com/MadeBaruna/paimon-moe/tree/main/static/images/characters); the Traveler Cryo head/full images were provided by the project maintainer. They may be displayed in this non-commercial fan project's UI and generated Share Cards with attribution and this disclaimer. They may not be relicensed or redistributed as standalone assets. Genshin Impact game content, artwork, characters, and trademarks remain the property of HoYoverse and their respective owners. See the [artwork manifest report](src/data/characters/_artwork-manifest-report.md) and HoYoverse's [fan-made content guidance](https://support.hoyoverse.com/hc/en-us/articles/51005649400729-What-are-the-guidelines-for-creating-and-selling-fan-made-content).

## Disclaimer

This is an unofficial fan project and is not affiliated with, endorsed by, or sponsored by HoYoverse. Genshin Impact and related names are trademarks of their respective owners.

## License

This project is licensed under the [MIT License](LICENSE).
