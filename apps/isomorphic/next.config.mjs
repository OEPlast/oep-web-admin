import './src/env.mjs';
/** @type {import('next').NextConfig} */

// The deployment's own CDN (each store has its own Bunny pull zone), in addition to the fixed list.
const cdnHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_CDN_BASE_URL ? new URL(process.env.NEXT_PUBLIC_CDN_BASE_URL).hostname : null;
  } catch {
    return null;
  }
})();

const nextConfig = {
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'randomuser.me',
        pathname: '/api/portraits/**',
      },
      {
        protocol: 'https',
        hostname: 'cloudflare-ipfs.com',
        pathname: '/ipfs/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/u/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'oeptest.b-cdn.net',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'placeholder.com',
      },
      ...(cdnHost && cdnHost !== 'oeptest.b-cdn.net' ? [{ protocol: 'https', hostname: cdnHost }] : []),
    ],
  },
  reactStrictMode: true,
  transpilePackages: ['core'],
};

export default nextConfig;
