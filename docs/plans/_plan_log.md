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

## 22 สิงหาคม 2026 — P0 quiz correctness pass

- สุ่มลำดับคำถามและคำตอบเมื่อเริ่มรอบใหม่ พร้อมเก็บ seed และลำดับจริงใน versioned progress เพื่อให้ resume ได้ชุดเดิม
- เมื่อเข้า Quiz ผ่านเมนูหลังทำจบ ระบบล้างเฉพาะ completed progress/result; progress ที่ยังไม่เสร็จยัง resume ได้
- เพิ่ม nearest-trait fallback เพื่อให้ Matching Traits ไม่ว่าง โดยไม่เปลี่ยนอันดับ Character Match
- ลดการคัดลอกข้อความหน้า Quiz ในระดับ UX ด้วย `user-select` และ context-menu deterrence โดยไม่อ้างว่าสามารถป้องกันการคัดลอกฝั่ง client ได้สมบูรณ์
- เปลี่ยน footer ให้แสดง disclaimer ตาม locale ทีละภาษา
- เพิ่ม engine verification ว่า Character Match ทุกตัวมี trait explanation อย่างน้อยหนึ่งรายการ

## 22 สิงหาคม 2026 — P1 locale typography and element pass

- ใช้ Prompt สำหรับเนื้อหา/UI ทั่วไป; ใช้ Cinzel กับชื่อและหัวข้อสำคัญภาษาอังกฤษ และ Mitr กับชื่อและหัวข้อสำคัญภาษาไทย พร้อม Google Fonts `font-display: swap`
- ใช้ Element assets ครบ 7 ธาตุใน badge, Vision Affinity และ Share Card preview พร้อม alt/fallback ที่อ่านได้
- เก็บ palette ครบ 7 ธาตุสำหรับ Vision Card, Character Detail และ Share Card พร้อมปรับ contrast ของข้อความ
- ตรวจ regression ด้วย data validation, engine verification, lint และ production build รวมถึง manual QA ที่ viewport เป้าหมาย

## 22 สิงหาคม 2026 — Vision Affinity and name-entry flow pass

- แก้ Vision Affinity Card ให้ใช้ CSS palette จาก `vision.element` โดยตรง; Hydro, Pyro, Anemo, Electro, Dendro, Cryo และ Geo จึงใช้สีและ Element icon ของตนเอง ไม่อิง Element ของ Character Match
- ปรับ Quiz route ที่ไม่มีคำตอบให้กลับไปขั้นกรอกชื่อก่อนเริ่ม และยัง resume ได้ทันทีเมื่อมี progress ที่ยังไม่เสร็จ
- ปุ่ม “เริ่มใหม่” จาก Quiz และ “ทำแบบทดสอบใหม่” จาก Result ล้าง progress/result ใน localStorage ทันที แล้วกลับไปขั้นกรอกชื่อ; รองรับการเว้นชื่อว่าง

## 22 สิงหาคม 2026 — P1 Matching transition

- เพิ่ม Matching transition 1.2 วินาทีที่แสดงลำดับการอ่านบุคลิก, หา Character Match, หา Vision Affinity และข้อความสุดท้ายก่อนเปิดหน้า Result
- รองรับ `prefers-reduced-motion`: ข้าม transition และไปหน้า Result ทันทีหลังคำนวณเสร็จ; การคำนวณยังเริ่มพร้อมกับ animation จึงไม่ถูกหน่วงเกินเวลาการแสดงผลสั้น ๆ

## กติกา Calculation V1 ที่นำไปใช้

- Character Match และ Vision Affinity คำนวณจาก User Profile เดียวกัน แต่เป็นระบบแยกกัน
- Character Match ใช้ dimension similarity 70% และ trait similarity 30%; ใช้คะแนนเต็มในการ sort ก่อนปัดเป็นเปอร์เซ็นต์สำหรับ UI
- Vision Affinity ใช้ normalized traits และ Element Personality Profiles เท่านั้น ไม่อนุมาน Vision จากธาตุของตัวละครที่ชนะ
- Progress/result เก็บ question และ algorithm versions เพื่อป้องกันข้อมูลเก่าที่ไม่เข้ากัน

