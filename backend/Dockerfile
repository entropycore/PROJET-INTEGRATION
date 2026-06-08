FROM node:24-alpine

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm install

COPY --chown=node:node . .
RUN npx prisma generate

USER node

EXPOSE 3000

CMD ["npm", "start"]
