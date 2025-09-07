# Configuración de Autenticación - Admin Panel

## Requisitos Previos

Para que funcione el sistema de autenticación, necesitas configurar Supabase con autenticación por email y contraseña.

## Pasos de Configuración

### 1. Configurar Supabase

1. Ve a tu proyecto de Supabase
2. Navega a **Authentication** > **Settings**
3. En **Auth Providers**, habilita **Email**
4. Deshabilita **Enable email confirmations** si quieres que los usuarios puedan iniciar sesión inmediatamente
5. En **Site URL**, agrega tu URL del admin panel (ej: `http://localhost:5173`)

### 2. Crear Usuario Admin

1. Ve a **Authentication** > **Users**
2. Haz clic en **Add User**
3. Completa:
   - **Email**: admin@chplus.com (o el email que prefieras)
   - **Password**: Una contraseña segura
   - **User Metadata**: Puedes agregar `{"role": "admin"}`

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 4. Políticas de Seguridad (Opcional)

Si quieres agregar seguridad adicional, puedes crear políticas RLS en Supabase:

```sql
-- Ejemplo de política para solo permitir acceso a usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden acceder" ON tu_tabla
FOR ALL USING (auth.role() = 'authenticated');
```

## Uso

1. Inicia el proyecto: `npm run dev`
2. Ve a `/login`
3. Ingresa las credenciales del usuario admin
4. Serás redirigido al dashboard

## Características

- ✅ Autenticación por email y contraseña
- ✅ Protección de rutas automática
- ✅ Redirección automática a login si no hay sesión
- ✅ Botón de logout en el sidebar
- ✅ Persistencia de sesión
- ✅ Loading states durante la autenticación
- ✅ Manejo de errores con toast notifications

## Notas de Seguridad

- Las contraseñas se almacenan de forma segura en Supabase
- Las sesiones se manejan con JWT tokens
- El refresh token se renueva automáticamente
- Todas las rutas del admin están protegidas