## 24 สิงหาคม 2026 — P0 name-entry และ Vision Affinity regression ปิดงาน

- ตรวจ regression ของ name-entry flow ครบกรณีครั้งแรก, resume, reset ระหว่างทำ, เริ่มใหม่หลังจบ และการเว้นชื่อว่าง ผ่านทุกกรณี
- ตรวจ Vision Affinity Card ครบ 7 ธาตุในหน้า Result ผ่าน
- เริ่มออกแบบ P2 Shared Result: เขียน spec Firestore schema + Security Rules + testing plan ไว้ที่ [2026-08-24-shared-result-schema-rules-design.md](../superpowers/specs/2026-08-24-shared-result-schema-rules-design.md) (ยังเป็น design เท่านั้น ยังไม่ implement)

## 25 สิงหาคม 2026 — P2 Shared Result schema/rules

- ใช้ Firestore schema `sharedResults/{id}` แบบ self-contained snapshot ตาม spec 2026-08-24-shared-result-schema-rules-design.md
- เขียนและทดสอบ Firestore Security Rules แบบ create/read only ผ่าน Firestore Emulator (`pnpm run verify:shared-result`)
- เพิ่ม `publishSharedResult` write helper พร้อม id-collision retry ให้ item 3 (publish flow UI) เรียกใช้ต่อได้ทันที

## 25 สิงหาคม 2026 — P2 Shared Result publish flow และหน้าอ่านอย่างเดียว

- Deploy Firestore Rules จากรอบก่อนเข้า production project จริงแล้ว (manual deploy)
- เพิ่มปุ่ม "สร้างลิงก์ข้ามอุปกรณ์" บน Result Page เรียก `publishSharedResult` แล้ว copy ลิงก์ `#/shared/:id` ให้ทันที; cache ผลลัพธ์ที่เผยแพร่แล้วไว้ในหน้าเดียวกัน กดซ้ำไม่สร้าง document ใหม่
- เพิ่มหน้า `SharedResultPage` อ่านผลจาก Firestore ตาม id ใน URL แบบอ่านอย่างเดียว มี loading state และใช้ empty-state เดิม (`invalidResult`) เมื่อไม่พบ document
- ทดสอบ manual QA จริงกับ production Firestore ผ่าน browser: publish สำเร็จ, เปิดลิงก์ข้ามแท็บอ่านได้ถูกต้องทั้งไทย/อังกฤษ, ลิงก์ปลอมแสดง invalid-result ถูกต้อง, ไม่ error ใน console
- หมายเหตุ: มี test document ปลอม (ชื่อ "Test Character") ค้างอยู่ใน production `sharedResults` collection จากการทดสอบนี้ 3 รายการ ลบเองไม่ได้ผ่านแอพ (rules ห้าม delete) ต้องเข้า Firebase Console ลบเองถ้าต้องการ

## 25 สิงหาคม 2026 — P2 Shared Result item 4-5 ปิดครบ (P2 เสร็จทั้งหมด)

- `SharedResultPage` เช็ค version เพิ่ม: ถ้า `schemaVersion`/`questionVersion`/`algorithmVersion` ของ document ไม่ตรงกับ `QUESTION_VERSION`/`ALGORITHM_VERSION` ปัจจุบันของ engine จะโชว์ empty-state คนละชุดจากกรณี "ลิงก์ไม่มีอยู่" (copy ใหม่ `sharedResultUnsupported`) แยกจากกันชัดเจนตามที่ backlog ระบุ
- เพิ่ม client-side rate limit ที่ `src/utils/share-throttle.ts`: จำกัด publish 5 ครั้ง/ชั่วโมง (rolling window) ผ่าน localStorage — ตัดสินใจใช้เป็นมาตรการหลักของ item 5 เลย ไม่ทำ App Check เพิ่มเพราะเป็น fan project เล็กไม่มีเงินเกี่ยวข้อง (**ข้อจำกัด**: กันได้แค่การกดสแปมจากเบราว์เซอร์เดียวกันโดยไม่ตั้งใจ ไม่กัน script ที่ยิง Firestore API ตรงเพราะ create rule ยังเปิดสาธารณะ)
- ทดสอบ manual QA ผ่าน browser automation: เปิด document เก่าที่มี version ไม่ตรง → ขึ้น "ผลลัพธ์นี้มาจากเวอร์ชันเก่า" ถูกต้อง; seed throttle ให้เต็ม 5 แล้วกด publish → บล็อกทันทีไม่ยิง Firestore, โชว์ "สร้างลิงก์บ่อยเกินไป ลองใหม่ภายหลัง"; publish ปกติหลังเคลียร์ throttle → สำเร็จและบันทึก timestamp ใหม่ถูกต้อง — ไม่ใช่ QA ข้ามอุปกรณ์กายภาพจริง ทำผ่าน browser automation เท่านั้น
- P2 ปิดครบทั้ง 5 ข้อแล้ว

