create or replace function ontology_editor.change_thread_status(
  thread_id int,
  new_status ontology_editor.status
) returns ontology_editor.thread as $$
declare thread ontology_editor.thread;
begin
  update ontology_editor.thread
    set status = new_status
    where id = thread_id and (
        -- thread author can only 'hide' (close) their threads
        (new_status = 'hidden'::ontology_editor.status and author_id = current_setting('jwt.claims.person_id')::integer)
      or
        -- admins can set any status
        ontology_editor.current_person_is_admin()
      )
    returning * into thread;
  return thread;
end;
$$ language plpgsql strict security definer;
comment on function ontology_editor.change_thread_status(int, ontology_editor.status) is E'Update thread status, only allowed to admin';

grant execute on function ontology_editor.change_thread_status(int, ontology_editor.status) to ontology_editor_person;
