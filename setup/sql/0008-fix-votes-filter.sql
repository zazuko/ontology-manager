drop function editor_schema.users_vote_on_thread;

-- gets the current user's vote on a thread
create function editor_schema.users_vote_on_thread(
  thread_id integer
) returns editor_schema.vote_type as $$
#variable_conflict use_variable
declare
  vote_result editor_schema.vote_type;
begin
  select vote
  into vote_result
  from editor_schema.vote
  where editor_schema.vote.person_id = editor_schema.current_person_id()
  and editor_schema.vote.thread_id = thread_id;
  return vote_result;
end
$$ language plpgsql stable set search_path from current;
comment on function editor_schema.users_vote_on_thread(integer) is 'Gets the current users vote on a thread.';

grant execute on function editor_schema.users_vote_on_thread(integer) to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;

drop function editor_schema.votes_tally;

-- gets vote tally for a thread
create function editor_schema.votes_tally(
  thread_id integer
) returns editor_schema.vote_tally as $$
#variable_conflict use_variable
declare
  result_record editor_schema.vote_tally;
begin
  select
  	sum(case when vote = 'upvote' then 1 else 0 end),  -- upvotes
    sum(case when vote = 'neutral' then 1 else 0 end), -- neutrals
  	sum(case when vote = 'downvote' then 1 else 0 end) -- downvotes
  into result_record
  from editor_schema.vote
  where editor_schema.vote.thread_id = thread_id;
  return result_record;
end
$$ language plpgsql stable set search_path from current;
comment on function editor_schema.votes_tally(integer) is 'Gets the votes tally for a thread.';

grant execute on function editor_schema.votes_tally(integer) to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;
