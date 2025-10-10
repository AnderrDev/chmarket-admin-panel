// src/data/datasources/CategoryDataSource.ts
import { supabase } from '@/lib/supabase';
import type { Category, CategoryFormData } from '@/data/entities/category';

export interface CategoryDataSource {
  listCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | null>;
  createCategory(categoryData: CategoryFormData): Promise<Category>;
  updateCategory(id: string, categoryData: CategoryFormData): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
}

export class SupabaseCategoryDataSource implements CategoryDataSource {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-categories`;
  }

  private async getAuthHeaders() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    };
  }

  async listCategories(): Promise<Category[]> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/stats`, {
      method: 'GET',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al cargar categorías');
    }

    return result.data || [];
  }

  async getCategory(id: string): Promise<Category | null> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al obtener categoría');
    }

    return result.data;
  }

  async createCategory(categoryData: CategoryFormData): Promise<Category> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}/create`, {
      method: 'POST',
      headers,
      body: JSON.stringify(categoryData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al crear categoría');
    }

    return result.data;
  }

  async updateCategory(
    id: string,
    categoryData: CategoryFormData
  ): Promise<Category> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(this.baseUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ categoryId: id, categoryData }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al actualizar categoría');
    }

    return result.data;
  }

  async deleteCategory(id: string): Promise<void> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(this.baseUrl, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ categoryId: id }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Error al eliminar categoría');
    }
  }
}
