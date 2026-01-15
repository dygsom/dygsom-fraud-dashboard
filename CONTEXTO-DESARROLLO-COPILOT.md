# CONTEXTO PARA DESARROLLO CON COPILOT - DASHBOARD TENANT
**Proyecto:** DYGSOM Fraud Detection - Dashboard de Tenant
**Fecha:** 12 Enero 2026
**Ubicación:** `D:\code\dygsom\dygsom-fraud-dashboard`
**Backend:** `D:\code\dygsom\dygsom-fraud-detection` (completado hasta Fase 5)
**Objetivo:** Adaptar dashboard existente para soportar servicios de 4 pilares del backend

---

## 🎯 MISIÓN DEL PROYECTO

Estás adaptando un **dashboard Next.js existente** para que consuma los servicios del backend de detección de fraude DYGSOM, el cual tiene **4 pilares** implementados y completamente funcionales:

1. **Bot Detection** - Detección de bots y actividad automatizada
2. **Account Takeover Prevention** - Prevención de secuestro de cuentas
3. **API Security** - Seguridad de APIs (SQL injection, XSS)
4. **Fraud ML** - Machine Learning para detección de fraude

El dashboard debe permitir a los **clientes de DYGSOM** (e-commerce, fintech) visualizar detecciones en tiempo real, configurar pilares, y gestionar API keys.

---

## 📁 ESTRUCTURA DEL PROYECTO

### Proyecto Actual (Dashboard)
```
D:\code\dygsom\dygsom-fraud-dashboard\
├── app/                        # Next.js 14 App Router
│   ├── (auth)/                # Rutas de autenticación
│   │   ├── login/page.tsx     # ⚠️ CAMBIAR: Email/Password → API Key
│   │   └── signup/page.tsx    # ⚠️ ELIMINAR: No signup en tenant dashboard
│   ├── (dashboard)/           # Rutas del dashboard
│   │   ├── layout.tsx         # Sidebar, Header
│   │   ├── overview/          # ⚠️ ADAPTAR: Vista principal con 4 pilares
│   │   ├── detections/        # ⚠️ ADAPTAR: Tabla de detecciones recientes
│   │   ├── analytics/         # ⚠️ ADAPTAR: Gráficos de tendencias
│   │   └── settings/          # ⚠️ CREAR: Configuración de pilares
│   └── api/                   # API Routes (Next.js)
├── components/                # Componentes React
│   ├── Dashboard/             # ⚠️ ADAPTAR: Charts para 4 pilares
│   ├── UI/                    # Componentes reutilizables (Button, Card, etc.)
│   └── Auth/                  # ⚠️ CAMBIAR: AuthContext
├── lib/                       # Utilidades
│   ├── api/                   # ⚠️ REEMPLAZAR: Eliminar mock hybrid.ts
│   │   └── hybrid.ts          # ⚠️ ELIMINAR: Sistema mock (no necesario)
│   ├── hooks/                 # Custom hooks (useDashboardMetrics, etc.)
│   └── types/                 # ⚠️ ADAPTAR: TypeScript types
├── public/                    # Assets estáticos
├── .env.example               # ⚠️ ACTUALIZAR: Variables de entorno
├── package.json               # Dependencias
└── next.config.js             # Configuración Next.js
```

### Backend (Referencia)
```
D:\code\dygsom\dygsom-fraud-detection\
├── packages/
│   ├── orchestrator/          # ✅ Lambda Orchestrator (4 pilares) - COMPLETO
│   │   ├── src/
│   │   │   ├── handler.ts     # Lambda handler (96.12% coverage)
│   │   │   ├── orchestrator.ts # Ejecución PARALELA (Promise.all)
│   │   │   └── pillars/       # 4 pilares implementados
│   │   ├── docs/
│   │   │   ├── openapi.yml    # 592 líneas - USAR COMO REFERENCIA
│   │   │   └── RUNBOOK.md     # 790 líneas - Operaciones
│   │   └── tests/             # 272/278 tests passing (97.8%)
│   │
│   └── handler-http/          # ⚠️ PENDIENTE: API Endpoints para dashboard
│       └── src/
│           ├── routes/        # 12 endpoints REST (ver sección más abajo)
│           └── services/      # Business logic
│
├── docs/                      # 📚 DOCUMENTACIÓN CRÍTICA - LEER OBLIGATORIO
│   ├── PASOS-DESARROLLO-MVP.md            # Fase 1-5 completas, ver sección 5.2
│   ├── PASOS_DESARROLLO_DASHBOARD.md      # 🔥 GUÍA PRINCIPAL PARA TI
│   ├── ARQUITECTURA_INTERFACES_DASH.md    # Arquitectura AWS completa
│   ├── ESPECIFICACION-TECNICA-FUNCIONAL-MVP.md # OpenAPI 3.0 specs
│   ├── COPILOT-CONTEXT-INICIAL.md         # Contexto del proyecto
│   ├── AUDITORIA-FASE-5-VALIDACION.md     # Estado actual (100% Fase 5)
│   └── RULES.md                           # ⚠️ OBLIGATORIO: Buenas prácticas
```

