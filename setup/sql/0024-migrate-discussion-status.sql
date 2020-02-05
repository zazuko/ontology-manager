-- fixes faulty data created by a bug that is now fixed
update editor_schema.thread
set
  status = 'open'::editor_schema.status
where
  status = 'initial_draft'::editor_schema.status
    and
  thread_type = 'discussion'::editor_schema.thread_type;
