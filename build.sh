#!/bin/bash

THEMES=$(ls ./assets/themes/ | sed s%./assets/themes/%%)
mkdir ./artifacts

for THEME in $THEMES; do
  echo "BUILDING $THEME"
  # modify nuxt.config.js
  sed -i.bak s%themes/zazuko/theme%themes/$THEME/theme% nuxt.config.js

  # build the project
  npm run build -- --modern=server
  # delete source maps for client
  rm .nuxt/dist/client/*.map

  cp -r .nuxt artifacts/nuxt_$THEME

  # restore nuxt.config.js
  cat nuxt.config.js.bak > nuxt.config.js
  echo "BUILT $THEME"
  ls ./artifacts
done

rm nuxt.config.js.bak
