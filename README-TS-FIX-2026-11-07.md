# LIFEQUEST – TypeScript build tuzatishi

Vercel log: `components/Workspace.tsx:191:269` – `state.prayers` possibly undefined.

Tuzatish:
```
const current=(state.prayers ?? []).find(r=>r.date===target.date&&r.prayer===target.prayer)?.status ?? 'pending';
```

Shu bilan mavjud namoz qaydlari bo'lmasa bo'sh massiv ishlatiladi. Namoz o'qilgan deb belgilash faqat modalda `Yakunlash` bosilganda saqlanadi.

Tekshiruv: `npm test` – 20/20 muvaffaqiyatli. To'liq Next.js build ushbu muhitda dependencies o'rnatib bo'lmagani uchun tekshirilmagan.
