// src/domain/repositories/order/OrderRepository.ts
import type { Order, OrderItem } from '@/data/entities/order';

export interface OrderListResult {
  data: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface OrderRepository {
  listOrders(page?: number, pageSize?: number): Promise<OrderListResult>;
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
