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
  createVariantUseCase,
  updateVariantUseCase,
  deleteVariantUseCase,
} from '@/application/container';
import { notificationService } from '@/application/services/NotificationService';

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

  // ...existing tests: omit for brevity...

  it('notifica error al crear producto', async () => {
    vi.mocked(listProductsUseCase.execute).mockResolvedValue(mockListResult);
    const err = new Error('fail create');
    vi.mocked(createProductUseCase.execute).mockRejectedValue(err);
    const { result } = renderHook(() => useProducts(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await expect(
      act(async () => {
        await result.current.createProduct({ name: 'fail', slug: 'f' }, []);
      })
    ).rejects.toThrow('fail create');
    expect(notificationService.error).toHaveBeenCalledWith('fail create');
  });

  it('notifica error al actualizar producto', async () => {
    vi.mocked(listProductsUseCase.execute).mockResolvedValue(mockListResult);
    const err = new Error('fail update');
    vi.mocked(updateProductUseCase.execute).mockRejectedValue(err);
    const { result } = renderHook(() => useProducts(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await expect(
      act(async () => {
        await result.current.updateProduct('prod-1', { name: 'fail' });
      })
    ).rejects.toThrow('fail update');
    expect(notificationService.error).toHaveBeenCalledWith('fail update');
  });

  it('notifica error al eliminar producto', async () => {
    vi.mocked(listProductsUseCase.execute).mockResolvedValue(mockListResult);
    vi.mocked(deleteProductUseCase.execute).mockRejectedValue(new Error('fail delete'));
    const { result } = renderHook(() => useProducts(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    await expect(
      act(async () => {
        await result.current.deleteProduct('prod-1');
      })
    ).rejects.toThrow('fail delete');
    expect(notificationService.error).toHaveBeenCalledWith('fail delete');
  });

  it('notifica error al crear variante', async () => {
    vi.mocked(createVariantUseCase.execute).mockRejectedValue(new Error('fail variant'));
    const { result } = renderHook(() => useProducts(), { wrapper });
    await expect(
      act(async () => {
        await result.current.createVariant('prod-1', { label: '1kg' });
      })
    ).rejects.toThrow('fail variant');
    expect(notificationService.error).toHaveBeenCalledWith('fail variant');
  });

  it('notifica error al actualizar variante', async () => {
    vi.mocked(updateVariantUseCase.execute).mockRejectedValue(new Error('fail up var'));
    const { result } = renderHook(() => useProducts(), { wrapper });
    await expect(
      act(async () => {
        await result.current.updateVariant('var-1', { label: 'new' });
      })
    ).rejects.toThrow('fail up var');
    expect(notificationService.error).toHaveBeenCalledWith('fail up var');
  });

  it('notifica error al eliminar variante', async () => {
    vi.mocked(deleteVariantUseCase.execute).mockRejectedValue(new Error('fail del var'));
    const { result } = renderHook(() => useProducts(), { wrapper });
    await expect(
      act(async () => {
        await result.current.deleteVariant('var-1');
      })
    ).rejects.toThrow('fail del var');
    expect(notificationService.error).toHaveBeenCalledWith('fail del var');
  });
});
