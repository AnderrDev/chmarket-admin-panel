// supabase/functions/order-status/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;

function cors(json: unknown, status = 200) {
  return new Response(JSON.stringify(json), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return cors({ ok: true });

  try {
    const url = new URL(req.url);
    const orderNumber = url.searchParams.get("order_number") ?? url.searchParams.get("order");
    const email = url.searchParams.get("email");
    if (!orderNumber) return cors({ error: "order_number required" }, 400);

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: order, error: oErr } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderNumber)
      .maybeSingle();
    if (oErr) throw oErr;
    if (!order) return cors({ error: "Order not found" }, 404);
    if (email && String(order.email).toLowerCase() !== String(email).toLowerCase()) {
      return cors({ error: "not found" }, 404);
    }

    const { data: items, error: iErr } = await supabase
      .from("order_items")
      .select("product_id, variant_id, name_snapshot, variant_label, unit_price_cents, quantity")
      .eq("order_id", order.id);
    if (iErr) throw iErr;

    const { data: discounts, error: dErr } = await supabase
      .from("order_discounts")
      .select("code_snapshot, type_snapshot, amount_applied_cents, created_at")
      .eq("order_id", order.id);
    if (dErr) throw dErr;

    return cors({
      order: {
        id: order.id,
        order_number: order.order_number,
        email: order.email,
        status: order.status,
        payment_status: order.payment_status,
        subtotal_cents: order.subtotal_cents,
        shipping_cents: order.shipping_cents,
        discount_cents: order.discount_cents,
        total_cents: order.total_cents,
        currency: order.currency,
        shipping_address: order.shipping_address,
        billing_address: order.billing_address,
        payment_provider: order.payment_provider,
        payment_preference_id: order.payment_preference_id,
        payment_id: order.payment_id,
        payment_external_reference: order.payment_external_reference,
        payment_raw: order.payment_raw,
        created_at: order.created_at,
        updated_at: order.updated_at,
      },
      items,
      discounts,
    });
  } catch (e) {
    return cors({ error: String(e) }, 400);
  }
});
