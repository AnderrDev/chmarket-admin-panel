// src/domain/repositories/product/ProductRepository.ts
import type { Product, ProductVariant } from '@/data/entities/product';
import type { LowStockRow } from '@/data/datasources/ProductDataSource';
export type { LowStockRow };

export interface ProductListResult {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ProductRepository {
  listProducts(page?: number, pageSize?: number): Promise<ProductListResult>;
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
  getLowStockProducts(): Promise<LowStockRow[]>;
}
