/**
 * Genera URLs de transformación de Supabase Storage.
 * Convierte /storage/v1/object/public/ → /storage/v1/render/image/public/
 * y agrega parámetros de redimensionado, calidad y formato.
 *
 * Si la URL no es de Supabase, la devuelve sin modificar.
 */
export interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'origin'
  resize?: 'cover' | 'contain' | 'fill'
}

export function transformSupabaseImage(
  url: string | null | undefined,
  opts: ImageTransformOptions
): string {
  if (!url) return ''
  if (!url.includes('supabase.co/storage/v1/object/public/')) return url

  const renderUrl = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  )

  const params = new URLSearchParams()
  if (opts.width) params.set('width', String(opts.width))
  if (opts.height) params.set('height', String(opts.height))
  if (opts.quality) params.set('quality', String(opts.quality))
  if (opts.format) params.set('format', opts.format)
  if (opts.resize) params.set('resize', opts.resize)

  const qs = params.toString()
  return qs ? `${renderUrl}?${qs}` : renderUrl
}
