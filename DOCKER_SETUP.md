# DYGSOM Dashboard - Configuración Docker

**Versión:** 1.0.0
**Fecha:** 2025-11-26

---

## Arquitectura Docker

```
┌─────────────────────────────────────────────────────┐
│                  Docker Network                      │
│               (dygsom-network)                       │
│                                                      │
│  ┌──────────────────┐      ┌──────────────────┐    │
│  │   Dashboard      │      │   API Backend    │    │
│  │   (Next.js)      │─────▶│   (FastAPI)      │    │
│  │   Port: 3001     │      │   Port: 3000     │    │
│  └──────────────────┘      └──────────────────┘    │
│                                    │                │
│                          ┌─────────┴─────────┐      │
│                          │                   │      │
│                    ┌─────▼──────┐    ┌──────▼────┐ │
│                    │ PostgreSQL │    │   Redis   │ │
│                    │ Port: 5432 │    │ Port:6379 │ │
│                    └────────────┘    └───────────┘ │
└─────────────────────────────────────────────────────┘
```

---

## Opción 1: Docker Compose Standalone (Dashboard Solo)

### Ejecutar Dashboard en Desarrollo

```bash
cd dygsom-fraud-dashboard

# Build y start
docker-compose up -d

# Ver logs
docker-compose logs -f dashboard

# Detener
docker-compose down
```

**Acceso:** http://localhost:3001

---

## Opción 2: Integración con Backend (Recomendado)

### Modificar docker-compose del Backend

Agregar el servicio del dashboard al `docker-compose.yml` del backend:

```yaml
# dygsom-fraud-api/docker-compose.yml

services:
  # ... servicios existentes (api, postgres, redis, etc.)

  # Dashboard Frontend
  dashboard:
    build:
      context: ../dygsom-fraud-dashboard
      dockerfile: Dockerfile
    container_name: dygsom-dashboard
    restart: unless-stopped
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_API_BASE_URL=http://api:3000
      - NEXT_PUBLIC_ENVIRONMENT=development
      - NEXT_PUBLIC_LOG_LEVEL=debug
    networks:
      - dygsom-network
    depends_on:
      api:
        condition: service_healthy
    volumes:
      - ../dygsom-fraud-dashboard:/app
      - /app/node_modules
      - /app/.next

networks:
  dygsom-network:
    driver: bridge
```

### Ejecutar Todo Junto

```bash
cd dygsom-fraud-api

# Start todos los servicios (API + Dashboard + DB + Redis)
docker-compose up -d

# Ver logs del dashboard
docker-compose logs -f dashboard

# Ver logs de todo
docker-compose logs -f

# Detener todo
docker-compose down
```

**Acceso:**
- Dashboard: http://localhost:3001
- API Backend: http://localhost:3000
- Grafana: http://localhost:3001

---

## Construcción de Imagen de Producción

### Build de Imagen Optimizada

```bash
cd dygsom-fraud-dashboard

# Build imagen de producción
docker build -t dygsom-dashboard:latest .

# Run en producción
docker run -d \
  --name dygsom-dashboard \
  -p 3001:3001 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.dygsom.pe \
  -e NODE_ENV=production \
  dygsom-dashboard:latest
```

### Variables de Entorno (Producción)

```bash
# Crear .env.production
NEXT_PUBLIC_API_BASE_URL=https://api.dygsom.pe
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_LOG_LEVEL=error
NEXT_PUBLIC_LOG_TO_CONSOLE=false
```

---

## Desarrollo con Hot Reload

### docker-compose.dev.yml

```yaml
version: '3.8'

services:
  dashboard-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: dygsom-dashboard-dev
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - NEXT_PUBLIC_API_BASE_URL=http://host.docker.internal:3000
    volumes:
      # Mount para hot reload
      - .:/app
      - /app/node_modules
      - /app/.next
    command: npm run dev
```

```bash
# Ejecutar en modo desarrollo
docker-compose -f docker-compose.dev.yml up
```

---

## Dockerfile.dev (Desarrollo)

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose port
EXPOSE 3001

# Start development server
CMD ["npm", "run", "dev"]
```

---

## Network Configuration

### Crear Network Compartida

```bash
# Crear network para comunicación entre contenedores
docker network create dygsom-network

# Conectar contenedores existentes
docker network connect dygsom-network dygsom-fraud-api
docker network connect dygsom-network dygsom-postgres
docker network connect dygsom-network dygsom-redis
```

---

## Health Checks

El contenedor del dashboard incluye health check:

```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', ...)"
```

```bash
# Ver status del health check
docker ps

# Ver logs del health check
docker inspect dygsom-dashboard | grep -A 10 Health
```

---

## Optimizaciones de Producción

### Multi-stage Build

El Dockerfile usa multi-stage build:
1. **deps** - Instala dependencias
2. **builder** - Build de Next.js
3. **runner** - Imagen final optimizada

**Beneficios:**
- Imagen final pequeña (~150MB)
- No incluye devDependencies
- Solo archivos necesarios

### Configuración de Next.js

```javascript
// next.config.js
module.exports = {
  output: 'standalone', // Genera standalone app
  compress: true,        // Gzip compression
  swcMinify: true,      // SWC minification
}
```

---

## Troubleshooting

### Dashboard no conecta con API

```bash
# Verificar network
docker network inspect dygsom-network

# Verificar que API esté corriendo
docker ps | grep dygsom-fraud-api

# Ping desde dashboard a API
docker exec dygsom-dashboard ping api
```

### Hot reload no funciona

```bash
# Verificar volúmenes montados
docker inspect dygsom-dashboard | grep Mounts -A 20

# Reiniciar con volúmenes
docker-compose down -v
docker-compose up -d
```

### Logs de Debug

```bash
# Logs del dashboard
docker-compose logs -f dashboard

# Logs con timestamps
docker-compose logs -f --timestamps dashboard

# Últimas 100 líneas
docker-compose logs --tail=100 dashboard
```

---

## Scripts Útiles

### start-all.sh

```bash
#!/bin/bash
# Start backend y frontend juntos

cd ../dygsom-fraud-api
docker-compose up -d

echo "✅ Backend started on http://localhost:3000"
echo "✅ Dashboard started on http://localhost:3001"
echo "✅ Grafana available on http://localhost:3001"

docker-compose logs -f
```

### stop-all.sh

```bash
#!/bin/bash
cd ../dygsom-fraud-api
docker-compose down
echo "✅ All services stopped"
```

---

## Monitoreo

### Resource Usage

```bash
# Ver uso de recursos
docker stats dygsom-dashboard

# Ver procesos
docker top dygsom-dashboard
```

### Logs Persistence

```yaml
# docker-compose.yml
services:
  dashboard:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

---

## Security

### Non-root User

El contenedor corre con usuario no-root (nextjs:nodejs)

```dockerfile
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
```

### Security Headers

Configurados en `next.config.js`:
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security
- etc.

---

## Comandos Rápidos

```bash
# Build
docker build -t dygsom-dashboard .

# Run standalone
docker run -p 3001:3001 dygsom-dashboard

# Stop
docker stop dygsom-dashboard

# Remove
docker rm dygsom-dashboard

# Logs
docker logs -f dygsom-dashboard

# Shell access
docker exec -it dygsom-dashboard sh

# Rebuild
docker-compose build --no-cache dashboard
```

---

**Estado:** Docker configurado y listo
**Próximo Paso:** Ejecutar `docker-compose up` para iniciar
**Documentación:** README.md para más detalles
