# Revisión de permisos de Directus — 21 de octubre de 2026

## Corrección aplicada

El permiso público de `pc_blog_posts` ya exige `published=true` y `published_at <= $NOW`. Los archivos editoriales están identificados por `directus_files.pc_blog_managed`; para leerlos sin sesión, su fecha `pc_blog_public_at` debe haber llegado. Esta fecha se calcula como la menor fecha de una entrada publicada que usa el archivo. Si ninguna está publicada, queda nula y el archivo es privado. Una tabla interna de referencias y un trigger PostgreSQL sincronizan estos datos al crear, modificar o eliminar entradas, incluyendo cambios desde el panel de Directus. Los archivos retirados de una entrada siguen identificados como editoriales y privados si ya no hay una publicación que los use. Un archivo compartido con otra entrada publicada sigue siendo público.

Se migraron seis archivos referenciados por el blog. Verificación individual: tres privados devuelven 403 anónimo y 200 autorizado; tres públicos devuelven 200. El borrador «Otro blog» no fue editado ni publicado. Las variantes redimensionadas de su portada también devuelven 403.

Prueba real con registros temporales: subida editorial sin asociar → privado; publicación futura → artículo y archivo privados; publicación con fecha pasada → ambos públicos; reprogramación futura → archivo privado; despublicación → privado anónimo y accesible autorizado; eliminación de entrada → archivo privado. Una imagen del catálogo respondió 200 antes y después. Se eliminaron el artículo y el archivo de ensayo.

Los filtros originales se respaldaron fuera del repositorio en `~/.pcgamercdmx/backups/`. No se cambiaron credenciales ni se reiniciaron servicios. Se limpió la caché del CMS tras modificar permisos.

### Aplicación y despliegue

El editor de `audit-blog` ahora marca las nuevas subidas editoriales como privadas desde su creación y carga medios privados autenticando por cabecera; usa URLs blob temporales, nunca tokens dentro de las direcciones. Las URLs se liberan al cambiar de medio o destruir la vista. Las imágenes públicas siguen cargando sin autenticación. Los cambios del frontend están locales y requieren despliegue para que los editores web ya publicados tengan este comportamiento. Hasta ese despliegue, una subida realizada por el editor antiguo puede seguir siendo pública antes de guardarse en una entrada; al guardarse, el trigger la clasifica y protege. El editor antiguo tampoco podrá mostrar mediante URL pública los archivos que ahora son privados. Esto es una limitación pendiente de despliegue, no una garantía de protección de subidas desde clientes antiguos.

Tanto `environment.ts` como `environment.prod.ts` apuntan al mismo CMS; los permisos aplicados afectan a ambos frontends que lo consumen. Archivos de otros dominios no quedan protegidos por Directus. Una copia ya descargada o almacenada en la caché de un navegador no puede revocarse; las verificaciones anteriores son solicitudes nuevas al servidor.

Reaplicación: ejecutar `node tools/configure-blog-privacy.mjs --schema-only`, aplicar `tools/blog-file-privacy.sql` en la base del CMS, y ejecutar `node tools/configure-blog-privacy.mjs`. El SQL incluye funciones, índices, trigger y reconstrucción de referencias; debe conservarse en respaldos/migraciones de infraestructura. `python tools/verify-blog-privacy.py` ejecuta el ciclo real con registros desechables. Los scripts leen credenciales de la ubicación local existente, sin imprimirlas.

Validación local: suite Angular de 353 pruebas correcta, más prueba añadida de marcador multipart verificada dentro de las 10 pruebas del servicio API; compilación de producción correcta. Advertencia de tamaño inicial: 553.81 kB frente al presupuesto de 550 kB (la advertencia ya existía; el módulo compartido añade aproximadamente 0.48 kB).

Los apartados siguientes documentan el estado encontrado antes de la corrección.

Alcance: permisos públicos del blog y archivos del CMS de pruebas. Acceso SSH autorizado por el propietario. Consultas SQL dentro de una transacción `READ ONLY` finalizada con `ROLLBACK`, y consultas HTTP anónimas. No se modificaron datos, permisos ni servicios. No se incluyen credenciales.

## Evidencia

- Directus 11.17.4 está en ejecución. Los servicios web de pruebas y producción reportan estado saludable en Docker; esto no constituye una prueba funcional completa del servidor.
- La política vinculada al acceso anónimo es `$t:public_label` y no tiene acceso administrativo.
- Su único permiso sobre `pc_blog_posts` es `read`, con filtro `{"published":{"_eq":true}}` y todos los campos. No hay permisos públicos de crear, actualizar o eliminar entradas ni comodines públicos en las filas revisadas.
- «Otro blog» existe como borrador (`published=false`), con slug real `borrador` y sin fecha de publicación. Consultarlo anónimamente por ese slug devuelve HTTP 200 con `{"data":[]}`.
- La comprobación anterior por título fue correcta; el slug que inicialmente se había supuesto (`otro-blog`) no era el real.
- No existen actualmente entradas publicadas con fecha futura ni publicadas sin fecha.
- `directus_files` tiene lectura pública sin filtro (`{}`), sobre todos sus campos. Esto explica el acceso anónimo a las imágenes de borradores observado por el usuario.

## Hallazgo prioritario

El permiso público de entradas no verifica `published_at`. Por su configuración, cualquier entrada con `published=true` y fecha futura sería legible directamente por API antes de la fecha prevista. Actualmente no hay entradas programadas que demuestren una filtración efectiva. El frontend filtra por fecha, pero eso no limita las consultas directas al CMS.

Corrección propuesta, sin aplicar: reemplazar el filtro público de lectura por una conjunción de `published=true` y `published_at <= $NOW`. Mantener deshabilitadas las escrituras anónimas. Verificar después con un artículo programado de ensayo y con uno publicado, preservando el borrador existente.

## Archivos de borradores

Las imágenes no son privadas aunque su entrada sea borrador. Antes de restringir `directus_files` hay que definir cómo distinguir archivos públicos de catálogo/sitio y archivos editoriales privados; la configuración actual es compartida y un cambio general podría romper imágenes públicas. La privacidad de los archivos requiere su propia regla de publicación y comprobación de acceso a `/assets/{id}`.

La revisión se limita al CMS de pruebas identificado por la aplicación local; no prueba que otro CMS de producción tenga los mismos permisos.
