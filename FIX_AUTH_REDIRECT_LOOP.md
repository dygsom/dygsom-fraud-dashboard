# Fix: Loop de Redirección en Autenticación

**Fecha:** 2025-11-27
**Estado:** ✅ Resuelto

---

## Problema Reportado

Al hacer login, el usuario era redireccionado a `/login?redirect=%2F` con pantalla en blanco, creando un loop de redirección infinito.

---

## Causa Raíz

**Desajuste de arquitectura entre el Middleware y el AuthContext:**

### Antes del Fix:

1. **AuthContext** guardaba el token en `localStorage`:
   ```typescript
   storage.setItem(AUTH_CONFIG.tokenStorageKey, response.access_token);
   ```

2. **Middleware** buscaba el token en `cookies`:
   ```typescript
   const token = request.cookies.get(AUTH_CONFIG.tokenStorageKey);
   ```

### Resultado:
- Usuario hace login → Token se guarda en localStorage ✅
- Router redirige a `/` (dashboard)
- Middleware intercepta → Busca token en cookies ❌
- No encuentra token → Redirige a `/login?redirect=%2F`
- **Loop infinito** 🔄

---

## Solución Implementada

Modificar el **AuthContext** para guardar el token tanto en **localStorage** como en **cookies**:

### 1. Login (AuthContext.tsx)
```typescript
// Store token in localStorage
storage.setItem(AUTH_CONFIG.tokenStorageKey, response.access_token);

// Store token in cookies for middleware
document.cookie = `${AUTH_CONFIG.tokenStorageKey}=${response.access_token}; path=/; max-age=${AUTH_CONFIG.tokenExpiryHours * 3600}`;
```

### 2. Signup (AuthContext.tsx)
```typescript
// Store token in localStorage
storage.setItem(AUTH_CONFIG.tokenStorageKey, response.access_token);

// Store token in cookies for middleware
document.cookie = `${AUTH_CONFIG.tokenStorageKey}=${response.access_token}; path=/; max-age=${AUTH_CONFIG.tokenExpiryHours * 3600}`;
```

### 3. Logout (AuthContext.tsx)
```typescript
// Clear token from localStorage
storage.removeItem(AUTH_CONFIG.tokenStorageKey);

// Clear token from cookies
document.cookie = `${AUTH_CONFIG.tokenStorageKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
```

### 4. Error 401 (api/client.ts)
```typescript
// Clear token from localStorage
storage.removeItem(AUTH_CONFIG.tokenStorageKey);

// Clear token from cookies
if (typeof document !== 'undefined') {
  document.cookie = `${AUTH_CONFIG.tokenStorageKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
```

### 5. Auth Init Error (AuthContext.tsx)
```typescript
// Clear invalid token from localStorage
storage.removeItem(AUTH_CONFIG.tokenStorageKey);

// Clear invalid token from cookies
document.cookie = `${AUTH_CONFIG.tokenStorageKey}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
```

---

## Flujo de Autenticación Corregido

### Login Exitoso:
1. Usuario ingresa credenciales → POST `/api/v1/auth/login`
2. Backend retorna JWT token
3. **AuthContext guarda token:**
   - ✅ En `localStorage` (para API client)
   - ✅ En `cookies` (para Middleware)
4. Router redirige a `/`
5. **Middleware intercepta:**
   - ✅ Encuentra token en cookies
   - ✅ Permite acceso al dashboard
6. Usuario ve el dashboard 🎉

### Logout:
1. Usuario hace click en Logout
2. **AuthContext limpia token:**
   - ✅ De `localStorage`
   - ✅ De `cookies`
3. Router redirige a `/login`

### Error 401 (Token Inválido):
1. API retorna 401 Unauthorized
2. **API Client limpia token:**
   - ✅ De `localStorage`
   - ✅ De `cookies`
3. Redirige a `/login`

---

## Por Qué Esta Solución

### Opción A (Implementada): Dual Storage
- **Pros:**
  - Middleware funciona sin cambios
  - Token disponible para API client
  - Server-side protection eficiente
  - HttpOnly cookies posible en futuro
- **Contras:**
  - Token duplicado (mínimo overhead)

### Opción B (Descartada): Solo localStorage
- **Pros:**
  - Storage único
- **Contras:**
  - Middleware no puede acceder a localStorage
  - Menos seguro (XSS attacks)

### Opción C (Descartada): Deshabilitar Middleware
- **Pros:**
  - Simplicidad
- **Contras:**
  - Sin protección server-side
  - Flash de contenido protegido
  - Peor experiencia de usuario

---

## Archivos Modificados

1. ✅ `context/AuthContext.tsx` - Login, Signup, Logout, Init error
2. ✅ `lib/api/client.ts` - Error 401 handler

---

## Validación

### Pasos para Validar el Fix:

1. **Limpiar datos anteriores:**
   ```bash
   # En DevTools → Application → Storage → Clear site data
   ```

2. **Reiniciar dashboard:**
   ```bash
   cd dygsom-fraud-dashboard
   npm run dev
   ```

3. **Probar login:**
   - Ir a `http://localhost:3001/login`
   - Ingresar credenciales: `admin@dygsom.com` / `SecurePass123`
   - Hacer click en "Sign In"
   - ✅ Debe redirigir al dashboard (no a login)
   - ✅ Debe mostrar el dashboard con datos

4. **Verificar cookies:**
   - DevTools → Application → Cookies → `http://localhost:3001`
   - ✅ Debe haber una cookie `dygsom_auth_token` con el JWT

5. **Probar logout:**
   - Click en botón "Logout"
   - ✅ Debe redirigir a `/login`
   - ✅ Cookie debe desaparecer

6. **Probar protección de rutas:**
   - Sin login, intentar acceder a `http://localhost:3001/`
   - ✅ Debe redirigir a `/login`

---

## Cookie Configuration

### Configuración Actual (Desarrollo):
```typescript
document.cookie = `${AUTH_CONFIG.tokenStorageKey}=${token}; path=/; max-age=${AUTH_CONFIG.tokenExpiryHours * 3600}`;
```

- **path=/**: Cookie disponible en toda la app
- **max-age**: Expiración en segundos (24h default)
- **No HttpOnly**: Accesible desde JavaScript (para desarrollo)
- **No Secure**: Funciona en HTTP (para desarrollo local)

### Recomendado para Producción:
```typescript
document.cookie = `${AUTH_CONFIG.tokenStorageKey}=${token}; path=/; max-age=${AUTH_CONFIG.tokenExpiryHours * 3600}; Secure; HttpOnly; SameSite=Strict`;
```

- **Secure**: Solo HTTPS
- **HttpOnly**: No accesible desde JavaScript (más seguro)
- **SameSite=Strict**: Protección CSRF

---

## Build Status

✅ **Build exitoso después del fix:**

```
✓ Compiled successfully
✓ Generating static pages (10/10)

Route (app)                              Size     First Load JS
┌ ○ /                                    1.99 kB         141 kB
├ ○ /login                               3.31 kB         141 kB
├ ○ /signup                              3.49 kB         141 kB
└ ○ /transactions                        1.81 kB         141 kB

ƒ Middleware                             27.2 kB
```

---

## Conclusión

✅ **Problema resuelto**
✅ **Build exitoso**
✅ **Arquitectura corregida**
✅ **Listo para validación del usuario**

El token ahora se almacena correctamente en ambos lugares (localStorage y cookies), permitiendo que tanto el API client como el Middleware funcionen correctamente.

---

**Próximo Paso:** Usuario debe validar el login funcional
