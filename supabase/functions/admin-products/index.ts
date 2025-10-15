// supabase/functions/admin-products/index.ts
// Deno / Supabase Edge Function (Service Role backend confiable)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient, PostgrestError } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // en prod, fija tu dominio
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept, origin, x-requested-with",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// --- Entorno requerido ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// --- Utilidades de respuesta ---
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const err = (message: string, status = 400, extra?: Record<string, unknown>) =>
  json({ ok: false, error: message, ...extra }, status);

function mapPgErr(e: PostgrestError) {
  // 23505 = unique_violation, 22P02 = invalid_text_representation, PGRST116 = no row
  if (e.code === "23505") return err("Conflicto: valor único ya existe (slug/sku).", 409, { code: e.code, details: e.message });
  if (e.code === "22P02") return err("Dato inválido (UUID/número).", 400, { code: e.code, details: e.message });
  if (e.code === "PGRST116") return err("Recurso no encontrado.", 404, { code: e.code, details: e.message });
  return err("Error de base de datos.", 400, { code: e.code, details: e.message });
}

// --- Helpers de routing / cliente Supabase ---
function pathParts(u: URL) {
  // /functions/v1/admin-products/products/list
  // /admin-products/products/list
  // /products/list
  const segs = u.pathname.replace(/^\/+|\/+$/g, "").split("/"); // ["functions","v1","admin-products","products","list"] | ["admin-products","products","list"] | ["products","list"]

  // Encuentra dónde arranca "products" o "variants"
  const i = segs.findIndex(s => s === "products" || s === "variants");
  if (i >= 0) return segs.slice(i); // ["products","list"] | ["products",":id","variants"] | ["variants",":variantId"]

  // Fallback: si no aparece, devuelve todo (evita romper, pero caerá en "ruta no soportada")
  return segs;
}


function sb() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// --- Negocio: asegurar que exista exactamente 1 default ---
async function ensureSingleDefault(supabase: ReturnType<typeof sb>, productId: string) {
  const { data: defaults, error: qErr } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId)
    .eq("is_default", true)
    .is("deleted_at", null);

  if (qErr) throw qErr;
  if (defaults && defaults.length >= 1) return; // ya hay una

  // No hay default: tomar la primera variante activa
  const { data: first, error: fErr } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId)
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (fErr) throw fErr;

  if (first?.id) {
    const { error: uErr } = await supabase.from("product_variants").update({ is_default: true }).eq("id", first.id);
    if (uErr) throw uErr;
  }
}

