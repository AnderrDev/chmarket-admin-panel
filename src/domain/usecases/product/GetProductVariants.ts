// src/domain/usecases/product/GetProductVariants.ts
import type { ProductVariant } from '@/data/entities/product';
import type { ProductRepository } from '../../repositories/product/ProductRepository';

export class GetProductVariantsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(productId: string): Promise<ProductVariant[]> {
    return this.productRepository.getProductVariants(productId);
  }
}
