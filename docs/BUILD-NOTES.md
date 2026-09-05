# Build notes

## Stack, and why

**Next.js 15+ (App Router, TypeScript) + Prisma + PostgreSQL, deployed to
Vercel with a Neon database.**

- One deployable artefact. The frontend and the write path (Server
  Actions) ship together, so there's no CORS configuration and no second
  service that has to stay awake. A live-link requirement is the easiest
  thing to fail with a cold-starting free-tier backend on a separate host
  — Next.js on Vercel avoids that failure mode entirely.
- Prisma's schema file doubles as documentation of the implemented data
  model (pasted in full below), which the submission report needs anyway.
- Server Actions keep every write on the server: the client never
  computes a price, a subtotal, a wait time, or a total. Everything in
  §3.4 of the brief (money and integrity rules) is enforced by re-reading
  from the database inside the action, never by trusting what the browser
  sent.
- Tailwind CSS v4 for styling, with the design tokens defined as CSS
  custom properties and mapped through `@theme inline` (see
  `src/app/globals.css`) so `bg-chow-green`, `text-chow-alert`, etc. are
  ordinary Tailwind utilities.
- Zod validates every server action's write payload (`src/lib/validation.ts`).
- No auth library — the brief explicitly asks for no login. Role
  switching is a client-side toggle backed by a lightweight cookie
  (`src/lib/session.ts`), read server-side by every action that needs to
  know "who is doing this."

### Prisma version pin

`prisma` and `@prisma/client` are pinned to the stable **6.19.3** release,
not the `7.x` / `8.0-rc` line that `npm install prisma@latest` currently
resolves to (Prisma is mid-rollout of a new major that moves the
connection string out of `schema.prisma` into `prisma.config.ts` and
requires a driver adapter). See `docs/MODEL-CHANGES.md` for the full
reasoning — this note is here because it explains why `schema.prisma`
below still uses the classic `datasource { url = env(...) }` form.

## Folder structure

```
chowly/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts                 # idempotent seed (npm run db:seed)
│   └── migrations/
├── scripts/
│   └── check-integrity.ts      # money-reconciliation check (npm run db:verify)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # shell, role switch, fonts, nav
│   │   ├── page.tsx             # redirect -> /menu
│   │   ├── not-found.tsx
│   │   ├── menu/page.tsx        # customer: browse + build order
│   │   ├── orders/page.tsx      # customer: my orders
│   │   ├── orders/[id]/page.tsx # customer: one order in full
│   │   ├── waiter/page.tsx      # waiter: order queue + summary strip
│   │   └── waiter/[id]/page.tsx # waiter: assign staff, mark served
│   ├── actions/                 # server actions: one file per concern
│   ├── components/              # client components wrapping each action
│   └── lib/
│       ├── db.ts                # Prisma client singleton
│       ├── session.ts           # role-switch cookie
│       ├── ids.ts                # O004-style business code generation
│       ├── money.ts             # naira formatting
│       ├── wait-time.ts         # the wait-time formula
│       ├── order-view.ts        # derives DELAYED status on read
│       └── validation.ts        # zod schemas for every write
└── docs/
```

## The wait-time formula

Implemented in `src/lib/wait-time.ts`, used identically by the live
estimate on the menu page (client-side, as items are added) and by
`createOrder` (server-side, at the moment the order is actually placed —
the number shown on the confirmation screen is the same function, not an
approximation of it):

```
foodTime  = max(prepTime) across all Food lines     // kitchen works in parallel
drinkTime = max(prepTime) across all Drink lines    // bar works in parallel
base      = max(foodTime, drinkTime)                // kitchen and bar work at once
queue     = 3 x (number of orders currently PLACED or PREPARING)
waitTime  = base + queue
```

Reasoning: a kitchen doesn't cook one dish and then start the next — every
line on an order goes on the pass at once, so the order isn't ready until
its *slowest* line is ready, not the sum of all of them. The kitchen and
the bar are two separate stations that also work concurrently, so the
order is gated by whichever station has the slower line, not both added
together. The `3 x queue` term is a deliberately simple linear penalty for
orders ahead in the pipeline — not a queueing-theory model, just an
honest, explainable heuristic that makes the estimate grow as the
restaurant gets busier, which is the property that matters for the story
(a busy restaurant should show a longer wait).

## Delay detection

`src/lib/order-view.ts` computes `DELAYED` purely on read:

```
isDelayed = now() > OrderDateTime + OrderWaitTime  AND  OrderStatus not in (SERVED, PAID)
```

Nothing writes `DELAYED` into the `Order` row — there's no background job,
and no risk of it drifting out of sync with the clock. Every page that
shows a status (customer order page, waiter queue, waiter order page) runs
the same function against the same two columns.

## Demo controls (labelled honestly, not hidden)

- **"Simulate delay (demo)"** on the customer order page back-dates
  `OrderDateTime` by 45 minutes, so a grader can reach the delay ->
  complaint -> rating path without an actual wait.
- **"Demo payment — no money moves"** badge next to the pay button and
  repeated on the receipt — payment is a `Payment` row and an
  `OrderStatus` flip, nothing more.

## Deployment

1. Neon Postgres project created; pooled connection string as
   `DATABASE_URL`, direct (unpooled) connection string as `DIRECT_URL`.
2. `prisma migrate dev` run locally against Neon to create and apply the
   initial migration (`prisma/migrations/`), committed to the repo.
