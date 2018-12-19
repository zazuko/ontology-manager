create or replace function editor_schema.change_thread_status(
  thread_id int,
  new_status editor_schema.status
) returns editor_schema.thread as $$
declare thread editor_schema.thread;
begin
  update editor_schema.thread
    set status = new_status
    where id = thread_id and (
        -- thread author can only 'hide' (close) their threads
        (new_status = 'hidden'::editor_schema.status and author_id = current_setting('jwt.claims.person_id')::integer)
      or
        -- admins can set any status
        editor_schema.current_person_is_admin()
      )
    returning * into thread;
  return thread;
end;
$$ language plpgsql strict security definer;
comment on function editor_schema.change_thread_status(int, editor_schema.status) is E'Update thread status, only allowed to admin';

grant execute on function editor_schema.change_thread_status(int, editor_schema.status) to $POSTGRESQL_ROLE_PERSON;
