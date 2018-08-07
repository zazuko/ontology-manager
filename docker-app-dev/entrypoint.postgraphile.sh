#!/usr/bin/env sh

postgraphile \
  -n 0.0.0.0 \
  --connection postgres://ontology_editor_postgraphile:password_placeholder@db:5432/$POSTGRESQL_DATABASE \
  --secret $TOKENSECRET \
  --schema ontology_editor \
  --default-role ontology_editor_anonymous \
  --cors
  --token ontology_editor.jwt_token
