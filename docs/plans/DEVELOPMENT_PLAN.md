# Teyvat Personalities — Development Plan

แผนพัฒนาเว็บ Quiz จับคู่บุคลิกของผู้ใช้กับตัวละครจาก Genshin Impact โดยอ้างอิงประสบการณ์การเล่น Quiz จาก OOOPEN Lab และแนวทาง UI ที่เรียบหรูแบบ HoYoLAB

เวอร์ชันแรกประกอบด้วยผลลัพธ์สองระบบที่คำนวณแยกจากกัน:

1. **Character Match** — ตัวละครที่มีโปรไฟล์บุคลิกใกล้เคียงผู้ใช้
2. **Vision Affinity** — ธาตุหรือ Vision ที่สอดคล้องกับบุคลิกผู้ใช้

ระบบรองรับภาษาไทยและอังกฤษตั้งแต่โครงสร้างข้อมูลและ UI โดยภาษาไทยเป็นภาษาเริ่มต้น

## Implementation Status

อัปเดตล่าสุด: 21 สิงหาคม 2026

### UI Prototype — Completed

- [x] Theme tokens, typography, spacing, cards, buttons และ responsive breakpoints พื้นฐาน
- [x] Shared components: `AppHeader`, `AppFooter`, `PageContainer`, `ContentCard`, `Button` และ `ElementBadge`
- [x] Landing Page พร้อม CTA และคำอธิบาย Character Match / Vision Affinity
- [x] Quiz Page shell สำหรับ 24 คำถาม พร้อม Progress, Answer states, Back/Next และ Result navigation
- [x] Result Page prototype พร้อม Character Result, Trait summary และ Vision Affinity card
- [x] Typed mock data แยกจาก UI components
- [x] ภาษาไทยและอังกฤษ พร้อม Language Switcher และบันทึก locale ใน `localStorage`
- [x] Responsive layout, keyboard focus states และ `prefers-reduced-motion`
- [x] Hash-based routes สำหรับ `/`, `/quiz` และ `/result`
- [x] Quiz persistence: บันทึกคำตอบและข้อปัจจุบันใน `localStorage`
- [x] Resume Quiz และ Reset Confirmation
- [x] Matching transition state ก่อนเปิด Result Page
- [x] Character Detail placeholder route `/characters/:slug`
- [x] Character Detail เชื่อม Character Master Data จริงตาม `slug` พร้อม fallback สำหรับค่าที่ขาด
- [x] แยก Page components เป็นรายไฟล์และแยก locale resources ไทย/อังกฤษ
- [x] Unknown character และ missing factual field states
- [x] UI states พื้นฐานสำหรับ 404, mock-data notice และ factual-data notice
- [x] Production build และ ESLint สำหรับ `src/` ผ่าน
- [x] Character Directory `/characters` พร้อมค้นหาและกรอง Region, Element และ Rarity
- [x] Lazy-load factual JSON รายตัวละคร พร้อม loading และ unknown-character states
- [x] ลด initial JavaScript bundle โดยแยก Character Master Data เป็น chunks รายตัวละคร
- [x] Share Result modal พร้อม Share Card preview สัดส่วน `1:1`
- [x] Copy Link, Copy Summary และ Web Share API พร้อม clipboard fallback
- [x] ดาวน์โหลด Share Card prototype เป็น PNG ขนาด `1080 × 1080` ผ่าน Canvas
- [x] Shareable mock-result URL ที่อ่านและ validate Character / Vision identifiers จาก hash route
- [x] Invalid shared-result parameter state และ shared-link notice
- [x] Result/Share components รองรับ `artworkUrl` พร้อม letter fallback เมื่อยังไม่มีภาพ
- [x] Skip link และ route-change focus management
- [x] Dialog accessibility: focus trap, Escape key และคืน focus ให้ trigger
- [x] Quiz screen-reader announcements พร้อม `radiogroup` / `radio` semantics
- [x] Semantic progressbar พร้อม current/total values
- [x] Reduced-motion mode หยุด decorative animations

### Prototype Limitations / Next Integration

- [x] แทนที่คำถาม placeholder ด้วยคำถามสถานการณ์จริง 24 ข้อ พร้อม dimension/trait score mapping
- [ ] เชื่อม Character Matching Engine และ Vision Affinity Engine
- [ ] เชื่อมข้อมูล Character Personality และ Element Personality จริง
- [ ] แทนที่ Matching transition prototype ด้วย animation และข้อความลำดับสุดท้าย
- [ ] กำหนดแหล่ง artwork และ licensing rule ก่อนเชื่อมภาพจริงกับ Result/PNG export
- [ ] เพิ่ม QR code บน Share Card ในระยะถัดไป
- [ ] เพิ่ม image loading และ missing image states เมื่อเริ่มใช้ asset จริง
- [ ] ตรวจ visual layout ใน browser viewports ตาม QA checklist

