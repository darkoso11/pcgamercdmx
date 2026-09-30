# acción-edicion-rapida: edición del nombre

## Diseño aprobado

El usuario aprobó el 30 de septiembre de 2026 convertir el nombre en un campo siempre editable, integrado en la edición rápida existente de productos y ensambles, conservando la URL.

## Alcance y experiencia

- Añadir un campo de texto precargado con `Product.title` en paneles y listados de productos y ensambles, en escritorio y móvil.
- Mantener los veinte recientes por defecto, filtros, paginación y acciones de detalles existentes.
- Integrar el nombre con Guardar, Descartar, Enter y Escape. No añadir un modo de edición ni guardar automáticamente al escribir.
- Rechazar nombres vacíos o compuestos solo por espacios, con un mensaje accesible junto al campo. Quitar espacios exteriores al guardar; conservar el contenido interior.
- Deshabilitar el campo mientras se guarda y mostrar cambios pendientes según el patrón actual.
- Conservar el texto introducido si falla la petición; actualizarlo con la respuesta confirmada del servidor si tiene éxito.
- Preservar los cambios locales al recargar datos o cambiar filtros; advertir conflictos cuando el servidor modifica un nombre que también está siendo editado. Descartar recupera el último valor conocido del servidor.

## Flujo de datos y protección de información

Extender `CatalogQuickEditValues` y sus utilidades compartidas para incluir `title`: creación, detección de cambios, validación, parche parcial, reconciliación y restablecimiento.

Los cuatro componentes continuarán usando `ProductsAdminService.updateProduct`. La ruta de parches rápidos del servicio debe aceptar y mapear `title`, además de los campos que ya soporta. Es importante no pasar un cambio de nombre aislado al mapeador de producto completo: ese mapeador asigna valores por defecto a campos omitidos y puede regenerar el slug.

Enviar únicamente los campos editados. Nunca incluir ni regenerar `slug` desde el editor rápido. No cambiar categorías, imágenes, descripción, especificaciones, metadatos ni configuración de sincronización del proveedor. No se requieren cambios de esquema en Directus ni dependencias nuevas.

## Alternativa descartada

Activar el nombre con un icono de lápiz añadiría un clic y sería inconsistente con el precio y stock, que ya se editan directamente. Se mantiene el editor de detalles para modificaciones más amplias.

## Verificación prevista

1. Pruebas de utilidades para cambios exclusivos de nombre, nombres vacíos, espacios exteriores, descarte, reconciliación y conflictos.
2. Prueba del servicio que verifique el cuerpo exacto enviado a Directus al cambiar solo el nombre y al combinarlo con precio, stock o publicación, sin `slug` ni valores por defecto ajenos.
3. Pruebas de los cuatro componentes y sus plantillas: campo inicial, guardado, validación, bloqueo durante la petición, errores y conservación de borradores; cubrir escritorio y móvil.
4. Ejecutar las pruebas afectadas, la suite completa y el build de producción. Registrar los resultados reales y cualquier limitación de comprobación visual.

## Fuera de alcance

Cambiar URL, generar redirecciones, edición masiva de nombres, modificar el editor de detalles, refactorizaciones no relacionadas, publicar en producción o intervenir en el servidor.

## Estado

Diseño de interfaz aprobado en el chat. Especificación escrita y revisada sin puntos pendientes; pendiente revisión del archivo por el usuario antes del plan de implementación, según la guía `brainstorming`.
