import { NextResponse } from 'next/server';
import { uploadToR2, generateKey } from '@/lib/r2';

/**
 * Clona una imagen: la descarga y la re-sube a Cloudflare R2.
 * Usado desde el cliente para duplicar paquetes sin usar Firestore en el servidor.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const imageUrl = body?.imageUrl as string | undefined;

    if (!imageUrl?.trim()) {
      return NextResponse.json(
        { error: 'Falta imageUrl en el cuerpo' },
        { status: 400 }
      );
    }

    const res = await fetch(imageUrl, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        { error: `No se pudo descargar la imagen: ${res.status}` },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.split('/')[1] || 'jpg';
    const filename = `clone-${Date.now()}.${ext}`;
    const key = generateKey(filename);

    const url = await uploadToR2(buffer, key, contentType);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error clonando imagen:', error);
    return NextResponse.json(
      { error: 'Error al clonar la imagen' },
      { status: 500 }
    );
  }
}
