import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CategoryViewModel } from '../CategoryViewModel';

const mockList = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockError = vi.fn();

const getVM = () =>
  new CategoryViewModel(
    { execute: mockList },
    { execute: mockCreate },
    { execute: mockUpdate },
    { execute: mockDelete },
    { error: mockError, success: vi.fn() }
  );

describe('CategoryViewModel', () => {
  let vm: CategoryViewModel;
  beforeEach(() => {
    vi.clearAllMocks();
    vm = getVM();
  });

  it('carga categorías correctamente', async () => {
    mockList.mockResolvedValueOnce([
      { id: 'cat1', name: 'C1', created_at: '', updated_at: '' },
    ]);
    await vm.fetchCategories();
    expect(vm.getCategories()).toHaveLength(1);
    expect(vm.isLoading()).toBe(false);
    expect(vm.getError()).toBeNull();
  });

  it('notifica y expone error si fetch falla', async () => {
    mockList.mockRejectedValueOnce(new Error('fail-list'));
    await vm.fetchCategories();
    expect(vm.getCategories()).toHaveLength(0);
    expect(vm.getError()).toBe('fail-list');
    expect(mockError).toHaveBeenCalledWith('fail-list');
    expect(vm.isLoading()).toBe(false);
  });

  it('createCategory refresca y retorna', async () => {
    const fake = { id: 'cat2', name: 'n', created_at: '', updated_at: '' };
    mockCreate.mockResolvedValueOnce(fake);
    mockList.mockResolvedValueOnce([fake]);
    const result = await vm.createCategory({ name: 'n' });
    expect(result).toBe(fake);
    expect(vm.getCategories()).toEqual([fake]);
  });

  it('notifica error en createCategory y propaga', async () => {
    mockCreate.mockRejectedValueOnce(new Error('fail-create'));
    try {
      await vm.createCategory({ name: 'err' });
      throw new Error('should-throw');
    } catch (e) {
      expect(`${e}`).toContain('fail-create');
      expect(mockError).toHaveBeenCalledWith('fail-create');
    }
  });

  it('updateCategory refresca y retorna', async () => {
    const fake = { id: 'cat3', name: 'n2', created_at: '', updated_at: '' };
    mockUpdate.mockResolvedValueOnce(fake);
    mockList.mockResolvedValueOnce([fake]);
    const result = await vm.updateCategory('cat3', { name: 'n2' });
    expect(result).toBe(fake);
    expect(vm.getCategories()).toEqual([fake]);
  });

  it('notifica error en updateCategory y propaga', async () => {
    mockUpdate.mockRejectedValueOnce(new Error('fail-update'));
    try {
      await vm.updateCategory('id', { name: 'err' });
      throw new Error('should-throw');
    } catch (e) {
      expect(`${e}`).toContain('fail-update');
      expect(mockError).toHaveBeenCalledWith('fail-update');
    }
  });

  it('deleteCategory refresca', async () => {
    mockDelete.mockResolvedValueOnce(undefined);
    mockList.mockResolvedValueOnce([]);
    await vm.deleteCategory('cat4');
    expect(vm.getCategories()).toEqual([]);
  });

  it('notifica error en deleteCategory y propaga', async () => {
    mockDelete.mockRejectedValueOnce(new Error('fail-delete'));
    try {
      await vm.deleteCategory('catx');
      throw new Error('should-throw');
    } catch (e) {
      expect(`${e}`).toContain('fail-delete');
      expect(mockError).toHaveBeenCalledWith('fail-delete');
    }
  });
});
