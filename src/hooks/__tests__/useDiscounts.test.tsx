import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useDiscounts } from '../useDiscounts';

// ---- Mock the container ----
vi.mock('@/application/container', () => ({
  listDiscountsUseCase: { execute: vi.fn() },
  createDiscountUseCase: { execute: vi.fn() },
  updateDiscountUseCase: { execute: vi.fn() },
  deleteDiscountUseCase: { execute: vi.fn() },
  toggleDiscountStatusUseCase: { execute: vi.fn() },
  getActiveDiscountsUseCase: { execute: vi.fn() },
}));

// ---- Mock react-hot-toast ----
vi.mock('react-hot-toast', () => ({
  default: { error: vi.fn(), success: vi.fn() },
  __esModule: true,
}));

import {
  listDiscountsUseCase,
  createDiscountUseCase,
  updateDiscountUseCase,
  deleteDiscountUseCase,
  toggleDiscountStatusUseCase,
} from '@/application/container';
import toast from 'react-hot-toast';

const mockDiscount = {
  id: 'disc-1',
  code: 'SUMMER20',
  type: 'PERCENT' as const,
  value_percent: 20,
  value_cents: null,
  currency: 'COP' as const,
  min_order_cents: 0,
  combinable: false,
  is_active: true,
  applies_to_all_products: true,
  applicable_product_ids: null,
  applicable_category_ids: null,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  order_discounts: [{ count: 5 }],
};

describe('useDiscounts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('carga cupones al montar y calcula usage_count', async () => {
    vi.mocked(listDiscountsUseCase.execute).mockResolvedValue([mockDiscount]);

    const { result } = renderHook(() => useDiscounts());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.discounts).toHaveLength(1);
    expect(result.current.discounts[0].code).toBe('SUMMER20');
    expect(result.current.discounts[0].usage_count).toBe(5);
  });

  it('crea cupón y lo antepone a la lista', async () => {
    vi.mocked(listDiscountsUseCase.execute).mockResolvedValue([mockDiscount]);
    const newDiscount = { ...mockDiscount, id: 'disc-2', code: 'NEW10' };
    vi.mocked(createDiscountUseCase.execute).mockResolvedValue(newDiscount);

    const { result } = renderHook(() => useDiscounts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.createDiscount({ code: 'NEW10', type: 'PERCENT' });
    });

    expect(result.current.discounts[0].code).toBe('NEW10');
    expect(result.current.discounts).toHaveLength(2);
  });

  it('actualiza cupón en la lista en el lugar correcto', async () => {
    vi.mocked(listDiscountsUseCase.execute).mockResolvedValue([mockDiscount]);
    const updated = { ...mockDiscount, value_percent: 30 };
    vi.mocked(updateDiscountUseCase.execute).mockResolvedValue(updated);

    const { result } = renderHook(() => useDiscounts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.updateDiscount('disc-1', { value_percent: 30 });
    });

    expect(result.current.discounts[0].value_percent).toBe(30);
    expect(result.current.discounts).toHaveLength(1);
  });

  it('elimina cupón de la lista y muestra toast de éxito', async () => {
    vi.mocked(listDiscountsUseCase.execute).mockResolvedValue([mockDiscount]);
    vi.mocked(deleteDiscountUseCase.execute).mockResolvedValue(undefined);

    const { result } = renderHook(() => useDiscounts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.deleteDiscount('disc-1');
    });

    expect(result.current.discounts).toHaveLength(0);
    expect(toast.success).toHaveBeenCalledWith('Cupón eliminado exitosamente');
  });

  it('cambia estado activo/inactivo del cupón', async () => {
    vi.mocked(listDiscountsUseCase.execute).mockResolvedValue([mockDiscount]);
    const toggled = { ...mockDiscount, is_active: false };
    vi.mocked(toggleDiscountStatusUseCase.execute).mockResolvedValue(toggled);

    const { result } = renderHook(() => useDiscounts());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.toggleDiscountStatus('disc-1', false);
    });

    expect(result.current.discounts[0].is_active).toBe(false);
    expect(toggleDiscountStatusUseCase.execute).toHaveBeenCalledWith('disc-1', false);
  });

  it('maneja error al cargar y expone mensaje', async () => {
    vi.mocked(listDiscountsUseCase.execute).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHook(() => useDiscounts());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.discounts).toHaveLength(0);
    expect(toast.error).toHaveBeenCalledWith('Error al cargar cupones');
  });
});
