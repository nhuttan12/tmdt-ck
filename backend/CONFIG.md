# 📄 Hướng dẫn cấu hình `config.env.yaml`

File `config.env.yaml` chứa các thông số cấu hình cho hệ thống, bao gồm thông tin HTTP server và kết nối đến cơ sở dữ liệu MySQL.

## 🗂 Cấu trúc file

```yaml
http:
  host: 'localhost'     # Địa chỉ host mà server sẽ lắng nghe
  port: 8080            # Cổng server chạy ứng dụng NestJS

db:
  mysql:
    host: 'localhost'   # Host của MySQL
    port: 3306          # Port MySQL
    database: 'tmdt-ck' # Tên database sử dụng
    dialect: 'mysql'    # Kiểu cơ sở dữ liệu (ví dụ: mysql, postgres, v.v.)
    username: 'root'    # Tên đăng nhập MySQL
    password: ''        # Mật khẩu MySQL nếu chạy docker theo bước ở dưới thì đổi password thành '123456'
```

Nếu như không sử dụng xampp hoặc laragon, ... thì có thể xử dụng docker để chạy môi trường database

## 🗂 Cấu trúc file docker-compose.yaml hoặc là docker-compose.yml

```yaml
services:
  db: 
    image: mysql:8.0.32                      # Sử dụng image MySQL 8.0.32 từ Docker Hub
    container_name: tmdt_ck                  # Đặt tên container là 'tmdt_ck'
    environment:
      MYSQL_ROOT_PASSWORD: 123456            # Mật khẩu cho user root của MySQL
    ports:
      - '3306:3306'                          # Mở cổng 3306 để máy host có thể truy cập MySQL
    volumes:
      - mysql_data:/var/lib/postgresql/data  # Lưu trữ data vào volume để tránh mất dữ liệu khi container bị xóa

volumes:
  mysql_data:                                # Khai báo volume tên là mysql_data
```

Sau đó mở terminal với đuôi đường dẫn là ..\tmdt-ck\backend> và gõ câu lệnh sau, để thực hiện thiết lặp môi trường cho database

```bash
docker compose  up -d
```
