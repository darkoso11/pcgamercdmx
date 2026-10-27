# Guía operativa del blog

Documentación del editor y del despliegue. El contenido publicado se administra desde el CMS; no se modifica como parte de las pruebas automatizadas.

## SEO y renderizado

### Comportamiento editorial

El editor permite título SEO, descripción SEO e imagen social opcionales. Si se dejan vacíos, usa el título del artículo con la marca, su resumen y portada. El contador es orientativo; el límite de almacenamiento de título SEO es 255 caracteres y no representa una regla de Google. La URL social debe ser http/https; no se aceptan credenciales dentro de las URLs utilizadas como imagen SEO. Una URL ya publicada se conserva en el editor. Las URLs nuevas normalizan acentos; Directus evita slugs duplicados.

Al editar una publicación se mantiene su fecha original, y Directus registra las fechas reales de creación/modificación. Programar requiere una fecha futura interpretada en America/Mexico_City. Los datos estructurados omiten fechas que no existan o no sean válidas, en vez de inventar una actualización.

### Renderizado y seguridad

`/blog` y `/blog/:slug` usan SSR por solicitud; las demás rutas conservan su estrategia anterior. El HTML inicial contiene metadatos, canonical, Open Graph, Twitter, BlogPosting y BreadcrumbList. El autor editorial es PC Gamer CDMX como organización. Los datos JSON-LD escapan los terminadores de script para evitar que contenido editorial se interprete como HTML ejecutable.

Las lecturas son anónimas y siguen los permisos del CMS: no se sirven borradores ni publicaciones futuras. Una entrada inexistente responde 404 y noindex; un fallo del CMS responde 503 y noindex. El timeout de lecturas públicas es de 10 segundos. Un cambio de slug durante navegación cancela la consulta anterior.

El servidor mantiene healthz, compresión, redirección histórica de gama alta y cabeceras de seguridad. El blog y sitemap usan `Cache-Control: no-store`. Los recursos estáticos mantienen caché larga; HTML y robots no se marcan como inmutables. Los hosts SSR están limitados explícitamente a producción, pruebas y localhost en angular.json. Otros hosts de preview no tienen garantizado SSR y deben autorizarse explícitamente si se necesitan.

### Esquema y migración

Antes de desplegar el nuevo editor:

1. Ejecutar `node tools/configure-blog-seo.mjs` con el acceso administrativo local ya configurado. Añade campos opcionales y fechas automáticas; comprueba duplicados antes de habilitar unicidad de slug. No renombra entradas ni modifica su estado.
2. Ejecutar `node tools/configure-blog-privacy.mjs --schema-only`, aplicar `tools/blog-file-privacy.sql` en PostgreSQL y ejecutar `node tools/configure-blog-privacy.mjs`. La sincronización incluye `seo_image`: una imagen social de Directus sigue privada mientras no tenga ninguna entrada publicada vigente que la utilice. Se conservan los permisos existentes.
3. Ejecutar la compilación y desplegar el Dockerfile nuevo, que sirve la salida híbrida con Node en el puerto 80. El healthcheck continúa en `/healthz`.

Los campos nuevos y el seguimiento de imagen social se aplicaron al CMS compartido de pruebas/producción durante la preparación, sin publicar ni cambiar contenido del usuario. Las fechas antiguas de modificación permanecen vacías si no se conocen.

### Sitemap

`/sitemap.xml` incorpora las rutas estáticas de `src/sitemap.xml` y consulta al CMS las entradas publicadas con fecha vigente en páginas de 100 registros. Se eliminan referencias editoriales estáticas obsoletas, se deduplican URLs y se escapa XML. Las fechas `lastmod` usan modificación real cuando está disponible. Si el CMS falla, el endpoint responde 503 y Retry-After; no entrega un sitemap incompleto como si fuera correcto. Cambios de contenido y publicaciones programadas no requieren reconstruir el sitio.


## Privacidad de artículos y medios

Los permisos anónimos de entradas exigen `published=true` y `published_at <= $NOW`. Los archivos del blog se identifican con `pc_blog_managed`; `pc_blog_public_at` y la tabla de referencias se actualizan mediante triggers al crear, editar o eliminar entradas. Portada, secciones e imagen social permanecen privadas hasta que alguna publicación vigente las utilice. Un archivo compartido sigue público si otra publicación vigente lo necesita. Los recursos del catálogo ajenos al blog conservan sus permisos.

Las subidas se marcan como editoriales desde su creación; el editor carga medios privados con autenticación por cabecera y libera las URLs blob temporales. No se incluyen tokens en las URLs.

Tanto `environment.ts` como `environment.prod.ts` apuntan al mismo CMS; los permisos aplicados afectan a ambos frontends que lo consumen. Archivos de otros dominios no quedan protegidos por Directus. Una copia ya descargada o almacenada en la caché de un navegador no puede revocarse; las verificaciones anteriores son solicitudes nuevas al servidor.

