-- fix previous migration: admins can update any message
drop policy if exists update_message on ontology_editor.message;
create policy update_message on ontology_editor.message for update to ontology_editor_person
  using ((
      author_id = current_setting('jwt.claims.person_id')::integer
    and (
      select
        case
          when
              hat_id is null
            or
              hat_id in (select hp.hat_id from ontology_editor.hat_person as hp where person_id = author_id)
            then true
          else false
        end
    ))
    or ontology_editor.current_person_is_admin()
  );

drop policy if exists update_message on ontology_editor.message;
create policy update_message on ontology_editor.message for update to ontology_editor_person
  using ((
      author_id = current_setting('jwt.claims.person_id')::integer
    and (
      select
        case
          when
              hat_id is null
            or
              hat_id in (select hp.hat_id from ontology_editor.hat_person as hp where person_id = author_id)
            then true
          else false
        end
    ))
    or ontology_editor.current_person_is_admin()
  );

-- ensure through policies that no one uses a hat they don't own
drop policy if exists insert_thread on ontology_editor.thread;
create policy insert_thread on ontology_editor.thread for insert to ontology_editor_person
  with check ((
      author_id = current_setting('jwt.claims.person_id')::integer
    and (
      select
        case
          when
              hat_id is null
            or
              hat_id in (select hp.hat_id from ontology_editor.hat_person as hp where person_id = author_id)
            then true
          else false
        end
    ))
    or ontology_editor.current_person_is_admin()
  );

drop policy if exists update_thread on ontology_editor.thread;
create policy update_thread on ontology_editor.thread for update to ontology_editor_person
  using ((
      author_id = current_setting('jwt.claims.person_id')::integer
    and (
      select
        case
          when
              hat_id is null
            or
              hat_id in (select hp.hat_id from ontology_editor.hat_person as hp where person_id = author_id)
            then true
          else false
        end
    ))
    or ontology_editor.current_person_is_admin()
  );
