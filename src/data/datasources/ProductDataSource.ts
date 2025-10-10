// src/data/datasources/ProductDataSource.ts
import type { Product, ProductVariant } from '@/data/entities/product';

export interface ProductDataSource {
  listProducts(limit?: number): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  createProduct(
    productData: any,
    variantsData: any[]
  ): Promise<{ product_id: string; variant_ids: string[] }>;
  updateProduct(id: string, productData: any): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  getProductVariants(productId: string): Promise<ProductVariant[]>;
  createVariant(productId: string, variantData: any): Promise<ProductVariant>;
  updateVariant(variantId: string, variantData: any): Promise<ProductVariant>;
  deleteVariant(variantId: string): Promise<void>;
}

export class SupabaseProductDataSource implements ProductDataSource {
  private readonly baseUrl: string;
  private readonly authHeaders: { Authorization: string };

  constructor() {
    this.baseUrl = `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/admin-products`;
    this.authHeaders = {
      Authorization: `Bearer ${(import.meta as any).env.VITE_SUPABASE_ANON_KEY}`,
    };
  }

  async listProducts(limit: number = 20): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products/list`, {
      headers: { ...this.authHeaders },
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || 'Error al cargar productos');
    }

    // Mapeamos la categoría anidada
    return (json.data || []).map((p: any) => ({
      ...p,
      category_id: p.category?.id || p.category_id || null,
      category_name: p.category?.name || p.category_name || null,
      category: undefined, // evitamos duplicados en el objeto
    }));
  }

  async getProduct(id: string): Promise<Product | null> {
    const response = await fetch(`${this.baseUrl}/products/${id}`, {
      headers: { ...this.authHeaders },
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || 'Error al cargar producto');
    }

    return json.data;
  }

  async createProduct(
    productData: any,
    variantsData: any[]
  ): Promise<{ product_id: string; variant_ids: string[] }> {
    const response = await fetch(`${this.baseUrl}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders },
      body: JSON.stringify({ product: productData, variants: variantsData }),
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || 'Error al crear producto');
    }

    return json.data;
  }

  async updateProduct(id: string, productData: any): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders },
      body: JSON.stringify(productData),
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || 'Error al actualizar producto');
    }

    return json.data;
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders },
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || 'Error al eliminar producto');
    }
  }

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    const response = await fetch(
      `${this.baseUrl}/products/${productId}/variants`,
      {
        headers: { ...this.authHeaders },
      }
    );
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || 'Error al cargar variantes');
    }

    return json.data || [];
  }

  async createVariant(
    productId: string,
    variantData: any
  ): Promise<ProductVariant> {
    const response = await fetch(
      `${this.baseUrl}/products/${productId}/variants`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...this.authHeaders },
        body: JSON.stringify(variantData),
      }
    );
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || 'Error al crear variante');
    }

    return json.data;
  }

  async updateVariant(
    variantId: string,
    variantData: any
  ): Promise<ProductVariant> {
    const response = await fetch(`${this.baseUrl}/variants/${variantId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders },
      body: JSON.stringify(variantData),
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || 'Error al actualizar variante');
    }

    return json.data;
  }

  async deleteVariant(variantId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/variants/${variantId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...this.authHeaders },
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || 'Error al eliminar variante');
    }
  }
}
