// src/domain/repositories/order/OrderRepository.ts
import type { Order, OrderItem } from '@/data/entities/order';

export interface OrderRepository {
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
