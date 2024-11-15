# Use the official lightweight Node.js image.
# https://hub.docker.com/_/node
FROM node:20-slim as build

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install dependencies.
RUN npm install 

# Copy local code to the container image.
COPY . ./

# Build
RUN npx quartz build


####
FROM caddy:2.7-alpine

# Copy the static files from the 'public' directory to /src
COPY ./public /srv 

COPY --from=build /usr/src/app/Caddyfile /etc/caddy/Caddyfile

# Expose port 8080
EXPOSE 8080
