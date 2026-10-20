# Auditoría técnica de edicion-pagina-productos — 17 de octubre de 2026

> Actualización posterior autorizada: corregida la diferencia entre Motherboards y Tarjetas madre. El chip ahora reúne los mismos IDs/slugs explícitos de tipo, incluidas las subcategorías de marcas. Regresión reproducida antes del arreglo; 20 pruebas de catálogo y build de producción (100 rutas) aprobados después. El diagnóstico original siguiente conserva la evidencia de la auditoría previa al arreglo.

Este informe sustituye el diagnóstico anterior con el estado actual de la rama. Las limpiezas de auditorías anteriores no se atribuyen a esta ejecución.

### Resumen Ejecutivo

La rama compila, pasa sus 358 pruebas unitarias y no contiene depuración nueva detectada. Se confirmó una inconsistencia funcional entre dos controles de filtrado; se dejó sin modificar porque esta auditoría autoriza limpieza sin cambios de negocio. Se eliminó duplicación de normalización, se corrigió documentación desactualizada y se retiraron capturas temporales.

**Alcance probado:** `origin/HEAD` apunta a `origin/main`; se ejecutó `git fetch origin`. El merge-base y HEAD son `361a6d95f939de8d9180cb0e54471a0dc6f8474d`. No existen commits propios en `git log origin/main..HEAD`. El trabajo desarrollado aquí está en el árbol local: 17 archivos versionados afectados (9 modificados y 8 eliminados) y 18 nuevos, incluidos código, pruebas y documentación.

`git rev-list --left-right --count origin/main...HEAD` devuelve `15 0`. Los árboles de HEAD y origin/main siguen coincidiendo: `ae8bdc317039fd8b902ac49074e5a93f77701694`. Los 15 merges posteriores representan desfase de historial; no se revisaron como desarrollo de esta rama ni se integraron.

Se revisó el diff desde el merge-base y el contenido de archivos nuevos. En archivos históricos parcialmente modificados se revisaron los hunks afectados y sus conexiones directas; no se propuso limpieza histórica. No se hizo commit, push, PR, despliegue ni escritura en el CMS.

**Validación posterior a la limpieza:**

| Comprobación | Resultado |
| --- | --- |
| `npm run build` | Aprobado; 100 rutas estáticas; 547.74 kB iniciales, dentro de 550 kB |
| `node node_modules/@angular/cli/bin/ng.js test --watch=false` | 358/358 aprobadas |
| TypeScript `--noEmit --noUnusedLocals --noUnusedParameters` | Aprobado |
| `node --check tools/configure-public-taxonomy.mjs` | Aprobado; no se ejecutó el script administrativo |
| `git diff --check` | Aprobado; avisos de conversión LF/CRLF, no errores de whitespace |
| Lint | No existe script ni target configurado; no se instaló ni simuló un linter |
| Reproducción en Chromium | Diferencia 5 frente a 4 entre tipo y chip confirmada después de hidratación |

Las 27 pruebas E2E aprobadas de la implementación anterior son antecedentes, no una nueva ejecución completa en esta auditoría. La reproducción focalizada no escribe archivos de prueba temporales.

### Hallazgos

#### Problemas críticos

Ninguno identificado en el alcance revisado. Esto no equivale a una garantía sobre todo el proyecto ni sobre datos remotos futuros.

#### Problemas importantes

**P2 — Dos controles aparentemente equivalentes muestran conjuntos distintos.**

Ubicación: `src/app/features/products/catalog.component.ts:140` aplica primero la pertenencia a categoría, mientras las líneas siguientes usan `catalogProductType`. `src/app/features/products/catalog-categories.ts:95` comprueba los IDs/slugs de la categoría exacta; `src/app/features/products/catalog-filters.ts:20` utiliza las relaciones de tipo agregadas.

Reproducción con el build y los datos públicos actuales:

