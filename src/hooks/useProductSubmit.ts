// src/hooks/useProductSubmit.ts
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useProducts } from '@/hooks/useProducts'
import { uploadImagesToBucket } from '@/lib/upload'

function slugify(raw: string) {
    return raw
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/--+/g, '-')
}

export function useProductSubmit() {
    const navigate = useNavigate()
    const { createProduct, updateProduct } = useProducts()
    const [saving, setSaving] = useState(false)

    const validateForm = (formData: any, variantForm: any, isEditing: boolean) => {
        if (!isEditing) {
            if (!formData.name.trim() || !formData.slug.trim()) {
                toast.error('Nombre y Slug son obligatorios');
                return false
            }
            if (!formData.category_name) {
                toast.error('Selecciona una categoría');
                return false
            }
            if (!variantForm.sku.trim() || !variantForm.label.trim() || !variantForm.price_cents) {
                toast.error('Completa SKU, Label y Precio de la variante');
                return false
            }
        }
        return true
    }

    const handleImageUpload = async (files: File[], prefix: string, alts: string[]) => {
        if (!files.length) return []
        const uploaded = await uploadImagesToBucket(files, prefix)
        return uploaded.map((u, i) => ({ url: u.url, path: u.path, alt: alts[i] || '' }))
    }

    const cleanNutritionFacts = (nutritionFacts: any) => {
        const cleanedNutrients = nutritionFacts.nutrients.filter(
            (n: any) => n.name.trim() && n.amount.trim() && n.unit.trim()
        )
        return { ...nutritionFacts, nutrients: cleanedNutrients }
    }

    const submitForm = async (
        formData: any,
        nutritionFacts: any,
        variantForm: any,
        productFiles: File[],
        productAlts: string[],
        isEditing: boolean,
        productId?: string
    ) => {
        if (!validateForm(formData, variantForm, isEditing)) return

        setSaving(true)
        try {
            // Upload product images
            const uploadedProductImages = await handleImageUpload(
                productFiles,
                isEditing && productId ? `products/${productId}` : `products/temp-${crypto.randomUUID()}`,
                productAlts
            )

            const cleanedNutritionFacts = cleanNutritionFacts(nutritionFacts)

            if (isEditing && productId) {
                const payload = {
                    name: formData.name.trim(),
                    slug: slugify(formData.slug.trim()),
                    description: formData.description,
                    long_description: formData.long_description,
                    is_featured: formData.is_featured,
                    is_active: formData.is_active,
                    images: uploadedProductImages.length ? uploadedProductImages : formData.images,
                    features: formData.features,
                    ingredients: formData.ingredients,
                    category_id: formData.category_id || null,
                    nutrition_facts: cleanedNutritionFacts
                }
                await updateProduct(productId, payload as any)
                toast.success('Producto actualizado')
            } else {
                // Upload variant images
                const firstVariantImages = await handleImageUpload(
                    variantForm.files,
                    `variants/temp-${crypto.randomUUID()}`,
                    variantForm.alts
                )

                const productPayload = {
                    name: formData.name.trim(),
                    slug: slugify(formData.slug.trim()),
                    description: formData.description,
                    long_description: formData.long_description,
                    is_featured: formData.is_featured,
                    is_active: formData.is_active,
                    images: uploadedProductImages.length ? uploadedProductImages : formData.images,
                    features: formData.features,
                    ingredients: formData.ingredients,
                    category_name: formData.category_name,
                    nutrition_facts: cleanedNutritionFacts
                }

                const variantPayload = {
                    sku: variantForm.sku.trim(),
                    label: variantForm.label.trim(),
                    flavor: variantForm.flavor.trim() || undefined,
                    size: variantForm.size.trim() || undefined,
                    price_cents: parseInt(variantForm.price_cents || '0', 10),
                    compare_at_price_cents: variantForm.compare_at_price_cents ? parseInt(variantForm.compare_at_price_cents, 10) : undefined,
                    in_stock: parseInt(variantForm.in_stock || '0', 10),
                    low_stock_threshold: parseInt(variantForm.low_stock_threshold || '5', 10),
                    is_default: variantForm.is_default,
                    images: firstVariantImages
                }

                const res = await createProduct(productPayload as any, variantPayload as any)
                toast.success('Producto creado')
                const newProductId = (res as any)?.product_id
                if (newProductId) navigate(`/products/${newProductId}/edit`)
                else navigate('/products')
            }
        } catch (err) {
            console.error(err)
            toast.error('Error al guardar el producto')
        } finally {
            setSaving(false)
        }
    }

    return { saving, submitForm }
}
