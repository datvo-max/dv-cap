import React from "react";
import {
  Database, QrCode, FileSpreadsheet,
  Layers, Truck, Edit3, CheckCircle2,
  Settings, Download, FolderPlus,
  Sparkles, RefreshCw, Trash2,
  Zap, Box, Calendar
} from "lucide-react";
import { ToolGuideItem } from "../types";

// Danh sách toàn bộ hướng dẫn chức năng và công cụ của phần mềm
export const guideItems: ToolGuideItem[] = [
  // --- TỔNG QUAN ---
  {
    id: "overview-core",
    sectionId: "overview",
    title: "Kiến trúc Offline-First (IndexedDB & Dexie.js)",
    badge: "Công nghệ Lõi",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: React.createElement(Database, { className: "w-5 h-5 text-blue-600" }),
    summary: "Hệ thống lưu trữ toàn bộ dữ liệu kho thẻ và lịch sử quét trực tiếp trên trình duyệt (IndexedDB), đảm bảo thao tác siêu tốc và không bị ảnh hưởng khi mất mạng.",
    steps: [
      "Mọi thao tác quét mã, thêm sửa thẻ hay phân hộp đều được lưu ngay vào cơ sở dữ liệu cục bộ (CCCD_KhoThe_DB).",
      "Không cần chờ đợi tải trang hay đồng bộ máy chủ liên tục trong quá trình nghiệp vụ.",
      "Dữ liệu được bảo mật an toàn trên thiết bị của Cán bộ thao tác."
    ],
    tips: [
      "Vì dữ liệu lưu trên trình duyệt, hãy sử dụng tính năng 'Sao lưu dữ liệu (Backup JSON)' định kỳ trong mục Settings để bảo quản."
    ],
    keywords: ["offline", "indexeddb", "dexie", "cơ sở dữ liệu", "lưu trữ cục bộ", "tốc độ", "mất mạng"]
  },

  // --- PHÂN HỆ 1 ---
  {
    id: "intake-scanner",
    sectionId: "intake",
    title: "Quét Mã QR Thẻ căn cước Nhập Liệu Tự Động",
    badge: "Phân hệ 1",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: React.createElement(QrCode, { className: "w-5 h-5 text-blue-600" }),
    summary: "Sử dụng camera điện thoại/webcam hoặc máy quét cầm tay USB/Bluetooth để bóc tách tự động các trường thông tin từ mã QR trên Thẻ căn cước.",
    steps: [
      "Tại Bảng điều khiển Quét (bên trái), chọn 'Bật Webcam' để dùng camera thiết bị, hoặc chọn 'Bật Máy Quét' nếu dùng đầu quét cầm tay (Bluetooth/USB).",
      "Đưa mã QR trên Thẻ căn cước vào vùng quét hoặc bấm cò máy quét.",
      "Hệ thống tự động phân tích và tự động điền các thông tin: Số ĐDCN, Họ tên, Ngày sinh, Giới tính, Địa chỉ thường trú, Ngày cấp, Tên cha, Tên mẹ.",
      "Bản ghi hợp lệ sẽ tự động được thêm vào Danh sách bên phải kèm âm báo thành công."
    ],
    tips: [
      "Bật 'Đèn Flash' (nếu thiết bị hỗ trợ) khi môi trường thiếu sáng để nhận diện QR chính xác hơn.",
      "Nếu dùng máy quét cầm tay, hãy đảm bảo chế độ bộ gõ tiếng Anh hoặc tắt Unikey/Vietkey để tránh lỗi dấu khi quét mã."
    ],
    keywords: ["quét qr", "camera", "webcam", "máy quét", "flash", "usb", "bluetooth", "nhập liệu", "bóc tách"],
    targetTab: "nhap-lieu"
  },
  {
    id: "intake-excel-export",
    sectionId: "intake",
    title: "Tải lên & Xuất File Excel Danh Sách Đã Quét",
    badge: "Phân hệ 1",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: React.createElement(FileSpreadsheet, { className: "w-5 h-5 text-blue-600" }),
    summary: "Tải lên danh sách hình ảnh chụp có chứa mã QR của Thẻ căn cước hoặc xuất danh sách đã quét ra file Excel với định dạng chuyên nghiệp chuẩn hóa.",
    steps: [
      "Tải lên (Import): Bấm nút 'Chọn File' tại bảng điều khiển để nhập danh sách hình ảnh chụp có chứa mã QR của Thẻ căn cước vào hệ thống.",
      "Xuất file (Export): Bấm nút 'Xuất Excel', hệ thống tự động tạo bảng tính với định dạng bảng tính chuyên nghiệp chuẩn hóa màu sắc, phông chữ, định dạng ngày tháng và viền bảng.",
      "Xóa dữ liệu phiên làm việc: Bấm 'Xóa Dữ Liệu' -> Xác nhận trên Modal cảnh báo để làm sạch danh sách đã quét."
    ],
    keywords: ["excel", "xuất excel", "tải lên", "import", "export", "báo cáo", "danh sách", "xóa dữ liệu"],
    targetTab: "nhap-lieu"
  },
  {
    id: "intake-dashboard",
    sectionId: "intake",
    title: "Bảng Thống Kê & Phân Tích Dân Cư (Dashboard Report)",
    badge: "Phân hệ 1",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: React.createElement(Sparkles, { className: "w-5 h-5 text-blue-600" }),
    summary: "Tự động phân tích sâu dữ liệu người dân đã quét, hiển thị trực quan qua biểu đồ và chỉ số tổng quan.",
    steps: [
      "Theo dõi Thẻ tổng quan số liệu ở phần đầu trang: Tổng số lượt quét, tỷ lệ Nam/Nữ.",
      "Quan sát các biểu đồ phân khúc theo nhóm tuổi, địa bàn cư trú phổ biến.",
      "Sử dụng nút Sắp xếp (Mặc định / Mới nhất) và thanh tìm kiếm trong bảng dữ liệu để đối chiếu thông tin khi cần."
    ],
    keywords: ["thống kê", "dashboard", "biểu đồ", "phân tích", "tỷ lệ", "nam nữ", "độ tuổi", "địa bàn"],
    targetTab: "nhap-lieu"
  },

  // --- PHÂN HỆ 2 ---
  {
    id: "delivery-import-box",
    sectionId: "delivery",
    title: "Nhập Kho Thẻ Excel & Cấu Hình Hộp Lưu Trữ (Box/Zone)",
    badge: "Phân hệ 2",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: React.createElement(Box, { className: "w-5 h-5 text-indigo-600" }),
    summary: "Quy trình đưa thẻ vào kho tự động phân bổ theo các hộp lưu trữ (Box), giới hạn dung lượng và tối ưu hóa vị trí.",
    steps: [
      "Tải file Excel mẫu chuẩn bằng nút 'Tải File Mẫu' (Import_Sample_QLTCC.xlsx) và điền danh sách thẻ cần nhập kho.",
      "Tại Bảng Công cụ Nhập Kho: Tùy chọn bật/tắt 'Thẻ Không có Ảnh (No Photo Import)' để phân loại thẻ không có ảnh vào các hộp riêng.",
      "Trước khi tải file Excel, nên thiết lập 'Số thẻ tối đa / Hộp (Cards Per Box)' để hệ thống tự động đếm thẻ trong hộp hiện tại. Nếu đầy, hệ thống tự động tạo hộp mới (ví dụ: Hộp 1 -> Hộp 2).",
      "Để ngắt hộp ngay lập tức tại vị trí phân loại hiện tại dù hộp chưa đầy, hãy bật công tắc 'Sang hộp mới (Next Box)'."
    ],
    tips: [
      "Luôn tải và sử dụng file Excel mẫu của hệ thống để tránh sai lệch tên cột khi Import.",
    ],
    keywords: ["nhập kho", "excel mẫu", "box", "zone", "hộp", "lưu trữ", "no photo", "next box", "cards per box"],
    targetTab: "tra-the"
  },
  {
    id: "delivery-box-management",
    sectionId: "delivery",
    title: "Bộ Công Cụ Quản Lý Hộp (Đổi tên, Gộp hộp, Chuyển thẻ sang hộp khác)",
    badge: "Phân hệ 2",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: React.createElement(Layers, { className: "w-5 h-5 text-indigo-600" }),
    summary: "Tổ chức và sắp xếp lại các hộp/tủ lưu trữ thẻ thực tế một cách linh hoạt.",
    steps: [
      "Đổi tên hộp (Rename Box): Bấm nút 'Đổi Tên Hộp', chọn hộp cũ từ danh sách và nhập tên mới (ví dụ: 'Tủ 1 - Ngăn A') giúp cán bộ dễ tìm kiếm.",
      "Gộp hộp (Merge Boxes): Bấm 'Gộp Hộp', chọn các hộp lẻ/hộp ít thẻ để dồn toàn bộ thẻ sang một hộp đích chung, giúp giải phóng tủ kệ.",
      "Di chuyển thẻ sang hộp khác (Move Cards): Tại bảng danh sách kho, tích chọn các thẻ cụ thể -> Bấm 'Chuyển Hộp (Move Box)' -> Chọn hộp đích để chuyển dời chỉ với 1 cú nhấp chuột."
    ],
    keywords: ["đổi tên hộp", "rename", "gộp hộp", "merge box", "chuyển thẻ", "move cards", "tổ chức", "quản lý kho"],
    targetTab: "tra-the"
  },
  {
    id: "delivery-return-qr",
    sectionId: "delivery",
    title: "Xác nhận trả thẻ | Quét mã & Hoàn tác",
    badge: "Phân hệ 2",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: React.createElement(CheckCircle2, { className: "w-5 h-5 text-indigo-600" }),
    summary: "Quy trình trả thẻ nhanh trực tiếp cho công dân bằng cách Xác nhận trả hoặc quét mã QR.",
    steps: [
      "Tại mục Quét Mã Trả Thẻ, bấm 'Bật Webcam' hoặc dùng máy quét chuyên dụng.",
      "Công dân xuất trình giấy hẹn -> Cán bộ tiến hành tìm kiếm thông tin CCCD/Số giấy hẹn -> Xác nhận trả hoặc sau khi lấy thẻ từ kho ra thì quét Mã QR để xác nhận đã trả thẻ.",
      "Hệ thống ngay lập tức định vị thẻ trong kho, hiển thị vị trí chính xác (Hộp/Zone) và đổi trạng thái thẻ thành 'Đã trả (Delivered)'.",
      "Cơ chế Hoàn tác (Undo): Ngay sau khi trả thẻ thành công, trên góc màn hình sẽ hiện thông báo Toast kèm nút 'Hoàn tác (Undo)'. Nếu lỡ quét nhầm, bấm vào đây để đưa thẻ về trạng thái 'Trong kho' tức thì."
    ],
    tips: [
      "Cán bộ cũng có thể bấm hoàn tác (Undo) từ bên trong Modal Chi tiết Thẻ đối với các thẻ vừa chuyển trạng thái gần đây."
    ],
    keywords: ["trả thẻ", "quét qr", "định vị", "delivered", "đã trả", "hoàn tác", "undo", "toast"],
    targetTab: "tra-the"
  },
  {
    id: "delivery-shipper",
    sectionId: "delivery",
    title: "Quản Lý Shipper & Bàn Giao Giao Nhận Tận Nhà",
    badge: "Phân hệ 2",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: React.createElement(Truck, { className: "w-5 h-5 text-indigo-600" }),
    summary: "Hỗ trợ bàn giao lô thẻ cho nhân viên bưu điện hoặc shipper đi giao tận nhà cho công dân.",
    steps: [
      "Bật 'Chế độ chọn (Select Mode)' trên bảng danh sách kho -> Tích chọn các thẻ cần bàn giao cho Shipper.",
      "Bấm nút 'Giao cho Shipper' -> Nhập Tên Shipper, Số điện thoại và Ghi chú bàn giao.",
      "Trạng thái các thẻ được gán sẽ chuyển thành 'Đang giao (Delivering)'.",
      "Xử lý hàng loạt sau khi giao: Khi Shipper báo cáo kết quả, chọn lại các thẻ tương ứng và bấm 'Xác nhận Đã Giao Hàng Loạt' nếu thành công, hoặc bấm 'Trả Lại Kho Hàng Loạt' nếu công dân vắng mặt/giao thất bại."
    ],
    keywords: ["shipper", "bàn giao", "giao tận nhà", "bưu điện", "delivering", "đang giao", "hàng loạt", "bulk"],
    targetTab: "tra-the"
  },
  {
    id: "delivery-edit-modal",
    sectionId: "delivery",
    title: "Chỉnh Sửa Chi Tiết & Lịch Sử Tác Động Thẻ",
    badge: "Phân hệ 2",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: React.createElement(Edit3, { className: "w-5 h-5 text-indigo-600" }),
    summary: "Cho phép quét lại QR của Thẻ, cập nhật số điện thoại liên hệ, ghi chú, hoàn về kho, xoá thẻ và theo dõi dòng thời gian Lịch sử tác động đối với thẻ.",
    steps: [
      "Trong danh sách kho thẻ, bấm trực tiếp vào bất kỳ hàng thẻ nào hoặc bấm biểu tượng 'Sửa (Edit)' để mở Modal chi tiết.",
      "Tab Thông tin: Cho phép cập nhật Số Thẻ căn cước, Họ tên, SĐT công dân, Địa chỉ, Vị trí hộp và Ghi chú công tác. Bạn cũng có thể thực hiện thao tác hoàn về kho hoặc xóa thẻ tại tab này.",
      "Tab Lịch sử tác động: Ghi nhận chi tiết dòng thời gian toàn bộ các tác động đã thực hiện đối với thẻ (Nạp thẻ vào kho, Bàn giao cho shipper, Giao hàng thành công, Trả thẻ trực tiếp, Khôi phục/Hoàn tác về kho, Đổi tên/Gộp hộp, Sửa thông tin thẻ...) kèm thời gian thực hiện chính xác."
    ],
    keywords: ["chỉnh sửa", "edit modal", "cập nhật", "ghi chú", "chi tiết", "lịch sử", "lịch sử tác động", "history", "dòng thời gian"],
    targetTab: "tra-the"
  },
  {
    id: "delivery-export-config",
    sectionId: "delivery",
    title: "Xuất Báo Cáo Kho Theo Trạng Thái",
    badge: "Phân hệ 2",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: React.createElement(Download, { className: "w-5 h-5 text-indigo-600" }),
    summary: "Xuất file Excel báo cáo tổng hợp kho theo từng bộ lọc trạng thái thực tế phục vụ kiểm kê.",
    steps: [
      "Xuất báo cáo từ phần thống kê phía trên Phân hệ 2, hoặc Thanh công cụ bên trái",
      "Tại Modal Cấu hình Xuất Excel, chọn các trường dữ liệu muốn xuất",
      "Bấm xác nhận, hệ thống sẽ tải xuống file Excel báo cáo."
    ],
    keywords: ["xuất kho", "export config", "báo cáo kho", "trạng thái", "lọc thẻ", "excel"],
    targetTab: "tra-the"
  },

  // --- PHÂN HỆ 3 ---
  {
    id: "appointments-backlog",
    sectionId: "appointments",
    title: "Theo Dõi Giấy Hẹn & Xử Lý Lỗi Thẻ (Appointments Backlog)",
    badge: "Phân hệ 3",
    badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
    icon: React.createElement(Calendar, { className: "w-5 h-5 text-orange-600" }),
    summary: "Quản lý tập trung các trường hợp công dân đã có giấy hẹn nhưng thẻ chưa về kho hoặc bị lỗi cần xử lý lại.",
    steps: [
      "Chuyển sang Tab '📑 PHÂN HỆ 3: THEO DÕI GIẤY HẸN' trên thanh điều hướng.",
      "Danh sách hiển thị các hồ sơ đang chờ cấp thẻ hoặc các trường hợp thẻ bị lỗi từ trung tâm cần thu hồi/in lại.",
      "Cập nhật trạng thái xử lý sau khi đã phối hợp xong với cơ quan cấp trên."
    ],
    keywords: ["giấy hẹn", "chưa cấp", "unissued", "lỗi thẻ", "backlog", "quá hạn", "theo dõi", "overdue"],
    targetTab: "giay-hen"
  },

  // --- PHÂN HỆ 4 ---
  {
    id: "matching-crosscheck",
    sectionId: "matching",
    title: "Đối Sánh Tự Động Khớp / Lệch Dữ Liệu",
    badge: "Phân hệ 4",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
    icon: React.createElement(RefreshCw, { className: "w-5 h-5 text-teal-600" }),
    summary: "Kiểm tra chéo tự động giữa danh sách thẻ thực tế và dữ liệu kỳ vọng để phát hiện chênh lệch.",
    steps: [
      "Chuyển sang Tab '🔄 PHÂN HỆ 4: ĐỐI SÁNH'.",
      "Sử dụng khu vực quét mã đối sánh (hoặc nạp danh sách) để đưa dữ liệu thực tế vào hệ thống.",
      "Hệ thống tự động chạy thuật toán đối chiếu với Kho thẻ hiện có và phân chia kết quả ra 2 bảng riêng biệt:",
      "1. Bảng Dữ liệu Đã Khớp: Các thẻ tìm thấy trong kho. Tại mỗi thẻ hỗ trợ thao tác nhanh: Bổ sung dữ liệu mới, Chọn trường cần bổ sung, hoặc Giữ nguyên không thay đổi.",
      "2. Bảng Dữ liệu Lệch / Chưa Khớp: Danh sách các thẻ bị thiếu trong kho hoặc thẻ dư thừa phát sinh ngoài danh sách, giúp nhân viên lập biên bản và tìm nguyên nhân ngay."
    ],
    keywords: ["đối sánh", "matching", "kiểm tra chéo", "khớp", "lệch", "matched", "unmatched", "chênh lệch"],
    targetTab: "doi-sanh"
  },

  // --- PHÂN HỆ 5 ---
  {
    id: "archives-management",
    sectionId: "archives",
    title: "Quản Lý & Lưu Trữ Tàng Thư CCCD",
    badge: "Phân hệ 5",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    icon: React.createElement(FolderPlus, { className: "w-5 h-5 text-purple-600" }),
    summary: "Xây dựng và quản lý danh sách bàn giao Tàng thư Căn cước với khả năng tự động đối chiếu từ Kho thẻ (Phân hệ 2) hoặc nhập liệu thủ công siêu tốc.",
    steps: [
      "Chuyển sang Tab '🗄️ PHÂN HỆ 5: TÀNG THƯ' trên thanh điều hướng.",
      "Tra cứu nhanh: Nhập từ 4 số định danh cá nhân trở lên vào thanh tìm kiếm. Hệ thống sẽ tự động lọc và gợi ý các thẻ đang có trong Phân hệ 2 (nhưng chưa có trong Tàng thư). Dùng mũi tên Lên/Xuống và nhấn Enter để chọn nhanh.",
      "Nhập liệu thủ công (Đối với hồ sơ chưa có trong Kho thẻ): Khi gõ đủ 12 số mà không tìm thấy gợi ý, nhấn Enter để mở Form nhập thủ công. Con trỏ sẽ tự động chuyển sang ô Họ Tên để bạn gõ liên tục.",
      "Mẹo nhập Ngày sinh: Bạn chỉ cần gõ 4 số (VD: 1505) và nhấn Tab, hệ thống tự động trích xuất năm sinh từ số CCCD để điền đủ ngày tháng năm sinh hoàn chỉnh.",
      "Quản lý danh sách: Tại bảng bên phải, bạn có thể chỉnh sửa, xoá nhiều hồ sơ cùng lúc hoặc xuất trực tiếp danh sách Tàng thư ra file Excel chuyên nghiệp."
    ],
    tips: [
      "Tính năng giới tính (Nam/Nữ) và thế kỷ sinh (19xx/20xx) luôn được hệ thống tự động bóc tách từ số ĐDCN mà không cần nhập tay."
    ],
    keywords: ["tàng thư", "archives", "lưu trữ", "bàn giao", "thủ công", "nhập liệu", "định danh", "ngày sinh"],
    targetTab: "tang-thu"
  },

  // --- QUẢN TRỊ & SAO LƯU ---
  {
    id: "admin-settings-unit",
    sectionId: "admin",
    title: "Cấu Hình Tên Đơn Vị & Tùy Biến Giao Diện",
    badge: "Quản trị",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    icon: React.createElement(Settings, { className: "w-5 h-5 text-purple-600" }),
    summary: "Tùy chỉnh tên Đơn vị quản lý hiển thị trên toàn hệ thống và các tiêu đề báo cáo Excel xuất ra.",
    steps: [
      "Bấm vào biểu tượng Bánh răng (Settings) trong phần menu bên phải.",
      "Trong Modal Cài đặt, nhập Tên Đơn Vị.",
      "Bấm Lưu, tên đơn vị mới sẽ lập tức được áp dụng trên Header và tiêu đề chính của mọi bảng tính Excel khi bạn Xuất Báo Cáo."
    ],
    keywords: ["cài đặt", "settings", "tên đơn vị", "unit name", "cấu hình", "header"],
  },
  {
    id: "admin-backup-restore",
    sectionId: "admin",
    title: "Sao Lưu (Backup) & Phục Hồi (Restore) Cơ Sở Dữ Liệu",
    badge: "Quản trị",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    icon: React.createElement(FolderPlus, { className: "w-5 h-5 text-purple-600" }),
    summary: "Bảo quản, di chuyển và khôi phục toàn bộ kho dữ liệu IndexedDB của ứng dụng dưới dạng file .json an toàn.",
    steps: [
      "Sao lưu (Backup): Mở Modal Cài đặt (Settings) -> Bấm 'Sao Lưu Dữ Liệu (Backup JSON)'. Hệ thống tự động đóng gói toàn bộ kho thẻ, lịch sử quét và giấy hẹn thành 1 file .json tải về máy tính.",
      "Phục hồi (Restore): Tại máy tính mới hoặc sau khi cài lại trình duyệt, mở Settings -> Bấm 'Phục Hồi Dữ Liệu (Restore)' -> Chọn file .json đã lưu trước đó.",
      "Hệ thống sẽ tái tạo 100% nguyên trạng dữ liệu kho và lịch sử làm việc ngay lập tức!"
    ],
    tips: [
      "Nên thực hiện Sao lưu (Backup JSON) vào cuối mỗi ngày làm việc để lưu trữ vào ổ cứng ngoài hoặc Google Drive đơn vị."
    ],
    keywords: ["sao lưu", "backup", "phục hồi", "restore", "json", "indexeddb", "di chuyển dữ liệu", "an toàn"]
  },
  {
    id: "admin-clear-data",
    sectionId: "admin",
    title: "Xóa Toàn Bộ Dữ Liệu",
    badge: "Quản trị",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
    icon: React.createElement(Trash2, { className: "w-5 h-5 text-rose-600" }),
    summary: "Xóa toàn bộ dữ liệu trên trình duyệt một cách an toàn khi chuyển máy tính hoặc có yêu cầu khác",
    steps: [
      "Trong Modal Cài đặt (Settings), lướt xuống vùng Nguy hiểm (Danger Zone) -> Bấm nút 'Xóa Toàn Bộ Dữ Liệu'.",
      "Hệ thống sẽ hiển thị Modal Cảnh Báo bảo mật yêu cầu bạn xác nhận thao tác.",
      "Sau khi đồng ý, toàn bộ bảng kho thẻ, danh sách quét và giấy hẹn trong IndexedDB sẽ được xóa sạch và làm mới hệ thống."
    ],
    tips: [
      "Hãy CHẮC CHẮN rằng bạn đã bấm 'Sao Lưu Dữ Liệu (Backup JSON)' trước khi thực hiện xóa toàn bộ!"
    ],
    keywords: ["xóa dữ liệu", "clear data", "làm sạch", "danger zone", "chuyển kỳ", "reset"]
  },

  // --- MẸO & KHẮC PHỤC SỰ CỐ ---
  {
    id: "tips-hardware-scanner",
    sectionId: "tips",
    title: "Tối Ưu Quét Siêu Tốc Bằng Đầu Quét Cầm Tay USB/Bluetooth",
    badge: "Mẹo chuyên gia",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    icon: React.createElement(Zap, { className: "w-5 h-5 text-amber-600" }),
    summary: "Thiết lập không gian làm việc chuyên nghiệp, rảnh tay và đạt tốc độ xử lý hàng nghìn thẻ mỗi giờ.",
    steps: [
      "Trang bị đầu quét mã vạch/QR 2D cổng USB hoặc Bluetooth kết nối trực tiếp vào máy tính.",
      "Trên ứng dụng, chọn chế độ 'Bật Máy Quét (Device Scanner)'. Đặt con trỏ chuột vào ô nhận dữ liệu.",
      "Gắn điện thoại/máy quét lên giá đỡ cố định, nhân viên chỉ cần đưa thẻ qua vùng quét liên tục mà không cần thao tác chuột.",
      "Hệ thống tự động chia hộp dựa trên cấu hình dung lượng hộp."
    ],
    keywords: ["máy quét usb", "bluetooth", "rảnh tay", "tốc độ cao", "tối ưu", "mẹo", "siêu tốc", "quét vạch"]
  }
];

// Danh sách các section filter dùng cho sidebar
export const GUIDE_SECTIONS = [
  { id: 'all' as const, label: "🌟 Tất Cả" },
  { id: 'overview' as const, label: "💡 Kiến Trúc & Bảo Mật" },
  { id: 'intake' as const, label: "📥 Phân Hệ 1: Lập Danh Sách" },
  { id: 'delivery' as const, label: "📤 Phân Hệ 2: Kho & Trả Thẻ" },
  { id: 'appointments' as const, label: "📑 Phân Hệ 3: Giấy Hẹn" },
  { id: 'matching' as const, label: "🔄 Phân Hệ 4: Đối Sánh" },
  { id: 'archives' as const, label: "🗄️ Phân Hệ 5: Tàng Thư" },
  { id: 'admin' as const, label: "⚙️ Quản Trị & Sao Lưu" },
  { id: 'tips' as const, label: "🛠️ Mẹo & Khắc Phục Sự Cố" },
];
