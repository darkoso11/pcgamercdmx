# SEO editorial del blog

Diseño aprobado en conversación: generar el HTML del blog en el servidor y mantener prerenderizado el resto del sitio. No se incluye la optimización del tamaño de bundles.

- Cada entrada utiliza su título, resumen y portada como valores SEO predeterminados. El editor permite título SEO, descripción SEO y una imagen social mediante URL opcionales, con previsualización del snippet y contadores orientativos; no se exige una longitud SEO como regla de Google.
- Guardar y volver de vista previa conserva estos campos. Publicar una corrección conserva la fecha original; Directus mantiene fechas reales de creación y modificación.
- Las páginas de listado y detalle del blog se renderizan en cada solicitud pública sin credenciales. Borradores y futuras no aparecen. Las entradas inexistentes devuelven 404/noindex; fallos de CMS devuelven 503/noindex, sin fingir contenido inexistente.
- El título, description, canonical, Open Graph, Twitter y JSON-LD BlogPosting/BreadcrumbList aparecen en el HTML inicial. Al navegar entre entradas se reemplazan todos los datos de la anterior. El autor editorial es la organización, sin inventar una persona.
- El servidor produce un sitemap con las rutas estáticas existentes y las entradas publicadas vigentes, con fechas reales y escape XML. Fallos del CMS generan 503, sin devolver un sitemap incompleto como exitoso.
- El contenedor usa Node para servir la salida híbrida de Angular. Conserva redirección histórica, cabeceras, compresión, caché de recursos versionados y healthz; HTML del blog y sitemap no se almacenan como recursos inmutables.
- Campos nuevos en Directus se añaden de forma idempotente; se conserva todo contenido, slugs, permisos y privacidad de archivos. La imagen social de Directus se incorpora al seguimiento de archivos del blog.
- Verificación: pruebas de metadatos y persistencia, compilación híbrida y solicitudes HTTP sin JavaScript para 200/404/503, etiquetas únicas, sitemap y exclusión de borradores. Despliegue primero en pruebas.
