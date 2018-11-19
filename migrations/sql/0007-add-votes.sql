create type ontology_editor.vote_type as enum (
  'upvote',
  'neutral',     -- default
  'downvote'
);

create type ontology_editor.vote_tally as (upvotes integer, neutrals integer, downvotes integer);

create table ontology_editor.vote (
  thread_id  integer not null references ontology_editor.thread(id),
  person_id  integer not null default ontology_editor.current_person_id() references ontology_editor.person(id),
  vote       ontology_editor.vote_type default null,
  constraint one_vote_per_person unique (thread_id, person_id),
  primary key (thread_id, person_id)
);
comment on table ontology_editor.vote is 'A vote on a thread.';
comment on column ontology_editor.vote.person_id is 'The id of the voter person.';
comment on column ontology_editor.vote.thread_id is 'The id of the voted on thread.';
comment on column ontology_editor.vote.vote is 'The vote type';

grant select on table ontology_editor.vote to ontology_editor_anonymous, ontology_editor_person;
grant insert, update on table ontology_editor.vote to ontology_editor_person;
alter table ontology_editor.vote enable row level security;

-- CRUD
create policy insert_vote on ontology_editor.vote for insert to ontology_editor_person
  with check (person_id = current_setting('jwt.claims.person_id')::integer);
create policy select_vote on ontology_editor.vote for select
  using (true);
create policy update_vote on ontology_editor.vote for update to ontology_editor_person
  using (person_id = current_setting('jwt.claims.person_id')::integer or ontology_editor.current_person_is_admin());
create policy delete_vote on ontology_editor.vote for delete to ontology_editor_person
  using (ontology_editor.current_person_is_admin());

-- gets the current user's vote on a thread
create function ontology_editor.users_vote_on_thread(
  thread_id int
) returns ontology_editor.vote_type as $$
  select vote from ontology_editor.vote where person_id = ontology_editor.current_person_id();
$$ language sql stable set search_path from current;
comment on function ontology_editor.users_vote_on_thread(integer) is 'Gets the current users vote on a thread.';

grant execute on function ontology_editor.users_vote_on_thread(integer) to ontology_editor_anonymous, ontology_editor_person;

-- gets vote tally for a thread
create function ontology_editor.votes_tally(
  thread_id integer
) returns ontology_editor.vote_tally as $$
declare
  result_record ontology_editor.vote_tally;
begin
  select
  	sum(case when vote = 'upvote' then 1 else 0 end),  -- upvotes
    sum(case when vote = 'neutral' then 1 else 0 end), -- neutrals
  	sum(case when vote = 'downvote' then 1 else 0 end) -- downvotes
  into result_record
  from ontology_editor.vote;
  return result_record;
end
$$ language plpgsql stable set search_path from current;
comment on function ontology_editor.votes_tally(integer) is 'Gets the votes tally for a thread.';

grant execute on function ontology_editor.votes_tally(integer) to ontology_editor_anonymous, ontology_editor_person;
