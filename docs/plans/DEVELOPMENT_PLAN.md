# Teyvat Personalities — Development Plan

สถานะล่าสุด: 24 สิงหาคม 2026

งานที่เสร็จแล้วอยู่ใน [_plan_log.md](_plan_log.md) ไฟล์นี้เก็บเฉพาะ backlog ที่จะทำต่อ โดยนำรายการจาก `TODO.md` มาจัดลำดับใหม่ตามความเสี่ยงและลำดับพึ่งพา

## ข้อตกลงของแผนนี้

- Shared Result ที่เปิดข้ามอุปกรณ์ได้และแก้ผลไม่ได้ **ทำใน phase หลัง** ไม่ใช่งานรอบถัดไป
- เมื่อทำ จะใช้ Firebase ผ่าน Web SDK ตาม stack ปัจจุบัน และใช้ URL แบบ HashRouter คือ `#/shared/:id` เพื่อให้ใช้กับ GitHub Pages ได้
- ข้อมูลที่เผยแพร่จะเป็น snapshot ของผลลัพธ์แบบ versioned เท่านั้น ไม่เก็บคำตอบดิบหรือชื่อผู้เล่นโดยอัตโนมัติ
- Firestore Rules ต้องอนุญาตเฉพาะการสร้างและอ่านผลที่แชร์ ห้ามแก้ไขหรือลบหลังสร้าง การแก้ `id` ใน URL จึงทำได้เพียงไปยังลิงก์อื่น ไม่สามารถเปลี่ยนผลในเอกสารเดิมได้
- การกัน spam/abuse สำหรับ public create (เช่น App Check หรือ Anonymous Auth) เป็นการตัดสินใจก่อนเปิดใช้จริงใน phase นั้น

## P2 — Shared Result ข้ามอุปกรณ์ (เลื่อนทำภายหลัง)

1. [x] ออกแบบ Firestore schema สำหรับ published result: opaque ID, result snapshot, algorithm/data version และเวลาเผยแพร่ — spec พร้อมแล้วใน [2026-08-24-shared-result-schema-rules-design.md](../superpowers/specs/2026-08-24-shared-result-schema-rules-design.md) รอ implementation
2. [x] เขียนและทดสอบ Firestore Security Rules แบบ create/read only พร้อมตรวจว่า client แก้ไขหรือลบ published result ไม่ได้ — spec พร้อมแล้วในไฟล์เดียวกันข้างบน รอ implementation
3. [ ] สร้าง publish flow หลังคำนวณผลสำเร็จ และหน้า read-only `#/shared/:id` สำหรับเปิดผลจากอุปกรณ์อื่น
4. [ ] จัดการกรณีลิงก์ไม่มีอยู่, version เก่า และผลที่ไม่รองรับ โดยแสดง CTA ให้เริ่มแบบทดสอบแทน
5. [ ] ตัดสินใจมาตรการป้องกัน public-write abuse ก่อนเปิด production แล้วจึงทำ end-to-end QA บนอุปกรณ์/เบราว์เซอร์ต่างกัน

## P3 — การนำเสนอและการแชร์ต่อ

1. [ ] เพิ่มปุ่ม Social Share หลัง P2 เสร็จ เพื่อให้แชร์ immutable shared URL แทนข้อมูลผลใน client
2. [ ] เพิ่ม QR ใน Share Card หลังมี shared URL แล้ว
3. [ ] แยก QR สำหรับหน้า download เกมและ HoYo credit ออกจาก QR สำหรับ shared result แล้วกำหนดปลายทางของแต่ละอันให้ชัดก่อนออกแบบ

## งานต่อเนื่องนอกแผนผลิตภัณฑ์

- [ ] รวบรวม feedback จากผู้ทดสอบจริงและปรับ weights ตาม [CALCULATION_RULES_V1.md](../CALCULATION_RULES_V1.md) เมื่อมีข้อมูลเพียงพอ

## ไม่เพิ่มกลับเข้า backlog

- งานสุ่มคำถาม/คำตอบ, Matching Traits fallback, copy deterrence, footer ตาม locale, ฟอนต์ตาม locale, Element assets/palettes และ regression QA เดิมปิดแล้วและบันทึกใน `_plan_log.md`
- งาน Character Directory, navigation และ result flow ส่วนที่เสร็จแล้วอ้างอิงใน `_plan_log.md`; P0 รอบนี้แก้เฉพาะเส้นทางเข้า name entry ตาม TODO ล่าสุด
