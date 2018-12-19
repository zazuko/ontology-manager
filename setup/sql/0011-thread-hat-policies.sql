-- fix previous migration: admins can update any message
drop policy if exists update_message on editor_schema.message;
create policy update_message on editor_schema.message for update to $POSTGRESQL_ROLE_PERSON
  using ((
      author_id = current_setting('jwt.claims.person_id')::integer
    and (
      select
        case
          when
              hat_id is null
            or
              hat_id in (select hp.hat_id from editor_schema.hat_person as hp where person_id = author_id)
            then true
          else false
        end
    ))
    or editor_schema.current_person_is_admin()
  );

drop policy if exists update_message on editor_schema.message;
create policy update_message on editor_schema.message for update to $POSTGRESQL_ROLE_PERSON
  using ((
      author_id = current_setting('jwt.claims.person_id')::integer
    and (
      select
        case
          when
              hat_id is null
            or
              hat_id in (select hp.hat_id from editor_schema.hat_person as hp where person_id = author_id)
            then true
          else false
        end
    ))
    or editor_schema.current_person_is_admin()
  );

-- ensure through policies that no one uses a hat they don't own
drop policy if exists insert_thread on editor_schema.thread;
create policy insert_thread on editor_schema.thread for insert to $POSTGRESQL_ROLE_PERSON
  with check ((
      author_id = current_setting('jwt.claims.person_id')::integer
    and (
      select
        case
          when
              hat_id is null
            or
              hat_id in (select hp.hat_id from editor_schema.hat_person as hp where person_id = author_id)
            then true
          else false
        end
    ))
    or editor_schema.current_person_is_admin()
  );

drop policy if exists update_thread on editor_schema.thread;
create policy update_thread on editor_schema.thread for update to $POSTGRESQL_ROLE_PERSON
  using ((
      author_id = current_setting('jwt.claims.person_id')::integer
    and (
      select
        case
          when
              hat_id is null
            or
              hat_id in (select hp.hat_id from editor_schema.hat_person as hp where person_id = author_id)
            then true
          else false
        end
    ))
    or editor_schema.current_person_is_admin()
  );
