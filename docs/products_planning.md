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

## Panel Administrativo de Productos

**CRÍTICO**: Este es un componente fundamental para el negocio. Permite gestionar:
- Crear, editar, eliminar productos
- Crear y editar paquetes de ensamblaje (bundles)
- Agregar ofertas/descuentos
- Gestionar stock
- Subir imágenes y especificaciones
- Publicar/despublicar productos

### Estructura del Admin de Productos

#### Rutas de Admin
```
/admin/products                    // Dashboard principal (estadísticas)
/admin/products/list               // Listado completo con búsqueda/filtros
/admin/products/new                // Crear nuevo producto
/admin/products/:id/edit           // Editar producto existente
/admin/products/packages           // Gestionar paquetes de ensamblaje
/admin/products/packages/new       // Crear nuevo paquete
/admin/products/packages/:id/edit  // Editar paquete
/admin/products/offers             // Gestionar ofertas y descuentos
/admin/products/categories         // Gestionar categorías
```

#### Componentes Críticos

1. **admin-products-dashboard.component.ts**
   - Total de productos activos / publicados
   - Total de paquetes
   - Total de ofertas activas
   - Alertas de bajo stock
   - Últimos 10 productos creados
   - Botones rápidos para crear producto/paquete/oferta

2. **admin-product-list.component.ts**
   - Tabla con listado de productos
   - Búsqueda por título/slug
   - Filtros: categoría, rango de precio, stock
   - Acciones: Ver preview, Editar, Duplicar, Eliminar
   - Paginación (10, 25, 50 por página)
   - Indicadores visuales (publicado ✓, borrador, bajo stock)

3. **admin-product-editor.component.ts** (CREATE/EDIT)
   - Sección 1 - Información básica:
     - Título (max 200 caracteres)
     - Slug (auto-generado, editable)
     - Categoría (dropdown)
     - Descripción larga (editor WYSIWYG)
   - Sección 2 - Especificaciones Técnicas:
     - Procesador
     - Placa base
     - RAM (ej: 16GB DDR4)
     - Almacenamiento (ej: 1TB SSD NVMe)
     - Tarjeta Gráfica
     - Fuente de poder
     - Caja
     - Sistema de refrigeración
   - Sección 3 - Precios y Stock:
     - Precio base
     - Precio con descuento (opcional)
     - Stock disponible
     - Alerta de bajo stock (ej: 5 unidades)
   - Sección 4 - Imágenes:
     - Galería múltiple (arrastrar y soltar)
     - Establecer imagen principal
     - Crop/redimensionar
   - Sección 5 - Certificaciones:
     - URL imagen certificación (ej: 80+ Gold)
     - Watts (ej: 750W)
     - Logos de marcas
   - Sección 6 - SEO:
     - Meta title (max 60 chars)
     - Meta description (max 155 chars)
     - Keywords (tags separados por coma)
   - Sección 7 - Estado:
     - Guardar como borrador / Publicar now
     - Fecha publicación (schedule post)

4. **admin-package-editor.component.ts** (CREATE/EDIT)
   - Información básica: Nombre, descripción, categoría
   - Especificaciones del paquete: Proc, RAM, GPU, Alm, etc.
   - **Selector de componentes**: 
     - Buscar productos individuales por título
     - Agregar al paquete (drag & drop o click)
     - Ver lista de componentes seleccionados
     - Auto-calcular precio total (suma de productos)
   - Aplicar descuento: Si/No, porcentaje o cantidad fija
   - Imagen representativa
   - Stock
   - Publicar/Guardar

5. **admin-offers-manager.component.ts**
   - Tabla con ofertas activas/inactivas
   - Columnas: Nombre, Tipo, Descuento, Válida desde-hasta, Estado
   - **Crear Nueva Oferta**:
     - Nombre (ej: "Black Friday 2024")
     - Descripción
     - Tipo: 
       * Porcentaje (ejem: 20%)
       * Cantidad fija (ejem: $500)
       * Bundle (Compra X lleva Y)
       * Por categoría (todos los periféricos -10%)
     - Seleccionar productos/paquetes/categorías afectadas
     - Fecha inicio y fecha fin
     - Activa/Inactiva
   - Botones: Editar, Duplicar, Eliminar, Activar/Desactivar

