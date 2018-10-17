create or replace function ontology_editor.change_person_status(
  user_id int,
  admin_flag boolean
) returns ontology_editor.person as $$
declare person ontology_editor.person;
begin
  update ontology_editor.person
    set is_admin = admin_flag
    where id = user_id and ontology_editor.current_person_is_admin()
    returning * into person;
  return person;
end;
$$ language plpgsql strict security definer;
comment on function ontology_editor.change_person_status(int, boolean) is E'Update person admin flag, only allowed to admin';

grant execute on function ontology_editor.change_person_status(int, boolean) to ontology_editor_person;
