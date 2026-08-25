# Cookie Consent — Design

สถานะ: draft สำหรับ implementation plan ต่อไป ยังไม่ implement
ไม่อยู่ใน `docs/plans/DEVELOPMENT_PLAN.md` backlog ปัจจุบัน (P2/P3) — เป็นงานแยกที่ user ขอนอกรอบ

## บริบท

โปรเจกต์นี้เป็น client-only React/Vite SPA (GitHub Pages, HashRouter) ไม่มี HTTP cookie จริง ไม่มี analytics/ads/3rd-party script ใดๆ ในโค้ดตอนนี้ สิ่งที่มีคือ `localStorage` ล้วน:

- `teyvat-quiz-progress-v3` — ความคืบหน้าทำแบบทดสอบ
- `teyvat-quiz-result-v1` — ผลลัพธ์ล่าสุด
- `teyvat-theme` — theme ที่เลือก
- `teyvat-locale` — ภาษาที่เลือก
- `teyvat-share-throttle-v1` — client-side rate limit ของ shared-result publish (เพิ่งทำใน P2 item 5)

รวมถึง Firestore write path (`publishSharedResult`) ที่เพิ่งเพิ่มเข้ามา (unauthenticated public create ไม่มี Firebase Auth จึงไม่ตั้ง cookie ใดๆ)

**เหตุผลที่ต้องมี consent ตอนนี้** (ยืนยันจาก user แล้ว): สองอย่างพร้อมกัน — (1) เตรียมโครงสร้างไว้รองรับ analytics ที่จะเพิ่มในอนาคต (ยังไม่เลือก provider) และ (2) อยากให้ compliant PDPA/GDPR-style ครอบคลุม client storage ที่มีอยู่แล้วด้วย แม้ทางเทคนิคจะไม่ใช่ cookie **ไม่มีแผนทำ ads** เพราะเป็น fan project

## Scope

- **In scope**: banner + preference dialog สำหรับหมวด Necessary (บังคับ, ไม่ gate อะไรจริง) และ Analytics (opt-in, ยังไม่มี SDK ให้ gate จริง — เตรียม interface ไว้เท่านั้น) พร้อม persist การตัดสินใจและจุดให้เปลี่ยนใจทีหลัง (footer link)
- **Out of scope**: การเชื่อม analytics SDK จริงใดๆ (ยังไม่เลือก), หมวด Marketing/Ads, cookie policy page แบบเต็ม (ใช้ copy สั้นในตัว banner/dialog พอ), การย้าย localStorage เดิม (quiz/theme/locale/throttle) ไปอยู่หลัง consent gate — ทั้งหมดนี้จัดเป็น Necessary ตามที่ปกติกฎหมายยกเว้นได้ ไม่ต้องขอ consent แค่เปิดเผยใน copy

## State module — `src/lib/consent.ts`

```ts
interface CookieConsent {
  version: 1;
  analytics: boolean;
  decidedAt: string; // ISO timestamp
}
```

- Storage key: `teyvat-cookie-consent-v1`
- `getConsent(): CookieConsent | null` — อ่าน + parse + validate `version === 1`, คืน `null` ถ้าไม่มี/parse พัง/version ไม่ตรง (เผื่ออนาคตเปลี่ยน shape จะไม่พังแอพ แค่ถามใหม่)
- `hasDecided(): boolean` — `getConsent() !== null`
- `hasAnalyticsConsent(): boolean` — `getConsent()?.analytics ?? false` (fail-safe เป็น false เสมอถ้ายังไม่ตัดสินใจหรืออ่านพัง)
- `setConsent(analytics: boolean): void` — เขียน `{ version: 1, analytics, decidedAt: new Date().toISOString() }`, wrap try/catch แบบเดียวกับ `quiz-result.ts`/`share-throttle.ts` — เขียนไม่ได้ (private mode/quota) ก็ swallow เงียบ ไม่ throw ให้ UI พัง

ฟังก์ชันพวกนี้เป็น interface เดียวที่โค้ด analytics ในอนาคตต้องเรียกก่อนจะยิง script ใดๆ — ตอนนี้ยังไม่มีใครเรียกใช้ `hasAnalyticsConsent()` จริงเพราะยังไม่มี analytics ให้ gate

## Components

### `src/components/consent/CookieConsentBanner.tsx`

- Fixed bottom bar, โผล่เฉพาะเมื่อ `!hasDecided()`
- Copy สั้น (`cookieBannerBody`) + ปุ่ม 3 อัน: **ยอมรับทั้งหมด** (`setConsent(true)`), **เฉพาะที่จำเป็น** (`setConsent(false)`), **ตั้งค่า** (เปิด `CookiePreferencesDialog` ผ่าน callback prop `onOpenSettings`)
- กดปุ่มไหนก็ตามที่ทำให้ `hasDecided()` เป็น true แล้ว banner หายไป (re-render จาก local state ที่ sync กับ localStorage)

### `src/components/consent/CookiePreferencesDialog.tsx`

- Modal ใช้ `useDialogAccessibility` hook เดียวกับ dialog อื่นในโปรเจกต์ (`ShareResultDialog`, character-preview dialog ใน `CharacterPage.tsx`)
- Props: `open: boolean`, `onClose: () => void`
- เนื้อหา: 2 แถว toggle
  - **Necessary** (`cookieNecessaryLabel`/`cookieNecessaryDesc`) — toggle แสดงเป็น "on" เสมอ, `disabled`, ไม่ผูก state ใดๆ (เป็นแค่ UI บอกว่ามีหมวดนี้อยู่ ไม่ใช่ค่าที่เก็บจริง)
  - **Analytics** (`cookieAnalyticsLabel`/`cookieAnalyticsDesc`) — toggle ผูกกับ local state ที่ init จาก `getConsent()?.analytics ?? false` ตอนเปิด dialog
