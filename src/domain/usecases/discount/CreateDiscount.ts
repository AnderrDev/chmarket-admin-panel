// src/domain/usecases/discount/CreateDiscount.ts
import type { DiscountCode } from '@/data/entities/discount';
import type {
  DiscountRepository,
  DiscountFormData,
} from '../../repositories/discount/DiscountRepository';

export class CreateDiscountUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(discountData: DiscountFormData): Promise<DiscountCode> {
    return this.discountRepository.createDiscount(discountData);
  }
}
