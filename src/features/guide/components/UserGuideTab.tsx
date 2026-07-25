"use client";

import React, { useState, useMemo } from "react";
import {
  Search, BookOpen, ShieldCheck, Database, QrCode, FileSpreadsheet,
  Layers, Truck, RotateCcw, Edit3, AlertTriangle, CheckCircle2,
  Lightbulb, Settings, Download, Upload, FolderPlus, ArrowRight,
  Sparkles, Laptop, Smartphone, FileText, RefreshCw, Trash2, Camera,
  Zap, HelpCircle, Box, Users, Calendar
} from "lucide-react";

interface UserGuideTabProps {
  onNavigateTab: (tab: 'nhap-lieu' | 'tra-the' | 'giay-hen' | 'doi-sanh') => void;
}

type GuideSectionId = 'all' | 'overview' | 'intake' | 'delivery' | 'appointments' | 'matching' | 'admin' | 'tips';

interface ToolGuideItem {
  id: string;
  sectionId: Exclude<GuideSectionId, 'all'>;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  summary: string;
  steps: string[];
  tips?: string[];
  keywords: string[];
  targetTab?: 'nhap-lieu' | 'tra-the' | 'giay-hen' | 'doi-sanh';
}

export default function UserGuideTab({ onNavigateTab }: UserGuideTabProps) {
  const [activeSection, setActiveSection] = useState<GuideSectionId>('all');
  const [searchQuery, setSearchQuery] = useState("");

  // Danh sách toàn bộ hướng dẫn chức năng và công cụ của phần mềm
  const guideItems: ToolGuideItem[] = useMemo(() => [
    // --- TỔNG QUAN ---
    {
      id: "overview-core",
      sectionId: "overview",
      title: "Kiến trúc Offline-First (IndexedDB & Dexie.js)",
      badge: "Công nghệ Lõi",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <Database className="w-5 h-5 text-blue-600" />,
      summary: "Hệ thống lưu trữ toàn bộ dữ liệu kho thẻ và lịch sử quét trực tiếp trên trình duyệt (IndexedDB), đảm bảo thao tác siêu tốc và không bị ảnh hưởng khi mất mạng.",
      steps: [
        "Mọi thao tác quét mã, thêm sửa thẻ hay phân hộp đều được lưu ngay vào cơ sở dữ liệu cục bộ (CCCD_KhoThe_DB).",
        "Không cần chờ đợi tải trang hay đồng bộ máy chủ liên tục trong quá trình nghiệp vụ tại quầy.",
        "Dữ liệu được bảo mật an toàn trên thiết bị của nhân viên thao tác."
      ],
      tips: [
        "Vì dữ liệu lưu trên trình duyệt, hãy sử dụng tính năng 'Sao lưu dữ liệu (Backup JSON)' định kỳ trong mục Settings để bảo quản."
      ],
      keywords: ["offline", "indexeddb", "dexie", "cơ sở dữ liệu", "lưu trữ cục bộ", "tốc độ", "mất mạng"]
    },
    {
      id: "overview-auth",
      sectionId: "overview",
      title: "Bảo mật Xác thực Google OAuth & Danh sách Trắng (Whitelist)",
      badge: "Bảo mật",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      summary: "Hệ thống kiểm soát quyền truy cập chặt chẽ thông qua tài khoản Google (Gmail) đối chiếu với Danh sách trắng trên Firebase Cloud Firestore.",
      steps: [
        "Khi truy cập, người dùng chọn 'Đăng nhập với Google' và sử dụng Gmail công vụ.",
        "Hệ thống tự động kiểm tra bảng 'allowed_users' trên Firebase Firestore. Chỉ các email được cấp quyền (allowed: true) mới được phép vào hệ thống.",
        "Hỗ trợ 'Chế độ Khách (Guest Mode)' để kiểm thử nhanh hoặc trải nghiệm tính năng mà không cần quyền Whitelist (dữ liệu cách ly với tài khoản chính)."
      ],
      tips: [
        "Để cấp quyền cho nhân viên mới, Quản trị viên chỉ cần thêm email vào bảng allowed_users trên Firebase."
      ],
      keywords: ["bảo mật", "oauth", "google", "login", "đăng nhập", "whitelist", "firebase", "guest mode", "khách", "quyền"]
    },

    // --- PHÂN HỆ 1 ---
    {
      id: "intake-scanner",
      sectionId: "intake",
      title: "Quét Mã QR CCCD Nhập Liệu Tự Động",
      badge: "Phân hệ 1",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <QrCode className="w-5 h-5 text-blue-600" />,
      summary: "Sử dụng camera điện thoại/webcam hoặc máy quét cầm tay USB/Bluetooth để bóc tách tự động các trường thông tin từ mã QR trên thẻ CCCD.",
      steps: [
        "Tại Bảng điều khiển Quét (bên trái), chọn 'Bật Webcam' để dùng camera thiết bị, hoặc chọn 'Bật Máy Quét' nếu dùng đầu quét cầm tay (Bluetooth/USB).",
        "Đưa mã QR trên thẻ CCCD vào vùng quét hoặc bấm cò máy quét.",
        "Hệ thống tự động phân tích và tự động điền các thông tin: Số CCCD, Họ tên, Ngày sinh, Giới tính, Địa chỉ thường trú, Ngày cấp...",
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
      title: "Tải lên & Xuất Báo Cáo Excel Danh Sách Quét",
      badge: "Phân hệ 1",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      icon: <FileSpreadsheet className="w-5 h-5 text-blue-600" />,
      summary: "Tải lên danh sách có sẵn từ file Excel hoặc xuất danh sách đã quét ra file Excel với định dạng chuyên nghiệp chuẩn hóa.",
      steps: [
        "Tải lên (Import): Bấm nút 'Chọn File Excel' tại bảng điều khiển để nhập nhanh danh sách công dân từ bảng tính vào hệ thống.",
        "Xuất file (Export): Bấm nút 'Xuất Excel', hệ thống tự động tạo bảng tính chuẩn hóa màu sắc, phông chữ, định dạng ngày tháng và viền bảng.",
        "Xóa dữ liệu phiên làm việc: Bấm 'Xóa Dữ Liệu' -> Xác nhận trên Modal cảnh báo để làm sạch danh sách quét trong ngày."
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
      icon: <Sparkles className="w-5 h-5 text-blue-600" />,
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
      icon: <Box className="w-5 h-5 text-indigo-600" />,
      summary: "Quy trình đưa thẻ vào kho tự động phân bổ theo các hộp lưu trữ (Box), giới hạn dung lượng và tối ưu hóa vị trí.",
      steps: [
        "Tải file Excel mẫu chuẩn bằng nút 'Tải File Mẫu' (Import_Sample_QLTCC.xlsx) và điền danh sách thẻ cần nhập kho.",
        "Tại Bảng Công cụ Nhập Kho: Tùy chọn bật/tắt 'Nhập Không Cần Ảnh (No Photo Import)' để tăng tốc độ nạp dữ liệu hàng loạt.",
        "Thiết lập 'Số thẻ tối đa / Hộp (Cards Per Box)': Khi nhập liệu hoặc quét, hệ thống tự động đếm thẻ trong hộp hiện tại. Nếu đầy, hệ thống tự động tạo hộp mới (ví dụ: Box 1 -> Box 2).",
        "Sử dụng công tắc 'Buộc chuyển sang hộp tiếp theo (Force Next Box)' khi bạn muốn ngắt hộp ngay lập tức tại vị trí phân loại hiện tại dù hộp chưa đầy."
      ],
      tips: [
        "Luôn tải và sử dụng file Excel mẫu của hệ thống để tránh sai lệch tên cột khi Import."
      ],
      keywords: ["nhập kho", "excel mẫu", "box", "zone", "hộp", "lưu trữ", "no photo", "force next box", "cards per box"],
      targetTab: "tra-the"
    },
    {
      id: "delivery-box-management",
      sectionId: "delivery",
      title: "Bộ Công Cụ Quản Lý Hộp (Rename, Merge, Move Cards)",
      badge: "Phân hệ 2",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
      summary: "Tổ chức và tái cơ cấu lại các hộp/tủ lưu trữ thẻ thực tế một cách vô cùng linh hoạt.",
      steps: [
        "Đổi tên hộp (Rename Box): Bấm nút 'Đổi Tên Hộp', chọn hộp cũ từ danh sách và nhập tên mới (ví dụ: 'Tủ 1 - Ngăn A') giúp nhân viên dễ tìm kiếm vật lý.",
        "Gộp hộp (Merge Boxes): Bấm 'Gộp Hộp', chọn các hộp lẻ/hộp ít thẻ để dồn toàn bộ thẻ sang một hộp đích chung, giúp giải phóng tủ kệ.",
        "Chuyển thẻ sang hộp khác (Move Cards): Tại bảng danh sách kho, tích chọn các thẻ cụ thể -> Bấm 'Chuyển Hộp (Move Box)' -> Chọn hộp đích để chuyển dời chỉ với 1 cú nhấp chuột."
      ],
      keywords: ["đổi tên hộp", "rename", "gộp hộp", "merge box", "chuyển thẻ", "move cards", "tổ chức", "quản lý kho"],
      targetTab: "tra-the"
    },
    {
      id: "delivery-return-qr",
      sectionId: "delivery",
      title: "Quét Mã Trả Thẻ Cho Công Dân & Hoàn Tác (Undo)",
      badge: "Phân hệ 2",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      icon: <CheckCircle2 className="w-5 h-5 text-indigo-600" />,
      summary: "Quy trình trả thẻ siêu nhanh tại quầy thông qua quét mã QR kèm cơ chế bảo vệ chống thao tác nhầm.",
      steps: [
        "Tại mục Quét Mã Trả Thẻ, bấm 'Bật Webcam' hoặc dùng máy quét chuyên dụng.",
        "Công dân xuất trình giấy hẹn hoặc thông tin có mã QR/Số CCCD -> Tiến hành quét mã.",
        "Hệ thống ngay lập tức định vị thẻ trong kho, hiển thị vị trí chính xác (Hộp/Zone) và đổi trạng thái thẻ thành 'Đã trả (Delivered)'.",
        "Cơ chế Hoàn tác (Undo): Ngay sau khi trả thẻ thành công, trên góc màn hình sẽ hiện thông báo Toast kèm nút 'Hoàn tác (Undo)'. Nếu lỡ quét nhầm, bấm vào đây để đưa thẻ về trạng thái 'Trong kho' tức thì."
      ],
      tips: [
        "Bạn cũng có thể bấm hoàn tác (Undo) từ bên trong Modal Chi tiết Thẻ đối với các thẻ vừa chuyển trạng thái gần đây."
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
      icon: <Truck className="w-5 h-5 text-indigo-600" />,
      summary: "Hỗ trợ bàn giao lô thẻ cho nhân viên bưu điện hoặc shipper đi giao tận nhà cho công dân.",
      steps: [
        "Bật 'Chế độ chọn (Select Mode)' trên bảng danh sách kho -> Tích chọn các thẻ cần bàn giao cho Shipper.",
        "Bấm nút 'Gán Shipper (Assign Shipper)' -> Nhập Tên Shipper, Số điện thoại và Ghi chú bàn giao.",
        "Trạng thái các thẻ được gán sẽ chuyển thành 'Đang giao (Delivering)'.",
        "Xử lý hàng loạt sau khi giao: Khi Shipper báo cáo kết quả, chọn lại các thẻ tương ứng và bấm 'Xác nhận Đã Giao Hàng Loạt (Bulk Confirm Delivered)' nếu thành công, hoặc bấm 'Trả Lại Kho Hàng Loạt (Bulk Return to Warehouse)' nếu công dân vắng mặt/giao thất bại."
      ],
      keywords: ["shipper", "bàn giao", "giao tận nhà", "bưu điện", "delivering", "đang giao", "hàng loạt", "bulk"],
      targetTab: "tra-the"
    },
    {
      id: "delivery-edit-modal",
      sectionId: "delivery",
      title: "Chỉnh Sửa Chi Tiết & Bổ Sung Hình Ảnh Thẻ",
      badge: "Phân hệ 2",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      icon: <Edit3 className="w-5 h-5 text-indigo-600" />,
      summary: "Cập nhật linh hoạt thông tin cá nhân, bổ sung hình ảnh chụp thẻ thực tế và ghi chú công tác.",
      steps: [
        "Trong danh sách kho thẻ, bấm trực tiếp vào bất kỳ hàng thẻ nào hoặc bấm biểu tượng 'Sửa (Edit)'.",
        "Modal Chi tiết Thẻ xuất hiện: Cho phép cập nhật Số CCCD, Họ tên, SĐT công dân, Địa chỉ và Vị trí hộp.",
        "Bổ sung ảnh thẻ: Tải lên hình ảnh mặt trước/mặt sau thẻ CCCD để kiểm chứng chứng từ thực tế khi cần.",
        "Thêm Ghi chú (Notes): Ghi nhận các yêu cầu đặc biệt của công dân (ví dụ: 'Người nhà đến nhận thay vào chiều thứ 6')."
      ],
      keywords: ["chỉnh sửa", "edit modal", "ảnh thẻ", "cập nhật", "ghi chú", "chi tiết"],
      targetTab: "tra-the"
    },
    {
      id: "delivery-export-config",
      sectionId: "delivery",
      title: "Xuất Báo Cáo Kho Theo Trạng Thái",
      badge: "Phân hệ 2",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      icon: <Download className="w-5 h-5 text-indigo-600" />,
      summary: "Xuất file Excel báo cáo tổng hợp kho theo từng bộ lọc trạng thái thực tế phục vụ kiểm kê.",
      steps: [
        "Bấm nút 'Xuất Báo Cáo (Export)' tại thanh công cụ Kho.",
        "Tại Modal Cấu hình Xuất Excel, chọn loại dữ liệu muốn xuất: Toàn bộ thẻ trong kho, Chỉ thẻ chưa trả (In Stock), Chỉ thẻ đang giao (Delivering), hoặc Thẻ đã trả thành công (Delivered).",
        "Bấm xác nhận, hệ thống sẽ tải xuống file báo cáo Excel được phân trang và định dạng bảng màu rõ ràng."
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
      icon: <Calendar className="w-5 h-5 text-orange-600" />,
      summary: "Quản lý tập trung các trường hợp công dân đã có giấy hẹn nhưng thẻ chưa về kho hoặc bị lỗi phôi thẻ cần xử lý lại.",
      steps: [
        "Chuyển sang Tab '📑 PHÂN HỆ 3: THEO DÕI GIẤY HẸN' trên thanh điều hướng.",
        "Danh sách hiển thị các hồ sơ đang chờ cấp thẻ (Unissued Cards) hoặc các trường hợp thẻ bị lỗi từ trung tâm cần thu hồi/in lại.",
        "Sử dụng công cụ tìm kiếm và bộ lọc thời gian để lọc ra các giấy hẹn quá hạn (Overdue) nhằm ưu tiên liên hệ giải quyết cho người dân.",
        "Cập nhật trạng thái xử lý sau khi đã phối hợp xong với cơ quan cấp trên."
      ],
      tips: [
        "Rà soát danh sách này định kỳ vào đầu ngày làm việc để chủ động trả lời người dân khi họ đến tra cứu giấy hẹn."
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
      icon: <RefreshCw className="w-5 h-5 text-teal-600" />,
      summary: "Kiểm tra chéo tự động giữa danh sách thẻ thực tế quét tại quầy và kho dữ liệu kỳ vọng để phát hiện chênh lệch.",
      steps: [
        "Chuyển sang Tab '🔄 PHÂN HỆ 4: ĐỐI SÁNH'.",
        "Sử dụng khu vực quét mã đối sánh (hoặc nạp danh sách) để đưa dữ liệu thực tế vào hệ thống.",
        "Hệ thống tự động chạy thuật toán đối chiếu với Kho thẻ hiện có và phân chia kết quả ra 2 bảng riêng biệt:",
        "1. Bảng Dữ liệu Đã Khớp (Matched Data Table): Danh sách các thẻ có mặt đầy đủ trong cả thực tế và dữ liệu kỳ vọng.",
        "2. Bảng Dữ liệu Lệch / Chưa Khớp (Unmatched Data Table): Danh sách các thẻ bị thiếu trong kho hoặc thẻ dư thừa phát sinh ngoài danh sách, giúp nhân viên lập biên bản và tìm nguyên nhân ngay."
      ],
      keywords: ["đối sánh", "matching", "kiểm tra chéo", "khớp", "lệch", "matched", "unmatched", "chênh lệch"],
      targetTab: "doi-sanh"
    },

    // --- QUẢN TRỊ & SAO LƯU ---
    {
      id: "admin-settings-unit",
      sectionId: "admin",
      title: "Cấu Hình Tên Đơn Vị & Tùy Biến Giao Diện",
      badge: "Quản trị",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      icon: <Settings className="w-5 h-5 text-purple-600" />,
      summary: "Tùy chỉnh tên Đơn vị quản lý hiển thị trên toàn hệ thống và các tiêu đề báo cáo Excel xuất ra.",
      steps: [
        "Bấm vào biểu tượng Bánh răng (Settings) ở góc phải trên cùng của Header.",
        "Trong Modal Cài đặt, nhập 'Tên Đơn Vị' (ví dụ: 'Công An Phường 1 - Quận A').",
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
      icon: <FolderPlus className="w-5 h-5 text-purple-600" />,
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
      title: "Xóa Toàn Bộ Dữ Liệu Chuyển Kỳ Làm Việc",
      badge: "Quản trị",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      icon: <Trash2 className="w-5 h-5 text-rose-600" />,
      summary: "Làm sạch toàn bộ dữ liệu trên trình duyệt một cách an toàn để chuẩn bị cho đợt cấp phát mới hoặc sau khi thanh tra.",
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
      id: "tips-camera-https",
      sectionId: "tips",
      title: "Yêu Cầu HTTPS / Localhost Để Mở Camera Quét QR",
      badge: "Khắc phục sự cố",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      icon: <Camera className="w-5 h-5 text-amber-600" />,
      summary: "Giải quyết hiện tượng trình duyệt chặn camera trên điện thoại hoặc máy tính khi test trong mạng nội bộ.",
      steps: [
        "Quy định bảo mật của trình duyệt hiện đại (Chrome/Safari/Edge) BẮT BUỘC trang web phải chạy qua giao thức an toàn 'https://' hoặc đường dẫn 'localhost' thì mới cấp quyền truy cập Camera (thư viện html5-qrcode).",
        "Khi truy cập bằng IP mạng LAN (ví dụ: http://192.168.1.5:3000) trên điện thoại, camera sẽ bị từ chối quyền.",
        "Khắc phục: Sử dụng HTTPS Proxy (ngrok, cloudflared) hoặc truy cập trên GitHub Pages chính thức của đơn vị có chứng chỉ SSL (https)."
      ],
      keywords: ["camera", "https", "localhost", "lỗi camera", "từ chối quyền", "quét qr", "html5-qrcode", "proxy", "ssl"]
    },
    {
      id: "tips-hardware-scanner",
      sectionId: "tips",
      title: "Tối Ưu Quét Siêu Tốc Bằng Đầu Quét Cầm Tay USB/Bluetooth",
      badge: "Mẹo chuyên gia",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      icon: <Zap className="w-5 h-5 text-amber-600" />,
      summary: "Thiết lập không gian làm việc chuyên nghiệp, rảnh tay và đạt tốc độ xử lý hàng trăm thẻ mỗi giờ.",
      steps: [
        "Trang bị đầu quét mã vạch/QR 2D cổng USB hoặc Bluetooth kết nối trực tiếp vào máy tính tại quầy.",
        "Trên ứng dụng, chọn chế độ 'Bật Máy Quét (Device Scanner)'. Đặt con trỏ chuột vào ô nhận dữ liệu.",
        "Gắn điện thoại/máy quét lên giá đỡ cố định, nhân viên chỉ cần đưa thẻ qua vùng quét liên tục mà không cần thao tác chuột.",
        "Bật chế độ 'Buộc chuyển hộp tự động (Force Next Box)' và quy định dung lượng hộp (Cards Per Box) để vừa quét vừa chia hộp hoàn toàn tự động!"
      ],
      keywords: ["máy quét usb", "bluetooth", "rảnh tay", "tốc độ cao", "tối ưu", "mẹo", "siêu tốc", "quét vạch"]
    }
  ], []);

  // Lọc danh sách theo Tab và từ khóa tìm kiếm
  const filteredItems = useMemo(() => {
    return guideItems.filter(item => {
      const matchesSection = activeSection === 'all' || item.sectionId === activeSection;
      if (!matchesSection) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(query);
      const matchSummary = item.summary.toLowerCase().includes(query);
      const matchSteps = item.steps.some(step => step.toLowerCase().includes(query));
      const matchKeywords = item.keywords.some(kw => kw.toLowerCase().includes(query));

      return matchTitle || matchSummary || matchSteps || matchKeywords;
    });
  }, [guideItems, activeSection, searchQuery]);

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-300">

      {/* --- HERO SECTION BANNER --- */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white p-8 lg:p-12 shadow-xl border border-emerald-500/30">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4 animate-pulse text-emerald-400" />
            <span>Tài Liệu Hướng Dẫn Kỹ Thuật & Nghiệp Vụ - Phiên Bản 2026</span>
          </div>

          <h2 className="text-3xl lg:text-5xl font-extrabold tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-teal-200">
            Hệ Thống Quản Lý & Cấp Phát Thẻ Căn Cước Địa Phương (QL-TCC)
          </h2>

          <p className="text-base lg:text-lg text-emerald-100/90 leading-relaxed font-normal max-w-3xl">
            Tài liệu tổng hợp toàn diện giúp Cán bộ nắm vững toàn bộ tính năng của phần mềm: từ quy trình quét mã QR nhập liệu tự động, tổ chức kho thẻ theo Box/Zone, quản lý bàn giao Shipper đến khả năng lưu trữ offline-first với IndexedDB.
          </p>

          {/* AUTHOR INFO BADGE IN HERO */}
          <div className="inline-flex flex-wrap items-center gap-3 sm:gap-4 bg-emerald-950/70 backdrop-blur-md px-4 py-3 rounded-2xl border border-emerald-400/40 text-xs sm:text-sm text-emerald-100 shadow-md">
            <div className="flex items-center gap-2 font-extrabold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Tác giả / Phát triển: Võ Tấn Đạt</span>
            </div>
            <span className="hidden sm:inline text-emerald-500">•</span>
            <div className="flex items-center gap-1.5 text-emerald-100">
              <span className="text-emerald-300 font-semibold">Email:</span> williamdat10@gmail.com
            </div>
            <span className="hidden sm:inline text-emerald-500">•</span>
            <div className="flex items-center gap-1.5 text-amber-300 font-extrabold">
              <span>Zalo góp ý:</span> 0945235799
            </div>
          </div>

          {/* QUICK STATS & BADGES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-center items-center text-center">
              <span className="text-2xl font-black text-emerald-400">4+</span>
              <span className="text-xs font-medium text-emerald-100 mt-1">Phân Hệ Chuyên Sâu</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-center items-center text-center">
              <span className="text-2xl font-black text-teal-300">100%</span>
              <span className="text-xs font-medium text-emerald-100 mt-1">Lưu Trữ Offline-First</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-center items-center text-center">
              <span className="text-2xl font-black text-cyan-300">QR Code</span>
              <span className="text-xs font-medium text-emerald-100 mt-1">Quét Siêu Tốc 2D</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex flex-col justify-center items-center text-center">
              <span className="text-2xl font-black text-amber-300">Google</span>
              <span className="text-xs font-medium text-emerald-100 mt-1">Bảo Mật Whitelist</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- SEARCH & SECTION FILTER BAR --- */}
      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-gray-200 space-y-4 md:space-y-6 static lg:sticky lg:top-20 z-40 backdrop-blur-lg bg-white/95">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              Tra Cứu Hướng Dẫn Chức Năng
            </h3>
            <p className="text-xs text-gray-500">
              Nhập từ khóa công cụ (ví dụ: <span className="font-semibold text-emerald-700">"shipper"</span>, <span className="font-semibold text-emerald-700">"gộp hộp"</span>, <span className="font-semibold text-emerald-700">"webcam"</span>, <span className="font-semibold text-emerald-700">"sao lưu"</span>...)
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm công cụ, tính năng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold bg-gray-200 hover:bg-gray-300 rounded-full w-5 h-5 flex items-center justify-center transition-colors"
                title="Xóa từ khóa"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Section Filter Pills */}
        <div className="flex flex-nowrap overflow-x-auto pb-2 -mx-2 px-2 gap-2 pt-2 border-t border-gray-100 md:flex-wrap md:overflow-visible md:pb-0 md:mx-0 md:px-0 scrollbar-none">
          {[
            { id: 'all', label: "🌟 Tất Cả Các Phần", count: guideItems.length },
            { id: 'overview', label: "💡 Kiến Trúc & Bảo Mật", count: guideItems.filter(i => i.sectionId === 'overview').length },
            { id: 'intake', label: "📥 Phân Hệ 1: Lập Danh Sách", count: guideItems.filter(i => i.sectionId === 'intake').length },
            { id: 'delivery', label: "📤 Phân Hệ 2: Kho & Trả Thẻ", count: guideItems.filter(i => i.sectionId === 'delivery').length },
            { id: 'appointments', label: "📑 Phân Hệ 3: Giấy Hẹn", count: guideItems.filter(i => i.sectionId === 'appointments').length },
            { id: 'matching', label: "🔄 Phân Hệ 4: Đối Sánh", count: guideItems.filter(i => i.sectionId === 'matching').length },
            { id: 'admin', label: "⚙️ Quản Trị & Sao Lưu", count: guideItems.filter(i => i.sectionId === 'admin').length },
            { id: 'tips', label: "🛠️ Mẹo & Khắc Phục Sự Cố", count: guideItems.filter(i => i.sectionId === 'tips').length },
          ].map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as GuideSectionId)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${isActive
                  ? "bg-emerald-600 text-white shadow-md transform scale-102"
                  : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-200"
                  }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? "bg-emerald-700 text-white" : "bg-gray-200 text-gray-600"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* --- GUIDE ITEMS GRID / LIST --- */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto animate-bounce" />
          <h4 className="text-lg font-bold text-gray-700">Không tìm thấy tài liệu hướng dẫn phù hợp</h4>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Không có công cụ nào khớp với từ khóa <span className="font-semibold text-emerald-600">"{searchQuery}"</span> trong phần đã chọn. Hãy thử tìm từ khóa ngắn gọn hơn như "excel", "qr", "hộp", "backup".
          </p>
          <button
            onClick={() => { setSearchQuery(""); setActiveSection("all"); }}
            className="mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            Xem lại tất cả bài viết
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full group"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/80 via-white to-gray-50/40 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-200/80 group-hover:scale-110 transition-transform duration-200 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div className="space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-extrabold border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                    <h4 className="text-base font-bold text-gray-800 group-hover:text-emerald-700 transition-colors leading-snug">
                      {item.title}
                    </h4>
                  </div>
                </div>
              </div>

              {/* Card Body - Summary & Steps */}
              <div className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100 font-normal">
                    {item.summary}
                  </p>

                  <div className="space-y-2.5">
                    <h5 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Quy Trình & Thao Tác Thực Hiện:
                    </h5>
                    <ul className="space-y-2 text-sm text-gray-700 pl-1">
                      {item.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold flex items-center justify-center mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tips Callout */}
                  {item.tips && item.tips.length > 0 && (
                    <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3.5 space-y-1.5 text-amber-900 text-xs">
                      <div className="font-extrabold flex items-center gap-1.5 text-amber-800">
                        <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
                        <span>Mẹo Thực Hành Nhanh:</span>
                      </div>
                      {item.tips.map((tip, idx) => (
                        <p key={idx} className="leading-relaxed pl-5 font-medium text-amber-800/90">
                          • {tip}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer - Target Navigation Button */}
                {item.targetTab && (
                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={() => item.targetTab && onNavigateTab(item.targetTab)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-bold rounded-xl border border-emerald-200 hover:border-emerald-600 transition-all duration-200 shadow-sm group/btn"
                    >
                      <span>Mở ngay thao tác tại Tab</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- DEVELOPER & SUPPORT CONTACT CARD --- */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white rounded-3xl p-6 md:p-8 border border-emerald-200/80 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center lg:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Liên Hệ & Hỗ Trợ Kỹ Thuật</span>
          </div>
          <h4 className="text-xl md:text-2xl font-black text-gray-800">
            Thông Tin Tác Giả & Góp Ý Phát Triển
          </h4>
          <p className="text-sm text-gray-600 max-w-xl leading-relaxed font-normal">
            Phần mềm được phát triển nhằm tối ưu hóa hiệu quả nghiệp vụ cấp phát thẻ Căn cước. Nếu có bất kỳ ý kiến đóng góp, đề xuất nâng cấp tính năng hay cần hỗ trợ kỹ thuật trong quá trình sử dụng, xin vui lòng liên hệ:
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <a
            href="mailto:williamdat10@gmail.com"
            className="flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm rounded-2xl border border-gray-200 shadow-sm hover:shadow transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform font-black text-base">
              ✉
            </div>
            <div className="text-left">
              <div className="text-[10px] text-gray-400 uppercase font-semibold">Email Tác Giả</div>
              <div className="text-blue-600 font-extrabold text-sm">williamdat10@gmail.com</div>
            </div>
          </a>

          <a
            href="https://zalo.me/0945235799"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center group-hover:scale-110 transition-transform text-lg font-black">
              Z
            </div>
            <div className="text-left">
              <div className="text-[10px] text-blue-100 uppercase font-semibold">Zalo Hỗ Trợ & Góp Ý</div>
              <div className="text-white font-extrabold text-base">0945235799 (Võ Tấn Đạt)</div>
            </div>
          </a>
        </div>
      </div>

      {/* --- BOTTOM HELP BANNER --- */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white rounded-2xl p-6 lg:p-8 shadow-lg border border-emerald-800/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-xl font-bold text-white flex items-center justify-center md:justify-start gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Đã Sẵn Sàng Vận Hành Hệ Thống?
          </h4>
          <p className="text-sm text-emerald-200/80 max-w-xl leading-relaxed">
            Hãy bắt đầu bằng việc chuyển sang **Phân hệ 1** để tiến hành quét nhập liệu danh sách CCCD hoặc **Phân hệ 2** để cấu hình kho thẻ ngay hôm nay!
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => onNavigateTab('nhap-lieu')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
          >
            <span>📥 Vào Phân Hệ 1</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateTab('tra-the')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
          >
            <span>📤 Vào Phân Hệ 2</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
