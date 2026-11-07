# LIFEQUEST — tezkor yuklanish va Neon so'rovlarini kamaytirish

## Nima o'zgardi?

1. **Persistent root shell:** `app/layout.tsx` yagona `<Workspace />` ni ushlab turadi. `app/page.tsx` va `app/[section]/page.tsx` endi ikkinchi Workspace yaratmaydi. Navigatsiya `usePathname()` bilan boshqariladi, shuning uchun `GET /api/state` har sahifa ochilganda takrorlanmaydi.
2. **Bitta bootstrap API:** `GET /api/bootstrap` sessiya va foydalanuvchining Neon holatini bir javobda qaytaradi (avval `GET /api/auth/me` + `GET /api/state` edi).
3. **Initial full-screen loading:** ilova foydalanuvchi hisobini va Neon snapshotini tekshirmaguncha asosiy ekran ko'rinmaydi. Xato bo'lsa alohida xato ekrani chiqadi.
4. **IndexedDB recovery cache:** snapshotlar `user:<userId>` kaliti ostida saqlanadi. Mahalliy o'zgarishlar `pending` belgisi bilan yoziladi va keyingi kirishda serverdagi versiya bilan 3 tomonlama birlashtiriladi. Shu bilan birga Neon asosiy manba bo'lib qoladi. Boshqa hisobning keshi hech qachon yangi hisobga qo'shilmaydi. Logoutda hisob keshi tozalanadi.
5. **Serialized Neon writes:** oldingi `lib/cloud.ts` dagi bitta navbat va server tranzaksiyalari saqlangan. 750 ms debounce orqali o'zgarishlar birlashtiriladi. O'zgarishlar avval mahalliy keshga tushadi, muvaffaqiyatli cloud ack kelgach `pending` olib tashlanadi.
6. **Namoz jadvali keshi:** shahar + oy kesimida `sessionStorage` da 6 soat saqlanadi, shuning uchun sahifalar o'rtasida yoki qisqa vaqtda yana 3 oylik API so'rovi ketmaydi.
7. **Izolyatsiyalangan taymer:** soniyalik namoz taymeri kichik `Countdown` komponentida ishlaydi. Butun platformadagi soat har 30 sekundda tekshiriladi, avvalgidek har soniyada butun dashboard render bo'lmaydi.
8. **Schema init:** Neon `CREATE TABLE IF NOT EXISTS` tekshiruvlari iliq server instansiyasida bir marta amalga oshiriladi; xatoda qayta urinishga imkon bor.

## O'zgargan / yangi fayllar

- `app/layout.tsx`
- `app/page.tsx`
- `app/[section]/page.tsx`
- `app/api/bootstrap/route.ts` (yangi)
- `components/Workspace.tsx`
- `lib/cloud.ts`
- `lib/cache.ts` (yangi)
- `lib/server/auth.ts`
- `app/globals.css`
- `tests/performance-architecture.test.mjs` (yangi)

## Deploy (telefon orqali)

1. ZIP ichidagi **fayllarning o'zini** GitHub repository ildiziga joylang (`app`, `lib`, `components`, `package.json` ildizda bo'lsin; bitta qo'shimcha nomli papkaga solmang).
2. Yangi `app/api/bootstrap/route.ts` va `lib/cache.ts` fayllari ham qo'shilganini tekshiring.
3. Vercel deploy qiling. `DATABASE_URL` avvalgidek qoladi, yangi maxfiy kalit shart emas.
4. Bir marta kirgandan so'ng `Bosh sahifa → Namoz → Vazifalar` navigatsiyasi davomida Network logda `GET /api/bootstrap` qayta yuborilmasligi kerak.
5. Vazifani yaratib, ``Saqlanmoqda`` dan so'ng ma'lumot Neon'da qayta ochilganda ham saqlanishini tekshiring.

## Muhim cheklovlar

- Browser/IndexedDB kesh telefon xotirasini tozalash orqali yo'qolishi mumkin. Neon asosiy baza va JSON eksport ham mavjud.
- Kesh account-scoped, ammo qurilmadan tashqaridagi foydalanuvchi uchun to'liq offline login funksiyasi berilmagan.
- Internet sekinligi yoki Neon cold startda **birinchi** yuklanish hali Neon javobini kutadi; shunda loading ko'rsatiladi. Keyingi ichki navigatsiya bunday kutmaydi.
- Avtomatik saqlash paytida tarmoq uzilsa, xatolik ko'rsatiladi. Tiklash nusxasi IndexedDB da saqlanadi. Real-world multi-device conflicting edits uchun server reconcile mavjud, lekin haqiqiy Neon bilan to'liq integratsiya sinovini Vercel'da o'tkazish kerak.
- `npm install` uchun bu muhitda npm registry DNS ishlamagani sababli production buildni shu yerda ishga tushirib bo'lmadi.