- `/productos?type=motherboard`: 5 productos.
- `/productos/hardware-accesorios/motherboard`: 4 productos.
- El segundo omite el producto ID 38, **MOTHERBOARD ASUS TUF GAMING X870-PLUS WIFI AM5/4XDDR5/USBC/HDMI/ATX**, que el primero sí clasifica como tarjeta madre.

No es un caso de marca vacía: el tipo está resuelto, pero el chip antiguo mantiene otro conjunto de IDs. Cambiar de selector a chip puede ocultar un resultado válido y combinar ambos puede producir un conjunto más estrecho del esperado. Las pruebas actuales verifican cada mecanismo, pero no su equivalencia.

Dirección mínima: decidir si los chips de tipos deben usar la misma pertenencia que el selector y añadir una regresión que compare ambos caminos. Si se desea conservar la diferencia, hacer explícito en la interfaz el ámbito distinto. No se aplicó una de esas decisiones durante la auditoría porque modifica el comportamiento del catálogo.

#### Problemas menores

- **P3, corregido:** `normalizedName` repetía normalización Unicode, eliminación de acentos, espacios y minúsculas ya disponible en `normalizeCatalogText`. Ahora se utiliza esa utilidad compartida. No se alteran las reglas de agrupación, aliases ni la elección de canonical.
- **P3, corregido:** el documento de sincronización aún presentaba como pendientes el canonical dependiente de sort y el respaldo silencioso durante prerender. Se actualizó para distinguir lo resuelto del hallazgo vigente.
- **P3, limpiado:** tres screenshots de pruebas locales, sin referencias de producción, ocupaban 10,267,670 bytes. Estaban ignorados por Git y se eliminaron.

### Limpieza Recomendada

| Categoría | Resultado |
| --- | --- |
| console.log y logs de desarrollo | Cero detectados en líneas añadidas y archivos nuevos entregables. Se conserva stdout JSON del CLI administrativo: es su salida operacional, no depuración de frontend. |
| debugger, TODO/FIXME | Ninguno detectado en el código añadido. Los comentarios explicativos de hidratación y taxonomía siguen siendo pertinentes. |
| Imports/variables sin uso | Ninguno adicional detectado por TypeScript y revisión de templates. CommonModule del contenedor ya había sido retirado antes de esta auditoría. |
| Código muerto/componentes | No se identificaron nuevos candidatos seguros. CatalogComponent y ProductsComponent siguen conectados a rutas. No hay referencias a los dos módulos de listados eliminados. |
| Duplicación | Normalización consolidada. Los registros de categorías y tipos comparten algunos slugs, pero tienen responsabilidades distintas; no se fusionaron automáticamente por el hallazgo funcional descrito. |
| CSS/SCSS | Selectores nuevos comprobados contra template, host, pseudoclases y estados responsivos. No se identificó un selector inequívocamente sin uso. |
| Rutas huérfanas | No se detectaron imports a componentes borrados ni rutas sin destino resoluble. Los aliases y categorías vacías se conservan intencionalmente. |
| Assets innecesarios | No hay assets publicables nuevos. Se revisaron las tres capturas de pruebas y se eliminaron; el CSV es un entregable editorial, no basura. |
| Pruebas temporales | Las specs y E2E nuevas son regresiones permanentes y permanecen. No se encontraron scripts exploratorios nuevos para retirar. |
| Dependencias | package.json y package-lock.json no cambiaron respecto al merge-base; ninguna dependencia añadida por esta rama. |
| Markdown fuera del proyecto | Ninguno. Los cuatro Markdown nuevos documentan catálogo, diseño aprobado, auditoría y traspaso Git solicitado por el usuario. No se eliminaron por su extensión. |

### Cambios Aplicados

Todas las rutas siguientes son relativas a `C:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/`.

**Archivos modificados en esta auditoría:**

