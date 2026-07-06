FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3001
ENV NODE_ENV=production
CMD ["sh", "-c", "node server/seed.js && node server/index.js"]
