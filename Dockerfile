FROM node:14-alpine as build-stage
RUN mkdir -p /data/app
WORKDIR /data/app
COPY . /data/app
RUN npm install && npm cache clean --force
RUN npm run build --aot --output-hashing=all
FROM nginx:1.15
COPY --from=build-stage /data/app/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /data/app/dist/frontend /var/www/tmp
COPY --from=build-stage /data/app/dist/frontend/assets/ngsw-worker.js /var/www/tmp/
