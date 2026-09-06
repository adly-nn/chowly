# Walkthrough

A numbered path a stranger can follow on the live link alone. Takes about
three minutes.

> Live URL: https://chowly-three.vercel.app

1. **Open the link.** It redirects straight to `/menu`. The header is
   green, reading "Chowly — The Yellow Chilli."
2. **Find the role switch.** It's the pill toggle in the header, top
   right of the logo — **Customer / Waiter** — with a picker next to it
   for which person you currently are, and a one-line band under the
   header ("Customer view — Table T01") that changes with it. You start
   as Ayo Afolabi, Table T01, in Customer mode.
3. **Pick items.** Under Food and Drinks, tap "Add" on a couple of items —
   try Jollof Rice and Chicken plus a Chapman. Notice the sticky cart
   panel (bottom on phone, right-hand sidebar on desktop) fills in with
   line items, a running total, and an **estimated wait** that updates
   live as you add more.
4. **Submit the order.** Tap "Place order." You land on the order's own
   page, showing the order code, every item and its subtotal, the total,
   the status ("Placed"), and — in the large countdown panel — the
   **estimated wait**, ticking down live.
5. **Simulate the delay.** Scroll down to the small dashed "Simulate delay
   (demo)" button and tap it. It's labelled honestly as a demo aid — it
   back-dates the order by 45 minutes so you don't have to actually wait.
   The status pill turns red ("Delayed"), and the countdown panel and item
   status flip colour to match.
6. **Complain and rate.** With the order now delayed, the complaint box is
   the prominent one on the page — type a line and submit; it appears in
   a list under the box with its timestamp. Below it, tap a star rating
   (1–5) and optionally add a comment, then submit.
7. **Switch to Waiter.** Tap **Waiter** in the role-switch pill. The header
   band changes to "Waiter view," and a new nav tab, "Order queue,"
   replaces "Menu"/"My orders." Pick a waiter from the dropdown if you
   like — the default is Chinedu Dim.
8. **Open the order queue.** Tap "Order queue." You'll see the order you
   just placed, flagged with a red left border because it's delayed, plus
   a small summary strip (orders today, revenue collected, average
   rating, open complaints).
9. **Assign chef and bartender.** Tap into the order. Pick a chef and a
   bartender from the two dropdowns and tap "Save assignment" — the
   status flips to "Preparing," and the complaint you left as a customer
   is visible here too, with a "Mark resolved" button.
10. **Mark it served.** Now that a chef and bartender are recorded, "Mark
    as served" is enabled — tap it. Status flips to "Served."
11. **Switch back to Customer.** Tap **Customer** in the role switch, go
    back to "My orders," and open the same order.
12. **Pay.** The payment section is now unlocked (it was blocked until
    Served). Pick a method — Card, Transfer, or Cash — and tap "Pay ₦…
    now." Notice the **"Demo payment — no money moves"** badge next to
    the button, and again on the receipt that appears after paying:
    payment code, method, amount, and timestamp.
13. **Hard-refresh the page.** Everything — the paid status, the receipt,
    the complaint, the rating, the assigned chef and bartender — is still
    there. It's a real database, not local state.

That's the whole story: a customer orders, waits, complains, rates, and
pays; a waiter picks the order up, records who made it, and serves it —
all without a login, on one link.
