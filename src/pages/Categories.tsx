import { useState } from 'react'
import { Plus, Edit, Trash2, Tag, Save, X } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import { CategoryForm } from '@/components/CategoryForm'
import { formatDate } from '@/utils/format'
import type { Category, CategoryFormData } from '@/types'

export default function Categories() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories()
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  const handleFormSubmit = async (data: CategoryFormData) => {
    setFormLoading(true)
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data)
      } else {
        await createCategory(data)
      }
      handleCloseForm()
    } catch (error) {
      console.error('Error submitting category form:', error)
      alert(error instanceof Error ? error.message : 'Error al procesar la categoría')
    } finally {
      setFormLoading(false)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingCategory(null)
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDelete = async (category: Category) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"?`)) {
      try {
        await deleteCategory(category.id)
      } catch (error) {
        console.error('Error deleting category:', error)
        alert(error instanceof Error ? error.message : 'Error al eliminar la categoría')
      }
    }
  }


  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
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
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestiona las categorías de productos
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Categoría
          </button>
        </div>
      </div>

      {/* Formulario de categoría */}
      {showForm && (
        <div className="mb-8 bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {editingCategory 
                ? `Modifica los datos de "${editingCategory.name}"`
                : 'Completa la información para crear una nueva categoría'
              }
            </p>
          </div>
          <div className="p-6">
            <CategoryForm
              category={editingCategory}
              onSubmit={handleFormSubmit}
              onCancel={handleCloseForm}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* Lista de categorías */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid gap-6">
            {categories.map((category) => (
              <div key={category.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Tag className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {category.name}
                      </h3>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className="text-sm text-gray-500">
                          Creado: {formatDate(category.created_at)}
                        </span>
                        {category.product_count !== undefined && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {category.product_count} producto{category.product_count !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(category)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {categories.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Tag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay categorías</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comienza creando tu primera categoría de productos.
          </p>
          <div className="mt-6">
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Crear Primera Categoría
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
