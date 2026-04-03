FROM node:20-alpine

WORKDIR /app

# Cài đặt các công cụ cần thiết
RUN apk add --no-cache python3 make g++

# Cài đặt openclaw trực tiếp từ link GitHub của tác giả
RUN npm install -g https://github.com/vual/OpenClaw.git

# Phơi port
EXPOSE 3000

# Lệnh khởi chạy chuẩn sau khi cài từ GitHub
CMD ["openclaw", "start", "--host", "0.0.0.0", "--port", "3000"]
