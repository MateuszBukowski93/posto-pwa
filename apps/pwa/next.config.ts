import type { NextConfig } from 'next';
import pkg from './package.json' with { type: 'json' };

/**
 * Statyczny eksport (GitHub Pages). Ścieżkę bazową ustawia CI przez NEXT_PUBLIC_BASE_PATH
 * (np. '/posto-pwa'); lokalnie aplikacja działa pod '/'.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
  },
};

export default nextConfig;
