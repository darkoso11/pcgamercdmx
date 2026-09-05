# Edición rápida en los paneles de catálogo

## Objetivo

Llevar la edición rápida ya disponible en los listados completos a las páginas de entrada **Admin Productos** y **Admin Ensambles**. Al abrir cualquiera de esos dos módulos, la persona administradora podrá revisar y modificar los artículos visibles sin navegar primero a otra página.

Esta ampliación complementa las decisiones de `2026-09-04-edicion-rapida-catalogo-design.md` y conserva sus reglas de validación, persistencia, accesibilidad y recuperación ante errores.

## Alcance

La ampliación incluye:

- Una tabla de edición rápida dentro de cada panel de catálogo.
- Seis vistas en el mismo panel: recientes, totales, publicados, borradores, bajo stock y sin stock.
- Carga inicial automática de los 20 productos o ensambles más recientes.
- Conservación del editor rápido al cambiar de vista.
- Acceso al editor detallado al final de cada fila.
- Conservación de las rutas de listado completo y del enlace **Ver todos**.

No incluye:

- Cambios al esquema de Directus.
- Historial de publicación.
- Separar artículos ocultos de borradores nunca publicados.
- Edición rápida de categoría, imágenes, nombre o descripción.
- Sustituir los listados administrativos completos.

## Navegación y estado inicial

El Panel Administrativo principal continúa mostrando las tarjetas de acceso a **Admin Productos** y **Admin Ensambles** sin cambios funcionales.

Al entrar en **Admin Productos**, la sección inferior muestra automáticamente **Productos recientes**. Al entrar en **Admin Ensambles**, muestra **Ensambles recientes**. No es necesario seleccionar una tarjeta para activar este estado inicial.

La vista reciente contiene como máximo 20 artículos del dominio correspondiente, ordenados por `createdAt` descendente. Cuando dos registros no tengan una fecha comparable, se conservará el orden estable recibido del servicio.

## Vistas del panel

Cada panel ofrece las siguientes vistas sin abandonar la página:

1. **Productos/Ensambles recientes**: los 20 registros con fecha de creación más reciente.
2. **Productos/Ensambles totales**: todos los registros del dominio.
3. **Productos/Ensambles publicados**: registros con `published === true`.
4. **Borradores**: registros con `published === false`.
5. **Bajo stock**: registros con stock mayor que cero y menor o igual a su umbral de bajo stock.
6. **Sin stock**: registros con stock menor o igual a cero.

Las tarjetas métricas existentes activan las vistas de totales, publicados, borradores, bajo stock y sin stock dentro del mismo panel. La sección de resultados incorpora el control de **Recientes** para regresar explícitamente a los 20 artículos iniciales.

Las vistas distintas de recientes pueden contener más de 20 resultados y usarán paginación local de 20 filas por página para evitar una tabla excesivamente larga. Cambiar de vista restablece la página de resultados a la primera página.

## Edición rápida por fila

Todas las vistas usan la misma fila de edición rápida. En productos, las columnas son:

- Producto.
- Precio editable.
- Stock editable.
- Estado de publicación editable.
- Categoría informativa.
- Acciones.

En ensambles se usa la misma estructura sin la columna de categoría, porque todos pertenecen al dominio de paquetes y esa columna no aporta una distinción útil.

Las acciones estables al final de la fila son **Editar detalles**, **Duplicar** y **Eliminar**. Cuando precio, stock o publicación cambian, aparecen además **Guardar** y **Descartar**. `Enter` guarda la fila enfocada y `Escape` descarta sus cambios.

Las reglas del editor rápido existente se mantienen:

- `price` es un número finito mayor o igual a cero con hasta dos decimales.
- `stock` es un entero mayor o igual a cero.
- `published` es booleano e independiente del stock.
- Sólo se envían al servicio los campos modificados.
- Un error conserva los valores escritos y permite reintentar o descartar.

## Borradores y publicación

El modelo continúa utilizando únicamente el booleano `published`:

- `true`: publicado.
- `false`: borrador u oculto.

La vista **Borradores** incluye tanto artículos nunca publicados como artículos publicados anteriormente que después se ocultaron. No se intentará distinguir ambos casos porque el modelo actual no guarda historial de publicación.

## Arquitectura

La lógica pura de borradores, validación y construcción de parches seguirá en las utilidades compartidas del editor rápido. La presentación de la fila se extraerá o reutilizará de forma que los paneles y los listados completos no mantengan implementaciones incompatibles.

Cada dashboard será responsable de:

- Cargar los productos y estadísticas de su dominio.
- Mantener la vista activa y la página actual.
- Derivar los resultados visibles.
- Actualizar sus métricas y resultados después de una operación confirmada.

El guardado continuará usando `ProductsAdminService.updateProduct(id, patch)`. Duplicar y eliminar reutilizarán las operaciones administrativas existentes. Las rutas completas permanecen disponibles para búsqueda avanzada, acciones masivas y administración extensa.

## Estados y errores

- Mientras se cargan resultados, la sección muestra un estado de carga sin ocultar el resto del dashboard.
- Una vista sin coincidencias muestra un mensaje específico para el filtro activo.
- Guardar bloquea únicamente la fila afectada.
- Los errores de edición se muestran dentro de la fila.
- Si una actualización cambia la pertenencia al filtro activo, la fila se retira sólo después de la confirmación del servidor.
- Si se elimina un artículo, se solicita la confirmación que ya usa el flujo administrativo y se actualizan resultados y métricas tras el éxito.

## Diseño responsive y accesibilidad

En escritorio se conserva la tabla densa y oscura de las referencias aprobadas. Los campos modificados usan el acento cian o violeta del dominio correspondiente y las acciones permanecen al final.

En móvil, cada registro se presenta como una fila apilada con nombre, precio, stock, publicación, mensajes y acciones, sin exigir desplazamiento horizontal para editar.

Todos los controles tienen etiquetas que incluyen el nombre del artículo, foco visible y estados deshabilitados perceptibles. Los mensajes de guardado y error se anuncian mediante regiones de estado accesibles.

## Estrategia de pruebas

Las pruebas se escribirán antes de la implementación y cubrirán:

- Productos y ensambles cargan 20 registros en la vista reciente inicial.
- La vista reciente ordena por fecha de creación descendente.
- Cada tarjeta cambia la vista sin llamar a navegación del router.
- Totales, publicados, borradores, bajo stock y sin stock derivan los resultados correctos.
- Cambiar de vista conserva la edición rápida y restablece la paginación.
- Borradores incluye todos los registros con `published === false`.
- Guardar y descartar funcionan de forma independiente por fila.
- Los errores conservan el borrador de la fila.
- Editar detalles, duplicar y eliminar continúan disponibles.
- El listado completo y la edición masiva existente no sufren regresiones.

La verificación final incluye la suite completa, compilación de producción y revisión manual de ambos dashboards en escritorio y móvil.

## Criterios de aceptación

1. Al abrir Admin Productos o Admin Ensambles se muestran automáticamente hasta 20 artículos recientes con edición rápida.
2. Las cinco tarjetas métricas filtran los resultados dentro del mismo panel y no navegan al listado completo.
3. Existe una forma visible de regresar a la vista de recientes.
4. Todas las vistas conservan precio, stock y publicación editables por fila.
5. Cada fila ofrece acceso al editor detallado, duplicado y eliminación.
6. Borradores representa exactamente `published === false`.
7. Totales y filtros con más resultados son navegables mediante paginación.
8. Las rutas completas y sus funciones actuales se conservan.
9. La experiencia funciona con teclado y en dispositivos móviles.
10. Las pruebas automatizadas y la compilación de producción terminan correctamente.
