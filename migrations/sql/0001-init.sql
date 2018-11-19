-- This file is mostly inspired from https://www.graphile.org/postgraphile/postgresql-schema-design/

create schema ontology_editor;
create schema ontology_editor_private;

create table ontology_editor.person (
  id               serial primary key,
  is_admin         boolean not null default false,
  name             text not null check (char_length(name) < 80),
  username         text not null check (char_length(name) < 120),
  avatar           text,
  about            text,
  created_at       timestamp default now()
);

comment on table ontology_editor.person is '@omit all\nA user of the ontology editor.';
comment on column ontology_editor.person.id is 'The primary unique identifier for the person.';
comment on column ontology_editor.person.is_admin is 'If true, the user has elevated privileges.';
comment on column ontology_editor.person.name is 'The person’s first name.';
comment on column ontology_editor.person.name is 'The person’s forge username.';
comment on column ontology_editor.person.avatar is 'The person’s avatar URL.';
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

create function ontology_editor.current_person() returns ontology_editor.person as $$
  select *
  from ontology_editor.person
  where id = current_setting('jwt.claims.person_id')::integer
$$ language sql stable;
comment on function ontology_editor.current_person() is 'Gets the person who was identified by our JWT.';

create function ontology_editor.current_person_id() returns int as $$
  select nullif(current_setting('jwt.claims.person_id', true), '')::int;
$$ language sql stable set search_path from current;
comment on function ontology_editor.current_person_id() is 'Gets the person who was identified by our JWT.';

-- We're using exists here because it guarantees true/false rather than true/false/null
create function ontology_editor.current_person_is_admin() returns bool as $$
  select exists(
    select 1 from ontology_editor.person where id = ontology_editor.current_person_id() and is_admin = true
  );
$$ language sql stable set search_path from current;
comment on function ontology_editor.current_person_is_admin() is E'@omit\nHandy method to determine if the current user is an admin, for use in RLS policies, etc; in GraphQL should use `currentUser{isAdmin}` instead.';

