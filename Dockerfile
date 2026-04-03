FROM node:20-alpine

WORKDIR /app

# Cài đặt công cụ build cần thiết
RUN apk add --no-cache python3 make g++

# Không cài trước nữa, để npx tự xử lý khi chạy
# Phơi port
EXPOSE 3000

# Dùng npx để tải và chạy openclaw trực tiếp
# Lệnh này sẽ tự tìm phiên bản mới nhất và kích hoạt nó
CMD ["npx", "-y", "openclaw", "start", "--host", "0.0.0.0", "--port", "3000"]
