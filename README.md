# Secure Employee Management System - Frontend 

Chào mừng đến với kho lưu trữ mã nguồn Frontend của **Hệ thống Quản lý Nhân Viên**!

Trong môi trường doanh nghiệp hiện đại, việc quản trị dữ liệu nhân viên không chỉ dừng lại ở tính tiện dụng mà còn đặt ra yêu cầu khắt khe về bảo vệ thông tin nhạy cảm. Dự án này được phát triển nhằm giải quyết trọn vẹn cả hai yếu tố đó: cung cấp một công cụ quản lý nhân viên mạnh mẽ, đồng thời đặt tiêu chuẩn bảo mật lên hàng đầu.

Phần Frontend của hệ thống đóng vai trò là "gương mặt đại diện", được thiết kế theo phong cách Enterprise với giao diện hiện đại, tối giản và thân thiện. Không chỉ tập trung vào trải nghiệm người dùng (UI/UX), kiến trúc Frontend còn được liên kết chặt chẽ với các lớp bảo mật từ tầng Database và Backend. 

Mọi thành phần trên hệ thống — từ thanh điều hướng (Sidebar), các nút thao tác (Thêm/Sửa/Xóa), cho đến khả năng hiển thị các trường dữ liệu nhạy cảm như mức lương — đều được thiết kế để tự động thích ứng dựa trên cơ chế **Kiểm soát truy cập dựa trên vai trò (RBAC - Client-side Enforcement)**. Qua đó, hệ thống đảm bảo nguyên tắc *Least Privilege* (Đặc quyền tối thiểu), người dùng chỉ nhìn thấy và thao tác được với những dữ liệu mà họ được phép.

Sản phẩm này là minh chứng cho việc kết hợp hài hòa giữa một giao diện Web linh hoạt (React & Tailwind CSS) và các tiêu chuẩn bảo mật cơ sở dữ liệu chuyên sâu, mang đến một nền tảng quản lý an toàn, minh bạch và hiệu quả.

---

## Tính năng nổi bật

* **Giao diện Dashboard hiện đại:** Thiết kế theo phong cách Enterprise với bộ icon Lucide và hiệu ứng chuyển cảnh mượt mà.
* **Phân quyền hiển thị (Client-side RBAC):** Tự động điều chỉnh Sidebar và các chức năng dựa trên vai trò người dùng (`EMP`, `MAN`, `FIN`, `HR`, `HRM`).
* **Quản lý hồ sơ cá nhân:** Hiển thị thông tin chi tiết, quản lý trực tiếp và tích hợp tính năng Đổi mật khẩu an toàn.
* **Module Quản lý Nhân sự (HR):** Tìm kiếm thông minh, lọc nhân sự theo phòng ban, quản lý trạng thái tài khoản và hồ sơ nhân viên.
* **Báo cáo & Lương (Finance):** Giao diện bảng biểu chuyên sâu cho bộ phận tài chính, hỗ trợ ẩn/hiện thông tin nhạy cảm.
* **Thông báo & Phản hồi:** Hệ thống Toast notification và Modal xác thực chuyên nghiệp, hạn chế sai sót khi thao tác dữ liệu.

## 🛠 Công nghệ sử dụng

* **Framework:** React (Vite)
* **Ngôn ngữ:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **HTTP Client:** Axios (Cấu hình Interceptors cho JWT)
* **State Management:** React Context API (AuthContext)
* **Animations:** Framer Motion / Tailwind Animate

## 📋 Cấu trúc thư mục

```text
src/
├── assets/             # Hình ảnh, font và tài nguyên tĩnh
├── components/         # Các component dùng chung (Modal, Button, Layout...)
├── context/            # Quản lý trạng thái toàn cục (AuthContext.tsx)
├── pages/              # Các màn hình chính (Dashboard, Profile, HRManagement...)
├── services/           # Cấu hình API và Axios instance
├── types/              # Định nghĩa TypeScript Interfaces
├── utils/              # Các hàm helper (Format date, format money...)
└── App.tsx             # Cấu hình Routing và Provider chính
```

## 🚀 Hướng dẫn cài đặt
1. Cài đặt môi trường
Đảm bảo máy tính của bạn đã cài đặt Node.js (Phiên bản 16 trở lên).

2. Cấu hình Frontend
Tạo file .env tại thư mục gốc của dự án:

Đoạn mã
VITE_API_URL=http://localhost:5000/api

3. Khởi chạy ứng dụng
Bash
# Cài đặt các thư viện cần thiết
npm install

# Chạy ứng dụng ở chế độ phát triển
npm run dev

# Xây dựng bản build cho sản phẩm thực tế
npm run build

---

👤 Thông tin thực hiện
Nhóm: 5

Thành viên:

Ngô Ý Nhi

Hồ Đăng Khoa

Nguyễn Thanh Tiền

Đơn vị: Khoa Công nghệ thông tin - Đại học Sư phạm TP.HCM (HCMUE)

---

Dự án phục vụ mục đích đồ án học phần: Bảo mật cơ sở dữ liệu.
