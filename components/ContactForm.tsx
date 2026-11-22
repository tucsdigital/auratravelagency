'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(8, 'Teléfono inválido'),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

type FormData = z.infer<typeof formSchema>;

interface ContactFormProps {
  paqueteTitulo?: string;
  paqueteId?: string;
}

export default function ContactForm({ paqueteTitulo, paqueteId }: ContactFormProps = {}) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'consultas'), {
        ...data,
        ...(paqueteTitulo && { paquete: paqueteTitulo }),
        ...(paqueteId && { paqueteId }),
        fechaCreacion: Timestamp.now(),
        leida: false,
      });

      toast.success('¡Consulta enviada!', {
        description: 'Te contactaremos a la brevedad.',
      });

      reset();
    } catch (error) {
      console.error('Error al enviar consulta:', error);
      toast.error('Error al enviar la consulta', {
        description: 'Por favor, intenta nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="nombre" className="text-xs font-medium tracking-wide text-gray-500 uppercase">
          Nombre completo
        </Label>
        <Input
          id="nombre"
          {...register('nombre')}
          placeholder="Juan Pérez"
          className="h-11 border-0 border-b border-gray-300 bg-transparent px-0 text-base text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus:border-gray-900 rounded-none"
        />
        {errors.nombre && (
          <p className="text-sm text-red-600 mt-1">{errors.nombre.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs font-medium tracking-wide text-gray-500 uppercase">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder="juan@ejemplo.com"
          className="h-11 border-0 border-b border-gray-300 bg-transparent px-0 text-base text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus:border-gray-900 rounded-none"
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="telefono" className="text-xs font-medium tracking-wide text-gray-500 uppercase">
          Teléfono
        </Label>
        <Input
          id="telefono"
          {...register('telefono')}
          placeholder="+54 9 11 1234-5678"
          className="h-11 border-0 border-b border-gray-300 bg-transparent px-0 text-base text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus:border-gray-900 rounded-none"
        />
        {errors.telefono && (
          <p className="text-sm text-red-600 mt-1">{errors.telefono.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="mensaje" className="text-xs font-medium tracking-wide text-gray-500 uppercase">
          Mensaje
        </Label>
        <Textarea
          id="mensaje"
          {...register('mensaje')}
          placeholder="Contanos sobre tu viaje ideal..."
          rows={6}
          className="min-h-[140px] border border-gray-200 bg-white/60 text-base text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 focus:border-gray-900 rounded-xl resize-none"
        />
        {errors.mensaje && (
          <p className="text-sm text-red-600 mt-1">{errors.mensaje.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full h-12 bg-[#143D84] hover:bg-[#143D84]/90 text-white text-sm font-semibold tracking-wide uppercase"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Enviando...
          </>
        ) : (
          'Enviar consulta'
        )}
      </Button>
    </form>
  );
}