ผลลัพธ์ที่แสดงในหน้า prototype เป็น mock result และต้องมีข้อความกำกับจนกว่าจะเชื่อม Engine จริง

## Data Gaps After Character Personality Completion

> Character Personality Profiles ครบทุกตัวละครแล้ว ส่วนนี้ระบุข้อมูลและ data contract ที่ยังต้องมีเพื่อให้ Quiz คำนวณผลจริงได้ โดยไม่รวมงาน UI prototype ที่ทำเสร็จแล้ว

### P0 — Data blockers สำหรับ Quiz จริง — Implemented

#### 1. Canonical character index

- [x] ใช้ `src/data/characters/_characters.json` เป็น canonical index และปรับ Character repository ให้ใช้ชื่อนี้
- [x] ตรวจ id coverage ระหว่าง factual data, lore และ character personality profiles ครบ `125/125`
- [x] ปรับ Character importer plan ให้ใช้ชื่อ canonical เดียวกัน และกำหนด validation ของ `{ id, name }` / id ซ้ำ

ต้องมี character index เพียงแหล่งเดียวที่ repository, เอกสาร และ importer ใช้อ้างอิงตรงกัน

- ใช้ `src/data/characters/_characters.json` เป็นชื่อ canonical แล้ว; repository และเอกสารหลักถูกปรับให้ตรงกัน
- Character importer plan อ้าง `src/data/characters/_characters.json` แล้ว และกำหนดให้ตรวจ `{ id, name }` ที่ไม่ว่างกับ id ที่ไม่ซ้ำก่อน import

#### 2. Situational question dataset พร้อม score mapping

- [x] เพิ่มคำถามสถานการณ์สองภาษา `24` ข้อ และ score mapping ทุกตัวเลือกใน `src/data/quiz/questions.ts`
- [x] กำหนด `DimensionId` และ `TraitId` แบบ type-safe เพื่อป้องกัน reference ที่ไม่รู้จัก

ต้องแทนที่ mock questions ด้วยข้อมูลจริงจำนวน `24` ข้อ โดยแต่ละข้อมี:

```ts
interface ScoredQuizQuestion {
  id: string;
  prompt: { th: string; en: string };
  answers: Array<{
    id: string;
    label: { th: string; en: string };
    scores: {
      dimensions: Partial<Record<DimensionId, number>>;
      traits: Partial<Record<TraitId, number>>;
    };
  }>;
}
```

ข้อกำหนดข้อมูล:

- คำถามต้องเป็นสถานการณ์ ไม่ถามบุคลิกตรง ๆ
- แต่ละคำตอบปรับได้หลาย dimension และ trait
- ครอบคลุมทั้ง 6 dimensions อย่างสมดุล (เป้าหมายเริ่มต้นประมาณ 4 ข้อต่อ dimension)
- ต้องมีทั้งภาษาไทยและอังกฤษ โดยเก็บคำตอบด้วย id เพื่อสลับภาษาได้โดยคะแนนไม่เปลี่ยน
- ต้องตรวจว่าทุก `DimensionId` และ `TraitId` ที่อ้างถึงมีอยู่จริง

#### 3. Trait catalog สำหรับผลลัพธ์และ localization

- [x] เพิ่ม trait catalog กลาง `39` traits พร้อม label/description ไทย–อังกฤษ
- [x] ตรวจ trait references ของ element profiles และ character profiles ว่าอยู่ใน catalog ทั้งหมด

ต้องมี registry กลางของ trait ที่เป็น canonical เพื่อเชื่อมสามส่วนเข้าด้วยกัน: คำถาม, character profiles และ element profiles

```ts
interface TraitDefinition {
  id: string;
  label: { th: string; en: string };
  description?: { th: string; en: string };
}
```

อย่างน้อยต้องครอบคลุม trait ใน `element-personalities.json` และ trait ที่ character profiles ใช้จริง เช่น `ideals`, `selfExpression`, `selfDevelopment`, `reliability` และ `curiosity` เพื่อให้แสดง Matching Traits เป็นสองภาษาได้อย่างสม่ำเสมอ

#### 4. Result interpretation content

