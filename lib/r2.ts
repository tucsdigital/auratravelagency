/**
 * Utilidades para Cloudflare R2 (almacenamiento S3-compatible).
 * Reemplazo de Vercel Blob para subida y eliminación de imágenes.
 */

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

const BUCKET = process.env.R2_BUCKET;
const PUBLIC_BASE = process.env.R2_PUBLIC_BASE?.replace(/\/$/, '') ?? '';
const ENDPOINT = process.env.R2_ENDPOINT;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;

function getClient(): S3Client {
  if (!ENDPOINT || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    throw new Error(
      'R2: faltan R2_ENDPOINT, R2_ACCESS_KEY_ID o R2_SECRET_ACCESS_KEY en el entorno'
    );
  }
  return new S3Client({
    region: 'auto',
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });
}

/**
 * Genera una clave única para el objeto (ej: uploads/1738xxx-abc123.jpg).
 */
export function generateKey(filename: string, prefix = 'uploads'): string {
  const ext = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() ?? 'jpg' : 'jpg';
  const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${prefix}/${safe}.${ext}`;
}

/**
 * Extrae la clave del bucket a partir de la URL pública de R2.
 * Ej: https://pub-xxx.r2.dev/uploads/123.jpg -> uploads/123.jpg
 */
export function keyFromPublicUrl(publicUrl: string): string | null {
  if (!publicUrl || !PUBLIC_BASE || !publicUrl.startsWith(PUBLIC_BASE)) {
    return null;
  }
  const path = publicUrl.slice(PUBLIC_BASE.length).replace(/^\//, '');
  return path || null;
}

/**
 * Indica si la URL es de nuestro bucket R2 (dominio público).
 */
export function isR2Url(url: string | undefined): boolean {
  if (!url) return false;
  return url.includes('r2.dev') && (PUBLIC_BASE ? url.startsWith(PUBLIC_BASE) : true);
}

/**
 * Sube un buffer a R2 y devuelve la URL pública.
 */
export async function uploadToR2(
  body: Buffer | Uint8Array,
  key: string,
  contentType?: string
): Promise<string> {
  if (!BUCKET || !PUBLIC_BASE) {
    throw new Error('R2: faltan R2_BUCKET o R2_PUBLIC_BASE en el entorno');
  }
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType ?? 'application/octet-stream',
    })
  );
  return `${PUBLIC_BASE}/${key}`;
}

/**
 * Elimina un objeto de R2 por su URL pública.
 */
export async function deleteFromR2(publicUrl: string): Promise<boolean> {
  const key = keyFromPublicUrl(publicUrl);
  if (!key || !BUCKET) return false;
  const client = getClient();
  await client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
  return true;
}
