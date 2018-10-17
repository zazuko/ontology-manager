create type ontology_editor.status as enum (
  'open',     -- default
  'resolved', -- issue closed, proposal merged or rejected
  'hidden'    -- deleted or hidden by an admin
);

alter table ontology_editor.thread add column status ontology_editor.status default 'open';
comment on column ontology_editor.thread.status is 'The status of this thread.';

create or replace function ontology_editor.change_thread_status(
  thread_id int,
  new_status ontology_editor.status
) returns ontology_editor.thread as $$
declare thread ontology_editor.thread;
begin
  update ontology_editor.thread
    set status = new_status
    where id = thread_id and ontology_editor.current_person_is_admin()
    returning * into thread;
  return thread;
end;
$$ language plpgsql strict security definer;
comment on function ontology_editor.change_thread_status(int, ontology_editor.status) is E'Update thread status, only allowed to admin';

grant execute on function ontology_editor.change_thread_status(int, ontology_editor.status) to ontology_editor_person;
