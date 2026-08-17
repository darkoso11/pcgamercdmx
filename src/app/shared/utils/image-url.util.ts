import { environment } from '../../../environments/environment';

export function optimizedImageUrl(source: string, width: number): string {
  if (!source || width <= 0) return source;

  try {
    const url = new URL(source);
    const directusOrigin = new URL(environment.directus.url).origin;
    if (url.origin !== directusOrigin || !url.pathname.startsWith('/assets/')) {
      return source;
    }

    url.searchParams.set('width', String(Math.round(width)));
    url.searchParams.set('quality', '75');
    url.searchParams.set('format', 'webp');
    url.searchParams.set('fit', 'contain');
    return url.toString();
  } catch {
    return source;
  }
}
