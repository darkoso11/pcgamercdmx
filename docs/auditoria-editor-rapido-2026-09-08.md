# Auditoría técnica del editor rápido

## Plan de corrección — 2026-09-12

El usuario autorizó corregir los hallazgos. PR existente: #81; no integrar hasta validar.

- [x] H1: reconciliar borradores por ID en los cuatro componentes. Preservar entradas pendientes y objetos en guardado; actualizar campos sin editar y avisar cuando un valor editado cambió también en servidor.
- [x] H2: deshabilitar controles móviles durante el guardado y verificar el estado con una respuesta diferida.
- [x] H3: centralizar la reconciliación y el ciclo de guardado compartido, sin modificar filtros ni reglas de negocio.
- [x] H4/H6: método sin consumidores y línea final sobrante retirados en 7672c2f.
- [x] H5: retirar los tres archivos de la tarjeta sin consumidores, tras confirmar referencias.
- [x] Validar con pruebas de regresión, suite completa, build y TypeScript; actualizar resultados abajo.

Las secciones siguientes conservan el diagnóstico original; el cierre se registra al final.

## Resumen Ejecutivo

- Rama auditada: `dev`, HEAD `6d7a5b9`. Base: `origin/main` en `934b9c5`; ancestro común `a55289f`. Referencias locales disponibles, sin actualizar el remoto durante esta auditoría.
- Alcance: `git diff origin/main...HEAD`, 22 archivos, 2,491 líneas añadidas y 128 eliminadas antes de la limpieza. Coincide con los cuatro commits del editor rápido (`0806513`, `787cfa2`, `fed1da8`, `1a1ebbd`) integrados mediante el PR #80.
- Estado: compila y las 272 pruebas existentes pasan; hay dos riesgos importantes de pérdida de entradas no guardadas. No se identificaron problemas críticos de seguridad ni corrupción de datos persistidos en el diff inspeccionado. Esto no constituye una certificación de ausencia de errores.
- Se aplicó únicamente limpieza sin efecto funcional. Los problemas funcionales se reportan, no se modificó su comportamiento ni se hizo una refactorización.
- Metodología: revisión estática del diff y consumidores directamente relacionados, búsqueda de debugging y referencias, TypeScript con comprobaciones de símbolos sin uso, pruebas unitarias y build. Los escenarios de concurrencia descritos abajo se deducen del flujo de código; no se reprodujeron contra datos reales ni se enviaron mutaciones al CMS.
- El problema de autenticación/CORS previamente observado queda fuera del diff: esta rama no modifica login, entornos ni configuración del servidor.

## Hallazgos

### Problemas críticos

Ninguno identificado dentro del alcance y de las verificaciones realizadas.

### Problemas importantes

**H1 — P2: recargar el catálogo descarta borradores de otras filas.**

- Evidencia: `src/app/features/products/admin/dashboard/admin-products-dashboard/admin-products-dashboard.component.ts:273` reconstruye todo `quickEditDrafts`; `loadProducts()` lo invoca en cada respuesta. `duplicateProduct()` y `deleteProduct()` recargan el catálogo.
- El mismo patrón existe en `src/app/features/products/admin/dashboard/admin-assemblies-dashboard/admin-assemblies-dashboard.component.ts:255`, y en los listados de productos y ensambles al inicializar borradores tras una recarga. En productos también interactúa con las operaciones masivas ya existentes.
- Escenario: cambiar el precio de A sin guardar, duplicar o eliminar B, recibir la recarga. El borrador de A se reemplaza por los valores persistidos sin aviso. La recarga también puede reemplazar el estado `saving` de una fila con una petición pendiente.
- Relación con la rama: la reconstrucción de los nuevos borradores se introdujo aquí, aunque algunas acciones de recarga ya existían.
- Recomendación: reconciliar borradores por ID preservando filas sucias/en guardado, y definir el comportamiento cuando una operación masiva afecta el mismo artículo. Añadir una prueba con dos filas y respuestas asíncronas; las pruebas actuales verifican la recarga pero no la conservación de entradas ajenas.

**H2 — P2: las tarjetas móviles de los dashboards permiten cambios que se pierden al finalizar un guardado.**

- Evidencia: `src/app/features/products/admin/dashboard/admin-products-dashboard/admin-products-dashboard.component.html:187` y `src/app/features/products/admin/dashboard/admin-assemblies-dashboard/admin-assemblies-dashboard.component.html:125` inician las variantes móviles. Sus inputs de precio, stock y publicación no enlazan `[disabled]` a `draft.saving`, a diferencia de sus filas de escritorio y los listados completos.
- Las respuestas de guardado reemplazan el borrador con `createCatalogQuickEditDraft(savedProduct/savedAssembly)` en los respectivos componentes (líneas 150 y 170).
- Escenario: guardar precio 125 en móvil, cambiarlo a 130 mientras la petición está pendiente, recibir respuesta con 125. Se pierde 130 y aparece el mensaje de guardado. El guard de `saveQuickEdit()` evita otra petición mientras se guarda, pero no evita modificar el input.
- Recomendación: bloquear los controles móviles durante la petición y mostrar su estado, o conservar explícitamente una segunda edición pendiente. Cubrir el escenario con una respuesta diferida, no solamente con `of()` síncrono.

### Problemas menores

**H3 — P3: duplicación del ciclo de edición en cuatro componentes.**

Los dos dashboards y los dos listados repiten obtención de borrador, validación, guardado, descarte, manejo de teclado y errores. La validación y construcción del PATCH sí están compartidas. La duplicación de plantillas móviles/escritorio ya produjo la divergencia de H2. Recomendación acotada: considerar un controlador o componente de fila compartido al corregir estos flujos; no se realizó esa refactorización en esta auditoría.

