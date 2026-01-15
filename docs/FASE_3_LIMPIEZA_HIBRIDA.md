# 🧹 GUÍA DE LIMPIEZA - SISTEMA HÍBRIDO FASE 3

## 📋 Resumen del Sistema Implementado

Se implementó un **sistema híbrido** para la Fase 3 del Dashboard que permite:

- **Usuario especial** (`usuario1@dygsom.pe` / `SecurePASS123`) → **Datos MOCKUP** (ambiente de pruebas)
- **Usuarios normales** → **Datos REALES** de la API (ambiente de producción)

Esta estrategia permite tener un entorno de testing controlado mientras los usuarios normales trabajan con datos reales.

---

## 🗂️ ARCHIVOS CREADOS/MODIFICADOS

### **Nuevos Archivos Creados**

```
📁 lib/config/
├── data-mode.ts                    # ✅ Configuración del sistema híbrido

📁 lib/mock/  
├── data.ts                         # ✅ Datos mockup para testing

📁 lib/api/
├── hybrid.ts                       # ✅ Servicio API híbrido

📁 components/ui/
├── data-mode-indicator.tsx         # ✅ Indicadores visuales de modo
```

### **Archivos Modificados**

```
📁 app/(dashboard)/
├── page.tsx                        # ✅ Dashboard principal con sistema híbrido
├── transactions/page.tsx           # ✅ Página de transacciones con sistema híbrido

📁 Environment Files
├── .env.example                    # ✅ Variables de configuración
├── .env.local                      # ✅ Variables locales
```

---

## 🔧 FUNCIONALIDADES IMPLEMENTADAS

### **1. Sistema de Detección de Usuario**
- **Archivo:** `lib/config/data-mode.ts`
- **Función:** Detecta automáticamente si el usuario logueado es el especial
- **Logic:** `email === 'usuario1@dygsom.pe'` → Modo TEST, otros → Modo PRODUCTION

### **2. Servicio API Híbrido**
- **Archivo:** `lib/api/hybrid.ts`
- **Funciones principales:**
  - `getAnalyticsHybrid()` - Analytics dashboard
  - `getRecentTransactionsHybrid()` - Lista de transacciones
  - `getModelInfoHybrid()` - Información del modelo ML
  - `getApiKeysHybrid()` - API keys management
  - `getUserProfileHybrid()` - Perfil de usuario

### **3. Datos Mockup Realistas**
- **Archivo:** `lib/mock/data.ts`
- **Incluye:**
  - 4,567 transacciones simuladas
  - Distribución realista de riesgo (75% low, 18% medium, 5% high, 2% critical)
  - Métricas del modelo ML de prueba
  - API keys de testing
  - Función generadora de transacciones aleatorias

### **4. Indicadores Visuales**
- **Archivo:** `components/ui/data-mode-indicator.tsx`
- **Componentes:**
  - `DataModeIndicator` - Badge naranja para usuario TEST
  - `ModelInfoCard` - Card con información del modelo (TEST vs PROD)

---

## 🎯 PROCESO DE LIMPIEZA FUTURA

### **OPCIÓN A: Eliminar Sistema Híbrido (Ir 100% Producción)**

**Cuando:** Todos los endpoints reales estén implementados y probados

**Pasos:**
1. **Eliminar archivos mockup:**
   ```bash
   rm lib/config/data-mode.ts
   rm lib/mock/data.ts
   rm lib/api/hybrid.ts
   rm components/ui/data-mode-indicator.tsx
   ```

2. **Revertir archivos de páginas:**
   ```typescript
   // app/(dashboard)/page.tsx
   - import { getAnalyticsHybrid } from '@/lib/api/hybrid';
   + import { dashboardApi } from '@/lib/api';
   
   - data = await getAnalyticsHybrid(user?.email || null, days);
   + data = await dashboardApi.getAnalytics(days);
   
   // Eliminar componentes visuales
   - <DataModeIndicator />
   - <ModelInfoCard />
   ```

