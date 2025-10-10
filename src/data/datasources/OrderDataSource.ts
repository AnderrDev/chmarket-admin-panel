// src/data/datasources/OrderDataSource.ts
import { supabase } from '@/lib/supabase';
import type { Order, OrderItem } from '@/data/entities/order';

export interface OrderDataSource {
  listOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | null>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  updateOrderStatus(id: string, status: Order['status']): Promise<Order>;
  getOrdersByStatus(status: Order['status']): Promise<Order[]>;
  getOrdersStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    paidOrders: number;
  }>;
}

export class SupabaseOrderDataSource implements OrderDataSource {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-orders`;
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

  async listOrders(): Promise<Order[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/list`, {
      method: 'GET',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al cargar órdenes');
    }

    return result.data || [];
  }

  async getOrder(id: string): Promise<Order | null> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al obtener orden');
    }

    return result.data;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/${orderId}-items`, {
      method: 'GET',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al cargar items de la orden');
    }

    return result.data || [];
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(this.baseUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ orderId: id, status }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al actualizar estado de orden');
    }

    return result.data;
  }

  async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/by-status`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ status }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al cargar órdenes por estado');
    }

    return result.data || [];
  }

  async getOrdersStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    paidOrders: number;
  }> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/stats`, {
      method: 'GET',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || 'Error al cargar estadísticas de órdenes'
      );
    }

    return result.data;
  }
}
