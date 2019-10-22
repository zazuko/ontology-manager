#!/bin/bash

DESIGNS=$(ls ./assets/scss/*.scss | sed s%./assets/scss/%% | sed s%-style.scss%%)
mkdir ./artifacts

for DESIGN in $DESIGNS; do
  echo "BUILDING $DESIGN"
  # modify nuxt.config.js
  sed -i.bak s%zazuko-style%$DESIGN-style% nuxt.config.js

  # build the project
  npm run build -- --modern=server
  # delete source maps for client
  rm .nuxt/dist/client/*.map

  cp -r .nuxt artifacts/nuxt_$DESIGN

  # restore nuxt.config.js
  cat nuxt.config.js.bak > nuxt.config.js
  echo "BUILT $DESIGN"
  ls ./artifacts
done

rm nuxt.config.js.bak
