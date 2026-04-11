// src/domain/usecases/product/ListProducts.ts
import type { ProductRepository, ProductListResult } from '../../repositories/product/ProductRepository';

export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(page = 1, pageSize = 24): Promise<ProductListResult> {
    return this.productRepository.listProducts(page, pageSize);
  }
}
