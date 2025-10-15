// supabase/functions/validate-coupon/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;

function cors(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return cors({ ok: true });

  try {
    const body = await req.json().catch(() => ({}));
    const { code, subtotalCents } = body;

    if (!code) {
      return cors({ error: "Código de cupón requerido" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const couponCode = String(code).toUpperCase();

    // Buscar el cupón
    const { data: coupon, error } = await supabase
      .from("discount_codes")
      .select("*")
      .eq("code", couponCode)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      return cors({ error: "Error de base de datos", detail: error.message }, 400);
    }

    if (!coupon) {
      return cors({
        valid: false,
        message: "Código de cupón no válido",
      });
    }

    // Validar fecha de expiración
    const now = new Date();
    if (coupon.end_at && new Date(coupon.end_at) < now) {
      return cors({
        valid: false,
        message: "Cupón expirado",
      });
    }

    if (coupon.start_at && new Date(coupon.start_at) > now) {
      return cors({
        valid: false,
        message: "Cupón aún no está disponible",
      });
    }

    // Validar mínimo de compra
    if (subtotalCents && coupon.min_order_cents && subtotalCents < coupon.min_order_cents) {
      return cors({
        valid: false,
        message: `Mínimo de compra: $${(coupon.min_order_cents / 100).toLocaleString('es-CO')}`,
        minOrderCents: coupon.min_order_cents,
      });
    }

    // Calcular descuento
    let discountCents = 0;
    let discountMessage = "";

    if (coupon.type === "PERCENT") {
      discountCents = Math.floor((subtotalCents * Math.max(0, Math.min(100, coupon.value_percent ?? 0))) / 100);
      discountMessage = `${coupon.value_percent}% de descuento`;
    } else if (coupon.type === "FIXED") {
      discountCents = Math.max(0, Math.min(coupon.value_cents ?? 0, subtotalCents));
      discountMessage = `$${(coupon.value_cents / 100).toLocaleString('es-CO')} de descuento`;
    } else if (coupon.type === "FREE_SHIPPING") {
      discountMessage = "Envío gratis";
    }

    return cors({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value_percent: coupon.value_percent,
        value_cents: coupon.value_cents,
        min_order_cents: coupon.min_order_cents,
      },
      discountCents,
      discountMessage,
      message: `Cupón válido: ${discountMessage}`,
    });

  } catch (e: unknown) {
    const msg = (e && (e as Error).message) ? (e as Error).message : String(e);
    return cors({ error: "Error interno", detail: msg }, 400);
  }
});
