# Catálogo público — actualizado el 10 de octubre de 2026

## Actualización: marca, tipo y canonical — 16 de octubre de 2026

Marca y tipo son controles visibles e independientes. El parámetro `type` combina
tipos verificados con `brand`, búsqueda por palabras, precio y disponibilidad.
Los valores de marca se comparan sin distinguir mayúsculas, espacios repetidos
ni acentos; los valores genéricos como «Otro» no se consideran fabricantes.
Cada palabra de búsqueda debe coincidir, sin exigir una frase contigua.
La marca administrativa explícita se conserva aunque exista un snapshot anterior.

Los canonicals de AMD, Asus, MSI y Gigabyte quedan fijados en sus slugs genéricos;
sus alias continúan disponibles. Las relaciones de tipo se conservan por ID
individual, incluso cuando se agrupan nombres de categoría equivalentes.
Con CMS habilitado, una falla o taxonomía remota vacía impide el prerender;
no se publica silenciosamente una compilación con solo categorías de respaldo.

Inventario público del 14 de octubre: 329 productos no ensamblados, 210 sin marca
específica (61 vacíos y 149 con valores genéricos), 209 sin tipo determinable
mediante las relaciones comprobadas y 19 marcas sospechosas de contener texto
importado adicional. `catalogo-datos-por-revisar.csv` reúne los 275 productos con
observaciones; las cifras se superponen. No se modificaron estos datos del CMS.
El filtro puede estar completo técnicamente y seguir teniendo cobertura parcial
por esas asignaciones pendientes. Las validaciones anteriores del documento
describen la versión previa; los resultados actuales se registran al final.

Implementación en `edicion-pagina-productos`, basada en la especificación aprobada
`especificacion-catalogo-pcgamercdmx-codex.md`. El checkout estaba limpio; se ejecutó
`git fetch origin` y ambas referencias coincidían. No se encontró `AGENTS.md` en
el repositorio ni en sus directorios ascendentes. Se revisaron README, contexto
de diseño, integración Directus, compatibilidad de navegadores y documentación
de SEO/rendimiento y despliegue. No se dispone de la imagen de referencia original.

## Rutas y alcance

| Ruta | Antes | Ahora |
| --- | --- | --- |
| `/productos` | Redirección a Periféricos | Todos los productos: componentes, periféricos y accesorios |
| `/productos/perifericos` | Listado independiente | Mismo catálogo, restringido a `peripheral` |
| `/productos/hardware-accesorios` | Listado independiente | Mismo catálogo, restringido a `component` y `accessory` |
| `/productos/componentes` | Alias a hardware-accesorios | Se conserva el alias |
| `/productos/:slug` | Detalle | Sin cambios de URL ni de componente |
| `/productos/paquetes` | Alias a ensambles | Sin cambios |
| `/productos/<agrupación>/<tipo>` | No existía URL de filtro | Categoría del modelo público, con slug exacto y metadata propia |

Los ensambles conservan su catálogo independiente. No se crea `/productos/todo`.
Los nuevos enlaces de categoría usan el registro `catalog-categories.ts`, basado
en los tipos y filtros públicos existentes. No reemplazan enlaces anteriores.
Una categoría desconocida regresa a su agrupación conservando los parámetros de búsqueda. No se cambia la infraestructura.

El contenedor de productos conserva el detalle y carga `CatalogComponent` en las
rutas de listado. Los componentes independientes Peripherals y Components se
retiraron junto con sus pruebas de mera creación; las pruebas nuevas cubren la
navegación y el comportamiento compartido. Se reutilizan ProductsService y su
ProductCardViewModel, contenido de las cards, precios, ofertas, inventario e imágenes.
Los enlaces comerciales existentes se conservan al final del catálogo.

## Taxonomía pública y agrupación

Se habilitó exclusivamente lectura pública de `pc_subcategories` en
`https://cms.test.pcgamercdmx.com`, con filtro `published = true` y campos
`id,name,slug,category_id,category_slug,sort,published`. El permiso creado es
`13`; no se concedió escritura pública ni se modificaron registros de taxonomía.
La verificación anónima devuelve HTTP 200 y 62 subcategorías publicadas;
la consulta de registros no publicados devuelve cero registros.

El usuario eligió agrupar nombres equivalentes dentro de cada agrupación,
conservando todos sus IDs. Se normalizan mayúsculas, acentos y espacios para
comparar nombres; periféricos y hardware mantienen grupos separados.
Los slugs originales del CMS siguen funcionando como alias. Las equivalencias
con tipos antiguos se basan en el script de importación existente; se conservan
las URL públicas previas y sus etiquetas. No se infiere pertenencia por título.
Los chips aparecen si contienen productos o si representan la ruta activa.
Los IDs sin resolver permanecen en Todos y en su agrupación.

