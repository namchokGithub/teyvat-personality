# Shared Result — Firestore Schema & Security Rules Design

สถานะ: draft สำหรับ implementation plan ต่อไป
เกี่ยวข้องกับ: [DEVELOPMENT_PLAN.md](../../plans/DEVELOPMENT_PLAN.md) หัวข้อ P2 — Shared Result ข้ามอุปกรณ์ (เลื่อนทำภายหลัง), item 1-2 เท่านั้น
ไม่รวม: publish flow / `#/shared/:id` UI (item 3), invalid-link/old-version handling ที่ระดับ UI (item 4), App Check/Anonymous Auth หรือมาตรการกัน abuse อื่น (item 5)

## บริบท

Share flow ปัจจุบัน (`src/utils/share-result.ts`) เข้ารหัสผลลัพธ์ทั้งหมดไว้ใน query string ของ URL (`createResultUrl`) — เปิดจากอุปกรณ์อื่นได้ก็จริง แต่ client แก้ค่าใน URL เองได้ (compatibility, affinity, traits ฯลฯ) เพราะไม่มีการเก็บฝั่งเซิร์ฟเวอร์ ไม่ตรงกับข้อตกลงใน plan ที่ต้องการ snapshot ที่ "แก้ผลไม่ได้"

โปรเจกต์มี Firebase เป็น dependency แล้ว (`src/lib/firebase.ts` init เฉพาะ `firebaseApp`) แต่ยังไม่มี Firestore/Auth wiring, ไม่มี route `#/shared/:id`, ไม่มี Firestore Rules ใดๆ

Result page (`src/pages/ResultPage.tsx`) render character match อันดับ 1 (`CharacterMatch`) และ vision match อันดับ 1 (`VisionMatch`) เท่านั้น ผ่าน `CharacterResultCard` และ `VisionCard` (`src/components/result/index.tsx`)

## Item 1 — Firestore Schema

### Collection & Document ID

- Collection top-level: `sharedResults`
- Document ID: client-generated opaque ID, nanoid ด้วย URL-safe alphabet (`A-Za-z0-9_-`), ยาว 12 ตัวอักษร
  - เลือกแบบนี้แทน Firestore auto-ID เพื่อให้ client คุม URL (`#/shared/:id`) ได้ตั้งแต่ก่อนเขียนจริง โดยเช็ค `getDoc` ว่า ID ไม่ชนก่อน `setDoc`
  - Rules item 2 ต้องยืนยันรูปแบบ ID ตอน `create` (12 ตัวอักษรตาม alphabet ข้างต้น) เพื่อกันกรณี client ส่ง ID ที่ไม่ตรง pattern

### Document shape (v1)

```ts
interface SharedResultDoc {
  schemaVersion: 1; // รูปแบบของ document เอง แยกจาก content version ด้านล่าง
  questionVersion: string; // จาก QuizResult.questionVersion (src/types)
  algorithmVersion: string; // จาก QuizResult.algorithmVersion (src/types)
  publishedAt: Timestamp; // serverTimestamp() เท่านั้น ห้าม client กำหนดเวลาเอง

  character: {
    characterId: string;
    name: string;
    element: string;
    region: string;
    compatibility: number; // int, 0-100
    title: { th: string; en: string };
    summary: { th: string; en: string };
    matchingTraits: { th: string; en: string }[];
    artworkUrl: string | null;
  };

  vision: {
    element: string;
    affinity: number; // int, 0-100
    summary: { th: string; en: string };
  };
}
```

### เหตุผลของการออกแบบ

- **Embed ข้อมูลทั้งหมดที่ Result page ต้องใช้ render ตรงตัว** (ไม่ใช่แค่เก็บ `characterId`/`elementId` แล้วค่อย `loadCharacterById` ใหม่ตอนเปิดลิงก์) เพราะ:
  - ตรงกับคำว่า "snapshot" ใน plan (บรรทัด 11: "ข้อมูลที่เผยแพร่จะเป็น snapshot ของผลลัพธ์แบบ versioned เท่านั้น")
  - ถ้า character data ต้นทางถูกแก้ไข/ลบ/เปลี่ยนคำบรรยายในอนาคต ลิงก์แชร์เก่ายังเปิดได้ผลเดิมเป๊ะ ไม่มีทางเพี้ยนตามข้อมูลปัจจุบัน
  - แลกกับ document ใหญ่ขึ้นเล็กน้อย (ข้อความ 2 ภาษา + trait list) ซึ่งเทียบกับต้นทุนของการ round-trip ไปโหลด character data แยกแล้วไม่คุ้ม
