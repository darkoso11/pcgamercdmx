# Auditoría del blog — 20 de octubre de 2026

Rama: `audit-blog`. Alcance: código del listado, detalle, editor, vista previa, categorías, servicios, mapeadores, subida de archivos, configuración de compilación, rutas, SEO, pruebas y documentación. Auditoría sin modificar contenido ni esquema remoto.

## Resultado

Actualización de correcciones del 20 de octubre: se corrigieron los hallazgos 1, 2, 5 y 6 en el editor. Las secciones se mueven como controles completos; la vista previa espera las subidas y conserva una copia por ruta en sessionStorage que se consume al volver; el guardado preserva datos no editables, el orden y los videos adicionales; las subidas de imágenes descartan respuestas de selecciones anteriores. Se añadieron nueve pruebas de regresión (las cinco primeras fallaron antes de corregir; otras dos reprodujeron la carrera de imágenes). Suite completa: 349/349 correctas. Compilación de producción correcta con la advertencia de presupuesto preexistente. No se ha validado el flujo contra el CMS remoto. La recuperación implementada cubre volver desde la vista previa, no un autoguardado general al cerrar el editor.

El blog tiene CRUD, borradores, publicación inmediata, programación, subida a Directus y vista previa. **No está preparado para garantizar publicaciones sin pérdida de contenido ni SEO específico por artículo.** Los siguientes hallazgos se sustentan en el código; no equivalen a una prueba administrativa contra el CMS real.

## P1 — Alta prioridad

1. **Mover secciones puede perder o duplicar imágenes.** `src/app/features/blog/admin/admin-article-editor.component.ts:304`: `moveSectionUp` y `moveSectionDown` intercambian valores mediante `patchValue`, sin intercambiar los controles. Un FormArray vacío no crea controles al recibir imágenes y uno más largo conserva controles sobrantes. Reproducción: sección A con dos imágenes y B sin imágenes; mover B arriba. Los archivos pendientes, asociados como propiedades del control, tampoco se mueven. Solución: mover los FormGroup completos con `removeAt`/`insert`; probar cantidades distintas y subidas pendientes.

2. **La vista previa abandona el formulario sin restaurarlo.** Editor `:492`, `admin-article-preview.component.ts:105`: se guarda un snapshot en sessionStorage y se navega fuera. Volver al editor crea otra instancia que carga Directus o un formulario nuevo; no lee el snapshot. Un artículo nuevo pierde los cambios al regresar y uno existente vuelve a su última versión guardada. Conservar/restaurar un borrador de editor completo, incluyendo estado de archivos pendientes, o mostrar la vista previa sin destruir el editor.

3. **SEO idéntico para todos los artículos.** `src/app/app.routes.ts:176`, `src/app/features/blog/article.component.ts:187`, `src/app/app.component.ts:73`: la ruta usa «Artículo | PC Gamer CDMX» y el detalle no invoca SeoService. Descripción e imagen social son las generales; `og:type` permanece `website`. No se genera BlogPosting/Article. Conectar título, resumen, portada, URL y fechas del artículo al servicio SEO; verificar entrada directa y navegación interna.

4. **El HTML inicial del artículo no contiene el contenido editorial.** `src/app/app.routes.server.ts:19` configura `blog/:slug` como Client y `angular.json:production` genera una salida estática. El `data.renderMode = dynamic` de la ruta no modifica esa configuración. Los lectores de enlaces que no ejecutan JavaScript reciben la página genérica. Elegir prerender con descubrimiento de slugs y regeneración al publicar, o SSR operativo; verificar HTML obtenido sin JavaScript y publicación programada sin depender de una compilación manual.

5. **Editar multimedia existente puede eliminar datos.** Editor `:136-170` y `:600`: se toma únicamente el primer video de cada clase, se excluyen todos los videos de `existingMedia` y se reconstruyen sin `captionsUrl`/`transcript`. También se reconstruyen imágenes sin preservar todas las propiedades del contrato, y las secciones sin sus enlaces originales. Una entrada con esos datos pierde información al guardarse aunque no se edite esa parte. Preservar íntegramente propiedades no modificadas y probar un ciclo cargar → guardar.

