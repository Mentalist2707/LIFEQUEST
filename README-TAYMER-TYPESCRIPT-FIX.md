# Namoz taymeridagi TypeScript xatosi tuzatildi

Vercel 2026-11-07 12:40 build logida `components/Workspace.tsx:208` faylida `Cannot find name 'isCurrent'` xatosini ko'rsatgan.

Sabab: namoz kartasini hisoblaydigan `rows` massivida `isCurrent`, `isUpcoming`, `windowTime` mavjud bo'lsa ham qaytarilmagan va `map` ichida ajratib olinmagan.

Tuzatish: uchala qiymat ham `rows` elementidan qaytariladi va `rows.map` parametridan olinadi. Bu render vaqtida taymer qaysi namoz uchun ishlashini aniqlaydi.

## Tekshiruv

`npm test` orqali 40 ta test o'tdi. npm registrida DNS muammosi sabab to'liq `npm run build` sinovini bu muhitda bajara olmadik. Vercel build bilan tekshirish talab qilinadi.

## Deploy

GitHub repositorydagi `components/Workspace.tsx` faylini almashtirish yetarli. Agar butun arxivni ishlatsangiz, ZIP tarkibidagi fayllarni loyiha ildiziga joylang, alohida ichma-ich papka qilib emas. Neon ENV o'zgarmaydi.
