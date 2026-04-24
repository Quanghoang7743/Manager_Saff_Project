# HRM COMPANY

Nền tảng quản lý nhân sự được xây dựng trên Laravel + React.

---
## Tổng quan 

### Yêu cầu môi trường 

- PHP >= 8.2 (khuyến nghị dùng version tương thích với dự án hiện tại)
- Composer
- Node.js >= 18 + npm
- MySQL/MariaDB
- Extension PHP cơ bản: `mbstring`, `openssl`, `pdo`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`

---

### Cấu trúc thư mục 

```text
messapp/
├── app/
│   ├── Events/                          # Event backend (broadcast/realtime)
│   ├── Http/
│   │   ├── Controllers/Api/             # API controllers hiện có (Auth, Friend, Message, User...)
│   │   ├── Middleware/                  # Middleware xử lý request
│   │   ├── Requests/                    # Form Request validate input
│   │   └── Resources/                   # API Resource transform dữ liệu trả về
│   ├── Models/                          # Eloquent models
│   ├── Providers/                       # Service providers Laravel
│   ├── Services/                        # Service/business logic
│   ├── Support/                         # Helper/support
│   └── Traits/                          # Traits dùng chung
│
├── bootstrap/                           # Bootstrap framework Laravel
├── config/                              # Cấu hình app (db, auth, sanctum, broadcasting...)
├── database/
│   ├── migrations/                      # Migration schema DB
│   ├── seeders/                         # Seed dữ liệu
│   ├── factories/                       # Factory dữ liệu test/dev
│   └── database.sqlite                  # SQLite local (nếu dùng)
│
├── public/
│   ├── build/                           # Asset frontend sau khi build Vite
│   ├── icons/                           # Static assets/icons
│   └── index.php                        # Entry public của Laravel
│
├── resources/
│   ├── css/                             # CSS nguồn
│   ├── js/
│   │   ├── api/                         # API clients frontend
│   │   ├── context/                     # React context (AuthContext...)
│   │   ├── realtime/                    # Echo/realtime client logic
│   │   ├── utils/                       # Utility JS
│   │   └── app.js                       # Entry React/Vite
│   └── views/
│       ├── Main.jsx                     # App shell React theo path
│       ├── main.blade.php               # Blade host mount React
│       ├── dashboard/                   # UI dashboard
│       ├── attendance/                  # UI attendance
│       ├── employees/                   # UI employee directory
│       ├── task/
│       │   ├── index.jsx                # Task board
│       │   └── components/dialog-task/
│       │       └── newTask.jsx          # Form tạo task mới
│       ├── message/                     # UI chat
│       ├── components/                  # Component dùng chung
│       └── account/                     # Login/signup/setting
│
├── routes/
│   ├── api.php                          # Định nghĩa REST API
│   ├── web.php                          # Route web (/, /dashboard, /tasks, /tasks/new...)
│   ├── channels.php                     # Channel auth cho broadcast
│   └── console.php                      # Route command artisan
│
├── storage/                             # Log, cache, runtime files
├── tests/
│   └── Feature/                         # Test tích hợp/feature
│
├── vendor/                              # Dependency PHP (Composer)
├── node_modules/                        # Dependency JS (npm)
├── artisan                              # CLI Laravel
├── composer.json                        # Khai báo package PHP
├── package.json                         # Khai báo package frontend
├── vite.config.js                       # Cấu hình Vite build
├── .env / .env.example                  # Biến môi trường
├── README.md                            # README chính
└── README_CODE                          # Tài liệu luồng code nội bộ
```

### Tech stack

- **Backend**: Laravel (PHP), Sanctum Auth, MySQL
- **Frontend**: React, Vite, MUI + Tailwind utility classes
- **Realtime**: Laravel Echo + Pusher protocol (driver `reverb`/`pusher`)
- **Build tools**: Composer, NPM

---

## Hướng dẫn setup dự án

### 1. Cài đặt dependency

```bash
composer install
npm install
```

### Nếu lỗi phiên bản trong quá trình cài

```bash
composer install --ignore-platform-reqs
```

Lệnh này có tác dụng skip phiên bản hiện tại để có thể chạy được dự án

### 2. Cấu hình môi trường

```bash
cp .env.example .env
php artisan key:generate
```

Cập nhật trong .env:

APP_URL
DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
Cấu hình broadcast (nếu dùng realtime local/reverb/pusher)

### Database

```env
DB_CONNECTION="mysql"
DB_HOST="127.0.0.1"
DB_PORT="3306"
DB_DATABASE="hrm"
DB_USERNAME="root"
DB_PASSWORD=""
```
### Migrate

```bash
php artisan migrate
```

### 3. Chay local

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



### 5. Cách verify realtime

Sau khi chạy xong, kiểm tra:

1. `/api/me` tra ve `200`
2. Mở F12 -> Network kiểm tra:
   - tab socket đã có chưa
   - `POST /api/broadcasting/auth`

### 6. Lỗi thường gặp

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

## Tài khoản & phân quyền (RBAC)

### Các role hệ thống
```text
super_admin
hr_admin
manager
employee
```

### Quyền chính (tóm tắt)

super_admin / hr_admin: quản lý tổ chức, nhân sự, attendance, tasks.
manager: quản lý nhân viên team, tasks, xem logs/report theo phạm vi team.
employee: xem/chỉnh trong phạm vi cá nhân (task của mình, attendance của mình).

### Set role admin (test)

```bash
php artisan tinker
```

```bash
$u = App\Models\User::where('phone_number', '01234567890')->first();
$u->role = 'super_admin';
$u->save();
```
