import { supabase } from './supabase';

const BUCKET = 'avatars';
const MAX_BYTES = 5 * 1024 * 1024;

/** Resize image client-side, return JPEG blob (max 400px). */
export async function resizeImageToBlob(file: File, maxSize = 400): Promise<Blob> {
  if (file.size > MAX_BYTES) {
    throw new Error('Image must be smaller than 5 MB.');
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = dataUrl;
  });

  let { width, height } = img;
  if (width > height && width > maxSize) {
    height = (height * maxSize) / width;
    width = maxSize;
  } else if (height > maxSize) {
    width = (width * maxSize) / height;
    height = maxSize;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Failed to process image'))),
      'image/jpeg',
      0.85
    );
  });
}

/** Upload avatar to Supabase Storage; returns public URL. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const blob = await resizeImageToBlob(file);
  const path = `${userId}/avatar.jpg`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    upsert: true,
    contentType: 'image/jpeg',
    cacheControl: '3600',
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?v=${Date.now()}`;
}

export function isStorageUrl(url: string | undefined): boolean {
  return !!url && !url.startsWith('data:');
}
