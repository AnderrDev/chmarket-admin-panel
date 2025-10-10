// src/data/repositories/DiscountRepositoryImpl.ts
import type { DiscountCode } from '@/data/entities/discount';
import type {
  DiscountRepository,
  DiscountFormData,
} from '@/domain/repositories/discount/DiscountRepository';
import type { DiscountDataSource } from '@/data/datasources/DiscountDataSource';

export class DiscountRepositoryImpl implements DiscountRepository {
  constructor(private readonly dataSource: DiscountDataSource) {}

  async listDiscounts(): Promise<DiscountCode[]> {
    return this.dataSource.listDiscounts();
  }

  async getDiscount(id: string): Promise<DiscountCode | null> {
    return this.dataSource.getDiscount(id);
  }

  async createDiscount(discountData: DiscountFormData): Promise<DiscountCode> {
    return this.dataSource.createDiscount(discountData);
  }

  async updateDiscount(
    id: string,
    discountData: Partial<DiscountFormData>
  ): Promise<DiscountCode> {
    return this.dataSource.updateDiscount(id, discountData);
  }

  async deleteDiscount(id: string): Promise<void> {
    return this.dataSource.deleteDiscount(id);
  }

  async toggleDiscountStatus(
    id: string,
    isActive: boolean
  ): Promise<DiscountCode> {
    return this.dataSource.toggleDiscountStatus(id, isActive);
  }

  async getActiveDiscounts(): Promise<DiscountCode[]> {
    return this.dataSource.getActiveDiscounts();
  }
}
