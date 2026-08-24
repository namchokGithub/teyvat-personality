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

ตัวเลือกแต่ละข้อจะเพิ่มหรือลดคะแนน Trait และ Vision Affinity เช่นเดียวกับ Quiz เดิม

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
        "empathy": 3,
        "courage": 2,
        "caution": -1
      },
      "visionScores": {
        "pyro": 1,
        "hydro": 1
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

```
type AssessmentMode = "quiz" | "story";

type StoryNodeType = "story" | "choice" | "ending";

interface LocalizedText {
  th: string;
  en: string;
}

interface StoryChapter {
  id: string;
  title: LocalizedText;
  description?: LocalizedText;
  startNodeId: string;
  nodes: StoryNode[];
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
  endingId?: string;
}

interface StoryChoice {
  id: string;
  text: LocalizedText;
  nextNodeId: string;
  scores: Partial<Record<PersonalityTrait, number>>;
  visionScores?: Partial<Record<VisionElement, number>>;
}
```

## Session Model

ระบบ Session ไม่ควรผูกกับคำถาม 24 ข้อเท่านั้น ควรรองรับทั้ง Quiz และ Story

```
interface AssessmentSession {
  id: string;
  mode: AssessmentMode;
  traitScores: TraitScores;
  visionScores: VisionScores;
  currentStep: string;
  history: SessionHistoryItem[];
  startedAt: string;
  completedAt?: string;
}

interface SessionHistoryItem {
  nodeId: string;
  choiceId?: string;
  answeredAt: string;
}
```

สำหรับ Quiz Mode ค่า `<span>currentStep</span>` อาจเป็น Question ID ส่วน Story Mode จะเป็น Story node ID

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

เหมาะสำหรับ Story Mode รุ่นแรก

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

สำหรับ Story Mode รุ่นแรก:

- 1 Chapter
- 12–16 เหตุการณ์
- 8–10 เหตุการณ์ที่มีตัวเลือก
- ตัวเลือกประมาณ 3–4 ข้อต่อเหตุการณ์
- Branch สำคัญประมาณ 2 จุด
- Ending ประมาณ 2–3 แบบ
- ใช้เวลาเล่นประมาณ 8–12 นาที

ก่อนสร้างฉบับเต็ม ควรทำ Prototype จำนวน 5 เหตุการณ์เพื่อทดสอบระบบและความสมดุลของคะแนน

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
│ ใช้เวลาประมาณ 8–12 นาที│
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

Quiz และ Story ควรใช้ Result model และ Result Page ร่วมกัน

```
interface AssessmentResult {
  mode: AssessmentMode;
  primaryMatch: CharacterMatch;
  secondaryMatches: CharacterMatch[];
  traitScores: TraitScores;
  visionScores: VisionScores;
  visionAffinity: VisionElement;
  completedAt: string;
  storyEndingId?: string;
}
```

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
- Trait และ Vision keys ต้องเป็นค่าที่ระบบรองรับ
- Score ต้องเป็นตัวเลขที่อยู่ในช่วงที่กำหนด
- เนื้อหามีทั้งภาษาไทยและอังกฤษตามข้อกำหนดของระบบ

## Testing

### Unit Tests

- ตัวเลือกเพิ่ม Trait scores ถูกต้อง
- ตัวเลือกเพิ่ม Vision scores ถูกต้อง
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

1. แยก Matching Engine ออกจาก Quiz UI
2. อย่าให้ Matching Engine อ่าน Question data โดยตรง
3. ให้ Matching Engine รับ `<span>traitScores</span>` และ `<span>visionScores</span>`
4. เพิ่ม `<span>mode: "quiz" | "story"</span>` ใน Session และ Result
5. อย่าผูก `<span>localStorage</span>` กับ Question index เพียงอย่างเดียว
6. ใช้ ID สำหรับอ้างอิง Question, Story node และ Choice
7. เก็บข้อความแบบ `<span>th</span>` และ `<span>en</span>`
8. แยก Score collection ออกจาก Score calculation
9. ทำ Result Page ให้ไม่ขึ้นกับโครงสร้างของ Quiz answer
10. เตรียม Version ใน Saved Session เผื่อ Story data มีการแก้ไข

## Suggested Folder Structure

```
src/
├── assessment/
│   ├── types.ts
│   ├── session.ts
│   └── score-collector.ts
├── quiz/
│   ├── components/
│   ├── data/
│   └── quiz-session.ts
├── story/
│   ├── components/
│   ├── data/
│   ├── schemas/
│   ├── story-engine.ts
│   └── story-session.ts
├── matching/
│   ├── character-matcher.ts
│   ├── vision-matcher.ts
│   └── normalize-scores.ts
└── result/
    ├── components/
    └── result-page.tsx
```

ควรปรับตามโครงสร้างจริงของโปรเจกต์ ไม่จำเป็นต้องย้ายไฟล์เดิมทั้งหมดทันที

## Development Roadmap

### Phase 1: Stabilize Quiz Mode

- ทำ Quiz Mode ปัจจุบันให้สมบูรณ์
- ตรวจสอบ Matching Engine
- เพิ่ม Unit tests
- ปรับ Result Page ให้ใช้ Result model กลาง

### Phase 2: Prepare Shared Architecture

- เพิ่ม Assessment mode
- แยก Session model กลาง
- แยก Score collector
- ปรับ Matching Engine ให้รับเฉพาะคะแนน
- เตรียม Story schemas

### Phase 3: Story Prototype

- สร้าง Story engine ขั้นพื้นฐาน
- สร้าง Story จำนวน 5 เหตุการณ์
- รองรับ Choice และ `<span>nextNodeId</span>`
- บันทึก Session ลง `<span>localStorage</span>`
- เชื่อม Matching Engine เดิม

### Phase 4: Story MVP

- ขยายเป็น 12–16 เหตุการณ์
- เพิ่ม 2 จุดแตกแขนง
- เพิ่ม 2–3 Endings
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

Branching ทุกจุดจะทำให้จำนวนเนื้อหาเพิ่มขึ้นอย่างรวดเร็ว จึงควรเริ่มจาก Linear Story และมี Branch เฉพาะเหตุการณ์สำคัญ

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
3. เพิ่ม Shared Assessment Session
4. เพิ่ม `<span>quiz | story</span>` mode
5. สร้าง Story data schema
6. สร้าง Story prototype 5 เหตุการณ์
7. เชื่อมคะแนนกับ Matching Engine
8. ตรวจสอบความสมดุลของผลลัพธ์
9. ขยายเป็น 12–16 เหตุการณ์
10. เพิ่ม Limited Branching และ Endings
11. เพิ่ม Artwork, Animation และเสียงภายหลัง

## Conclusion

ระบบสามารถรองรับทั้ง Personality Quiz และ Story Adventure ได้โดยไม่ต้องสร้าง Matching Engine ใหม่ หากแยกหน้าที่ของแต่ละส่วนให้ชัดเจน:

```
Quiz และ Story = เก็บคะแนน
Matching Engine = วิเคราะห์คะแนน
Result Page = แสดงผลลัพธ์ร่วมกัน
```

แนวทางที่เหมาะสมที่สุดคือทำ Quiz Mode ปัจจุบันให้เสถียรก่อน จากนั้นสร้าง Story Prototype แบบ Linear จำนวน 5 เหตุการณ์ แล้วค่อยขยายเป็นเนื้อเรื่องเต็มและเพิ่ม Branch สำคัญในภายหลัง
