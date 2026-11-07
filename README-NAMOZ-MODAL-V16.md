# LIFEQUEST — Namoz sahifasi v1.6

## Yangi dizayn

- Besh mahal namoz har biri **alohida keng, vertikal qatorda** ko'rsatiladi (ikonlar yo'q).
- Kartada yuqorida namoz nomi va holati, keyin vaqtga oid tirik hisoblagich, keyin amal tugmasi turadi.
- Kartalar holati:
  - **Sariq**: hozir vaqti kirgan, hali o'qilmagan
  - **Yashil**: vaqtida o'qilgan
  - **Qizil**: qazo yoki vaqti o'tgan
  - **Ko'k-binafsha**: qazosini keyin o'qigan
  - **Oddiy ko'k**: hali vaqti kirmagan
- Vaqti tugagan namoz uchun oddiy **O'qidim** tugmasi chiqmaydi. Qazo bo'limidan qazo deb qayd qilish mumkin.
- Izoh, qazo tafsilotlari va tarix alohida yig'iladigan bloklarda.

## Salovat oynasi

- **O'qidim** bosilganda salovatli modal ochiladi.
- Har namoz uchun alohida salovat matni, arabchasi, lotincha o'qilishi va tarjimasi bor.
- **Bekor qilish / yopish** hech qanday XP yozmaydi.
- **Yakunlash** bosilganda vaqt hali amalda bo'lsa va holat o'zgarmagan bo'lsa, namoz bajarildi deb saqlanadi.
- Qazoni keyinchalik o'qish ham alohida modal orqali tasdiqlanadi.
- Avvalgi namoz XP qoidalari o'zgarmagan: vaqtida mukofot, qazo 2x jarima, qazo o'qilsa jarimaning yarmi qaytadi.

## Yangilangan fayllar

- `components/Workspace.tsx`
- `app/globals.css`

## Sinov

- `npm test`: 20/20 test o'tdi.
- TypeScript `transpileModule` sintaksis tekshiruvi o'tdi.
- Muhitda Next.js dependencies o'rnatilmaganligi sababli to'liq Vercel production build tasdiqlanmagan.

## Telefonda deploy

GitHub repository'dagi tegishli fayllarni yangilang yoki ushbu ZIP ichidagi loyihani repository ildiziga yuklang. Neon `DATABASE_URL` o'zgarishsiz qoladi. Ma'lumotlarni zaxiralash tavsiya etiladi.
