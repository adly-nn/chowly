# Chowly

Chowly is a **dine-in ordering platform used inside a restaurant** — not a
delivery app. A customer sitting at a table browses the menu, places an
order, sees the estimated wait time, complains and rates if it runs late,
and pays on the platform on the way out. A waiter picks the order up,
records which chef and bartender prepared it, and marks it served. Built
for a Univaciti / TeSA Africa assignment on top of an already-approved
eleven-entity data model.

**Live URL:** https://chowly-three.vercel.app

## Stack

Next.js 15 (App Router, TypeScript) · Prisma · PostgreSQL (Neon) ·
Tailwind CSS v4 · Zod · deployed on Vercel. No auth — role switching is a
cookie-backed toggle, per the brief. See `docs/BUILD-NOTES.md` for the
full reasoning behind every stack choice.

## Local setup

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL and DIRECT_URL (Neon, or any Postgres)
npx prisma migrate dev      # creates the schema
npm run db:seed             # seeds the restaurant, staff, and menu
npm run dev                 # http://localhost:3000
```

Useful scripts:

- `npm run db:seed` — idempotent seed (safe to re-run).
- `npm run db:verify` — re-checks every Order/OrderItem/Payment in the
  database and confirms the money arithmetic reconciles exactly.
- `npm run build` — runs `prisma generate` then `next build`.

## Demo walkthrough

See `docs/WALKTHROUGH.md` for the full numbered path — menu → order → wait
time → simulated delay → complaint → rating → waiter assignment → served
→ payment → receipt → hard refresh.

## Documentation

- `docs/MODEL-CHANGES.md` — every departure from the approved data model,
  and why.
- `docs/BUILD-NOTES.md` — stack reasoning, folder structure, the full
  implemented schema, and the wait-time formula.
- `docs/WALKTHROUGH.md` — the numbered demo path.
- `docs/AI-USAGE-LOG.md` — how AI was used while building this, including
  what was rejected or corrected.
