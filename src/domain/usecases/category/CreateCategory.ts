// src/domain/usecases/category/CreateCategory.ts
import type { Category } from '@/data/entities/category';
import type { CategoryFormData } from '@/data/entities/category';
import type { CategoryRepository } from '../../repositories/category/CategoryRepository';

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(categoryData: CategoryFormData): Promise<Category> {
    return this.categoryRepository.createCategory(categoryData);
  }
}
