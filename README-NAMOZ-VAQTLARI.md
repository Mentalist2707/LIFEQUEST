# LIFEQUEST — Namoz vaqtlari va avtomatik qazo (2026-11-07)

## Yangi imkoniyatlar
- Namoz sahifasida O‘zbekistonning 13 shahri orasidan tanlash.
- Jadval: Bomdod, Peshin, Asr, Shom, Xufton va Quyosh chiqishi.
- Joriy namoz neon ko‘k bilan yoritiladi; kelgusi namozlar uchun qolgan soat/daqiqalar hisoblanadi (har 30 soniyada yangilanadi).
- AlAdhan API orqali server-side oy jadvali olinadi; `/api/prayer-times?city=tashkent&month=2026-11`. Revalidate 6 soat.
- Hisob usuli: Karachi (method=1), Hanafiy Asr (`school=1`), Asia/Tashkent. Hisobiy natijalar mahalliy masjid yoki O‘zbekiston musulmonlari idorasi jadvalidan farq qilishi mumkin.
- Har bir namozning hisobiy chegarasi: Bomdod => Quyosh chiqishi; Peshin => Asr; Asr => Shom; Shom => Xufton; Xufton => ertangi Bomdod.
- `Avtomatik nazoratni yoqish` tugmasi bosilmaguncha avtomatik qazo/jarima yurmaydi. Oldingi vaqtlar uchun retroaktiv jarima yo‘q.
- So‘nggi 31 kungacha yaqin davr uchun qazo yozuvlari sayt ochilganda tiklanadi. Sayt yopiq bo‘lsa Vercel serveri avtomatik cron yuritmaydi: u qayta kirilganda hisoblanadi. Undan oldingi muddatlar qo‘lda qayd qilinadi.
- Namoz jadvali olinmagan paytda hech qanday avtomatik XP jarima hisoblanmaydi.
- Qazo = −2 × oddiy XP; qazosini o‘qish = jarimaning 50% ini qaytarish. Keyingi namoz kirishidan oldin belgilangan ado +XP.
- Shahar o‘zgartirilsa avtomatik qayd boshlanish vaqti yangilanadi, ammo eski qaydlar saqlanadi.

## Vercel’ga joylash
1. Ushbu ZIP arxivdagi **barcha fayllarni** GitHub repository ildiziga yuklang. Tashqarida qo‘shimcha `LIFEQUEST-...` papka hosil qilmang.
2. Vercel’da `DATABASE_URL` (Neon PostgreSQL) saqlangan bo‘lsin. Boshqa yangi environment variable kerak emas.
3. Vercel deploy tayyor bo‘lgach, login qiling va **Namoz** sahifasini oching.
4. Shaharni tanlang, namoz vaqtlari ko‘rsatilayotganini tekshiring, so‘ng `Avtomatik nazoratni yoqish` tugmasini bosing.
5. Baza xavfsizligi uchun oldin JSON zaxira nusxa oling.

## Cheklovlar
- Yuqoridagi jadvallar hisobiy ma’lumotdir; namozning fiqhiy qazo masalalarini ular bilan yakuniy diniy hukm sifatida belgilamang.
- API server javobi uchun internet zarur. API vaqtincha ishlamasa qazo yozilmaydi.
- PWA Android’da yopiq paytda sekundma-sekund eslatma yoki fon ishlashiga kafolat yo‘q. Bu versiya Vercel Cron orqali doimiy ishlaydigan scheduler emas.
- Lokal `npm test` bilan 18 test o‘tdi; TypeScript sintaksis tekshirildi. To‘liq `next build` kutubxonalar yetishmagani uchun bu muhitda tasdiqlanmadi. Deploy build logini tekshiring.
