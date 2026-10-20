# Propuesta: filtrar el catálogo por marca y tipo

Estado: enfoque confirmado por el usuario el 14 de octubre de 2026 e implementado; validación final el 16 de octubre de 2026.

## Secuencia de implementación

1. Añadir regresiones de marca normalizada, búsqueda por palabras, tipos y canonicals independientes del orden.
2. Separar los controles de marca y tipo usando datos explícitos; preservar URL y alias.
3. Exigir taxonomía remota válida durante prerender cuando el CMS está habilitado.
4. Generar el inventario de datos incompletos mediante consultas públicas de solo lectura.
5. Ejecutar pruebas unitarias, build y navegador; registrar resultados. Sin commit, push ni sincronización Git en este chat.

## Resultado esperado

Desde Todos, buscar o seleccionar Gigabyte permite encontrar sus productos del catálogo público. Elegir después Tarjetas gráficas limita los resultados a Gigabyte + tarjetas gráficas. Una búsqueda adicional de modelo limita aún más ese conjunto. Al cambiar de tipo se conserva la marca; al limpiar se recuperan los resultados correspondientes a los filtros restantes. Un producto no se clasifica como tarjeta gráfica solo por mencionar un chipset o fabricante en su descripción.

## Datos comprobados

La consulta anónima al CMS de pruebas devuelve 329 productos publicados no ensamblados. Se detectó información de marca en specifications.brand o specifications.admin.brand para 268 productos; 61 no tienen marca en los campos inspeccionados. Hay superposición entre esos campos: los conteos no se suman. Existen categorías que representan marcas y otras que representan tipos. Los datos actuales no garantizan una segmentación completa de todos los productos.

La revisión detallada del 14 de octubre precisó ese conteo: otros 149 productos contienen etiquetas genéricas como «Otro», que no identifican un fabricante. Son **210 productos sin marca específica**, no solamente los 61 campos vacíos. Hay 209 productos sin tipo determinable por las relaciones verificadas y 19 marcas con texto posiblemente contaminado por la importación. El CSV `catalogo-datos-por-revisar.csv` contiene 275 productos con al menos una observación; las cifras se superponen y no deben sumarse. Es una fotografía del CMS, no un cambio de registros ni una validación editorial exhaustiva.

## Comportamiento implementado

- Marca y tipo se muestran como selectores independientes siempre visibles, conservados mediante `brand` y `type` en la URL. Las categorías de navegación existentes siguen aplicando su propio ámbito.
- Se normalizan mayúsculas, acentos y espacios para comparar marcas. «Otro», «Otros», «Sin marca» y «No especificado» no se ofrecen como fabricantes. Se conserva la marca explícita del administrador al mapear un producto con snapshot de catálogo.
- Cada palabra de búsqueda debe aparecer en el contenido público, sin requerir orden ni adyacencia. La búsqueda textual puede encontrar menciones de compatibilidad; el selector Marca es el filtro específico por fabricante.
- Los tipos se resuelven por aliases explícitos de la taxonomía, conservando la relación individual de cada ID aunque sus categorías estén agrupadas. Un título que diga GPU no determina por sí mismo su tipo.
- Los canonicals de AMD, Asus, MSI y Gigabyte usan sus slugs genéricos y conservan los aliases anteriores. Otros grupos nuevos eligen un representante por ID estable, independiente del orden editorial.
- Con CMS habilitado, el prerender rechaza errores de taxonomía y respuestas sin categorías remotas válidas. El navegador conserva el respaldo; con CMS deliberadamente deshabilitado se mantiene el catálogo local.
- No se escribieron etiquetas ni permisos remotos durante esta implementación. Para que el filtro encuentre todos los productos reales de una marca se necesita completar los datos señalados en el CSV.

## Enfoques

1. Recomendado: separar marca y tipo en los filtros, utilizar campos de marca normalizados y relaciones verificadas para tipos, y generar un listado de productos que requieren completar o corregir datos. Permite avanzar sin inventar etiquetas ni modificar registros remotos.
2. Corregir primero toda la taxonomía y las marcas en el CMS. Mejora la integridad del catálogo, pero requiere revisar asignaciones individuales y autorizar cambios de registros antes de aplicarlos.
3. Inferir marca y tipo por palabras del título o descripción. No recomendado: una tarjeta Asus con chipset Nvidia o una tarjeta madre compatible con AMD puede quedar clasificada incorrectamente.

## Diseño recomendado

- Marca y tipo son dimensiones independientes y combinables por intersección, junto con búsqueda, precio y disponibilidad.
- El fabricante se toma de datos explícitos del producto. Normalizar espacios y mayúsculas para evitar marcas duplicadas, manteniendo una etiqueta legible.
- La búsqueda textual conserva su función; el filtro de marca permite distinguir fabricante de una simple mención en las especificaciones. Las palabras de una búsqueda más precisa deben poder combinarse sin depender de una frase literal contigua.
- Los datos sin marca permanecen visibles en Todos y en la búsqueda textual. No afirmar que un filtro por marca contiene todos los productos reales hasta completar las asignaciones faltantes.
- Conservar enlaces existentes e IDs de categorías. No transformar una agrupación de marca en un tipo de producto por cambiar su URL.
- Fijar los representantes de los cuatro grupos actualmente inestables en componentes-amd, componentes-asus, componentes-msi y componentes-gigabyte, preservando todos los alias. El orden editorial no cambia el canonical.
- Mantener la política de canonical sin parámetros para las combinaciones de filtros; no crear páginas indexables para cada combinación sin una decisión SEO independiente.
- Revisar la falla de taxonomía durante prerender para evitar compilaciones aparentemente correctas que omitan categorías CMS.
- Verificar enlaces directos, historial, recarga, marca + tipo + texto, datos incompletos y estabilidad de canonicals al reordenar categorías. Ejecutar build y pruebas afectadas.

## Alcance y PR

El cambio no incluye escribir etiquetas automáticamente en el CMS ni sincronizar Git simultáneamente con el otro chat. Antes de preparar un PR listo para integrar: terminar estas decisiones, validar el comportamiento y el build, preservar/registrar los cambios locales, verificar el estado contra main y revisar CI/conflictos. Abrir un PR no garantiza que pueda fusionarse; puede existir como borrador mientras quedan pendientes.
