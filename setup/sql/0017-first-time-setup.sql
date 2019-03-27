create or replace function editor_schema.current_person_is_superadmin() returns bool as $$
  -- Everyone is considered superadmin while DB contains no users, this lets first-time users
  -- configure their instance
  select
    exists(select 1 from editor_schema.person where id = editor_schema.current_person_id() and is_superadmin = true)
  or
    not exists(select 1 from editor_schema.person);
$$ language sql stable set search_path from current;
comment on function editor_schema.current_person_is_superadmin() is E'@omit\nHandy method to determine if the current user is a superadmin, for use in RLS policies, etc; in GraphQL should use `currentUser{isSuperadmin}` instead.';

--------

create or replace function editor_schema.current_private_config()
returns editor_schema.config as $$
select *
from editor_schema.config
where editor_schema.current_person_is_superadmin()
order by id desc
limit 1;
$$ language sql stable strict security definer;
comment on function editor_schema.current_private_config() is 'Gets the all configurable settings.';
grant execute on function editor_schema.current_private_config() to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;;

create or replace function editor_schema.private_config_version(version integer)
returns editor_schema.config as $$
select *
from editor_schema.config
where editor_schema.config.id = version and editor_schema.current_person_is_superadmin()
order by id desc
limit 1;
$$ language sql stable strict security definer;
comment on function editor_schema.private_config_version(integer) is 'Gets all configurable settings at a specified version.';
grant execute on function editor_schema.private_config_version(integer) to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;;

create or replace function editor_schema.config_list()
returns setof editor_schema.config as $$
select *
from editor_schema.config
where editor_schema.current_person_is_superadmin()
order by id asc;
$$ language sql stable strict security definer;
comment on function editor_schema.config_list is 'Gets the all configurable settings.';
grant execute on function editor_schema.config_list to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;;

create or replace function editor_schema.save_config(forge jsonb, editor jsonb, ontology jsonb, reason text)
returns editor_schema.config as $$
declare version editor_schema.config;
begin
  insert into editor_schema.config
    (forge, editor, ontology, reason)
  values
    (forge, editor, ontology, reason)
  returning * into version;
  return version;
end;
$$ language plpgsql strict security definer;
comment on function editor_schema.save_config(jsonb, jsonb, jsonb, text) is E'Saves a new version of the config.';
grant execute on function editor_schema.save_config(jsonb, jsonb, jsonb, text) to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;
grant insert on table editor_schema.config to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;
drop policy insert_config on editor_schema.config;
create policy insert_config on editor_schema.config for insert to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON
  with check (editor_schema.current_person_is_superadmin());
