#!/bin/bash

# Load test credentials from .env.test (not tracked in git)
if [ -f .env.test ]; then
  set -a; source .env.test; set +a
fi

TOKEN="${TEST_JWT:-your-test-jwt-token-here}"
SERVICE_ID="${TEST_SERVICE_ID:-2}"
DATE="${TEST_DATE:-2026-04-28}"

echo "🔍 Probando getAvailability..."
echo "Token: $TOKEN"
echo "Service ID: $SERVICE_ID"
echo "Date: $DATE"
echo ""

curl -X GET "http://localhost:3000/api/bookings/availability?service_id=$SERVICE_ID&date=$DATE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
