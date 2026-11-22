import { Timestamp } from 'firebase/firestore';

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  orden: number;
  destacada: boolean;
  activa: boolean;
  imagen?: string;
  fechaCreacion: Timestamp | Date;
}

export interface Salida {
  id: string;
  fecha: string; // YYYY-MM-DD (fecha de ida)
  fechaVuelta?: string; // YYYY-MM-DD (fecha de vuelta)
  ciudadSalida: string;
  precio: number;
  moneda: 'USD' | 'ARS' | 'EUR';
  cupo?: number;
  observaciones?: string;
}

export interface Paquete {
  id: string;
  titulo: string;
  slug: string;
  descripcion: string;
  descripcionCorta?: string;
  destino: string; // Se obtiene automáticamente del nombre de la categoría
  categoriaIds?: string[];
  categoriaId?: string;
  tipo: 'individual' | 'grupal' | 'a-medida';
  precio: number;
  moneda: 'USD' | 'ARS' | 'EUR';
  mostrarDesde: boolean;
  duracion: string;
  incluye: string[];
  noIncluye: string[];
  salidas: Salida[];
  imagenPrincipal: string;
  /** Opcional: imagen específica para la card (listados). Si no hay, se usa imagenPrincipal */
  imagenTarjeta?: string;
  galeria: string[];
  /** Opcional: lugar del evento (ej. para F1: "Monaco", "Monza") */
  eventoLugar?: string;
  visible: boolean;
  destacado: boolean;
  fechaCreacion: Timestamp | Date;
  orden: number;
  ctaWhatsApp: boolean;
}

export interface Consulta {
  id?: string;
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
  paquete?: string;
  paqueteId?: string; // Slug del paquete para construir la URL
  fechaCreacion: Timestamp | Date;
  leida: boolean;
}
