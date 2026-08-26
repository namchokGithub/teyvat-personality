# Teyvat Personalities — Story Mode Plan

เอกสารนี้เป็นแผนสำหรับเพิ่มโหมดเนื้อเรื่องในอนาคต โดยให้ระบบรองรับทั้งแบบสอบถามบุคลิกภาพเดิมและการผจญภัยแบบเลือกคำตอบ พร้อมใช้ Matching Engine และหน้าผลลัพธ์ร่วมกัน

## แนวคิดหลัก

ระบบจะมี 2 โหมด:

| โหมด             | รูปแบบ                                         |
| ---------------- | ---------------------------------------------- |
| Personality Quiz | ตอบคำถามสถานการณ์ 24 ข้อแบบปัจจุบัน            |
| Story Adventure  | อ่านเนื้อเรื่องและเลือกการตัดสินใจตามสถานการณ์ |

ทั้งสองโหมดต้องส่งคะแนนเข้าสู่ Matching Engine ชุดเดียวกัน เพื่อค้นหา:

- Character Match
- Vision Affinity
- Trait scores
- ตัวละครใกล้เคียง

Story Mode จึงเป็นอีกวิธีหนึ่งในการเก็บคะแนนบุคลิก ไม่ใช่ระบบคำนวณผลชุดใหม่

## User Flow

```
Landing Page
    ↓
เลือกโหมด
    ├── Personality Quiz
    │      ↓
    │   คำถาม 24 ข้อ
    │
    └── Story Adventure
           ↓
        เลือกบทนำ
           ↓
        อ่านเนื้อเรื่อง
           ↓
        เลือกการตัดสินใจ
           ↓
        เนื้อเรื่องดำเนินต่อหรือแตกแขนง

              ↓
       Matching Engine เดียวกัน
              ↓
 Character Match + Vision Affinity
```

## ตัวอย่าง Story Scenario

```
คุณตื่นขึ้นมากลางป่าที่ไม่คุ้นเคย

ด้านหน้ามีเด็กคนหนึ่งได้รับบาดเจ็บ
แต่ไกลออกไป คุณเห็นกลุ่มศัตรูกำลังเข้ามาใกล้

คุณจะทำอย่างไร?
```

ตัวเลือก:

```
A. รีบเข้าไปช่วยเด็กทันที
B. ซ่อนตัวและสังเกตสถานการณ์ก่อน
C. ล่อศัตรูให้ออกไปจากบริเวณนั้น
D. มองหาคนอื่นเพื่อขอความช่วยเหลือ
```

