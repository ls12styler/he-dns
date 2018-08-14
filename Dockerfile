FROM node:alpine

COPY app/ /app
WORKDIR /app
RUN npm i

CMD ["/app/run.sh"]
