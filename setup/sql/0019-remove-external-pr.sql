drop trigger proposal_submit_logger on editor_schema.thread;

alter table editor_schema.thread alter column external_id type text;

create trigger proposal_submit_logger
  after update on editor_schema.thread
  for each row
    when (
      NEW.thread_type = 'proposal'::editor_schema.thread_type and
      NEW.status = 'open'::editor_schema.status and
      OLD.external_id is null and
      OLD.is_draft = true and
      NEW.is_draft = false
    )
  execute procedure editor_private_schema.tg_log__proposal_submit();

drop function editor_schema.finalize_proposal;
create or replace function editor_schema.finalize_proposal(
  thread_id int
) returns editor_schema.thread as $$
declare thread editor_schema.thread;
begin
  update editor_schema.thread
    set
      status = 'open'::editor_schema.status,
      is_draft = false
    where id = thread_id and author_id = current_setting('jwt.claims.person_id')::integer
    returning * into thread;
  return thread;
end;
$$ language plpgsql strict security definer;
comment on function editor_schema.finalize_proposal(int) is E'Submit proposal, restricted to proposal author.';
grant execute on function editor_schema.finalize_proposal(int) to $POSTGRESQL_ROLE_PERSON;

create or replace function editor_schema.update_external_id(
  thread_id int,
  reference text
) returns editor_schema.thread as $$
declare thread editor_schema.thread;
begin
  update editor_schema.thread
    set
      external_id = reference
    where id = thread_id and editor_schema.current_person_is_admin()
    returning * into thread;
  return thread;
end;
$$ language plpgsql strict security definer;
comment on function editor_schema.update_external_id(int, text) is E'Update external ID, restricted to admin.';
grant execute on function editor_schema.update_external_id(int, text) to $POSTGRESQL_ROLE_PERSON;
