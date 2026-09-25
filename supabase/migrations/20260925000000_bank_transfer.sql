-- Manual bank transfers: orders wait in "awaiting_transfer" until the store
-- owner confirms the money arrived and sets status = 'paid' by hand in the
-- table editor. paid_at is then filled in automatically.

alter table public.orders drop constraint orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'awaiting_payment', 'awaiting_transfer', 'confirming',
                    'paid', 'partially_paid', 'failed', 'expired', 'refunded',
                    'review', 'cancelled'));

create or replace function public.orders_touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  if new.status = 'paid' and new.paid_at is null then
    new.paid_at := now();
  end if;
  return new;
end;
$$;
