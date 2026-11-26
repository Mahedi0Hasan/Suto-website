# SUTO — website

A Next.js clothing store for **SUTO** with a live runway: five looks queue on a runway, you drag or tap to make the front model walk out, the page takes each look's colour, and you can buy a whole look or single pieces. Bangla / English toggle, bag drawer, and cash-on-delivery checkout saved to Supabase.

## Change the store

Everything you will want to edit is in **`lib/config.ts`**:

| What | Where |
|---|---|
| Brand name, tagline, phone, email | `SUTO.brand`, `SUTO.tagline`, `SUTO.contact` |
| Delivery fees | `SUTO.delivery` *(also change in the `suto_place_order` function in Supabase)* |
| Looks, colours, products, prices, sizes | `SUTO.looks` |
| Model photos | transparent WebP/PNG in `public/looks/` (about 400 × 1040, feet at the bottom), set as `image` on each look |

Words on the site (both languages) are in **`lib/i18n.ts`**.

**Prices:** the checkout charges the price stored in Supabase table `suto_products`, not the one in the browser. When you change a price, size or add a product in `lib/config.ts`, change the same row in `suto_products` (Supabase → Table editor).

## Orders

Orders land in Supabase:
- `suto_orders` — customer, phone, address, zone, totals, status (`pending` → `confirmed` → `shipped` → `delivered` / `cancelled`)
- `suto_order_items` — what was bought, size, qty, price

Visitors can only *create* orders (through the `suto_place_order` function, which checks the phone number, sizes and prices). They can't read anyone's orders. You see them in the Supabase dashboard.

### Admin page — `/admin`

Sign in with a Supabase account whose `profiles.role` is `admin` or `staff`. You see today's orders, orders waiting to be confirmed, this month's sales, search by order code / name / phone, and move each order along: pending → confirmed → shipped → delivered (or cancelled). Every status change is logged in `suto_order_events`.

To make someone an admin: create the user in Supabase → Authentication → Users → Add user, then in the SQL editor run

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'their@email.com');
```

The database setup is in `supabase/migrations/` (001 store, 002 admin).

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in the two Supabase values
npm run dev
```

## Deploy

Hosted on Vercel from this repo. Set these environment variables in Vercel → Project → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
