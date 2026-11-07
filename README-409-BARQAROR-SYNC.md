# LIFEQUEST: 409 takrorlanishini cheklash

Bu reliz bir necha soniyada takrorlanadigan `PUT /api/state 409` so'rovlarini kamaytirish uchun.

O'zgarishlar:
- `app/api/state/route.ts`: 409 javobiga serverdagi joriy state va revision qo'shildi. Ma'lumotni ruxsatsiz ochib bermaydi; mavjud sessiya tekshiruvlari ishlaydi.
- `lib/cloud.ts`: server qaytargan joriy revisiondan foydalanib yagona merge/retry qiladi; takroran konflikt bo'lsa cheksiz so'rov yubormasdan xato holatida to'xtaydi.
- `components/Workspace.tsx`: avtomatik saqlash 550 ms kechiktiriladi, yangi o'zgarish kelganda oldingi yozuv taymeri to'xtatiladi.
- `tests/sync-loop.test.mjs`: yangi himoyani tekshiruvchi testlar qo'shildi.

Muhim: mavjud Neon DB va hisoblar o'chirilmaydi. `DATABASE_URL` o'zgarmaydi. Faqat bir faylni emas, yuqoridagi 3 ta kod faylini birga yangilash zarur. Tarix va XP yozuvlarini yo'qotmaslik uchun 409 CAS himoyasi saqlangan.

Sinov: 22 ta lokal test o'tdi. To'liq Vercel build va haqiqiy Neon bilan yozish/konflikt sinovi ushbu muhitda bajarilmadi. Agar xato takrorlansa, aynan shu versiyadan olingan `PUT /api/state` HTTP response body (maxfiy ma'lumotlarni olib tashlab, faqat `error` va `revision` qiymatlari) hamda deployment commitini tekshirish kerak.
