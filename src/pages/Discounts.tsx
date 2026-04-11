import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Tag, Search, ToggleLeft, ToggleRight, Percent, Truck, DollarSign } from 'lucide-react';
import { useDiscounts } from '@/hooks/useDiscounts.ts';
import { formatCurrency, formatDate } from '@/utils/format.ts';

export default function Discounts() {
  const { discounts, loading, deleteDiscount, toggleDiscountStatus } = useDiscounts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredDiscounts = discounts
    .filter(discount => {
      const matchesSearch = discount.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || discount.type === filterType;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && discount.is_active) ||
        (filterStatus === 'inactive' && !discount.is_active);
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este cupón?')) {
      try {
        await deleteDiscount(id);
      } catch (error) {
        console.error('Error deleting discount:', error);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await toggleDiscountStatus(id, !currentStatus);
    } catch (error) {
      console.error('Error toggling discount status:', error);
    }
  };

  const getDiscountValue = (discount: any) => {
    switch (discount.type) {
      case 'PERCENT':
        return `${discount.value_percent}%`;
      case 'FIXED':
        return formatCurrency(discount.value_cents || 0);
      case 'FREE_SHIPPING':
        return 'Envío gratis';
      default:
        return 'N/A';
    }
  };

  const getScopeText = (discount: any) => {
    if (discount.applies_to_all_products) return 'Todos los productos';
    const productCount = discount.applicable_product_ids?.length || 0;
    const categoryCount = discount.applicable_category_ids?.length || 0;
    if (productCount > 0 && categoryCount > 0) return `${productCount} productos, ${categoryCount} categorías`;
    if (productCount > 0) return `${productCount} producto${productCount > 1 ? 's' : ''}`;
    if (categoryCount > 0) return `${categoryCount} categoría${categoryCount > 1 ? 's' : ''}`;
    return 'Productos específicos';
  };

  const TypeIcon = ({ type }: { type: string }) => {
    if (type === 'FREE_SHIPPING') return <Truck size={13} className="text-blue-500" />;
    if (type === 'PERCENT') return <Percent size={13} className="text-violet-500" />;
    return <DollarSign size={13} className="text-emerald-500" />;
  };

  const typeColors: Record<string, string> = {
    PERCENT: 'bg-violet-100 text-violet-700',
    FIXED: 'bg-emerald-100 text-emerald-700',
    FREE_SHIPPING: 'bg-blue-100 text-blue-700',
  };
  const typeLabels: Record<string, string> = {
    PERCENT: 'Porcentaje',
    FIXED: 'Monto fijo',
    FREE_SHIPPING: 'Envío gratis',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Cupones</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {discounts.length > 0
              ? `${discounts.length} cupón${discounts.length !== 1 ? 'es' : ''} · ${discounts.filter(d => d.is_active).length} activo${discounts.filter(d => d.is_active).length !== 1 ? 's' : ''}`
              : 'Gestiona los códigos de descuento de la tienda'}
          </p>
        </div>
        <Link
          to="/discounts/new"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={15} />
          Nuevo Cupón
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por código…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
          >
            <option value="all">Todos los tipos</option>
            <option value="PERCENT">Porcentaje</option>
            <option value="FIXED">Monto fijo</option>
            <option value="FREE_SHIPPING">Envío gratis</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
          >
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-gray-100 rounded w-28" />
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
              <div className="h-4 w-24 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : filteredDiscounts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Tag size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'No se encontraron cupones con esos filtros'
              : 'No hay cupones todavía'}
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <Link
              to="/discounts/new"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus size={14} />
              Crear Cupón
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Column headers */}
          <div className="hidden lg:grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/70">
            {['', 'Código', 'Tipo', 'Valor', 'Mín. orden', 'Usos', 'Acciones'].map(col => (
              <span key={col} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {col}
              </span>
            ))}
          </div>

          <div className="divide-y divide-gray-50">
            {filteredDiscounts.map(discount => (
              <div
                key={discount.id}
                className="grid grid-cols-1 lg:grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_auto] gap-3 lg:gap-4 items-center px-5 py-3.5 hover:bg-gray-50/70 transition-colors"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 flex-shrink-0">
                  <TypeIcon type={discount.type} />
                </div>

                {/* Code + scope */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold font-mono text-gray-800">
                      {discount.code}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                        discount.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {discount.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-gray-400">{getScopeText(discount)}</span>
                    {(discount.start_at || discount.end_at) && (
                      <span className="text-xs text-gray-400">
                        {discount.start_at && `Desde ${formatDate(discount.start_at)}`}
                        {discount.start_at && discount.end_at && ' · '}
                        {discount.end_at && `Hasta ${formatDate(discount.end_at)}`}
                      </span>
                    )}
                  </div>
                </div>

                {/* Type badge */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ${typeColors[discount.type] || 'bg-gray-100 text-gray-600'}`}
                >
                  {typeLabels[discount.type] || discount.type}
                </span>

                {/* Value */}
                <span className="text-sm font-semibold text-gray-800">
                  {getDiscountValue(discount)}
                </span>

                {/* Min order */}
                <span className="text-xs text-gray-500">
                  {formatCurrency(discount.min_order_cents)}
                </span>

                {/* Usage */}
                <div className="min-w-0">
                  {discount.max_redemptions_total ? (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500">
                          {discount.usage_count || 0}/{discount.max_redemptions_total}
                        </span>
                        <span className="text-xs text-gray-400">
                          {Math.round(((discount.usage_count || 0) / discount.max_redemptions_total) * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-20">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, ((discount.usage_count || 0) / discount.max_redemptions_total) * 100)}%`,
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <span className="text-xs text-gray-500">
                      {discount.usage_count || 0} usos
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleStatus(discount.id, discount.is_active)}
                    title={discount.is_active ? 'Desactivar' : 'Activar'}
                    className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors ${
                      discount.is_active
                        ? 'text-emerald-500 hover:bg-emerald-50'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {discount.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                  <Link
                    to={`/discounts/${discount.id}/edit`}
                    title="Editar"
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Edit size={14} />
                  </Link>
                  <button
                    onClick={() => handleDelete(discount.id)}
                    title="Eliminar"
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
