# Base de Datos - Estructura Organizada

Esta carpeta contiene todos los elementos de base de datos organizados por tipo.

## Estructura

```
database/
├── functions/          # RPCs y funciones de base de datos
├── triggers/           # Triggers y funciones de trigger
├── views/              # Vistas de base de datos
└── README.md          # Este archivo
```

## Funciones (RPCs)

### `create_product_with_variants.sql`
- **Propósito**: Crear producto con variantes en una transacción
- **Parámetros**: `p_payload (jsonb)` - `{ product: {...}, variants: [...] }`
- **Retorna**: `{ product_id: uuid, variant_ids: uuid[] }`
- **Uso**: Endpoint POST /products

### `product_upsert_full.sql`
- **Propósito**: Upsert completo de producto con variantes
- **Parámetros**: `p_payload (jsonb)`, `p_prune_missing (boolean)`
- **Retorna**: `uuid (product_id)`
- **Uso**: Actualización masiva de productos

### `decrement_inventory_safe.sql`
- **Propósito**: Decrementar inventario de forma segura
- **Parámetros**: `p_variant_id (uuid)`, `p_qty (int)`
- **Retorna**: `void`
- **Uso**: Procesamiento de órdenes

## Triggers

### `normalize_slug.sql`
- **Tabla**: `products`
- **Propósito**: Normalizar slugs (lowercase, guiones)
- **Evento**: BEFORE INSERT/UPDATE

### `normalize_sku.sql`
- **Tabla**: `product_variants`
- **Propósito**: Normalizar SKUs (uppercase, guiones)
- **Evento**: BEFORE INSERT/UPDATE

### `set_updated_at.sql`
- **Tablas**: `products`, `product_variants`, `orders`
- **Propósito**: Actualizar automáticamente `updated_at`
- **Evento**: BEFORE UPDATE

### `uppercase_code.sql`
- **Tabla**: `discount_codes`
- **Propósito**: Convertir códigos a mayúsculas
- **Evento**: BEFORE INSERT/UPDATE

### `validate_discount_code.sql`
- **Tabla**: `discount_codes`
- **Propósito**: Validar consistencia de campos de descuento
- **Evento**: BEFORE INSERT/UPDATE

### `sync_total_cents.sql`
- **Tabla**: `orders`
- **Propósito**: Calcular automáticamente el total de la orden
- **Evento**: BEFORE INSERT/UPDATE

## Vistas

### `catalog.sql`
- **Propósito**: Vista principal del catálogo
- **Incluye**: Productos, variantes, categorías, precios, stock
- **Uso**: Frontend, API de catálogo

## Cómo usar

### Para aplicar todo:
```sql
-- Aplicar todas las funciones
\i functions/create_product_with_variants.sql
\i functions/product_upsert_full.sql
\i functions/decrement_inventory_safe.sql

-- Aplicar todos los triggers
\i triggers/normalize_slug.sql
\i triggers/normalize_sku.sql
\i triggers/set_updated_at.sql
\i triggers/uppercase_code.sql
\i triggers/validate_discount_code.sql
\i triggers/sync_total_cents.sql

-- Aplicar todas las vistas
\i views/catalog.sql
```

### Para aplicar individualmente:
```sql
\i database/functions/create_product_with_variants.sql
```

## Notas importantes

1. **Campo `store`**: Todas las funciones han sido actualizadas para manejar el campo `store`
2. **Permisos**: Todas las funciones tienen permisos para `service_role`
3. **Transacciones**: Las funciones están diseñadas para ser atómicas
4. **Validaciones**: Incluyen validaciones de datos y consistencia

## Mantenimiento

- **Agregar nueva función**: Crear archivo en `functions/`
- **Agregar nuevo trigger**: Crear archivo en `triggers/`
- **Agregar nueva vista**: Crear archivo en `views/`
- **Actualizar documentación**: Modificar este README
