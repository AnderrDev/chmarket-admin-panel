// src/pages/Products.tsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, Search, Filter } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getProductImage,
} from '@/utils/format';
import toast from 'react-hot-toast';

function ProductsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
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
    deleteProduct,
    fetchProducts,
    updateProduct,
    getProductVariants,
  } = useProducts();
  const { categories, loading: categoriesLoading } = useCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [productVariants, setProductVariants] = useState<Record<string, any[]>>(
    {}
  );

  // Atajo teclado: "N" -> nuevo producto
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        (e.key === 'n' || e.key === 'N') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
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

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products
      .filter(p => {
        const matchesSearch =
          !term ||
          p.name.toLowerCase().includes(term) ||
          p.slug.toLowerCase().includes(term);
        const matchesCategory =
          filterCategory === 'all' || p.category_name === filterCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'created_at':
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          default:
            return 0;
        }
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
      toast.success(
        `Producto ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`
      );
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Error al cambiar el estado del producto');
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona los productos y sus variantes
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/products/new"
            className="btn-primary inline-flex items-center"
            title="Nuevo producto (N)"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Producto
          </Link>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Nombre o slug…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="input-field pl-9"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="input-field pl-9"
              >
                <option value="all">Todas</option>
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
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordenar por
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-field"
            >
              <option value="created_at">Más recientes</option>
              <option value="name">Nombre</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista / Skeleton / Vacío */}
      {loading ? (
        <ProductsSkeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white shadow rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchTerm || filterCategory !== 'all'
              ? 'Sin resultados'
              : 'No hay productos'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterCategory !== 'all'
              ? 'No se encontraron productos con los filtros aplicados.'
              : 'Crea tu primer producto para empezar.'}
          </p>
          <div className="mt-6">
            <Link
              to="/products/new"
              className="btn-primary inline-flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Producto
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filtered.map(product => {
              const variants = productVariants[product.id] || [];
              const image = getProductImage(product, variants);

              return (
                <li key={product.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          {image ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={image}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <span
                              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                product.is_active ? 'active' : 'inactive'
                              )}`}
                            >
                              {product.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                            {product.is_featured && (
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Destacado
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center text-sm text-gray-500 gap-x-2">
                            <span className="truncate">{product.slug}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>
                              {product.category_name || 'Sin categoría'}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            {/* Si tu backend expone default_price_cents, muestralo. Si no, puedes quitar esta parte. */}
                            {typeof (product as any).default_price_cents ===
                              'number' && (
                              <span>
                                {formatCurrency(
                                  (product as any).default_price_cents
                                )}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            Creado: {formatDate(product.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {/* Switch para activar/desactivar */}
                        <div className="flex items-center">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={product.is_active}
                              onChange={() =>
                                handleToggleStatus(
                                  product.id,
                                  product.is_active
                                )
                              }
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              {product.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Link
                            to={`/products/${product.id}/edit`}
                            className="text-gray-400 hover:text-gray-600"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-gray-400 hover:text-red-500"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* FAB móvil para crear */}
      <Link
        to="/products/new"
        className="fixed bottom-6 right-6 md:hidden inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 focus:outline-none"
        title="Nuevo producto (N)"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
}
