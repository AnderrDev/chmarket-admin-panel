// src/hooks/useProductSubmit.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useProducts } from '@/hooks/useProducts';
import { uploadImagesToBucket } from '@/lib/upload';

function slugify(raw: string) {
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/--+/g, '-');
}

export function useProductSubmit() {
  const navigate = useNavigate();
  const {
    createProduct,
    updateProduct,
    getProductVariants,
    createVariant,
    updateVariant,
    deleteVariant,
  } = useProducts();
  const [saving, setSaving] = useState(false);

  const validateForm = (
    formData: any,
    variantsData: any,
    isEditing: boolean
  ) => {
    if (!isEditing) {
      if (!formData.name.trim() || !formData.slug.trim()) {
        toast.error('Nombre y Slug son obligatorios');
        return false;
      }
      if (!formData.category_name) {
        toast.error('Selecciona una categoría');
        return false;
      }
      if (
        !formData.store ||
        (formData.store !== 'CH+' && formData.store !== 'MoveOn')
      ) {
        toast.error('Selecciona una tienda válida (CH+ o MoveOn)');
        return false;
      }
      if (!variantsData.variants || variantsData.variants.length === 0) {
        toast.error('Debe agregar al menos una variante');
        return false;
      }
      for (const variant of variantsData.variants) {
        if (
          !variant.sku.trim() ||
          !variant.label.trim() ||
          !variant.price_cents
        ) {
          toast.error('Completa SKU, Label y Precio de todas las variantes');
          return false;
        }
      }
    }
    return true;
  };

  const handleImageUpload = async (
    files: File[],
    prefix: string,
    alts: string[]
  ) => {
    if (!files.length) return [];
    const uploaded = await uploadImagesToBucket(files, prefix);
    return uploaded.map((u, i) => ({
      url: u.url,
      path: u.path,
      alt: alts[i] || '',
    }));
  };

  const cleanNutritionFacts = (nutritionFacts: any) => {
    const cleanedNutrients = nutritionFacts.nutrients.filter(
      (n: any) => n.name.trim() && n.amount.trim() && n.unit.trim()
    );
    return { ...nutritionFacts, nutrients: cleanedNutrients };
  };

  const submitForm = async (
    formData: any,
    nutritionFacts: any,
    variantsData: any,
    productFiles: File[],
    isEditing: boolean,
    productId?: string,
    changeDetection?: {
      hasProductChanges: () => boolean;
      hasNutritionChanges: () => boolean;
      hasVariantsChanges: () => boolean;
      getChangedVariants: () => Array<{
        index: number;
        variant: any;
        action: 'create' | 'update' | 'delete';
      }>;
      originalFormData: any;
      originalVariantsData: any;
    },
    setFormData?: (updater: (prev: any) => any) => void
  ) => {
    if (!validateForm(formData, variantsData, isEditing)) return;

    setSaving(true);
    try {
      if (isEditing && productId && changeDetection) {
        // Optimized update logic - only update what changed
        let hasAnyChanges = false;

        // Check if product data changed
        if (changeDetection.hasProductChanges()) {
          const uploadedProductImages = await handleImageUpload(
            productFiles,
            `products/${productId}`,
            []
          );

          const payload = {
            name: formData.name.trim(),
            slug: slugify(formData.slug.trim()),
            description: formData.description,
            long_description: formData.long_description,
            is_featured: formData.is_featured,
            is_active: formData.is_active,
            images: uploadedProductImages.length
              ? [...formData.images, ...uploadedProductImages]
              : formData.images,
            features: formData.features,
            ingredients: formData.ingredients,
            category_id: formData.category_id || null,
            store: formData.store,
            nutrition_facts: changeDetection.hasNutritionChanges()
              ? cleanNutritionFacts(nutritionFacts)
              : undefined,
          };
          await updateProduct(productId, payload as any);

          // Update local state with new images
          if (setFormData && uploadedProductImages.length > 0) {
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, ...uploadedProductImages],
            }));
          }

          hasAnyChanges = true;
        } else if (changeDetection.hasNutritionChanges()) {
          // Only update nutrition facts if product data didn't change
          const payload = {
            nutrition_facts: cleanNutritionFacts(nutritionFacts),
          };
          await updateProduct(productId, payload as any);
          hasAnyChanges = true;
        }

        // Handle variants changes
        if (changeDetection.hasVariantsChanges()) {
          const changedVariants = changeDetection.getChangedVariants();
          const existingVariants = await getProductVariants(productId);
          const existingVariantIds = existingVariants.map((v: any) => v.id);

          for (const change of changedVariants) {
            if (change.action === 'create') {
              // Upload variant images if any
              const variantImages = await handleImageUpload(
                change.variant.files,
                `variants/${productId}`,
                []
              );

              const variantPayload = {
                sku: change.variant.sku.trim(),
                label: change.variant.label.trim(),
                flavor: change.variant.flavor.trim() || undefined,
                size: change.variant.size.trim() || undefined,
                price_cents: parseInt(change.variant.price_cents || '0', 10),
                compare_at_price_cents: change.variant.compare_at_price_cents
                  ? parseInt(change.variant.compare_at_price_cents, 10)
                  : undefined,
                in_stock: parseInt(change.variant.in_stock || '0', 10),
                low_stock_threshold: parseInt(
                  change.variant.low_stock_threshold || '5',
                  10
                ),
                is_default: change.variant.is_default,
                images: variantImages,
              };
              await createVariant(productId, variantPayload);
            } else if (change.action === 'update') {
              // Upload variant images if any
              const variantImages = await handleImageUpload(
                change.variant.files,
                `variants/${productId}`,
                []
              );

              // Get existing variant to preserve existing images
              const existingVariant = existingVariants[change.index];
              const existingImages = existingVariant?.images || [];

              const variantPayload = {
                sku: change.variant.sku.trim(),
                label: change.variant.label.trim(),
                flavor: change.variant.flavor.trim() || undefined,
                size: change.variant.size.trim() || undefined,
                price_cents: parseInt(change.variant.price_cents || '0', 10),
                compare_at_price_cents: change.variant.compare_at_price_cents
                  ? parseInt(change.variant.compare_at_price_cents, 10)
                  : undefined,
                in_stock: parseInt(change.variant.in_stock || '0', 10),
                low_stock_threshold: parseInt(
                  change.variant.low_stock_threshold || '5',
                  10
                ),
                is_default: change.variant.is_default,
                ...(variantImages.length > 0
                  ? { images: [...existingImages, ...variantImages] }
                  : {}),
              };
              await updateVariant(
                existingVariantIds[change.index],
                variantPayload
              );
            } else if (change.action === 'delete') {
              await deleteVariant(existingVariantIds[change.index]);
            }
          }
          hasAnyChanges = true;
        }

        if (hasAnyChanges) {
          toast.success('Producto actualizado');
        } else {
          toast.success('No hay cambios para guardar');
        }
      } else {
        // Upload product images
        const uploadedProductImages = await handleImageUpload(
          productFiles,
          `products/temp-${crypto.randomUUID()}`,
          []
        );

        // Upload variant images for all variants
        const variantsWithImages = await Promise.all(
          variantsData.variants.map(async (variant: any) => {
            const variantImages = await handleImageUpload(
              variant.files || [],
              `variants/temp-${crypto.randomUUID()}`,
              []
            );
            return {
              sku: String(variant.sku || '').trim(),
              label: String(variant.label || '').trim(),
              flavor:
                variant.flavor && variant.flavor.trim()
                  ? String(variant.flavor).trim()
                  : undefined,
              size:
                variant.size && variant.size.trim()
                  ? String(variant.size).trim()
                  : undefined,
              price_cents: parseInt(String(variant.price_cents || '0'), 10),
              compare_at_price_cents: variant.compare_at_price_cents
                ? parseInt(String(variant.compare_at_price_cents), 10)
                : undefined,
              in_stock: parseInt(String(variant.in_stock || '0'), 10),
              low_stock_threshold: parseInt(
                String(variant.low_stock_threshold || '5'),
                10
              ),
              is_default: Boolean(variant.is_default),
              images: variantImages,
            };
          })
        );

        const cleanedNutritionFacts = cleanNutritionFacts(nutritionFacts);

        // Ensure arrays are properly formatted
        const features = Array.isArray(formData.features)
          ? formData.features
          : [];
        const ingredients = Array.isArray(formData.ingredients)
          ? formData.ingredients
          : [];

        // Clean nutrition facts to ensure proper format
        const cleanNutritionFactsForRPC = {
          serving_size: String(cleanedNutritionFacts.serving_size || ''),
          servings_per_container: String(
            cleanedNutritionFacts.servings_per_container || ''
          ),
          notes: String(cleanedNutritionFacts.notes || ''),
          allergens: Array.isArray(cleanedNutritionFacts.allergens)
            ? cleanedNutritionFacts.allergens
            : [],
          nutrients: Array.isArray(cleanedNutritionFacts.nutrients)
            ? cleanedNutritionFacts.nutrients
            : [],
        };

        const productPayload = {
          name: formData.name.trim(),
          slug: slugify(formData.slug.trim()),
          description: formData.description || '',
          long_description: formData.long_description || '',
          is_featured: Boolean(formData.is_featured),
          is_active: Boolean(formData.is_active),
          images: uploadedProductImages.length
            ? uploadedProductImages
            : formData.images || [],
          features: features,
          ingredients: ingredients,
          category_id:
            formData.category_id && formData.category_id !== ''
              ? formData.category_id
              : null,
          category_name: formData.category_name || '',
          store: formData.store, // Use the store value selected by the user
          nutrition_facts: cleanNutritionFactsForRPC,
        };

        const res = await createProduct(
          productPayload as any,
          variantsWithImages as any
        );
        toast.success('Producto creado');
        const newProductId = (res as any)?.product_id;
        if (newProductId) navigate(`/products/${newProductId}/edit`);
        else navigate('/products');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al guardar el producto');
      return false;
    } finally {
      setSaving(false);
    }
    return true;
  };

  return { saving, submitForm };
}
