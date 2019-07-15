create schema editor_schema;
create schema editor_private_schema;

create table editor_schema.person (
  id               serial primary key,
  is_admin         boolean not null default false,
  name             text not null check (char_length(name) < 80),
  username         text not null check (char_length(name) < 120),
  avatar           text,
  about            text,
  created_at       timestamp default now()
);

comment on table editor_schema.person is '@omit all\nA user of the ontology editor.';
comment on column editor_schema.person.id is 'The primary unique identifier for the person.';
comment on column editor_schema.person.is_admin is 'If true, the user has elevated privileges.';
comment on column editor_schema.person.name is 'The person’s first name.';
comment on column editor_schema.person.name is 'The person’s forge username.';
comment on column editor_schema.person.avatar is 'The person’s avatar URL.';
comment on column editor_schema.person.about is 'A short description about the user, written by the user.';
comment on column editor_schema.person.created_at is 'The time this person was created.';

create table editor_schema.hat (
  id               serial primary key,
  title            text not null check (char_length(title) < 20) unique,
  description      text
);

comment on table editor_schema.hat is 'A hat users can use in threads and messages.';
comment on column editor_schema.hat.id is 'The primary key for the hat.';
comment on column editor_schema.hat.title is 'The name of the hat.';
comment on column editor_schema.hat.description is 'The description for the hat.';

create table editor_schema.hat_person (
  hat_id integer not null references editor_schema.hat(id),
  person_id integer not null references editor_schema.person(id),
  primary key (hat_id, person_id)
);

comment on table editor_schema.hat_person is 'Who has which hat(s).';
comment on column editor_schema.hat_person.hat_id is 'Which hat.';
comment on column editor_schema.hat_person.person_id is 'Hat holder.';

create type editor_schema.thread_type as enum (
  'discussion',
  'proposal'
);

create function editor_schema.current_person() returns editor_schema.person as $$
  select *
  from editor_schema.person
  where id = current_setting('jwt.claims.person_id')::integer
$$ language sql stable;
comment on function editor_schema.current_person() is 'Gets the person who was identified by our JWT.';

create function editor_schema.current_person_id() returns int as $$
  select nullif(current_setting('jwt.claims.person_id', true), '')::int;
$$ language sql stable set search_path from current;
comment on function editor_schema.current_person_id() is 'Gets the person who was identified by our JWT.';

-- We're using exists here because it guarantees true/false rather than true/false/null
create function editor_schema.current_person_is_admin() returns bool as $$
  select exists(
    select 1 from editor_schema.person where id = editor_schema.current_person_id() and is_admin = true
  );
$$ language sql stable set search_path from current;
comment on function editor_schema.current_person_is_admin() is E'@omit\nHandy method to determine if the current user is an admin, for use in RLS policies, etc; in GraphQL should use `currentUser{isAdmin}` instead.';

create table editor_schema.thread (
  id               serial primary key,
  author_id        integer not null default editor_schema.current_person_id() references editor_schema.person(id),
  hat_id           integer default null references editor_schema.hat(id),
  external_id      integer default null,
  headline         text not null check (char_length(headline) < 280),
  iri              text not null check (char_length(iri) < 280),
  body             text,
  thread_type      editor_schema.thread_type,
  created_at       timestamp default now()
);

comment on table editor_schema.thread is 'A message thread.';
comment on column editor_schema.thread.id is 'The primary key for the thread.';
comment on column editor_schema.thread.author_id is 'The id of the author user.';
comment on column editor_schema.thread.hat_id is 'The hat used to post this message, if any.';
comment on column editor_schema.thread.external_id is 'The id of an external object (e.g. a github PR), if any.';
comment on column editor_schema.thread.headline is 'The title written by the user.';
comment on column editor_schema.thread.iri is 'The IRI of the object our thread is about.';
comment on column editor_schema.thread.body is 'The main body text of our thread.';
comment on column editor_schema.thread.thread_type is 'The type of this thread.';
comment on column editor_schema.thread.created_at is 'The time this thread was created.';

create table editor_schema.message (
  id               serial primary key,
  author_id        integer not null default editor_schema.current_person_id() references editor_schema.person(id),
  thread_id        integer not null references editor_schema.thread(id),
  hat_id           integer default null references editor_schema.hat(id),
  body             text,
  created_at       timestamp default now()
);

