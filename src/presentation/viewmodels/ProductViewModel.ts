// src/presentation/viewmodels/ProductViewModel.ts
import { useState, useCallback } from 'react';
import type { Product, ProductVariant } from '@/data/entities/product';
import type { NotificationService } from '@/application/services/NotificationService';
import { ListProductsUseCase } from '@/domain/usecases/product/ListProducts';
import { CreateProductUseCase } from '@/domain/usecases/product/CreateProduct';
import { UpdateProductUseCase } from '@/domain/usecases/product/UpdateProduct';
import { DeleteProductUseCase } from '@/domain/usecases/product/DeleteProduct';
import { GetProductVariantsUseCase } from '@/domain/usecases/product/GetProductVariants';
import { CreateVariantUseCase } from '@/domain/usecases/product/CreateVariant';
import { UpdateVariantUseCase } from '@/domain/usecases/product/UpdateVariant';
import { DeleteVariantUseCase } from '@/domain/usecases/product/DeleteVariant';

export class ProductViewModel {
  private products: Product[] = [];
  private loading = false;
  private error: string | null = null;

  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
    private readonly getProductVariantsUseCase: GetProductVariantsUseCase,
    private readonly createVariantUseCase: CreateVariantUseCase,
    private readonly updateVariantUseCase: UpdateVariantUseCase,
    private readonly deleteVariantUseCase: DeleteVariantUseCase,
    private readonly notificationService: NotificationService
  ) {}

  // Getters
  getProducts(): Product[] {
    return this.products;
  }

  isLoading(): boolean {
    return this.loading;
  }

  getError(): string | null {
    return this.error;
  }

  // Actions
  async fetchProducts(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      this.products = await this.listProductsUseCase.execute(24);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar productos';
      this.error = message;
      this.notificationService.error(message);
    } finally {
      this.loading = false;
    }
  }

  async createProduct(
    productData: any,
    variantsData: any[]
  ): Promise<{ product_id: string; variant_ids: string[] }> {
    try {
      const result = await this.createProductUseCase.execute(
        productData,
        variantsData
      );
      await this.fetchProducts(); // Refresh the list
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al crear producto';
      this.notificationService.error(message);
      throw err;
    }
  }

  async updateProduct(id: string, productData: any): Promise<Product> {
    try {
      const updatedProduct = await this.updateProductUseCase.execute(
        id,
        productData
      );
      this.products = this.products.map(p =>
        p.id === id ? updatedProduct : p
      );
      return updatedProduct;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al actualizar producto';
      this.notificationService.error(message);
      throw err;
    }
  }

  async deleteProduct(id: string): Promise<void> {
    try {
      await this.deleteProductUseCase.execute(id);
      this.products = this.products.filter(p => p.id !== id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar producto';
      this.notificationService.error(message);
      throw err;
    }
  }

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    try {
      return await this.getProductVariantsUseCase.execute(productId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar variantes';
      this.notificationService.error(message);
      throw err;
    }
  }

  async createVariant(
    productId: string,
    variantData: any
  ): Promise<ProductVariant> {
    try {
      return await this.createVariantUseCase.execute(productId, variantData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al crear variante';
      this.notificationService.error(message);
      throw err;
    }
  }

  async updateVariant(
    variantId: string,
    variantData: any
  ): Promise<ProductVariant> {
    try {
      return await this.updateVariantUseCase.execute(variantId, variantData);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al actualizar variante';
      this.notificationService.error(message);
      throw err;
    }
  }

  async deleteVariant(variantId: string): Promise<void> {
    try {
      await this.deleteVariantUseCase.execute(variantId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar variante';
      this.notificationService.error(message);
      throw err;
    }
  }
}

// Hook factory for React integration
export function useProductViewModel(viewModel: ProductViewModel) {
  const [products, setProducts] = useState<Product[]>(viewModel.getProducts());
  const [loading, setLoading] = useState<boolean>(viewModel.isLoading());
  const [error, setError] = useState<string | null>(viewModel.getError());

  const fetchProducts = useCallback(async () => {
    await viewModel.fetchProducts();
    setProducts([...viewModel.getProducts()]);
    setLoading(viewModel.isLoading());
    setError(viewModel.getError());
  }, [viewModel]);

  const createProduct = useCallback(
    async (productData: any, variantsData: any[]) => {
      const result = await viewModel.createProduct(productData, variantsData);
      setProducts([...viewModel.getProducts()]);
      return result;
    },
    [viewModel]
  );

  const updateProduct = useCallback(
    async (id: string, productData: any) => {
      const result = await viewModel.updateProduct(id, productData);
      setProducts([...viewModel.getProducts()]);
      return result;
    },
    [viewModel]
  );

  const deleteProduct = useCallback(
    async (id: string) => {
      await viewModel.deleteProduct(id);
      setProducts([...viewModel.getProducts()]);
    },
    [viewModel]
  );

  const getProductVariants = useCallback(
    async (productId: string) => {
      return viewModel.getProductVariants(productId);
    },
    [viewModel]
  );

  const createVariant = useCallback(
    async (productId: string, variantData: any) => {
      return viewModel.createVariant(productId, variantData);
    },
    [viewModel]
  );

  const updateVariant = useCallback(
    async (variantId: string, variantData: any) => {
      return viewModel.updateVariant(variantId, variantData);
    },
    [viewModel]
  );

  const deleteVariant = useCallback(
    async (variantId: string) => {
      return viewModel.deleteVariant(variantId);
    },
    [viewModel]
  );

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductVariants,
    createVariant,
    updateVariant,
    deleteVariant,
  };
}
