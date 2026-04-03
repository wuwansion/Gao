FROM node:20-alpine

WORKDIR /app

# Cài đặt các công cụ để giải nén và build
RUN apk add --no-cache python3 make g++ curl

# Tải bản nén của OpenClaw về, giải nén và cài đặt trực tiếp
RUN curl -L https://github.com/vual/OpenClaw/archive/refs/heads/main.tar.gz | tar -xz --strip-components=1 && \
    npm install && \
    npm link

# Phơi port cho Render
EXPOSE 3000

# Lệnh khởi chạy
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--port", "3000"]
