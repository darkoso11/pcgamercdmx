# Product Planning - PC Gamer CDMX

## Metadata
- Fecha de creación: 2026-01-14
- Última actualización: 2026-04-29
- Estado: replanteado para siguiente etapa de diseño y ejecución
- Alcance: separación entre experiencia de ensambles y catálogo de productos

## 1. Cambio de dirección

Este documento reemplaza la idea anterior de comunicar el catálogo por “fases” dentro de la experiencia visual.

Decisión tomada:
- “Fase 1” y “Fase 2” se mantienen solo como roadmap interno.
- La UI pública no debe presentar tarjetas, bloques o narrativa centrada en fases.
- La experiencia comercial principal debe enfocarse en ensambles.
- Componentes y periféricos deben vivir en una página separada de productos.

En otras palabras:
- la página de ensambles vende soluciones completas
- la página de productos organiza inventario navegable
- el roadmap no se vuelve diseño

---

## 2. Objetivo revisado

Diseñar dos superficies públicas distintas, con el mismo lenguaje cyberpunk/contextual del sitio, pero con objetivos diferentes:

### Página 1: Ensambles
Superficie principal para mostrar PCs armadas como producto comercial fuerte.

Debe priorizar:
- claridad del tipo de ensamble
- caso de uso
- especificaciones entendibles
- confianza comercial
- CTA directo a cotización o contacto

### Página 2: Productos
Superficie separada para explorar componentes y periféricos.

Debe priorizar:
- navegación por categoría
- filtros
- lectura rápida de fichas
- SEO por tipo de producto
- escalabilidad hacia backend real

---

## 3. Principio rector de UX/UI

La estética debe seguir siendo cyberpunk, tecnológica y contextual, alineada con el home actual, pero con una diferencia importante:

- el diseño no debe explicar el roadmap del proyecto
- el diseño debe explicar la oferta comercial al usuario

Eso implica evitar:
- bloques tipo “Fase 1 / Fase 2 / SEO Ready” como parte del contenido principal
- tarjetas que parezcan roadmap de implementación
- copy que suene a planificación interna

Y priorizar:
- hero con intención comercial
- bloques de valor por tipo de cliente o uso
- categorías reales del negocio
- contenido escaneable
- CTAs claros

---

## 4. Arquitectura pública recomendada

## 4.1 Superficies públicas

Se recomienda separar la experiencia en dos rutas conceptuales:

### `/ensambles`
Página comercial dedicada a PCs armadas.

### `/productos`
Página catálogo para componentes y periféricos.

## 4.2 Compatibilidad con la estructura actual

Hoy ya existe esta base en routing:
- `/productos`
- `/productos/paquetes`
- `/productos/componentes`
- `/productos/perifericos`
- `/productos/:slug`

Para no romper de inmediato la arquitectura actual, la planeación recomienda:

### Etapa de transición
- reutilizar la carpeta actual de `features/products`
- usar `packages` como base funcional de ensambles
- convertir la experiencia pública en una página separada de ensambles
- mantener `/productos/paquetes` como alias o redirect transicional hacia `/ensambles`

### Dirección objetivo
- exponer `/ensambles` como destino principal de negocio
- dejar `/productos` para el catálogo navegable
- tratar `/productos/paquetes` como compatibilidad temporal, no como destino conceptual final

Esto permite separar la UX sin obligar a rehacer todo de golpe.

## 4.3 Mapa de rutas recomendado

La recomendación ya no debe quedarse en nivel conceptual. La siguiente estructura puede implementarse sobre el feature actual sin rehacer toda la carpeta:

### Público
- `/ensambles`
  - entrada comercial principal
  - reutiliza la base de `features/products/packages`
  - debe cargar un shell propio orientado a venta, no el shell de catálogo general
- `/ensambles/:slug`
  - detalle de ensamble
  - puede reutilizar parte de `product-detail.component` si se adapta al tipo `AssembledPC`
- `/productos`
  - landing de catálogo general enfocada en navegación a componentes y periféricos
- `/productos/componentes`
  - catálogo filtrable de componentes
- `/productos/perifericos`
  - catálogo filtrable de periféricos
- `/productos/:slug`
  - detalle de producto individual no ensamble
