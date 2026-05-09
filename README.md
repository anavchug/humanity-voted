# Humanity Voted

One daily "Would You Rather?" question. Two buttons. Instant global results.

## Stack

- Next.js App Router
- TypeScript
- Postgres via Supabase
- Vercel-ready deployment

## Local setup

```bash
npm install
cp .env.example .env
npm run db:seed
npm run dev
```

The app includes a demo fallback when `DATABASE_URL` is missing, so you can run the interface before wiring Supabase.

## Supabase setup

1. Create a free Supabase project.
2. Copy the transaction pooler connection string into `DATABASE_URL`.
3. Run `npm run db:seed`.
4. Deploy to Vercel and add the same `DATABASE_URL` environment variable.

## Product scope

Version one intentionally avoids accounts, demographic questions, comments, and feeds. The whole experience is one daily question, anonymous voting, results, sharing, and an archive.

