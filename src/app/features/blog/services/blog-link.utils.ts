import { ArticleLink } from '../models/types';
import { environment } from '../../../../environments/environment';

export function safeBlogLink(value?: string): string | undefined {
  const link = value?.trim();
  if (!link || /[\s\u0000-\u001f\u007f\\]/.test(link) || /%0[ad]/i.test(link) || link.startsWith('//')) return undefined;
  if (link.startsWith('#')) return link.length > 1 ? link : undefined;
  if (!link.startsWith('/') && !/^(https?:|mailto:|tel:)/i.test(link)) return undefined;
  try {
    const parsed = new URL(link, environment.siteUrl);
    if (parsed.username || parsed.password) return undefined;
    if (parsed.protocol === 'mailto:') return /^[^@?]+@[^@?]+/.test(parsed.pathname) ? link : undefined;
    if (parsed.protocol === 'tel:') return /^\+?[0-9][0-9().-]*$/.test(parsed.pathname) ? link : undefined;
    return ['http:', 'https:'].includes(parsed.protocol) ? link : undefined;
  } catch { return undefined; }
}

export function blogLinkRel(link: Pick<ArticleLink, 'rel' | 'newTab'>): string | null {
  const tokens = new Set((link.rel || '').toLowerCase().split(/\s+/).filter(token => ['sponsored', 'ugc', 'nofollow'].includes(token)));
  if (link.newTab) { tokens.add('noopener'); tokens.add('noreferrer'); }
  return [...tokens].join(' ') || null;
}

export interface InlineBlogLink extends ArticleLink { index: number; originalHref: string; originalTitle: string; }

export function inlineBlogLinks(html: string, doc: Document): InlineBlogLink[] {
  const template = doc.createElement('template');
  template.innerHTML = html;
  return [...template.content.querySelectorAll('a')].map((anchor, index) => ({
    index, title: anchor.textContent?.trim() || anchor.getAttribute('aria-label') || '',
    link: anchor.getAttribute('href') || '', newTab: anchor.getAttribute('target') === '_blank',
    rel: anchor.getAttribute('rel') || '', originalHref: anchor.getAttribute('href') || '', originalTitle: anchor.textContent || '',
  }));
}
