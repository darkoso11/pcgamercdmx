# Product Planning - PC Gamer CDMX

## Metadata
- Fecha de creacion: 2026-01-14
- Ultima actualizacion: 2026-04-25
- Estado: propuesta estructurada lista para implementacion
- Alcance: pagina publica de productos + base para backend/admin

## Objetivo
Diseñar la pagina de productos de PC Gamer CDMX como un catalogo escalable, modular y preparado para evolucionar desde mocks locales hacia una integracion real con Node.js + MongoDB.

La solucion se divide en dos fases:

### Fase 1: Ensambles de PC
- Mostrar PCs armadas como productos principales del negocio.
- Cada ensamble debe incluir:
  - componentes incluidos
  - especificaciones tecnicas claras
  - enfoque de uso
  - CTA de cotizacion/contacto
- La estructura debe permitir reutilizar componentes individuales como referencias, no texto aislado.

### Fase 2: Productos individuales y perifericos
- Integrar componentes sueltos y perifericos en el mismo ecosistema.
- Incorporar filtros, categorias, SEO por tipo de producto y relacion con ensambles.
- Aprovechar la misma base de datos, servicio y UI reusable.

---

## 1. Estado actual del proyecto

## 1.1 Lo que ya existe y conviene reutilizar
- Rutas publicas ya definidas en [app.routes.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/app.routes.ts:1):
  - `/productos`
  - `/productos/paquetes`
  - `/productos/perifericos`
  - `/productos/componentes`
  - `/productos/:slug`
- Base de modelos compartidos en `src/app/shared/models/`:
  - [product.model.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/shared/models/product.model.ts:1)
  - [assembled-pc.model.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/shared/models/assembled-pc.model.ts:1)
  - [component.model.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/shared/models/component.model.ts:1)
  - [peripheral.model.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/shared/models/peripheral.model.ts:1)
  - [accessory.model.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/shared/models/accessory.model.ts:1)
- Servicio publico de productos ya iniciado en [products.service.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/features/products/services/products.service.ts:1).
- Detalle de producto funcional en [product-detail.component.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/features/products/product-detail.component.ts:1).
- Home ya enlaza a paquetes y perifericos desde [home.component.html](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/features/home/home.component.html:1).
- Existe base administrativa para productos en [products-admin.service.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/features/products/admin/products-admin.service.ts:1) y componentes admin relacionados.

## 1.2 Lo que hoy esta incompleto
- [products.component.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/features/products/products.component.ts:1) sigue como contenedor incompleto, con logica heredada de slider y sin integracion real.
- `products.component.html` esta vacio.
- `products-overview`, `packages`, `components` y `peripherals` existen, pero estan practicamente vacios.
- `ProductsService` ya crecio en modelos, pero la UI publica aun consume compatibilidad legacy.
- La pagina de detalle usa el tipo `Product` legacy en vez de un `ProductViewModel` o una union tipada.
- El admin maneja un modelo distinto al de `shared/models`, lo que abre una deuda clara de sincronizacion.

---

## 2. Inconsistencias y riesgos detectados

## 2.1 Brechas entre documento y codigo real
- El documento anterior mezclaba:
  - hallazgos reales
  - decisiones ya tomadas
  - features futuras
  - tareas supuestamente completadas
- Eso vuelve dificil saber que ya existe y que sigue siendo propuesta.

## 2.2 Duplicidad de modelos
- Hay un modelo moderno en `shared/models`.
- Hay un modelo legacy `Product` embebido dentro de `ProductsService`.
- Hay otro modelo admin dentro de `ProductsAdminService`.

Impacto:
- misma entidad con nombres distintos
- campos repetidos o divergentes
- mapeos innecesarios
- mayor riesgo al conectar backend real

## 2.3 Backward compatibility mal resuelta
- `ProductsService` conserva metodos legacy utiles para transicion.
- Pero hoy hay un error de diseño importante:
  - existe `searchProducts(query: string, limit?: number): Observable<SearchResult>`
  - y tambien `searchProducts(term: string): Observable<Product[]>`
- TypeScript no permite dos implementaciones reales con el mismo nombre en una clase.
- El archivo requiere correccion antes de consolidar la capa de datos.

## 2.4 Modelos ricos, UI pobre
- Los modelos ya soportan:
  - tipos de producto
  - variantes
  - descuentos
  - compatibilidad
  - ratings
  - provider sync
