#!/bin/bash
# OWASP ZAP Security Scan
# Hiba Fakir — Sécurité Applicative

BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"
REPORT_DIR="scripts/reports"
DATE=$(date +%Y-%m-%d_%H-%M)
ZAP_IMAGE="ghcr.io/zaproxy/zaproxy:stable"

mkdir -p $REPORT_DIR

echo "Attente du backend..."
until curl -s $BACKEND_URL/api/auth/login \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@test.com","password":"Test123!"}' > /dev/null 2>&1; do
  sleep 2
done
echo "Backend pret."

echo "Scan backend $BACKEND_URL..."
docker run --rm --network host \
  -v $(pwd)/scripts/reports:/zap/wrk \
  $ZAP_IMAGE \
  zap-baseline.py -t $BACKEND_URL \
  -r zap-backend-$DATE.html

echo "Scan frontend $FRONTEND_URL..."
docker run --rm --network host \
  -v $(pwd)/scripts/reports:/zap/wrk \
  $ZAP_IMAGE \
  zap-baseline.py -t $FRONTEND_URL \
  -r zap-frontend-$DATE.html

echo "Scan termine. Rapports dans : $REPORT_DIR"