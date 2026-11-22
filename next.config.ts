import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      // URLs antiguas de Vercel Blob (migración a R2: siguen funcionando hasta actualizar datos)
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 año
  },
  // Configuración para uploads grandes
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Optimizar compilación para navegadores modernos
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Configuración de transpilación para reducir JavaScript antiguo
  transpilePackages: [],
  // Optimización de compilación - reducir transpilación para navegadores modernos
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Configuración de webpack para optimizar polyfills
  webpack: (config, { isServer }) => {
    // Reducir polyfills innecesarios
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;
