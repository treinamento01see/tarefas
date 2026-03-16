create extension if not exists "pgcrypto";

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  notes text,
  done boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.tasks enable row level security;

drop policy if exists "Public read tasks" on public.tasks;
drop policy if exists "Public insert tasks" on public.tasks;
drop policy if exists "Public update tasks" on public.tasks;
drop policy if exists "Public delete tasks" on public.tasks;

create policy "Public read tasks"
  on public.tasks
  for select
  to anon
  using (true);

create policy "Public insert tasks"
  on public.tasks
  for insert
  to anon
  with check (true);

create policy "Public update tasks"
  on public.tasks
  for update
  to anon
  using (true)
  with check (true);

create policy "Public delete tasks"
  on public.tasks
  for delete
  to anon
  using (true);

-- habilita eventos de realtime para a tabela tasks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;
END
$$;
