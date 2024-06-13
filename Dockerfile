FROM node:18-alpine as build-stage

ARG SHORT_SHA_COMMIT
ARG ENVIRONMENT

RUN mkdir -p /data/app

WORKDIR /data/app
COPY . /data/app

ENV NG_APP_VERSION=$SHORT_SHA_COMMIT

RUN npm install && npm cache clean --force
RUN nnode scripts/encryptFeatureFlags.mjs  $ENVIRONMENT
RUN npm run build --aot --output-hashing=all

FROM nginx:1.15

COPY --from=build-stage /data/app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /data/app/dist/frontend /var/www/tmp
COPY --from=build-stage /data/app/dist/frontend/assets/ngsw-worker.js /var/www/tmp/
