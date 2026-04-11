import { useState } from 'react';
import { Plus, Edit, Trash2, FolderOpen, X } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { CategoryForm } from '@/components/CategoryForm';
import { formatDate } from '@/utils/format';
import type { Category, CategoryFormData } from '@/data/entities/category';

export default function Categories() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const handleFormSubmit = async (data: CategoryFormData) => {
    setFormLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await createCategory(data);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error submitting category form:', error);
      alert(error instanceof Error ? error.message : 'Error al procesar la categoría');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
    if (window.confirm(`¿Eliminar la categoría "${category.name}"?`)) {
      try {
        await deleteCategory(category.id);
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Error al eliminar la categoría');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {categories.length > 0
              ? `${categories.length} categoría${categories.length !== 1 ? 's' : ''}`
              : 'Gestiona las categorías de productos'}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Plus size={15} />
            Nueva Categoría
          </button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-blue-50/50">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                {editingCategory ? 'Editar categoría' : 'Nueva categoría'}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {editingCategory
                  ? `Modificando "${editingCategory.name}"`
                  : 'Completa la información para crear una nueva categoría'}
              </p>
            </div>
            <button
              onClick={handleCloseForm}
              className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
          <div className="p-5">
            <CategoryForm
              category={editingCategory}
              onSubmit={handleFormSubmit}
              onCancel={handleCloseForm}
              loading={formLoading}
            />
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <FolderOpen size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-sm font-medium text-gray-500">No hay categorías todavía</p>
          <p className="mt-1 text-xs text-gray-400">Crea tu primera categoría de productos.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            <Plus size={14} />
            Crear Categoría
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Column headers */}
          <div className="hidden sm:grid grid-cols-[auto_2fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/70">
            {['', 'Categoría', 'Productos', 'Creada', 'Acciones'].map(col => (
              <span key={col} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {col}
              </span>
            ))}
          </div>
          <div className="divide-y divide-gray-50">
            {categories.map(category => (
              <div
                key={category.id}
                className="grid grid-cols-1 sm:grid-cols-[auto_2fr_1fr_1fr_auto] gap-3 sm:gap-4 items-center px-5 py-3.5 hover:bg-gray-50/70 transition-colors"
              >
                {/* Icon */}
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0">
                  <FolderOpen size={15} className="text-white" />
                </div>

                {/* Name */}
                <p className="text-sm font-semibold text-gray-800">{category.name}</p>

                {/* Product count */}
                <div>
                  {category.product_count !== undefined ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {category.product_count} producto{category.product_count !== 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>

                {/* Date */}
                <span className="text-xs text-gray-400 hidden sm:block">
                  {formatDate(category.created_at)}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(category)}
                    title="Editar"
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(category)}
                    title="Eliminar"
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