- Pero las vistas actuales no capitalizan nada de eso.

## 2.5 Rutas correctas, arquitectura visual incompleta
- La estrategia de rutas es buena.
- Falta construir un `ProductsComponent` que funcione como shell real:
  - header contextual
  - tabs o segmentacion de catalogo
  - filtros compartidos
  - router outlet
  - SEO contextual por categoria

## 2.6 SEO aun parcial
- Existe SEO basico en detalle.
- Faltan:
  - metadata por categoria
  - JSON-LD
  - breadcrumbs estructurados
  - contenido indexable por tipo
  - canonical tags
  - estrategia de slugs por categoria/subcategoria

---

## 3. Decision estructural recomendada

## 3.1 Arquitectura publica
Se recomienda mantener una arquitectura hibrida:

- `/productos`
  - landing catalogo con resumen, navegacion y destacados
- `/productos/paquetes`
  - foco editorial y comercial en ensambles
- `/productos/componentes`
  - catalogo filtrable de componentes
- `/productos/perifericos`
  - catalogo filtrable de perifericos
- `/productos/:slug`
  - detalle individual

Esta estructura ya esta alineada con el routing actual, por lo que no requiere crear nuevas rutas base.

## 3.2 Decisiones clave
- Reutilizar los modelos de `shared/models` como fuente oficial de contratos.
- Mantener una sola capa de datos publica (`ProductsService`) y una capa admin (`ProductsAdminService`) con DTOs alineados.
- Migrar la UI de productos desde el `Product` legacy a un modelo unificado de vista.
- Evitar hardcodear filtros, categorias y especificaciones en templates.

---

## 4. Arquitectura Angular propuesta

## 4.1 Shell de productos

### `ProductsComponent`
Responsabilidades:
- actuar como contenedor principal de la seccion
- leer la ruta activa
- exponer metadata de categoria
- renderizar navegacion entre segmentos
- hospedar filtros globales cuando aplique
- contener el `router-outlet`

No debe:
- duplicar sliders del home
- contener arrays mock locales
- resolver detalle de producto
- mezclar logica de categoria con detalle

## 4.2 Organizacion recomendada de componentes

### Nivel de pagina
- `ProductsComponent`
- `ProductsOverviewComponent`
- `PackagesComponent`
- `ComponentsComponent`
- `PeripheralsComponent`
- `ProductDetailComponent`

### Componentes reutilizables internos del feature
- `ProductsShellHeaderComponent`
- `ProductsSegmentNavComponent`
- `ProductsFilterBarComponent`
- `ProductsSortControlComponent`
- `ProductsGridComponent`
- `ProductCardComponent`
- `ProductBadgeListComponent`
- `ProductPriceBlockComponent`
- `ProductSpecHighlightsComponent`
- `EmptyProductsStateComponent`
- `ProductBreadcrumbComponent`
- `RelatedProductsComponent`
- `ProductSeoBlockComponent`

### Componentes especificos de Fase 1
- `AssembledPcCardComponent`
- `AssembledPcSpecsTableComponent`
- `AssembledPcComponentsListComponent`
- `AssembledPcUseCaseChipComponent`
- `AssembledPcPerformancePanelComponent`

### Componentes especificos de Fase 2
- `ComponentCardComponent`
- `PeripheralCardComponent`
- `DynamicSpecsTableComponent`
- `CategorySidebarComponent`
- `FilterFacetGroupComponent`

Nota:
- No es necesario crear todos desde el primer sprint.
- La prioridad es construir primero componentes reutilizables de grid, card, filtros y detalle.

## 4.3 Reutilizacion sin crear estructura innecesaria
Con la restriccion actual, se recomienda reutilizar la carpeta `src/app/features/products/` ya existente y evolucionar:

- `products.component.*` como shell
- `products-overview/` como entrada editorial
- `packages/` como fase 1
- `components/` como parte de fase 2
- `peripherals/` como parte de fase 2
- `product-detail.component.*` como detalle universal
- `services/products.service.ts` como capa publica

---

## 5. Modelo de datos recomendado

## 5.1 Fuente de verdad
La base correcta ya esta iniciada en `shared/models`. La recomendacion es consolidar sobre esa capa y dejar de expandir interfaces paralelas.

## 5.2 Estructura transversal

