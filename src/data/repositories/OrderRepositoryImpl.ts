// src/data/repositories/OrderRepositoryImpl.ts
import type { Order, OrderItem } from '@/data/entities/order';
import type { OrderRepository } from '@/domain/repositories/order/OrderRepository';
import type { OrderDataSource } from '@/data/datasources/OrderDataSource';

export class OrderRepositoryImpl implements OrderRepository {
  constructor(private readonly dataSource: OrderDataSource) {}

  async listOrders(): Promise<Order[]> {
    return this.dataSource.listOrders();
  }

  async getOrder(id: string): Promise<Order | null> {
    return this.dataSource.getOrder(id);
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return this.dataSource.getOrderItems(orderId);
  }

  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    return this.dataSource.updateOrderStatus(id, status);
  }

  async getOrdersByStatus(status: Order['status']): Promise<Order[]> {
    return this.dataSource.getOrdersByStatus(status);
  }

  async getOrdersStats(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    paidOrders: number;
  }> {
    return this.dataSource.getOrdersStats();
  }
}
