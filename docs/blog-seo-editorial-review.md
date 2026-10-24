# Revisión editorial del blog — 23 de octubre de 2026

Revisión de lectura de las dos entradas públicas del CMS. No modifica publicaciones ni inventa descripciones de imágenes que requieren inspección visual.

## Cómo elegir una PC gamer en CDMX

- URL existente: `/blog/como-elegir-pc-gamer-cdmx`; conservarla.
- Título SEO propuesto: `Cómo elegir una PC gamer en CDMX | PC Gamer CDMX`.
- Descripción propuesta, consistente con el contenido actual: `Define tu presupuesto, resolución y juegos antes de elegir los componentes de tu PC gamer en CDMX.`
- Corregir acentos del título y resumen visibles al realizar la edición definitiva.
- Reemplazar la sección «Otra seccion», cuyo texto declara que sirve para probar secciones, por contenido editorial real o retirarla por decisión del editor.
- La imagen de esa sección no tiene alt. Revisarla visualmente y describir su información, o marcarla decorativa si no aporta contenido. El título del artículo como alt de portada tampoco sustituye una descripción visual precisa.
- El video usa el nombre del archivo de WhatsApp como título. Asignar un título que describa el video y revisar si necesita transcripción/subtítulos.
- Añadir enlaces contextuales a `/ensambles` y `/productos` cuando la explicación trate de elegir un equipo o componentes; comprobar que respondan correctamente antes de guardar.
- Ampliar la guía con recomendaciones propias y verificables antes de presentarla como guía completa; evitar inventar precios o especificaciones.

## Artículo de ejemplo

- URL: `/blog/sample-article`.
- El título, resumen y cuerpo se identifican como material de desarrollo. No convertirlo automáticamente en un artículo comercial ni rellenar metadatos ficticios.
- Decisión editorial pendiente: devolverlo a borrador o sustituirlo por un artículo real conservando/redirigiendo su URL según corresponda. La herramienta de despublicación retira automáticamente su URL del sitemap.
- No tiene portada. Si se convierte en artículo definitivo, elegir una imagen adecuada, describirla y revisar la vista al compartir.

## Cierre en producción y Search Console

La propiedad de Search Console está verificada según el usuario. Tras promover y desplegar estos cambios en producción:

1. Ejecutar `tools/verify-blog-seo.mjs` con `BLOG_TEST_URL=https://pcgamercdmx.com`.
2. Comprobar en Rich Results Test una entrada real: BlogPosting, BreadcrumbList, URL canónica y fechas reales; corregir errores y evaluar recomendaciones.
3. En Search Console, enviar o volver a comprobar `https://pcgamercdmx.com/sitemap.xml`; inspeccionar la URL de una guía y comprobar el HTML rastreado y la canónica elegida.
4. Solicitar indexación solo para contenido definitivo. Revisar posteriormente el informe de indexación; enviar un sitemap no garantiza que Google indexe sus URLs.
5. Inspeccionar el dominio de pruebas y verificar la recepción de `X-Robots-Tag: noindex`. Mantener accesible el rastreo para que Google pueda leer esta instrucción.

La configuración de Search Console y los resultados de Google requieren la sesión del propietario. No se ha enviado un sitemap ni solicitado indexación desde esta auditoría.

Referencias: [Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start), [Article](https://developers.google.com/search/docs/appearance/structured-data/article), [noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing).
