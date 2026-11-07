# LIFEQUEST — Namoz + 409 Conflict fix (Neon / Vercel)

Bu ZIP — oldingi **LIFEQUEST-LOGIN-REGISTER-NEON** loyihasining to‘liq yangilangan variantidir. Neon bilan to‘g‘ridan-to‘g‘ri `@neondatabase/serverless` orqali ulanadi (Prisma talab qilinmaydi).

## Nimalar o‘zgardi

- 409 Conflict kelganda ilova Neon'dagi oxirgi versiyani olib, lokal tahrirlarni **uch tomonlama merge** bilan birlashtiradi va yangi versiyada qayta saqlaydi (maksimal 5 urinish).
- Ketma-ket o‘zgartirishlar queue orqali navbat bilan saqlanadi. Bitta vazifani ikki oynada bajarish ikki marta XP bermaydi.
- Saqlash vaqtida holat ko‘rsatiladi. Internet xatosi bo‘lsa ma'lumotlarni yo‘qotmaydi, qayta saqlash tugmasi chiqariladi. Agar internet bo‘lmasa saqlashni yangilamaguncha sahifani yopmang.
- Pastki navigatsiya va desktop menyusiga **Namoz** bo‘limi qo‘shildi.
- 5 mahal: Bomdod (+220 XP / qazo −120 XP), Peshin (+180 / −110), Asr (+180 / −110), Shom (+200 / −110), Xufton (+200 / −110).
- Namoz holatini tuzatish oldingi o‘yin XP farqini qoplaydi va tarixda saqlanadi. Ilova XP'si ibodatning diniy bahosi emas.
- Yutuqlar 8 tadan **29 taga** ko‘paytirildi.
- Eski foydalanuvchi ma'lumotlari yangi `prayers` va `prayerHistory` maydonlarisiz ham ochiladi.

## Vercel deploy

1. ZIPni oching va undagi **barcha fayllarni bitta asosiy GitHub repository ildiziga** yuklang. Loyihani ichma-ich ZIP papkalari sifatida joylamang.
2. GitHub'da `app`, `components`, `lib`, `public`, `tests`, `package.json` repositoryning yuqori darajasida bo‘lsin.
3. Vercel → loyiha → Settings → Environment Variables bo‘limida `DATABASE_URL` mavjudligini tekshiring. `LIFEQUEST_ACCESS_KEY` bu login/register versiyada kerak emas.
4. GitHub commit qiling, Vercel avtomatik buildni boshlaydi. Deployment `Ready` bo‘lsa `/prayer` sahifasini ochib tekshiring.
5. Build muvaffaqiyatli tugamasa Vercel Build Logs ni yuboring, maxfiy `DATABASE_URL` qiymatini yubormang.

**Neon SQL migratsiyasi kerak emas**: namoz tarixi foydalanuvchi `lifequest_state.data` JSONB ustunida saqlanadi. Jadvallar eski holatda qoladi.

## Tekshiruvlar

`npm test` — 11 ta test, shu jumladan namoz XP/qazo, eski backup, parallel save merge va ikki marta XP himoyasi.

`npm run build` — Next.js va dependencies o‘rnatilgan muhitda tekshiring. Ushbu generatsiya muhitida paketlarni yuklash bloklangani sababli production buildni to‘liq tasdiqlab bo‘lmadi.

## Muhim cheklov

Bir xil namozning aynan bir vaqtda ikki qurilmadan turlicha holatga o‘zgartirilishi kabi juda kam uchraydigan nizolarda oxirgi mahalliy tahrir ustun keladi. Barcha holatlarda avtomatik 100% muammosiz saqlashni haqiqiy Neon integratsiya testi o‘tkazmasdan kafolatlab bo‘lmaydi.


## Namoz XP qoidasi (v2)
- Vaqtida ado etilganida: +220/+180/+180/+200/+200 XP.
- Qazo: odatiy bonusning **ikki barobari** chegiriladi (−440/−360/−360/−400/−400 XP).
- Qazosi keyin o‘qilsa: chegirilgan ballning **yarmi** qaytariladi (+220/+180/+180/+200/+200 XP). Shunday holatning sof natijasi manfiy bo‘lib qoladi.
- Qazo holatini `O‘qidim`ga o‘zgartirib to‘liq XP olish yoki yozuvni olib tashlash orqali jarimani bekor qilish mumkin emas.
- Avvalgi versiyada yozilgan qazo qaydlari avtomatik o‘chirib yuborilmaydi; ular uchun kech o‘qishda tarixdagi haqiqiy manfiy XP ning yarmi qaytariladi.
- Ballar diniy savob yoki gunohni o‘lchamaydi, faqat shaxsiy motivatsiya vositasi.
