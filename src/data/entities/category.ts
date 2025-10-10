// src/data/entities/category.ts

export interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface CategoryFormData {
  name: string;
}
