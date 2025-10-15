// src/data/entities/product.ts
import type { Json, ImageRef, Currency } from './common';

export interface Product {
  id: string;
  slug: string;
  name: string;

  description?: string;
  long_description?: string;
  features?: string[];
  ingredients?: string[];

  images?: ImageRef[];

  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;

  category_id: string | null;
  category_name?: string;
  store?: string;

  default_variant_id?: string;
  default_price_cents?: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  label: string;
  flavor?: string;
  size?: string;
  options?: Json;

  price_cents: number;
  compare_at_price_cents?: number | null;
  currency: Currency;

  in_stock: number;
  low_stock_threshold: number;

  weight_grams?: number | null;
  dimensions?: Json;
  images?: ImageRef[];

  position?: number;
  is_default?: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export type CreateRPCResponse = { product_id: string; variant_ids: string[] };
