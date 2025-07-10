import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/app/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      new URL('https://s3-inventorymanagement.s3.us-east-2.amazonaws.com/**'),
    ],
  },
};

export default withNextIntl(nextConfig);