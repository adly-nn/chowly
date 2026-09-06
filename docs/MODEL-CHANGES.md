# Model changes

Every departure from the approved data model, and why. The eleven entities,
their relationships, and the two structural choices the marker praised
(Waiter/Chef/Bartender as separate tables; Complaint and Rating as separate
entities) are unchanged.

## 1. `RestaurantStatus` and `RestaurantRating` added to `Restaurant`

Marker feedback on the approved model asked for more descriptive depth on
the two thinnest tables. `RestaurantStatus` ("OPEN"/"CLOSED") and
`RestaurantRating` (a decimal, shown nowhere critical to the core flow but
present for completeness and for a future "restaurant is closed" state)
were added.

## 2. `BartenderStatus` added to `Bartender`

Same feedback, same reasoning, applied to the other thin table. Seeded as
"On duty" / "Off duty" per bartender.

## 3. `WaiterID`, `ChefID`, `BartenderID` on `Order` are now nullable

In the approved model these were always populated — every order already
had its staff assigned. In the running application an order exists the
moment a customer submits it, before any staff member has touched it
(`OrderStatus = PLACED`). The waiter records the chef and bartender during
assignment (`OrderStatus -> PREPARING`), not at creation. Making the three
columns nullable models that gap honestly instead of inventing placeholder
staff at order time.

## 4. `MenuItemAvailable` added to `MenuItem`

The build needs a way to take an item off the menu (out of stock, kitchen
can't make it today) without deleting the row — deleting would orphan any
historical `OrderItem` that references it. A boolean flag lets the menu
page grey the item out and refuse to add it to a cart, while every past
order referencing it stays intact.

## 5. `MenuItemDescription` added to `MenuItem`

Not in the original entity list, but the brief's own menu-browsing spec
(§5.1) requires "a one-line description" on every card, and the seed data
spec (§3.5) asks for one on every item. This is a straightforward addition
in the same spirit as `MenuItemAvailable` — a column the UI genuinely
needs that has no bearing on the model's structure or the money/integrity
rules.

## 6. `OrderPreparingAt` and `OrderServedAt` added to `Order`

Added to support the bonus "order timeline" feature (§7.5: placed ->
preparing -> served -> paid, with real timestamps). The approved model
only ever captured `OrderDateTime` (placed) and, via `Payment`, the paid
timestamp — there was no field recording exactly when an order moved into
preparation or was served. Both are nullable and set only by the
corresponding server action (`assignStaff` sets `OrderPreparingAt`;
`markServed` sets `OrderServedAt`), so a `PLACED` order simply has both
as `null` and the timeline renders those steps as not-yet-reached.

## 7. Only one restaurant is live in the running app

The approved model has three restaurants. The brief never asks for a
restaurant picker, and building one would be unrequested scope with its
own edge cases (which restaurant's menu, which restaurant's staff). Only
`R001` (The Yellow Chilli) is seeded and used; the schema still supports
multiple restaurants via the `RestaurantID` foreign keys throughout, so
nothing about the model itself was narrowed — only what the seed script
populates and what the UI assumes as "the" restaurant.

## 8. `MenuItemImageUrl` added to `MenuItem`

Added at the student's request so each menu card can show a real photo.
Nullable, storing a repo-relative path (`/menu/m001.jpg`) into
`public/menu/` rather than an external URL — the app serves the images
itself instead of hotlinking a third party, so the live site never breaks
if some other host goes down or blocks hotlinking. All 17 seeded items
have an image; the field is nullable so the UI degrades gracefully (card
without a photo) if an item is ever added without one. Source and license
for every image is in `docs/IMAGE-CREDITS.md` — all are free-licensed
(CC0 / CC BY / CC BY-SA) photos from Wikimedia Commons.

## Tooling note (not a data-model change)

Prisma and `@prisma/client` are pinned to the stable `6.19.3` release
rather than the `7.x`/`8.0-rc` line that `npm install prisma@latest`
currently resolves to. Prisma 7 moves the datasource connection string out
of `schema.prisma` and into a `prisma.config.ts` file, and requires a
driver adapter passed to the `PrismaClient` constructor instead of reading
`DATABASE_URL` directly — a meaningful architecture change with its own
learning curve, and an unnecessary risk to take on for a graded build in
the middle of that ecosystem's major-version rollout. `6.19.3` keeps the
classic `datasource { url = env(...) }` config this brief was written
against.
