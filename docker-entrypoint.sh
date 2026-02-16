#!/bin/sh
set -e
cd /var/www/html

# Ensure storage symlink exists
php -r "file_exists('public/storage') || symlink('storage/app/public','public/storage');"

# Generate app key only if missing and .env exists
if [ -z "$APP_KEY" ] && [ -f ".env" ]; then
  php artisan key:generate || true
fi

# Optimize caches
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true
php artisan event:cache || true
php artisan optimize || true

# Run migrations (safe if DB not yet ready; Render can restart)
php artisan migrate --force || true

exec "$@"
