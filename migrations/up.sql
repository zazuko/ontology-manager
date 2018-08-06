-- This file is mostly inspired from https://www.graphile.org/postgraphile/postgresql-schema-design/

begin;


create schema ontology_editor;
create schema ontology_editor_private;

create table ontology_editor.person (
  id               serial primary key,
  first_name       text not null check (char_length(first_name) < 80),
  last_name        text check (char_length(last_name) < 80),
  about            text,
  created_at       timestamp default now()
);

comment on table ontology_editor.person is 'A user of the ontology editor.';
comment on column ontology_editor.person.id is 'The primary unique identifier for the person.';
comment on column ontology_editor.person.first_name is 'The person’s first name.';
comment on column ontology_editor.person.last_name is 'The person’s last name.';
comment on column ontology_editor.person.about is 'A short description about the user, written by the user.';
comment on column ontology_editor.person.created_at is 'The time this person was created.';

create table ontology_editor.hat (
  id               serial primary key,
  title            text not null check (char_length(title) < 20),
  description      text
);

comment on table ontology_editor.hat is 'A hat users can use in threads and messages.';
comment on column ontology_editor.hat.id is 'The primary key for the hat.';
comment on column ontology_editor.hat.title is 'The name of the hat.';
comment on column ontology_editor.hat.description is 'The description for the hat.';

create table ontology_editor.hat_person (
  hat_id integer not null references ontology_editor.hat(id),
  person_id integer not null references ontology_editor.person(id),
  primary key (hat_id, person_id)
);

create type ontology_editor.thread_type as enum (
  'discussion',
  'proposal'
);

create table ontology_editor.thread (
  id               serial primary key,
  author_id        integer not null references ontology_editor.person(id),
  hat_id           integer default null references ontology_editor.hat(id),
  headline         text not null check (char_length(headline) < 280),
  iri              text not null check (char_length(iri) < 280),
  body             text,
  thread_type      ontology_editor.thread_type,
  created_at       timestamp default now()
);

comment on table ontology_editor.thread is 'A message thread.';
comment on column ontology_editor.thread.id is 'The primary key for the thread.';
comment on column ontology_editor.thread.author_id is 'The id of the author user.';
comment on column ontology_editor.thread.hat_id is 'The hat used to post this message, if any.';
comment on column ontology_editor.thread.headline is 'The title written by the user.';
comment on column ontology_editor.thread.iri is 'The IRI of the object our thread is about.';
comment on column ontology_editor.thread.body is 'The main body text of our thread.';
comment on column ontology_editor.thread.thread_type is 'The type of this thread.';
comment on column ontology_editor.thread.created_at is 'The time this thread was created.';

create table ontology_editor.message (
  id               serial primary key,
  author_id        integer not null references ontology_editor.person(id),
  thread_id        integer not null references ontology_editor.thread(id),
  hat_id           integer default null references ontology_editor.hat(id),
  body             text,
  created_at       timestamp default now()
);

comment on table ontology_editor.message is 'A message written by a user.';
comment on column ontology_editor.message.id is 'The primary key for the message.';
comment on column ontology_editor.message.author_id is 'The id of the author user.';
comment on column ontology_editor.message.thread_id is 'The thread this has been messaged in.';
comment on column ontology_editor.message.hat_id is 'The hat used to post this message, if any.';
comment on column ontology_editor.message.body is 'The main body text of our message.';
comment on column ontology_editor.message.created_at is 'The time this message was created.';

alter default privileges revoke execute on functions from public;

create function ontology_editor.person_full_name(person ontology_editor.person) returns text as $$
  select person.first_name || ' ' || person.last_name
$$ language sql stable;

comment on function ontology_editor.person_full_name(ontology_editor.person) is 'A person’s full name which is a concatenation of their first and last name.';

create function ontology_editor.message_summary(
  message ontology_editor.message,
  length int default 50,
  omission text default '…'
) returns text as $$
  select case
    when message.body is null then null
    else substr(message.body, 0, length) || omission
  end
