FROM node:20-alpine

WORKDIR /app

# Cài đặt công cụ build cần thiết
RUN apk add --no-cache python3 make g++ git

# Tải code trực tiếp từ GitHub để đảm bảo có đầy đủ file thực thi
RUN git clone https://github.com/vual/OpenClaw.git .

# Cài đặt các thư viện phụ thuộc
RUN npm install

# Phơi port
EXPOSE 3000

# Khởi chạy bằng lệnh node trực tiếp vào file chính của OpenClaw
CMD ["node", "index.js", "--host", "0.0.0.0", "--port", "3000"]
