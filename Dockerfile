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
COPY .docker/gmodlogs /etc/nginx/sites-available/
COPY gmodlogs /usr/src/gmod-logs-server/gmodlogs
COPY .docker/.env.prod /usr/src/gmod-logs-server/gmodlogs/.env
COPY .docker/requirements.txt /usr/src/gmod-logs-server

RUN mkdir -p /usr/src/gmod-logs-server/gmodlogs/media && \
    chmod 777 -R /usr/src/gmod-logs-server/gmodlogs/media && \
    chown nginx:nginx -R /usr/src/gmod-logs-server/gmodlogs/media

# Setting chmod
RUN chmod 775 -R /usr/src/gmod-logs-server && \
    chown nginx:nginx -R /usr/src/gmod-logs-server

# Create proxy_params file (missing in Alpine)
RUN echo 'proxy_set_header Host $http_host;' > /etc/nginx/proxy_params && \
    echo 'proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/proxy_params && \
    echo 'proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> /etc/nginx/proxy_params && \
    echo 'proxy_set_header X-Forwarded-Proto $scheme;' >> /etc/nginx/proxy_params && \
    echo 'proxy_set_header X-Forwarded-Host $http_host;' >> /etc/nginx/proxy_params

# Creating site dirs
RUN mkdir -p /etc/nginx/sites-available && \
    mkdir -p /etc/nginx/sites-enabled && \
    sed -i '/http {/a \    include /etc/nginx/sites-enabled/*;' /etc/nginx/nginx.conf

# Enabling site
RUN ln -s /etc/nginx/sites-available/gmodlogs /etc/nginx/sites-enabled/ && \
    rm -f /etc/nginx/sites-enabled/default

COPY .docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
USER root
EXPOSE 49263
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]