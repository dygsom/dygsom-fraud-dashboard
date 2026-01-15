# 🚀 Despliegue AWS Amplify - Dashboard Tenant

Este documento describe el proceso de despliegue del Dashboard Tenant en AWS Amplify (región sa-east-1).

## 📋 Pre-requisitos

1. **Cuenta AWS configurada:** 686331808
2. **Región:** sa-east-1 (São Paulo)
3. **GitHub repo:** dygsom-fraud-dashboard
4. **Backend API desplegado:** https://api.dygsom.pe/v1

## 📁 Archivos de Configuración

### amplify.yml
Configuración de build para AWS Amplify. Define:
- Fase preBuild: `npm ci`
- Fase build: Crear `.env.production` + `npm run build`
- Artifacts: `.next/**/*`
- Cache: `node_modules`, `.next/cache`

### .env.production
Variables de entorno para producción:
```bash
NEXT_PUBLIC_API_URL=https://api.dygsom.pe/v1
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 🔧 Pasos de Despliegue

### 1. Crear App en Amplify (AWS CLI)

```bash
# Configurar perfil AWS
aws configure --profile dygsom-latam
# Region: sa-east-1

# Crear app
aws amplify create-app \
  --name dygsom-dashboard-tenant-latam \
  --description "DYGSOM Tenant Dashboard - Production sa-east-1" \
  --platform WEB \
  --environment-variables "NEXT_PUBLIC_API_URL=https://api.dygsom.pe/v1,NODE_ENV=production,NEXT_PUBLIC_AWS_REGION=sa-east-1" \
  --enable-branch-auto-build \
  --region sa-east-1 \
  --profile dygsom-latam
```

### 2. Conectar GitHub

**Opción A: AWS Console (Recomendado)**
1. Ir a: https://sa-east-1.console.aws.amazon.com/amplify
2. Seleccionar app: dygsom-dashboard-tenant-latam
3. Connect to GitHub
4. Autorizar acceso
5. Seleccionar repo: dygsom-fraud-dashboard
6. Branch: main
7. Confirmar auto-deploy

**Opción B: GitHub Personal Access Token**
```bash
# Generar token en: https://github.com/settings/tokens
# Scopes necesarios: repo, admin:repo_hook

GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"

aws amplify create-branch \
  --app-id <APP_ID> \
  --branch-name main \
  --enable-auto-build \
  --region sa-east-1 \
  --profile dygsom-latam
```

### 3. Configurar Environment Variables (Amplify Console)

**Variables requeridas:**
```
NEXT_PUBLIC_API_URL=https://api.dygsom.pe/v1
NODE_ENV=production
NEXT_PUBLIC_AWS_REGION=sa-east-1
NEXT_PUBLIC_APP_NAME=DYGSOM Fraud Dashboard
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_TELEMETRY_DISABLED=1
```

**En Amplify Console:**
1. App settings → Environment variables
2. Agregar cada variable
3. Save

### 4. Iniciar Build

**Opción A: Push a GitHub**
```bash
git add amplify.yml .env.production
git commit -m "build: amplify config for sa-east-1 production"
git push origin main
```

**Opción B: Manual (CLI)**
```bash
aws amplify start-job \
  --app-id <APP_ID> \
  --branch-name main \
  --job-type RELEASE \
  --region sa-east-1 \
  --profile dygsom-latam
```

### 5. Monitorear Build

**En Amplify Console:**
https://sa-east-1.console.aws.amazon.com/amplify/home?region=sa-east-1

**Build logs mostrarán:**
```
✓ Provision
✓ Build (5-10 minutos)
  - npm ci
  - npm run build
  - Next.js optimization
✓ Deploy
✓ Verify
```

### 6. Obtener URL

**Después del deployment exitoso:**
```bash
aws amplify get-app \
  --app-id <APP_ID> \
  --region sa-east-1 \
  --profile dygsom-latam \
  --query 'app.defaultDomain' \
  --output text

# Output: main.<app-id>.amplifyapp.com
```

**URL final:**
```
https://main.<app-id>.amplifyapp.com
```

## 🌐 Custom Domain (Opcional)

### 1. Comprar/Configurar Dominio
- dashboard.dygsom.pe (Route 53 o proveedor externo)

### 2. Agregar Custom Domain en Amplify
```bash
aws amplify create-domain-association \
  --app-id <APP_ID> \
  --domain-name dygsom.pe \
  --sub-domain-settings prefix=dashboard,branchName=main \
  --region sa-east-1 \
  --profile dygsom-latam
