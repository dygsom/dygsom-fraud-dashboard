# DYGSOM Fraud Dashboard

**Version:** 1.0.0  
**Framework:** Next.js 14 + TypeScript  
**Status:** ✅ Operativo - Desarrollo Local  
**Repository:** https://github.com/dygsom/dygsom-fraud-dashboard  
**Última actualización:** 5 de diciembre de 2025

Dashboard web profesional para el sistema de detección de fraude DYGSOM. Interface de usuario moderna y responsiva que se conecta con la API de fraude para proporcionar monitoreo en tiempo real, gestión de transacciones y análisis de riesgo.

## 🚀 Quick Start

```bash
# Clonar repositorio
git clone https://github.com/dygsom/dygsom-fraud-dashboard.git
cd dygsom-fraud-dashboard

# Instalar dependencias
npm install

# Configurar entorno (copiar y editar)
cp .env.example .env.local

# Levantar API (requerida - ver documentación en dygsom-fraud-api)
cd ../dygsom-fraud-api
docker compose up -d

# Levantar dashboard
cd ../dygsom-fraud-dashboard  
npm run dev -- --port 3003

# Acceder dashboard: http://localhost:3003
# API docs: http://localhost:3000/docs
```

**Credenciales de desarrollo:**
- Email: `admin@dygsom.com`
- Password: `SecurePass123`

---

## Stack Tecnológico

### Core
- **Next.js 14.2** - React framework con App Router
- **TypeScript 5.9** - Type safety
- **TailwindCSS 4.1** - Utility-first CSS
- **React 18.3** - UI library

### Librerías Principales (Optimizadas)
- **axios 1.7** - HTTP client con interceptors
- **tailwindcss 3.4** - Utility-first CSS framework  
- **@tailwindcss/forms** - Form styling
- **class-variance-authority** - Conditional styling
- **clsx** - Class name utility

### Herramientas de Desarrollo
- **ESLint 8** - Code linting
- **TypeScript 5** - Static type checking
- **PostCSS** - CSS processing
- **Docker** - Containerización

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
│   ├── logger.ts        # Sistema de logging
│   └── storage.ts       # Almacenamiento seguro
├── config/              # Configuración
│   ├── constants.ts     # Constantes de la app
│   └── routes.ts        # Definición de rutas
├── types/               # Definiciones TypeScript
├── hooks/               # Custom React hooks
├── context/             # React Context (Auth)
├── cleanup-artifacts/   # Archivos eliminados
└── middleware.ts        # Protección de rutas
```

---

## 🛠️ Instalación y Setup

### Prerrequisitos
- **Node.js** 20.x o superior
- **Docker** y Docker Compose (para la API)
- **Git** para control de versiones

### 1. Clonar y Configurar

```bash
# Clonar repositorio  
git clone https://github.com/dygsom/dygsom-fraud-dashboard.git
cd dygsom-fraud-dashboard

# Instalar dependencias
npm install

# Verificar configuración
cat .env.local
```

### 2. Levantar API de Backend

> **Nota:** La API tiene su propia documentación completa en el repositorio `dygsom-fraud-api`

```bash
# Ir al proyecto API (repositorio separado)
cd ../dygsom-fraud-api

# Levantar servicios con Docker
docker compose up -d

# Verificar que funciona
# Ver documentación completa en dygsom-fraud-api/README.md
```

### 3. Ejecutar Dashboard

```bash
cd ../dygsom-fraud-dashboard

# Desarrollo (puerto por defecto 3001)
npm run dev

