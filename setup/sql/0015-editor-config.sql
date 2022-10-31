alter table editor_schema.person add column is_superadmin boolean default false;
comment on column editor_schema.person.is_superadmin is 'If true, the user can change the editor config.';
-- We're using exists here because it guarantees true/false rather than true/false/null
create or replace function editor_schema.current_person_is_superadmin() returns bool as $$
  select exists(
    select 1 from editor_schema.person where id = editor_schema.current_person_id() and is_superadmin = true
  );
$$ language sql stable set search_path from current;
comment on function editor_schema.current_person_is_superadmin() is E'@omit\nHandy method to determine if the current user is a superadmin, for use in RLS policies, etc; in GraphQL should use `currentUser{isSuperadmin}` instead.';

-- trigger to get the first ever user to sign-up to be admin
-- not sure if that's good since you cannot sign up without the proper config first…
create or replace function editor_private_schema.tg_persons__make_first_person_admin() returns trigger as $$
begin
  if not exists(select 1 from editor_schema.person) then
    NEW.is_superadmin = true;
    NEW.is_admin = true;
  end if;
  return NEW;
end;
$$ language plpgsql volatile set search_path from current;

-- migrate first admin to superadmin
update editor_schema.person set is_superadmin = true where id in (select id from editor_schema.person where is_admin = true order by id asc limit 1);

------------------------------------------------

create table editor_schema.config (
  id          serial primary key,
  author_id   integer default editor_schema.current_person_id() references editor_schema.person(id),
  forge       jsonb,
  editor      jsonb,
  ontology    jsonb,
  reason      text not null,
  created_at  timestamp default now()
);

comment on table editor_schema.config is '@omit all\nEditor configuration';
comment on column editor_schema.config.id is 'The config version.';
comment on column editor_schema.config.author_id is 'The id of the author user.';
comment on column editor_schema.config.forge is 'Oauth and forge setup, commit access etc.';
comment on column editor_schema.config.editor is 'Title, description, texts.';
comment on column editor_schema.config.ontology is 'Ontology configuration.';

-- R
-- drop policy select_config on editor_schema.config for select
--   using (true);

create or replace function editor_schema.current_public_config(out version integer, out editor jsonb, out ontology jsonb) as $$
select id, editor, ontology
from editor_schema.config
order by id desc
limit 1;
$$ language sql stable strict security definer;
comment on function editor_schema.current_public_config is 'Gets the public editor config, i.e. parts of the config that are not secret.';
grant execute on function editor_schema.current_public_config to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;

create or replace function editor_schema.current_private_config()
returns editor_schema.config as $$
select *
from editor_schema.config
where editor_schema.current_person_is_superadmin()
order by id desc
limit 1;
$$ language sql stable strict security definer;
comment on function editor_schema.current_private_config() is 'Gets the all configurable settings.';
grant execute on function editor_schema.current_private_config() to $POSTGRESQL_ROLE_PERSON;

create or replace function editor_schema.private_config_version(version integer)
returns editor_schema.config as $$
select *
from editor_schema.config
where editor_schema.config.id = version and editor_schema.current_person_is_superadmin()
order by id desc
limit 1;
$$ language sql stable strict security definer;
comment on function editor_schema.private_config_version(integer) is 'Gets all configurable settings at a specified version.';
grant execute on function editor_schema.private_config_version(integer) to $POSTGRESQL_ROLE_PERSON;

create or replace function editor_schema.config_list()
returns setof editor_schema.config as $$
select *
from editor_schema.config
where editor_schema.current_person_is_superadmin()
order by id asc;
$$ language sql stable strict security definer;
comment on function editor_schema.config_list is 'Gets the all configurable settings.';
grant execute on function editor_schema.config_list to $POSTGRESQL_ROLE_PERSON;

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
grant execute on function editor_schema.save_config(jsonb, jsonb, jsonb, text) to $POSTGRESQL_ROLE_PERSON;
grant insert on table editor_schema.config to $POSTGRESQL_ROLE_PERSON;
create policy insert_config on editor_schema.config for insert to $POSTGRESQL_ROLE_PERSON
  with check (editor_schema.current_person_is_superadmin());

------------------------------------------------

drop function editor_schema.change_person_status;

create or replace function editor_schema.make_admin(user_id int, admin_flag boolean)
returns editor_schema.person as $$
declare person editor_schema.person;
begin
  update editor_schema.person
    set is_admin = admin_flag
    where id = user_id and not is_superadmin and editor_schema.current_person_is_admin()
    returning * into person;
  return person;
end;
$$ language plpgsql strict security definer;
comment on function editor_schema.make_admin(int, boolean) is E'Update person admin flag, only allowed to admin';

grant execute on function editor_schema.make_admin(int, boolean) to $POSTGRESQL_ROLE_PERSON;

create or replace function editor_schema.make_superadmin(
  user_id int,
  superadmin_flag boolean
) returns editor_schema.person as $$
declare person editor_schema.person;
begin
  update editor_schema.person
    set is_superadmin = superadmin_flag, is_admin = true
    where id = user_id and editor_schema.current_person_is_superadmin()
    returning * into person;
  return person;
end;
$$ language plpgsql strict security definer;
comment on function editor_schema.make_superadmin(int, boolean) is E'Update person superadmin flag, only allowed to superadmin';

grant execute on function editor_schema.make_superadmin(int, boolean) to $POSTGRESQL_ROLE_PERSON;
