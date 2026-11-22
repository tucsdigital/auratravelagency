import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Instagram, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { CONTACT_INFO, SOCIAL_MEDIA, SITE_NAME, LEGAL_INFO } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-[#143D84] text-white">
      <div className="container mx-auto px-4 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          {/* Logo y descripción */}
          <div className="space-y-4 md:col-span-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center brightness-0 invert">
                <Image
                  src="/images/aura-isotipo.svg"
                  alt={`${SITE_NAME} Isotipo`}
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-body uppercase tracking-wider text-gray-400">Aurra Travel Agency</span>
              </div>
            </div>
            <p className="text-gray-300 font-body text-sm max-w-sm">
              Agencia boutique de viajes. Itinerarios a medida, viajes grupales y asesoramiento integral.
            </p>
          </div>

          {/* Links rápidos */}
          <div className="md:col-span-3">
            <h3 className="font-semibold text-sm mb-4 text-white">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/paquetes" className="text-gray-300 hover:text-white transition-colors">
                  Paquetes
                </Link>
              </li>
              <li>
                <Link href="/#categorias" className="text-gray-300 hover:text-white transition-colors">
                  Destinos
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="md:col-span-4">
            <h3 className="font-semibold text-sm mb-4 text-white">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <span className="text-gray-300">{CONTACT_INFO.direccion}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-white flex-shrink-0" />
                <span className="text-gray-300">{CONTACT_INFO.horario}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-white flex-shrink-0" />
                <span className="text-gray-300">{CONTACT_INFO.telefono}</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-white flex-shrink-0" />
                <span className="text-gray-300">{CONTACT_INFO.email}</span>
              </li>
            </ul>
            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-3 text-white">Seguinos</h3>
              <div className="flex items-center gap-3">
                {SOCIAL_MEDIA.facebook && (
                  <a
                    href={SOCIAL_MEDIA.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Seguinos en Facebook"
                    className="bg-gray-800/80 p-2.5 rounded-full hover:bg-white hover:text-gray-900 transition-colors"
                  >
                    <Facebook className="h-5 w-5" aria-hidden="true" />
                  </a>
                )}
                {SOCIAL_MEDIA.instagram && (
                  <a
                    href={SOCIAL_MEDIA.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Seguinos en Instagram"
                    className="inline-flex items-center gap-2 bg-gray-800/80 px-3 py-2 rounded-full hover:bg-white hover:text-gray-900 transition-colors"
                  >
                    <Instagram className="h-5 w-5" aria-hidden="true" />
                    <span className="text-sm font-medium">@aura.travelagency</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800/80 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-300 text-center md:text-left text-sm">
              &copy; {new Date().getFullYear()} {SITE_NAME}. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3 text-sm">
              <Link 
                href="/terminos-condiciones" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Términos y Condiciones
              </Link>
              <span className="text-gray-500">|</span>
              <span className="text-gray-300">
                Legajo RNAV N° {LEGAL_INFO.legajoRnav}
              </span>
            </div>
          </div>
          <div className="border-t border-gray-800/80 mt-6 pt-5">
            <div className="flex flex-col md:flex-row justify-center items-center gap-3">
              <p className="text-gray-300 text-sm text-center">
                Desarrollado por{' '}
                <a
                  href="https://www.tucsdigital.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-300 transition-colors font-medium"
                >
                  Tucs Digital
                </a>
              </p>
              <a
                href="https://www.instagram.com/tucsdgital"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Seguir a Tucs Digital en Instagram"
                className="bg-gray-800/80 p-2 rounded-full hover:bg-white hover:text-gray-900 transition-colors"
              >
                <Instagram className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

