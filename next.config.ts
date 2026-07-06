import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // allowedDevOrigins: ['192.168.31.246'],
  output: 'export',

  // // Tắt tính năng tối ưu ảnh mặc định của máy chủ Next.js vì GitHub Pages không hỗ trợ
  images: {
    unoptimized: true,
  },
  basePath: '/dv-cap',

  // LƯU Ý QUAN TRỌNG VỀ ĐƯỜNG DẪN (BASE PATH):
  // Nếu link GitHub Pages của bạn có dạng: https://[ten-github].github.io/[ten-repo]/
  // Thì bạn PHẢI bỏ comment dòng dưới đây và thay tên repo của bạn vào để web không bị trắng trang.
  // Ví dụ tên repo là "dv-cap"

};

export default nextConfig;
