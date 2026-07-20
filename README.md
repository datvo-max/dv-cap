# 🪪 QL-TCC — Hệ Thống Quản Lý & Cấp Phát Thẻ Căn Cước Địa Phương

[![Version](https://img.shields.io/badge/version-3.7.0-blue.svg)](package.json)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.10-black.svg?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-blue.svg?style=flat&logo=react)](https://react.dev/)
[![Dexie.js](https://img.shields.io/badge/Database-IndexedDB%20(Dexie)-green.svg)](https://dexie.org/)

**`QL-TCC`** là một ứng dụng Web Single-Page (SPA) được thiết kế hiện đại nhằm tối ưu hóa quy trình nhập liệu, phân loại hộp lưu trữ, bàn giao và cấp phát thẻ Căn cước công dân (CCCD) tại địa phương. Hệ thống hoạt động mượt mà, lưu trữ dữ liệu offline trực tiếp dưới trình duyệt của Client (IndexedDB) và tích hợp quét QR trực tiếp qua Camera.

---

## 🚀 Tính năng nổi bật

### 📥 1. Phân hệ Lập danh sách (`intake`)
* **Quét QR nhanh chóng**: Quét qua camera thiết bị (điện thoại/máy tính) hoặc sử dụng máy quét phần cứng chuyên dụng.
* **Tự động phân tách**: Trích xuất chính xác thông tin cá nhân (Số CCCD, Họ tên, Ngày sinh, Giới tính, Địa chỉ, Ngày cấp, Họ tên Cha/Mẹ) từ dữ liệu thô của mã QR.
* **Lưu vết thời gian**: Tự động đánh dấu thời điểm nạp thẻ.

### 📦 2. Phân hệ Kho & Trả thẻ (`delivery`)
* **Phân hộp tự động**: Thuật toán tự động xếp thẻ vào các Hộp (Zone) lưu trữ (mỗi hộp tối đa 50 thẻ), hỗ trợ tính năng ép chuyển sang hộp mới.
* **Dồn hộp (Merge Box)**: Cho phép gộp các hộp lưu trữ có số lượng thẻ ít thành hộp lớn để giải phóng không gian lưu kho.
* **Giao nhận Shipper**: Hỗ trợ bàn giao hàng loạt thẻ cho shipper đi giao tận nơi (cập nhật trạng thái "Đang giao" kèm Tên & SĐT shipper).
* **Xác nhận giao hàng**: Cập nhật trạng thái trả thẻ hàng loạt khi shipper báo giao thành công hoặc dọn thẻ trả về kho nếu giao thất bại.
* **Lịch sử thẻ (Timeline Audit Logs)**: 
  * Tự động lưu vết tất cả các thao tác tác động lên thẻ (Nạp mới, Sửa đổi thông tin, Xóa thẻ, Trả thẻ, Hoàn tác trả thẻ, Bàn giao shipper, Gộp hộp dồn thẻ).
  * Hiển thị dòng thời gian timeline đẹp mắt, chi tiết ngày giờ (vi-VN) và danh tính người thực hiện thao tác.

### 📑 3. Phân hệ Theo dõi giấy hẹn (`appointments`)
* Quản lý và theo dõi các trường hợp công dân có giấy hẹn chưa được nhận thẻ, các trường hợp thẻ bị lỗi hoặc cần đi làm lại để xử lý tiếp.

### 📊 4. Xuất nhập Excel & Quản trị
* **Nạp hàng loạt**: Nhập dữ liệu từ tệp Excel theo định dạng mẫu có sẵn.
* **Xuất báo cáo định dạng đẹp**: Sử dụng thư viện `xlsx-js-style` để tạo ra các báo cáo Excel có màu sắc, căn lề, border chuyên nghiệp phục vụ in ấn.
* **Sao lưu & Khôi phục**: Xuất/nạp file sao lưu `.json` của toàn bộ cơ sở dữ liệu IndexedDB để phòng ngừa mất mát dữ liệu.

### 🔐 5. Bảo mật & Chế độ Khách
* Xác thực qua tài khoản Google (Firebase Auth). Kiểm soát phân quyền truy cập thông qua danh sách trắng (Whitelist) cấu hình trong Firebase Firestore.
* **Chế độ Khách (Guest Mode)**: Cho phép truy cập dùng thử toàn bộ tính năng ngoại trừ việc đồng bộ đám mây và danh sách Whitelist.

---

## 🛠️ Stack Công nghệ

* **Frontend Framework**: Next.js `16.2.10` & React `19.2.4` (App Router).
* **Database Local**: IndexedDB thông qua [Dexie.js](https://dexie.org/) giúp truy vấn bất đồng bộ cực nhanh.
* **Styling**: Tailwind CSS `v4.x` & PostCSS.
* **Xử lý QR**: `html5-qrcode` hỗ trợ quét camera linh hoạt.
* **Xuất Excel**: `xlsx-js-style` thiết lập style báo cáo.
* **Bảo mật**: Firebase Authentication & Firestore.

---

## 📁 Cấu trúc Thư mục (Feature-based)

```bash
/src
├── /app                      # Cấu hình Next.js App Router (Layout & Page điều phối)
├── /features                 # Các mô-đun tính năng chính
│   ├── /intake               # Phân hệ 1: Citizen Intake (Lập danh sách & Quét nhập)
│   ├── /delivery             # Phân hệ 2: Card Delivery (Quản lý kho, Shipper, Trả thẻ & Lịch sử)
│   └── /appointments         # Phân hệ 3: Appointments Backlog (Theo dõi giấy hẹn & Lỗi thẻ)
└── /shared                   # Các tài nguyên dùng chung giữa các phân hệ
    ├── /components           # Header, LoginScreen, ConfirmModal...
    ├── /context              # AuthContext (Xác thực, phân quyền, Guest Mode)
    ├── /hooks                # useDebounce...
    ├── /lib                  # db.ts (IndexedDB Schema V5), firebase.ts
    ├── /types                # Định nghĩa Typescript cho thẻ CCCD
    └── /utils                # cccdParser, exportToExcel, exportReturnToExcel...
```

---

## 💻 Hướng dẫn chạy Dự án dưới Local

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Chạy Development Server
```bash
npm run dev
```
*Mẹo:* Máy chủ chạy ở chế độ máy chủ mở `0.0.0.0`. Bạn có thể dùng điện thoại di động kết nối cùng mạng LAN truy cập vào địa chỉ IP nội bộ của máy tính (ví dụ `http://192.168.1.X:3000`) để quét QR trực tiếp bằng camera điện thoại.

### 3. Kiểm tra kiểm lỗi (Linting)
```bash
npm run lint
```

### 4. Build Production
```bash
npm run build
```

---

## ⚠️ Lưu ý quan trọng cho Developer

* **Camera & HTTPS**: Quyền truy cập camera của trình duyệt yêu cầu giao thức an toàn `https://` (hoặc `localhost` trên máy tính). Khi kiểm thử trên điện thoại qua LAN, cần cài đặt proxy HTTPS hoặc bật flag cho phép HTTP không an toàn của trình duyệt đối với IP máy tính.
* **Bảo toàn dữ liệu**: Dự án sử dụng cơ chế nâng cấp schema tự động của Dexie.js. Khi cập nhật phiên bản DB trong `db.ts`, đảm bảo không chỉnh sửa cấu trúc index của dữ liệu cũ để tránh việc làm mất dữ liệu hiện có trên trình duyệt của người dùng.
* **Nguyên tắc Git**: Chỉ commit và push lên GitHub sau khi đã chạy biên dịch (`npm run build`) và kiểm tra lint (`npm run lint`) thành công 100%. Tăng phiên bản phù hợp (patch/minor/major) trong `package.json` trước khi đẩy lên.
