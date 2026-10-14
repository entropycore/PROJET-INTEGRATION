#!/bin/bash

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Credencia — Arrêt de l'architecture"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

docker compose -f docker-compose.mon.yml down
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.sec.yml down
docker compose -f docker-compose.gitlab.yml down 2>/dev/null || true

echo "   Tous les services arrêtés"
echo "  (Le réseau credencia_net est conservé)"