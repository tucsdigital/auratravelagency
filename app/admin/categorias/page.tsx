'use client';

import { useEffect, useState, useMemo } from 'react';
import { collection, getDocs, deleteDoc, doc, orderBy, query, getDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Categoria } from '@/types';
import { deleteMultipleImages, extractCategoryImageUrls } from '@/lib/utils/deleteImages';
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

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCategorias = async () => {
    try {
      const q = query(collection(db, 'categorias'), orderBy('orden', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Categoria));
      setCategorias(data);
    } catch (error) {
      console.error('Error fetching categorias:', error);
      toast.error('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  const handleDuplicate = async (categoriaId: string) => {
    setDuplicatingId(categoriaId);
    const toastId = 'duplicate-categoria';
    try {
      toast.loading('Obteniendo categoría...', { id: toastId });
      const snap = await getDoc(doc(db, 'categorias', categoriaId));
      if (!snap.exists()) {
        toast.error('Categoría no encontrada', { id: toastId });
        return;
      }
      const data = snap.data() as Omit<Categoria, 'id'>;

      let nuevaImagen: string | undefined;
      if (data.imagen?.trim()) {
        toast.loading('Clonando imagen...', { id: toastId });
        const res = await fetch('/api/clone-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: data.imagen }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Error clonando imagen');
        }
        const json = await res.json() as { url: string };
        nuevaImagen = json.url;
      }

      const maxOrden =
        categorias.length > 0 ? Math.max(...categorias.map((c) => c.orden ?? 0), 0) + 1 : 1;
      const nuevoSlug = `${data.slug}-copia-${Date.now()}`;

      toast.loading('Creando categoría duplicada...', { id: toastId });
      const nuevoDoc: Record<string, unknown> = {
        nombre: data.nombre,
        slug: nuevoSlug,
        descripcion: data.descripcion,
        orden: maxOrden,
        destacada: false,
        activa: false,
        fechaCreacion: Timestamp.now(),
      };
      if (nuevaImagen != null) nuevoDoc.imagen = nuevaImagen;

      await addDoc(collection(db, 'categorias'), nuevoDoc);

      toast.success('Categoría duplicada correctamente', {
        id: toastId,
        description: 'El duplicado se creó inactivo y sin destacar. Podés editarlo cuando quieras.',
      });
      await fetchCategorias();
    } catch (error) {
      console.error('Error duplicando categoría:', error);
      toast.error(
        error instanceof Error ? error.message : 'Error al duplicar la categoría',
        { id: toastId }
      );
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      // Primero obtener los datos de la categoría para acceder a las imágenes
      const categoriaDoc = await getDoc(doc(db, 'categorias', deleteId));
      
      if (categoriaDoc.exists()) {
        const categoriaData = categoriaDoc.data() as Categoria;
        
        // Extraer URLs de imágenes
        const imageUrls = extractCategoryImageUrls(categoriaData);
        
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
            toast.warning('Eliminando categoría; la imagen puede quedar en el almacenamiento', { id: 'delete-images' });
          }
        }
      }
      
      // Eliminar documento de Firestore
      await deleteDoc(doc(db, 'categorias', deleteId));
      toast.success('Categoría eliminada correctamente');
      fetchCategorias();
    } catch (error) {
      console.error('Error deleting categoria:', error);
      toast.error('Error al eliminar categoría');
    } finally {
      setDeleteId(null);
    }
  };

  // Filtrar categorías por búsqueda
  const categoriasFiltradas = useMemo(() => {
    if (!searchTerm.trim()) return categorias;
    
    const searchLower = searchTerm.toLowerCase().trim();
    return categorias.filter(categoria =>
      categoria.nombre.toLowerCase().includes(searchLower) ||
      categoria.slug.toLowerCase().includes(searchLower) ||
      categoria.descripcion.toLowerCase().includes(searchLower)
    );
  }, [categorias, searchTerm]);

  // Paginación
  const categoriasPaginadas = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return categoriasFiltradas.slice(startIndex, endIndex);
  }, [categoriasFiltradas, currentPage, itemsPerPage]);

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
              <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Categorías</h1>
              <p className="text-gray-600 mt-1">Gestiona las categorías de viajes</p>
            </div>
            <Button asChild className="bg-black hover:bg-gray-800 text-white">
              <Link href="/admin/categorias/nueva">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Categoría
              </Link>
            </Button>
          </div>

          {/* Búsqueda */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nombre, slug o descripción..."
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
            items={categoriasPaginadas}
            collectionName="categorias"
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
                key: 'nombre',
                label: 'Nombre',
                render: (item) => <span className="font-semibold text-gray-900">{item.nombre}</span>
              },
              {
                key: 'slug',
                label: 'Slug',
                render: (item) => <span className="text-gray-500 font-mono text-sm">{item.slug}</span>
              },
              {
                key: 'estado',
                label: 'Estado',
                render: (item) => (
                  <Badge 
                    variant={item.activa ? 'default' : 'secondary'}
                    className={item.activa ? 'bg-green-100 text-green-800 hover:bg-green-100 font-medium' : 'font-medium'}
                  >
                    {item.activa ? 'Activa' : 'Inactiva'}
                  </Badge>
                )
              },
              {
                key: 'destacada',
                label: 'Destacada',
                render: (item) => item.destacada ? (
                  <Badge className="bg-black text-white hover:bg-black font-medium">
                    ⭐ Destacada
                  </Badge>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )
              },
            ]}
            onItemsChange={(newItems) => {
              setCategorias(newItems);
              fetchCategorias(); // Recargar después de guardar
            }}
            onDelete={setDeleteId}
            editPath="/admin/categorias"
          />
          
          {/* Paginación */}
          {categoriasFiltradas.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <AdminPagination
                currentPage={currentPage}
                totalItems={categoriasFiltradas.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
                itemName="categorías"
              />
            </div>
          )}
        </div>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent className="z-[101]">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminará la categoría permanentemente.
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

