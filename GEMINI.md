# Hướng dẫn Phát triển Dự án `QL-TCC` (GEMINI.md)

Chào mừng bạn đến với tài liệu hướng dẫn phát triển của dự án **`QL-TCC`** – Hệ thống Quản lý và Cấp phát Thẻ Căn cước (CCCD) dựa trên quét mã QR và quản lý cơ sở dữ liệu nội bộ (IndexedDB).

---

## 🚀 Tổng quan về Dự án
Dự án **`QL-TCC`** là một ứng dụng Web Single-Page (SPA) được thiết kế để tối ưu hóa quy trình nhập liệu, phân loại, lưu kho và trả thẻ Căn cước công dân (CCCD). Ứng dụng hỗ trợ quét mã QR trực tiếp qua camera của thiết bị để điền thông tin tự động, lưu trữ dữ liệu hoàn toàn dưới client để bảo mật thông tin cá nhân và xuất báo cáo ra file Excel.

Dự án gồm **3 phân hệ chính**:
1. **📥 Phân hệ 1: Lập danh sách (`intake`)**: Quét QR CCCD, tự động phân tích và lưu danh sách thẻ đã quét.
2. **📤 Phân hệ 2: Kho & Trả thẻ (`delivery`)**: Quản lý thẻ trong kho theo vị trí (Zone), bàn giao shipper giao tận nơi, thực hiện quét trả thẻ cho công dân và lưu vết thời gian trả.
3. **📑 Phân hệ 3: Theo dõi giấy hẹn (`appointments`)**: Theo dõi các trường hợp có giấy hẹn chưa được cấp thẻ, bị lỗi thẻ (chờ xử lý lại) kèm kết quả xử lý trực tiếp.

---

