# Guía de Despliegue - FlyTrack Frontend

## 🐳 Despliegue con Docker

### Construcción de la imagen

```bash
docker build -t flytrack-frontend:latest .
```

### Ejecución del contenedor

```bash
docker run -d -p 4200:80 --name flytrack-frontend flytrack-frontend:latest
```

La aplicación estará disponible en `http://localhost:4200`

## 🚀 Despliegue con Docker Compose

### Requisitos previos

- Docker y Docker Compose instalados
- Imagen del backend construida como `aerosmart-backend:latest`

### Iniciar todos los servicios

```bash
docker-compose up -d
```

### Detener los servicios

```bash
docker-compose down
```

### Ver logs

```bash
# Todos los servicios
docker-compose logs -f

# Solo frontend
docker-compose logs -f frontend

# Solo backend
docker-compose logs -f backend
```

## ☁️ Despliegue en la Nube

### AWS (Amazon Web Services)

#### Opción 1: S3 + CloudFront

1. Compilar la aplicación:
```bash
npm run build
```

2. Crear un bucket S3:
```bash
aws s3 mb s3://flytrack-frontend
```

3. Configurar el bucket para hosting estático:
```bash
aws s3 website s3://flytrack-frontend --index-document index.html --error-document index.html
```

4. Subir los archivos:
```bash
aws s3 sync dist/flytrack-frontend s3://flytrack-frontend
```

5. Crear una distribución de CloudFront para HTTPS y CDN

#### Opción 2: Elastic Beanstalk

1. Crear un archivo `.ebextensions/nginx.config` con la configuración de nginx

2. Desplegar:
```bash
eb init -p docker flytrack-frontend
eb create flytrack-frontend-env
eb deploy
```

### Google Cloud Platform

#### Cloud Run

1. Construir y subir la imagen:
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/flytrack-frontend
```

2. Desplegar:
```bash
gcloud run deploy flytrack-frontend \
  --image gcr.io/PROJECT_ID/flytrack-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure

#### Azure App Service

1. Crear un App Service Plan:
```bash
az appservice plan create --name flytrack-plan --resource-group flytrack-rg --sku B1 --is-linux
```

2. Crear la Web App:
```bash
az webapp create --resource-group flytrack-rg --plan flytrack-plan --name flytrack-frontend --deployment-container-image-name flytrack-frontend:latest
```

## 🔧 Variables de Entorno

### Producción

Editar `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.aerosmart.com/api'  // URL del backend en producción
};
```

### Staging

Crear `src/environments/environment.staging.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://staging-api.aerosmart.com/api'
};
```

## 📊 Monitoreo y Logs

### Nginx Access Logs

```bash
docker exec flytrack-frontend tail -f /var/log/nginx/access.log
```

### Nginx Error Logs

```bash
docker exec flytrack-frontend tail -f /var/log/nginx/error.log
```

## 🔒 Seguridad

### HTTPS

Para producción, siempre usar HTTPS. Opciones:

1. **Let's Encrypt** (gratuito):
```bash
certbot --nginx -d flytrack.aerosmart.com
```

2. **CloudFlare** (gratuito con CDN)

3. **AWS Certificate Manager** (gratuito en AWS)

### Headers de Seguridad

Ya configurados en `nginx.conf`:
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection

## 🎯 CI/CD

### GitHub Actions

Crear `.github/workflows/deploy.yml`:

```yaml
name: Deploy Frontend

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Build Docker image
      run: docker build -t flytrack-frontend:${{ github.sha }} .
    
    - name: Push to registry
      run: |
        docker tag flytrack-frontend:${{ github.sha }} registry.example.com/flytrack-frontend:latest
        docker push registry.example.com/flytrack-frontend:latest
```

## 🧪 Testing en Producción

### Health Check

```bash
curl http://localhost:4200
```

Debe retornar el HTML de la aplicación.

### Verificar conectividad con backend

```bash
curl http://localhost:4200/api/flights/public/upcoming
```

## 📈 Optimizaciones

### Compresión Gzip

Ya habilitada en `nginx.conf`

### Cache de Assets

Configurado para 1 año en archivos estáticos

### Lazy Loading

Implementado en las rutas de Angular

## 🔄 Rollback

### Docker

```bash
# Listar imágenes
docker images flytrack-frontend

# Volver a una versión anterior
docker run -d -p 4200:80 flytrack-frontend:previous-tag
```

### Kubernetes

```bash
kubectl rollout undo deployment/flytrack-frontend
```

## 📝 Checklist de Despliegue

- [ ] Variables de entorno configuradas
- [ ] Backend accesible desde el frontend
- [ ] CORS habilitado en el backend
- [ ] HTTPS configurado
- [ ] Headers de seguridad verificados
- [ ] Logs configurados
- [ ] Monitoreo activo
- [ ] Backup configurado
- [ ] Plan de rollback definido
- [ ] Documentación actualizada

## 🆘 Troubleshooting

### Error: Cannot connect to backend

Verificar:
1. Backend está corriendo
2. URL del backend es correcta en environment
3. CORS está habilitado en el backend
4. Firewall permite la conexión

### Error: 404 en rutas de Angular

Verificar que nginx está configurado con `try_files $uri $uri/ /index.html`

### Error: Assets no cargan

Verificar que los paths en `angular.json` son correctos y que los archivos están en `dist/`
