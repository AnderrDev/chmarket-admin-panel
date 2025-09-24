// src/types/index.ts

export type Currency = 'COP'
export type DiscountType = 'PERCENT' | 'FIXED' | 'FREE_SHIPPING'
export type OrderStatus = 'CREATED' | 'PAID' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED'
export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED'

export type Json =
  | { [key: string]: Json }
  | Json[]
  | string
  | number
  | boolean
  | null

// Guardamos url, alt y path (para borrar en Storage)
export type ImageRef = string | { url: string; alt?: string; path?: string }

export interface Product {
  id: string
  slug: string
  name: string

  description?: string
  long_description?: string
  features?: string[]
  ingredients?: string[]

  images?: ImageRef[]

  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null

  category_id: string | null
  category_name?: string

  default_variant_id?: string
  default_price_cents?: number
}

export interface ProductVariant {
  id: string
  product_id: string
  sku: string
  label: string
  flavor?: string
  size?: string
  options?: Json

  price_cents: number
  compare_at_price_cents?: number | null
  currency: Currency

  in_stock: number
  low_stock_threshold: number

  weight_grams?: number | null
  dimensions?: Json
  images?: ImageRef[]

  position?: number
  is_default?: boolean
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

export interface Address {
  city?: string
  name?: string
  email?: string
  phone?: string
  address?: string
  country?: string
  zipCode?: string
  documentType?: string
  documentNumber?: string
}

export interface Order {
  id: string
  order_number: string
  email: string
  status: OrderStatus

  subtotal_cents: number
  shipping_cents: number
  discount_cents: number
  total_cents: number
  currency: Currency

  shipping_address?: Address
  billing_address?: Address

  payment_provider?: string
  payment_status?: PaymentStatus
  payment_preference_id?: string | null
  payment_id?: string | null
  payment_external_reference?: string | null
  payment_raw?: Json | null

  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string
  name_snapshot: string
  variant_label?: string
  unit_price_cents: number
  quantity: number
}

export interface DiscountCode {
  id: string
  code: string
  type: DiscountType
  value_percent?: number | null
  value_cents?: number | null
  currency: Currency
  min_order_cents: number
  max_redemptions_total?: number | null
  max_redemptions_per_customer?: number | null
  combinable: boolean
  start_at?: string | null
  end_at?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  created_at: string
  updated_at: string
  product_count?: number
}

export interface CategoryFormData {
  name: string
}

export interface DashboardStats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  lowStockProducts: number
  activeDiscounts: number
}

// Helpers
export function isImageObject(x: ImageRef): x is { url: string; alt?: string; path?: string } {
  return !!x && typeof x === 'object' && 'url' in x && typeof (x as any).url === 'string'
}
export function normalizeImages(arr?: ImageRef[]): { url: string; alt?: string; path?: string }[] {
  if (!arr || !Array.isArray(arr)) return []
  return arr
    .map(img => (typeof img === 'string' ? { url: img } : img))
    .filter(i => !!i?.url)
}
export function firstImageUrl(arr?: ImageRef[]): string | undefined {
  if (!arr || !arr.length) return undefined
  const first = arr[0]
  return typeof first === 'string' ? first : first?.url
}
