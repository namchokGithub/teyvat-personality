# Lore Research Workflow

เอกสารนี้อธิบายวิธีเติมข้อมูลตัวละครใน `src/data/lore/*.json` จาก Genshin Impact Wiki เพื่อให้สามารถย้ายเครื่อง เปลี่ยนผู้ทำงาน หรือเริ่ม session ใหม่แล้วทำต่อจาก checkpoint เดิมได้

## แหล่งสถานะหลัก

อ่านไฟล์นี้ก่อนเริ่มงานทุกครั้ง:

```text
src/data/lore/_missing-profile-data-report.md
```

หัวข้อ `Progress Checkpoint` ระบุ:

- จำนวนตัวละครที่ทำเสร็จ
- Batch ล่าสุด
- `id` ล่าสุดที่ทำเสร็จ
- `id` ที่ต้องทำต่อ

สถานะ ณ วันที่สร้างเอกสารนี้:

```text
เสร็จแล้ว: 17/125
ล่าสุด: chiori
ตัวถัดไป: chongyun
```

หากข้อมูลในเอกสารนี้ไม่ตรงกับ `_missing-profile-data-report.md` ให้ยึดรายงานเป็นหลัก

## ขอบเขตของแต่ละ Batch

ทำครั้งละประมาณ 10 ตัวละครตามลำดับ `id` ใน:

```text
src/data/lore/_characters.json
```

Traveler ทั้ง 7 ธาตุควรทำเป็น Batch เดียว เพราะใช้หน้าหลักร่วมกันและต้องตรวจว่าเนื้อหาใดแยกตามธาตุได้จริง

## หน้า Wiki ที่ต้องตรวจ

สำหรับตัวละครทั่วไป ให้ตรวจทั้งสองหน้า:

```text
https://genshin-impact.fandom.com/wiki/{Character_Name}/Profile
https://genshin-impact.fandom.com/wiki/{Character_Name}/Voice-Overs
```

ตัวอย่าง:

```text
https://genshin-impact.fandom.com/wiki/Arataki_Itto/Profile
https://genshin-impact.fandom.com/wiki/Arataki_Itto/Voice-Overs
```

ชื่อหน้าใช้ `id` โดยเปลี่ยนแต่ละคำเป็นตัวพิมพ์ใหญ่และคั่นด้วย `_` เว้นแต่ Wiki ใช้ชื่อพิเศษหรือ redirect ไปชื่ออื่น

Traveler ใช้หน้าเหล่านี้ร่วมกัน:

```text
https://genshin-impact.fandom.com/wiki/Traveler/Profile
https://genshin-impact.fandom.com/wiki/Traveler/Voice-Overs
```

## การอ่านผ่าน MediaWiki API

หากหน้าเว็บปกติเปิดไม่ได้ ให้ใช้ MediaWiki API

ตรวจว่าหน้ามีอยู่และดู section:

```powershell
curl.exe -sS "https://genshin-impact.fandom.com/api.php?action=parse&format=json&page=Chongyun%2FProfile&prop=sections"
```

ดึง Profile แบบ wikitext:

```powershell
curl.exe -sS "https://genshin-impact.fandom.com/api.php?action=parse&format=json&formatversion=2&page=Chongyun%2FProfile&prop=wikitext"
```

ดึง Voice-Overs แบบ wikitext:

```powershell
curl.exe -sS "https://genshin-impact.fandom.com/api.php?action=parse&format=json&formatversion=2&page=Chongyun%2FVoice-Overs&prop=wikitext"
```

ถ้า API คืน object ที่มี `error` หรือหน้าเป็น `missing` ให้บันทึกใน `_missing-profile-data-report.md` และอย่าสร้างข้อมูลทดแทนจากการคาดเดา

## ส่วนของแหล่งข้อมูลที่ควรใช้

จากหน้า Profile ให้เน้น:

- Official Introduction
- Character Details
- Character Stories 1–5
- เนื้อเรื่องพิเศษประจำตัวละคร
- Vision

จากหน้า Voice-Overs ให้เน้น Story Voice-Overs เช่น:

- About Character
- About Us
- About the Vision
- Something to Share
- Interesting Things
- About Other Characters
- More About Character
- Hobbies
- Troubles
- Birthday หรือ Ascension เมื่อให้หลักฐานด้านบุคลิก

