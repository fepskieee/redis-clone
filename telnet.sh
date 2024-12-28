#!/bin/bash

SERVER="127.0.0.1"
PORT="6379"

TIMEOUT=30
INTERVAL=2
START_TIME=$(date +%s)



while true; do
  ncat -z -v $SERVER $PORT
  
  if [ $? -eq 0 ]; then
    echo "Successfully connected to $SERVER on port $PORT."
    telnet 127.0.0.1 6379
    
    sleep $INTERVAL
  else
    CURRENT_TIME=$(date +%s)
    
    ELAPSED_TIME=$((CURRENT_TIME - START_TIME))
    
    if [ $ELAPSED_TIME -ge $TIMEOUT ]; then
      echo "Failed to connect to $SERVER on port $PORT after $TIMEOUT seconds."
      exit 1
    else
      echo "Failed to connect. Retrying in $INTERVAL seconds..."
      sleep $INTERVAL
    fi
  fi
done
