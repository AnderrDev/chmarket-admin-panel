// src/domain/usecases/order/ListOrders.ts
import type { Order } from '@/data/entities/order';
import type { OrderRepository } from '../../repositories/order/OrderRepository';

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepository) {}

  async execute(): Promise<Order[]> {
    return this.orderRepository.listOrders();
  }
}
