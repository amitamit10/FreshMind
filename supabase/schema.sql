create extension if not exists pgcrypto;

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'adult', 'child')),
  created_at timestamptz not null default now(),
  unique (household_id, user_id)
);

create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  category text,
  quantity_label text,
  storage_location text not null default 'fridge'
    check (storage_location in ('fridge', 'freezer', 'pantry', 'cabinet', 'other')),
  expiry_date date,
  status text not null default 'active'
    check (status in ('active', 'used', 'finished', 'expired')),
  added_by text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shopping_list_items (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  note text,
  completed boolean not null default false,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists food_items_household_expiry_idx
  on public.food_items (household_id, expiry_date, status);

create index if not exists shopping_list_items_household_completed_idx
  on public.shopping_list_items (household_id, completed);

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on public.households to service_role;
grant select, insert, update, delete on public.household_members to service_role;
grant select, insert, update, delete on public.food_items to service_role;
grant select, insert, update, delete on public.shopping_list_items to service_role;

grant select on public.households to authenticated;
grant select on public.household_members to authenticated;
grant select, insert, update, delete on public.food_items to authenticated;
grant select, insert, update, delete on public.shopping_list_items to authenticated;

alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.food_items enable row level security;
alter table public.shopping_list_items enable row level security;

create policy "Households visible to members"
on public.households
for select
to authenticated
using (
  exists (
    select 1
    from public.household_members
    where public.household_members.household_id = households.id
      and public.household_members.user_id = (select auth.uid())
  )
);

create policy "Household members visible to same household"
on public.household_members
for select
to authenticated
using (
  exists (
    select 1
    from public.household_members as members
    where members.household_id = household_members.household_id
      and members.user_id = (select auth.uid())
  )
);

create policy "Members can read food items"
on public.food_items
for select
to authenticated
using (
  exists (
    select 1
    from public.household_members
    where public.household_members.household_id = food_items.household_id
      and public.household_members.user_id = (select auth.uid())
  )
);

create policy "Members can insert food items"
on public.food_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.household_members
    where public.household_members.household_id = food_items.household_id
      and public.household_members.user_id = (select auth.uid())
  )
);

create policy "Members can update food items"
on public.food_items
for update
to authenticated
using (
  exists (
    select 1
    from public.household_members
    where public.household_members.household_id = food_items.household_id
      and public.household_members.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.household_members
    where public.household_members.household_id = food_items.household_id
      and public.household_members.user_id = (select auth.uid())
  )
);

create policy "Members can delete food items"
on public.food_items
for delete
to authenticated
using (
  exists (
    select 1
    from public.household_members
    where public.household_members.household_id = food_items.household_id
      and public.household_members.user_id = (select auth.uid())
  )
);

create policy "Members can read shopping items"
on public.shopping_list_items
for select
to authenticated
using (
  exists (
    select 1
    from public.household_members
    where public.household_members.household_id = shopping_list_items.household_id
      and public.household_members.user_id = (select auth.uid())
  )
);

create policy "Members can insert shopping items"
on public.shopping_list_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.household_members
    where public.household_members.household_id = shopping_list_items.household_id
      and public.household_members.user_id = (select auth.uid())
  )
);

create policy "Members can update shopping items"
on public.shopping_list_items
for update
to authenticated
using (
  exists (
    select 1
    from public.household_members
    where public.household_members.household_id = shopping_list_items.household_id
      and public.household_members.user_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.household_members
    where public.household_members.household_id = shopping_list_items.household_id
      and public.household_members.user_id = (select auth.uid())
  )
);

insert into public.households (name, slug)
values ('FreshMind Demo Home', 'freshmind-demo')
on conflict (slug) do nothing;
