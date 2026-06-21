# --- builder: compile C-extensions and wheels ---
FROM python:3.12-alpine AS builder
WORKDIR /build

RUN apk add --no-cache \
    build-base \
    gcc \
    musl-dev \
    python3-dev \
    mariadb-dev \
    libffi-dev \
    openssl-dev \
    pkgconf

COPY .docker/requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt

# --- app: runtime only, no compiler toolchain ---
FROM python:3.12-alpine
WORKDIR /usr/src/gmod-logs-server

RUN apk add --no-cache \
    mariadb-connector-c \
    bash \
    nginx \
    supervisor \
    redis

COPY --from=builder /wheels /wheels
COPY .docker/requirements.txt .
RUN pip install --no-cache-dir --no-index --find-links /wheels -r requirements.txt && \
    rm -rf /wheels

COPY gmodlogs /usr/src/gmod-logs-server/gmodlogs
COPY .docker/.env.prod /usr/src/gmod-logs-server/gmodlogs/.env

RUN mkdir -p /usr/src/gmod-logs-server/gmodlogs/media && \
    chmod 777 -R /usr/src/gmod-logs-server/gmodlogs/media && \
    chmod 775 -R /usr/src/gmod-logs-server && \
    chown -R root:root /usr/src/gmod-logs-server

COPY .docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
USER root
EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]