create type public.app_role as enum ('admin','user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create policy "Users read own roles" on public.user_roles
  for select to authenticated using (auth.uid() = user_id);
create policy "Admins read all roles" on public.user_roles
  for select to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "Admins manage roles" on public.user_roles
  for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  college_id text not null,
  college_name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, college_id)
);
alter table public.favorites enable row level security;
create policy "Users manage own favorites" on public.favorites
  for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);

revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;