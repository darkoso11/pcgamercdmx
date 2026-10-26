# Autoguardado, recuperación e historial del blog

## Qué guarda cada opción

- **Copia automática local:** se escribe después de un segundo sin cambios, o al salir normalmente del editor. IndexedDB conserva formularios incompletos y los archivos pendientes de subir. Se separa por CMS, usuario y artículo; los artículos nuevos comparten una copia por usuario en ese navegador, protegida contra sobrescrituras entre pestañas.
- **Guardar borrador / Publicar:** conserva la versión en Directus. Solo un guardado manual correcto limpia la copia local correspondiente. Un fallo de red no la elimina.
- **Historial de versiones:** muestra las últimas 20 revisiones guardadas en Directus. Abrir una versión carga su contenido en el editor para revisarlo; no llama a revert ni publica. Se conservan la URL y fecha de publicación actuales. La versión recuperada se puede guardar después como borrador o publicación mediante los botones existentes.

La portada, imágenes y videos pendientes se almacenan como File, sin subirlos para autoguardar. Las miniaturas temporales se reconstruyen al recuperar. No se copian credenciales ni tokens dentro del borrador.

Mientras la última edición sigue en espera se muestra **Copia local pendiente…**. La hora de la copia anterior no implica que esa última edición ya esté guardada; el aviso solo desaparece al completar la escritura correspondiente.

## Recuperar trabajo

1. Abrir el mismo artículo con el mismo usuario en el mismo navegador y dominio.
2. Si existe una copia local, el editor ofrece **Recuperar copia local** o **Descartar copia local**. El contenido del CMS permanece visible hasta elegir y el formulario se bloquea durante esa decisión.
3. Revisar la copia recuperada y guardar manualmente en el CMS. Recuperar nunca cambia por sí mismo el estado publicado/borrador.
4. El historial se consulta con **Ver historial de versiones**. Antes de reemplazar cambios sin guardar se pide confirmación.

El editor advierte al salir con cambios sin guardar en el CMS. Deshabilita la edición mientras carga un registro, guarda o abre una revisión para evitar que una respuesta sustituya texto escrito durante esa operación. Al volver desde vista previa conserva el trabajo y detecta si otra pestaña cambió la copia local.

## Conflictos y errores

Las escrituras y eliminaciones de la copia local verifican su revisión dentro de una transacción IndexedDB. Si otra pestaña la cambió, se detiene el autoguardado y se ofrece revisar la recuperación; no se sobrescribe esa copia silenciosamente.

Antes de guardar un artículo existente se compara `date_updated` del CMS con la versión cargada. Si cambió, se conserva el trabajo local y se pide comparar/cargar la versión actual. Esta comprobación detecta cambios previos; **no es un bloqueo atómico de edición simultánea en el servidor**.

Si el navegador rechaza almacenamiento, falta espacio o no puede verificarse el usuario, se muestra un aviso y no se presenta una copia como guardada. Las lecturas del historial utilizan la sesión normal del usuario y los permisos de Directus; los errores de acceso tienen mensaje y reintento. La colección ya tiene accountability=all, por lo que esta función no requiere ampliar permisos públicos ni cambiar el esquema del CMS.

## Límites

- La copia local no se sincroniza entre dispositivos, navegadores o dominios. Las copias de localhost, test y producción son distintas.
- El navegador puede eliminar almacenamiento y en incógnito puede perderse al cerrar la sesión. Guardar manualmente en el CMS sigue siendo necesario.
- El último segundo de edición y una escritura asíncrona al cerrar de forma forzada no tienen garantía de persistencia; el aviso de salida permite quedarse y guardar.
- Para abrir un artículo existente y resolver la identidad del usuario se necesita una sesión válida y acceso al CMS. Los cambios de una sesión de edición ya abierta sí pueden guardarse localmente sin red; si se recarga sin conexión, la copia se conserva para recuperarla cuando vuelva el acceso.
- Las revisiones dependen de la retención de Directus. No reconstruyen archivos eliminados de su biblioteca.
- El historial registra guardados en el CMS; no representa una versión distinta por cada tecla o autoguardado local.

## Validación

- 403 pruebas Angular correctas, con almacenamiento real en IndexedDB, recuperación de File, conflicto entre pestañas, errores de almacenamiento, permisos de lectura y conservación de URL/fecha al abrir versiones.
- Compilación de producción híbrida correcta.
- `npx playwright test --project=chromium`: 48 pruebas correctas.
- `npx playwright test e2e/blog-editor-recovery.spec.ts --project=chromium --project=firefox --project=webkit`: 6 pruebas correctas; recarga/recuperación y apertura de historial sin escrituras al CMS.
- Prueba real contra una entrada temporal: edición incompleta, portada con subida fallida, recarga, recuperación, edición sin conexión, fallo de guardado, nuevo intento correcto y apertura/descarte de una revisión. La revisión histórica no cambió el artículo del CMS; acceso anónimo a revisiones: 403.

Referencias: [revisiones de Directus](https://docs.directus.io/reference/system/revisions), [almacenamiento y cuotas](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria).
