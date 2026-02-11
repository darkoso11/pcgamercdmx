# Plan de Trabajo: Sección de Productos - PC Gamer CDMX

## Fecha de Creación
14 de enero de 2026

## Objetivo General
Desarrollar una sección de productos completa y optimizada que permita mostrar, filtrar y navegar entre los diferentes tipos de productos ofrecidos por PC Gamer CDMX, priorizando la experiencia del usuario (UX/UI) y el posicionamiento en motores de búsqueda (SEO).

## Tipos de Productos

### 1. Productos Clave (Ensamblaje y Paquetes)
Estos son los productos principales de la página web:
- **Ensamblajes de PC**: PCs completas ensambladas por el equipo técnico
- **Paquetes de Componentes**: Kits de componentes para ensamblaje DIY
- **Componentes Individuales**: Partes específicas (CPU, GPU, RAM, etc.) vendidas por separado

### 2. Periféricos y Accesorios
Productos complementarios al mundo del PC gaming:
- **Periféricos**: Teclados, ratones, monitores, auriculares, etc.
- **Accesorios**: Cables, refrigeración, iluminación RGB, etc.
- **Componentes por Separado**: Mismos que arriba, pero enfocados en venta individual

## Modelo de Negocio: Catálogo de Productos

**IMPORTANTE**: Este es un **CATÁLOGO DE PRODUCTOS**, NO un carrito de compras en línea.

### Flujo de Compra
- Los usuarios **EXPLORAN** los productos en el catálogo
- Pueden ver **DETALLES COMPLETOS** de cada producto
- Para **COMPRAR**, deben:
  - **Contactar al equipo de ventas** vía WhatsApp
  - **Solicitar un presupuesto** personalizado
  - **Hablar con un asesor** de ventas
  - **Visitar la tienda física** en CDMX

### CTAs Apropiados en Páginas de Producto
- ✅ "Solicitar Presupuesto" → Formulario de contacto
- ✅ "Contactar Asesor" → WhatsApp/Teléfono
- ✅ "Ver en Detalle" → Página individual del producto
- ❌ "Agregar al Carrito"
- ❌ "Comprar Ahora"

## Análisis de Secciones en Home

### SECCIÓN 2: SLIDER DE PRODUCTOS/PAQUETES
- **Ubicación**: Después del hero section
- **Contenido**: Slider horizontal con paquetes de componentes
- **Funcionalidad**: Búsqueda integrada (`searchTerm`), filtrado dinámico
- **Componente**: `app-products-slider`
- **Botón principal**: "Ver detalles" → `/productos/:slug` (Página de detalles del producto)
- **Botón CTA**: "Ver todos los paquetes" → `/productos/paquetes`

### SECCIÓN 4: SLIDER DE PERIFÉRICOS
- **Ubicación**: Después de Custom Case
- **Contenido**: Slider de periféricos gaming
- **Funcionalidad**: Categorías y filtros
- **Componente**: `app-peripherals-slider`
- **Enlace**: `routerLink="/productos/perifericos"`

## Página de Detalles del Producto

### Ruta
- **Path**: `/productos/:slug`
- **Componente**: `product-detail.component.ts` (ya existe)
- **Dinámica**: Mostrar un producto específico con toda la información

### Contenido de la Página
1. **Galería de imágenes** del producto
2. **Información técnica**:
   - Procesador/GPU
   - RAM
   - Almacenamiento
   - Fuente de poder
   - etc.
3. **Especificaciones detalladas**
4. **Precio** (referencia, puede variar según configuración)
5. **Logos de marcas** utilizadas
6. **Certificaciones** (80+ Gold, etc.)

### CTAs en Página de Detalles
1. **"Solicitar Presupuesto"** (prominent) → Formulario de contacto con producto preseleccionado
2. **"Contactar por WhatsApp"** → Link a conversación directa
3. **"Hablar con un Asesor"** → Modal de contacto
4. **"Ver Productos Similares"** → Carrusel con productos relacionados

### Navegación
- Breadcrumb: Inicio > Productos > [Categoría] > [Producto]
- Botón "Volver" a la categoría anterior
- Links relacionados a otros productos

