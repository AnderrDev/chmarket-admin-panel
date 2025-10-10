// src/presentation/viewmodels/CategoryViewModel.ts
import { useState, useCallback } from 'react';
import type { Category, CategoryFormData } from '@/data/entities/category';
import type { NotificationService } from '@/application/services/NotificationService';
import { ListCategoriesUseCase } from '@/domain/usecases/category/ListCategories';
import { CreateCategoryUseCase } from '@/domain/usecases/category/CreateCategory';
import { UpdateCategoryUseCase } from '@/domain/usecases/category/UpdateCategory';
import { DeleteCategoryUseCase } from '@/domain/usecases/category/DeleteCategory';

export class CategoryViewModel {
  private categories: Category[] = [];
  private loading = false;
  private error: string | null = null;

  constructor(
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly deleteCategoryUseCase: DeleteCategoryUseCase,
    private readonly notificationService: NotificationService
  ) {}

  // Getters
  getCategories(): Category[] {
    return this.categories;
  }

  isLoading(): boolean {
    return this.loading;
  }

  getError(): string | null {
    return this.error;
  }

  // Actions
  async fetchCategories(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      this.categories = await this.listCategoriesUseCase.execute();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar categorías';
      this.error = message;
      this.notificationService.error(message);
    } finally {
      this.loading = false;
    }
  }

  async createCategory(categoryData: CategoryFormData): Promise<Category> {
    try {
      const result = await this.createCategoryUseCase.execute(categoryData);
      await this.fetchCategories(); // Refresh the list
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al crear categoría';
      this.notificationService.error(message);
      throw err;
    }
  }

  async updateCategory(
    id: string,
    categoryData: CategoryFormData
  ): Promise<Category> {
    try {
      const result = await this.updateCategoryUseCase.execute(id, categoryData);
      await this.fetchCategories(); // Refresh the list
      return result;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al actualizar categoría';
      this.notificationService.error(message);
      throw err;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await this.deleteCategoryUseCase.execute(id);
      await this.fetchCategories(); // Refresh the list
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar categoría';
      this.notificationService.error(message);
      throw err;
    }
  }
}

// Hook factory for React integration
export function useCategoryViewModel(viewModel: CategoryViewModel) {
  const [categories, setCategories] = useState<Category[]>(
    viewModel.getCategories()
  );
  const [loading, setLoading] = useState<boolean>(viewModel.isLoading());
  const [error, setError] = useState<string | null>(viewModel.getError());

  const fetchCategories = useCallback(async () => {
    await viewModel.fetchCategories();
    setCategories([...viewModel.getCategories()]);
    setLoading(viewModel.isLoading());
    setError(viewModel.getError());
  }, [viewModel]);

  const createCategory = useCallback(
    async (categoryData: CategoryFormData) => {
      const result = await viewModel.createCategory(categoryData);
      setCategories([...viewModel.getCategories()]);
      return result;
    },
    [viewModel]
  );

  const updateCategory = useCallback(
    async (id: string, categoryData: CategoryFormData) => {
      const result = await viewModel.updateCategory(id, categoryData);
      setCategories([...viewModel.getCategories()]);
      return result;
    },
    [viewModel]
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      await viewModel.deleteCategory(id);
      setCategories([...viewModel.getCategories()]);
    },
    [viewModel]
  );

  return {
    categories,
    loading,
    error,
    reload: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
