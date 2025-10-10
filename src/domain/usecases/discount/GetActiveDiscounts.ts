// src/domain/usecases/discount/GetActiveDiscounts.ts
import type { DiscountCode } from '@/data/entities/discount';
import type { DiscountRepository } from '../../repositories/discount/DiscountRepository';

export class GetActiveDiscountsUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(): Promise<DiscountCode[]> {
    return this.discountRepository.getActiveDiscounts();
  }
}
