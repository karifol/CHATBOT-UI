import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: '/chatbot', // 静的サイトホスティングでサブディレクトリに配置する場合に使用
};

export default nextConfig;