Reaplicación: ejecutar `node tools/configure-blog-privacy.mjs --schema-only`, aplicar `tools/blog-file-privacy.sql` en la base del CMS, y ejecutar `node tools/configure-blog-privacy.mjs`. El SQL incluye funciones, índices, trigger y reconstrucción de referencias; debe conservarse en respaldos/migraciones de infraestructura. `python tools/verify-blog-privacy.py` ejecuta el ciclo real con registros desechables. Los scripts leen credenciales de la ubicación local existente, sin imprimirlas.


## Autoguardado, recuperación e historial

## Qué guarda cada opción

- **Copia automática local:** se escribe después de un segundo sin cambios, o al salir normalmente del editor. IndexedDB conserva formularios incompletos y los archivos pendientes de subir. Se separa por CMS, usuario y artículo; los artículos nuevos comparten una copia por usuario en ese navegador, protegida contra sobrescrituras entre pestañas.
- **Guardar borrador / Publicar:** conserva la versión en Directus. Solo un guardado manual correcto limpia la copia local correspondiente. Un fallo de red no la elimina.
- **Historial de versiones:** muestra las últimas 20 revisiones guardadas en Directus. Abrir una versión carga su contenido en el editor para revisarlo; no llama a revert ni publica. Se conservan la URL y fecha de publicación actuales. La versión recuperada se puede guardar después como borrador o publicación mediante los botones existentes.

La portada, imágenes y videos pendientes se almacenan como File, sin subirlos para autoguardar. Las miniaturas temporales se reconstruyen al recuperar. No se copian credenciales ni tokens dentro del borrador.

Mientras la última edición sigue en espera se muestra **Copia local pendiente…**. La hora de la copia anterior no implica que esa última edición ya esté guardada; el aviso solo desaparece al completar la escritura correspondiente.

## Recuperar trabajo

1. Abrir el mismo artículo con el mismo usuario en el mismo navegador y dominio.
2. Si existe una copia local, el editor ofrece **Recuperar copia local** o **Descartar copia local**. El contenido del CMS permanece visible hasta elegir y el formulario se bloquea durante esa decisión.
3. Revisar la copia recuperada y guardar manualmente en el CMS. Recuperar nunca cambia por sí mismo el estado publicado/borrador.
4. El historial se consulta con **Ver historial de versiones**. Antes de reemplazar cambios sin guardar se pide confirmación.

El editor advierte al salir con cambios sin guardar en el CMS. Deshabilita la edición mientras carga un registro, guarda o abre una revisión para evitar que una respuesta sustituya texto escrito durante esa operación. Al volver desde vista previa conserva el trabajo y detecta si otra pestaña cambió la copia local.

## Conflictos y errores

Las escrituras y eliminaciones de la copia local verifican su revisión dentro de una transacción IndexedDB. Si otra pestaña la cambió, se detiene el autoguardado y se ofrece revisar la recuperación; no se sobrescribe esa copia silenciosamente.

Antes de guardar un artículo existente se compara `date_updated` del CMS con la versión cargada. Si cambió, se conserva el trabajo local y se pide comparar/cargar la versión actual. Esta comprobación detecta cambios previos; **no es un bloqueo atómico de edición simultánea en el servidor**.

Si el navegador rechaza almacenamiento, falta espacio o no puede verificarse el usuario, se muestra un aviso y no se presenta una copia como guardada. Las lecturas del historial utilizan la sesión normal del usuario y los permisos de Directus; los errores de acceso tienen mensaje y reintento. La colección ya tiene accountability=all, por lo que esta función no requiere ampliar permisos públicos ni cambiar el esquema del CMS.

## Límites

- La copia local no se sincroniza entre dispositivos, navegadores o dominios. Las copias de localhost, test y producción son distintas.
- El navegador puede eliminar almacenamiento y en incógnito puede perderse al cerrar la sesión. Guardar manualmente en el CMS sigue siendo necesario.
- El último segundo de edición y una escritura asíncrona al cerrar de forma forzada no tienen garantía de persistencia; el aviso de salida permite quedarse y guardar.
- Para abrir un artículo existente y resolver la identidad del usuario se necesita una sesión válida y acceso al CMS. Los cambios de una sesión de edición ya abierta sí pueden guardarse localmente sin red; si se recarga sin conexión, la copia se conserva para recuperarla cuando vuelva el acceso.
- Las revisiones dependen de la retención de Directus. No reconstruyen archivos eliminados de su biblioteca.
- El historial registra guardados en el CMS; no representa una versión distinta por cada tecla o autoguardado local.


## Revisión previa y enlaces

## Revisión antes de publicar

Al final del editor aparece un panel con errores y recomendaciones. Comprueba título, resumen, categoría, formato de URL, URLs de enlaces, texto accesible de enlaces, imagen social, descripciones de imágenes, contenido de secciones y jerarquía de encabezados.

Los errores impiden publicar/programar. Las recomendaciones (por ejemplo, falta de portada, secciones vacías o imágenes informativas sin alt) no bloquean la publicación. El guardado de borradores permite enlaces incompletos para seguir trabajando, sujeto a las validaciones básicas que ya tenía el formulario.

