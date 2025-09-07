import { useEffect, useState } from 'react'
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Tag
} from 'lucide-react'
import { useProducts } from '@/hooks/useProducts.ts'
import { useOrders } from '@/hooks/useOrders.ts'
import { useDiscounts } from '@/hooks/useDiscounts.ts'
import { formatCurrency } from '@/utils/format.ts'
import { DashboardStats } from '@/types/index.ts'

export default function Dashboard() {
  const { products } = useProducts()
  const { getOrdersStats } = useOrders()
  const { discounts } = useDiscounts()
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    activeDiscounts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)

        // Calcular estadísticas de productos
        // Por ahora, asumimos que todos los productos tienen stock
        const lowStockProducts = 0 // TODO: Implementar cuando tengamos acceso a variantes

        // Obtener estadísticas de órdenes
        const orderStats = await getOrdersStats()

        // Calcular cupones activos
        const activeDiscounts = discounts.filter(d => d.is_active).length

        setStats({
          totalProducts: products.length,
          totalOrders: orderStats.total,
          totalRevenue: orderStats.totalRevenue,
          pendingOrders: orderStats.byStatus['CREATED'] || 0,
          lowStockProducts,
          activeDiscounts
        })
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (products.length > 0) {
      loadStats()
    }
  }, [products, discounts, getOrdersStats])

  const statCards = [
    {
      name: 'Total Productos',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      name: 'Total Órdenes',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      name: 'Ingresos Totales',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      name: 'Órdenes Pendientes',
      value: stats.pendingOrders,
      icon: TrendingUp,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      name: 'Productos Bajo Stock',
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
    {
      name: 'Cupones Activos',
      value: stats.activeDiscounts,
      icon: Tag,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    }
  ]

  if (loading) {
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
    )
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
        {statCards.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-md flex items-center justify-center ${stat.color}`}>
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
              {products.slice(0, 5).map((product) => {
                const imageUrl = typeof product.images?.[0] === 'string'
                  ? product.images[0]
                  : product.images?.[0]?.url;

                return (
                  <div key={product.id} className="flex items-center justify-between">
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
                      {product.default_price_cents ? formatCurrency(product.default_price_cents) : 'N/A'}
                    </div>
                  </div>
                )
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
              {discounts.filter(d => d.is_active).slice(0, 5).map((discount) => (
                <div key={discount.id} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {discount.code}
                    </div>
                    <div className="text-sm text-gray-500">
                      {discount.type === 'PERCENT' && `${discount.value_percent}% descuento`}
                      {discount.type === 'FIXED' && `${formatCurrency(discount.value_cents || 0)} descuento`}
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
    </div>
  )
}

