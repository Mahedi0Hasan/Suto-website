-- SUTO admin: staff and admins (profiles.role = 'staff' or 'admin') can read orders
-- and change an order's status. Nobody else can.

drop policy if exists "suto staff read orders" on public.suto_orders;
create policy "suto staff read orders" on public.suto_orders
  for select to authenticated using (public.is_staff());

drop policy if exists "suto staff read order items" on public.suto_order_items;
create policy "suto staff read order items" on public.suto_order_items
  for select to authenticated using (public.is_staff());

create table if not exists public.suto_order_events (
  id         bigserial primary key,
  order_id   uuid not null references public.suto_orders(id) on delete cascade,
  from_status text,
  to_status  text not null,
  changed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists suto_order_events_order_idx on public.suto_order_events(order_id);
create index if not exists suto_order_events_user_idx on public.suto_order_events(changed_by);
alter table public.suto_order_events enable row level security;
drop policy if exists "suto staff read order events" on public.suto_order_events;
create policy "suto staff read order events" on public.suto_order_events
  for select to authenticated using (public.is_staff());

-- The only way to change an order: status, checked for staff, logged.
create or replace function public.suto_set_order_status(p_order_id uuid, p_status text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare v_old text;
begin
  if not public.is_staff() then raise exception 'not_allowed'; end if;
  if p_status not in ('pending','confirmed','shipped','delivered','cancelled') then raise exception 'invalid_status'; end if;
  select status into v_old from public.suto_orders where id = p_order_id for update;
  if not found then raise exception 'not_found'; end if;
  if v_old = p_status then return p_status; end if;
  update public.suto_orders set status = p_status where id = p_order_id;
  insert into public.suto_order_events(order_id, from_status, to_status, changed_by) values (p_order_id, v_old, p_status, auth.uid());
  return p_status;
end;
$$;
revoke all on function public.suto_set_order_status(uuid, text) from public, anon;
grant execute on function public.suto_set_order_status(uuid, text) to authenticated;
