create type editor_schema.vote_type as enum (
  'upvote',
  'neutral',     -- default
  'downvote'
);

create type editor_schema.vote_tally as (upvotes integer, neutrals integer, downvotes integer);

create table editor_schema.vote (
  thread_id  integer not null references editor_schema.thread(id),
  person_id  integer not null default editor_schema.current_person_id() references editor_schema.person(id),
  vote       editor_schema.vote_type default null,
  constraint one_vote_per_person unique (thread_id, person_id),
  primary key (thread_id, person_id)
);
comment on table editor_schema.vote is 'A vote on a thread.';
comment on column editor_schema.vote.person_id is 'The id of the voter person.';
comment on column editor_schema.vote.thread_id is 'The id of the voted on thread.';
comment on column editor_schema.vote.vote is 'The vote type';

grant select on table editor_schema.vote to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;
grant insert, update on table editor_schema.vote to $POSTGRESQL_ROLE_PERSON;
alter table editor_schema.vote enable row level security;

-- CRUD
create policy insert_vote on editor_schema.vote for insert to $POSTGRESQL_ROLE_PERSON
  with check (person_id = current_setting('jwt.claims.person_id')::integer);
create policy select_vote on editor_schema.vote for select
  using (true);
create policy update_vote on editor_schema.vote for update to $POSTGRESQL_ROLE_PERSON
  using (person_id = current_setting('jwt.claims.person_id')::integer or editor_schema.current_person_is_admin());
create policy delete_vote on editor_schema.vote for delete to $POSTGRESQL_ROLE_PERSON
  using (editor_schema.current_person_is_admin());

-- gets the current user's vote on a thread
create function editor_schema.users_vote_on_thread(
  thread_id int
) returns editor_schema.vote_type as $$
  select vote from editor_schema.vote where person_id = editor_schema.current_person_id();
$$ language sql stable set search_path from current;
comment on function editor_schema.users_vote_on_thread(integer) is 'Gets the current users vote on a thread.';

grant execute on function editor_schema.users_vote_on_thread(integer) to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;

-- gets vote tally for a thread
create function editor_schema.votes_tally(
  thread_id integer
) returns editor_schema.vote_tally as $$
declare
  result_record editor_schema.vote_tally;
begin
  select
  	sum(case when vote = 'upvote' then 1 else 0 end),  -- upvotes
    sum(case when vote = 'neutral' then 1 else 0 end), -- neutrals
  	sum(case when vote = 'downvote' then 1 else 0 end) -- downvotes
  into result_record
  from editor_schema.vote;
  return result_record;
end
$$ language plpgsql stable set search_path from current;
comment on function editor_schema.votes_tally(integer) is 'Gets the votes tally for a thread.';

grant execute on function editor_schema.votes_tally(integer) to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;
