# 🚀 Inicio Rápido - FlyTrack Frontend

## ⚡ Opción 1: Inicio Rápido con Script

```bash
./start.sh
```

Este script:
- ✅ Verifica Node.js
- ✅ Instala dependencias si es necesario
- ✅ Verifica conexión con el backend
- ✅ Inicia el servidor de desarrollo

## 🔧 Opción 2: Inicio Manual

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Iniciar Servidor de Desarrollo

```bash
npm start
```

La aplicación estará disponible en: **http://localhost:4200**

## 🐳 Opción 3: Con Docker

### Solo Frontend

```bash
# Construir imagen
docker build -t flytrack-frontend .

# Ejecutar contenedor
docker run -d -p 4200:80 flytrack-frontend
```

### Frontend + Backend

```bash
# Iniciar ambos servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## ✅ Verificación

### 1. Verificar que el frontend está corriendo

Abre tu navegador en: **http://localhost:4200**

Deberías ver la página de login de FlyTrack.

### 2. Verificar conexión con el backend

El backend debe estar corriendo en: **http://localhost:8080**

Prueba:
```bash
curl http://localhost:8080/api/flights/public/upcoming
```

## 👤 Usuarios de Prueba

Si el backend tiene datos de prueba, puedes usar:

```
Email: test@aerosmart.com
Password: test123
```

O registra un nuevo usuario desde la aplicación.

## 🎯 Flujo de Prueba Completo

1. **Registrarse**
   - Ve a "Regístrate aquí"
   - Completa el formulario
   - Inicia sesión automáticamente

2. **Ver Vuelos**
   - Dashboard muestra vuelos próximos
   - Prueba los filtros por origen/destino
   - Observa la actualización automática

3. **Hacer Check-in**
   - Click en "Hacer Check-In" en un vuelo elegible
   - Ingresa código de reserva
   - Confirma el check-in

4. **Ver Pase de Abordaje**
   - Click en "Ver Pase de Abordaje"
   - Observa el QR dinámico
   - Prueba el botón de actualización manual

5. **Notificaciones**
   - Click en el ícono de notificaciones
   - Ve las notificaciones del sistema
   - Marca algunas como leídas

6. **Reportar Equipaje**
   - Ve a la sección "Equipaje"
   - Crea un nuevo reporte
   - Ve el estado del reporte

## 🔧 Configuración

### Cambiar URL del Backend

Edita `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://tu-backend:8080/api'  // Cambia aquí
};
```

## 🐛 Solución de Problemas

### Error: Cannot connect to backend

**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica la URL en `environment.ts`
3. Verifica que CORS esté habilitado en el backend

### Error: Port 4200 already in use

**Solución:**
```bash
# Encuentra el proceso
lsof -i :4200

# Mata el proceso
kill -9 <PID>

# O usa otro puerto
ng serve --port 4300
```

### Error: npm install falla

**Solución:**
```bash
# Limpia cache
npm cache clean --force

# Elimina node_modules
rm -rf node_modules package-lock.json

# Reinstala
npm install
```

## 📱 Probar en Móvil

### Opción 1: Mismo WiFi

1. Encuentra tu IP local:
```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

2. Accede desde tu móvil:
```
http://TU_IP:4200
```

### Opción 2: ngrok

```bash
# Instala ngrok
npm install -g ngrok

# Expone el puerto
ngrok http 4200
```

## 🎨 Personalización Rápida

### Cambiar Colores

Edita los archivos CSS de los componentes y busca:
- `#E30613` - Color primario (rojo)
- `#FFFFFF` - Color secundario (blanco)

### Cambiar Logo

Reemplaza el texto "FlyTrack" en:
- `src/app/components/navbar/navbar.component.html`
- `src/app/components/login/login.component.html`
- `src/app/components/register/register.component.html`

## 📚 Recursos Útiles

- [Documentación Completa](./README.md)
- [Guía de Despliegue](./DEPLOYMENT.md)
- [Guía de Contribución](./CONTRIBUTING.md)
- [Resumen del Proyecto](./PROJECT_SUMMARY.md)

## 🆘 ¿Necesitas Ayuda?

1. Revisa la [documentación](./README.md)
2. Busca en los [issues](https://github.com/aerosmart/flytrack-frontend/issues)
3. Crea un nuevo issue si no encuentras solución

## ✨ ¡Listo!

Tu aplicación FlyTrack Frontend está corriendo. 

**Siguiente paso:** Explora las funcionalidades y personaliza según tus necesidades.

---

**¿Todo funcionando?** ¡Genial! Ahora puedes empezar a desarrollar. 🎉
