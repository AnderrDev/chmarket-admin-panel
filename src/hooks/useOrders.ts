import { useState, useEffect, useCallback } from 'react'
import { Order, OrderItem } from '@/types/index.ts'
import toast from 'react-hot-toast'

const SUPABASE_URL = (import.meta as any).env.VITE_SUPABASE_URL

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-orders/list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar órdenes')
      }

      const { data, error: responseError } = await response.json()
      
      if (responseError) throw new Error(responseError)
      
      setOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar órdenes')
      toast.error('Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }, [])

  const getOrder = useCallback(async (id: string): Promise<Order | null> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-orders/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar orden')
      }

      const { data, error: responseError } = await response.json()
      
      if (responseError) throw new Error(responseError)
      
      return data
    } catch (err) {
      toast.error('Error al cargar orden')
      throw err
    }
  }, [])

  const getOrderItems = useCallback(async (orderId: string): Promise<OrderItem[]> => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-orders/${orderId}-items`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar items de la orden')
      }

      const { data, error: responseError } = await response.json()
      
      if (responseError) throw new Error(responseError)
      
      return data || []
    } catch (err) {
      toast.error('Error al cargar items de la orden')
      throw err
    }
  }, [])

  const updateOrderStatus = useCallback(async (id: string, status: Order['status']) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-orders`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ orderId: id, status })
      })

      if (!response.ok) {
        throw new Error('Error al actualizar estado de orden')
      }

      const { data, error: responseError } = await response.json()
      
      if (responseError) throw new Error(responseError)
      
      setOrders(prev => prev.map(o => o.id === id ? data : o))
      toast.success('Estado de orden actualizado exitosamente')
      return data
    } catch (err) {
      toast.error('Error al actualizar estado de orden')
      throw err
    }
  }, [])

  const getOrdersByStatus = useCallback(async (status: Order['status']) => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-orders/by-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Error al cargar órdenes por estado')
      }

      const { data, error: responseError } = await response.json()
      
      if (responseError) throw new Error(responseError)
      
      return data || []
    } catch (err) {
      toast.error('Error al cargar órdenes por estado')
      throw err
    }
  }, [])

  const getOrdersStats = useCallback(async () => {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-orders/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar estadísticas de órdenes')
      }

      const { data, error: responseError } = await response.json()
      
      if (responseError) throw new Error(responseError)
      
      return data
    } catch (err) {
      toast.error('Error al cargar estadísticas de órdenes')
      throw err
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    loading,
    error,
    fetchOrders,
    getOrder,
    getOrderItems,
    updateOrderStatus,
    getOrdersByStatus,
    getOrdersStats
  }
}
