// src/domain/usecases/upload/RemoveImages.ts
import type { UploadRepository } from '../../repositories/upload/UploadRepository';

export class RemoveImagesUseCase {
  constructor(private readonly uploadRepository: UploadRepository) {}

  async execute(paths: string[]): Promise<void> {
    return this.uploadRepository.removeImages(paths);
  }
}
