FROM node:20-alpine

# Cài đặt git để tải code
RUN apk add --no-cache git

WORKDIR /app

# Tải code trực tiếp từ repo chính thức
RUN git clone https://github.com/vual/OpenClaw.git .

# Cài đặt các thư viện cần thiết
RUN npm install

# Phơi port 3000
EXPOSE 3000

# Lệnh khởi chạy chuẩn cho mã nguồn OpenClaw
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "3000"]
