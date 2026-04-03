FROM node:20-alpine

WORKDIR /app

COPY . .

RUN npm init -y
RUN npm install express @google/generative-ai

EXPOSE 3000

CMD ["node", "server.js"]
