// src/data/repositories/CategoryRepositoryImpl.ts
import type { Category, CategoryFormData } from '@/data/entities/category';
import type { CategoryRepository } from '@/domain/repositories/category/CategoryRepository';
import type { CategoryDataSource } from '@/data/datasources/CategoryDataSource';

export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(private readonly dataSource: CategoryDataSource) {}

  async listCategories(): Promise<Category[]> {
    return this.dataSource.listCategories();
  }

  async getCategory(id: string): Promise<Category | null> {
    return this.dataSource.getCategory(id);
  }

  async createCategory(categoryData: CategoryFormData): Promise<Category> {
    return this.dataSource.createCategory(categoryData);
  }

  async updateCategory(
    id: string,
    categoryData: CategoryFormData
  ): Promise<Category> {
    return this.dataSource.updateCategory(id, categoryData);
  }

  async deleteCategory(id: string): Promise<void> {
    return this.dataSource.deleteCategory(id);
  }
}
