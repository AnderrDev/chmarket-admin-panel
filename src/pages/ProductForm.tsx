// src/pages/ProductForm.tsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Package, X, ArrowUp, ArrowDown } from 'lucide-react'
import toast from 'react-hot-toast'

import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import VariantsPanel from '@/components/VariantsPanel'
import { supabase } from '@/lib/supabase'
import { uploadImagesToBucket, removeImagesFromBucket, derivePathFromPublicUrl } from '@/lib/upload'
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
  function addFromTextarea(raw: string, current: string[], setFn: (arr: string[]) => void) {
    const tokens = raw.split(/,|\n/).map(t => t.trim()).filter(Boolean)
    const merged = Array.from(new Set([...current, ...tokens]))
    setFn(merged)
  }
  function removeAt(i: number, current: string[], setFn: (arr: string[]) => void) {
    setFn(current.filter((_, idx) => idx !== i))
  }
  function moveIdx(i: number, dir: -1 | 1, current: string[], setFn: (arr: string[]) => void) {
    const j = i + dir
    if (j < 0 || j >= current.length) return
    const arr = [...current]
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp
    setFn(arr)
  }

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
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input className="input-field" name="name" required value={formData.name} onChange={onProductChange} placeholder="Creatina CH+" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug *</label>
              <input className="input-field" name="slug" required value={formData.slug} onChange={onProductChange} placeholder="creatina-ch" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoría *</label>
              <select name="category_id" required value={formData.category_id} onChange={onProductChange} className="input-field" disabled={categoriesLoading}>
                <option value="">{categoriesLoading ? 'Cargando…' : 'Selecciona…'}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={onProductChange} className="h-4 w-4" />
                <span className="ml-2 text-sm">Activo</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={onProductChange} className="h-4 w-4" />
                <span className="ml-2 text-sm">Destacado</span>
              </label>
            </div>
          </div>

          {/* Descripciones */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea className="input-field" rows={3} name="description" value={formData.description} onChange={onProductChange} />
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium mb-1">Descripción Larga</label>
            <textarea className="input-field" rows={5} name="long_description" value={formData.long_description} onChange={onProductChange} />
          </div>

          {/* Features e ingredientes con UX chips */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Features */}
            <div>
              <label className="block text-sm font-medium mb-1">Features</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.features.map((t, i) => (
                  <span key={`${t}-${i}`} className="inline-flex items-center rounded-full bg-gray-100 pl-2 pr-1 py-1 text-xs">
                    {t}
                    <button type="button" className="ml-1 p-0.5" onClick={() => moveIdx(i, -1, formData.features, arr => setFormData(p => ({ ...p, features: arr })))}><ArrowUp className="w-3 h-3" /></button>
                    <button type="button" className="p-0.5" onClick={() => moveIdx(i, +1, formData.features, arr => setFormData(p => ({ ...p, features: arr })))}><ArrowDown className="w-3 h-3" /></button>
                    <button type="button" className="ml-1 p-0.5 text-gray-500 hover:text-gray-700" onClick={() => removeAt(i, formData.features, arr => setFormData(p => ({ ...p, features: arr })))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <textarea
                className="input-field"
                rows={2}
                placeholder="Micronizada, Sin azúcar, ..."
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (!featuresInput.trim()) return
                    addFromTextarea(featuresInput, formData.features, arr => setFormData(p => ({ ...p, features: arr })))
                    setFeaturesInput('')
                  }
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData('text')
                  if (text && (text.includes(',') || text.includes('\n'))) {
                    e.preventDefault()
                    addFromTextarea(text, formData.features, arr => setFormData(p => ({ ...p, features: arr })))
                    setFeaturesInput('')
                  }
                }}
              />
            </div>

            {/* Ingredientes */}
            <div>
              <label className="block text-sm font-medium mb-1">Ingredientes</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.ingredients.map((t, i) => (
                  <span key={`${t}-${i}`} className="inline-flex items-center rounded-full bg-gray-100 pl-2 pr-1 py-1 text-xs">
                    {t}
                    <button type="button" className="ml-1 p-0.5" onClick={() => moveIdx(i, -1, formData.ingredients, arr => setFormData(p => ({ ...p, ingredients: arr })))}><ArrowUp className="w-3 h-3" /></button>
                    <button type="button" className="p-0.5" onClick={() => moveIdx(i, +1, formData.ingredients, arr => setFormData(p => ({ ...p, ingredients: arr })))}><ArrowDown className="w-3 h-3" /></button>
                    <button type="button" className="ml-1 p-0.5 text-gray-500 hover:text-gray-700" onClick={() => removeAt(i, formData.ingredients, arr => setFormData(p => ({ ...p, ingredients: arr })))}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <textarea
                className="input-field"
                rows={2}
                placeholder="Creatina monohidratada, Saborizante..."
                value={ingredientsInput}
                onChange={(e) => setIngredientsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    if (!ingredientsInput.trim()) return
                    addFromTextarea(ingredientsInput, formData.ingredients, arr => setFormData(p => ({ ...p, ingredients: arr })))
                    setIngredientsInput('')
                  }
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData('text')
                  if (text && (text.includes(',') || text.includes('\n'))) {
                    e.preventDefault()
                    addFromTextarea(text, formData.ingredients, arr => setFormData(p => ({ ...p, ingredients: arr })))
                    setIngredientsInput('')
                  }
                }}
              />
            </div>
          </div>

          {/* Imágenes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Imágenes del producto</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={onProductFiles}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
            />            {productFiles.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                {productFiles.map((f, i) => (
                  <div key={i} className="border rounded p-2">
                    <img src={URL.createObjectURL(f)} alt="" className="h-24 w-full object-cover rounded" />
                    <input type="text" placeholder="Alt opcional" value={productAlts[i] || ''} onChange={e => onProductAlt(i, e.target.value)} className="mt-2 input-field" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {formData.images && formData.images.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Imágenes existentes</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {formData.images.map((img, i) => {
                  const url = typeof img === 'string' ? img : img.url
                  const alt = typeof img === 'string' ? '' : (img.alt || '')
                  return (
                    <div key={i} className="border rounded p-2 relative">
                      <img src={url} alt={alt} className="h-24 w-full object-cover rounded" />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-white/90 text-red-600 text-xs px-2 py-0.5 rounded shadow"
                        onClick={async () => {
                          try {
                            const path = typeof img === 'string'
                              ? derivePathFromPublicUrl(url)
                              : img.path || derivePathFromPublicUrl(url)
                            if (path) await removeImagesFromBucket([path])
                            const next = [...formData.images]; next.splice(i, 1)
                            setFormData(prev => ({ ...prev, images: next }))
                            if (isEditing && id) await updateProduct(id, { images: next } as any)
                            toast.success('Imagen eliminada')
                          } catch {
                            toast.error('No se pudo eliminar la imagen')
                          }
                        }}
                      >Eliminar</button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Información Nutricional */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Información Nutricional</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Tamaño por porción</label>
              <input className="input-field" value={nutritionFacts.serving_size}
                onChange={(e) => setNutritionFacts(f => ({ ...f, serving_size: e.target.value }))} placeholder="30 g" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Porciones por envase</label>
              <input className="input-field" value={nutritionFacts.servings_per_container}
                onChange={(e) => setNutritionFacts(f => ({ ...f, servings_per_container: e.target.value }))} placeholder="30" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">Notas</label>
            <textarea className="input-field" rows={2} value={nutritionFacts.notes}
              onChange={(e) => setNutritionFacts(f => ({ ...f, notes: e.target.value }))} placeholder="Valores aproximados." />
          </div>
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Nutrientes</label>
            <div className="space-y-3">
              {nutritionFacts.nutrients.map((n, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 items-center">
                  <input
                    className="input-field col-span-1"
                    placeholder="Nombre"
                    value={n.name}
                    onChange={(e) => {
                      const arr = [...nutritionFacts.nutrients]
                      arr[i].name = e.target.value
                      setNutritionFacts(f => ({ ...f, nutrients: arr }))
                    }}
                  />
                  <input
                    className="input-field col-span-1"
                    placeholder="Cantidad"
                    value={n.amount}
                    onChange={(e) => {
                      const arr = [...nutritionFacts.nutrients]
                      arr[i].amount = e.target.value
                      setNutritionFacts(f => ({ ...f, nutrients: arr }))
                    }}
                  />
                  <input
                    className="input-field col-span-1"
                    placeholder="Unidad"
                    value={n.unit}
                    onChange={(e) => {
                      const arr = [...nutritionFacts.nutrients]
                      arr[i].unit = e.target.value
                      setNutritionFacts(f => ({ ...f, nutrients: arr }))
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const arr = [...nutritionFacts.nutrients]
                      arr.splice(i, 1)
                      setNutritionFacts(f => ({ ...f, nutrients: arr }))
                    }}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    ❌
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="btn-secondary mt-3"
              onClick={() => setNutritionFacts(f => ({ ...f, nutrients: [...f.nutrients, { name: '', amount: '', unit: '' }] }))}>
              + Agregar Nutriente
            </button>
          </div>
        </div>

        {/* Primera variante */}
        {!isEditing && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-6">Primera Variante</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">SKU *</label>
                <input className="input-field" required name="sku" value={variantForm.sku} onChange={onVariantChange} placeholder="CREA-300" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Label *</label>
                <input className="input-field" required name="label" value={variantForm.label} onChange={onVariantChange} placeholder="300g Vainilla" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sabor</label>
                <input className="input-field" name="flavor" value={variantForm.flavor} onChange={onVariantChange} placeholder="Vainilla" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tamaño</label>
                <input className="input-field" name="size" value={variantForm.size} onChange={onVariantChange} placeholder="300g" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio (centavos) *</label>
                <input className="input-field" required type="number" name="price_cents" value={variantForm.price_cents} onChange={onVariantChange} placeholder="49900" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Compare At</label>
                <input className="input-field" type="number" name="compare_at_price_cents" value={variantForm.compare_at_price_cents} onChange={onVariantChange} placeholder="59900" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stock *</label>
                <input className="input-field" required type="number" name="in_stock" value={variantForm.in_stock} onChange={onVariantChange} placeholder="25" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Low Stock *</label>
                <input className="input-field" required type="number" name="low_stock_threshold" value={variantForm.low_stock_threshold} onChange={onVariantChange} placeholder="5" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium mb-1">Imágenes de la variante</label>
                <input type="file" accept="image/*" multiple onChange={onFirstVariantFiles} />
                {variantForm.files.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {variantForm.files.map((f, i) => (
                      <div key={i} className="border rounded p-2">
                        <img src={URL.createObjectURL(f)} alt="" className="h-24 w-full object-cover rounded" />
                        <input type="text" placeholder="Alt opcional" value={variantForm.alts[i] || ''} onChange={e => onFirstVariantAlt(i, e.target.value)} className="mt-2 input-field" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
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