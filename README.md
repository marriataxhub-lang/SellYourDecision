# Public Decision Platform (MVP)

Next.js 14 + TypeScript + Tailwind + Supabase anonymous voting app.

## 1) Create Supabase project

1. Create a new Supabase project.
2. Open SQL Editor.
3. Run `supabase/schema.sql`.

## 2) Configure environment variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `VOTER_HASH_SALT` (random secret string)

## 3) Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 4) Deploy to Vercel

1. Import this project in Vercel.
2. Add env vars in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `VOTER_HASH_SALT`
3. Deploy.

## Routes

- `/` Home feed with Active/Ended tabs and search
- `/create` Create decision form with moderation filter
- `/d/[id]` Vote and results page with countdown + final winner
- `/rules` Allowed content and disclaimer page

## Notes

- Voting protections for MVP:
  - Cookie lock: `voted_[decision_id]`
  - DB lock: unique `(decision_id, voter_hash)`
  - `voter_hash = sha256(decision_id + ip + userAgent + salt)` in API route
- Atomic vote path uses Supabase RPC `cast_vote`.
