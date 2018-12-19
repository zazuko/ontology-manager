create type editor_schema.action_type as enum (
  'proposal_submit',
  'proposal_accept',
  'proposal_reject',
  'conversation_create',
  'conversation_comment'
);

-- submitted the proposal [thread]
-- accepted the proposal [thread]
-- rejected the proposal [thread]
-- created a conversation [thread] on [object]
-- left a comment on conversation [thread] on [object]

create table editor_schema.log (
  id               serial primary key,
  author_id        integer not null default editor_schema.current_person_id() references editor_schema.person(id),
  thread_id        integer default null references editor_schema.thread(id),
  action_type      editor_schema.action_type,
  event_date       timestamp default now()
);

comment on table editor_schema.log is 'An activity log line.';
comment on column editor_schema.log.id is 'The primary key for the log.';
comment on column editor_schema.log.author_id is 'The id of the author user.';
comment on column editor_schema.log.thread_id is 'The thread this log relates to.';
comment on column editor_schema.log.action_type is 'An enum value for the type of event.';
comment on column editor_schema.log.event_date is 'The timestamp for this event.';

grant select on table editor_schema.log to $POSTGRESQL_ROLE_ANONYMOUS, $POSTGRESQL_ROLE_PERSON;
grant insert on table editor_schema.log to $POSTGRESQL_ROLE_PERSON;
grant usage on sequence editor_schema.log_id_seq to $POSTGRESQL_ROLE_PERSON;

alter table editor_schema.log enable row level security;

-- CR
create policy insert_log on editor_schema.log for insert to $POSTGRESQL_ROLE_PERSON
  with check (author_id = current_setting('jwt.claims.person_id')::integer);
create policy select_log on editor_schema.log for select
  using (true);

-- triggers
create function editor_private_schema.tg_log__proposal_submit()
returns trigger as $$
begin
  insert into editor_schema.log
    (author_id, thread_id, action_type, event_date)
  values
    (NEW.author_id, NEW.id, 'proposal_submit', NEW.updated_at);
  return NEW;
end;
$$ language plpgsql;

create function editor_private_schema.tg_log__proposal_accept()
returns trigger as $$
begin
  insert into editor_schema.log
    (author_id, thread_id, action_type, event_date)
  values
    (current_setting('jwt.claims.person_id')::integer, NEW.id, 'proposal_accept', NEW.updated_at);
  return NEW;
end;
$$ language plpgsql;

create function editor_private_schema.tg_log__proposal_reject()
returns trigger as $$
begin
  insert into editor_schema.log
    (author_id, thread_id, action_type, event_date)
  values
    (current_setting('jwt.claims.person_id')::integer, NEW.id, 'proposal_reject', NEW.updated_at);
  return NEW;
end;
$$ language plpgsql;

create function editor_private_schema.tg_log__conversation_create()
returns trigger as $$
begin
  insert into editor_schema.log
    (author_id, thread_id, action_type, event_date)
  values
    (NEW.author_id, NEW.id, 'conversation_create', NEW.updated_at);
  return NEW;
end;
$$ language plpgsql;

create function editor_private_schema.tg_log__conversation_comment()
returns trigger as $$
begin
  insert into editor_schema.log
    (author_id, thread_id, action_type, event_date)
  values
    (NEW.author_id, NEW.thread_id, 'conversation_comment', NEW.updated_at);
  return NEW;
end;
$$ language plpgsql;

create trigger proposal_submit_logger
  after update on editor_schema.thread
  for each row
    when (
      NEW.thread_type = 'proposal'::editor_schema.thread_type and
      NEW.status = 'open'::editor_schema.status and
      OLD.external_id is null and
      OLD.is_draft = true and
      NEW.is_draft = false
    )
  execute procedure editor_private_schema.tg_log__proposal_submit();

create trigger proposal_accept_logger
  after update on editor_schema.thread
  for each row
    when (
      NEW.thread_type = 'proposal'::editor_schema.thread_type and
      NEW.status = 'resolved'::editor_schema.status and
      NEW.status != OLD.status and
      NEW.is_draft = false
    )
  execute procedure editor_private_schema.tg_log__proposal_accept();

create trigger proposal_reject_logger
  after update on editor_schema.thread
  for each row
    when (
      NEW.thread_type = 'proposal'::editor_schema.thread_type and
      NEW.status = 'rejected'::editor_schema.status and
      NEW.status != OLD.status and
      NEW.is_draft = false
    )
  execute procedure editor_private_schema.tg_log__proposal_reject();

create trigger conversation_create_logger
  after insert on editor_schema.thread
  for each row
    when (
      NEW.thread_type = 'discussion'::editor_schema.thread_type and
      NEW.status = 'open'::editor_schema.status
    )
    execute procedure editor_private_schema.tg_log__conversation_create();

create trigger conversation_comment_logger
  after insert on editor_schema.message
  for each row
  execute procedure editor_private_schema.tg_log__conversation_comment();