`node tools/configure-public-taxonomy.mjs` comprueba el estado sin crear permisos;
`--write` crea el permiso únicamente si falta. Usa las credenciales locales o
variables DIRECTUS, sin imprimirlas. Rechaza permisos existentes que difieran
del alcance esperado. Para revertir este cambio concreto, un administrador puede
retirar el permiso 13 de la política pública del CMS de pruebas; el catálogo
conserva el respaldo por tipos, aunque pierde la resolución de IDs remotos.

Persisten datos editoriales de origen, como nombres con codificación incorrecta
y productos asignados a categorías que no corresponden a su descripción.
No se corrigieron esos registros ni se agruparon sinónimos por suposición.

## Estado reproducible

| Parámetro | Significado |
| --- | --- |
| `q` | Búsqueda enviada con Buscar o Enter |
| `brand` | Marca exacta disponible en los datos |
| `min`, `max` | Precio efectivo en MXN, incluyendo oferta real |
| `stock=1` | Solo productos con stock positivo |
| `page` | Bloques acumulados de 24 productos |

Cambiar de chip conserva búsqueda, marca, precios, stock y parámetros ajenos;
reinicia `page`. No hay filtros específicos incompatibles entre agrupaciones.
Modificar filtros o búsqueda también reinicia `page`. Limpiar filtros y búsqueda
elimina esos parámetros y conserva la ruta de categoría y los parámetros ajenos.
Los precios negativos, vacíos o no finitos se ignoran; una página inválida se
interpreta como 1. Un rango invertido produce cero resultados y permite limpiarlo.
Los filtros se combinan por intersección y el conteo corresponde al conjunto
filtrado completo; Mostrar más conserva ese conteo.

La búsqueda usa título, descripción, marca, etiqueta de categoría comprobada y
resúmenes reales de especificaciones del servicio. No busca notas administrativas.
La marca se obtiene de specifications.brand o del campo admin.brand existente.

## Orden, renderizado y SEO

No se ofrece orden por recencia. El DTO público no contiene una fecha de alta
fiable para todo el catálogo: los constructores de respaldo del mapeador generan
`new Date()` y el contenido importado contiene altas nulas. Las fechas locales de
respaldo tampoco demuestran publicación real.

Se conserva el orden de ProductsService: Directus solicita `sort,title`; el
respaldo conserva el orden de sus arrays. El filtrado no reordena. Fechas iguales,
inválidas o ausentes no intervienen, por lo que no existe criterio temporal,
conversión de zona horaria ni desempate artificial. El título general es
«Todos los productos».

El despliegue usa `outputMode: static`. Catálogo, agrupaciones y rutas de tipos
se prerenderizan explícitamente antes de la regla cliente `productos/:slug`.
Los parámetros de prerender se obtienen de la taxonomía pública e incluyen sus
alias. El canonical de cada alias apunta a la categoría agrupada. Las categorías
creadas después de una compilación funcionan en el cliente; para disponer de su
HTML inicial estático se necesita reconstruir y desplegar el sitio.
El HTML inicial contiene contexto, productos cuando existen, título, descripción,
canonical y las señales globales de SeoService. Se conservan los detalles en modo
cliente, tal como estaban configurados. El sitemap conserva sus entradas y añade
`/productos`; las categorías son descubribles por enlaces reales del catálogo.

La política existente de canonical excluye query parameters. Por ser hosting
estático, una petición con filtros recibe el HTML base de la categoría; Angular
aplica los parámetros al hidratar. No se afirma SSR específico para combinaciones
de filtros. La carga remota conserva el mecanismo existente de respaldo local.
Un resolver en la ruta padre obtiene los datos antes de activar la vista. El
servicio conserva su respaldo ante errores de red; no se presenta un estado de
carga vacío que sustituya el grid prerenderizado durante la hidratación.

El contexto de categoría se lee del snapshot antes de la primera hidratación.
El desplazamiento horizontal hasta el chip activo ocurre solo después del render
en navegador. El panel es una divulgación inline, no un modal: no atrapa el foco;
Escape lo cierra y devuelve el foco al botón.

## Validación

Las pruebas usan Karma/Jasmine, RouterTestingHarness, Playwright y axe ya presentes.
No se instalaron dependencias ni frameworks. No existe script de lint en package.json.

