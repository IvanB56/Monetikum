import type {NextConfig} from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      '@phosphor-icons/react',
      '@mantine/core',
      '@mantine/hooks'
    ]
  },
  // Проксирует браузерные запросы ($api/axios, baseURL=NEXT_PUBLIC_API_URL=/api/proxy)
  // через Next.js-сервер на тестовый инстанс старого backend — без этого браузер
  // упрётся в CORS у test.monetikum.ru. Серверные запросы (serverFetch) идут в API_URL напрямую.
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${process.env.API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
