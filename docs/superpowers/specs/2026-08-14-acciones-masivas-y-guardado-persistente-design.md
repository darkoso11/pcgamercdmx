# Acciones masivas y guardado persistente del catálogo

**Fecha:** 2026-08-14  
**Rama:** `funcionalidades-check-editar-productos`  
**Estado:** Diseño aprobado

## Objetivo

Convertir la selección existente del listado administrativo de productos en un flujo completo y seguro de acciones masivas. Además, evitar que los editores de productos y ensambles regresen al panel administrativo después de guardar, sin dejar una creación nueva en una URL que pudiera duplicar el registro en el siguiente guardado.

## Alcance

### Acciones masivas

El listado de productos permitirá aplicar estas acciones a los productos seleccionados:

- Publicar.
- Desactivar, entendido como cambiar a borrador (`published: false`).
- Duplicar como borrador.
- Cambiar categoría y subcategoría.
- Modificar precio mediante un valor fijo o un porcentaje.
- Modificar stock mediante establecer, aumentar o reducir.
- Cambiar la alerta de bajo stock.
- Eliminar permanentemente.

La exportación CSV y un historial avanzado de auditoría quedan fuera de esta entrega.

### Guardado persistente

- Al actualizar un producto o ensamble existente, el editor conserva la URL y permanece abierto.
- Al crear un producto o ensamble desde una URL `/new`, el primer guardado navega a la URL canónica `/{id}/edit` del registro creado, sin salir del editor.
- Guardar un borrador sigue las mismas reglas que publicar o guardar normalmente.
- Si el guardado falla o el servicio no devuelve un registro válido, no hay navegación y los datos permanecen en el formulario.
- Se auditarán todos los editores dentro del área administrativa de productos para detectar redirecciones automáticas equivalentes. Los componentes enrutados de productos y ensambles son obligatorios; cualquier editor legado no enrutado se documentará y solo se modificará si sigue siendo consumido por la aplicación.

## Experiencia de usuario

### Barra contextual

Se utilizará una barra contextual sobre la tabla. Aparece cuando existe al menos un producto seleccionado y muestra:

- Cantidad seleccionada.
- Publicar.
- Desactivar.
- Duplicar.
- Menú `Editar` para categoría, precio, stock y alerta de bajo stock.
- Eliminar con tratamiento visual destructivo.
- Control para limpiar la selección.

En pantallas estrechas, las acciones secundarias pueden agruparse bajo `Más acciones`, conservando visibles el contador y la cancelación.

### Alcance de selección

- Cada fila se puede seleccionar individualmente.
- El checkbox del encabezado selecciona o deselecciona la página actual.
- Cuando toda la página está seleccionada, se ofrece seleccionar explícitamente todos los resultados que coinciden con los filtros actuales.
- La selección se conserva al cambiar de página.
- Cambiar búsqueda, categoría o estado limpia la selección para evitar operar sobre elementos que dejaron de estar visibles por un cambio de contexto.
- El checkbox del encabezado representa los estados ninguno, parcial y todos.

La selección se modelará mediante IDs, no mediante una propiedad transitoria en copias paginadas de los productos.

### Formularios y confirmaciones

- **Publicar y desactivar:** muestran la cantidad afectada antes de confirmar.
- **Duplicar:** confirma la cantidad; cada copia recibe título y slug únicos y queda como borrador.
- **Categoría:** exige categoría y subcategoría compatible. Cambiar de categoría elimina una subcategoría incompatible.
- **Precio:** permite establecer cantidad o aplicar porcentaje. El resultado nunca puede ser negativo.
- **Stock:** permite establecer, aumentar o reducir. El resultado se limita a un mínimo de cero.
- **Alerta de bajo stock:** acepta un entero no negativo.
- **Eliminar:** usa un diálogo destructivo con cantidad exacta y advierte que el borrado es permanente.

## Arquitectura

### Componente del listado

`AdminProductListComponent` será responsable de:

- Mantener los IDs seleccionados y el alcance de la selección.
- Calcular el estado del checkbox de página.
- Abrir y validar formularios o confirmaciones.
- Bloquear controles mientras una operación está en curso.
- Mostrar progreso y resumen final.
- Recargar los datos conservando filtros y página cuando sea posible.
- Limpiar los éxitos y conservar seleccionados los fallos parciales.

La plantilla renderizará la barra contextual, los formularios de edición masiva y mensajes accesibles dentro de la interfaz. Los nuevos flujos no dependerán de `alert()` para comunicar el resultado.

### Servicio administrativo

`ProductsAdminService` expondrá operaciones masivas basadas en las funciones individuales existentes. El servicio:

