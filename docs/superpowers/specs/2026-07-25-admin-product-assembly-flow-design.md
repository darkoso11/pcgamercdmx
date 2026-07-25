# Diseño: flujo administrativo separado para productos y ensambles

Fecha: 2026-07-25  
Rama: `flujo-de-visualizacion-productos`

## Objetivo

Separar por completo la administración de productos y ensambles para que cada catálogo tenga su propia entrada, dashboard, listado, métricas, categorías y ofertas. Ninguna pantalla administrativa debe mezclar ensambles con hardware, componentes, periféricos o accesorios.

## Alcance

Este cambio cubre:

- dos tarjetas hermanas en el Panel Administrativo;
- dashboards independientes para Productos y Ensambles;
- métricas convertidas en botones de filtro;
- estado Borrador en ambos dominios;
- listas aisladas y ordenadas por disponibilidad;
- categorías y ofertas limitadas a su dominio;
- compatibilidad con rutas administrativas anteriores de ensambles;
- pruebas unitarias de aislamiento, conteos, filtros, orden y navegación.

No se modifica el catálogo público ni se introduce un nuevo estado persistido. La funcionalidad existente de ofertas puede conservar su nivel actual de implementación, pero sus rutas, datos y conteos deben quedar preparados y aislados por dominio.

## Navegación

El Panel Administrativo mostrará dos tarjetas independientes:

1. **Admin Productos**: hardware, componentes, periféricos y accesorios.
2. **Admin Ensambles**: computadoras armadas y paquetes.

Cada tarjeta abrirá directamente su dashboard, sin una pantalla intermedia.

Las rutas canónicas serán:

- `/admin/products` para el dashboard de Productos;
- `/admin/assemblies` para el dashboard de Ensambles;
- recursos de Productos bajo `/admin/products/...`;
- recursos de Ensambles bajo `/admin/assemblies/...`.

Las rutas anteriores bajo `/admin/products/assemblies/...` redirigirán a sus equivalentes canónicos para evitar enlaces rotos.

## Dashboards

Cada dashboard tendrá acciones propias:

### Productos

- Crear producto
- Ver productos
- Categorías de productos
- Ofertas de productos

### Ensambles

- Crear ensamble
- Ver ensambles
- Categorías de ensambles
- Ofertas de ensambles

Cada dashboard mostrará cinco indicadores interactivos:

- Totales
- Publicados
- Borradores
- Bajo stock
- Sin stock

Cada indicador será un botón accesible. Al activarlo navegará al listado del mismo dominio con el filtro correspondiente. El indicador activo deberá poder identificarse mediante el estado de la URL y los controles del listado.

## Estado de publicación

Se reutilizará el campo existente `published`:

- `published = true`: Publicado
- `published = false`: Borrador

Borrador cubrirá productos o ensambles incompletos, pendientes de edición o pausados. No se añadirá un tercer estado ni una migración de datos.

## Aislamiento de catálogos

El dominio Productos incluirá solamente elementos cuya categoría sea `componentes` o `perifericos`.

El dominio Ensambles incluirá solamente elementos cuya categoría sea `paquetes`.

Este aislamiento se aplicará en:

- conteos del dashboard;
- listados;
- resultados de búsqueda;
- filtros;
- elementos recientes;
- edición y duplicado desde cada listado;
- categorías;
- ofertas.

Los filtros recibidos desde la URL nunca podrán ampliar el alcance del dominio. Por ejemplo, una URL de Productos no mostrará un ensamble aunque se manipulen sus parámetros.

## Filtros y orden de stock

Los listados admitirán estos estados:

- `all`
- `published`
- `draft`
- `low-stock`
- `out-of-stock`

Después de aplicar el alcance, búsqueda y filtro seleccionado, el orden predeterminado será estable:

1. stock saludable: `stock > lowStockAlert`;
2. bajo stock: `stock > 0 && stock <= lowStockAlert`;
3. sin stock: `stock <= 0`.

Dentro de cada grupo se conservará el orden recibido del servicio. Si no existen elementos con stock saludable, la lista comenzará con bajo stock. Los elementos sin stock siempre aparecerán al final cuando el filtro muestre más de un grupo.

## Categorías

El gestor de categorías recibirá el dominio desde la ruta:

- Productos mostrará únicamente las raíces `componentes` y `perifericos`, junto con sus subcategorías.
- Ensambles mostrará únicamente la raíz `ensambles` y sus subcategorías.

Las operaciones de alta, edición, orden y eliminación deberán conservar ese alcance. Crear o editar desde una sección no deberá producir categorías visibles en la otra.

Para mantener compatibilidad con el modelo actual, las categorías específicas de ensambles se gestionarán como subcategorías de la raíz `ensambles`; no se requiere agregar un campo de dominio a Directus.

## Ofertas

El alcance se derivará de `applicableTo`:

- Ofertas de Productos: referencias en `products` o `categories`.
- Ofertas de Ensambles: referencias en `packages`.

Los listados, formularios y conteos de ofertas usarán el mismo alcance. Una oferta no podrá aparecer en ambos dominios. Si una oferta antigua contiene referencias de ambos tipos, se considerará inválida para edición hasta que se asigne a un solo dominio; no se duplicará silenciosamente.

## Arquitectura

Se mantendrán componentes separados para los dashboards y listados cuando sus presentaciones sean distintas. La lógica repetible se concentrará en funciones puras pequeñas para:

- determinar el dominio de un producto;
- clasificar el nivel de stock;
- aplicar el orden en cascada;
- aplicar el filtro de estado;
- calcular métricas por dominio;
- determinar el dominio de una oferta.

El servicio administrativo expondrá operaciones con alcance explícito. Los componentes no descargarán un catálogo mixto para después renderizarlo sin protección.

## Estados de interfaz y errores

Cada dashboard y listado tendrá estados de carga, vacío y error dentro de su propio contexto.

- Un fallo en Productos no mostrará datos de Ensambles como alternativa.
- Un fallo en Ensambles no mostrará datos de Productos como alternativa.
- Un filtro sin resultados mostrará un mensaje específico y permitirá limpiar filtros.
- Los botones conservarán nombre accesible, foco visible y semántica de botón o enlace.

## Pruebas y verificación

Las pruebas se escribirán antes de la implementación y cubrirán:

- Productos excluye siempre `paquetes`.
- Ensambles incluye solamente `paquetes`.
- Totales, publicados, borradores, bajo stock y sin stock se calculan por dominio.
- Cada botón abre el listado y filtro correctos.
- El orden por defecto es saludable, bajo y sin stock.
- Si no hay stock saludable, bajo stock aparece primero.
- Los elementos sin stock quedan al final.
- Las categorías se filtran por las raíces del dominio.
- Las ofertas se clasifican por `applicableTo`.
- Las rutas administrativas canónicas y sus redirecciones funcionan.

La verificación final incluirá pruebas unitarias relevantes, compilación de Angular y revisión visual de ambos dashboards y listados en resoluciones de escritorio y móvil.

## Criterios de aceptación

El cambio se considera terminado cuando:

1. el Panel Administrativo muestra tarjetas independientes para Productos y Ensambles;
2. cada tarjeta abre directamente su dashboard;
3. ninguna lista, métrica, categoría u oferta cruza dominios;
4. los cinco indicadores funcionan como filtros en ambos dashboards;
5. Borrador representa `published = false`;
6. el orden de stock cumple la cascada definida;
7. las rutas anteriores de ensambles siguen funcionando mediante redirección;
8. las pruebas, la compilación y la revisión visual pasan.
