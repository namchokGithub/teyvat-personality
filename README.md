# Teyvat Personality

[![Status: Data Foundation](https://img.shields.io/badge/status-data%20foundation-4c7cff)](docs/scope.md)
[![Characters](https://img.shields.io/badge/characters-125-8b5cf6)](src/data/characters/characters.json)
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
| Lifestyle | Structured | Flexible |
| Adventure | Cautious | Adventurous |
| Responsibility | Free-spirited | Duty-driven |
| Expression | Reserved | Expressive |

Elemental profiles use weighted traits rather than treating every trait equally. For example, an element's primary trait has a higher influence than its supporting traits.

## Data layout

```text
src/data/
├── characters/
│   ├── characters.json          # Character index
│   ├── {character-id}.json     # Factual data for each character
│   └── _missing-data-report.md # Source-data gaps to review
├── masters/
│   ├── associationTypes.json
│   ├── bodyTypes.json
│   ├── elements.json
│   ├── regions.json
│   └── weapons.json
└── personality/
    ├── character-personalities.json
    └── element-personalities.json
```

Character files separate factual game data from personality interpretation. When a factual value is unavailable from a reference source, it is stored as `null` rather than guessed.

## Project documentation

- [Project scope](docs/scope.md) explains the quiz concept and personality dimensions.
- [Character data import plan](docs/character-data-import-plan.md) documents the source mapping, fallbacks, and safe re-run behavior.
- [Project context](CONTEXT.md) records the broader data-model and matching-system decisions.

## Data credits

Character and master data are normalized from these reference repositories. They are used as read-only source datasets and are not runtime dependencies of this project.

- [theBowja/genshin-db](https://github.com/theBowja/genshin-db) — character facts, localized game data, and master-data references.
- [MadeBaruna/paimon-moe](https://github.com/MadeBaruna/paimon-moe) — supplementary character data and birthday references.

Please review and respect the licenses and attribution requirements of these upstream projects when reusing derived data.

## Image credits

Character images are sourced from official [Genshin Impact](https://genshin.hoyoverse.com/en/) materials and are referenced alongside the character data from [theBowja/genshin-db](https://github.com/theBowja/genshin-db) and [MadeBaruna/paimon-moe](https://github.com/MadeBaruna/paimon-moe). All related artwork, characters, and trademarks remain the property of HoYoverse and their respective owners.

## Disclaimer

This is an unofficial fan project and is not affiliated with, endorsed by, or sponsored by HoYoverse. Genshin Impact and related names are trademarks of their respective owners.

## License

This project is licensed under the [MIT License](LICENSE).
