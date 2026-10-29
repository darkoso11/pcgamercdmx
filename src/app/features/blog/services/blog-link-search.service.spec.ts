import { firstValueFrom, of } from 'rxjs';
import { BlogLinkSearchService } from './blog-link-search.service';

describe('Public link destination finder', () => {
  it('queries only visible published articles without authentication', async () => {
    const readItems = jasmine.createSpy().and.returnValue(of({ data: [{ title: 'Guía', slug: 'guia' }] }));
    const service = new BlogLinkSearchService({ readItems } as any);
    expect(await firstValueFrom(service.search('article', 'Guía'))).toEqual([{ title: 'Guía', link: '/blog/guia' }]);
    expect(readItems).toHaveBeenCalledWith('pc_blog_posts', jasmine.objectContaining({ 'filter[published][_eq]': true, 'filter[published_at][_lte]': jasmine.any(String), fields: 'title,slug', limit: 12 }));
  });

  it('uses the actual product category and route for assembled PCs', async () => {
    const readItems = jasmine.createSpy().and.returnValue(of({ data: [{ title: 'Equipo', slug: 'equipo' }] }));
    const service = new BlogLinkSearchService({ readItems } as any);
    expect(await firstValueFrom(service.search('assembly', 'Equipo'))).toEqual([{ title: 'Equipo', link: '/ensambles/equipo' }]);
    expect(readItems).toHaveBeenCalledWith('pc_products', jasmine.objectContaining({ 'filter[category][_eq]': 'assembled', 'filter[published][_eq]': true }));
    await firstValueFrom(service.search('product', 'Equipo'));
    expect(readItems.calls.mostRecent().args[1]['filter[category][_neq]']).toBe('assembled');
  });
});
