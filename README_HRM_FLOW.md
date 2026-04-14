# HRM + Chat Workflow

## 1) Muc tieu

Du an duoc mo rong tu chat app thanh he thong quan ly nhan su noi bo, gom:

- Quan ly nhan su (employee profile, phong ban, chuc vu)
- Quan ly task (tao task, giao task, cap nhat trang thai, comment)
- Cham cong ca lam (phan ca, check-in/check-out, bao cao tong hop)
- Giu nguyen chat realtime hien co (direct/group, reaction, typing)

## 2) Role matrix da chot

- `super_admin`
  - Toan quyen he thong
  - Quan ly role, nhan su, task, attendance, bao cao
- `hr_admin`
  - Quan ly to chuc va nhan su
  - Quan ly shifts, phan ca, duyet dieu chinh cong
- `manager`
  - Quan ly nhan su trong team (direct reports)
  - Tao/giao task cho team
  - Xem attendance log cua team
- `employee`
  - Quan ly profile ca nhan
  - Tao task cho minh / cap nhat task duoc giao
  - Check-in/check-out ca duoc phan

## 3) Workflow cham cong (nhieu ca/ngay)

Mo hinh da chot: **nhieu ca trong 1 ngay**.

1. HR tao `shift template` (gio bat dau/ket thuc, grace, break, qua dem)
2. HR/Manager phan ca theo `work_date` cho nhan su (`shift_assignments`)
3. Nhan su check-in voi `shift_assignment_id`
   - Co gioi han check-in som theo `early_checkin_minutes`
   - Neu tre hon gio vao + grace => tinh `late_minutes`
4. Nhan su check-out
   - Tinh `work_minutes`
   - Tinh `early_leave_minutes` neu ve som
   - Tinh `overtime_minutes` neu ve tre
5. Nhan su gui request dieu chinh cong
6. HR duyet (`approved/rejected`) request dieu chinh

## 4) Schema moi da them

- User mo rong:
  - `role`, `employee_code`, `department_id`, `position_id`, `manager_user_id`,
  - `employment_status`, `work_type`, `hired_at`
- Bang to chuc:
  - `departments`, `positions`
- Bang task:
  - `tasks`, `task_comments`
- Bang attendance:
  - `shifts`, `shift_assignments`, `attendance_logs`, `attendance_adjustment_requests`

## 5) API moi da them

Tat ca API duoi day nam trong `auth:sanctum`:

### Employee / Org

- `GET /api/employees`
- `POST /api/employees`
- `GET /api/employees/{id}`
- `PUT /api/employees/{id}`
- `GET /api/departments`
- `POST /api/departments`
- `PUT /api/departments/{id}`
- `DELETE /api/departments/{id}`
- `GET /api/positions`
- `POST /api/positions`
- `PUT /api/positions/{id}`
- `DELETE /api/positions/{id}`

### Task

- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/{id}`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `GET /api/tasks/{id}/comments`
- `POST /api/tasks/{id}/comments`

### Attendance

- `GET /api/attendance/shifts`
- `POST /api/attendance/shifts`
- `PUT /api/attendance/shifts/{id}`
- `DELETE /api/attendance/shifts/{id}`
- `POST /api/attendance/assignments`
- `GET /api/attendance/assignments/me`
- `POST /api/attendance/check-in`
- `POST /api/attendance/check-out`
- `GET /api/attendance/logs/me`
- `GET /api/attendance/logs/team`
- `GET /api/attendance/reports`
- `POST /api/attendance/adjustments`
- `PATCH /api/attendance/adjustments/{id}/review`

## 6) Luong hoat dong tong quan

1. Dang nhap -> nhan token Sanctum
2. HR setup phong ban/chuc vu/ca lam
3. HR/Manager tao nhan su va gan quan he manager
4. HR/Manager phan ca cho nhan su
5. Nhan su check-in/check-out theo assignment
6. Nhan su/Manager thao tac task theo quyen
7. Chat van hoat dong song song cho trao doi cong viec

## 7) Trien khai local

1. Chay migration:

```bash
php artisan migrate
```

2. Tao tai khoan role cao (vi du qua DB/seeder) de quan tri:

- `super_admin` hoac `hr_admin`

3. Chay backend/frontend nhu huong dan cu trong README setup.

## 8) Tinh trang hien tai

- Da xong backend foundation cho HRM + Task + Attendance.
- Chat module duoc giu nguyen.
- Frontend cho module moi chua duoc mo rong day du (se tiep tuc theo backlog FE).
