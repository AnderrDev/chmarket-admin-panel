// src/domain/usecases/category/UpdateCategory.ts
import type { Category } from '@/data/entities/category';
import type { CategoryFormData } from '@/data/entities/category';
import type { CategoryRepository } from '../../repositories/category/CategoryRepository';

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string, categoryData: CategoryFormData): Promise<Category> {
    return this.categoryRepository.updateCategory(id, categoryData);
  }
}
