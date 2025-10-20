import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShoppingCart } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders.ts';
import {
  formatCurrency,
  formatDate,
  formatStatus,
  getStatusColor,
} from '@/utils/format.ts';

export default function Orders() {
  const { orders, loading } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Órdenes</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gestiona todas las órdenes de la tienda
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              placeholder="Buscar por número de orden o email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field"
            />
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
              <option value="all">Todos los estados</option>
              <option value="CREATED">Creado</option>
              <option value="PAID">Pagado</option>
              <option value="FULFILLED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
              <option value="REFUNDED">Reembolsado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredOrders.map(order => (
            <li key={order.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          #{order.order_number}
                        </p>
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                        >
                          {formatStatus(order.status)}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <span className="truncate">{order.email}</span>
                        <span className="mx-2">•</span>
                        <span>{formatCurrency(order.total_cents)}</span>
                        {order.discount_cents > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-green-600 font-medium">
                              -{formatCurrency(order.discount_cents)} descuento
                            </span>
                          </>
                        )}
                        <span className="mx-2">•</span>
                        <span>{formatDate(order.created_at)}</span>
                      </div>
                      {order.order_discounts &&
                        order.order_discounts.length > 0 && (
                          <div className="mt-1 flex items-center space-x-2">
                            {order.order_discounts.map((discount, index) => (
                              <span
                                key={discount.id}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                              >
                                {discount.code_snapshot}
                                {discount.type_snapshot === 'PERCENT' &&
                                  discount.value_percent_snapshot && (
                                    <span className="ml-1">
                                      ({discount.value_percent_snapshot}%)
                                    </span>
                                  )}
                                {discount.type_snapshot === 'FIXED' &&
                                  discount.value_cents_snapshot && (
                                    <span className="ml-1">
                                      (-
                                      {formatCurrency(
                                        discount.value_cents_snapshot
                                      )}
                                      )
                                    </span>
                                  )}
                                {discount.type_snapshot === 'FREE_SHIPPING' && (
                                  <span className="ml-1">(Envío gratis)</span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      <div className="mt-1 text-sm text-gray-500">
                        {order.payment_status && (
                          <span className="mr-2">
                            Pago: {formatStatus(order.payment_status)}
                          </span>
                        )}
                        {order.payment_provider && (
                          <span>Via: {order.payment_provider}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      to={`/orders/${order.id}`}
                      className="text-gray-400 hover:text-gray-500"
                      title="Ver detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No hay órdenes
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all'
              ? 'No se encontraron órdenes con los filtros aplicados.'
              : 'Aún no hay órdenes en la tienda.'}
          </p>
        </div>
      )}

      {/* Estadísticas rápidas */}
      {orders.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Total Órdenes
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {orders.length}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Ingresos Totales
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                orders
                  .filter(
                    order =>
                      order.status === 'PAID' || order.status === 'FULFILLED'
                  )
                  .reduce((sum, order) => sum + order.total_cents, 0)
              )}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Órdenes Pendientes
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {orders.filter(o => o.status === 'CREATED').length}
            </div>
          </div>
          <div className="bg-white shadow rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500">
              Órdenes Pagadas
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {orders.filter(o => o.status === 'PAID').length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
