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

comment on table ontology_editor.person is 'A user of the forum.';
comment on column ontology_editor.person.id is 'The primary unique identifier for the person.';
comment on column ontology_editor.person.first_name is 'The person’s first name.';
comment on column ontology_editor.person.last_name is 'The person’s last name.';
comment on column ontology_editor.person.about is 'A short description about the user, written by the user.';
comment on column ontology_editor.person.created_at is 'The time this person was created.';

create type ontology_editor.post_topic as enum (
  'discussion',
  'inspiration',
  'help',
  'showcase'
);

create table ontology_editor.post (
  id               serial primary key,
  author_id        integer not null references ontology_editor.person(id),
  headline         text not null check (char_length(headline) < 280),
  body             text,
  topic            ontology_editor.post_topic,
  created_at       timestamp default now()
);

comment on table ontology_editor.post is 'A forum post written by a user.';
comment on column ontology_editor.post.id is 'The primary key for the post.';
comment on column ontology_editor.post.headline is 'The title written by the user.';
comment on column ontology_editor.post.author_id is 'The id of the author user.';
comment on column ontology_editor.post.topic is 'The topic this has been posted in.';
comment on column ontology_editor.post.body is 'The main body text of our post.';
comment on column ontology_editor.post.created_at is 'The time this post was created.';

alter default privileges revoke execute on functions from public;

create function ontology_editor.person_full_name(person ontology_editor.person) returns text as $$
  select person.first_name || ' ' || person.last_name
$$ language sql stable;

comment on function ontology_editor.person_full_name(ontology_editor.person) is 'A person’s full name which is a concatenation of their first and last name.';

create function ontology_editor.post_summary(
  post ontology_editor.post,
  length int default 50,
  omission text default '…'
) returns text as $$
  select case
    when post.body is null then null
    else substr(post.body, 0, length) || omission
  end
$$ language sql stable;

comment on function ontology_editor.post_summary(ontology_editor.post, int, text) is 'A truncated version of the body for summaries.';

create function ontology_editor.person_latest_post(person ontology_editor.person) returns ontology_editor.post as $$
  select post.*
  from ontology_editor.post as post
  where post.author_id = person.id
  order by created_at desc
  limit 1
$$ language sql stable;

comment on function ontology_editor.person_latest_post(ontology_editor.person) is 'Gets the latest post written by the person.';

create function ontology_editor.search_posts(search text) returns setof ontology_editor.post as $$
  select post.*
  from ontology_editor.post as post
  where post.headline ilike ('%' || search || '%') or post.body ilike ('%' || search || '%')
$$ language sql stable;

comment on function ontology_editor.search_posts(text) is 'Returns posts containing a given search term.';

alter table ontology_editor.person add column updated_at timestamp default now();
alter table ontology_editor.post add column updated_at timestamp default now();

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

create trigger post_updated_at before update
  on ontology_editor.post
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

comment on function ontology_editor.register_person(text, text, text, text) is 'Registers a single user and creates an account in our forum.';

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

grant select on table ontology_editor.post to ontology_editor_anonymous, ontology_editor_person;
grant insert, update, delete on table ontology_editor.post to ontology_editor_person;
grant usage on sequence ontology_editor.post_id_seq to ontology_editor_person;

grant execute on function ontology_editor.person_full_name(ontology_editor.person) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.post_summary(ontology_editor.post, integer, text) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.person_latest_post(ontology_editor.person) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.search_posts(text) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.authenticate(text, text) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.current_person() to ontology_editor_anonymous, ontology_editor_person;

grant execute on function ontology_editor.register_person(text, text, text, text) to ontology_editor_anonymous;

alter table ontology_editor.person enable row level security;
alter table ontology_editor.post enable row level security;

create policy select_person on ontology_editor.person for select
  using (true);

create policy select_post on ontology_editor.post for select
  using (true);

create policy update_person on ontology_editor.person for update to ontology_editor_person
  using (id = current_setting('jwt.claims.person_id')::integer);

create policy delete_person on ontology_editor.person for delete to ontology_editor_person
  using (id = current_setting('jwt.claims.person_id')::integer);

create policy insert_post on ontology_editor.post for insert to ontology_editor_person
  with check (author_id = current_setting('jwt.claims.person_id')::integer);

create policy update_post on ontology_editor.post for update to ontology_editor_person
  using (author_id = current_setting('jwt.claims.person_id')::integer);

create policy delete_post on ontology_editor.post for delete to ontology_editor_person
  using (author_id = current_setting('jwt.claims.person_id')::integer);


commit;
