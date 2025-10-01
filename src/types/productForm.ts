// src/types/productForm.ts
export interface ProductFormData {
    id: string
    name: string
    slug: string
    category_id: string
    category_name: string
    description: string
    long_description: string
    is_featured: boolean
    is_active: boolean
    images: { url: string; alt?: string; path?: string }[]
    features: string[]
    ingredients: string[]
}

export interface NutritionFactsData {
    serving_size: string
    servings_per_container: string
    notes: string
    allergens: string[]
    nutrients: { name: string; amount: string; unit: string; }[]
}

export interface VariantFormData {
    sku: string
    label: string
    flavor: string
    size: string
    price_cents: string
    compare_at_price_cents: string
    in_stock: string
    low_stock_threshold: string
    is_default: boolean
    files: File[]
    existingImages?: { url: string; alt?: string; path?: string }[]
}

export interface MultipleVariantsData {
    variants: VariantFormData[]
}

export interface ProductDetail {
    id: string
    name: string
    slug: string
    description?: string
    long_description?: string
    is_featured: boolean
    is_active: boolean
    images?: any[]
    features?: string[]
    ingredients?: string[]
    category?: { id: string; name: string } | null
    category_id?: string
    category_name?: string
    nutrition_facts?: any
}