## Decisión Arquitectural: Una Página vs. Múltiples Páginas

### Pregunta Clave
¿Deberíamos tener una sola página de productos con categorías (usando `routerLink` para navegar entre ellas) o páginas separadas para cada tipo de producto por cuestiones de SEO y UX/UI?

### Análisis Comparativo

#### Opción 1: Una Página Principal con Categorías
**Ventajas:**
- **UX/UI Mejorada**: Navegación fluida con filtros y búsqueda en una sola vista
- **SEO Optimizado**: Una URL principal fuerte (/productos) con meta tags y contenido rico
- **Mantenimiento**: Menos componentes y rutas a mantener
- **Performance**: Carga inicial más eficiente con lazy loading de categorías

**Desventajas:**
- **SEO por Categoría**: Menos específico si no se optimizan URLs con query params
- **Navegación**: Puede sentirse abrumador si hay muchos productos

#### Opción 2: Páginas Separadas por Categoría
**Ventajas:**
- **SEO Específico**: Cada categoría tiene su propia URL (/productos/paquetes, /productos/perifericos)
- **UX Clara**: Navegación más intuitiva para usuarios que buscan algo específico
- **Contenido Enfocado**: Mejor organización de contenido por página

**Desventajas:**
- **UX Fragmentada**: Navegación entre categorías requiere recarga de página
- **Mantenimiento**: Más componentes y rutas a gestionar
- **SEO Diluido**: Autoridad de enlace distribuida entre múltiples URLs

### Decisión Recomendada: Arquitectura Híbrida

**Implementar una página principal de productos (/productos) con:**
- **Categorías principales** como secciones dentro de la página
- **URLs específicas** para categorías usando rutas anidadas (/productos/paquetes, /productos/perifericos)
- **Filtros y búsqueda** integrados en la página principal
- **Componentes separados** para cada tipo de slider (ya existentes)

**Justificación:**
- **SEO**: URLs específicas permiten indexación por categoría sin diluir autoridad
- **UX/UI**: Una página principal con navegación interna es más fluida
- **Escalabilidad**: Fácil agregar nuevas categorías sin crear nuevas páginas
- **Performance**: Lazy loading de componentes por categoría

## Plan de Implementación

### Fase 1: Estructura de Rutas y Componentes
1. **Crear módulo de productos** (`products.module.ts`)
2. **Definir rutas anidadas**:
   - `/productos` → Página principal con todas las categorías
   - `/productos/paquetes` → Foco en paquetes y ensamblajes
   - `/productos/perifericos` → Foco en periféricos
   - `/productos/componentes` → Componentes individuales
   - `/productos/:slug` → **DETALLE INDIVIDUAL** del producto (nueva)
3. **Componente principal**: `products.component.ts`
4. **Sub-componentes**: 
   - `products-overview.component.ts` (ya creado)
   - `packages.component.ts` (ya creado)
   - `peripherals.component.ts` (ya creado)
   - `components.component.ts` (ya creado)
   - `product-detail.component.ts` (ACTUALIZAR para usar datos dinámicos)

### Fase 2: Página Principal de Productos
1. **Layout**: Grid responsive con secciones por categoría
2. **Filtros globales**: Barra de búsqueda y filtros transversales
3. **Sliders integrados**: Reutilizar `app-products-slider` y `app-peripherals-slider`
4. **Navegación interna**: Botones/tabs para cambiar entre categorías

### Fase 2.5: Página de Detalles Individual del Producto (NUEVA)
1. **ActivatedRoute**: Capturar el slug de la URL (`/productos/:slug`)
2. **ProductsService**: Obtener datos del producto específico basado en slug
3. **Layout de Detalles**:
   - **Lado izquierdo**: Galería de imágenes principales
   - **Lado derecho**: 
     - Nombre del producto
     - Especificaciones técnicas (tabla o lista)
     - Logos de marcas utilizadas
     - Certificaciones de potencia
     - Precio (referencia)
4. **CTAs principales**:
   - "Solicitar Presupuesto" → `routerLink="/contacto"` con product data
   - "Contactar por WhatsApp" → Link a WhatsApp API
   - "Hablar con un Asesor" → Modal o contacto
