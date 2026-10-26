# Autoguardado, recuperación e historial del editor

Alcance aprobado: proteger el trabajo del editor, sin modificar artículos reales de la auditoría.

1. IndexedDB guarda un borrador local por CMS, usuario autenticado y artículo (o artículo nuevo), con debounce de un segundo. Incluye formularios incompletos y File de subidas pendientes. No publica ni escribe el artículo en Directus.
2. Al volver al editor se ofrece recuperar o descartar la copia, sin sustituir automáticamente el registro del CMS. Los errores de cuota/permisos de almacenamiento se muestran y nunca se presentan como un guardado correcto. La copia es propia del navegador/origen y no sustituye guardar en el CMS.
3. Un control de revisión de la copia local evita que otra pestaña la sobrescriba silenciosamente. La sesión se identifica mediante `/users/me`, sin guardar tokens en el borrador.
4. Directus ya tiene accountability=all y revisiones accesibles. Mostrar las últimas 20 versiones y permitir abrir una en el editor tras confirmar el reemplazo de cambios locales. Recuperar contenido conserva URL y fecha de publicación actuales y no usa el endpoint revert ni publica automáticamente.
5. Antes de guardar un artículo existente, comprobar si su fecha de modificación cambió desde su carga y avisar en caso de conflicto. Es detección previa, no un bloqueo atómico del servidor.
6. Guardado manual correcto limpia solo la copia local que pertenece a esa sesión. Fallos de red conservan la recuperación. El cierre normal intenta guardar inmediatamente y advierte si queda trabajo sin confirmar; no promete persistir una escritura asíncrona tras cierre forzado.
7. Pruebas: persistencia real en IndexedDB, Files y aislamiento; conflictos entre pestañas; error de almacenamiento; recarga y recuperación en navegador; lectura/restauración de revisiones con permisos. Solo usar entradas temporales en pruebas.

No se incluyen edición de publicaciones existentes, sincronización de borradores entre dispositivos, restauración de medios eliminados del almacenamiento ni promoción a producción. Los commits ce1eb6e y 16ebf5f están en audit-blog y desplegados en el sitio de pruebas, pero aún no integrados en la rama test al iniciar este trabajo.
