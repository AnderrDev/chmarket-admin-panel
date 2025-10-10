// src/domain/usecases/discount/ListDiscounts.ts
import type { DiscountCode } from '@/data/entities/discount';
import type { DiscountRepository } from '../../repositories/discount/DiscountRepository';

export class ListDiscountsUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(): Promise<DiscountCode[]> {
    return this.discountRepository.listDiscounts();
  }
}
