import { useEffect } from 'react';
import { useCategoryViewModel } from '@/presentation/viewmodels/CategoryViewModel';
import { categoryViewModel } from '@/application/container';

export function useCategories() {
  const hook = useCategoryViewModel(categoryViewModel);

  useEffect(() => {
    hook.reload();
  }, []);

  return hook;
}
