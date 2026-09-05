# AI usage log

Chowly was built with Claude Code as the primary tool, working from
`CHOWLY_BUILD_BRIEF.md` as the spec. This log records what was asked,
what came back, and — honestly — what needed correcting. Entries flagged
**[Human decision needed]** are choices the student should read and
confirm in their own words before submitting, not just accept because
Claude made them.

### 2026-09-05 — Initial scaffold and Prisma setup
**Asked:** Read the full build brief, then scaffold a Next.js 15 (App
Router, TypeScript) + Tailwind v4 + Prisma project matching the brief's
folder structure.
**Produced:** `create-next-app` scaffold restructured into `src/`, then
`npm install prisma @prisma/client zod tsx`.
**Accepted / Rejected / Corrected:** Rejected the versions npm resolved.
`npm install prisma` pulled `prisma@8.0.0-rc.13` (a release candidate)
while `@prisma/client` had resolved separately to `7.10.0` — a mismatched,
partly-prerelease pair. Running `prisma generate` against that pair threw
a schema validation error: Prisma 7+ no longer allows `url`/`directUrl` in
the `datasource` block, requiring a `prisma.config.ts` file and a driver
adapter instead. **Corrected** by pinning both packages to the latest
*stable* release, `6.19.3`, which keeps the classic connection-string
config the brief was written against. **[Human decision needed]**: confirm
you're comfortable staying on Prisma 6.x rather than adopting the new 7.x
config model — documented in `docs/MODEL-CHANGES.md`.

### 2026-09-05 — Data model implementation
**Asked:** Implement the eleven-entity schema from §3 of the brief,
including the three documented deviations (nullable staff FKs on Order,
`MenuItemAvailable`, the two thin-table additions).
**Produced:** `prisma/schema.prisma` with all eleven models plus enums for
every status field.
**Accepted / Rejected / Corrected:** Accepted as specified. Two additional
fields were added beyond the brief's explicit list, because later steps
needed them: `MenuItemDescription` (the menu page and seed spec both
require a description that isn't in the §3.1 field list) and
`OrderPreparingAt` / `OrderServedAt` on Order (needed for the bonus order
timeline feature, since the approved model had no field recording when an
order entered preparation or was served). Both are documented in
`docs/MODEL-CHANGES.md`. **[Human decision needed]**: these two additions
weren't explicitly requested by the brief — confirm you're happy
presenting them as reasonable, documented extensions rather than
undocumented scope creep.

### 2026-09-05 — Seed data
**Asked:** Seed one restaurant, the named staff, and a Nigerian menu of at
least 8 food + 6 drink items with real prices and prep times, per §3.5.
**Produced:** `prisma/seed.ts` — 1 restaurant, 3 customers, 3 waiters, 3
chefs, 3 bartenders, 17 menu items (10 food, 7 drinks), one item seeded
unavailable to exercise the greyed-out state.
**Accepted / Rejected / Corrected:** Accepted without correction. Prices,
descriptions, and prep times beyond the three model-specified items
(Jollof Rice and Chicken, Chapman, Pepper Soup) are invented but
plausible; the student should skim them before submission since they
weren't independently fact-checked against real menu prices.

### 2026-09-05 — Wait-time formula
**Asked:** Implement the wait-time formula from §5.2 exactly as specified
(parallel kitchen/bar, max of prep times, queue penalty).
**Produced:** `src/lib/wait-time.ts`, used identically client-side (live
estimate as items are added) and server-side (`createOrder`).
**Accepted / Rejected / Corrected:** Accepted as specified — the brief
gave an exact formula, so there was no design decision to make here
beyond implementing it faithfully and reusing the same function in both
places rather than approximating it twice.

### 2026-09-05 — Server actions and money integrity
**Asked:** Implement every write path as a Server Action, re-reading
prices server-side, never trusting client-supplied amounts (§3.4).
**Produced:** `src/actions/*.ts` — createOrder, assignStaff, markServed,
submitComplaint, resolveComplaint, submitRating, recordPayment,
switchRole, simulateDelay.
**Accepted / Rejected / Corrected:** Accepted. Added a `scripts/check-integrity.ts`
script beyond what was asked, to satisfy the brief's "write a test or
seed assertion that proves these reconcile" instruction concretely rather
than relying on code review alone — ran it against the live database and
confirmed `OrderAmount`, `OrderItemSubTotal`, and `PaymentAmount` reconcile
exactly.

### 2026-09-05 — Design pass
**Asked:** Apply the Chowdeck-derived design tokens and layout rules from
§6, including the "one memorable thing" (the wait-time countdown).
**Produced:** CSS custom properties mapped through Tailwind v4's `@theme
inline`, a role-switch header with a visible colour/label change per
role, and `WaitCountdown` — a live ticking timer that shifts
green → yellow-fill → red.
**Accepted / Rejected / Corrected:** One self-correction during the build:
the first instinct for the "approaching deadline" state was yellow *text*
on the light background, which the brief explicitly warns fails contrast
— corrected to yellow as a filled background with dark ink text instead,
matching the brief's explicit rule. Reduced-motion handling (freeze the
tick, keep the colour) was implemented by slowing the re-render interval
rather than fully freezing state, a small interpretive choice.
**[Human decision needed]**: confirm that interpretation of "freeze the
count" (30-second re-evaluation instead of a fully static number) matches
what you intended.

### 2026-09-05 — End-to-end verification
**Asked:** Actually run the app against the live database and walk the
full customer → waiter → payment flow before calling it done, not just
type-check it.
**Produced:** A Playwright script driving a headless browser through:
menu → add item → place order → wait time shown → simulate delay →
complaint → rating → switch to waiter → assign chef/bartender → mark
served → switch to customer → pay → receipt → hard reload.
**Accepted / Rejected / Corrected:** The first run's final assertion
(checking the receipt appeared within 15 seconds of a page reload) timed
out — this was a false alarm caused by Neon's cold-start connection
latency after a period of idleness, not a real bug: a follow-up check
moments later confirmed the payment and receipt had in fact persisted
correctly. Noted here rather than silently ignored, since a flaky-looking
result during grading should be attributed to database cold starts, not
assumed to be a broken feature.

### 2026-09-05 — Deployment
**Asked:** Deploy to Vercel with the seeded Neon database, then verify the
live URL on a phone-sized viewport per §10.
**Produced / Accepted / Corrected:** *(completed after this log entry was
first written — see `docs/WALKTHROUGH.md` and the README for the final
live URL and the outcome of that verification pass.)*
