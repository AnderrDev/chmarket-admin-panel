// src/components/product-form/MultipleVariantsForm.tsx
import { useState } from 'react'
import type { VariantFormData } from '@/types/productForm'

interface MultipleVariantsFormProps {
    variantsData: {
        variants: VariantFormData[]
    }
    onAddVariant: () => void
    onRemoveVariant: (index: number) => void
    onUpdateVariant: (index: number, field: keyof VariantFormData, value: any) => void
    onSetVariantAsDefault: (index: number) => void
    onVariantFiles: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void
    onVariantAlt: (variantIndex: number, fileIndex: number, value: string) => void
    isEditing?: boolean
}

export default function MultipleVariantsForm({
    variantsData,
    onAddVariant,
    onRemoveVariant,
    onUpdateVariant,
    onSetVariantAsDefault,
    onVariantFiles,
    onVariantAlt,
    isEditing = false
}: MultipleVariantsFormProps) {

    const handleVariantChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target
        const fieldValue = type === 'checkbox' ? checked : value
        onUpdateVariant(index, name as keyof VariantFormData, fieldValue)
    }

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">
                    {isEditing ? 'Editar Variantes del Producto' : 'Variantes del Producto'}
                </h3>
                <button
                    type="button"
                    onClick={onAddVariant}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                    + Agregar Variante
                </button>
            </div>

            {variantsData.variants.map((variant, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 mb-6 last:mb-0">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-md font-medium">Variante {index + 1}</h4>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={variant.is_default}
                                    onChange={() => onSetVariantAsDefault(index)}
                                    className="mr-2"
                                />
                                <span className="text-sm">Por defecto</span>
                            </label>
                            {variantsData.variants.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveVariant(index)}
                                    className="text-red-600 hover:text-red-800 text-sm"
                                >
                                    Eliminar
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">SKU *</label>
                            <input
                                className="input-field"
                                required
                                name="sku"
                                value={variant.sku}
                                onChange={(e) => handleVariantChange(index, e)}
                                placeholder="CREA-300"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Label *</label>
                            <input
                                className="input-field"
                                required
                                name="label"
                                value={variant.label}
                                onChange={(e) => handleVariantChange(index, e)}
                                placeholder="300g Vainilla"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Sabor</label>
                            <input
                                className="input-field"
                                name="flavor"
                                value={variant.flavor}
                                onChange={(e) => handleVariantChange(index, e)}
                                placeholder="Vainilla"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tamaño</label>
                            <input
                                className="input-field"
                                name="size"
                                value={variant.size}
                                onChange={(e) => handleVariantChange(index, e)}
                                placeholder="300g"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Precio (centavos) *</label>
                            <input
                                className="input-field"
                                required
                                type="number"
                                name="price_cents"
                                value={variant.price_cents}
                                onChange={(e) => handleVariantChange(index, e)}
                                placeholder="49900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Compare At</label>
                            <input
                                className="input-field"
                                type="number"
                                name="compare_at_price_cents"
                                value={variant.compare_at_price_cents}
                                onChange={(e) => handleVariantChange(index, e)}
                                placeholder="59900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Stock *</label>
                            <input
                                className="input-field"
                                required
                                type="number"
                                name="in_stock"
                                value={variant.in_stock}
                                onChange={(e) => handleVariantChange(index, e)}
                                placeholder="25"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Low Stock *</label>
                            <input
                                className="input-field"
                                required
                                type="number"
                                name="low_stock_threshold"
                                value={variant.low_stock_threshold}
                                onChange={(e) => handleVariantChange(index, e)}
                                placeholder="5"
                            />
                        </div>
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium mb-1">
                                {isEditing ? 'Nuevas imágenes de la variante' : 'Imágenes de la variante'}
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => onVariantFiles(index, e)}
                            />
                            {variant.files.length > 0 && (
                                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {variant.files.map((f, i) => (
                                        <div key={i} className="border rounded p-2">
                                            <img
                                                src={URL.createObjectURL(f)}
                                                alt=""
                                                className="h-24 w-full object-cover rounded"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Alt opcional"
                                                value={variant.alts[i] || ''}
                                                onChange={e => onVariantAlt(index, i, e.target.value)}
                                                className="mt-2 input-field"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                            {isEditing && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Las imágenes existentes se mantendrán. Solo se subirán las nuevas imágenes seleccionadas.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
