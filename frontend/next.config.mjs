/** @type {import('next').NextConfig} */
const backendInternalUrl = process.env.API_INTERNAL_URL || 'http://localhost:4000/api/v1';

// Parse allowed image hosts from environment
const allowedHosts = (process.env.IMAGE_ALLOWED_HOSTS || 'lh3.googleusercontent.com,images.unsplash.com')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

const nextConfig = {
  transpilePackages: ['@konter/shared'],
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

