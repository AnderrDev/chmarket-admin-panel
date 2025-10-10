// src/domain/usecases/order/GetOrdersStats.ts
import type { OrderRepository } from '../../repositories/order/OrderRepository';

export class GetOrdersStatsUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    paidOrders: number;
  }> {
    return this.orderRepository.getOrdersStats();
  }
}