6. **admin-categories-manager.component.ts**
   - CRUD de categorías
   - Nombre, slug, descripción
   - Categoría padre (opcional, para anidar)
   - Reordenar con drag & drop
   - Indicador: cuántos productos usan esta categoría

7. **admin-products-header.component.ts**
   - Logo/título "Admin - Productos"
   - Navegación: Dashboard, Productos, Paquetes, Ofertas, Categorías
   - Botón "Volver a admin" o "Volver a inicio"
   - Logout

#### Servicios Necesarios

**products-admin.service.ts** con métodos:

**PRODUCTOS:**
- `getAllProducts(filters?, page?, limit?): Observable<Product[]>`
- `getProductById(id): Observable<Product>`
- `createProduct(product): Observable<Product>`
- `updateProduct(id, product): Observable<Product>`
- `deleteProduct(id): Observable<void>`
- `duplicateProduct(id): Observable<Product>`
- `searchProducts(term, category?): Observable<Product[]>`
- `getProductsByCategory(category): Observable<Product[]>`

**PAQUETES:**
- `getAllPackages(): Observable<Package[]>`
- `getPackageById(id): Observable<Package>`
- `createPackage(package): Observable<Package>`
- `updatePackage(id, package): Observable<Package>`
- `deletePackage(id): Observable<void>`

**OFERTAS:**
- `getAllOffers(includeInactive?): Observable<Offer[]>`
- `createOffer(offer): Observable<Offer>`
- `updateOffer(id, offer): Observable<Offer>`
- `deleteOffer(id): Observable<void>`
- `activateOffer(id): Observable<void>`
- `deactivateOffer(id): Observable<void>`
- `getActiveOffers(): Observable<Offer[]>`

**CATEGORÍAS:**
- `getAllCategories(): Observable<Category[]>`
- `createCategory(category): Observable<Category>`
- `updateCategory(id, category): Observable<Category>`
- `deleteCategory(id): Observable<void>`
- `reorderCategories(newOrder[]): Observable<void>`

**IMÁGENES:**
- `uploadProductImage(file: File): Observable<string>`
- `deleteProductImage(imageUrl: string): Observable<void>`
- `optimizeImage(file: File, width, height): Observable<Blob>`

#### Modelos de Datos

```typescript
interface Product {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  category: 'paquetes' | 'perifericos' | 'componentes';
  price: number;
  discountedPrice?: number;
  processor?: string;
  motherboard?: string;
  ram?: string;
  storage?: string;
  graphicsCard?: string;
  powerSupply?: string;
  caseModel?: string;
  cooling?: string;
  image: string;
  images: string[];
  powerCertificate?: string;
  watts?: number;
  brandLogos: Array<{ src: string; alt: string }>;
  stock: number;
  lowStockAlert: number;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Package {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  price: number;
  discountedPrice?: number;
  specifications: {
    processor: string;
    motherboard: string;
    ram: string;
    storage: string;
    graphicsCard: string;
    powerSupply: string;
    caseModel: string;
    cooling: string;
  };
  includedProducts: string[]; // Product._id array
  stock: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Offer {
  _id?: string;
  title: string;
  description: string;
  type: 'percentage' | 'fixed' | 'bundle' | 'category';
  discountValue: number;
  applicableTo: {
    products?: string[];      // Product IDs
    packages?: string[];      // Package IDs
    categories?: string[];    // Category names
  };
  startDate: Date;
  endDate: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentCategory?: string;
  order: number;
}
```

#### Validaciones Críticas

- **Slug único**: No puede haber dos productos con mismo slug
- **Precio válido**: > 0
- **Stock no negativo**: >= 0
- **Imagen requerida**: Al menos 1
- **Título**: 5-200 caracteres
- **Descripción**: Máximo 5000 caracteres
- **Meta title**: Máximo 60 caracteres
- **Meta description**: Máximo 155 caracteres
- **Paquete requiere componentes**: Al menos 1 componente incluido
- **Oferta requiere targets**: Al menos 1 producto/paquete/categoría

#### Flujo de Trabajo Admin

1. **Admin accede a `/admin/products`**
   - Ve dashboard con estadísticas principales
   - Acceso rápido a crear producto/paquete/oferta

