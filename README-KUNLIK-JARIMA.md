# LIFEQUEST — Kunlik vazifa uchun ixtiyoriy −XP

## Yangi funksiya

Vazifa yaratish / tahrirlash oynasida, agar turi **Kunlik** bo'lsa, **Bajarilmasa −XP** checkboxi chiqadi.

- Checkbox o'chirilgan bo'lsa: avvalgi xulq, jarima yo'q.
- Checkbox yoqilgan bo'lsa: belgilangan sananing oxirigacha bajarilmagan vazifa uchun ertasi kuni **vazifaning XP mukofotiga teng** miqdor manfiy tranzaksiya yaratiladi. Masalan +50 XP vazifani o'tkazib yuborsangiz **−50 XP**.
- **Har kuni takrorlash** ham yoqilgan bo'lsa, har bir o'tkazib yuborilgan sana uchun bir marta jarima olinadi.
- Takrorlamaydigan kunlik vazifa faqat bir marta jarima oladi, muddati o'tgach uni bajarilgan deb belgilab XP olish mumkin emas (qazosi yo'q).
- Jarima keyin boshqa vazifalar bajarilsa ham bekor bo'lmaydi.
- Umumiy va kategoriya XP manfiy bo'lishi mumkin. Level 1 dan pastga tushmaydi; progress chizig'i 0% ko'rsatadi, lekin haqiqiy manfiy XP raqam bilan ko'rinadi.
- Checkbox keyinchalik yoqilsa, **oldingi o'tgan kunlar uchun** orqaga qarab jarima qo'llanmaydi.
- Har bir jarimaning `sourceId` qiymati `daily-missed:<questId>:<date>` bo'ladi, bu takror hisoblashdan saqlaydi.
- Jarima Neon'da saqlanadigan tranzaksiyaga yoziladi; o'tkazib yuborilgan kun uchun u keyingi kirishda yoki kun almashtirilganda hisoblanadi. Telefon / sayt yopiq paytda fon vazifasi ishga tushmaydi.

## O'zgargan fayllar

- `lib/types.ts` — vazifa uchun `missPenalty`, `penaltyFrom` maydonlari.
- `lib/engine.ts` — `assessMissedDailyQuests`, manfiy XP, dedup va muddat nazorati.
- `components/Workspace.tsx` — checkbox, belgi, avtomatik tekshirish, manfiy XP ko'rinishi.
- `app/globals.css` — checkbox va manfiy XP stillari.
- `tests/daily-penalty.test.mjs` — yangi testlar.

## Deploy

GitHub repozitoriy ildiziga loyiha fayllarini joylang (ZIP papkasining o'zini emas), Vercel avtomatik redeploy qiladi. Neon jadvallarida qo'lda migratsiya talab qilinmaydi; `lifequest_state` JSONB ichiga yangi ixtiyoriy maydonlar yoziladi. Avval JSON zaxira olish tavsiya etiladi.

## Tekshiruvlar

34/34 avtomatik test o'tdi. TypeScript/Next.js production build bu muhitda to'liq sinovdan o'tkazilmadi.
