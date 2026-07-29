---
goal: Unificar, reparar y renovar el blog público y administrativo
version: 1.0
date_created: 2026-07-28
last_updated: 2026-07-28
owner: PC Gamer CDMX
status: 'In progress'
tags: [feature, bugfix, accessibility, directus, migration, blog]
---

# Introduction

![Status: In progress](https://img.shields.io/badge/status-In%20progress-yellow)

Este plan implementa la especificación aprobada para corregir la publicación del blog, separar su taxonomía del catálogo, incorporar multimedia híbrida y mejorar la accesibilidad del frontend y del panel administrativo.

## 1. Requirements & Constraints

- **REQ-001**: `BlogListComponent` y `ArticleComponent` deben consumir `BlogService`; no deben consultar Directus o datos simulados directamente.
- **REQ-002**: Las lecturas públicas deben exigir `published = true` y `published_at <= instante actual`.
- **REQ-003**: El detalle público debe presentar estados de carga, error y no encontrado.
- **REQ-004**: `cover_image` y los bloques multimedia deben normalizar valores heredados y nuevos.
- **REQ-005**: El blog debe usar `pc_blog_categories` y `pc_blog_subcategories`.
- **REQ-006**: `pc_categories` y `pc_subcategories` deben permanecer exclusivas del catálogo.
- **REQ-007**: El administrador debe crear categorías y subcategorías editoriales.
- **REQ-008**: El editor debe guardar borradores, publicar ahora, programar y previsualizar.
- **REQ-009**: La carga de archivos debe usar Directus Files y admitir imágenes y videos.
- **REQ-010**: Los videos externos deben admitir únicamente URLs normalizadas de YouTube y Vimeo.
- **REQ-011**: Las fechas de entrada se interpretan en `America/Mexico_City` y se guardan en UTC.
- **REQ-012**: La interfaz debe seguir la dirección visual Editorial cian.
- **ACC-001**: Texto, controles, foco y estados deben cumplir WCAG 2.2 AA.
- **ACC-002**: Imágenes informativas requieren texto alternativo.
- **ACC-003**: Acciones, diálogos, formularios y mensajes deben funcionar con teclado y tecnologías de asistencia.
- **SEC-001**: El detalle público no debe usar `bypassSecurityTrustHtml`.
- **SEC-002**: No se debe persistir HTML arbitrario para videos externos.
- **SEC-003**: Credenciales y tokens de Directus no se deben escribir en archivos del repositorio ni en logs.
- **CON-001**: La aplicación permanece en Angular 20 y usa Directus existente.
- **CON-002**: Los cambios deben preservar los slugs públicos actuales.
- **CON-003**: La migración debe ser idempotente y admitir `--dry-run`.
- **CON-004**: Cada cambio de comportamiento debe comenzar con una prueba que falle por la razón esperada.
- **PAT-001**: Los mapeadores puros viven en `src/app/core/services/directus-content.mapper.ts` o utilidades puras específicas del blog.
- **PAT-002**: Las consultas Directus se encapsulan en `BlogService` y `DirectusApiService`.

## 2. Implementation Steps

### Implementation Phase 1

- GOAL-001: Establecer contratos, pruebas de regresión y utilidades puras.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-001 | Ampliar `src/app/features/blog/models/types.ts` con estados editoriales, `ArticleMedia` discriminado y metadatos de archivo. Crear primero pruebas del mapper en `src/app/core/services/directus-content.mapper.spec.ts`. | | |
| TASK-002 | Crear `src/app/features/blog/services/blog-content.utils.ts` y `.spec.ts` para estado publicado/programado, normalización YouTube/Vimeo, slug y fecha CDMX/UTC. Verificar RED y después GREEN por comportamiento. | | |
| TASK-003 | Extender `mapDirectusBlogPostToArticle` y `mapArticleToDirectusPayload` para portadas nulas, rutas heredadas, objetos con `fileId` y bloques multimedia. | | |

### Implementation Phase 2

- GOAL-002: Unificar lecturas públicas y administrativas.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-004 | Crear `src/app/features/blog/services/blog.service.spec.ts` con pruebas para consulta pública, fecha límite, detalle por slug, 404 y consultas administrativas autenticadas. | | |
| TASK-005 | Refactorizar `src/app/features/blog/services/blog.service.ts`: añadir `listPublished`, `getPublishedBySlug`, usar taxonomía editorial y conservar CRUD autenticado. No ocultar errores públicos con mocks. | | |
| TASK-006 | Reescribir `src/app/features/blog/blog-list.component.ts` para usar `BlogService`, estado explícito y filtros editoriales. | | |
| TASK-007 | Reescribir `src/app/features/blog/article.component.ts` para usar `BlogService`, saneamiento Angular normal, bloques multimedia y 404/error accionable. | | |

### Implementation Phase 3

- GOAL-003: Separar y migrar la taxonomía del blog.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-008 | Cambiar constantes de `BlogService` a `pc_blog_categories` y `pc_blog_subcategories`; cubrir CRUD y protección de categorías en uso con pruebas. | | |
| TASK-009 | Crear `tools/configure-blog-schema.mjs` para crear/actualizar colecciones, campos y permisos públicos de lectura. El script debe ser idempotente y leer variables de entorno. | | |
| TASK-010 | Crear `tools/migrate-blog-taxonomy.mjs` con `--dry-run`; normalizar categorías heredadas, mantener slugs de entradas y emitir resumen JSON. | | |
| TASK-011 | Añadir scripts `configure:blog` y `migrate:blog-taxonomy` a `package.json`; documentar variables y secuencia en `docs/backend/directus-integration.md`. | | |
| TASK-012 | Actualizar `src/app/features/blog/admin/admin-categories.component.ts` para trabajar sólo con la taxonomía editorial, validar duplicados y bloquear eliminación insegura. | | |

### Implementation Phase 4

- GOAL-004: Implementar multimedia híbrida y flujo editorial.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-013 | Reemplazar `src/app/features/blog/services/upload.service.ts` por carga mediante `DirectusApiService.uploadFile`; devolver `fileId`, URL estable, MIME y nombre. Crear prueba RED antes del cambio. | | |
| TASK-014 | Refactorizar `admin-article-editor.component.ts`, `.html` y `.css` para imagen/video, URL YouTube/Vimeo, texto alternativo, progreso, error, reintento y eliminación. | | |
| TASK-015 | Añadir acciones `saveDraft`, `publishNow`, `schedulePublication` y `openPreview`; convertir fechas locales a UTC y prevenir doble envío. | | |
| TASK-016 | Permitir creación contextual de categoría y subcategoría desde el editor con diálogo accesible o sección expandible que preserve el formulario. | | |
| TASK-017 | Añadir ruta de vista previa autenticada en `src/app/app.routes.ts` y un modo de `ArticleComponent` que reciba el borrador por estado de navegación o almacenamiento temporal seguro del navegador. | | |

### Implementation Phase 5

- GOAL-005: Aplicar diseño Editorial cian y accesibilidad.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-018 | Extraer plantillas y estilos del listado público a archivos separados si el tamaño lo requiere; aplicar jerarquía editorial, contraste AA, foco visible, estados y comportamiento responsive. | | |
| TASK-019 | Aplicar estilos editoriales semánticos al detalle: encabezados, párrafos, listas, enlaces, citas, código, imágenes, video y transcripción. | | |
| TASK-020 | Refactorizar `admin-article-list.component.ts` para contraste AA, tabla responsive, estados publicados/programados/borradores y acciones con nombres accesibles. | | |
| TASK-021 | Refactorizar editor y categorías para etiquetas asociadas, mensajes `aria-live`, foco en errores, navegación por teclado y `prefers-reduced-motion`. | | |

### Implementation Phase 6

- GOAL-006: Verificar el sistema completo y documentar resultados.

| Task | Description | Completed | Date |
|------|-------------|-----------|------|
| TASK-022 | Ejecutar pruebas unitarias específicas después de cada ciclo RED/GREEN y finalmente la suite Angular completa en modo no interactivo. | | |
| TASK-023 | Ejecutar `npm run build` y corregir errores o advertencias introducidas por la tarea. | | |
| TASK-024 | Levantar `npm start`, comprobar Directus público, capturar errores de consola y validar listado/detalle en escritorio y móvil mediante Playwright. | | |
| TASK-025 | Ejecutar el flujo administrativo posible con la sesión disponible; si faltan credenciales de esquema, validar scripts en `--dry-run` o con respuestas simuladas sin exponer secretos. | | |
| TASK-026 | Completar `C:/Users/Oswaldo/Documents/Documentacion PCGAMERCDMX/Contexto y Arquitectura del Proyecto/AUDITORIA_BLOG_2026-07-28.md` con archivos, esquema, migración, pruebas, capturas y limitaciones reales. | | |

## 3. Alternatives

- **ALT-001**: Mantener consultas Directus duplicadas en los componentes públicos. Rechazado porque ya produjo divergencia de mapeo y errores silenciosos.
- **ALT-002**: Añadir un campo `scope` a la taxonomía del catálogo. Rechazado porque mantiene acoplados dominios que tienen ciclos de vida y responsables diferentes.
- **ALT-003**: Crear colecciones relacionales para cada bloque de contenido. Rechazado para esta iteración porque exige una migración mayor sin mejorar el objetivo inmediato frente a bloques JSON tipados.
- **ALT-004**: Aceptar HTML de iframe para videos. Rechazado por seguridad, saneamiento y accesibilidad.

## 4. Dependencies

- **DEP-001**: Angular 20, Angular Router, Reactive Forms y HttpClient ya instalados.
- **DEP-002**: Directus disponible en `environment.directus.url`.
- **DEP-003**: Una cuenta administrativa o token de Directus sólo es necesario para aplicar esquema y migración remotos.
- **DEP-004**: Playwright ya está instalado como dependencia de desarrollo.
- **DEP-005**: Quill/ngx-quill permanecen como editor de texto enriquecido.

## 5. Files

- **FILE-001**: `src/app/features/blog/models/types.ts`
- **FILE-002**: `src/app/core/services/directus-content.mapper.ts`
- **FILE-003**: `src/app/core/services/directus-content.mapper.spec.ts`
- **FILE-004**: `src/app/features/blog/services/blog-content.utils.ts`
- **FILE-005**: `src/app/features/blog/services/blog-content.utils.spec.ts`
- **FILE-006**: `src/app/features/blog/services/blog.service.ts`
- **FILE-007**: `src/app/features/blog/services/blog.service.spec.ts`
- **FILE-008**: `src/app/features/blog/services/upload.service.ts`
- **FILE-009**: `src/app/features/blog/services/upload.service.spec.ts`
- **FILE-010**: `src/app/features/blog/blog-list.component.ts`
- **FILE-011**: `src/app/features/blog/article.component.ts`
- **FILE-012**: `src/app/features/blog/admin/admin-article-editor.component.ts`
- **FILE-013**: `src/app/features/blog/admin/admin-article-editor.component.html`
- **FILE-014**: `src/app/features/blog/admin/admin-article-editor.component.css`
- **FILE-015**: `src/app/features/blog/admin/admin-article-list.component.ts`
- **FILE-016**: `src/app/features/blog/admin/admin-categories.component.ts`
- **FILE-017**: `src/app/app.routes.ts`
- **FILE-018**: `tools/configure-blog-schema.mjs`
- **FILE-019**: `tools/migrate-blog-taxonomy.mjs`
- **FILE-020**: `package.json`
- **FILE-021**: `docs/backend/directus-integration.md`
- **FILE-022**: Documento externo `AUDITORIA_BLOG_2026-07-28.md`

## 6. Testing

- **TEST-001**: Mapper acepta portada nula, URL heredada, objeto heredado y objeto con `fileId`.
- **TEST-002**: Consulta pública incluye filtros `published` y `published_at`.
- **TEST-003**: Detalle inexistente produce estado no encontrado.
- **TEST-004**: Entrada futura se clasifica como programada y no aparece públicamente.
- **TEST-005**: URL válida de YouTube/Vimeo se normaliza; otros proveedores se rechazan.
- **TEST-006**: UploadService llama Directus Files y devuelve metadatos estables.
- **TEST-007**: Categorías del blog usan colecciones editoriales y no colecciones del catálogo.
- **TEST-008**: Migración en segunda ejecución no crea duplicados.
- **TEST-009**: Creación, borrador, vista previa, programación y publicación funcionan en E2E.
- **TEST-010**: Listado, detalle, tabla y editor funcionan a 375 px y 1440 px.
- **TEST-011**: Navegación por teclado, foco y nombres accesibles pasan revisión.
- **TEST-012**: Build de producción termina con código de salida cero.

## 7. Risks & Assumptions

- **RISK-001**: No disponer de credenciales administrativas impide aplicar el esquema remoto; no impide implementar ni probar scripts y aplicación localmente.
- **RISK-002**: El límite real de videos depende de la configuración de Directus y almacenamiento.
- **RISK-003**: Formatos de imagen que el navegador no puede decodificar no pueden convertirse en cliente; deben rechazarse con explicación.
- **RISK-004**: Datos heredados pueden contener categorías ambiguas; la migración los reporta y no inventa relaciones silenciosamente.
- **ASSUMPTION-001**: `pc_blog_posts.category` y `subcategory` aceptan identificadores serializados como texto.
- **ASSUMPTION-002**: Directus Files devuelve un UUID utilizable mediante `/assets/{id}`.
- **ASSUMPTION-003**: La zona editorial operativa es `America/Mexico_City`.

## 8. Related Specifications / Further Reading

- [Diseño aprobado](../docs/superpowers/specs/2026-07-28-auditoria-blog-design.md)
- [Integración Directus](../docs/backend/directus-integration.md)
- [Angular accessibility](https://angular.dev/best-practices/a11y)
- [Directus files](https://docs.directus.io/reference/files)
