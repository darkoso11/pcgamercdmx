# Agosto 2026: URLs y Analytics

Fuente: https://docs.google.com/spreadsheets/d/1X_a5MHQ3B63xkv4q0AimIQFqivPDXdvd7mJsfz55XXU/edit

## Alcance

- `/computadora-para-diseno-grafico`: página propia con el contenido de agosto.
- `/pc-gamer-gama-media`: página propia con el contenido de agosto.
- `/pc-gamer-gama-alta`: nueva dirección principal de la página existente.
- Accesos en Productos, sitemap, metadatos y enlaces internos actualizados.
- Se conserva el contenido del home; su enlace de gama alta apunta a la nueva dirección.
- La URL anterior `/pc-gamer-gama-alta-cdmx` redirige a la nueva. Nginx, Vercel y el servidor local preservan los parámetros de campaña. Angular mantiene un alias para navegación interna y una redirección de respaldo prerenderizada.

Las dos páginas nuevas usan la plantilla de septiembre. Las transcripciones locales conservan los enlaces de origen; `images.json` registra las 46 imágenes originales con sus metadatos. HYPERION y WORKSTATION mantienen fichas editoriales y apuntan a Contacto porque no tienen productos propios. Se conservaron los datos y precios suministrados, siguiendo la autorización previa; no se revalidaron las configuraciones de los ensambles.

Regeneración: `python tools/prepare-september-content.py --month agosto` (requiere Pillow). Usa los archivos originales en `.local-run/august-assets/<drive-id>` o las imágenes ya versionadas. Sin argumentos, el script sigue generando septiembre.

## Analytics

La configuración de producción activa `G-1RE1CQG7LC`. `AnalyticsService` escribe el fragmento global en el `<head>` durante el prerenderizado y reutiliza esa etiqueta cuando Angular inicia en el navegador. Esto evita cargar o configurar la misma propiedad dos veces. Desarrollo mantiene el identificador vacío.

Se usa la medición automática de Google, sin enviar eventos `page_view` manuales adicionales. Para medir las navegaciones internas de Angular, la propiedad debe tener activa **Medición mejorada → Vistas de página → Cambios de página basados en eventos del historial del navegador**. Referencia: https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications

Después de desplegar, verificar en Tiempo real o DebugView una entrada directa y una navegación entre páginas. No se modificó la cuenta de Analytics ni se verificó la recepción de eventos en ella. Las pruebas locales interceptan el cargador de Google para no enviar visitas de prueba a la propiedad.

## Validación local

- 34 pruebas unitarias: agosto, septiembre, SEO, Analytics, gama alta y home.
- Build de producción: 21 rutas prerenderizadas. Advertencia de presupuesto inicial: 553.24 kB frente a 550 kB (el proyecto ya superaba ese umbral antes del cambio).
- `node tools/verify-august-pages.mjs`: tres URLs, HTML prerenderizado, metadatos, inicialización única de Analytics, imágenes, FAQ, enlaces de Productos y redirección conservando UTM; resoluciones 1440 y 390 px.
- `node tools/verify-september-pages.mjs`: regresión de las cuatro páginas anteriores en ambas resoluciones.
- Los scripts de navegador usan por defecto `http://127.0.0.1:4266`; iniciar con `PORT=4266 node tools/serve-browser-build.mjs` usando la sintaxis de variables de entorno del shell.
- Configuraciones Nginx y Vercel revisadas en código; no se ejecutó un despliegue ni un contenedor de Nginx.

Entrega: rama `configuraciones-pendientes`, creada desde `dev`, con PR hacia `dev`. La publicación y la verificación de recepción en Analytics se realizan después del despliegue.
