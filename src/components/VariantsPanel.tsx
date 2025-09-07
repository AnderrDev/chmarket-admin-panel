// src/components/VariantsPanel.tsx
import { useEffect, useState } from 'react'
import { Plus, CheckCircle2, Trash2, Edit3 } from 'lucide-react'
import { formatCurrency } from '@/utils/format'
import { useProducts } from '@/hooks/useProducts'
import type { ProductVariant } from '@/types'
import toast from 'react-hot-toast'
import { uploadImagesToBucket, removeImagesFromBucket, derivePathFromPublicUrl } from '@/lib/upload'

type Props = { productId: string }

function VariantsTableSkeleton() {
  return (
    <div className="overflow-x-auto animate-pulse">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead>
          <tr>
            {['SKU', 'Label', 'Presentación', 'Precio', 'Compare At', 'Stock', 'Default', ''].map((h) => (
              <th key={h} className="px-3 py-2 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {[...Array(3)].map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 8 }).map((__, j) => (
                <td key={j} className="px-3 py-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function VariantsPanel({ productId }: Props) {
  const { getProductVariants, createVariant, updateVariant, deleteVariant } = useProducts()
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [form, setForm] = useState({
    sku: '',
    label: '',
    flavor: '',
    size: '',
    price_cents: '',
    compare_at_price_cents: '',
    in_stock: '0',
    low_stock_threshold: '5',
    is_default: false
  })

  const [files, setFiles] = useState<File[]>([])
  const [alts, setAlts] = useState<string[]>([])

  async function load() {
    setLoading(true)
    try {
      const data = await getProductVariants(productId)
      setVariants(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [productId])

  const startCreate = () => {
    setCreating(true)
    setEditingId(null)
    setForm({
      sku: '',
      label: '',
      flavor: '',
      size: '',
      price_cents: '',
      compare_at_price_cents: '',
      in_stock: '0',
      low_stock_threshold: '5',
      is_default: variants.length === 0
    })
    setFiles([]); setAlts([])
  }

  const startEdit = (v: ProductVariant) => {
    setCreating(false)
    setEditingId(v.id)
    setForm({
      sku: v.sku || '',
      label: v.label || '',
      flavor: v.flavor || '',
      size: v.size || '',
      price_cents: String(v.price_cents ?? ''),
      compare_at_price_cents: v.compare_at_price_cents ? String(v.compare_at_price_cents) : '',
      in_stock: String(v.in_stock ?? '0'),
      low_stock_threshold: String((v as any).low_stock_threshold ?? '5'),
      is_default: !!v.is_default
    })
    setFiles([]); setAlts([])
  }

  const cancelForm = () => {
    setCreating(false)
    setEditingId(null)
    setFiles([]); setAlts([])
  }

  const onFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type } = e.target
    const v = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setForm(prev => ({ ...prev, [name]: v as any }))
  }

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let images: { url: string; alt?: string; path?: string }[] | undefined = undefined
      if (files.length) {
        const uploaded = await uploadImagesToBucket(files, `variants/${productId}`)
        images = uploaded.map((u, i) => ({ url: u.url, path: u.path, alt: alts[i] || '' }))
      }

      await createVariant(productId, {
        sku: form.sku.trim(),
        label: form.label.trim(),
        flavor: form.flavor.trim() || undefined,
        size: form.size.trim() || undefined,
        price_cents: parseInt(form.price_cents || '0', 10),
        compare_at_price_cents: form.compare_at_price_cents ? parseInt(form.compare_at_price_cents, 10) : undefined,
        in_stock: parseInt(form.in_stock || '0', 10),
        low_stock_threshold: parseInt(form.low_stock_threshold || '5', 10),
        is_default: form.is_default,
        images
      })
      toast.success('Variante creada')
      cancelForm()
      await load()
    } catch {
      toast.error('Error al crear variante')
    }
  }

  const submitEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingId) return
    try {
      let images: { url: string; alt?: string; path?: string }[] | undefined = undefined
      if (files.length) {
        const uploaded = await uploadImagesToBucket(files, `variants/${productId}`)
        images = uploaded.map((u, i) => ({ url: u.url, path: u.path, alt: alts[i] || '' }))
      }

      await updateVariant(editingId, {
        sku: form.sku.trim(),
        label: form.label.trim(),
        flavor: form.flavor.trim() || undefined,
        size: form.size.trim() || undefined,
        price_cents: parseInt(form.price_cents || '0', 10),
        compare_at_price_cents: form.compare_at_price_cents ? parseInt(form.compare_at_price_cents, 10) : undefined,
        in_stock: parseInt(form.in_stock || '0', 10),
        low_stock_threshold: parseInt(form.low_stock_threshold || '5', 10),
        is_default: form.is_default,
        ...(images ? { images } : {})
      })
      toast.success('Variante actualizada')
      cancelForm()
      await load()
    } catch {
      toast.error('Error al actualizar variante')
    }
  }

  const makeDefault = async (variantId: string) => {
    try { await updateVariant(variantId, { is_default: true }); await load() } catch { toast.error('Error') }
  }
  const removeVariant = async (variantId: string) => {
    if (!confirm('¿Eliminar esta variante?')) return
    try { await deleteVariant(variantId); await load() } catch { toast.error('Error al eliminar') }
  }

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arr = e.target.files ? Array.from(e.target.files) : []
    setFiles(arr)
    setAlts(arr.map(() => ''))
  }
  const onAlt = (i: number, val: string) => setAlts(prev => prev.map((a, idx) => (idx === i ? val : a)))

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Variantes</h3>
        <button onClick={startCreate} className="btn-primary inline-flex items-center">
          <Plus className="w-4 h-4 mr-2" /> Nueva variante
        </button>
      </div>

      {loading ? (
        <VariantsTableSkeleton />
      ) : variants.length === 0 ? (
        <div className="text-sm text-gray-500">Este producto aún no tiene variantes.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left">SKU</th>
                <th className="px-3 py-2 text-left">Label</th>
                <th className="px-3 py-2 text-left">Presentación</th>
                <th className="px-3 py-2 text-right">Precio</th>
                <th className="px-3 py-2 text-right">Compare At</th>
                <th className="px-3 py-2 text-right">Stock</th>
                <th className="px-3 py-2 text-center">Default</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variants.map(v => (
                <tr key={v.id}>
                  <td className="px-3 py-2 font-mono">{v.sku}</td>
                  <td className="px-3 py-2">{v.label}</td>
                  <td className="px-3 py-2">{[v.size, v.flavor].filter(Boolean).join(' · ') || '—'}</td>
                  <td className="px-3 py-2 text-right">{formatCurrency(v.price_cents ?? 0)}</td>
                  <td className="px-3 py-2 text-right">{v.compare_at_price_cents ? formatCurrency(v.compare_at_price_cents) : '—'}</td>
                  <td className="px-3 py-2 text-right">
                    {v.in_stock ?? 0}
                    {(v as any).low_stock_threshold !== undefined &&
                      (v.in_stock ?? 0) <= (v as any).low_stock_threshold && (
                        <span className="ml-2 inline-block text-xs rounded px-2 py-0.5 bg-yellow-100 text-yellow-800">Low</span>
                      )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {v.is_default ? (
                      <span className="inline-flex items-center text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-4 h-4 mr-1" /> Default
                      </span>
                    ) : (
                      <button className="text-primary-600 hover:underline" onClick={() => makeDefault(v.id)}>
                        Marcar default
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right space-x-2">
                    <button className="text-gray-600 hover:text-gray-900" onClick={() => startEdit(v)}>
                      <Edit3 className="inline w-4 h-4 mr-1" /> Editar
                    </button>
                    <button className="text-red-600 hover:text-red-800" onClick={() => removeVariant(v.id)}>
                      <Trash2 className="inline w-4 h-4 mr-1" /> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(creating || editingId) && (
        <form onSubmit={creating ? submitCreate : submitEdit} className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1">SKU *</label>
            <input name="sku" required className="input-field" value={form.sku} onChange={onFormChange} placeholder="CREA-300" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Label *</label>
            <input name="label" required className="input-field" value={form.label} onChange={onFormChange} placeholder="300g Vainilla" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Sabor (flavor)</label>
            <input name="flavor" className="input-field" value={form.flavor} onChange={onFormChange} placeholder="Vainilla" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Tamaño (size)</label>
            <input name="size" className="input-field" value={form.size} onChange={onFormChange} placeholder="300g" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Precio (centavos) *</label>
            <input type="number" name="price_cents" required className="input-field" value={form.price_cents} onChange={onFormChange} placeholder="49900" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Compare At</label>
            <input type="number" name="compare_at_price_cents" className="input-field" value={form.compare_at_price_cents} onChange={onFormChange} placeholder="59900" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Stock *</label>
            <input type="number" name="in_stock" required className="input-field" value={form.in_stock} onChange={onFormChange} placeholder="25" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Low Stock *</label>
            <input type="number" name="low_stock_threshold" required className="input-field" value={form.low_stock_threshold} onChange={onFormChange} placeholder="5" />
          </div>

          {/* Imágenes existentes (solo al editar) */}
          {editingId && (
            <div className="md:col-span-3">
              <p className="text-sm text-gray-700 font-medium mb-2">Imágenes existentes</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(variants.find(v => v.id === editingId)?.images || []).map((img: any, idx: number) => {
                  const url = typeof img === 'string' ? img : img.url
                  const alt = typeof img === 'string' ? '' : (img.alt || '')
                  return (
                    <div key={idx} className="border rounded p-2 relative">
                      <img src={url} alt={alt} className="h-24 w-full object-cover rounded" />
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-white/90 text-red-600 text-xs px-2 py-0.5 rounded shadow"
                        onClick={async () => {
                          try {
                            const path = typeof img === 'string' ? derivePathFromPublicUrl(url) : img.path || derivePathFromPublicUrl(url)
                            if (path) await removeImagesFromBucket([path])
                            const v = variants.find(v => v.id === editingId)!
                            const nextImgs = (v.images || []).filter((_: any, j: number) => j !== idx)
                            await updateVariant(editingId, { images: nextImgs } as any)
                            await load()
                            toast.success('Imagen eliminada')
                          } catch {
                            toast.error('No se pudo eliminar la imagen')
                          }
                        }}
                      >
                        Eliminar
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Subida de nuevas imágenes */}
          <div className="md:col-span-3">
            <label className="block text-xs font-medium mb-1">Imágenes de variante</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const arr = e.target.files ? Array.from(e.target.files) : []
                setFiles(arr)
                setAlts(arr.map(() => ''))
              }}
              className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-100 hover:file:bg-gray-200"
            />
            {files.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                {files.map((f, i) => (
                  <div key={i} className="border rounded p-2">
                    <img src={URL.createObjectURL(f)} alt="" className="h-24 w-full object-cover rounded" />
                    <input
                      type="text"
                      placeholder="Alt opcional"
                      value={alts[i] || ''}
                      onChange={e => onAlt(i, e.target.value)}
                      className="mt-2 input-field"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-3 flex items-center justify-between">
            <label className="inline-flex items-center">
              <input type="checkbox" name="is_default" checked={form.is_default} onChange={onFormChange} className="h-4 w-4" />
              <span className="ml-2 text-sm">Marcar como default</span>
            </label>
            <div className="space-x-2">
              <button type="button" onClick={cancelForm} className="btn-secondary">Cancelar</button>
              <button type="submit" className="btn-primary">{creating ? 'Crear' : 'Guardar cambios'}</button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
