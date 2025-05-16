import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['placehold.co'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('sqlite3')
    }
    return config
  },
};

export default nextConfig;