// --- Server ---
serve(
  async (req) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    // Log incoming request
    console.log(`[${requestId}] ${req.method} ${req.url} - Request started`);
    console.log(`[${requestId}] Headers:`, Object.fromEntries(req.headers.entries()));
    
    // Preflight CORS
    if (req.method === "OPTIONS") {
      console.log(`[${requestId}] CORS preflight request - returning ok`);
      return new Response("ok", { headers: corsHeaders });
    }

    const url = new URL(req.url);
    const parts = pathParts(url);
    const method = req.method;
    const s = sb();
    
    console.log(`[${requestId}] Parsed path parts:`, parts);
    console.log(`[${requestId}] Query params:`, Object.fromEntries(url.searchParams.entries()));

    try {
      // ---------------- PRODUCTS ----------------

      // GET /products/list?page=&pageSize=
      if (method === "GET" && parts[0] === "products" && parts[1] === "list") {
        console.log(`[${requestId}] Processing GET /products/list`);
        const page = Math.max(1, Number(url.searchParams.get("page") ?? "1"));
        const pageSize = Math.min(Math.max(1, Number(url.searchParams.get("pageSize") ?? "20")), 100);
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        
        console.log(`[${requestId}] Pagination: page=${page}, pageSize=${pageSize}, from=${from}, to=${to}`);

        const { data, error, count } = await s
          .from("products")
          .select(
            `
    id, name, slug, images, is_active, store, created_at,
    category:categories(id, name),
    default_variant:product_variants(price_cents)
  `,
            { count: "exact" },
          )
          .is("deleted_at", null)
          .eq("product_variants.is_default", true)   // solo la variante por defecto
          .order("created_at", { ascending: false })
          .range(from, to);

        if (error) {
          console.error(`[${requestId}] Database error in GET /products/list:`, error);
          return mapPgErr(error);
        }

        console.log(`[${requestId}] Retrieved ${data?.length || 0} products, total count: ${count}`);

        const mapped = data.map(p => ({
          ...p,
          category_id: p.category?.id || null,
          category_name: p.category?.name || null,
          category: undefined,
          default_price_cents: p.default_variant?.[0]?.price_cents ?? null
        }));

        console.log(`[${requestId}] Mapped ${mapped.length} products for response`);
        return json({ ok: true, page, pageSize, total: count ?? 0, data: mapped });
      }

      // GET /products/:id
      if (method === "GET" && parts[0] === "products" && parts[1] && parts[1] !== "list" && parts[2] !== "variants") {
        const productId = parts[1];
        console.log(`[${requestId}] Processing GET /products/${productId}`);
        const { data, error } = await s
          .from("products")
          .select(
            `
            id, name, slug, description, long_description, images, features, ingredients,
            nutrition_facts, tags, seo_title, seo_description, is_featured, is_active, store,
            created_at, updated_at, deleted_at,
            category:categories(id, name)
          `,
          )
          .eq("id", productId)
          .maybeSingle();

        if (error) {
          console.error(`[${requestId}] Database error in GET /products/${productId}:`, error);
          return mapPgErr(error);
        }
        if (!data) {
          console.log(`[${requestId}] Product not found: ${productId}`);
          return err("Producto no encontrado", 404);
        }
        console.log(`[${requestId}] Retrieved product: ${data.name} (${data.slug})`);
        return json({ ok: true, data });
      }

      // POST /products  (crea producto + variantes vía RPC)
      if (method === "POST" && parts[0] === "products" && parts.length === 1) {
        console.log(`[${requestId}] Processing POST /products`);
        const payload = await req.json().catch(() => null);
        if (!payload || !payload.product || !Array.isArray(payload.variants)) {
          console.log(`[${requestId}] Invalid payload structure`);
          return err("Payload inválido: se requiere { product, variants[] }", 400);
        }
        
        console.log(`[${requestId}] Product data:`, {
          name: payload.product?.name,
          slug: payload.product?.slug,
          store: payload.product?.store,
          variantsCount: payload.variants?.length
        });

        // Validaciones mínimas
        const name = String(payload.product?.name ?? "").trim();
        const slug = String(payload.product?.slug ?? "").trim();
        const store = String(payload.product?.store ?? "CH+").trim();
        
        console.log(`[${requestId}] Validation: name='${name}', slug='${slug}', store='${store}', variants=${payload.variants.length}`);
        
        if (!name || !slug) {
          console.log(`[${requestId}] Validation failed: missing name or slug`);
          return err("name y slug son obligatorios en product", 400);
        }
        if (payload.variants.length < 1) {
          console.log(`[${requestId}] Validation failed: no variants provided`);
          return err("Se requiere al menos una variante", 400);
        }
        if (store !== "CH+" && store !== "MoveOn") {
          console.log(`[${requestId}] Validation failed: invalid store value '${store}'`);
          return err("store debe ser 'CH+' o 'MoveOn'", 400);
        }

        console.log(`[${requestId}] Calling create_product_with_variants RPC`);
        const { data, error } = await s.rpc("create_product_with_variants", { p_payload: payload });
        if (error) {
          console.error(`[${requestId}] RPC error in create_product_with_variants:`, error);
          return mapPgErr(error);
        }
        console.log(`[${requestId}] Product created successfully:`, data);
        return json({ ok: true, data }, 201);
      }

      // PUT /products/:id  (update parcial)
      if (method === "PUT" && parts[0] === "products" && parts[1] && parts[2] !== "variants") {
        const productId = parts[1];
        console.log(`[${requestId}] Processing PUT /products/${productId}`);
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== "object") {
          console.log(`[${requestId}] Invalid JSON body`);
          return err("JSON inválido", 400);
        }
        
        console.log(`[${requestId}] Update data:`, body);

        // Validar store si se proporciona
        if (body.store !== undefined) {
          const store = String(body.store ?? "").trim();
          console.log(`[${requestId}] Validating store field: '${store}'`);
          if (store !== "CH+" && store !== "MoveOn") {
            console.log(`[${requestId}] Store validation failed: invalid value '${store}'`);
            return err("store debe ser 'CH+' o 'MoveOn'", 400);
          }
        }

        const { data, error } = await s
          .from("products")
          .update(body)
          .eq("id", productId)
          .select(
            `
            id, name, slug, description, long_description, images, features, ingredients,
            nutrition_facts, tags, seo_title, seo_description, is_featured, is_active, store,
            created_at, updated_at, deleted_at,
            category:categories(id, name)
          `,
          )
          .maybeSingle();

        if (error) {
          console.error(`[${requestId}] Database error in PUT /products/${productId}:`, error);
          return mapPgErr(error);
        }
        if (!data) {
          console.log(`[${requestId}] Product not found for update: ${productId}`);
          return err("Producto no encontrado", 404);
        }
        console.log(`[${requestId}] Product updated successfully: ${data.name}`);
        return json({ ok: true, data });
      }

      // DELETE /products/:id   (soft delete)
      if (method === "DELETE" && parts[0] === "products" && parts[1]) {
        const productId = parts[1];
        console.log(`[${requestId}] Processing DELETE /products/${productId}`);
        const { error } = await s
          .from("products")
          .update({ deleted_at: new Date().toISOString(), is_active: false })
          .eq("id", productId);

        if (error) {
          console.error(`[${requestId}] Database error in DELETE /products/${productId}:`, error);
          return mapPgErr(error);
        }
        console.log(`[${requestId}] Product soft deleted successfully: ${productId}`);
        return json({ ok: true });
      }

      // ---------------- VARIANTS ----------------

      // GET /products/:id/variants
      if (method === "GET" && parts[0] === "products" && parts[1] && parts[2] === "variants") {
        const productId = parts[1];
        console.log(`[${requestId}] Processing GET /products/${productId}/variants`);
        const { data, error } = await s
          .from("product_variants")
          .select(
            "id, product_id, sku, label, flavor, size, options, price_cents, compare_at_price_cents, currency, in_stock, low_stock_threshold, weight_grams, dimensions, images, position, is_default, is_active, created_at, updated_at, deleted_at",
          )
          .eq("product_id", productId)
          .is("deleted_at", null)
          .order("position", { ascending: true })
          .order("created_at", { ascending: true });

        if (error) {
          console.error(`[${requestId}] Database error in GET /products/${productId}/variants:`, error);
          return mapPgErr(error);
        }
        console.log(`[${requestId}] Retrieved ${data?.length || 0} variants for product ${productId}`);
        return json({ ok: true, data });
      }

      // POST /products/:id/variants  (crear variante)
      if (method === "POST" && parts[0] === "products" && parts[1] && parts[2] === "variants" && parts.length === 3) {
        const productId = parts[1];
        console.log(`[${requestId}] Processing POST /products/${productId}/variants`);
        const variant = await req.json().catch(() => null);
        if (!variant || typeof variant !== "object") {
          console.log(`[${requestId}] Invalid JSON body for variant`);
          return err("JSON inválido", 400);
        }

        console.log(`[${requestId}] Variant data:`, {
          sku: variant.sku,
          label: variant.label,
          price_cents: variant.price_cents,
          in_stock: variant.in_stock,
          is_default: variant.is_default
        });

        // Validaciones mínimas
        const sku = String(variant.sku ?? "").trim();
        const label = String(variant.label ?? "").trim();
        const price = Number(variant.price_cents ?? -1);
        const stock = Number(variant.in_stock ?? 0);
        
        console.log(`[${requestId}] Validation: sku='${sku}', label='${label}', price=${price}, stock=${stock}`);
        
        if (!sku || !label) {
          console.log(`[${requestId}] Validation failed: missing sku or label`);
          return err("sku y label son obligatorios", 400);
        }
        if (price < 0) {
          console.log(`[${requestId}] Validation failed: invalid price ${price}`);
          return err("price_cents debe ser >= 0", 400);
        }
        if (stock < 0) {
          console.log(`[${requestId}] Validation failed: invalid stock ${stock}`);
          return err("in_stock debe ser >= 0", 400);
        }

        // Si is_default=true, desmarcar otras del producto
        if (variant.is_default === true) {
          console.log(`[${requestId}] Setting variant as default, clearing other defaults for product ${productId}`);
          const { error: uAllErr } = await s
            .from("product_variants")
            .update({ is_default: false })
            .eq("product_id", productId)
            .is("deleted_at", null);
          if (uAllErr) {
            console.error(`[${requestId}] Error clearing default variants:`, uAllErr);
            return mapPgErr(uAllErr);
          }
        }

        const payload = { ...variant, product_id: productId };
        console.log(`[${requestId}] Inserting variant with payload:`, payload);
        const { data, error } = await s.from("product_variants").insert([payload]).select("*").maybeSingle();
        if (error) {
          console.error(`[${requestId}] Database error creating variant:`, error);
          return mapPgErr(error);
        }
        if (!data) {
          console.log(`[${requestId}] Failed to create variant - no data returned`);
          return err("No se pudo crear la variante", 400);
        }

        console.log(`[${requestId}] Variant created successfully: ${data.sku}`);
        
        // Asegurar 1 default
        console.log(`[${requestId}] Ensuring single default variant for product ${productId}`);
        await ensureSingleDefault(s, productId);

        return json({ ok: true, data }, 201);
      }

      // PUT /variants/:variantId
      if (method === "PUT" && parts[0] === "variants" && parts[1]) {
        const variantId = parts[1];
        console.log(`[${requestId}] Processing PUT /variants/${variantId}`);
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== "object") {
          console.log(`[${requestId}] Invalid JSON body for variant update`);
          return err("JSON inválido", 400);
        }
        
        console.log(`[${requestId}] Variant update data:`, body);

        // Necesitamos product_id para validar default luego
        const { data: prev, error: prevErr } = await s.from("product_variants").select("product_id").eq("id", variantId).maybeSingle();
        if (prevErr) {
          console.error(`[${requestId}] Error fetching variant for update:`, prevErr);
          return mapPgErr(prevErr);
        }
        if (!prev) {
          console.log(`[${requestId}] Variant not found: ${variantId}`);
          return err("Variante no encontrada", 404);
        }
        const productId = prev.product_id as string;
        console.log(`[${requestId}] Updating variant ${variantId} for product ${productId}`);

        // Si setean is_default=true, desmarcar las demás antes
        if (body.is_default === true) {
          console.log(`[${requestId}] Setting variant as default, clearing other defaults for product ${productId}`);
          const { error: uAllErr } = await s
            .from("product_variants")
            .update({ is_default: false })
            .eq("product_id", productId)
            .is("deleted_at", null);
          if (uAllErr) {
            console.error(`[${requestId}] Error clearing default variants:`, uAllErr);
            return mapPgErr(uAllErr);
          }
        }

        const { data, error } = await s.from("product_variants").update(body).eq("id", variantId).select("*").maybeSingle();
        if (error) {
          console.error(`[${requestId}] Database error updating variant:`, error);
          return mapPgErr(error);
        }
        if (!data) {
          console.log(`[${requestId}] Variant not found after update: ${variantId}`);
          return err("Variante no encontrada", 404);
        }

        console.log(`[${requestId}] Variant updated successfully: ${data.sku}`);
        
        // Asegurar 1 default
        console.log(`[${requestId}] Ensuring single default variant for product ${productId}`);
        await ensureSingleDefault(s, productId);

        return json({ ok: true, data });
      }

      // DELETE /variants/:variantId  (soft delete)
      if (method === "DELETE" && parts[0] === "variants" && parts[1]) {
        const variantId = parts[1];
        console.log(`[${requestId}] Processing DELETE /variants/${variantId}`);

        const { data: prev, error: prevErr } = await s
          .from("product_variants")
          .select("product_id, is_default")
          .eq("id", variantId)
          .maybeSingle();
        if (prevErr) {
          console.error(`[${requestId}] Error fetching variant for deletion:`, prevErr);
          return mapPgErr(prevErr);
        }
        if (!prev) {
          console.log(`[${requestId}] Variant not found for deletion: ${variantId}`);
          return err("Variante no encontrada", 404);
        }
        const productId = prev.product_id as string;
        console.log(`[${requestId}] Deleting variant ${variantId} from product ${productId}, was_default: ${prev.is_default}`);

        const { error } = await s
          .from("product_variants")
          .update({ deleted_at: new Date().toISOString(), is_active: false, is_default: false })
          .eq("id", variantId);
        if (error) {
          console.error(`[${requestId}] Database error deleting variant:`, error);
          return mapPgErr(error);
        }

        console.log(`[${requestId}] Variant soft deleted successfully: ${variantId}`);
        
        // Asegurar 1 default
        console.log(`[${requestId}] Ensuring single default variant for product ${productId}`);
        await ensureSingleDefault(s, productId);

        return json({ ok: true });
      }

      // ------------- Fallback -------------
      console.log(`[${requestId}] Unsupported route: ${method} ${url.pathname}`);
      return err(`Ruta no soportada: ${method} ${url.pathname}`, 405, {
        supported: [
          "GET /products/list",
          "GET /products/:id",
          "POST /products",
          "PUT /products/:id",
          "DELETE /products/:id",
          "GET /products/:id/variants",
          "POST /products/:id/variants",
          "PUT /variants/:variantId",
          "DELETE /variants/:variantId",
        ],
      });
    } catch (e) {
      const executionTime = Date.now() - startTime;
      console.error(`[${requestId}] Unexpected server error after ${executionTime}ms:`, e);
      const details = e instanceof Error ? e.message : "Error desconocido";
      return json({ ok: false, error: "Error interno del servidor", details, timestamp: new Date().toISOString() }, 500);
    } finally {
      const executionTime = Date.now() - startTime;
      console.log(`[${requestId}] Request completed in ${executionTime}ms`);
    }
  },
  { onError: (e) => console.error(e) },
);
