'use client';

import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Paquete } from '@/types';
import { getPackageFeatures } from '@/lib/utils/packageFeatures';

interface PaqueteHeroProps {
  paquete: Paquete;
  shareUrl: string;
}

export default function PaqueteHero({ paquete, shareUrl }: PaqueteHeroProps) {
  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: paquete.titulo,
          text: `Mirá este paquete: ${paquete.titulo}`,
          url: shareUrl,
        });
      } catch {
        // Usuario canceló o error
      }
    } else {
      // Fallback: copiar al clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Enlace copiado al portapapeles');
      } catch {
        toast.error('No se pudo copiar el enlace');
      }
    }
  };

  // Obtener features del paquete
  const features = getPackageFeatures(paquete.incluye || [], 4);

  return (
    <div className="relative h-[500px] md:h-[600px]">
      <Image
        src={paquete.imagenPrincipal || '/images/placeholder-package.jpg'}
        alt={paquete.titulo}
        fill
        className="object-cover"
        priority
        quality={100}
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      
      {/* Botón de Compartir - Reubicado abajo a la derecha */}
      <button
        onClick={handleShare}
        className="absolute bottom-6 right-6 md:bottom-8 md:right-8 bg-white/95 backdrop-blur-sm hover:bg-white text-gray-900 p-3 rounded-full transition-all hover:scale-110 shadow-lg z-20"
        title="Compartir paquete"
      >
        <Share2 className="h-5 w-5" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 pb-8 md:pb-12">
        <div className="container mx-auto">
          <div className="flex items-center flex-wrap gap-2 mb-4">
            <Badge className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/20 border border-white/30 text-sm">
              {paquete.tipo === 'individual' ? 'Individual' : paquete.tipo === 'grupal' ? 'Grupal' : 'A Medida'}
            </Badge>
            {paquete.destacado && (
              <Badge className="bg-white/20 text-white backdrop-blur-sm hover:bg-white/20 border border-white/30 text-sm">
                Destacado
              </Badge>
            )}
          </div>
          <h1 className="text-lg font-semibold text-white mb-3 md:mb-4 leading-tight">{paquete.titulo}</h1>
          
          {/* Iconos de servicios - solo iconos */}
          {features.length > 0 && (
            <div className="flex gap-2 mb-4">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center bg-white/20 backdrop-blur-sm text-white rounded-lg p-2.5 border border-white/30"
                  title={feature.label}
                >
                  <span className="text-white">{feature.icon}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 md:gap-6 text-white text-sm md:text-base">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 md:h-5 md:w-5 mr-2 text-white" />
              {paquete.destino}
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 md:h-5 md:w-5 mr-2 text-white" />
              {paquete.duracion}
            </div>
            <div className="text-base md:text-lg font-semibold text-white">
              {paquete.mostrarDesde && <span className="text-sm md:text-base font-normal mr-1">Desde</span>}
              {paquete.moneda || 'ARS'} ${paquete.precio.toLocaleString('es-AR')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

