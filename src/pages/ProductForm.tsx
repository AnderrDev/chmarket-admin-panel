// src/pages/ProductForm.tsx
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Package } from 'lucide-react'

import { useCategories } from '@/hooks/useCategories'
import { useProductForm } from '@/hooks/useProductForm'
import { useFileHandling } from '@/hooks/useFileHandling'
import { useFormHandlers } from '@/hooks/useFormHandlers'
import { useProductSubmit } from '@/hooks/useProductSubmit'
import VariantsPanel from '@/components/VariantsPanel'
import BasicProductInfo from '@/components/product-form/BasicProductInfo'
import FeaturesAndIngredients from '@/components/product-form/FeaturesAndIngredients'
import ImageUpload from '@/components/product-form/ImageUpload'
import NutritionFacts from '@/components/product-form/NutritionFacts'
import VariantForm from '@/components/product-form/VariantForm'


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
    variantForm,
    setVariantForm,
    featuresInput,
    setFeaturesInput,
    ingredientsInput,
    setIngredientsInput,
    touchedSlug,
    setTouchedSlug,
    loading,
    isEditing
  } = useProductForm()

  const {
    productFiles,
    productAlts,
    handleProductFiles,
    handleProductAlt,
    handleVariantFiles,
    handleVariantAlt
  } = useFileHandling()

  const { handleProductChange, handleVariantChange } = useFormHandlers()
  const { saving, submitForm } = useProductSubmit()

  // Event handlers
  const onProductChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    handleProductChange(e, formData, setFormData, touchedSlug, setTouchedSlug)
  }

  const onVariantChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleVariantChange(e, setVariantForm)
  }

  const onFirstVariantFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleVariantFiles(e, setVariantForm)
  }

  const onFirstVariantAlt = (i: number, val: string) => {
    handleVariantAlt(i, val, setVariantForm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await submitForm(
      formData,
      nutritionFacts,
      variantForm,
      productFiles,
      productAlts,
      isEditing,
      isEditing ? formData.id : undefined
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

        {/* Primera variante */}
        {!isEditing && (
          <VariantForm
            variantForm={variantForm}
            onVariantChange={onVariantChangeHandler}
            onFirstVariantFiles={onFirstVariantFiles}
            onFirstVariantAlt={onFirstVariantAlt}
          />
        )}

        <div className="flex justify-end space-x-4">
          <button type="button" onClick={() => navigate('/products')} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={saving} className="btn-primary inline-flex items-center">
            {saving ? (<><Package className="w-4 h-4 mr-2 animate-spin" />Guardando…</>) : (<><Save className="w-4 h-4 mr-2" />{isEditing ? 'Actualizar' : 'Crear'} Producto</>)}
          </button>
        </div>
      </form>

      {isEditing && formData.id && <div className="mt-8"><VariantsPanel productId={formData.id} /></div>}
    </div>
  )
}