# LIFEQUEST — 409 saqlash xatosining asosiy sababi tuzatildi

## Sababi

Oldingi SQL so'rovida `INSERT ... SELECT ... WHERE revision=0` yozilgandi.
`revision` birinchi yozuvdan keyin 1 bo'lgach, SELECT birorta qator qaytarmagan.
Shuning uchun `ON CONFLICT DO UPDATE` qismi umuman ishga tushmagan, har keyingi
saqlash esa 409 qaytargan. Brauzer qayta urinishlari xatoni takrorlagan.

## Tuzatish

`INSERT ... VALUES (...) ON CONFLICT (id) DO UPDATE ... WHERE lifequest_state.revision=...`
ishlatildi. Endi birinchi yozuv uchun INSERT, keyingi yozuvlar uchun shartli UPDATE
ishlaydi. Ikki qurilma bir vaqtda yozsa, versiya tekshiruvi hali ham ma'lumotlarni
himoya qiladi; browserning qayta birlashtirish mexanizmi saqlanadi.

## Yangilash

GitHub dagi `app/api/state/route.ts` faylini ZIP dagi yangisiga almashtiring,
Commit qiling. Vercel yangi deploy qilgach bitta vazifa yaratib, keyin o'shani
tahrirlang. Ikkala amal ham saqlanishi kerak.

Neon jadvallarini o'chirish, qayta yaratish yoki `DATABASE_URL` ni almashtirish shart emas.

## Tekshiruv

Avtomatik testlar va SQL regression tekshiruvi ishlatildi. Haqiqiy Neon serveri
bilan production integratsion tekshiruv muhitda bajarilmadi.
