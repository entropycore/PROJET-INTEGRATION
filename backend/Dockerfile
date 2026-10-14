FROM node:24-alpine

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm install

COPY --chown=node:node prisma ./prisma
RUN npx prisma generate

COPY --chown=node:node . .

RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["npm", "start"]