ตัวเลือกแต่ละข้อจะเพิ่มหรือลดคะแนน Dimension และ Trait เช่นเดียวกับ Quiz เดิม (Vision Affinity คำนวณจาก Trait อัตโนมัติ ไม่มีคะแนนแยก — ดู [Story Data Model](#story-data-model))

```
{
  "id": "forest-01",
  "choices": [
    {
      "id": "help-child",
      "text": {
        "th": "รีบเข้าไปช่วยเด็กทันที",
        "en": "Help the child immediately"
      },
      "scores": {
        "dimensions": { "responsibility": 2, "adventure": 1 },
        "traits": { "empathy": 0.3, "determination": 0.2 }
      },
      "nextNodeId": "forest-02-rescue"
    }
  ]
}
```

## Architecture

แยกระบบออกเป็น 3 ส่วนหลัก:

```
Quiz Mode ───────┐
                 ├── Trait Score Collector
Story Mode ──────┘
                           ↓
                  Matching Engine
                           ↓
            Character + Vision Result
```

### Quiz Mode

- แสดงคำถามสถานการณ์
- รับคำตอบจากผู้เล่น
- แปลงคำตอบเป็น Trait และ Vision scores
- ส่งคะแนนเข้าสู่ Matching Engine

### Story Mode

- แสดงฉากและบทสนทนา
- รับตัวเลือกของผู้เล่น
- เปลี่ยน Story node ตามตัวเลือก
- สะสม Trait และ Vision scores
- ส่งคะแนนเข้าสู่ Matching Engine

### Matching Engine

- ไม่รับรู้ว่าคะแนนมาจาก Quiz หรือ Story
- รับเฉพาะคะแนนที่ผ่านการ Normalize แล้ว
- คำนวณ Character compatibility
- คำนวณ Vision affinity
- เรียงอันดับตัวละคร
- คืนผลลัพธ์ในรูปแบบเดียวกันทั้งสองโหมด

## Story Data Model

> **อัปเดต (2026-08-26):** ตัด `visionScores` ออกจาก `StoryChoice` — engine จริง (`buildUserPersonalityProfile`) ไม่มี path รับ vision score ตรงๆ, vision affinity มาจาก trait เท่านั้น (`rankVisionAffinities` เทียบ `user.traits` กับ `element.personalityTheme.traits`). `StoryChoice.scores` จึงใช้ shape เดียวกับ `answer.scores` ของ Quiz เป๊ะ (มาจาก `ScoredPrompt`/`ScoredQuizQuestion` ใน `src/types/index.ts` — ดู [Session Model](#session-model))

```
type StoryNodeType = "story" | "choice" | "ending";

interface StoryChapter {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  startNodeId: string;
  nodes: StoryNode[];
  endings: StoryEnding[];
}

interface StoryNode {
  id: string;
  type: StoryNodeType;
  content: LocalizedText;
  speaker?: LocalizedText;
  background?: string;
  characterImage?: string;
  music?: string;
  choices?: StoryChoice[];
  nextNodeId?: string;
}

interface StoryChoice {
  id: string;
  text: LocalizedText;
  nextNodeId: string;
  scores: {
    dimensions: Partial<Record<DimensionId, number>>;
    traits: Partial<Record<TraitId, number>>;
  };
}

interface StoryEnding {
  id: string;
  title: LocalizedText;
  epilogue: LocalizedText;
}
```

`node.type === "ending"` เป็นแค่ terminal node ทั่วไป (ฉากปิดเรื่องกลางๆ ไม่มี `nextNodeId`) **ไม่มี `endingId` ชี้ไปยัง ending ที่แน่นอน** — เพราะ ending ตัดสินจาก final trait/vision score ไม่ใช่จาก node ที่เดินถึง (ดู [Session Model](#session-model)) `StoryChapter.endings: StoryEnding[]` เก็บ epilogue ทั้งหมดไว้ต่างหาก แล้วเลือกหลังคำนวณคะแนนเสร็จ

`LocalizedText`, `DimensionId`, `TraitId` ใช้ของเดิมจาก `src/types/index.ts` ไม่ประกาศซ้ำ

## Session Model

> **อัปเดต (2026-08-26):** ไม่รวมเป็น `AssessmentSession` กลางแบบเดิม — resume logic ของ Quiz (รายการคำถามคงที่ทีละข้อ, ต้อง shuffle answer order) กับ Story (graph traversal ผ่าน branch แล้วบรรจบ) ต่างกันเกินกว่าจะยัด interface เดียวตอนนี้ได้อย่างสมเหตุผล จึงแยก `StoryProgressState` เป็น type ของตัวเอง คู่กับ `QuizProgressState` เดิม (`src/types/index.ts`) — ทั้งสองจบที่จุดเดียวกันคือส่ง `answers`/`choices` เข้า `buildUserPersonalityProfile` (`src/engine/index.ts`) เหมือนกัน

`QuizProgressState` เดิม (อ้างอิง):

```
interface QuizProgressState {
  version: 3;
  questionVersion: string;
  algorithmVersion: string;
  seed: number;
  questionOrder: string[];
  answerOrder: Record<string, string[]>;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
}
```

`StoryProgressState` ใหม่ (mirror รูปแบบเดียวกัน แต่สลับกลไก linear index → graph traversal):

```
interface StoryProgressState {
  version: 1;
  storyVersion: string;
  algorithmVersion: string;
  currentNodeId: string;
  visitedNodeIds: string[];
  choices: Record<string, string>;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
}
```

ไม่มี `seed`/`answerOrder` เพราะ Story ไม่มี pool-selection หรือ shuffle เนื้อหา (เนื้อเรื่องคงที่ตาม Chapter) — `visitedNodeIds` ใช้ทั้ง validate resume และสรุป "เส้นทางที่เลือก" ใน Result ทีหลัง

## Story Mode Levels

### Level 1: Linear Story

ผู้เล่นอ่านเนื้อเรื่องชุดเดียวกันตามลำดับ แต่ตัวเลือกแต่ละข้อให้คะแนนต่างกัน

```
Scene 1 → Scene 2 → Scene 3 → Scene 4 → Result
```

ข้อดี:

- พัฒนาและทดสอบง่าย
- ทุกคนเจอจำนวนเหตุการณ์เท่ากัน
- ควบคุมความสมดุลของคะแนนง่าย
- ใช้เนื้อหาและภาพไม่มากเกินไป
- ลดความเสี่ยงของเส้นทางที่ไปไม่ถึง Ending

เหมาะกับต้นแบบที่เรียบง่ายที่สุด (Story Mode รุ่นแรกเลือกเริ่มที่ Level 2 แทน — ดูหมายเหตุด้านล่าง)

### Level 2: Limited Branching

เพิ่มจุดแตกแขนงสำคัญเพียง 2–3 จุด ส่วนเส้นทางอื่นยังกลับเข้าสู่เนื้อเรื่องหลักได้

```
                   ┌── ช่วยหมู่บ้าน ──┐
เริ่มการเดินทาง ───┤                   ├── ฉากหลักถัดไป
                   └── สำรวจป่า ──────┘
```

ข้อดี:

- ผู้เล่นรู้สึกว่าการตัดสินใจมีผล
- เนื้อหาไม่เพิ่มขึ้นแบบทวีคูณ
- สามารถเล่นซ้ำเพื่อดูฉากอื่นได้

> **อัปเดต (2026-08-26):** Story Mode รุ่นแรกตัดสินใจเริ่มที่ Level 2 นี้เลย ไม่ผ่าน Level 1 ก่อน — branch 2 จุด (ลดจาก 2–3), converge กลับเส้นหลักทุกจุด (ไม่มีเส้นทางแยกค้าง), Ending ตัดสินจาก final trait/vision score หลังจบเรื่อง ไม่ผูกกับเส้นทางที่เลือก ดูตัวเลขเต็มที่ [Recommended Story Scope](#recommended-story-scope)

### Level 3: Full Branching Story

แต่ละตัวเลือกสามารถพาไปยังเหตุการณ์และ Ending ที่แตกต่างกัน

ข้อดี:

- เล่นซ้ำได้หลายรอบ
- การตัดสินใจมีผลต่อเนื้อเรื่องอย่างชัดเจน
- สามารถสร้าง Ending ตาม Vision หรือ Personality ได้

ข้อควรระวัง:

- ต้องเขียนเนื้อหาและเตรียมภาพจำนวนมาก
- จำนวนเส้นทางเพิ่มขึ้นอย่างรวดเร็ว
- ต้องทดสอบ Dead end, Loop และ Node ที่เข้าถึงไม่ได้
- การกระจายคะแนนแต่ละเส้นทางอาจไม่เท่ากัน

ไม่แนะนำให้เริ่มต้นด้วย Full Branching

## Recommended Story Scope

สำหรับ Story Mode รุ่นแรก (อัปเดต 2026-08-26 — ปรับให้เวลาเล่นใกล้เคียง Quiz Mode):

- 1 Chapter
- 6–8 เหตุการณ์
- 5–6 เหตุการณ์ที่มีตัวเลือก
- ตัวเลือกประมาณ 3–4 ข้อต่อเหตุการณ์
- Branch สำคัญ 2 จุด (converge กลับเส้นหลักทุกจุด ไม่มีเส้นทางที่แยกค้างไม่กลับมา)
- Ending 2 แบบ — ตัดสินจาก final trait/vision score หลังจบเรื่อง (เหมือน Character Match ปัจจุบัน) ไม่ผูกกับ branch ที่เลือก
- ใช้เวลาเล่นประมาณ 3–5 นาที

ก่อนสร้างฉบับเต็ม ควรทำ Prototype จำนวน 3–4 เหตุการณ์ (รวม branch point อย่างน้อย 1 จุด) เพื่อทดสอบระบบและความสมดุลของคะแนน

## Mode Selection Page

```
เลือกเส้นทางของคุณ
Choose your journey

┌─────────────────────────┐
│ Personality Quiz        │
│ ตอบสถานการณ์ 24 ข้อ     │
│ ใช้เวลาประมาณ 3–5 นาที │
└─────────────────────────┘

┌─────────────────────────┐
│ Story Adventure         │
│ ออกเดินทางและเลือก      │
│ การตัดสินใจของคุณ       │
│ ใช้เวลาประมาณ 3–5 นาที │
└─────────────────────────┘
```

ควรบอกผู้เล่นให้ชัดเจนว่าทั้งสองโหมดให้ Character Match และ Vision Affinity เหมือนกัน แต่มีประสบการณ์การเล่นต่างกัน

## Story Page UI

Story Page สามารถประกอบด้วย:

- Background ของสถานที่
- Character portrait หรือ silhouette
- ชื่อตัวละครที่กำลังพูด
- กล่องข้อความ
- ตัวเลือกการตัดสินใจ
- Chapter progress
- ปุ่มย้อนดูข้อความก่อนหน้า
- ปุ่มเปิดหรือปิดเสียง
- ปุ่มออกจาก Story

บน Mobile ควรให้ความสำคัญกับ:

- กล่องข้อความอ่านง่าย
- ปุ่มตัวเลือกสูงอย่างน้อย 44px
- ไม่ให้ภาพดันตัวเลือกออกจากหน้าจอ
- รองรับข้อความภาษาไทยที่ยาว
- ลด Animation และ Effect เพื่อประสิทธิภาพ

## Shared Result

> **อัปเดต (2026-08-26):** แยก type แต่ share component — ตรงข้ามกับ Session: `QuizResult`/`StoryResult` มี provenance ต่างกัน (มาจาก quiz answer array vs story node traversal) เลยแยก type ตามแนวทางเดียวกับ Session, แต่ **Result Page เป็น display layer ล้วนๆ ไม่มี resume-logic ต่างกัน** จึง share component เดียวได้ — field หลัก (`profile`, `characterMatches`, `visionMatches`, `completedAt`) เหมือนกันทั้งคู่ ส่วน Story-only render เพิ่มแบบ optional เมื่อมี `storyEndingId`

`StoryResult` (คู่กับ `QuizResult` เดิมใน `src/types/index.ts`):

```
interface StoryResult {
  version: 1;
  storyVersion: string;
  algorithmVersion: string;
  profile: UserPersonalityProfile;
  characterMatches: CharacterMatch[];
  visionMatches: VisionMatch[];
  completedAt: string;
  storyEndingId: string;
  visitedNodeIds: string[];
}
```

`<ResultPage>` รับ `characterMatches`/`visionMatches`/`profile` ร่วมกันทั้งสอง mode, รับ `storyEndingId`/`visitedNodeIds` เป็น optional prop สำหรับ Story เท่านั้น — ไม่ต้องมี `mode` field แยก เพราะเรียกใช้ type ไหนก็บอกอยู่แล้วว่าเป็น mode ไหน

สำหรับ Story Mode สามารถเพิ่มข้อมูลพิเศษใน Result Page เช่น:

- เส้นทางที่ผู้เล่นเลือก
- ชื่อ Ending
- การตัดสินใจสำคัญ
- บทสรุปการผจญภัย

ข้อมูลเหล่านี้ไม่ควรเปลี่ยนวิธีคำนวณ Character Match

## Validation

ควรสร้าง Zod schema สำหรับ Story data และตรวจสอบอย่างน้อย:

- Chapter ID ไม่ซ้ำ
- Node ID ไม่ซ้ำใน Chapter
- `<span>startNodeId</span>` มีอยู่จริง
- `<span>nextNodeId</span>` ทุกตัวอ้างอิง Node ที่มีอยู่จริง
- Choice node ต้องมีตัวเลือก
- Ending node ไม่ควรมี `<span>nextNodeId</span>`
- Story node ต้องไปยัง Node ถัดไปหรือเป็น Ending
- Dimension และ Trait keys ต้องเป็นค่าที่ระบบรองรับ (`DimensionId`/`TraitId` จาก `src/types/index.ts` — ไม่มี Vision key แยกแล้ว)
- Score ต้องเป็นตัวเลขที่อยู่ในช่วงที่กำหนด
- เนื้อหามีทั้งภาษาไทยและอังกฤษตามข้อกำหนดของระบบ

## Testing

### Unit Tests

- ตัวเลือกเพิ่ม Trait scores ถูกต้อง
- ตัวเลือกเพิ่ม Dimension scores ถูกต้อง
- เปลี่ยนไปยัง `<span>nextNodeId</span>` ถูกต้อง
- ย้อนกลับหรือ Resume แล้วคะแนนไม่ถูกเพิ่มซ้ำ
- Story และ Quiz ส่งข้อมูลเข้า Matching Engine ในรูปแบบเดียวกัน
- คะแนนชุดเดียวกันต้องได้ Character Match เดียวกัน

### Story Graph Tests

- ทุก Node ที่จำเป็นเข้าถึงได้
- ไม่มี Dead end ที่ไม่ได้ตั้งใจ
- ไม่มี Infinite loop
- ทุกเส้นทางสามารถไปถึง Ending
- ไม่มี `<span>nextNodeId</span>` ที่อ้างอิง Node ที่ไม่มีอยู่
- จำนวนเหตุการณ์ต่อเส้นทางไม่แตกต่างกันมากเกินไป

### Manual Tests

- เริ่ม Story ใหม่
- เลือกตัวเลือกและเปลี่ยนฉาก
- Refresh ระหว่างเล่นแล้วทำต่อได้
- ออกจาก Story แล้วกลับเข้ามาใหม่
- เล่นจบและเปิด Result Page
- เริ่ม Story ใหม่หลังเล่นจบ
- ทดสอบบน Mobile และ Desktop
- ทดสอบทั้งภาษาไทยและอังกฤษ

## สิ่งที่ควรเตรียมตั้งแต่ระบบปัจจุบัน

แม้ยังไม่พัฒนา Story Mode ควรเตรียม Architecture ดังนี้:

1. แยก Matching Engine ออกจาก Quiz UI — ✅ ทำแล้ว (`rankCharacterMatches`/`rankVisionAffinities` รับแค่ `UserPersonalityProfile`)
2. อย่าให้ Matching Engine อ่าน Question data โดยตรง — ✅ ส่วน `rank*` ทำแล้ว, `buildUserPersonalityProfile` จะ genericize param เป็น `ScoredPrompt[]` (ดู [Session Model](#session-model))
3. ให้ Matching Engine รับ profile ที่ normalize แล้ว (`UserPersonalityProfile`) ไม่ใช่ raw score object — ✅ ทำแล้ว
4. ~~เพิ่ม `mode: "quiz" | "story"` ใน Session และ Result~~ — **อัปเดต:** ไม่ต้องแล้ว เพราะแยก type ต่างหาก (`StoryProgressState`/`StoryResult` คู่กับ `QuizProgressState`/`QuizResult`) type ที่เรียกใช้บอกอยู่แล้วว่าเป็น mode ไหน
5. อย่าผูก `<span>localStorage</span>` กับ Question index เพียงอย่างเดียว — ✅ ทำแล้ว (`questionOrder` เป็น ID array)
6. ใช้ ID สำหรับอ้างอิง Question, Story node และ Choice — ✅ ทำแล้วฝั่ง Quiz, Story ใช้แนวเดียวกัน (`currentNodeId`/`nextNodeId`)
7. เก็บข้อความแบบ `<span>th</span>` และ `<span>en</span>` — ✅ ทำแล้ว (`LocalizedText`)
8. แยก Score collection ออกจาก Score calculation — ✅ ทำแล้ว (`QuizProgressState.answers` เก็บ raw, `buildUserPersonalityProfile` คำนวณตอนจบเท่านั้น)
9. ทำ Result Page ให้ไม่ขึ้นกับโครงสร้างของ Quiz answer — **อัปเดต:** share `<ResultPage>` ระหว่าง `QuizResult`/`StoryResult` ผ่าน field หลักร่วม (ดู [Shared Result](#shared-result))
10. เตรียม Version ใน Saved Session เผื่อ Story data มีการแก้ไข — ✅ ทำแล้วฝั่ง Quiz (`version`/`questionVersion`/`algorithmVersion`), `StoryProgressState` mirror แบบเดียวกันด้วย `storyVersion`

## Suggested Folder Structure

> **อัปเดต (2026-08-26):** ไม่ reorg เป็น domain-feature folder ตามที่เสนอเดิม — โค้ดจริงจัดตาม layer อยู่แล้ว (`src/data/`, `src/engine/`, `src/hooks/`, `src/pages/`, `src/components/`, `src/schemas/`) reorg ใหญ่เสี่ยงพัง Quiz ที่ทำงานอยู่โดยไม่ได้ประโยชน์เพิ่ม แทนที่ด้วยการเพิ่มไฟล์ Story ขนานไปกับของ Quiz ในโครงเดิม:

```
src/
├── data/
│   ├── quiz/            (เดิม)
│   └── story/            (ใหม่ — chapter/node/choice content)
├── engine/                (เดิม, ใช้ร่วมกัน — genericize param เป็น ScoredPrompt[])
├── hooks/
│   ├── useQuizProgress.ts    (เดิม)
│   └── useStoryProgress.ts   (ใหม่)
├── pages/
│   ├── QuizPage.tsx      (เดิม)
│   └── StoryPage.tsx     (ใหม่)
├── schemas/
│   └── story.ts           (ใหม่ — แยกไฟล์จาก schemas/index.ts เดิม)
└── components/
    └── result/            (เดิม, share ระหว่าง Quiz/Story)
```

## Development Roadmap

### Phase 1: Stabilize Quiz Mode

- ทำ Quiz Mode ปัจจุบันให้สมบูรณ์
- ตรวจสอบ Matching Engine
- เพิ่ม Unit tests
- ปรับ `<ResultPage>` ให้รับ field หลัก (`profile`/`characterMatches`/`visionMatches`) แบบ share ได้ เตรียมรับ `StoryResult`

### Phase 2: Prepare Shared Architecture

> **อัปเดต (2026-08-26):** ตัด "เพิ่ม Assessment mode" กับ "แยก Session model กลาง" ออก — ตัดสินใจแล้วว่าไม่ทำ generic session/mode field (ดู [Session Model](#session-model)) แทนที่ด้วยงานจริงที่ต้องทำ:

- Rename engine param เป็น `ScoredPrompt[]` (base type ของ `ScoredQuizQuestion`) ใน `buildUserPersonalityProfile`
- สร้าง `StoryProgressState` type คู่กับ `QuizProgressState`
- สร้าง `StoryResult` type คู่กับ `QuizResult`
- เตรียม Story schemas (Zod)

### Phase 3: Story Prototype

- สร้าง Story engine ขั้นพื้นฐาน
- สร้าง Story จำนวน 3–4 เหตุการณ์ (รวม branch point อย่างน้อย 1 จุด)
- รองรับ Choice และ `<span>nextNodeId</span>`
- บันทึก Session ลง `<span>localStorage</span>`
- เชื่อม Matching Engine เดิม

### Phase 4: Story MVP

- ขยายเป็น 6–8 เหตุการณ์ ครบ 2 branch point ตามที่ออกแบบ
- เพิ่ม Ending ให้ครบ 2 แบบ
- เพิ่ม Background และ Character art
- เพิ่ม Animation เล็กน้อย
- รองรับภาษาไทยและอังกฤษ

### Phase 5: Advanced Story

- เพิ่มหลาย Chapter
- เพิ่มเส้นทางที่เล่นซ้ำได้
- เพิ่ม Ending ตามการตัดสินใจ
- เพิ่ม Story summary ใน Result Page
- เพิ่มเสียงและเพลง หากมีสิทธิ์ใช้งาน

## Risks and Recommendations

### Content Growth

Branching ทุกจุดจะทำให้จำนวนเนื้อหาเพิ่มขึ้นอย่างรวดเร็ว รุ่นแรกจึงจำกัดไว้ที่ 2 branch point และบังคับให้ทุก branch converge กลับเส้นหลักเสมอ (ไม่มีเส้นทางแยกค้าง) เพื่อคุมจำนวนเนื้อหาให้อยู่ในช่วง 6–8 เหตุการณ์

### Score Balance

ทุกเส้นทางควรมีโอกาสได้รับคะแนน Trait และ Vision ที่ใกล้เคียงกัน ไม่เช่นนั้นตัวเลือกเส้นทางอาจทำให้ผลลัพธ์เอนเอียงโดยไม่ได้ตั้งใจ

### Save Compatibility

Story data อาจถูกแก้ไขในภายหลัง ควรใส่ `<span>storyVersion</span>` ใน Session และจัดการกรณี Saved node ไม่มีอยู่ในข้อมูลรุ่นใหม่

### Assets and Copyright

ใช้ Asset ที่มีสิทธิ์ใช้งาน พร้อมแสดง Disclaimer ของแฟนโปรเจกต์ ไม่ควรนำเพลงหรือไฟล์จากเกมมาใช้โดยไม่ตรวจสอบสิทธิ์

### Scope Control

Story Mode ควรเปิดตัวหลัง Quiz Mode และ Matching Engine มีความเสถียร เพื่อไม่ให้ต้องแก้ทั้งเนื้อเรื่องและ Logic การคำนวณพร้อมกัน

## Recommended Implementation Order

1. ทำ Quiz Mode ให้สมบูรณ์
2. แยก Matching Engine ออกจาก UI
3. Rename engine param เป็น `ScoredPrompt[]`, สร้าง `StoryProgressState`/`StoryResult` คู่กับของ Quiz
4. สร้าง Story data schema
5. สร้าง Story prototype 3–4 เหตุการณ์ (มี branch point อย่างน้อย 1 จุด)
6. เชื่อมคะแนนกับ Matching Engine
7. ตรวจสอบความสมดุลของผลลัพธ์
8. ขยายเป็น 6–8 เหตุการณ์ ครบ 2 branch point
9. เพิ่ม Ending ให้ครบ 2 แบบ และปรับสมดุลคะแนน
10. เพิ่ม Artwork, Animation และเสียงภายหลัง

## Conclusion

ระบบสามารถรองรับทั้ง Personality Quiz และ Story Adventure ได้โดยไม่ต้องสร้าง Matching Engine ใหม่ หากแยกหน้าที่ของแต่ละส่วนให้ชัดเจน:

```
Quiz และ Story = เก็บคะแนน
Matching Engine = วิเคราะห์คะแนน
Result Page = แสดงผลลัพธ์ร่วมกัน
```

แนวทางที่เหมาะสมที่สุดคือทำ Quiz Mode ปัจจุบันให้เสถียรก่อน จากนั้นสร้าง Story Prototype แบบ Limited Branching (branch 2 จุด, converge กลับเส้นหลัก) จำนวน 3–4 เหตุการณ์ แล้วค่อยขยายเป็นเนื้อเรื่องเต็ม 6–8 เหตุการณ์ ใช้เวลาเล่นประมาณ 3–5 นาที
