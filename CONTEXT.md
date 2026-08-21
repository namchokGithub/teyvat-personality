# Teyvat Personality — Project Context

> This file is the primary context for AI agents working on this project.
> Read this file before making architectural, data-model, quiz, or personality-system changes.
> Repository-operation rules live in `AGENTS.md`; detailed product scope lives in `docs/scope.md`; the authoritative implementation stack lives in `docs/stack.md`.

---

## 1. Project Overview

**Teyvat Personality** is a fan-made personality quiz inspired by Genshin Impact.

The application answers two separate questions:

1. **Which Genshin character matches your personality?**
2. **Which elemental Vision best matches your personality?**

The system is inspired by personality tests such as MBTI, but **does not use MBTI directly**.

Instead, the project uses its own personality dimensions, traits, scoring, and matching algorithms.

Example result:

```text
Your Character Match

Furina
87% Match

"The Dramatic Dreamer"

-------------------------

Your Vision

Hydro
84% Affinity

-------------------------

Similar Characters

Fischl    82%
Venti     78%
Kaveh     75%
```

---

# 2. Important Project Principles

## 2.1 This is NOT an MBTI implementation

Do not map:

```text
MBTI
↓
Character
```

For example, avoid:

```text
ENFP = Venti
INTJ = Alhaitham
```

Instead:

```text
Quiz Answers
      ↓
Personality Profile
      ↓
 ┌────┴─────┐
 ↓          ↓
Character   Vision
Matching    Affinity
```

---

## 2.2 Character Match and Vision Affinity are separate systems

A user's best matching character does **not** determine their Vision.

Example:

```text
Character Match

Furina
87%

Vision Affinity

Electro
82%

Hydro
76%
```

This is valid.

Never implement:

```ts
userVision = matchedCharacter.element;
```

Character personality and elemental personality must be calculated independently.

---

# 3. Data Sources

Character factual/master data may be derived from these read-only references:

**genshin-db**

Repository:

```text
https://github.com/theBowja/genshin-db
```

genshin-db is the primary source for localized character facts and master data.

**Paimon.moe**

Repository:

```text
https://github.com/MadeBaruna/paimon-moe
```

Both repositories are **reference/source datasets**, not runtime dependencies.

Recommended development workspace:

```text
workspace/
│
├── genshin-db/
│   └── reference repository
│
├── paimon-moe/
│   └── reference repository
│
└── teyvat-personality/
    └── this project
```

Do not modify the genshin-db or Paimon.moe repositories.

Extract and normalize only the data required by this project.

---

# 4. Character Master Data

Character factual data should be separated from personality interpretation.

Current layout:

```text
src/data/
├── characters/
│   ├── _characters.json
│   ├── {character-id}.json
│   └── _missing-data-report.md
├── lore/
│   └── {character-id}.json
├── masters/
│   ├── associationTypes.json
│   ├── bodyTypes.json
│   ├── elements.json
│   ├── regions.json
│   └── weapons.json
└── personality/
    ├── character-personalities/
    │   └── {character-id}.json
    └── element-personalities.json
```

Example Character:

```json
{
  "id": "furina",
  "name": "Furina",
  "region": "Fontaine",
  "element": "Hydro",
  "weapon": "Sword",
  "rarity": 5,
  "title": "Endless Solo of Solitude",
  "titleTh": "บทเพลงเดี่ยวอันไร้ที่สิ้นสุด",
  "description": "...",
  "descriptionTh": "...",
  "birthday": {
    "birthdayText": "October 13",
    "birthdayMMDD": [10, 13]
  },
  "gender": "Female",
  "personality": null,
  "traits": [],
  "strengths": [],
  "weaknesses": []
}
```

Character master data represents factual game information.

A **dynamic factual field** is a fact controlled by the player's in-game choice rather than one canonical character value. Store it as `null` rather than choosing an arbitrary variant, and document why in the missing-data report. Traveler `birthday` and `gender` are dynamic factual fields.

Do not place personality scores directly inside `data/characters/_characters.json` or the per-character factual files. Lore/research evidence belongs in `data/lore/`; interpreted personality profiles belong in `data/personality/`.

