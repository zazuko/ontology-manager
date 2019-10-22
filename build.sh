#!/bin/bash

DESIGNS=$(ls ./assets/scss/*.scss | sed s%./assets/scss/%% | sed s%-style.scss%%)

for DESIGN in $DESIGNS; do
  # modify nuxt.config.js
  sed -i.bak s%zazuko-style%$DESIGN-style% nuxt.config.js

  # build the project
  npm run build -- --modern=server
  # delete source maps for client
  rm .nuxt/dist/client/*.map

  mv .nuxt .nuxt_$DESIGN

  # restore nuxt.config.js
  cat nuxt.config.js.bak > nuxt.config.js
  echo "BUILT $DESIGN"
done

rm nuxt.config.js.bak
