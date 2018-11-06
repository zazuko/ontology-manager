-- add 'draft' flag to save proposals before submitting them
alter table ontology_editor.thread add column is_draft boolean not null default true;
