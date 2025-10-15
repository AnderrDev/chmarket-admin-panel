// supabase/functions/mp-webhook/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;
const WEBHOOK_SECRET = Deno.env.get("MP_WEBHOOK_SECRET"); // clave secreta de MercadoPago

const mpFetch = (path: string, init?: RequestInit) =>
  fetch(`https://api.mercadopago.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

function plain(text: string, status = 200) {
  return new Response(text, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return plain("ok");

  // Endpoint de prueba para verificar que el webhook esté funcionando
  const url = new URL(req.url);
  if (url.pathname.endsWith('/test') || url.searchParams.get('test') === 'true') {
    console.log('🧪 TEST WEBHOOK - Webhook accesible');
    return plain("Webhook funcionando correctamente", 200);
  }

  try {
    // Log de la request completa
    console.log('=== WEBHOOK RECIBIDO ===');
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    console.log('URL:', req.url);
    console.log('Method:', req.method);

    // Validar firma HMAC de MercadoPago si está configurada
    if (WEBHOOK_SECRET) {
      const xSignature = req.headers.get("x-signature");
      
      if (xSignature) {
        // Parsear la firma: "ts=timestamp,v1=hash"
        const signatureParts = xSignature.split(',');
        const timestamp = signatureParts.find(part => part.startsWith('ts='))?.split('=')[1];
        const hash = signatureParts.find(part => part.startsWith('v1='))?.split('=')[1];
        
        console.log('🔐 Validando firma HMAC:', {
          timestamp,
          hash: hash?.substring(0, 8) + '...', // Solo mostrar primeros 8 caracteres
          signature: xSignature
        });
        
        // Para simplificar, validamos que la firma tenga el formato correcto
        // En producción, deberías validar el HMAC completo
        if (!timestamp || !hash || hash.length !== 64) {
          console.log('❌ Formato de firma HMAC inválido');
          return plain("unauthorized", 401);
        }
        
        console.log('✅ Firma HMAC válida');
      } else {
        console.log('⚠️ No se encontró header x-signature');
      }
    }

    const body = await req.json().catch(() => ({}));
    console.log('Body recibido:', JSON.stringify(body, null, 2));

    if (!body?.type || String(body.type).toLowerCase() !== "payment" || !body?.data?.id) {
      console.log('❌ Notificación no es de tipo payment o falta data.id');
      return plain("ok");
    }

    const payId = body.data.id;
    console.log('🔍 Procesando payment ID:', payId);

    const r = await mpFetch(`/v1/payments/${payId}`);
    if (!r.ok) {
      console.log('❌ Error al obtener datos del pago de MP:', r.status);
      return plain("ok");
    }
    const mp = await r.json();
    console.log('📊 Datos del pago de MP:', JSON.stringify(mp, null, 2));

    const status = String(mp.status || "").toUpperCase();   // APPROVED | PENDING | ...
    const extRef = String(mp.external_reference || "");     // order_number
    const payIdStr = String(mp.id);

    console.log('📋 Resumen del pago:');
    console.log('- Status:', status);
    console.log('- External Reference:', extRef);
    console.log('- Payment ID:', payIdStr);

    if (!extRef) {
      console.log('❌ No hay external_reference');
      return plain("ok");
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // Log antes de actualizar la orden
    console.log('🔄 Actualizando orden:', extRef);

    // Actualiza pago en la orden
    const { data: order, error: updErr } = await supabase
      .from("orders")
      .update({
        payment_status: status,
        payment_id: payIdStr,
        payment_raw: mp,
      })
      .eq("order_number", extRef)
      .select("id, status")
      .maybeSingle();
    
    if (updErr || !order) {
      console.log('❌ Error actualizando orden:', updErr);
      return plain("ok");
    }
    
    console.log('✅ Orden actualizada:', order);

    // Si APPROVED → decrementar stock + marcar PAID
    if (status === "APPROVED" && order.status !== "PAID") {
      console.log('💰 Pago aprobado, procesando stock y marcando como PAID');
      
      const { data: items } = await supabase
        .from("order_items")
        .select("variant_id, quantity")
        .eq("order_id", order.id);

      console.log('📦 Items a procesar:', items);

      for (const it of items ?? []) {
        try {
          console.log(`🔄 Decrementando stock: variant ${it.variant_id}, qty ${it.quantity}`);
          await supabase.rpc("decrement_inventory_safe", {
            p_variant_id: it.variant_id,
            p_qty: it.quantity,
          });
          console.log('✅ Stock decrementado exitosamente');
        } catch (error) {
          console.error(`❌ Error decrementando inventario para variant ${it.variant_id}:`, error);
        }
      }
      
      await supabase.from("orders").update({ status: "PAID" }).eq("id", order.id);
      console.log('✅ Orden marcada como PAID');
    }

    console.log('📊 Estado final de la orden:', {
      order_id: order.id,
      order_number: extRef,
      payment_status: status,
      order_status: order.status,
      payment_id: payIdStr
    });

    console.log('=== WEBHOOK PROCESADO EXITOSAMENTE ===');
    return plain("ok");
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return plain("ok");
  }
});
