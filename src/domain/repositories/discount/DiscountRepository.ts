// src/domain/repositories/discount/DiscountRepository.ts
import type { DiscountCode } from '@/data/entities/discount';

export interface DiscountFormData {
  code: string;
  type: 'PERCENT' | 'FIXED' | 'FREE_SHIPPING';
  value_percent?: number;
  value_cents?: number;
  min_order_cents: number;
  max_redemptions_total?: number;
  max_redemptions_per_customer?: number;
  combinable: boolean;
  start_at?: string | null;
  end_at?: string | null;
  is_active: boolean;
  currency: 'COP';
}

export interface DiscountRepository {
  listDiscounts(): Promise<DiscountCode[]>;
  getDiscount(id: string): Promise<DiscountCode | null>;
  createDiscount(discountData: DiscountFormData): Promise<DiscountCode>;
  updateDiscount(
    id: string,
    discountData: Partial<DiscountFormData>
  ): Promise<DiscountCode>;
  deleteDiscount(id: string): Promise<void>;
  toggleDiscountStatus(id: string, isActive: boolean): Promise<DiscountCode>;
  getActiveDiscounts(): Promise<DiscountCode[]>;
}
