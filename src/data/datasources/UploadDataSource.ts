// src/data/datasources/UploadDataSource.ts
import { supabase } from '@/lib/supabase';
import type { UploadedImage } from '@/domain/repositories/upload/UploadRepository';

export interface UploadDataSource {
  uploadImages(files: File[], pathPrefix: string): Promise<UploadedImage[]>;
  removeImages(paths: string[]): Promise<void>;
}

export class SupabaseUploadDataSource implements UploadDataSource {
  private readonly bucket = 'product-images';

  private fileExt(name: string): string {
    const i = name.lastIndexOf('.');
    return i >= 0 ? name.slice(i + 1).toLowerCase() : 'jpg';
  }

  // Extrae el path desde una URL pública del bucket product-images
  derivePathFromPublicUrl(publicUrl: string): string | null {
    const marker = `/object/public/${this.bucket}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return publicUrl.slice(idx + marker.length);
  }

  async uploadImages(
    files: File[],
    pathPrefix: string
  ): Promise<UploadedImage[]> {
    const out: UploadedImage[] = [];

    for (const f of files) {
      const ext = this.fileExt(f.name);
      const name = `${crypto.randomUUID()}.${ext}`;
      const path = `${pathPrefix}/${name}`;

      const { error } = await supabase.storage
        .from(this.bucket)
        .upload(path, f, {
          upsert: false,
          ...(f.type && { contentType: f.type }),
        });
      if (error) throw error;

      const { data } = supabase.storage.from(this.bucket).getPublicUrl(path);
      out.push({ url: data.publicUrl, path });
    }
    return out;
  }

  async removeImages(paths: string[]): Promise<void> {
    if (!paths.length) return;
    const { error } = await supabase.storage.from(this.bucket).remove(paths);
    if (error) throw error;
  }
}
