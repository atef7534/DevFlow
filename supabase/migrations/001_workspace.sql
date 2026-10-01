-- One private workspace snapshot per signed-in user. The browser client can only
-- read and replace the row belonging to auth.uid(); vocabulary ships as public
-- read-only application data and is not duplicated per account.
create table if not exists public.workspace_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.workspace_snapshots enable row level security;

create policy "Users can read their own workspace"
  on public.workspace_snapshots for select using (auth.uid() = user_id);
create policy "Users can create their own workspace"
  on public.workspace_snapshots for insert with check (auth.uid() = user_id);
create policy "Users can update their own workspace"
  on public.workspace_snapshots for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Account deletion is explicit and cascades to the user's private snapshot.
create or replace function public.delete_own_account()
returns void language sql security definer set search_path = ''
as $$ delete from auth.users where id = auth.uid(); $$;
revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
