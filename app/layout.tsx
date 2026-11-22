import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { SITE_NAME, CONTACT_INFO } from '@/lib/constants';
import SchemaOrg from '@/components/SchemaOrg';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://auratravelagency.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${SITE_NAME} - Agencia de Viajes Boutique`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Agencia boutique de viajes en Palermo (CABA) y Bolivar (Buenos Aires). Viajes grupales, a medida y asesoramiento integral. Consultá y organizá tu próximo viaje.',
  keywords: [
    'viajes',
    'turismo',
    'paquetes turísticos',
    'agencia de viajes',
    'viajes Palermo',
    'viajes CABA',
    'viajes Bolivar',
    'viajes Buenos Aires',
    'viajes internacionales',
    'viajes nacionales',
    'salidas grupales',
    'viajes a medida',
    'destinos turísticos',
    'vacaciones',
    'turismo Argentina',
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: siteUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Agencia de Viajes Boutique`,
    description:
      'Agencia boutique de viajes en Palermo (CABA) y Bolivar (Buenos Aires). Viajes grupales, a medida y asesoramiento integral.',
    images: [
      {
        url: `${siteUrl}/images/aura-logo.svg`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} - Agencia de Viajes Boutique`,
    description:
      'Agencia boutique de viajes en Palermo (CABA) y Bolivar (Buenos Aires). Viajes grupales, a medida y asesoramiento integral.',
    images: [`${siteUrl}/images/aura-logo.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Agregar cuando tengas Google Search Console
    // google: 'tu-codigo-de-verificacion',
  },
  category: 'travel',
  classification: 'Travel Agency',
  other: {
    'contact:phone_number': CONTACT_INFO.telefono,
    'contact:email': CONTACT_INFO.email,
    'contact:address': CONTACT_INFO.direccion,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${montserrat.variable}`}>
      <head>
        {/* Preconnect para orígenes críticos - ordenados por prioridad */}
        {/* Firebase - crítico para páginas admin, diferido para páginas públicas */}
        <link rel="preconnect" href="https://firestore.googleapis.com" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        <link rel="dns-prefetch" href="https://identitytoolkit.googleapis.com" />
        
        {/* Cloudflare R2 - para imágenes */}
        {process.env.R2_PUBLIC_BASE && (
          <>
            <link rel="preconnect" href={process.env.R2_PUBLIC_BASE} />
            <link rel="dns-prefetch" href={process.env.R2_PUBLIC_BASE} />
          </>
        )}
        
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="font-body antialiased">
        <SchemaOrg />
        <main id="main-content">
          {children}
        </main>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: { 
              zIndex: 99999,
            },
            className: 'bg-white border border-gray-200 shadow-lg',
          }}
          style={{
            zIndex: 99999,
          }}
        />
      </body>
    </html>
  );
}