**H4 — P3: método de stock sin consumidores tras sustituir la plantilla. Corregido.**

`getStockLabel()` quedó sin llamadas en el dashboard de productos al introducir el editor. La búsqueda en `src` confirmó que las otras implementaciones homónimas sí tienen consumidores en sus propias plantillas. Se eliminó únicamente el método del dashboard de productos.

**H5 — P3: el listado nuevo dejó una tarjeta de ensamble sin consumidor de producción.**

El diff de `admin-assemblies-list.component.ts` elimina la importación y registro de `AdminAssemblyCardComponent`, y su HTML elimina su selector. La búsqueda global solo encuentra ahora la declaración y sus pruebas. Se conserva porque los archivos de esa tarjeta no pertenecen al diff autorizado y no hay un problema crítico que justifique eliminarlos.

**H6 — P3: línea vacía extra al final de la especificación. Corregido.**

`git diff --check origin/main...HEAD` detectó `new blank line at EOF` en la especificación de 2026-09-04. Eliminada; la comprobación de los cambios locales ya no reporta ese defecto.

## Limpieza Recomendada

| Categoría | Resultado |
| --- | --- |
| `console.log`, `console.debug`, `console.info`, `debugger` | Ninguno encontrado en los archivos TS/HTML del diff; no se eliminó ningún log. |
| TODO/FIXME y pruebas temporales | Sin marcadores de debugging identificados en el código del alcance; los `.spec.ts` son pruebas unitarias permanentes y se conservaron. |
| Imports y variables sin uso | TypeScript con `--noUnusedLocals --noUnusedParameters` no reportó errores. Se complementó con búsqueda de referencias, porque no detecta métodos públicos sin consumidores. |
| Código muerto | Eliminado el método descrito en H4. Tarjeta huérfana H5 conservada por alcance. No se identificaron otras ramas inalcanzables introducidas. |
| Assets innecesarios | La rama no añade ni modifica assets binarios, imágenes o fuentes. Cero eliminados. |
| Screenshots, respaldos y archivos basura | Ninguno entre los archivos añadidos. Las capturas de la conversación están fuera del diff. |
| Dependencias posiblemente innecesarias | Ninguna nueva: `package.json` y lockfile no cambiaron. |
| Componentes/rutas | Los cuatro componentes modificados siguen referenciados por `src/app/app.routes.ts`; no se añadieron rutas. Excepción indirecta: H5. |
| CSS/SCSS | No hay archivos de estilos modificados; los cambios visuales usan clases en plantillas. No se identificaron selectores propios nuevos sin consumidores. No se ejecutó un barrido global de CSS histórico. |

## Cambios Aplicados

Archivos modificados, con rutas relativas a la raíz del repositorio:

1. `src/app/features/products/admin/dashboard/admin-products-dashboard/admin-products-dashboard.component.ts`: eliminación de las 12 líneas de `getStockLabel()`, sin consumidores tras el cambio de plantilla.
2. `docs/superpowers/specs/2026-09-04-edicion-rapida-catalogo-design.md`: eliminación de la línea vacía adicional al final del archivo.

Archivo añadido:

3. `docs/auditoria-editor-rapido-2026-09-08.md`: este informe, solicitado como entregable de la auditoría.

Archivos eliminados: `src/app/features/products/admin/assemblies/shared/admin-assembly-card/admin-assembly-card.component.ts`, `.html` y `.spec.ts`, por no tener consumidores de producción. Assets eliminados: ninguno. No se cambiaron reglas de negocio, dependencias, rutas ni configuración del CMS.

## Elementos Dudosos

- Los cuatro documentos añadidos de especificación y planificación describen decisiones y validación del editor. No son temporales ni se recomienda eliminarlos como basura.
- Preservar borradores cuando una operación masiva modifica los mismos campos necesita definir si prevalece la edición local o el resultado masivo; H1 no debe resolverse descartando silenciosamente una de las dos entradas.

## Validación

- `npm run build`: correcto, 14 rutas prerenderizadas. Advertencia: bundle inicial de 551.89 kB frente al presupuesto de 550 kB (exceso de 1.89 kB). No se atribuye causalidad a esta rama sin un build equivalente de la base.
- `npx ng test --watch=false`: 270 pruebas exitosas en Chrome Headless, incluyendo regresiones de reconciliación, conservación durante guardado y borrado/alta de filas. Las dos pruebas retiradas correspondían a la tarjeta sin consumidores.
- `npx tsc --project tsconfig.app.json --noEmit --noUnusedLocals --noUnusedParameters`: correcto.
- Lint: no existe script `lint` ni target Angular de lint; no se instaló uno para ampliar el alcance.
- No se repitió la auditoría visual integral ni pruebas E2E autenticadas contra el CMS durante esta revisión.

## Cierre de correcciones

- H1 queda resuelto con `reconcileCatalogQuickEditDrafts`: conserva el objeto sucio o en guardado, actualiza campos no editados y avisa de conflictos del servidor.
- H2 queda resuelto: los tres controles de la variante móvil reciben `[disabled]` durante la petición y el flujo conserva la respuesta confirmada.
- H3 queda resuelto parcialmente de forma acotada mediante utilidades compartidas de inicio, confirmación, error y reconciliación; la plantilla permanece específica por dominio para evitar ampliar el cambio.
- H4, H5 y H6 quedan resueltos en esta rama.
