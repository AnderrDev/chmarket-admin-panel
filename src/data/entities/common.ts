// src/data/entities/common.ts

export type Currency = 'COP';
export type DiscountType = 'PERCENT' | 'FIXED' | 'FREE_SHIPPING';
export type OrderStatus =
  | 'CREATED'
  | 'PAID'
  | 'FULFILLED'
  | 'CANCELLED'
  | 'REFUNDED';
export type PaymentStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REFUNDED';

export type Json =
  | { [key: string]: Json }
  | Json[]
  | string
  | number
  | boolean
  | null;

// Guardamos url, alt y path (para borrar en Storage)
export type ImageRef = string | { url: string; alt?: string; path?: string };

export interface Address {
  city?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  zipCode?: string;
  documentType?: string;
  documentNumber?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  lowStockProducts: number;
  activeDiscounts: number;
}

// Helpers
export function isImageObject(
  x: ImageRef
): x is { url: string; alt?: string; path?: string } {
  return (
    !!x &&
    typeof x === 'object' &&
    'url' in x &&
    typeof (x as any).url === 'string'
  );
}

export function normalizeImages(
  arr?: ImageRef[]
): { url: string; alt?: string; path?: string }[] {
  if (!arr || !Array.isArray(arr)) return [];
  return arr
    .map(img => (typeof img === 'string' ? { url: img } : img))
    .filter(i => !!i?.url);
}

export function firstImageUrl(arr?: ImageRef[]): string | undefined {
  if (!arr || !arr.length) return undefined;
  const first = arr[0];
  return typeof first === 'string' ? first : first?.url;
}