---

# 5. Character Data Import

Prefer deterministic scripts for factual data.

Recommended:

```text
genshin-db + Paimon.moe (read-only)
              ↓
  deterministic import script
              ↓
src/data/characters/*.json
```

AI may help create or maintain the importer, but factual data extraction should eventually be deterministic.

Required character fields:

```text
id
name
region
element
weapon
rarity
title
titleTh
description
descriptionTh
birthday
gender
```

Do not import unnecessary gameplay information such as:

```text
HP progression
ATK progression
DEF progression
Talents
Constellations
Ascension materials
Combat scaling
Artifact recommendations
```

If required information cannot be found:

**Do not invent it.**

Report missing data instead.

---

# 6. Personality Model

The system uses two levels of personality information:

```text
Personality Dimensions
+
Personality Traits
```

Dimensions describe broad behavioral tendencies.

Traits provide more detailed personality characteristics.

---

# 7. Main Personality Dimensions

Initial model contains approximately six dimensions.

```text
Social
Decision
Lifestyle
Adventure
Responsibility
Expression
```

Conceptual ranges:

| Dimension      | Low           | High        |
| -------------- | ------------- | ----------- |
| Social         | Introverted   | Extroverted |
| Decision       | Emotional     | Rational    |
| Lifestyle      | Spontaneous / Flexible | Structured / Planned |
| Adventure      | Cautious      | Adventurous |
| Responsibility | Free-spirited | Duty-driven |
| Expression     | Reserved      | Expressive  |

Normalized values:

```text
0 – 100
```

Example:

```json
{
  "social": 80,
  "decision": 45,
  "lifestyle": 55,
  "adventure": 65,
  "responsibility": 75,
  "expression": 95
}
```

These dimensions may evolve as the quiz is tested.

Do not treat the initial model as immutable.

---

# 8. Personality Traits

Traits provide more granular personality information.

Potential traits include:

```text
passion
enthusiasm
selfExpression
determination
optimism

ideals
adaptability
responsibility
creativity
perseverance

freedom
acceptance
sensitivity
selflessness

individuality
independence
confidence
nonconformity

growth
curiosity
knowledge
learning
selfDevelopment

innerConflict
contradiction
identity
introspection
resilience

resolve
stability
discipline
reliability

leadership
empathy
ambition
loyalty
idealism
humor
competitiveness
```

This list may expand during character analysis.

Prefer reusable traits instead of creating slightly different traits with the same meaning.

For example, avoid simultaneously introducing:

```text
determined
determination
strongDetermination
willpower
```

unless they represent meaningfully different concepts.

---

# 9. Character Personality Data

Character personality interpretation must be separated from factual Character Master Data.

Example:

```json
{
  "id": "furina",

  "personality": {
    "social": 80,
    "decision": 45,
    "lifestyle": 55,
    "adventure": 65,
    "responsibility": 75,
    "expression": 95
  },

  "traits": {
    "creativity": 0.95,
    "empathy": 0.8,
    "selfExpression": 0.95,
    "sensitivity": 0.85
  },

  "title": "The Dramatic Dreamer",

  "strengths": ["Creative", "Empathetic", "Adaptable"],

  "weaknesses": ["Overthinks", "Emotionally sensitive", "Needs validation"]
}
```

---

# 10. Character Personality Research

Character personality should be analyzed from sources such as:

```text
Character Story
Story Quest
Archon Quest
Voice-Overs
Official Character Description
Character Behavior
Relationships
Motivations
Values
Internal Conflicts
```

AI may assist with this analysis.

However:

**AI-generated personality scores are interpretations, not factual Genshin data.**

Scores should eventually be manually reviewed and balanced against other characters.

---

# 11. Element Personality System

Element personality is a separate layer used to calculate:

```text
Vision Affinity
```

Important:

> Element personality patterns are community interpretations and thematic analysis. They are NOT confirmed official rules stating that a specific personality receives a specific Vision.

The application should clearly present Vision results as entertainment/fan interpretation.

