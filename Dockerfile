FROM node:20-alpine

WORKDIR /app

# Cài đặt công cụ build
RUN apk add --no-cache python3 make g++

# Cài đặt openclaw cục bộ ngay trong thư mục app
RUN npm install openclaw

# Phơi port
EXPOSE 3000

# Trỏ thẳng vào file thực thi của openclaw trong node_modules
CMD ["./node_modules/.bin/openclaw", "start", "--host", "0.0.0.0", "--port", "3000"]
