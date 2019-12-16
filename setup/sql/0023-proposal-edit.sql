-- new proposals should have the new status 'initial_draft' by default
alter table only editor_schema.thread alter column status set default 'initial_draft';

-- function used to take an open proposal back to a draft
create or replace function editor_schema.edit_proposal(
  thread_id int
) returns editor_schema.thread as $$
declare thread editor_schema.thread;
begin
  update editor_schema.thread
    set
      status = 'open'::editor_schema.status,
      is_draft = true
    where id = thread_id and author_id = current_setting('jwt.claims.person_id')::integer
    returning * into thread;
  return thread;
end;
$$ language plpgsql strict security definer;
comment on function editor_schema.edit_proposal(int) is E'Edit a proposal, restricted to proposal author.';
grant execute on function editor_schema.edit_proposal(int) to $POSTGRESQL_ROLE_PERSON;

-- change submit log proposal trigger
drop trigger proposal_submit_logger on editor_schema.thread;
create trigger proposal_submit_logger
  after update on editor_schema.thread
  for each row
    when (
      NEW.thread_type = 'proposal'::editor_schema.thread_type and
      NEW.status = 'open'::editor_schema.status and
      OLD.status = 'initial_draft'::editor_schema.status and
      OLD.external_id is null and
      OLD.is_draft = true and
      NEW.is_draft = false
    )
  execute procedure editor_private_schema.tg_log__proposal_submit();
-- new trigger to log proposal edits
create function editor_private_schema.tg_log__proposal_edit()
returns trigger as $$
begin
  insert into editor_schema.log
    (author_id, thread_id, action_type, event_date)
  values
    (NEW.author_id, NEW.id, 'proposal_edit', NEW.updated_at);
  return NEW;
end;
$$ language plpgsql;
create trigger proposal_edit_logger
  after update on editor_schema.thread
  for each row
    when (
      NEW.thread_type = 'proposal'::editor_schema.thread_type and
      NEW.status = 'open'::editor_schema.status and
      OLD.status = 'open'::editor_schema.status and
      OLD.external_id is null and
      OLD.is_draft = true and
      NEW.is_draft = false
    )
  execute procedure editor_private_schema.tg_log__proposal_edit();