- `/productos/paquetes`
  - alias o redirect temporal hacia `/ensambles`

### Regla de ownership por ruta
- `ensambles` vende soluciones completas
- `productos` organiza inventario individual
- `product-detail` no debe seguir siendo el detalle universal por defecto si eso obliga a mezclar lenguaje comercial de ensambles con ficha técnica de producto

## 4.4 Mapa de componentes recomendado

Sin romper el árbol actual, la recomendación es esta:

### Reutilizar
- `src/app/features/products/packages/`
  - base transicional para listado principal de ensambles
- `src/app/features/products/product-detail.component.*`
  - base transicional para detalle, solo si se separa view model por tipo
- `src/app/features/products/components/`
  - página de catálogo para componentes
- `src/app/features/products/peripherals/`
  - página de catálogo para periféricos

### Crear o renombrar cuando se implemente
- `src/app/features/assemblies/assemblies.component.*`
  - shell principal de `/ensambles`
- `src/app/features/assemblies/assembly-detail.component.*`
  - detalle específico de ensambles si el detalle actual se vuelve demasiado genérico

### Decisión pragmática
No hace falta crear la carpeta `assemblies` antes de validar el layout. Pero la planeación ya debe asumir que el destino estable no vive conceptualmente dentro de `productos/paquetes`.

## 4.5 Orden de implementación de rutas

### Paso 1
- crear `/ensambles`
- conectar esa ruta con la base actual de `packages`

### Paso 2
- convertir `/productos/paquetes` en redirect o alias limpio

### Paso 3
- limpiar `/productos` para que sea solo hub de catálogo o entrada directa a componentes/periféricos

### Paso 4
- decidir si el detalle de ensamble vive en `/ensambles/:slug` con componente propio o con una adaptación fuerte del detalle actual

## 4.6 Plan técnico de implementación

Este bloque traduce la arquitectura recomendada a cambios concretos sobre el repositorio actual.

### `src/app/app.routes.ts`
- agregar la ruta pública `/ensambles`
- agregar la ruta pública `/ensambles/:slug`
- convertir `/productos/paquetes` en redirect a `/ensambles`
- mantener `/productos/:slug` solo para catálogo individual

### `src/app/features/assemblies/assemblies.component.*`
- crear un shell ligero para la página principal de ensambles
- concentrar hero, propuesta de valor y módulos de confianza
- delegar el grid y filtros a la base actual de `packages`

### `src/app/features/products/packages/*`
- conservar la lógica de listado y filtros
- eliminar lenguaje de roadmap o “Fase 1”
- actualizar CTAs para que enlacen a `/ensambles/:slug`

