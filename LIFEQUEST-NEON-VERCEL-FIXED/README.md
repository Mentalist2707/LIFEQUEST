# LIFEQUEST — Neon PostgreSQL + Vercel

Shaxsiy RPG uslubidagi hayot va vazifalarni boshqarish dasturi.

Stack: Next.js 14 App Router, TypeScript, React 18, Tailwind CSS, Framer Motion, Lucide, Neon PostgreSQL, IndexedDB (mahalliy nusxa), PWA.

## Ishga tushirish (Vercel)

Telefondan o‘rnatish uchun **NEON-VERCEL-TELEFON.md** faylini o‘qing.

Vercel'ning server-side Environment Variables bo‘limiga `DATABASE_URL` va `LIFEQUEST_ACCESS_KEY` ni kiriting; `.env.example` faqat namuna. Kalitni `NEXT_PUBLIC_` sifatida ochiq chiqarmang.

## Arxitektura

- `components/Workspace.tsx` — Uz-Latin ekranlari va haqiqiy CRUD boshqaruvlari.
- `lib/engine.ts` — XP, quest, daily reward, streak, achievement biznes mantiqi.
- `lib/cloud.ts` — API bilan HTTP sessiya, ketma-ket saqlash va revision sinxronlash.
- `app/api/state/route.ts` — maxfiy kalitni tekshiradigan server API, Neon JSONB holatini atomik saqlash.
- `lib/db.ts` — IndexedDB mahalliy ko‘chirma.
- `database/schema.sql` — Neon jadval sxemasi (API avtomatik yaratadi).
- `public/sw.js` — statik PWA fayllarni boshqarish; private API keshlanmaydi.

## Ma’lumot xavfsizligi

Neon ulanish satri faqat Vercel server muhitida ishlatiladi. Browserga faqat qisqa API javobi qaytadi. Shaxsiy kirish kaliti (kamida 12 belgi) sessionStorage'da saqlanadi va ilova oynasi sessiyasi davomida API'ga yuboriladi. Bu professional ko‘p foydalanuvchilik autentifikatsiyasi emas; bitta foydalanuvchilik shaxsiy himoya.

Neon'da jadvallar barcha kategoriyalarga alohida qilinmagan: bir foydalanuvchining hujjatlashtirilgan `State` holati JSONB sifatida saqlanadi. MVP uchun qulay, keyinchalik alohida SQL jadvallariga normalizatsiya qilish mumkin.

## Tekshiruv

- `npm test` — Node biznes mantiq testlari.
- `npm run typecheck` — TypeScript.
- `npm run build` — Next.js production build.

Build Neon kalitlarini talab qilmaydi, ammo ishlayotgan API uchun Vercel'da kalitlar to‘g‘ri sozlanishi shart.

## Cheklovlar

Bu kodni yozish muhitida npm server orqali paketlarni o‘rnatish yakunlanmagani uchun Next.js production build va haqiqiy Neon bazaga yozish jonli tekshiruvdan o‘tmagan. Cloud sync online-first; internetsiz serverga yozib bo‘lmaydi. Vercel deploy logida xatolik bo‘lsa, shuni tekshirish zarur.


## Vercel TypeScript build tuzatishi (2026-11-07)
`app/api/state/route.ts` ichida `ensureTable` argumenti `ReturnType<typeof neon>` o‘rniga `ReturnType<typeof sqlClient>` qilib belgilandi. Bu `NeonQueryFunction<false,false>` va umumiy `NeonQueryFunction<boolean,boolean>` orasidagi mos kelmaslikni bartaraf etadi.
