FROM python:3.12-alpine
WORKDIR /usr/src/gmod-logs-server

RUN apk add build-base && \
    apk add python3-dev && \
    apk add --no-cache supervisor && \
    apk add --no-cache bash

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
    chmod 664 /usr/src/gmod-logs-server/gmodlogs/db.sqlite3 && \
    chown root:root -R /usr/src/gmod-logs-server

COPY .docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
USER root
EXPOSE 49263
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]