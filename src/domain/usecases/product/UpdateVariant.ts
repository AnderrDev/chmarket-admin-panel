// src/domain/usecases/product/UpdateVariant.ts
import type { ProductVariant } from '@/data/entities/product';
import type { ProductRepository } from '../../repositories/product/ProductRepository';

export class UpdateVariantUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(variantId: string, variantData: any): Promise<ProductVariant> {
    return this.productRepository.updateVariant(variantId, variantData);
  }
}
