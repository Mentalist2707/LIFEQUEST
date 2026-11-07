# LIFEQUEST — faqat telefon bilan Vercel deploy

Loyiha **Next.js App Router** ishlatadi; Vercel avtomatik npm install va npm run build bajaradi. Kompyuter yoki lokal terminal kerak emas.

## GitHub orqali deploy

1. Telefonda ZIP arxivni yuklab, **Files** yoki **ZArchiver** orqali oching. `LIFEQUEST/` papkasi ichida `app/`, `components/`, `lib/`, `public/`, `package.json` va boshqa fayllar bo‘lishi kerak.
2. github.com saytida GitHub hisobiga kiring va **New repository** orqali `lifequest` nomli **Private** repository yarating.
3. GitHub web interfeysida **Add file → Upload files** orqali loyiha fayllarini **papka tuzilmasini saqlagan holda** yuklang. Ba’zi mobil brauzerlar butun papkani yuklashni qo‘llamaydi. Bunday holatda brauzerning **Desktop site** rejimi yoki GitHub’ga repozitoriy yaratib fayllar qo‘shish imkonini beruvchi onlayn IDE kerak bo‘lishi mumkin. ZIPni bitta fayl ko‘rinishida GitHub’ga joylash Vercel uchun yetarli EMAS.
4. vercel.com saytiga kiring → **Add New → Project** → **Import Git Repository** → `lifequest` repozitoriysini tanlang.
5. **Framework Preset: Next.js**, **Root Directory: `./`** (agar GitHub rootida `app` va `package.json` bo‘lsa). Kodlar `LIFEQUEST/` subfolderida joylangan bo‘lsa Root Directory `LIFEQUEST` bo‘lsin.
6. **Deploy** tugmasini bosing. Vercel npm paketlarini o‘rnatadi va build qilishi kerak.
7. Deploy tugagach, `https://....vercel.app` manzilingizni oching.

## Muhim

- Ma’lumotlar serverda emas, saytni ochgan **telefon brauzeridagi IndexedDB**da saqlanadi. Vercel’ga redeploy qilish odatda shu domen saqlansa ma’lumotni o‘chirmaydi; domen almashsa boshqa xotira bo‘ladi.
- Brauzer ma’lumotlarini tozalash yoki boshqa qurilmaga o‘tishdan oldin **Sozlamalar → JSON zaxira** ni yuklab oling.
- PWA o‘rnatish uchun saytda Chrome menyusi → **Add to Home screen** / **Install app** ni tanlang (Android imkoniyatiga qarab).
- Fon rejimida qat’iy rejalangan Android xabarnomalari ushbu versiyada yo‘q.
- ZIP arxivni to‘g‘ridan-to‘g‘ri Vercel web paneliga tashlash Git import o‘rnini bosmaydi.
