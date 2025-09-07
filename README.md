# CH+ Admin Panel

Panel administrativo para la tienda de suplementos CH+. Este panel permite gestionar productos, órdenes, cupones y ver estadísticas de la tienda.

## 🚀 Características

- **Dashboard**: Resumen general con estadísticas de la tienda
- **Gestión de Productos**: Crear, editar, eliminar productos y sus variantes
- **Gestión de Órdenes**: Ver y actualizar el estado de las órdenes
- **Gestión de Cupones**: Crear y administrar códigos de descuento
- **Interfaz Responsiva**: Funciona en desktop y móvil
- **Tiempo Real**: Actualizaciones en tiempo real con Supabase

## 🛠️ Tecnologías

- **React 18** con TypeScript
- **Vite** para el bundling
- **Tailwind CSS** para estilos
- **Supabase** para la base de datos
- **React Router** para navegación
- **React Hook Form** para formularios
- **Lucide React** para iconos
- **React Hot Toast** para notificaciones

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   cd admin-panel
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp env.example .env
   ```
   
   Editar `.env` y agregar tus credenciales de Supabase:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

4. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3001
   ```

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── Layout.tsx      # Layout principal con navegación
├── hooks/              # Hooks personalizados
│   ├── useProducts.ts  # Gestión de productos
│   ├── useOrders.ts    # Gestión de órdenes
│   └── useDiscounts.ts # Gestión de cupones
├── pages/              # Páginas de la aplicación
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── Products.tsx    # Lista de productos
│   ├── ProductForm.tsx # Formulario de productos
│   ├── Orders.tsx      # Lista de órdenes
│   ├── OrderDetail.tsx # Detalle de orden
│   ├── Discounts.tsx   # Lista de cupones
│   └── DiscountForm.tsx # Formulario de cupones
├── lib/                # Configuraciones
│   └── supabase.ts     # Cliente de Supabase
├── types/              # Tipos TypeScript
│   └── index.ts        # Interfaces principales
├── utils/              # Utilidades
│   └── format.ts       # Funciones de formateo
├── App.tsx             # Componente principal
└── main.tsx            # Punto de entrada
```

## 📊 Funcionalidades

### Dashboard
- Estadísticas generales de la tienda
- Productos recientes
- Cupones activos
- Métricas de ventas

### Productos
- Lista de todos los productos
- Filtros por tipo y búsqueda
- Crear nuevos productos
- Editar productos existentes
- Eliminar productos
- Gestión de variantes

### Órdenes
- Lista de todas las órdenes
- Detalle de cada orden
- Actualizar estado de órdenes
- Ver items de cada orden

### Cupones
- Lista de códigos de descuento
- Crear nuevos cupones
- Editar cupones existentes
- Activar/desactivar cupones
- Configurar tipos de descuento

## 🔧 Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Construir para producción
- `npm run preview` - Previsualizar build de producción
- `npm run lint` - Ejecutar linter
- `npm run lint:fix` - Corregir errores de linting
- `npm run type-check` - Verificar tipos TypeScript

## 🚀 Despliegue

### Netlify
1. Conectar el repositorio a Netlify
2. Configurar variables de entorno en Netlify
3. Deploy automático en cada push

### Vercel
1. Conectar el repositorio a Vercel
2. Configurar variables de entorno
3. Deploy automático

## 🔐 Seguridad

- **Edge Functions**: El panel usa funciones Edge Functions específicas para evitar problemas de políticas RLS
- **Service Role**: Las funciones internas usan permisos de `service_role` para acceder a la base de datos
- **Validación**: Los datos se validan tanto en el frontend como en el backend
- **Autenticación**: Requiere la clave anónima de Supabase en los headers

## 🚀 Edge Functions

El panel administrativo utiliza Edge Functions de Supabase para acceder a la base de datos de manera segura:

### Funciones Disponibles:
- **admin-orders**: Gestión completa de órdenes
- **admin-products**: Gestión de productos y variantes
- **admin-discounts**: Gestión de cupones de descuento

### Ventajas:
- ✅ Evita problemas de políticas RLS
- ✅ Acceso seguro con `service_role`
- ✅ Funciones específicas para cada operación
- ✅ Mejor rendimiento y escalabilidad
- ✅ Manejo de errores descriptivo y detallado
- ✅ Códigos de estado HTTP apropiados

### Despliegue:
```bash
# Desplegar todas las funciones
supabase functions deploy admin-orders
supabase functions deploy admin-products
supabase functions deploy admin-discounts
```

## 📝 Notas

- Este panel está diseñado para funcionar con la base de datos existente de CH+
- No incluye sistema de autenticación (se puede agregar después)
- Las Edge Functions evitan problemas de políticas RLS
- El panel se ejecuta en el puerto 3001 para evitar conflictos

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
# chmarket-admin-panel
