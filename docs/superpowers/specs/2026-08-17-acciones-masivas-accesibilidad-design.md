# Accesibilidad de las acciones masivas

## Objetivo

Corregir los dos defectos pendientes de las acciones masivas del listado administrativo
de productos sin ampliar esta rama a la limpieza técnica general ni a los hallazgos de
rendimiento de la página pública.

## Alcance

El cambio se limita a
`AdminProductListComponent` y a sus pruebas:

1. Exponer como una divulgación accesible la relación entre el botón **Editar** y el
   panel de opciones de edición masiva.
2. Garantizar objetivos táctiles de al menos 44 × 44 px en los controles interactivos
   de la sección de acciones masivas.

No se modificarán servicios, persistencia, rutas, filtros, reglas de negocio ni el
aspecto general del panel.

## Diseño de accesibilidad

El botón **Editar** conservará su texto visible y `aria-expanded`. También declarará
mediante `aria-controls` el identificador estable del panel que abre. El panel tendrá
ese identificador tanto cuando esté visible como en la relación expresada por el
control.

Se usará el patrón de divulgación, no el patrón ARIA `menu`. Las opciones continúan
siendo botones normales y mantienen la navegación nativa con Tab. Esto evita prometer
navegación con flechas o gestión de foco propias de un menú de aplicación, que no
forman parte del alcance aprobado.

## Diseño táctil

Los botones y acciones de la sección contextual tendrán una altura mínima de 44 px.
Los controles compactos tendrán además un ancho mínimo de 44 px cuando su contenido
no lo garantice por sí mismo. Esto incluye:

- publicar, desactivar, duplicar, editar, eliminar y limpiar selección;
- las cuatro opciones del panel de edición;
- seleccionar todos los resultados filtrados;
- confirmar y cancelar una acción;
- aplicar o cancelar una edición.

El espaciado existente y el ajuste con `flex-wrap` se conservarán para no introducir
desbordamiento horizontal en pantallas estrechas.

## Comportamiento y errores

No cambia el comportamiento funcional. Los controles continúan respetando
`bulkActionInProgress`, los mensajes existentes y las confirmaciones actuales. La
relación accesible solo describe el estado ya implementado y el ajuste táctil solo
amplía el área interactiva.

## Estrategia de pruebas

Se seguirá RED–GREEN–REFACTOR:

1. Añadir una prueba de plantilla que exija una relación estable entre el botón
   **Editar** y su panel mediante `aria-controls` e `id`.
2. Ejecutarla y comprobar que falla por la ausencia de esa relación.
3. Añadir una prueba que exija la utilidad de altura mínima de 44 px en todos los
   controles de acciones masivas.
4. Ejecutarla y comprobar que falla con la plantilla actual.
5. Aplicar el cambio mínimo en la plantilla y ejecutar las pruebas específicas.
6. Ejecutar las 211 pruebas unitarias y el build de producción como regresión.

## Fuera de alcance

Quedan documentados para ramas posteriores los problemas de PageSpeed, imágenes,
lazy loading, CLS, SEO, controles del editor antiguo, componentes o módulos huérfanos,
archivos vacíos, recursos sin uso, configuración duplicada y documentación pendiente.

## Criterios de aceptación

- El botón **Editar** identifica inequívocamente el panel que expande.
- `aria-expanded` sigue reflejando el estado real.
- Todos los controles dentro de las acciones masivas alcanzan un objetivo táctil
  mínimo de 44 px sin causar desplazamiento horizontal.
- No cambia ninguna operación masiva ni regla de negocio.
- Pasan las pruebas específicas, la suite completa y el build de producción.
