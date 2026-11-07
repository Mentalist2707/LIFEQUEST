# LIFEQUEST — Telefonda GitHub + Neon + Vercel

1. ZIP arxivni telefoningizda oching. Uning ichidagi **barcha fayl va papkalarni** GitHub repositoryga yuklang.
2. Neon Console'da PostgreSQL database yarating va **pooled connection string** oling.
3. Vercel > LIFEQUEST > Settings > Environment Variables:
   - `DATABASE_URL` = Neon connection string
   - Environment: **Production**
4. `LIFEQUEST_ACCESS_KEY` endi shart emas. Bu eski versiyadan qolgan kalit.
5. Vercel > Deployments > eng yangi deployment > Redeploy. Holati **Ready** bo‘lsin.
6. LIFEQUEST saytini oching. **Ro‘yxatdan o‘tish** tugmasini bosing, ismingiz, email va kamida 10 belgili parol bilan hisob yarating.
7. Yangi hisob orqali vazifalaringizni yaratib ko‘ring. Sahifani yangilang: ma’lumot Neon'dan qayta yuklanishi kerak.

**Oldingi ma’lumotlar:** avvalgi bitta foydalanuvchilik versiyaning `personal` yozuvi o‘chirilmaydi, ammo yangi hisobga avtomatik ko‘chmaydi. Eski versiyada Settings > JSON zaxira eksport qilib, yangi versiyada JSON import qiling.

**Xavfsizlik:** `DATABASE_URL`, parol yoki session cookie ni hech kimga yubormang. Vercel env qiymatlarini `NEXT_PUBLIC_` bilan boshlamang.
