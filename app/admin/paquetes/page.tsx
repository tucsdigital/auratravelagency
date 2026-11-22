'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, deleteDoc, doc, orderBy, query, getDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Paquete } from '@/types';
import { deleteMultipleImages, extractPackageImageUrls } from '@/lib/utils/deleteImages';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminPagination from '@/components/admin/AdminPagination';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import Link from 'next/link';
import DragDropTable from '@/components/admin/DragDropTable';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function PaquetesPage() {
  const [paquetes, setPaquetes] = useState<Paquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // Contar paquetes destacados
  const destacadosCount = useMemo(() => {
    return paquetes.filter(p => p.destacado).length;
  }, [paquetes]);

  const fetchPaquetes = async () => {
    try {
      const q = query(collection(db, 'paquetes'), orderBy('orden', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Paquete));
      setPaquetes(data);
    } catch (error) {
      console.error('Error fetching paquetes:', error);
      toast.error('Error al cargar paquetes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaquetes();
  }, []);

  const handleDuplicate = async (paqueteId: string) => {
    setDuplicatingId(paqueteId);
    const toastId = 'duplicate-paquete';
    try {
      toast.loading('Obteniendo paquete...', { id: toastId });
      const paqueteSnap = await getDoc(doc(db, 'paquetes', paqueteId));
      if (!paqueteSnap.exists()) {
        toast.error('Paquete no encontrado', { id: toastId });
        return;
      }
      const data = paqueteSnap.data() as Omit<Paquete, 'id'>;

      // Orden de URLs: imagenTarjeta, imagenPrincipal, ...galeria (para mapear después)
      const urlsToClone: string[] = [];
      if (data.imagenTarjeta) urlsToClone.push(data.imagenTarjeta);
      if (data.imagenPrincipal) urlsToClone.push(data.imagenPrincipal);
      if (data.galeria?.length) data.galeria.forEach((u) => urlsToClone.push(u));

      toast.loading(`Clonando ${urlsToClone.length} imagen(es)...`, { id: toastId });
      const clonePromises = urlsToClone.map((imageUrl) =>
        fetch('/api/clone-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl }),
        }).then(async (r) => {
          if (!r.ok) {
            const err = await r.json();
            throw new Error(err.error || 'Error clonando imagen');
          }
          return r.json() as Promise<{ url: string }>;
        })
      );
      const cloned = await Promise.all(clonePromises);
      const newUrls = cloned.map((c) => c.url);

      let i = 0;
      const nuevaImagenTarjeta = data.imagenTarjeta ? newUrls[i++] : undefined;
      const nuevaImagenPrincipal = data.imagenPrincipal ? newUrls[i++] : data.imagenPrincipal;
      const nuevaGaleria = data.galeria?.length
        ? data.galeria.map(() => newUrls[i++])
        : (data.galeria ?? []);

      const maxOrden =
        paquetes.length > 0 ? Math.max(...paquetes.map((p) => p.orden ?? 0), 0) + 1 : 1;
      const nuevoSlug = `${data.slug}-copia-${Date.now()}`;

      toast.loading('Creando paquete duplicado...', { id: toastId });
      // Firestore no acepta undefined; solo incluimos campos opcionales si tienen valor
      const nuevoPaquete: Record<string, unknown> = {
        titulo: data.titulo,
        slug: nuevoSlug,
        descripcion: data.descripcion,
        descripcionCorta: data.descripcionCorta ?? '',
        destino: data.destino,
        categoriaIds: data.categoriaIds ?? (data.categoriaId ? [data.categoriaId] : []),
        categoriaId: (data.categoriaIds?.[0] ?? data.categoriaId) || '',
        tipo: data.tipo,
        precio: data.precio,
        moneda: data.moneda,
        mostrarDesde: data.mostrarDesde,
        duracion: data.duracion,
        incluye: data.incluye ?? [],
        noIncluye: data.noIncluye ?? [],
        salidas: data.salidas ?? [],
        imagenPrincipal: nuevaImagenPrincipal,
        galeria: nuevaGaleria,
        visible: false,
        destacado: false,
        fechaCreacion: Timestamp.now(),
        orden: maxOrden,
        ctaWhatsApp: data.ctaWhatsApp ?? true,
      };
      if (nuevaImagenTarjeta != null) nuevoPaquete.imagenTarjeta = nuevaImagenTarjeta;
      if (data.eventoLugar != null) nuevoPaquete.eventoLugar = data.eventoLugar;

      await addDoc(collection(db, 'paquetes'), nuevoPaquete);

      toast.success('Paquete duplicado correctamente', {
        id: toastId,
        description: 'El duplicado se creó oculto y sin destacar. Puedes editarlo cuando quieras.',
      });
      await fetchPaquetes();
    } catch (error) {
      console.error('Error duplicando paquete:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al duplicar el paquete',
        { id: toastId }
      );
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // Primero obtener los datos del paquete para acceder a las imágenes
      const paqueteDoc = await getDoc(doc(db, 'paquetes', deleteId));
      
      if (paqueteDoc.exists()) {
        const paqueteData = paqueteDoc.data() as Paquete;
        
        // Extraer URLs de imágenes
        const imageUrls = extractPackageImageUrls(paqueteData);
        
        // Eliminar imágenes de R2 antes de borrar el documento
        if (imageUrls.length > 0) {
          toast.info('Eliminando imágenes...', { id: 'delete-images' });
          try {
            const deletedCount = await deleteMultipleImages(imageUrls);
            if (deletedCount > 0) {
              toast.success(`${deletedCount} imagen(es) eliminada(s)`, { id: 'delete-images' });
            }
          } catch (error) {
            console.error('Error eliminando imágenes:', error);
            toast.warning('Eliminando paquete; algunas imágenes pueden quedar en el almacenamiento', { id: 'delete-images' });
          }
        }
      }
      
      // Eliminar documento de Firestore
      await deleteDoc(doc(db, 'paquetes', deleteId));
      toast.success('Paquete eliminado correctamente');
      fetchPaquetes();
    } catch (error) {
      console.error('Error deleting paquete:', error);
      toast.error('Error al eliminar paquete');
    } finally {
      setDeleteId(null);
    }
  };

  // Filtrar paquetes por búsqueda
  const paquetesFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return paquetes;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return paquetes.filter(paquete =>
      paquete.titulo.toLowerCase().includes(searchLower) ||
      paquete.destino.toLowerCase().includes(searchLower) ||
      paquete.slug.toLowerCase().includes(searchLower) ||
      (paquete.descripcion && paquete.descripcion.toLowerCase().includes(searchLower))
    );
  }, [paquetes, searchTerm]);

  // Paginación
  const paquetesPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return paquetesFiltrados.slice(startIndex, endIndex);
  }, [paquetesFiltrados, currentPage, itemsPerPage]);

  // Resetear página cuando cambie la búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-gray-900" />
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Paquetes</h1>
                {destacadosCount > 0 && (
                  <Badge 
                    variant={destacadosCount >= 9 ? 'destructive' : 'secondary'}
                    className={destacadosCount >= 9 ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 'bg-blue-100 text-blue-800 hover:bg-blue-100'}
                  >
                    {destacadosCount}/9 destacados
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">
                Gestiona los paquetes turísticos
                {destacadosCount >= 9 && (
                  <span className="text-amber-600 ml-2">
                    • Solo los primeros 9 destacados se muestran en el inicio
                  </span>
                )}
              </p>
            </div>
            <Button asChild className="bg-black hover:bg-gray-800 text-white">
              <Link href="/admin/paquetes/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Paquete
              </Link>
            </Button>
          </div>

          {/* Búsqueda */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por título, destino o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <DragDropTable
            items={paquetesPaginados}
            collectionName="paquetes"
            viewPath="/paquete"
            onDuplicate={handleDuplicate}
            duplicatingId={duplicatingId}
            columns={[
              {
                key: 'orden',
                label: 'Orden',
                render: (item) => (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-sm px-2.5 py-1">
                      #{item.orden}
                    </Badge>
                  </div>
                )
              },
              {
                key: 'titulo',
                label: 'Título',
                render: (item) => (
                  <div className="max-w-xs">
                    <span className="font-semibold text-gray-900 line-clamp-2">
                      {item.titulo}
                    </span>
                  </div>
                )
              },
              {
                key: 'destino',
                label: 'Destino',
                render: (item) => <span className="text-gray-700">{item.destino}</span>
              },
              {
                key: 'tipo',
                label: 'Tipo',
                render: (item) => (
                  <Badge variant="outline" className="font-medium">
                    {item.tipo === 'individual' ? '👤 Individual' : item.tipo === 'grupal' ? '👥 Grupal' : '✨ A Medida'}
                  </Badge>
                )
              },
              {
                key: 'precio',
                label: 'Precio',
                render: (item) => (
                  <span className="font-bold text-gray-900">
                    ${item.precio.toLocaleString('es-AR')}
                  </span>
                )
              },
              {
                key: 'estado',
                label: 'Estado',
                render: (item) => (
                  <div className="flex gap-2 flex-wrap">
                    <Badge 
                      variant={item.visible ? 'default' : 'secondary'}
                      className={item.visible ? 'bg-green-100 text-green-800 hover:bg-green-100 font-medium' : 'font-medium'}
                    >
                      {item.visible ? '✓ Visible' : '✕ Oculto'}
                    </Badge>
                    {item.destacado && (
                      <Badge className="bg-black text-white hover:bg-black font-medium">
                        ⭐ Destacado
                      </Badge>
                    )}
                  </div>
                )
              },
            ]}
            onItemsChange={(newItems) => {
              setPaquetes(newItems);
              fetchPaquetes(); // Recargar después de guardar
            }}
            onDelete={setDeleteId}
            editPath="/admin/paquetes"
          />
          
          {/* Paginación */}
          {paquetesFiltrados.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <AdminPagination
                currentPage={currentPage}
                totalItems={paquetesFiltrados.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemName="paquetes"
              />
            </div>
          )}
        </div>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="z-[101]">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará el paquete permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </ProtectedRoute>
  );
}
