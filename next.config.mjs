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
      {
        source: '/sitemap-:locale.xml',
        destination: '/sitemap/pages/:locale',
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
      {
        source: '/:locale/sitemap.xml',
        destination: '/sitemap/:locale',
      },
      {
        source: '/:locale/categories-sitemap.xml',
        destination: '/categories-sitemap?locale=:locale',
      },
      {
        source: '/:locale/providers-sitemap.xml',
        destination: '/providers-sitemap?locale=:locale',
      },
      {
        source: '/:locale/exams-sitemap.xml',
        destination: '/exams-sitemap?locale=:locale',
      },
      {
        source: '/:locale/blogs-sitemap.xml',
        destination: '/blogs-sitemap?locale=:locale',
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
  // Next.js 16 uses Turbopack by default — aliases must live here, not in `webpack`.
  turbopack: {
    resolveAlias: {
      "@/components/i18n/CourseTitleText": "./src/components/i18n/AutoText.jsx",
      "@/components/i18n/ProviderNameText": "./src/components/i18n/AutoText.jsx",
      "@/components/i18n/CategoryTitleText": "./src/components/i18n/AutoText.jsx",
    },
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