$$ language sql stable;

comment on function ontology_editor.message_summary(ontology_editor.message, int, text) is 'A truncated version of the body for summaries.';

create function ontology_editor.person_latest_message(person ontology_editor.person) returns ontology_editor.message as $$
  select message.*
  from ontology_editor.message as message
  where message.author_id = person.id
  order by created_at desc
  limit 1
$$ language sql stable;

comment on function ontology_editor.person_latest_message(ontology_editor.person) is 'Gets the latest message written by the person.';

create function ontology_editor.search_messages(search text) returns setof ontology_editor.thread as $$
  select thread.*
  from ontology_editor.thread as thread
  join ontology_editor.message as message
    on message.thread_id = thread.id
  where thread.headline ilike ('%' || search || '%') or message.body ilike ('%' || search || '%')
$$ language sql stable;

comment on function ontology_editor.search_messages(text) is 'Returns threads containing a given search term.';

alter table ontology_editor.person add column updated_at timestamp default now();
alter table ontology_editor.message add column updated_at timestamp default now();

create function ontology_editor_private.set_updated_at() returns trigger as $$
begin
  new.updated_at := current_timestamp;
  return new;
end;
$$ language plpgsql;

create trigger person_updated_at before update
  on ontology_editor.person
  for each row
  execute procedure ontology_editor_private.set_updated_at();

create trigger message_updated_at before update
  on ontology_editor.message
  for each row
  execute procedure ontology_editor_private.set_updated_at();

create table ontology_editor_private.person_account (
  person_id        integer primary key references ontology_editor.person(id) on delete cascade,
  email            text not null unique check (email ~* '^.+@.+\..+$'),
  password_hash    text not null
);

comment on table ontology_editor_private.person_account is 'Private information about a person’s account.';
comment on column ontology_editor_private.person_account.person_id is 'The id of the person associated with this account.';
comment on column ontology_editor_private.person_account.email is 'The email address of the person.';
comment on column ontology_editor_private.person_account.password_hash is 'An opaque hash of the person’s password.';

create extension if not exists "pgcrypto";

create function ontology_editor.register_person(
  first_name text,
  last_name text,
  email text,
  password text
) returns ontology_editor.person as $$
declare
  person ontology_editor.person;
begin
  insert into ontology_editor.person (first_name, last_name) values
    (first_name, last_name)
    returning * into person;

  insert into ontology_editor_private.person_account (person_id, email, password_hash) values
    (person.id, email, crypt(password, gen_salt('bf')));

  return person;
end;
$$ language plpgsql strict security definer;

comment on function ontology_editor.register_person(text, text, text, text) is 'Registers a single user and creates an account in our ontology editor.';

create role ontology_editor_postgraphile login password 'password_placeholder';

create role ontology_editor_anonymous;
grant ontology_editor_anonymous to ontology_editor_postgraphile;

create role ontology_editor_person;
grant ontology_editor_person to ontology_editor_postgraphile;

create type ontology_editor.jwt_token as (
  role text,
  person_id integer
);

create function ontology_editor.authenticate(
  email text,
  password text
) returns ontology_editor.jwt_token as $$
declare
  account ontology_editor_private.person_account;
begin
  select a.* into account
  from ontology_editor_private.person_account as a
  where a.email = $1;

  if account.password_hash = crypt(password, account.password_hash) then
    return ('ontology_editor_person', account.person_id)::ontology_editor.jwt_token;
  else
    return null;
  end if;
end;
$$ language plpgsql strict security definer;

comment on function ontology_editor.authenticate(text, text) is 'Creates a JWT token that will securely identify a person and give them certain permissions.';

create function ontology_editor.current_person() returns ontology_editor.person as $$
  select *
  from ontology_editor.person
  where id = current_setting('jwt.claims.person_id')::integer
$$ language sql stable;