# O especificar puerto
npm run dev -- --port 3003
```

**URLs importantes:**
- **Dashboard:** http://localhost:3001 (o puerto especificado)
- **API:** http://localhost:3000
- **API Docs:** http://localhost:3000/docs

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

## 🏗️ Arquitectura y Estado

### Frontend Dashboard (Este Proyecto)
- ✅ **Interface Web** - Componentes React modernos
- ✅ **Autenticación** - Login/registro con JWT
- ✅ **Navegación** - Sidebar y header profesionales  
- ✅ **Dashboard** - Métricas y visualizaciones
- ✅ **Responsive Design** - Diseño adaptativo
- 🔄 **Analytics** - Reportes avanzados (en desarrollo)

### Backend API (Proyecto Separado)
> **Ver:** `dygsom-fraud-api` para documentación completa

- ✅ **FastAPI** - REST API con documentación automática
- ✅ **PostgreSQL** - Base de datos principal
- ✅ **Redis** - Cache y sesiones
- ✅ **Docker** - Containerización completa
- ✅ **ML Pipeline** - Detección de fraude con IA
- ✅ **Monitoreo** - Prometheus + Grafana

### Integración
- ✅ **HTTP Client** - Comunicación segura API ↔ Dashboard
- ✅ **Authentication** - JWT tokens compartidos
- ✅ **Error Handling** - Manejo centralizado de errores
- ✅ **Logging** - Sistema de logs unificado
- [x] Repositorio Git inicializado
- [x] .gitignore optimizado para Next.js
- [x] Commit inicial completado
- [x] Código subido a GitHub
- [x] Rama main configurada
- [x] context/

---

## ✅ Estado Actual (Diciembre 2025)

### Componentes Implementados
- [x] **Sidebar** - Navegación lateral completa
- [x] **Header** - Barra superior con branding  
- [x] **AuthContext** - Gestión de autenticación
- [x] **Layout** - Estructura principal del dashboard
- [x] **Login/Signup** - Formularios de autenticación
- [x] **Middleware** - Protección de rutas
- [x] **API Client** - Cliente HTTP optimizado

### Funcionalidades
- [x] **Autenticación JWT** completa
- [x] **Navegación lateral** funcional
---

## 🎯 Roadmap de Desarrollo

### Próximas Funcionalidades

#### Dashboard Analytics 📊
- Gráficos de tendencias de fraude
- Métricas KPI en tiempo real
- Reportes exportables (PDF/Excel)
- Dashboards personalizables por usuario

#### Gestión Completa de Transacciones 💳
- Lista paginada con filtros avanzados
- Vista detallada por transacción
- Historial y audit trail
- Búsqueda por múltiples criterios

#### Sistema de Alertas 🚨
- Notificaciones push en tiempo real
- Configuración de umbrales personalizables
- Integración email/SMS
- Centro de notificaciones

#### Tests y Calidad 🧪
- Tests unitarios (>80% coverage)
- Tests de integración
- Tests E2E con Playwright
- CI/CD pipeline automatizado

---

## 📚 Documentación Relacionada

### Proyectos Relacionados
- **[dygsom-fraud-api](../dygsom-fraud-api/README.md)** - Backend API con FastAPI
- **[dygsom-landing-page](../dygsom-landing-page/README.md)** - Landing page corporativa

### Enlaces Útiles
- **[STATUS_2025-12-05.md](./STATUS_2025-12-05.md)** - Estado detallado del proyecto
- **[Next.js Documentation](https://nextjs.org/docs)** - Framework documentation
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript guide
- **[TailwindCSS](https://tailwindcss.com/docs)** - CSS framework

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
NEXT_PUBLIC_API_BASE_URL=https://api.dygsom.pe
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_LOG_LEVEL=error
```

---

## 🔧 Control de Versiones

### Repositorio GitHub
```bash
# Clonar repositorio
git clone https://github.com/dygsom/dygsom-fraud-dashboard.git
cd dygsom-fraud-dashboard

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

### Flujo de Desarrollo
```bash
# Crear rama para feature
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commit
git add .
git commit -m "feat: descripción del cambio"

# Subir rama
git push origin feature/nueva-funcionalidad

# Crear Pull Request en GitHub
```

### .gitignore Configurado
- ✅ Node modules y builds excluidos
- ✅ Variables de entorno (.env) ignoradas  
- ✅ Archivos IDE y temporales excluidos
- ✅ Logs y caché ignorados

---

## 📚 Documentación y Referencias

### Documentos del Proyecto
- **Estado Actual:** `STATUS_2025-12-05.md`
- **Backend API:** `../dygsom-fraud-api/README.md`  
- **API Docs:** http://localhost:3000/docs

### Referencias Técnicas
- **Next.js 14:** https://nextjs.org/docs
- **TypeScript:** https://www.typescriptlang.org/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Docker:** https://docs.docker.com

---

## 🔧 Comandos Útiles

### Desarrollo
```bash
# Desarrollo normal
npm run dev

# Con puerto específico  
npm run dev -- --port 3003

# Build de producción
npm run build
```

### API Backend
```bash
cd ../dygsom-fraud-api
docker compose up -d
docker exec dygsom-fraud-api python check_users.py
```

---

## 📞 Soporte

**Equipo:** DYGSOM Engineering  
**Repositorio:** https://github.com/dygsom/dygsom-fraud-dashboard  
**Estado:** ✅ **Operativo** (Diciembre 2025)  
**Credenciales:** admin@dygsom.com / SecurePass123

---

*Última actualización: 5 de diciembre de 2025*
#   F i x   A P I   e n d p o i n t   f o r   p r o d u c t i o n   d e p l o y m e n t   1 2 / 0 4 / 2 0 2 5   0 9 : 4 9 : 1 2 
 
 
