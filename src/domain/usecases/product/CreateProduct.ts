// src/domain/usecases/product/CreateProduct.ts
import type { ProductRepository } from '../../repositories/product/ProductRepository';

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    productData: any,
    variantsData: any[]
  ): Promise<{ product_id: string; variant_ids: string[] }> {
    return this.productRepository.createProduct(productData, variantsData);
  }
}
