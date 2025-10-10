// src/domain/usecases/product/CreateVariant.ts
import type { ProductVariant } from '@/data/entities/product';
import type { ProductRepository } from '../../repositories/product/ProductRepository';

export class CreateVariantUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(productId: string, variantData: any): Promise<ProductVariant> {
    return this.productRepository.createVariant(productId, variantData);
  }
}
