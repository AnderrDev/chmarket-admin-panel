import { useState, useEffect, useCallback } from 'react'
import { DiscountCode } from '@/types/index.ts'
import toast from 'react-hot-toast'

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL

export function useDiscounts() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDiscounts = useCallback(async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-discounts/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar cupones')
      }

      const { data, error: responseError } = await response.json()
      
      if (responseError) throw new Error(responseError)
      
      setDiscounts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar cupones')
      toast.error('Error al cargar cupones')
    } finally {
      setLoading(false)
    }
  }, [])

  const createDiscount = useCallback(async (discountData: Partial<DiscountCode>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-discounts/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(discountData)
      })

      if (!response.ok) {
        throw new Error('Error al crear cupón')
      }

      const { data, error: responseError } = await response.json()
      
      if (responseError) throw new Error(responseError)
      
      setDiscounts(prev => [data, ...prev])
      toast.success('Cupón creado exitosamente')
      return data
    } catch (err) {
      toast.error('Error al crear cupón')
      throw err
    }
  }, [])

  const updateDiscount = useCallback(async (id: string, discountData: Partial<DiscountCode>) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-discounts`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ discountId: id, discountData })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar cupón')
      }

      const { data, error: responseError } = await response.json()
      
      if (responseError) throw new Error(responseError)
      
      setDiscounts(prev => prev.map(d => d.id === id ? data : d))
      toast.success('Cupón actualizado exitosamente')
      return data
    } catch (err) {
      toast.error('Error al actualizar cupón')
      throw err
    }
  }, [])

  const deleteDiscount = useCallback(async (id: string) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-discounts`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ discountId: id })
      })

      if (!response.ok) {
        throw new Error('Error al eliminar cupón')
      }

      const { error: responseError } = await response.json()
      
      if (responseError) throw new Error(responseError)
      
      setDiscounts(prev => prev.filter(d => d.id !== id))
      toast.success('Cupón eliminado exitosamente')
    } catch (err) {
      toast.error('Error al eliminar cupón')
      throw err
    }
  }, [])

  const toggleDiscountStatus = useCallback(async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-discounts/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ discountId: id, isActive })
      })

      if (!response.ok) {
        throw new Error('Error al cambiar estado del cupón')
      }

      const { data, error: responseError } = await response.json()
      
      if (responseError) throw new Error(responseError)
      
      setDiscounts(prev => prev.map(d => d.id === id ? data : d))
      toast.success(`Cupón ${isActive ? 'activado' : 'desactivado'} exitosamente`)
      return data
    } catch (err) {
      toast.error('Error al cambiar estado del cupón')
      throw err
    }
  }, [])

  const getActiveDiscounts = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-discounts/active`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar cupones activos')
      }

      const { data, error: responseError } = await response.json()
      
      if (responseError) throw new Error(responseError)
      
      return data || []
    } catch (err) {
      toast.error('Error al cargar cupones activos')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchDiscounts()
  }, [fetchDiscounts])

  return {
    discounts,
    loading,
    error,
    fetchDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    toggleDiscountStatus,
    getActiveDiscounts
  }
}