- **ไม่เก็บ** raw quiz answers, `UserPersonalityProfile`/dimensions, หรือชื่อผู้เล่น — ตรงข้อตกลง plan บรรทัด 11 ("ไม่เก็บคำตอบดิบหรือชื่อผู้เล่นโดยอัตโนมัติ")
- **`schemaVersion` แยกจาก `questionVersion`/`algorithmVersion`**: `schemaVersion` คือรูปแบบ document/field ของ shared-result feature เอง ส่วนอีกสองตัวคือ version ของ quiz engine ที่คำนวณผลนี้ขึ้นมา (มีอยู่แล้วใน `QuizResult` — ใช้ตัวเดิม ไม่ตั้งใหม่) แยกกันเพื่อให้ item 4 (จัดการ version เก่า/ไม่รองรับที่ระดับ UI) ตัดสินใจจาก axis ที่ถูกต้องได้ โดยไม่ปนกับการเปลี่ยน document shape

## Item 2 — Firestore Security Rules

```
match /databases/{database}/documents {
  match /sharedResults/{id} {
    allow get: if true;
    allow list: if false;

    allow create: if
      id.matches('^[A-Za-z0-9_-]{12}$') &&
      request.resource.data.keys().hasOnly([
        'schemaVersion', 'questionVersion', 'algorithmVersion',
        'publishedAt', 'character', 'vision'
      ]) &&
      request.resource.data.schemaVersion == 1 &&
      request.resource.data.questionVersion is string &&
      request.resource.data.algorithmVersion is string &&
      request.resource.data.publishedAt == request.time &&
      isValidCharacter(request.resource.data.character) &&
      isValidVision(request.resource.data.vision);

    allow update: if false;
    allow delete: if false;
  }
}

function isValidCharacter(c) {
  return c.keys().hasOnly([
      'characterId', 'name', 'element', 'region', 'compatibility',
      'title', 'summary', 'matchingTraits', 'artworkUrl'
    ])
    && c.characterId is string && c.name is string
    && c.element is string && c.region is string
    && c.compatibility is int && c.compatibility >= 0 && c.compatibility <= 100
    && isLocalizedText(c.title) && isLocalizedText(c.summary)
    && c.matchingTraits is list
    && (c.artworkUrl == null || c.artworkUrl is string);
}

function isValidVision(v) {
  return v.keys().hasOnly(['element', 'affinity', 'summary'])
    && v.element is string
    && v.affinity is int && v.affinity >= 0 && v.affinity <= 100
    && isLocalizedText(v.summary);
}

function isLocalizedText(t) {
  return t.keys().hasOnly(['th', 'en']) && t.th is string && t.en is string;
}
```

### เหตุผลของการออกแบบ