- ปุ่ม "บันทึก" (`cookieSave`) → `setConsent(analyticsToggleValue)` → `onClose()`
- ปิด dialog ด้วยทางอื่น (ปุ่ม X, คลิก backdrop, กด Esc — ผ่าน `useDialogAccessibility` เดิม) → **ไม่** เรียก `setConsent()` เลย ถือเป็นยกเลิก ค่าที่เคยตัดสินใจไว้ก่อนหน้า (หรือ "ยังไม่ตัดสินใจ" ถ้าเปิดจาก banner ครั้งแรก) ไม่เปลี่ยนแปลง — banner จึงยังโผล่ต่อถ้าปิด dialog แบบนี้ก่อนเคยกดปุ่มไหนใน banner มาก่อน

### `App.tsx` เปลี่ยนแปลง

- เพิ่ม state `const [cookieDialogOpen, setCookieDialogOpen] = useState(false)`
- Render `<CookieConsentBanner onOpenSettings={() => setCookieDialogOpen(true)} />` และ `<CookiePreferencesDialog open={cookieDialogOpen} onClose={() => setCookieDialogOpen(false)} />` ที่ root ของ `app-shell` (นอก `<Routes>` เพื่อให้โผล่ทุกหน้า)
- ส่ง `onOpenCookieSettings={() => setCookieDialogOpen(true)}` ให้ `AppFooter` — pattern เดียวกับที่ App.tsx ส่ง `onToggleLocale`/`onToggleTheme` ให้ `AppHeader` อยู่แล้ว

### `AppFooter` (ใน `src/components/common/index.tsx`) เปลี่ยนแปลง

- เพิ่มปุ่ม/ลิงก์ข้อความ "ตั้งค่าคุกกี้" (`cookieSettingsLink`) เรียก `onOpenCookieSettings` — ถาวรอยู่ใน footer ทุกหน้า ไม่ขึ้นกับว่า banner โผล่อยู่ไหม

## Data flow

1. โหลดแอพครั้งแรก → `CookieConsentBanner` เช็ค `hasDecided()` → false → banner โผล่
2. User กด "ยอมรับทั้งหมด" → `setConsent(true)` → banner หาย, persist ข้าม reload/session
3. User กด "เฉพาะที่จำเป็น" → `setConsent(false)` → banner หาย
4. User กด "ตั้งค่า" (จาก banner หรือ footer) → dialog เปิด, toggle Analytics โชว์ค่าปัจจุบัน (หรือ false ถ้ายังไม่เคยตัดสินใจ) → toggle → "บันทึก" → `setConsent(...)` → dialog ปิด (banner ถ้ายังโผล่อยู่ก็หายไปด้วยเพราะ `hasDecided()` เป็น true แล้ว)
5. โค้ด analytics ในอนาคต (นอก scope นี้) เรียก `hasAnalyticsConsent()` ก่อนใส่ script ใดๆ เสมอ

## Error handling

- localStorage อ่าน/เขียนไม่ได้ (private browsing, quota เต็ม) → `getConsent()` คืน `null` เสมอ (เหมือนยังไม่ตัดสินใจ), `hasAnalyticsConsent()` คืน `false` เสมอ, `setConsent()` swallow error เงียบไม่ throw
- ผลคือกรณี storage ใช้ไม่ได้จริง banner จะโผล่ซ้ำทุกครั้งที่โหลดหน้า — ยอมรับ trade-off นี้ เพราะปลอดภัยกว่าการ assume ว่า consent ได้รับแล้วทั้งที่ไม่รู้แน่ชัด

## Testing

ไม่มี test framework สำหรับ UI ในโปรเจกต์นี้ (ตาม pattern เดิมทั้งหมดที่ผ่านมา) — verify ด้วย manual QA ผ่าน browser:

1. เข้าแอพครั้งแรก (localStorage ว่าง) → เห็น banner
2. กด "ยอมรับทั้งหมด" → banner หาย, reload หน้า → banner ไม่โผล่ซ้ำ, `hasAnalyticsConsent()` (เช็คผ่าน console) เป็น `true`
3. เคลียร์ localStorage แล้วกด "เฉพาะที่จำเป็น" → banner หาย, `hasAnalyticsConsent()` เป็น `false`
4. เปิด "ตั้งค่า" จาก banner (ก่อนตัดสินใจ) และจาก footer link (หลังตัดสินใจแล้ว) → ทั้งสองทางเปิด dialog เดียวกันได้ ค่า toggle Analytics ตรงกับที่เคยเลือกไว้จริง
5. ลองกด toggle "Necessary" → ยืนยันว่ากดไม่ได้ (disabled) จริง
6. เช็ค `pnpm exec tsc -b`, `pnpm run lint`, `pnpm run build` ผ่านทั้งหมด

## Out of scope (เก็บไว้ทำต่อทีหลัง)

- เชื่อม analytics SDK จริง (Google Analytics หรืออื่นๆ) — ยังไม่เลือก provider, รอ implement ทีหลังเมื่อรู้ว่าจะใช้ตัวไหน โดยเรียก `hasAnalyticsConsent()` ที่ built ไว้แล้วในดีไซน์นี้
- Cookie policy page แบบเต็ม
- การย้าย localStorage เดิม (quiz/theme/locale/throttle) มาอยู่หลัง consent gate — จัดเป็น Necessary ตามที่กฎหมายยกเว้นได้
- หมวด Marketing/Ads — ไม่ทำเพราะเป็น fan project ไม่มีแผน ads
