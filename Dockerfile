FROM node:20-alpine

WORKDIR /app

# Cài đặt công cụ build cần thiết
RUN apk add --no-cache python3 make g++

# Cài đặt openclaw trực tiếp từ NPM (không dùng git clone để tránh hỏi mật khẩu)
RUN npm install openclaw

# Phơi port
EXPOSE 3000

# Khởi chạy bằng cách trỏ thẳng vào file khởi động của openclaw
# Cách này giúp Render tìm thấy ứng dụng ngay lập tức
CMD ["./node_modules/.bin/openclaw", "start", "--host", "0.0.0.0", "--port", "3000"]
