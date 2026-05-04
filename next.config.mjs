/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  compress: true,
  poweredByHeader: false,
  compiler: {
    // Keep warn/error logs while trimming other console calls in production bundles.
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  // Use Next.js default chunking (custom splitChunks with chunks:'all' was merging too much
  // into the initial load → higher script eval time and worse TBT).
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
      // {
      //   source: '/:slug',
      //   destination: '/categories/:slug',
      // },
      

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
