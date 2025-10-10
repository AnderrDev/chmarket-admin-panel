import { useState, useEffect, useCallback } from 'react';
import { Order, OrderItem } from '@/data/entities/order';
import toast from 'react-hot-toast';
import {
  listOrdersUseCase,
  getOrderUseCase,
  getOrderItemsUseCase,
  updateOrderStatusUseCase,
  getOrdersByStatusUseCase,
  getOrdersStatsUseCase,
} from '@/application/container';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listOrdersUseCase.execute();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes');
      toast.error('Error al cargar órdenes');
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrder = useCallback(async (id: string): Promise<Order | null> => {
    try {
      return await getOrderUseCase.execute(id);
    } catch (err) {
      toast.error('Error al cargar orden');
      throw err;
    }
  }, []);

  const getOrderItems = useCallback(
    async (orderId: string): Promise<OrderItem[]> => {
      try {
        return await getOrderItemsUseCase.execute(orderId);
      } catch (err) {
        toast.error('Error al cargar items de la orden');
        throw err;
      }
    },
    []
  );

  const updateOrderStatus = useCallback(
    async (id: string, status: Order['status']) => {
      try {
        const data = await updateOrderStatusUseCase.execute(id, status);
        setOrders(prev => prev.map(o => (o.id === id ? data : o)));
        toast.success('Estado de orden actualizado exitosamente');
        return data;
      } catch (err) {
        toast.error('Error al actualizar estado de orden');
        throw err;
      }
    },
    []
  );

  const getOrdersByStatus = useCallback(async (status: Order['status']) => {
    try {
      return await getOrdersByStatusUseCase.execute(status);
    } catch (err) {
      toast.error('Error al cargar órdenes por estado');
      throw err;
    }
  }, []);

  const getOrdersStats = useCallback(async () => {
    try {
      return await getOrdersStatsUseCase.execute();
    } catch (err) {
      toast.error('Error al cargar estadísticas de órdenes');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    getOrder,
    getOrderItems,
    updateOrderStatus,
    getOrdersByStatus,
    getOrdersStats,
  };
}
