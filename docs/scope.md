# Genshin Character Personality Quiz

> **Concept:** Web application สำหรับค้นหาว่า “บุคลิกของคุณเหมือนตัวละคร Genshin Impact คนไหนมากที่สุด?”
> โดยใช้ Personality Matching System ที่ได้รับแรงบันดาลใจจากแบบทดสอบบุคลิก เช่น MBTI แต่ใช้ระบบ Personality Dimensions ของเราเอง

---

## 1. Project Concept

ระบบจะให้ผู้ใช้ตอบคำถามเกี่ยวกับพฤติกรรม การตัดสินใจ และสถานการณ์ต่าง ๆ

จากคำตอบ ระบบจะสร้าง **Personality Profile** ของผู้ใช้ แล้วนำไปเปรียบเทียบกับ Personality Profile ของตัวละคร Genshin Impact

Flow หลัก:

```text
User
 ↓
Personality Quiz
20–30 Questions
 ↓
Personality Vector
 ↓
Compare with
Genshin Character Personality Profiles
 ↓
Similarity Score
 ↓
Result
```

ตัวอย่างผลลัพธ์:

```text
🥇 Furina        87%
🥈 Fischl        81%
🥉 Venti         76%
```

ระบบจะไม่ใช้ MBTI โดยตรง แต่สร้าง Personality Model ของตัวเองเพื่อให้เหมาะกับตัวละคร Genshin มากกว่า

---

# 2. Personality Dimensions

ดูรายชื่อ Dimension, ทิศทางคะแนน (0–100), และตัวอย่างค่าจริงที่ `CONTEXT.md` (หัวข้อ `# 7. Main Personality Dimensions`) — เอกสารนี้ไม่ทำสำเนาซ้ำเพื่อป้องกันข้อมูลเพี้ยนไปคนละทาง

> คะแนน Personality ของ Character เป็น **Fan-made Interpretation** ไม่ใช่ข้อมูล Official จาก HoYoverse

---

# 3. Character Personality Dataset

ข้อมูลตัวละครควรแยกออกจาก Quiz Engine เพื่อให้สามารถเพิ่ม Character ใหม่ได้ง่าย

ตัวอย่าง TypeScript Model:

```ts
interface CharacterPersonality {
  id: string;
  name: string;

  region: string;
  element: string;

  personality: {
    social: number;
    decision: number;
    lifestyle: number;
    adventure: number;
    responsibility: number;
    expression: number;
  };

  traits: string[];
  strengths: string[];
  weaknesses: string[];

  description: string;

  quote?: string;
  image: string;
}
```

ตัวอย่าง:

```json
{
  "id": "furina",
  "name": "Furina",
  "region": "Fontaine",
  "element": "Hydro",

  "personality": {
    "social": 80,
    "decision": 45,
    "lifestyle": 55,
    "adventure": 65,
    "responsibility": 75,
    "expression": 95
  },

  "traits": [
    "Expressive",
    "Creative",
    "Sensitive",
    "Attention-seeking",
    "Compassionate"
  ],

  "strengths": ["Creative", "Empathetic", "Adaptable"],

  "weaknesses": ["Overthinks", "Emotionally sensitive", "Needs validation"]
}
```

---

# 4. Character Research

ข้อมูล Personality ของ Character ควรวิเคราะห์จากหลายแหล่ง

ลำดับความสำคัญ:

## 4.1 Character Story

ใช้วิเคราะห์:

- Background
- Motivation
- Personality
- Values
- Relationships
- Internal conflicts

---

## 4.2 Story Quest / Archon Quest

ใช้ดูพฤติกรรมของตัวละครในสถานการณ์จริง

ตัวอย่างสิ่งที่ควรวิเคราะห์:

```text
เวลามีปัญหา → ตัวละครทำอย่างไร

เวลาอยู่กับคนอื่น → เป็นอย่างไร

เวลาตัดสินใจ → ใช้อารมณ์หรือเหตุผล

เวลาเจอความเสี่ยง → หลีกเลี่ยงหรือเผชิญ

เวลาเกิด Conflict → รับมืออย่างไร
```

---

## 4.3 Voice-Overs

Voice-Overs มีประโยชน์มากสำหรับวิเคราะห์ Personality

