import type { NextConfig } from 'next';

/** Statyczny eksport. Ścieżkę bazową można ustawić przez NEXT_PUBLIC_BASE_PATH. */
const nextConfig: NextConfig = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
