import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ChevronRight, Info } from 'lucide-react';
import { useDiscounts } from '@/hooks/useDiscounts.ts';
import { useProducts } from '@/hooks/useProducts.ts';
import { useCategories } from '@/hooks/useCategories.ts';
import { DiscountCode } from '@/types/index.ts';
import { formatPriceInput, parsePriceInput } from '@/utils/format';
import MultiSelect from '@/components/MultiSelect';
import toast from 'react-hot-toast';

// ── Reusable field label ─────────────────────────────────────────────────────
function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow bg-white';
const selectCls = `${inputCls} pr-8`;

export default function DiscountForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { createDiscount, updateDiscount, discounts } = useDiscounts();
  const { products } = useProducts();
  const { categories } = useCategories();
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'PERCENT' as 'PERCENT' | 'FIXED' | 'FREE_SHIPPING',
    value_percent: '',
    value_cents: '',
    min_order_cents: '0',
    max_redemptions_total: '',
    combinable: false,
    start_at: '',
    end_at: '',
    is_active: true,
    applies_to_all_products: true,
    applicable_product_ids: [] as string[],
    applicable_category_ids: [] as string[],
  });

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id && discounts.length > 0 && !dataLoaded) {
      const discount = discounts.find(d => d.id === id);
      if (discount) {
        const formatDateForInput = (dateString: string | null | undefined) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        };
        setFormData({
          code: discount.code,
          type: discount.type,
          value_percent: discount.value_percent?.toString() || '',
          value_cents: discount.value_cents?.toString() || '',
          min_order_cents: discount.min_order_cents.toString(),
          max_redemptions_total: discount.max_redemptions_total?.toString() || '',
          combinable: discount.combinable,
          start_at: formatDateForInput(discount.start_at),
          end_at: formatDateForInput(discount.end_at),
          is_active: discount.is_active,
          applies_to_all_products: discount.applies_to_all_products ?? true,
          applicable_product_ids: discount.applicable_product_ids || [],
          applicable_category_ids: discount.applicable_category_ids || [],
        });
        setDataLoaded(true);
      }
    }
  }, [isEditing, id, discounts, dataLoaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (formData.start_at && formData.end_at) {
        if (new Date(formData.start_at) >= new Date(formData.end_at)) {
          toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
          setLoading(false);
          return;
        }
      }
      if (!formData.applies_to_all_products) {
        if (formData.applicable_product_ids.length === 0 && formData.applicable_category_ids.length === 0) {
          toast.error('Debe seleccionar al menos un producto o una categoría');
          setLoading(false);
          return;
        }
      }

      const discountData: Partial<DiscountCode> = {
        code: formData.code,
        type: formData.type,
        min_order_cents: parseInt(formData.min_order_cents),
        max_redemptions_total: formData.max_redemptions_total ? parseInt(formData.max_redemptions_total) : null,
        start_at: formData.start_at || null,
        end_at: formData.end_at || null,
        combinable: formData.combinable,
        is_active: formData.is_active,
        currency: 'COP',
        applies_to_all_products: formData.applies_to_all_products,
        applicable_product_ids: formData.applies_to_all_products ? null : (formData.applicable_product_ids.length > 0 ? formData.applicable_product_ids : null),
        applicable_category_ids: formData.applies_to_all_products ? null : (formData.applicable_category_ids.length > 0 ? formData.applicable_category_ids : null),
      };

      if (formData.type === 'PERCENT') {
        discountData.value_percent = parseInt(formData.value_percent);
        discountData.value_cents = null;
      } else if (formData.type === 'FIXED') {
        discountData.value_cents = parseInt(formData.value_cents);
        discountData.value_percent = null;
      } else {
        discountData.value_percent = null;
        discountData.value_cents = null;
      }

      if (isEditing) {
        await updateDiscount(id!, discountData);
        toast.success('Cupón actualizado exitosamente');
      } else {
        await createDiscount(discountData);
        toast.success('Cupón creado exitosamente');
      }
      navigate('/discounts');
    } catch (error) {
      console.error('Error saving discount:', error);
      toast.error('Error al guardar el cupón');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePriceChange = (field: 'value_cents' | 'min_order_cents', e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: parsePriceInput(e.target.value) }));
  };

  const handlePriceFocus = (_field: 'value_cents' | 'min_order_cents', _e: React.FocusEvent<HTMLInputElement>) => {};

  const handlePriceBlur = (field: 'value_cents' | 'min_order_cents', e: React.FocusEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: parsePriceInput(e.target.value) }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/discounts')}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => navigate('/discounts')}>
            Cupones
          </span>
          <ChevronRight size={13} />
          <span className="font-semibold text-gray-900">
            {isEditing ? 'Editar cupón' : 'Nuevo cupón'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Información básica ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-5">
            Información básica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Código */}
            <div>
              <FieldLabel htmlFor="code" required>Código del cupón</FieldLabel>
              <input
                type="text"
                id="code"
                name="code"
                required
                value={formData.code}
                onChange={handleInputChange}
                className={`${inputCls} font-mono uppercase`}
                placeholder="DESCUENTO10"
              />
            </div>

            {/* Tipo */}
            <div>
              <FieldLabel htmlFor="type" required>Tipo de descuento</FieldLabel>
              <select id="type" name="type" required value={formData.type} onChange={handleInputChange} className={selectCls}>
                <option value="PERCENT">Porcentaje (%)</option>
                <option value="FIXED">Monto fijo ($)</option>
                <option value="FREE_SHIPPING">Envío gratis</option>
              </select>
            </div>

            {/* Valor según tipo */}
            {formData.type === 'PERCENT' && (
              <div>
                <FieldLabel htmlFor="value_percent" required>Porcentaje de descuento</FieldLabel>
                <div className="relative">
                  <input
                    type="number"
                    id="value_percent"
                    name="value_percent"
                    required
                    min="1"
                    max="100"
                    value={formData.value_percent}
                    onChange={handleInputChange}
                    className={inputCls}
                    placeholder="10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
            )}

            {formData.type === 'FIXED' && (
              <div>
                <FieldLabel htmlFor="value_cents" required>Monto de descuento</FieldLabel>
                <input
                  type="text"
                  id="value_cents"
                  name="value_cents"
                  required
                  value={formatPriceInput(formData.value_cents)}
                  onChange={e => handlePriceChange('value_cents', e)}
                  onFocus={e => handlePriceFocus('value_cents', e)}
                  onBlur={e => handlePriceBlur('value_cents', e)}
                  className={inputCls}
                  placeholder="$50.000"
                />
              </div>
            )}

            {/* Orden mínima */}
            <div>
              <FieldLabel htmlFor="min_order_cents" required>Orden mínima</FieldLabel>
              <input
                type="text"
                id="min_order_cents"
                name="min_order_cents"
                required
                value={formatPriceInput(formData.min_order_cents)}
                onChange={e => handlePriceChange('min_order_cents', e)}
                onFocus={e => handlePriceFocus('min_order_cents', e)}
                onBlur={e => handlePriceBlur('min_order_cents', e)}
                className={inputCls}
                placeholder="$0"
              />
            </div>

            {/* Máximo de usos */}
            <div>
              <FieldLabel htmlFor="max_redemptions_total">Máximo de usos totales</FieldLabel>
              <input
                type="number"
                id="max_redemptions_total"
                name="max_redemptions_total"
                min="1"
                value={formData.max_redemptions_total}
                onChange={handleInputChange}
                className={inputCls}
                placeholder="Sin límite"
              />
            </div>

            {/* Fecha inicio */}
            <div>
              <FieldLabel htmlFor="start_at">Fecha de inicio</FieldLabel>
              <input
                type="datetime-local"
                id="start_at"
                name="start_at"
                value={formData.start_at}
                onChange={handleInputChange}
                className={inputCls}
              />
            </div>

            {/* Fecha fin */}
            <div>
              <FieldLabel htmlFor="end_at">Fecha de fin</FieldLabel>
              <input
                type="datetime-local"
                id="end_at"
                name="end_at"
                value={formData.end_at}
                onChange={handleInputChange}
                className={inputCls}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="mt-5 flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Cupón activo</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="combinable"
                checked={formData.combinable}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Combinable con otros cupones</span>
            </label>
          </div>
        </div>

        {/* ── Aplicación del cupón ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-5">
            Aplicación del cupón
          </h2>

          <div className="space-y-4">
            {/* Radio buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${
                  formData.applies_to_all_products
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="applies_to_all_products"
                  checked={formData.applies_to_all_products}
                  onChange={() => setFormData(prev => ({ ...prev, applies_to_all_products: true, applicable_product_ids: [], applicable_category_ids: [] }))}
                  className="mt-0.5 w-4 h-4 text-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Todos los productos</p>
                  <p className="text-xs text-gray-500 mt-0.5">Aplica a cualquier producto de la tienda</p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-colors ${
                  !formData.applies_to_all_products
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="applies_to_all_products"
                  checked={!formData.applies_to_all_products}
                  onChange={() => setFormData(prev => ({ ...prev, applies_to_all_products: false }))}
                  className="mt-0.5 w-4 h-4 text-blue-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">Productos específicos</p>
                  <p className="text-xs text-gray-500 mt-0.5">Selecciona productos o categorías</p>
                </div>
              </label>
            </div>

            {/* Selectores de productos/categorías específicos */}
            {!formData.applies_to_all_products && (
              <div className="space-y-4 pt-1">
                <MultiSelect
                  options={products.map(p => ({ id: p.id, name: p.name, description: p.description || '' }))}
                  selected={formData.applicable_product_ids}
                  onChange={selected => setFormData(prev => ({ ...prev, applicable_product_ids: selected }))}
                  label="Productos específicos"
                  placeholder="Seleccionar productos..."
                  searchPlaceholder="Buscar productos..."
                />

                <MultiSelect
                  options={categories.map(c => ({ id: c.id, name: c.name }))}
                  selected={formData.applicable_category_ids}
                  onChange={selected => setFormData(prev => ({ ...prev, applicable_category_ids: selected }))}
                  label="Categorías específicas"
                  placeholder="Seleccionar categorías..."
                  searchPlaceholder="Buscar categorías..."
                />

                {formData.applicable_product_ids.length === 0 && formData.applicable_category_ids.length === 0 && (
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                    <Info size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      Selecciona al menos un producto o una categoría para cupones específicos.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/discounts')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={15} />
                {isEditing ? 'Actualizar' : 'Crear'} cupón
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
