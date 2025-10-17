import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Tag } from 'lucide-react';
import { useDiscounts } from '@/hooks/useDiscounts.ts';
import { useProducts } from '@/hooks/useProducts.ts';
import { useCategories } from '@/hooks/useCategories.ts';
import { DiscountCode } from '@/types/index.ts';
import { formatPriceInput, parsePriceInput } from '@/utils/format';
import MultiSelect from '@/components/MultiSelect';
import toast from 'react-hot-toast';

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
    // TEMPORAL: max_redemptions_per_customer: '',
    combinable: false,
    start_at: '',
    end_at: '',
    is_active: true,
    // Nuevos campos para scope de productos
    applies_to_all_products: true,
    applicable_product_ids: [] as string[],
    applicable_category_ids: [] as string[],
  });

  const isEditing = Boolean(id);

  useEffect(() => {
    if (isEditing && id && discounts.length > 0 && !dataLoaded) {
      const discount = discounts.find(d => d.id === id);
      if (discount) {
        // Formatear fechas para input datetime-local
        const formatDateForInput = (dateString: string | null | undefined) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          // Convertir a formato YYYY-MM-DDTHH:MM
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        setFormData({
          code: discount.code,
          type: discount.type,
          value_percent: discount.value_percent?.toString() || '',
          value_cents: discount.value_cents?.toString() || '',
          min_order_cents: discount.min_order_cents.toString(),
          max_redemptions_total:
            discount.max_redemptions_total?.toString() || '',
          // TEMPORAL: max_redemptions_per_customer:
          //   discount.max_redemptions_per_customer?.toString() || '',
          combinable: discount.combinable,
          start_at: formatDateForInput(discount.start_at),
          end_at: formatDateForInput(discount.end_at),
          is_active: discount.is_active,
          // Nuevos campos para scope de productos
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
      // Validar fechas antes de enviar
      if (formData.start_at && formData.end_at) {
        const startDate = new Date(formData.start_at);
        const endDate = new Date(formData.end_at);

        if (startDate >= endDate) {
          toast.error('La fecha de inicio debe ser anterior a la fecha de fin');
          setLoading(false);
          return;
        }
      }

      // Validar scope de productos
      if (!formData.applies_to_all_products) {
        if (
          formData.applicable_product_ids.length === 0 &&
          formData.applicable_category_ids.length === 0
        ) {
          toast.error(
            'Debe seleccionar al menos un producto o una categoría para cupones específicos'
          );
          setLoading(false);
          return;
        }
      }

      const discountData: Partial<DiscountCode> = {
        code: formData.code,
        type: formData.type,
        min_order_cents: parseInt(formData.min_order_cents),
        max_redemptions_total: formData.max_redemptions_total
          ? parseInt(formData.max_redemptions_total)
          : null,
        // TEMPORAL: max_redemptions_per_customer: formData.max_redemptions_per_customer
        //   ? parseInt(formData.max_redemptions_per_customer)
        //   : undefined,
        start_at: formData.start_at || null,
        end_at: formData.end_at || null,
        combinable: formData.combinable,
        is_active: formData.is_active,
        currency: 'COP',
        // Nuevos campos para scope de productos
        applies_to_all_products: formData.applies_to_all_products,
        applicable_product_ids: formData.applies_to_all_products
          ? null
          : formData.applicable_product_ids.length > 0
            ? formData.applicable_product_ids
            : null,
        applicable_category_ids: formData.applies_to_all_products
          ? null
          : formData.applicable_category_ids.length > 0
            ? formData.applicable_category_ids
            : null,
      };

      // Limpiar valores según el tipo
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePriceChange = (
    field: 'value_cents' | 'min_order_cents',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const formattedValue = e.target.value;
    const centsValue = parsePriceInput(formattedValue);
    setFormData(prev => ({
      ...prev,
      [field]: centsValue,
    }));
  };

  const handlePriceFocus = (
    _field: 'value_cents' | 'min_order_cents',
    _e: React.FocusEvent<HTMLInputElement>
  ) => {
    // No hacer nada en el focus, solo formatear en el blur
    // Esto evita que se borre el valor al seleccionar el input
  };

  const handlePriceBlur = (
    field: 'value_cents' | 'min_order_cents',
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    const formattedValue = e.target.value;
    const centsValue = parsePriceInput(formattedValue);
    setFormData(prev => ({
      ...prev,
      [field]: centsValue,
    }));
  };

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
              {isEditing
                ? 'Modifica la información del cupón'
                : 'Crea un nuevo código de descuento'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Información Básica
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="code"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
                <label
                  htmlFor="value_percent"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
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
                <label
                  htmlFor="value_cents"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Monto de Descuento *
                </label>
                <input
                  type="text"
                  id="value_cents"
                  name="value_cents"
                  required
                  value={formatPriceInput(formData.value_cents)}
                  onChange={e => handlePriceChange('value_cents', e)}
                  onFocus={e => handlePriceFocus('value_cents', e)}
                  onBlur={e => handlePriceBlur('value_cents', e)}
                  className="input-field"
                  placeholder="$50.000"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="min_order_cents"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Orden Mínima *
              </label>
              <input
                type="text"
                id="min_order_cents"
                name="min_order_cents"
                required
                value={formatPriceInput(formData.min_order_cents)}
                onChange={e => handlePriceChange('min_order_cents', e)}
                onFocus={e => handlePriceFocus('min_order_cents', e)}
                onBlur={e => handlePriceBlur('min_order_cents', e)}
                className="input-field"
                placeholder="$500.000"
              />
            </div>

            <div>
              <label
                htmlFor="max_redemptions_total"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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

            {/* TEMPORAL: Campo de máximo de usos por cliente removido */}
            {/* <div>
              <label
                htmlFor="max_redemptions_per_customer"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
            </div> */}
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="start_at"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <label
                htmlFor="end_at"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
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
              <span className="ml-2 text-sm text-gray-700">
                Combinable con otros cupones
              </span>
            </label>
          </div>
        </div>

        {/* Sección de Scope de Productos */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">
            Aplicación del Cupón
          </h3>

          <div className="space-y-6">
            {/* Radio buttons para tipo de aplicación */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Aplicar cupón a:
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="applies_to_all_products"
                    checked={formData.applies_to_all_products}
                    onChange={() =>
                      setFormData(prev => ({
                        ...prev,
                        applies_to_all_products: true,
                        applicable_product_ids: [],
                        applicable_category_ids: [],
                      }))
                    }
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Todos los productos
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="radio"
                    name="applies_to_all_products"
                    checked={!formData.applies_to_all_products}
                    onChange={() =>
                      setFormData(prev => ({
                        ...prev,
                        applies_to_all_products: false,
                      }))
                    }
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Productos específicos
                  </span>
                </label>
              </div>
            </div>

            {/* Selector de productos específicos */}
            {!formData.applies_to_all_products && (
              <div className="space-y-4">
                <MultiSelect
                  options={products.map(p => ({
                    id: p.id,
                    name: p.name,
                    description: p.description || '',
                  }))}
                  selected={formData.applicable_product_ids}
                  onChange={selected =>
                    setFormData(prev => ({
                      ...prev,
                      applicable_product_ids: selected,
                    }))
                  }
                  label="Productos específicos"
                  placeholder="Seleccionar productos..."
                  searchPlaceholder="Buscar productos..."
                />

                <MultiSelect
                  options={categories.map(c => ({ id: c.id, name: c.name }))}
                  selected={formData.applicable_category_ids}
                  onChange={selected =>
                    setFormData(prev => ({
                      ...prev,
                      applicable_category_ids: selected,
                    }))
                  }
                  label="Categorías específicas"
                  placeholder="Seleccionar categorías..."
                  searchPlaceholder="Buscar categorías..."
                />

                {formData.applicable_product_ids.length === 0 &&
                  formData.applicable_category_ids.length === 0 && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      Debe seleccionar al menos un producto o una categoría para
                      cupones específicos.
                    </div>
                  )}
              </div>
            )}
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
  );
}
