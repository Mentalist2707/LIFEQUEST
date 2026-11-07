# LIFEQUEST — ixcham Namoz sahifasi

## O'zgarishlar

- Namoz vaqtlarining raqamlari ekrandan yashirildi; faqat Bomdod, Peshin, Asr, Shom va Xufton nomlari ko'rsatiladi.
- Hozirgi namoz yashil karta bilan ajratiladi.
- Keyingi namozgacha sanagich 1 soniyalik intervalda kamayadi. Jadval kelmasa vaqt to'qib chiqarilmaydi.
- Faqat belgilangan vaqti davom etayotgan namozni «O'qidim» bilan ado etilgan deb belgilash mumkin.
- O'tib ketgan namoz odatiy ro'yxatdan belgilana olmaydi. Qazo qaydlari mustaqil «Qazolar» kartasida, sana bo'yicha yuritiladi.
- Qazo hali qayd etilmagan bo'lsa «Qazo» tugmasi, qayd etilgan bo'lsa «Qazosini o'qidim» tugmasi ko'rsatiladi.
- Uzun izohlar, tarix, statistika va qazo ro'yxati `details` orqali yig'iladi; boshlang'ich holatda yopiq.
- Avvalgi XP va 409 SQL tuzatishlari saqlandi.

## Yangilangan fayllar

- `components/Workspace.tsx`
- `app/globals.css`

## Muhim

Bu versiya mavjud Neon ma'lumotlar modelini o'zgartirmaydi, baza migratsiyasi shart emas.

Jadval manbasi va fiqhiy vaqt farqlari sabab mahalliy masjidning rasmiy vaqti bilan mos kelmasligi mumkin. Namoz o'tkazib yuborilishini hisoblash ilovadagi vaqt intervali asosida amalga oshadi.

## Tekshiruv

- `npm test` — 20/20 test o'tdi.
- TypeScript/TSX sintaksisida xato topilmadi.
- Production build bu muhitda tekshirilmagan: npm registry tarmoqqa ulanmagan.
