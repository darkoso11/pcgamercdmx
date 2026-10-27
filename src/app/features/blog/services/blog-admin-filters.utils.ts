import { Article } from '../models/types';
import { getPublicationState, localDateTimeToUtc } from './blog-content.utils';

export function adminBlogDateRange(from = '', to = ''): { from?: number; toExclusive?: number } {
  const date = (value: string): number => {
    const parsed = Date.parse(`${value}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(parsed) || new Date(parsed).toISOString().slice(0, 10) !== value) throw new Error('Revisa el formato de la fecha.');
    return parsed;
  };
  if (from) date(from);
  if (to) date(to);
  if (from && to && from > to) throw new Error('La fecha desde no puede ser posterior a la fecha hasta.');
  const nextDay = to ? new Date(date(to) + 86400000).toISOString().slice(0, 10) : '';
  return {
    from: from ? Date.parse(localDateTimeToUtc(`${from}T00:00`)) : undefined,
    toExclusive: nextDay ? Date.parse(localDateTimeToUtc(`${nextDay}T00:00`)) : undefined,
  };
}

function normalize(value: unknown): string {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/\s+/g, ' ');
}

export function filterAdminBlogArticles(articles: Article[], params: Record<string, any>, now = new Date()): Article[] {
  const query = normalize(params['q']);
  const tags = String(params['tags'] ?? '').split(/[,;]+/).map(normalize).filter(Boolean);
  const category = String(params['categoryId'] ?? '').trim();
  const subcategory = String(params['subCategoryId'] ?? '').trim();
  const status = String(params['status'] ?? '');
  const { from, toExclusive } = adminBlogDateRange(params['dateFrom'], params['dateTo']);
  const legacyPublished = params['published'];
  return articles.filter(article => {
    // Match the same date shown in the administrative table, including legacy fallback.
    const date = Date.parse(article.createdAt || article.publishedAt || '');
    const stateMatches = status ? getPublicationState(article.published, article.publishedAt, now) === status
      : legacyPublished === undefined || legacyPublished === '' || article.published === (legacyPublished === true || legacyPublished === 'true');
    return (!query || normalize(article.title).includes(query))
      && (!tags.length || tags.some(tag => (article.tags || []).some(value => normalize(value).includes(tag))))
      && (!category || String(article.categoryId) === category)
      && (!subcategory || String(article.subCategoryId) === subcategory)
      && stateMatches
      && (from === undefined || date >= from)
      && (toExclusive === undefined || date < toExclusive);
  });
}
