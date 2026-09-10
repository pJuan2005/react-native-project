# Homestay API

Backend API cho ứng dụng đặt phòng Homestay.

## Yêu cầu

- Node.js 18+
- MariaDB (XAMPP)

## Cài đặt

```bash
npm install
```

## Cấu hình

Chỉnh sửa file `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=homestay_db
PORT=3000
```

## Seed Data

Import dữ liệu mẫu vào MariaDB:

```bash
mysql -u root homestay_db < seed.sql
```

Hoặc mở phpMyAdmin → Import → chọn file `seed.sql`.

## Chạy Server

```bash
npm run dev
```

Server chạy tại: `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /api/homestays | Lấy danh sách homestay |
| GET | /api/health | Kiểm tra server |

## Test API

```
GET http://localhost:3000/api/homestays
```
