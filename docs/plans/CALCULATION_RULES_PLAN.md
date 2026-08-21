# Calculation Rules Plan

สถานะ: Calculation Engine baseline เสร็จแล้ว; เหลืองานปรับ balance จากผู้ทดสอบจริง

รายละเอียดของงานที่เสร็จแล้วและกติกา V1 ถูกย้ายไปที่ [_plan_log.md](_plan_log.md)

## งานค้าง

- [ ] รวบรวม feedback จากผู้ทดสอบจริง ตรวจผลที่ผู้ทดสอบรู้สึกว่าไม่สอดคล้อง แล้วปรับ weights ตามหลักฐาน

## ก่อนปิดงานนี้

1. กำหนดกลุ่มผู้ทดสอบและแบบฟอร์ม feedback ที่เก็บคำตอบ, ผลที่ได้, และความเห็นต่อ Character Match / Vision Affinity
2. ปรับเฉพาะ weights ที่มีหลักฐานจาก feedback และบันทึกเหตุผลพร้อม algorithm version ใหม่
3. รัน `corepack pnpm validate:data`, `corepack pnpm verify:engine`, `corepack pnpm simulate:balance` และ `corepack pnpm build`
4. บันทึกผลก่อน–หลังลง `_plan_log.md` แล้วลบไฟล์นี้เมื่อไม่มีงานค้าง
