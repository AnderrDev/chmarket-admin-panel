import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Product, ProductVariant } from '@/data/entities/product';
import {
  listProductsUseCase,
  createProductUseCase,
  updateProductUseCase,
  deleteProductUseCase,
  getProductVariantsUseCase,
  createVariantUseCase,
  updateVariantUseCase,
  deleteVariantUseCase,
} from '@/application/container';
import { notificationService } from '@/application/services/NotificationService';

export const PRODUCTS_QUERY_KEY = ['admin', 'products'] as const;
export const productsPageKey = (page: number, pageSize: number) =>
  ['admin', 'products', page, pageSize] as const;
export const productVariantsKey = (id: string) =>
  ['admin', 'product-variants', id] as const;

const PAGE_SIZE = 24;

export function useProducts() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const {
    data: result,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: productsPageKey(page, PAGE_SIZE),
    queryFn: () => listProductsUseCase.execute(page, PAGE_SIZE),
    staleTime: 60_000,
  });

  const products = result?.data ?? [];
  const totalProducts = result?.total ?? 0;
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  // Keep flat key populated for Dashboard (reads page 1)
  if (result && page === 1) {
    queryClient.setQueryData(PRODUCTS_QUERY_KEY, products);
  }

  const error = queryError instanceof Error ? queryError.message : null;

  const fetchProducts = useCallback(() => {
    return queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
  }, [queryClient]);

  const createProduct = useCallback(
    async (
      productData: any,
      variantsData: any[]
    ): Promise<{ product_id: string; variant_ids: string[] }> => {
      try {
        const created = await createProductUseCase.execute(
          productData,
          variantsData
        );
        await queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
        return created;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al crear producto';
        notificationService.error(message);
        throw err;
      }
    },
    [queryClient]
  );

  const updateProduct = useCallback(
    async (id: string, productData: any): Promise<Product> => {
      try {
        const updated = await updateProductUseCase.execute(id, productData);
        // Update current page cache
        queryClient.setQueryData(
          productsPageKey(page, PAGE_SIZE),
          (prev: typeof result) =>
            prev
              ? { ...prev, data: prev.data.map(p => (p.id === id ? { ...p, ...updated } : p)) }
              : prev
        );
        return updated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al actualizar producto';
        notificationService.error(message);
        throw err;
      }
    },
    [queryClient, page, result]
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteProductUseCase.execute(id);
        queryClient.setQueryData(
          productsPageKey(page, PAGE_SIZE),
          (prev: typeof result) =>
            prev
              ? { ...prev, data: prev.data.filter(p => p.id !== id), total: prev.total - 1 }
              : prev
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al eliminar producto';
        notificationService.error(message);
        throw err;
      }
    },
    [queryClient, page, result]
  );

  // Usa el cache de React Query: si ya se cargaron las variantes de este producto,
  // no hace un nuevo request hasta que pasen 60s.
  const getProductVariants = useCallback(
    async (productId: string): Promise<ProductVariant[]> => {
      return queryClient.fetchQuery({
        queryKey: productVariantsKey(productId),
        queryFn: () => getProductVariantsUseCase.execute(productId),
        staleTime: 60_000,
      });
    },
    [queryClient]
  );

  const createVariant = useCallback(
    async (productId: string, variantData: any): Promise<ProductVariant> => {
      try {
        const result = await createVariantUseCase.execute(
          productId,
          variantData
        );
        queryClient.invalidateQueries({
          queryKey: productVariantsKey(productId),
        });
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al crear variante';
        notificationService.error(message);
        throw err;
      }
    },
    [queryClient]
  );

  const updateVariant = useCallback(
    async (variantId: string, variantData: any): Promise<ProductVariant> => {
      try {
        return await updateVariantUseCase.execute(variantId, variantData);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al actualizar variante';
        notificationService.error(message);
        throw err;
      }
    },
    [queryClient]
  );

  const deleteVariant = useCallback(
    async (variantId: string): Promise<void> => {
      try {
        await deleteVariantUseCase.execute(variantId);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al eliminar variante';
        notificationService.error(message);
        throw err;
      }
    },
    [queryClient]
  );

  return {
    products,
    loading,
    error,
    page,
    setPage,
    totalProducts,
    totalPages,
    pageSize: PAGE_SIZE,
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
