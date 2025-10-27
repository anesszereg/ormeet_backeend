#!/bin/sh
# Health check script for Docker container

# Check if the application is responding
if wget --quiet --tries=1 --spider http://localhost:3000; then
    echo "Health check passed"
    exit 0
else
    echo "Health check failed"
    exit 1
fi
