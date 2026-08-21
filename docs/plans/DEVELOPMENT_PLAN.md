# Teyvat Personalities — Development Plan

สถานะล่าสุด: 21 สิงหาคม 2026

งานที่เสร็จแล้วอยู่ใน [_plan_log.md](_plan_log.md) ไฟล์นี้เก็บเฉพาะ backlog ที่จะทำต่อ โดยนำรายการจาก `TODO.md` มาจัดลำดับใหม่ตามความเสี่ยงและลำดับพึ่งพา

## ข้อตกลงของแผนนี้

- Shared Result ที่เปิดข้ามอุปกรณ์ได้และแก้ผลไม่ได้ **ทำใน phase หลัง** ไม่ใช่งานรอบถัดไป
- เมื่อทำ จะใช้ Firebase ผ่าน Web SDK ตาม stack ปัจจุบัน และใช้ URL แบบ HashRouter คือ `#/shared/:id` เพื่อให้ใช้กับ GitHub Pages ได้
- ข้อมูลที่เผยแพร่จะเป็น snapshot ของผลลัพธ์แบบ versioned เท่านั้น ไม่เก็บคำตอบดิบหรือชื่อผู้เล่นโดยอัตโนมัติ
- Firestore Rules ต้องอนุญาตเฉพาะการสร้างและอ่านผลที่แชร์ ห้ามแก้ไขหรือลบหลังสร้าง การแก้ `id` ใน URL จึงทำได้เพียงไปยังลิงก์อื่น ไม่สามารถเปลี่ยนผลในเอกสารเดิมได้
- การกัน spam/abuse สำหรับ public create (เช่น App Check หรือ Anonymous Auth) เป็นการตัดสินใจก่อนเปิดใช้จริงใน phase นั้น

## P0 — ความถูกต้องของการเล่นและคำอธิบายผล

1. [ ] สุ่มคำถามและลำดับคำตอบเมื่อเริ่มรอบใหม่ แล้วบันทึก seed/ลำดับไว้ใน progress เพื่อให้การ resume แสดงชุดเดิมและไม่กระทบคะแนน
2. [ ] เมื่อเข้าหน้าแบบทดสอบผ่านเมนูหลังทำเสร็จ ให้ล้างเฉพาะ completed quiz/result แล้วเริ่มรอบใหม่; progress ที่ยังทำไม่เสร็จยัง resume ได้
3. [ ] ทำให้ Matching Traits ไม่ว่างเสมอ: หากไม่มี trait ผ่าน threshold ให้เลือก trait ที่ใกล้ที่สุดจากคะแนนของผู้เล่นและ character profile โดยไม่เปลี่ยนอันดับ Character Match
4. [ ] ลดการคัดลอกข้อความในหน้าทำแบบทดสอบในระดับ UX (เช่น `user-select` และ context menu) พร้อมยอมรับว่าเว็บฝั่ง client ไม่สามารถป้องกันการคัดลอกได้จริง
5. [ ] ตรวจสอบ regression: data validation, engine verification, production build และเล่นครบ flow ด้วยตนเอง
6. [ ] Footer ไม่ได้แสดงสองภาษา แต่ว่าแสดงดีละภาษา ระบบมีสองภาษา ไม่ได้แสดงพร้อมกันสองภาษา

## P1 — ระบบภาพและภาษา

1. [ ] วางระบบฟอนต์ตาม locale พร้อม fallback และ `font-display: swap`

   - ไทย: Mitr (พื้นฐาน), Anuphan (เนื้อหา/คำถาม), Thasadith (คำบรรยาย)
   - อังกฤษ: Marcellus (พื้นฐาน/ชื่อหน้า/ชื่อตัวละคร), Jost (UI/ปุ่ม/คำถาม), Cinzel (หัวข้อแฟนตาซี)

2. [ ] ใช้รูป Element จาก `src/assets/images/elements` ใน Element/Vision Affinity UI พร้อม `alt` และ fallback ที่อ่านได้
3. [ ] เก็บรายละเอียดโทนสี Element ของ Vision Affinity ให้ครบทุกสถานะ รวมถึง contrast หน้าดูตัวละคร และ share card
4. [ ] ทำ manual QA ซ้ำที่ viewport เป้าหมายหลังปรับฟอนต์และสื่อ Element

## P2 — Shared Result ข้ามอุปกรณ์ (เลื่อนทำภายหลัง)

1. [ ] ออกแบบ Firestore schema สำหรับ published result: opaque ID, result snapshot, algorithm/data version และเวลาเผยแพร่
2. [ ] เขียนและทดสอบ Firestore Security Rules แบบ create/read only พร้อมตรวจว่า client แก้ไขหรือลบ published result ไม่ได้
3. [ ] สร้าง publish flow หลังคำนวณผลสำเร็จ และหน้า read-only `#/shared/:id` สำหรับเปิดผลจากอุปกรณ์อื่น
4. [ ] จัดการกรณีลิงก์ไม่มีอยู่, version เก่า และผลที่ไม่รองรับ โดยแสดง CTA ให้เริ่มแบบทดสอบแทน
5. [ ] ตัดสินใจมาตรการป้องกัน public-write abuse ก่อนเปิด production แล้วจึงทำ end-to-end QA บนอุปกรณ์/เบราว์เซอร์ต่างกัน

## P3 — การนำเสนอและการแชร์ต่อ

1. [ ] ทำ Matching transition animation และข้อความลำดับสุดท้าย หลัง flow ผลลัพธ์นิ่งแล้ว
2. [ ] เพิ่มปุ่ม Social Share หลัง P2 เสร็จ เพื่อให้แชร์ immutable shared URL แทนข้อมูลผลใน client
3. [ ] เพิ่ม QR ใน Share Card หลังมี shared URL แล้ว
4. [ ] แยก QR สำหรับหน้า download เกมและ HoYo credit ออกจาก QR สำหรับ shared result แล้วกำหนดปลายทางของแต่ละอันให้ชัดก่อนออกแบบ

## งานต่อเนื่องนอกแผนผลิตภัณฑ์

- [ ] รวบรวม feedback จากผู้ทดสอบจริงและปรับ weights ตาม [CALCULATION_RULES_PLAN.md](CALCULATION_RULES_PLAN.md) เมื่อมีข้อมูลเพียงพอ

## ไม่เพิ่มกลับเข้า backlog

- โครงสี Vision Affinity และผลลัพธ์ส่วนหนึ่งเสร็จแล้ว; P1 เหลือการใช้รูป Element และตรวจความครบถ้วนของทุกบริบท
- งาน Character directory, local name ก่อนเริ่มแบบทดสอบ, navigation และ result flow ที่เสร็จแล้วอ้างอิงใน `_plan_log.md`
