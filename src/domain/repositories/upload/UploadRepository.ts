// src/domain/repositories/upload/UploadRepository.ts

export interface UploadedImage {
  url: string;
  path: string;
  alt?: string;
}

export interface UploadRepository {
  uploadImages(files: File[], pathPrefix: string): Promise<UploadedImage[]>;
  removeImages(paths: string[]): Promise<void>;
}
