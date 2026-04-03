FROM node:20-alpine

WORKDIR /app

# Thêm git vào danh sách cài đặt ở đây
RUN apk add --no-cache python3 make g++ git

# Bây giờ npm sẽ tìm thấy git và cài đặt được
RUN npm install -g https://github.com/vual/OpenClaw.git

# Phơi port
EXPOSE 3000

# Lệnh khởi chạy
CMD ["openclaw", "start", "--host", "0.0.0.0", "--port", "3000"]
