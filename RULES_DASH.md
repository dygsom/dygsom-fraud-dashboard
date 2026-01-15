# RULES - DASHBOARD TENANT DYGSOM
**Proyecto:** DYGSOM Fraud Detection - Dashboard de Tenant
**Stack:** Next.js 14, TypeScript 5.9, Tailwind CSS 4, React 18
**Fecha:** 12 Enero 2026
**Versión:** 1.0
**Objetivo:** Estándares y buenas prácticas obligatorias

---

## 📋 TABLA DE CONTENIDOS

1. [Principios Fundamentales](#principios-fundamentales)
2. [Naming Conventions](#naming-conventions)
3. [Arquitectura & Patterns](#arquitectura--patterns)
4. [Estructura de Archivos](#estructura-de-archivos)
5. [TypeScript & Type Safety](#typescript--type-safety)
6. [React & Next.js Best Practices](#react--nextjs-best-practices)
7. [Gestión de Estado](#gestión-de-estado)
8. [API Integration](#api-integration)
9. [Error Handling](#error-handling)
10. [Logging & Debugging](#logging--debugging)
11. [Styling & UI](#styling--ui)
12. [Testing Standards](#testing-standards)
13. [Performance](#performance)
14. [Security](#security)
15. [Git & Commits](#git--commits)
16. [Prohibiciones](#prohibiciones)

---

## 🎯 PRINCIPIOS FUNDAMENTALES

### 1. Single Source of Truth (SSOT)

**Regla:** Cada pieza de información debe tener UNA sola definición canónica.

**✅ Correcto:**

```typescript
// types/dashboard.ts - ÚNICA fuente de verdad
export interface ScoreResponse {
  request_id: string;
  tenant_id: string;
  action: 'allow' | 'block' | 'challenge' | 'friction';
  risk_score: number;
  pillar_scores: {
    bot_detection?: number;
    account_takeover?: number;
    api_security?: number;
    fraud_ml?: number;
  };
}

// Importar en TODOS los archivos que lo necesiten
import type { ScoreResponse } from '@/types/dashboard';
```

**❌ Incorrecto:**

```typescript
// components/DetectionsTable.tsx
interface ScoreResponse { ... } // ❌ Redefinición

// lib/api/client.ts
interface ScoreResponse { ... } // ❌ Redefinición

// Resultado: 3 definiciones inconsistentes = bugs
```

**Aplicación:**
- Types: `types/dashboard.ts` (ÚNICO archivo)
- Constants: `lib/constants.ts` (ÚNICO archivo)
- API Base URL: `.env.local` (ÚNICO lugar)
- Theme colors: `tailwind.config.js` (ÚNICO lugar)

---

### 2. Don't Repeat Yourself (DRY)

**Regla:** NO duplicar código. Si usas algo 2+ veces, crea una abstracción.

**✅ Correcto:**

```typescript
// lib/utils/format.ts
export function formatRiskScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function getRiskScoreColor(score: number): string {
  if (score >= 0.8) return 'red';
  if (score >= 0.6) return 'orange';
  if (score >= 0.4) return 'yellow';
  return 'green';
}

// Usar en TODOS los componentes
import { formatRiskScore, getRiskScoreColor } from '@/lib/utils/format';
```

**❌ Incorrecto:**

```typescript
// components/RiskScoreGauge.tsx
const percentage = Math.round(score * 100) + '%'; // ❌ Duplicado

// components/RecentDetectionsTable.tsx
const percentage = Math.round(score * 100) + '%'; // ❌ Duplicado

// Resultado: Si cambia el formato, hay que cambiarlo en 2+ lugares
```

---

### 3. Fail Fast

**Regla:** Validar TEMPRANO y fallar RÁPIDO. No continuar ejecución con datos inválidos.

**✅ Correcto:**

```typescript
// app/(dashboard)/overview/page.tsx
export default function OverviewPage() {
  const { tenant, apiKey } = useAuth();

  // ✅ Fail fast: Verificar auth ANTES de renderizar
  if (!tenant || !apiKey) {
    redirect('/login');
  }

  const { metrics, isError } = useDashboardMetrics();

  // ✅ Fail fast: Verificar data ANTES de usar
  if (isError) {
    return <ErrorPage message="Failed to load metrics" />;
  }

  if (!metrics) {
    return <Spinner />;
  }

  // Aquí metrics está garantizado que existe
  return <MetricsDisplay metrics={metrics} />;
}
```

**❌ Incorrecto:**

```typescript
export default function OverviewPage() {
  const { tenant } = useAuth();
  const { metrics } = useDashboardMetrics();

  // ❌ Renderiza sin verificar, puede crashear
  return (
    <div>
      <h1>{tenant.tenant_name}</h1> {/* ❌ Puede ser undefined */}
      <p>{metrics.total_requests_24h}</p> {/* ❌ Puede ser undefined */}
    </div>
  );
}
```

**Aplicación:**
- Validar API Key antes de fetch
- Validar form inputs antes de submit
- Validar props en componentes
- Use Zod schemas para runtime validation

---

### 4. Separation of Concerns

**Regla:** Cada módulo debe tener UNA responsabilidad clara.

**✅ Correcto:**

```typescript
// components/Dashboard/RiskScoreGauge.tsx
// ÚNICA responsabilidad: Mostrar gauge visual
export function RiskScoreGauge({ score, action }: Props) {
  return <svg>...</svg>;
}

// lib/api/client.ts
// ÚNICA responsabilidad: HTTP requests
export async function apiRequest<T>(endpoint: string) { ... }

// lib/hooks/useDashboardMetrics.ts
// ÚNICA responsabilidad: Fetch + cache metrics
export function useDashboardMetrics() {
  return useSWR('/metrics', fetcher);
}
```

**❌ Incorrecto:**

```typescript
// components/Dashboard/RiskScoreGauge.tsx
export function RiskScoreGauge() {
  // ❌ Fetching data en componente visual
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch('/api/metrics').then(r => r.json()).then(setScore);
  }, []);

  // ❌ Cálculo de color en componente (debería estar en utils)
  const color = score > 0.8 ? 'red' : 'green';

  return <svg>...</svg>;
}
```

**Responsabilidades por capa:**
- **Components:** Solo UI + event handlers
- **Hooks:** Data fetching + state management
- **API Client:** HTTP requests
- **Utils:** Pure functions (format, calculate, validate)
- **Types:** TypeScript types/interfaces

---

### 5. Type Safety First

**Regla:** TypeScript strict mode SIEMPRE. No `any`, no `as unknown as`.

**✅ Correcto:**

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// Uso correcto
function formatMetrics(metrics: DashboardMetrics): string {
  return `Total: ${metrics.total_requests_24h}`;
}

// Error handling con tipo
try {
  await api.metrics.get();
} catch (error: unknown) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.status);
  } else {
    console.error('Unknown error:', error);
  }
}
```

**❌ Incorrecto:**

```typescript
// ❌ any type
function formatMetrics(metrics: any) {
  return metrics.total; // ❌ No autocomplete, no type safety
}

// ❌ Type assertion
const metrics = response.data as any;

// ❌ Non-null assertion
const tenant = useAuth().tenant!; // ❌ Puede ser null

// ❌ Catch sin tipo
try {
  await api.get();
} catch (error) { // ❌ error es 'any'
  console.error(error.message);
}
```

---

## 📝 NAMING CONVENTIONS

### TypeScript/React

#### Componentes (PascalCase)

```typescript
// ✅ Correcto
export function RiskScoreGauge() {}
export function PillarScoresChart() {}
export function RecentDetectionsTable() {}

// ❌ Incorrecto
export function riskScoreGauge() {}  // camelCase
export function risk_score_gauge() {} // snake_case
```

#### Funciones y Variables (camelCase)

```typescript
// ✅ Correcto
function calculateRiskScore(score: number): string {}
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
let isLoading = false;

// ❌ Incorrecto
function CalculateRiskScore() {} // PascalCase (reservado para componentes)
const APIBaseURL = '...';        // UPPER_CASE (reservado para constantes)
let is_loading = false;          // snake_case
```

#### Constantes (UPPER_SNAKE_CASE)

```typescript
// ✅ Correcto
export const API_BASE_URL = 'https://api.dygsom.pe/v1';
export const MAX_RETRIES = 3;
export const CACHE_TTL_SECONDS = 300;
export const PILLAR_NAMES = ['bot_detection', 'account_takeover'] as const;

// ❌ Incorrecto
export const apiBaseUrl = '...';  // camelCase
export const MaxRetries = 3;      // PascalCase
```

#### Types e Interfaces (PascalCase)

```typescript
// ✅ Correcto
export interface DashboardMetrics {}
export type ActionType = 'allow' | 'block' | 'challenge' | 'friction';
export enum PillarName {
  BotDetection = 'bot_detection',
  AccountTakeover = 'account_takeover',
}

// ❌ Incorrecto
export interface dashboardMetrics {}  // camelCase
export type action_type = '...';      // snake_case
```

#### Custom Hooks (camelCase con prefijo "use")

```typescript
// ✅ Correcto
export function useDashboardMetrics() {}
export function useRecentScores() {}
export function useAuth() {}

// ❌ Incorrecto
export function getDashboardMetrics() {}  // Sin "use"
export function UseDashboardMetrics() {}  // PascalCase
export function use_dashboard_metrics() {} // snake_case
```

#### Archivos y Carpetas

```typescript
// Componentes: PascalCase.tsx
components/Dashboard/RiskScoreGauge.tsx
components/Settings/PillarConfigCard.tsx

// Hooks: camelCase.ts
lib/hooks/useDashboardMetrics.ts
lib/hooks/useRecentScores.ts

// Utils: camelCase.ts
lib/utils/format.ts
lib/utils/validate.ts

// Types: camelCase.ts
types/dashboard.ts
types/auth.ts

// API: camelCase.ts
lib/api/client.ts
lib/api/endpoints.ts

// Páginas (Next.js): kebab-case/page.tsx
app/(dashboard)/overview/page.tsx
app/(dashboard)/recent-detections/page.tsx
app/(auth)/login/page.tsx
```

#### Props Interfaces (PascalCase con sufijo "Props")

```typescript
// ✅ Correcto
interface RiskScoreGaugeProps {
  score: number;
  action: ActionType;
}

export function RiskScoreGauge({ score, action }: RiskScoreGaugeProps) {}

// ❌ Incorrecto
interface Props {}              // Demasiado genérico
interface RiskScoreGaugeParams {} // "Params" no es convención React
interface IRiskScoreGaugeProps {} // Prefijo "I" no es necesario en TS
```

#### Boolean Variables (prefijos: is, has, should, can)

```typescript
// ✅ Correcto
const isLoading = true;
const hasError = false;
const shouldRefetch = true;
const canEdit = false;

// ❌ Incorrecto
const loading = true;    // Ambiguo
const error = false;     // Ambiguo
const refetch = true;    // Ambiguo
```

---

## 🏗️ ARQUITECTURA & PATTERNS

### 1. Estructura de Capas (Vertical Slicing)

```
app/                      # Next.js App Router (Pages + Routing)
├── (auth)/              # Auth group (layout compartido)
│   └── login/
│       └── page.tsx     # Solo UI + event handlers
│
├── (dashboard)/         # Dashboard group (layout compartido)
│   ├── layout.tsx       # Sidebar, Header
│   ├── overview/
│   │   └── page.tsx     # Orquesta hooks + componentes
│   ├── detections/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx

components/              # Componentes React (Pure UI)
├── Dashboard/
│   ├── RiskScoreGauge.tsx
│   └── PillarScoresChart.tsx
├── Settings/
│   └── PillarConfigCard.tsx
└── UI/                  # Componentes reutilizables
    ├── Button.tsx
    ├── Card.tsx
    └── Input.tsx

lib/                     # Business Logic
├── api/
│   └── client.ts        # HTTP requests (fetch wrapper)
├── hooks/
│   ├── useDashboardMetrics.ts  # Data fetching + SWR
│   └── useAuth.ts       # Auth state management
├── utils/
│   ├── format.ts        # Pure functions
│   └── validate.ts      # Validation logic
└── constants.ts         # Constantes globales

context/                 # React Context (Global state)
└── AuthContext.tsx      # Auth state + API Key

types/                   # TypeScript types (SSOT)
├── dashboard.ts         # ScoreResponse, DashboardMetrics
└── auth.ts              # Tenant, TenantConfig
```

**Regla:** NO mezclar responsabilidades entre capas.

**✅ Correcto:**

```typescript
// app/(dashboard)/overview/page.tsx
// SOLO orquestación: hooks + componentes
export default function OverviewPage() {
  const { metrics, isLoading } = useDashboardMetrics(); // Hook hace fetch

  if (isLoading) return <Spinner />;

  return <MetricsDisplay metrics={metrics} />; // Componente renderiza
}

// lib/hooks/useDashboardMetrics.ts
// SOLO data fetching + caching
export function useDashboardMetrics() {
  return useSWR('/metrics', () => api.metrics.get());
}

// components/Dashboard/MetricsDisplay.tsx
// SOLO UI rendering
export function MetricsDisplay({ metrics }: Props) {
  return <div>{formatNumber(metrics.total_requests_24h)}</div>;
}
```

**❌ Incorrecto:**

```typescript
// components/Dashboard/MetricsDisplay.tsx
export function MetricsDisplay() {
  // ❌ Fetching en componente visual (debería ser hook)
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetch('/api/metrics').then(r => r.json()).then(setMetrics);
  }, []);

  // ❌ Cálculo de color (debería ser util)
  const color = metrics.risk_score > 0.8 ? 'red' : 'green';

  return <div>...</div>;
}
```

---

### 2. Component Patterns

#### A. Server Components vs Client Components (Next.js 14)

**Regla:** Usa Server Components por defecto. Client Components solo cuando necesites:
- `useState`, `useEffect`, `useContext`
- Event handlers (`onClick`, `onChange`)
- Browser APIs (`localStorage`, `window`)

```typescript
// ✅ Server Component (por defecto)
// app/(dashboard)/overview/page.tsx
export default async function OverviewPage() {
  // Fetch en server (más rápido, no expone API Key)
  const metrics = await fetchMetrics();

  return <MetricsDisplay metrics={metrics} />;
}

// ✅ Client Component (con 'use client')
// components/Dashboard/InteractiveChart.tsx
'use client';

import { useState } from 'react';

export function InteractiveChart({ data }: Props) {
  const [selectedPillar, setSelectedPillar] = useState('bot_detection');

  return (
    <div onClick={() => setSelectedPillar('account_takeover')}>
      {/* Chart con interacción */}
    </div>
  );
}
```

**❌ Incorrecto:**

```typescript
// ❌ Usar 'use client' innecesariamente
'use client';

export function StaticCard({ title }: Props) {
  // No usa hooks ni event handlers
  return <div>{title}</div>;
}
```

#### B. Composición sobre Herencia

```typescript
// ✅ Correcto: Composición con props.children
export function Card({ children, title }: Props) {
  return (
    <div className="bg-white rounded shadow p-4">
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// Uso
<Card title="Risk Score">
  <RiskScoreGauge score={0.45} />
</Card>

// ❌ Incorrecto: Herencia (no es React way)
class Card extends BaseCard {
  render() { ... }
}
```

#### C. Props Destructuring

```typescript
// ✅ Correcto: Destructuring en parámetros
export function RiskScoreGauge({ score, action, className }: RiskScoreGaugeProps) {
  return <div className={className}>Score: {score}</div>;
}

// ❌ Incorrecto: Acceso via props.
export function RiskScoreGauge(props: RiskScoreGaugeProps) {
  return <div>Score: {props.score}</div>;
}
```

---

### 3. Patterns Prohibidos

#### ❌ NO usar Redux (innecesario para este proyecto)

```typescript
// ❌ Incorrecto: Redux es overkill
import { createStore } from 'redux';
const store = createStore(reducer);

// ✅ Correcto: Context + SWR es suficiente
const { tenant } = useAuth();
const { metrics } = useDashboardMetrics();
```

#### ❌ NO usar Class Components

```typescript
// ❌ Incorrecto: Class components (legacy)
class RiskScoreGauge extends React.Component {
  render() { ... }
}

// ✅ Correcto: Function components
export function RiskScoreGauge({ score }: Props) {
  return <div>...</div>;
}
```

#### ❌ NO usar Index Exports

```typescript
// ❌ Incorrecto: index.ts que re-exporta todo
// components/Dashboard/index.ts
export { RiskScoreGauge } from './RiskScoreGauge';
export { PillarScoresChart } from './PillarScoresChart';
// (Dificulta tree-shaking y debugging)

// ✅ Correcto: Import directo
import { RiskScoreGauge } from '@/components/Dashboard/RiskScoreGauge';
```

---

## 📂 ESTRUCTURA DE ARCHIVOS

### Ubicación Obligatoria por Tipo de Archivo

| Tipo | Ubicación | Ejemplo |
|------|-----------|---------|
| **Páginas** | `app/(group)/page.tsx` | `app/(dashboard)/overview/page.tsx` |
| **Layouts** | `app/(group)/layout.tsx` | `app/(dashboard)/layout.tsx` |
| **Componentes UI** | `components/[Domain]/[Name].tsx` | `components/Dashboard/RiskScoreGauge.tsx` |
| **Componentes Reutilizables** | `components/UI/[Name].tsx` | `components/UI/Button.tsx` |
| **Hooks** | `lib/hooks/[name].ts` | `lib/hooks/useDashboardMetrics.ts` |
| **API Client** | `lib/api/client.ts` | `lib/api/client.ts` |
| **Utils** | `lib/utils/[name].ts` | `lib/utils/format.ts` |
| **Types** | `types/[domain].ts` | `types/dashboard.ts` |
| **Context** | `context/[Name]Context.tsx` | `context/AuthContext.tsx` |
| **Constants** | `lib/constants.ts` | `lib/constants.ts` |
| **Styles** | `app/globals.css` | `app/globals.css` (único archivo CSS) |
| **Tests** | `__tests__/[path]/[name].test.tsx` | `__tests__/components/RiskScoreGauge.test.tsx` |

### Estructura de Componente (Template)

**Archivo:** `components/Dashboard/RiskScoreGauge.tsx`

```typescript
/**
 * RiskScoreGauge Component
 *
 * Displays risk score as a circular gauge with color-coded visualization.
 *
 * @module components/Dashboard
 * @see {@link types/dashboard.ts} for type definitions
 */

'use client'; // Solo si usa hooks o event handlers

import { useMemo } from 'react';
import { clsx } from 'clsx';
import type { ActionType } from '@/types/dashboard';
import { formatRiskScore, getRiskScoreColor } from '@/lib/utils/format';

// ============================================
// TYPES
// ============================================

interface RiskScoreGaugeProps {
  /**
   * Risk score value (0.0 - 1.0)
   */
  score: number;

  /**
   * Action type from fraud detection
   */
  action: ActionType;

  /**
   * Optional CSS classes
   */
  className?: string;
}

// ============================================
// CONSTANTS (component-scoped)
// ============================================

const GAUGE_SIZE = 128; // px
const STROKE_WIDTH = 8;

// ============================================
// COMPONENT
// ============================================

export function RiskScoreGauge({ score, action, className }: RiskScoreGaugeProps) {
  // Memoized calculations
  const color = useMemo(() => getRiskScoreColor(score), [score]);
  const percentage = useMemo(() => formatRiskScore(score), [score]);

  // Early return for invalid data
  if (score < 0 || score > 1) {
    console.error('Invalid risk score:', score);
    return null;
  }

  return (
    <div className={clsx('flex flex-col items-center', className)}>
      <svg width={GAUGE_SIZE} height={GAUGE_SIZE} viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={STROKE_WIDTH}
        />

        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeDasharray={`${score * 251} 251`}
          transform="rotate(-90 50 50)"
        />
      </svg>

      <div className="mt-2 text-center">
        <p className="text-2xl font-bold">{percentage}</p>
        <p className="text-sm text-gray-500">{action}</p>
      </div>
    </div>
  );
}
```

---

## 🔒 TYPESCRIPT & TYPE SAFETY

### 1. Strict Mode (Obligatorio)

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### 2. Type Definitions (SSOT)

**Archivo:** `types/dashboard.ts`

```typescript
/**
 * Dashboard Types
 *
 * Single source of truth for all dashboard-related types.
 * Mirrors backend API responses from DYGSOM Fraud Detection API.
 *
 * @module types/dashboard
 * @see {@link ../docs/ESPECIFICACION-TECNICA-FUNCIONAL-MVP.md} for API specs
 */

// ============================================
// ENUMS
// ============================================

export enum ActionType {
  Allow = 'allow',
  Block = 'block',
  Challenge = 'challenge',
  Friction = 'friction',
}

export enum PillarName {
  BotDetection = 'bot_detection',
  AccountTakeover = 'account_takeover',
  ApiSecurity = 'api_security',
  FraudMl = 'fraud_ml',
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Fraud detection score response from backend
 */
export interface ScoreResponse {
  request_id: string;
  tenant_id: string;
  user_id: string;
  action: ActionType;
  risk_score: number; // 0.0 - 1.0
  reason: string;
  pillar_scores: {
    bot_detection?: number;
    account_takeover?: number;
    api_security?: number;
    fraud_ml?: number;
  };
  signals?: PillarSignals;
  timestamp: string; // ISO 8601
  latency_ms: number;
}

/**
 * Dashboard metrics (aggregated, last 24h)
 */
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

/**
 * Pillar signals (detailed detection info)
 */
export interface PillarSignals {
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
}

// ============================================
// CONFIG TYPES
// ============================================

/**
 * Tenant configuration for pillars
 */
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
    bot_detection: ActionType;
    account_takeover: ActionType;
    api_security: ActionType;
    fraud_ml: ActionType;
  };
}

// ============================================
// PAGINATION TYPES
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * Make all properties of T nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Extract keys of T that are of type V
 */
export type KeysOfType<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];
```

### 3. Type Guards

```typescript
// lib/utils/typeGuards.ts
/**
 * Type guard: Check if error is ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as any).status === 'number'
  );
}

/**
 * Type guard: Check if value is ActionType
 */
export function isActionType(value: unknown): value is ActionType {
  return (
    typeof value === 'string' &&
    ['allow', 'block', 'challenge', 'friction'].includes(value)
  );
}

// Uso
try {
  await api.get();
} catch (error: unknown) {
  if (isApiError(error)) {
    // error es ApiError aquí (type narrowing)
    console.error('API Error:', error.status);
  } else {
    console.error('Unknown error:', error);
  }
}
```

### 4. Prohibiciones de Tipos

```typescript
// ❌ Prohibido: any type
function format(data: any) { ... } // ❌ NO

// ✅ Correcto: Generic con constraint
function format<T extends Record<string, unknown>>(data: T) { ... }

// ❌ Prohibido: Type assertion sin validación
const metrics = data as DashboardMetrics; // ❌ NO

// ✅ Correcto: Validación con Zod
import { z } from 'zod';

const DashboardMetricsSchema = z.object({
  total_requests_24h: z.number(),
  blocked_requests_24h: z.number(),
  // ...
});

const metrics = DashboardMetricsSchema.parse(data); // ✅ Runtime validation

// ❌ Prohibido: Non-null assertion
const tenant = useAuth().tenant!; // ❌ NO

// ✅ Correcto: Optional chaining + null check
const tenant = useAuth().tenant;
if (!tenant) {
  redirect('/login');
}
```

---

## ⚛️ REACT & NEXT.JS BEST PRACTICES

### 1. Hooks Rules

```typescript
// ✅ Correcto: Hooks en top-level
export function MyComponent() {
  const { tenant } = useAuth();
  const { metrics } = useDashboardMetrics();
  const [state, setState] = useState(0);

  return <div>...</div>;
}

// ❌ Incorrecto: Hooks condicionales
export function MyComponent({ condition }: Props) {
  if (condition) {
    const { tenant } = useAuth(); // ❌ Conditional hook
  }

  return <div>...</div>;
}

// ❌ Incorrecto: Hooks en loops
export function MyComponent({ items }: Props) {
  items.forEach(() => {
    const [state] = useState(0); // ❌ Hook in loop
  });

  return <div>...</div>;
}
```

### 2. useEffect Dependencies

```typescript
// ✅ Correcto: Todas las dependencias incluidas
useEffect(() => {
  fetchData(userId, apiKey);
}, [userId, apiKey]); // ✅ Todas las deps

// ❌ Incorrecto: Dependencias faltantes
useEffect(() => {
  fetchData(userId, apiKey);
}, []); // ❌ Missing deps (ESLint warning)

// ✅ Correcto: Función estable con useCallback
const fetchData = useCallback(async () => {
  const data = await api.get(userId);
}, [userId]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

### 3. Memoization (useMemo, useCallback)

**Regla:** Usa memoization SOLO cuando sea necesario (cálculos pesados, prevenir re-renders).

```typescript
// ✅ Correcto: Memoizar cálculo pesado
export function ExpensiveChart({ data }: Props) {
  const processedData = useMemo(() => {
    // Cálculo pesado: 1000+ items
    return data.map(item => ({
      ...item,
      processed: complexCalculation(item),
    }));
  }, [data]);

  return <Chart data={processedData} />;
}

// ❌ Incorrecto: Memoizar cálculo simple (overhead innecesario)
export function SimpleComponent({ score }: Props) {
  const percentage = useMemo(() => {
    return Math.round(score * 100); // ❌ Muy simple, no necesita memo
  }, [score]);

  return <div>{percentage}%</div>;
}

// ✅ Correcto: Sin memo para cálculo simple
export function SimpleComponent({ score }: Props) {
  const percentage = Math.round(score * 100); // ✅ Simple, sin memo

  return <div>{percentage}%</div>;
}
```

### 4. Next.js App Router

```typescript
// ✅ Correcto: Loading UI
// app/(dashboard)/overview/loading.tsx
export default function Loading() {
  return <Spinner />;
}

// ✅ Correcto: Error UI
// app/(dashboard)/overview/error.tsx
'use client';

export default function Error({ error, reset }: Props) {
  return (
    <div>
      <h1>Error: {error.message}</h1>
      <button onClick={reset}>Try again</button>
    </div>
  );
}

// ✅ Correcto: Not Found
// app/(dashboard)/overview/not-found.tsx
export default function NotFound() {
  return <div>Page not found</div>;
}

// ✅ Correcto: Metadata
// app/(dashboard)/overview/page.tsx
export const metadata = {
  title: 'Overview - DYGSOM Dashboard',
  description: 'Fraud detection metrics and analytics',
};
```

---

## 🔄 GESTIÓN DE ESTADO

### 1. Estado Local (useState)

**Regla:** Usa `useState` para estado del componente (UI state).

```typescript
// ✅ Correcto: UI state local
export function FilterPanel() {
  const [selectedAction, setSelectedAction] = useState<ActionType | 'all'>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  return (
    <div>
      <Select value={selectedAction} onChange={setSelectedAction} />
      <DateRangePicker value={dateRange} onChange={setDateRange} />
    </div>
  );
}
```

### 2. Estado Global (Context)

**Regla:** Usa Context SOLO para estado global (auth, theme, config).

**Archivo:** `context/AuthContext.tsx`

```typescript
/**
 * AuthContext - Global authentication state
 *
 * Provides tenant data and API Key to all components.
 *
 * @module context/AuthContext
 */

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Tenant } from '@/types/dashboard';

// ============================================
// TYPES
// ============================================

interface AuthContextType {
  tenant: Tenant | null;
  apiKey: string | null;
  isLoading: boolean;
  login: (apiKey: string) => Promise<void>;
  logout: () => void;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
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
        `${process.env.NEXT_PUBLIC_API_URL}/auth/validate`,
        {
          method: 'POST',
          headers: { 'x-api-key': key },
        }
      );

      if (!response.ok) {
        throw new Error('Invalid API Key');
      }

      const data = await response.json();
      setTenant(data);
      setApiKey(key);
      localStorage.setItem('dygsom_api_key', key);
    } catch (error: unknown) {
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

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

### 3. Server State (SWR)

**Regla:** Usa SWR para data fetching + caching del backend.

```typescript
// lib/hooks/useDashboardMetrics.ts
import useSWR from 'swr';
import { api } from '@/lib/api/client';
import type { DashboardMetrics } from '@/types/dashboard';

export function useDashboardMetrics() {
  const { data, error, mutate, isLoading } = useSWR<DashboardMetrics>(
    '/metrics',
    () => api.metrics.get(),
    {
      refreshInterval: 30000, // Poll every 30s
      revalidateOnFocus: true,
      dedupingInterval: 5000,
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  return {
    metrics: data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
```

---

## 🌐 API INTEGRATION

### 1. API Client (Centralizado)

**Archivo:** `lib/api/client.ts`

```typescript
/**
 * API Client - HTTP requests to DYGSOM backend
 *
 * Centralized fetch wrapper with authentication and error handling.
 *
 * @module lib/api/client
 * @see {@link ../docs/PASOS-DESARROLLO-MVP.md} for backend API specs
 */

// ============================================
// CONSTANTS
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

// ============================================
// ERROR TYPES
// ============================================

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ============================================
// CORE REQUEST FUNCTION
// ============================================

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Get API Key from localStorage
  const apiKey = localStorage.getItem('dygsom_api_key');

  if (!apiKey) {
    throw new Error('No API Key found. Please login.');
  }

  // Make request
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      ...options.headers,
    },
  });

  // Handle errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `API Error: ${response.statusText}`,
      errorData
    );
  }

  // Parse response
  return response.json();
}

// ============================================
// API ENDPOINTS
// ============================================

export const api = {
  // Auth
  auth: {
    validate: () =>
      apiRequest<Tenant>('/auth/validate', { method: 'POST' }),
  },

  // Scores
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
        Object.entries(params || {})
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)])
      );
      return apiRequest<PaginatedResponse<ScoreResponse>>(
        `/scores/recent?${query}`
      );
    },
  },

  // Metrics
  metrics: {
    get: () => apiRequest<DashboardMetrics>('/metrics'),
  },

  // Analytics
  analytics: {
    fraudRate: (params?: { interval?: string; days?: number }) => {
      const query = new URLSearchParams(
        Object.entries(params || {}).map(([k, v]) => [k, String(v)])
      );
      return apiRequest<{ data: FraudRateTrend[] }>(
        `/analytics/fraud-rate?${query}`
      );
    },
    volume: (params?: { interval?: string; days?: number }) => {
      const query = new URLSearchParams(
        Object.entries(params || {}).map(([k, v]) => [k, String(v)])
      );
      return apiRequest<{ data: VolumeTrend[] }>(
        `/analytics/volume?${query}`
      );
    },
    riskDistribution: () =>
      apiRequest<{ distribution: RiskDistribution }>(
        '/analytics/risk-distribution'
      ),
    export: (params?: { format?: string; start_date?: string; end_date?: string }) => {
      const query = new URLSearchParams(
        Object.entries(params || {}).map(([k, v]) => [k, String(v)])
      );
      return apiRequest<Blob>(`/analytics/export?${query}`);
    },
  },

  // API Keys
  apiKeys: {
    list: () =>
      apiRequest<{ keys: ApiKeyResponse[] }>('/api-keys'),
    create: (name: string) =>
      apiRequest<ApiKeyResponse>('/api-keys', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    revoke: (id: string) =>
      apiRequest<{ message: string }>(`/api-keys/${id}`, {
        method: 'DELETE',
      }),
  },

  // Tenant Config
  tenant: {
    getConfig: () =>
      apiRequest<{ config: TenantConfig }>('/tenant/config'),
    updateConfig: (config: Partial<TenantConfig>) =>
      apiRequest<{ config: TenantConfig; message: string }>(
        '/tenant/config',
        {
          method: 'PATCH',
          body: JSON.stringify(config),
        }
      ),
  },
};
```

### 2. Error Handling en API Calls

```typescript
// ✅ Correcto: Try/catch con type guard
async function loadMetrics() {
  try {
    const metrics = await api.metrics.get();
    return metrics;
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      if (error.status === 401) {
        // Redirect to login
        redirect('/login');
      } else if (error.status === 429) {
        // Rate limit exceeded
        toast.error('Too many requests. Please wait.');
      } else {
        toast.error(`API Error: ${error.message}`);
      }
    } else {
      toast.error('Unknown error occurred');
    }
    throw error; // Re-throw para que SWR maneje
  }
}
```

---

## 🚨 ERROR HANDLING

### 1. Error Boundaries (React)

**Archivo:** `components/ErrorBoundary.tsx`

```typescript
/**
 * ErrorBoundary - Catches React errors in component tree
 *
 * @module components/ErrorBoundary
 */

'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: (error: Error) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    // TODO: Log to error tracking service (Sentry, etc.)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!);
      }

      return (
        <div className="p-8 bg-red-50 text-red-900 rounded">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p>{this.state.error?.message}</p>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. Try/Catch Pattern

```typescript
// ✅ Correcto: Específico + type guard
try {
  const result = await riskyOperation();
  return result;
} catch (error: unknown) {
  if (error instanceof ApiError) {
    console.error('API Error:', error.status, error.message);
  } else if (error instanceof TypeError) {
    console.error('Type Error:', error.message);
  } else {
    console.error('Unknown error:', error);
  }
  throw error; // Re-throw si necesario
}

// ❌ Incorrecto: Catch genérico sin tipo
try {
  await riskyOperation();
} catch (error) { // ❌ Sin tipo
  console.error(error.message); // TS Error
}

// ❌ Incorrecto: Catch vacío (swallow errors)
try {
  await riskyOperation();
} catch (error) {
  // ❌ No hacer nada = bug silencioso
}
```

---

## 📝 LOGGING & DEBUGGING

### 1. NO console.log en Producción

```typescript
// ❌ Prohibido: console.log directo
export function MyComponent() {
  console.log('Rendering component'); // ❌ NO
  return <div>...</div>;
}

// ✅ Correcto: Logger estructurado
// lib/utils/logger.ts
export const logger = {
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, data);
    }
  },

  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error);
    // TODO: Send to error tracking (Sentry)
  },

  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
};

// Uso
import { logger } from '@/lib/utils/logger';

export function MyComponent() {
  logger.info('Component rendered', { componentName: 'MyComponent' });
  return <div>...</div>;
}
```

### 2. Debug con React DevTools

```typescript
// ✅ Correcto: useDebugValue en custom hooks
export function useDashboardMetrics() {
  const { data, error } = useSWR('/metrics', fetcher);

  // Debug info visible en React DevTools
  useDebugValue(
    data ? `${data.total_requests_24h} requests` : 'Loading...'
  );

  return { metrics: data, isError: error };
}
```

---

## 🎨 STYLING & UI

### 1. Tailwind CSS (Único sistema de estilos)

**Regla:** Usa SOLO Tailwind CSS. NO CSS modules, NO styled-components.

```typescript
// ✅ Correcto: Tailwind classes
export function Card({ children }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {children}
    </div>
  );
}

// ❌ Incorrecto: Inline styles
export function Card({ children }: Props) {
  return (
    <div style={{ background: 'white', padding: '24px' }}> {/* ❌ NO */}
      {children}
    </div>
  );
}

// ❌ Incorrecto: CSS modules
import styles from './Card.module.css'; // ❌ NO
```

### 2. Clsx para Conditional Classes

```typescript
import { clsx } from 'clsx';

// ✅ Correcto: clsx para clases condicionales
export function Button({ variant, disabled }: Props) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded font-medium',
        {
          'bg-blue-600 text-white': variant === 'primary',
          'bg-gray-200 text-gray-700': variant === 'secondary',
          'opacity-50 cursor-not-allowed': disabled,
        }
      )}
    >
      Click me
    </button>
  );
}

// ❌ Incorrecto: String concatenation
export function Button({ variant }: Props) {
  const className = 'px-4 py-2 ' +
    (variant === 'primary' ? 'bg-blue-600' : 'bg-gray-200'); // ❌ NO

  return <button className={className}>Click me</button>;
}
```

### 3. Responsive Design (Mobile First)

```typescript
// ✅ Correcto: Mobile first con breakpoints
<div className="
  grid
  grid-cols-1         /* Mobile: 1 columna */
  md:grid-cols-2      /* Tablet: 2 columnas */
  lg:grid-cols-3      /* Desktop: 3 columnas */
  gap-4
">
  <Card />
  <Card />
  <Card />
</div>

// Breakpoints Tailwind:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
```

### 4. Theme (Tailwind Config)

**Archivo:** `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        risk: {
          low: '#10b981',     // Verde
          medium: '#eab308',  // Amarillo
          high: '#f59e0b',    // Naranja
          critical: '#ef4444', // Rojo
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
```

---

## 🧪 TESTING STANDARDS

### 1. Estructura de Tests

```
__tests__/
├── components/
│   ├── Dashboard/
│   │   ├── RiskScoreGauge.test.tsx
│   │   └── PillarScoresChart.test.tsx
│   └── UI/
│       └── Button.test.tsx
├── lib/
│   ├── utils/
│   │   └── format.test.ts
│   └── api/
│       └── client.test.ts
└── integration/
    └── auth-flow.test.tsx
```

### 2. Unit Tests (Vitest + Testing Library)

```typescript
/**
 * RiskScoreGauge Component Tests
 *
 * @module __tests__/components/Dashboard
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskScoreGauge } from '@/components/Dashboard/RiskScoreGauge';

describe('RiskScoreGauge', () => {
  it('renders score as percentage', () => {
    render(<RiskScoreGauge score={0.45} action="allow" />);
    expect(screen.getByText('45%')).toBeInTheDocument();
  });

  it('shows correct action label', () => {
    render(<RiskScoreGauge score={0.85} action="block" />);
    expect(screen.getByText('block')).toBeInTheDocument();
  });

  it('applies correct color for high risk', () => {
    const { container } = render(<RiskScoreGauge score={0.9} action="block" />);
    const circle = container.querySelector('circle[stroke="#ef4444"]');
    expect(circle).toBeInTheDocument();
  });

  it('returns null for invalid score', () => {
    const { container } = render(<RiskScoreGauge score={1.5} action="allow" />);
    expect(container.firstChild).toBeNull();
  });
});
```

### 3. Integration Tests

```typescript
// __tests__/integration/auth-flow.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/context/AuthContext';
import LoginPage from '@/app/(auth)/login/page';

describe('Authentication Flow', () => {
  it('logs in user with valid API key', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          tenant_id: 'tenant-123',
          tenant_name: 'Test Tenant',
          config: { ... },
        }),
      })
    );

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const input = screen.getByPlaceholderText(/dys_prod/i);
    const button = screen.getByRole('button', { name: /login/i });

    await userEvent.type(input, 'dys_prod_test_key_123');
    await userEvent.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/validate'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'x-api-key': 'dys_prod_test_key_123',
          }),
        })
      );
    });
  });
});
```

### 4. Coverage Mínimo

```json
// package.json
{
  "scripts": {
    "test": "vitest run",
    "test:coverage": "vitest run --coverage"
  },
  "vitest": {
    "coverage": {
      "provider": "v8",
      "reporter": ["text", "json", "html"],
      "thresholds": {
        "lines": 80,
        "functions": 80,
        "branches": 75,
        "statements": 80
      }
    }
  }
}
```

**Mínimos requeridos:**
- **Lines:** 80%
- **Functions:** 80%
- **Branches:** 75%
- **Statements:** 80%

---

## ⚡ PERFORMANCE

### 1. Image Optimization

```typescript
// ✅ Correcto: Next.js Image component
import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="DYGSOM Logo"
      width={120}
      height={40}
      priority // Above-the-fold
    />
  );
}

// ❌ Incorrecto: <img> tag
export function Logo() {
  return <img src="/logo.png" alt="DYGSOM Logo" />; // ❌ NO
}
```

### 2. Code Splitting (Dynamic Imports)

```typescript
// ✅ Correcto: Dynamic import para componentes pesados
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('@/components/Dashboard/HeavyChart'), {
  loading: () => <Spinner />,
  ssr: false, // Solo client-side si necesario
});

export function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      <HeavyChart data={data} />
    </div>
  );
}
```

### 3. Lazy Loading (Intersection Observer)

```typescript
// ✅ Correcto: Lazy load below-the-fold content
'use client';

import { useEffect, useRef, useState } from 'react';

export function LazySection({ children }: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? children : <div className="h-64" />}
    </div>
  );
}
```

---

## 🔒 SECURITY

### 1. API Key Storage

```typescript
// ✅ Correcto: localStorage (client-side only)
localStorage.setItem('dygsom_api_key', apiKey);

// ❌ Incorrecto: Hardcoded API Key
const API_KEY = 'dys_prod_abc123'; // ❌ NO
```

### 2. XSS Prevention

```typescript
// ✅ Correcto: React escapes by default
export function UserName({ name }: Props) {
  return <h1>{name}</h1>; // ✅ Auto-escaped
}

// ❌ Incorrecto: dangerouslySetInnerHTML sin sanitize
export function UserBio({ bio }: Props) {
  return <div dangerouslySetInnerHTML={{ __html: bio }} />; // ❌ XSS risk
}

// ✅ Correcto: Sanitize con DOMPurify si necesario
import DOMPurify from 'isomorphic-dompurify';

export function UserBio({ bio }: Props) {
  const sanitized = DOMPurify.sanitize(bio);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}
```

### 3. CSRF Protection (Next.js)

```typescript
// ✅ Correcto: Next.js API routes tienen CSRF protection por defecto
// app/api/example/route.ts
export async function POST(request: Request) {
  // CSRF token verificado automáticamente
  const body = await request.json();
  return Response.json({ success: true });
}
```

---

## 📝 GIT & COMMITS

### 1. Commit Message Format

```bash
# ✅ Formato correcto:
<type>(<scope>): <subject>

# Types:
feat:     Nueva feature (Dashboard overview page)
fix:      Bug fix (Risk score gauge color)
refactor: Refactor sin cambiar funcionalidad
style:    Cambios de estilo (Tailwind classes)
test:     Agregar/modificar tests
docs:     Documentación
chore:    Mantenimiento (dependencies update)

# Ejemplos:
feat(dashboard): add risk score gauge component
fix(auth): handle expired API key correctly
refactor(api): extract fetch wrapper to client.ts
test(components): add tests for PillarScoresChart
docs(readme): update installation instructions

# ❌ Incorrecto:
WIP
fixed stuff
updated code
```

### 2. Branch Naming

```bash
# ✅ Correcto:
feature/dashboard-overview
fix/api-error-handling
refactor/auth-context
test/component-coverage

# ❌ Incorrecto:
my-branch
test
feature1
```

### 3. Co-Authored-By

```bash
# Si trabajas con Copilot o pair programming:
git commit -m "feat(dashboard): add pillar scores chart

Co-Authored-By: GitHub Copilot <noreply@github.com>"
```

---

## 🚫 PROHIBICIONES

### 1. Código Prohibido

```typescript
// ❌ NO USAR: any type
function format(data: any) { ... }

// ❌ NO USAR: console.log en código final
console.log('Debug:', data);

// ❌ NO USAR: Emojis en código o UI
const message = '¡Bienvenido! 🎉'; // ❌ NO

// ❌ NO USAR: var (usar const/let)
var count = 0; // ❌ NO

// ❌ NO USAR: require (usar import)
const api = require('./api'); // ❌ NO

// ❌ NO USAR: == o != (usar === o !==)
if (value == '5') { ... } // ❌ NO

// ❌ NO USAR: Non-null assertion
const tenant = useAuth().tenant!; // ❌ NO

// ❌ NO USAR: @ts-ignore
// @ts-ignore
const invalid = data.nonExistent; // ❌ NO
```

### 2. Librerías Prohibidas

```bash
# ❌ NO instalar:
npm install jquery            # ❌ NO (innecesario con React)
npm install lodash            # ❌ NO (usar utils nativos)
npm install moment            # ❌ NO (usar date-fns)
npm install redux             # ❌ NO (overkill, usar Context+SWR)
npm install styled-components # ❌ NO (usar Tailwind)
npm install emotion           # ❌ NO (usar Tailwind)
npm install sass              # ❌ NO (usar Tailwind)
```

### 3. Patterns Prohibidos

```typescript
// ❌ NO USAR: Class components
class MyComponent extends React.Component { ... }

// ❌ NO USAR: Index exports
// components/Dashboard/index.ts
export * from './RiskScoreGauge';

// ❌ NO USAR: Default exports en utils
// lib/utils/format.ts
export default function format() { ... } // ❌ NO

// ❌ NO CREAR: CSS files (usar Tailwind)
// components/Button.module.css // ❌ NO

// ❌ NO USAR: Inline styles
<div style={{ color: 'red' }}>...</div> // ❌ NO
```

---

## 📚 HEADER ESTÁNDAR

### Archivos TypeScript/TSX

```typescript
/**
 * [Nombre del Módulo] - [Breve descripción]
 *
 * [Descripción detallada de 1-3 líneas sobre la responsabilidad
 * del módulo, componente o función]
 *
 * @module [ruta del módulo sin extensión]
 * @see {@link [referencia a doc relacionada]} [descripción]
 *
 * @example
 * ```typescript
 * // Ejemplo de uso (opcional)
 * import { functionName } from '@/module/path';
 *
 * const result = functionName(params);
 * ```
 */

// Imports (agrupados)
import { useState } from 'react';           // React
import { useRouter } from 'next/navigation'; // Next.js
import { clsx } from 'clsx';                // External libs
import type { MyType } from '@/types';      // Internal types
import { api } from '@/lib/api/client';     // Internal modules
import { formatDate } from '@/lib/utils';   // Internal utils

// Types (antes del componente)
interface MyComponentProps {
  /**
   * Descripción del prop
   */
  propName: string;
}

// Constants (component-scoped)
const MAX_ITEMS = 10;

// Main component/function
export function MyComponent({ propName }: MyComponentProps) {
  // Implementation
}
```

**Ejemplo completo:**

```typescript
/**
 * RiskScoreGauge Component
 *
 * Displays risk score (0.0-1.0) as a circular gauge with color-coded
 * visualization. Color changes based on risk level: green (low), yellow
 * (medium), orange (high), red (critical).
 *
 * @module components/Dashboard/RiskScoreGauge
 * @see {@link types/dashboard.ts} for type definitions
 *
 * @example
 * ```typescript
 * import { RiskScoreGauge } from '@/components/Dashboard/RiskScoreGauge';
 *
 * <RiskScoreGauge score={0.75} action="challenge" />
 * ```
 */

'use client';

import { useMemo } from 'react';
import { clsx } from 'clsx';
import type { ActionType } from '@/types/dashboard';
import { formatRiskScore, getRiskScoreColor } from '@/lib/utils/format';

interface RiskScoreGaugeProps {
  /**
   * Risk score value (0.0 - 1.0)
   */
  score: number;

  /**
   * Action type from fraud detection
   */
  action: ActionType;

  /**
   * Optional CSS classes
   */
  className?: string;
}

const GAUGE_SIZE = 128;
const STROKE_WIDTH = 8;

export function RiskScoreGauge({ score, action, className }: RiskScoreGaugeProps) {
  // ... implementation
}
```

---

## ✅ CHECKLIST PRE-COMMIT

Antes de cada commit, verifica:

- [ ] TypeScript compila sin errores (`npm run type-check`)
- [ ] ESLint pasa sin errores (`npm run lint`)
- [ ] Tests pasan (`npm test`)
- [ ] No hay `console.log` en código final
- [ ] No hay `any` types
- [ ] No hay emojis en código o UI
- [ ] Imports organizados (React → External → Internal)
- [ ] Componentes tienen tipos explícitos
- [ ] Error handling con `error: unknown`
- [ ] Commit message sigue formato `<type>(<scope>): <subject>`
- [ ] Código sigue RULES.md (este documento)

---

## 📞 REFERENCIAS

- **Backend API Docs:** [ESPECIFICACION-TECNICA-FUNCIONAL-MVP.md](../docs/ESPECIFICACION-TECNICA-FUNCIONAL-MVP.md)
- **Desarrollo Dashboard:** [PASOS_DESARROLLO_DASHBOARD.md](../docs/PASOS_DESARROLLO_DASHBOARD.md)
- **Arquitectura AWS:** [ARQUITECTURA_INTERFACES_DASH.md](../docs/ARQUITECTURA_INTERFACES_DASH.md)
- **Contexto Copilot:** [CONTEXTO-DESARROLLO-COPILOT.md](./CONTEXTO-DESARROLLO-COPILOT.md)
- **Backend RULES:** [D:\code\dygsom\dygsom-fraud-detection\RULES.md](../dygsom-fraud-detection/RULES.md)

---

**FIN DE RULES_DASH.MD**

**Última actualización:** 12 Enero 2026
**Versión:** 1.0
**Autor:** Claude Sonnet 4.5 + Equipo DYGSOM
**Status:** Obligatorio para todo el equipo de desarrollo
