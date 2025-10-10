import { z } from 'zod'

// Schema para información básica del producto
export const basicProductSchema = z.object({
  name: z.string()
    .min(1, 'El nombre es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  slug: z.string()
    .min(1, 'El slug es obligatorio')
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(100, 'El slug no puede exceder 100 caracteres')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  
  category_id: z.string()
    .min(1, 'Debe seleccionar una categoría'),
  
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
  
  long_description: z.string()
    .max(2000, 'La descripción larga no puede exceder 2000 caracteres')
    .optional(),
  
  is_featured: z.boolean(),
  is_active: z.boolean(),
})

// Schema para información nutricional
export const nutritionFactsSchema = z.object({
  serving_size: z.string()
    .max(50, 'El tamaño de porción no puede exceder 50 caracteres')
    .optional(),
  
  servings_per_container: z.string()
    .max(50, 'Las porciones por envase no pueden exceder 50 caracteres')
    .optional(),
  
  notes: z.string()
    .max(500, 'Las notas no pueden exceder 500 caracteres')
    .optional(),
  
  allergens: z.array(z.string()).optional(),
  
  nutrients: z.array(z.object({
    name: z.string().min(1, 'El nombre del nutriente es obligatorio'),
    amount: z.string().min(1, 'La cantidad es obligatoria'),
    unit: z.string().min(1, 'La unidad es obligatoria'),
  })).optional(),
})

// Schema para la primera variante
export const firstVariantSchema = z.object({
  sku: z.string()
    .min(1, 'El SKU es obligatorio')
    .min(3, 'El SKU debe tener al menos 3 caracteres')
    .max(50, 'El SKU no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9-]+$/, 'El SKU solo puede contener letras mayúsculas, números y guiones'),
  
  label: z.string()
    .min(1, 'El label es obligatorio')
    .min(3, 'El label debe tener al menos 3 caracteres')
    .max(100, 'El label no puede exceder 100 caracteres'),
  
  flavor: z.string()
    .max(50, 'El sabor no puede exceder 50 caracteres')
    .optional(),
  
  size: z.string()
    .max(50, 'El tamaño no puede exceder 50 caracteres')
    .optional(),
  
  price_cents: z.string()
    .min(1, 'El precio es obligatorio')
    .regex(/^\d+$/, 'El precio debe ser un número válido')
    .refine((val) => parseInt(val) > 0, 'El precio debe ser mayor a 0'),
  
  compare_at_price_cents: z.string()
    .regex(/^\d+$/, 'El precio de comparación debe ser un número válido')
    .optional()
    .or(z.literal('')),
  
  in_stock: z.string()
    .min(1, 'El stock es obligatorio')
    .regex(/^\d+$/, 'El stock debe ser un número válido')
    .refine((val) => parseInt(val) >= 0, 'El stock no puede ser negativo'),
  
  low_stock_threshold: z.string()
    .min(1, 'El umbral de stock bajo es obligatorio')
    .regex(/^\d+$/, 'El umbral debe ser un número válido')
    .refine((val) => parseInt(val) >= 0, 'El umbral no puede ser negativo'),
  
  is_default: z.boolean(),
})

// Schema completo para crear producto
export const createProductSchema = z.object({
  product: basicProductSchema,
  nutrition: nutritionFactsSchema,
  variant: firstVariantSchema,
})

// Schema para actualizar producto
export const updateProductSchema = z.object({
  product: basicProductSchema,
  nutrition: nutritionFactsSchema,
})

// Tipos inferidos de los schemas
export type BasicProductFormData = z.infer<typeof basicProductSchema>
export type NutritionFactsFormData = z.infer<typeof nutritionFactsSchema>
export type FirstVariantFormData = z.infer<typeof firstVariantSchema>
export type CreateProductFormData = z.infer<typeof createProductSchema>
export type UpdateProductFormData = z.infer<typeof updateProductSchema>