comment on table editor_schema.message is 'A message written by a user.';
comment on column editor_schema.message.id is 'The primary key for the message.';
comment on column editor_schema.message.author_id is 'The id of the author user.';
comment on column editor_schema.message.thread_id is 'The thread this has been messaged in.';
comment on column editor_schema.message.hat_id is 'The hat used to post this message, if any.';
comment on column editor_schema.message.body is 'The main body text of our message.';
comment on column editor_schema.message.created_at is 'The time this message was created.';

alter default privileges revoke execute on functions from public;

create function editor_schema.search_messages(search text) returns setof editor_schema.thread as $$
  select thread.*
  from editor_schema.thread as thread
  join editor_schema.message as message
    on message.thread_id = thread.id
  where thread.headline ilike ('%' || search || '%') or message.body ilike ('%' || search || '%')
$$ language sql stable;

comment on function editor_schema.search_messages(text) is 'Returns threads containing a given search term.';

alter table editor_schema.person add column updated_at timestamp default now();
alter table editor_schema.thread add column updated_at timestamp default now();
alter table editor_schema.message add column updated_at timestamp default now();

create function editor_private_schema.tg_persons__make_first_person_admin() returns trigger as $$
begin
  if not exists(select 1 from editor_schema.person) then
    NEW.is_admin = true;
  end if;
  return NEW;
end;
$$ language plpgsql volatile set search_path from current;

create trigger _make_first_person_admin
  before insert on editor_schema.person
  for each row
  execute procedure editor_private_schema.tg_persons__make_first_person_admin();

create function editor_private_schema.set_updated_at() returns trigger as $$
begin
  new.updated_at := current_timestamp;
  return new;
end;
$$ language plpgsql;

create trigger person_updated_at before update
  on editor_schema.person
  for each row
  execute procedure editor_private_schema.set_updated_at();

create trigger message_updated_at before update
  on editor_schema.message
  for each row
  execute procedure editor_private_schema.set_updated_at();

create trigger thread_updated_at before update
  on editor_schema.thread
  for each row
  execute procedure editor_private_schema.set_updated_at();

create table editor_private_schema.person_account (
  person_id          integer primary key references editor_schema.person(id) on delete cascade,
  oauth_token        text not null,
  oauth_provided_id  integer not null unique,
  email              text not null check (email ~* '^.+@.+\..+$')
);

comment on table editor_private_schema.person_account is 'Private information about a person’s account.';
comment on column editor_private_schema.person_account.person_id is 'The id of the person associated with this account.';
comment on column editor_private_schema.person_account.email is 'The email address of the person.';
comment on column editor_private_schema.person_account.oauth_token is 'The token issued by the oauth process.';
comment on column editor_private_schema.person_account.oauth_provided_id is 'The account ID provided by the oauth external service.';

create function editor_schema.register_person(
  name text,
  username text,
  email text,
  avatar text,
  token text,
  provided_id integer
) returns editor_schema.person as $$
declare
  person editor_schema.person;
begin
  select p.*
  into person
  from editor_schema.person as p
    join editor_private_schema.person_account as pa
    on p.id = pa.person_id
  where pa.oauth_provided_id = provided_id limit 1;

  if not found then
    insert into editor_schema.person (name, username, avatar) values
      (name, username, avatar)
      returning * into person;
  end if;

  insert into editor_private_schema.person_account
    (person_id, email, oauth_token, oauth_provided_id) values
    (person.id, email,       token,       provided_id)
  on conflict (oauth_provided_id) do update set
    oauth_token = token;

  return person;
end;
$$ language plpgsql strict security definer;
comment on function editor_schema.register_person(text, text, text, text, text, integer) is 'Registers a single user and creates an account in our ontology editor.';

create role $POSTGRESQL_ROLE_ANONYMOUS inherit;
grant $POSTGRESQL_ROLE_ANONYMOUS to current_user;

create role $POSTGRESQL_ROLE_PERSON inherit;
grant $POSTGRESQL_ROLE_PERSON to current_user;

create type editor_schema.jwt_token as (
  role text,
  person_id integer,
  email text,
  name text
);

create function editor_schema.authenticate(
  oauth_token text,
  oauth_provided_id integer
) returns editor_schema.jwt_token as $$
declare
  account editor_private_schema.person_account;
  name    text;
begin
  select a.* into account
  from editor_private_schema.person_account as a
  where
    a.oauth_token = $1
  and
    a.oauth_provided_id = $2;

  if found then
    select p.name into name
    from editor_schema.person as p
    where p.id = account.person_id;

    return ('$POSTGRESQL_ROLE_PERSON', account.person_id, account.email, name)::editor_schema.jwt_token;
  else
    return null;
  end if;
end;
$$ language plpgsql strict security definer;

