# DYGSOM Fraud Dashboard

**Version:** 1.0.0
**Framework:** Next.js 14 + TypeScript
**Status:** En Desarrollo - Base Configurada

Professional fraud detection dashboard for DYGSOM API.

---

## Stack Tecnológico

### Core
- **Next.js 14.2** - React framework con App Router
- **TypeScript 5.9** - Type safety
- **TailwindCSS 4.1** - Utility-first CSS
- **React 18.3** - UI library

### Librerías Principales
- **axios 1.13** - HTTP client con interceptors
- **zod 4.1** - Schema validation
- **react-hook-form 7.66** - Form management
- **recharts 3.5** - Charts library
- **date-fns 4.1** - Date utilities
- **lucide-react 0.555** - Icon library

### DevTools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **PostCSS** - CSS processing

---

## Estructura del Proyecto

```
dygsom-fraud-dashboard/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Public routes
│   ├── (dashboard)/       # Protected routes
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   ├── dashboard/        # Dashboard-specific
│   └── forms/            # Form components
├── lib/                  # Core libraries
│   ├── api/             # API client & endpoints
│   ├── utils/           # Utility functions
│   ├── logger.ts        # Logging system
│   └── storage.ts       # Secure storage
├── config/              # Configuration
│   ├── constants.ts     # App constants
│   ├── env.ts          # Env validation
│   └── routes.ts       # Route definitions
├── types/               # TypeScript types
├── hooks/               # Custom React hooks
├── context/             # React Context
└── middleware.ts        # Route protection
```

---

## Instalación y Setup

### 1. Instalar Dependencias

```bash
cd dygsom-fraud-dashboard
npm install
```

### 2. Configurar Variables de Entorno

```bash
# Ya está creado: .env.local
# Verificar que apunte al backend correcto:
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 3. Ejecutar en Desarrollo

```bash
npm run dev
```

Dashboard disponible en: **http://localhost:3001**

---

## Scripts Disponibles

```bash
# Desarrollo (puerto 3001)
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm start

# Linting
npm run lint

# Type checking
npm run type-check
```

---

## Configuración Completada

### ✅ Base del Proyecto
- [x] Next.js 14 instalado y configurado
- [x] TypeScript configurado con modo estricto
- [x] TailwindCSS configurado con tema profesional
- [x] ESLint configurado
- [x] Variables de entorno definidas
- [x] .gitignore configurado
- [x] Security headers configurados

### ✅ Dependencias Instaladas
- [x] Axios (HTTP client)
- [x] Zod (Validación)
- [x] React Hook Form (Formularios)
- [x] Recharts (Gráficos)
- [x] Date-fns (Fechas)
- [x] Lucide React (Iconos)
- [x] TailwindCSS Animate

### ✅ Estructura de Carpetas
- [x] app/ (App Router)
- [x] components/ (UI, layout, dashboard, forms)
- [x] lib/ (api, utils)
- [x] config/
- [x] types/
- [x] hooks/
- [x] context/

---

## Próximos Pasos de Implementación

### Fase 1: Configuración Core (1-2 horas)

**1. Config y Constantes** (`config/`)
```typescript
// config/constants.ts
export const APP_CONFIG = {
  name: 'DYGSOM Fraud Dashboard',
  version: '1.0.0',
  api: {
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    timeout: 30000
  }
}

// config/routes.ts
export const ROUTES = {
  public: {
    login: '/login',
    signup: '/signup'
  },
  protected: {
    dashboard: '/',
    transactions: '/transactions',
    apiKeys: '/api-keys'
  }
}
```

**2. Tipos TypeScript** (`types/`)
```typescript
// types/auth.ts
export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  organization: Organization
}

// types/api.ts
export interface ApiResponse<T> {
  data: T
  error?: ApiError
}
```

**3. Utilidades** (`lib/utils/`)
```typescript
// lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Fase 2: API Client y Logging (2 horas)

**1. API Client** (`lib/api/client.ts`)
```typescript
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor (add token)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('dygsom_auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor (handle errors)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

**2. Logger** (`lib/logger.ts`)
```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  private level: LogLevel = 'info'

  debug(message: string, ...args: any[]) {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args)
    }
  }

  error(message: string, error?: Error, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${message}`, error, ...args)
    }
  }
}

export const logger = new Logger()
```

### Fase 3: Autenticación (2-3 horas)

**1. Auth Context** (`context/AuthContext.tsx`)
```typescript
'use client'

import { createContext, useContext, useState } from 'react'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/api/v1/auth/login', {
      email,
      password
    })

    localStorage.setItem('dygsom_auth_token', response.data.access_token)
    setUser(response.data.user)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

**2. Middleware** (`middleware.ts`)
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')
  const { pathname } = request.nextUrl

  // Public routes
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return NextResponse.next()
  }

  // Protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

### Fase 4: Componentes UI Base (3-4 horas)

Crear componentes base en `components/ui/`:
- button.tsx
- card.tsx
- input.tsx
- label.tsx
- table.tsx
- dialog.tsx

### Fase 5: Páginas (4-6 horas)

**1. Login Page** (`app/(auth)/login/page.tsx`)
**2. Dashboard Overview** (`app/(dashboard)/page.tsx`)
**3. Transactions** (`app/(dashboard)/transactions/page.tsx`)
**4. API Keys** (`app/(dashboard)/api-keys/page.tsx`)

---

## Seguridad Implementada

### Headers de Seguridad
```javascript
// next.config.js
{
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=63072000',
  'Referrer-Policy': 'origin-when-cross-origin'
}
```

### Validación de Inputs
- Zod schemas para todos los formularios
- React Hook Form para manejo seguro

### Token Storage
- JWT en localStorage (desarrollo)
- HttpOnly cookies (producción recomendado)
- Expiración automática

---

## Conexión con Backend

El dashboard se conecta al backend FastAPI en:
```
http://localhost:3000
```

### Endpoints Utilizados
- POST `/api/v1/auth/login` - Login
- POST `/api/v1/auth/signup` - Signup
- GET `/api/v1/auth/me` - Usuario actual
- GET `/api/v1/dashboard/transactions` - Transacciones
- GET `/api/v1/dashboard/analytics/summary` - Analytics
- GET `/api/v1/dashboard/api-keys` - API keys

---

## Testing

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build test
npm run build
```

---

## Deployment

### Producción
```bash
npm run build
npm start
```

### Variables de Entorno (Producción)
```bash
NEXT_PUBLIC_API_BASE_URL=https://api.dygsom.com
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_LOG_LEVEL=error
```

---

## Documentación Adicional

- **Backend API:** Ver `../dygsom-fraud-api/docs/`
- **Progreso:** Ver `FRONTEND_PROGRESO.md`
- **Next.js:** https://nextjs.org/docs
- **TailwindCSS:** https://tailwindcss.com/docs

---

## Soporte

**Equipo:** DYGSOM Engineering
**Repositorio:** Private
**License:** Proprietary

---

**Estado:** Base configurada y lista para desarrollo
**Siguiente:** Implementar archivos core (config, types, api client)
**Tiempo estimado:** 8-12 horas para MVP completo
