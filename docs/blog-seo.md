# SEO del blog

## Comportamiento editorial

El editor permite título SEO, descripción SEO e imagen social opcionales. Si se dejan vacíos, usa el título del artículo con la marca, su resumen y portada. El contador es orientativo; el límite de almacenamiento de título SEO es 255 caracteres y no representa una regla de Google. La URL social debe ser http/https; no se aceptan credenciales dentro de las URLs utilizadas como imagen SEO. Una URL ya publicada se conserva en el editor. Las URLs nuevas normalizan acentos; Directus evita slugs duplicados.

Al editar una publicación se mantiene su fecha original, y Directus registra las fechas reales de creación/modificación. Programar requiere una fecha futura interpretada en America/Mexico_City. Los datos estructurados omiten fechas que no existan o no sean válidas, en vez de inventar una actualización.

## Renderizado y seguridad

`/blog` y `/blog/:slug` usan SSR por solicitud; las demás rutas conservan su estrategia anterior. El HTML inicial contiene metadatos, canonical, Open Graph, Twitter, BlogPosting y BreadcrumbList. El autor editorial es PC Gamer CDMX como organización. Los datos JSON-LD escapan los terminadores de script para evitar que contenido editorial se interprete como HTML ejecutable.

Las lecturas son anónimas y siguen los permisos del CMS: no se sirven borradores ni publicaciones futuras. Una entrada inexistente responde 404 y noindex; un fallo del CMS responde 503 y noindex. El timeout de lecturas públicas es de 10 segundos. Un cambio de slug durante navegación cancela la consulta anterior.

El servidor mantiene healthz, compresión, redirección histórica de gama alta y cabeceras de seguridad. El blog y sitemap usan `Cache-Control: no-store`. Los recursos estáticos mantienen caché larga; HTML y robots no se marcan como inmutables. Los hosts SSR están limitados explícitamente a producción, pruebas y localhost en angular.json. Otros hosts de preview no tienen garantizado SSR y deben autorizarse explícitamente si se necesitan.

## Esquema y migración

Antes de desplegar el nuevo editor:

1. Ejecutar `node tools/configure-blog-seo.mjs` con el acceso administrativo local ya configurado. Añade campos opcionales y fechas automáticas; comprueba duplicados antes de habilitar unicidad de slug. No renombra entradas ni modifica su estado.
2. Aplicar `tools/blog-file-privacy.sql` en PostgreSQL. La sincronización incluye `seo_image`: una imagen social de Directus sigue privada mientras no tenga ninguna entrada publicada vigente que la utilice. Se conservan los permisos existentes.
3. Ejecutar la compilación y desplegar el Dockerfile nuevo, que sirve la salida híbrida con Node en el puerto 80. El healthcheck continúa en `/healthz`.

Los campos nuevos y el seguimiento de imagen social se aplicaron al CMS compartido de pruebas/producción durante la preparación, sin publicar ni cambiar contenido del usuario. Las fechas antiguas de modificación permanecen vacías si no se conocen.

## Sitemap

`/sitemap.xml` incorpora las rutas estáticas de `src/sitemap.xml` y consulta al CMS las entradas publicadas con fecha vigente en páginas de 100 registros. Se eliminan referencias editoriales estáticas obsoletas, se deduplican URLs y se escapa XML. Las fechas `lastmod` usan modificación real cuando está disponible. Si el CMS falla, el endpoint responde 503 y Retry-After; no entrega un sitemap incompleto como si fuera correcto. Cambios de contenido y publicaciones programadas no requieren reconstruir el sitio.

## Validación

- Suite Angular: 385 pruebas correctas antes de la verificación final.
- Interfaz pública: 46 pruebas Chromium correctas.
- Compilación híbrida: correcta, 99 rutas prerenderizadas y blog SSR.
- `node tools/verify-blog-seo.mjs`: HTML inicial, etiquetas únicas, canonical, datos estructurados, 404, sitemap y healthz; lectura sin credenciales.
- `python tools/verify-blog-seo-live.py`: crea únicamente datos temporales, verifica personalización SEO, programación, actualización sin recompilar, imagen social privada y retirada del sitemap al despublicar; elimina los datos al terminar.
- `python tools/verify-blog-privacy.py`: regresión de permisos de medios y entradas.
- Las respuestas 503/noindex del detalle se cubren además por una prueba de componente con fallo simulado del CMS.

Detrás de Traefik, Angular acepta explícitamente las cabeceras forwarded que añade Dokploy, manteniendo la lista de hosts permitidos. El verificador incluye una solicitud con esas cabeceras para detectar una caída involuntaria a renderizado del cliente. Véase la [configuración de proxy de Angular](https://angular.dev/best-practices/security#configuring-trusted-proxy-headers).

Para verificar un despliegue, establecer `BLOG_TEST_URL` al dominio de pruebas al ejecutar los dos verificadores SEO. No publicar cambios en una entrada real para comprobarlos.

## Límites

### Cierre editorial y pruebas

El editor permite describir la portada y marcarla decorativa, así como marcar imágenes de sección decorativas. El guardado y la vista previa conservan estos valores. El contenido enriquecido reserva H1 al título y H2 a las secciones: ofrece H3/H4 y normaliza los H1/H2 heredados a H3 al mostrar y guardar, sin eliminar su texto.

El servidor responde `X-Robots-Tag: noindex` exclusivamente al hostname `test.pcgamercdmx.com`, incluyendo páginas, errores, archivos y sitemap. Producción conserva su política de indexación. Se mantiene el rastreo permitido para que los buscadores lean noindex. Verificar con `node tools/verify-blog-indexing.mjs`.

Las propuestas concretas para las dos entradas públicas y la validación en Search Console están en [la revisión editorial](blog-seo-editorial-review.md). La propiedad está verificada según el usuario. La comprobación de producción aún devuelve el HTML anterior al despliegue SSR; repetirla después de la promoción. No se han reescrito ni despublicado artículos reales ni enviado solicitudes a Search Console.

Validación de este cierre: 388 pruebas Angular correctas, compilación híbrida correcta, verificación SSR local y prueba de cabeceras para test, dominio principal y www.

Los cambios mejoran los datos entregados a buscadores y lectores de enlaces, sin garantizar indexación, posición ni apariencia final en resultados. El despliegue inicial corresponde al sitio de pruebas; producción requiere la promoción habitual audit-blog → dev → test → main. Revertir el frontend al contenedor Nginx anterior elimina SSR, aunque los campos aditivos y permisos del CMS siguen siendo compatibles. Una migración del CMS a otro servidor debe incluir también el SQL de seguimiento de archivos.

Referencias: [Angular SSR 20](https://v20.angular.dev/guide/ssr), [Google Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article), [descripciones en resultados](https://developers.google.com/search/docs/appearance/snippet).
