// src/hooks/useProductForm.ts
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { ProductFormData, NutritionFactsData, VariantFormData, ProductDetail } from '@/types/productForm'

const EDGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-products`

export function useProductForm() {
    const { id } = useParams()
    const isEditing = Boolean(id)

    const [formData, setFormData] = useState<ProductFormData>({
        id: '',
        name: '',
        slug: '',
        category_id: '',
        category_name: '',
        description: '',
        long_description: '',
        is_featured: false,
        is_active: true,
        images: [],
        features: [],
        ingredients: [],
    })

    const [nutritionFacts, setNutritionFacts] = useState<NutritionFactsData>({
        serving_size: '',
        servings_per_container: '',
        notes: '',
        allergens: [],
        nutrients: [],
    })

    const [variantForm, setVariantForm] = useState<VariantFormData>({
        sku: '',
        label: '',
        flavor: '',
        size: '',
        price_cents: '',
        compare_at_price_cents: '',
        in_stock: '0',
        low_stock_threshold: '5',
        is_default: true,
        files: [],
        alts: [],
    })

    const [featuresInput, setFeaturesInput] = useState('')
    const [ingredientsInput, setIngredientsInput] = useState('')
    const [touchedSlug, setTouchedSlug] = useState(false)
    const [loading, setLoading] = useState(false)

    // Load product data when editing
    useEffect(() => {
        const loadDetail = async () => {
            if (!isEditing || !id) return
            try {
                setLoading(true)
                const { data: { session } } = await supabase.auth.getSession()
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                }

                const res = await fetch(`${EDGE_BASE}/products/${id}`, { headers })
                const json = await res.json()
                if (!res.ok) throw new Error(json?.error || 'Error cargando producto')
                const p: ProductDetail = json.data

                let normalized: { url: string; alt?: string; path?: string }[] = []
                if (Array.isArray(p.images)) {
                    normalized = p.images.map((img: any) => typeof img === 'string' ? { url: img } : img).filter(x => !!x?.url) as any
                }

                setFormData(prev => ({
                    ...prev,
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    description: p.description || '',
                    long_description: p.long_description || '',
                    is_featured: p.is_featured,
                    is_active: p.is_active,
                    images: normalized,
                    features: p.features || [],
                    ingredients: p.ingredients || [],
                    category_id: p.category?.id || p.category_id || '',
                    category_name: p.category?.name || p.category_name || '',
                }))

                setNutritionFacts(p.nutrition_facts || {
                    serving_size: '',
                    servings_per_container: '',
                    notes: '',
                    allergens: [],
                    nutrients: []
                })
            } catch (e) {
                console.error('Error loading product:', e)
            } finally {
                setLoading(false)
            }
        }
        loadDetail()
    }, [isEditing, id])

    return {
        formData,
        setFormData,
        nutritionFacts,
        setNutritionFacts,
        variantForm,
        setVariantForm,
        featuresInput,
        setFeaturesInput,
        ingredientsInput,
        setIngredientsInput,
        touchedSlug,
        setTouchedSlug,
        loading,
        isEditing
    }
}
