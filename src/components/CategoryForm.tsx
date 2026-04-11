import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import type { Category, CategoryFormData } from '@/data/entities/category';

interface CategoryFormProps {
  category?: Category | null;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function CategoryForm({ category, onSubmit, onCancel, loading = false }: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>({ name: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({ name: category?.name ?? '' });
    setErrors({});
  }, [category]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const trimmed = formData.name.trim();
    if (!trimmed) {
      newErrors.name = 'El nombre de la categoría es obligatorio';
    } else if (trimmed.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    } else if (trimmed.length > 50) {
      newErrors.name = 'El nombre no puede tener más de 50 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await onSubmit({ name: formData.name.trim() });
    } catch (error) {
      console.error('Error submitting category form:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="cat-name" className="block text-sm font-medium text-gray-700 mb-1.5">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="cat-name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          disabled={loading}
          className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow ${
            errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
          }`}
          placeholder="Ej: Proteínas, Creatinas, Vitaminas…"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {category ? 'Actualizar' : 'Crear'} categoría
        </button>
      </div>
    </form>
  );
}