---

# 12. Element Personality Themes

Current working model:

| Element | Primary Theme  |
| ------- | -------------- |
| Pyro    | Passion        |
| Hydro   | Ideals         |
| Anemo   | Freedom        |
| Electro | Individuality  |
| Dendro  | Growth         |
| Cryo    | Inner Conflict |
| Geo     | Resolve        |

These themes may be refined as character analysis improves.

---

# 13. Element Trait Weight Model

Element personality should use **weighted traits**.

Do NOT treat all traits as equally important.

Example:

```json
{
  "elementId": "pyro",
  "personalityTheme": {
    "primary": "passion",
    "traits": {
      "passion": 1.0,
      "enthusiasm": 0.7,
      "selfExpression": 0.8,
      "determination": 0.6,
      "optimism": 0.4
    }
  }
}
```

Weights use:

```text
0.0 – 1.0
```

Interpretation:

```text
1.0 = defining trait
0.8 = very important
0.6 = important
0.4 = supporting trait
0.2 = weak association
```

Weights represent relative importance within the element profile.

---

# 14. Initial Element Profiles

These values are **initial design values**, not finalized scientific measurements.

They must be tested and balanced.

## Pyro

Core:

```text
Passion
```

```json
{
  "elementId": "pyro",
  "personalityTheme": {
    "primary": "passion",
    "traits": {
      "passion": 1.0,
      "enthusiasm": 0.7,
      "selfExpression": 0.8,
      "determination": 0.6,
      "optimism": 0.4
    }
  }
}
```

---

## Hydro

Core:

```text
Ideals
```

```json
{
  "elementId": "hydro",
  "personalityTheme": {
    "primary": "ideals",
    "traits": {
      "ideals": 1.0,
      "adaptability": 0.8,
      "responsibility": 0.7,
      "creativity": 0.6,
      "perseverance": 0.5
    }
  }
}
```

---

## Anemo

Core:

```text
Freedom
```

```json
{
  "elementId": "anemo",
  "personalityTheme": {
    "primary": "freedom",
    "traits": {
      "freedom": 1.0,
      "acceptance": 0.9,
      "sensitivity": 0.6,
      "selflessness": 0.7,
      "adaptability": 0.5
    }
  }
}
```

---

## Electro

Core:

```text
Individuality
```

```json
{
  "elementId": "electro",
  "personalityTheme": {
    "primary": "individuality",
    "traits": {
      "individuality": 1.0,
      "determination": 0.8,
      "independence": 0.9,
      "confidence": 0.6,
      "nonconformity": 0.8
    }
  }
}
```

---

## Dendro

Core:

```text
Growth
```

```json
{
  "elementId": "dendro",
  "personalityTheme": {
    "primary": "growth",
    "traits": {
      "growth": 1.0,
      "curiosity": 0.9,
      "knowledge": 0.8,
      "learning": 0.9,
      "selfDevelopment": 0.7
    }
  }
}
```

---

## Cryo

Core:

```text
Inner Conflict
```

```json
{
  "elementId": "cryo",
  "personalityTheme": {
    "primary": "innerConflict",
    "traits": {
      "innerConflict": 1.0,
      "contradiction": 0.9,
      "identity": 0.8,
      "introspection": 0.7,
      "resilience": 0.6
    }
  }
}
```

---

## Geo

Core:

```text
Resolve
```

```json
{
  "elementId": "geo",
  "personalityTheme": {
    "primary": "resolve",
    "traits": {
      "resolve": 1.0,
      "stability": 0.9,
      "perseverance": 0.8,
      "discipline": 0.7,
      "reliability": 0.8
    }
  }
}
```

---

# 15. Vision Affinity

Vision Affinity is calculated by comparing the user's personality traits against each element's weighted traits.

Conceptually:

```text
User Trait Profile
        ↓
Compare against
Element Trait Profiles
        ↓
Weighted Similarity
        ↓
Vision Affinity
```

Example:

```text
Electro     82%
Hydro       76%
Anemo       68%
Dendro      57%
Pyro        53%
Geo         42%
Cryo        38%
```