- Procesará IDs con concurrencia limitada para evitar saturar Directus.
- Transformará cada operación en un resultado por producto.
- Agregará un resumen con IDs exitosos y fallidos.
- Preservará fallos parciales en lugar de cancelar todo el lote ante el primer error.

Este enfoque no requiere cambios de esquema ni una extensión nueva de Directus.

### Editores

Los editores de productos y ensambles compartirán la misma regla de navegación posterior al guardado:

1. Determinar si la operación fue creación o actualización.
2. Ejecutar la persistencia y verificar que se devolvió un registro guardado.
3. Mostrar el mensaje de éxito.
4. Si fue creación, cambiar a la URL canónica de edición usando el ID devuelto.
5. Si fue actualización, no navegar.

## Flujo de datos

1. El usuario selecciona filas, una página o todos los resultados filtrados.
2. El componente obtiene los IDs seleccionados y la acción configurada.
3. La acción se valida y se confirma.
4. El componente bloquea nuevas ejecuciones y llama al servicio masivo.
5. El servicio procesa los productos con concurrencia limitada y captura el resultado individual.
6. El componente recarga el listado.
7. Los éxitos se deseleccionan; los fallos permanecen seleccionados.
8. Se muestra un resumen completo o parcial con cantidades y detalle suficiente para reintentar.

## Manejo de errores

- Una respuesta vacía al actualizar o duplicar cuenta como fallo.
- Los errores HTTP se convierten en fallos individuales sin perder los demás resultados.
- Una operación completa muestra un mensaje con la cantidad procesada.
- Un resultado parcial muestra cantidades de éxitos y fallos y conserva seleccionados los fallidos.
- Un fallo total mantiene toda la selección.
- Los controles permanecen deshabilitados durante la ejecución para evitar solicitudes duplicadas.
- Los errores de guardado en editores no cambian la URL ni borran el formulario.

## Accesibilidad

- Todos los controles tendrán nombres accesibles y foco visible.
- El estado parcial del checkbox será perceptible para tecnologías de asistencia.
- Los mensajes de progreso y resultado usarán una región anunciable.
- El color no será el único indicador de estado o error.
- Los diálogos devolverán el foco al control que los abrió al cerrarse.

## Estrategia de pruebas

Se aplicará TDD: cada comportamiento nuevo tendrá una prueba que falle por la razón esperada antes de implementar el cambio.

### Listado

- Selección individual, página completa y todos los resultados filtrados.
- Estado parcial del checkbox.
- Persistencia de selección entre páginas.
- Limpieza de selección al cambiar filtros o búsqueda.
- Bloqueo durante una operación.
- Publicar y desactivar.
- Duplicar como borrador.
- Cambio de categoría y subcategoría compatible.
- Precio fijo y porcentual sin valores negativos.
- Stock establecido, aumentado y reducido sin valores negativos.
- Alerta de bajo stock no negativa.
- Eliminación confirmada y cancelada.
- Resultados completos, parciales y totalmente fallidos.

### Servicio

- Agregación correcta de éxitos y fallos.
- Continuación del lote después de un fallo individual.
- Uso de las operaciones individuales correctas.
- Transformaciones de precio, stock, categoría y estado.

### Editores

- Crear producto navega a la URL de edición del ID creado.
- Crear ensamble navega a la URL de edición del ID creado.
- Actualizar producto no navega.
- Actualizar ensamble no navega.
- Guardar borrador respeta las mismas reglas.
- Un error o una respuesta vacía no navega.

### Verificación final

- Pruebas unitarias afectadas.
- Conjunto completo de pruebas.
- Compilación de producción.
- Revisión manual del listado y de los editores de producto y ensamble.

## Alternativas descartadas

### Barra flotante inferior

Permanece visible durante el desplazamiento, pero puede cubrir filas y separa las acciones del encabezado de selección.

### Selector persistente de acción

Ocupa poco espacio, pero oculta acciones frecuentes y exige más clics.

### API masiva nueva en Directus

Podría reducir solicitudes, pero amplía el backend, los permisos y el manejo de respuestas. No es necesaria para el volumen y la arquitectura actuales.

### Procesamiento estrictamente secuencial en el componente

Es sencillo, pero lento y mezcla presentación con lógica de persistencia.

## Criterios de aceptación

- Seleccionar productos habilita una barra contextual funcional.
- Todas las acciones definidas operan sobre el alcance seleccionado y comunican su resultado.
- Las acciones destructivas requieren confirmación explícita.
- Los fallos parciales son visibles y reintentables.
- La interfaz no permite precios ni cantidades de stock negativas.
- Guardar un registro existente mantiene abierto el editor y conserva su URL.
- Guardar un registro nuevo mantiene abierto el editor en su URL canónica de edición.
- El comportamiento es consistente entre productos, periféricos y ensambles.
- No se introduce un estado `Archivado` ni se modifica el esquema de Directus.
