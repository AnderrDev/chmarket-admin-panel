// src/domain/usecases/product/ListProducts.ts
import type { Product } from '@/data/entities/product';
import type { ProductRepository } from '../../repositories/product/ProductRepository';

export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(limit: number = 24): Promise<Product[]> {
    return this.productRepository.listProducts(limit);
  }
}
