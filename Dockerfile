# ---------- Node build stage ----------
FROM node:20-alpine AS node-builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
RUN npm run build

# ---------- Composer install stage ----------
FROM composer:2 AS composer-builder
WORKDIR /app
COPY composer.json composer.lock* ./
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
COPY . .
RUN composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# ---------- Final runtime image (Apache + PHP) ----------
FROM php:8.2-apache
WORKDIR /var/www/html

# Enable Apache rewrites and set DocumentRoot to public
RUN a2enmod rewrite \
 && sed -ri -e 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf \
 && sed -ri -e 's!DocumentRoot /var/www/html!DocumentRoot /var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

# Install PHP extensions commonly needed by Laravel
RUN apt-get update && apt-get install -y \
    libpng-dev libjpeg-dev libfreetype6-dev libzip-dev unzip git \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install gd pdo pdo_mysql bcmath zip exif \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy application code and built assets
COPY --from=composer-builder /app /var/www/html
COPY --from=node-builder /app/public/build /var/www/html/public/build

# Permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
 && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Entrypoint will run migrations, caches, and start Apache
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["apache2-foreground"]
