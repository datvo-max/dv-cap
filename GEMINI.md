# Hướng dẫn Phát triển Dự án `QL-TCC` (GEMINI.md)

Chào mừng bạn đến với tài liệu hướng dẫn phát triển của dự án **`QL-TCC`** – Hệ thống Quản lý và Cấp phát Thẻ Căn cước (CCCD) địa phương.

---

## 🚀 Tổng quan về Dự án
Dự án **`QL-TCC`** là một ứng dụng Web Single-Page (SPA) được thiết kế để tối ưu hóa quy trình nhập liệu, phân loại, lưu kho và trả thẻ Căn cước công dân (CCCD). Ứng dụng hỗ trợ quét mã QR trực tiếp qua camera của thiết bị để điền thông tin tự động, lưu trữ dữ liệu hoàn toàn dưới client (IndexedDB) để đảm bảo tốc độ và xuất báo cáo ra file Excel.

Dự án gồm **3 phân hệ chính**:
1. **📥 Phân hệ 1: Lập danh sách (`intake`)**: Quét QR CCCD, tự động phân tích và lưu danh sách thẻ đã quét.
2. **📤 Phân hệ 2: Kho & Trả thẻ (`delivery`)**: Quản lý thẻ trong kho theo vị trí (Zone), bàn giao shipper giao tận nơi, thực hiện quét trả thẻ cho công dân và xuất báo cáo/tải file mẫu Excel.
3. **📑 Phân hệ 3: Theo dõi giấy hẹn (`appointments`)**: Theo dõi các trường hợp có giấy hẹn chưa được cấp thẻ, bị lỗi thẻ (chờ xử lý lại).

Hệ thống được triển khai trên **GitHub Pages** và bảo mật bằng hệ thống Đăng nhập Google (OAuth) kết hợp danh sách trắng (Whitelist) kiểm soát bởi Firebase. Ngoài ra còn hỗ trợ **Chế độ Khách (Guest Mode)** phục vụ cho việc dùng thử và phát triển.

---

## 🛠️ Stack Công nghệ & Thư viện
* **Framework chính:** Next.js `16.2.10` & React `19.2.4` (Kiến trúc App Router).
* **Ngôn ngữ:** TypeScript `5.x`.
* **Styling:** Tailwind CSS `v4.x` kết hợp PostCSS.
* **Xác thực & Bảo mật (Auth):** Firebase (Authentication & Firestore) kiểm soát quyền truy cập bằng Gmail.
* **Cơ sở dữ liệu Local:** **IndexedDB** sử dụng qua thư viện [Dexie.js](https://dexie.org/) để lưu trữ dữ liệu kho offline tại trình duyệt.
* **Xử lý QR Code:** [html5-qrcode](https://github.com/mebjas/html5-qrcode) để quét mã trực tiếp từ camera.
* **Xuất Excel:** [xlsx-js-style](https://github.com/gitbrent/xlsx-js-style) để tạo và thiết lập định dạng bảng tính Excel.
* **Thông báo (Toast):** `react-hot-toast` hiển thị các thông báo lỗi và trạng thái.

---

## 📁 Cấu trúc Thư mục Dự án (Feature-based Architecture)

Dự án sử dụng cấu trúc thư mục hướng tính năng bằng Tiếng Anh để tăng khả năng bảo trì và mở rộng:

```bash
/src
├── /app                      # Cấu hình Next.js App Router
│   ├── layout.tsx            # Chứa AuthProvider và Toaster
│   └── page.tsx              # Trang chủ điều phối 3 phân hệ và kiểm tra quyền truy cập
│
├── /features                 # Các mô-đun tính năng của hệ thống
│   ├── /intake               # Phân hệ 1: Citizen Intake (Lập danh sách & Quét nhập)
│   ├── /delivery             # Phân hệ 2: Card Delivery (Quản lý kho, Shipper, Mẫu Excel & Trả thẻ)
│   └── /appointments         # Phân hệ 3: Appointments Backlog (Theo dõi giấy hẹn & Lỗi thẻ)
│
└── /shared                   # Tài nguyên dùng chung giữa các phân hệ (Shared Resources)
    ├── /components           # ConfirmModal, Header, Toast, LoginScreen
    ├── /context              # AuthContext (Quản lý trạng thái Đăng nhập, Quyền truy cập, Chế độ Khách)
    ├── /hooks                # useDebounce 
    ├── /lib                  # db.ts (IndexedDB), firebase.ts (Cấu hình Firebase)
    ├── /types                # cccd.ts
    └── /utils                # cccdParser.ts, exportToExcel.ts...
```

---

## 💾 Thiết kế Cơ sở dữ liệu 

**1. Firebase Firestore (Trên Cloud):**
* Collection `allowed_users`: Chứa danh sách các Gmail được cấp phép sử dụng hệ thống. Mỗi Document ID là một địa chỉ email, kèm field `allowed: boolean`.

**2. IndexedDB (Local Storage):**
Cơ sở dữ liệu IndexedDB có tên là **`CCCD_KhoThe_DB`**, bao gồm:
1. `scannedCards`: Lưu vết các thẻ đã quét trong ngày (Phân hệ 1).
2. `cards`: Quản lý kho thẻ hiện tại, vị trí hộp lưu trữ `zone`, trạng thái và thông tin liên hệ.
3. `unissuedCards`: Quản lý các thẻ chưa cấp mặc dù có giấy hẹn.

---

## 🛠️ Quy trình và Tập lệnh Phát triển

### 1. Khởi chạy Development Server
Chạy máy chủ local ở chế độ host `0.0.0.0` để các thiết bị di động trong mạng LAN truy cập vào quét trực tiếp:
```bash
npm run dev
```

### 2. Triển khai (Deployment)
Dự án được cấu hình tự động build và deploy lên **GitHub Pages** thông qua GitHub Actions (`.github/workflows/nextjs.yml`). 
*Lưu ý:* Cần cài đặt 6 biến môi trường `NEXT_PUBLIC_FIREBASE_...` trong phần **Secrets** của GitHub Repository để quá trình build không bị lỗi xác thực và hoạt động đúng trên môi trường Production.

---

## ⚠️ Lưu ý Quan trọng cho Developer / Agent

1. **Next.js & React Phiên bản Mới:** Dự án chạy trên React 19 và Next.js 16. Hãy theo sát thông báo biên dịch và các cập nhật mới từ Next.js App Router.
2. **Camera & Giao thức HTTPS:** Quyền truy cập camera của HTML5-qrcode yêu cầu giao thức an toàn `https://` (hoặc `localhost` trên máy tính). Khi test thực tế trên thiết bị di động, cần cấu hình proxy HTTPS.
3. **Logic hướng tính năng (Feature-based logic):** Luôn phân chia rõ ràng các tệp component và hooks thuộc phân hệ nào.
4. **Quy định đẩy mã nguồn (Git Push):** Chỉ chỉnh sửa, biên dịch và chạy kiểm thử build trên môi trường local. **Tuyệt đối không tự ý chạy các lệnh commit hoặc push lên GitHub** trừ khi có yêu cầu cụ thể từ người dùng.
5. Không tự ý up code lên GitHub trừ khi có yêu cầu, sau mỗi lần up lên git hãy cập nhật phiên bản tăng dần phù hợp (thay đổi nhỏ thì update patch version, thay đổi vừa thì update minor version, thay đổi lớn thì update major version).