/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  publicRuntimeConfig: {
    NEXT_PUBLIC_BACKEND_API_BASEURL: process.env.NEXT_PUBLIC_BACKEND_API_BASEURL,
  },
};

module.exports = nextConfig;