Highest affinity becomes the primary Vision result.

However, the UI may show multiple affinities.

---

# 16. Character Matching

Character matching uses the user's personality profile.

Conceptually:

```text
Quiz
 ↓
User Personality
 ↓
Character Personality Comparison
 ↓
Similarity Ranking
```

Example:

```text
Furina       87%
Fischl       82%
Venti        78%
Kaveh        75%
```

Potential algorithms:

```text
Euclidean Distance
Weighted Euclidean Distance
Cosine Similarity
Hybrid Dimension + Trait Similarity
```

Initial implementation may use weighted distance.

Do not hardcode character rules such as:

```ts
if (social > 70 && expression > 80) {
  return "furina";
}
```

Matching should be data-driven.

---

# 17. Quiz Question Design

Prefer:

```text
Situational Questions
```

Avoid direct personality questions.

Bad:

```text
Are you introverted or extroverted?
```

Better:

```text
You arrive at a party where you barely know anyone.
What do you do?
```

Possible answers:

```text
A. Start talking to new people.

B. Stay close to someone I know.

C. Observe the room before deciding what to do.

D. Start thinking about when I can leave.
```

Each answer modifies multiple personality traits/dimensions.

---

# 18. Question Scoring

Example:

```json
{
  "id": "q_party_001",
  "answers": [
    {
      "id": "a",
      "scores": {
        "dimensions": {
          "social": 3,
          "expression": 2
        },
        "traits": {
          "confidence": 0.5
        }
      }
    }
  ]
}
```

Users must never see internal scoring.

Questions should not make the intended result obvious.

---

# 19. Quiz Size

Initial target:

```text
24 Questions
```

Approximately:

```text
4 questions per main personality dimension
```

Questions may affect multiple dimensions and traits.

Future versions may use adaptive questioning.

---

# 20. Result Structure

Recommended result:

```text
Your Genshin Personality

FURINA

87% MATCH

"The Dramatic Dreamer"

------------------------

Your Vision

ELECTRO

82% AFFINITY

------------------------

Personality

Social          82
Decision        51
Adventure       73
Responsibility  78
Expression      91

------------------------

Strongest Traits

Creative
Expressive
Empathetic
Imaginative

------------------------

Similar Characters

Fischl     82%
Venti      78%
Kaveh      75%
```

---

# 21. Result Interpretation

The result should explain **why** the user received the result.

Avoid:

```text
You are Furina because your score is 87%.
```

Prefer explanations based on traits:

```text
You share Furina's expressive and imaginative nature.

You tend to connect strongly with other people's emotions while
using creativity and confidence to express yourself.

Like Furina, your outward personality may sometimes hide a more
sensitive and introspective side.
```

Vision results should follow the same principle.

---

# 22. Recommended V1 Scope

Target:

```text
24 Questions

6 Main Personality Dimensions

Reusable Personality Traits

20–30 Character Personality Profiles

7 Element Personality Profiles

Character Matching

Vision Affinity

Top 3 Character Matches

All 7 Vision Affinities

Personality Breakdown

Shareable Result
```

---

# 23. Character Rollout

Do not attempt to manually balance every playable character immediately.

Recommended:

```text
V1
20–30 diverse characters

V2
+ additional characters

V3
Full playable roster
```

Initial characters should represent very different personality profiles.

Examples:

```text
Furina
Venti
Zhongli
Nahida
Neuvillette
Alhaitham
Kaveh
Fischl
Yoimiya
Jean
Sucrose
Yae Miko
Wanderer
Dehya
Childe
```

---

# 24. AI Usage Guidelines

AI should be used for:

```text
Character personality research
Personality trait extraction
Initial personality scoring
Result descriptions
Quiz question generation
Dataset validation assistance
Code generation
```

Scripts should be preferred for:

```text
Character master import
Data normalization
Duplicate detection
Schema validation
Missing-field detection
Dataset generation
```

Rule of thumb:

> **Script handles facts. AI handles interpretation.**

---

# 25. AI Must Not Invent Factual Data

When working with game data:

