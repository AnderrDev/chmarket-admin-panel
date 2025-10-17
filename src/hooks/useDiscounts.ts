import { useState, useEffect, useCallback } from 'react';
import { DiscountCode } from '@/data/entities/discount';
import toast from 'react-hot-toast';
import {
  listDiscountsUseCase,
  createDiscountUseCase,
  updateDiscountUseCase,
  deleteDiscountUseCase,
  toggleDiscountStatusUseCase,
  getActiveDiscountsUseCase,
} from '@/application/container';

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await listDiscountsUseCase.execute();

      // Procesar datos para calcular usage_count
      const processedData = data.map(discount => ({
        ...discount,
        usage_count: discount.order_discounts?.[0]?.count || 0,
      }));

      setDiscounts(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cupones');
      toast.error('Error al cargar cupones');
    } finally {
      setLoading(false);
    }
  }, []);

  const createDiscount = useCallback(
    async (discountData: Partial<DiscountCode>) => {
      try {
        const data = await createDiscountUseCase.execute(discountData as any);
        setDiscounts(prev => [data, ...prev]);
        return data;
      } catch (err) {
        toast.error('Error al crear cupón');
        throw err;
      }
    },
    []
  );

  const updateDiscount = useCallback(
    async (id: string, discountData: Partial<DiscountCode>) => {
      try {
        const data = await updateDiscountUseCase.execute(
          id,
          discountData as any
        );
        setDiscounts(prev => prev.map(d => (d.id === id ? data : d)));
        return data;
      } catch (err) {
        toast.error('Error al actualizar cupón');
        throw err;
      }
    },
    []
  );

  const deleteDiscount = useCallback(async (id: string) => {
    try {
      await deleteDiscountUseCase.execute(id);
      setDiscounts(prev => prev.filter(d => d.id !== id));
      toast.success('Cupón eliminado exitosamente');
    } catch (err) {
      toast.error('Error al eliminar cupón');
      throw err;
    }
  }, []);

  const toggleDiscountStatus = useCallback(
    async (id: string, isActive: boolean) => {
      try {
        const data = await toggleDiscountStatusUseCase.execute(id, isActive);
        setDiscounts(prev => prev.map(d => (d.id === id ? data : d)));
        toast.success(
          `Cupón ${isActive ? 'activado' : 'desactivado'} exitosamente`
        );
        return data;
      } catch (err) {
        toast.error('Error al cambiar estado del cupón');
        throw err;
      }
    },
    []
  );

  const getActiveDiscounts = useCallback(async () => {
    try {
      return await getActiveDiscountsUseCase.execute();
    } catch (err) {
      toast.error('Error al cargar cupones activos');
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  return {
    discounts,
    loading,
    error,
    fetchDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    toggleDiscountStatus,
    getActiveDiscounts,
  };
}
