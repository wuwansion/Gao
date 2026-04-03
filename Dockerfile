FROM node:20-alpine

WORKDIR /app

# Cài đặt các công cụ build cơ bản
RUN apk add --no-cache python3 make g++

# Cài đặt OpenClaw trực tiếp từ NPM (nhanh và ổn định nhất)
RUN npm install openclaw

# Phơi port
EXPOSE 3000

# Lệnh khởi chạy dùng trực tiếp file thực thi trong node_modules
CMD ["npx", "openclaw", "start", "--host", "0.0.0.0", "--port", "3000"]
