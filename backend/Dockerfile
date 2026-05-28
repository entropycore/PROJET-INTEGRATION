FROM node:24-alpine

WORKDIR /app

RUN mkdir -p /app/uploads && chown -R node:node /app/uploads

COPY --chown=node:node package*.json ./
RUN npm install

COPY --chown=node:node prisma ./prisma
RUN npx prisma generate

COPY --chown=node:node . .

USER node

EXPOSE 3000

CMD ["npm", "start"]
