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
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
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
      {
        source: '/categories-sitemap.xml',
        destination: '/categories-sitemap',
      },
      {
        source: '/providers-sitemap.xml',
        destination: '/providers-sitemap',
      },
      {
        source: '/exams-sitemap.xml',
        destination: '/exams-sitemap',
      },
      {
        source: '/blogs-sitemap.xml',
        destination: '/blogs-sitemap',
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
        source: '/exams/microsoft/az-900',
        destination: '/microsoft-azure-fundamentals',
        permanent: true,
      },
      {
        source: '/exams/istqb/ct-act',
        destination: '/istqb-acceptance-testing-ct-act',
        permanent: true,
      },
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
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/api/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'allexamquestions.com',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'api.allexamquestions.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

export default nextConfig;
