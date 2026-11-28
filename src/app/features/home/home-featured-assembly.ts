import { AssembledPC } from '../../shared/models';

export function selectFeaturedAssembly(
  assemblies: AssembledPC[], previousImage: string | null, random = Math.random
): AssembledPC | null {
  const highestPriced = assemblies
    .filter(product => product.slug && product.image && Number.isFinite(product.discountedPrice ?? product.price))
    .slice()
    .sort((a, b) => (b.discountedPrice ?? b.price) - (a.discountedPrice ?? a.price))
    .slice(0, 5);
  const differentImages = highestPriced.filter(product => product.image !== previousImage);
  const candidates = differentImages.length ? differentImages : highestPriced;
  return candidates.length ? candidates[Math.floor(random() * candidates.length)] : null;
}
