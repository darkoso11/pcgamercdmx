/**
 * PRODUCT MODELS - PC Gamer CDMX
 * Base interfaces and enums for all product types
 * Updated: April 2026
 */

/**
 * Product Category Enumeration
 * Defines the main product types in the system
 */
export enum ProductCategory {
  ASSEMBLED = 'assembled',          // PCs completas armadas
  COMPONENT = 'component',          // CPU, GPU, RAM, etc.
  PERIPHERAL = 'peripheral',        // Teclado, mouse, monitor, headset
  ACCESSORY = 'accessory'           // Cables, RGB, USB Hubs
}

/**
 * Product Subcategory Enumeration
 * More specific classification within each category
 */
export enum ProductSubcategory {
  // Assembled PCs
  PC_GAMING = 'pc-gaming',
  PC_STREAMING = 'pc-streaming',
  PC_EDITING = 'pc-editing',
  PC_WORKSTATION = 'pc-workstation',

  // Components
  CPU = 'cpu',
  GPU = 'gpu',
  RAM = 'ram',
  STORAGE = 'storage',
  MOTHERBOARD = 'motherboard',
  POWER_SUPPLY = 'power-supply',
  COOLING = 'cooling',
  CASE = 'case',

  // Peripherals
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
  MONITOR = 'monitor',
  HEADSET = 'headset',
  MOUSEPAD = 'mousepad',

  // Accessories
  CABLE = 'cable',
  RGB_LIGHTING = 'rgb-lighting',
  USB_HUB = 'usb-hub'
}

/**
 * Product Status Enumeration
 * Defines the publication status of a product
 */
export enum ProductStatus {
  ACTIVE = 'active',                // Visible en catálogo
  DISCONTINUED = 'discontinued',    // Descontinuado (oculto)
  DRAFT = 'draft',                  // Borrador (admin only)
  OUT_OF_STOCK = 'out-of-stock'     // Agotado pero activo
}

/**
 * Performance Tier Enumeration
 * For assembled PCs: level of performance
 */
export enum PerformanceTier {
  ENTRY = 'entry',      // Juegos 1080p @ 60fps
  MID = 'mid',          // Juegos 1440p @ 60fps
  HIGH = 'high',        // Juegos 4K @ 60fps
  ULTRA = 'ultra'       // Juegos 4K @ 144fps+
}

/**
 * Use Case Enumeration
 * For assembled PCs: intended purpose
 */
export enum UseCase {
  GAMING = 'gaming',
  STREAMING = 'streaming',
  EDITING = 'editing',
  WORKSTATION = 'workstation',
  MIXED = 'mixed'
}

/**
 * Brand Logo Reference
 * Used across all product types
 */
export interface BrandLogo {
  name: string;                     // "NVIDIA", "Intel", "AMD", etc.
  logo: string;                     // URL de la imagen
  link?: string;                    // Link a sitio de la marca
}

/**
 * Product Discount
 * Represents a discount applied to a product
 */
export interface ProductDiscount {
  type: 'percentage' | 'fixed';    // Tipo de descuento
  value: number;                    // Valor (porcentaje o cantidad)
  validUntil?: Date;                // Fecha de expiración
  reason?: string;                  // Ej: "Black Friday", "Promo Junio"
}

/**
 * Product Variant
 * For products with different colors, sizes, capacities, etc.
 */
export interface ProductVariant {
  id: string;
  color?: string;
  size?: string;
  storage?: string;                 // Para SSD con diferentes capacidades
  sku: string;                      // Stock Keeping Unit
  price: number;
  discountedPrice?: number;
  image?: string;                   // Imagen específica del variant
  stock: number;
}

/**
 * Provider API Connection
 * For synchronizing product data with external suppliers
 */
export interface ProviderConnection {
  providerId: string;               // ID único del proveedor
  providerName: string;             // "Dell", "ASUS", "LogitechExternal"
  apiUrl: string;                   // URL del endpoint del proveedor
  apiKey?: string;                  // Clave de autenticación (encriptada)
  lastSyncedAt: Date;               // Última sincronización
  syncInterval: number;             // Minutos entre sincronizaciones
  active: boolean;                  // Si está activo
  mappings?: {                       // Mapeo de campos
    externalId: string;             // Campo ID en API del proveedor
    externalPrice: string;          // Campo precio en API
    externalStock: string;          // Campo stock en API
  };
}

