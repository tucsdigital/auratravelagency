import { isR2Url } from '@/lib/r2';

/**
 * Indica si la URL es de nuestro almacenamiento (R2) y puede eliminarse por API.
 */
export function isStorageUrl(imageUrl: string | undefined): boolean {
  return !!imageUrl && isR2Url(imageUrl);
}

/**
 * Elimina una imagen de Cloudflare R2
 * @param imageUrl URL pública de la imagen a eliminar (dominio r2.dev)
 * @returns Promise<boolean> true si se eliminó correctamente
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl || !isR2Url(imageUrl)) {
      console.warn('URL de imagen inválida o no es de R2:', imageUrl);
      return false;
    }

    const response = await fetch(`/api/delete-image?url=${encodeURIComponent(imageUrl)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Error al eliminar imagen:', error);
      return false;
    }

    console.log('Imagen eliminada correctamente:', imageUrl);
    return true;
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return false;
  }
}

/**
 * Elimina múltiples imágenes de R2
 * @param imageUrls Array de URLs de imágenes a eliminar
 * @returns Promise<number> Cantidad de imágenes eliminadas exitosamente
 */
export async function deleteMultipleImages(imageUrls: string[]): Promise<number> {
  if (!imageUrls?.length) {
    return 0;
  }

  const validUrls = imageUrls.filter((url) => url && isR2Url(url));

  if (validUrls.length === 0) {
    console.warn('No hay URLs válidas de R2 para eliminar');
    return 0;
  }

  console.log(`Eliminando ${validUrls.length} imágenes de R2...`);

  const deletePromises = validUrls.map((url) => deleteImage(url));
  const results = await Promise.all(deletePromises);
  const successCount = results.filter(Boolean).length;

  console.log(`${successCount} de ${validUrls.length} imágenes eliminadas correctamente`);
  return successCount;
}

/**
 * Extrae todas las URLs de imágenes de un paquete (para eliminar de R2)
 * @param paquete Objeto paquete con imagenPrincipal, imagenTarjeta y galeria
 * @returns Array de URLs de imágenes
 */
export function extractPackageImageUrls(paquete: {
  imagenPrincipal?: string;
  imagenTarjeta?: string;
  galeria?: string[];
}): string[] {
  const urls: string[] = [];
  const seen = new Set<string>();

  const add = (url: string | undefined) => {
    if (url && !seen.has(url)) {
      seen.add(url);
      urls.push(url);
    }
  };

  add(paquete.imagenTarjeta);
  add(paquete.imagenPrincipal);
  if (paquete.galeria?.length) {
    paquete.galeria.forEach(add);
  }

  return urls;
}

/**
 * Extrae la URL de imagen de una categoría
 * @param categoria Objeto categoría con imagen
 * @returns Array con la URL de imagen (si existe)
 */
export function extractCategoryImageUrls(categoria: { imagen?: string }): string[] {
  return categoria.imagen ? [categoria.imagen] : [];
}
