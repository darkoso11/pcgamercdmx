# Edición rápida de productos y ensambles

## Objetivo

Permitir que una persona administradora actualice precio, stock y publicación directamente desde la fila de cada producto o ensamble, sin abrir el editor completo. La edición rápida complementará, sin reemplazar, la edición masiva existente de productos.

## Alcance

La primera versión incluye:

- Edición por fila en la tabla de productos.
- Conversión del listado administrativo de ensambles de tarjetas a una tabla compacta con edición por fila.
- Edición de `price`, `stock` y `published`.
- Guardado y descarte independientes por fila.
- Atajos de teclado para guardar y descartar.
- Estados por fila para cambios pendientes, guardado, error y operación en curso.
- Conservación de filtros, paginación, selección, edición masiva y acceso al editor completo.

Quedan fuera de esta versión:

- Cambios al esquema de Directus.
- Guardado automático por celda.
- Una pantalla unificada para productos y ensambles.
- Edición masiva nueva para ensambles.
- Edición rápida de categoría, descripción, imágenes u otros campos editoriales.

## Decisiones de producto

### Edición por fila

Cada artículo será una unidad de edición. La fila mostrará el nombre y su contexto, precio editable, stock editable, un interruptor de publicación y las acciones de guardado, descarte y edición completa.

El botón **Guardar** sólo estará habilitado cuando exista un cambio válido. **Descartar** restaurará los valores confirmados más recientes. `Enter` guardará la fila activa y `Escape` descartará sus cambios cuando el foco esté en uno de sus controles de edición.

### Publicación y stock

El control de disponibilidad representa únicamente `published`:

- Activado: el artículo está publicado.
- Desactivado: el artículo queda oculto o en borrador.

La publicación es independiente del stock. Un artículo publicado con stock `0` puede seguir visible como agotado.

### Convivencia con funciones existentes

La tabla de productos conservará búsqueda, filtros, paginación, selección, acciones masivas, duplicado, eliminación y acceso al editor completo. La edición rápida no cambiará el comportamiento de estas funciones.

Los ensambles conservarán sus filtros, creación, duplicado, eliminación y editor completo. El cambio de tarjetas a tabla aplica sólo al listado administrativo.

## Arquitectura

### Estado de borradores

Cada componente de listado mantendrá un borrador por identificador de artículo con:

- Valores originales confirmados.
- Valores actuales de `price`, `stock` y `published`.
- Indicador de operación en curso.
- Estado y mensaje de resultado.

La validación, comparación de cambios y construcción del parche parcial vivirán en utilidades compartidas y puras. Los componentes conservarán la responsabilidad de cargar, filtrar y presentar sus respectivos catálogos.

### Persistencia

El guardado reutilizará `ProductsAdminService.updateProduct(id, patch)`. No se agregarán colecciones ni campos a Directus.

El parche contendrá únicamente los campos modificados. Ejemplo:

```ts
{
  price: 14999,
  stock: 8,
  published: true
}
```

Si sólo cambia el stock, el parche será `{ stock: 8 }`.

### Flujo de guardado

1. La persona modifica uno o más controles de una fila.
2. La interfaz marca visualmente los campos modificados y habilita **Guardar** y **Descartar**.
3. Al guardar se validan los valores y se construye el parche parcial.
4. Sólo la fila afectada queda bloqueada mientras espera a Directus.
5. Tras una respuesta exitosa, la respuesta del servidor se convierte en el nuevo estado confirmado.
6. Se reaplican filtros y paginación. Si el artículo deja de coincidir con el filtro, desaparece después de la confirmación.
7. Las demás filas permanecen operables durante todo el proceso.

## Validación

- `price` debe ser un número finito mayor o igual a `0`, con un máximo de dos decimales.
- `stock` debe ser un entero mayor o igual a `0`.
- `published` debe ser booleano.
- Una fila sin cambios no puede enviar una actualización.
- Una fila inválida conserva su borrador y muestra el mensaje junto al campo correspondiente.

## Errores y recuperación

Si Directus no confirma la actualización:

- La fila recupera sus controles.
- Los valores escritos se conservan.
- Se muestra un error dentro de la fila.
- La persona puede corregir, reintentar o descartar.
- Los datos confirmados de otras filas no cambian.

Una confirmación exitosa se anunciará brevemente dentro de la fila. Los mensajes también usarán texto y atributos accesibles; el color no será el único indicador.

## Diseño visual y responsive

### Escritorio

La tabla usará una fila densa con columnas para artículo, precio, stock, publicación y acciones. Los campos modificados usarán el acento cian del admin. Los controles de guardado aparecerán únicamente cuando la fila esté modificada; en estado estable se priorizará el enlace a edición completa y las acciones existentes.

### Móvil

Cada artículo seguirá siendo una unidad visual, pero se acomodará en dos niveles:

- Encabezado con nombre, contexto y estado de stock.
- Rejilla de precio y stock.
- Control de publicación.
- Acciones de guardar, descartar y edición completa.

Esta composición evita depender de desplazamiento horizontal para editar.

### Estados

- Cian: campo modificado y pendiente.
- Verde más texto: guardado confirmado.
- Rojo más texto: error con posibilidad de reintento.
- Indicador de progreso más texto: guardado en curso.

## Accesibilidad

- Cada campo tendrá una etiqueta que incluya el nombre del artículo.
- El interruptor se implementará con un control nativo accesible.
- El foco será visible.
- `Enter` y `Escape` actuarán únicamente sobre la fila enfocada.
- Los resultados de guardado se anunciarán mediante una región de estado apropiada.
- Los botones deshabilitados expondrán correctamente su estado.

## Estrategia de pruebas

### Utilidades compartidas

- Detectar una fila sin cambios.
- Detectar cada campo modificado.
- Construir un parche con sólo los campos modificados.
- Rechazar precios negativos, no finitos o con más de dos decimales.
- Rechazar stock negativo o fraccionario.

### Lista de productos

- Inicializar el borrador desde el producto.
- Guardar una fila y actualizar su estado confirmado.
- Descartar y restaurar los valores originales.
- Conservar el borrador ante error y permitir reintento.
- Mantener operativas selección y edición masiva.
- Reaplicar filtros y paginación después de guardar.
- Responder a `Enter` y `Escape` en la fila activa.

### Lista de ensambles

- Cubrir el mismo ciclo de edición por fila.
- Mantener creación, duplicado, eliminación y edición completa.
- Verificar el nuevo renderizado tabular y su variante móvil.

### Verificación final

- Ejecutar las pruebas unitarias afectadas durante cada ciclo rojo-verde-refactor.
- Ejecutar la suite completa.
- Ejecutar la compilación de producción.
- Revisar manualmente escritorio y móvil con productos y ensambles.
- Confirmar comportamiento exitoso y fallido contra la capa de persistencia configurada.

## Criterios de aceptación

1. Precio, stock y publicación pueden modificarse y guardarse desde la fila de cualquier producto o ensamble.
2. La fila no guarda datos inválidos ni envía campos que no cambiaron.
3. Un error conserva la entrada y ofrece reintento o descarte.
4. Guardar una fila no bloquea las demás.
5. Los filtros y la paginación reflejan el estado confirmado.
6. La edición masiva de productos y las acciones administrativas existentes continúan funcionando.
7. La edición es utilizable con teclado y en viewport móvil sin depender de desplazamiento horizontal.
8. Las pruebas automatizadas y la compilación de producción terminan correctamente.
