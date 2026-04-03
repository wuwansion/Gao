FROM node:20-alpine

# Không cần cài gì cả, để npx tự tải khi chạy
WORKDIR /app

# Phơi port 3000 cho Render
EXPOSE 3000

# Dùng npx để tải và chạy openclaw ngay lập tức
# Lệnh này sẽ tự tìm đúng file thực thi trong hệ thống
CMD ["npx", "-y", "openclaw", "start", "--host", "0.0.0.0", "--port", "3000"]
