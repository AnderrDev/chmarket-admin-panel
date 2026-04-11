import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useCategories } from '../useCategories';

const mockCategories = [
  {
    id: 'cat-1',
    name: 'Proteínas',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    product_count: 5,
  },
];

// Hoisted so the factory can reference it before module resolution
const mockViewModel = vi.hoisted(() => ({
  getCategories: vi.fn(() => mockCategories),
  isLoading: vi.fn(() => false),
  getError: vi.fn(() => null as string | null),
  fetchCategories: vi.fn(async () => {}),
  createCategory: vi.fn(),
  updateCategory: vi.fn(),
  deleteCategory: vi.fn(),
}));

vi.mock('@/application/container', () => ({
  categoryViewModel: mockViewModel,
}));

describe('useCategories', () => {
  // Mutable state mirror shared between mock implementations
  let _categories = [...mockCategories];
  let _error: string | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    _categories = [...mockCategories];
    _error = null;
    mockViewModel.getCategories.mockImplementation(() => _categories);
    mockViewModel.isLoading.mockReturnValue(false);
    mockViewModel.getError.mockImplementation(() => _error);
    mockViewModel.fetchCategories.mockResolvedValue(undefined);
  });

  it('carga categorías al montar', async () => {
    const { result } = renderHook(() => useCategories());

    await waitFor(() =>
      expect(mockViewModel.fetchCategories).toHaveBeenCalledTimes(1)
    );

    expect(result.current.categories).toHaveLength(1);
    expect(result.current.categories[0].name).toBe('Proteínas');
  });

  it('crea categoría y actualiza la lista', async () => {
    const newCat = {
      id: 'cat-2',
      name: 'Pre-entrenos',
      created_at: '2025-01-02T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
    };

    mockViewModel.createCategory.mockImplementation(async () => {
      _categories = [..._categories, newCat];
      return newCat;
    });

    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(mockViewModel.fetchCategories).toHaveBeenCalled());

    await act(async () => {
      await result.current.createCategory({ name: 'Pre-entrenos' });
    });

    expect(result.current.categories).toHaveLength(2);
    expect(result.current.categories[1].name).toBe('Pre-entrenos');
  });

  it('actualiza categoría y refleja el cambio', async () => {
    const updated = { ...mockCategories[0], name: 'Proteínas Premium' };

    mockViewModel.updateCategory.mockImplementation(async () => {
      _categories = [updated];
      return updated;
    });

    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(mockViewModel.fetchCategories).toHaveBeenCalled());

    await act(async () => {
      await result.current.updateCategory('cat-1', { name: 'Proteínas Premium' });
    });

    expect(result.current.categories[0].name).toBe('Proteínas Premium');
  });

  it('elimina categoría y actualiza la lista', async () => {
    mockViewModel.deleteCategory.mockImplementation(async () => {
      _categories = [];
    });

    const { result } = renderHook(() => useCategories());
    await waitFor(() => expect(mockViewModel.fetchCategories).toHaveBeenCalled());

    await act(async () => {
      await result.current.deleteCategory('cat-1');
    });

    expect(result.current.categories).toHaveLength(0);
    expect(mockViewModel.deleteCategory).toHaveBeenCalledWith('cat-1');
  });

  it('expone error cuando fetchCategories falla', async () => {
    mockViewModel.fetchCategories.mockImplementation(async () => {
      _error = 'Error al cargar categorías';
      _categories = [];
    });

    const { result } = renderHook(() => useCategories());

    await waitFor(() =>
      expect(mockViewModel.fetchCategories).toHaveBeenCalled()
    );

    expect(result.current.error).toBe('Error al cargar categorías');
    expect(result.current.categories).toHaveLength(0);
  });
});
