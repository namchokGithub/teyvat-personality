# Calculation Rules Implementation Plan

สถานะ: Implemented baseline — รอ visual/manual QA และการปรับ balance จากผู้ทดสอบจริง

เป้าหมาย: แปลงคำตอบ Quiz 24 ข้อเป็น Character Match และ Vision Affinity ที่คงที่ อธิบายได้ และปรับสมดุลภายหลังได้

> ค่าตัวเลขในแผนนี้เป็นค่าเริ่มต้นสำหรับ V1 ไม่ใช่กฎถาวร ต้องตรวจด้วย verification cases และ balance simulation ก่อน release

## Implementation Status

- [x] เติม question trait coverage สำหรับ traits ที่ Element Profiles ใช้ครบ
- [x] Normalize dimensions ตาม theoretical min/max ของ dataset
- [x] Normalize positive-evidence traits เป็นช่วง `0–1`
- [x] Character Matching แบบ dimensions `70%` และ traits `30%`
- [x] Vision Affinity ที่คำนวณแยกจาก Character Match
- [x] Deterministic tie-break โดยไม่ขึ้นกับลำดับไฟล์
- [x] Quiz/result version และ persistence ใน `localStorage`
- [x] Result Page และ Share Result ใช้ผลจาก engine จริง
- [x] Dataset validation รันอัตโนมัติก่อน production build
- [x] Deterministic engine verification script
- [x] Balance simulation แบบ deterministic จำนวน `10,000` ชุด
- [x] Visual/manual QA ใน browser viewports เป้าหมาย
- [x] ปรับ weights จาก feedback ของผู้ทดสอบจริง

คำสั่งที่เกี่ยวข้อง:

```bash
pnpm validate:data
pnpm verify:engine
pnpm simulate:balance
pnpm build
```

ผล simulation baseline วันที่ 21 สิงหาคม 2026:

- Vision ที่ชนะบ่อยที่สุดคือ Cryo `20.21%`; ต่ำที่สุดคือ Hydro `9.16%`
- ทุก Vision สามารถขึ้นอันดับหนึ่งได้ และไม่มี Vision เกินเกณฑ์เฝ้าระวัง `30%`
- ตัวละครที่ชนะบ่อยที่สุดคือ Venti `4.25%`; ไม่มีตัวละครเกินเกณฑ์เฝ้าระวัง `8–10%`
- มี `1/125` ตัวละครที่ไม่ติด Top 3 ใน random simulation (`kujou_sara`) จึงควรติดตามในการปรับ balance รอบถัดไป

## 1. Processing Flow

```text
คำตอบ 24 ข้อ
    ↓
ตรวจความครบถ้วนและ dataset version
    ↓
รวมคะแนนดิบ
    ↓
Normalize dimensions และ traits
    ↓
User Personality Profile
    ├── Character Matching
    └── Vision Affinity
    ↓
สร้างคำอธิบายและผลลัพธ์สำหรับ UI
```

Character Match และ Vision Affinity ต้องใช้ User Profile เดียวกันแต่คำนวณแยกกัน ห้ามใช้ธาตุของตัวละครที่ชนะเป็น Vision ของผู้ใช้

## 2. Input Contract

```ts
interface CalculateQuizInput {
  answers: Record<QuestionId, AnswerId>;
  questionVersion: string;
  algorithmVersion: string;
}
```

กติกา:

- ผลลัพธ์จริงต้องตอบครบ 24 ข้อ
- Question ID และ Answer ID ต้องอยู่ใน dataset ปัจจุบัน
- ห้ามใช้ข้อความคำตอบเป็น identifier
- ถ้าข้อมูลใน `localStorage` เป็น version เก่าและ migrate ไม่ได้ ให้เริ่มใหม่
- Engine ต้องไม่แก้ input เดิม
- คำตอบชุดเดิมและ algorithm version เดิมต้องได้ผลเหมือนเดิมเสมอ

## 3. Dimension Scoring

มี 6 dimensions:

```text
social
decision
lifestyle
adventure
responsibility
expression
```

| Dimension        | 0                      | 100                     |
| ---------------- | ---------------------- | ----------------------- |
| `social`         | Introverted            | Extroverted             |
| `decision`       | Emotional / values-led | Rational / evidence-led |
| `lifestyle`      | Flexible / spontaneous | Structured / planned    |
| `adventure`      | Cautious               | Adventurous             |
| `responsibility` | Free-spirited          | Duty-driven             |
| `expression`     | Reserved               | Expressive              |

### 3.1 รวมคะแนนดิบ

```ts
rawDimension[d] = sum(selectedAnswer.scores.dimensions[d] ?? 0);
```

### 3.2 หา theoretical range

