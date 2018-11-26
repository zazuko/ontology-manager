drop function ontology_editor.users_vote_on_thread;

-- gets the current user's vote on a thread
create function ontology_editor.users_vote_on_thread(
  thread_id integer
) returns ontology_editor.vote_type as $$
#variable_conflict use_variable
declare
  vote_result ontology_editor.vote_type;
begin
  select vote
  into vote_result
  from ontology_editor.vote
  where ontology_editor.vote.person_id = ontology_editor.current_person_id()
  and ontology_editor.vote.thread_id = thread_id;
  return vote_result;
end
$$ language plpgsql stable set search_path from current;
comment on function ontology_editor.users_vote_on_thread(integer) is 'Gets the current users vote on a thread.';

grant execute on function ontology_editor.users_vote_on_thread(integer) to ontology_editor_anonymous, ontology_editor_person;

drop function ontology_editor.votes_tally;

-- gets vote tally for a thread
create function ontology_editor.votes_tally(
  thread_id integer
) returns ontology_editor.vote_tally as $$
#variable_conflict use_variable
declare
  result_record ontology_editor.vote_tally;
begin
  select
  	sum(case when vote = 'upvote' then 1 else 0 end),  -- upvotes
    sum(case when vote = 'neutral' then 1 else 0 end), -- neutrals
  	sum(case when vote = 'downvote' then 1 else 0 end) -- downvotes
  into result_record
  from ontology_editor.vote
  where ontology_editor.vote.thread_id = thread_id;
  return result_record;
end
$$ language plpgsql stable set search_path from current;
comment on function ontology_editor.votes_tally(integer) is 'Gets the votes tally for a thread.';

grant execute on function ontology_editor.votes_tally(integer) to ontology_editor_anonymous, ontology_editor_person;
