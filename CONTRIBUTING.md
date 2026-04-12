# Guía de Contribución

¡Gracias por tu interés en contribuir a FlyTrack Frontend!

## 🚀 Comenzando

1. Fork el repositorio
2. Clona tu fork: `git clone https://github.com/tu-usuario/flytrack-frontend.git`
3. Crea una rama para tu feature: `git checkout -b feature/mi-feature`
4. Instala las dependencias: `npm install`
5. Inicia el servidor de desarrollo: `npm start`

## 📝 Estándares de Código

### TypeScript

- Usa tipos explícitos siempre que sea posible
- Evita el uso de `any`
- Usa interfaces para objetos complejos
- Documenta funciones públicas con JSDoc

### Angular

- Usa Standalone Components
- Usa Signals para estado local
- Usa Observables para operaciones asíncronas
- Implementa lazy loading para rutas
- Sigue la guía de estilo oficial de Angular

### CSS

- Usa clases descriptivas
- Evita estilos inline
- Mantén los estilos específicos del componente en su archivo .css
- Usa variables CSS para colores y espaciados comunes

### Nombres de Archivos

- Componentes: `nombre-componente.component.ts`
- Servicios: `nombre.service.ts`
- Modelos: `nombre.model.ts`
- Guards: `nombre.guard.ts`
- Interceptors: `nombre.interceptor.ts`

## 🧪 Testing

```bash
# Ejecutar tests
npm test

# Ejecutar tests con coverage
npm run test:coverage
```

Asegúrate de que todos los tests pasen antes de hacer commit.

## 📦 Commits

Usa commits semánticos:

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan el código)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

Ejemplos:
```
feat: agregar filtro por aerolínea en dashboard
fix: corregir actualización de QR en boarding pass
docs: actualizar README con instrucciones de Docker
```

## 🔀 Pull Requests

1. Actualiza tu rama con la última versión de `main`
2. Asegúrate de que el código compile sin errores
3. Ejecuta los tests
4. Crea un PR con una descripción clara de los cambios
5. Espera la revisión del código

### Checklist para PR

- [ ] El código compila sin errores
- [ ] Los tests pasan
- [ ] La documentación está actualizada
- [ ] Los commits siguen el formato semántico
- [ ] No hay console.logs olvidados
- [ ] El código sigue los estándares del proyecto

## 🐛 Reportar Bugs

Usa el template de issues para reportar bugs. Incluye:

- Descripción del bug
- Pasos para reproducir
- Comportamiento esperado
- Comportamiento actual
- Screenshots (si aplica)
- Versión del navegador
- Logs de consola

## 💡 Sugerir Features

Usa el template de issues para sugerir features. Incluye:

- Descripción de la feature
- Problema que resuelve
- Propuesta de solución
- Alternativas consideradas
- Mockups (si aplica)

## 📚 Recursos

- [Documentación de Angular](https://angular.dev)
- [Guía de estilo de Angular](https://angular.dev/style-guide)
- [RxJS](https://rxjs.dev)
- [TypeScript](https://www.typescriptlang.org)

## 🤝 Código de Conducta

- Sé respetuoso con otros contribuidores
- Acepta críticas constructivas
- Enfócate en lo mejor para el proyecto
- Muestra empatía hacia otros miembros de la comunidad

## ❓ ¿Necesitas Ayuda?

Si tienes preguntas, puedes:

- Abrir un issue con la etiqueta `question`
- Contactar al equipo de desarrollo
- Revisar la documentación existente

¡Gracias por contribuir! 🎉
