# Character Artwork Manifest Report

The canonical artwork manifest is `src/data/characters/artwork.ts`. It exposes only images that exist under `src/assets/images/characters/` and assigns each one a `head` or `full` variant.

## Coverage

| Item | Count |
| --- | ---: |
| Character index entries | 125 |
| Head images matched to character ids | 124 |
| Full images matched to character ids | 124 |
| Missing head image | `traveler_cryo` |
| Missing full image | `traveler_cryo` |
| Extra non-character head files | `characters.png`, `paimon.png`, `traveler.png` |

## Licensing status

The current image files have no checked-in provenance or license metadata. Every manifest entry is therefore marked as **license unverified** and must not be published, redistributed, or used for Share Card export until the original source and permission/usage terms are recorded.

Assets are stored under the canonical project path `src/assets/`.
