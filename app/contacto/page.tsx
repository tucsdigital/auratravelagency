import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import ContactSection from '@/components/ContactSection';
import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://auratravelagency.com';

export const metadata: Metadata = {
  title: 'Contacto - AURA TRAVEL AGENCY',
  description: 'Contactate con AURA TRAVEL AGENCY. Atencion con cita previa en Palermo (CABA) y Bolivar (Buenos Aires). Consultas por WhatsApp o email.',
  alternates: {
    canonical: `${siteUrl}/contacto`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/contacto`,
    title: 'Contacto - AURA TRAVEL AGENCY',
    description: 'Contactate con AURA TRAVEL AGENCY. Atencion con cita previa en Palermo (CABA) y Bolivar (Buenos Aires).',
    siteName: 'AURA TRAVEL AGENCY',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary',
    title: 'Contacto - AURA TRAVEL AGENCY',
    description: 'Contactate con AURA TRAVEL AGENCY. Atencion con cita previa en Palermo (CABA) y Bolivar (Buenos Aires).',
  },
  keywords: ['contacto', 'agencia de viajes', 'Palermo', 'CABA', 'Bolivar', 'consultas viajes'],
};

export default function ContactoPage() {
  return (
    <>
      <Navbar />
      <WhatsAppButton />

      <div className="min-h-screen">
        {/* Hero minimalista */}
        <section className="relative bg-primary text-white pt-24 pb-12 md:pt-32 md:pb-16">
          <div className="container mx-auto px-4 md:px-6 lg:px-8">
            <div className="mx-auto text-center md:text-left">
              <h1 className="text-lg font-bold mb-3 md:mb-4 font-heading leading-tight text-white">
                Contactanos
              </h1>
              <p className="text-sm md:text-base text-gray-300 font-body leading-relaxed">
                Estamos para ayudarte a planificar tu viaje ideal. Dejanos tu consulta y te responderemos a la brevedad.
              </p>
            </div>
          </div>
        </section>

        {/* Sección de contacto */}
        <ContactSection showTitle={true} />
      </div>

      <Footer />
    </>
  );
}
