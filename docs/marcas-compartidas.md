# Marcas compartidas

Diseño aprobado el 29 de octubre de 2026. Rama: `editar-agregar-marcas`.

## Alcance y decisiones

- Catálogo `pc_brands` con nombre, clave normalizada única, logotipo opcional y nombres anteriores. Pantalla administrativa común para crear y editar.
- Productos y ensambles consultan el mismo catálogo. Las referencias nuevas guardan identidad estable; los nombres anteriores permiten resolver registros existentes al renombrar.
- Categorías y subcategorías excluyen fabricantes. Las relaciones históricas permanecen almacenadas; un alias con tipo explícito conserva su pertenencia al tipo (por ejemplo, ASUS + tarjeta madre → Motherboards). No se infiere fabricante de títulos o descripciones.
- El despliegue prepara la colección y sus permisos públicos de lectura mediante un comando dedicado. Los errores de escritura se muestran y no se simulan guardados exitosos.
- Conservar el estilo visual del administrador. Agregar accesos desde productos, ensambles y sus formularios, con recarga de marcas sin perder el formulario.

## Secuencia de implementación

1. Pruebas de regresión para separación de marcas/tipos y creación/edición/duplicados.
2. Utilidades compartidas, servicio CMS y preparación idempotente del catálogo.
3. Pantalla de marcas, rutas y editores; conservar selecciones históricas.
4. Integración de la taxonomía pública y del administrador, y resolución de nombres/logos actuales.
5. Pruebas unitarias, comprobación del esquema y compilación; registrar resultados y requisitos de despliegue.

## Criterios de aceptación

- Crear una marca permite seleccionarla en productos y ensambles.
- Editar nombre/logotipo conserva las asociaciones y rechaza duplicados sin distinguir acentos, espacios o mayúsculas.
- AMD, Intel, ASUS y cualquier marca registrada no aparecen como categoría o subcategoría.
- Los productos asignados a categorías históricas siguen disponibles; los tipos explícitos no se pierden.
- Errores de carga/guardado muestran mensaje y permiten reintentar.

## Resultado y operación

- Ruta administrativa: `/control-pcg-cdmx-2026/brands`, protegida por el mismo guard de sesión que el resto del administrador. Accesos desde los paneles de productos/ensambles, categorías y ambos editores.
- Los formularios abren la gestión de marcas en otra pestaña y permiten recargar el selector conservando el formulario actual.
- Se guardan `brandId` en los metadatos del producto y en las entradas de `brand_logos` de los ensambles. La lectura resuelve también los nombres antiguos, sin reescribir masivamente los productos.
- Las subcategorías antiguas que representan fabricantes siguen almacenadas para conservar referencias; se excluyen de las opciones del administrador y de la navegación pública. Los IDs con tipos explícitos siguen participando en su filtro de tipo.
- Las marcas sin imagen se presentan con su nombre en las fichas y sliders.
- No se importan etiquetas genéricas ni fragmentos de especificaciones que la importación antigua guardó accidentalmente como marcas. Esos datos originales permanecen pendientes de revisión editorial y no se corrigen por inferencias.

### Preparación del CMS

`node tools/configure-brands.mjs` muestra el plan sin escribir. `node tools/configure-brands.mjs --write` crea la colección, los campos, las marcas iniciales y el permiso público de lectura. Usa las credenciales existentes de Directus; no guarda credenciales en el repositorio. La edición requiere una cuenta administrativa con acceso a `pc_brands` y a la carga de archivos.

Aplicado el 30 de octubre de 2026 en `https://cms.test.pcgamercdmx.com` (CMS configurado en los entornos de esta aplicación): 42 marcas. Lectura pública verificada. La segunda ejecución en modo de lectura reportó cero colecciones, campos, marcas o permisos pendientes. No se eliminaron ni modificaron productos o categorías existentes.

### Validación

- 433 pruebas unitarias de Angular aprobadas.
- 4 pruebas del plan de migración aprobadas: idempotencia, nombres duplicados, conservación de logotipos y exclusión de texto contaminado.
- 3 pruebas de navegador Chromium aprobadas: creación/renombrado y uso en ambos editores; error de escritura sin pérdida del formulario; disposición móvil a 390 px.
- Compilación de producción aprobada, 87 rutas prerenderizadas.
- Las pruebas de escritura en navegador usan respuestas CMS simuladas; no crean productos o ensambles de prueba en el CMS real.

La publicación del frontend sigue el flujo del repositorio: `editar-agregar-marcas → dev → test → main`. La colección está preparada; las promociones de rama y sus despliegues se revisan en el PR.
