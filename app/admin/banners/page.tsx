"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy as firestoreOrderBy,
  writeBatch,
  doc,
  deleteDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { db } from '@/lib/firebase';
import { uploadMultipleImages } from '@/lib/utils/upload';
import { deleteImage } from '@/lib/utils/deleteImages';
import ImageUploader from '@/components/admin/ImageUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { GripVertical, Loader2, Save, Trash2 } from 'lucide-react';

interface BannerItem {
  id: string;
  imageUrl: string;
  orden: number;
  activa: boolean;
}

const dataURLtoFile = (dataUrl: string, filename: string): File => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

function SortableBanner({ banner, index }: { banner: BannerItem; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 rounded-2xl border border-secondary/40 bg-white p-4 shadow-sm"
      {...attributes}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F9FAFB] text-sm font-semibold text-primary">
          {index + 1}
        </div>
        <button
          type="button"
          className="text-[#4B5563] hover:text-primary"
          {...listeners}
          aria-label="Reordenar banner"
        >
          <GripVertical className="h-5 w-5" />
        </button>
      </div>
      <div className="relative h-16 w-28 overflow-hidden rounded-xl border border-secondary/40 bg-[#F9FAFB]">
        <Image
          src={banner.imageUrl}
          alt={`Banner ${index + 1}`}
          fill
          className="object-cover"
        />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <Switch
          checked={banner.activa}
          onCheckedChange={() => {}}
          disabled
        />
      </div>
    </div>
  );
}

export default function BannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [originalBanners, setOriginalBanners] = useState<BannerItem[]>([]);
  const [imagesPreview, setImagesPreview] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingOrder, setSavingOrder] = useState(false);
  const [uploading, setUploading] = useState(false);

  const hasChanges = useMemo(() => {
    if (banners.length !== originalBanners.length) return true;
    return banners.some((banner, index) => banner.id !== originalBanners[index]?.id);
  }, [banners, originalBanners]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'banners'), firestoreOrderBy('orden', 'asc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<BannerItem, 'id'>),
      }));
      setBanners(data);
      setOriginalBanners(data);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('No pudimos cargar los banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = banners.findIndex((item) => item.id === active.id);
    const newIndex = banners.findIndex((item) => item.id === over.id);

    setBanners(arrayMove(banners, oldIndex, newIndex));
  };

  const handleSaveOrder = async () => {
    try {
      setSavingOrder(true);
      const batch = writeBatch(db);

      banners.forEach((banner, index) => {
        const ref = doc(db, 'banners', banner.id);
        batch.update(ref, { orden: index + 1 });
      });

      await batch.commit();
      toast.success('Orden actualizado');
      setOriginalBanners(banners);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('No pudimos guardar el orden');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleUpload = async () => {
    if (imagesPreview.length === 0) {
      toast.error('Sube al menos una imagen');
      return;
    }

    setUploading(true);
    try {
      const files = imagesPreview.map((preview, index) =>
        dataURLtoFile(preview, `banner-${Date.now()}-${index}.jpg`)
      );
      const urls = await uploadMultipleImages(files);
      const maxOrden = banners.length > 0 ? Math.max(...banners.map((b) => b.orden)) : 0;

      const addPromises = urls.map((url, index) =>
        addDoc(collection(db, 'banners'), {
          imageUrl: url,
          orden: maxOrden + index + 1,
          activa: true,
          fechaCreacion: Timestamp.now(),
        })
      );

      await Promise.all(addPromises);
      toast.success('Banners guardados');
      setImagesPreview([]);
      fetchBanners();
    } catch (error) {
      console.error('Error uploading banners:', error);
      toast.error('No pudimos subir los banners');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleActive = async (banner: BannerItem) => {
    try {
      await updateDoc(doc(db, 'banners', banner.id), { activa: !banner.activa });
      setBanners((prev) =>
        prev.map((item) =>
          item.id === banner.id ? { ...item, activa: !item.activa } : item
        )
      );
      setOriginalBanners((prev) =>
        prev.map((item) =>
          item.id === banner.id ? { ...item, activa: !item.activa } : item
        )
      );
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('No pudimos actualizar el estado');
    }
  };

  const handleDelete = async (bannerId: string) => {
    if (!confirm('¿Eliminar este banner?')) return;
    try {
      const banner = banners.find((b) => b.id === bannerId);
      if (banner?.imageUrl && banner.imageUrl.includes('r2.dev')) {
        await deleteImage(banner.imageUrl);
      }
      await deleteDoc(doc(db, 'banners', bannerId));
      toast.success('Banner eliminado');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('No pudimos eliminar el banner');
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">Banners</h1>
            <p className="text-gray-600 mt-1">
              Carga y ordena las imágenes del banner principal.
            </p>
          </div>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Subir nuevos banners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ImageUploader
                images={imagesPreview}
                onImagesChange={setImagesPreview}
                maxImages={6}
                label="Imágenes del banner"
                description="Solo imágenes. Tamaño recomendado: 1920x900px."
              />
              <div className="flex justify-end">
                <Button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-[#143D84] text-white hover:bg-[#143D84]/90"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    'Guardar banners'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle>Orden de banners</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando banners...
                </div>
              ) : banners.length === 0 ? (
                <p className="text-sm text-gray-500">Todavía no hay banners.</p>
              ) : (
                <>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={banners} strategy={verticalListSortingStrategy}>
                      <div className="space-y-3">
                        {banners.map((banner, index) => (
                          <div key={banner.id} className="flex items-center gap-4">
                            <SortableBanner banner={banner} index={index} />
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#4B5563]">Activo</span>
                                <Switch
                                  checked={banner.activa}
                                  onCheckedChange={() => handleToggleActive(banner)}
                                />
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(banner.id)}
                                className="border-[#143D84]/30 text-[#143D84] hover:bg-[#143D84]/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveOrder}
                      disabled={!hasChanges || savingOrder}
                      className="bg-[#143D84] text-white hover:bg-[#143D84]/90"
                    >
                      {savingOrder ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Guardar orden
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
