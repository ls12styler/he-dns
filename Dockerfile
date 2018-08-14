FROM node:alpine

COPY app/ /app
WORKDIR /app
RUN npm i

ENTRYPOINT ["/app/run.sh"]
