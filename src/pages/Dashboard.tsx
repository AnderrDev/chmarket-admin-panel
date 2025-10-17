import { useEffect, useState } from 'react';
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
import { useProducts } from '@/hooks/useProducts.ts';
import { useOrders } from '@/hooks/useOrders.ts';
import { useDiscounts } from '@/hooks/useDiscounts.ts';
import { formatCurrency, getProductImage } from '@/utils/format.ts';
import { DashboardStats } from '@/types/index.ts';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    products,
    getProductVariants,
    loading: productsLoading,
  } = useProducts();
  const { getOrdersStats, orders, loading: ordersLoading } = useOrders();
  const { discounts, loading: discountsLoading } = useDiscounts();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    activeDiscounts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [lowStockProductsList, setLowStockProductsList] = useState<
    Array<{
      product: any;
      variants: Array<{ variant: any; stock: number; threshold: number }>;
    }>
  >([]);
  const [productVariants, setProductVariants] = useState<Record<string, any[]>>(
    {}
  );

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);

        // Calcular estadísticas de productos
        // Verificar productos con stock bajo
        let lowStockProducts = 0;
        const lowStockList: Array<{
          product: any;
          variants: Array<{ variant: any; stock: number; threshold: number }>;
        }> = [];

        for (const product of products) {
          // Solo procesar productos activos
          if (!product.is_active) continue;

          try {
            const variants = await getProductVariants(product.id);
            const lowStockVariants = variants.filter(
              variant => variant.in_stock <= variant.low_stock_threshold
            );

            if (lowStockVariants.length > 0) {
              lowStockProducts++;
              lowStockList.push({
                product,
                variants: lowStockVariants.map(variant => ({
                  variant,
                  stock: variant.in_stock,
                  threshold: variant.low_stock_threshold,
                })),
              });
            }
          } catch (error) {
            console.error(
              `Error checking variants for product ${product.id}:`,
              error
            );
          }
        }

        setLowStockProductsList(lowStockList);

        // Obtener estadísticas de órdenes
        const orderStats = await getOrdersStats();

        // Calcular ingresos solo de órdenes pagadas (PAID y FULFILLED)
        const paidOrders = orders.filter(
          order => order.status === 'PAID' || order.status === 'FULFILLED'
        );
        const totalRevenueFromPaidOrders = paidOrders.reduce(
          (sum, order) => sum + order.total_cents,
          0
        );

        // Calcular cupones activos
        const activeDiscounts = discounts.filter(d => d.is_active).length;

        setStats({
          totalProducts: products.length,
          totalOrders: orderStats.totalOrders,
          totalRevenue: totalRevenueFromPaidOrders,
          pendingOrders: orderStats.pendingOrders,
          lowStockProducts,
          activeDiscounts,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    // Ejecutar loadStats cuando los hooks hayan terminado de cargar
    // No esperar órdenes ya que pueden estar vacías
    if (!productsLoading && !ordersLoading && !discountsLoading) {
      loadStats();
    }
  }, [products, orders, discounts]);

  // Load variants for each product
  useEffect(() => {
    const loadVariants = async () => {
      if (products.length > 0) {
        const variantsMap: Record<string, any[]> = {};

        for (const product of products) {
          try {
            const variants = await getProductVariants(product.id);
            variantsMap[product.id] = variants;
          } catch (error) {
            console.error(
              `Error loading variants for product ${product.id}:`,
              error
            );
            variantsMap[product.id] = [];
          }
        }

        setProductVariants(variantsMap);
      }
    };

    loadVariants();
  }, [products, getProductVariants]);

  const statCards = [
    {
      name: 'Total Productos',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
    },
    {
      name: 'Total Órdenes',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      textColor: 'text-green-600',
    },
    {
      name: 'Ingresos Totales',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
    },
    {
      name: 'Órdenes Pendientes',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
    },
    {
      name: 'Productos Bajo Stock',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
    },
    {
      name: 'Cupones Activos',
      value: stats.activeDiscounts,
      icon: Tag,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
    },
  ];

  if (loading || productsLoading || ordersLoading || discountsLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </div>
                </div>
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
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className={`text-lg font-medium ${stat.textColor}`}>
                      {stat.value}
                    </dd>
                  </dl>
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
                const imageUrl =
                  typeof product.images?.[0] === 'string'
                    ? product.images[0]
                    : product.images?.[0]?.url;

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
      {lowStockProductsList.length > 0 && (
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Productos con Bajo Stock
              </h3>
            </div>
            <div className="space-y-4">
              {lowStockProductsList.map(({ product, variants }) => {
                const productVariantsData = productVariants[product.id] || [];
                const imageUrl = getProductImage(product, productVariantsData);

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
                            {variants.map(
                              ({ variant, stock, threshold }, index) => (
                                <div
                                  key={index}
                                  className="text-sm text-gray-700"
                                >
                                  <span className="font-medium">
                                    {variant.label}
                                  </span>
                                  {variant.flavor && (
                                    <span className="text-gray-500">
                                      {' '}
                                      - {variant.flavor}
                                    </span>
                                  )}
                                  {variant.size && (
                                    <span className="text-gray-500">
                                      {' '}
                                      - {variant.size}
                                    </span>
                                  )}
                                  <span className="ml-2 text-red-600 font-medium">
                                    Stock: {stock} (Umbral: {threshold})
                                  </span>
                                </div>
                              )
                            )}
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
