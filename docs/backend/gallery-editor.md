# Administración de la galería

## Uso
En el panel administrativo, abrir **Admin Galería** (`/control-pcg-cdmx-2026/gallery`).
- Subir una imagen JPG, PNG, WebP o AVIF de hasta 10 MB, completar título, texto alternativo y categoría.
- Escribir etiquetas separadas por comas. Se normalizan a minúsculas y se eliminan duplicados.
- Guardar como borrador o marcar Publicada. El orden numérico determina la posición.
- Editar permite reemplazar el archivo y cambiar cualquier dato, incluidas las imágenes migradas.
- Eliminar quita el registro definitivamente de la galería tras confirmación; conserva el archivo en la biblioteca Directus para no afectar otras referencias.
- Página y SEO permite editar encabezado, subtítulo, título SEO, descripción e imagen social. Si la imagen social deja de estar publicada, se usa la primera publicada.

## Persistencia y permisos
Colecciones: `pc_gallery_images` y `pc_gallery_settings` (registro 1).
La política pública solo permite leer imágenes con `published = true` y campos públicos de los ajustes. El administrador usa la sesión Directus existente. No se guarda contenido en localStorage, no hay imágenes de respaldo en código y los errores muestran una opción de reintentar.
Los archivos mantienen la política de medios existente del CMS: los borradores ocultan registros de galería, no convierten archivos de la biblioteca en privados.
La ruta pública usa SSR y Cache-Control no-store para reflejar cambios sin recompilar. El servidor debe ejecutar la salida SSR para renderizar metadatos actualizados.

## Configuración y migración
Credenciales mediante DIRECTUS_URL, DIRECTUS_EMAIL y DIRECTUS_PASSWORD o el archivo privado habitual fuera del repositorio.

```powershell
npm run configure:gallery -- --import-legacy
npm run configure:gallery -- --write --import-legacy
```

El primer comando es un plan sin escrituras. El segundo crea las colecciones y permisos, sube las ocho imágenes históricas y crea registros editables. Lee el contenido histórico desde Git (`1160d8f`), nunca desde una lista compilada en la aplicación. Requiere historial Git y los assets de esa revisión para la importación inicial.
La marca privada `legacy_imported` impide recrear imágenes eliminadas. `legacy_key` permite reanudar una importación parcial sin duplicar registros. La configuración normal no importa contenido salvo que se solicite `--import-legacy`.

Migración aplicada el 2026-11-21 en https://cms.test.pcgamercdmx.com: ocho registros y archivos verificados. No se despliega la aplicación al ejecutar la migración.

## Verificación
```powershell
npx ng test --watch=false --include=src/app/features/gallery/gallery.service.spec.ts
npm run build
npx playwright test e2e/gallery-editor.spec.ts --project=chromium --workers=1
```
Los tests de navegador interceptan el CMS, cubren persistencia y borrado sin restauración, carga, borradores/publicación, filtros, SEO, errores y móvil. La lectura pública real y los archivos también se verifican al aplicar la configuración.

Referencia de permisos: https://directus.com/docs/guides/auth/access-control

## Resultado de validación (2026-11-21)
- Compilación de producción y SSR correctos.
- Diez pruebas unitarias/de rutas y cinco flujos Playwright.
- CMS real: creación, edición y eliminación de un registro temporal de borrador; lectura pública y por ID bloqueadas para ese borrador. Registro de prueba eliminado.
- Ocho registros originales y sus archivos conservados. Segunda ejecución del plan reconoce la importación completada.
- HTML del servidor: ocho ImageObject, título SEO y Cache-Control no-store.
- Interfaz comprobada con datos reales en escritorio y móvil. Para pruebas locales contra el CMS, usar localhost:4200 (origen ya permitido por CORS).