เช่น:

```text
About XXX
Hobbies
Troubles
Favorite Food
Least Favorite Food
More About ...
```

---

## 4.4 Official Character Description

ใช้สำหรับข้อมูลพื้นฐานและ Character Summary

---

# 5. Quiz System

Quiz ควรมีประมาณ:

```text
20–30 Questions
```

แนะนำสำหรับ V1:

```text
24 Questions
```

ถ้ามี 6 Personality Dimensions:

```text
ประมาณ 4 Questions / Dimension
```

อย่างไรก็ตามหนึ่ง Question สามารถส่งผลต่อหลาย Dimensions ได้

---

# 6. Question Design

ควรใช้ **Situational Questions**

หลีกเลี่ยงคำถามตรง เช่น:

```text
คุณเป็น Introvert หรือ Extrovert?
```

เพราะผู้ใช้สามารถเดาได้ทันทีว่าคำตอบกำลังวัดอะไร

ควรถามเป็นสถานการณ์แทน

ตัวอย่าง:

> คุณมีวันหยุดหนึ่งวันโดยไม่มีแผน คุณจะทำอะไร?

```text
A. ชวนเพื่อนออกไปเที่ยว

B. อยู่บ้านทำสิ่งที่ตัวเองชอบ

C. วางแผนว่าจะใช้เวลาให้คุ้มที่สุด

D. ออกไปเดินเล่นโดยไม่กำหนดจุดหมาย
```

---

# 7. Answer Scoring

แต่ละ Answer จะมี Personality Score ซ่อนอยู่

ตัวอย่าง:

```ts
A = {
  social: +3,
  expression: +2,
};

B = {
  social: -3,
};

C = {
  lifestyle: +3,
  responsibility: +2,
};

D = {
  lifestyle: -3,
  adventure: +3,
};
```

User จะไม่เห็น Score เหล่านี้

---

# 8. Situational Question Example

คำถาม:

> คุณไปงานปาร์ตี้ที่แทบไม่รู้จักใครเลย คุณจะทำอย่างไร?

```text
A. เดินเข้าไปคุยกับคนใหม่

B. อยู่กับคนที่รู้จัก

C. สังเกตคนอื่นก่อน

D. เริ่มคิดว่าจะกลับบ้านตอนไหน
```

แต่ละ Answer จะส่งผลต่อ Personality Dimensions แตกต่างกัน

---

# 9. User Personality Vector

หลังจากตอบ Quiz เสร็จ ระบบจะ Normalize คะแนนเป็นช่วง:

```text
0 – 100
```

ตัวอย่าง:

```text
Social          72
Decision        48
Lifestyle       35
Adventure       81
Responsibility  60
Expression      88
```

ข้อมูลนี้เรียกว่า:

```text
Personality Vector
```

---

# 10. Character Matching

นำ User Personality Vector ไปเปรียบเทียบกับ Character Personality Vector

ตัวอย่าง User:

```text
72
48
35
81
60
88
```

Furina:

```text
80
45
55
65
75
95
```

จากนั้นคำนวณระยะห่างระหว่าง User และ Character

---

# 11. Matching Algorithm

> Euclidean/Weighted Distance ด้านล่างเป็นแนวคิดตอนออกแบบเท่านั้น ระบบที่ implement จริงใช้สูตรอื่น (hybrid similarity) ดูสูตรจริงที่ `docs/CALCULATION_RULES_V1.md`

Algorithm เบื้องต้นสามารถใช้:

```text
Euclidean Distance
```

หรือใช้:

```text
Weighted Distance
```

ตัวอย่าง:

```ts
distance =
  socialDiff * 1.0 +
  decisionDiff * 1.0 +
  lifestyleDiff * 0.8 +
  adventureDiff * 1.0 +
  responsibilityDiff * 1.2 +
  expressionDiff * 1.0;
```

จากนั้น Convert Distance เป็น:

```text
Similarity %
```

ตัวอย่าง:

```text
Furina          87%
Fischl          82%
Venti           79%
Yoimiya         74%
Kaveh           71%
```

ควรหลีกเลี่ยง Hardcode เช่น:

```ts
if (social > 70 && expression > 70) {
  return "Furina";
}
```