---

## 📚 DOCUMENTOS OBLIGATORIOS A LEER

**Antes de empezar, lee estos documentos en orden:**

### 1. 🔥 [PASOS_DESARROLLO_DASHBOARD.md](D:\code\dygsom\docs\PASOS_DESARROLLO_DASHBOARD.md)
**⭐ DOCUMENTO PRINCIPAL PARA TI**

- **Qué contiene:**
  - Roadmap completo (4-5 semanas)
  - 5 Fases de implementación:
    - Fase 1: Autenticación (Email/Password → API Key)
    - Fase 2: Backend Integration (12 endpoints)
    - Fase 3: Componentes de Visualización (4 pilares)
    - Fase 4: Dashboard Principal (Overview + Recent Detections)
    - Fase 5: Configuración de Pilares (Settings page)
  - Código completo copy-paste ready
  - Checklists por fase

### 2. [PASOS-DESARROLLO-MVP.md](D:\code\dygsom\docs\PASOS-DESARROLLO-MVP.md) - Sección 5.2
**Backend API Endpoints**

- **Líneas 3586-4710:** Especificación de **12 endpoints REST** que debes consumir
- **Endpoints críticos:**
  - `POST /v1/auth/validate` - Validar API Key
  - `GET /v1/scores/recent` - Listar detecciones recientes
  - `GET /v1/metrics` - Métricas agregadas 24h
  - `GET /v1/analytics/*` - Tendencias (fraud rate, volume, risk distribution)
  - `GET /v1/api-keys` - Listar API Keys
  - `POST /v1/api-keys` - Crear nueva API Key
  - `DELETE /v1/api-keys/:id` - Revocar API Key
  - `GET /v1/tenant/config` - Obtener configuración de pilares
  - `PATCH /v1/tenant/config` - Actualizar configuración de pilares

### 3. [ARQUITECTURA_INTERFACES_DASH.md](D:\code\dygsom\docs\ARQUITECTURA_INTERFACES_DASH.md)
**Arquitectura AWS completa**

- **Sección 4:** Dashboard de Tenant (páginas, features)
- **Sección 6:** Integración con Backend (4 pilares en detalle)
- **Sección 8:** Capas de Seguridad (API Key SHA-256, RLS)

### 4. [ESPECIFICACION-TECNICA-FUNCIONAL-MVP.md](D:\code\dygsom\docs\ESPECIFICACION-TECNICA-FUNCIONAL-MVP.md) - Sección 4.2
**OpenAPI 3.0 Specs**

- **Líneas 1204-1650:** Especificación completa de endpoints dashboard
- **Schemas:** DashboardMetrics, TenantConfig, ScoreResponse
- **Request/Response examples**

### 5. [RULES.md](D:\code\dygsom\docs\RULES.md)
**⚠️ OBLIGATORIO: Buenas prácticas y standards**

- **Principios Fundamentales:** SSOT, DRY, Fail Fast, Security by Default
- **Naming Conventions:** TypeScript, React components
- **Error Handling:** Try/catch patterns
- **Type Safety:** `error: unknown` en catch
- **No console.log:** Solo logger estructurado

---

## 🔌 BACKEND API - 12 ENDPOINTS REST

### Estado del Backend

**✅ Backend completado hasta Fase 5:**
- Orchestrator: 98.09% coverage
- Handler HTTP: Implementado (ver `packages/handler-http/src/routes/`)
- Tests: 272/278 passing (97.8%)
- Performance: p95 <600ms (paralelo con Promise.all)

**⚠️ Endpoints Implementados (Backend):**