comment on function editor_schema.authenticate(text, integer) is 'Creates a JWT token that will securely identify a person and give them certain permissions.';

grant usage on schema editor_schema to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;

grant select on table editor_schema.person to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;
grant update, delete on table editor_schema.person to $POSTGRESQL_ROLE_PERSON;

grant select on table editor_schema.message to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;
grant select on table editor_schema.thread to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;
grant select on table editor_schema.hat to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;
grant select on table editor_schema.hat_person to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;

grant insert, update, delete on table editor_schema.message to $POSTGRESQL_ROLE_PERSON;
grant insert, update, delete on table editor_schema.thread to $POSTGRESQL_ROLE_PERSON;
grant insert, update, delete on table editor_schema.hat to $POSTGRESQL_ROLE_PERSON;
grant insert, update, delete on table editor_schema.hat_person to $POSTGRESQL_ROLE_PERSON;

grant usage on sequence editor_schema.message_id_seq to $POSTGRESQL_ROLE_PERSON;
grant usage on sequence editor_schema.thread_id_seq to $POSTGRESQL_ROLE_PERSON;
grant usage on sequence editor_schema.hat_id_seq to $POSTGRESQL_ROLE_PERSON;

grant execute on function editor_schema.search_messages(text) to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;
grant execute on function editor_schema.authenticate(text, integer) to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;
grant execute on function editor_schema.current_person() to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;

grant execute on function editor_schema.register_person(text, text, text, text, text, integer) to $POSTGRESQL_ROLE_ANONYMOUS;

alter table editor_schema.person     enable row level security;
alter table editor_schema.message    enable row level security;
alter table editor_schema.thread     enable row level security;
alter table editor_schema.hat        enable row level security;
alter table editor_schema.hat_person enable row level security;

-- RUD
-- person
create policy select_person on editor_schema.person for select
  using (true);
create policy update_person on editor_schema.person for update to $POSTGRESQL_ROLE_PERSON
  using (id = current_setting('jwt.claims.person_id')::integer);
create policy delete_person on editor_schema.person for delete to $POSTGRESQL_ROLE_PERSON
  using (editor_schema.current_person_is_admin());

-- CRUD
-- message
create policy insert_message on editor_schema.message for insert to $POSTGRESQL_ROLE_PERSON
  with check (author_id = current_setting('jwt.claims.person_id')::integer);
create policy select_message on editor_schema.message for select
  using (true);
create policy update_message on editor_schema.message for update to $POSTGRESQL_ROLE_PERSON
  using (author_id = current_setting('jwt.claims.person_id')::integer);
create policy delete_message on editor_schema.message for delete to $POSTGRESQL_ROLE_PERSON
  using (author_id = current_setting('jwt.claims.person_id')::integer or editor_schema.current_person_is_admin());

-- CRUD
-- thread
create policy insert_thread on editor_schema.thread for insert to $POSTGRESQL_ROLE_PERSON
  with check (author_id = current_setting('jwt.claims.person_id')::integer);
create policy select_thread on editor_schema.thread for select
  using (true);
create policy update_thread on editor_schema.thread for update to $POSTGRESQL_ROLE_PERSON
  using (author_id = current_setting('jwt.claims.person_id')::integer or editor_schema.current_person_is_admin());
create policy delete_thread on editor_schema.thread for delete to $POSTGRESQL_ROLE_PERSON
  using (editor_schema.current_person_is_admin());

-- CRUD
-- hat
create policy insert_hat on editor_schema.hat for insert to $POSTGRESQL_ROLE_PERSON
  with check (editor_schema.current_person_is_admin());
create policy select_hat on editor_schema.hat for select
  using (true);
create policy update_hat on editor_schema.hat for update to $POSTGRESQL_ROLE_PERSON
  using (editor_schema.current_person_is_admin());
create policy delete_hat on editor_schema.hat for delete to $POSTGRESQL_ROLE_PERSON
  using (editor_schema.current_person_is_admin());

-- CRD
-- hat_person
create policy insert_hat_person on editor_schema.hat_person for insert to $POSTGRESQL_ROLE_PERSON
  with check (editor_schema.current_person_is_admin());
create policy select_hat_person on editor_schema.hat_person for select
  using (true);
create policy update_hat_person on editor_schema.hat_person for update to $POSTGRESQL_ROLE_PERSON
  using (editor_schema.current_person_is_admin());
create policy delete_hat_person on editor_schema.hat_person for delete to $POSTGRESQL_ROLE_PERSON
  using (editor_schema.current_person_is_admin());
