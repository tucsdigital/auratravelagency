import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Categoria, Paquete } from '@/types';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import PaqueteCard from '@/components/PaqueteCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import type { Metadata } from 'next';
import { serializeFirestoreData } from '@/lib/utils/serialize';

// Revalidación dinámica - actualiza instantáneamente
export const revalidate = 0;
export const dynamic = 'force-dynamic';


async function getCategoria(slug: string): Promise<Categoria | null> {
  try {
    // Query simplificada
    const q = query(
      collection(db, 'categorias'),
      where('slug', '==', slug)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    
    const categoria = serializeFirestoreData<Categoria>({ 
      id: snapshot.docs[0].id, 
      ...snapshot.docs[0].data() 
    });
    
    // Verificar que esté activa
    if (!categoria.activa) return null;
    
    return categoria;
  } catch (error) {
    console.error('Error fetching categoria:', error);
    return null;
  }
}

async function getPaquetesByCategoria(categoriaId: string): Promise<Paquete[]> {
  try {
    const byPrincipal = query(
      collection(db, 'paquetes'),
      where('categoriaId', '==', categoriaId)
    );
    const byMultiple = query(
      collection(db, 'paquetes'),
      where('categoriaIds', 'array-contains', categoriaId)
    );
    const [snapshotPrincipal, snapshotMultiple] = await Promise.all([
      getDocs(byPrincipal),
      getDocs(byMultiple),
    ]);
    const paquetesMap = new Map<string, Paquete>();
    snapshotPrincipal.docs.forEach((doc) => {
      const paquete = serializeFirestoreData<Paquete>({ id: doc.id, ...doc.data() });
      paquetesMap.set(paquete.id, paquete);
    });
    snapshotMultiple.docs.forEach((doc) => {
      const paquete = serializeFirestoreData<Paquete>({ id: doc.id, ...doc.data() });
      paquetesMap.set(paquete.id, paquete);
    });
    return Array.from(paquetesMap.values())
      .filter((paq) => paq.visible)
      .sort((a, b) => a.orden - b.orden);
  } catch (error) {
    console.error('Error fetching paquetes:', error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categoria = await getCategoria(slug);
  
  if (!categoria) {
    return {
      title: 'Categoría no encontrada',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://auratravelagency.com';
  const url = `${siteUrl}/categoria/${slug}`;

  return {
    title: `${categoria.nombre} - AURA TRAVEL AGENCY`,
    description:
      categoria.descripcion ||
      `Descubre los mejores paquetes turísticos en ${categoria.nombre} con AURA TRAVEL AGENCY.`,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      url,
      title: `${categoria.nombre} - AURA TRAVEL AGENCY`,
      description:
        categoria.descripcion ||
        `Descubre los mejores paquetes turísticos en ${categoria.nombre} con AURA TRAVEL AGENCY.`,
      siteName: 'AURA TRAVEL AGENCY',
      locale: 'es_AR',
      images: categoria.imagen ? [
        {
          url: categoria.imagen,
          width: 1200,
          height: 630,
          alt: categoria.nombre,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${categoria.nombre} - AURA TRAVEL AGENCY`,
      description:
        categoria.descripcion ||
        `Descubre los mejores paquetes turísticos en ${categoria.nombre} con AURA TRAVEL AGENCY.`,
      images: categoria.imagen ? [categoria.imagen] : [],
    },
    keywords: [
      categoria.nombre,
      'viajes',
      'turismo',
      'paquetes turísticos',
      'destinos',
      'AURA TRAVEL AGENCY',
    ],
  };
}

export default async function CategoriaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoria = await getCategoria(slug);

  if (!categoria) {
    notFound();
  }

  const paquetes = await getPaquetesByCategoria(categoria.id);

  return (
    <>
      <Navbar transparent={true} />
      <WhatsAppButton />

      <Hero
        title={categoria.nombre}
        subtitle={categoria.descripcion}
        backgroundImage={categoria.imagen}
        height="md"
        showOverlay={true}
        overlayClassName="bg-black/45"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {paquetes.length > 0 ? (
            <>
              <div className="text-center mb-12">
                <h2 className="text-lg font-bold mb-4">Paquetes Disponibles</h2>
                <p className="text-sm md:text-base text-gray-600">
                  {paquetes.length} {paquetes.length === 1 ? 'paquete disponible' : 'paquetes disponibles'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {paquetes.map((paquete, index) => (
                  <PaqueteCard key={paquete.id} paquete={paquete} index={index} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-base md:text-lg font-semibold mb-4">No hay paquetes disponibles</h3>
              <p className="text-sm md:text-base text-gray-600">
                Por el momento no hay paquetes en esta categoría. ¡Consultanos para armar tu viaje a medida!
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
