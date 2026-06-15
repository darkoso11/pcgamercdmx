# Catalogo Directus con Preparacion para Proveedores

## Objetivo

Integrar el catalogo heredado ya extraido como catalogo propio de la nueva pagina, editable desde el admin y servido desde Directus en la rama `test`.

La extraccion inicial ya genero un paquete local de migracion. En la implementacion se debe normalizar el nombre de esa carpeta a:

- `data/legacy-catalog/products.normalized.json`
- `data/legacy-catalog/images/*`

Estos archivos se tratan como paquete de migracion legado. La nueva pagina no debe depender de ningun sistema anterior ni de APIs de catalogo heredadas.

## Decisiones Aprobadas

1. Usar Directus como fuente de verdad de esta primera iteracion.
2. Importar los productos como publicados desde el inicio.
3. Respetar categorias y subcategorias provenientes del catalogo extraido.
4. Subir imagenes a Directus Files.
5. Hacer que los productos sean editables desde el admin existente.
6. Preparar campos de proveedor desde esta primera iteracion.
7. Mantener precio manual por defecto.
8. Permitir cambiar a precio por proveedor cuando existan APIs reales.
9. La sincronizacion futura de proveedor solo actualizara precio.
10. El stock seguira siendo manual y administrado por la tienda.

## Arquitectura

```text
Catalogo legado normalizado + imagenes locales
        |
        v
Importador inicial
        |
        v
Directus Files + pc_products + pc_categories + pc_subcategories
        |
        v
Angular publico y Angular admin
        |
        v
Futuro: sincronizadores de proveedores actualizan solo precio
```

Directus queda como capa de contenido editable. Angular no lee el JSON legado directamente en produccion.

## Importador Inicial

Crear un script en `tools/` que:

1. Lea `data/legacy-catalog/products.normalized.json`.
2. Cree o actualice categorias en `pc_categories`.
3. Cree o actualice subcategorias en `pc_subcategories`.
4. Suba imagenes locales a Directus Files.
5. Cree o actualice productos en `pc_products` usando `slug` como llave estable.
6. Marque productos como `published: true`.
7. Guarde metadata neutral de importacion y proveedor.
8. Genere un resumen con creados, actualizados, imagenes subidas, imagenes omitidas y errores.

El importador debe ser idempotente: correrlo dos veces no debe duplicar productos, categorias ni archivos si ya existen equivalentes.

## Modelo de Producto

Los campos publicos actuales se mantienen:

- `title`
- `slug`
- `description`
- `category`
- `subcategory`
- `price`
- `discounted_price`
- `image`
- `images`
- `stock`
- `low_stock_alert`
- `featured`
- `published`
- `meta_title`
- `meta_description`
- `keywords`
- `specifications`

Agregar metadata administrativa neutral dentro de `specifications.admin` o estructura equivalente ya usada por el mapper:

```ts
{
  source: 'legacy-import',
  sourceId: '12544',
  pricingMode: 'manual',
  syncEnabled: false,
  syncProvider: null,
  providerProductId: null,
  providerSku: null,
  lastPriceSyncedAt: null,
  lastSyncStatus: null,
  lastSyncError: null
}
```

No usar nombres de sistemas anteriores en campos operativos del admin ni en la UI.

## Categorias y Subcategorias

El importador debe usar las categorias incluidas en `products.normalized.json`.

Reglas:

- Si la categoria no existe, se crea.
- Si la subcategoria no existe, se crea ligada a la categoria.
- Si un producto no trae categoria, cae en una categoria de revision como `Sin categoria`.
- Los slugs se normalizan para mantener URLs estables.

## Imagenes

Las imagenes se subiran a Directus Files.

Reglas:

- La primera imagen de cada producto sera la imagen principal.
- La galeria completa se guardara en `images`.
- Si una imagen falla, el importador continua y registra el error.
- El producto no debe depender de URLs remotas del sistema anterior.
- El admin debe poder reemplazar imagenes despues de la importacion.

## Admin

El admin de productos debe permitir editar los campos existentes y mostrar desde esta iteracion la configuracion de proveedor.

Campos visibles:

- Modo de precio: `manual` o `provider`.
- Proveedor.
- SKU o ID del proveedor.
- Ultima actualizacion de precio.
- Estado de sincronizacion.
- Error de sincronizacion, si existe.

Comportamiento:

- `pricingMode = 'manual'`: el precio se edita normalmente.
- `pricingMode = 'provider'`: queda preparado para que un job futuro actualice el precio.
- Como aun no hay APIs de proveedores, cualquier accion manual de sincronizacion debe estar deshabilitada o indicar que el proveedor no esta conectado.
- El stock permanece editable manualmente en todos los casos.

## Sincronizacion Futura de Proveedores

La preparacion debe permitir conectar proveedores como Cyberpuerta cuando entreguen sus APIs.

Arquitectura futura:

```text
Proveedor API
        |
        v
Adapter especifico del proveedor
        |
        v
Normalizer comun de precio
        |
        v
Sync job
        |
        v
Directus pc_products
```

Reglas futuras:

- Solo productos con `pricingMode = 'provider'` se actualizan automaticamente.
- La sincronizacion solo modifica `price` y, si aplica, `discounted_price`.
- No modifica stock.
- No modifica titulo, descripcion, categoria ni imagenes.
- Si falla el proveedor, se conserva el ultimo precio valido.
- El error se registra en metadata para verlo desde admin.

## Alcance de la Primera Iteracion

Incluye:

- Importador a Directus.
- Upload de imagenes a Directus Files.
- Mapeo de categorias/subcategorias.
- Productos publicados.
- Admin con campos de modo de precio/proveedor.
- Consumo publico desde Directus.
- Verificacion en rama `test`.

No incluye:

- Conexion real con Cyberpuerta u otro proveedor.
- Backend propio Django/PostgreSQL.
- Sincronizacion en tiempo real.
- Automatizacion cron de proveedores.
- Reglas de margen o pricing avanzado.

## Riesgos

- El catalogo trae 788 productos y 4,468 imagenes; la importacion puede tardar y debe registrar progreso.
- Algunas descripciones heredadas pueden venir con HTML poco limpio.
- Algunas categorias pueden necesitar normalizacion manual posterior.
- Directus Files puede crecer rapido; conviene probar en `test` antes de mover a produccion.
- El admin actual puede requerir ajustes de mapper para no perder metadata nueva.

## Criterios de Exito

1. Los productos importados aparecen en la pagina publica desde Directus.
2. Las imagenes se sirven desde Directus Files.
3. Los productos son editables desde el admin.
4. Las categorias y subcategorias quedan navegables.
5. Los productos importados estan publicados.
6. El admin muestra configuracion de precio manual/proveedor.
7. El precio se puede editar manualmente.
8. El stock se mantiene manual.
9. No queda dependencia activa de ningun sistema anterior de catalogo.
10. El importador puede reejecutarse sin duplicar datos.

## Plan Posterior

Cuando existan APIs reales de proveedores:

1. Crear adapter por proveedor.
2. Mapear `providerSku` o `providerProductId`.
3. Activar `pricingMode = 'provider'` por producto.
4. Crear job de sincronizacion de precios.
5. Agregar logs de sincronizacion y monitoreo.
