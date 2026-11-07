# LIFEQUEST + Neon + Vercel: telefondan o‘rnatish

## 1. Neon hisob va ma’lumotlar bazasi
1. Telefoningizdagi brauzer bilan https://console.neon.tech sahifasiga kiring.
2. `New Project` bosing, loyihani `lifequest` deb nomlang.
3. Neon **Connect** bo‘limidan PostgreSQL ulanish satrini (**pooled connection string**) nusxalang. Odatda `postgresql://...` ko‘rinishida bo‘ladi.
4. Ulanish satrini hech kimga yubormang va GitHub fayliga qo‘shmang.

## 2. GitHub orqali Vercel deploy
1. GitHub'da yangi private repository yarating va ushbu ZIP ichidagi fayllarni papkalari bilan joylashtiring. ZIP faylni bevosita GitHubga bitta fayl sifatida yuklash yetarli emas — ichidagi fayllar repository rootida turishi kerak.
2. https://vercel.com/new sahifasida GitHub repository'ni import qiling va Framework `Next.js` ekanini tekshiring.
3. Vercel Project Settings → Environment Variables bo‘limiga quyidagilarni qo‘shing:

   - `DATABASE_URL` = Neon'dan nusxalangan ulanish satri.
   - `LIFEQUEST_ACCESS_KEY` = o‘zingiz yaratgan uzun, tasodifiy maxfiy parol (kamida 12 belgi; 24+ tavsiya qilinadi).

4. Ikkala o‘zgaruvchi **Production** uchun mavjudligini tekshiring. `NEXT_PUBLIC_` qo‘shimchasini qo‘ymang.
5. Deploy qiling (agar oldindan deploy qilgan bo‘lsangiz, Redeploy).
6. Sayt ochilganda `LIFEQUEST_ACCESS_KEY` bilan kiring.
7. Vazifa qo‘shing, sahifani yangilang: ma’lumot bazadan qaytib kelishi kerak. Neon SQL Editor'da `SELECT revision, updated_at FROM lifequest_state;` orqali tekshirishingiz mumkin.

## Ma’lumot bazasi sxemasi
Jadval server tomonidan birinchi so‘rovda avtomatik yaratiladi. Alohida SQL migratsiya ishga tushirishingiz shart emas. Xohlasangiz `database/schema.sql` faylini Neon SQL Editorda ishlatishingiz mumkin.

## Muhim
- Bu shaxsiy, **bitta foydalanuvchilik** ilova: bitta maxfiy kalit bilan himoyalangan, har foydalanuvchi uchun alohida hisob tizimi YO‘Q.
- Ma’lumotning asosiy nusxasi Neon bulutda; brauzerdagi IndexedDB mahalliy nusxa. Internetsiz ishlaganda bulutga yozib bo‘lmaydi. To‘liq offline-sync hali mavjud emas.
- Bir nechta qurilmada bir vaqtning o‘zida tahrirlash 409 versiya konflikti tug‘dirishi mumkin. Shunday paytda JSON zaxira oling va sahifani yangilang.
- Eski LIFEQUEST brauzeridagi ma’lumotlar avtomatik migratsiya qilinmaydi. Eski versiyadan **JSON zaxira** eksport qilib, yangi versiyaning Sozlamalar → JSON tiklash funksiyasi orqali import qiling.
- Kuchli sirni tanlang. Kim ushbu kalitni bilsa, sizning shaxsiy ma’lumotlaringizga kira oladi. Kalitni GitHub'ga joylamang.
- Parolni `LIFEQUEST_ACCESS_KEY` da o‘zgartirsangiz, barcha qurilmalarda yangi kalit bilan qayta kirish kerak bo‘ladi.
- Vercel o‘zgaruvchilarni qo‘ygandan so‘ng qayta deploy qilinishi mumkin.
- Neon bepul rejasi cheklovlariga e’tibor bering.
