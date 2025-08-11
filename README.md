# GPT Alerts Backend (Vercel)

## Deploy rápido
1. Crie um repo no GitHub e suba estes ficheiros.
2. No Vercel: **Add New → Project** e importe o repo.
3. Em **Settings → Environment Variables**, defina:
   - `DATABASE_URL` (Neon)
   - `RESEND_API_KEY` (Resend)
   - `RESEND_FROM` (ex.: `Alerts <onboarding@resend.dev>`)
   - `ALPHAVANTAGE_KEY` (Alpha Vantage)
   - `ALLOWED_ORIGINS` (seu site, ex.: `https://usuario.github.io`)
4. Deploy. Teste `GET /api/health`.
5. O cron `/api/cron` corre de 5/5 min (Production).

## Endpoints
- `POST /api/alerts` { email, symbol, percent, direction? }
- `GET /api/alerts?email=user@x.com`
- `GET /api/health`

## SQL (Neon)
Use `schema.sql` para criar a tabela.
