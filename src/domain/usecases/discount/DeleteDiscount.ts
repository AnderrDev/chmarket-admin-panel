// src/domain/usecases/discount/DeleteDiscount.ts
import type { DiscountRepository } from '../../repositories/discount/DiscountRepository';

export class DeleteDiscountUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(id: string): Promise<void> {
    return this.discountRepository.deleteDiscount(id);
  }
}
