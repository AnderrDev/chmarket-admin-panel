import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept, origin, x-requested-with',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Max-Age': '86400',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate required environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ 
          error: 'Configuración de Supabase incompleta',
          details: 'Faltan variables de entorno SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Create Supabase client with service role key
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    const { method, url } = req
    const urlObj = new URL(url)
    const path = urlObj.pathname.split('/').pop()

    // Get all discounts
    if (method === 'GET' && path === 'list') {
      try {
        const { data, error } = await supabaseClient
          .from('discount_codes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching discounts:', error)
          return new Response(
            JSON.stringify({ 
              error: 'Error al obtener cupones',
              details: error.message,
              code: error.code 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }

        return new Response(
          JSON.stringify({ data, error: null }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } catch (fetchError) {
        console.error('Unexpected error fetching discounts:', fetchError)
        return new Response(
          JSON.stringify({ 
            error: 'Error inesperado al obtener cupones',
            details: fetchError instanceof Error ? fetchError.message : 'Error desconocido'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }
    }

    // Get discount by ID
    if (method === 'GET' && path !== 'list') {
      try {
        const discountId = path
        if (!discountId || discountId === '') {
          return new Response(
            JSON.stringify({ 
              error: 'ID de cupón requerido',
              details: 'El ID del cupón no puede estar vacío'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }

        const { data, error } = await supabaseClient
          .from('discount_codes')
          .select('*')
          .eq('id', discountId)
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            return new Response(
              JSON.stringify({ 
                error: 'Cupón no encontrado',
                details: `No se encontró un cupón con el ID: ${discountId}`,
                code: error.code 
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404 
              }
            )
          }
          
          console.error('Error fetching discount:', error)
          return new Response(
            JSON.stringify({ 
              error: 'Error al obtener cupón',
              details: error.message,
              code: error.code 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }

        return new Response(
          JSON.stringify({ data, error: null }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } catch (fetchError) {
        console.error('Unexpected error fetching discount:', fetchError)
        return new Response(
          JSON.stringify({ 
            error: 'Error inesperado al obtener cupón',
            details: fetchError instanceof Error ? fetchError.message : 'Error desconocido'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }
    }

    // Create discount
    if (method === 'POST' && path === 'create') {
      try {
        const discountData = await req.json()
        
        if (!discountData || Object.keys(discountData).length === 0) {
          return new Response(
            JSON.stringify({ 
              error: 'Datos de cupón requeridos',
              details: 'El cuerpo de la solicitud debe contener los datos del cupón'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }

        const { data, error } = await supabaseClient
          .from('discount_codes')
          .insert([discountData])
          .select()
          .single()

        if (error) {
          console.error('Error creating discount:', error)
          return new Response(
            JSON.stringify({ 
              error: 'Error al crear cupón',
              details: error.message,
              code: error.code 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }

        return new Response(
          JSON.stringify({ data, error: null }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 201 
          }
        )
      } catch (parseError) {
        console.error('Error parsing request body:', parseError)
        return new Response(
          JSON.stringify({ 
            error: 'Error al procesar datos de la solicitud',
            details: 'El cuerpo de la solicitud no es un JSON válido'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }
    }

    // Update discount
    if (method === 'PUT') {
      try {
        const body = await req.json()
        const { discountId, discountData } = body
        
        if (!discountId || !discountData) {
          return new Response(
            JSON.stringify({ 
              error: 'Datos requeridos faltantes',
              details: 'Se requiere discountId y discountData para actualizar el cupón'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }

        const { data, error } = await supabaseClient
          .from('discount_codes')
          .update(discountData)
          .eq('id', discountId)
          .select()
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            return new Response(
              JSON.stringify({ 
                error: 'Cupón no encontrado',
                details: `No se encontró un cupón con el ID: ${discountId}`,
                code: error.code 
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404 
              }
            )
          }
          
          console.error('Error updating discount:', error)
          return new Response(
            JSON.stringify({ 
              error: 'Error al actualizar cupón',
              details: error.message,
              code: error.code 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }

        return new Response(
          JSON.stringify({ data, error: null }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } catch (parseError) {
        console.error('Error parsing request body:', parseError)
        return new Response(
          JSON.stringify({ 
            error: 'Error al procesar datos de la solicitud',
            details: 'El cuerpo de la solicitud no es un JSON válido'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }
    }

    // Delete discount
    if (method === 'DELETE') {
      try {
        const body = await req.json()
        const { discountId } = body
        
        if (!discountId) {
          return new Response(
            JSON.stringify({ 
              error: 'ID de cupón requerido',
              details: 'Se requiere discountId para eliminar el cupón'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }

        const { error } = await supabaseClient
          .from('discount_codes')
          .delete()
          .eq('id', discountId)

        if (error) {
          console.error('Error deleting discount:', error)
          return new Response(
            JSON.stringify({ 
              error: 'Error al eliminar cupón',
              details: error.message,
              code: error.code 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }

        return new Response(
          JSON.stringify({ data: { success: true }, error: null }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } catch (parseError) {
        console.error('Error parsing request body:', parseError)
        return new Response(
          JSON.stringify({ 
            error: 'Error al procesar datos de la solicitud',
            details: 'El cuerpo de la solicitud no es un JSON válido'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }
    }

    // Toggle discount status
    if (method === 'PATCH' && path === 'toggle-status') {
      try {
        const body = await req.json()
        const { discountId, isActive } = body
        
        if (!discountId || isActive === undefined) {
          return new Response(
            JSON.stringify({ 
              error: 'Datos requeridos faltantes',
              details: 'Se requiere discountId e isActive para cambiar el estado del cupón'
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }

        const { data, error } = await supabaseClient
          .from('discount_codes')
          .update({ is_active: isActive })
          .eq('id', discountId)
          .select()
          .single()

        if (error) {
          if (error.code === 'PGRST116') {
            return new Response(
              JSON.stringify({ 
                error: 'Cupón no encontrado',
                details: `No se encontró un cupón con el ID: ${discountId}`,
                code: error.code 
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404 
              }
            )
          }
          
          console.error('Error toggling discount status:', error)
          return new Response(
            JSON.stringify({ 
              error: 'Error al cambiar estado del cupón',
              details: error.message,
              code: error.code 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }

        return new Response(
          JSON.stringify({ data, error: null }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } catch (parseError) {
        console.error('Error parsing request body:', parseError)
        return new Response(
          JSON.stringify({ 
            error: 'Error al procesar datos de la solicitud',
            details: 'El cuerpo de la solicitud no es un JSON válido'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }
    }

    // Get active discounts
    if (method === 'GET' && path === 'active') {
      try {
        const { data, error } = await supabaseClient
          .from('discount_codes')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching active discounts:', error)
          return new Response(
            JSON.stringify({ 
              error: 'Error al obtener cupones activos',
              details: error.message,
              code: error.code 
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400 
            }
          )
        }

        return new Response(
          JSON.stringify({ data, error: null }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        )
      } catch (fetchError) {
        console.error('Unexpected error fetching active discounts:', fetchError)
        return new Response(
          JSON.stringify({ 
            error: 'Error inesperado al obtener cupones activos',
            details: fetchError instanceof Error ? fetchError.message : 'Error desconocido'
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }
    }

    return new Response(
      JSON.stringify({ 
        error: 'Método no permitido',
        details: `El método ${method} no está soportado para esta ruta`,
        supportedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    )

  } catch (error) {
    console.error('Unexpected server error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
