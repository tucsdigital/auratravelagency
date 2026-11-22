'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWhatsAppLink } from '@/lib/utils/whatsapp';

interface NavbarProps {
  transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Si transparent=true, navbar transparente hasta hacer scroll
  // Si transparent=false, navbar siempre blanco
  const navbarClass = transparent
    ? isScrolled
      ? 'bg-white/95 backdrop-blur-md shadow-lg'
      : 'bg-transparent'
    : 'bg-white/95 backdrop-blur-md shadow-sm';

  const textClass = transparent && !isScrolled ? 'text-white' : 'text-gray-900';
  const logoClass = transparent && !isScrolled ? 'brightness-0 invert' : 'brightness-0';

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navbarClass}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className={`w-12 h-12 flex items-center justify-center transition-all duration-300 ${logoClass}`}>
              <Image
                src="/images/aura-isotipo.svg"
                alt="AURA TRAVEL AGENCY Isotipo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <span className={`text-base font-body uppercase tracking-wider transition-colors duration-300 ${textClass}`}>
              Aura Travel Agency
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`font-medium transition-colors ${textClass} hover:opacity-70`}
            >
              Inicio
            </Link>
            <Link
              href="/paquetes"
              className={`font-medium transition-colors ${textClass} hover:opacity-70`}
            >
              Paquetes
            </Link>
            <Link
              href="/#categorias"
              className={`font-medium transition-colors ${textClass} hover:opacity-70`}
            >
              Destinos
            </Link>
            <Link
              href="/contacto"
              className={`font-medium transition-colors ${textClass} hover:opacity-70`}
            >
              Contacto
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              asChild
              className="bg-[#143D84] hover:bg-[#143D84]/90 text-white"
            >
              <a
                href={getWhatsAppLink('Hola! Quiero consultar sobre un viaje.')}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Phone className="mr-2 h-4 w-4" />
                Consultá ahora
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className={textClass} />
            ) : (
              <Menu className={textClass} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                href="/"
                className="block font-medium text-gray-900 hover:text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/paquetes"
                className="block font-medium text-gray-900 hover:text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Paquetes
              </Link>
              <Link
                href="/#categorias"
                className="block font-medium text-gray-900 hover:text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Destinos
              </Link>
              <Link
                href="/contacto"
                className="block font-medium text-gray-900 hover:text-gray-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              <Button
                asChild
                className="w-full bg-[#143D84] hover:bg-[#143D84]/90 text-white"
              >
                <a
                  href={getWhatsAppLink('Hola! Quiero consultar sobre un viaje.')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Consultá ahora
                </a>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

