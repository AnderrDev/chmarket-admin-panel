// src/domain/usecases/category/DeleteCategory.ts
import type { CategoryRepository } from '../../repositories/category/CategoryRepository';

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<void> {
    return this.categoryRepository.deleteCategory(id);
  }
}
