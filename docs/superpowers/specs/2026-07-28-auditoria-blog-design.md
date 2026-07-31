# Diseño de auditoría y renovación del blog

Fecha: 28 de julio de 2026
Rama: `auditoria-de-blog`
Estado: aprobado para implementación

## Objetivo

Corregir el flujo público y administrativo del blog de PC Gamer CDMX, mejorar su accesibilidad visual, unificar la integración con Directus, separar la taxonomía editorial del catálogo e incorporar un flujo de publicación completo con multimedia híbrida.

El resultado debe permitir que una persona administradora cree categorías propias del blog, redacte una entrada, agregue imágenes o videos, la previsualice y la guarde como borrador, la publique inmediatamente o la programe. El público debe poder encontrar y abrir únicamente entradas publicadas cuya fecha ya haya llegado.

## Diagnóstico confirmado

Directus responde correctamente a lecturas públicas de `pc_blog_posts`. El fallo no es una indisponibilidad general de la base de datos, sino una integración inconsistente:

- El frontend público consulta Directus directamente mientras el administrador usa `BlogService`.
- `cover_image` contiene valores nulos, objetos JSON y rutas locales, pero las vistas esperan una forma única.
- Hay entradas cuya categoría está guardada como nombre y otras como identificador.
- El editor intenta subir archivos mediante `/api/blog/uploads`, aunque la integración vigente usa Directus.
- Las categorías del blog provienen de `pc_categories` y `pc_subcategories`, colecciones que pertenecen al catálogo.
- El detalle de una entrada no representa correctamente carga, ausencia o error.
- El contenido HTML se presenta mediante una confianza explícita que evita el saneamiento normal.
- La consulta pública no excluye publicaciones programadas para una fecha futura.
- Las superficies oscuras y el texto oscuro o atenuado no mantienen contraste suficiente.

## Dirección visual

La dirección aprobada es **Editorial cian**.

- Superficie base azul profunda, con niveles distinguibles entre página, panel y control.
- Texto principal casi blanco y texto secundario gris claro.
- Cian reservado para enlaces, foco, información activa y acciones principales.
- Rojo reservado para acciones destructivas y estados de error.
- Jerarquía editorial basada en tipografía, espacio y medios; se evitan adornos y tarjetas innecesarias.
- El administrador prioriza orientación, estado y acción, sin lenguaje promocional.

### Estructura pública

El listado incluye encabezado editorial, búsqueda, filtros propios del blog, entradas publicadas, paginación o carga incremental coherente y estados de carga, vacío y error.

El detalle incluye navegación de regreso, medio de portada opcional, título, metadatos, cuerpo por bloques, medios embebidos, enlaces relacionados y estados explícitos de no encontrado o error.

### Interacciones

- Entrada discreta del encabezado y contenido.
- Transición de imagen y enlace al recorrer una entrada.
- Transición de presencia para diálogos, vista previa y mensajes.
- Todas las animaciones respetan `prefers-reduced-motion`.

## Arquitectura

### Capa pública

`BlogListComponent` y `ArticleComponent` consumen exclusivamente `BlogService`. No realizan consultas paralelas a Directus ni usan datos simulados cuando Directus está habilitado.

Las lecturas públicas aplican:

- `published = true`
- `published_at <= ahora`
- slug exacto para el detalle
- campos necesarios para cada vista

### Capa de dominio

`BlogService` es la única puerta de acceso del blog a Directus. Sus responsabilidades son:

- Consultar entradas públicas y administrativas.
- Normalizar respuestas mediante mapeadores compartidos.
- Crear, actualizar y eliminar entradas.
- Gestionar categorías y subcategorías editoriales.
- Construir URLs públicas de archivos de Directus.
- Mantener separadas las consultas públicas sin credenciales de las administrativas autenticadas.
- Propagar errores útiles en lugar de ocultarlos con datos simulados.

Los mapeadores representan una forma estable para:

- entradas;
- bloques de contenido;
- imágenes;
- videos subidos;
- videos externos;
- categorías;
- subcategorías;
- fechas y estados editoriales.

### Persistencia en Directus

Se conservan:

- `pc_blog_posts`
- `directus_files`

Se crean:

- `pc_blog_categories`
- `pc_blog_subcategories`

Las colecciones `pc_categories` y `pc_subcategories` permanecen exclusivas del catálogo y no son modificadas por el blog.

Cada subcategoría editorial pertenece a una categoría editorial. Nombre y slug no se duplican dentro del mismo nivel aplicable. Las categorías pueden ordenarse y administrarse desde el panel.

Las entradas guardan en `category` y `subcategory` los identificadores de las nuevas colecciones. Los campos se mantienen compatibles con los valores de texto heredados durante la migración; al terminar, toda entrada resoluble queda normalizada a identificadores editoriales.

Los cambios de esquema no se ejecutan al iniciar la aplicación. Un script administrativo idempotente crea o actualiza las colecciones y permisos necesarios usando credenciales suministradas por variables de entorno. Un segundo script realiza la migración y admite modo de simulación antes de escribir.

### Migración

La migración:

1. Lee las categorías actualmente referenciadas por entradas del blog.
2. Crea categorías editoriales equivalentes con slugs normalizados.
3. Crea o reasigna subcategorías editoriales cuando exista información válida.
4. Actualiza las entradas para referenciar la nueva taxonomía.
5. Conserva los slugs de las entradas y no toca la taxonomía del catálogo.
6. Puede ejecutarse nuevamente sin producir duplicados.
7. Genera un resumen de elementos creados, reasignados y no resolubles.

La ejecución documentada es:

1. configurar credenciales administrativas de Directus fuera del repositorio;
2. ejecutar la configuración idempotente del esquema;
3. ejecutar la migración en modo de simulación;
4. revisar el resumen;
5. ejecutar la migración en modo de escritura;
6. verificar conteos y referencias.

