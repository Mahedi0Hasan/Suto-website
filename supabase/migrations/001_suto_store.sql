-- SUTO store: products (prices the server trusts), orders, order items.
-- All tables are prefixed suto_ so they live safely beside other tables in the same project.

create table if not exists public.suto_products (
  id        text primary key,
  name_en   text not null,
  name_bn   text not null,
  price     integer not null check (price > 0),
  sizes     text[] not null,
  active    boolean not null default true
);

create table if not exists public.suto_orders (
  id             uuid primary key default gen_random_uuid(),
  order_code     text unique not null,
  customer_name  text not null,
  phone          text not null,
  address        text not null,
  zone           text not null check (zone in ('dhaka','outside')),
  note           text,
  payment_method text not null default 'cod' check (payment_method in ('cod')),
  subtotal       integer not null,
  delivery_fee   integer not null,
  total          integer not null,
  status         text not null default 'pending' check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  lang           text not null default 'en',
  created_at     timestamptz not null default now()
);

create table if not exists public.suto_order_items (
  id          bigserial primary key,
  order_id    uuid not null references public.suto_orders(id) on delete cascade,
  product_id  text not null references public.suto_products(id),
  size        text not null,
  qty         integer not null check (qty between 1 and 20),
  unit_price  integer not null,
  line_total  integer not null
);
create index if not exists suto_order_items_order_idx on public.suto_order_items(order_id);
create index if not exists suto_order_items_product_idx on public.suto_order_items(product_id);
create index if not exists suto_orders_phone_created_idx on public.suto_orders(phone, created_at desc);

alter table public.suto_products    enable row level security;
alter table public.suto_orders      enable row level security;
alter table public.suto_order_items enable row level security;

-- Anyone may read active products. Orders and items have no public policies:
-- visitors can only create orders through suto_place_order below.
drop policy if exists "suto products are public" on public.suto_products;
create policy "suto products are public" on public.suto_products
  for select to anon, authenticated using (active);

create or replace function public.suto_place_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name    text := btrim(coalesce(payload->>'name',''));
  v_phone   text := regexp_replace(coalesce(payload->>'phone',''), '[\s-]', '', 'g');
  v_address text := btrim(coalesce(payload->>'address',''));
  v_zone    text := coalesce(payload->>'zone','');
  v_note    text := left(btrim(coalesce(payload->>'note','')), 500);
  v_lang    text := case when payload->>'lang' = 'bn' then 'bn' else 'en' end;
  v_items   jsonb := payload->'items';
  v_item    jsonb;
  v_prod    public.suto_products%rowtype;
  v_qty     integer;
  v_size    text;
  v_sub     integer := 0;
  v_fee     integer;
  v_code    text;
  v_order   uuid;
begin
  if char_length(v_name) not between 2 and 80 then raise exception 'invalid_name'; end if;
  if v_phone !~ '^(\+?88)?01[3-9][0-9]{8}$' then raise exception 'invalid_phone'; end if;
  if char_length(v_address) not between 5 and 300 then raise exception 'invalid_address'; end if;
  if v_zone not in ('dhaka','outside') then raise exception 'invalid_zone'; end if;
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) not between 1 and 30 then raise exception 'invalid_items'; end if;
  if exists (select 1 from public.suto_orders where phone = v_phone and created_at > now() - interval '30 seconds') then
    raise exception 'too_fast';
  end if;

  -- Delivery fees: keep in step with SUTO.delivery in lib/config.ts
  v_fee := case v_zone when 'dhaka' then 80 else 150 end;

  for v_item in select * from jsonb_array_elements(v_items) loop
    select * into v_prod from public.suto_products where id = v_item->>'id' and active;
    if not found then raise exception 'unknown_product'; end if;
    v_size := coalesce(v_item->>'size','');
    if not (v_size = any(v_prod.sizes)) then raise exception 'invalid_size'; end if;
    v_qty := coalesce((v_item->>'qty')::integer, 0);
    if v_qty not between 1 and 20 then raise exception 'invalid_qty'; end if;
    v_sub := v_sub + v_prod.price * v_qty;
  end loop;

  v_code := 'SUTO-' || to_char(now() at time zone 'Asia/Dhaka','YYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text),1,5));

  insert into public.suto_orders(order_code, customer_name, phone, address, zone, note, subtotal, delivery_fee, total, lang)
  values (v_code, v_name, v_phone, v_address, v_zone, nullif(v_note,''), v_sub, v_fee, v_sub + v_fee, v_lang)
  returning id into v_order;

  insert into public.suto_order_items(order_id, product_id, size, qty, unit_price, line_total)
  select v_order, p.id, i->>'size', (i->>'qty')::integer, p.price, p.price * (i->>'qty')::integer
  from jsonb_array_elements(v_items) i
  join public.suto_products p on p.id = i->>'id';

  return jsonb_build_object('order_code', v_code, 'subtotal', v_sub, 'delivery_fee', v_fee, 'total', v_sub + v_fee);
end;
$$;

revoke all on function public.suto_place_order(jsonb) from public;
grant execute on function public.suto_place_order(jsonb) to anon, authenticated;

-- Seed: keep ids, prices and sizes in step with lib/config.ts
insert into public.suto_products(id, name_en, name_bn, price, sizes) values
  ('p1','Cotton panjabi','সুতির পাঞ্জাবি',4200,'{S,M,L,XL}'),
  ('p2','Pajama trouser','পায়জামা',2200,'{S,M,L,XL}'),
  ('p3','Mustard shawl','সরষে রঙের শাল',3500,'{Free}'),
  ('p4','Embroidered kurti','এমব্রয়ডারি কুর্তি',3800,'{S,M,L}'),
  ('p5','Palazzo','পালাজো',2400,'{S,M,L}'),
  ('p6','Chiffon dupatta','শিফন ওড়না',2000,'{Free}'),
  ('p7','Linen blazer','লিনেন ব্লেজার',7900,'{38,40,42,44}'),
  ('p8','Oxford shirt','অক্সফোর্ড শার্ট',2600,'{S,M,L,XL}'),
  ('p9','Tailored trouser','টেইলর্ড ট্রাউজার',3200,'{30,32,34,36}'),
  ('p10','Midi dress','মিডি ড্রেস',5600,'{XS,S,M,L}'),
  ('p11','Cropped linen jacket','ক্রপড লিনেন জ্যাকেট',4800,'{S,M,L}'),
  ('p12','Block-heel mules','ব্লক-হিল মিউল',3200,'{36,37,38,39,40}'),
  ('p13','Rust overshirt','রাস্ট ওভারশার্ট',4400,'{S,M,L,XL}'),
  ('p14','Heavyweight tee','হেভিওয়েট টি-শার্ট',2000,'{S,M,L,XL}'),
  ('p15','Cargo trouser','কার্গো ট্রাউজার',3600,'{30,32,34,36}')
on conflict (id) do update set name_en = excluded.name_en, name_bn = excluded.name_bn, price = excluded.price, sizes = excluded.sizes;