## P2 — Prioridad media

6. **Cambiar la imagen durante una subida puede guardar la anterior.** Editor `:245-300` y `:328-375`: una promesa en curso bloquea la subida de la segunda selección, pero al finalizar escribe el resultado del primer archivo. Portada borra además `selectedCoverFile`; en imágenes el fileId anterior impide el reintento al guardar. Aplicar una identidad de selección como ya se hace con los videos y probar dos selecciones consecutivas con respuestas diferidas.

7. **Fecha de publicación reescrita en cada guardado público.** Editor `:554`: «Publicar ahora» asigna siempre el instante actual; guardar borrador borra la fecha. Al corregir un artículo publicado se altera su antigüedad y orden. Separar fecha original y fecha de actualización; ofrecer cambio de estado explícito.

8. **Programar en el pasado publica de inmediato.** Editor `:548-556`: solo valida que exista una fecha. El filtro público acepta cualquier fecha anterior al momento actual. Validar fecha futura y mostrar su zona horaria antes de programar.

9. **Slugs sin validación suficiente.** Editor `:62` y `:539`: el campo libre no valida espacios, separadores, caracteres o duplicados; la generación elimina letras acentuadas en lugar de normalizarlas. Ejemplo: «Guía» produce `gua`. Validar formato y unicidad del lado CMS, normalizar diacríticos y conservar slugs existentes; prever redirecciones para cambios de URL.

10. **La paginación puede saltar artículos después de un error.** `blog-list.component.ts:306`: `loadMore` incrementa la página antes de recibir respuesta y «Reintentar» llama `load(true)`. Si se vuelve a cargar más tras un fallo, el índice puede avanzar sin haber obtenido la página fallida. Confirmar la página después de éxito y conservar el intento fallido. Las búsquedas simultáneas tampoco cancelan solicitudes: una respuesta antigua puede reemplazar resultados nuevos.

11. **Límite de 1,000 entradas en administración.** `services/blog.service.ts:98-118`: descarga hasta mil registros y filtra/pagina en cliente. Los posteriores no aparecen y la comprobación de uso de categorías puede dar falsos negativos. Consultar filtros, conteos y paginación en el servidor; asegurar integridad referencial al borrar categorías y subcategorías.

12. **Faltan herramientas editoriales SEO.** `models/types.ts:90`, editor y payload del mapper: no existen título SEO, descripción SEO, imagen social independiente ni sus controles/validaciones. Se puede implementar un SEO básico automáticamente a partir de título/resumen/portada, pero actualmente tampoco está conectado. Priorizar esa conexión; añadir overrides opcionales y una previsualización del snippet, sin exigir keywords como requisito de posicionamiento.

13. **Sin estrategia de descubrimiento de artículos en sitemap.** `src/sitemap.xml:20` incluye el listado, no las entradas, y no se encontró generador de sitemap editorial. Incluir solo slugs publicados con fecha vigente, retirar entradas despublicadas y actualizar al publicar. La ausencia de sitemap no impide por sí sola la indexación.

14. **Estado no encontrado sin señal SEO específica.** `article.component.ts:219`: muestra «404», pero no marca noindex ni controla estado HTTP. En una salida SPA existe riesgo de soft 404; el código HTTP real depende del alojamiento y queda pendiente de comprobar. Resolver 404 real con SSR/alojamiento, o noindex para la pantalla inexistente según la arquitectura elegida.

15. **Accesibilidad de imágenes y secciones incompleta.** Editor no exige alt informativo ni permite editar el alt de portada; toma el título al subirla. El detalle crea IDs con `section.id`, pero el editor no genera ni preserva ese campo: varias secciones pueden acabar como `section-undefined`. Añadir identificadores estables y alt editable con opción decorativa explícita. Validar jerarquía de encabezados del texto enriquecido, cuyo toolbar permite otro h1.

