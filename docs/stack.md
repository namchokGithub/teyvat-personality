# Teyvat Personalities — Tech Stack

เอกสารนี้สรุปเทคโนโลยีที่แนะนำสำหรับพัฒนาเว็บแอป **Teyvat Personalities** ซึ่งเป็นแบบทดสอบบุคลิกภาพเพื่อจับคู่ผู้ใช้กับตัวละครจาก Genshin Impact

## แนวทางของเวอร์ชันแรก

เริ่มต้นด้วย **Static Web App** โดยให้ข้อมูลคำถาม ข้อมูลตัวละคร และระบบคำนวณผลทำงานภายใน Browser ทั้งหมด แอปเชื่อมต่อ Firebase จาก Frontend โดยตรงผ่าน Firebase SDK และไม่มี Backend API คั่นกลาง

ข้อดี:

- พัฒนาและ Deploy ได้เร็ว
- ไม่มีค่าใช้จ่ายของ Server
- ดูแลระบบง่าย
- Deploy เป็น Static Site ผ่าน GitHub Pages ได้
- สามารถเพิ่ม Backend API ภายหลังได้เมื่อมีความจำเป็น

## Tech Stack ที่แนะนำ

| ส่วน             | เทคโนโลยี                   | หน้าที่                                     |
| ---------------- | --------------------------- | ------------------------------------------- |
| Frontend         | React + TypeScript          | สร้างหน้าคำถาม ระบบคำนวณ และหน้าผลลัพธ์     |
| Build Tool       | Vite                        | Development server และ Production build     |
| Styling          | Tailwind CSS v4             | ออกแบบ Responsive UI และ Theme              |
| UI Components    | shadcn/ui                   | Button, Card, Dialog และ Progress bar       |
| Icons            | lucide-react                | ไอคอนทั่วไป เช่น แชร์ ย้อนกลับ และเริ่มใหม่ |
| Navigation       | React Router                | จัดการหน้า Home, Quiz, Result และ Character |
| Data Validation  | Zod                         | ตรวจสอบโครงสร้างข้อมูล JSON                 |
| State Management | React Context + `useReducer` | เก็บคำตอบและคะแนนระหว่างทำแบบทดสอบ          |
| Local Storage    | Browser `localStorage`       | บันทึกคำตอบชั่วคราวและผลลัพธ์ล่าสุด         |
| Database         | Firebase                    | จัดเก็บข้อมูลที่ต้องใช้ร่วมกันผ่าน Client SDK โดยตรง |
| Code Quality     | ESLint + Prettier           | ตรวจสอบและจัดรูปแบบโค้ด                     |
| Hosting          | GitHub Pages                | Build และ Deploy เว็บไซต์จาก GitHub repository |
| Package Manager  | pnpm                        | จัดการ Dependencies                         |

## Package หลัก

```text
react
react-dom
react-router-dom
zod
lucide-react
tailwindcss
@tailwindcss/vite
firebase
eslint
prettier
```

## โครงสร้างโปรเจกต์

```text
src/
├── assets/
│   ├── characters/
│   ├── elements/
│   └── regions/
├── components/
│   ├── common/
│   ├── quiz/
│   └── result/
├── data/
│   ├── characters/
│   │   ├── _characters.json
│   │   └── {character-id}.json
│   ├── questions.json
│   ├── regions.json
│   └── elements.json
├── engine/
│   ├── calculateScore.ts
│   ├── normalizeScore.ts
│   └── matchCharacter.ts
├── hooks/
├── pages/
│   ├── HomePage.tsx
│   ├── QuizPage.tsx
│   ├── ResultPage.tsx
│   └── CharacterPage.tsx
├── schemas/
│   ├── character.schema.ts
│   └── question.schema.ts
├── types/
│   ├── character.ts
│   ├── question.ts
│   └── result.ts
├── utils/
├── App.tsx
└── main.tsx
```

## ระบบหลักที่ต้องพัฒนา

### 1. Quiz Engine

- แสดงคำถามทีละข้อ
- รองรับคำตอบหลายระดับ เช่น 1–5
- ย้อนกลับไปแก้คำตอบได้
- แสดง Progress ของแบบทดสอบ
- ป้องกันการส่งคำตอบไม่ครบ

### 2. Scoring Engine

ลำดับการทำงาน:

1. รับคำตอบของผู้ใช้
2. เพิ่มหรือลดคะแนนในแต่ละ Personality Trait
3. รวมคะแนนของทุกคำถาม
4. Normalize คะแนนให้อยู่ในช่วงเดียวกัน
5. เปรียบเทียบกับ Trait Profile ของตัวละคร
6. เรียงตัวละครตาม Compatibility Score

