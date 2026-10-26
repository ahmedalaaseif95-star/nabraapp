create type public.app_role as enum ('admin', 'user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

-- Pilot bootstrap: the first signed-in user may claim admin only while no admin exists.
create or replace function public.claim_first_admin()
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then return false; end if;
  lock table public.user_roles in exclusive mode;
  if exists (select 1 from public.user_roles where role = 'admin') then
    return public.has_role(auth.uid(), 'admin');
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin');
  return true;
end $$;
revoke all on function public.claim_first_admin() from public, anon;
grant execute on function public.claim_first_admin() to authenticated;

create table public.source_segments (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  license text not null,
  commercial_use_allowed boolean not null default false,
  file_name text not null,
  segment_id text not null,
  ground_truth_text text,
  processed_text text,
  search_text text,
  speaker_dialect text,
  show_name text,
  category text,
  segment_start double precision,
  segment_end double precision,
  flag_empty_text boolean not null default false,
  flag_uncertain_dialect boolean not null default false,
  imported_by uuid,
  imported_at timestamptz not null default now(),
  unique (source, file_name, segment_id)
);
grant select, insert on public.source_segments to authenticated;
grant all on public.source_segments to service_role;
alter table public.source_segments enable row level security;
create policy "Admins read segments" on public.source_segments for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins insert segments" on public.source_segments for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create index source_segments_dialect_idx on public.source_segments (source, speaker_dialect);