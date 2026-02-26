-- Enable extension for UUID generation
create extension if not exists pgcrypto;

-- Decisions table
create table if not exists public.decisions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null check (char_length(title) between 1 and 90),
  details text not null check (char_length(details) between 1 and 800),
  option_a text not null check (char_length(option_a) between 1 and 40),
  option_b text not null check (char_length(option_b) between 1 and 40),
  category text not null check (category in ('Career', 'Relationships', 'Lifestyle', 'Money (safe)', 'Other')),
  expires_at timestamptz not null,
  vote_count_a integer not null default 0 check (vote_count_a >= 0),
  vote_count_b integer not null default 0 check (vote_count_b >= 0)
);

create index if not exists decisions_created_at_idx on public.decisions (created_at desc);
create index if not exists decisions_expires_at_idx on public.decisions (expires_at);

-- Votes table
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  decision_id uuid not null references public.decisions(id) on delete cascade,
  created_at timestamptz not null default now(),
  choice text not null check (choice in ('A', 'B')),
  voter_hash text not null,
  user_agent text,
  unique (decision_id, voter_hash)
);

create index if not exists votes_decision_id_idx on public.votes (decision_id);

-- Atomic vote function
create or replace function public.cast_vote(
  p_decision_id uuid,
  p_choice text,
  p_voter_hash text,
  p_user_agent text default null
)
returns table(success boolean, message text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_decision public.decisions%rowtype;
begin
  if p_choice not in ('A', 'B') then
    return query select false, 'Invalid choice';
    return;
  end if;

  select * into v_decision
  from public.decisions
  where id = p_decision_id
  for update;

  if not found then
    return query select false, 'Decision not found';
    return;
  end if;

  if now() >= v_decision.expires_at then
    return query select false, 'Voting has ended';
    return;
  end if;

  insert into public.votes (decision_id, choice, voter_hash, user_agent)
  values (p_decision_id, p_choice, p_voter_hash, left(coalesce(p_user_agent, ''), 300));

  if p_choice = 'A' then
    update public.decisions
    set vote_count_a = vote_count_a + 1
    where id = p_decision_id;
  else
    update public.decisions
    set vote_count_b = vote_count_b + 1
    where id = p_decision_id;
  end if;

  return query select true, 'Vote recorded';
exception
  when unique_violation then
    return query select false, 'You already voted on this decision';
end;
$$;

-- RLS
alter table public.decisions enable row level security;
alter table public.votes enable row level security;

-- Decisions policies: public read + insert, no anon update/delete
drop policy if exists decisions_select_all on public.decisions;
create policy decisions_select_all on public.decisions
for select
using (true);

drop policy if exists decisions_insert_all on public.decisions;
create policy decisions_insert_all on public.decisions
for insert
to anon
with check (true);

-- Votes policies: public read + insert for MVP
drop policy if exists votes_select_all on public.votes;
create policy votes_select_all on public.votes
for select
using (true);

drop policy if exists votes_insert_all on public.votes;
create policy votes_insert_all on public.votes
for insert
to anon
with check (choice in ('A', 'B'));

-- Allow anon/authenticated to execute RPC
grant execute on function public.cast_vote(uuid, text, text, text) to anon, authenticated;
