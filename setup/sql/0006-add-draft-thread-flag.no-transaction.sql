-- add 'draft' flag to save proposals before submitting them
alter table editor_schema.thread add column is_draft boolean not null default true;
