FROM node:20-alpine

WORKDIR /app

# Cài đặt openclaw global
RUN npm install -g openclaw

# Phơi port cho Render
EXPOSE 3000

# Dùng lệnh khởi chạy với đường dẫn tuyệt đối để chắc chắn không bị lỗi command not found
CMD ["/usr/local/bin/openclaw", "start", "--host", "0.0.0.0", "--port", "3000"]
