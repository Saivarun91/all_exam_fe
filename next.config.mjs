/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  // Optimize production builds (swcMinify is default in Next.js 16, no need to specify)
  compress: true,
  // Configure Turbopack for Next.js 16 (empty config to allow webpack for production builds)
  turbopack: {},
  // Optimize webpack to reduce HTTP requests (for production builds)
  webpack: (config, { isServer, dev }) => {
    if (!isServer && !dev) {
      // Optimize chunk splitting to reduce HTTP requests in production
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          maxInitialRequests: 20, // Limit initial chunks
          maxAsyncRequests: 20, // Limit async chunks
          cacheGroups: {
            default: false,
            vendors: false,
            // Combine all vendor chunks into one
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
            },
            // Combine common chunks
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Combine framework chunks
            framework: {
              name: 'framework',
              test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
              chunks: 'all',
              priority: 30,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
  // Enable experimental features for better optimization
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-accordion',
      '@radix-ui/react-alert-dialog',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'framer-motion',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/sitemap.xml',
        destination: '/sitemap',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.allexamquestions.com',
          },
        ],
        destination: 'https://allexamquestions.com/:path*',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com', // Allow Cloudinary images
        pathname: '/**', // Allow all paths from Cloudinary
      },
    ],
  },
};

export default nextConfig;
