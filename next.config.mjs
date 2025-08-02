/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle HashConnect SSR issues
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
        fs: false,
        path: false,
        os: false,
      };
      
      // Ignore critical dependency warnings for HashConnect
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        {
          module: /node_modules\/@hashgraph\/hedera-wallet-connect/,
        },
        {
          module: /node_modules\/hashconnect/,
        },
      ];
    }
    return config;
  },
}

export default nextConfig
