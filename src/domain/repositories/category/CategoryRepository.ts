// src/domain/repositories/category/CategoryRepository.ts
import type { Category, CategoryFormData } from '@/data/entities/category';

export interface CategoryRepository {
  listCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | null>;
  createCategory(categoryData: CategoryFormData): Promise<Category>;
  updateCategory(id: string, categoryData: CategoryFormData): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}
