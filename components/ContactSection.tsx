'use client';

import { motion } from 'framer-motion';
import ContactForm from '@/components/ContactForm';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { CONTACT_INFO } from '@/lib/constants';

interface ContactSectionProps {
  showTitle?: boolean;
  paqueteTitulo?: string;
  paqueteId?: string;
}

export default function ContactSection({ showTitle = true, paqueteTitulo, paqueteId }: ContactSectionProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="container mx-auto px-4 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulario - Ocupa 3 columnas */}
        <motion.div
          className="lg:col-span-1 h-full"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <div className="bg-white/80 rounded-2xl border border-gray-200/70 p-8 lg:p-10 shadow-sm hover:shadow-md transition-all duration-500 backdrop-blur-sm h-full">
            {showTitle && (
              <motion.div className="mb-8" variants={itemVariants}>
                <h2 className="text-lg font-semibold mb-2 text-gray-900">
                  Envíanos tu consulta
                </h2>
                <p className="text-sm md:text-base text-gray-500">
                  Completá el formulario y te contactaremos en menos de 24 horas
                </p>
              </motion.div>
            )}
            <ContactForm paqueteTitulo={paqueteTitulo} paqueteId={paqueteId} />
          </div>
        </motion.div>

        {/* Sidebar - Ocupa 2 columnas */}
        <motion.div
          className="lg:col-span-1 h-full flex flex-col gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Info de contacto */}
          <motion.div className="bg-gray-50 rounded-2xl p-8 flex-1" variants={itemVariants}>
            <h2 className="text-lg font-bold mb-6">Información</h2>
            <div className="space-y-5">
              <motion.div
                className="flex items-start space-x-4 group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-primary p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">Dirección</h3>
                  <p className="text-gray-600 text-sm">{CONTACT_INFO.direccion}</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start space-x-4 group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-primary p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">Horario</h3>
                  <p className="text-gray-600 text-sm">{CONTACT_INFO.horario}</p>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start space-x-4 group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-primary p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Phone className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">Teléfono</h3>
                  <a
                    href={`tel:${CONTACT_INFO.telefono}`}
                    className="text-gray-600 text-sm hover:text-gray-900 transition-colors underline"
                  >
                    {CONTACT_INFO.telefono}
                  </a>
                </div>
              </motion.div>

              <motion.div
                className="flex items-start space-x-4 group"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="bg-primary p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">Email</h3>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="text-gray-600 text-sm hover:text-gray-900 transition-colors underline"
                  >
                    {CONTACT_INFO.email}
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* CTA WhatsApp */}
          <motion.div
            className="bg-primary rounded-2xl p-8 text-white text-center overflow-hidden relative group flex-1"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            <div className="absolute inset-0 bg-secondary/15 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <h3 className="text-lg font-bold text-secondary mb-3">¿Preferís hablar directo?</h3>
              <p className="text-sm md:text-base text-[#F9FAFB] mb-6 leading-relaxed">
                Contactanos por WhatsApp y te respondemos al instante
              </p>
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-[#25D366] hover:bg-[#20BA5A] text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 w-full hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Abrir WhatsApp
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

