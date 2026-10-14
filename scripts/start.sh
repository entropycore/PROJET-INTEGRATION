#!/bin/bash
# ══════════════════════════════════════════════════════════
# start.sh — Démarrage de toute l'architecture Credencia
#
# Ordre OBLIGATOIRE :
#   1. Réseau partagé    (créé une seule fois)
#   2. Sécurité          (Keycloak doit être prêt avant le backend)
#   3. Application       (backend se connecte à Keycloak au démarrage)
#   4. Monitoring        (Prometheus scrape les services déjà lancés)
#   5. GitLab (optionnel)
#
# Usage :
#   bash start.sh              → sans GitLab
#   bash start.sh --with-gitlab → avec GitLab
# ══════════════════════════════════════════════════════════
set -e

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║   Credencia — Démarrage architecture prod    ║"
echo "╚══════════════════════════════════════════════╝"

# ── 1. Réseau partagé ─────────────────────────────────────
echo ""
echo "▶ [1/5] Réseau Docker partagé credencia_net..."
docker network create credencia_net 2>/dev/null \
  && echo "  ✓ Réseau créé" \
  || echo "  ✓ Réseau déjà existant — ok"

# ── 2. Sécurité ───────────────────────────────────────────
echo ""
echo "▶ [2/5] Stack Sécurité (Keycloak + SonarQube)..."
docker compose -f docker-compose.sec.yml --env-file .env.sec up -d

echo "  ⏳ Attente de 20 secondes pour Keycloak..."
sleep 20
echo "  ✓ Pause de 20s terminée"

# ── 3. Application ────────────────────────────────────────
echo ""
echo "▶ [3/5] Stack Application (DB + Backend + Frontend + Nginx)..."
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
echo "  ✓ Stack app démarrée"

# ── 4. Monitoring ─────────────────────────────────────────
echo ""
echo "▶ [4/5] Stack Monitoring (Prometheus + Grafana)..."
docker compose -f docker-compose.mon.yml --env-file .env.mon up -d
echo "  ✓ Stack monitoring démarrée"

# ── 5. GitLab (optionnel) ─────────────────────────────────
if [ "$1" == "--with-gitlab" ]; then
  echo ""
  echo "▶ [5/5] Stack GitLab (CE + Runner)..."
  docker compose -f docker-compose.gitlab.yml --env-file .env.gitlab up -d
  echo "  ✓ Stack GitLab démarrée"
else
  echo ""
  echo "▶ [5/5] GitLab non démarré  (utiliser --with-gitlab pour l'inclure)"
fi

# ── Résumé ────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║    Architecture opérationnelle             ║"
echo "╠══════════════════════════════════════════════╣"
echo "║  Frontend    →  http://localhost             ║"
echo "║  API         →  http://localhost/api         ║"
echo "║  Keycloak    →  http://localhost:8081        ║"
echo "║  SonarQube   →  http://localhost:9000        ║"
echo "║  Prometheus  →  http://localhost:9090        ║"
echo "║  Grafana     →  http://localhost:3001        ║"
if [ "$1" == "--with-gitlab" ]; then
echo "║  GitLab      →  http://localhost:8929        ║"
fi
echo "╚══════════════════════════════════════════════╝"
echo ""