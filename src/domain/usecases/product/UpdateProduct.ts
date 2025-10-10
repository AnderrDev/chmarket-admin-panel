// src/domain/usecases/product/UpdateProduct.ts
import type { Product } from '@/data/entities/product';
import type { ProductRepository } from '../../repositories/product/ProductRepository';

export class UpdateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string, productData: any): Promise<Product> {
    return this.productRepository.updateProduct(id, productData);
  }
}
