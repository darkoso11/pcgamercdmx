# Editor de galería

Alcance aprobado por el usuario el 21 de noviembre de 2026, con la condición de retirar las imágenes incrustadas en código y permitir editarlas y borrarlas.

## Diseño e implementación
1. Persistir imágenes y ajustes de página en Directus. Lectura pública limitada a publicados; escritura autenticada. Sin datos de respaldo locales.
2. Migrar las ocho imágenes desde la revisión Git anterior, subir archivos al CMS y registrar la migración una sola vez. No recrear imágenes eliminadas al repetir la configuración.
3. Agregar Admin Galería con listado filtrable, formulario, carga/reemplazo, categoría y etiquetas libres con sugerencias, título, descripción, alt, autor, fecha, orden y borrador/publicado. Confirmar eliminación y salida con cambios pendientes.
4. Editar título y descripción SEO de la galería y elegir una imagen social publicada. Generar ImageGallery/ImageObject con datos publicados. Mantener presentación pública y agregar filtros por etiquetas, carga, error y vacío. SSR para reflejar ediciones sin recompilar.
5. Probar persistencia CRUD, validación de archivos, errores, borradores privados, filtros, SEO y migración idempotente. Compilar y comprobar interfaz en escritorio y móvil.

Eliminar un registro lo quita de la galería, conservando el archivo en la biblioteca del CMS para no romper otras referencias. Los archivos subidos están en la biblioteca de medios: un borrador no debe contener medios confidenciales. No se agregan páginas individuales por imagen.
