# Teyvat Personalities — Development Plan

สถานะล่าสุด: 27 สิงหาคม 2026

งานที่เสร็จแล้วอยู่ใน [_plan_log.md](_plan_log.md) ไฟล์นี้เก็บเฉพาะ backlog ที่จะทำต่อ โดยนำรายการจาก `TODO.md` มาจัดลำดับใหม่ตามความเสี่ยงและลำดับพึ่งพา

## P0 — รองรับ Mobile In-App Browser

เป้าหมาย: ผู้ใช้ที่เปิดลิงก์ผ่าน in-app browser ของแอป เช่น Facebook, Messenger, LINE, Instagram และ TikTok ต้องทำแบบทดสอบและเห็นผลลัพธ์ได้ โดยระบบต้องไม่ล้มเงียบเมื่อโหลดข้อมูลหรือใช้งาน Web Storage ไม่สำเร็จ ทั้งนี้ Facebook/Messenger เป็นเคสตั้งต้นที่พบปัญหา แต่แนวทางแก้ต้องไม่ผูกกับ user agent หรือ WebView ของแอปใดแอปหนึ่ง

หัวข้อ 1–3 ทั้งหมด (จำแนก matching error/recovery UI, รวมการโหลด personality data เป็น chunk เดียว, ทำให้ progress/result ทนต่อ Web Storage failure) และหัวข้อ 4 ข้อ 1/2/3/5 (verification scripts + Playwright QA รวมถึงเจอและแก้ bug จริง 2 ตัว) เสร็จและตรวจสอบแล้วทั้งหมด — ดูรายละเอียดที่ [_plan_log.md](_plan_log.md)

เหลือเฉพาะงานที่ automation ทำแทนไม่ได้ ต้องทำบนอุปกรณ์จริง:

### 4. Verification และเกณฑ์ยอมรับ (ส่วนที่เหลือ)

4. [ ] ทำ manual flow ตั้งแต่เริ่ม quiz จนถึง Result Page บน mobile in-app browser จริงตาม [p0-in-app-browser-test-matrix.md](p0-in-app-browser-test-matrix.md) — Android พร้อมกรอกผลได้แล้วทั้ง 5 แอป (Facebook, Messenger, LINE, Instagram, TikTok); ยังไม่มี iOS เลย (known gap)
6. [ ] ถือว่า P0 เสร็จเมื่อ in-app browser ตาม test matrix แสดงผลลัพธ์ได้ หรือแสดง recovery UI ที่ใช้งานได้โดยไม่ล้มเงียบ ครบทั้ง Facebook/Messenger (ต้องผ่านทั้ง Android **และ** iOS) และ LINE/Instagram/TikTok (อย่างน้อยแอปละ 1 platform) — **ปัจจุบัน block อยู่ที่ยังไม่มี iOS มาทดสอบ**
