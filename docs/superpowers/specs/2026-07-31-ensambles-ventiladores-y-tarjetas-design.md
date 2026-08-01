# Diseño: ventiladores y tarjetas de administración de ensambles

Fecha: 2026-07-31

## Objetivo

Mejorar la administración de ensambles en dos puntos:

1. Permitir capturar los ventiladores instalados como una especificación de texto independiente.
2. Mostrar en el panel y el listado administrativo tarjetas con imagen y características principales para identificar con rapidez qué ensamble editar o eliminar.

La página pública de detalle también debe mostrar los ventiladores y todas las demás especificaciones capturadas. Las tarjetas del home no mostrarán ventiladores.

## Alcance

### Editor de ensambles

- Añadir un campo de texto `Ventiladores` dentro de las especificaciones técnicas.
- El campo admitirá cantidad, marca y modelo en una sola cadena, por ejemplo: `6 × Lian Li UNI FAN SL-INF`.
- No se solicitará ni almacenará una imagen específica para los ventiladores.
- Al editar un ensamble, el campo recuperará el valor previamente guardado.
- Los ensambles existentes que no tengan este dato abrirán el campo vacío sin provocar errores.

### Reglas de validación

Para publicar un ensamble solo serán obligatorios:

- Nombre.
- Precio.
- Imagen principal.

El precio aceptará cero como valor válido, de acuerdo con el comportamiento actual del formulario. El resto de los campos será opcional, incluidas todas las especificaciones técnicas, la descripción, la certificación de fuente, el stock, las marcas y la galería.

El slug no requerirá captura manual. Cuando falte, se generará a partir del nombre antes de guardar. Guardar como borrador seguirá admitiendo un formulario incompleto y usará los respaldos internos ya existentes cuando el servicio necesite valores mínimos.

### Tarjetas administrativas

Se aplicará el diseño visual equilibrado aprobado tanto a `Ensambles recientes` del dashboard como al listado completo de ensambles:

- Imagen principal en la parte superior con proporción uniforme.
- Respaldo visual si la imagen está vacía o no puede cargarse.
- Nombre y estado de publicación visibles.
- Chips para CPU, GPU y RAM únicamente cuando tengan contenido.
- Stock y acción de edición en la parte inferior.
- En el listado completo se conservará la acción existente para eliminar.
- Distribución adaptable de una columna en móvil, dos en tablet y tres en escritorio cuando el ancho lo permita.

El objetivo de las tarjetas es facilitar la identificación administrativa. No se añadirá `Ventiladores` a las tarjetas del dashboard, del listado ni del home.

### Página pública de detalle

La vista de detalle mostrará todas las especificaciones técnicas que hayan sido capturadas, incluido `Ventiladores`. Los valores vacíos no producirán filas sin contenido.

## Modelo y flujo de datos

Se añadirá una propiedad opcional `fans` al modelo administrativo de producto/ensamble y a los modelos públicos que consumen las especificaciones.

El valor se almacenará en el objeto `specifications` de Directus, junto con `cooling`, `caseModel`, `operatingSystem` y las demás especificaciones del ensamble. Este enfoque evita una migración de colección y mantiene el dato separado del sistema de enfriamiento.

Flujo de escritura:

1. El formulario recoge `fans` como texto.
2. La normalización elimina espacios exteriores.
3. El editor crea el objeto de ensamble.
4. El mapper administrativo serializa `fans` dentro de `specifications`.
5. Directus persiste el objeto completo.

Flujo de lectura:

1. El mapper lee `specifications.fans`.
2. Si el valor no existe, devuelve una cadena vacía.
3. El editor lo carga al formulario y la vista pública lo incorpora a las especificaciones disponibles.

## Componentes afectados

- Editor administrativo de ensambles: control, carga, normalización y campo visual.
- Modelo y servicio administrativo: propiedad opcional `fans`.
- Mapper de Directus: lectura y escritura del nuevo dato.
- Dashboard administrativo de ensambles: tarjeta visual con imagen y chips.
- Listado administrativo de ensambles: la misma jerarquía visual y acciones actuales.
- Modelo/mapeo del catálogo público: exposición de `fans`.
- Página pública de detalle: etiqueta `Ventiladores` cuando exista contenido.

No se modificarán las tarjetas del home para incluir ventiladores.

## Estados y manejo de errores

- Imagen válida: se muestra con recorte uniforme sin deformarla.
- Imagen faltante o fallida: se muestra un respaldo visual accesible.
- Especificación vacía: se omite su chip o fila de detalle.
- Ensamble antiguo sin `fans`: se trata como valor vacío.
- Error al guardar: se conserva el mensaje de error existente y no se comunica éxito.
- Campo obligatorio ausente al publicar: el formulario marca nombre, precio o imagen y no envía la publicación.
- Borrador incompleto: puede guardarse mediante el flujo existente.

## Accesibilidad

- Las imágenes usarán texto alternativo basado en el nombre del ensamble.
- El respaldo visual tendrá una descripción comprensible.
- Los botones de editar y eliminar conservarán nombres accesibles y estados de foco visibles.
- La información de estado y stock seguirá expresada como texto, no solo por color.

## Pruebas y aceptación

### Pruebas unitarias

- El formulario contiene `fans` y no lo marca como obligatorio.
- Solo nombre, precio e imagen bloquean una publicación incompleta.
- El slug se genera cuando no se captura manualmente.
- Crear y editar conservan el texto de ventiladores.
- El mapper serializa y deserializa `specifications.fans`.
- Un registro anterior sin `fans` se transforma sin errores.
- Las tarjetas administrativas muestran imagen, nombre, estado, stock y las características disponibles.
- Las tarjetas omiten chips vacíos y activan el respaldo cuando falla la imagen.
- La vista pública de detalle muestra `Ventiladores` cuando existe y lo omite cuando está vacío.
- Las tarjetas del home no muestran ventiladores.

### Verificación final

- Ejecutar las pruebas unitarias relacionadas con editor, mapper, dashboard, listado y detalle.
- Ejecutar la compilación de producción.
- Verificar visualmente la distribución adaptable y las acciones de editar/eliminar.

## Fuera de alcance

- Catálogo o selector predefinido de marcas de ventiladores.
- Carga de logos o imágenes para ventiladores.
- Mostrar ventiladores en tarjetas públicas del home.
- Cambios al comportamiento de eliminación, ofertas, categorías o inventario fuera de la nueva presentación.
