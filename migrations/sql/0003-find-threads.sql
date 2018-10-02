create function ontology_editor.proposals_by_iri(iri text) returns setof ontology_editor.thread as $$
  select thread.*
  from ontology_editor.thread as thread
  where thread.iri = proposals_by_iri.iri and thread.thread_type = 'proposal'
$$ language sql stable;

create function ontology_editor.discussions_by_iri(iri text) returns setof ontology_editor.thread as $$
  select thread.*
  from ontology_editor.thread as thread
  where thread.iri = discussions_by_iri.iri and thread.thread_type = 'discussion'
$$ language sql stable;

comment on function ontology_editor.proposals_by_iri(text) is 'Returns proposals regarding a given IRI.';
comment on function ontology_editor.discussions_by_iri(text) is 'Returns discussions regarding a given IRI.';

grant execute on function ontology_editor.proposals_by_iri(text) to ontology_editor_anonymous, ontology_editor_person;
grant execute on function ontology_editor.discussions_by_iri(text) to ontology_editor_anonymous, ontology_editor_person;
