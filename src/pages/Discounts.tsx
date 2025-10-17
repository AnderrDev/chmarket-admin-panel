import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react';
import { useDiscounts } from '@/hooks/useDiscounts.ts';
import { formatCurrency, formatDate } from '@/utils/format.ts';

export default function Discounts() {
  const { discounts, loading, deleteDiscount, toggleDiscountStatus } =
    useDiscounts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredDiscounts = discounts
    .filter(discount => {
      const matchesSearch = discount.code
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || discount.type === filterType;
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && discount.is_active) ||
        (filterStatus === 'inactive' && !discount.is_active);
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cupón?')) {
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
    if (discount.applies_to_all_products) {
      return 'Todos los productos';
    }

    const productCount = discount.applicable_product_ids?.length || 0;
    const categoryCount = discount.applicable_category_ids?.length || 0;

    if (productCount > 0 && categoryCount > 0) {
      return `${productCount} productos, ${categoryCount} categorías`;
    } else if (productCount > 0) {
      return `${productCount} producto${productCount > 1 ? 's' : ''}`;
    } else if (categoryCount > 0) {
      return `${categoryCount} categoría${categoryCount > 1 ? 's' : ''}`;
    }

    return 'Productos específicos';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cupones</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona los códigos de descuento de la tienda
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/discounts/new"
            className="btn-primary inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Cupón
          </Link>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Buscar
            </label>
            <input
              type="text"
              id="search"
              placeholder="Buscar por código..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo
            </label>
            <select
              id="type"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos los tipos</option>
              <option value="PERCENT">Porcentaje</option>
              <option value="FIXED">Monto fijo</option>
              <option value="FREE_SHIPPING">Envío gratis</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Estado
            </label>
            <select
              id="status"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de cupones */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredDiscounts.map(discount => (
            <li key={discount.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Tag className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {discount.code}
                        </p>
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            discount.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {discount.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="truncate">
                          {getDiscountValue(discount)}
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          Min: {formatCurrency(discount.min_order_cents)}
                        </span>
                        <span className="mx-2">•</span>
                        <span>Creado: {formatDate(discount.created_at)}</span>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {discount.start_at && (
                          <span className="mr-2">
                            Desde: {formatDate(discount.start_at)}
                          </span>
                        )}
                        {discount.end_at && (
                          <span>Hasta: {formatDate(discount.end_at)}</span>
                        )}
                        {discount.max_redemptions_total && (
                          <span className="ml-2">
                            Máx: {discount.max_redemptions_total} usos
                          </span>
                        )}
                        <span className="ml-2">
                          Usado: {discount.usage_count || 0} veces
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getScopeText(discount)}
                        </span>
                        {discount.max_redemptions_total && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">
                              {discount.usage_count || 0}/
                              {discount.max_redemptions_total}
                            </span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${Math.min(100, ((discount.usage_count || 0) / discount.max_redemptions_total) * 100)}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handleToggleStatus(discount.id, discount.is_active)
                      }
                      className={`text-gray-400 hover:text-gray-500 ${
                        discount.is_active ? 'text-green-500' : 'text-gray-400'
                      }`}
                      title={discount.is_active ? 'Desactivar' : 'Activar'}
                    >
                      {discount.is_active ? (
                        <ToggleRight className="w-5 h-5" />
                      ) : (
                        <ToggleLeft className="w-5 h-5" />
                      )}
                    </button>
                    <Link
                      to={`/discounts/${discount.id}/edit`}
                      className="text-gray-400 hover:text-gray-500"
                      title="Editar"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(discount.id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Eliminar"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredDiscounts.length === 0 && (
        <div className="text-center py-12">
          <Tag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay cupones
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'No se encontraron cupones con los filtros aplicados.'
              : 'Comienza creando tu primer cupón de descuento.'}
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <div className="mt-6">
              <Link to="/discounts/new" className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Crear Cupón
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Estadísticas rápidas */}
      {discounts.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Total Cupones
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {discounts.length}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Cupones Activos
            </div>
            <div className="text-2xl font-bold text-green-600">
              {discounts.filter(d => d.is_active).length}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Cupones Inactivos
            </div>
            <div className="text-2xl font-bold text-gray-600">
              {discounts.filter(d => !d.is_active).length}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">Total Usos</div>
            <div className="text-2xl font-bold text-blue-600">
              {discounts.reduce((sum, d) => sum + (d.usage_count || 0), 0)}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Tipos Diferentes
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {new Set(discounts.map(d => d.type)).size}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