- `allow list: if false` — กันไม่ให้ client ไล่ enumerate ผลของคนอื่นทั้ง collection เปิดผลได้เฉพาะกรณีที่รู้ document ID ตรงเท่านั้น (`get`)
- `allow update / delete: if false` เด็ดขาด — ตรงข้อตกลง plan บรรทัด 12: "ห้ามแก้ไขหรือลบหลังสร้าง การแก้ `id` ใน URL จึงทำได้เพียงไปยังลิงก์อื่น ไม่สามารถเปลี่ยนผลในเอกสารเดิมได้"
- `request.resource.data.publishedAt == request.time` บังคับให้ค่าที่เขียนต้องมาจาก `serverTimestamp()` จริง client ปลอมเวลาย้อนหลัง/ล่วงหน้าไม่ได้
- Validate รูปแบบ/ช่วงของ field (type, `hasOnly`, ช่วง 0-100) ทำพร้อม rules ชุดนี้เลย — เป็นคนละเรื่องกับมาตรการกัน spam/abuse (item 5, เช่น App Check/Anonymous Auth ที่ยังเลื่อนไว้): เรื่องนั้นคือ "ใครมีสิทธิ์ยิง create" ส่วนนี้คือ "ถ้ายิง create แล้ว data ต้องมีรูปที่ถูกต้องเสมอ" ไม่ขึ้นกับกันว่าใครยิงได้
- Rules ชุดนี้**ยังไม่ rate-limit จำนวน document ต่อ session/ต่อคน** — เจตนาเดียวกับ plan บรรทัด 13 ที่ระบุว่าเรื่องกัน abuse สำหรับ public create เป็นการตัดสินใจก่อนเปิด production ในเฟสนั้น ไม่ใช่ตอนออกแบบ schema/rules นี้
- `isValidCharacter` เช็คแค่ `c.matchingTraits is list` ไม่ลงไปตรวจ shape ของสมาชิกแต่ละตัว (`{ th, en }`) เพราะ security rules language วน list ตรวจ nested shape ได้จำกัด/ซับซ้อนเกินคุ้ม ยอมรับ trade-off นี้ไว้ตรงๆ — ถ้าพบว่าเป็นช่องโหว่จริงในทางปฏิบัติ ค่อยกลับมาทำใน implementation phase

## Testing plan (สำหรับ "เขียนและทดสอบ" ใน item 2)

โปรเจกต์นี้ไม่มี test runner อยู่แล้ว (ไม่มี vitest/jest) มีแต่ standalone node script style (`scripts/verify-engine.mjs`, `scripts/validate-data.mjs`) จึงเสนอให้ตาม pattern เดิมแทนการเพิ่ม test framework เต็มรูปแบบ:

- เพิ่ม devDependency: `firebase-tools` (สำหรับรัน Firestore Emulator), `@firebase/rules-unit-testing`
- เพิ่มไฟล์ `firebase.json` และ `firestore.rules` (rules จริงจาก item 2 ด้านบน) ที่ root ของ `teyvat-personality/`
- เพิ่ม script `scripts/verify-shared-result-rules.mjs` รันผ่าน Firestore Emulator ใช้ `@firebase/rules-unit-testing` (`assertSucceeds` / `assertFails`) ครอบคลุมเคส:
  1. `create` ที่ข้อมูลถูกรูปครบทุก field ช่วง 0-100 → succeed
  2. `create` ที่ขาด field, field ผิด type, ผิดช่วง, หรือ document ID ไม่ตรง pattern 12 ตัวอักษร → fail
  3. `create` ที่ `publishedAt` ไม่ตรง `request.time` (client กำหนดเวลาเอง) → fail
  4. `get` document ที่มีอยู่แล้ว โดยไม่ auth → succeed
  5. `list` ทั้ง collection → fail เสมอ
  6. `update` document ที่มีอยู่แล้ว (ไม่ว่าแก้ field ใด) → fail
  7. `delete` document ที่มีอยู่แล้ว → fail
- เพิ่ม `package.json` script: `"verify:shared-result-rules": "firebase emulators:exec --only firestore \"node scripts/verify-shared-result-rules.mjs\""`
- รันแบบ offline ทั้งหมดผ่าน emulator ไม่ต้องต่อ Firestore project จริง

## Out of scope (เก็บไว้ทำต่อในรอบ implementation/item ถัดไป)

- Publish flow หลังคำนวณผลสำเร็จ, หน้า `#/shared/:id` แบบ read-only, route ใหม่ใน `src/App.tsx` (item 3)
- การจัดการ UI กรณีลิงก์ไม่มีอยู่, `schemaVersion`/`questionVersion`/`algorithmVersion` เก่าไม่รองรับ, CTA ให้เริ่มแบบทดสอบใหม่ (item 4)
- มาตรการกัน public-write abuse (App Check / Anonymous Auth) และ end-to-end QA ข้ามอุปกรณ์/เบราว์เซอร์ (item 5)
