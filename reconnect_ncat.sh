#!/bin/bash

SERVER="127.0.0.1"
PORT="6379"

TIMEOUT=30
INTERVAL=3
START_TIME=$(date +%s)

MSG_CONNECT_SERVER="Connecting to Nedis $SERVER:$PORT..."
MSG_RECON_SERVER="\nFailed to connect Nedis $SERVER:$PORT. Retrying in $INTERVAL seconds..."
MSG_CONNECTION_STATUS_SERVER="Lost connection to Nedis $SERVER:$PORT..."
MSG_OFFLINE_SERVER="\nCannot connect to Nedis $SERVER:$PORT after $TIMEOUT seconds...\n"

echo -e $MSG_CONNECT_SERVER

while true; do
  netstat -an | grep ":$PORT" | grep -q "LISTEN"
  NETSTAT_EXIT_STATUS=$? 

  if [ $NETSTAT_EXIT_STATUS -eq 0 ]; then
    ncat $SERVER $PORT 2>> ncat.log
    START_TIME=$(date +%s)
    echo -e $MSG_CONNECTION_STATUS_SERVER
  else
    CURRENT_TIME=$(date +%s)
    ELAPSED_TIME=$((CURRENT_TIME - START_TIME))
      
    if [ $ELAPSED_TIME -ge $TIMEOUT ]; then
      echo -e $MSG_OFFLINE_SERVER
      exit 0
    else
      echo -e $MSG_RECON_SERVER
      sleep $INTERVAL
    fi
  fi
done
