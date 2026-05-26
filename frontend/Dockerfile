FROM node:24-alpine

WORKDIR /app
ENV CYPRESS_INSTALL_BINARY=0

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

RUN chown -R node:node /app

USER node

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
