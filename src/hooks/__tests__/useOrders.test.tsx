import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useOrders } from '../useOrders';

// ---- Mock the container ----
vi.mock('@/application/container', () => ({
  listOrdersUseCase: { execute: vi.fn() },
  getOrderUseCase: { execute: vi.fn() },
  getOrderItemsUseCase: { execute: vi.fn() },
  updateOrderStatusUseCase: { execute: vi.fn() },
  getOrdersByStatusUseCase: { execute: vi.fn() },
  getOrdersStatsUseCase: { execute: vi.fn() },
}));

// ---- Mock react-hot-toast ----
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
  __esModule: true,
}));

import {
  listOrdersUseCase,
  getOrderItemsUseCase,
  updateOrderStatusUseCase,
} from '@/application/container';

const mockOrder = {
  id: 'order-1',
  order_number: 'CH-0001',
  email: 'test@example.com',
  status: 'CREATED' as const,
  payment_status: 'PENDING' as const,
  subtotal_cents: 15000000,
  discount_cents: 0,
  shipping_cents: 500000,
  total_cents: 15500000,
  currency: 'COP' as const,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  shipping_address: {},
  payment_provider: 'mercadopago',
  order_discounts: [],
};

const mockListResult = {
  data: [mockOrder],
  total: 1,
  page: 1,
  pageSize: 50,
};

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

describe('useOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga órdenes en el estado inicial', async () => {
    vi.mocked(listOrdersUseCase.execute).mockResolvedValue(mockListResult);

    const { result } = renderHook(() => useOrders(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0].order_number).toBe('CH-0001');
    expect(result.current.totalOrders).toBe(1);
  });

  it('actualiza estado de orden y reflejan en el cache', async () => {
    vi.mocked(listOrdersUseCase.execute).mockResolvedValue(mockListResult);
    const updatedOrder = { ...mockOrder, status: 'PAID' as const };
    vi.mocked(updateOrderStatusUseCase.execute).mockResolvedValue(updatedOrder);

    const { result } = renderHook(() => useOrders(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateOrderStatus('order-1', 'PAID');
    });

    expect(updateOrderStatusUseCase.execute).toHaveBeenCalledWith('order-1', 'PAID');

    // El cache local debe reflejar el cambio sin hacer un nuevo fetch
    await waitFor(() =>
      expect(result.current.orders[0].status).toBe('PAID')
    );
  });

  it('cachea order items — no hace doble request para el mismo ID', async () => {
    vi.mocked(listOrdersUseCase.execute).mockResolvedValue(mockListResult);
    const mockItems = [{ id: 'item-1', product_id: 'prod-1', quantity: 2 }];
    vi.mocked(getOrderItemsUseCase.execute).mockResolvedValue(mockItems as any);

    const { result } = renderHook(() => useOrders(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let items: any;
    await act(async () => {
      items = await result.current.getOrderItems('order-1');
    });

    expect(items).toHaveLength(1);
    expect(getOrderItemsUseCase.execute).toHaveBeenCalledWith('order-1');

    // Segunda llamada usa cache — use case no se vuelve a llamar
    await act(async () => {
      await result.current.getOrderItems('order-1');
    });
    expect(getOrderItemsUseCase.execute).toHaveBeenCalledTimes(1);
  });

  it('expone paginación correctamente', async () => {
    const multiPageResult = {
      data: Array(50).fill(mockOrder),
      total: 120,
      page: 1,
      pageSize: 50,
    };
    vi.mocked(listOrdersUseCase.execute).mockResolvedValue(multiPageResult);

    const { result } = renderHook(() => useOrders(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.totalOrders).toBe(120);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.page).toBe(1);

    act(() => result.current.setPage(2));
    expect(result.current.page).toBe(2);
  });

  it('maneja error al cargar órdenes', async () => {
    vi.mocked(listOrdersUseCase.execute).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useOrders(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.orders).toHaveLength(0);
  });
});
