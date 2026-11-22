'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string; // Fallback para compatibilidad
  backgroundImageMobile?: string;
  backgroundImageDesktop?: string;
  ctaText?: string;
  ctaLink?: string;
  height?: 'sm' | 'md' | 'lg' | 'xl';
  showOverlay?: boolean;
  overlayClassName?: string;
  showContent?: boolean;
}

export default function Hero({
  title,
  subtitle,
  backgroundImage,
  backgroundImageMobile,
  backgroundImageDesktop,
  ctaText,
  ctaLink,
  height = 'lg',
  showOverlay = true,
  overlayClassName = 'bg-[#143D84]/60',
  showContent = true,
}: HeroProps) {
  const heightClasses = {
    sm: 'h-[400px]',
    md: 'h-[500px]',
    lg: 'h-[600px]',
    xl: 'h-[700px]',
  };

  // Determinar qué imágenes usar
  const mobileImage = backgroundImageMobile || backgroundImage || '/images/hero-default.jpg';
  const desktopImage = backgroundImageDesktop || backgroundImage || '/images/hero-default.jpg';

  return (
    <div className={`relative ${heightClasses[height]} flex items-center justify-center overflow-hidden`}>
      {/* Background Image Mobile - Optimizado con Next.js Image */}
      <div className="absolute inset-0 md:hidden">
        <Image
          src={mobileImage}
          alt=""
          fill
          priority
          fetchPriority="high"
          className="object-cover"
          quality={85}
          sizes="100vw"
        />
        {showOverlay && <div className={`absolute inset-0 ${overlayClassName}`} />}
      </div>
      {/* Background Image Desktop - Optimizado con Next.js Image */}
      <div className="hidden md:block absolute inset-0">
        <Image
          src={desktopImage}
          alt=""
          fill
          priority
          fetchPriority="high"
          className="object-cover"
          quality={85}
          sizes="100vw"
        />
        {showOverlay && <div className={`absolute inset-0 ${overlayClassName}`} />}
      </div>

      {/* Content */}
      {showContent && (
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h1 className="text-lg font-bold leading-tight text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="text-base md:text-lg text-gray-200 max-w-3xl mx-auto">
                {subtitle}
              </p>
            )}
            {ctaText && ctaLink && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <Button
                  asChild
                  size="lg"
                  className="bg-[#143D84] text-white hover:bg-[#143D84]/90 text-base font-semibold px-8 py-6"
                >
                  <a href={ctaLink}>
                    {ctaText}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-white rounded-full flex items-start justify-center p-2"
        >
          <div className="w-1 h-3 bg-white rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
}

