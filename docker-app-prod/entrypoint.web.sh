#!/bin/bash
set -euo pipefail

/usr/src/app/node_modules/.bin/pm2 set pm2-logrotate:compress true
/usr/src/app/node_modules/.bin/pm2 set pm2-logrotate:rotateInterval '0 */5 * * *'

node setup/migrate.js
node setup/replace-vars.js
sleep 3

wait_for_pids()
{
    for (( i = 1; i <= $#; i++ )) do
        wait -n $@
        status=$?
        echo "received status: "$status
        if [ $status -ne 0 ] && [ $status -ne 127 ]; then
            exit 1
        fi
    done
}

npm run prod &
pid1=$!

nginx -g 'daemon off;' &
pid2=$!

wait_for_pids $pid2 $pid1
