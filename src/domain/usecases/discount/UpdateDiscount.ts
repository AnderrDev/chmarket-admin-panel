// src/domain/usecases/discount/UpdateDiscount.ts
import type { DiscountCode } from '@/data/entities/discount';
import type {
  DiscountRepository,
  DiscountFormData,
} from '../../repositories/discount/DiscountRepository';

export class UpdateDiscountUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(
    id: string,
    discountData: Partial<DiscountFormData>
  ): Promise<DiscountCode> {
    return this.discountRepository.updateDiscount(id, discountData);
  }
}
