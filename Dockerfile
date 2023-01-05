FROM node:16.18.1
COPY ./ /app
WORKDIR /app
RUN npm config set registry https://registry.npmmirror.com/ \
    && npm install \
    && npm run build

FROM nginx
RUN mkdir -p /app/static/media
COPY --from=0 /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
WORKDIR /app

ENTRYPOINT echo "Nginx service has been deployed." && nginx -g "daemon off;"