comment on function ontology_editor.current_person() is 'Gets the person who was identified by our JWT.';

grant usage on schema ontology_editor to ontology_editor_anonymous, ontology_editor_person;

grant select on table ontology_editor.person to ontology_editor_anonymous, ontology_editor_person;
grant update, delete on table ontology_editor.person to ontology_editor_person;

grant select on table ontology_editor.message to ontology_editor_anonymous, ontology_editor_person;
grant insert, update, delete on table ontology_editor.message to ontology_editor_person;
grant usage on sequence ontology_editor.message_id_seq to ontology_editor_person;

grant execute on function ontology_editor.person_full_name(ontology_editor.person) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.message_summary(ontology_editor.message, integer, text) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.person_latest_message(ontology_editor.person) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.search_messages(text) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.authenticate(text, text) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.current_person() to ontology_editor_anonymous, ontology_editor_person;

grant execute on function ontology_editor.register_person(text, text, text, text) to ontology_editor_anonymous;

alter table ontology_editor.person enable row level security;
alter table ontology_editor.message enable row level security;
alter table ontology_editor.thread enable row level security;
alter table ontology_editor.hat enable row level security;
alter table ontology_editor.hat_person enable row level security;

-- RUD
-- person
create policy select_person on ontology_editor.person for select
  using (true);
create policy update_person on ontology_editor.person for update to ontology_editor_person
  using (id = current_setting('jwt.claims.person_id')::integer);
create policy delete_person on ontology_editor.person for delete to ontology_editor_person
  using (id = current_setting('jwt.claims.person_id')::integer);

-- CRUD
-- message
create policy insert_message on ontology_editor.message for insert to ontology_editor_person
  with check (author_id = current_setting('jwt.claims.person_id')::integer);
create policy select_message on ontology_editor.message for select
  using (true);
create policy update_message on ontology_editor.message for update to ontology_editor_person
  using (author_id = current_setting('jwt.claims.person_id')::integer);
create policy delete_message on ontology_editor.message for delete to ontology_editor_person
  using (author_id = current_setting('jwt.claims.person_id')::integer);

-- CRUD
-- thread
create policy insert_message on ontology_editor.thread for insert to ontology_editor_person
  with check (author_id = current_setting('jwt.claims.person_id')::integer);
create policy select_thread on ontology_editor.thread for select
  using (true);
create policy update_thread on ontology_editor.thread for update to ontology_editor_person
  using (author_id = current_setting('jwt.claims.person_id')::integer);
create policy delete_thread on ontology_editor.thread for delete to ontology_editor_person
  using (author_id = current_setting('jwt.claims.person_id')::integer);

-- R
-- hat
create policy select_hat on ontology_editor.hat for select
  using (true);

-- CRD hat_person
create policy insert_hat_person on ontology_editor.hat_person for insert to ontology_editor_person
  with check (person_id = current_setting('jwt.claims.person_id')::integer);
create policy select_hat_person on ontology_editor.hat_person for select
  using (true);
create policy delete_hat_person on ontology_editor.hat_person for delete to ontology_editor_person
  using (person_id = current_setting('jwt.claims.person_id')::integer);

commit;

-- https://github.com/graphile/postgraphile/issues/91#issuecomment-308664225