เพราะจะทำให้เพิ่ม Character ใหม่ยาก และผลลัพธ์ไม่ยืดหยุ่น

---

# 12. Hidden Personality Traits

นอกจาก 6 Main Dimensions สามารถมี Hidden Traits เพิ่มเติมเพื่อเพิ่มความแม่นยำ

ตัวอย่าง:

```text
Leadership
Curiosity
Empathy
Ambition
Creativity
Discipline
Optimism
Independence
Competitiveness
Loyalty
Idealism
Humor
```

ตัวอย่าง Furina:

```json
{
  "creativity": 95,
  "empathy": 80,
  "leadership": 60,
  "discipline": 55,
  "optimism": 65
}
```

Hidden Traits ไม่จำเป็นต้องแสดงทั้งหมดให้ User เห็น

สามารถใช้เป็น Secondary Matching Layer ได้

---

# 13. Result Page

Result Page ไม่ควรแสดงแค่ชื่อ Character

ควรมี:

- Character
- Match Percentage
- Personality Title
- Personality Description
- Personality Dimensions
- Strongest Traits
- Strengths
- Weaknesses
- Similar Characters
- Share Result

ตัวอย่าง:

```text
━━━━━━━━━━━━━━━━━━━━

Your Genshin Personality

        FURINA

          87%
         MATCH

"The Dramatic Dreamer"

━━━━━━━━━━━━━━━━━━━━

You are expressive, imaginative,
and emotionally perceptive.

You enjoy making people smile,
but sometimes hide your own
insecurities behind confidence.

━━━━━━━━━━━━━━━━━━━━

Personality

Social          ████████░░ 82
Decision        █████░░░░░ 51
Adventure       ███████░░░ 73
Responsibility  ████████░░ 78
Expression      █████████░ 91

━━━━━━━━━━━━━━━━━━━━

Strongest Traits

Expressive
Creative
Empathetic
Imaginative

━━━━━━━━━━━━━━━━━━━━

Also Similar To

Fischl      82%
Venti       78%
Kaveh       75%

━━━━━━━━━━━━━━━━━━━━
```

---

# 14. Personality Titles

เพื่อให้ระบบมี Identity ของตัวเอง แต่ละ Character สามารถมี Personality Title

ตัวอย่าง:

```text
Furina
"The Dramatic Dreamer"

Zhongli
"The Timeless Observer"

Nahida
"The Curious Sage"

Venti
"The Free Spirit"

Neuvillette
"The Quiet Judge"

Klee
"The Innocent Adventurer"

Alhaitham
"The Rational Individualist"

Kaveh
"The Emotional Idealist"

Raiden Shogun
"The Resolute Guardian"
```

Title เหล่านี้เป็น Fan-made และสามารถปรับให้เข้ากับ Theme ของเว็บไซต์ได้

---

# 15. Character Scope

ไม่จำเป็นต้องรองรับตัวละครทั้งหมดตั้งแต่ V1

แนะนำเริ่มต้น:

```text
20–30 Characters
```

ควรเลือก Character ที่มี Personality แตกต่างกันมาก

ตัวอย่าง:

| Personality             | Character   |
| ----------------------- | ----------- |
| Reserved / Rational     | Alhaitham   |
| Reserved / Duty         | Zhongli     |
| Emotional / Idealistic  | Kaveh       |
| Extroverted / Energetic | Yoimiya     |
| Free Spirit             | Venti       |
| Dramatic                | Furina      |
| Curious / Thoughtful    | Nahida      |
| Competitive             | Childe      |
| Disciplined             | Jean        |
| Introverted             | Sucrose     |
| Mysterious / Playful    | Yae Miko    |
| Serious / Principled    | Neuvillette |
| Chaotic / Imaginative   | Fischl      |
| Independent             | Wanderer    |
| Protective              | Dehya       |

Development Roadmap:

```text
V1
30 Characters

V2
+20 Characters

V3
All Playable Characters
```

---

# 16. Technical Architecture

V1 สามารถทำเป็น Frontend-only Application ได้

ไม่จำเป็นต้องมี Backend

