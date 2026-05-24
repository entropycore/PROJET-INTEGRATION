FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --include=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
