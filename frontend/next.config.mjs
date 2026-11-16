import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const backendInternalUrl = process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';
if (process.env.VERCEL === '1') {
  if (!process.env.API_INTERNAL_URL || !process.env.SITE_URL) {
    throw new Error('Isi API_INTERNAL_URL dan SITE_URL pada project frontend Vercel sebelum deploy.');
  }
  const backend = new URL(backendInternalUrl);
  const frontend = new URL(process.env.SITE_URL);
  if (backend.protocol !== 'https:' || frontend.protocol !== 'https:' || backend.origin === frontend.origin) {
    throw new Error('SITE_URL harus domain HTTPS frontend dan API_INTERNAL_URL harus domain HTTPS backend yang berbeda.');
  }
}

// Parse allowed image hosts from environment
const allowedHosts = (process.env.IMAGE_ALLOWED_HOSTS || 'lh3.googleusercontent.com,images.unsplash.com')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig = {
  transpilePackages: ['@konter/shared'],
  outputFileTracingRoot: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  devIndicators: false,
  images: {
    remotePatterns: allowedHosts.map((hostname) => ({
      protocol: 'https',
      hostname,
      pathname: '/**',
    })),
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendInternalUrl.replace(/\/api\/v1\/?$/, '')}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;

