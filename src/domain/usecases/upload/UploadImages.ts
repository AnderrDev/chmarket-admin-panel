// src/domain/usecases/upload/UploadImages.ts
import type {
  UploadRepository,
  UploadedImage,
} from '../../repositories/upload/UploadRepository';

export class UploadImagesUseCase {
  constructor(private readonly uploadRepository: UploadRepository) {}

  async execute(files: File[], pathPrefix: string): Promise<UploadedImage[]> {
    return this.uploadRepository.uploadImages(files, pathPrefix);
  }
}
