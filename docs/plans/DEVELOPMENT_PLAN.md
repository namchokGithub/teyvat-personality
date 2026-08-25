# Teyvat Personalities — Development Plan

สถานะล่าสุด: 25 สิงหาคม 2026

งานที่เสร็จแล้วอยู่ใน [_plan_log.md](_plan_log.md) ไฟล์นี้เก็บเฉพาะ backlog ที่จะทำต่อ โดยนำรายการจาก `TODO.md` มาจัดลำดับใหม่ตามความเสี่ยงและลำดับพึ่งพา

## P3 — การนำเสนอและการแชร์ต่อ

1. [ ] เพิ่มปุ่ม Social Share หลัง P2 เสร็จ เพื่อให้แชร์ immutable shared URL แทนข้อมูลผลใน client
2. [ ] เพิ่ม QR ใน Share Card หลังมี shared URL แล้ว
3. [ ] แยก QR สำหรับหน้า download เกมและ HoYo credit ออกจาก QR สำหรับ shared result แล้วกำหนดปลายทางของแต่ละอันให้ชัดก่อนออกแบบ

## งานต่อเนื่องนอกแผนผลิตภัณฑ์

- [ ] รวบรวม feedback จากผู้ทดสอบจริงและปรับ weights ตาม [CALCULATION_RULES_V1.md](../CALCULATION_RULES_V1.md) เมื่อมีข้อมูลเพียงพอ

## ไม่เพิ่มกลับเข้า backlog

- งานสุ่มคำถาม/คำตอบ, Matching Traits fallback, copy deterrence, footer ตาม locale, ฟอนต์ตาม locale, Element assets/palettes และ regression QA เดิมปิดแล้วและบันทึกใน `_plan_log.md`
- งาน Character Directory, navigation และ result flow ส่วนที่เสร็จแล้วอ้างอิงใน `_plan_log.md`; P0 รอบนี้แก้เฉพาะเส้นทางเข้า name entry ตาม TODO ล่าสุด
- P2 Shared Result ข้ามอุปกรณ์ปิดครบทั้ง 5 ข้อแล้ว บันทึกใน `_plan_log.md`
