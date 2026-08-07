<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:ql-tcc-agent-rules -->
# Hướng dẫn Phát triển Dự án QL-TCC (Agent Rules)

## 1. Công nghệ & Framework
- **Next.js & React phiên bản mới nhất**: Hệ thống sử dụng **Next.js 16.2.10** và **React 19.2.4** (Kiến trúc App Router). Cần đặc biệt chú ý đến các Breaking Changes của phiên bản mới, không sử dụng các API/Hooks đã lỗi thời (deprecated).
- **Styling**: Sử dụng **Tailwind CSS v4** kết hợp PostCSS.
- **Xử lý Dữ liệu Local (Offline-first)**: Ứng dụng phụ thuộc vào IndexedDB. Mọi thao tác truy xuất, lưu trữ liên quan đến Kho thẻ, Danh sách quét phải đi qua `dexie` và `dexie-react-hooks`.
- **Biểu tượng (Icons)**: Đồng bộ sử dụng thư viện `lucide-react`.

## 2. Cấu trúc Thư mục (Feature-based Architecture)
- Luôn chia theo tính năng:
  - `/src/features/intake`: Tính năng lập danh sách, quét mã nhập liệu.
  - `/src/features/delivery`: Tính năng kho thẻ, quản lý shipper, trả thẻ và xuất Excel.
  - `/src/features/appointments`: Tính năng theo dõi giấy hẹn, xử lý lỗi.
- `/src/shared/`: Mọi tài nguyên dùng chung (UI components, utils, hooks, context).
- Tuyệt đối không đặt logic lộn xộn giữa các phân hệ.

## 3. Tư duy & Xử lý Nhiệm vụ
- **Luôn lập Kế hoạch (Plan)**: Trước khi sửa đổi logic phức tạp, Agent phải phân tích và đưa ra kế hoạch để người dùng duyệt trước.
- **Sửa đúng trọng tâm**: Chỉ chỉnh sửa các file liên quan trực tiếp đến nhiệm vụ. Không tự ý thay đổi file ngoài phạm vi.

## 4. Kiểm thử & Thiết bị
- **Quyền Camera**: Tính năng quét QR (`html5-qrcode`) yêu cầu môi trường an toàn. Phải nhắc người dùng test qua proxy `https://` hoặc `localhost`.
- **Tối ưu Mobile**: Giao diện phải Responsive 100%, ưu tiên trải nghiệm quét mã trên điện thoại di động trước.

## 5. Quản lý Mã nguồn (Git & Versioning)
- **TUYỆT ĐỐI KHÔNG TỰ Ý PUSH CODE**: Không bao giờ tự động chạy các lệnh `git commit` hay `git push` sau khi hoàn thành công việc. CHỈ push code lên GitHub khi nào người dùng CÓ YÊU CẦU RÕ RÀNG.
- **Tự động cập nhật Version**: Bắt buộc nâng phiên bản trong file `package.json` theo Semantic Versioning (patch/minor/major) TRƯỚC KHI thực hiện yêu cầu commit & push code lên GitHub của người dùng.

## 6. UI/UX & Trải nghiệm
- **Thiết kế chỉn chu**: Giao diện hiện đại, chuyên nghiệp, có hiệu ứng (hover, transition).
- **Phản hồi rõ ràng**: Mọi thao tác (đặc biệt là quét mã, lưu kho, xóa dữ liệu) phải có thông báo trực quan bằng thư viện `react-hot-toast`.
## 7. Quy chuẩn Thuật ngữ
- **Số định danh**: Nếu nói đến số, gọi là **"số ĐDCN"**. Tuyệt đối không dùng từ "CCCD" trừ trường hợp có chỉ định đặc biệt từ người dùng.
- **Thẻ**: Nếu nói đến thẻ cứng, gọi là **"Thẻ Căn cước"**.

<!-- END:ql-tcc-agent-rules -->
