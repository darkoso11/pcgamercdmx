# Validación del blog en pruebas — 22 de octubre de 2026

Sitio: https://test.pcgamercdmx.com. Código desplegado: `f337f1c`, rama `audit-blog`. El despliegue del frontend se realizó únicamente en el servicio de pruebas de Dokploy, cuyo origen se cambió de `test` a `audit-blog`; la opción de despliegue automático conserva su valor original. El frontend de producción no se desplegó. Los dos frontends usan el mismo CMS, donde las reglas de privacidad ya se habían aplicado.

## Pruebas de navegador

- Inicio de sesión autorizado en el administrador: correcto.
- Apertura de «Otro blog»: sus tres imágenes cargan mediante URLs blob autenticadas.
- Vista previa y regreso al editor de esa entrada: conserva ambas secciones y las tres imágenes. No se guardó ni publicó la entrada.
- Consulta anónima de `/blog/borrador`: muestra entrada no disponible.
- Creación desde la interfaz de una entrada temporal con título, slug, resumen, categoría, sección de texto y una portada nueva: correcto.
- Antes de guardar, el archivo nuevo ya tenía `pc_blog_managed=true` y su URL devolvía 403 sin autorización.
- Vista previa del formulario nuevo sin guardar: conserva título, sección e imagen; la imagen carga por blob autenticado.
- Regreso al formulario y guardado como borrador: correcto. La persistencia de texto, sección y portada se comprobó directamente en el CMS.
- Reapertura del borrador guardado desde su URL de edición: título e imagen privada recuperados correctamente.
- Consulta anónima directa del nuevo borrador: 403.
- Sin errores de página reportados por el navegador durante la verificación del editor y la vista previa.

## Ciclo de privacidad contra el CMS real

Se repitió `python tools/verify-blog-privacy.py`, con estos resultados:

| Caso | Resultado |
|---|---|
| Archivo editorial nuevo sin entrada, anónimo | 403 |
| Mismo archivo, autorizado | 200 |
| Entrada futura e imagen, anónimo | 403 / 403 |
| Entrada publicada con fecha pasada e imagen, anónimo | 200 / 200 |
| Imagen tras reprogramar la entrada al futuro, anónimo | 403 |
| Imagen tras despublicar, anónimo / autorizado | 403 / 200 |
| Imagen al eliminar su última entrada, anónimo | 403 |
| Imagen de catálogo antes y después | 200 / 200 |

## Limpieza y límites

Se eliminaron las entradas y archivos desechables creados por ambos recorridos. Se verificó que «Otro blog» continúa como borrador. Se cerraron los navegadores de prueba y se borró el perfil temporal de credenciales. Las credenciales no se incluyen en este documento.

La verificación de navegador no publicó la entrada temporal; las transiciones de publicación se ejercitaron mediante la API con otro registro desechable. No se ejecutó una revisión visual completa de móvil ni pruebas de carga. Un ayudante de espera de URL de la herramienta de navegador agotó su conexión; se comprobó la navegación real al listado y se abrió directamente la edición del registro guardado, sin encontrar un fallo de la aplicación.

Para repetir manualmente, utilizar el administrador del dominio de pruebas y una ventana de incógnito nueva para las consultas anónimas. Los archivos que ya se descargaron en un navegador no pueden revocarse de ese navegador mediante cambios de permisos del servidor.
