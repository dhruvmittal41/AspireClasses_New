begin;
-- Email is no longer verified on public signup: approve a specific admin account.
alter table public.admin_allowlist add column if not exists user_id uuid references auth.users(id) on delete set null;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
 select exists (
  select 1 from auth.users u join public.admin_allowlist a
  on a.user_id=u.id and lower(trim(a.email))=lower(trim(u.email))
  where u.id=auth.uid() and a.enabled
 )
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.password_help_requests (
 id uuid primary key default gen_random_uuid(),
 email text not null check(length(email) between 3 and 254),
 contact text not null check(length(contact) between 7 and 40),
 status text not null default 'pending' check(status in ('pending','resolved','rejected')),
 created_at timestamptz not null default now(),
 reviewed_at timestamptz,
 reviewed_by uuid references auth.users(id) on delete set null
);
create index if not exists password_help_email_time on public.password_help_requests(email,created_at desc);
alter table public.password_help_requests enable row level security;
revoke all on public.password_help_requests from public, anon, authenticated;
grant select on public.password_help_requests to authenticated;
grant update(status,reviewed_at,reviewed_by) on public.password_help_requests to authenticated;
create policy password_help_admin_read on public.password_help_requests for select to authenticated using(public.is_admin());
create policy password_help_admin_update on public.password_help_requests for update to authenticated using(public.is_admin()) with check(public.is_admin());

create or replace function public.request_password_help(p_email text,p_contact text)
returns void language plpgsql security definer set search_path='' as $$
declare normalized text := lower(trim(p_email));
begin
 if normalized is null or length(normalized) not between 3 and 254 or normalized !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
 or p_contact is null or length(trim(p_contact)) not between 7 and 40 then raise exception 'Invalid request'; end if;
 perform pg_advisory_xact_lock(hashtextextended(normalized,42));
 -- Same response for existing and unknown accounts; at most one request per email per day.
 if exists(select 1 from public.password_help_requests where email=normalized and created_at>now()-interval '24 hours') then return; end if;
 insert into public.password_help_requests(email,contact) values(normalized,trim(p_contact));
end $$;
revoke all on function public.request_password_help(text,text) from public;
grant execute on function public.request_password_help(text,text) to anon,authenticated;

create or replace function public.password_help_account(p_request_id uuid)
returns uuid language plpgsql security definer set search_path='' as $$
declare target uuid;
begin
 if not public.is_admin() then raise exception 'Not authorized'; end if;
 select u.id into target from public.password_help_requests r join auth.users u on lower(trim(u.email))=r.email
 where r.id=p_request_id and r.status='pending';
 -- Admin recovery must be performed by the project owner, outside the student help flow.
 if exists(select 1 from public.admin_allowlist a join auth.users u on u.id=target
 where a.user_id=target or lower(trim(a.email))=lower(trim(u.email))) then raise exception 'Use project owner recovery for admin accounts'; end if;
 return target;
end $$;
revoke all on function public.password_help_account(uuid) from public,anon;
grant execute on function public.password_help_account(uuid) to authenticated;
commit;
