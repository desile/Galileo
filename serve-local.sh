#!/usr/bin/env bash
# Локальный просмотр сайта и игры Tower Defense без деплоя
# Использование: ./serve-local.sh
# Игра: http://localhost:8765/blog_pages/tower-defense/local-test.html

set -euo pipefail
PORT="${PORT:-8765}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== Локальный сервер mypersonalpage.ru ==="
echo "Корень:  $ROOT"
echo "Главная: http://localhost:$PORT/index.html"
echo "Игра TD: http://localhost:$PORT/blog_pages/tower-defense/local-test.html"
echo ""
echo "Ctrl+C — остановить"
echo ""

cd "$ROOT"
python3 -m http.server "$PORT"
