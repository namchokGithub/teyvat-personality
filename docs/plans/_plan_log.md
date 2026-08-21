# Plan Log

บันทึกงานที่เสร็จแล้วจากแผนพัฒนา เพื่อให้ไฟล์แผนหลักเหลือเฉพาะงานค้าง

## 21 สิงหาคม 2026 — Development baseline

- วาง Vite + React + TypeScript สำหรับ GitHub Pages ด้วย hash routing และรองรับไทย/อังกฤษ
- สร้าง Landing, Quiz 24 ข้อ, Matching, Result, Character Directory และ Character Detail
- เพิ่ม responsive layout, keyboard/screen-reader semantics, focus management, dialog accessibility และ reduced-motion support
- เพิ่ม quiz/result persistence, versioning, sharing URL, Web Share/clipboard fallback และ Share Card PNG
- เชื่อม factual character data, character personality profiles `125` ตัว และ element personality profiles `7` ธาตุ
- กำหนด artwork manifest, licensing/coverage report และ fallback สำหรับ artwork ที่โหลดไม่ได้

## 21 สิงหาคม 2026 — Calculation Engine baseline

- เติม trait coverage ให้ครอบคลุม Element Profiles และตรวจ schema/id/score range/duplicate id อัตโนมัติก่อน build
- สร้าง User Personality Profile: normalize 6 dimensions ตาม theoretical min/max และ 39 traits เป็นช่วง `0–1`
- สร้าง Character Match จาก dimension similarity `70%` และ trait similarity `30%` พร้อม deterministic tie-break ที่ไม่ขึ้นกับลำดับไฟล์
- สร้าง Vision Affinity แยกจาก Character Match โดยใช้ weighted traits และ primary-trait factor `0.85–1.00`
- เชื่อมผลจริงเข้ากับ Matching, Result, localStorage persistence และ Share URL
- เพิ่ม deterministic engine verification และ balance simulation `10,000` ชุด
- Visual QA รอบแรกใน browser viewports เป้าหมายทำแล้ว; findings ที่ต้องแก้และตรวจซ้ำติดตามใน `DEVELOPMENT_PLAN.md`

## Verification ล่าสุด

- `corepack pnpm validate:data` ผ่าน: 24 questions, 39 traits, 125 characters, 7 elements
- `corepack pnpm verify:engine` ผ่าน: 4 deterministic answer sets
- `corepack pnpm lint` ผ่าน
- `corepack pnpm build` ผ่าน

## 21 สิงหาคม 2026 — P0 usability and asset pass

- เปลี่ยน footer เป็น disclaimer ไทย–อังกฤษ พร้อม `By Lesser Lord Kusanali © 2026`
- ปุ่มเริ่มใหม่ของ Quiz ล้าง progress ได้ และ progress ที่ไม่มีการตอบต่อเนื่องเกิน 5 นาทีจะถูกเริ่มใหม่เมื่อกลับเข้า Quiz
- ใช้ full artwork ใน Character Directory และ Character Detail; Directory ใช้ `loading="lazy"` กับ async decoding และทุกหน้า fallback เป็นอักษรเมื่อภาพโหลดไม่ได้
- ปรับภาพ Result Page ให้มี fallback และ responsive portrait สำหรับหน้าจอเล็ก
- ยกเลิก shared-result URL/query flow และตัด Web Share, Copy Link, Copy Summary และ shared-result notice ออกจาก UI; หน้าผลลัพธ์เหลือการดาวน์โหลด Share Card

## 21 สิงหาคม 2026 — P1 result experience pass

- เอาเมนูและปุ่ม “ตัวอย่างผลลัพธ์” ออกจาก Header และหน้า Home
- เพิ่ม dialog กรอกชื่อก่อนเริ่ม Quiz; ชื่อมีความยาวสูงสุด 40 ตัวอักษรและเก็บเฉพาะใน localStorage ของอุปกรณ์
- เพิ่มไอคอน Region และ Element บน Result Page และ Character Detail
- เพิ่ม palette สำหรับทั้ง 7 ธาตุใน Result Card, Vision Card และ PNG Share Card เพื่อให้สีสัมพันธ์กับ Element/Vision

## กติกา Calculation V1 ที่นำไปใช้

- Character Match และ Vision Affinity คำนวณจาก User Profile เดียวกัน แต่เป็นระบบแยกกัน
- Character Match ใช้ dimension similarity 70% และ trait similarity 30%; ใช้คะแนนเต็มในการ sort ก่อนปัดเป็นเปอร์เซ็นต์สำหรับ UI
- Vision Affinity ใช้ normalized traits และ Element Personality Profiles เท่านั้น ไม่อนุมาน Vision จากธาตุของตัวละครที่ชนะ
- Progress/result เก็บ question และ algorithm versions เพื่อป้องกันข้อมูลเก่าที่ไม่เข้ากัน

รายละเอียดแบบเต็มของแผนเดิมอยู่ในประวัติ Git; ให้เพิ่มผลการปรับ weights และผล QA รอบถัดไปในไฟล์นี้เมื่อปิดงานได้
