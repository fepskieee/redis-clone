#!/bin/bash

SERVER="127.0.0.1"
PORT="6379"

TIMEOUT=60
INTERVAL=2
START_TIME=$(date +%s)


echo -e "Connecting to Nedis $SERVER:$PORT...\n"

while true; do
  ncat -z $SERVER $PORT

  if [ $? -eq 0 ]; then
    ncat $SERVER $PORT 2>error_log.txt
    START_TIME=$(date +%s)
  else
    CURRENT_TIME=$(date +%s)
    ELAPSED_TIME=$((CURRENT_TIME - START_TIME))
    
    if [ $ELAPSED_TIME -ge $TIMEOUT ]; then
      echo -e "\nCannot connect to Nedis $SERVER:$PORT after $TIMEOUT seconds.\n"
      exit 0
    else
      echo -e "Failed to connect Nedis $SERVER:$PORT. Retrying in $INTERVAL seconds..."
      sleep $INTERVAL
    fi
  fi
done
