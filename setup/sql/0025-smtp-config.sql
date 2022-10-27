alter table editor_schema.config add column smtp jsonb;

comment on column editor_schema.config.smtp is 'SMTP config';


------------------------------------------------
create or replace function editor_schema.save_config(forge jsonb, editor jsonb, ontology jsonb, smtp jsonb, reason text)
returns editor_schema.config as $$
declare version editor_schema.config;
begin
  insert into editor_schema.config
    (forge, editor, ontology, smtp, reason)
  values
    (forge, editor, ontology, smtp, reason)
  returning * into version;
  return version;
end;
$$ language plpgsql strict security definer;
comment on function editor_schema.save_config(jsonb, jsonb, jsonb, jsonb, text) is E'Saves a new version of the config.';
grant execute on function editor_schema.save_config(jsonb, jsonb, jsonb, jsonb, text) to $POSTGRESQL_ROLE_PERSON;
grant insert on table editor_schema.config to $POSTGRESQL_ROLE_PERSON;
drop policy insert_config on editor_schema.config;
create policy insert_config on editor_schema.config for insert to $POSTGRESQL_ROLE_PERSON
  with check (editor_schema.current_person_is_superadmin());