| Comando | Resultado |
| --- | --- |
| `npm run build` | Aprobado; 100 rutas prerenderizadas. Bundle inicial 547.74 kB, bajo el presupuesto de 550 kB, sin aumentarlo |
| `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json` | Aprobado |
| `node node_modules/@angular/cli/bin/ng.js test --watch=false` | 350 pruebas aprobadas; cubren navegación, agrupación de IDs, alias, separación por grupo y exclusión de registros no publicados |
| `node node_modules/@playwright/test/cli.js test e2e/catalog.spec.ts --project=chromium --project=webkit --project=mobile-chrome --workers=2` | 21 pruebas aprobadas |
| `node node_modules/@playwright/test/cli.js test e2e/browser-compatibility.spec.ts --project=chromium --project=webkit --project=mobile-chrome --grep='/productos' --workers=2` | 9 pruebas aprobadas |
| `git diff --check` | Aprobado |

Cobertura: Todos, categoría por URL, búsqueda, precio/marca, limpiar conservando
categoría, historial, recarga, navegación sin recargar documento, detalle,
agrupaciones, orden con fechas inválidas/iguales/ausentes, paginación y reinicio,
categorías numéricas resueltas y no resueltas, HTML inicial de las rutas originales y alias CMS,
metadata, tamaños 360/768/1440 y axe sin infracciones en el catálogo.
Se inspeccionaron capturas; no se compararon con una referencia no disponible.
WebKit es una prueba del motor, no una prueba en un dispositivo Safari físico.

Limitaciones: filtros sobre HTML estático aplicados al hidratar y datos editoriales
de origen sin corregir. No se ejecutó Lighthouse ni se realizó despliegue.
La verificación remota corresponde al CMS de pruebas, no a producción.

La configuración de rutas del catálogo se carga de forma diferida. Esto reduce
el bundle inicial de 550.53 a 547.74 kB sin cambiar los presupuestos de Angular.

La prueba de teclado espera la limpieza de `jsaction`: el código instalado de
Angular retira ese atributo al terminar la reproducción de eventos de hidratación.
Esto evita afirmar estado final de foco mientras aún se reproducen eventos iniciales.

## Revisión local

Se revisan límites de parámetros, ausencia de resultados, conservación de URLs,
suscripciones con destrucción automática, orden, plantilla accesible, datos reales,
rendimiento y alcance del diff. La revisión es local: no se solicitó ni se realizó
publicación de comentarios, PR, push o despliegue.

| Criterio | Resultado |
| --- | --- |
| Casos límite | Parámetros, fechas y categorías opacas cubiertos; alias e IDs CMS cubiertos |
| Claridad | Un catálogo y un registro de tipos reales, con decisiones documentadas |
| Mantenimiento | Listados duplicados retirados; servicio y cards existentes reutilizados |
| Seguridad | Sin secretos ni cambios de registros; permiso remoto limitado a lectura publicada |
| Rendimiento | Carga compartida del servicio; filtros locales y bloques de 24; tamaño inicial bajo el límite |
| Documentación | Rutas, estado, orden, SSR estático y validaciones registrados |
| Convenciones | Angular Router, tokens existentes, suscripciones canceladas y pruebas existentes |

Estado final: rama `edicion-pagina-productos`, cambios locales sin commit ni push;
no había modificaciones preexistentes que preservar.

## Validación final de marca y tipo — 16 de octubre de 2026

- Build de producción aprobado: 100 rutas, 547.74 kB iniciales, sin aumentar presupuesto.
- Suite completa: 358 pruebas unitarias aprobadas.
- Catálogo: 27 pruebas Playwright aprobadas en Chromium, WebKit y Chrome móvil,
  con axe, tamaños 360/768/1440, filtros combinados, recarga, historial y canonicals.
- TypeScript con `--noUnusedLocals --noUnusedParameters` y `git diff --check`: aprobados.
- Las regresiones reprodujeron primero el canonical variable, la comparación de
  marca sensible a mayúsculas, el respaldo silencioso durante prerender y el uso
  de valores genéricos como fabricantes; pasan con las correcciones.
- No se creó PR, no se sincronizó Git y no se realizaron escrituras en el CMS.

Revisión local: se comprobaron datos incompletos, parámetros desconocidos,
conservación de aliases, ausencia de inferencia por títulos, comparación de marcas,
tipos por ID y eliminación de acoplamiento entre sort y canonical. Las pruebas
de navegador detectaron la necesidad de identificar explícitamente los selectores
mediante sus etiquetas visibles; quedó corregida con aria-labelledby. El estado
editorial del CSV es la limitación pendiente, no una asignación automática aprobada.
