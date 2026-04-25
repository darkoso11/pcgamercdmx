/**
 * PRODUCT API SYNC MODEL
 * Interface for synchronizing product data with external providers
 * Supports automatic updates from suppliers
 */

/**
 * Provider Integration Status
 * Tracks the status of a provider connection
 */
export enum ProviderIntegrationStatus {
  ACTIVE = 'active',              // Sincronización activa
  PAUSED = 'paused',              // Pausada (temporal)
  ERROR = 'error',                // Error en sincronización
  DISABLED = 'disabled',          // Deshabilitada
  TESTING = 'testing'             // Modo prueba
}

/**
 * Sync Frequency Enum
 * How often to sync data with the provider
 */
export enum SyncFrequency {
  EVERY_15_MINUTES = 15,
  EVERY_30_MINUTES = 30,
  EVERY_HOUR = 60,
  EVERY_4_HOURS = 240,
  EVERY_12_HOURS = 720,
  DAILY = 1440,
  WEEKLY = 10080
}

/**
 * Sync Status Enum
 * Status of a sync operation
 */
export enum SyncStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  SUCCESS = 'success',
  FAILED = 'failed',
  PARTIAL = 'partial'             // Algunos productos sincronizados, otros fallaron
}

/**
 * Field Mapping
 * Maps fields between local product and provider API
 */
export interface FieldMapping {
  localField: string;              // Campo en nuestra BD
  externalField: string;           // Campo en API del proveedor
  transformer?: string;            // Función para transformar datos
  required: boolean;
}

/**
 * Provider Configuration
 * Setup configuration for a provider
 */
export interface ProviderConfiguration {
  providerId: string;              // ID único del proveedor
  providerName: string;            // "Dell", "ASUS", "Corsair", etc.
  apiUrl: string;                  // Base URL del endpoint
  apiKey?: string;                 // Encriptada en BD
  apiSecret?: string;              // Encriptada en BD
  authType: 'API_KEY' | 'OAUTH' | 'BASIC' | 'BEARER';
  
  // Sync Configuration
  syncFrequency: SyncFrequency;     // En minutos
  status: ProviderIntegrationStatus;
  enabled: boolean;
  
  // Field Mappings
  fieldMappings: {
    price?: FieldMapping;
    stock?: FieldMapping;
    description?: FieldMapping;
    image?: FieldMapping;
    specifications?: FieldMapping;
    [key: string]: FieldMapping | undefined;
  };
  
  // Filtering & Pagination
  pageSize?: number;               // Items por página en paginación
  maxRetries?: number;             // Reintentos en caso de error
  
  // Categories & Products
  categoryMappings?: {             // Mapeo de categorías
    [providerCategory: string]: string;  // "NOTEBOOKS" -> "assembled"
  };
  
  productFilter?: {                // Filtro para sincronizar solo algunos productos
    categories?: string[];
    brands?: string[];
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  };
  
  // Sync Metadata
  createdAt: Date;
  updatedAt: Date;
  lastSyncedAt?: Date;
  nextSyncAt?: Date;
  lastErrorAt?: Date;
  lastError?: string;
}

/**
 * Sync Mapping
 * Links a local product to a provider's external product
 */
export interface SyncMapping {
  _id?: string;
  localProductId: string;          // ID del producto en nuestra BD
  externalProductId: string;       // ID en el sistema del proveedor
  providerId: string;              // ID del proveedor
  
  // Metadata
  mappedAt: Date;
  lastSyncedAt: Date;
  syncStatus: SyncStatus;
  lastError?: string;
  
  // Pricing Sync
  localPrice: number;
  externalPrice: number;
  priceLastUpdatedAt?: Date;
  priceChanged: boolean;
  priceDiff: number;               // Diferencia en pesos
  
  // Stock Sync
  localStock: number;
  externalStock: number;
  stockLastUpdatedAt?: Date;
  stockChanged: boolean;
  
