import { SeoConfig } from '../../../core/services/seo.service';
import { environment } from '../../../../environments/environment';
import { BUSINESS_INFO } from '../../../shared/config/business-info';
import { Article } from '../models/types';

export function buildArticleSeo(article: Article): SeoConfig {
  const path = `/blog/${encodeURIComponent(article.slug || '')}`;
  const url = new URL(path, environment.siteUrl).toString();
  const cover = safeImage(article.coverImage?.url);
  const image = safeImage(article.seoImage) || cover || '/assets/img/leon.png';
  const description = article.seoDescription?.trim() || article.summary?.trim() || article.title;
  const published = validDate(article.publishedAt);
  const modified = validDate(article.updatedAt);
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org', '@type': 'BlogPosting',
    '@id': `${url}#article`, mainEntityOfPage: url, url,
    headline: article.title, description,
    image: [new URL(cover || image, environment.siteUrl).toString()],
    inLanguage: 'es-MX',
    author: { '@type': 'Organization', name: BUSINESS_INFO.name, url: environment.siteUrl },
    publisher: { '@type': 'Organization', name: BUSINESS_INFO.name, url: environment.siteUrl,
      logo: { '@type': 'ImageObject', url: new URL('/assets/img/leon.png', environment.siteUrl).toString() } },
    ...(published ? { datePublished: published } : {}),
    ...(modified ? { dateModified: modified } : {}),
  };
  return {
    title: article.seoTitle?.trim() || `${article.title} | PC Gamer CDMX`,
    description, image, imageAlt: article.coverImage?.alt || article.title,
    type: 'article', url: path, noIndex: false,
    publishedTime: published, modifiedTime: modified,
    structuredData: [{ id: 'blog-article-schema', data }, { id: 'blog-breadcrumb-schema', data: {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: environment.siteUrl },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: new URL('/blog', environment.siteUrl).toString() },
        { '@type': 'ListItem', position: 3, name: article.title, item: url },
      ],
    } }],
  };
}

function validDate(value?: string): string | undefined {
  return value && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : undefined;
}

function safeImage(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  try {
    const url = new URL(value.trim(), environment.siteUrl);
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? value.trim() : undefined;
  } catch { return undefined; }
}
