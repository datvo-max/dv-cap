import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

// Tự động sinh file version.json và currentVersion.ts mỗi khi chạy dev hoặc build
try {
  const pkgPath = path.join(process.cwd(), "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const versionInfo = {
    version: pkg.version || "1.0.0",
    buildTime: Date.now(),
  };

  const publicDir = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(publicDir, "version.json"),
    JSON.stringify(versionInfo, null, 2)
  );

  const libDir = path.join(process.cwd(), "src", "shared", "lib");
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(libDir, "currentVersion.ts"),
    `// File tự động sinh bởi next.config.ts tại thời điểm build/dev\nexport const CURRENT_VERSION = ${JSON.stringify(versionInfo, null, 2)} as const;\n`
  );
  console.log("✅ Đã sinh mốc phiên bản hệ thống QL-TCC:", versionInfo.version, `(${new Date(versionInfo.buildTime).toLocaleString("vi-VN")})`);
} catch (error) {
  console.error("⚠️ Lỗi khi sinh mốc phiên bản:", error);
}

const nextConfig: NextConfig = {
  /* config options here */
  // allowedDevOrigins: ['192.168.31.246'],
};

export default nextConfig;


