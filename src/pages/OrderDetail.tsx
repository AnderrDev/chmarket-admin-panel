import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useOrders } from '@/hooks/useOrders.ts';
import { formatCurrency, formatDate, formatStatus, getStatusColor } from '@/utils/format.ts';
import { Order, OrderItem } from '@/types/index.ts';

// ── Info row inside a card ──────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2">
      <span className="text-xs text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-xs font-medium text-gray-800 text-right break-all">{value}</span>
    </div>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrder, getOrderItems, updateOrderStatus } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrderData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [orderData, itemsData] = await Promise.all([getOrder(id), getOrderItems(id)]);
        setOrder(orderData);
        setOrderItems(itemsData);
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setLoading(false);
      }
    };
    loadOrderData();
  }, [id, getOrder, getOrderItems]);

  const handleStatusUpdate = async (newStatus: Order['status']) => {
    if (!order) return;
    try {
      const updatedOrder = await updateOrderStatus(order.id, newStatus);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded-lg w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-48 bg-white rounded-xl border border-gray-100" />
            <div className="h-64 bg-white rounded-xl border border-gray-100" />
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-white rounded-xl border border-gray-100" />
            <div className="h-48 bg-white rounded-xl border border-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <Package size={40} className="mx-auto text-gray-300 mb-3" />
        <h3 className="text-sm font-semibold text-gray-700">Orden no encontrada</h3>
        <p className="mt-1 text-xs text-gray-400">La orden que buscas no existe o fue eliminada.</p>
        <button
          onClick={() => navigate('/orders')}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
        >
          Volver a Órdenes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb / Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span
            className="hover:text-blue-600 cursor-pointer transition-colors"
            onClick={() => navigate('/orders')}
          >
            Órdenes
          </span>
          <ChevronRight size={13} />
          <span className="font-semibold text-gray-900">#{order.order_number}</span>
        </div>
        <span
          className={`ml-auto inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}
        >
          {formatStatus(order.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ──────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">
          {/* Resumen financiero */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Resumen financiero
              </h3>
              {/* Status select */}
              <select
                value={order.status}
                onChange={e => handleStatusUpdate(e.target.value as Order['status'])}
                className="text-xs py-1.5 pl-3 pr-7 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
              >
                <option value="CREATED">Creado</option>
                <option value="PAID">Pagado</option>
                <option value="FULFILLED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="REFUNDED">Reembolsado</option>
              </select>
            </div>

            <div className="space-y-0 divide-y divide-gray-50">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Subtotal</span>
                <span className="text-sm font-medium text-gray-800">
                  {formatCurrency(order.subtotal_cents)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Envío</span>
                <span className="text-sm font-medium text-gray-800">
                  {formatCurrency(order.shipping_cents)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Descuento</span>
                <span className="text-sm font-medium text-emerald-600">
                  -{formatCurrency(order.discount_cents)}
                </span>
              </div>

              {order.order_discounts && order.order_discounts.length > 0 && (
                <div className="py-2 space-y-1.5">
                  {order.order_discounts.map(discount => (
                    <div key={discount.id} className="flex items-center justify-between pl-3">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                        <span className="text-xs font-mono text-gray-600">
                          {discount.code_snapshot}
                          {discount.type_snapshot === 'PERCENT' && discount.value_percent_snapshot &&
                            ` · ${discount.value_percent_snapshot}%`}
                          {discount.type_snapshot === 'FREE_SHIPPING' && ' · Envío gratis'}
                          {discount.type_snapshot === 'FIXED' && discount.value_cents_snapshot &&
                            ` · -${formatCurrency(discount.value_cents_snapshot)}`}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-600 font-medium">
                        -{formatCurrency(discount.amount_applied_cents)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between py-3">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-base font-bold text-gray-900">
                  {formatCurrency(order.total_cents)}
                </span>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">
              Productos ({orderItems.length})
            </h3>
            <div className="space-y-2">
              {orderItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    <Package size={16} className="text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.name_snapshot}
                    </p>
                    {item.variant_label && (
                      <p className="text-xs text-gray-500">{item.variant_label}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(item.unit_price_cents * item.quantity)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(item.unit_price_cents)} × {item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column ──────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Cliente */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <User size={13} className="text-blue-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Cliente</h3>
            </div>
            <p className="text-sm text-gray-700 break-all">{order.email}</p>
          </div>

          {/* Dirección de envío */}
          {order.shipping_address && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MapPin size={13} className="text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">Dirección de envío</h3>
              </div>
              <div className="divide-y divide-gray-50">
                <InfoRow label="Nombre" value={order.shipping_address.name} />
                <InfoRow label="Teléfono" value={order.shipping_address.phone} />
                <InfoRow label="Email" value={order.shipping_address.email} />
                <InfoRow label="Dirección" value={order.shipping_address.address} />
                <InfoRow label="Ciudad" value={order.shipping_address.city} />
                <InfoRow label="País" value={order.shipping_address.country} />
                <InfoRow label="Código postal" value={order.shipping_address.zipCode} />
                {order.shipping_address.documentType && order.shipping_address.documentNumber && (
                  <InfoRow
                    label={order.shipping_address.documentType}
                    value={order.shipping_address.documentNumber}
                  />
                )}
              </div>
            </div>
          )}

          {/* Pago */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <CreditCard size={13} className="text-violet-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Pago</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <InfoRow label="Proveedor" value={order.payment_provider} />
              <InfoRow
                label="Estado"
                value={order.payment_status ? formatStatus(order.payment_status) : undefined}
              />
              <InfoRow label="ID de pago" value={order.payment_id} />
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar size={13} className="text-orange-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Fechas</h3>
            </div>
            <div className="divide-y divide-gray-50">
              <InfoRow label="Creada" value={formatDate(order.created_at)} />
              {order.updated_at !== order.created_at && (
                <InfoRow label="Actualizada" value={formatDate(order.updated_at)} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
