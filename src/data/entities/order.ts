// src/data/entities/order.ts
import type {
  Json,
  Currency,
  OrderStatus,
  PaymentStatus,
  Address,
} from './common';

export interface Order {
  id: string;
  order_number: string;
  email: string;
  status: OrderStatus;

  subtotal_cents: number;
  shipping_cents: number;
  discount_cents: number;
  total_cents: number;
  currency: Currency;

  shipping_address?: Address;
  billing_address?: Address;

  payment_provider?: string;
  payment_status?: PaymentStatus;
  payment_preference_id?: string | null;
  payment_id?: string | null;
  payment_external_reference?: string | null;
  payment_raw?: Json | null;

  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  name_snapshot: string;
  variant_label?: string;
  unit_price_cents: number;
  quantity: number;
}
