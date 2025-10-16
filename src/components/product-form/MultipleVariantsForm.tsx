// src/components/product-form/MultipleVariantsForm.tsx
import { useState } from 'react';
import type { VariantFormData } from '@/types/productForm';
import { formatPriceInput, parsePriceInput } from '@/utils/format';
import DragAndDropImageGallery from './DragAndDropImageGallery';

interface MultipleVariantsFormProps {
  variantsData: {
    variants: VariantFormData[];
  };
  onAddVariant: () => void;
  onRemoveVariant: (index: number) => void;
  onUpdateVariant: (
    index: number,
    field: keyof VariantFormData,
    value: any
  ) => void;
  onSetVariantAsDefault: (index: number) => void;
  onVariantFiles: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  onVariantAlt: (
    variantIndex: number,
    fileIndex: number,
    value: string
  ) => void;
  onRemoveNewVariantImage: (variantIndex: number, fileIndex: number) => void;
  onRemoveExistingVariantImage: (
    variantIndex: number,
    imageIndex: number
  ) => void;
  onReorderVariantImages?: (
    variantIndex: number,
    reorderedFiles: File[]
  ) => void;
  onReorderExistingVariantImages?: (
    variantIndex: number,
    reorderedImages: { url: string; alt?: string; path?: string }[]
  ) => void;
  isEditing?: boolean;
}

export default function MultipleVariantsForm({
  variantsData,
  onAddVariant,
  onRemoveVariant,
  onUpdateVariant,
  onSetVariantAsDefault,
  onVariantFiles,
  onVariantAlt,
  onRemoveNewVariantImage,
  onRemoveExistingVariantImage,
  onReorderVariantImages,
  onReorderExistingVariantImages,
  isEditing = false,
}: MultipleVariantsFormProps) {
  const handleVariantChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;
    onUpdateVariant(index, name as keyof VariantFormData, fieldValue);
  };

  const handlePriceChange = (
    index: number,
    field: 'price_cents' | 'compare_at_price_cents',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const formattedValue = e.target.value;
    const centsValue = parsePriceInput(formattedValue);
    onUpdateVariant(index, field, centsValue);
  };

  const handlePriceFocus = (
    index: number,
    field: 'price_cents' | 'compare_at_price_cents',
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    // No hacer nada en el focus, solo formatear en el blur
    // Esto evita que se borre el valor al seleccionar el input
  };

  const handlePriceBlur = (
    index: number,
    field: 'price_cents' | 'compare_at_price_cents',
    e: React.FocusEvent<HTMLInputElement>
  ) => {
    const formattedValue = e.target.value;
    const centsValue = parsePriceInput(formattedValue);
    onUpdateVariant(index, field, centsValue);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">
          {isEditing
            ? 'Editar Variantes del Producto'
            : 'Variantes del Producto'}
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
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-6 mb-6 last:mb-0"
        >
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
              <div className="flex space-x-2">
                <input
                  className="input-field flex-1"
                  required
                  name="sku"
                  value={variant.sku}
                  onChange={e => handleVariantChange(index, e)}
                  placeholder="CREA-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    const generateUniqueSKU = () => {
                      const timestamp = Date.now().toString();
                      const random = Math.random()
                        .toString(36)
                        .substring(2, 8)
                        .toUpperCase();
                      const uuid = crypto
                        .randomUUID()
                        .substring(0, 8)
                        .toUpperCase();
                      return `SKU-${timestamp}-${random}-${uuid}`;
                    };
                    onUpdateVariant(index, 'sku', generateUniqueSKU());
                  }}
                  className="px-3 py-2 text-xs bg-gray-100 hover:bg-gray-200 rounded-md border"
                  title="Generar SKU único"
                >
                  🔄
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Label *</label>
              <input
                className="input-field"
                required
                name="label"
                value={variant.label}
                onChange={e => handleVariantChange(index, e)}
                placeholder="300g Vainilla"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Tamaño (opcional)
              </label>
              <input
                className="input-field"
                name="size"
                value={variant.size}
                onChange={e => handleVariantChange(index, e)}
                placeholder="300g (opcional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Precio *</label>
              <input
                className="input-field"
                required
                type="text"
                name="price_cents"
                value={formatPriceInput(variant.price_cents)}
                onChange={e => handlePriceChange(index, 'price_cents', e)}
                onFocus={e => handlePriceFocus(index, 'price_cents', e)}
                onBlur={e => handlePriceBlur(index, 'price_cents', e)}
                placeholder="$49.900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Precio de Comparación
              </label>
              <input
                className="input-field"
                type="text"
                name="compare_at_price_cents"
                value={formatPriceInput(variant.compare_at_price_cents)}
                onChange={e =>
                  handlePriceChange(index, 'compare_at_price_cents', e)
                }
                onFocus={e =>
                  handlePriceFocus(index, 'compare_at_price_cents', e)
                }
                onBlur={e =>
                  handlePriceBlur(index, 'compare_at_price_cents', e)
                }
                placeholder="$59.900"
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
                onChange={e => handleVariantChange(index, e)}
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Low Stock *
              </label>
              <input
                className="input-field"
                required
                type="number"
                name="low_stock_threshold"
                value={variant.low_stock_threshold}
                onChange={e => handleVariantChange(index, e)}
                placeholder="5"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium mb-1">
                {isEditing
                  ? 'Nuevas imágenes de la variante'
                  : 'Imágenes de la variante'}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => onVariantFiles(index, e)}
              />
              {/* Existing Images */}
              {variant.existingImages && variant.existingImages.length > 0 && (
                <DragAndDropImageGallery
                  images={variant.existingImages.map((img, i) => ({
                    id: `existing-${i}`,
                    url: img.url,
                    alt: img.alt || '',
                    path: img.path,
                  }))}
                  onReorder={reorderedImages => {
                    if (onReorderExistingVariantImages) {
                      const reorderedExistingImages = reorderedImages.map(
                        img => ({
                          url: img.url,
                          alt: img.alt,
                          path: img.path,
                        })
                      );
                      onReorderExistingVariantImages(
                        index,
                        reorderedExistingImages
                      );
                    }
                  }}
                  onRemove={imageIndex =>
                    onRemoveExistingVariantImage(index, imageIndex)
                  }
                  title="Imágenes existentes"
                  showRemoveButton={true}
                />
              )}

              {/* New Images */}
              {variant.files.length > 0 && (
                <DragAndDropImageGallery
                  images={variant.files.map((file, i) => ({
                    id: `new-${i}`,
                    url: URL.createObjectURL(file),
                    alt: '',
                    isNew: true,
                    file: file,
                  }))}
                  onReorder={reorderedImages => {
                    if (onReorderVariantImages) {
                      const reorderedFiles = reorderedImages.map(
                        img => img.file!
                      );
                      onReorderVariantImages(index, reorderedFiles);
                    }
                  }}
                  onRemove={fileIndex =>
                    onRemoveNewVariantImage(index, fileIndex)
                  }
                  title="Nuevas imágenes"
                  showRemoveButton={true}
                />
              )}
              {isEditing && (
                <p className="mt-2 text-sm text-gray-600">
                  Las imágenes existentes se mantendrán. Solo se subirán las
                  nuevas imágenes seleccionadas.
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