```text
DO NOT GUESS.
```

If source data does not contain a required value:

```text
report missing data
```

instead of generating a plausible value.

This applies to:

```text
Character element
Region
Weapon
Rarity
Official description
Release information
Game lore
```

Personality interpretation is allowed to be generated, but it must be clearly treated as interpretation.

---

# 26. Balancing

Initial personality and element weights are hypotheses.

They must be tested.

Watch for:

```text
One character appearing too frequently

One Vision dominating results

Characters becoming indistinguishable

Elements having excessive trait overlap

Questions disproportionately affecting one trait

Certain answers producing predictable characters

Balanced users always receiving the same result
```

Balance by adjusting:

```text
Question weights
Character personality scores
Element trait weights
Dimension weights
Matching formulas
```

Do not modify factual Character Master Data for balancing purposes.

---

# 27. Data Separation Principle

Keep these three concepts separate:

```text
FACTUAL GAME DATA
        │
        ├── Character
        ├── Element
        ├── Region
        └── Weapon


PERSONALITY INTERPRETATION
        │
        ├── Character Personality
        ├── Element Personality
        └── Personality Traits


QUIZ ENGINE
        │
        ├── Questions
        ├── Scoring
        ├── Character Matching
        └── Vision Affinity
```

Do not tightly couple these layers.

---

# 28. Suggested Architecture

```text
src/
├── App.tsx
├── main.tsx
│
├── components/
│   ├── common/
│   ├── quiz/
│   └── result/
│
├── data/
│   ├── characters/
│   │   ├── _characters.json
│   │   └── {character-id}.json
│   ├── lore/
│   │   └── {character-id}.json
│   ├── masters/
│   │   ├── elements.json
│   │   ├── regions.json
│   │   ├── weapons.json
│   │   └── lookup data
│   └── personality/
│       ├── character-personalities.json
│       └── element-personalities.json
│
├── engine/
│   ├── calculatePersonality.ts
│   ├── calculateVisionAffinity.ts
│   ├── calculateCharacterSimilarity.ts
│   └── rankCharacters.ts
│
├── hooks/
├── lib/
│   └── firebase.ts
├── pages/
├── schemas/
├── styles/
├── types/
└── utils/
```

Exact folder structure may adapt to the existing project.

Do not restructure an existing working project solely to match this example.

## 28.1 Current Implementation Stack

The current application scaffold uses:

```text
Vite
React
TypeScript
Tailwind CSS v4
React Router
Zod
Firebase Web SDK
ESLint
Prettier
pnpm
```

Architecture and deployment constraints:

- The application is a static client-side web app.
- The frontend connects to Firebase directly; there is no Backend API.
- Firebase access must be protected with Firebase Security Rules.
- Admin SDK credentials and service-account keys must never be included in frontend code.
- GitHub Pages is the hosting target, using a repository-aware Vite base path and hash-based routing.
- Unit tests and a test framework are deferred until a later phase.
- shadcn/ui components should be initialized only when UI implementation begins.

---

# 29. Future Possibilities

Potential future features:

```text
Share Result Card

Character Comparison

Friend Personality Comparison

Vision Affinity Breakdown

Personality Radar Chart

Character Distribution Statistics

Most Common Vision

Quiz Analytics

Adaptive Questions

New Character Updates

Multiple Languages
```

These are future ideas and should not complicate V1 unnecessarily.

---

# 30. Disclaimer

This project is:

```text
Fan-made
Unofficial
For entertainment purposes
```

Genshin Impact and related characters, names, artwork, and intellectual property belong to HoYoverse.

Character personality classifications, personality scores, elemental personality themes, and Vision Affinity are interpretations created for this project.

They must not be presented as official HoYoverse personality classifications.

---

# 31. Core Development Rule

When implementing or modifying this project:

> **Preserve the separation between factual game data, personality interpretation, and quiz logic.**

And most importantly:

> **Character Match answers "Who are you similar to?"**
>
> **Vision Affinity answers "Which elemental philosophy/personality resonates with you?"**

These are related signals, but they are intentionally **not the same result**.
