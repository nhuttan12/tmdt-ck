# 📄 Hướng dẫn cấu hình `config.env.yaml`

File `config.env.yaml` chứa các thông số cấu hình cho hệ thống, bao gồm thông tin HTTP server và kết nối đến cơ sở dữ liệu MySQL.

## 🗂 Cấu trúc file

```yaml
http:
  host: 'localhost'
  port: 8080
  jwtKey: 'sercretkey'
  expireTime: '60m'
  cloudinary:
    name: 'dt3yrf9sx'
    api_key: '178161493966793'
    api_secret: 'VfqWtBGWC21t9ND0isu-fp1JIoE'
  mail:
    app_password: 'dnop wxyz dtsv mptr'
    email: 'phamnhuttan.9a6.2017@gmail.com'
  paypal:
    client_id: 'AUUsF0rIyWWPRILA7ua2aNMSrYAmk0UV59mX9dyDB9di0O8cX6TETBloi3AapXmnjIu5sSx5etbfSDZ4'
    secret: 'EBvInjjfqSxyxVyYh8umTB28AnNgYJ9-P3YyxHc0x2uiY83Lb9yu_9f5Am1tXRILum0oXQyKG6gZUrA7'
    environtment: 'sandbox'
  stripe: 
    public_key: 'pk_test_51RVrgGEPzbkLi7YWoGqcztUn5nIc0nkf01SOaJl1rr1O7PI0kL4ADmkFsz8lHdZSqRDkxucCODxqgZ9GKdJ0eRI8009RhisaVg'
    secret_key: 'sk_test_51RVrgGEPzbkLi7YW3uDEwUvLLNxmYmG7epIOwZxcpbSPW9AhYt6H0gRTPrFYbtQaQc5xj5zRXeu79EyTphUa6zgv006psJyLch'

db:
  mysql:
    host: 'localhost'
    port: 3306
    database: 'tmdt-ck'
    dialect: 'mysql'
    username: 'root'
    password: '123456'

domain:
  client_1: 
    host: 'http://localhost'
    port: 3000
    reset_password: 'reset-password'
```

Nếu như không sử dụng xampp hoặc laragon, ... thì có thể xử dụng docker để chạy môi trường database

## 🗂 Cấu trúc file docker-compose.yaml hoặc là docker-compose.yml

```yaml
services:
  db:
    image: mysql:8.0.32 # Sử dụng image MySQL 8.0.32 từ Docker Hub
    container_name: tmdt_ck # Đặt tên container là 'tmdt_ck'
    environment:
      MYSQL_ROOT_PASSWORD: 123456 # Mật khẩu cho user root của MySQL
    ports:
      - '3306:3306' # Mở cổng 3306 để máy host có thể truy cập MySQL
    volumes:
      - mysql_data:/var/lib/postgresql/data # Lưu trữ data vào volume để tránh mất dữ liệu khi container bị xóa

volumes:
  mysql_data: # Khai báo volume tên là mysql_data
```

Sau đó mở terminal với đuôi đường dẫn là ..\tmdt-ck\backend> và gõ câu lệnh sau, để thực hiện thiết lặp môi trường cho database

```bash
docker compose  up -d
```
