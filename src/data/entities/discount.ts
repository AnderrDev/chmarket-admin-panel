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
  // TEMPORAL: max_redemptions_per_customer?: number | null;
  combinable: boolean;
  start_at?: string | null;
  end_at?: string | null;
  is_active: boolean;
  applies_to_all_products: boolean;
  applicable_product_ids?: string[] | null;
  applicable_category_ids?: string[] | null;
  created_at: string;
  updated_at: string;
  // Información de usos
  order_discounts?: { count: number }[];
  usage_count?: number; // Campo calculado para facilitar el uso
}
