import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as lucideReact from 'lucide-react'
import { useProducts } from '@/hooks/useProducts.ts'
import { formatDate, getStatusColor } from '@/utils/format.ts'


// src/pages/Products.tsx
// ...importes iguales
export default function Products() {
  const { products, loading, deleteProduct } = useProducts()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_at')

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.slug.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || p.category_name === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'created_at': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default: return 0
      }
    })

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este producto?')) {
      try { await deleteProduct(id) } catch (e) { console.error(e) }
    }
  }

  if (loading) { /* skeleton igual que antes */ }

  return (
    <div>
      {/* header + filtros igual que antes */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredProducts.map(product => (
            <li key={product.id}>
              <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12">
                    {product.images?.[0] ? (
                      <img 
                        className="h-12 w-12 rounded-lg object-cover" 
                        src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url} 
                        alt={typeof product.images[0] === 'string' ? product.name : (product.images[0].alt || product.name)}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <lucideReact.Package className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.is_active ? 'active' : 'inactive')}`}>
                        {product.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="truncate">{product.slug}</span>
                      <span className="mx-2">•</span>
                      <span>{product.category_name || 'Sin categoría'}</span>
                      {/* Si tu backend expone default_price_cents, úsalo aquí: */}
                      {/* <span className="mx-2">•</span>
                      <span>{product.default_price_cents ? formatCurrency(product.default_price_cents) : '—'}</span> */}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">Creado: {formatDate(product.created_at)}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link to={`/products/${product.id}/edit`} className="text-gray-400 hover:text-gray-500" title="Editar">
                    <lucideReact.Edit className="w-5 h-5" />
                  </Link>
                  <button onClick={() => handleDelete(product.id)} className="text-gray-400 hover:text-red-500" title="Eliminar">
                    <lucideReact.Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* estado vacío igual que antes */}
    </div>
  )
}
