// src/domain/usecases/discount/ToggleDiscountStatus.ts
import type { DiscountCode } from '@/data/entities/discount';
import type { DiscountRepository } from '../../repositories/discount/DiscountRepository';

export class ToggleDiscountStatusUseCase {
  constructor(private readonly discountRepository: DiscountRepository) {}

  async execute(id: string, isActive: boolean): Promise<DiscountCode> {
    return this.discountRepository.toggleDiscountStatus(id, isActive);
  }
}
