// src/domain/usecases/order/UpdateOrderStatus.ts
import type { Order } from '@/data/entities/order';
import type { OrderRepository } from '../../repositories/order/OrderRepository';

export class UpdateOrderStatusUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string, status: Order['status']): Promise<Order> {
    return this.orderRepository.updateOrderStatus(id, status);
  }
}
