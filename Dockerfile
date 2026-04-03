FROM node:20-alpine

WORKDIR /app

# Cài đặt các công cụ cần thiết
RUN apk add --no-cache python3 make g++ git

# Ép npm dùng HTTPS thay vì SSH để không bị hỏi mật khẩu hay chìa khóa
RUN git config --global url."https://github.com/".insteadOf ssh://git@github.com/

# Cài đặt openclaw
RUN npm install -g https://github.com/vual/OpenClaw.git

# Phơi port
EXPOSE 3000

# Lệnh khởi chạy
CMD ["openclaw", "start", "--host", "0.0.0.0", "--port", "3000"]