2. **Para crear un producto nuevo**:
   - Click en "Crear Producto"
   - Rellenar formulario con todos los datos
   - Subir imágenes
   - Establecer SEO meta tags
   - Guardar como borrador
   - Ver preview en `/productos/:slug`
   - Publicar cuando esté listo

3. **Para crear un paquete**:
   - Click en "Crear Paquete"
   - Ingresar nombre y descripción
   - Ingresar especificaciones técnicas
   - **Seleccionar componentes individuales** del catálogo
   - Sistema auto-calcula precio total (suma de productos)
   - Opcionalmente aplicar descuento porcentual
   - Guardar y publicar

4. **Para agregar una oferta**:
   - Click en "Crear Oferta"
   - Elegir tipo (%, cantidad fija, bundle, categoría)
   - Seleccionar productos/paquetes/categorías afectadas
   - Establecer fechas de inicio y fin
   - Activar/desactivar según sea necesario

5. **Gestión de stock**:
   - Dashboard muestra productos con bajo stock (en rojo)
   - Admin puede actualizar stock rápidamente
   - Sistema calcula alertas automáticamente

#### Integración Frontend-Backend

- **ProductsService** (público) obtiene productos del backend para `/productos`
- **ProductsAdminService** (admin) tiene permisos especiales para CRUD
- **Autenticación**: Mismo sistema que blog admin (token JWT)
- **Autorización**: Solo admins pueden acceder a `/admin/products`
- **Validación en cliente**: Prevent bad data before sending
- **Validación en servidor**: Enforce business rules

#### Consideraciones de UX/UI

- **Formularios responsive**: Funcionan bien en mobile y desktop
- **Confirmaciones**: Pedir confirmación antes de eliminar
- **Feedback visual**: Toast notifications para acciones exitosas/errores
- **Auto-save**: Guardar borradores automáticamente cada 30 segundos
- **Validación en tiempo real**: Mostrar errores mientras se escribe
- **Atajos teclado**: Ctrl+S para guardar, Escape para cancelar
- **Historial de cambios**: Mostrar quién cambió qué y cuándo

## Próximos Pasos Inmediatos

**COMPLETADO**:
- ✅ Revisar estructura actual de componentes de productos
- ✅ Implementar rutas básicas y navegación
- ✅ Crear componentes básicos (ProductsOverview, Packages, Peripherals, Components)
- ✅ Actualizar home.component.html con nuevos routerLinks
- ✅ Verificar que "Ver detalles" en slider desvíe a `/productos/:slug`
- ✅ Agregar ruta dinámica `:slug` en app.routes.ts
- ✅ Implementar ProductDetailComponent (HTML + CSS completo)
- ✅ Crear ProductsService con mock data

**FASE 1 - FRONTEND PÚBLICO (PRIORIDAD ALTA)**:
1. ProductsOverviewComponent (búsqueda, filtros, grid)
2. Componentes de categoría (templates)
3. Meta tags dinámicos para SEO en ProductDetailComponent

**FASE 2 - ADMIN DE PRODUCTOS (PRIORIDAD CRÍTICA)**:
1. **products-admin.service.ts** - Base para todo lo demás
2. **admin-products-dashboard.component.ts** - Punto de entrada admin
3. **admin-product-list.component.ts** - Ver/buscar todos los productos
4. **admin-product-editor.component.ts** - Crear/editar productos individuales
5. **admin-package-editor.component.ts** - Crear/editar paquetes de ensamblaje
6. **admin-offers-manager.component.ts** - Gestionar ofertas y descuentos
7. **admin-categories-manager.component.ts** - Gestionar categorías
8. **admin-products-header.component.ts** - Navegación del admin
9. **Proteger rutas admin** con AuthGuard

**Orden recomendado de implementación**:
1. products-admin.service.ts (depende de ella todo lo demás)
2. admin-products-dashboard.component.ts (punto entrada)
3. admin-product-list.component.ts (ver productos)
4. admin-product-editor.component.ts (create/update)
5. admin-package-editor.component.ts (crear paquetes)
6. admin-offers-manager.component.ts (gestionar ofertas)
7. admin-categories-manager.component.ts (gestionar categorías)
8. Actualizar rutas en app.routes.ts

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