Los campos SEO opcionales conservan sus valores automáticos. No se exige una densidad de palabras, un mínimo arbitrario de palabras ni una puntuación SEO. La revisión no consulta la respuesta HTTP de cada enlace, por lo que no sustituye comprobar que el destino realmente existe.

## Gestión de enlaces

Cada sección incluye el desplegable **Gestionar enlaces de la sección**:

1. Buscar por título en artículos publicados con fecha vigente, productos o ensambles públicos. Los resultados se consultan sin credenciales y se limitan a 12; una búsqueda posterior cancela la anterior.
2. Elegir el destino o escribir una ruta interna, ancla, URL http/https, mailto o tel.
3. Indicar texto, relación (normal, sponsored, ugc o nofollow y combinaciones) y si abre en otra pestaña.
4. Insertar en el texto, en la posición del cursor/selección del editor, o agregar como enlace relacionado de la sección.
5. Editar o quitar enlaces existentes. Quitar un enlace del texto conserva sus palabras. Los relacionados también se pueden reordenar.

Las URLs rechazan esquemas ejecutables, credenciales, controles y rutas relativas ambiguas. Los enlaces nuevos de otra pestaña añaden noopener y noreferrer. Un enlace normal no se marca automáticamente nofollow. Los atributos del texto se registran como formatos de Quill antes de importar el HTML, para conservarlos al editar, previsualizar y recuperar.

La edición del pequeño formulario de enlace se incorpora al artículo y al autoguardado al pulsar **Insertar**, **Agregar** o **Aplicar**; escribir en ese formulario sin aplicar no modifica el contenido. La búsqueda no modifica artículos ni productos.

Los enlaces relacionados usan el JSON de secciones existente. Se conservan metadatos previos, controles completos al reordenar y propiedades de enlaces al abrir una revisión o recuperar un borrador. Se muestran tanto en el detalle público como en la vista previa. No se necesitan migraciones ni ampliaciones de permisos del CMS.


## Filtros administrativos

Los filtros de estado, categoría y subcategoría se aplican al cambiarlos. Título, etiquetas y fechas esperan 300 ms sin cambios; Buscar o Enter aplican inmediatamente. Una nueva consulta cancela la anterior y reinicia la paginación.

- Título: busca en el título, sin distinguir mayúsculas ni acentos.
- Etiquetas: varias etiquetas separadas por comas o punto y coma coinciden con cualquiera de ellas. Los demás filtros se combinan mediante AND.
- Estado: Publicado, Borrador y Programado coinciden con las etiquetas visibles de cada fila; Programado no se incluye en Publicado.
- Fechas: se filtra la misma fecha que muestra la tabla (`createdAt`, con la compatibilidad existente de publicación para registros antiguos). El rango incluye ambos días completos en America/Mexico_City. Un artículo sin fecha se incluye sin filtro temporal y queda fuera cuando se solicita un rango; no se inventan fechas para borradores antiguos.
- Un rango invertido muestra un error. Los fallos de carga no se presentan como si no hubiera coincidencias.
- Limpiar filtros restaura todos los artículos y las opciones de subcategoría.

Pruebas: reproducción de fechas, estados, etiquetas y respuestas fuera de orden antes de corregir; pruebas de límites exactos de medianoche y combinaciones; prueba de interfaz en Chromium, Firefox y WebKit. Los datos de esas pruebas son simulados y no modifican publicaciones.

La consulta administrativa mantiene su límite previo de 1,000 registros; la paginación y filtrado íntegros del lado de Directus para catálogos mayores siguen como tarea separada de escalabilidad.

## Imágenes, encabezados e indexación

El editor ofrece descripción alternativa y marca decorativa para portada e imágenes de sección. H1 queda reservado al título y H2 a las secciones; el texto ofrece H3/H4 y normaliza encabezados H1/H2 heredados a H3 conservando su texto.

El hostname `test.pcgamercdmx.com` responde `X-Robots-Tag: noindex` en páginas, errores, recursos y sitemap. Se permite el rastreo para que los buscadores lean esa cabecera. Producción conserva su política de indexación.

## Verificación

- `npm test -- --watch=false --browsers=ChromeHeadless`: regresiones unitarias.
- `npm run build`: compilación híbrida.
- `npx playwright test`: pruebas de navegador con datos simulados para edición.
- `node tools/verify-blog-seo.mjs`: HTML, metadatos, sitemap y respuestas públicas.
- `node tools/verify-blog-indexing.mjs`: noindex en pruebas.
- `python tools/verify-blog-seo-live.py` y `python tools/verify-blog-privacy.py`: verificaciones del CMS con registros temporales y limpieza posterior.

Los verificadores en vivo requieren acceso local configurado; no imprimir credenciales ni modificar artículos reales. Usar `BLOG_TEST_URL` para seleccionar el despliegue de pruebas.