- [x] เพิ่ม fallback result titles ตาม dominant dimension
- [x] เพิ่ม Vision interpretation templates ไทย–อังกฤษครบทั้ง 7 ธาตุ

profile คะแนนอย่างเดียวบอกอันดับได้ แต่ยังไม่เพียงพอสำหรับหน้าผลลัพธ์ที่อธิบายเหตุผลของ match ตาม Product Direction

ต้องกำหนดข้อมูลหรือ template ที่ให้ผลลัพธ์สร้าง:

- Character Match explanation ภาษาไทย/อังกฤษ โดยอิง dimensions และ matching traits ที่สูงสุด
- Vision Affinity explanation สำหรับทั้ง 7 ธาตุ
- ชื่อผลลัพธ์ (result title) และ fallback เมื่อไม่มีข้อความเฉพาะตัวละคร
- labels สำหรับ matching traits และ different traits

ข้อความตีความต้องอยู่แยกจาก Character Master Data และต้องระบุว่าเป็น fan-made interpretation

### P1 — Data quality และ presentation data

#### 5. Factual character fields ที่ยังไม่มีค่า — Implemented

ค่าที่เป็น `null` ต้องมี fallback ใน UI และอยู่ใน missing-data report จนกว่าจะมีแหล่งอ้างอิงที่เชื่อถือได้:

- [x] Character Detail มี fallback สำหรับ factual field ที่ไม่มีค่า
- [x] สร้างและปรับ `src/data/characters/_missing-data-report.md` ให้เหลือเฉพาะ factual gap ที่ตรวจสอบได้

| Field | Characters |
| --- | --- |
| `region` | Aloy, Nicole, Skirk |

Traveler ทั้ง 7 variant มี `title`, `titleTh` และ `descriptionTh` แล้ว ส่วน `birthday` เป็นค่าที่ผู้เล่นเลือก และ `gender` ขึ้นกับ Aether/Lumine จึงคง `null` เป็น dynamic factual fields ที่ตั้งใจไว้ ไม่ใช่ missing data

ห้ามเดาค่าทาง factual เพื่อปิดช่องว่างเหล่านี้

#### 6. Character artwork manifest และ licensing metadata — Manifest implemented, licensing pending

Result Page และ Share Card รองรับ `artworkUrl`; มี manifest สำหรับภาพ head/full ที่อยู่ใน `src/assets/images/characters` แล้ว แต่ไม่มี provenance หรือ license metadata ที่ยืนยันได้

- [x] เพิ่ม artwork manifest ที่แยก variant `head` / `full`, URL และ alt text ไทย–อังกฤษ
- [x] เพิ่ม coverage/licensing report สำหรับ asset ที่มีและที่ขาด
- [ ] บันทึก original source และ license/usage permission ต่อภาพ แล้วอนุญาตใช้ใน UI และ Share Card

ต้องกำหนดต่อภาพหนึ่งรายการอย่างน้อย:

```ts
interface CharacterArtwork {
  characterId: string;
  url: string;
  alt: { th: string; en: string };
  source: string;
  licenseOrUsageNote: string;
}
```

ก่อนเพิ่มภาพจริง ต้องยืนยัน source, สิทธิ์การใช้, fallback เมื่อภาพหาย และความเหมาะสมของภาพสำหรับ Share Card ขนาด `1080 × 1080`

#### 7. Dataset validation report

ต้องมี script/report แบบ read-only ที่ตรวจอย่างน้อย:

- JSON และ schema ของ factual character, lore, character profile, element profile และ questions
- id coverage ระหว่าง index, factual data, lore และ profiles
- ช่วงคะแนน personality (`0–100`) และ trait weight (`0–1`)
- trait references และ element references ที่ไม่รู้จัก
- key localization ที่ขาดใน TH/EN
- duplicate id, duplicate question id และ duplicate answer id

### Data-definition decisions ที่ต้องล็อกก่อนเชื่อม Engine

- สูตร normalize คะแนนคำตอบเป็น User Personality Profile
- น้ำหนักของแต่ละ dimension ใน Character Matching
- สูตรแปลง similarity/distance เป็น Compatibility `0–100`
- tie-break ที่คงที่และไม่ขึ้นกับลำดับไฟล์
- วิธี normalize trait scores ก่อนเทียบ Element Personality Profiles
- policy สำหรับคำตอบไม่ครบ, dataset version และการ restore progress เก่าใน `localStorage`

### Documentation alignment

ก่อนเริ่ม integration ต้องอัปเดตเอกสารให้ใช้ schema และ file layout เดียวกัน:

