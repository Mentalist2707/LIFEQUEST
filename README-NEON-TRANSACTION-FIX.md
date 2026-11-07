# LIFEQUEST — 409 saqlash xatosiga qarshi Neon tranzaksiyasi

## Muammo
Oldingi kod `SELECT` va `UPDATE` so‘rovlarini Neon HTTP orqali alohida bajargan va parallel yozishlarda CAS retry limiti tugaganda `409` qaytargan.

## Yangi usul
`app/api/state/route.ts` da `@neondatabase/serverless` `Client` orqali bitta tranzaksiya ishlatiladi:

1. `BEGIN`
2. Kerak bo‘lsa foydalanuvchi uchun bo‘sh state yozuvi yaratiladi.
3. `SELECT ... FOR UPDATE` bir foydalanuvchining state qatorini bloklaydi.
4. `mergeStates` oldingi, yangi va serverdagi holatlarni birlashtiradi.
5. Bir xil holat qayta yozilmaydi; o‘zgargan holat yangilanadi.
6. `COMMIT`; xatoda `ROLLBACK` va ulanish yopiladi.

Shu sababli ayni accountga kelgan yozishlar bir-birini bosib ketmaydi, SQL bir nechta alohida so‘rovga tarqalmaydi.

## Vercel talablari
- Node.js **22.x** tanlang (LIFEQUEST `package.json` va `.nvmrc`da ko‘rsatilgan).
- `DATABASE_URL` o‘zgartirilmaydi.
- Neon jadvallarini o‘chirmang, qo‘lda SQL ishlatish kerak emas.
- GitHub repository root ichida `app`, `components`, `lib`, `package.json` bo‘lishi kerak.
- Vercel’da yangilangan production deploymentni tekshiring.

## Yangilangan fayllar
- `app/api/state/route.ts` — interaktiv PostgreSQL transaction va row lock.
- `package.json` — Node 22+ talab qilinadi.
- `tests/api-reconcile.test.mjs` — parallel yozish simulyatsiyasi.
- `tests/state-sql.test.mjs` — tranzaksiya shartlari.

## Tekshiruv
- 26 ta avtomatik test muvaffaqiyatli o‘tdi.
- Neon bilan haqiqiy production test va `next build` bu muhitda npm paketlar keshda yo‘qligi sabab bajarilmadi.

**Ehtiyot chora:** Deploy qilishdan avval LIFEQUEST Sozlamalaridan JSON zaxira nusxasini oling. Agar saqlash xatosi hali davom etsa, oxirgi muvaffaqiyatli saqlangan state yoki JSON zaxirani saqlang; ma’lumotlar bazasini reset qilmang.
