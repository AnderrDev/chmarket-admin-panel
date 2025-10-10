// src/domain/repositories/product/ProductRepository.ts
import type { Product, ProductVariant } from '@/data/entities/product';

export interface ProductRepository {
  listProducts(limit?: number): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(
    productData: any,
    variantsData: any[]
  ): Promise<{ product_id: string; variant_ids: string[] }>;
  updateProduct(id: string, productData: any): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getProductVariants(productId: string): Promise<ProductVariant[]>;
  createVariant(productId: string, variantData: any): Promise<ProductVariant>;
  updateVariant(variantId: string, variantData: any): Promise<ProductVariant>;
  deleteVariant(variantId: string): Promise<void>;
}
