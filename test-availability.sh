#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NCwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNzc3MzQyMjQ0LCJleHAiOjE3NzczNDU4NDR9.toPMjjju0D--vBoLcbFjoDatFjMti9X0AkIdyxNYPAE"
SERVICE_ID="2"
DATE="2026-04-28"

echo "🔍 Probando getAvailability..."
echo "Token: $TOKEN"
echo "Service ID: $SERVICE_ID"
echo "Date: $DATE"
echo ""

curl -X GET "http://localhost:3000/api/bookings/availability?service_id=$SERVICE_ID&date=$DATE" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
