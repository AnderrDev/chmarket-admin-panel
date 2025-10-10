// src/domain/usecases/order/GetOrder.ts
import type { Order } from '@/data/entities/order';
import type { OrderRepository } from '../../repositories/order/OrderRepository';

export class GetOrderUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(id: string): Promise<Order | null> {
    return this.orderRepository.getOrder(id);
  }
}