/**
 * Base Product Interface
 * Common properties for ALL product types
 * This is the foundation for all specific product types
 */
export interface BaseProduct {
  // Identification
  _id?: string;                     // MongoDB ID (backend)
  id?: number;                      // ID alternativo (frontend)
  title: string;                    // "RTX 4090", "PC Gaming Pro 2024"
  slug: string;                     // URL-friendly: "rtx-4090", "pc-gaming-pro-2024"
  sku?: string;                     // SKU para inventario

  // Classification
  category: ProductCategory;        // Type de producto
  subcategory: string;              // Subcategoría más específica
  status: ProductStatus;            // Estado: activo, descontinuado, borrador

  // Media
  image: string;                    // URL imagen principal
  images?: string[];                // URLs galería de imágenes
  thumbnail?: string;               // URL thumbnail para listados

  // Pricing
  price: number;                    // Precio base en MXN
  discountedPrice?: number;         // Precio con descuento
  discount?: ProductDiscount;       // Información de descuento
  currency: string;                 // "MXN" (solo MXN por ahora)

  // Description
  description: string;              // Descripción breve (máx 200 chars)
  fullDescription?: string;         // Descripción completa (máx 5000 chars)

  // SEO
  metaTitle?: string;               // Meta title (máx 60 chars)
  metaDescription?: string;         // Meta description (máx 155 chars)
  keywords?: string[];              // Tags para búsqueda

  // Inventory
  stock: number;                    // Cantidad disponible
  lowStockThreshold?: number;       // Umbral para alerta de bajo stock (ej: 5)
  status_text?: string;             // "En Stock", "Agotado", "Pre-orden"

  // Display
  featured?: boolean;               // ¿Mostrar en sección destacada?
  position?: number;                // Orden en listados (si featured)

  // Provider Sync
  providerConnection?: ProviderConnection;  // Conexión con proveedor externo
  lastUpdatedFromProvider?: Date;           // Última actualización de proveedor
  externalProductId?: string;               // ID del producto en sistema externo

  // Administrative
  published: boolean;               // ¿Publicado?
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;               // ID del admin que creó
  updatedBy?: string;               // ID del admin que actualizó

  // Additional
  rating?: {
    average: number;                // 0-5
    count: number;                  // Número de reviews
  };
  reviews?: Review[];
}

/**
 * Review Interface
 * For product reviews and ratings
 */
export interface Review {
  id: string;
  author: string;
  rating: number;                   // 1-5
  title: string;
  comment: string;
  verified: boolean;                // ¿Compra verificada?
  date: Date;
  helpful?: number;                 // Número de personas que encontraron útil
}

/**
 * Filter Criteria Interface
 * Used for searching and filtering products
 */
export interface FilterCriteria {
  minPrice?: number;
  maxPrice?: number;
  brands?: string[];
  categories?: ProductCategory[];
  subcategories?: string[];
  status?: ProductStatus[];
  sortBy?: 'price-asc' | 'price-desc' | 'newest' | 'popular' | 'rating' | 'name';
  page?: number;
  limit?: number;
  search?: string;
  featured?: boolean;
}

/**
 * Search Result Interface
 * For full-text search across all product types
 */
export interface SearchResult {
  assembled: any[];        // AssembledPC[]
  components: any[];       // ComponentProduct[]
  peripherals: any[];      // PeripheralProduct[]
  accessories: any[];      // AccessoryProduct[]
}

/**
 * Pagination Info
 * Metadata for paginated responses
 */
export interface PaginationInfo {
  total: number;           // Total de items
  page: number;            // Página actual
  limit: number;           // Items por página
  pages: number;           // Total de páginas
}

/**
 * API Response Interface
 * Standard response format for API calls
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: PaginationInfo;
  timestamp: Date;
}
