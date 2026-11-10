#!/usr/bin/env bash
#
# Подъём превью с нуля: проверяет окружение, доустанавливает зависимости,
# собирает и запускает прод-сервер на 0.0.0.0:3000.
#
# Нужен потому, что песочница сохраняет только файлы проекта: `node_modules`
# и `.next` в снимок не попадают. После каждого сброса подъём иначе делается
# руками в четыре шага, и легко забыть `build` — тогда `next start` падает на
# отсутствующем BUILD_ID.
#
# Использование:
#   bash scripts/dev-up.sh          — поднять (сборка только если её нет)
#   bash scripts/dev-up.sh --rebuild — пересобрать перед запуском
#
set -euo pipefail

cd "$(dirname "$0")/.."

PORT=3000

echo "== 1/4 окружение"
node -v
npm -v

echo "== 2/4 зависимости"
if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
  npm ci --no-audit --no-fund
else
  echo "node_modules на месте, установка не нужна"
fi

echo "== 3/4 сборка"
if [ "${1:-}" = "--rebuild" ] || [ ! -f .next/BUILD_ID ]; then
  npm run build
else
  echo ".next на месте, сборка не нужна (--rebuild чтобы пересобрать)"
fi

echo "== 4/4 проверка порта"
if curl -s -o /dev/null --max-time 3 "http://localhost:${PORT}/"; then
  echo "порт ${PORT} уже занят: сначала остановите старый процесс"
  exit 1
fi

echo "запуск: next start -H 0.0.0.0 -p ${PORT}"
exec npm run start