### `BaseProduct`
Debe cubrir solo lo comun:
- identificacion: `_id`, `slug`, `sku`
- clasificacion: `category`, `subcategory`, `status`
- media: `image`, `images`, `thumbnail`
- pricing: `price`, `discountedPrice`, `discount`
- contenido: `title`, `description`, `fullDescription`
- SEO: `metaTitle`, `metaDescription`, `keywords`
- inventario: `stock`, `lowStockThreshold`
- visibilidad: `featured`, `published`, `position`
- auditoria: `createdAt`, `updatedAt`

## 5.3 Fase 1: Ensambles de PC

### Contrato recomendado
Usar `AssembledPC` como tipo principal de catalogo de ensambles.

Campos indispensables para render:
- `title`
- `slug`
- `image`
- `price`
- `description`
- `useCase`
- `performanceTier`
- `specifications`
- `certifications`
- `brandLogos`
- `highlights`
- `customizable`

### Ajuste recomendado al modelo
Actualmente `specifications` usa un objeto fijo. Eso es bueno para la UI comercial, pero para el backend conviene separar:

```ts
interface AssemblyComponentSlot {
  slot:
    | 'processor'
    | 'motherboard'
    | 'ram'
    | 'storage'
    | 'graphicsCard'
    | 'powerSupply'
    | 'case'
    | 'cooling'
    | 'additional';
  componentId?: string;
  label: string;
  quantity?: number;
  summary: string;
  optional?: boolean;
}
```

Recomendacion:
- en frontend se puede seguir usando la forma actual
- para API y MongoDB conviene persistir tambien una lista normalizada de slots
- asi se facilita edicion admin, comparacion, stock y pricing por componente

## 5.4 Fase 2: Componentes y perifericos

### Componentes
Usar `ComponentProduct` para CPU, GPU, RAM, almacenamiento, motherboard, PSU, cooling y case.

### Perifericos
Usar `PeripheralProduct` para teclado, mouse, monitor, headset y mousepad.

### Accesorios
Mantener `AccessoryProduct` reservado para una tercera etapa o una extension de fase 2.

## 5.5 View model recomendado para la UI publica
La UI no deberia depender del tipo legacy `Product`. Conviene usar un view model transversal:

```ts
type CatalogProduct = AssembledPC | ComponentProduct | PeripheralProduct | AccessoryProduct;

interface ProductCardViewModel {
  id?: string;
  slug: string;
  title: string;
  image: string;
  price: number;
  discountedPrice?: number;
  category: ProductCategory;
  subcategory: string;
  description: string;
  badges: string[];
  specHighlights: Array<{ label: string; value: string }>;
  ctaLabel: string;
}
```

Ventajas:
- una sola card reutilizable
- mapeo claro desde cualquier tipo
- desacople entre backend y template

---

## 6. Estrategia de datos para backend futuro

## 6.1 Colecciones recomendadas en MongoDB

### `products`
Guardar todos los productos en una sola coleccion usando discriminacion por `category` y `subcategory`.

Ventajas:
- catalogo unificado
- busqueda global
- filtros consistentes
- facil SEO y related products

Campos base:
- `_id`
- `slug`
- `sku`
- `category`
- `subcategory`
- `status`
- `title`
- `description`
- `fullDescription`
- `price`
- `discountedPrice`
- `currency`
- `stock`
- `featured`
- `published`
- `images`
- `seo`
- `createdAt`
- `updatedAt`

Campos tipados por categoria:
- `assembledData`
- `componentData`
- `peripheralData`
- `accessoryData`

### `categories`
Separar categorias navegables y SEO:
- nombre
- slug
- tipo padre
- descripcion
- orden
- icono
- metadata SEO

### `offers`
Promociones y reglas de descuento.

### `brands`
Opcional, pero recomendable para normalizar logos y filtros.

## 6.2 DTOs recomendados

### Respuesta de listado
```ts
interface ProductListResponse {
  items: CatalogProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  filters: {
    availableBrands: string[];
    availableCategories: string[];
    availableSubcategories: string[];
    priceRange: { min: number; max: number };
  };
}
```

### Query params base
```ts
interface ProductQueryParams {
  category?: string;
  subcategory?: string;
  brand?: string[];
  useCase?: string[];
  performanceTier?: string[];
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'newest';
  page?: number;
  limit?: number;
}
```

