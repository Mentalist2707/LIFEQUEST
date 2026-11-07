# LIFEQUEST — Neon sinxronlashning yangi protokoli

## Nima o'zgardi

Avvalgi API `PUT /api/state` ga faqat butun state va revision yuborardi. Bir nechta faol tab yoki qurilmada stale revision 409 berishi mumkin edi. Bundan tashqari PostgreSQL `jsonb` maydonlar tartibini o'zgartiradi; eski kod `JSON.stringify` bilan solishtirib, mazmunan bir xil state'ni ham yangidek ko'rishi mumkin edi.

Yangi protokolning ishlashi:

- Client `baseState` (oxirgi server tomonidan tasdiqlangan nusxa), `state` (yangi holat) va `revision` yuboradi.
- Server Neon'dagi oxirgi holatni o'qiydi va `baseState` bilan yangi holat orasidagi haqiqiy o'zgarishlarni aynan shu oxirgi nusxaga uch tomonlama birlashtiradi.
- `UPDATE ... WHERE revision = ...` orqali atomik yozadi. Bir vaqtdagi so'rov versiyani o'zgartirsa, server yangilangan holatni qayta olib birlashtiradi (8 urinishgacha).
- JSONB obyektlaridagi kalitlar tartibi o'zgarsa ham bir xil ma'lumot ortiqcha saqlanmaydi.
- Browser faqat bitta navbat bilan saqlaydi va server yuborgan kanonik holatni qabul qiladi.

## Yangilangan fayllar

- `app/api/state/route.ts`
- `lib/cloud.ts`
- `lib/merge.ts` (yangi)
- `components/Workspace.tsx`
- `tests/api-reconcile.test.mjs` (yangi)
- `tests/merge-cas.test.mjs` (yangi)
- `tests/state-sql.test.mjs` (yangilangan)
- `tests/sync-loop.test.mjs` (yangilangan)
- `tests/prayer-sync.test.mjs` (yangi modulni testga ulash)

## Deploy

1. GitHub repositoryning **asosiy papkasi**dagi fayllarni yangilang. Qo'shimcha ichki loyiha papkasini yuklamang.
2. `DATABASE_URL` o'zgarmaydi. Neon jadvallarini o'chirmang va migratsiya shart emas.
3. Vercel'ning muvaffaqiyatli **Ready** deploymentini kuting, shu yangi versiyani oching.
4. Oldingi ilova oynalarini yoping. Yangilangan sahifada vazifa qo'shib, keyin tahrirlab tekshiring.
5. Agar eski client yangi API'ga `baseState` yubormasa, server 428 qaytaradi. Bu eski kodni yangilash zarurligini bildiradi.

## Sinov va cheklovlar

- `npm test`: 26/26 test o'tdi.
- Backend PUT'ning stale revision bilan yozish holati soxta Neon DB adapteri yordamida sinovdan o'tdi.
- **Haqiqiy Neon + Vercel runtime sinovi bu muhitda bajarilmadi**, shuning uchun jonli serverda 409 mutlaqo bo'lmaydi deb kafolatlanmaydi.
- Agar bir xil record maydoni ikkita qurilmada bir vaqtda turlicha o'zgartirilsa, lokal oxirgi o'zgarish ustuvor bo'lishi mumkin; murakkab konflikt UX keyingi ish.