```

### 3. Verificar DNS
Amplify provee records CNAME/ANAME para configurar en tu DNS provider.

### 4. SSL Automático
AWS Certificate Manager (ACM) provee certificado SSL automáticamente.

## ✅ Validación Post-Deployment

### 1. Smoke Tests

**Abrir URL:**
```
https://main.<app-id>.amplifyapp.com
```

**Verificar:**
- [ ] Página login carga correctamente
- [ ] CSS/Tailwind aplicado
- [ ] No errores 404 en assets
- [ ] Login con API Key funciona
- [ ] Dashboard muestra datos del backend

### 2. Test de Conectividad API

**En Browser DevTools (Console):**
```javascript
// Verificar API URL
console.log(process.env.NEXT_PUBLIC_API_URL);
// Debe mostrar: https://api.dygsom.pe/v1

// Test fetch
fetch('https://api.dygsom.pe/v1/health')
  .then(r => r.json())
  .then(console.log);
// Debe retornar: {status: "healthy", ...}
```

### 3. Test de Latencia (desde Lima)

```bash
# Ping CloudFront edge
curl -w "@curl-format.txt" -o /dev/null -s https://main.<app-id>.amplifyapp.com

# Debe ser < 100ms desde Lima
```

## 🔄 CI/CD Automático

### Auto-Deploy Configurado

**Trigger:** Push a branch `main`

**Flujo:**
1. Developer: `git push origin main`
2. Amplify detecta push (GitHub webhook)
3. Inicia build automático
4. Ejecuta `amplify.yml`
5. Deploy a staging URL
6. Swap a production URL
7. Notificación de éxito/fallo

### Rollback

**Si deployment falla:**
```bash
# Ver historial de builds
aws amplify list-jobs \
  --app-id <APP_ID> \
  --branch-name main \
  --region sa-east-1 \
  --profile dygsom-latam

# Rollback a build anterior
aws amplify start-deployment \
  --app-id <APP_ID> \
  --branch-name main \
  --job-id <PREVIOUS_JOB_ID> \
  --region sa-east-1 \
  --profile dygsom-latam
```

## 📊 Monitoreo

### CloudWatch Logs

Amplify envía logs a CloudWatch automáticamente:
- Build logs: `/aws/amplify/<app-id>`
- Access logs: habilitado por defecto

### Métricas Clave

**En CloudWatch Dashboard:**
- Requests por minuto
- Response time (p50, p95, p99)
- 4xx/5xx errors
- Data transfer OUT

## 💰 Costos Estimados

### Amplify Hosting
- Build minutes: $0.01/min (primeros 1000 gratis)
- Hosting: $0.15/GB servido
- Storage: $0.023/GB-mes

**Estimado mensual (Dashboard Tenant):**
- Builds: ~30 builds/mes × 8 min = $2.40
- Hosting: ~50GB servido = $7.50
- Storage: ~1GB = $0.023
- **Total:** ~$10/mes ✅

## 🐛 Troubleshooting

### Build Falla

**Error común:** "Module not found"
```bash
# Verificar en amplify.yml:
- npm ci  # NO usar npm install
```

**Error:** "Environment variable not set"
```bash
# Verificar en Amplify Console → Environment variables
# Asegurar que NEXT_PUBLIC_API_URL está configurado
```

### 404 en Assets

**Problema:** CSS/JS no cargan
```bash
# Verificar baseDirectory en amplify.yml
baseDirectory: .next  # Debe ser .next para Next.js
```

### API Connection Failed

**Problema:** Dashboard no conecta al backend
```bash
# Verificar CORS en API Gateway
# Debe permitir origen: https://main.<app-id>.amplifyapp.com

# Verificar API URL en variables de entorno
echo $NEXT_PUBLIC_API_URL
```

## 📚 Referencias

- [AWS Amplify Docs](https://docs.aws.amazon.com/amplify/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [GUIA-DESPLIEGUE-AWS-LATAM-OPTIMIZADA.md](./GUIA-DESPLIEGUE-AWS-LATAM-OPTIMIZADA.md)

---

**Última actualización:** 13 Enero 2026  
**Estado:** ✅ Configuración lista para despliegue
