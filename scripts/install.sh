#!/bin/sh
set -e

# Check if node_modules is empty
if [ -z "$(ls -A 'node_modules' 2>/dev/null)" ]; then
    echo "node_modules is empty, running npm install..."
    npm ci
else
    echo "node_modules is not empty, skipping npm install..."
fi


if [ -z "$(ls -A 'logs' 2>/dev/null)" ]; then
    echo "folder logs not exist..."
    mkdir -p /app/logs
else
    echo "logs exist, skipping log folder creation..."
fi

if [ -z "$(ls -A 'mongo-data' 2>/dev/null)" ]; then
    echo "folder mongo-data not exist..."
    mkdir -p /app/mongo-data
else
    echo "mongo-data exist, skipping mongo-data folder creation..."
fi

exec "$@"