1. `src/app/features/products/catalog-categories.ts`: retiró la implementación duplicada de normalización y utiliza `normalizeCatalogText` en sus cuatro llamadas.
2. `docs/contexto-sincronizacion-rama-productos.md`: corrigió la nota de pendientes funcionales; preserva el contexto de sincronización solicitado.
3. `docs/auditoria-rama-productos.md`: actualizó este informe, con evidencia, alcance, resultados y listas exactas.

**Archivos eliminados en esta auditoría:**

| Archivo | Justificación |
| --- | --- |
| `test-results/catalog-360.png` | Captura local regenerable del catálogo móvil, sin referencia de producción. |
| `test-results/catalog-768.png` | Captura local regenerable de tablet. |
| `test-results/catalog-1440.png` | Captura local regenerable de escritorio. |
| `.tmp-audit-build.log` | Log temporal creado por esta auditoría; resultado conservado arriba. |
| `.tmp-audit-unit.log` | Log temporal creado por esta auditoría; resultado conservado arriba. |

No se añadieron archivos nuevos durante esta auditoría. No se eliminaron archivos versionados adicionales. Las ocho eliminaciones de listados antiguos ya estaban presentes al comenzar y se preservaron.

**Inventario exacto del alcance de la rama antes de la limpieza:**

Modificados frente al merge-base:

```text
src/app/app.component.ts
src/app/app.routes.server.ts
src/app/app.routes.ts
src/app/features/products/products.component.css
src/app/features/products/products.component.html
src/app/features/products/products.component.ts
src/app/features/products/services/products.service.spec.ts
src/app/features/products/services/products.service.ts
src/sitemap.xml
```

Eliminados frente al merge-base, previamente a esta auditoría:

```text
src/app/features/products/components/components.css
src/app/features/products/components/components.html
src/app/features/products/components/components.spec.ts
src/app/features/products/components/components.ts
src/app/features/products/peripherals/peripherals.css
src/app/features/products/peripherals/peripherals.html
src/app/features/products/peripherals/peripherals.spec.ts
src/app/features/products/peripherals/peripherals.ts
```

Nuevos aún sin seguimiento:

```text
docs/auditoria-rama-productos.md
docs/catalogo-datos-por-revisar.csv
docs/catalogo-productos.md
docs/contexto-sincronizacion-rama-productos.md
docs/propuesta-marca-tipo-catalogo.md
e2e/catalog.spec.ts
src/app/features/products/catalog-categories.spec.ts
src/app/features/products/catalog-categories.ts
src/app/features/products/catalog-filters.spec.ts
src/app/features/products/catalog-filters.ts
src/app/features/products/catalog-prerender.spec.ts
src/app/features/products/catalog-routing.spec.ts
src/app/features/products/catalog-types.ts
src/app/features/products/catalog.component.css
src/app/features/products/catalog.component.html
src/app/features/products/catalog.component.ts
src/app/features/products/catalog.routes.ts
tools/configure-public-taxonomy.mjs
```

### Elementos Dudosos

- No eliminar `catalog-types.ts` ni categorías de respaldo para resolver la diferencia de conjuntos: requiere una decisión de comportamiento, no limpieza.
- Se conserva `tools/configure-public-taxonomy.mjs`: tiene uso operacional documentado. Su eventual retiro requiere confirmar que el procedimiento no se necesita en otros entornos.
- Se conserva `docs/contexto-sincronizacion-rama-productos.md`: fue solicitado para otro chat y la sincronización sigue sin realizarse. Podrá archivarse al cerrar esa tarea.
- Se conserva el CSV como fotografía fechada de datos editoriales; sus cifras no son una garantía del estado actual del CMS. No se modificaron registros ni se volvió a clasificar productos en esta auditoría.
- No se eliminaron artefactos ignorados de otros trabajos, node_modules, dist ni Markdown históricos fuera del diff.

La recomendación antes de considerar la rama lista para integrar es resolver o aceptar expresamente la diferencia entre chip y selector, además de preservar los cambios locales y completar el proceso Git correspondiente.