Los siguientes endpoints YA ESTÁN IMPLEMENTADOS en el backend (ver `PASOS-DESARROLLO-MVP.md` ('D:\code\dygsom\docs\') sección 5.2):

#### Autenticación
```typescript
POST /v1/auth/validate
Headers: x-api-key: string
Response: {
  tenant_id: string,
  tenant_name: string,
  config: {
    pillars: {
      bot_detection: boolean,
      account_takeover: boolean,
      api_security: boolean,
      fraud_ml: boolean
    },
    thresholds: {
      bot_score: number,      // 0.0 - 1.0
      ato_score: number,
      api_score: number,
      ml_score: number
    },
    actions: {
      bot_detection: 'allow' | 'block' | 'challenge' | 'friction',
      account_takeover: 'allow' | 'block' | 'challenge' | 'friction',
      api_security: 'allow' | 'block' | 'challenge' | 'friction',
      fraud_ml: 'allow' | 'block' | 'challenge' | 'friction'
    }
  },
  created_at: string
}
```

#### Consulta de Datos
```typescript
GET /v1/scores/recent
Headers: x-api-key: string
Query: {
  limit?: number,        // default: 50, max: 500
  offset?: number,       // default: 0
  action?: 'allow' | 'block' | 'challenge' | 'friction',
  min_risk_score?: number,  // 0.0 - 1.0
  start_date?: string,   // ISO 8601
  end_date?: string      // ISO 8601
}
Response: {
  data: ScoreResponse[],
  total: number,
  offset: number,
  limit: number
}

// ScoreResponse type:
interface ScoreResponse {
  request_id: string,
  tenant_id: string,
  user_id: string,
  action: 'allow' | 'block' | 'challenge' | 'friction',
  risk_score: number,  // 0.0 - 1.0
  reason: string,
  pillar_scores: {
    bot_detection?: number,
    account_takeover?: number,
    api_security?: number,
    fraud_ml?: number
  },
  timestamp: string,
  latency_ms: number
}
```

```typescript
GET /v1/metrics
Headers: x-api-key: string
Response: {
  total_requests_24h: number,
  blocked_requests_24h: number,
  avg_risk_score_24h: number,     // 0.0 - 1.0
  avg_latency_ms_24h: number,
  actions_distribution: {
    allow: number,
    block: number,
    challenge: number,
    friction: number
  },
  pillar_avg_scores_24h: {
    bot_detection: number,
    account_takeover: number,
    api_security: number,
    fraud_ml: number
  }
}
```

#### Analytics
```typescript
GET /v1/analytics/fraud-rate
Headers: x-api-key: string
Query: {
  interval?: 'hour' | 'day',  // default: 'hour'
  days?: number               // default: 7, max: 30
}
Response: {
  data: Array<{
    timestamp: string,
    total_requests: number,
    blocked_requests: number,
    fraud_rate: number  // % (0-100)
  }>
}

GET /v1/analytics/volume
GET /v1/analytics/risk-distribution
GET /v1/analytics/export  // CSV or JSON
```

#### Gestión de API Keys
```typescript
GET /v1/api-keys
POST /v1/api-keys
DELETE /v1/api-keys/:id
```

#### Configuración de Pilares
```typescript
GET /v1/tenant/config
PATCH /v1/tenant/config
Body: {
  pillars?: {
    bot_detection?: boolean,
    account_takeover?: boolean,
    api_security?: boolean,
    fraud_ml?: boolean
  },
  thresholds?: {
    bot_score?: number,
    ato_score?: number,
    api_score?: number,
    ml_score?: number
  },
  actions?: {
    bot_detection?: 'allow' | 'block' | 'challenge' | 'friction',
    account_takeover?: 'allow' | 'block' | 'challenge' | 'friction',
    api_security?: 'allow' | 'block' | 'challenge' | 'friction',
    fraud_ml?: 'allow' | 'block' | 'challenge' | 'friction'
  }
}
```

**⚠️ IMPORTANTE:** Todos los endpoints requieren header `x-api-key` (SHA-256 hash).

**🔒 Row Level Security (RLS):**
- Backend filtra automáticamente por `tenant_id` extraído del API Key
- Frontend NO necesita pasar `tenant_id` en requests
- PostgreSQL RLS policies aseguran aislamiento de datos

---

## 🔄 CAMBIOS NECESARIOS EN EL DASHBOARD

### Fase 1: Autenticación (2-3 días)

#### ❌ Eliminar
```typescript
// app/(auth)/signup/page.tsx - ELIMINAR COMPLETO
// No hay signup en tenant dashboard (tenants creados por Superadmin)

// lib/api/hybrid.ts - ELIMINAR COMPLETO
// Sistema mock ya no es necesario
```

#### 🔧 Modificar
```typescript
// context/AuthContext.tsx
// ANTES: Email/Password authentication
// DESPUÉS: API Key authentication

import { createContext, useContext, useState, useEffect } from 'react';

interface Tenant {
  tenant_id: string;
  tenant_name: string;
  config: TenantConfig;
  created_at: string;
}

interface TenantConfig {
  pillars: {
    bot_detection: boolean;
    account_takeover: boolean;
    api_security: boolean;
    fraud_ml: boolean;
  };
  thresholds: {
    bot_score: number;
    ato_score: number;
    api_score: number;
    ml_score: number;
  };
  actions: {
    bot_detection: 'allow' | 'block' | 'challenge' | 'friction';
    account_takeover: 'allow' | 'block' | 'challenge' | 'friction';
    api_security: 'allow' | 'block' | 'challenge' | 'friction';
    fraud_ml: 'allow' | 'block' | 'challenge' | 'friction';
  };
}

interface AuthContextType {
  tenant: Tenant | null;
  apiKey: string | null;
  isLoading: boolean;
  login: (apiKey: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore from localStorage on mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem('dygsom_api_key');
    if (storedApiKey) {
      validateApiKey(storedApiKey);
    } else {
      setIsLoading(false);
    }
  }, []);

  async function validateApiKey(key: string) {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/validate`,
        {
          method: 'POST',
          headers: {
            'x-api-key': key,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Invalid API Key');
      }

      const data = await response.json();
      setTenant(data);
      setApiKey(key);
      localStorage.setItem('dygsom_api_key', key);
    } catch (error) {
      console.error('Auth error:', error);
      setTenant(null);
      setApiKey(null);
      localStorage.removeItem('dygsom_api_key');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function login(apiKey: string) {
    await validateApiKey(apiKey);
  }

  function logout() {
    setTenant(null);
    setApiKey(null);
    localStorage.removeItem('dygsom_api_key');
  }

  return (
    <AuthContext.Provider value={{ tenant, apiKey, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

```typescript
// app/(auth)/login/page.tsx
// MODIFICAR: Input para API Key (no email/password)

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(apiKey);
      router.push('/overview');
    } catch (err) {
      setError('Invalid API Key. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6">DYGSOM Dashboard</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              API Key
            </label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="dys_prod_abc123..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter your DYGSOM API Key to access the dashboard
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading || !apiKey}
            className="w-full"
          >
            {isLoading ? 'Validating...' : 'Login'}
          </Button>
        </form>

        <p className="text-xs text-gray-500 mt-4">
          Don't have an API Key?{' '}
          <a href="mailto:support@dygsom.pe" className="text-blue-600">
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
```

### 2: Backend Integration (3-4 días)

#### 🆕 Crear
```typescript
// lib/api/client.ts
// NUEVO: API client con fetch wrapper

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = localStorage.getItem('dygsom_api_key');

  if (!apiKey) {
    throw new Error('No API Key found. Please login.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new ApiError(response.status, `API Error: ${response.statusText}`);
  }

  return response.json();
}

// Specialized functions
export const api = {
  auth: {
    validate: () => apiRequest<Tenant>('/auth/validate', { method: 'POST' }),
  },

  scores: {
    recent: (params?: {
      limit?: number;
      offset?: number;
      action?: string;
      min_risk_score?: number;
      start_date?: string;
      end_date?: string;
    }) => {
      const query = new URLSearchParams(
        Object.entries(params || {}).map(([k, v]) => [k, String(v)])
      );
      return apiRequest<{ data: ScoreResponse[]; total: number; offset: number; limit: number }>(
        `/scores/recent?${query}`
      );
    },
  },

  metrics: {
    get: () => apiRequest<DashboardMetrics>('/metrics'),
  },

  analytics: {
    fraudRate: (params?: { interval?: string; days?: number }) => {
      const query = new URLSearchParams(
        Object.entries(params || {}).map(([k, v]) => [k, String(v)])
      );
      return apiRequest<{ data: FraudRateTrend[] }>(`/analytics/fraud-rate?${query}`);
    },
    volume: (params?: { interval?: string; days?: number }) =>
      apiRequest<{ data: VolumeTrend[] }>(`/analytics/volume?${query}`),
    riskDistribution: () =>
      apiRequest<{ distribution: RiskDistribution }>('/analytics/risk-distribution'),
  },

  apiKeys: {
    list: () => apiRequest<{ keys: ApiKeyResponse[] }>('/api-keys'),
    create: (name: string) =>
      apiRequest<ApiKeyResponse>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    revoke: (id: string) =>
      apiRequest<{ message: string }>(`/api-keys/${id}`, { method: 'DELETE' }),
  },

  tenant: {
    getConfig: () => apiRequest<{ config: TenantConfig }>('/tenant/config'),
    updateConfig: (config: Partial<TenantConfig>) =>
      apiRequest<{ config: TenantConfig; message: string }>('/tenant/config', {
        method: 'PATCH',
        body: JSON.stringify(config),
      }),
  },
};
```

#### 🆕 Custom Hooks (SWR)
```typescript
// lib/hooks/useDashboardMetrics.ts
import useSWR from 'swr';
import { api } from '@/lib/api/client';

export function useDashboardMetrics() {
  const { data, error, mutate } = useSWR(
    '/metrics',
    () => api.metrics.get(),
    {
      refreshInterval: 30000, // Poll every 30s
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  return {
    metrics: data,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}

// lib/hooks/useRecentScores.ts
import useSWR from 'swr';
import { api } from '@/lib/api/client';

export function useRecentScores(params?: {
  limit?: number;
  action?: string;
  min_risk_score?: number;
}) {
  const key = `/scores/recent?${JSON.stringify(params)}`;
  const { data, error, mutate } = useSWR(
    key,
    () => api.scores.recent(params),
    {
      refreshInterval: 10000, // Poll every 10s
      revalidateOnFocus: true,
    }
  );

  return {
    scores: data?.data || [],
    total: data?.total || 0,
    isLoading: !error && !data,
    isError: error,
    refresh: mutate,
  };
}
```
Fase 
### Fase 3: Componentes de Visualización (2-3 días)

#### 🆕 Crear Componentes para 4 Pilares

```typescript
// components/Dashboard/RiskScoreGauge.tsx
// Circular gauge para mostrar risk_score (0.0-1.0)
// Color dinámico según score:
//   - 0.0-0.3: Verde (allow)
//   - 0.3-0.6: Amarillo (friction)
//   - 0.6-0.8: Naranja (challenge)
//   - 0.8-1.0: Rojo (block)

// components/Dashboard/PillarScoresChart.tsx
// Bar chart horizontal con 4 barras (Bot, ATO, API, ML)
// Usa Recharts library (ya incluida)

// components/Dashboard/PillarSignalsCard.tsx
// Card mostrando signals de cada pilar:
//   Bot Detection: { deviceKnown, ipScore, rateSuspicious, userAgentValid }
//   Account Takeover: { breached, impossibleTravel, knownDevice, velocitySuspicious }
//   API Security: { burstDetected, injectionAttempts, validationIssues }
//   Fraud ML: { amountAnomaly, velocityAnomaly, locationAnomaly }

// components/Dashboard/RecentDetectionsTable.tsx
// DataTable con columnas:
//   - Timestamp
//   - User ID
//   - Action (badge con color)
//   - Risk Score (progress bar)
//   - Reason
//   - Pillar Scores (mini bar chart inline)
```

**Ver código completo en:**
- [PASOS_DESARROLLO_DASHBOARD.md](D:\code\dygsom\docs\PASOS_DESARROLLO_DASHBOARD.md) líneas 406-800

### Fase 4: Dashboard Principal (4-5 días)

#### 🔧 Modificar Páginas Existentes

```typescript
// app/(dashboard)/overview/page.tsx
// REEMPLAZAR contenido con:
//   - RiskScoreGauge (último score)
//   - PillarScoresChart (4 pilares)
//   - Metrics cards (total requests, blocked, avg latency)
//   - Actions distribution (pie chart)

// app/(dashboard)/detections/page.tsx
// REEMPLAZAR contenido con:
//   - Filters (action, date range, min risk score)
//   - RecentDetectionsTable (paginación)
//   - Export button (CSV/JSON)

// app/(dashboard)/analytics/page.tsx
// REEMPLAZAR contenido con:
//   - Fraud Rate Trend (line chart, últimos 7 días)
//   - Volume Trend (bar chart)
//   - Risk Distribution (pie chart)
```

### Fase 5: Configuración de Pilares (2-3 días)

#### 🆕 Crear Página de Settings

```typescript
// app/(dashboard)/settings/page.tsx
// NUEVA página con 4 PillarConfigCard:
//   1. Bot Detection
//   2. Account Takeover Prevention
//   3. API Security
//   4. Fraud ML
//
// Cada card permite:
//   - Toggle enable/disable (ToggleSwitch)
//   - Ajustar threshold (Slider 0-100%)
//   - Configurar action (Select: allow/block/challenge/friction)
//   - Ver features del pilar (lista)

// components/Settings/PillarConfigCard.tsx
interface PillarConfigCardProps {
  name: string;
  enabled: boolean;
  threshold: number; // 0-100
  action: 'allow' | 'block' | 'challenge' | 'friction';
  features: string[];
  onToggle: (enabled: boolean) => void;
  onThresholdChange: (value: number) => void;
  onActionChange: (action: string) => void;
}
```

**Ver código completo en:**
- [PASOS_DESARROLLO_DASHBOARD.md](D:\code\dygsom\docs\PASOS_DESARROLLO_DASHBOARD.md) líneas 968-1299

---

## 🛠️ CONFIGURACIÓN DEL PROYECTO

### Variables de Entorno

```bash
# .env.local (crear este archivo)

# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/v1  # Development
# NEXT_PUBLIC_API_URL=https://api.dygsom.pe/v1  # Production

# Environment
NEXT_PUBLIC_ENVIRONMENT=development

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_API_KEY_MANAGEMENT=true
NEXT_PUBLIC_ENABLE_PILLAR_CONFIG=true
```

### Dependencias Necesarias

```json
// package.json - VERIFICAR estas dependencias:
{
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "typescript": "5.9.3",
    "tailwindcss": "4.1.17",
    "recharts": "3.5.1",        // ✅ Ya incluida (para charts)
    "swr": "^2.2.4",            // ⚠️ AGREGAR: Data fetching + caching
    "date-fns": "^3.0.0",       // ✅ Ya incluida (para fechas)
    "lucide-react": "^0.263.1", // ✅ Ya incluida (iconos)
    "clsx": "^2.0.0",           // ✅ Ya incluida (classnames)
    "zod": "^3.22.4"            // ⚠️ AGREGAR: Validación de schemas
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.45",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.2.0"
  }
}
```

**Instalar dependencias faltantes:**
```bash
npm install swr zod
```

---

## 🎨 COMPONENTES UI EXISTENTES (Reutilizar)

El proyecto ya tiene componentes UI base en `components/UI/`:

```typescript
// ✅ YA DISPONIBLES (reutilizar):
- Button.tsx
- Input.tsx
- Card.tsx
- Badge.tsx
- Select.tsx
- Spinner.tsx
- Table.tsx
- Modal.tsx

// ⚠️ CREAR NUEVOS:
- ToggleSwitch.tsx    (para enable/disable pilares)
- Slider.tsx          (para thresholds 0-100%)
- ProgressBar.tsx     (para risk scores)
```

**Ejemplos de implementación en:**
- [PASOS_DESARROLLO_DASHBOARD.md](D:\code\dygsom\docs\PASOS_DESARROLLO_DASHBOARD.md) líneas 1208-1299

---

## 🧪 TESTING

### Estrategia de Testing

```typescript
// tests/integration/auth.test.tsx
// Testear flujo de autenticación con API Key

// tests/integration/dashboard.test.tsx
// Testear carga de métricas y visualización

// tests/unit/components/RiskScoreGauge.test.tsx
// Testear componentes individuales

// tests/e2e/user-flow.spec.ts (Playwright)
// Testear flujo completo: Login → Overview → Detections → Settings
```

### Smoke Tests

```bash
# Verificar que el dashboard cargue correctamente
curl -H "x-api-key: dys_prod_test_key" http://localhost:3000/v1/auth/validate

# Verificar métricas
curl -H "x-api-key: dys_prod_test_key" http://localhost:3000/v1/metrics

# Verificar scores recientes
curl -H "x-api-key: dys_prod_test_key" http://localhost:3000/v1/scores/recent?limit=10
```

---

## 📊 TIPOS TYPESCRIPT CRÍTICOS

```typescript
// types/dashboard.ts
// COPIAR DESDE BACKEND (mantener SSOT - Single Source of Truth)

export interface ScoreResponse {
  request_id: string;
  tenant_id: string;
  user_id: string;
  action: 'allow' | 'block' | 'challenge' | 'friction';
  risk_score: number; // 0.0 - 1.0
  reason: string;
  pillar_scores: {
    bot_detection?: number;
    account_takeover?: number;
    api_security?: number;
    fraud_ml?: number;
  };
  signals?: {
    bot_detection?: {
      deviceKnown: boolean;
      ipScore: number;
      rateSuspicious: boolean;
      userAgentValid: boolean;
    };
    account_takeover?: {
      breached: boolean;
      impossibleTravel: boolean;
      knownDevice: boolean;
      velocitySuspicious: boolean;
    };
    api_security?: {
      burstDetected: boolean;
      injectionAttempts: boolean;
      validationIssues: boolean;
    };
    fraud_ml?: {
      amountAnomaly: boolean;
      velocityAnomaly: boolean;
      locationAnomaly: boolean;
    };
  };
  timestamp: string; // ISO 8601
  latency_ms: number;
}

export interface DashboardMetrics {
  total_requests_24h: number;
  blocked_requests_24h: number;
  avg_risk_score_24h: number;
  avg_latency_ms_24h: number;
  actions_distribution: {
    allow: number;
    block: number;
    challenge: number;
    friction: number;
  };
  pillar_avg_scores_24h: {
    bot_detection: number;
    account_takeover: number;
    api_security: number;
    fraud_ml: number;
  };
}

export interface TenantConfig {
  pillars: {
    bot_detection: boolean;
    account_takeover: boolean;
    api_security: boolean;
    fraud_ml: boolean;
  };
  thresholds: {
    bot_score: number;
    ato_score: number;
    api_score: number;
    ml_score: number;
  };
  actions: {
    bot_detection: 'allow' | 'block' | 'challenge' | 'friction';
    account_takeover: 'allow' | 'block' | 'challenge' | 'friction';
    api_security: 'allow' | 'block' | 'challenge' | 'friction';
    fraud_ml: 'allow' | 'block' | 'challenge' | 'friction';
  };
}

export interface Tenant {
  tenant_id: string;
  tenant_name: string;
  config: TenantConfig;
  created_at: string;
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  prefix: string; // "dys_prod_abc"
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
}
```

---

## 🚨 REGLAS DE DESARROLLO (OBLIGATORIAS)

**De [RULES.md](D:\code\dygsom\docs\RULES.md):**

### 1. Type Safety ✅
```typescript
// ✅ CORRECTO:
try {
  await api.metrics.get();
} catch (error: unknown) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.status, error.message);
  } else {
    console.error('Unknown error:', error);
  }
}

// ❌ INCORRECTO:
try {
  await api.metrics.get();
} catch (error) { // Sin tipo
  console.error(error.message); // TS error: error is unknown
}
```

### 2. No console.log ❌
```typescript
// ❌ INCORRECTO:
console.log('User logged in:', tenant);

// ✅ CORRECTO:
import { logger } from '@/lib/logger';
logger.info('User logged in', { tenantId: tenant.tenant_id });
```

### 3. Error Handling Pattern
```typescript
// ✅ CORRECTO: Early return pattern
async function loadMetrics() {
  const apiKey = localStorage.getItem('dygsom_api_key');
  if (!apiKey) {
    throw new Error('No API Key found');
  }

  const metrics = await api.metrics.get();
  if (!metrics) {
    throw new Error('Failed to load metrics');
  }

  return metrics;
}
```

### 4. Naming Conventions
```typescript
// ✅ React Components: PascalCase
export function RiskScoreGauge() {}

// ✅ Functions: camelCase
function calculateRiskScore() {}

// ✅ Constants: UPPER_SNAKE_CASE
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ✅ Types/Interfaces: PascalCase
interface DashboardMetrics {}
```

### 5. Single Source of Truth (SSOT)
```typescript
// ✅ CORRECTO: Definir en un solo lugar
// types/dashboard.ts
export interface ScoreResponse { ... }

// Importar en todos los archivos
import type { ScoreResponse } from '@/types/dashboard';

// ❌ INCORRECTO: Redefinir types en múltiples archivos
```

---

## 🎯 ROADMAP DE IMPLEMENTACIÓN

### Semana 1: Autenticación + Backend Integration
**Duración:** 5 días

**Tasks:**
- [ ] Eliminar `app/(auth)/signup/page.tsx`
- [ ] Eliminar `lib/api/hybrid.ts`
- [ ] Modificar `context/AuthContext.tsx` (API Key auth)
- [ ] Modificar `app/(auth)/login/page.tsx` (input API Key)
- [ ] Crear `lib/api/client.ts` (fetch wrapper)
- [ ] Crear custom hooks (`useDashboardMetrics`, `useRecentScores`)
- [ ] Actualizar `.env.example` con `NEXT_PUBLIC_API_URL`
- [ ] Instalar dependencias: `npm install swr zod`
- [ ] **Smoke test:** Login con API Key válida

### Semana 2: Componentes de Visualización
**Duración:** 4 días

**Tasks:**
- [ ] Crear `components/Dashboard/RiskScoreGauge.tsx`
- [ ] Crear `components/Dashboard/PillarScoresChart.tsx`
- [ ] Crear `components/Dashboard/PillarSignalsCard.tsx`
- [ ] Crear `components/Dashboard/RecentDetectionsTable.tsx`
- [ ] Crear `components/Dashboard/ActionDistributionPie.tsx`
- [ ] Crear `components/UI/ProgressBar.tsx`
- [ ] **Tests unitarios:** Cada componente

### Semana 3: Dashboard Principal
**Duración:** 5 días

**Tasks:**
- [ ] Modificar `app/(dashboard)/overview/page.tsx`
- [ ] Modificar `app/(dashboard)/detections/page.tsx`
- [ ] Modificar `app/(dashboard)/analytics/page.tsx`
- [ ] Implementar filtros en detections (action, date range)
- [ ] Implementar paginación en detections table
- [ ] Implementar export (CSV/JSON) en analytics
- [ ] **Tests E2E:** Flujo completo Login → Overview → Detections

### Semana 4: Configuración de Pilares + API Keys
**Duración:** 5 días

**Tasks:**
- [ ] Crear `app/(dashboard)/settings/page.tsx`
- [ ] Crear `components/Settings/PillarConfigCard.tsx`
- [ ] Crear `components/UI/ToggleSwitch.tsx`
- [ ] Crear `components/UI/Slider.tsx`
- [ ] Crear `app/(dashboard)/api-keys/page.tsx`
- [ ] Implementar CRUD de API Keys (listar, crear, revocar)
- [ ] **Warning:** Mostrar API Key SOLO una vez al crear
- [ ] **Tests E2E:** Configurar pillar → Verificar cambio en backend

### Semana 5: Testing + Deployment
**Duración:** 3 días

**Tasks:**
- [ ] Ejecutar tests unitarios (>80% coverage)
- [ ] Ejecutar tests E2E (Playwright)
- [ ] Verificar responsiveness (mobile, tablet, desktop)
- [ ] Configurar CI/CD (GitHub Actions → Amplify)
- [ ] Deploy a staging (`dev-dashboard.dygsom.com`)
- [ ] Smoke tests en staging
- [ ] Deploy a production (`dashboard.dygsom.com`)

**Total:** 4-5 semanas (según especificación en PASOS_DESARROLLO_DASHBOARD.md)

---

## 🔧 COMANDOS ÚTILES

### Desarrollo
```bash
# Iniciar dev server
npm run dev

# Build para producción
npm run build

# Ejecutar tests
npm test

# Type checking
npm run type-check

# Linter
npm run lint
```

### Testing con Backend Local
```bash
# Terminal 1: Backend (Lambda local)
cd D:\code\dygsom\dygsom-fraud-detection\packages\orchestrator
npm run dev

# Terminal 2: Dashboard
cd D:\code\dygsom\dygsom-fraud-dashboard
npm run dev

# Abrir: http://localhost:3001 (dashboard)
# Backend: http://localhost:3000 (API)
```

---

## 📞 AYUDA Y SOPORTE

### ¿Dónde encontrar información?

1. **Código completo:** [PASOS_DESARROLLO_DASHBOARD.md](D:\code\dygsom\docs\PASOS_DESARROLLO_DASHBOARD.md)
2. **API specs:** [ESPECIFICACION-TECNICA-FUNCIONAL-MVP.md](D:\code\dygsom\docs\ESPECIFICACION-TECNICA-FUNCIONAL-MVP.md) sección 4.2
3. **Arquitectura:** [ARQUITECTURA_INTERFACES_DASH.md](D:\code\dygsom\docs\ARQUITECTURA_INTERFACES_DASH.md) sección 4
4. **Buenas prácticas:** [RULES.md](D:\code\dygsom\docs\RULES.md)
5. **Backend status:** [AUDITORIA-FASE-5-VALIDACION.md](D:\code\dygsom\docs\AUDITORIA-FASE-5-VALIDACION.md)

### Troubleshooting Común

**Problema: CORS errors**
```typescript
// Verificar que backend tenga CORS configurado:
// packages/handler-http/src/index.ts
app.use(cors({
  origin: ['http://localhost:3001', 'https://dashboard.dygsom.com'],
  credentials: true,
}));
```

**Problema: API Key inválida (401)**
```typescript
// Verificar que API Key tenga formato correcto:
// Debe empezar con "dys_prod_" o "dys_test_"
// Longitud mínima: 40 caracteres
```

**Problema: Métricas no actualizan**
```typescript
// Verificar polling interval en SWR:
const { data } = useSWR('/metrics', fetcher, {
  refreshInterval: 30000, // 30 segundos
  revalidateOnFocus: true,
});
```

---

## ✅ CHECKLIST PRE-DEVELOPMENT

Antes de empezar, verifica:

- [ ] Leí [PASOS_DESARROLLO_DASHBOARD.md](D:\code\dygsom\docs\PASOS_DESARROLLO_DASHBOARD.md) completo
- [ ] Leí [RULES.md](D:\code\dygsom\docs\RULES.md) sección de React/TypeScript
- [ ] Revisé OpenAPI specs en [ESPECIFICACION-TECNICA-FUNCIONAL-MVP.md](D:\code\dygsom\docs\ESPECIFICACION-TECNICA-FUNCIONAL-MVP.md)
- [ ] Entiendo los 12 endpoints REST del backend
- [ ] Entiendo los 4 pilares (Bot, ATO, API Security, Fraud ML)
- [ ] Tengo Node.js 20+ y npm instalado
- [ ] Cloné el repositorio: `git clone <repo>`
- [ ] Instalé dependencias: `npm install`
- [ ] Creé `.env.local` con `NEXT_PUBLIC_API_URL`
- [ ] Ejecuté `npm run dev` exitosamente
- [ ] Entiendo autenticación con API Key (SHA-256)
- [ ] Entiendo Row Level Security (RLS)

---

## 🚀 PRÓXIMOS PASOS

**1. Ahora mismo:**
   - Lee [PASOS_DESARROLLO_DASHBOARD.md](D:\code\dygsom\docs\PASOS_DESARROLLO_DASHBOARD.md) líneas 1-100 (Resumen Ejecutivo)
   - Abre el proyecto en VS Code
   - Ejecuta `npm install && npm run dev`
   - Explora la estructura actual del proyecto

**2. Primera tarea (Copilot):**
   - Modifica `context/AuthContext.tsx` para API Key auth
   - Prompt para Copilot: "Convert AuthContext from email/password to API Key authentication. The API Key should be validated against POST /v1/auth/validate endpoint with x-api-key header. Store validated tenant data (tenant_id, config) in context."

**3. Segunda tarea (Copilot):**
   - Crea `lib/api/client.ts` con fetch wrapper
   - Prompt para Copilot: "Create API client with fetch wrapper that automatically adds x-api-key header from localStorage. Include functions for all 12 REST endpoints: auth/validate, scores/recent, metrics, analytics/*, api-keys, tenant/config"

---

**¡LISTO PARA EMPEZAR! 🎉**

Usa GitHub Copilot para acelerar el desarrollo. Este documento tiene TODA la información necesaria para que Copilot te asista correctamente.

**Recuerda:**
- Copilot aprende del contexto (este archivo + archivos abiertos en VS Code)
- Mantén abiertos los archivos relevantes mientras codeas
- Usa comentarios descriptivos para guiar a Copilot
- Valida SIEMPRE el código generado contra RULES.md

---

**FIN DEL CONTEXTO**

**Última actualización:** 12 Enero 2026
**Versión:** 1.0
**Autor:** Claude Sonnet 4.5 + Equipo DYGSOM
**Para:** GitHub Copilot + Desarrolladores Frontend
