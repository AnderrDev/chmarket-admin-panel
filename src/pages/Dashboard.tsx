import { useMemo } from 'react';
import { transformSupabaseImage } from '@/utils/imageTransform';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertTriangle,
  Clock,
  Tag,
  ArrowRight,
  ExternalLink,
  Percent,
  Truck,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useProducts } from '@/hooks/useProducts.ts';
import { useOrders } from '@/hooks/useOrders.ts';
import { useDiscounts } from '@/hooks/useDiscounts.ts';
import { getLowStockProductsUseCase } from '@/application/container';
import { formatCurrency, formatStatus, getStatusColor } from '@/utils/format.ts';
import { getProductImage } from '@/utils/format.ts';

// ─── Stat Card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  name: string;
  value: string | number;
  loading: boolean;
  icon: React.ElementType;
  accentColor: string;
  iconBg: string;
  href?: string;
}

function StatCard({ name, value, loading, icon: Icon, accentColor, iconBg, href }: StatCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => href && navigate(href)}
      className={`group w-full bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-left transition-all duration-200 ${
        href ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : 'cursor-default'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {href && (
          <ArrowRight
            size={15}
            className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
          />
        )}
      </div>

      <div className="mt-3">
        {loading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-7 bg-gray-100 rounded-lg w-2/3" />
            <div className="h-3.5 bg-gray-100 rounded w-1/2" />
          </div>
        ) : (
          <>
            <p className={`text-2xl font-bold ${accentColor}`}>{value}</p>
            <p className="mt-0.5 text-xs font-medium text-gray-500 uppercase tracking-wide">
              {name}
            </p>
          </>
        )}
      </div>
    </button>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  href,
  label = 'Ver todos',
}: {
  title: string;
  href?: string;
  label?: string;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h2>
      {href && (
        <button
          onClick={() => navigate(href)}
          className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          {label}
          <ArrowRight size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}
    >
      {formatStatus(status)}
    </span>
  );
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 py-3 animate-pulse">
      <div className="h-4 bg-gray-100 rounded w-24" />
      <div className="h-4 bg-gray-100 rounded flex-1" />
      <div className="h-4 bg-gray-100 rounded w-16" />
      <div className="h-5 bg-gray-100 rounded-full w-20" />
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { totalProducts, loading: productsLoading } = useProducts();
  const { orders, totalOrders, loading: ordersLoading } = useOrders();
  const { discounts, loading: discountsLoading } = useDiscounts();

  const { data: lowStockRows = [], isLoading: lowStockLoading } = useQuery({
    queryKey: ['admin', 'low-stock'],
    queryFn: () => getLowStockProductsUseCase.execute(),
    staleTime: 60_000,
  });

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

  const recentOrders = useMemo(() => orders.slice(0, 6), [orders]);
  const activeDiscountsList = useMemo(
    () => discounts.filter(d => d.is_active).slice(0, 5),
    [discounts]
  );

  // Greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }, []);

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString('es-CO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    []
  );

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{greeting} 👋</h1>
          <p className="mt-0.5 text-sm text-gray-500 capitalize">{dateLabel}</p>
        </div>
        {pendingOrders > 0 && (
          <button
            onClick={() => navigate('/orders')}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-medium rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Clock size={13} />
            {pendingOrders} orden{pendingOrders !== 1 ? 'es' : ''} pendiente{pendingOrders !== 1 ? 's' : ''}
          </button>
        )}
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard
          name="Productos"
          value={totalProducts}
          loading={productsLoading}
          icon={Package}
          accentColor="text-blue-700"
          iconBg="bg-blue-500"
          href="/products"
        />
        <StatCard
          name="Órdenes"
          value={totalOrders}
          loading={ordersLoading}
          icon={ShoppingCart}
          accentColor="text-emerald-700"
          iconBg="bg-emerald-500"
          href="/orders"
        />
        <StatCard
          name="Ingresos"
          value={formatCurrency(totalRevenue)}
          loading={ordersLoading}
          icon={DollarSign}
          accentColor="text-violet-700"
          iconBg="bg-violet-500"
        />
        <StatCard
          name="Pendientes"
          value={pendingOrders}
          loading={ordersLoading}
          icon={Clock}
          accentColor={pendingOrders > 0 ? 'text-orange-700' : 'text-gray-700'}
          iconBg={pendingOrders > 0 ? 'bg-orange-500' : 'bg-gray-400'}
          href="/orders"
        />
        <StatCard
          name="Bajo Stock"
          value={lowStockGroups.length}
          loading={lowStockLoading}
          icon={AlertTriangle}
          accentColor={lowStockGroups.length > 0 ? 'text-red-700' : 'text-gray-700'}
          iconBg={lowStockGroups.length > 0 ? 'bg-red-500' : 'bg-gray-400'}
          href="/products"
        />
        <StatCard
          name="Cupones"
          value={activeDiscounts}
          loading={discountsLoading}
          icon={Tag}
          accentColor="text-pink-700"
          iconBg="bg-pink-500"
          href="/discounts"
        />
      </div>

      {/* ── Recent Orders + Active Discounts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <SectionHeader title="Órdenes recientes" href="/orders" />
          <div className="divide-y divide-gray-50">
            {ordersLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : recentOrders.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart size={32} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No hay órdenes todavía</p>
              </div>
            ) : (
              recentOrders.map(order => (
                <button
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.id}`)}
                  className="group w-full flex items-center gap-4 py-3 text-left hover:bg-gray-50/70 -mx-1 px-1 rounded-lg transition-colors"
                >
                  <span className="text-xs font-mono font-semibold text-gray-700 w-20 truncate">
                    #{order.order_number}
                  </span>
                  <span className="text-xs text-gray-500 flex-1 truncate">{order.email}</span>
                  <span className="text-xs font-semibold text-gray-800 w-24 text-right">
                    {formatCurrency(order.total_cents)}
                  </span>
                  <div className="w-24 flex justify-end">
                    <StatusBadge status={order.status} />
                  </div>
                  <ArrowRight
                    size={13}
                    className="text-gray-200 group-hover:text-gray-400 transition-colors flex-shrink-0"
                  />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Active Discounts (1/3 width) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <SectionHeader title="Cupones activos" href="/discounts" />
          <div className="space-y-2">
            {discountsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse h-14 bg-gray-50 rounded-lg" />
              ))
            ) : activeDiscountsList.length === 0 ? (
              <div className="py-8 text-center">
                <Tag size={28} className="mx-auto text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No hay cupones activos</p>
              </div>
            ) : (
              activeDiscountsList.map(discount => (
                <div
                  key={discount.id}
                  className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-pink-100 flex-shrink-0">
                    {discount.type === 'FREE_SHIPPING' ? (
                      <Truck size={13} className="text-pink-600" />
                    ) : discount.type === 'PERCENT' ? (
                      <Percent size={13} className="text-pink-600" />
                    ) : (
                      <DollarSign size={13} className="text-pink-600" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 font-mono truncate">
                      {discount.code}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {discount.type === 'PERCENT' &&
                        `${discount.value_percent}% de descuento`}
                      {discount.type === 'FIXED' &&
                        `${formatCurrency(discount.value_cents || 0)} fijo`}
                      {discount.type === 'FREE_SHIPPING' && 'Envío gratis'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    Min {formatCurrency(discount.min_order_cents)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Low Stock Alert ── */}
      {!lowStockLoading && lowStockGroups.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-100">
                <AlertTriangle size={14} className="text-red-600" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Productos con bajo stock
              </h2>
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
                {lowStockGroups.length}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {lowStockGroups.map(({ product, variants }) => {
              const imageUrl = getProductImage(product);
              return (
                <div
                  key={product.id}
                  className="flex flex-col gap-3 p-3 border border-red-100 rounded-xl bg-red-50/50"
                >
                  {/* Product header */}
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 h-9 w-9">
                      {imageUrl ? (
                        <img
                          className="h-9 w-9 rounded-lg object-cover"
                          src={transformSupabaseImage(imageUrl, { width: 72, height: 72, quality: 75, format: 'webp', resize: 'cover' })}
                          alt={product.name}
                          loading="lazy"
                          decoding="async"
                          width={36}
                          height={36}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            if (target.src !== imageUrl) target.src = imageUrl
                          }}
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Package size={16} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.category_name || 'Sin categoría'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                      className="flex-shrink-0 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      <ExternalLink size={12} />
                    </button>
                  </div>

                  {/* Variant list */}
                  <div className="space-y-1.5">
                    {variants.map((v, i) => {
                      const pct = Math.min((v.stock / v.threshold) * 100, 100);
                      return (
                        <div key={i}>
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs text-gray-600 truncate max-w-[70%]">
                              {v.label}
                              {v.flavor && ` · ${v.flavor}`}
                              {v.size && ` · ${v.size}`}
                            </span>
                            <span className="text-xs font-bold text-red-600 flex-shrink-0 ml-2">
                              {v.stock}/{v.threshold}
                            </span>
                          </div>
                          <div className="h-1.5 bg-red-100 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-red-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
