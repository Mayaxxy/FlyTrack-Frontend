# FlyTrack Frontend

Aplicación web moderna para el aeropuerto AeroPuerto Smart que permite a los pasajeros gestionar sus vuelos de manera digital.

## 🚀 Características

- **Autenticación Segura**: Login y registro con JWT
- **Gestión de Vuelos**: Consulta de vuelos con filtros por origen/destino
- **Check-in Digital**: Proceso de check-in online (24-48 horas antes del vuelo)
- **Pase de Abordaje con QR Dinámico**: Código QR que se regenera cada 45 segundos
- **Notificaciones en Tiempo Real**: Alertas sobre cambios en vuelos
- **Reporte de Equipaje**: Sistema para reportar inconvenientes con equipaje
- **Diseño Responsivo**: Optimizado para móvil, tablet y desktop
- **Estilo Avianca**: Colores rojo (#E30613) y blanco

## 🛠️ Tecnologías

- **Angular 21** - Framework principal
- **TypeScript** - Lenguaje de programación
- **RxJS** - Programación reactiva
- **Angular Signals** - Gestión de estado
- **HttpClient** - Comunicación con API REST
- **Angular Router** - Navegación
- **Standalone Components** - Arquitectura moderna de Angular

## 📋 Requisitos Previos

- Node.js 20+ 
- npm 11+
- Backend de AeroPuerto Smart corriendo en `http://localhost:8080`

## 🔧 Instalación

```bash
# Instalar dependencias
npm install

# Configurar la URL del backend (opcional)
# Editar src/environments/environment.ts si el backend está en otra URL
```

## 🚀 Ejecución

```bash
# Modo desarrollo
npm start

# La aplicación estará disponible en http://localhost:4200
```

## 🏗️ Build para Producción

```bash
# Compilar para producción
npm run build

# Los archivos compilados estarán en dist/
```

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── components/          # Componentes de la aplicación
│   │   ├── login/          # Login de usuarios
│   │   ├── register/       # Registro de usuarios
│   │   ├── dashboard/      # Dashboard principal con vuelos
│   │   ├── flight-card/    # Tarjeta de vuelo
│   │   ├── checkin/        # Proceso de check-in
│   │   ├── boarding-pass/  # Pase de abordaje con QR
│   │   ├── notifications/  # Lista de notificaciones
│   │   ├── baggage/        # Reportes de equipaje
│   │   └── navbar/         # Barra de navegación
│   ├── services/           # Servicios de la aplicación
│   │   ├── auth.service.ts
│   │   ├── flight.service.ts
│   │   ├── checkin.service.ts
│   │   ├── notification.service.ts
│   │   └── baggage.service.ts
│   ├── models/             # Interfaces y tipos
│   ├── guards/             # Guards de autenticación
│   ├── interceptors/       # Interceptores HTTP
│   ├── app.routes.ts       # Configuración de rutas
│   └── app.config.ts       # Configuración de la app
├── environments/           # Configuración de entornos
└── styles.css             # Estilos globales
```

## 🔐 Autenticación

La aplicación usa JWT (JSON Web Tokens) para autenticación:

1. El usuario se registra o inicia sesión
2. El backend devuelve un token JWT
3. El token se almacena en localStorage
4. Todas las peticiones autenticadas incluyen el token en el header `Authorization: Bearer {token}`
5. Si el token expira, el usuario es redirigido al login

## 🛣️ Rutas

- `/login` - Inicio de sesión
- `/register` - Registro de usuario
- `/dashboard` - Dashboard con lista de vuelos (protegida)
- `/checkin/:flightCode` - Check-in para un vuelo (protegida)
- `/boarding-pass/:checkInId` - Pase de abordaje con QR (protegida)
- `/notifications` - Lista de notificaciones (protegida)
- `/baggage` - Reportes de equipaje (protegida)

## 🎨 Diseño

El diseño sigue la identidad visual de Avianca:

- **Color Primario**: #E30613 (Rojo)
- **Color Secundario**: #FFFFFF (Blanco)
- **Fuente**: Sans-serif del sistema
- **Espaciado**: Escala de 8px
- **Border Radius**: 4-8px
- **Sombras**: Para componentes elevados

## 📱 Responsive Design

La aplicación se adapta a diferentes tamaños de pantalla:

- **Móvil**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔄 Actualización Automática

- **Vuelos**: Se actualizan cada 60 segundos
- **Notificaciones**: Se consultan cada 30 segundos
- **QR de Abordaje**: Se regenera cada 45 segundos

## 🔌 Integración con Backend

El frontend se comunica con el backend a través de los siguientes endpoints:

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil del usuario

### Vuelos
- `GET /api/flights/public/upcoming` - Vuelos próximos
- `GET /api/flights/public/origin/{origin}` - Vuelos por origen
- `GET /api/flights/public/destination/{destination}` - Vuelos por destino

### Check-in
- `POST /api/checkin` - Realizar check-in
- `GET /api/boarding-pass/{checkInId}` - Obtener pase de abordaje

### Notificaciones
- `GET /api/notifications` - Obtener notificaciones
- `PUT /api/notifications/{id}/read` - Marcar como leída

### Equipaje
- `POST /api/baggage-reports` - Crear reporte
- `GET /api/baggage-reports/my-reports` - Mis reportes

## 🧪 Testing

```bash
# Ejecutar tests
npm test
```

## 📝 Notas de Desarrollo

### Signals vs Observables

El proyecto usa Angular Signals para estado local y Observables (RxJS) para operaciones asíncronas:

- **Signals**: Estado de componentes (loading, error, datos)
- **Observables**: Peticiones HTTP, polling, eventos

### Standalone Components

Todos los componentes son standalone (no requieren NgModule), siguiendo las mejores prácticas de Angular moderno.

### Lazy Loading

Las rutas usan lazy loading para optimizar el tamaño del bundle inicial.

## 🐛 Troubleshooting

### El backend no responde

Verifica que el backend esté corriendo en `http://localhost:8080` y que CORS esté habilitado.

### Error de autenticación

Limpia el localStorage y vuelve a iniciar sesión:

```javascript
localStorage.clear();
```

### El QR no se muestra

Verifica que el backend esté devolviendo el QR en formato Base64.

## 📄 Licencia

Este proyecto es parte de la práctica DevOps de AeroPuerto Smart.

## 👥 Equipo

Desarrollado para AeroPuerto Smart - Modernización de procesos tecnológicos.
