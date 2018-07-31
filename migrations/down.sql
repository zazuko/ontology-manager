begin;

drop schema if exists ontology_editor, ontology_editor_private cascade;
drop role if exists ontology_editor_postgraphile, ontology_editor_anonymous, ontology_editor_person, ontology_editor_postgraphile_demo;

commit;
