// src/domain/usecases/product/GetLowStockProducts.ts
import type { ProductRepository, LowStockRow } from '../../repositories/product/ProductRepository';

export class GetLowStockProductsUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(): Promise<LowStockRow[]> {
    return this.productRepository.getLowStockProducts();
  }
}
