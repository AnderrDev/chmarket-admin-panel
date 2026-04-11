// src/pages/Products.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { transformSupabaseImage } from '@/utils/imageTransform';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { formatCurrency, formatDate, getProductImage } from '@/utils/format';
import toast from 'react-hot-toast';

function ProductsSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="px-5 py-3.5 flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
          <div className="h-4 bg-gray-100 rounded w-20 hidden sm:block" />
          <div className="h-5 bg-gray-100 rounded-full w-14" />
          <div className="h-6 w-20 bg-gray-100 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const {
    products,
    loading,
    page,
    setPage,
    totalProducts,
    totalPages,
    deleteProduct,
    fetchProducts,
    updateProduct,
    getProductVariants,
  } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [productVariants, setProductVariants] = useState<Record<string, any[]>>({});

  // Keyboard shortcut: "N" → new product
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'n' || e.key === 'N') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const tag = (e.target as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        navigate('/products/new');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const loadVariants = async () => {
      if (products.length === 0) return;
      const variantsMap: Record<string, any[]> = {};
      for (const product of products) {
        try {
          variantsMap[product.id] = await getProductVariants(product.id);
        } catch {
          variantsMap[product.id] = [];
        }
      }
      setProductVariants(variantsMap);
    };
    loadVariants();
  }, [products, getProductVariants]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products
      .filter(p => {
        const matchesSearch =
          !term || p.name.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term);
        const matchesCategory =
          filterCategory === 'all' || p.category_name === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [products, searchTerm, filterCategory, sortBy]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await deleteProduct(id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateProduct(id, { is_active: !currentStatus });
      toast.success(`Producto ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
    } catch {
      toast.error('Error al cambiar el estado del producto');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Productos</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {totalProducts > 0 ? `${totalProducts} productos en total` : 'Gestiona los productos y sus variantes'}
          </p>
        </div>
        <Link
          to="/products/new"
          title="Nuevo producto (N)"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus size={15} />
          Nuevo Producto
        </Link>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Nombre o slug…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
            >
              <option value="all">Todas las categorías</option>
              {categoriesLoading ? (
                <option disabled>Cargando…</option>
              ) : (
                categories.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))
              )}
            </select>
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="py-2 pl-3 pr-8 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-700"
          >
            <option value="created_at">Más recientes</option>
            <option value="name">Nombre A-Z</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <ProductsSkeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Package size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-500">
            {searchTerm || filterCategory !== 'all' ? 'Sin resultados' : 'No hay productos todavía'}
          </p>
          <p className="mt-1 text-xs text-gray-400">
            {searchTerm || filterCategory !== 'all'
              ? 'Intenta con otros filtros.'
              : 'Crea tu primer producto para empezar.'}
          </p>
          {!searchTerm && filterCategory === 'all' && (
            <Link
              to="/products/new"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
            >
              <Plus size={14} />
              Crear Producto
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Column headers */}
          <div className="hidden md:grid grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/70">
            {['', 'Producto', 'Categoría', 'Precio', 'Estado', 'Acciones'].map(col => (
              <span key={col} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {col}
              </span>
            ))}
          </div>

          <div className="divide-y divide-gray-50">
            {filtered.map(product => {
              const variants = productVariants[product.id] || [];
              const image = getProductImage(product, variants);

              return (
                <div
                  key={product.id}
                  className="grid grid-cols-1 md:grid-cols-[auto_2fr_1fr_1fr_1fr_auto] gap-3 md:gap-4 items-center px-5 py-3.5 hover:bg-gray-50/70 transition-colors"
                >
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {image ? (
                      <img
                        className="h-10 w-10 rounded-lg object-cover"
                        src={transformSupabaseImage(image, { width: 80, height: 80, quality: 75, format: 'webp', resize: 'cover' })}
                        alt={product.name}
                        loading="lazy"
                        decoding="async"
                        width={40}
                        height={40}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          if (target.src !== image) target.src = image
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package size={16} className="text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Name + meta */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                      {product.is_featured && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                          Destacado
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{product.slug}</p>
                    <p className="text-xs text-gray-400 md:hidden mt-0.5">
                      Creado: {formatDate(product.created_at)}
                    </p>
                  </div>

                  {/* Category */}
                  <span className="text-xs text-gray-600">
                    {product.category_name || <span className="text-gray-300">Sin categoría</span>}
                  </span>

                  {/* Price */}
                  <span className="text-xs font-medium text-gray-700">
                    {typeof (product as any).default_price_cents === 'number'
                      ? formatCurrency((product as any).default_price_cents)
                      : <span className="text-gray-300">—</span>}
                  </span>

                  {/* Toggle */}
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={product.is_active}
                        onChange={() => handleToggleStatus(product.id, product.is_active)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                      <span className="ml-2 text-xs text-gray-600">
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/products/${product.id}/edit`}
                      title="Editar"
                      className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Edit size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(product.id)}
                      title="Eliminar"
                      className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-3">
          <span className="text-xs text-gray-500">
            Mostrando {(page - 1) * 24 + 1}–{Math.min(page * 24, totalProducts)} de {totalProducts}
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

      {/* Mobile FAB */}
      <Link
        to="/products/new"
        title="Nuevo producto (N)"
        className="fixed bottom-6 right-6 md:hidden inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-colors"
      >
        <Plus size={22} />
      </Link>
    </div>
  );
}
