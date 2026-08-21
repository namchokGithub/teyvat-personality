# Character Artwork Manifest Report

The canonical artwork manifest is `src/data/characters/artwork.ts`. It exposes only images that exist under `src/assets/images/characters/` and assigns each one a `head` or `full` variant.

## Coverage

| Item | Count |
| --- | ---: |
| Character index entries | 125 |
| Head images matched to character ids | 125 |
| Full images matched to character ids | 125 |
| Missing head images | None |
| Missing full images | None |
| Extra non-character head files | `characters.png`, `paimon.png`, `traveler.png` |

## Source and usage records

| Assets | Source record | Usage record |
| --- | --- | --- |
| 248 head/full assets for 124 character ids | Byte-for-byte matches [`MadeBaruna/paimon-moe`](https://github.com/MadeBaruna/paimon-moe/tree/main/static/images/characters) | Non-commercial use in this project's UI and generated Share Cards, with attribution and the HoYoverse disclaimer. No standalone redistribution or relicensing. |
| `traveler_cryo` head/full | Project maintainer-provided assets, added 21 August 2026; no matching file in the checked Paimon.moe snapshot | Approved by the project maintainer for the same non-commercial UI and Share Card use. |

Paimon.moe is released under MIT, while its README states that Genshin Impact game content and materials remain the trademarks and copyrights of HoYoverse. This manifest records this project's usage policy; it does not transfer ownership or grant a commercial license to the underlying artwork. Review HoYoverse's [fan-made content guidance](https://support.hoyoverse.com/hc/en-us/articles/51005649400729-What-are-the-guidelines-for-creating-and-selling-fan-made-content) before any new distribution context.

Assets are stored under the canonical project path `src/assets/`.