## 25 สิงหาคม 2026 — Cookie Consent banner (นอก backlog เดิม)

- เพิ่ม cookie/localStorage consent banner + preferences dialog ตามคำขอนอกรอบ (ไม่ได้อยู่ใน P2/P3 เดิม) spec/plan อยู่ที่ [2026-08-25-cookie-consent-design.md](../superpowers/specs/2026-08-25-cookie-consent-design.md) และ [2026-08-25-cookie-consent.md](../superpowers/plans/2026-08-25-cookie-consent.md)
- หมวด Necessary (บังคับ ไม่มี toggle) กับ Analytics (opt-in, ยังไม่มี SDK จริงให้ gate) — `hasAnalyticsConsent()` พร้อมให้ analytics งานอนาคตเรียกใช้ได้เลย
- Banner โชว์เฉพาะยังไม่ตัดสินใจ, มีลิงก์ "ตั้งค่าคุกกี้" ถาวรใน footer ให้เปลี่ยนใจทีหลังได้
- ไม่ทำ Ads/Marketing category และไม่ย้าย localStorage เดิม (quiz progress/result, theme, locale, share-throttle) มาอยู่หลัง consent gate ตามที่ตัดสินใจไว้ (จัดเป็น Necessary ที่กฎหมายยกเว้นได้)
- Final review เจอ bug จริง: cookie banner (fixed bottom) บัง vision-effect picker กับ footer บนหน้า Landing แก้แล้วด้วย offset ตาม breakpoint พร้อม verify จริงที่ width 320px (worst case วัดได้ ~315px สูง เผื่อ margin เป็น 350/370px)
- ทดสอบ manual QA ผ่าน browser ครบ 6 สถานการณ์ (first-visit, accept-all, necessary-only, dialog reflect ทั้ง 2 ทางเข้า, close-without-save, banner reappear ผ่าน dialog path)

## 26 สิงหาคม 2026 — P3 การนำเสนอและการแชร์ต่อ (ปิดครบ)

- เพิ่มปุ่ม Social Share หลัง P2 เสร็จ เพื่อให้แชร์ immutable shared URL แทนข้อมูลผลใน client
- เพิ่ม QR ใน Share Card หลังมี shared URL แล้ว
- P3 เสร็จทั้งหมดและย้ายออกจาก Development Plan แล้ว

## Verification ล่าสุด

- `corepack pnpm validate:data` ผ่าน: 24 questions, 39 traits, 125 characters, 7 elements
- `corepack pnpm verify:engine` ผ่าน: 4 deterministic answer sets
- `corepack pnpm lint` ผ่าน
- `corepack pnpm build` ผ่าน
- `corepack pnpm verify:shared-result` ผ่าน: schema/rules verification ผ่าน Firestore Emulator
- Regression QA และ manual QA ที่ viewport เป้าหมายผ่านแล้วเมื่อ 22 สิงหาคม 2026

รายละเอียดแบบเต็มของแผนเดิมอยู่ในประวัติ Git; ให้เพิ่มผลการปรับ weights และผล QA รอบถัดไปในไฟล์นี้เมื่อปิดงานได้
