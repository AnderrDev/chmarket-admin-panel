import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useProducts } from '../useProducts';

// ---- Mock the entire container module ----
vi.mock('@/application/container', () => ({
  listProductsUseCase: { execute: vi.fn() },
  createProductUseCase: { execute: vi.fn() },
  updateProductUseCase: { execute: vi.fn() },
  deleteProductUseCase: { execute: vi.fn() },
  getProductVariantsUseCase: { execute: vi.fn() },
  getLowStockProductsUseCase: { execute: vi.fn() },
  createVariantUseCase: { execute: vi.fn() },
  updateVariantUseCase: { execute: vi.fn() },
  deleteVariantUseCase: { execute: vi.fn() },
}));

// ---- Mock NotificationService ----
vi.mock('@/application/services/NotificationService', () => ({
  notificationService: { error: vi.fn(), success: vi.fn() },
}));

import {
  listProductsUseCase,
  createProductUseCase,
  updateProductUseCase,
  deleteProductUseCase,
  getProductVariantsUseCase,
} from '@/application/container';

const mockProduct = {
  id: 'prod-1',
  name: 'Proteína Whey',
  slug: 'proteina-whey',
  is_active: true,
  is_featured: false,
  images: [],
  store: 'CH+',
  category_id: 'cat-1',
  category_name: 'Proteínas',
  default_price_cents: 15000000,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

const mockListResult = {
  data: [mockProduct],
  total: 1,
  page: 1,
  pageSize: 24,
};

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga productos en el estado inicial', async () => {
    vi.mocked(listProductsUseCase.execute).mockResolvedValue(mockListResult);

    const { result } = renderHook(() => useProducts(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].name).toBe('Proteína Whey');
    expect(result.current.totalProducts).toBe(1);
    expect(result.current.totalPages).toBe(1);
  });

  it('crea un producto e invalida el cache', async () => {
    vi.mocked(listProductsUseCase.execute).mockResolvedValue(mockListResult);
    vi.mocked(createProductUseCase.execute).mockResolvedValue({
      product_id: 'prod-2',
      variant_ids: ['var-1'],
    });

    const { result } = renderHook(() => useProducts(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createProduct({ name: 'Nuevo', slug: 'nuevo' }, []);
    });

    expect(createProductUseCase.execute).toHaveBeenCalledOnce();
  });

  it('actualiza un producto optimistamente en el cache', async () => {
    vi.mocked(listProductsUseCase.execute).mockResolvedValue(mockListResult);
    const updated = { ...mockProduct, name: 'Proteína Whey Gold' };
    vi.mocked(updateProductUseCase.execute).mockResolvedValue(updated as any);

    const { result } = renderHook(() => useProducts(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateProduct('prod-1', { name: 'Proteína Whey Gold' });
    });

    expect(updateProductUseCase.execute).toHaveBeenCalledWith('prod-1', {
      name: 'Proteína Whey Gold',
    });
  });

  it('elimina un producto y actualiza el cache', async () => {
    vi.mocked(listProductsUseCase.execute).mockResolvedValue(mockListResult);
    vi.mocked(deleteProductUseCase.execute).mockResolvedValue(undefined);

    const { result } = renderHook(() => useProducts(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteProduct('prod-1');
    });

    expect(deleteProductUseCase.execute).toHaveBeenCalledWith('prod-1');
  });

  it('cachea variantes de producto con fetchQuery', async () => {
    vi.mocked(listProductsUseCase.execute).mockResolvedValue(mockListResult);
    const mockVariants = [{ id: 'var-1', label: '1kg', sku: 'SKU-001' }];
    vi.mocked(getProductVariantsUseCase.execute).mockResolvedValue(
      mockVariants as any
    );

    const { result } = renderHook(() => useProducts(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let variants: any;
    await act(async () => {
      variants = await result.current.getProductVariants('prod-1');
    });

    expect(variants).toHaveLength(1);
    expect(getProductVariantsUseCase.execute).toHaveBeenCalledWith('prod-1');

    // Segunda llamada debe usar el cache — use case no se llama de nuevo
    await act(async () => {
      await result.current.getProductVariants('prod-1');
    });
    expect(getProductVariantsUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('expone paginación correctamente', async () => {
    const multiPageResult = { data: Array(24).fill(mockProduct), total: 50, page: 1, pageSize: 24 };
    vi.mocked(listProductsUseCase.execute).mockResolvedValue(multiPageResult);

    const { result } = renderHook(() => useProducts(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalProducts).toBe(50);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.page).toBe(1);

    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);
  });
});
