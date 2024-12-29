#!/bin/bash

SERVER="127.0.0.1"
PORT="6379"

TIMEOUT=30
INTERVAL=2
START_TIME=$(date +%s)

echo -e "Connecting to Nedis $SERVER:$PORT..."

while true; do
  netstat -an | grep ":$PORT" | grep -q "LISTEN"
  NETSTAT_EXIT_STATUS=$? 

  if [ $NETSTAT_EXIT_STATUS -eq 0 ]; then
    ncat $SERVER $PORT 2>> ncat.log
    START_TIME=$(date +%s)
    echo -e "Lost connection to Nedis $SERVER:$PORT..."
  else
    CURRENT_TIME=$(date +%s)
    ELAPSED_TIME=$((CURRENT_TIME - START_TIME))
      
    if [ $ELAPSED_TIME -ge $TIMEOUT ]; then
      echo -e "\nCannot connect to Nedis $SERVER:$PORT after $TIMEOUT seconds.\n"
      exit 0
    else
      echo -e "\nFailed to connect Nedis $SERVER:$PORT. Retrying in $INTERVAL seconds..."
      sleep $INTERVAL
    fi
  fi
done