## 6.3 Regla importante para MongoDB
`slug` debe ser unico y con indice.

Tambien se recomiendan indices para:
- `category`
- `subcategory`
- `published`
- `featured`
- `price`
- `keywords`
- `title`

---

## 7. Fase 1: propuesta funcional para ensambles

## 7.1 Objetivo UX
La pagina de ensambles debe comunicar valor comercial rapido. El usuario debe entender en pocos segundos:
- para que sirve cada equipo
- que hardware incluye
- en que rango esta
- si puede personalizarlo
- como pedir cotizacion o asesoria

## 7.2 Estructura visual recomendada

### Vista de listado `/productos/paquetes`
- header con intro corta de la categoria
- filtros compactos:
  - presupuesto
  - uso principal
  - tier de rendimiento
  - marca CPU
  - marca GPU
- grid de tarjetas

### Tarjeta de ensamble
Debe mostrar:
- imagen principal
- nombre del ensamble
- etiqueta de uso: gaming, streaming, edicion
- tier: entry, mid, high, ultra
- 4 a 6 highlights tecnicos
- precio o rango desde
- CTA a detalle
- CTA secundario a cotizacion

### Detalle de ensamble
Debe incluir:
- galeria o hero visual
- resumen comercial
- tabla de componentes
- bloque de uso recomendado
- bloque de rendimiento estimado
- certificacion de fuente
- marcas incluidas
- perifericos recomendados
- CTA fijo en desktop y sticky en mobile

## 7.3 Campos UI minimos por ensamble
- `title`
- `description`
- `useCase`
- `performanceTier`
- `specifications.processor`
- `specifications.graphicsCard`
- `specifications.ram`
- `specifications.storage`
- `certifications.certificate`
- `certifications.wattage`
- `highlights`

## 7.4 Regla de negocio recomendada
Un ensamble no debe guardar solo strings sueltos. Debe poder referenciar productos individuales para permitir:
- recalculo de precio
- disponibilidad real
- recomendaciones compatibles
- armado desde admin

---

## 8. Fase 2: propuesta funcional para componentes y perifericos

## 8.1 Objetivo UX
Permitir exploracion mas profunda sin romper la claridad comercial del sitio.

## 8.2 Segmentacion recomendada

### `/productos/componentes`
Subsegmentos:
- CPU
- GPU
- RAM
- almacenamiento
- motherboard
- PSU
- cooling
- gabinetes

### `/productos/perifericos`
Subsegmentos:
- teclados
- mouse
- monitores
- headsets
- mousepads

## 8.3 Filtros recomendados

### Filtros transversales
- precio
- marca
- disponibilidad
- destacados
- orden

### Filtros por componentes
- socket
- tipo de memoria
- capacidad
- wattage
- form factor

### Filtros por perifericos
- tipo de conexion
- tamano
- refresh rate
- layout
- RGB
- wireless

## 8.4 SEO por fase 2

### URLs deseables
- `/productos/componentes`
- `/productos/componentes?tipo=gpu`
- `/productos/perifericos`
- `/productos/perifericos?tipo=monitor`

Si despues se requiere mas profundidad SEO, evolucionar a:
- `/productos/componentes/gpu`
- `/productos/perifericos/monitores`

Recomendacion actual:
- no abrir mas rutas hasta que exista contenido real suficiente
- usar metadata dinamica por query param o segmento

---

## 9. Estrategia SEO recomendada

## 9.1 Nivel catalogo
- `title` y `meta description` por vista de categoria
- texto introductorio indexable arriba del grid
- seccion FAQ opcional por categoria
- breadcrumbs visibles y estructurados

## 9.2 Nivel detalle
- `metaTitle`
- `metaDescription`
- `og:title`
- `og:description`
- `og:image`
- `canonical`
- JSON-LD `Product`

## 9.3 Campos SEO recomendados por producto
```ts
interface ProductSeoMeta {
  metaTitle: string;
  metaDescription: string;
  canonicalSlug?: string;
  keywords?: string[];
  schemaType?: 'Product';
}
```

## 9.4 Contenido minimo por categoria
- H1 claro
- descripcion breve de la categoria
- bloques internos enlazados a subsegmentos
- enlaces a productos destacados
- copy real, no texto generico

---

## 10. UX/UI recomendada

