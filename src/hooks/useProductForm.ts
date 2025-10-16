// src/hooks/useProductForm.ts
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useProducts } from '@/hooks/useProducts';
import type {
  ProductFormData,
  NutritionFactsData,
  VariantFormData,
  ProductDetail,
  MultipleVariantsData,
} from '@/types/productForm';

const EDGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-products`;

export function useProductForm() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { getProductVariants } = useProducts();

  const [formData, setFormData] = useState<ProductFormData>({
    id: '',
    name: '',
    slug: '',
    category_id: '',
    category_name: '',
    description: '',
    long_description: '',
    is_featured: false,
    is_active: true,
    images: [],
    features: [],
    ingredients: [],
    store: '', // No establecer valor por defecto, dejar que el usuario seleccione
  });

  const [nutritionFacts, setNutritionFacts] = useState<NutritionFactsData>({
    serving_size: '',
    servings_per_container: '',
    notes: '',
    allergens: [],
    nutrients: [],
  });

  const generateUniqueSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `SKU-${timestamp}-${random}`;
  };

  const [variantsData, setVariantsData] = useState<MultipleVariantsData>({
    variants: [
      {
        sku: generateUniqueSKU(),
        label: '',
        flavor: '',
        size: '',
        price_cents: '',
        compare_at_price_cents: '',
        in_stock: '0',
        low_stock_threshold: '5',
        is_default: true,
        files: [],
      },
    ],
  });

  // Store original data for comparison
  const [originalFormData, setOriginalFormData] =
    useState<ProductFormData | null>(null);
  const [originalVariantsData, setOriginalVariantsData] =
    useState<MultipleVariantsData | null>(null);
  const [originalNutritionFacts, setOriginalNutritionFacts] =
    useState<NutritionFactsData | null>(null);

  const [featuresInput, setFeaturesInput] = useState('');
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [touchedSlug, setTouchedSlug] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load product data when editing
  useEffect(() => {
    const loadDetail = async () => {
      if (!isEditing || !id) return;
      try {
        setLoading(true);
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        };

        const res = await fetch(`${EDGE_BASE}/products/${id}`, { headers });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Error cargando producto');
        const p: ProductDetail = json.data;

        let normalized: { url: string; alt?: string; path?: string }[] = [];
        if (Array.isArray(p.images)) {
          normalized = p.images
            .map((img: any) => (typeof img === 'string' ? { url: img } : img))
            .filter(x => !!x?.url) as any;
        }

        const productData = {
          id: p.id,
          name: p.name,
          slug: p.slug,
          description: p.description || '',
          long_description: p.long_description || '',
          is_featured: p.is_featured,
          is_active: p.is_active,
          images: normalized,
          features: p.features || [],
          ingredients: p.ingredients || [],
          category_id: p.category?.id || p.category_id || '',
          category_name: p.category?.name || p.category_name || '',
          store: p.store || '', // Preserve the store value from the database
        };

        setFormData(prev => ({ ...prev, ...productData }));
        setOriginalFormData(productData);

        const nutritionData = p.nutrition_facts || {
          serving_size: '',
          servings_per_container: '',
          notes: '',
          allergens: [],
          nutrients: [],
        };
        setNutritionFacts(nutritionData);
        setOriginalNutritionFacts(nutritionData);

        // Load existing variants
        try {
          const existingVariants = await getProductVariants(id);
          if (existingVariants && existingVariants.length > 0) {
            const variantsFormData = existingVariants.map((variant: any) => {
              // Normalize existing images
              const existingImages = variant.images || [];
              const normalizedImages = existingImages.map((img: any) =>
                typeof img === 'string' ? { url: img, alt: '' } : img
              );

              return {
                id: variant.id, // Preserve the variant ID
                sku: variant.sku || '',
                label: variant.label || '',
                flavor: variant.flavor || '',
                size: variant.size || '',
                price_cents: String(variant.price_cents || ''),
                compare_at_price_cents: variant.compare_at_price_cents
                  ? String(variant.compare_at_price_cents)
                  : '',
                in_stock: String(variant.in_stock || '0'),
                low_stock_threshold: String(variant.low_stock_threshold || '5'),
                is_default: Boolean(variant.is_default),
                files: [], // New files to upload
                existingImages: normalizedImages, // Existing images from database
              };
            });
            const variantsData = { variants: variantsFormData };
            setVariantsData(variantsData);
            setOriginalVariantsData(variantsData);
          }
        } catch (variantError) {
          console.error('Error loading variants:', variantError);
          // Si no se pueden cargar las variantes, mantener la variante por defecto
        }
      } catch (e) {
        console.error('Error loading product:', e);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [isEditing, id]);

  // Helper functions for managing multiple variants
  const addVariant = () => {
    setVariantsData(prev => ({
      variants: [
        ...prev.variants,
        {
          sku: generateUniqueSKU(),
          label: '',
          flavor: '',
          size: '',
          price_cents: '',
          compare_at_price_cents: '',
          in_stock: '0',
          low_stock_threshold: '5',
          is_default: false,
          files: [],
        },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    if (variantsData.variants.length > 1) {
      setVariantsData(prev => ({
        variants: prev.variants.filter((_, i) => i !== index),
      }));
    }
  };

  const updateVariant = (
    index: number,
    field: keyof VariantFormData,
    value: any
  ) => {
    setVariantsData(prev => ({
      variants: prev.variants.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const setVariantAsDefault = (index: number) => {
    setVariantsData(prev => ({
      variants: prev.variants.map((variant, i) => ({
        ...variant,
        is_default: i === index,
      })),
    }));
  };

  // Helper functions to detect changes
  const hasProductChanges = () => {
    if (!originalFormData) return true;
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  };

  const hasNutritionChanges = () => {
    if (!originalNutritionFacts) return true;
    return (
      JSON.stringify(nutritionFacts) !== JSON.stringify(originalNutritionFacts)
    );
  };

  const hasVariantsChanges = () => {
    if (!originalVariantsData) return true;
    return (
      JSON.stringify(variantsData) !== JSON.stringify(originalVariantsData)
    );
  };

  const getChangedVariants = (): Array<{
    index: number;
    variant: any;
    action: 'create' | 'update' | 'delete';
    variantId?: string;
  }> => {
    if (!originalVariantsData)
      return variantsData.variants.map((_, index) => ({
        index,
        variant: variantsData.variants[index],
        action: 'create' as const,
      }));

    const changes: Array<{
      index: number;
      variant: any;
      action: 'create' | 'update' | 'delete';
      variantId?: string;
    }> = [];

    // Check for updates and new variants
    variantsData.variants.forEach((variant, index) => {
      const originalVariant = originalVariantsData.variants[index];
      if (!originalVariant) {
        changes.push({ index, variant, action: 'create' as const });
      } else if (JSON.stringify(variant) !== JSON.stringify(originalVariant)) {
        changes.push({
          index,
          variant,
          action: 'update' as const,
          variantId: variant.id, // Use the variant ID from the current variant
        });
      }
    });

    // Check for deleted variants
    if (variantsData.variants.length < originalVariantsData.variants.length) {
      for (
        let i = variantsData.variants.length;
        i < originalVariantsData.variants.length;
        i++
      ) {
        changes.push({
          index: i,
          variant: originalVariantsData.variants[i],
          action: 'delete' as const,
          variantId: originalVariantsData.variants[i].id, // Store the actual variant ID
        });
      }
    }

    return changes;
  };

  // Fill form with test data
  const fillWithTestData = () => {
    const testProductData = {
      name: 'Creatina Monohidrato Premium',
      slug: 'creatina-monohidrato-premium',
      description:
        'Creatina monohidrato de la más alta calidad para maximizar tu rendimiento deportivo.',
      long_description:
        'Nuestra creatina monohidrato premium está diseñada para atletas serios que buscan maximizar su rendimiento. Con 99.9% de pureza, esta creatina te ayudará a aumentar tu fuerza, potencia y masa muscular. Ideal para deportistas de todas las disciplinas.',
      is_featured: true,
      is_active: true,
      features: [
        'Aumenta la fuerza',
        'Mejora el rendimiento',
        'Acelera la recuperación',
        '100% pura',
      ],
      ingredients: [
        'Creatina Monohidrato',
        'Sin aditivos',
        'Sin gluten',
        'Sin lactosa',
      ],
      store: 'CH+', // Datos de prueba - mantener CH+ para testing
    };

    const testNutritionFacts = {
      serving_size: '5g (1 cucharada)',
      servings_per_container: '60',
      notes: 'Mezclar con agua o tu bebida favorita',
      allergens: ['Sin alérgenos'],
      nutrients: [
        { name: 'Creatina Monohidrato', amount: '5', unit: 'g' },
        { name: 'Calorías', amount: '0', unit: 'kcal' },
        { name: 'Proteína', amount: '0', unit: 'g' },
        { name: 'Carbohidratos', amount: '0', unit: 'g' },
        { name: 'Grasas', amount: '0', unit: 'g' },
      ],
    };

    const testVariantsData = {
      variants: [
        {
          sku: `SKU-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
          label: '250g',
          flavor: 'Sin sabor',
          size: '250g',
          price_cents: '2999',
          compare_at_price_cents: '3999',
          in_stock: '100',
          low_stock_threshold: '10',
          is_default: true,
          files: [],
        },
        {
          sku: `SKU-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
          label: '500g',
          flavor: 'Sin sabor',
          size: '500g',
          price_cents: '4999',
          compare_at_price_cents: '6999',
          in_stock: '50',
          low_stock_threshold: '5',
          is_default: false,
          files: [],
        },
        {
          sku: `SKU-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`,
          label: '1kg',
          flavor: 'Sin sabor',
          size: '1kg',
          price_cents: '8999',
          compare_at_price_cents: '12999',
          in_stock: '25',
          low_stock_threshold: '3',
          is_default: false,
          files: [],
        },
      ],
    };

    setFormData(prev => ({ ...prev, ...testProductData }));
    setNutritionFacts(testNutritionFacts);
    setVariantsData(testVariantsData);
    setFeaturesInput(testProductData.features.join(', '));
    setIngredientsInput(testProductData.ingredients.join(', '));
  };

  return {
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
    // Change detection functions
    hasProductChanges,
    hasNutritionChanges,
    hasVariantsChanges,
    getChangedVariants,
    originalFormData,
    originalVariantsData,
    originalNutritionFacts,
    // Test data function
    fillWithTestData,
  };
}
