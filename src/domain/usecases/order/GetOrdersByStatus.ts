// src/domain/usecases/order/GetOrdersByStatus.ts
import type { Order } from '@/data/entities/order';
import type { OrderRepository } from '../../repositories/order/OrderRepository';

export class GetOrdersByStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(status: Order['status']): Promise<Order[]> {
    return this.orderRepository.getOrdersByStatus(status);
  }
}
