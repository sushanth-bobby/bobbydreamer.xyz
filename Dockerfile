FROM node:22-slim AS builder

RUN apt-get update \
  && apt-get install -y --no-install-recommends git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package.json package-lock.json .npmrc ./
COPY quartz-content-context/ ./quartz-content-context/
COPY quartz-ia-article-nav/ ./quartz-ia-article-nav/
COPY quartz-ia-articles/ ./quartz-ia-articles/
COPY quartz-ia-header/ ./quartz-ia-header/
COPY quartz-ia-pages/ ./quartz-ia-pages/
COPY quartz-ia-properties/ ./quartz-ia-properties/
RUN npm ci

COPY . .
RUN npm run build

FROM caddy:2.11.4-alpine AS runtime

ENV QUARTZ_ROOT=/srv
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=builder /usr/src/app/public /srv

EXPOSE 8080

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
