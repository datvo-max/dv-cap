# Hướng dẫn Phát triển Dự án `dv-cap` (GEMINI.md)

Chào mừng bạn đến với tài liệu hướng dẫn phát triển của dự án **`dv-cap`** – Hệ thống Quản lý và Cấp phát Thẻ Căn cước (CCCD) dựa trên quét mã QR và quản lý cơ sở dữ liệu nội bộ (IndexedDB).

---

## 🚀 Tổng quan về Dự án
Dự án **`dv-cap`** là một ứng dụng Web Single-Page (SPA) được thiết kế để tối ưu hóa quy trình nhập liệu, phân loại, lưu kho và trả thẻ Căn cước công dân (CCCD). Ứng dụng hỗ trợ quét mã QR trực tiếp qua camera của thiết bị để điền thông tin tự động, lưu trữ dữ liệu hoàn toàn dưới client để bảo mật thông tin cá nhân và xuất báo cáo ra file Excel.

Dự án gồm **3 phân hệ chính**:
1. **📥 Phân hệ 1: Lập danh sách (`nhap-lieu`)**: Quét QR CCCD, tự động phân tích và lưu danh sách thẻ đã quét.
2. **📤 Phân hệ 2: Kho & Trả thẻ (`tra-the`)**: Quản lý thẻ trong kho theo vị trí (Zone), thực hiện quét trả thẻ cho công dân và lưu vết thời gian trả.
3. **📑 Phân hệ 3: Theo dõi giấy hẹn (`giay-hen`)**: Theo dõi các trường hợp có giấy hẹn nhưng chưa được cấp thẻ hoặc bị lỗi thẻ (chờ xử lý lại).

---

