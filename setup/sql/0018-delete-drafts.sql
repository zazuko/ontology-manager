-- not only admins can discard a draft, a draft author can also delete their own draft
drop policy if exists delete_thread on editor_schema.thread;
create policy delete_thread on editor_schema.thread for delete to $POSTGRESQL_ROLE_PERSON
  using (
    editor_schema.current_person_is_admin()
      or
    (author_id = current_setting('jwt.claims.person_id')::integer and is_draft = true)
  );
