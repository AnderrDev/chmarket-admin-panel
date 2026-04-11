// src/domain/usecases/order/ListOrders.ts
import type { OrderRepository, OrderListResult } from '../../repositories/order/OrderRepository';

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(page = 1, pageSize = 50): Promise<OrderListResult> {
    return this.orderRepository.listOrders(page, pageSize);
  }
}
