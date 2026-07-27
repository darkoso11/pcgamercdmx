import type { Offer, Product } from './products-admin.service';

export type CatalogDomain = 'products' | 'assemblies';
export type CatalogStatusFilter = 'all' | 'published' | 'draft' | 'low-stock' | 'out-of-stock';
export type OfferStatus = 'scheduled' | 'active' | 'paused' | 'expired';

export interface CatalogMetrics {
  total: number;
  published: number;
  draft: number;
  lowStock: number;
  outOfStock: number;
}

export function calculateOfferPrice(
  basePrice: number,
  offer: Pick<Offer, 'type' | 'discountValue'>
): number {
  const normalizedBasePrice = Math.max(0, Number(basePrice) || 0);
  const normalizedDiscount = Math.max(0, Number(offer.discountValue) || 0);
  const discountedPrice =
    offer.type === 'percentage'
      ? normalizedBasePrice * (1 - Math.min(normalizedDiscount, 100) / 100)
      : offer.type === 'fixed'
        ? normalizedBasePrice - normalizedDiscount
        : normalizedBasePrice;

  return Math.round(Math.max(0, discountedPrice) * 100) / 100;
}

export function getOfferStatus(
  offer: Pick<Offer, 'active' | 'startDate' | 'endDate'>,
  now = new Date()
): OfferStatus {
  if (!offer.active) {
    return 'paused';
  }

  const currentTime = now.getTime();
  if (new Date(offer.startDate).getTime() > currentTime) {
    return 'scheduled';
  }
  if (new Date(offer.endDate).getTime() < currentTime) {
    return 'expired';
  }

  return 'active';
}

export function resolveOfferPresentation(
  basePrice: number,
  offer: Pick<Offer, 'type' | 'discountValue' | 'active' | 'showBadge' | 'startDate' | 'endDate'> | null,
  now = new Date()
): {
  basePrice: number;
  effectivePrice: number;
  hasEffectiveOffer: boolean;
  showOfferBadge: boolean;
} {
  const normalizedBasePrice = Math.round(Math.max(0, Number(basePrice) || 0) * 100) / 100;
  const hasEffectiveOffer = Boolean(offer && getOfferStatus(offer, now) === 'active');

  return {
    basePrice: normalizedBasePrice,
    effectivePrice: hasEffectiveOffer ? calculateOfferPrice(normalizedBasePrice, offer!) : normalizedBasePrice,
    hasEffectiveOffer,
    showOfferBadge: Boolean(hasEffectiveOffer && offer?.showBadge),
  };
}

export function findOfferConflicts(
  candidate: Pick<Offer, '_id' | 'catalogDomain' | 'active' | 'startDate' | 'endDate' | 'applicableTo'>,
  offers: Offer[]
): Offer[] {
  if (!candidate.active) {
    return [];
  }

  const candidateDomain = candidate.catalogDomain ?? getOfferDomain(candidate as Offer);
  const candidateStart = new Date(candidate.startDate).getTime();
  const candidateEnd = new Date(candidate.endDate).getTime();

  return offers.filter((offer) => {
    const offerDomain = offer.catalogDomain ?? getOfferDomain(offer);
    return (
      offer.active &&
      offer._id !== candidate._id &&
      offerDomain === candidateDomain &&
      dateRangesOverlap(candidateStart, candidateEnd, new Date(offer.startDate).getTime(), new Date(offer.endDate).getTime()) &&
      offerTargetsOverlap(candidate.applicableTo, offer.applicableTo)
    );
  });
}

export function isProductInDomain(product: Product, domain: CatalogDomain): boolean {
  return domain === 'assemblies'
    ? product.category === 'paquetes'
    : product.category === 'componentes' || product.category === 'perifericos';
}

export function filterAndSortCatalogItems(
  products: Product[],
  domain: CatalogDomain,
  status: CatalogStatusFilter
): Product[] {
  return products
    .map((product, index) => ({ product, index }))
    .filter(({ product }) => isProductInDomain(product, domain) && matchesStatus(product, status))
    .sort((left, right) => stockRank(left.product) - stockRank(right.product) || left.index - right.index)
    .map(({ product }) => product);
}

export function calculateCatalogMetrics(
  products: Product[],
  domain: CatalogDomain
): CatalogMetrics {
  const scopedProducts = products.filter((product) => isProductInDomain(product, domain));

  return {
    total: scopedProducts.length,
    published: scopedProducts.filter((product) => product.published).length,
    draft: scopedProducts.filter((product) => !product.published).length,
    lowStock: scopedProducts.filter(isLowStock).length,
    outOfStock: scopedProducts.filter((product) => product.stock <= 0).length,
  };
}

export function getOfferDomain(offer: Offer): CatalogDomain | null {
  const hasProducts =
    Boolean(offer.applicableTo.products?.length) ||
    Boolean(offer.applicableTo.categories?.length);
  const hasAssemblies = Boolean(offer.applicableTo.packages?.length);

  if (hasProducts === hasAssemblies) {
    return null;
  }

  return hasAssemblies ? 'assemblies' : 'products';
}

function matchesStatus(product: Product, status: CatalogStatusFilter): boolean {
  switch (status) {
    case 'published':
      return product.published;
    case 'draft':
      return !product.published;
    case 'low-stock':
      return isLowStock(product);
    case 'out-of-stock':
      return product.stock <= 0;
    case 'all':
    default:
      return true;
  }
}

function isLowStock(product: Product): boolean {
  return product.stock > 0 && product.stock <= product.lowStockAlert;
}

function stockRank(product: Product): number {
  if (product.stock <= 0) {
    return 2;
  }

  return isLowStock(product) ? 1 : 0;
}

function dateRangesOverlap(
  leftStart: number,
  leftEnd: number,
  rightStart: number,
  rightEnd: number
): boolean {
  return leftStart <= rightEnd && rightStart <= leftEnd;
}

function offerTargetsOverlap(
  left: Offer['applicableTo'],
  right: Offer['applicableTo']
): boolean {
  return (
    arraysOverlap(left.products, right.products) ||
    arraysOverlap(left.packages, right.packages) ||
    arraysOverlap(left.categories, right.categories)
  );
}

function arraysOverlap(left: string[] | undefined, right: string[] | undefined): boolean {
  return Boolean(left?.some((item) => right?.includes(item)));
}
