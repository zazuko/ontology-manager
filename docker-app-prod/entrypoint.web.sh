#!/bin/bash
set -euo pipefail

node setup/migrate.js
node setup/replace-vars.js
sleep 10

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
