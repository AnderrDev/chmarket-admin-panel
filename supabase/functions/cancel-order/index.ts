// supabase/functions/cancel-order/index.ts
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

function cors(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers':
        'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return cors({ ok: true });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const body = await req.json().catch(() => ({}));
    const { order_id } = body;

    if (!order_id) {
      return cors(
        {
          error: 'ID de orden requerido',
          detail: 'Se requiere order_id para cancelar la orden',
        },
        400
      );
    }

    // Verificar que la orden existe y no está pagada
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status, payment_status')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return cors(
        {
          error: 'Orden no encontrada',
          detail: 'La orden especificada no existe',
        },
        404
      );
    }

    if (order.status === 'PAID') {
      return cors(
        {
          error: 'Orden ya pagada',
          detail: 'No se puede cancelar una orden que ya está pagada',
        },
        400
      );
    }

    // Liberar reservas de cupones
    const { data: reservations } = await supabase
      .from('coupon_reservations')
      .select('discount_id')
      .eq('order_id', order_id);

    if (reservations && reservations.length > 0) {
      console.log('🎫 Liberando reservas de cupones:', reservations.length);

      for (const reservation of reservations) {
        try {
          await supabase.rpc('release_coupon_reservation', {
            p_order_id: order_id,
            p_discount_id: reservation.discount_id,
          });
          console.log(
            `✅ Reserva liberada para cupón ${reservation.discount_id}`
          );
        } catch (error) {
          console.error(
            `❌ Error liberando reserva para cupón ${reservation.discount_id}:`,
            error
          );
        }
      }
    }

    // Marcar orden como cancelada
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'CANCELLED',
        payment_status: 'CANCELLED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (updateError) {
      return cors(
        {
          error: 'Error cancelando orden',
          detail: updateError.message || String(updateError),
        },
        500
      );
    }

    return cors({
      success: true,
      message: 'Orden cancelada exitosamente',
      order_id,
      reservations_liberated: reservations?.length || 0,
    });
  } catch (error) {
    console.error('Error inesperado:', error);
    return cors(
      {
        error: 'Error interno del servidor',
        detail: error instanceof Error ? error.message : 'Error desconocido',
      },
      500
    );
  }
});
