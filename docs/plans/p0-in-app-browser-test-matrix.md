# P0 — Mobile In-App Browser Test Matrix

สำหรับติดตามการทดสอบจริงตาม [`DEVELOPMENT_PLAN.md`](DEVELOPMENT_PLAN.md) หัวข้อ 1 ข้อ 4 (สร้าง matrix) และหัวข้อ 4 ข้อ 4 (รัน manual flow ตาม matrix นี้)

อุปกรณ์ที่มีจริง (ยืนยันแล้วในหัวข้อ 1 ข้อ 5, 2026-08-26): **Android 1 เครื่อง ล็อกอินพร้อมทดสอบครบ 5 แอป** — **ไม่มี iOS** แถวที่ต้องใช้ iOS (3, 4, 7, 8) จึง **block อยู่** จนกว่าจะมีทางเข้าถึง iOS (ตัดสินใจแล้วว่าเก็บเป็น known gap ไปก่อน ไม่รีบหามาปิดตอนนี้) แถวที่เหลือเริ่มกรอกได้เลย

## Link ที่ต้องทดสอบ

- Production: `https://namchokgithub.github.io/teyvat-personality/` (ตรวจ URL จริงอีกครั้งก่อนใช้ — อิงจาก GitHub Pages base path `/teyvat-personality/` ใน `vite.config.ts` และ git remote `namchokGithub/teyvat-personality`)
- ลิงก์ shared-result อย่างน้อย 1 ลิงก์จริง (`#/shared/:id`) — สร้างจากการทำแบบทดสอบแล้วกด "สร้างลิงก์ข้ามอุปกรณ์" ก่อนเริ่ม matrix

## Scenario ที่ต้องทดสอบต่อแถว

- **A — Shared link**: เปิดลิงก์ `#/shared/:id` ตรงในแอปแชท (จำลองเคสที่พบบ่อยสุด: มีคนแชร์ผลลัพธ์ในแชท/โพสต์ แล้วมีคนกดเปิด)
- **B — Full quiz**: เปิดลิงก์หน้าแรก แล้วทำแบบทดสอบทั้งหมดจนถึง Result Page จริง (เคสที่ชนความเสี่ยงที่ระบุไว้ในหัวข้อ 1: data-load 125 chunk, localStorage, MatchingPage catch-all)

Scenario B คือตัวที่ชน matching flow จริง (จึงเป็นตัวหลักที่ต้องผ่าน); Scenario A ทดสอบ path การอ่านผลอย่างเดียวซึ่งมี error handling คนละชุด (`SharedResultPage` empty-state เดิม ไม่ใช่ `MatchingError`)

## เกณฑ์ขั้นต่ำ (จาก `DEVELOPMENT_PLAN.md` หัวข้อ 4 ข้อ 4)

- Facebook และ Messenger: ต้องผ่านทั้ง Android และ iOS (เคสตั้งต้นที่พบปัญหา)
- LINE, Instagram, TikTok: อย่างน้อยแอปละ 1 platform (Android หรือ iOS อย่างใดอย่างหนึ่งก็ได้ ถ้าไม่มีอุปกรณ์ครบทั้งสอง platform)

## คำอธิบายคอลัมน์ "ผลลัพธ์"

- ✅ **Success** — ถึง Result Page ปกติ (Scenario B) หรือเห็นผลลัพธ์ที่แชร์ถูกต้อง (Scenario A)
- ⚠️ **Recovery UI** — เจอ error แต่ระบบแสดงหน้า/ข้อความ error ที่ใช้งานได้ (ปุ่ม retry/กลับไปทำแบบทดสอบ ตามที่ implement ไว้ในหัวข้อ 1 ข้อ 3) ไม่ใช่ค้างเงียบหรือจอขาว
- ❌ **Silent failure / crash** — ค้างเงียบ, จอขาว, redirect กลับ `/quiz` โดยไม่มีคำอธิบาย, หรือแอป/WebView crash — ถือว่า P0 ยังไม่ผ่านสำหรับแถวนี้

## คำอธิบายคอลัมน์ "Error category"

ตรงกับ `MatchingErrorCategory` ใน `src/lib/matching-errors.ts`: `data-load` | `calculation` | `storage` | `navigation` | `none` (ไม่มี error) | `other` (error ที่ไม่เข้า 4 หมวดข้างต้น เช่น WebView crash, network timeout ระดับ browser)

## ตาราง

| # | App | App version | OS & version | Device model | WebView/Browser engine | Network | Scenario | ผลลัพธ์ | Error category | Tester | Date | Notes |
|---|-----|-------------|---------------|---------------|--------------------------|---------|----------|---------|-----------------|--------|------|-------|
| 1 | Facebook | | Android | | | | B | | | | | |
| 2 | Facebook | | Android | | | | A | | | | | |
| 3 | Facebook | | iOS | | | | B | 🚫 BLOCKED — ไม่มี iOS | — | | | ดู known gap ด้านบน |
| 4 | Facebook | | iOS | | | | A | 🚫 BLOCKED — ไม่มี iOS | — | | | ดู known gap ด้านบน |
| 5 | Messenger | | Android | | | | B | | | | | |
| 6 | Messenger | | Android | | | | A | | | | | |
| 7 | Messenger | | iOS | | | | B | 🚫 BLOCKED — ไม่มี iOS | — | | | ดู known gap ด้านบน |
| 8 | Messenger | | iOS | | | | A | 🚫 BLOCKED — ไม่มี iOS | — | | | ดู known gap ด้านบน |
| 9 | LINE | | Android | | | | B | | | | | |
| 10 | LINE | | Android | | | | A | | | | | |
| 11 | Instagram | | Android | | | | B | | | | | |
| 12 | Instagram | | Android | | | | A | | | | | |
| 13 | TikTok | | Android | | | | B | | | | | |
| 14 | TikTok | | Android | | | | A | | | | | |

แถว 1–8 (Facebook/Messenger ทั้งสอง platform) ต้องกรอกครบและผ่านทุกแถว ก่อนถือว่า P0 ผ่านเกณฑ์ในหัวข้อ 4 ข้อ 6 ของแผน — **แถว 3, 4, 7, 8 block อยู่จนกว่าจะมี iOS** (P0 ปิดงานไม่ได้จนกว่าจะแก้ gap นี้) แถว 9–14 กรอกอย่างน้อย 1 แถวต่อแอป (ตอนนี้มีแค่ Android ก็เพียงพอตามเกณฑ์) เพิ่มแถวใหม่ได้ถ้าเจอ error แล้วอยากบันทึกเคสเพิ่ม — เลขแถวไม่ต้องเรียงต่อ

## หลังทดสอบ

- ถ้าเจอ ❌ ที่ Facebook/Messenger: ต้องแก้ก่อน ไม่ใช้ logic เฉพาะ user agent ของแอปนั้นเป็นทางแก้ (ตามข้อบังคับ P0)
- สรุปผลรวมและ pattern ที่เจอ (ไม่ใช่แค่ copy ตารางดิบ) ไปต่อใน `_plan_log.md` เมื่อ P0 ปิดงาน ตามรูปแบบเดิมของไฟล์นั้น
