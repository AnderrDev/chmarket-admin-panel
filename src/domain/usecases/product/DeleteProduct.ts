// src/domain/usecases/product/DeleteProduct.ts
import type { ProductRepository } from '../../repositories/product/ProductRepository';

export class DeleteProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<void> {
    return this.productRepository.deleteProduct(id);
  }
}
