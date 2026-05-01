FROM python:3.12-alpine
WORKDIR /usr/src/gmod-logs-server

RUN apk add --no-cache \
    build-base \
    gcc \
    musl-dev \
    python3-dev \
    mariadb-dev \
    libffi-dev \
    openssl-dev \
    pkgconf \
    bash \
    nginx \
    supervisor

COPY .docker/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt


# Copying project
COPY gmodlogs /usr/src/gmod-logs-server/gmodlogs
COPY .docker/.env.prod /usr/src/gmod-logs-server/gmodlogs/.env
COPY .docker/requirements.txt /usr/src/gmod-logs-server

RUN mkdir -p /usr/src/gmod-logs-server/gmodlogs/media && \
    chmod 777 -R /usr/src/gmod-logs-server/gmodlogs/media && \
    chown root:root -R /usr/src/gmod-logs-server/gmodlogs/media

# Setting chmod
RUN chmod 775 -R /usr/src/gmod-logs-server && \
    chown root:root -R /usr/src/gmod-logs-server

COPY .docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
USER root
EXPOSE 49263
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]