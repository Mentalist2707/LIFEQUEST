> **2026-11-07 optimizatsiya:** Sahifalar o‘rtasida qayta Neon so‘rovini to‘xtatish, bootstrap API, IndexedDB account-scoped cache, namoz cache va izolatsiyalangan taymer. Tafsilotlar: `README-TEZLIK-OPTIMIZATSIYA.md`.

# LIFEQUEST — Email/Password login + Neon + Vercel

Mobile-first RPG productivity platform. Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, Neon PostgreSQL.

## New: account system

- **Ro‘yxatdan o‘tish:** name, email, password (at least 10 chars).
- **Kirish:** email + password; logout.
- Passwords are hashed using Node.js `scrypt` with a per-user random salt. Plaintext passwords are not stored.
- On successful authentication the API sets an `HttpOnly`, `SameSite=Lax`, `Secure` (production) 30-day opaque session cookie.
- Session tokens are randomly generated and **only SHA-256 hashes** are stored in Neon.
- Each user has isolated quest data in the existing JSONB `lifequest_state` table (`user:<uuid>` key). All API reads/writes resolve the user from the cookie, never from a client-provided user ID.
- Login throttle: after 5 wrong passwords for an email, 15-minute lockout. This is a baseline; for public applications add IP-level limits, email verification, password-reset email, abuse protection, and monitoring.
- Revision-based saves avoid silent overwrites across devices.
- Existing `lifequest_state.id='personal'` data is preserved, **not automatically assigned to new accounts**. Export it as JSON using the old deployment, then use the new account's Settings > JSON backup import.

## Deploy

1. Upload all project files to a GitHub repository (not a ZIP file as-is).
2. On Vercel: Import Project > Git repository > Framework: Next.js.
3. Under **Settings > Environment Variables**, set `DATABASE_URL` to the Neon connection string for **Production**.
4. `LIFEQUEST_ACCESS_KEY` is no longer used and can be deleted from Vercel after the new deployment is working.
5. Deploy or Redeploy after changing any environment variables.
6. Open the site > **Ro‘yxatdan o‘tish** > create your account > sign in and start using quests.

The API creates `lifequest_users`, `lifequest_sessions`, and `lifequest_state` automatically. Alternatively run `database/schema.sql` in Neon SQL Editor.

## Verification

- `npm install`
- `npm test`
- `npm run typecheck`
- `npm run build`

### Known limitations

- Password reset and email verification are **not implemented**. Keep your password in a password manager; if lost, it cannot currently be recovered via the UI.
- No Google login or external OAuth.
- Online-first: cloud saves require a network connection. Local IndexedDB code remains in the repository for a future per-user offline sync feature, but **is not used as shared live cache** to prevent one account seeing another user's local data.
- No live Neon integration testing is possible without your database credentials; never share those credentials.