-- BEGIN;
--
-- CREATE TEMPORARY TABLE plurals("from" text, "to" text);
-- -- Insert to the `plurals` table as appropriate to handle any irregular pluralisations in the generated function name.
-- -- INSERT INTO plurals VALUES ...;
--
-- CREATE FUNCTION ontology_editor.make_many_to_many(
--     many_schema text, many_table text, many_column_1 text, many_column_2 text,
--     schema_1 text, table_1 text, pk_1 text,
--     schema_2 text, table_2 text, pk_2 text)
-- RETURNS void AS $$
-- DECLARE
--     plural_2 text;
-- BEGIN
--     SELECT "to" FROM plurals WHERE "from" = table_2 INTO plural_2;
--     IF plural_2 IS NULL THEN
--         plural_2 := table_2 || 's';
--     END IF;
--
--     EXECUTE format('CREATE OR REPLACE FUNCTION %I.%I(a %I.%I) ', schema_1, format('%s_%s', table_1, plural_2), schema_1, table_1)
--          || format('RETURNS setof %I.%I AS $f$ ', schema_2, table_2)
--          || format('SELECT %I.%I.* FROM %I.%I ', schema_2, table_2, schema_2, table_2)
--          || format('INNER JOIN %I.%I ON %I.%I.%I = %I.%I.%I ', many_schema, many_table, schema_2, table_2, pk_2, many_schema, many_table, many_column_2)
--          || format('WHERE %I.%I.%I = a.%I; ', many_schema, many_table, many_column_1, pk_1)
--          || '$f$ LANGUAGE SQL STABLE';
-- END $$ LANGUAGE plpgsql;
--
-- CREATE FUNCTION ontology_editor.add_many_to_many(schema_name text, table_name text)
-- RETURNS void AS $$
-- DECLARE
--     fk1 RECORD;
--     fk2 RECORD;
--     count integer;
-- BEGIN
--     CREATE TEMPORARY TABLE fks AS
--         SELECT kcu.column_name,
--             ccu.table_schema foreign_table_schema,
--             ccu.table_name foreign_table_name,
--             ccu.column_name foreign_column_name
--         FROM information_schema.table_constraints tc
--         INNER JOIN information_schema.key_column_usage kcu
--             ON tc.constraint_name = kcu.constraint_name
--             AND tc.table_schema = kcu.table_schema
--         INNER JOIN information_schema.key_column_usage kcu2
--             ON kcu2.column_name = kcu.column_name
--             AND kcu2.table_name = kcu.table_name
--             AND kcu2.table_schema = kcu.table_schema
--         INNER JOIN information_schema.table_constraints tc2
--             ON tc2.constraint_name = kcu2.constraint_name
--             AND tc2.table_schema = kcu2.table_schema
--         INNER JOIN information_schema.constraint_column_usage ccu
--             ON ccu.constraint_name = tc2.constraint_name
--             AND ccu.table_schema = tc2.table_schema
--         WHERE tc.constraint_type = 'PRIMARY KEY'
--             AND tc.table_schema = add_many_to_many.schema_name
--             AND tc.table_name = add_many_to_many.table_name
--             AND tc2.constraint_type = 'FOREIGN KEY';
--
--     SELECT COUNT(*) FROM fks INTO count;
--
--     IF count = 2 THEN
--         SELECT * FROM fks LIMIT 1 INTO fk1;
--         SELECT * FROM fks OFFSET 1 LIMIT 1 INTO fk2;
--
--         EXECUTE ontology_editor.make_many_to_many(
--             schema_name, table_name,
--             fk1.column_name, fk2.column_name,
--             fk1.foreign_table_schema, fk1.foreign_table_name, fk1.foreign_column_name,
--             fk2.foreign_table_schema, fk2.foreign_table_name, fk2.foreign_column_name);
--         EXECUTE ontology_editor.make_many_to_many(
--             schema_name, table_name,
--             fk2.column_name, fk1.column_name,
--             fk2.foreign_table_schema, fk2.foreign_table_name, fk2.foreign_column_name,
--             fk1.foreign_table_schema, fk1.foreign_table_name, fk1.foreign_column_name);
--     END IF;
--     DROP TABLE fks;
-- END $$ LANGUAGE plpgsql;
--
-- SELECT ontology_editor.add_many_to_many(table_schema, table_name) FROM information_schema.tables WHERE table_schema = 'ontology_editor';
--
-- DROP FUNCTION ontology_editor.make_many_to_many(text, text, text, text, text, text, text, text, text, text);
-- DROP FUNCTION ontology_editor.add_many_to_many(text, text);
-- DROP TABLE plurals;
-- COMMIT;
