// src/domain/usecases/product/DeleteVariant.ts
import type { ProductRepository } from '../../repositories/product/ProductRepository';

export class DeleteVariantUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(variantId: string): Promise<void> {
    return this.productRepository.deleteVariant(variantId);
  }
}
