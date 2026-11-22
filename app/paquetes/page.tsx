import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Paquete, Categoria } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppButton from '@/components/WhatsAppButton';
import PaquetesClient from '@/components/PaquetesClient';
import type { Metadata } from 'next';
import { serializeFirestoreData } from '@/lib/utils/serialize';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://auratravelagency.com';

export const metadata: Metadata = {
  title: 'Paquetes Turísticos - AURA TRAVEL AGENCY',
  description: 'Explora nuestros paquetes turísticos nacionales e internacionales, viajes grupales y a medida con asesoramiento boutique.',
  alternates: {
    canonical: `${siteUrl}/paquetes`,
  },
  openGraph: {
    type: 'website',
    url: `${siteUrl}/paquetes`,
    title: 'Paquetes Turísticos - AURA TRAVEL AGENCY',
    description: 'Explora nuestros paquetes turísticos nacionales e internacionales, viajes grupales y a medida.',
    siteName: 'AURA TRAVEL AGENCY',
    locale: 'es_AR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paquetes Turísticos - AURA TRAVEL AGENCY',
    description: 'Explora nuestros paquetes turísticos nacionales e internacionales.',
  },
  keywords: ['paquetes turísticos', 'viajes', 'destinos', 'turismo', 'vacaciones', 'AURA TRAVEL AGENCY'],
};

// Revalidación dinámica - actualiza instantáneamente
export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function getPaquetes(): Promise<Paquete[]> {
  try {
    console.log('🔍 Iniciando obtención de paquetes...');
    console.log('📊 DB configurado:', !!db);
    
    // Primero intentamos obtener todos los paquetes
    const snapshot = await getDocs(collection(db, 'paquetes'));
    
    console.log('📦 Total de paquetes en Firestore:', snapshot.size);
    console.log('📄 Documentos obtenidos:', snapshot.docs.length);
    
    if (snapshot.empty) {
      console.warn('⚠️ No se encontraron documentos en la colección "paquetes"');
      return [];
    }
    
    // Log de cada documento antes de procesar
    snapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`Documento ${index}:`, {
        id: doc.id,
        titulo: data.titulo,
        visible: data.visible,
        tipo: typeof data.visible
      });
    });
    
    // Filtrar y ordenar en memoria para evitar necesitar índices compuestos
    const paquetes = snapshot.docs
      .map((doc) => {
        const rawData = { id: doc.id, ...doc.data() };
        const serialized = serializeFirestoreData<Paquete>(rawData);
        return serialized;
      })
      .filter(paquete => {
        const isVisible = paquete.visible === true;
        if (!isVisible) {
          console.log(`❌ Paquete "${paquete.titulo}" no es visible:`, paquete.visible);
        }
        return isVisible;
      })
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    console.log('✅ Paquetes visibles después de filtrar:', paquetes.length);
    
    if (paquetes.length > 0) {
      console.log('✨ Primer paquete visible:', {
        titulo: paquetes[0].titulo,
        destino: paquetes[0].destino,
        precio: paquetes[0].precio,
        visible: paquetes[0].visible
      });
    } else {
      console.warn('⚠️ No hay paquetes con visible=true');
    }
    
    return paquetes;
  } catch (error) {
    console.error('❌ Error fetching paquetes:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return [];
  }
}

async function getCategorias(): Promise<Categoria[]> {
  try {
    const snapshot = await getDocs(collection(db, 'categorias'));
    console.log('📂 Total de categorías en Firestore:', snapshot.size);
    
    const categorias = snapshot.docs
      .map((doc) => serializeFirestoreData<Categoria>({ id: doc.id, ...doc.data() }))
      .filter(categoria => categoria.activa === true)
      .sort((a, b) => (a.orden || 0) - (b.orden || 0));
    
    console.log('✅ Categorías activas:', categorias.length);
    
    return categorias;
  } catch (error) {
    console.error('❌ Error fetching categorias:', error);
    return [];
  }
}

export default async function PaquetesPage() {
  const [paquetes, categorias] = await Promise.all([
    getPaquetes(),
    getCategorias(),
  ]);

  return (
    <>
      <Navbar />
      <WhatsAppButton />

      {/* Hero Section - Optimizado para mobile y desktop */}
      <section className="relative bg-primary text-white pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="mx-auto text-center md:text-left">
            <h1 className="text-lg font-bold mb-3 md:mb-4 font-heading leading-tight text-white">
              Todos Nuestros Paquetes
            </h1>
            <p className="text-sm md:text-base text-gray-300 font-body leading-relaxed">
              Descubre los mejores destinos turísticos con paquetes diseñados para ti
            </p>
          </div>
        </div>
      </section>

      {/* Paquetes con Filtros */}
      <PaquetesClient paquetes={paquetes} categorias={categorias} />

      <Footer />
    </>
  );
}