### 3. Character Matching

ระบบควรคืนผลลัพธ์อย่างน้อย:

- ตัวละครที่ตรงที่สุด
- Compatibility เป็นเปอร์เซ็นต์
- จุดเด่นที่เหมือนกัน
- จุดที่แตกต่างกัน
- ตัวละครใกล้เคียงอันดับ 2–4

ตัวอย่าง TypeScript model:

```ts
export interface MatchResult {
  characterId: string;
  compatibility: number;
  traitScores: Record<string, number>;
  strengths: string[];
  differences: string[];
}
```

### 4. Result Page

- รูปและชื่อของตัวละคร
- Region และ Element
- Compatibility Score
- คำอธิบายผลลัพธ์
- Trait chart หรือ Trait summary
- ปุ่มทำแบบทดสอบใหม่
- ปุ่มแชร์ผลลัพธ์

### 5. Data Validation

ใช้ Zod ตรวจสอบข้อมูลตอนเริ่มแอป เพื่อป้องกันปัญหา เช่น:

- Character ID ซ้ำ
- Region หรือ Element ไม่มีอยู่จริง
- Trait ขาดหาย
- Weight ไม่ใช่ตัวเลข
- Question อ้างอิง Trait ที่ไม่มีในระบบ

## State ที่ควรจัดเก็บ

```ts
interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, number>;
  startedAt: string | null;
  completedAt: string | null;
  result: MatchResult | null;
}
```

สำหรับเวอร์ชันแรกสามารถใช้ `React Context` ร่วมกับ `useReducer` ได้ โดยยังไม่จำเป็นต้องเพิ่ม Zustand หรือ Redux

## Deployment

ใช้ GitHub Actions Build โปรเจกต์และ Deploy ไปยัง GitHub Pages

ค่าพื้นฐาน:

```text
Build command: pnpm build
Build output directory: dist
```

ตั้งค่า Vite `base` ให้ตรงกับชื่อ repository เพื่อให้ Asset และ Client-side route ทำงานถูกต้องบน GitHub Pages

## การเชื่อมต่อ Firebase

- Frontend เชื่อมต่อ Firebase ผ่าน Firebase Web SDK โดยตรง
- ไม่มี Backend API หรือ Application Server คั่นกลาง
- เก็บ Firebase configuration ใน Environment Variables ของ Vite
- กำหนด Firebase Security Rules ให้ Client เข้าถึงได้เฉพาะข้อมูลและ operation ที่จำเป็น
- ห้ามเก็บ Admin SDK credentials หรือ Service Account key ไว้ใน Frontend

## สิ่งที่ยังไม่จำเป็นในเวอร์ชันแรก

- Backend API
- Application Server
- PostgreSQL
- ระบบ Login
- Admin Panel
- Zustand หรือ Redux
- AI API
- Server-side rendering

## สิ่งที่สามารถเพิ่มภายหลัง

ความสามารถที่สามารถพิจารณาเพิ่มในระยะถัดไป:

- เก็บสถิติผลลัพธ์ของผู้เล่น
- บันทึกผลลัพธ์ข้ามอุปกรณ์
- ระบบสมาชิก
- Admin สำหรับแก้ไขคำถามและตัวละคร
- Leaderboard หรือสถิติ Character Match
- สร้าง Share Image บน Server
- Analytics และ A/B Testing
- Unit Test สำหรับ Scoring และ Matching Engine

## Stack สรุปสำหรับเริ่มโปรเจกต์

```text
Vite
React
TypeScript
Tailwind CSS v4
shadcn/ui
React Router
Zod
Firebase
GitHub Pages
pnpm
```

## ลำดับการพัฒนาที่แนะนำ

1. สร้าง TypeScript types
2. สร้าง Zod schemas สำหรับ JSON
3. Validate ข้อมูล Character, Region, Element และ Question
4. พัฒนา Scoring และ Matching Engine
5. เชื่อมต่อ Firebase ผ่าน Client SDK
6. สร้าง Quiz UI
7. สร้าง Result Page
8. เพิ่ม Responsive และ Theme
9. Build และ Deploy ขึ้น GitHub Pages

## เอกสารอ้างอิง

- [Vite Documentation](https://vite.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev/)
- [Firebase Documentation](https://firebase.google.com/docs/web/setup)
- [GitHub Pages Documentation](https://docs.github.com/pages)
