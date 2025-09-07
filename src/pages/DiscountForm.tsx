import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Tag } from 'lucide-react'
import { useDiscounts } from '@/hooks/useDiscounts.ts'
import { DiscountCode } from '@/types/index.ts'
import toast from 'react-hot-toast'

export default function DiscountForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { createDiscount, updateDiscount } = useDiscounts()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED' | 'FREE_SHIPPING',
    value_percent: '',
    value_cents: '',
    min_order_cents: '0',
    max_redemptions_total: '',
    max_redemptions_per_customer: '',
    combinable: false,
    start_at: '',
    end_at: '',
    is_active: true
  })

  const isEditing = Boolean(id)

  useEffect(() => {
    if (isEditing) {
      // En una implementación real, cargarías los datos del cupón aquí
      // Por ahora, usamos datos de ejemplo
      setFormData({
        code: 'DESCUENTO10',
        type: 'PERCENT',
        value_percent: '10',
        value_cents: '',
        min_order_cents: '50000',
        max_redemptions_total: '100',
        max_redemptions_per_customer: '1',
        combinable: false,
        start_at: '',
        end_at: '',
        is_active: true
      })
    }
  }, [isEditing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const discountData: Partial<DiscountCode> = {
        code: formData.code,
        type: formData.type,
        min_order_cents: parseInt(formData.min_order_cents),
        max_redemptions_total: formData.max_redemptions_total ? parseInt(formData.max_redemptions_total) : undefined,
        max_redemptions_per_customer: formData.max_redemptions_per_customer ? parseInt(formData.max_redemptions_per_customer) : undefined,
        start_at: formData.start_at || undefined,
        end_at: formData.end_at || undefined,
        combinable: formData.combinable,
        is_active: formData.is_active,
        currency: 'COP'
      }

      // Limpiar valores según el tipo
      if (formData.type === 'PERCENT') {
        discountData.value_percent = parseInt(formData.value_percent)
        discountData.value_cents = undefined
      } else if (formData.type === 'FIXED') {
        discountData.value_cents = parseInt(formData.value_cents)
        discountData.value_percent = undefined
      } else {
        discountData.value_percent = undefined
        discountData.value_cents = undefined
      }

      if (isEditing) {
        await updateDiscount(id!, discountData)
        toast.success('Cupón actualizado exitosamente')
      } else {
        await createDiscount(discountData)
        toast.success('Cupón creado exitosamente')
      }

      navigate('/discounts')
    } catch (error) {
      console.error('Error saving discount:', error)
      toast.error('Error al guardar el cupón')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/discounts')}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Cupón' : 'Nuevo Cupón'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing ? 'Modifica la información del cupón' : 'Crea un nuevo código de descuento'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Información Básica</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Código del Cupón *
              </label>
              <input
                type="text"
                id="code"
                name="code"
                required
                value={formData.code}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Ej: DESCUENTO10"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Descuento *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="PERCENT">Porcentaje</option>
                <option value="FIXED">Monto fijo</option>
                <option value="FREE_SHIPPING">Envío gratis</option>
              </select>
            </div>

            {formData.type === 'PERCENT' && (
              <div>
                <label htmlFor="value_percent" className="block text-sm font-medium text-gray-700 mb-1">
                  Porcentaje de Descuento *
                </label>
                <input
                  type="number"
                  id="value_percent"
                  name="value_percent"
                  required
                  min="1"
                  max="100"
                  value={formData.value_percent}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="10"
                />
              </div>
            )}

            {formData.type === 'FIXED' && (
              <div>
                <label htmlFor="value_cents" className="block text-sm font-medium text-gray-700 mb-1">
                  Monto de Descuento (centavos) *
                </label>
                <input
                  type="number"
                  id="value_cents"
                  name="value_cents"
                  required
                  min="1"
                  value={formData.value_cents}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="5000"
                />
              </div>
            )}

            <div>
              <label htmlFor="min_order_cents" className="block text-sm font-medium text-gray-700 mb-1">
                Orden Mínima (centavos) *
              </label>
              <input
                type="number"
                id="min_order_cents"
                name="min_order_cents"
                required
                min="0"
                value={formData.min_order_cents}
                onChange={handleInputChange}
                className="input-field"
                placeholder="50000"
              />
            </div>

            <div>
              <label htmlFor="max_redemptions_total" className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de Usos Totales
              </label>
              <input
                type="number"
                id="max_redemptions_total"
                name="max_redemptions_total"
                min="1"
                value={formData.max_redemptions_total}
                onChange={handleInputChange}
                className="input-field"
                placeholder="100"
              />
            </div>

            <div>
              <label htmlFor="max_redemptions_per_customer" className="block text-sm font-medium text-gray-700 mb-1">
                Máximo de Usos por Cliente
              </label>
              <input
                type="number"
                id="max_redemptions_per_customer"
                name="max_redemptions_per_customer"
                min="1"
                value={formData.max_redemptions_per_customer}
                onChange={handleInputChange}
                className="input-field"
                placeholder="1"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="start_at" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Inicio
              </label>
              <input
                type="datetime-local"
                id="start_at"
                name="start_at"
                value={formData.start_at}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="end_at" className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Fin
              </label>
              <input
                type="datetime-local"
                id="end_at"
                name="end_at"
                value={formData.end_at}
                onChange={handleInputChange}
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Cupón Activo</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                name="combinable"
                checked={formData.combinable}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Combinable con otros cupones</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/discounts')}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center"
          >
            {loading ? (
              <>
                <Tag className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Actualizar' : 'Crear'} Cupón
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