คำถามหนึ่งอาจให้คะแนนหลาย dimensions จึงไม่ควรกำหนดช่วงตายตัวเป็น `-12 ถึง +12` สำหรับทุก dimension

```ts
minPossible[d] = sum(min(answerScoreForDimension) ของทุกคำถาม);
maxPossible[d] = sum(max(answerScoreForDimension) ของทุกคำถาม);
```

คำตอบที่ไม่ระบุ dimension นั้นถือเป็น `0`

### 3.3 Normalize เป็น 0–100

```ts
normalizedDimension =
  ((rawScore - minPossible) / (maxPossible - minPossible)) * 100;

dimensionScore = clamp(round(normalizedDimension), 0, 100);
```

ถ้า `minPossible === maxPossible` ให้ dataset validation fail แทนการเดาคะแนน

## 4. Trait Scoring

Traits ในคำถามปัจจุบันให้เฉพาะคะแนนบวก เช่น `0.1–0.3` จึงตีความเป็นหลักฐานสนับสนุน trait ไม่ใช่แกนตรงข้ามแบบ dimensions

### 4.1 รวมคะแนนดิบ

```ts
rawTrait[t] = sum(selectedAnswer.scores.traits[t] ?? 0);
```

### 4.2 Normalize ตามโอกาสได้รับคะแนน

```ts
maxPossibleTrait[t] = sum(max(answerTraitScore) ของทุกคำถาม);
normalizedTrait[t] = rawTrait[t] / maxPossibleTrait[t];
traitScore = clamp(roundTo4Decimals(normalizedTrait), 0, 1);
```

### 4.3 Trait coverage blocker

ก่อนทำ Vision Engine ต้องตรวจว่า trait ทุกตัวที่ Element Profiles ใช้สามารถได้คะแนนจากคำถามจริง

จากการตรวจเบื้องต้น defining traits หลายตัวอาจยังไม่มี score mapping โดยตรง เช่น:

```text
passion
determination
optimism
individuality
selfDevelopment
innerConflict
contradiction
identity
resolve
```

ถ้าไม่แก้ ผู้ใช้จะไม่มีทางได้คะแนน traits เหล่านี้และ Vision บางธาตุจะเสียเปรียบโดยโครงสร้าง

เกณฑ์เบื้องต้น:

- Element trait ทุกตัวต้องมี `maxPossibleTrait > 0`
- Primary trait ของแต่ละธาตุควรมีหลักฐานจากอย่างน้อย 2 คำถาม
- ห้ามสร้าง trait จาก dimension แบบแฝงจนกว่าจะกำหนด mapping อย่างชัดเจน

## 5. User Personality Profile

```ts
interface UserPersonalityProfile {
  dimensions: Record<DimensionId, number>; // 0–100
  traits: Record<TraitId, number>; // 0–1
}
```

ตัวอย่าง:

```json
{
  "dimensions": {
    "social": 72,
    "decision": 43,
    "lifestyle": 61,
    "adventure": 77,
    "responsibility": 68,
    "expression": 81
  },
  "traits": {
    "creativity": 0.84,
    "confidence": 0.73,
    "empathy": 0.65,
    "freedom": 0.58
  }
}
```

## 6. Character Matching

### 6.1 น้ำหนักเริ่มต้น

```text
Dimension similarity  70%
Trait similarity      30%
```

V1 ใช้ทุก dimension น้ำหนักเท่ากันก่อน แล้วจึงปรับจากผล simulation

```ts
dimensionWeights = {
  social: 1,
  decision: 1,
  lifestyle: 1,
  adventure: 1,
  responsibility: 1,
  expression: 1,
};
```

### 6.2 Dimension similarity

ใช้ weighted mean absolute distance เพื่อให้สูตรอธิบายง่ายและไม่ให้ความต่างขนาดใหญ่ของ dimension เดียวครอบงำมากเกินไป

```ts
dimensionDistance = weightedMean(
  abs(userDimension[d] - characterDimension[d]) / 100,
);

dimensionSimilarity = 1 - dimensionDistance;
```

### 6.3 Trait similarity

Character profiles เป็น sparse traits จึงเปรียบเทียบเฉพาะ traits ที่ตัวละครกำหนดไว้ แต่เพิ่ม coverage factor เพื่อไม่ให้ profile ที่มี traits น้อยได้เปรียบ

```ts
traitSimilarity = weightedMean(
  1 - abs(userTrait[t] - characterTrait[t]),
  (weight = characterTrait[t]),
);

coverageFactor = min(characterTraitCount / targetTraitCount, 1);
adjustedTraitSimilarity = traitSimilarity * (0.85 + 0.15 * coverageFactor);
```

ค่าเริ่มต้น:

```ts
targetTraitCount = 5;
```