5. **Productos relacionados**: Carrusel con otros productos similares
6. **Breadcrumb**: Navegación jerárquica
7. **Meta tags dinámicos**: Para SEO (título, descripción, imagen)

### Fase 3: Optimización SEO
1. **Meta tags dinámicos** por categoría
2. **Structured data** para productos (JSON-LD)
3. **URLs amigables** con slugs descriptivos
4. **Sitemap** actualizado con nuevas rutas

### Fase 4: Optimización UX/UI
1. **Loading states** para transiciones entre categorías
2. **Infinite scroll** o paginación para listas largas
3. **Filtros avanzados**: Precio, marca, especificaciones técnicas
4. **Vista de comparación** de productos

### Fase 5: Integración con Home
1. **Actualizar routerLinks** en home.component.html:
   - Sección 2: `routerLink="/productos/paquetes"`
   - Sección 4: `routerLink="/productos/perifericos"`
2. **Mantener funcionalidad** de sliders en home (no redirigir completamente)

## Consideraciones Técnicas

### Angular Routing
```typescript
const routes: Routes = [
  {
    path: 'productos',
    component: ProductsComponent,
    children: [
      { path: '', component: ProductsOverviewComponent },
      { path: 'paquetes', component: PackagesComponent },
      { path: 'perifericos', component: PeripheralsComponent },
      { path: 'componentes', component: ComponentsComponent },
      { path: ':slug', component: ProductDetailComponent } // Página individual del producto
    ]
  }
];
```

**Orden importante**: La ruta `:slug` debe ser la ÚLTIMA para evitar conflictos de routing.

### Estado y Gestión de Datos
- **Servicio de productos**: `products.service.ts` para API calls
- **State management**: NgRx o servicios simples para filtros y búsqueda
- **Cache**: Implementar caching para mejorar performance

### Responsive Design
- **Mobile-first**: Priorizar experiencia móvil
- **Grid adaptable**: Cambiar layout según dispositivo
- **Touch gestures**: Para sliders en móviles

## Próximos Pasos Inmediatos

**COMPLETADO**:
- ✅ Revisar estructura actual de componentes de productos
- ✅ Implementar rutas básicas y navegación
- ✅ Crear componentes básicos (ProductsOverview, Packages, Peripherals, Components)
- ✅ Actualizar home.component.html con nuevos routerLinks
- ✅ Verificar que "Ver detalles" en slider desvíe a `/productos/:slug`
- ✅ Agregar ruta dinámica `:slug` en app.routes.ts

**PENDIENTE**:
1. **Implementar ProductDetailComponent**:
   - Capturar slug de ruta con ActivatedRoute
   - Obtener datos del producto del servicio
   - Mostrar galería de imágenes
   - Mostrar especificaciones técnicas
   - Implementar CTAs (Presupuesto, WhatsApp, Asesor)
   - Agregar productos relacionados
   - Agregar breadcrumb

2. **Crear ProductsService** para gestión de datos

3. **Diseñar ProductsOverviewComponent** con:
   - Búsqueda de productos
   - Filtros por categoría
   - Grid de productos
   - Paginación

4. **Actualizar componentes de categoría** (Packages, Peripherals, Components)

5. **Implementar meta tags dinámicos** en ProductDetailComponent para SEO

## Métricas de Éxito

- **SEO**: Mejora en rankings para keywords de productos
- **UX**: Reducción en bounce rate en sección de productos
- **Conversión**: Aumento en consultas y ventas desde la web
- **Performance**: Tiempo de carga < 3s para página de productos

## Riesgos y Mitigaciones

- **Riesgo**: Complejidad de una sola página → **Mitigación**: Usar lazy loading y componentes modulares
- **Riesgo**: SEO diluido → **Mitigación**: URLs específicas y meta tags por categoría
- **Riesgo**: Mantenimiento → **Mitigación**: Arquitectura modular y documentación clara

---

**Responsable**: Equipo de Desarrollo Frontend  
**Revisión**: Pendiente de aprobación del equipo  
**Fecha de implementación estimada**: 2-3 semanas
</parameter>
</xai:function_call># Plan de Trabajo: Sección de Productos - PC Gamer CDMX