```text
React
 │
 ├── questions.json
 │
 ├── characters/_characters.json
 │
 ├── personality-dimensions.json
 │
 └── Quiz Engine
       │
       ├── calculatePersonality()
       │
       ├── calculateSimilarity()
       │
       └── rankCharacters()
               ↓
          Result Page
```

---

# 17. Recommended Tech Stack

Tech stack จริงที่ใช้และโครงสร้างไฟล์ปัจจุบัน ดูที่ `README.md` (หัวข้อ "Tech stack" และ "Data layout") — เอกสารนี้เก็บไว้เฉพาะ concept ตอนออกแบบ ไม่ใช่ record ของสิ่งที่ implement จริง

---

# 19. Development Workflow

```text
① Define Personality Dimensions

          ↓

② Research 20–30 Characters

          ↓

③ Create Character Personality Scores

          ↓

④ Design Questions

          ↓

⑤ Define Answer → Personality Score

          ↓

⑥ Implement Personality Calculation

          ↓

⑦ Implement Character Matching

          ↓

⑧ Create Result Descriptions

          ↓

⑨ Build Result Page

          ↓

⑩ Test & Balance
```

---

# 20. Important Part: Character Dataset

ส่วนที่สำคัญที่สุดของระบบไม่ใช่ UI หรือ Matching Algorithm

แต่คือ:

```text
Character Personality Dataset
```

Character แต่ละตัวควรวิเคราะห์จาก:

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
```

จากนั้นแปลงข้อมูลเหล่านี้เป็น Personality Score ด้วยมาตรฐานเดียวกัน

---

# 21. Testing & Balancing

หลังระบบเริ่มทำงานแล้วควรทดสอบหลาย Personality Profiles

เช่น:

```text
Highly Introverted
Highly Extroverted
Highly Rational
Highly Emotional
Highly Responsible
Highly Adventurous
Balanced Personality
```

ตรวจสอบว่า Character Distribution สมเหตุสมผลหรือไม่

ตัวอย่างปัญหาที่ต้องระวัง:

```text
Furina ได้ผลลัพธ์บ่อยเกินไป

Zhongli แทบไม่เคยออก

Character บางตัวมี Personality ใกล้กันเกินไป

บาง Dimension มี Weight สูงเกินไป
```

จากนั้นปรับ:

```text
Character Scores
Question Scores
Dimension Weights
Matching Formula
```

---

# 22. Future Features

หลัง V1 สามารถเพิ่ม Feature ได้ เช่น:

### Result Sharing

สร้าง Share Card:

```text
My Genshin Personality

FURINA

87% MATCH

"The Dramatic Dreamer"
```

สำหรับแชร์ลง Social Media

### Character Ranking

แสดง:

```text
Top 5 Matches
```

### Friend Comparison

เช่น:

```text
You
Furina 87%

Friend
Neuvillette 91%
```

### Statistics

ถ้ามี Backend:

```text
Most matched character
Character distribution
Average personality
Quiz completion rate
```

### Character Updates

เพิ่ม Character ใหม่เมื่อเกมมีตัวละครใหม่

---

# 23. Naming Ideas

ไม่จำเป็นต้องใช้คำว่า MBTI

สามารถสร้าง Brand ของระบบเอง เช่น:

```text
Teyvat Personality

Teyvat Persona

Vision Persona

Vision Personality

Genshin Character Match

Teyvat Character Match
```

ตัวอย่าง Tagline:

> **Discover which Teyvat character matches your personality.**

---

# 24. V1 Goal

เป้าหมายของ Version แรก:

```text
24 Questions

6 Personality Dimensions

20–30 Characters

Personality Matching Algorithm

Top Character Result

Top 3 Similar Characters

Personality Breakdown

Shareable Result
```

โดยทั้งหมดสามารถทำเป็น:

```text
Frontend Only
```

ก่อน แล้วค่อยเพิ่ม Backend / Database / Statistics ใน Version ถัดไป

---

# Disclaimer

โปรเจกต์นี้ควรระบุอย่างชัดเจนว่าเป็น:

> **Fan-made personality quiz inspired by Genshin Impact.**

Personality classification และ Character Personality Scores เป็นการวิเคราะห์และตีความของผู้สร้าง ไม่ใช่ข้อมูลหรือ Personality Classification อย่างเป็นทางการจาก HoYoverse
