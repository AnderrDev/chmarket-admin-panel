// src/pages/ProductForm.tsx
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Package } from 'lucide-react'

import { useCategories } from '@/hooks/useCategories'
import { useProductForm } from '@/hooks/useProductForm'
import { useFileHandling } from '@/hooks/useFileHandling'
import { useFormHandlers } from '@/hooks/useFormHandlers'
import { useProductSubmit } from '@/hooks/useProductSubmit'
import BasicProductInfo from '@/components/product-form/BasicProductInfo'
import FeaturesAndIngredients from '@/components/product-form/FeaturesAndIngredients'
import ImageUpload from '@/components/product-form/ImageUpload'
import NutritionFacts from '@/components/product-form/NutritionFacts'
import MultipleVariantsForm from '@/components/product-form/MultipleVariantsForm'


function ProductSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-28 bg-gray-200 rounded mb-2" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
          <div className="col-span-1 md:col-span-2">
            <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
            <div className="h-24 bg-gray-200 rounded" />
          </div>
          <div className="col-span-1 md:col-span-2">
            <div className="h-4 w-36 bg-gray-200 rounded mb-2" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-36 bg-gray-200 rounded" />
      </div>
    </div>
  )
}


export default function ProductForm() {
  const navigate = useNavigate()
  const { categories, loading: categoriesLoading } = useCategories()

  // Custom hooks
  const {
    formData,
    setFormData,
    nutritionFacts,
    setNutritionFacts,
    variantsData,
    setVariantsData,
    addVariant,
    removeVariant,
    updateVariant,
    setVariantAsDefault,
    featuresInput,
    setFeaturesInput,
    ingredientsInput,
    setIngredientsInput,
    touchedSlug,
    setTouchedSlug,
    loading,
    isEditing,
    hasProductChanges,
    hasNutritionChanges,
    hasVariantsChanges,
    getChangedVariants,
    originalFormData,
    originalVariantsData,
  } = useProductForm()

  const {
    productFiles,
    productAlts,
    handleProductFiles,
    handleProductAlt,
    handleMultipleVariantFiles,
    handleMultipleVariantAlt
  } = useFileHandling()

  const { handleProductChange } = useFormHandlers()
  const { saving, submitForm } = useProductSubmit()

  // Event handlers
  const onProductChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    handleProductChange(e, formData, setFormData, touchedSlug, setTouchedSlug)
  }

  const onVariantFiles = (variantIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    handleMultipleVariantFiles(variantIndex, e, setVariantsData)
  }

  const onVariantAlt = (variantIndex: number, fileIndex: number, value: string) => {
    handleMultipleVariantAlt(variantIndex, fileIndex, value, setVariantsData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitForm(
      formData,
      nutritionFacts,
      variantsData,
      productFiles,
      productAlts,
      isEditing,
      isEditing ? formData.id : undefined,
      isEditing ? {
        hasProductChanges,
        hasNutritionChanges,
        hasVariantsChanges,
        getChangedVariants,
        originalFormData,
        originalVariantsData
      } : undefined
    )
  }

  if (loading && isEditing) return <ProductSkeleton />
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/products')} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing ? 'Modifica la información del producto' : 'Crea un nuevo producto con su primera variante'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información básica */}
        <BasicProductInfo
          formData={formData}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onProductChange={onProductChangeHandler}
          setTouchedSlug={setTouchedSlug}
        />

        {/* Features e ingredientes */}
        <div className="bg-white shadow rounded-lg p-6">
          <FeaturesAndIngredients
            features={formData.features}
            ingredients={formData.ingredients}
            featuresInput={featuresInput}
            ingredientsInput={ingredientsInput}
            setFeaturesInput={setFeaturesInput}
            setIngredientsInput={setIngredientsInput}
            onFeaturesChange={(features) => setFormData(prev => ({ ...prev, features }))}
            onIngredientsChange={(ingredients) => setFormData(prev => ({ ...prev, ingredients }))}
          />

          {/* Imágenes */}
          <ImageUpload
            productFiles={productFiles}
            productAlts={productAlts}
            existingImages={formData.images}
            isEditing={isEditing}
            productId={formData.id}
            onProductFiles={handleProductFiles}
            onProductAlt={handleProductAlt}
            onRemoveExistingImage={(index) => {
              const next = [...formData.images]
              next.splice(index, 1)
              setFormData(prev => ({ ...prev, images: next }))
            }}
            onUpdateProduct={async () => {
              // This will be handled by the submit function
            }}
          />
        </div>

        {/* Información Nutricional */}
        <NutritionFacts
          nutritionFacts={nutritionFacts}
          onNutritionFactsChange={setNutritionFacts}
        />

        {/* Variantes */}
        <MultipleVariantsForm
          variantsData={variantsData}
          onAddVariant={addVariant}
          onRemoveVariant={removeVariant}
          onUpdateVariant={updateVariant}
          onSetVariantAsDefault={setVariantAsDefault}
          onVariantFiles={onVariantFiles}
          onVariantAlt={onVariantAlt}
          isEditing={isEditing}
        />

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/products')} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary inline-flex items-center">
            {saving ? (<><Package className="w-4 h-4 mr-2 animate-spin" />Guardando…</>) : (<><Save className="w-4 h-4 mr-2" />{isEditing ? 'Actualizar' : 'Crear'} Producto</>)}
          </button>
        </div>
      </form>

    </div>
  )
}