// src/data/datasources/ProductDataSource.ts
import { supabase } from '@/lib/supabase';
import type { Product, ProductVariant } from '@/data/entities/product';

export interface ProductListResult {
  data: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LowStockRow {
  product_id: string;
  product_name: string;
  product_slug: string;
  product_images: any;
  category_id: string | null;
  category_name: string | null;
  variant_id: string;
  variant_label: string;
  variant_flavor: string | null;
  variant_size: string | null;
  variant_sku: string;
  in_stock: number;
  low_stock_threshold: number;
}

export interface ProductDataSource {
  listProducts(page?: number, pageSize?: number): Promise<ProductListResult>;
  getLowStockProducts(): Promise<LowStockRow[]>;
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

  constructor() {
    this.baseUrl = `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/admin-products`;
  }

  // Las Edge Functions admin exigen el token del usuario (no la anon key)
  private async getAuthHeaders() {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return {
      Authorization: `Bearer ${session?.access_token}`,
      apikey: (import.meta as any).env.VITE_SUPABASE_ANON_KEY,
    };
  }

  async listProducts(page = 1, pageSize = 24): Promise<ProductListResult> {
    const url = new URL(`${this.baseUrl}/products/list`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(pageSize));

    const response = await fetch(url.toString(), {
      headers: { ...(await this.getAuthHeaders()) },
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || 'Error al cargar productos');
    }

    const data = (json.data || []).map((p: any) => ({
      ...p,
      category_id: p.category?.id || p.category_id || null,
      category_name: p.category?.name || p.category_name || null,
      store: p.store || '',
      category: undefined,
    }));

    return {
      data,
      total: json.total ?? 0,
      page: json.page ?? page,
      pageSize: json.pageSize ?? pageSize,
    };
  }

  async getProduct(id: string): Promise<Product | null> {
    const response = await fetch(`${this.baseUrl}/products/${id}`, {
      headers: { ...(await this.getAuthHeaders()) },
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
      headers: {
        'Content-Type': 'application/json',
        ...(await this.getAuthHeaders()),
      },
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
      headers: {
        'Content-Type': 'application/json',
        ...(await this.getAuthHeaders()),
      },
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
      headers: {
        'Content-Type': 'application/json',
        ...(await this.getAuthHeaders()),
      },
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
        headers: { ...(await this.getAuthHeaders()) },
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
        headers: {
          'Content-Type': 'application/json',
          ...(await this.getAuthHeaders()),
        },
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
      headers: {
        'Content-Type': 'application/json',
        ...(await this.getAuthHeaders()),
      },
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
      headers: {
        'Content-Type': 'application/json',
        ...(await this.getAuthHeaders()),
      },
    });
    const json = await response.json();

    if (!response.ok) {
      throw new Error(json?.error || 'Error al eliminar variante');
    }
  }

  async getLowStockProducts(): Promise<LowStockRow[]> {
    const { data, error } = await supabase.rpc('get_low_stock_products');
    if (error) throw new Error(error.message);
    return data ?? [];
  }
}
