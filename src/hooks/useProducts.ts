// src/hooks/useProducts.ts
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import type { Product, ProductVariant } from '@/types'

const BASE = `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/admin-products`
const AUTH = { Authorization: `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}` }

type CreateRPCResponse = { product_id: string; variant_ids: string[] }

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch(`${BASE}/products/list`, { headers: { ...AUTH } })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Error al cargar productos')
      // 👇 mapeamos la categoría anidada
      const mapped = (json.data || []).map((p: any) => ({
        ...p,
        category_id: p.category?.id || p.category_id || null,
        category_name: p.category?.name || p.category_name || null,
        category: undefined // evitamos duplicados en el objeto
      }))

      setProducts(mapped)
      setError(null)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cargar productos'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  const createProduct = useCallback(async (productData: any, variantsData: any[]): Promise<CreateRPCResponse> => {
    const res = await fetch(`${BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...AUTH },
      body: JSON.stringify({ product: productData, variants: variantsData })
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json?.error || 'Error al crear producto')
      throw new Error(json?.error || 'Error al crear producto')
    }
    // opcional: refrescar lista
    await fetchProducts()
    return json.data as CreateRPCResponse
  }, [fetchProducts])

  const updateProduct = useCallback(async (id: string, productData: any) => {
    const res = await fetch(`${BASE}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...AUTH },
      body: JSON.stringify(productData)
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json?.error || 'Error al actualizar producto')
      throw new Error(json?.error || 'Error al actualizar producto')
    }
    setProducts(prev => prev.map(p => p.id === id ? json.data : p))
    return json.data as Product
  }, [])

  const deleteProduct = useCallback(async (id: string) => {
    const res = await fetch(`${BASE}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...AUTH },
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json?.error || 'Error al eliminar producto')
      throw new Error(json?.error || 'Error al eliminar producto')
    }
    setProducts(prev => prev.filter(p => p.id !== id))
  }, [])

  const getProductVariants = useCallback(async (productId: string): Promise<ProductVariant[]> => {
    const res = await fetch(`${BASE}/products/${productId}/variants`, { headers: { ...AUTH } })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json?.error || 'Error al cargar variantes')
      throw new Error(json?.error || 'Error al cargar variantes')
    }
    return json.data || []
  }, [])

  const createVariant = useCallback(async (productId: string, variantData: any): Promise<ProductVariant> => {
    const res = await fetch(`${BASE}/products/${productId}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...AUTH },
      body: JSON.stringify(variantData)
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json?.error || 'Error al crear variante')
      throw new Error(json?.error || 'Error al crear variante')
    }
    return json.data as ProductVariant
  }, [])

  const updateVariant = useCallback(async (variantId: string, variantData: any): Promise<ProductVariant> => {
    const res = await fetch(`${BASE}/variants/${variantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...AUTH },
      body: JSON.stringify(variantData)
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json?.error || 'Error al actualizar variante')
      throw new Error(json?.error || 'Error al actualizar variante')
    }
    return json.data as ProductVariant
  }, [])

  const deleteVariant = useCallback(async (variantId: string): Promise<void> => {
    const res = await fetch(`${BASE}/variants/${variantId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...AUTH },
    })
    const json = await res.json()
    if (!res.ok) {
      toast.error(json?.error || 'Error al eliminar variante')
      throw new Error(json?.error || 'Error al eliminar variante')
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  return {
    products,
    loading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductVariants,
    createVariant,
    updateVariant,
    deleteVariant
  }
}