## 🛠️ Stack Công nghệ & Thư viện
* **Framework chính:** Next.js `16.2.10` & React `19.2.4` (Sử dụng kiến trúc App Router).
* **Ngôn ngữ:** TypeScript `5.x`.
* **Styling:** Tailwind CSS `v4.x` kết hợp PostCSS.
* **Cơ sở dữ liệu:** **IndexedDB** được bọc qua thư viện [Dexie.js](https://dexie.org/) để lưu dữ liệu offline đáng tin cậy ngay tại trình duyệt của người dùng.
* **Xử lý QR Code:** [html5-qrcode](https://github.com/mebjas/html5-qrcode) để quét mã QR từ camera trực tiếp.
* **Xuất Excel:** [xlsx (SheetJS)](https://cdn.sheetjs.com/) và [xlsx-js-style](https://github.com/gitbrent/xlsx-js-style) để tạo và định dạng bảng tính Excel.

---

## 📁 Cấu trúc Thư mục Dự án

```bash
/src
├── /app                  # Cấu hình Next.js App Router (Layouts, Global CSS, Main page)
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx          # Điểm khởi đầu chính chứa giao diện 3 phân hệ (tabs)
│
├── /components           # Các React Component tái sử dụng
│   ├── ConfirmModal.tsx       # Modal xác nhận chung
│   ├── ControlPanel.tsx       # Bảng điều khiển phân hệ Lập danh sách
│   ├── DashboardReport.tsx    # Thống kê nhanh phân hệ Lập danh sách
│   ├── DataTable.tsx          # Bảng dữ liệu CCCD đã quét
│   ├── EditCardModal.tsx      # Modal chỉnh sửa thông tin thẻ
│   ├── ExportConfigModal.tsx  # Cấu hình tuỳ chọn xuất Excel
│   ├── Header.tsx             # Header ứng dụng
│   ├── MergeBoxesModal.tsx    # Modal gộp hộp/vùng lưu trữ (Zone)
│   ├── ReturnControlPanel.tsx # Điều khiển phân hệ Trả thẻ
│   ├── ReturnDashboard.tsx    # Thống kê phân hệ Trả thẻ
│   ├── ReturnDataTable.tsx    # Bảng dữ liệu quản lý thẻ trong kho
│   ├── ReturnScannerSection.tsx # Scanner dành riêng cho phân hệ Trả thẻ
│   ├── ScannerSection.tsx     # Scanner dành riêng cho phân hệ Lập danh sách
│   ├── Toast.tsx              # Component hiển thị thông báo góc màn hình
│   └── UnissuedDataTable.tsx  # Bảng theo dõi các thẻ có giấy hẹn chưa cấp
│
├── /hooks                # Custom React Hooks chứa toàn bộ logic nghiệp vụ
│   ├── useCardImport.ts       # Hook hỗ trợ import dữ liệu thẻ từ file Excel vào kho
│   ├── useCardManagement.ts   # Quản lý trạng thái và thao tác kho thẻ
│   ├── useCardReturnApp.ts    # Nghiệp vụ chính của phân hệ Trả thẻ
│   ├── useDebounce.ts         # Hook trì hoãn thay đổi (dành cho tìm kiếm)
│   ├── useScannerApp.ts       # Nghiệp vụ chính của phân hệ Lập danh sách
│   └── useUnissuedCards.ts    # Nghiệp vụ phân hệ 3 (Theo dõi giấy hẹn)
│
├── /lib                  # Kết nối Cơ sở dữ liệu nội bộ
│   └── db.ts             # Định nghĩa Schema Dexie DB và các script nâng cấp DB (Migrations)
│
├── /types                # Định nghĩa các Interface & Types
│   └── cccd.ts           # Cấu trúc dữ liệu thẻ CCCD
│
└── /utils                # Các hàm helper bổ trợ
    ├── cccdParser.ts          # Hàm phân tích chuỗi dữ liệu thô (raw QR) của CCCD
    ├── exportToExcel.ts       # Xuất báo cáo Excel phân hệ Lập danh sách
    ├── exportReturnToExcel.ts # Xuất báo cáo Excel phân hệ Trả thẻ
    └── removeVietnameseTones.ts # Chuyển đổi chuỗi tiếng Việt có dấu sang không dấu
```

---

## 💾 Thiết kế Cơ sở dữ liệu (IndexedDB)
Cơ sở dữ liệu IndexedDB có tên là **`CCCD_KhoThe_DB`**, quản lý thông qua file [db.ts](file:///e:/projects/dv-cap/src/lib/db.ts) gồm 3 bảng chính:
1. `scannedCards`: Lưu vết các thẻ đã quét trong ngày.
2. `cards`: Quản lý kho thẻ hiện tại, gồm thông tin vị trí `zone` (hộp lưu trữ), trạng thái `status` (`pending` - đang trong kho, `returned` - đã trả) và số điện thoại liên hệ.
3. `unissuedCards`: Quản lý các thẻ chưa được cấp mặc dù có giấy hẹn.

*Lưu ý:* Cơ sở dữ liệu đang ở schema **version 4** với tính năng tự động chuẩn hóa ngày tháng trả thẻ (`returnedAt`) về định dạng Timestamp (Số) nhằm phục vụ việc lọc/sắp xếp dữ liệu chính xác.

---

## 🛠️ Quy trình và Tập lệnh Phát triển

### 1. Khởi chạy Development Server
Chạy máy chủ local và cho phép các thiết bị khác trong mạng LAN truy cập qua IP máy chủ:
```bash
npm run dev
```
*(Mặc định máy chủ sẽ lắng nghe cổng 3000 ở chế độ `0.0.0.0` để bạn có thể kết nối điện thoại vào quét trực tiếp thông qua camera)*

### 2. Kiểm tra Cú pháp & Định dạng Code (Linting)
Trước khi commit hoặc build ứng dụng, hãy kiểm tra lỗi code:
```bash
npm run lint
```

### 3. Build & Chạy Production
```bash
npm run build
npm run start
```

---

## ⚠️ Lưu ý Quan trọng cho Developer / Agent

1. **Next.js & React Phiên bản Mới:** Dự án đang sử dụng React 19 và Next.js 16 (phiên bản tuỳ chỉnh đặc biệt). Một số cơ chế định tuyến (Routing) và Render của App Router có thể có sự khác biệt nhỏ hoặc deprecate một số API cũ. Hãy đọc kỹ cảnh báo biên dịch nếu xuất hiện lỗi.
2. **Camera & Giao thức HTTPS:** Trình duyệt di động thường chặn quyền truy cập Camera của công nghệ WebRTC/HTML5-qrcode nếu không chạy trên giao thức an toàn `https://` hoặc thiết lập tin cậy đặc biệt (`localhost`). Khi deploy hoặc test trực tiếp, hãy chắc chắn ứng dụng đang chạy dưới kênh truyền HTTPS.
3. **Logic tách biệt:** Luôn giữ cấu trúc tách biệt giữa giao diện (UI) và logic nghiệp vụ. Các thay đổi về mặt logic nên được xử lý trong các custom hooks (`src/hooks/`), tránh viết trực tiếp logic xử lý dữ liệu phức tạp trong UI Component.
