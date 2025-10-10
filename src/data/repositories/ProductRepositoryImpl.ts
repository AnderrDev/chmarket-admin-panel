// src/data/repositories/ProductRepositoryImpl.ts
import type { Product, ProductVariant } from '@/data/entities/product';
import type { ProductRepository } from '@/domain/repositories/product/ProductRepository';
import type { ProductDataSource } from '@/data/datasources/ProductDataSource';

export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly dataSource: ProductDataSource) {}

  async listProducts(limit: number = 24): Promise<Product[]> {
    return this.dataSource.listProducts(limit);
  }

  async getProduct(id: string): Promise<Product | null> {
    return this.dataSource.getProduct(id);
  }

  async createProduct(
    productData: any,
    variantsData: any[]
  ): Promise<{ product_id: string; variant_ids: string[] }> {
    return this.dataSource.createProduct(productData, variantsData);
  }

  async updateProduct(id: string, productData: any): Promise<Product> {
    return this.dataSource.updateProduct(id, productData);
  }

  async deleteProduct(id: string): Promise<void> {
    return this.dataSource.deleteProduct(id);
  }

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return this.dataSource.getProductVariants(productId);
  }

  async createVariant(
    productId: string,
    variantData: any
  ): Promise<ProductVariant> {
    return this.dataSource.createVariant(productId, variantData);
  }

  async updateVariant(
    variantId: string,
    variantData: any
  ): Promise<ProductVariant> {
    return this.dataSource.updateVariant(variantId, variantData);
  }

  async deleteVariant(variantId: string): Promise<void> {
    return this.dataSource.deleteVariant(variantId);
  }
}
