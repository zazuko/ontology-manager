#!/bin/bash
set -euo pipefail

node setup/migrate.js

if [ ! -f .built ]; then
  npm run build -- --modern=server && touch .built
fi

npm run start -- --modern=server
