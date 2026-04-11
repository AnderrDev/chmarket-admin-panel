import { useCallback, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export const ORDERS_QUERY_KEY = ['admin', 'orders'] as const;
export const ordersPageKey = (page: number, pageSize: number) =>
  ['admin', 'orders', page, pageSize] as const;
export const orderItemsKey = (id: string) =>
  ['admin', 'order-items', id] as const;

const PAGE_SIZE = 50;

export function useOrders() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const {
    data: result,
    isLoading: loading,
    error: queryError,
    refetch: fetchOrders,
  } = useQuery({
    queryKey: ordersPageKey(page, PAGE_SIZE),
    queryFn: () => listOrdersUseCase.execute(page, PAGE_SIZE),
    staleTime: 60_000,
  });

  const orders = result?.data ?? [];
  const totalOrders = result?.total ?? 0;
  const totalPages = Math.ceil(totalOrders / PAGE_SIZE);

  // Keep the flat ORDERS_QUERY_KEY populated for Dashboard (reads first page)
  if (result && page === 1) {
    queryClient.setQueryData(ORDERS_QUERY_KEY, orders);
  }

  const error = queryError instanceof Error ? queryError.message : null;

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
        return await queryClient.fetchQuery({
          queryKey: orderItemsKey(orderId),
          queryFn: () => getOrderItemsUseCase.execute(orderId),
          staleTime: 60_000,
        });
      } catch (err) {
        toast.error('Error al cargar items de la orden');
        throw err;
      }
    },
    [queryClient]
  );

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Order['status'] }) =>
      updateOrderStatusUseCase.execute(id, status),
    onSuccess: updatedOrder => {
      // Actualiza cache de la página actual sin refetch
      queryClient.setQueryData(
        ordersPageKey(page, PAGE_SIZE),
        (prev: typeof result) =>
          prev
            ? {
                ...prev,
                data: prev.data.map(o =>
                  o.id === updatedOrder.id ? updatedOrder : o
                ),
              }
            : prev
      );
      toast.success('Estado de orden actualizado exitosamente');
    },
    onError: () => {
      toast.error('Error al actualizar estado de orden');
    },
  });

  const updateOrderStatus = useCallback(
    (id: string, status: Order['status']) =>
      updateStatusMutation.mutateAsync({ id, status }),
    [updateStatusMutation]
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

  return {
    orders,
    loading,
    error,
    fetchOrders,
    page,
    setPage,
    totalOrders,
    totalPages,
    pageSize: PAGE_SIZE,
    getOrder,
    getOrderItems,
    updateOrderStatus,
    getOrdersByStatus,
    getOrdersStats,
  };
}
