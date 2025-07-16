import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/app/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/api/product-image/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3001',
        pathname: '/api/product-image/**',
      },
    ],
  },
} as import('next').NextConfig;

export default withNextIntl(nextConfig);