ไม่จำเป็นต้องเก็บเสียงต่อสู้สั้น ๆ เช่นโจมตี วิ่ง ปีน หรือรับความเสียหาย หากไม่มีบริบทเชิงบุคลิกเพียงพอ

## Schema ที่ต้องรักษา

ทุกไฟล์ตัวละครต้องมี key ตามลำดับนี้:

```json
{
  "id": "character_id",
  "source": {
    "type": "wiki",
    "url": "https://genshin-impact.fandom.com/wiki/Character_Name/Profile"
  },
  "summary": "",
  "background": "",
  "personalityNotes": [],
  "motivations": [],
  "values": [],
  "behaviorPatterns": [],
  "relationships": [],
  "conflicts": [],
  "strengthEvidence": [],
  "weaknessEvidence": [],
  "stories": [],
  "voiceOvers": [],
  "quotes": [],
  "analysisNotes": []
}
```

ห้ามเปลี่ยน `id` เดิมของไฟล์

## วิธีเขียนแต่ละฟิลด์

### `summary`

สรุปตัวละคร 1–2 ประโยค ครอบคลุมบทบาท บุคลิกหลัก และแรงผลักสำคัญ

### `background`

สรุปภูมิหลังตามลำดับเหตุการณ์ โดยใช้ข้อเท็จจริงจาก Profile และหลีกเลี่ยงรายละเอียดที่ไม่ช่วยวิเคราะห์บุคลิก

### `personalityNotes`

ลักษณะบุคลิกที่มีหลักฐาน เช่น ความเก็บตัว ความตรง ความยืดหยุ่น หรือวิธีตอบสนองต่อสังคม ควรใส่ชื่อ section ในข้อความเมื่อช่วยให้ตรวจย้อนกลับง่าย

### `motivations`

สิ่งที่ตัวละครพยายามทำให้สำเร็จ แยกแรงจูงใจภายนอกและภายในเมื่อมีหลักฐาน

### `values`

หลักการหรือสิ่งที่ตัวละครให้ความสำคัญ ห้ามสรุปจาก Vision หรือ Element เพียงอย่างเดียว

### `behaviorPatterns`

พฤติกรรมที่เกิดซ้ำหรือวิธีรับมือสถานการณ์ ไม่ใช่คำคุณศัพท์ลอย ๆ

### `relationships`

ใช้รูปแบบ:

```text
ชื่อ — ลักษณะความสัมพันธ์และผลต่อบุคลิกหรือการตัดสินใจ
```

### `conflicts`

รวมได้ทั้งความขัดแย้งภายใน ความขัดแย้งกับบุคคล และความขัดแย้งระหว่างคุณค่ากับหน้าที่

### `strengthEvidence` และ `weaknessEvidence`

ต้องเป็นหลักฐานจากเหตุการณ์หรือคำพูด ไม่ใช่เพียงรายการจุดแข็งหรือจุดอ่อน ควรขึ้นต้นด้วยชื่อ section เมื่อทำได้

### `stories`

สรุป Character Stories และเรื่องพิเศษเป็นรายการสั้น ๆ ไม่คัดลอกเนื้อหาทั้ง section

### `voiceOvers`

สรุปความหมายของเสียงพากย์ที่สนับสนุนการวิเคราะห์ พร้อมชื่อ voice-over ในวงเล็บเหลี่ยม

ตัวอย่าง:

```text
[About Us: Helping Each Other] แสดงว่า...
```

### `quotes`

เลือกคำพูดตรงสั้น ๆ ที่ตรวจพบในแหล่งข้อมูลจริงเท่านั้น พร้อมชื่อ section ห้ามสร้างประโยคที่ฟังดูเหมือนคำพูดของตัวละครขึ้นเอง

### `analysisNotes`

ใส่เฉพาะข้อวิเคราะห์หรือข้ออนุมาน และระบุภาษาที่ทำให้เห็นว่าเป็นการตีความ ไม่ใช่ข้อเท็จจริงทางการ

## กฎคุณภาพ

