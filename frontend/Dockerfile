FROM node:24-alpine

WORKDIR /app
ENV CYPRESS_INSTALL_BINARY=0

RUN chown node:node /app
USER node

COPY --chown=node:node package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
