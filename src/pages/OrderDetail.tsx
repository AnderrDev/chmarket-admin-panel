import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, CreditCard } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders.ts';
import {
  formatCurrency,
  formatDate,
  formatStatus,
  getStatusColor,
} from '@/utils/format.ts';
import { Order, OrderItem } from '@/types/index.ts';

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
        const [orderData, itemsData] = await Promise.all([
          getOrder(id),
          getOrderItems(id),
        ]);

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
      <div className="animate-pulse">
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Orden no encontrada
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          La orden que buscas no existe o ha sido eliminada.
        </p>
        <div className="mt-6">
          <button onClick={() => navigate('/orders')} className="btn-primary">
            Volver a Órdenes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Orden #{order.order_number}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Detalles completos de la orden
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estado de la orden */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Estado de la Orden
              </h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
              >
                {formatStatus(order.status)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Subtotal:</span>
                <span className="text-sm font-medium">
                  {formatCurrency(order.subtotal_cents)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Envío:</span>
                <span className="text-sm font-medium">
                  {formatCurrency(order.shipping_cents)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Descuento:</span>
                <span className="text-sm font-medium text-red-600">
                  -{formatCurrency(order.discount_cents)}
                </span>
              </div>
              {order.order_discounts && order.order_discounts.length > 0 && (
                <div className="ml-4 space-y-1">
                  {order.order_discounts.map(discount => (
                    <div
                      key={discount.id}
                      className="flex items-center justify-between text-xs text-gray-600"
                    >
                      <span className="flex items-center">
                        <span className="font-medium">
                          {discount.code_snapshot}
                        </span>
                        {discount.type_snapshot === 'PERCENT' &&
                          discount.value_percent_snapshot && (
                            <span className="ml-1">
                              ({discount.value_percent_snapshot}%)
                            </span>
                          )}
                        {discount.type_snapshot === 'FIXED' &&
                          discount.value_cents_snapshot && (
                            <span className="ml-1">
                              (-{formatCurrency(discount.value_cents_snapshot)})
                            </span>
                          )}
                        {discount.type_snapshot === 'FREE_SHIPPING' && (
                          <span className="ml-1">(Envío gratis)</span>
                        )}
                      </span>
                      <span className="text-green-600 font-medium">
                        -{formatCurrency(discount.amount_applied_cents)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">
                    Total:
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(order.total_cents)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cambiar estado */}
            <div className="mt-6">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Cambiar Estado
              </label>
              <select
                id="status"
                value={order.status}
                onChange={e =>
                  handleStatusUpdate(e.target.value as Order['status'])
                }
                className="input-field"
              >
                <option value="CREATED">Creado</option>
                <option value="PAID">Pagado</option>
                <option value="FULFILLED">Completado</option>
                <option value="CANCELLED">Cancelado</option>
                <option value="REFUNDED">Reembolsado</option>
              </select>
            </div>
          </div>

          {/* Items de la orden */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Productos
            </h3>
            <div className="space-y-4">
              {orderItems.map(item => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0 h-12 w-12">
                    <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name_snapshot}
                    </div>
                    <div className="text-sm text-gray-500">
                      {item.variant_label && `Variante: ${item.variant_label}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.unit_price_cents)} x {item.quantity}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatCurrency(item.unit_price_cents * item.quantity)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Información del cliente y envío */}
        <div className="space-y-6">
          {/* Información del cliente */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <User className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Cliente</h3>
            </div>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Email:</span>
                <div className="text-sm font-medium text-gray-900">
                  {order.email}
                </div>
              </div>
            </div>
          </div>

          {/* Dirección de envío */}
          {/* Dirección de envío */}
          {order.shipping_address && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center mb-4">
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  Dirección de Envío
                </h3>
              </div>
              <div className="text-sm text-gray-900 space-y-1">
                {order.shipping_address.name && (
                  <div>
                    <strong>Nombre:</strong> {order.shipping_address.name}
                  </div>
                )}
                {order.shipping_address.phone && (
                  <div>
                    <strong>Teléfono:</strong> {order.shipping_address.phone}
                  </div>
                )}
                {order.shipping_address.email && (
                  <div>
                    <strong>Email:</strong> {order.shipping_address.email}
                  </div>
                )}
                {order.shipping_address.address && (
                  <div>
                    <strong>Dirección:</strong> {order.shipping_address.address}
                  </div>
                )}
                {order.shipping_address.city && (
                  <div>
                    <strong>Ciudad:</strong> {order.shipping_address.city}
                  </div>
                )}
                {order.shipping_address.country && (
                  <div>
                    <strong>País:</strong> {order.shipping_address.country}
                  </div>
                )}
                {order.shipping_address.zipCode && (
                  <div>
                    <strong>Código Postal:</strong>{' '}
                    {order.shipping_address.zipCode}
                  </div>
                )}
                {order.shipping_address.documentType &&
                  order.shipping_address.documentNumber && (
                    <div>
                      <strong>{order.shipping_address.documentType}:</strong>{' '}
                      {order.shipping_address.documentNumber}
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Información de pago */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Información de Pago
              </h3>
            </div>
            <div className="space-y-2">
              {order.payment_provider && (
                <div>
                  <span className="text-sm text-gray-500">Proveedor:</span>
                  <div className="text-sm font-medium text-gray-900">
                    {order.payment_provider}
                  </div>
                </div>
              )}
              {order.payment_status && (
                <div>
                  <span className="text-sm text-gray-500">Estado:</span>
                  <div className="text-sm font-medium text-gray-900">
                    {formatStatus(order.payment_status)}
                  </div>
                </div>
              )}
              {order.payment_id && (
                <div>
                  <span className="text-sm text-gray-500">ID de Pago:</span>
                  <div className="text-sm font-medium text-gray-900">
                    {order.payment_id}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fechas */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fechas</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-500">Creada:</span>
                <div className="text-sm font-medium text-gray-900">
                  {formatDate(order.created_at)}
                </div>
              </div>
              {order.updated_at !== order.created_at && (
                <div>
                  <span className="text-sm text-gray-500">Actualizada:</span>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(order.updated_at)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