  // Configuration
  autoUpdatePrice: boolean;
  autoUpdateStock: boolean;
  priceUpdateThreshold?: number;   // Porcentaje de cambio para actualizar
  stockUpdateThreshold?: number;   // Cantidad para considerar cambio significativo
}

/**
 * Sync Operation
 * Record of a sync operation between systems
 */
export interface SyncOperation {
  _id?: string;
  providerId: string;
  operationId: string;             // ID único de la operación
  type: 'INITIAL' | 'INCREMENTAL' | 'FULL' | 'PRICE_UPDATE' | 'STOCK_UPDATE';
  status: SyncStatus;
  
  // Timing
  startedAt: Date;
  completedAt?: Date;
  duration?: number;               // Milisegundos
  
  // Results
  totalProducts: number;           // Total de productos procesados
  successCount: number;            // Productos sincronizados exitosamente
  failureCount: number;            // Productos que fallaron
  skippedCount: number;            // Productos omitidos
  
  // Errors
  errors?: {
    productId: string;
    error: string;
    externalProductId?: string;
  }[];
  
  // Changes
  created: number;                 // Productos nuevos creados
  updated: number;                 // Productos actualizados
  deleted: number;                 // Productos marcados como descontinuados
  
  // Detailed Logs
  logs?: string[];
}

/**
 * Price History
 * Track price changes from provider
 */
export interface PriceHistory {
  _id?: string;
  productId: string;
  providerId: string;
  price: number;
  timestamp: Date;
  source: string;                  // "PROVIDER_SYNC", "MANUAL"
  reason?: string;
}

/**
 * Stock History
 * Track stock changes from provider
 */
export interface StockHistory {
  _id?: string;
  productId: string;
  providerId: string;
  quantity: number;
  timestamp: Date;
  source: string;                  // "PROVIDER_SYNC", "MANUAL", "SALE"
  reason?: string;
}

/**
 * Provider Webhook
 * For real-time updates from providers
 */
export interface ProviderWebhook {
  _id?: string;
  providerId: string;
  webhookUrl: string;              // URL donde recibimos updates
  webhookSecret?: string;          // Encriptada, para validar requests
  events: string[];                // ["PRICE_UPDATED", "STOCK_CHANGED"]
  active: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
  failureCount?: number;
}

/**
 * Sync Alert
 * Notifications for unusual sync events
 */
export interface SyncAlert {
  _id?: string;
  type: 'PRICE_SPIKE' | 'STOCK_ERROR' | 'SYNC_FAILURE' | 'DISCONTINUED' | 'NEW_PRODUCT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  providerId: string;
  productId?: string;
  message: string;
  details?: {
    [key: string]: any;
  };
  createdAt: Date;
  resolvedAt?: Date;
  resolved: boolean;
  actionTaken?: string;
}

/**
 * Provider Statistics
 * Metrics about provider sync performance
 */
export interface ProviderStatistics {
  providerId: string;
  
  // Sync Performance
  totalSyncOperations: number;
  successfulSyncs: number;
  failedSyncs: number;
  lastSyncDuration?: number;       // ms
  averageSyncDuration?: number;    // ms
  
  // Product Metrics
  totalProductsSynced: number;
  activeProducts: number;
  discontinuedProducts: number;
  
  // Price Metrics
  averagePriceDifference?: number;
  maxPriceIncrease?: number;
  maxPriceDecrease?: number;
  lastPriceUpdateCount?: number;
  
  // Stock Metrics
  outOfStockProducts?: number;
  lowStockAlerts?: number;
  
  // Error Metrics
  totalErrors?: number;
  recentErrors?: string[];
  lastErrorAt?: Date;
  
  // Uptime
  uptimePercentage: number;        // % de tiempo que el provider estuvo disponible
  lastCheckedAt: Date;
}

/**
 * Sync Configuration Report
 * Report of sync configuration and health
 */
export interface SyncConfigurationReport {
  providers: ProviderConfiguration[];
  mappings: {
    total: number;
    active: number;
    failed: number;
  };
  lastReportAt: Date;
  health: {
    status: 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY';
    issues: string[];
  };
  recommendations: string[];
}
