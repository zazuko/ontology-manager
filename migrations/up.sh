#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

PGPASSWORD=$POSTGRESQL_PASSWORD psql -U postgres -f ./up.sql ontologyeditordb
