import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // dev-сервер открывается через прокси превью (https://<port>-<id>.e2b.app),
  // поэтому разрешаем кросс-оригин запросы к dev-ассетам
  allowedDevOrigins: ["*.e2b.app", "localhost:3000", "127.0.0.1:3000"],
  devIndicators: false,
};

export default nextConfig;
