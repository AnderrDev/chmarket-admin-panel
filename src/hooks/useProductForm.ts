// src/hooks/useProductForm.ts
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useProducts } from '@/hooks/useProducts'
import type { ProductFormData, NutritionFactsData, VariantFormData, ProductDetail, MultipleVariantsData } from '@/types/productForm'

const EDGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-products`

export function useProductForm() {
    const { id } = useParams()
    const isEditing = Boolean(id)
    const { getProductVariants } = useProducts()

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

    const [variantsData, setVariantsData] = useState<MultipleVariantsData>({
        variants: [{
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
        }]
    })

    // Store original data for comparison
    const [originalFormData, setOriginalFormData] = useState<ProductFormData | null>(null)
    const [originalVariantsData, setOriginalVariantsData] = useState<MultipleVariantsData | null>(null)
    const [originalNutritionFacts, setOriginalNutritionFacts] = useState<NutritionFactsData | null>(null)

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

                const productData = {
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
                }

                setFormData(prev => ({ ...prev, ...productData }))
                setOriginalFormData(productData)

                const nutritionData = p.nutrition_facts || {
                    serving_size: '',
                    servings_per_container: '',
                    notes: '',
                    allergens: [],
                    nutrients: []
                }
                setNutritionFacts(nutritionData)
                setOriginalNutritionFacts(nutritionData)

                // Load existing variants
                try {
                    const existingVariants = await getProductVariants(id)
                    if (existingVariants && existingVariants.length > 0) {
                        const variantsFormData = existingVariants.map((variant: any) => ({
                            sku: variant.sku || '',
                            label: variant.label || '',
                            flavor: variant.flavor || '',
                            size: variant.size || '',
                            price_cents: String(variant.price_cents || ''),
                            compare_at_price_cents: variant.compare_at_price_cents ? String(variant.compare_at_price_cents) : '',
                            in_stock: String(variant.in_stock || '0'),
                            low_stock_threshold: String(variant.low_stock_threshold || '5'),
                            is_default: Boolean(variant.is_default),
                            files: [], // No cargamos archivos existentes, solo datos
                            alts: [],
                        }))
                        const variantsData = { variants: variantsFormData }
                        setVariantsData(variantsData)
                        setOriginalVariantsData(variantsData)
                    }
                } catch (variantError) {
                    console.error('Error loading variants:', variantError)
                    // Si no se pueden cargar las variantes, mantener la variante por defecto
                }
            } catch (e) {
                console.error('Error loading product:', e)
            } finally {
                setLoading(false)
            }
        }
        loadDetail()
    }, [isEditing, id, getProductVariants])

    // Helper functions for managing multiple variants
    const addVariant = () => {
        setVariantsData(prev => ({
            variants: [...prev.variants, {
                sku: '',
                label: '',
                flavor: '',
                size: '',
                price_cents: '',
                compare_at_price_cents: '',
                in_stock: '0',
                low_stock_threshold: '5',
                is_default: false,
                files: [],
                alts: [],
            }]
        }))
    }

    const removeVariant = (index: number) => {
        if (variantsData.variants.length > 1) {
            setVariantsData(prev => ({
                variants: prev.variants.filter((_, i) => i !== index)
            }))
        }
    }

    const updateVariant = (index: number, field: keyof VariantFormData, value: any) => {
        setVariantsData(prev => ({
            variants: prev.variants.map((variant, i) =>
                i === index ? { ...variant, [field]: value } : variant
            )
        }))
    }

    const setVariantAsDefault = (index: number) => {
        setVariantsData(prev => ({
            variants: prev.variants.map((variant, i) => ({
                ...variant,
                is_default: i === index
            }))
        }))
    }

    // Helper functions to detect changes
    const hasProductChanges = () => {
        if (!originalFormData) return true
        return JSON.stringify(formData) !== JSON.stringify(originalFormData)
    }

    const hasNutritionChanges = () => {
        if (!originalNutritionFacts) return true
        return JSON.stringify(nutritionFacts) !== JSON.stringify(originalNutritionFacts)
    }

    const hasVariantsChanges = () => {
        if (!originalVariantsData) return true
        return JSON.stringify(variantsData) !== JSON.stringify(originalVariantsData)
    }

    const getChangedVariants = (): Array<{ index: number; variant: any; action: 'create' | 'update' | 'delete' }> => {
        if (!originalVariantsData) return variantsData.variants.map((_, index) => ({ index, variant: variantsData.variants[index], action: 'create' as const }))

        const changes: Array<{ index: number; variant: any; action: 'create' | 'update' | 'delete' }> = []

        // Check for updates and new variants
        variantsData.variants.forEach((variant, index) => {
            const originalVariant = originalVariantsData.variants[index]
            if (!originalVariant) {
                changes.push({ index, variant, action: 'create' as const })
            } else if (JSON.stringify(variant) !== JSON.stringify(originalVariant)) {
                changes.push({ index, variant, action: 'update' as const })
            }
        })

        // Check for deleted variants
        if (variantsData.variants.length < originalVariantsData.variants.length) {
            for (let i = variantsData.variants.length; i < originalVariantsData.variants.length; i++) {
                changes.push({ index: i, variant: originalVariantsData.variants[i], action: 'delete' as const })
            }
        }

        return changes
    }

    return {
        formData,
        setFormData,
        nutritionFacts,
        setNutritionFacts,
        variantsData,
        setVariantsData,
        addVariant,
        removeVariant,
        updateVariant,
        setVariantAsDefault,
        featuresInput,
        setFeaturesInput,
        ingredientsInput,
        setIngredientsInput,
        touchedSlug,
        setTouchedSlug,
        loading,
        isEditing,
        // Change detection functions
        hasProductChanges,
        hasNutritionChanges,
        hasVariantsChanges,
        getChangedVariants,
        originalFormData,
        originalVariantsData,
        originalNutritionFacts
    }
}