- `README.md` และ `docs/scope.md` ยังนิยาม `lifestyle` แบบเดิม; ค่าที่อนุมัติคือ `0 = spontaneous/flexible`, `100 = structured/planned`
- `CONTEXT.md`, `README.md` และแผน importer ต้องอ้างชื่อ canonical ของ character index และ directory `src/data/personality/character-personalities/{id}.json`
- เอกสารต้องสะท้อนว่า Firebase User Reports เป็นงานอนาคต ไม่ใช่ dependency ของการคำนวณ Quiz V1

### Definition of ready for Engine integration

- [x] Character index, factual data, lore และ profiles มี id coverage ตรงกัน
- [x] Question dataset 24 ข้อมี score mapping ครบ และมี Zod schema สำหรับตรวจโครงสร้าง
- [x] Trait catalog ครอบคลุม trait reference ทุกจุดและมี TH/EN labels
- [x] Element profiles ครบ 7 ธาตุและไม่มี trait reference ที่ไม่รู้จัก
- [x] Result explanation/translation fallback พร้อมใช้งาน
- [x] Missing factual fields มี UI fallback และรายงานที่ตรวจสอบได้
- [ ] Dataset validation report ผ่านก่อน build และก่อน deploy

## References

- [OOOPEN Lab — คุณเป็นแมว MBTI ประเภทไหน](https://ooopenlab.cc/quiz/HBOilLl8AcGzxCZPmwUc)
- [Atompakon — เกิดใหม่เป็นแมว](https://www.atompakon.co/cats)
- [HoYoLAB](https://www.hoyolab.com/home/timeline)

## Product Direction

แนวทางหลักของระบบ:

> Quiz เล่นง่ายแบบ OOOPEN Lab + Card layout แบบ HoYoLAB + หน้าผลลัพธ์ที่โดดเด่นและแชร์ต่อได้

ระบบควรวางตัวเป็น Quiz เพื่อความบันเทิง ไม่ใช่การประเมินบุคลิกภาพทางจิตวิทยา ผู้เล่นควรเข้าใจคำถามได้รวดเร็ว ตอบได้โดยไม่ต้องคิดนาน และได้รับผลลัพธ์ที่รู้สึกเชื่อมโยงกับตัวเอง

## User Flow

```text
Landing Page
    ↓
คำอธิบาย Quiz
    ↓
เริ่มทำแบบทดสอบ
    ↓
ตอบคำถามทีละข้อ
    ↓
Matching Animation
    ↓
Character Result
    ├── Vision Affinity
    ├── แชร์ผลลัพธ์
    ├── ดูตัวละครใกล้เคียง
    └── ทำแบบทดสอบใหม่
```

## Phase 1: Project Foundation

### เป้าหมาย

เตรียมโครงสร้างโปรเจกต์และตรวจสอบข้อมูลทั้งหมดก่อนเริ่มสร้าง UI

### งานที่ต้องทำ

- สร้าง Vite + React + TypeScript
- ติดตั้ง Tailwind CSS v4
- เพิ่ม shadcn/ui และ lucide-react
- กำหนด Theme variables
- สร้าง TypeScript types
- สร้าง Zod schemas
- Validate ข้อมูล JSON
- กำหนด Routing
- เตรียมการบันทึกข้อมูลด้วย `localStorage`
- เตรียมโครงสร้าง localization สำหรับภาษาไทยและอังกฤษ

### Routes

```text
/
/quiz
/result
/characters/:slug
```

### Deliverables

- โปรเจกต์เปิดใช้งานได้
- ข้อมูล JSON ผ่านการ Validate
- มี Layout และ Theme พื้นฐาน

## Phase 2: Design System

### Color Palette

พื้นหลัง:

```text
#F4F6FA
#EEF1F6
```

Card:

```text
#FFFFFF
```

ข้อความ:

```text
Primary:   #2B2E34
Secondary: #7B8190
```

Accent:

```text
Gold:      #C8A96A
Deep Blue: #3E5778
```

Element colors:

```text
Anemo:   #74C2A8
Geo:     #D3A94C
Electro: #A885D8
Dendro:  #89A94F
Hydro:   #4F9EDA
Pyro:    #E56B5D
Cryo:    #8EC8D8
```

### UI Style

- พื้นหลังสีเทาอมฟ้าสว่าง
- Card สีขาว
- Border บางและ Shadow อ่อน
- มุมโค้งประมาณ `16–20px`
- ใช้สีทองเฉพาะจุดสำคัญ
- ไม่ใช้ Gradient มากเกินไป
- ใช้รูปตัวละครเป็น Visual หลัก
- Desktop มีพื้นที่ว่างรอบ Content
- Mobile แสดง Content แบบเต็มความกว้าง

### Shared Components

```text
AppHeader
PageContainer
ContentCard
PrimaryButton
SecondaryButton
QuizProgress
AnswerOption
CharacterAvatar
CharacterCard
ElementBadge
RegionBadge
TraitBar
ResultCard
ShareButton
```

## Phase 3: Landing Page

Landing Page ควรสร้างความอยากเล่นโดยไม่ใส่ข้อมูลมากเกินไป

### Sections

1. Header
2. Hero section
3. Character artwork หรือ Region-inspired background
4. ชื่อ Quiz
5. คำอธิบายสั้น
6. จำนวนคำถามและเวลาโดยประมาณ
7. ปุ่มเริ่มทำแบบทดสอบ
8. ข้อความว่าเป็น Quiz เพื่อความบันเทิง
9. Footer และ Disclaimer

### ตัวอย่างข้อความ

```text
ตัวละครคนไหนใน Teyvat ที่มีบุคลิกเหมือนคุณมากที่สุด?

ตอบคำถามเกี่ยวกับความคิด การตัดสินใจ และการใช้ชีวิต
เพื่อค้นหาตัวละครที่สะท้อนตัวตนของคุณ
```

ข้อมูลใต้ปุ่ม:

```text
ประมาณ 3–5 นาที · ไม่มีคำตอบที่ถูกหรือผิด
```

## Phase 4: Quiz Page

### Layout

```text
Header

Question 08 / 24
Progress 33%

┌──────────────────────────────┐
│ คำถาม                       │
│                              │
│ ○ ตัวเลือกที่หนึ่ง           │
│ ○ ตัวเลือกที่สอง             │
│ ○ ตัวเลือกที่สาม             │
│ ○ ตัวเลือกที่สี่             │
└──────────────────────────────┘

ย้อนกลับ                    ถัดไป
```

### Behavior

- แสดงคำถามทีละข้อ
- บันทึกคำตอบทันที
- ย้อนกลับไปแก้คำตอบได้
- แสดง Progress ชัดเจน
- Answer Card ทั้งใบสามารถกดได้
- แสดง Selected state ด้วย Border และ Background
- รองรับ Keyboard navigation
- บันทึกความคืบหน้าลง `localStorage`
- กลับมาทำต่อหลัง Refresh หรือปิดเว็บได้
- แสดง Confirmation ก่อนเริ่ม Quiz ใหม่

### Mobile

- ตรึง Progress ไว้ด้านบน
- ปุ่มถัดไปอยู่ด้านล่าง
- Answer Card สูงอย่างน้อย `52px`
- หลีกเลี่ยงการ Scroll มากเกินไปในหนึ่งคำถาม

## Phase 5: Matching Engine

แยก Engine ออกจาก React Components เพื่อให้ทดสอบและปรับ Logic ได้ง่าย

```text
src/engine/
├── calculateTraitScores.ts
├── normalizeScores.ts
├── calculateCompatibility.ts
├── rankCharacters.ts
└── generateResult.ts
```

### Processing Flow

```text
Answers
   ↓
Trait Scores
   ↓
Normalize
   ↓
Compare Character Profiles
   ↓
Calculate Compatibility
   ↓
Rank Characters
   ↓
Return Top Matches
```

### Result Models

```ts
interface QuizResult {
  primaryMatch: CharacterMatch;
  secondaryMatches: CharacterMatch[];
  traitScores: Record<string, number>;
  completedAt: string;
}

interface CharacterMatch {
  characterId: string;
  compatibility: number;
  matchingTraits: string[];
  differentTraits: string[];
}
```

ควรเตรียมกรณีตรวจสอบของ Matching Engine ก่อนนำไปเชื่อมกับ UI

ในเวอร์ชันแรกยังไม่เพิ่ม Test Framework ตามข้อจำกัดทางเทคนิคของโปรเจกต์ แต่ต้องออกแบบ Engine เป็น Pure Functions และเตรียมชุดข้อมูลตัวอย่างสำหรับตรวจสอบผลลัพธ์แบบ Deterministic โดยครอบคลุมอย่างน้อย:

- คำตอบชุดเดิมต้องได้ผลลัพธ์เดิม
- Compatibility ต้องอยู่ในช่วง `0–100`
- Tie-break ต้องให้ผลคงที่
- Character Ranking ต้องไม่ขึ้นกับลำดับข้อมูลต้นทาง
- ข้อมูลที่ไม่ผ่าน Schema ต้องถูกปฏิเสธ

เมื่อโปรเจกต์เข้าสู่ระยะที่อนุญาตให้เพิ่ม Test Framework จึงย้ายกรณีตรวจสอบเหล่านี้เป็น Unit Tests โดยไม่ต้องแก้โครงสร้าง Engine

## Phase 6: Vision Affinity Engine

Vision Affinity เป็นระบบแยกจาก Character Matching โดยใช้ User Personality Profile ชุดเดียวกัน แต่เปรียบเทียบกับ Weighted Trait Profile ของแต่ละธาตุ

ห้ามกำหนด Vision ของผู้ใช้จาก Element ของตัวละครที่จับคู่ได้ เช่น ผู้ใช้ที่ Match กับตัวละคร Hydro ไม่จำเป็นต้องได้ Hydro Vision

```text
User Personality Profile
   ↓
Element Weighted Trait Profiles
   ↓
Calculate Vision Affinity
   ↓
Rank Seven Elements
   ↓
Return Primary Vision + Secondary Affinities
```

### Result Model

```ts
interface VisionAffinityResult {
  primaryVision: VisionMatch;
  secondaryVisions: VisionMatch[];
}

interface VisionMatch {
  elementId: string;
  affinity: number;
  matchingTraits: string[];
  explanationKey: string;
}
```

Engine ต้องเป็น Data-driven และอ่านค่าน้ำหนักจาก Element Personality Profiles ห้ามเขียนเงื่อนไขเฉพาะแบบ hardcode ว่าคำตอบหนึ่งต้องได้ธาตุใดโดยตรง

## Phase 7: Matching Animation

หลังตอบข้อสุดท้าย ให้แสดง Transition ประมาณ `1.5–2.5 วินาที` ก่อนเปิดเผยผลลัพธ์

### ตัวอย่างข้อความ

```text
กำลังวิเคราะห์บุคลิกของคุณ...
กำลังค้นหาผู้ที่มีเส้นทางคล้ายกัน...
พบเสียงสะท้อนจาก Teyvat แล้ว
```

### Animation ที่เหมาะสม

- Element particles แบบจาง
- วงแหวนหมุนช้า
- ดาวหรือแสงเคลื่อนเล็กน้อย
- Fade ระหว่างข้อความ
- Character silhouette ก่อน Reveal

### Animation ที่ควรหลีกเลี่ยง

- Animation เต็มหน้าจอที่ยาวเกินไป
- Particle จำนวนมาก
- Video background ขนาดใหญ่
- Animation ที่เล่นตลอดเวลา

แนะนำใช้ `motion` สำหรับ React และกำหนด Transition ส่วนใหญ่อยู่ประมาณ `180–350ms`

ต้องรองรับ `prefers-reduced-motion`

## Phase 8: Result Page

Result Page เป็นหน้าที่ควรลงทุนด้านงานภาพมากที่สุด เพราะเป็นส่วนที่ผู้เล่นจะจดจำ Screenshot และแชร์

### Main Result

- ภาพตัวละครขนาดใหญ่
- ชื่อตัวละคร
- Region และ Element
- Compatibility Score
- Result title
- คำอธิบายว่าทำไมจึงจับคู่กับตัวละครนี้
- Trait ที่เหมือนกัน
- จุดที่แตกต่าง
- ตัวละครใกล้เคียง
- Vision Affinity พร้อมคำอธิบายว่า Trait ใดสนับสนุนผลลัพธ์
- Secondary Vision Affinities
- ปุ่มแชร์
- ปุ่มทำใหม่

### ตัวอย่าง

```text
ตัวละครที่สะท้อนตัวตนของคุณคือ

NAHIDA

The Gentle Observer
ผู้เฝ้ามองที่เข้าใจผู้คน

Compatibility 92%
```

### Result Summary

ไม่ควรแสดงเฉพาะชื่อและเปอร์เซ็นต์ ควรอธิบายให้ผู้เล่นรู้สึกว่าผลลัพธ์เชื่อมโยงกับตัวเอง

```text
คุณเป็นคนที่ชอบสังเกตและทำความเข้าใจสิ่งต่าง ๆ ก่อนตัดสินใจ
คุณให้ความสำคัญกับความรู้สึกของผู้อื่น แต่ก็พร้อมยืนหยัด
เพื่อสิ่งที่เชื่อว่าถูกต้อง
```

### Secondary Matches

แสดงตัวละครใกล้เคียงอีก 3 ตัว

```text
1. Albedo       87%
2. Neuvillette  83%
3. Furina       79%
```

## Phase 9: Share Result

เตรียม Share Card อัตราส่วน `1:1` เพื่อให้ใช้ได้กับหลายแพลตฟอร์ม

### ข้อมูลบนภาพ

- ชื่อ Quiz
- รูปตัวละคร
- ชื่อตัวละคร
- Compatibility
- Result title
- Trait เด่น 2–3 ข้อ
- Vision Affinity
- URL หรือ QR code ขนาดเล็ก

### Functions

- ดาวน์โหลดภาพ
- Copy Link
- แชร์ผ่าน Web Share API
- ทำแบบทดสอบใหม่

เวอร์ชันแรกสามารถสร้างภาพฝั่ง Browser ด้วย `html-to-image` โดยยังไม่ต้องมี Backend

## Phase 10: Responsive and Accessibility

### Viewports ที่ควรทดสอบ

```text
360px
390px
768px
1024px
1440px
```

### Checklist

- Contrast ของข้อความ
- Keyboard navigation
- Focus state
- Alt text
- Button touch target
- Loading state
- Error state
- Reduced motion
- ภาษาไทยไม่ล้น Card
- ภาษาอังกฤษไม่ล้น Card และไม่ทำให้ Layout เปลี่ยนจนใช้งานไม่ได้
- รูปตัวละครไม่ถูกตัดส่วนสำคัญ

## Phase 11: QA and Deployment

### Automated Verification ก่อนเพิ่ม Test Framework

- คำนวณ Trait ถูกต้อง
- Normalize ถูกต้อง
- Compatibility อยู่ระหว่าง 0–100
- Tie-break ให้ผลคงที่
- คำตอบชุดเดิมได้ตัวละครเดิม
- ข้อมูลผิดโครงสร้างต้องถูกตรวจพบ
- Character Match และ Vision Affinity ต้องคำนวณแยกจากกัน

รายการเหล่านี้ใช้เป็นกรณีตรวจสอบของ Pure Functions ในเวอร์ชันแรก และจะย้ายเป็น Unit Tests เมื่อมีการอนุมัติให้เพิ่ม Test Framework

### Manual Tests

- ทำ Quiz จนครบ
- ย้อนกลับแก้คำตอบ
- Refresh ระหว่างทำ
- กลับมาทำ Quiz ต่อ
- เปิดผลลัพธ์บน Mobile
- สลับภาษาไทยและอังกฤษในทุกหน้า
- ตรวจว่าการสลับภาษาไม่ล้างคำตอบหรือเปลี่ยนผลลัพธ์
- ตรวจ Character Match และ Vision Affinity แยกจากกัน
- ดาวน์โหลด Share Card
- เริ่ม Quiz ใหม่
- ทดสอบกรณีรูปตัวละครโหลดไม่สำเร็จ

### Deployment Flow

```text
GitHub
   ↓
GitHub Actions
   ↓
Build (`pnpm build`)
   ↓
GitHub Pages
```

ตั้งค่า Vite `base` ให้ตรงกับชื่อ repository และใช้ hash-based routing เพื่อให้การเปิด URL โดยตรงและ asset paths ทำงานถูกต้องบน GitHub Pages

## Development Priority

| ลำดับ | งาน                       | ความสำคัญ |
| ----- | ------------------------- | --------- |
| 1     | Types และ Data Validation | สูงมาก    |
| 2     | Matching Engine           | สูงมาก    |
| 3     | Engine Verification Cases | สูงมาก    |
| 4     | Design System             | สูง       |
| 5     | Landing Page              | กลาง      |
| 6     | Quiz Page                 | สูงมาก    |
| 7     | Result Page               | สูงมาก    |
| 8     | Vision Affinity           | สูงมาก    |
| 9     | Animation                 | กลาง      |
| 10    | Share Card                | สูง       |
| 11    | Localization              | สูงมาก    |
| 12    | Responsive และ QA         | สูงมาก    |
| 13    | Deploy                    | สูง       |

## UI Effort Allocation

```text
Landing Page  20%
Quiz Page     30%
Result Page   40%
Other         10%
```

ควรเริ่มทำ Result Page prototype ก่อนลงรายละเอียด Landing Page เพราะหน้าผลลัพธ์เป็นส่วนสำคัญที่ทำให้ผู้เล่นอยากแชร์ Quiz

## Localization Preparation

เวอร์ชันแรกต้องรองรับภาษาไทยและอังกฤษ โดยภาษาไทยเป็นภาษาเริ่มต้นและผู้ใช้สามารถสลับภาษาได้โดยไม่เสียความคืบหน้าของ Quiz

```json
{
  "result.nahida.title": {
    "th": "ผู้เฝ้ามองที่อ่อนโยน",
    "en": "The Gentle Observer"
  },
  "quiz.start": {
    "th": "เริ่มทำแบบทดสอบ",
    "en": "Start the quiz"
  }
}
```

### Localization Rules

- แยกข้อความ UI และข้อความตีความบุคลิกออกเป็น locale resources
- ใช้ translation key ที่คงที่ใน Questions, Results และ Vision explanations
- ไม่เปลี่ยน schema ของ Character Factual Data เพื่อฝังข้อความแปลโดยตรง
- ชื่อภาษาอังกฤษและข้อมูล factual ที่นำเข้าจากแหล่งอ้างอิงยังอยู่ในชั้น Character Master Data
- คำตอบและคะแนนเก็บด้วย ID ไม่เก็บด้วยข้อความ เพื่อให้สลับภาษาได้ระหว่างทำ Quiz
- บันทึกภาษาที่เลือกไว้ใน `localStorage`
- ถ้าคำแปลหาย ให้ fallback เป็นภาษาไทยและรายงาน key ที่ขาดในระหว่าง development

## Future: Firebase User Reports

Firebase ไม่อยู่ใน critical path ของ Quiz เวอร์ชันแรก การตอบคำถาม การคำนวณ Character Match, Vision Affinity และการเก็บความคืบหน้าต้องทำงานใน Browser ได้โดยไม่พึ่ง Firebase

ในอนาคต Firebase จะใช้สำหรับรับ User Report เช่น:

- รายงานคำถามหรือคำแปลที่ไม่ชัดเจน
- รายงานผลลัพธ์ที่ดูผิดปกติ
- รายงานข้อมูลตัวละครหรือรูปภาพที่ผิด
- แนบ metadata ที่จำเป็น เช่น locale, question version และ result version โดยไม่เก็บคำตอบหรือข้อมูลส่วนบุคคลเกินความจำเป็น

Frontend เชื่อมต่อผ่าน Firebase Web SDK โดยตรงและต้องมี Firebase Security Rules จำกัด operation ที่อนุญาต ห้ามใส่ Firebase Admin credentials หรือ Service Account key ใน Frontend และไม่เพิ่ม Backend API สำหรับความสามารถนี้

## Disclaimer

```text
Teyvat Personalities เป็นแฟนโปรเจกต์ที่สร้างขึ้นเพื่อความบันเทิง
ไม่มีความเกี่ยวข้องหรือได้รับการรับรองจาก HoYoverse
ผลลัพธ์ไม่ใช่การประเมินบุคลิกภาพทางจิตวิทยา
```

## Important Recommendations

1. ใช้ HoYoLAB เป็นแรงบันดาลใจด้าน Card layout, spacing, typography และ motion แต่ไม่ลอก UI โดยตรง
2. แยก Character Matching และ Vision Affinity ออกจาก UI เป็น Pure Functions และเตรียม verification cases ก่อน
3. ให้ความสำคัญกับ Result Page และ Share Card มากกว่า Animation ตกแต่ง
4. ใช้ Animation สั้นและสุภาพ พร้อมรองรับ Reduced Motion
5. เวอร์ชันแรกยังไม่จำเป็นต้องมี Backend, Login หรือ Database; Firebase สำหรับ User Report เป็นความสามารถในอนาคต
6. เก็บความคืบหน้า Quiz ใน `localStorage`
7. รองรับภาษาไทยและอังกฤษตั้งแต่ต้นโดยแยก locale resources ออกจาก factual data

## Recommended Implementation Order

1. สร้าง TypeScript models
2. สร้าง Zod schemas
3. Validate ข้อมูลทั้งหมด
4. พัฒนา Matching Engine
5. พัฒนา Vision Affinity Engine
6. เตรียม deterministic verification cases โดยยังไม่เพิ่ม Test Framework
7. สร้าง locale resources ภาษาไทยและอังกฤษ
8. สร้าง Result Page prototype
9. สร้าง Quiz Page จำนวน 24 คำถาม
10. สร้าง Landing Page
11. เพิ่ม Share Card
12. เพิ่ม Animation
13. ปรับ Responsive และ Accessibility
14. QA และ Deploy ด้วย GitHub Pages
15. เพิ่ม Firebase User Report ในระยะอนาคต
