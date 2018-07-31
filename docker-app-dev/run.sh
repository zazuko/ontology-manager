#!/bin/bash

set -euo pipefail


if [ "$1" = 'dev' ]; then

  cd $APP_DIR
  npmCachePath="${APP_DIR}/.npm_cache"
  mkdir -p $npmCachePath
  npm config set cache $npmCachePath --global
  echo "-- Running Docker Nuxt …"
  if [ "$2" = 'install' ]; then
    # install npm dependencies
    echo "-- Installing npm dependencies (npm install) …"
    npm install
  fi
  echo "-- running (npm run dev)  …"
  exec npm run dev
fi

exec "$@"
