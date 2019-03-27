-- set editor.github.oauthClientId from forge.oauthClientId for the last config version only
update editor_schema.config
set editor = jsonb_set(
  editor,
  '{github}',
  editor->'github' || jsonb_build_object('oauthClientId', subquery.oauth_client_id)
)
from (
  select forge->'oauthClientId' as oauth_client_id from editor_schema.config
) as subquery
where
  id in (select max(id) from editor_schema.config)
and
  -- only replace when we have a value
  subquery.oauth_client_id is not null;

-- remove forge.oauthClientId from all config versions
update editor_schema.config set forge = forge - 'oauthClientId';

-- set editor.github.oauthClientId on all config versions from last version's editor.github.oauthClientId
update editor_schema.config
set editor = jsonb_set(
  editor,
  '{github}',
  editor->'github' || jsonb_build_object('oauthClientId', subquery.oauth_client_id)
)
from (
  select editor->'github'->'oauthClientId' as oauth_client_id
  from editor_schema.config
  where id in (select max(id) from editor_schema.config)
) as subquery
where
  id not in (select max(id) from editor_schema.config)
and
  -- only replace when we have a value
  subquery.oauth_client_id is not null;