16. **Errores administrativos ocultos.** `services/blog.service.ts:240` convierte el fallo al cargar subcategorías en `[]`; el listado administrativo también presenta una lista vacía ante errores. El usuario no distingue falta de contenido de permisos/conectividad. Mantener estados de error y reintento.

## Archivos, imágenes y logs

- Candidatos obsoletos sin consumidores encontrados: `features/blog/blog.component.ts`, su CSS vacío, y `features/blog/services/auth.service.ts`/`auth.guard.ts`. Las rutas usan el AuthGuard del administrador central. Confirmar ausencia de usos externos antes de retirar.
- `src/assets/mock/blog-sample.json` sí lo consume `tools/directus-seed-from-mocks.mjs`; no clasificarlo como basura. Al estar en assets también se copia a producción: mover fixtures de herramientas fuera del directorio público cuando se ajuste el seed.
- `docs/content/**/*.md` son fuentes del generador de landings según `docs/content/README.md` y `tools/prepare-september-content.py`. No borrarlos por no renderizarse directamente en el blog.
- Los planes y especificaciones son documentos de mantenimiento, no contenido público del blog. El plan anterior mantiene pendiente la validación administrativa y declara capacidades que requieren las correcciones anteriores.
- Dos `console.error` en el área: borrado administrativo y reinicio de mocks. No se encontraron `debugger` ni archivos `.log` versionados. Un log de error no es por sí mismo un fallo; conviene mostrar un error útil al usuario y evitar imprimir respuestas completas innecesariamente.
- No se encontraron imágenes locales con `blog` o `article` en su ruta. Las imágenes editoriales se almacenan en Directus. Esto no demuestra ausencia de archivos huérfanos remotos: hace falta cotejar referencias del CMS y almacenamiento, incluyendo borradores. No se eliminó ningún recurso.

## Comprobaciones y límites

- Compilación de producción: correcta, 21 rutas prerenderizadas. Advertencia de presupuesto inicial: 553.33 kB frente a 550 kB; no atribuida exclusivamente al blog.
- `node --test tools/blog-taxonomy.spec.mjs`: 2/2 correctas.
- Comando Angular con selección de pruebas de blog, mapper y SEO: 36/36 correctas en Chrome Headless. El primer arranque del navegador agotó 60 segundos; el reintento automático pasó. Revisar el bootstrap de pruebas antes de interpretar esta cifra como cobertura completa de todos los archivos seleccionados.
- No se crearon/publicaron entradas reales ni se modificaron permisos del CMS. No se comprobó una sesión administrativa de navegador, consola/red en ejecución ni accesibilidad visual: los hallazgos de esos ámbitos son de código.
- El script `configure-blog-schema.mjs` prepara taxonomía y permisos de esa taxonomía; no demuestra que los permisos públicos de posts excluyan borradores y fechas futuras. Los filtros del frontend sí están presentes, pero la seguridad requiere comprobar esos filtros también en Directus. Pendiente de verificación remota, no se afirma una exposición.

## Orden de corrección y aceptación

1. Preservar formulario, secciones y multimedia; cubrir reordenamiento, vista previa y reemplazos durante subidas.
2. Definir renderizado y publicación; conectar SEO por artículo y actualizar sitemap.
3. Validar slugs, fechas, contenido y accesibilidad; conservar la fecha original al editar.
4. Mover filtros/paginación al CMS, verificar integridad y permisos; limpiar código sin consumidores.
5. Prueba completa con datos de ensayo: crear → subir → reordenar → previsualizar → volver → guardar borrador → programar → publicar → corregir → despublicar. Comprobar HTML inicial, metadatos, imágenes, enlaces, respuestas 404 y consola en escritorio/móvil.

Referencia SEO: [Google Search Central: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) explica metadatos mediante JavaScript y prevención de soft 404; [guía para desarrolladores](https://developers.google.com/search/docs/fundamentals/get-started-developers) recomienda títulos/descripciones descriptivos por página y datos estructurados pertinentes. El renderizado en cliente no equivale automáticamente a imposibilidad de indexar.
