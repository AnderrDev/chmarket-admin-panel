// src/domain/usecases/category/ListCategories.ts
import type { Category } from '@/data/entities/category';
import type { CategoryRepository } from '../../repositories/category/CategoryRepository';

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<Category[]> {
    return this.categoryRepository.listCategories();
  }
}