## 🛠️ Stack Công nghệ & Thư viện
* **Framework chính:** Next.js `16.2.10` & React `19.2.4` (Kiến trúc App Router).
* **Ngôn ngữ:** TypeScript `5.x`.
* **Styling:** Tailwind CSS `v4.x` kết hợp PostCSS.
* **Cơ sở dữ liệu:** **IndexedDB** sử dụng qua thư viện [Dexie.js](https://dexie.org/) để lưu trữ ngoại tuyến (offline) tại trình duyệt.
* **Xử lý QR Code:** [html5-qrcode](https://github.com/mebjas/html5-qrcode) để quét mã trực tiếp từ camera.
* **Xuất Excel:** [xlsx-js-style](https://github.com/gitbrent/xlsx-js-style) để tạo và thiết lập định dạng bảng tính Excel.

---

## 📁 Cấu trúc Thư mục Dự án (Feature-based Architecture)

Dự án sử dụng cấu trúc thư mục hướng tính năng bằng Tiếng Anh để tăng khả năng bảo trì và mở rộng:

```bash
/src
├── /app                      # Cấu hình Next.js App Router (Layouts, Global CSS, Main page)
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Trang chủ chính điều phối và render 3 phân hệ (Tabs)
│
├── /features                 # Các mô-đun tính năng của hệ thống
│   ├── /intake               # Phân hệ 1: Citizen Intake (Lập danh sách & Quét nhập)
│   │   ├── /components       # ControlPanel, DashboardReport, DataTable, ScannerSection
│   │   └── /hooks            # useScannerApp (Logic quét và lưu danh sách ngày)
│   │
│   ├── /delivery             # Phân hệ 2: Card Delivery (Quản lý kho, Shipper & Trả thẻ)
│   │   ├── /components       # AssignShipperModal, EditCardModal, ExportConfigModal, MergeBoxesModal, ReturnControlPanel, ReturnDashboard, ReturnDataTable, ReturnScannerSection
│   │   └── /hooks            # useCardImport, useCardManagement, useCardReturnApp
│   │
│   └── /appointments         # Phân hệ 3: Appointments Backlog (Theo dõi giấy hẹn & Lỗi thẻ)
│       ├── /components       # UnissuedDataTable
│       └── /hooks            # useUnissuedCards
│
└── /shared                   # Tài nguyên dùng chung giữa các phân hệ (Shared Resources)
    ├── /components           # ConfirmModal, Header, Toast
    ├── /hooks                # useDebounce (Hook trì hoãn thay đổi để tối ưu tìm kiếm)
    ├── /lib                  # db.ts (Định nghĩa IndexedDB schema, Dexie DB client)
    ├── /types                # cccd.ts (Định nghĩa các interface & type TypeScript)
    └── /utils                # Các hàm helper bổ trợ
        ├── cccdParser.ts          # Phân tích chuỗi raw dữ liệu QR CCCD
        ├── exportToExcel.ts       # Xuất Excel cho danh sách quét ngày (Phân hệ 1)
        ├── exportReturnToExcel.ts # Xuất Excel cho danh sách kho / shipper (Phân hệ 2)
        └── removeVietnameseTones.ts # Chuyển đổi tiếng Việt có dấu sang không dấu để tìm kiếm
```

---

## 💾 Thiết kế Cơ sở dữ liệu (IndexedDB)
Cơ sở dữ liệu IndexedDB có tên là **`CCCD_KhoThe_DB`**, quản lý thông qua file [db.ts](file:///e:/projects/dv-cap/src/shared/lib/db.ts) gồm 3 bảng chính:
1. `scannedCards`: Lưu vết các thẻ đã quét trong ngày (Phân hệ 1).
2. `cards`: Quản lý kho thẻ hiện tại, vị trí hộp lưu trữ `zone`, trạng thái `status` (`pending` - trong kho, `shipping` - đang giao, `returned` - đã trả), thông tin liên hệ và shipper.
3. `unissuedCards`: Quản lý các thẻ chưa cấp mặc dù có giấy hẹn, lý do chưa cấp (có gợi ý thông minh) và kết quả xử lý (`result`).

*Lưu ý:* Cơ sở dữ liệu đang ở schema **version 4** với tính năng chuẩn hóa ngày trả thẻ (`returnedAt`) và ngày giao cho shipper (`shippedAt`) về dạng số Timestamp.

---

## 🛠️ Quy trình và Tập lệnh Phát triển

### 1. Khởi chạy Development Server
Chạy máy chủ local ở chế độ host `0.0.0.0` để các thiết bị di động trong mạng LAN truy cập vào quét trực tiếp:
```bash
npm run dev
```

### 2. Kiểm tra Cú pháp & Định dạng Code (Linting)
Trước khi commit hoặc build, chạy kiểm tra chất lượng code:
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

1. **Next.js & React Phiên bản Mới:** Dự án chạy trên React 19 và Next.js 16. Hãy theo sát thông báo biên dịch và các cập nhật mới từ Next.js App Router.
2. **Camera & Giao thức HTTPS:** Quyền truy cập camera của HTML5-qrcode yêu cầu giao thức an toàn `https://` (hoặc `localhost` trên máy tính). Khi test thực tế trên thiết bị di động, cần cấu hình proxy HTTPS hoặc thiết lập tin cậy camera trên trình duyệt di động.
3. **Logic hướng tính năng (Feature-based logic):** Luôn phân chia rõ ràng các tệp component và hooks thuộc phân hệ nào. Khi phát triển tính năng mới:
   * Logic nghiệp vụ được đặt trong các hook tương ứng thuộc `src/features/<feature>/hooks/`.
   * Giao diện UI nằm trong `src/features/<feature>/components/`.
   * Các hàm bổ trợ dùng chung hoặc thành phần UI lõi hệ thống đặt trong `src/shared/`.
4. **Quy định đẩy mã nguồn (Git Push):** Chỉ chỉnh sửa, biên dịch và chạy kiểm thử build trên môi trường local. **Tuyệt đối không tự ý chạy các lệnh commit hoặc push lên GitHub** trừ khi có yêu cầu cụ thể từ người dùng.
5. Không tự ý up code lên GitHub trừ khi có yêu cầu, sau mỗi lần up lên git hãy cập nhật phiên bản tăng dần phù hợp (thay đổi nhỏ thì update patch version, thay đổi vừa thì update minor version, thay đổi lớn thì update major version)