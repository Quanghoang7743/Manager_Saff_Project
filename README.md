# Huong dan setup va chay du an

## 1. Cài đặt dependency

```bash
composer install
npm install
```

## 2. Setup local

Dung `.env.local` lam cau hinh local.

```bash
cp .env.local .env
php artisan config:clear
```

Các biến quan trọng local:

- `BROADCAST_CONNECTION=reverb`
- `VITE_BROADCAST_DRIVER=reverb`
- `REVERB_HOST=127.0.0.1`
- `REVERB_PORT=8080`
- `REVERB_SCHEME=http`
- `VITE_REVERB_HOST=127.0.0.1`
- `VITE_REVERB_PORT=8080`
- `VITE_REVERB_SCHEME=http`

### Database

Tạo và sửa đúng thông tin cho database trong `.env.local`:

```env
DB_CONNECTION="mysql"
DB_HOST="caboose.proxy.rlwy.net"
DB_PORT="58900"
DB_DATABASE="railway"
DB_USERNAME="root"
DB_PASSWORD="ReyVUHPktoEvRLQBHWjCFhTPYAMRDNvH"
```


## 3. Chay local

Chạy lệnh này 

```bash
npm run build
```

Mở 2 terminal và chạy:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

```bash
php artisan reverb:start --host=0.0.0.0 --port=8080
```



## 5. Cách verify realtime

Sau khi chạy xong, kiểm tra:

1. `/api/me` tra ve `200`
2. Mở F12 -> Network kiểm tra:
   - tab socket đã có chưa
   - `POST /api/broadcasting/auth`

## 6. Lỗi thường gặp

### Thiếu APP_KEY

Lỗi:

```text
No application encryption key has been specified.
```

Cách sửa

```bash
cp .env.local .env
php artisan key:generate
php artisan config:clear
```