### `src/app/features/products/products.component.*`
- dejar de tratar ensambles como segmento principal del catálogo
- remover highlights con “Fase 1 / Fase 2 / SEO Ready`
- convertir la página en hub limpio hacia componentes y periféricos, con CTA secundario a ensambles

### `src/app/features/products/product-detail.component.*`
- permitir navegación correcta cuando el producto es un ensamble
- evitar breadcrumbs inconsistentes que sigan apuntando a `/productos/paquetes`
- mantener compatibilidad con componentes y periféricos sin duplicar detalle todavía

### `src/app/features/products/services/products.service.ts`
- centralizar links por categoría
- hacer que `ProductCategory.ASSEMBLED` apunte a `/ensambles`
- dejar una función utilitaria para construir links a detalle por tipo

---

## 5. Qué debe comunicar cada página

## 5.1 Página de ensambles

La página de ensambles no debe sentirse como “una sección del catálogo general”.
Debe sentirse como una vitrina comercial enfocada en soluciones completas.

### Mensaje principal
- qué tipo de PC puede comprar el usuario
- para qué le sirve
- qué rendimiento puede esperar
- qué incluye
- cómo pedirla o cotizarla

### Contenido correcto para esta página
- hero editorial/comercial
- categorías por uso o perfil
- grid de ensambles destacados
- highlights técnicos resumidos
- bloques de confianza
- comparación ligera entre opciones
- CTA a detalle y cotización

### Contenido que no debe dominar esta página
- filtros complejos de inventario
- navegación de componentes individuales
- discurso de roadmap
- copy tipo “primero esto, después aquello”

## 5.2 Página de productos

La página de productos sí debe sentirse como catálogo.

### Mensaje principal
- aquí puedes explorar hardware y periféricos por categoría
- aquí importa encontrar, filtrar y comparar

### Contenido correcto para esta página
- navegación por componentes y periféricos
- filtros y orden
- grid de productos
- metadata y texto SEO por categoría
- breadcrumbs y rutas limpias

### Contenido que no debe dominar esta página
- narrativa hero excesiva
- protagonismo de ensambles
- bloques visuales de roadmap

---

## 6. UX de la página de ensambles

## 6.1 Objetivo UX

En pocos segundos el usuario debe entender:
- qué ensamble le conviene
- para qué uso está pensado
- qué tan potente es
- qué componentes clave incluye
- cómo iniciar contacto

## 6.2 Estructura visual recomendada

### 1. Hero principal
Debe abrir con una propuesta clara y aspiracional.

Contenido recomendado:
- headline fuerte
- subtítulo corto orientado a valor
- CTA principal a ver ensambles
- CTA secundario a cotizar por WhatsApp o contacto
- fondo o composición visual con estética cyberpunk sobria

### 2. Segmentación por intención de compra
No por fases. Sí por contexto de uso.

Ejemplos:
- Gaming competitivo
- Streaming y creación
- Workstation ligera
- Setup equilibrado calidad/precio

### 3. Grid de ensambles
Cada tarjeta debe mostrar:
- imagen principal
- nombre del ensamble
- categoría o perfil de uso
- tier de rendimiento
- 4 a 6 highlights técnicos
- precio o precio desde
- CTA a detalle
- CTA secundario a cotización

### 4. Bloque de confianza
Módulos breves para reforzar conversión:
- armado profesional
- garantía
- soporte
- componentes seleccionados

### 5. Comparación ligera
Ideal para comparar 2 o 3 ensambles sin entrar al detalle profundo.

### 6. FAQ y cierre comercial
Para responder dudas frecuentes y rematar con CTA final.

## 6.3 Detalle de ensamble

El detalle debe incluir:
- hero o galería
- resumen comercial
- tabla o lista de componentes
- uso recomendado
- nivel de rendimiento esperado
- opciones de personalización si aplican
- periféricos sugeridos
- CTA fijo en desktop y sticky en mobile

## 6.4 Guía de estilo visual

Mantener:
- tonos oscuros con acentos neón
- sensación tecnológica y premium
- bloques con profundidad visual
- microcopys breves y directos

Evitar:
- convertir la página en panel administrativo
- exceso de cajas informativas iguales entre sí
- secciones que parezcan dashboard interno

## 6.5 Brief visual de ensambles

Este brief visual sirve como guía de diseño antes de tocar componentes reales.

### Personalidad
- cyberpunk sobrio
- técnico pero comercial
- premium sin verse recargado
- más showroom de hardware que dashboard futurista

### Sensación buscada
- precisión
- potencia
- confianza
- personalización controlada

### Composición general
- hero amplio con una pieza visual dominante del ensamble
- bloques horizontales con buen aire entre secciones
- ritmo visual de oscuro profundo + acentos neón + superficies translúcidas o satinadas
- contenido con jerarquía clara: primero valor, luego especificaciones, después confianza y CTA

### Dirección de color
- base: azul petróleo, negro grafito, carbón frío
- acentos: cyan eléctrico y magenta medido
- apoyo: blanco frío y grises azulados

### Regla importante de color
El acento neón debe remarcar interacciones, chips, bordes y llamados clave. No debe bañar toda la interfaz ni convertirla en una composición saturada.

### Tipografía y tono
- titulares con presencia y corte tecnológico
- subtítulos compactos
- cuerpo legible y limpio
- microcopy directo, sin lenguaje corporativo inflado

### Lenguaje de componentes
- cards de ensambles más anchas y editoriales que las cards de catálogo
- chips de uso y tier claramente visibles
- bloques de especificaciones resumidos, no tablas agresivas desde el primer scroll
- CTAs sólidos, con más peso visual en cotización que en exploración secundaria

### Hero
Debe sentirse como vitrina principal de una línea de ensambles.

Debe incluir:
- headline con promesa clara
- un subheadline corto
- dos CTAs máximos
- una visual dominante del ensamble
- indicadores o etiquetas de contexto, no métricas decorativas

### Grid de ensambles
Debe sentirse premium y fácil de escanear.

Cada card debe priorizar:
- nombre
- perfil de uso
- highlights clave
- precio desde
- CTA principal

No debe parecer:
- card genérica de ecommerce barato
- tarjeta de roadmap
- ficha técnica comprimida en exceso

### Bloques de confianza
Visualmente deben ser limpios y cortos.

Ejemplos:
- armado profesional
- garantía real
- selección de componentes
- soporte y asesoría

### Mobile
- hero más corto y más claro
- CTAs visibles sin depender de hover
- cards apiladas con highlights mínimos realmente útiles
- sticky CTA en detalle

### Antipatrones a evitar
- demasiados marcos brillantes al mismo tiempo
- secciones con cajas idénticas una debajo de otra
- exceso de texto aspiracional sin datos concretos
- estética gamer genérica con ruido visual innecesario

## 6.6 Wireframe textual de `/ensambles`

Este wireframe no define diseño visual final. Define estructura y jerarquía de contenido para implementar la primera versión.

### Desktop

#### Sección 1. Hero
- eyebrow: `PC Gamer CDMX Builds`
- headline: propuesta comercial clara sobre ensambles listos para gaming, streaming y trabajo creativo
- supporting copy: 2 o 3 líneas máximas
- CTA principal: `Explorar ensambles`
- CTA secundario: `Cotizar mi setup`
- lateral o bloque secundario: 3 razones de confianza
- visual dominante: render o foto principal de un ensamble

#### Sección 2. Beneficios rápidos
- 3 o 4 cards cortas
- temas sugeridos:
  - armado profesional
  - compatibilidad validada
  - soporte y asesoría
  - configuración personalizable

#### Sección 3. Filtros y grid
- barra de búsqueda
- select de uso principal
- select de tier
- grid de ensambles

#### Sección 4. Comparación ligera o bloque de elección
- módulo comparativo corto entre perfiles de compra
- objetivo: ayudar a elegir sin volver la página una tabla técnica masiva

#### Sección 5. CTA de cierre
- copy corto
- botón de cotización
- acceso a contacto o WhatsApp

### Mobile

#### Orden recomendado
1. headline
2. CTAs
3. visual principal
4. beneficios rápidos
5. filtros
6. cards
7. cierre comercial

#### Reglas mobile
- hero más corto que en desktop
- beneficios en scroll vertical
- filtros visibles sin saturar el primer viewport
- CTAs de alto contraste
- evitar más de dos bloques visuales complejos antes del grid

---

## 7. UX de la página de productos

## 7.1 Objetivo UX

Permitir que el usuario encuentre hardware y periféricos rápido, sin contaminar la experiencia comercial de ensambles.

## 7.2 Estructura recomendada

### Navegación principal
- componentes
- periféricos

### Componentes
Subsegmentos sugeridos:
- CPU
- GPU
- RAM
- almacenamiento
- motherboard
- PSU
- cooling
- gabinetes

### Periféricos
Subsegmentos sugeridos:
- teclados
- mouse
- monitores
- headsets
- mousepads

## 7.3 Filtros recomendados

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

### Filtros por periféricos
- tipo de conexión
- tamaño
- refresh rate
- layout
- RGB
- wireless

## 7.4 SEO en productos

La página de productos debe ser la superficie principal para crecimiento SEO por categoría.

URLs deseables:
- `/productos`
- `/productos/componentes`
- `/productos/perifericos`

Evolución posterior posible:
- `/productos/componentes/gpu`
- `/productos/perifericos/monitores`

---

## 8. Estado actual del proyecto y cómo aprovecharlo

## 8.1 Lo que ya existe y conviene reutilizar
- Rutas públicas ya definidas en la arquitectura Angular.
- Base de modelos compartidos en `src/app/shared/models/`.
- Servicio público de productos ya iniciado en `src/app/features/products/services/products.service.ts`.
- Detalle de producto funcional en `src/app/features/products/product-detail.component.ts`.
- Base administrativa para productos, paquetes y ensambles.

## 8.2 Lo que hoy está incompleto
- `products.component.ts` sigue como shell incompleto.
- `products.component.html` sigue sin resolver la UX real.
- `products-overview`, `packages`, `components` y `peripherals` siguen muy verdes.
- la UI pública todavía no refleja la separación correcta entre ensambles y catálogo.

## 8.3 Lectura correcta del problema actual

El problema principal ya no es “cómo meter todo en una sola página de productos”.

El problema correcto es:
- cómo construir una página de ensambles con enfoque comercial
- cómo dejar aparte una página de productos orientada a exploración
- cómo reutilizar la arquitectura existente sin mezclar ambos objetivos

---

## 9. Modelo de contenido recomendado

## 9.1 Fuente de verdad

Se mantiene la recomendación de usar `shared/models` como base de contratos y no seguir expandiendo modelos paralelos.

## 9.2 Ensambles como entidad principal de la página comercial

Para la UI pública de ensambles, los campos mínimos siguen siendo:
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

## 9.3 Productos como catálogo separado

Para la página de productos, mantener la división entre:
- `ComponentProduct`
- `PeripheralProduct`
- `AccessoryProduct` como reserva futura si realmente se necesita

## 9.4 View model sugerido para cards públicas

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

Esto sigue siendo útil, pero con una regla nueva:
- el card de ensamble puede compartir base técnica
- la narrativa visual de ensambles no debe verse igual a la tarjeta utilitaria del catálogo general

---

## 10. SEO recomendado

## 10.1 Ensambles

La página de ensambles debe posicionarse más por intención comercial que por taxonomía profunda.

Necesita:
- H1 claro
- copy introductorio real
- metadata propia
- enlaces internos a detalles de ensamble
- schema `Product` en detalles

## 10.2 Productos

La página de productos debe cargar el peso SEO de categorías y navegación indexable.

Necesita:
- metadata por categoría
- breadcrumbs
- canonical tags
- contenido introductorio por categoría
- posibilidad de evolucionar a slugs por subcategoría

---

## 11. Propuesta de implementación por etapas

Las etapas siguientes son internas. No deben convertirse en contenido visible de la UI.

## Etapa A: Separación conceptual
- redefinir `products_planning.md` alrededor de dos superficies públicas
- fijar que ensambles no comparte narrativa visual con roadmap
- tratar `/ensambles` como destino comercial principal

## Etapa B: Shell y rutas
- crear la ruta pública `/ensambles` como entrada principal de la experiencia comercial
- reutilizar `packages` como base del feature
- dejar `/productos/paquetes` como alias o redirect transicional
- dejar `/productos` dedicado a componentes y periféricos

## Etapa C: Página de ensambles
- construir el shell visual comercial
- renderizar grid real de ensambles
- reforzar CTAs de cotización
- adaptar el detalle para venta y comparación

## Etapa D: Página de productos
- construir navegación de catálogo
- implementar filtros y orden
- separar componentes de periféricos con claridad
- dejar SEO preparado por categoría

## Etapa E: Backend readiness
- consolidar contratos
- alinear servicios públicos y admin
- preparar payloads para Node.js + MongoDB
- estabilizar slugs, índices y query params

---

## 12. Decisiones prácticas para el siguiente paso

## 12.1 Lo que sí debe hacerse
- diseñar y construir primero la experiencia de ensambles
- tratar productos como una página separada, no como extensión visual del mismo layout
- mantener consistencia estética con el home
- usar el roadmap solo como guía interna de implementación

## 12.2 Lo que no debe repetirse
- usar tarjetas con “Fase 1 / Fase 2” como recurso central de diseño
- mezclar ensambles, componentes y periféricos en la misma narrativa principal
- hacer que la página de ensambles se comporte como catálogo técnico completo

---

## 13. Conclusión ejecutiva

La dirección correcta ya no es una sola página de productos explicada por etapas.

La dirección correcta es:
- una página de ensambles con enfoque comercial y visual contextual
- una página de productos separada para componentes y periféricos
- una arquitectura que reutilice lo que ya existe sin mezclar objetivos

El lenguaje visual cyberpunk se conserva.
Lo que cambia es la lógica de producto y de navegación:
- ensambles vende soluciones
- productos organiza inventario
- las fases quedan fuera del diseño público
