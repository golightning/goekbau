# Lokaler Prod-Nachbau (design.md D9): Apache + PHP 8.3 wie auf IONOS Deploy Now.
# Base-Image per Digest gepinnt (Lieferkette, web-security): php:8.3.36-apache, enthält die Korrekturen für
# CVE-2026-109618/-109619 („PHP2Shell“, 21.10.2026).
FROM php@sha256:0d46cb96775228313d3997c155f78227de13bf9972e0c736e653fb23aded79b2

RUN apt-get update \
 && apt-get install -y --no-install-recommends libzip-dev libpng-dev libjpeg62-turbo-dev libwebp-dev \
 && docker-php-ext-configure gd --with-jpeg --with-webp \
 && docker-php-ext-install -j"$(nproc)" gd zip \
 && rm -rf /var/lib/apt/lists/* \
 && a2enmod rewrite headers \
 && sed -ri 's/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf \
 && printf 'ServerTokens Prod\nServerSignature Off\n' > /etc/apache2/conf-enabled/zz-hardening.conf

# mod_php liest keine .user.ini; die dort gesetzten Werte (Produktion: FPM/CGI) hier spiegeln.
COPY php.ini /usr/local/etc/php/conf.d/zz-goekbau.ini

# Privater Speicher außerhalb des Document Roots (Rate-Limit, ALTCHA-Replay, Logs)
RUN mkdir -p /var/www/storage && chown www-data:www-data /var/www/storage && chmod 0700 /var/www/storage