3. **Limpiar variables de entorno:**
   ```bash
   # Remover de .env.example y .env.local:
   - NEXT_PUBLIC_TEST_USER_EMAIL=usuario1@dygsom.pe
   - NEXT_PUBLIC_TEST_USER_PASSWORD=SecurePASS123
   ```

### **OPCIÓN B: Mantener Sistema para Testing Permanente**

**Cuando:** Se quiere conservar la capacidad de testing con datos controlados

**Pasos:**
1. **Agregar más usuarios de testing:**
   ```typescript
   // lib/config/data-mode.ts
   export const TEST_USERS = [
     'usuario1@dygsom.pe',
     'admin@dygsom.pe', 
     'testing@dygsom.pe'
   ];
   ```

2. **Crear flag de configuración:**
   ```typescript
   // config/constants.ts
   export const FEATURE_FLAGS = {
     ENABLE_HYBRID_MODE: process.env.NEXT_PUBLIC_ENABLE_HYBRID_MODE === 'true'
   };
   ```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### **Seguridad**
- ❌ **NUNCA** commitear credenciales reales en `.env.local`
- ✅ Usuario de testing usa credenciales públicas (está bien para mockup)
- ✅ Usuarios reales NO pueden acceder a datos mockup

### **Performance**
- ✅ Datos mockup tienen delay simulado (200-300ms) para realismo
- ✅ No hay impacto en performance para usuarios de producción
- ✅ Lazy loading de componentes visuales

### **Mantenimiento**
- 📊 Datos mockup requieren actualización periódica para mantenerse realistas
- 🔄 Agregar nuevos endpoints al servicio híbrido cuando se implementen
- 📝 Documentar cualquier cambio en esta guía

---

## 🧪 TESTING DEL SISTEMA

### **Probar Modo TEST (usuario1@dygsom.pe)**
```bash
# 1. Iniciar dashboard
cd dygsom-fraud-dashboard
npm run dev

# 2. Abrir http://localhost:3000/login
# 3. Login con:
#    Email: usuario1@dygsom.pe  
#    Password: SecurePASS123

# 4. Verificar:
#    ✅ Badge naranja "MODO TEST" visible
#    ✅ Datos consistentes (4,567 transacciones)
#    ✅ ModelInfoCard muestra "v2.1.0-test"
#    ✅ Transacciones tienen IDs que empiezan con "test_"
```

### **Probar Modo PRODUCCIÓN (cualquier otro usuario)**
```bash
# 1. Crear usuario normal en API o usar existente
# 2. Login con usuario normal
# 3. Verificar:
#    ✅ NO se ve badge de "MODO TEST" 
#    ✅ Datos vienen de API real
#    ✅ ModelInfoCard muestra "v1.2.1-production"
#    ✅ Transacciones son reales del backend
```

---

## 🚀 COMANDOS ÚTILES

```bash
# Verificar que usuario está en modo test
grep -r "usuario1@dygsom.pe" lib/

# Encontrar todos los usos del sistema híbrido  
grep -r "Hybrid\|isTestMode\|getDataMode" app/ lib/ components/

# Ver logs del sistema en desarrollo
# Buscar: "Analytics request", "mode", "isTestMode"

# Construir para producción (verificar que no hay errores)
npm run build
```

---

## 📊 MÉTRICAS DE TESTING

**Datos Mockup Implementados:**
- ✅ Analytics: 4,567 transacciones, 2.01% fraude
- ✅ Transacciones: 5 transacciones + generador aleatorio  
- ✅ Modelo: v2.1.0-test, 88.7% precisión
- ✅ API Keys: 3 keys de prueba
- ✅ Usuario: Perfil completo de testing

**Cobertura de Funcionalidades:**
- ✅ Dashboard principal
- ✅ Página de transacciones  
- ✅ Información de modelo ML
- ⚠️ Pendiente: Analytics avanzados, API keys management

---

## 📞 CONTACTO

**Para dudas sobre limpieza:**
- Revisar este documento
- Verificar logs en desarrollo 
- Probar ambos modos antes de hacer cambios

**Última actualización:** 09 Diciembre 2025  
**Versión del sistema:** Fase 3 - Sistema Híbrido v1.0  
**Estado:** ✅ Completamente implementado y funcional