// src/pages/ProductForm.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Package } from 'lucide-react'
import toast from 'react-hot-toast'

import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import VariantsPanel from '@/components/VariantsPanel'
import BasicProductInfo from '@/components/product-form/BasicProductInfo'
import FeaturesAndIngredients from '@/components/product-form/FeaturesAndIngredients'
import ImageUpload from '@/components/product-form/ImageUpload'
import NutritionFacts from '@/components/product-form/NutritionFacts'
import VariantForm from '@/components/product-form/VariantForm'
import { supabase } from '@/lib/supabase'
import { uploadImagesToBucket } from '@/lib/upload'
import type { ImageRef } from '@/types'

const EDGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-products`


function ProductSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
          <div className="col-span-1 md:col-span-2">
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
          <div className="col-span-1 md:col-span-2">
            <div className="h-4 w-36 bg-gray-200 rounded mb-2" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-36 bg-gray-200 rounded" />
      </div>
    </div>
  )
}

function slugify(raw: string) {
  return raw
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-')
}

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession()
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  }
}

type ProductDetail = {
  id: string
  name: string
  slug: string
  description?: string
  long_description?: string
  is_featured: boolean
  is_active: boolean
  images?: ImageRef[]
  features?: string[]
  ingredients?: string[]
  category?: { id: string; name: string } | null
  category_id?: string
  category_name?: string
  nutrition_facts?: any
}

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const { createProduct, updateProduct } = useProducts()
  const { categories, loading: categoriesLoading } = useCategories()

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category_id: '',
    category_name: '',
    description: '',
    long_description: '',
    is_featured: false,
    is_active: true,
    images: [] as { url: string; alt?: string; path?: string }[],
    features: [] as string[],
    ingredients: [] as string[],
  })

  const [nutritionFacts, setNutritionFacts] = useState({
    serving_size: '',
    servings_per_container: '',
    notes: '',
    allergens: [] as string[],
    nutrients: [] as { name: string; amount: string; unit: string; }[],
  })

  const [featuresInput, setFeaturesInput] = useState('')
  const [ingredientsInput, setIngredientsInput] = useState('')
  const [touchedSlug, setTouchedSlug] = useState(false)

  // primera variante (solo crear)
  const [variantForm, setVariantForm] = useState({
    sku: '',
    label: '',
    flavor: '',
    size: '',
    price_cents: '',
    compare_at_price_cents: '',
    in_stock: '0',
    low_stock_threshold: '5',
    is_default: true,
    files: [] as File[],
    alts: [] as string[],
  })

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(false)
  const [productFiles, setProductFiles] = useState<File[]>([])
  const [productAlts, setProductAlts] = useState<string[]>([])

  // ---------- Helpers ----------

  // ---------- Effects ----------
  useEffect(() => {
    const loadDetail = async () => {
      if (!isEditing || !id) return
      try {
        setLoading(true)
        const headers = await authHeaders()
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
        toast.error(e instanceof Error ? e.message : 'Error cargando producto')
      } finally {
        setLoading(false)
      }
    }
    loadDetail()
  }, [isEditing, id])

  // ---------- Handlers ----------
  const onProductFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arr = e.target.files ? Array.from(e.target.files) : []
    setProductFiles(arr)
    setProductAlts(arr.map(() => ''))
  }
  const onProductAlt = (i: number, val: string) => {
    setProductAlts(prev => prev.map((a, idx) => (idx === i ? val : a)))
  }
  const onProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const v = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    if (name === 'category_id') {
      const sel = categories.find(c => c.id === value)
      setFormData(prev => ({ ...prev, category_id: value, category_name: sel?.name || '' }))
      return
    }
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        name: v as string,
        slug: touchedSlug ? prev.slug : slugify(String(v))
      }))
      return
    }
    if (name === 'slug') {
      setTouchedSlug(true)
    }
    setFormData(prev => ({ ...prev, [name]: v as any }))
  }
  const onVariantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type } = e.target
    const v = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setVariantForm(prev => ({ ...prev, [name]: v as any }))
  }
  const onFirstVariantFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arr = e.target.files ? Array.from(e.target.files) : []
    setVariantForm(prev => ({ ...prev, files: arr, alts: arr.map(() => '') }))
  }
  const onFirstVariantAlt = (i: number, val: string) => {
    setVariantForm(prev => ({ ...prev, alts: prev.alts.map((a, idx) => (idx === i ? val : a)) }))
  }

  // ---------- Submit ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Subir imágenes nuevas del producto
      let uploadedProductImages: { url: string; alt?: string; path?: string }[] = []
      if (productFiles.length) {
        const prefix = isEditing && id ? `products/${id}` : `products/temp-${crypto.randomUUID()}`
        const uploaded = await uploadImagesToBucket(productFiles, prefix)
        uploadedProductImages = uploaded.map((u, i) => ({ url: u.url, path: u.path, alt: productAlts[i] || '' }))
      }

      // 👇 Limpieza de nutrientes (quita los vacíos)
      const cleanedNutrients = nutritionFacts.nutrients.filter(
        (n) => n.name.trim() && n.amount.trim() && n.unit.trim()
      )

      const cleanedNutritionFacts = {
        ...nutritionFacts,
        nutrients: cleanedNutrients
      }


      if (isEditing && id) {
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
        await updateProduct(id, payload as any)
        toast.success('Producto actualizado')
      } else {
        if (!formData.name.trim() || !formData.slug.trim()) { toast.error('Nombre y Slug son obligatorios'); return }
        if (!formData.category_name) { toast.error('Selecciona una categoría'); return }
        if (!variantForm.sku.trim() || !variantForm.label.trim() || !variantForm.price_cents) {
          toast.error('Completa SKU, Label y Precio de la variante'); return
        }

        // Sube imágenes de la 1ª variante (opcional)
        let firstVariantImages: { url: string; alt?: string; path?: string }[] | undefined = undefined
        if (variantForm.files.length) {
          const uploaded = await uploadImagesToBucket(variantForm.files, `variants/temp-${crypto.randomUUID()}`)
          firstVariantImages = uploaded.map((u, i) => ({ url: u.url, path: u.path, alt: variantForm.alts[i] || '' }))
        }

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
        const productId = (res as any)?.product_id
        if (productId) navigate(`/products/${productId}/edit`)
        else navigate('/products')
      }
    } catch (err) {
      console.error(err)
      toast.error('Error al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  if (loading && isEditing) return <ProductSkeleton />
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/products')} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing ? 'Modifica la información del producto' : 'Crea un nuevo producto con su primera variante'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información básica */}
        <BasicProductInfo
          formData={formData}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onProductChange={onProductChange}
          setTouchedSlug={setTouchedSlug}
        />

        {/* Features e ingredientes */}
        <div className="bg-white shadow rounded-lg p-6">
          <FeaturesAndIngredients
            features={formData.features}
            ingredients={formData.ingredients}
            featuresInput={featuresInput}
            ingredientsInput={ingredientsInput}
            setFeaturesInput={setFeaturesInput}
            setIngredientsInput={setIngredientsInput}
            onFeaturesChange={(features) => setFormData(prev => ({ ...prev, features }))}
            onIngredientsChange={(ingredients) => setFormData(prev => ({ ...prev, ingredients }))}
          />

          {/* Imágenes */}
          <ImageUpload
            productFiles={productFiles}
            productAlts={productAlts}
            existingImages={formData.images}
            isEditing={isEditing}
            productId={id}
            onProductFiles={onProductFiles}
            onProductAlt={onProductAlt}
            onRemoveExistingImage={(index) => {
              const next = [...formData.images]
              next.splice(index, 1)
              setFormData(prev => ({ ...prev, images: next }))
            }}
            onUpdateProduct={async (id, data) => { await updateProduct(id, data) }}
          />
        </div>

        {/* Información Nutricional */}
        <NutritionFacts
          nutritionFacts={nutritionFacts}
          onNutritionFactsChange={setNutritionFacts}
        />

        {/* Primera variante */}
        {!isEditing && (
          <VariantForm
            variantForm={variantForm}
            onVariantChange={onVariantChange}
            onFirstVariantFiles={onFirstVariantFiles}
            onFirstVariantAlt={onFirstVariantAlt}
          />
        )}

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/products')} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary inline-flex items-center">
            {saving ? (<><Package className="w-4 h-4 mr-2 animate-spin" />Guardando…</>) : (<><Save className="w-4 h-4 mr-2" />{isEditing ? 'Actualizar' : 'Crear'} Producto</>)}
          </button>
        </div>
      </form>

      {isEditing && id && <div className="mt-8"><VariantsPanel productId={id} /></div>}
    </div>
  )
}