3. Production seeded once, deliberately, with `npm run db:seed`.
4. Vercel project pointed at the repo; `DATABASE_URL` / `DIRECT_URL` set as
   Vercel environment variables; build command is
   `prisma generate && next build` (see `package.json#scripts.build`), and
   `postinstall` also runs `prisma generate` so the generated client is
   never stale after a fresh install.
5. `npm run db:verify` run against production once seeded, to prove the
   money/integrity rules reconcile on the live database, not just in dev.

## Implemented schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum MenuItemCategory {
  Food
  Drink
}

enum OrderStatus {
  PLACED
  PREPARING
  DELAYED
  SERVED
  PAID
}

enum OrderItemStatus {
  PENDING
  PREPARED
  DELAYED
}

enum ComplaintStatus {
  OPEN
  RESOLVED
}

enum PaymentStatus {
  SUCCESSFUL
}

enum PaymentMethod {
  Card
  Transfer
  Cash
}

model Restaurant {
  RestaurantID           String @id
  RestaurantName         String
  RestaurantAddress      String
  RestaurantPhone        String
  RestaurantOpeningHours String
  RestaurantStatus       String
  RestaurantRating       Float  @default(0)

  Customers  Customer[]
  Waiters    Waiter[]
  Chefs      Chef[]
  Bartenders Bartender[]
  MenuItems  MenuItem[]

  @@map("restaurants")
}

model Customer {
  CustomerID      String @id
  CustomerName    String
  CustomerPhone   String
  CustomerEmail   String
  CustomerTableNo String
  RestaurantID    String

  Restaurant Restaurant  @relation(fields: [RestaurantID], references: [RestaurantID])
  Orders     Order[]
  Complaints Complaint[]
  Ratings    Rating[]

  @@map("customers")
}

model Waiter {
  WaiterID     String @id
  WaiterName   String
  WaiterPhone  String
  WaiterShift  String
  RestaurantID String

  Restaurant Restaurant @relation(fields: [RestaurantID], references: [RestaurantID])
  Orders     Order[]

  @@map("waiters")
}

model Chef {
  ChefID        String @id
  ChefName      String
  ChefSpecialty String
  ChefPhone     String
  ChefShift     String
  RestaurantID  String

  Restaurant Restaurant @relation(fields: [RestaurantID], references: [RestaurantID])
  Orders     Order[]

  @@map("chefs")
}

model Bartender {
  BartenderID     String @id
  BartenderName   String
  BartenderPhone  String
  BartenderShift  String
  BartenderStatus String
  RestaurantID    String

  Restaurant Restaurant @relation(fields: [RestaurantID], references: [RestaurantID])
  Orders     Order[]

  @@map("bartenders")
}

model MenuItem {
  MenuItemID          String           @id
  MenuItemName        String
  MenuItemDescription String
  MenuItemCategory    MenuItemCategory
  MenuItemPrice       Int
  MenuItemPrepTime    Int
  MenuItemAvailable   Boolean          @default(true)
  RestaurantID        String

  Restaurant Restaurant  @relation(fields: [RestaurantID], references: [RestaurantID])
  OrderItems OrderItem[]

  @@map("menu_items")
}

model Order {
  OrderID          String      @id
  OrderDateTime    DateTime
  OrderStatus      OrderStatus @default(PLACED)
  OrderAmount      Int
  OrderWaitTime    Int
  OrderPreparingAt DateTime?
  OrderServedAt    DateTime?
  CustomerID       String
  WaiterID         String?
  ChefID           String?
  BartenderID      String?

  Customer  Customer   @relation(fields: [CustomerID], references: [CustomerID])
  Waiter    Waiter?    @relation(fields: [WaiterID], references: [WaiterID])
  Chef      Chef?      @relation(fields: [ChefID], references: [ChefID])
  Bartender Bartender? @relation(fields: [BartenderID], references: [BartenderID])

  OrderItems OrderItem[]
  Payment    Payment?
  Complaints Complaint[]
  Rating     Rating?

  @@map("orders")
}

model OrderItem {
  OrderItemID       String          @id
  OrderItemQuantity Int
  OrderItemSubTotal Int
  OrderItemStatus   OrderItemStatus @default(PENDING)
  OrderID           String
  MenuItemID        String

  Order    Order    @relation(fields: [OrderID], references: [OrderID])
  MenuItem MenuItem @relation(fields: [MenuItemID], references: [MenuItemID])

  @@map("order_items")
}

model Payment {
  PaymentID       String        @id
  PaymentAmount   Int
  PaymentMethod   PaymentMethod
  PaymentDateTime DateTime
  PaymentStatus   PaymentStatus @default(SUCCESSFUL)
  OrderID         String        @unique

  Order Order @relation(fields: [OrderID], references: [OrderID])

  @@map("payments")
}

model Complaint {
  ComplaintID          String          @id
  ComplaintDescription String
  ComplaintDateTime    DateTime
  ComplaintStatus      ComplaintStatus @default(OPEN)
  OrderID              String
  CustomerID           String

  Order    Order    @relation(fields: [OrderID], references: [OrderID])
  Customer Customer @relation(fields: [CustomerID], references: [CustomerID])

  @@map("complaints")
}

model Rating {
  RatingID       String   @id
  RatingScore    Int
  RatingComment  String?
  RatingDateTime DateTime
  OrderID        String   @unique
  CustomerID     String

  Order    Order    @relation(fields: [OrderID], references: [OrderID])
  Customer Customer @relation(fields: [CustomerID], references: [CustomerID])

  @@map("ratings")
}
```
