#!/bin/bash
# Double-click (or run "./start.sh") to start the dashboard.
# Requires Java 17+ installed. Keep this script in the same folder as the jar file.

cd "$(dirname "$0")"

JAR_FILE=$(ls business-dashboard-*.jar 2>/dev/null | head -n 1)

if [ -z "$JAR_FILE" ]; then
  echo "Could not find business-dashboard-*.jar in this folder."
  echo "Place this script next to the jar file and try again."
  read -p "Press Enter to exit..."
  exit 1
fi

echo "Starting dashboard..."
echo "Dashboard : http://localhost:8080"
echo "Admin     : http://localhost:8080/admin"
echo "Press Ctrl+C to stop the server."
echo

java -jar "$JAR_FILE"
