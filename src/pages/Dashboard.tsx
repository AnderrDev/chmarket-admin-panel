import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Tag,
  ExternalLink,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useProducts } from '@/hooks/useProducts.ts';
import { useOrders } from '@/hooks/useOrders.ts';
import { useDiscounts } from '@/hooks/useDiscounts.ts';
import { getLowStockProductsUseCase } from '@/application/container';
import { formatCurrency } from '@/utils/format.ts';
import { getProductImage } from '@/utils/format.ts';

export default function Dashboard() {
  const navigate = useNavigate();
  const { products, totalProducts, loading: productsLoading } = useProducts();
  const { orders, totalOrders, loading: ordersLoading } = useOrders();
  const { discounts, loading: discountsLoading } = useDiscounts();

  // Single query replaces the N+1 variant loop — fetches all low-stock in one DB call
  const { data: lowStockRows = [], isLoading: lowStockLoading } = useQuery({
    queryKey: ['admin', 'low-stock'],
    queryFn: () => getLowStockProductsUseCase.execute(),
    staleTime: 60_000,
  });

  // Derived stats — no useEffect/setState needed, recomputed only when data changes
  const totalRevenue = useMemo(
    () =>
      orders
        .filter(o => o.status === 'PAID' || o.status === 'FULFILLED')
        .reduce((sum, o) => sum + o.total_cents, 0),
    [orders]
  );
  const pendingOrders = useMemo(
    () => orders.filter(o => o.status === 'CREATED').length,
    [orders]
  );
  const activeDiscounts = useMemo(
    () => discounts.filter(d => d.is_active).length,
    [discounts]
  );

  // Group low-stock rows into product-level groups for the UI card
  const lowStockGroups = useMemo(() => {
    const map = new Map<string, { product: any; variants: any[] }>();
    for (const row of lowStockRows) {
      if (!map.has(row.product_id)) {
        map.set(row.product_id, {
          product: {
            id: row.product_id,
            name: row.product_name,
            slug: row.product_slug,
            images: row.product_images,
            category_name: row.category_name,
          },
          variants: [],
        });
      }
      map.get(row.product_id)!.variants.push({
        label: row.variant_label,
        flavor: row.variant_flavor,
        size: row.variant_size,
        stock: row.in_stock,
        threshold: row.low_stock_threshold,
      });
    }
    return Array.from(map.values());
  }, [lowStockRows]);

  const statCards = [
    {
      name: 'Total Productos',
      value: totalProducts,
      loading: productsLoading,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      name: 'Total Órdenes',
      value: totalOrders,
      loading: ordersLoading,
      icon: ShoppingCart,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      name: 'Ingresos Totales',
      value: formatCurrency(totalRevenue),
      loading: ordersLoading,
      icon: DollarSign,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      name: 'Órdenes Pendientes',
      value: pendingOrders,
      loading: ordersLoading,
      icon: TrendingUp,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      name: 'Productos Bajo Stock',
      value: lowStockGroups.length,
      loading: lowStockLoading,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
    {
      name: 'Cupones Activos',
      value: activeDiscounts,
      loading: discountsLoading,
      icon: Tag,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen general de la tienda CH+
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map(stat => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-md flex items-center justify-center ${stat.color}`}
                  >
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  {stat.loading ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
                    </div>
                  ) : (
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className={`text-lg font-medium ${stat.textColor}`}>
                        {stat.value}
                      </dd>
                    </dl>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Productos Recientes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Productos Recientes
            </h3>
            <div className="space-y-3">
              {products.slice(0, 5).map(product => {
                const imageUrl = getProductImage(product);
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {imageUrl ? (
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={imageUrl}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.category_name || 'Sin categoría'}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {product.default_price_cents
                        ? formatCurrency(product.default_price_cents)
                        : 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Cupones Activos */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Cupones Activos
            </h3>
            <div className="space-y-3">
              {discounts
                .filter(d => d.is_active)
                .slice(0, 5)
                .map(discount => (
                  <div
                    key={discount.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {discount.code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {discount.type === 'PERCENT' &&
                          `${discount.value_percent}% descuento`}
                        {discount.type === 'FIXED' &&
                          `${formatCurrency(discount.value_cents || 0)} descuento`}
                        {discount.type === 'FREE_SHIPPING' && 'Envío gratis'}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Min: {formatCurrency(discount.min_order_cents)}
                    </div>
                  </div>
                ))}
              {discounts.filter(d => d.is_active).length === 0 && (
                <div className="text-sm text-gray-500">
                  No hay cupones activos
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Productos con Bajo Stock */}
      {lowStockGroups.length > 0 && (
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Productos con Bajo Stock
              </h3>
            </div>
            <div className="space-y-4">
              {lowStockGroups.map(({ product, variants }) => {
                const imageUrl = getProductImage(product);
                return (
                  <div
                    key={product.id}
                    className="border border-red-200 rounded-lg p-4 bg-red-50"
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0 h-12 w-12">
                        {imageUrl ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={imageUrl}
                            alt={product.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {product.category_name || 'Sin categoría'}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              navigate(`/products/${product.id}/edit`)
                            }
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Editar producto
                          </button>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-red-600 font-medium mb-2">
                            Variantes con bajo stock:
                          </p>
                          <div className="space-y-1">
                            {variants.map((v, i) => (
                              <div key={i} className="text-sm text-gray-700">
                                <span className="font-medium">{v.label}</span>
                                {v.flavor && (
                                  <span className="text-gray-500"> - {v.flavor}</span>
                                )}
                                {v.size && (
                                  <span className="text-gray-500"> - {v.size}</span>
                                )}
                                <span className="ml-2 text-red-600 font-medium">
                                  Stock: {v.stock} (Umbral: {v.threshold})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
