-- Orders placed through the site. One row per checkout attempt.
--
-- Rows are written ONLY by the serverless functions in api/, using the
-- service-role key (which bypasses row-level security). Signed-in customers
-- can read their own orders from the browser for the Account page, and
-- nothing else: there are deliberately no insert/update/delete policies.

create table public.orders (
  id                   uuid primary key default gen_random_uuid(),
  order_number         text not null unique,
  user_id              uuid not null references auth.users (id) on delete restrict,
  email                text not null,

  -- pending → awaiting_payment → confirming → paid
  -- or partially_paid / failed / expired / refunded / review (amount mismatch)
  status               text not null default 'pending'
                         check (status in ('pending', 'awaiting_payment', 'confirming',
                                           'paid', 'partially_paid', 'failed',
                                           'expired', 'refunded', 'review', 'cancelled')),

  items                jsonb not null,         -- [{variantId, product, label, unitPrice, qty}]
  total_cents          integer not null check (total_cents > 0),
  currency             text not null default 'usd',

  -- Customer and compliance record, snapshotted at order time.
  contact_name         text not null,
  company_name         text not null,
  organization_type    text not null,
  research_field       text not null,
  phone                text not null,
  ship_line1           text not null,
  ship_line2           text,
  ship_city            text not null,
  ship_state           text not null,
  ship_zip             text not null,
  ship_country         text not null default 'US',
  research_use_ack_at  timestamptz not null,
  terms_accepted_at    timestamptz not null,
  client_ip            text,
  user_agent           text,

  -- Payment provider state.
  payment_provider     text not null,
  provider_invoice_id  text,
  provider_payment_id  text,
  payment_status       text,
  pay_currency         text,
  pay_amount           numeric,
  actually_paid        numeric,
  paid_at              timestamptz,

  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create index orders_user_id_idx on public.orders (user_id, created_at desc);

create function public.orders_touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger orders_touch_updated_at
  before update on public.orders
  for each row execute function public.orders_touch_updated_at();

alter table public.orders enable row level security;

create policy "Customers read their own orders"
  on public.orders for select
  to authenticated
  using ((select auth.uid()) = user_id);
