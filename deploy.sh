#!/usr/bin/env bash
set -euo pipefail

# Деплой mypersonalpage.ru по FTP
# Использование: ./deploy.sh [--dry-run]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/.env"
DRY_RUN=false

FILES=(
  "index.html"
  "blog.html"
  "guestbook.html"
  "style.css"
  "common.js"
  "script.js"
  "blog.js"
  "guestbook.js"
  "blog.php"
  "guestbook.php"
  "counter.php"
  "lib/db.php"
  "lib/blog-post.php"
  "db_config.php"
  ".htaccess"
)

for arg in "$@"; do
  case "$arg" in
    --dry-run)
      DRY_RUN=true
      ;;
    -h|--help)
      echo "Использование: ./deploy.sh [--dry-run]"
      echo ""
      echo "  --dry-run   Показать, что будет загружено, без отправки на сервер"
      exit 0
      ;;
    *)
      echo "Неизвестный аргумент: $arg" >&2
      exit 1
      ;;
  esac
done

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Ошибка: файл .env не найден." >&2
  echo "Скопируйте .env.example в .env и заполните FTP-данные:" >&2
  echo "  cp .env.example .env" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

: "${FTP_HOST:?Укажите FTP_HOST в .env}"
: "${FTP_USER:?Укажите FTP_USER в .env}"
: "${FTP_PASS:?Укажите FTP_PASS в .env}"
FTP_PORT="${FTP_PORT:-21}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/}"
FTP_USE_SSL="${FTP_USE_SSL:-false}"

DEPLOY_FILES=("${FILES[@]}")

if [[ -d "${SCRIPT_DIR}/blog_pages" ]]; then
  while IFS= read -r file; do
    DEPLOY_FILES+=("$file")
  done < <(find "${SCRIPT_DIR}/blog_pages" -type f ! -path '*/_template/*' | sed "s|^${SCRIPT_DIR}/||" | sort)
fi

for file in "${DEPLOY_FILES[@]}"; do
  if [[ ! -f "${SCRIPT_DIR}/${file}" ]]; then
    if [[ "$file" == "db_config.php" ]]; then
      echo "Предупреждение: db_config.php не найден — пропускаю." >&2
      echo "  Создайте: cp db_config.example.php db_config.php" >&2
      continue
    fi
    echo "Ошибка: файл ${file} не найден в проекте." >&2
    exit 1
  fi
done

FINAL_DEPLOY_FILES=()
for file in "${DEPLOY_FILES[@]}"; do
  if [[ "$file" == "db_config.php" && ! -f "${SCRIPT_DIR}/db_config.php" ]]; then
    continue
  fi
  FINAL_DEPLOY_FILES+=("$file")
done
DEPLOY_FILES=("${FINAL_DEPLOY_FILES[@]}")

remote_dir="${FTP_REMOTE_DIR%/}"

echo "=== Деплой mypersonalpage.ru ==="
echo "Сервер:   ${FTP_HOST}:${FTP_PORT}"
echo "Пользователь: ${FTP_USER}"
echo "Каталог:  ${remote_dir}/"
echo "Файлы:"
for file in "${DEPLOY_FILES[@]}"; do
  echo "  - ${file}"
done
echo ""

if $DRY_RUN; then
  echo "[dry-run] Загрузка не выполнялась."
  exit 0
fi

if command -v lftp >/dev/null 2>&1; then
  echo "Используется lftp..."

  ssl_setting="set ftp:ssl-allow no;"
  if [[ "${FTP_USE_SSL}" == "true" ]]; then
    ssl_setting="set ftp:ssl-allow yes; set ftp:ssl-force yes; set ssl:verify-certificate no;"
  fi

  lftp -u "${FTP_USER}","${FTP_PASS}" -p "${FTP_PORT}" "${FTP_HOST}" <<EOF
${ssl_setting}
set ftp:passive-mode true
set net:timeout 30
set net:max-retries 3
cd ${remote_dir}
$(for file in "${DEPLOY_FILES[@]}"; do
  remote_path="${file}"
  remote_subdir="$(dirname "$remote_path")"
  if [[ "$remote_subdir" != "." ]]; then
    echo "mkdir -p ${remote_dir}/${remote_subdir}"
  fi
  echo "put -O ${remote_dir}/${remote_subdir} ${SCRIPT_DIR}/${file} -o $(basename "$file")"
done)
bye
EOF

elif command -v curl >/dev/null 2>&1; then
  echo "lftp не найден, используется curl..."
  echo "Для удобного деплоя рекомендуется: brew install lftp"
  echo ""

  for file in "${DEPLOY_FILES[@]}"; do
    remote_subdir="$(dirname "$file")"

    if [[ "$remote_subdir" != "." ]]; then
      target_dir="ftp://${FTP_HOST}:${FTP_PORT}${remote_dir}/${remote_subdir}/"
      echo "Создание каталога ${remote_subdir}/ (если нужно)"
      curl --ftp-pasv --user "${FTP_USER}:${FTP_PASS}" "${target_dir}" -Q "MKD ${remote_dir}/${remote_subdir}" 2>/dev/null || true
    fi

    target="ftp://${FTP_HOST}:${FTP_PORT}${remote_dir}/${file}"
    echo "Загрузка ${file} -> ${target}"

    if [[ "${FTP_USE_SSL}" == "true" ]]; then
      curl --ftp-ssl --ftp-pasv --ftp-create-dirs --insecure \
        --user "${FTP_USER}:${FTP_PASS}" \
        --upload-file "${SCRIPT_DIR}/${file}" \
        "${target}"
    else
      curl --ftp-pasv --ftp-create-dirs \
        --user "${FTP_USER}:${FTP_PASS}" \
        --upload-file "${SCRIPT_DIR}/${file}" \
        "${target}"
    fi
  done
else
  echo "Ошибка: не найден ни lftp, ни curl." >&2
  echo "Установите lftp: brew install lftp" >&2
  exit 1
fi

echo ""
echo "Готово! Сайт загружен на ${FTP_HOST}${remote_dir}/"
