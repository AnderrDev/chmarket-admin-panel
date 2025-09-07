// src/lib/upload.ts
import { supabase } from '@/lib/supabase'

export type UploadedImage = { url: string; path: string; alt?: string }
const BUCKET = 'product-images'

function fileExt(name: string) {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toLowerCase() : 'jpg'
}

// Extrae el path desde una URL pública del bucket product-images
export function derivePathFromPublicUrl(publicUrl: string): string | null {
  const marker = `/object/public/${BUCKET}/`
  const idx = publicUrl.indexOf(marker)
  if (idx === -1) return null
  return publicUrl.slice(idx + marker.length)
}

/** Sube archivos al bucket product-images bajo un prefijo dado. */
export async function uploadImagesToBucket(
  files: File[],
  pathPrefix: string, // 'products/<productId>' o 'variants/<productId>'
): Promise<UploadedImage[]> {
  const out: UploadedImage[] = []

  for (const f of files) {
    const ext = fileExt(f.name)
    const name = `${crypto.randomUUID()}.${ext}`
    const path = `${pathPrefix}/${name}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, f, { upsert: false, contentType: f.type || undefined })
    if (error) throw error

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
    out.push({ url: data.publicUrl, path })
  }
  return out
}

/** Borra rutas exactas del bucket product-images. */
export async function removeImagesFromBucket(paths: string[]): Promise<void> {
  if (!paths.length) return
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) throw error
}
