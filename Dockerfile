FROM node:20-alpine

WORKDIR /app

# Cài đặt openclaw global
RUN npm install -g openclaw

# Biến môi trường để Node biết tìm file thực thi ở đâu
ENV PATH /usr/local/lib/node_modules/openclaw/bin:$PATH

EXPOSE 3000

# Lệnh chạy chính xác cho gói npm openclaw
CMD ["openclaw", "start", "--host", "0.0.0.0", "--port", "3000"]
