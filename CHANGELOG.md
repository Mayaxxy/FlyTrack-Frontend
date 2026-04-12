# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2026-04-12

### Agregado

#### Autenticación
- Sistema de login con JWT
- Registro de nuevos usuarios
- Guard de autenticación para rutas protegidas
- Interceptor HTTP para agregar token a las peticiones
- Logout con limpieza de sesión

#### Gestión de Vuelos
- Dashboard con lista de vuelos próximos
- Filtros por aeropuerto de origen y destino
- Actualización automática cada 60 segundos
- Indicadores visuales para estados de vuelo (programado, retrasado, abordando, etc.)
- Tarjetas de vuelo con información detallada

#### Check-in Digital
- Proceso de check-in online
- Validación de ventana de tiempo (24-48 horas antes del vuelo)
- Confirmación de check-in exitoso
- Visualización de información del pase de abordaje

#### Pase de Abordaje
- Generación de código QR dinámico
- Actualización automática del QR cada 45 segundos
- Botón de actualización manual
- Advertencia de expiración (15 minutos antes del vuelo)
- Información completa del vuelo y pasajero

#### Notificaciones
- Sistema de notificaciones en tiempo real
- Polling cada 30 segundos
- Badge con contador de notificaciones no leídas
- Categorización por tipo (cambio de puerta, retraso, cancelación, etc.)
- Marcar notificaciones como leídas
- Indicadores visuales por tipo de notificación

#### Reporte de Equipaje
- Formulario para crear reportes de equipaje
- Lista de reportes del usuario
- Estados de reporte (pendiente, en proceso, resuelto)
- Límite de 5 reportes activos simultáneos
- Indicadores visuales por estado

#### Diseño y UX
- Diseño responsivo (móvil, tablet, desktop)
- Paleta de colores rojo y blanco (estilo Avianca)
- Navegación intuitiva con barra superior
- Estados de carga con spinners
- Mensajes de error claros
- Animaciones y transiciones suaves

#### Infraestructura
- Configuración de Docker
- Nginx para servir la aplicación
- Docker Compose para despliegue completo
- GitHub Actions para CI/CD
- Documentación completa

### Características Técnicas

- Angular 21 con Standalone Components
- TypeScript para type safety
- RxJS para programación reactiva
- Angular Signals para gestión de estado
- Lazy loading de rutas
- Interceptores HTTP
- Guards de autenticación
- Optimización de bundle con code splitting

### Seguridad

- Autenticación con JWT
- Almacenamiento seguro de tokens
- Validación de sesión
- Redirección automática en caso de token expirado
- Headers de seguridad en nginx
- Sanitización de inputs

### Performance

- Lazy loading de componentes
- Actualización automática optimizada
- Compresión gzip en nginx
- Cache de assets estáticos
- Bundle optimizado para producción

### Accesibilidad

- ARIA labels en elementos interactivos
- Navegación por teclado
- Contraste de colores adecuado
- Textos alternativos en imágenes
- Tamaños de touch targets apropiados

## [Unreleased]

### Por Agregar

- Tests unitarios completos
- Tests e2e con Cypress
- Internacionalización (i18n)
- Modo oscuro
- PWA (Progressive Web App)
- Notificaciones push
- Offline mode
- Integración con WebSockets para notificaciones en tiempo real
- Historial de vuelos pasados
- Exportar pase de abordaje como PDF
- Compartir pase de abordaje
- Preferencias de usuario
- Cambio de idioma
- Soporte para múltiples aerolíneas

### Por Mejorar

- Optimización de imágenes
- Implementar Service Worker
- Mejorar accesibilidad
- Agregar más animaciones
- Optimizar rendimiento en móviles

---

[1.0.0]: https://github.com/aerosmart/flytrack-frontend/releases/tag/v1.0.0
