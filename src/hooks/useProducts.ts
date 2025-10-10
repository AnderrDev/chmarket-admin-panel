// src/hooks/useProducts.ts
import { useEffect } from 'react';
import { useProductViewModel } from '@/presentation/viewmodels/ProductViewModel';
import { productViewModel } from '@/application/container';

export function useProducts() {
  const hook = useProductViewModel(productViewModel);

  useEffect(() => {
    hook.fetchProducts();
  }, []);

  return hook;
}
