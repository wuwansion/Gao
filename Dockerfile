FROM node:20-alpine

WORKDIR /app

RUN npm install -g openclaw

EXPOSE 3000

CMD ["openclaw", "start", "--host", "0.0.0.0", "--port", "3000"]