## 10.1 Principios generales
- mantener consistencia con el tono visual actual del home
- no convertir productos en una landing decorativa
- priorizar escaneo rapido
- hacer visible la diferencia entre ensambles y productos individuales

## 10.2 Mejoras concretas para Fase 1
- chips visibles de uso principal
- highlights tecnicos resumidos
- comparacion ligera entre 2 o 3 ensambles
- CTA doble:
  - ver detalle
  - cotizar por WhatsApp/contacto
- modulos de confianza:
  - armado profesional
  - garantia
  - soporte

## 10.3 Mejoras concretas para Fase 2
- filtros laterales en desktop y drawer en mobile
- orden persistente en query params
- badges utiles:
  - nuevo
  - destacado
  - en promocion
  - bajo stock
- tarjetas con highlights especificos por tipo, no texto plano generico

## 10.4 Mobile
- filtros colapsables
- CTA sticky en detalle
- especificaciones en acordeon
- imagen principal con swipe si hay galeria

---

## 11. Escalabilidad tecnica

## 11.1 En frontend
- mantener modelos en `shared/models`
- crear adapters o mappers a `ViewModel`
- mover filtros a query params
- desacoplar cards del tipo de producto mediante entradas normalizadas

## 11.2 En servicios
`ProductsService` debe evolucionar a tres capas internas:

1. `fetch`
   - llamadas HTTP
2. `map`
   - adaptacion backend -> modelos/view models
3. `state`
   - filtros, cache, resultados

## 11.3 En admin
El admin debe reutilizar los mismos contratos base y no inventar otro `Product` paralelo.

Recomendacion:
- reemplazar progresivamente la interfaz local de `ProductsAdminService`
- compartir DTOs base con `shared/models` o `shared/dto`

---

## 12. Propuesta de implementacion por etapas

## Etapa 1: Consolidacion de contratos
- definir `CatalogProduct` como union tipada
- eliminar o encapsular el `Product` legacy
- corregir `ProductsService`
- alinear `ProductsAdminService` con `shared/models`

## Etapa 2: Shell publica de productos
- completar `products.component.ts`
- construir `products.component.html`
- agregar header, nav de segmentos y `router-outlet`

## Etapa 3: Fase 1 operativa
- completar `packages`
- renderizar grid real de ensambles
- actualizar `product-detail` para soportar `AssembledPC`
- agregar CTA de cotizacion y related products

## Etapa 4: Fase 2 operativa
- completar `components`
- completar `peripherals`
- implementar filtros y orden compartidos
- soportar detalle para tipos distintos

## Etapa 5: SEO y backend readiness
- metadata dinamica por vista
- JSON-LD
- query params estables
- normalizacion de payloads para Node.js + MongoDB

---

## 13. Recomendaciones puntuales sobre archivos actuales

## Mantener y evolucionar
- [docs/products_planning.md](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/docs/products_planning.md:1)
- [app.routes.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/app.routes.ts:1)
- [products.service.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/features/products/services/products.service.ts:1)
- [product-detail.component.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/features/products/product-detail.component.ts:1)
- toda la carpeta `src/app/shared/models/`

## Refactor prioritario
- [products.component.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/features/products/products.component.ts:1)
- `products.component.html`
- [products-overview.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/features/products/products-overview/products-overview.ts:1)
- [packages.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/features/products/packages/packages.ts:1)
- [components.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/features/products/components/components.ts:1)
- [peripherals.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/features/products/peripherals/peripherals.ts:1)
- [products-admin.service.ts](/c:/Users/Oswaldo/Documents/GitHub/pcgamercdmx/src/app/features/products/admin/products-admin.service.ts:1)

---

## 14. Conclusion ejecutiva
El proyecto ya cuenta con una base arquitectonica mejor de lo que aparenta: rutas correctas, modelos compartidos ricos y un detalle de producto util. El problema no es falta de direccion, sino desalineacion entre documento, modelos, servicio y vistas.

La estrategia correcta es:
- consolidar contratos
- usar `ProductsComponent` como shell real
- implementar primero Fase 1 con ensambles como producto principal
- escalar despues a componentes y perifericos sobre la misma base
- preparar desde ahora slugs, categorias, filtros y payloads pensando en MongoDB

Esta ruta evita rehacer trabajo, reduce hardcodeo y deja la seccion de productos lista para crecer sin romper el proyecto.
