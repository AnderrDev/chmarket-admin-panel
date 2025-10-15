// src/hooks/useFormHandlers.ts
import { useCategories } from '@/hooks/useCategories';

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

export function useFormHandlers() {
  const { categories } = useCategories();

  const handleProductChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    _formData: any,
    setFormData: any,
    touchedSlug: boolean,
    setTouchedSlug: any
  ) => {
    const { name, value, type } = e.target;
    const v =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    if (name === 'category_id') {
      const sel = categories.find(c => c.id === value);
      setFormData((prev: any) => ({
        ...prev,
        category_id: value,
        category_name: sel?.name || '',
      }));
      return;
    }

    if (name === 'name') {
      setFormData((prev: any) => ({
        ...prev,
        name: v as string,
        slug: touchedSlug ? prev.slug : slugify(String(v)),
      }));
      return;
    }

    if (name === 'slug') {
      setTouchedSlug(true);
    }

    setFormData((prev: any) => ({ ...prev, [name]: v as any }));
  };

  const handleVariantChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setVariantForm: any
  ) => {
    const { name, type } = e.target;
    const v =
      type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : e.target.value;
    setVariantForm((prev: any) => ({ ...prev, [name]: v as any }));
  };

  return {
    handleProductChange,
    handleVariantChange,
  };
}
