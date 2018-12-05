-- this comment was missing
comment on column ontology_editor.thread.proposal_object is
  'The proposal object serialized to a flat JSON object that can be rehydrated to load into a proposal form';

-- some fields shouldn't be updatable by default
comment on column ontology_editor.thread.status is
  E'@omit update\nThe status of this thread.';
comment on column ontology_editor.thread.is_draft is
  E'@omit update\nWhether the proposal is still a draft or got submitted.';
comment on column ontology_editor.thread.external_id is
  E'@omit update\nThe id of an external object (e.g. a github PR), if any.';
comment on column ontology_editor.thread.branch_name is
  E'@omit update\nThe name of the branch that got created on the forge for this proposal.';
comment on column ontology_editor.thread.thread_type is
  E'@omit update\nThe type of this thread.';


-- since users cannot mess with the not-updatable-by-default columns specified above,
-- we need a way of letting them submit a PR
create or replace function ontology_editor.finalize_proposal(
  thread_id int,
  new_external_id int,
  new_branch_name text
) returns ontology_editor.thread as $$
declare thread ontology_editor.thread;
begin
  update ontology_editor.thread
    set
      external_id = new_external_id,
      branch_name = new_branch_name,
      status = 'open'::ontology_editor.status,
      is_draft = false
    where id = thread_id and author_id = current_setting('jwt.claims.person_id')::integer
    returning * into thread;
  return thread;
end;
$$ language plpgsql strict security definer;
comment on function ontology_editor.finalize_proposal(int, int, text) is E'Submit proposal, restricted to proposal author.';
grant execute on function ontology_editor.finalize_proposal(int, int, text) to ontology_editor_person;

-- ensure through policies that no one uses a hat they don't own
drop policy if exists insert_message on ontology_editor.message;
create policy insert_message on ontology_editor.message for insert to ontology_editor_person
  with check (
      author_id = current_setting('jwt.claims.person_id')::integer
    and (
      select
        case
          when hat_id is null or hat_id in (select hp.hat_id from ontology_editor.hat_person as hp where person_id = author_id) then true
          else false
        end
    )
  );
drop policy if exists update_message on ontology_editor.message;
create policy update_message on ontology_editor.message for update to ontology_editor_person
  using (
      author_id = current_setting('jwt.claims.person_id')::integer
    and (
      select
        case
          when hat_id is null or hat_id in (select hp.hat_id from ontology_editor.hat_person as hp where person_id = author_id) then true
          else false
        end
    )
  );
