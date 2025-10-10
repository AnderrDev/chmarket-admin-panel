// src/data/entities/discount.ts
import type { Currency, DiscountType } from './common';

export interface DiscountCode {
  id: string;
  code: string;
  type: DiscountType;
  value_percent?: number | null;
  value_cents?: number | null;
  currency: Currency;
  min_order_cents: number;
  max_redemptions_total?: number | null;
  max_redemptions_per_customer?: number | null;
  combinable: boolean;
  start_at?: string | null;
  end_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