## Flujo editorial

El editor presenta una superficie principal para título, resumen, slug y contenido, y un inspector secundario para organización y publicación.

### Estados

- Borrador: `published = false`.
- Publicado ahora: `published = true` y `published_at` igual o anterior al momento actual.
- Programado: `published = true` y `published_at` posterior al momento actual.

Las fechas se introducen en `America/Mexico_City`, se convierten a UTC al persistir y se muestran nuevamente en la zona local.

### Acciones

- Guardar borrador.
- Abrir vista previa autenticada sin hacer pública la entrada.
- Publicar ahora.
- Programar publicación.
- Mover una entrada publicada o programada a borrador.

La interfaz muestra si existen cambios sin guardar y evita dobles envíos mientras guarda.

### Categorías dentro del editor

La persona usuaria puede seleccionar categorías existentes o abrir un diálogo para crear una categoría o subcategoría sin perder los datos del artículo. Al completar la creación, el elemento nuevo queda seleccionado.

La pantalla dedicada de categorías permite crear, editar, ordenar y eliminar. Una categoría en uso no se elimina hasta que sus entradas se reasignen o se confirme una operación segura admitida por el diseño de datos.

## Multimedia híbrida

### Imágenes

- El selector acepta `image/*`.
- Se conserva un archivo compatible o se convierte a WebP cuando el navegador puede decodificarlo.
- Se valida tamaño, tipo real disponible y dimensiones antes de subir.
- El texto alternativo es obligatorio para imágenes informativas.
- Una imagen decorativa puede marcarse explícitamente como tal.
- El valor persistido es un objeto con `fileId`, URL pública derivable, texto alternativo y metadatos de presentación; nunca una URL temporal del navegador.

### Videos

- Se permite subir un archivo compatible con el límite configurado en Directus.
- Se permite enlazar YouTube o Vimeo mediante URL validada.
- Los videos externos se normalizan a un identificador de proveedor, no se guarda HTML arbitrario.
- Cada video requiere título y ofrece campos para subtítulos o transcripción.
- El reproductor se carga de forma diferida y mantiene una relación de aspecto estable.

Los bloques multimedia usan una unión discriminada:

- imagen: `kind = image`, `fileId`, `alt`, presentación;
- video subido: `kind = video-file`, `fileId`, título, subtítulos o transcripción;
- video externo: `kind = video-embed`, proveedor, identificador, título, subtítulos o transcripción.

No se persiste código HTML proporcionado por la persona usuaria.

### Experiencia de carga

Cada archivo muestra progreso, resultado, error accionable, reintento y cancelación. Un error de un medio no borra el contenido del formulario.

## Accesibilidad

El objetivo es WCAG 2.2 nivel AA:

- contraste mínimo en texto, controles, bordes informativos y estados;
- foco visible;
- navegación completa por teclado;
- etiquetas asociadas a controles;
- encabezados y regiones semánticas;
- mensajes de estado mediante `aria-live`;
- nombres accesibles para iconos y acciones;
- tablas administrativas adaptadas a pantallas pequeñas;
- áreas táctiles suficientes;
- soporte de reducción de movimiento.

El contenido editorial usa estilos propios para párrafos, encabezados, listas, enlaces, citas, código y medios. No depende de colores heredados del editor.

## Validación y errores

No se puede publicar una entrada sin:

- título;
- resumen;
- categoría;
- al menos un bloque de contenido significativo;
- slug válido y no duplicado;
- accesibilidad completa de sus medios.

Se representan por separado:

- carga;
- lista vacía;
- entrada no encontrada;
- error de red;
- falta de permisos;
- sesión vencida;
- archivo rechazado;
- error al guardar;
- conflicto de slug.

El HTML editorial se sanea antes de presentarse. No se aceptan iframes o HTML arbitrario para videos externos.

## Estrategia de pruebas

### Unitarias

- Mapeo de entradas antiguas y nuevas.
- Resolución de archivos y portadas.
- Cálculo de estados borrador, publicado y programado.
- Conversión de fechas entre CDMX y UTC.
- Slugs y duplicados.
- Validación de URLs YouTube/Vimeo.
- Reglas de categorías y subcategorías.
- Validación de medios.

### Integración

- Consultas públicas sin autenticación.
- Consultas administrativas autenticadas.
- Creación y actualización de entradas.
- Subida a Directus Files.
- Creación de taxonomía editorial.
- Migración idempotente.

### Flujo E2E

1. Iniciar sesión.
2. Crear categoría y subcategoría editorial.
3. Crear una entrada.
4. Subir una imagen y enlazar un video.
5. Guardar borrador.
6. Abrir vista previa.
7. Programar.
8. Verificar que todavía no aparece públicamente.
9. Publicar ahora o alcanzar la fecha.
10. Verificar listado y detalle públicos.

También se ejecutan build de producción, pruebas existentes, auditoría de accesibilidad, revisión visual de escritorio y móvil y comprobación de errores de consola.

## Criterios de aceptación

- El blog público lista y abre correctamente entradas vigentes desde Directus.
- No se muestran borradores ni entradas programadas a futuro.
- Las portadas y medios usan URLs válidas.
- El administrador usa categorías exclusivas del blog.
- El catálogo conserva su taxonomía y comportamiento.
- El flujo híbrido admite imágenes, videos subidos y YouTube/Vimeo.
- Borrador, vista previa, publicación inmediata y programación funcionan.
- Las pantallas públicas y administrativas cumplen contraste y navegación accesible.
- La migración conserva URLs de entradas y puede repetirse sin duplicar datos.
- Las pruebas y el build terminan correctamente.
