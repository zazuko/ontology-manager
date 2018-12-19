create or replace function editor_schema.change_person_status(
  user_id int,
  admin_flag boolean
) returns editor_schema.person as $$
declare person editor_schema.person;
begin
  update editor_schema.person
    set is_admin = admin_flag
    where id = user_id and editor_schema.current_person_is_admin()
    returning * into person;
  return person;
end;
$$ language plpgsql strict security definer;
comment on function editor_schema.change_person_status(int, boolean) is E'Update person admin flag, only allowed to admin';

grant execute on function editor_schema.change_person_status(int, boolean) to $POSTGRESQL_ROLE_PERSON;
