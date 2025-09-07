import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category, CategoryFormData } from '@/types'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-categories`

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
    }
  }

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const headers = await getAuthHeaders()
      
      const response = await fetch(`${EDGE_FUNCTION_URL}/stats`, {
        method: 'GET',
        headers
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al cargar categorías')
      }

      setCategories(result.data || [])
      setError(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error cargando categorías'
      setError(msg)
      console.error('Error fetching categories:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const createCategory = async (categoryData: CategoryFormData): Promise<Category> => {
    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(`${EDGE_FUNCTION_URL}/create`, {
        method: 'POST',
        headers,
        body: JSON.stringify(categoryData)
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al crear categoría')
      }

      await fetchCategories() // Refresh the list
      return result.data
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error creando categoría'
      throw new Error(msg)
    }
  }

  const updateCategory = async (id: string, categoryData: CategoryFormData): Promise<Category> => {
    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ categoryId: id, categoryData })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al actualizar categoría')
      }

      await fetchCategories() // Refresh the list
      return result.data
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error actualizando categoría'
      throw new Error(msg)
    }
  }

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ categoryId: id })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar categoría')
      }

      await fetchCategories() // Refresh the list
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error eliminando categoría'
      throw new Error(msg)
    }
  }

  const getCategoryById = async (id: string): Promise<Category> => {
    try {
      const headers = await getAuthHeaders()
      
      const response = await fetch(`${EDGE_FUNCTION_URL}/${id}`, {
        method: 'GET',
        headers
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Error al obtener categoría')
      }

      return result.data
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error obteniendo categoría'
      throw new Error(msg)
    }
  }

  return { 
    categories, 
    loading, 
    error, 
    reload: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById
  }
}