หาก validation ยืนยันว่าทุก profile มีจำนวน traits เท่ากัน สามารถตัด coverage factor ออกได้

### 6.4 Final Character Score

```ts
rawCharacterSimilarity =
  dimensionSimilarity * 0.7 + adjustedTraitSimilarity * 0.3;

compatibility = clamp(round(rawCharacterSimilarity * 100), 0, 100);
```

ไม่ควรบังคับให้ผู้ชนะต้องได้เปอร์เซ็นต์ขั้นต่ำ เพราะจะทำให้ตัวเลขไม่สะท้อน similarity จริง

## 7. Character Tie-break

เรียงตามลำดับ:

1. Final similarity มากกว่า
2. Dimension similarity มากกว่า
3. Trait similarity มากกว่า
4. จำนวน matching traits มากกว่า
5. `characterId` แบบ ascending

ต้องใช้ค่าความละเอียดเต็มในการ sort ห้ามใช้เปอร์เซ็นต์ที่ปัดเศษแล้ว การใช้ `characterId` เป็นขั้นสุดท้ายทำให้ผลไม่ขึ้นกับลำดับไฟล์หรือ async loading

## 8. Matching Traits

```ts
traitMatchScore = 1 - abs(userTrait[t] - characterTrait[t]);
```

ถือว่าเป็น matching trait เมื่อ:

```text
user trait >= 0.50
character trait >= 0.50
trait match score >= 0.75
```

เลือกสูงสุด 3 traits โดยเรียงตาม:

1. Match score
2. Character trait weight
3. Trait ID

ถ้าได้ไม่ครบ 2 traits ให้ใช้ dominant dimensions สร้างคำอธิบาย fallback

## 9. Vision Affinity

Vision ใช้เฉพาะ normalized traits และ Element Personality Profile ไม่ใช้คะแนน Character Match

### 9.1 Weighted affinity

```ts
visionRawScore = sum(userTrait[t] * elementWeight[t]) / sum(elementWeight[t]);
```

ตัวอย่าง Pyro:

```ts
pyro =
  (passion * 1.0 +
    enthusiasm * 0.7 +
    selfExpression * 0.8 +
    determination * 0.6 +
    optimism * 0.4) /
  3.5;
```

### 9.2 Primary trait emphasis

เพิ่ม primary-trait gate แบบอ่อนเพื่อให้ defining trait มีความหมาย โดยไม่ทำลายคะแนนจาก secondary traits

```ts
primaryFactor = 0.85 + userPrimaryTrait * 0.15;
adjustedVisionScore = visionRawScore * primaryFactor;
```

Factor อยู่ระหว่าง `0.85–1.00`

### 9.3 แปลงเป็นเปอร์เซ็นต์

```ts
affinity = clamp(round(adjustedVisionScore * 100), 0, 100);
```

แสดงครบทั้ง 7 ธาตุ โดยอันดับแรกเป็น Primary Vision

## 10. Vision Tie-break

เรียงตาม:

1. Adjusted Vision Score
2. Primary trait score
3. Weighted secondary-trait score
4. Element ID ตาม canonical order

Canonical order สำหรับ tie-break ขั้นสุดท้าย:

```text
pyro
hydro
anemo
electro
dendro
cryo
geo
```

ลำดับนี้ใช้เฉพาะกรณีค่าทุกอย่างเท่ากัน ไม่ใช่น้ำหนักแฝงของธาตุ

## 11. Incomplete and Invalid Answers

### คำตอบไม่ครบ

- อนุญาตให้สร้าง preview profile ระหว่างทำ Quiz ได้
- ห้ามสร้าง final Character/Vision result
- `/matching` ต้อง redirect กลับข้อแรกที่ยังไม่ตอบ

### ID ไม่ถูกต้อง

- ปฏิเสธการคำนวณ
- ล้างเฉพาะ progress ที่ incompatible
- ห้ามข้ามคำตอบผิดแล้วคำนวณต่อเงียบ ๆ

### Dataset version เปลี่ยน

```ts
interface QuizProgressState {
  version: 2;
  questionVersion: string;
  algorithmVersion: string;
  answers: Record<string, string>;
}
```

ถ้าคำถามเดิมยังมี Question ID และ Answer ID เดิมครบ สามารถ migrate ได้ มิฉะนั้นให้แจ้งผู้ใช้และเริ่มใหม่

## 12. Result Contract

```ts
interface QuizResult {
  resultVersion: string;
  questionVersion: string;
  algorithmVersion: string;
  profile: UserPersonalityProfile;
  characterMatches: CharacterMatchResult[];
  visionMatches: VisionMatchResult[];
  completedAt: string;
}
```

เก็บอย่างน้อย:

- Character matches Top 4
- Vision affinities ครบ 7
- User profile
- Matching traits
- ค่าดิบแบบไม่ปัดเศษสำหรับ sort
- ค่าที่ปัดเศษแล้วสำหรับ UI

ไม่ควรเก็บข้อความแปลลง result state ให้เก็บ IDs แล้ว resolve locale ตอน render เพื่อให้สลับภาษาแล้วผลไม่เปลี่ยน

## 13. Deterministic Verification Cases

ยังไม่ต้องเพิ่ม test framework สามารถสร้าง verification script ที่รันด้วย Node ได้

1. เลือกคำตอบ extroverted ทุกข้อที่เกี่ยวข้องแล้ว `social > 50`
2. เลือกคำตอบ introverted แล้ว `social < 50`
3. คำตอบ structured แล้ว `lifestyle > 50`
4. คำตอบ flexible แล้ว `lifestyle < 50`
5. ทุก dimension อยู่ใน `0–100`
6. ทุก trait อยู่ใน `0–1`
7. Compatibility และ Affinity อยู่ใน `0–100`
8. คำตอบชุดเดิมให้ผลและอันดับเดิม
9. สลับลำดับไฟล์ profile แล้วผลไม่เปลี่ยน
10. Character Match ไม่เปลี่ยนตาม element ของตัวละคร
11. Vision ไม่เปลี่ยนตาม Character ที่ชนะ
12. Tie-break ให้ผลคงที่
13. คำตอบไม่ครบไม่สร้าง final result
14. Unknown question หรือ answer ID ถูกปฏิเสธ
15. Element ทั้ง 7 สามารถขึ้นอันดับหนึ่งได้จากคำตอบจำลอง
16. ไม่มีตัวละครเดียวชนะเกินสัดส่วนที่กำหนดในการ simulation

## 14. Balance Simulation

สร้างชุดคำตอบอย่างน้อย:

```text
Random profiles       10,000 ชุด
Extreme profiles          12 ชุด
Balanced profiles         20 ชุด
Hand-crafted personas     20 ชุด
```

รายงาน:

- อัตราชนะของตัวละครแต่ละตัว
- อัตราชนะของแต่ละ Vision
- คะแนนเฉลี่ยและการกระจาย
- ตัวละครที่ไม่เคยติด Top 3
- ตัวละครที่ชนะบ่อยผิดปกติ
- คู่ตัวละครที่ได้คะแนนแทบเหมือนกันเสมอ
- ธาตุที่แทบไม่เคยชนะ
- Traits ที่ไม่มีผลต่อผลลัพธ์จริง

เกณฑ์เริ่มต้น:

- ไม่มี Vision ใดชนะเกินประมาณ 30%
- ทุก Vision ต้องมีโอกาสชนะ
- ไม่มีตัวละครเดียวชนะเกินประมาณ 8–10% ของ random profiles
- ต้องไม่มีตัวละครที่ผลเหมือนกันทุกกรณีเพราะ profile ซ้ำ

เกณฑ์นี้ใช้เป็นสัญญาณตรวจสอบ ไม่ใช่การบังคับ distribution ให้เท่ากันทั้งหมด

## 15. Implementation Order

1. [x] Audit trait coverage ของคำถาม
2. [x] เติม score mapping ของ Element traits ที่ขาด
3. [x] เพิ่ม Element/Profile/Data schemas
4. [x] สร้าง dataset validation script
5. [x] Implement dimension normalization
6. [x] Implement trait normalization
7. [x] Implement Character Matching
8. [x] Implement Vision Affinity
9. [x] Implement deterministic tie-break
10. [x] สร้าง verification cases
11. [x] สร้าง balance simulation report
12. [ ] ตรวจและปรับ weights จากผู้ทดสอบจริง
13. [x] เชื่อม `/matching`
14. [x] เปลี่ยน `/result` จาก mock เป็นผลจริง
15. [x] เชื่อม Share Result กับ result version
16. [ ] ทดสอบ visual flow, refresh, resume และ locale switching ใน browser
17. [x] อัปเดต Development Plan และสถานะ checklist

## Definition of Done

ถือว่า Calculation Engine พร้อมเชื่อม UI เมื่อ:

- Dataset validation ผ่าน
- คำถามตอบครบแล้วคำนวณผลได้
- Traits ของ Element Profiles มี coverage ครบ
- Character และ Vision คำนวณแยกจากกัน
- คะแนนทุกชนิดอยู่ในช่วงที่กำหนด
- Tie-break deterministic
- Verification cases ผ่านทั้งหมด
- Random simulation ไม่มีผลลัพธ์กระจุกแบบผิดปกติ
- Result เดิมยังคงเดิมหลัง refresh และสลับภาษา
- Production build ผ่าน
