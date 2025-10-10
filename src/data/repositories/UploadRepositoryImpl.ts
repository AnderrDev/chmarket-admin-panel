// src/data/repositories/UploadRepositoryImpl.ts
import type { UploadRepository } from '@/domain/repositories/upload/UploadRepository';
import type { UploadDataSource } from '@/data/datasources/UploadDataSource';

export class UploadRepositoryImpl implements UploadRepository {
  constructor(private readonly dataSource: UploadDataSource) {}

  async uploadImages(files: File[], pathPrefix: string) {
    return this.dataSource.uploadImages(files, pathPrefix);
  }

  async removeImages(paths: string[]): Promise<void> {
    return this.dataSource.removeImages(paths);
  }
}
