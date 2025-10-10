// src/data/datasources/DiscountDataSource.ts
import { supabase } from '@/lib/supabase';
import type { DiscountCode } from '@/data/entities/discount';
import type { DiscountFormData } from '@/domain/repositories/discount/DiscountRepository';

export interface DiscountDataSource {
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

export class SupabaseDiscountDataSource implements DiscountDataSource {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-discounts`;
  }

  private async getAuthHeaders() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    };
  }

  async listDiscounts(): Promise<DiscountCode[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/list`, {
      method: 'GET',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al cargar cupones');
    }

    return result.data || [];
  }

  async getDiscount(id: string): Promise<DiscountCode | null> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al obtener cupón');
    }

    return result.data;
  }

  async createDiscount(discountData: DiscountFormData): Promise<DiscountCode> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify(discountData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al crear cupón');
    }

    return result.data;
  }

  async updateDiscount(
    id: string,
    discountData: Partial<DiscountFormData>
  ): Promise<DiscountCode> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ discountId: id, discountData }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al actualizar cupón');
    }

    return result.data;
  }

  async deleteDiscount(id: string): Promise<void> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(this.baseUrl, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ discountId: id }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al eliminar cupón');
    }
  }

  async toggleDiscountStatus(
    id: string,
    isActive: boolean
  ): Promise<DiscountCode> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/toggle-status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ discountId: id, isActive }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al cambiar estado del cupón');
    }

    return result.data;
  }

  async getActiveDiscounts(): Promise<DiscountCode[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/active`, {
      method: 'GET',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al cargar cupones activos');
    }

    return result.data || [];
  }
}