- เขียนเป็นภาษาไทย แต่คงชื่อเฉพาะตามแหล่งข้อมูล
- สรุปด้วยภาษาของโครงการ ไม่คัดลอกข้อความ Wiki ยาว ๆ
- แยกข้อเท็จจริงออกจากข้อวิเคราะห์
- ห้ามอนุมานบุคลิกจาก Element, Weapon, สี หรือรูปลักษณ์เพียงอย่างเดียว
- ห้ามเติมข้อมูลเมื่อไม่มีหลักฐาน
- คำพูดตรงต้องสั้นและตรวจพบใน Profile หรือ Voice-Overs จริง
- อย่าใช้เสียงต่อสู้เป็นหลักฐานหลัก เว้นแต่มีความหมายชัดเจน
- รักษารูปแบบและระดับรายละเอียดให้ใกล้เคียงไฟล์ที่ทำเสร็จแล้ว

ไฟล์ตัวอย่างที่ใช้เทียบรูปแบบได้:

```text
src/data/lore/aino.json
src/data/lore/albedo.json
src/data/lore/alhaitham.json
src/data/lore/arlecchino.json
src/data/lore/chiori.json
```

## การบันทึกข้อมูลที่ขาด

อัปเดต `_missing-profile-data-report.md` ทุก Batch โดยระบุ:

- หน้า Profile ที่ไม่มีหรือ API อ่านไม่ได้
- หน้า Voice-Overs ที่ไม่มีหรือ API อ่านไม่ได้
- ฟิลด์ที่ต้องปล่อยว่างเพราะไม่มีหลักฐาน
- จำนวนตัวละครที่เสร็จ
- Batch ล่าสุด
- ตัวละครล่าสุดที่เสร็จ
- ตัวละครถัดไป

อย่าระบุว่าไฟล์ “เสร็จแล้ว” จนกว่าจะตรวจทั้ง Profile และ Voice-Overs พร้อม validate JSON

## Validation หลังจบ Batch

ตรวจว่า JSON ทุกไฟล์อ่านได้:

```powershell
Get-Content -Raw -Encoding utf8 src/data/lore/chongyun.json | ConvertFrom-Json | Out-Null
```

ตรวจรูปแบบด้วย Prettier:

```powershell
.\node_modules\.bin\prettier.cmd --write src/data/lore/chongyun.json src/data/lore/_missing-profile-data-report.md
.\node_modules\.bin\prettier.cmd --check src/data/lore/chongyun.json src/data/lore/_missing-profile-data-report.md
```

ตรวจ whitespace error:

```powershell
git diff --check -- src/data/lore
```

ก่อนปิด Batch ต้องตรวจเพิ่มว่า:

- `id` ตรงกับชื่อไฟล์
- key ครบและเรียงตาม schema
- `source.url` เป็นหน้า `/Profile`
- ไม่มีฟิลด์ว่างโดยไม่ถูกบันทึกในรายงาน
- URL ทั้ง Profile และ Voice-Overs ถูกตรวจจริง

## วิธีเริ่มต่อหลังย้ายเครื่อง

1. Clone หรือคัดลอก repository โดยรวมไฟล์ที่ยังไม่ได้ commit ให้ครบ
2. เปิด repository ที่โฟลเดอร์ `teyvat-personality`
3. รัน `corepack pnpm install`
4. อ่าน `AGENTS.md`, `CONTEXT.md` และเอกสารนี้
5. เปิด `src/data/lore/_missing-profile-data-report.md`
6. เริ่มจากค่า `ตัวละครถัดไป`
7. ตรวจ Profile และ Voice-Overs ก่อนแก้ไฟล์
8. ทำครั้งละประมาณ 10 ตัวละคร
9. Validate และอัปเดต checkpoint ทุกครั้ง

## ข้อควรระวังก่อนย้ายเครื่อง

ไฟล์ lore และเอกสารบางส่วนอาจยังเป็น untracked หรือยังไม่ได้ commit การคัดลอกเฉพาะ Git repository โดยไม่รวม working tree ล่าสุดอาจทำให้งานหาย ควรตรวจด้วย:

```powershell
git status --short
```

วิธีที่ปลอดภัยที่สุดคือ commit งานปัจจุบันก่อนย้ายเครื่อง หรือคัดลอกโฟลเดอร์ `teyvat-personality` ทั้งโฟลเดอร์โดยไม่รวม `node_modules` และ `dist`
