alter table editor_schema.thread add column is_edit boolean;
comment on column editor_schema.thread.is_edit is 'If true, the proposal is to change an existing object, not create a new one.';

update editor_schema.thread
set is_edit = (proposal_object->0->>'isEdit')::boolean;

alter table editor_schema.thread add column original_iri text;
comment on column editor_schema.thread.original_iri is 'The original IRI of this proposal, in case the object name changed.';

update editor_schema.thread
set original_iri = proposal_object->>2
where thread_type='proposal';