create table ontology_editor.thread (
  id               serial primary key,
  author_id        integer not null default ontology_editor.current_person_id() references ontology_editor.person(id),
  hat_id           integer default null references ontology_editor.hat(id),
  external_id      integer default null,
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
comment on column ontology_editor.thread.external_id is 'The id of an external object (e.g. a github PR), if any.';
comment on column ontology_editor.thread.headline is 'The title written by the user.';
comment on column ontology_editor.thread.iri is 'The IRI of the object our thread is about.';
comment on column ontology_editor.thread.body is 'The main body text of our thread.';
comment on column ontology_editor.thread.thread_type is 'The type of this thread.';
comment on column ontology_editor.thread.created_at is 'The time this thread was created.';

create table ontology_editor.message (
  id               serial primary key,
  author_id        integer not null default ontology_editor.current_person_id() references ontology_editor.person(id),
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
alter table ontology_editor.thread add column updated_at timestamp default now();
alter table ontology_editor.message add column updated_at timestamp default now();

create function ontology_editor_private.tg_persons__make_first_person_admin() returns trigger as $$
begin
  if not exists(select 1 from ontology_editor.person) then
    NEW.is_admin = true;
  end if;
  return NEW;
end;
$$ language plpgsql volatile set search_path from current;

create trigger _make_first_person_admin
  before insert on ontology_editor.person
  for each row
  execute procedure ontology_editor_private.tg_persons__make_first_person_admin();

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

create trigger message_updated_at before update
  on ontology_editor.thread
  for each row
  execute procedure ontology_editor_private.set_updated_at();

create table ontology_editor_private.person_account (
  person_id          integer primary key references ontology_editor.person(id) on delete cascade,
  oauth_token        text not null,
  oauth_provided_id  integer not null unique,
  email              text not null check (email ~* '^.+@.+\..+$')
);

comment on table ontology_editor_private.person_account is 'Private information about a person’s account.';
comment on column ontology_editor_private.person_account.person_id is 'The id of the person associated with this account.';
comment on column ontology_editor_private.person_account.email is 'The email address of the person.';
comment on column ontology_editor_private.person_account.oauth_token is 'The token issued by the oauth process.';
comment on column ontology_editor_private.person_account.oauth_provided_id is 'The account ID provided by the oauth external service.';

-- create function ontology_editor.register_person(
--   name text,
--   email text,
--   oauth_token text,
--   oauth_provided_id integer
-- ) returns ontology_editor.person as $$
-- declare
--   person ontology_editor.person;
-- begin
--   insert into ontology_editor.person (name) values
--     (name)
--     returning * into person;
--
--   insert into ontology_editor_private.person_account (person_id, email, oauth_token, oauth_provided_id) values
--     (person.id, email, oauth_token, oauth_provided_id);
--
--   return person;
-- end;
-- $$ language plpgsql strict security definer;
-- comment on function ontology_editor.register_person(text, text, text, integer) is 'Registers a single user and creates an account in our ontology editor.';

create function ontology_editor.register_person(
  name text,
  username text,
  email text,
  avatar text,
  token text,
  provided_id integer
) returns ontology_editor.person as $$
declare
  person ontology_editor.person;
begin
  select p.*
  into person
  from ontology_editor.person as p
    join ontology_editor_private.person_account as pa
    on p.id = pa.person_id
  where pa.oauth_provided_id = provided_id limit 1;

  if not found then
    insert into ontology_editor.person (name, username, avatar) values
      (name, username, avatar)
      returning * into person;
  end if;

  insert into ontology_editor_private.person_account
    (person_id, email, oauth_token, oauth_provided_id) values
    (person.id, email,       token,       provided_id)
  on conflict (oauth_provided_id) do update set
    oauth_token = token;

  return person;
end;
$$ language plpgsql strict security definer;
comment on function ontology_editor.register_person(text, text, text, text, text, integer) is 'Registers a single user and creates an account in our ontology editor.';

create role ontology_editor_postgraphile login password '$POSTGRESQL_POSTGRAPHILE_PASSWORD';

create role ontology_editor_anonymous;
grant ontology_editor_anonymous to ontology_editor_postgraphile;

create role ontology_editor_person;
grant ontology_editor_person to ontology_editor_postgraphile;

create type ontology_editor.jwt_token as (
  role text,
  person_id integer,
  email text,
  name text
);

create function ontology_editor.authenticate(
  oauth_token text,
  oauth_provided_id integer
) returns ontology_editor.jwt_token as $$
declare
  account ontology_editor_private.person_account;
  name    text;
begin
  select a.* into account
  from ontology_editor_private.person_account as a
  where
    a.oauth_token = $1
  and
    a.oauth_provided_id = $2;

  if found then
    select p.name into name
    from ontology_editor.person as p
    where p.id = account.person_id;

    return ('ontology_editor_person', account.person_id, account.email, name)::ontology_editor.jwt_token;
  else
    return null;
  end if;
end;
$$ language plpgsql strict security definer;

comment on function ontology_editor.authenticate(text, integer) is 'Creates a JWT token that will securely identify a person and give them certain permissions.';

grant usage on schema ontology_editor to ontology_editor_anonymous, ontology_editor_person;

grant select on table ontology_editor.person to ontology_editor_anonymous, ontology_editor_person;
grant update, delete on table ontology_editor.person to ontology_editor_person;

grant select on table ontology_editor.message to ontology_editor_anonymous, ontology_editor_person;
grant select on table ontology_editor.thread to ontology_editor_anonymous, ontology_editor_person;
grant select on table ontology_editor.hat to ontology_editor_anonymous, ontology_editor_person;
grant insert, update, delete on table ontology_editor.message to ontology_editor_person;
grant insert, update, delete on table ontology_editor.thread to ontology_editor_person;
grant usage on sequence ontology_editor.thread_id_seq to ontology_editor_person;
grant usage on sequence ontology_editor.message_id_seq to ontology_editor_person;

grant execute on function ontology_editor.message_summary(ontology_editor.message, integer, text) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.person_latest_message(ontology_editor.person) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.search_messages(text) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.authenticate(text, integer) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.current_person() to ontology_editor_anonymous, ontology_editor_person;

grant execute on function ontology_editor.register_person(text, text, text, text, text, integer) to ontology_editor_anonymous;

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
  using (ontology_editor.current_person_is_admin());

-- CRUD
-- message
create policy insert_message on ontology_editor.message for insert to ontology_editor_person
  with check (author_id = current_setting('jwt.claims.person_id')::integer);
create policy select_message on ontology_editor.message for select
  using (true);
create policy update_message on ontology_editor.message for update to ontology_editor_person
  using (author_id = current_setting('jwt.claims.person_id')::integer);
create policy delete_message on ontology_editor.message for delete to ontology_editor_person
  using (author_id = current_setting('jwt.claims.person_id')::integer or ontology_editor.current_person_is_admin());

-- CRUD
-- thread
create policy insert_thread on ontology_editor.thread for insert to ontology_editor_person
  with check (author_id = current_setting('jwt.claims.person_id')::integer);
create policy select_thread on ontology_editor.thread for select
  using (true);
create policy update_thread on ontology_editor.thread for update to ontology_editor_person
  using (author_id = current_setting('jwt.claims.person_id')::integer or ontology_editor.current_person_is_admin());
create policy delete_thread on ontology_editor.thread for delete to ontology_editor_person
  using (ontology_editor.current_person_is_admin());

-- R
-- hat
create policy select_hat on ontology_editor.hat for select
  using (true);

-- CRD hat_person
create policy insert_hat_person on ontology_editor.hat_person for insert to ontology_editor_person
  with check (ontology_editor.current_person_is_admin());
create policy select_hat_person on ontology_editor.hat_person for select
  using (true);
create policy delete_hat_person on ontology_editor.hat_person for delete to ontology_editor_person
  using (ontology_editor.current_person_is_admin());
