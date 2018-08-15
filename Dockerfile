FROM node:alpine

COPY app/ /app
WORKDIR /app
RUN rm -rf node_modules && npm i

ENTRYPOINT ["/app/run.sh"]
