FROM node:20-alpine

WORKDIR /app

# Cài đặt công cụ build cần thiết
RUN apk add --no-cache python3 make g++

# Cài đặt OpenClaw trực tiếp từ kho NPM (ổn định nhất cho Render)
RUN npm install -g openclaw

# Phơi port
EXPOSE 3000

# Khởi chạy bằng lệnh chuẩn
CMD ["openclaw", "start", "--host", "0.0.0.0", "--port", "3000"]
