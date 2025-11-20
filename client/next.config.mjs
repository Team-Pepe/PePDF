/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['http://54.224.108.173'],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    // Configuración para Turbopack
    resolveAlias: {
      'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.mjs',
    },
  },
  webpack: (config, { isServer }) => {
    // Handle PDF.js worker para webpack (fallback)
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist/build/pdf.worker.entry': 'pdfjs-dist/build/pdf.worker.mjs',
      }
    }
    return config
  },
}

export default nextConfig
