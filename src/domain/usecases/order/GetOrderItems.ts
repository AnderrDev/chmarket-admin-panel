// src/domain/usecases/order/GetOrderItems.ts
import type { OrderItem } from '@/data/entities/order';
import type { OrderRepository } from '../../repositories/order/OrderRepository';

export class GetOrderItemsUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(orderId: string): Promise<OrderItem[]> {
    return this.orderRepository.getOrderItems(orderId);
  }
}
