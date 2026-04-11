import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders.ts';
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '@/utils/format.ts';

export default function Orders() {
  const navigate = useNavigate();
  const { orders, loading, page, setPage, totalOrders, totalPages } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = orders
    .filter(order => {
      const matchesSearch =
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Órdenes</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          {totalOrders > 0 ? `${totalOrders} órdenes en total` : 'Gestiona todas las órdenes de la tienda'}
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por # de orden o email…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
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

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/70">
          {['# Orden', 'Cliente', 'Total', 'Estado', 'Fecha', ''].map(col => (
            <span key={col} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {col}
            </span>
          ))}
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-5 py-3.5 animate-pulse flex gap-4 items-center">
                <div className="h-4 bg-gray-100 rounded w-20" />
                <div className="h-4 bg-gray-100 rounded flex-1" />
                <div className="h-4 bg-gray-100 rounded w-24" />
                <div className="h-5 bg-gray-100 rounded-full w-20" />
                <div className="h-4 bg-gray-100 rounded w-28" />
              </div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingCart size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm font-medium text-gray-500">
              {searchTerm || filterStatus !== 'all'
                ? 'No se encontraron órdenes con esos filtros'
                : 'Aún no hay órdenes en la tienda'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredOrders.map(order => (
              <div
                key={order.id}
                onClick={() => navigate(`/orders/${order.id}`)}
                className="group grid grid-cols-1 sm:grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] gap-2 sm:gap-4 items-center px-5 py-3.5 hover:bg-gray-50/70 cursor-pointer transition-colors"
              >
                {/* # Orden */}
                <span className="text-xs font-mono font-semibold text-gray-800">
                  #{order.order_number}
                </span>

                {/* Cliente */}
                <div className="min-w-0">
                  <span className="text-sm text-gray-700 truncate block">{order.email}</span>
                  {order.order_discounts && order.order_discounts.length > 0 && (
                    <div className="flex gap-1 mt-0.5 flex-wrap">
                      {order.order_discounts.map(d => (
                        <span
                          key={d.id}
                          className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700"
                        >
                          {d.code_snapshot}
                          {d.type_snapshot === 'PERCENT' && d.value_percent_snapshot && ` ${d.value_percent_snapshot}%`}
                          {d.type_snapshot === 'FREE_SHIPPING' && ' · Envío gratis'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total */}
                <div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(order.total_cents)}
                  </span>
                  {order.discount_cents > 0 && (
                    <span className="block text-xs text-emerald-600">
                      -{formatCurrency(order.discount_cents)}
                    </span>
                  )}
                </div>

                {/* Estado */}
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-fit ${getStatusColor(order.status)}`}
                >
                  {formatStatus(order.status)}
                </span>

                {/* Fecha */}
                <span className="text-xs text-gray-400 hidden sm:block">
                  {formatDate(order.created_at)}
                </span>

                {/* Acción */}
                <Eye
                  size={15}
                  className="text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3">
          <span className="text-xs text-gray-500">
            Mostrando {(page - 1) * 50 + 1}–{Math.min(page * 50, totalOrders)} de {totalOrders}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs font-medium text-gray-700 px-1">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
