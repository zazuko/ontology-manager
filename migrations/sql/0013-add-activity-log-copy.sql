create type ontology_editor.action_type as enum (
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

create table ontology_editor.log (
  id               serial primary key,
  author_id        integer not null default ontology_editor.current_person_id() references ontology_editor.person(id),
  thread_id        integer default null references ontology_editor.thread(id),
  action_type      ontology_editor.action_type,
  event_date       timestamp default now()
);

comment on table ontology_editor.log is 'An activity log line.';
comment on column ontology_editor.log.id is 'The primary key for the log.';
comment on column ontology_editor.log.author_id is 'The id of the author user.';
comment on column ontology_editor.log.thread_id is 'The thread this log relates to.';
comment on column ontology_editor.log.action_type is 'An enum value for the type of event.';
comment on column ontology_editor.log.event_date is 'The timestamp for this event.';

grant select on table ontology_editor.log to ontology_editor_anonymous, ontology_editor_person;
grant insert on table ontology_editor.log to ontology_editor_person;
grant usage on sequence ontology_editor.log_id_seq to ontology_editor_person;

alter table ontology_editor.log enable row level security;

-- CR
create policy insert_log on ontology_editor.log for insert to ontology_editor_person
  with check (author_id = current_setting('jwt.claims.person_id')::integer);
create policy select_log on ontology_editor.log for select
  using (true);

-- triggers
create function ontology_editor_private.tg_log__proposal_submit()
returns trigger as $$
begin
  insert into ontology_editor.log
    (author_id, thread_id, action_type, event_date)
  values
    (NEW.author_id, NEW.id, 'proposal_submit', NEW.updated_at);
  return NEW;
end;
$$ language plpgsql;

create function ontology_editor_private.tg_log__proposal_accept()
returns trigger as $$
begin
  insert into ontology_editor.log
    (author_id, thread_id, action_type, event_date)
  values
    (current_setting('jwt.claims.person_id')::integer, NEW.id, 'proposal_accept', NEW.updated_at);
  return NEW;
end;
$$ language plpgsql;

create function ontology_editor_private.tg_log__proposal_reject()
returns trigger as $$
begin
  insert into ontology_editor.log
    (author_id, thread_id, action_type, event_date)
  values
    (current_setting('jwt.claims.person_id')::integer, NEW.id, 'proposal_reject', NEW.updated_at);
  return NEW;
end;
$$ language plpgsql;

create function ontology_editor_private.tg_log__conversation_create()
returns trigger as $$
begin
  insert into ontology_editor.log
    (author_id, thread_id, action_type, event_date)
  values
    (NEW.author_id, NEW.id, 'conversation_create', NEW.updated_at);
  return NEW;
end;
$$ language plpgsql;

create function ontology_editor_private.tg_log__conversation_comment()
returns trigger as $$
begin
  insert into ontology_editor.log
    (author_id, thread_id, action_type, event_date)
  values
    (NEW.author_id, NEW.thread_id, 'conversation_comment', NEW.updated_at);
  return NEW;
end;
$$ language plpgsql;

create trigger proposal_submit_logger
  after update on ontology_editor.thread
  for each row
    when (
      NEW.thread_type = 'proposal'::ontology_editor.thread_type and
      NEW.status = 'open'::ontology_editor.status and
      OLD.external_id is null and
      OLD.is_draft = true and
      NEW.is_draft = false
    )
  execute procedure ontology_editor_private.tg_log__proposal_submit();

create trigger proposal_accept_logger
  after update on ontology_editor.thread
  for each row
    when (
      NEW.thread_type = 'proposal'::ontology_editor.thread_type and
      NEW.status = 'resolved'::ontology_editor.status and
      NEW.status != OLD.status and
      NEW.is_draft = false
    )
  execute procedure ontology_editor_private.tg_log__proposal_accept();

create trigger proposal_reject_logger
  after update on ontology_editor.thread
  for each row
    when (
      NEW.thread_type = 'proposal'::ontology_editor.thread_type and
      NEW.status = 'rejected'::ontology_editor.status and
      NEW.status != OLD.status and
      NEW.is_draft = false
    )
  execute procedure ontology_editor_private.tg_log__proposal_reject();

create trigger conversation_create_logger
  after insert on ontology_editor.thread
  for each row
    when (
      NEW.thread_type = 'discussion'::ontology_editor.thread_type and
      NEW.status = 'open'::ontology_editor.status
    )
    execute procedure ontology_editor_private.tg_log__conversation_create();

create trigger conversation_comment_logger
  after insert on ontology_editor.message
  for each row
  execute procedure ontology_editor_private.tg_log__conversation_comment();
