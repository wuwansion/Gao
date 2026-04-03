FROM node:20-alpine

WORKDIR /app

# Cài đặt công cụ build
RUN apk add --no-cache python3 make g++

# Cài đặt openclaw global (để nó nằm trong /usr/local/bin)
RUN npm install -g openclaw

# Phơi port
EXPOSE 3000

# Dùng npx để nó tự động tìm đường dẫn thực thi chuẩn xác nhất
CMD ["npx", "openclaw", "start", "--host", "0.0.0.0", "--port", "3000"]
