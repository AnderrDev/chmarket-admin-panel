# Edge Functions para Panel Administrativo CH+

Este directorio contiene las funciones Edge Functions necesarias para el panel administrativo de la tienda CH+. Estas funciones permiten acceder a la base de datos con permisos de `service_role`, evitando problemas de políticas RLS.

## 🚀 Funciones Disponibles

### 1. **admin-orders** - Gestión de Órdenes

**Endpoint base:** `/functions/v1/admin-orders`

#### Operaciones:
- `GET /list` - Obtener todas las órdenes
- `GET /{id}` - Obtener orden por ID
- `GET /{id}-items` - Obtener items de una orden
- `PATCH /` - Actualizar estado de orden
- `POST /by-status` - Obtener órdenes por estado
- `GET /stats` - Obtener estadísticas de órdenes

#### Ejemplo de uso:
```typescript
// Obtener todas las órdenes
const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-orders/list`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`
  }
})

// Actualizar estado de orden
const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-orders`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`
  },
  body: JSON.stringify({ orderId: 'uuid', status: 'PAID' })
})
```

### 2. **admin-products** - Gestión de Productos

**Endpoint base:** `/functions/v1/admin-products`

#### Operaciones:
- `GET /list` - Obtener todos los productos
- `GET /{id}` - Obtener producto por ID
- `POST /create` - Crear nuevo producto
- `PUT /` - Actualizar producto
- `DELETE /` - Eliminar producto
- `GET /{id}-variants` - Obtener variantes de un producto
- `POST /variant` - Crear nueva variante
- `PUT /variant` - Actualizar variante
- `DELETE /variant` - Eliminar variante

#### Ejemplo de uso:
```typescript
// Crear producto
const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-products/create`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`
  },
  body: JSON.stringify(productData)
})

// Obtener variantes de un producto
const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-products/${productId}-variants`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`
  }
})
```

### 3. **admin-discounts** - Gestión de Cupones

**Endpoint base:** `/functions/v1/admin-discounts`

#### Operaciones:
- `GET /list` - Obtener todos los cupones
- `GET /{id}` - Obtener cupón por ID
- `POST /create` - Crear nuevo cupón
- `PUT /` - Actualizar cupón
- `DELETE /` - Eliminar cupón
- `PATCH /toggle-status` - Cambiar estado del cupón
- `GET /active` - Obtener cupones activos

#### Ejemplo de uso:
```typescript
// Crear cupón
const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-discounts/create`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`
  },
  body: JSON.stringify(discountData)
})

// Cambiar estado del cupón
const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-discounts/toggle-status`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`
  },
  body: JSON.stringify({ discountId: 'uuid', isActive: false })
})
```

## 🔐 Seguridad

- **Service Role**: Todas las funciones usan la clave `SUPABASE_SERVICE_ROLE_KEY`
- **CORS**: Configurado para permitir acceso desde cualquier origen
- **Validación**: Los datos se validan antes de procesarse
- **Autenticación**: Requiere el header `Authorization` con la clave anónima
- **Manejo de Errores**: Errores descriptivos con códigos HTTP apropiados

## 🚀 Despliegue

### 1. **Configurar variables de entorno:**
```bash
supabase secrets set SUPABASE_URL=tu_url_de_supabase
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

### 2. **Desplegar funciones:**
```bash
# Desde el directorio raíz del proyecto
supabase functions deploy admin-orders
supabase functions deploy admin-products
supabase functions deploy admin-discounts
```

### 3. **Verificar despliegue:**
```bash
supabase functions list
```

## 📝 Notas Importantes

1. **Políticas RLS**: Estas funciones evitan las restricciones de RLS usando `service_role`
2. **CORS**: Configurado para permitir acceso desde el panel administrativo
3. **Manejo de errores**: Todas las funciones devuelven errores consistentes
4. **Logging**: Se recomienda agregar logging para producción
5. **Rate Limiting**: Considerar implementar rate limiting para producción

## 🚨 Manejo de Errores

### Estructura de Respuesta de Error:
```json
{
  "error": "Descripción del error en español",
  "details": "Detalles técnicos del error",
  "code": "Código de error de Supabase (si aplica)",
  "timestamp": "2024-01-01T00:00:00.000Z" // Solo en errores 500
}
```

### Códigos de Estado HTTP:
- **200**: Operación exitosa
- **201**: Recurso creado exitosamente
- **400**: Error de validación o datos incorrectos
- **404**: Recurso no encontrado
- **405**: Método HTTP no permitido
- **500**: Error interno del servidor

### Tipos de Errores:
- **Validación**: Datos requeridos faltantes o inválidos
- **Base de Datos**: Errores de Supabase con códigos específicos
- **Parsing**: JSON inválido en el cuerpo de la solicitud
- **Configuración**: Variables de entorno faltantes
- **Inesperados**: Errores no manejados específicamente

## 🔧 Desarrollo Local

Para probar las funciones localmente:

```bash
# Iniciar Supabase local
supabase start

# Ejecutar función específica
supabase functions serve admin-orders --env-file ./supabase/.env.local

# Probar función
curl -X GET "http://localhost:54321/functions/v1/admin-orders/list" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 📊 Monitoreo

- **Logs**: Revisar logs en Supabase Dashboard
- **Métricas**: Monitorear uso y rendimiento
- **Errores**: Configurar alertas para errores críticos
- **Performance**: Monitorear tiempos de respuesta
