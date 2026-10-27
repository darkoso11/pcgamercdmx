import { of } from 'rxjs';
import { BlogService } from './blog.service';

describe('BlogService', () => {
  let directus: {
    isEnabled: jasmine.Spy;
    readItems: jasmine.Spy;
  };
  let service: BlogService;

  beforeEach(() => {
    directus = {
      isEnabled: jasmine.createSpy().and.returnValue(true),
      readItems: jasmine.createSpy().and.returnValue(of({ data: [] })),
    };
    service = new BlogService(directus as any);
  });

  const adminRecords = () => [
    { id: 1, title: 'Guía Intel', summary: 'Presupuesto', category: '1', subcategory: 'a', tags: ['Intel', 'CPU'], published: false, published_at: null, date_created: '2026-10-26T18:00:00Z' },
    { id: 2, title: 'Artículo público', summary: 'Resumen', category: '2', subcategory: 'b', tags: ['Gaming'], published: true, published_at: '2025-01-01T06:00:00Z', date_created: '2024-12-31T22:00:00Z' },
    { id: 3, title: 'Guía futura', summary: 'Resumen', category: '1', subcategory: 'a', tags: ['GPU'], published: true, published_at: '2099-01-01T00:00:00Z', date_created: '2024-12-31T23:00:00Z' },
    { id: 4, title: 'Sin fecha', category: '1', published: false },
  ];

  it('matches the displayed creation date and includes the whole last day in Mexico City', () => {
    directus.readItems.and.returnValue(of({ data: adminRecords() }));
    service.list({ dateFrom: '2024-12-31', dateTo: '2024-12-31' }).subscribe(result => expect(result.data.map(item => item._id)).toEqual(['2', '3']));
  });

  it('uses inclusive local midnight at the start and exclusive midnight of the next day', () => {
    const records = ['2024-12-31T05:59:59Z', '2024-12-31T06:00:00Z', '2025-01-01T05:59:59Z', '2025-01-01T06:00:00Z'].map((date_created, index) => ({ id: index + 1, title: 'Entrada', published: false, date_created }));
    directus.readItems.and.returnValue(of({ data: records }));
    service.list({ dateFrom: '2024-12-31', dateTo: '2024-12-31' }).subscribe(result => expect(result.data.map(item => item._id)).toEqual(['2', '3']));
  });

  it('separates published entries from scheduled and draft entries', () => {
    directus.readItems.and.returnValue(of({ data: adminRecords() }));
    service.list({ status: 'published' }).subscribe(result => expect(result.data.map(item => item._id)).toEqual(['2']));
    service.list({ status: 'scheduled' }).subscribe(result => expect(result.data.map(item => item._id)).toEqual(['3']));
    service.list({ status: 'draft' }).subscribe(result => expect(result.data.map(item => item._id)).toEqual(['1', '4']));
  });

  it('combines draft status, date, category, subcategory and tags', () => {
    directus.readItems.and.returnValue(of({ data: adminRecords() }));
    service.list({ status: 'draft', dateFrom: '2026-10-26', dateTo: '2026-10-26', categoryId: '1', subCategoryId: 'a', tags: 'CPU' }).subscribe(result => expect(result.data.map(item => item._id)).toEqual(['1']));
  });

  it('supports comma separated tags and accent insensitive title searches', () => {
    directus.readItems.and.returnValue(of({ data: adminRecords() }));
    service.list({ tags: 'Intel, Gaming' }).subscribe(result => expect(result.data.map(item => item._id)).toEqual(['1', '2']));
    service.list({ q: 'guia' }).subscribe(result => expect(result.data.map(item => item._id)).toEqual(['1', '3']));
    service.list({ q: 'Presupuesto' }).subscribe(result => expect(result.total).toBe(0));
  });

  it('requests only published posts whose publication date has arrived', () => {
    service.listPublished({ limit: 6 }).subscribe();

    expect(directus.readItems).toHaveBeenCalledWith(
      'pc_blog_posts',
      jasmine.objectContaining({
        'filter[published][_eq]': true,
        'filter[published_at][_lte]': jasmine.any(String),
        limit: 6,
      })
    );
  });

  it('lists only live revisions of the requested blog article', () => {
    const readSystem = jasmine.createSpy().and.returnValue(of({ data: [{ id: 42 }] }));
    const editorService = new BlogService({ readSystem } as any);
    editorService.getRevisions('3').subscribe(result => expect(result[0].id).toBe(42));
    expect(readSystem).toHaveBeenCalledWith('revisions', jasmine.objectContaining({
      'filter[collection][_eq]': 'pc_blog_posts', 'filter[item][_eq]': '3', limit: 20,
    }));
  });

  it('refuses a revision belonging to a different article', () => {
    const editorService = new BlogService({ readSystem: () => of({ data: { collection: 'pc_blog_posts', item: '99', data: {} } }) } as any);
    let rejected = false;
    editorService.getRevision(42, '3').subscribe({ error: () => rejected = true });
    expect(rejected).toBeTrue();
  });

  it('uses blog-specific taxonomy collections', () => {
    service.getCategories().subscribe();
    service.getSubCategories().subscribe();

    expect(directus.readItems.calls.argsFor(0)[0]).toBe('pc_blog_categories');
    expect(directus.readItems.calls.argsFor(1)[0]).toBe('pc_blog_subcategories');
  });

  it('filters published tags in Directus before pagination', () => {
    service.listPublished({ tags: 'Intel', limit: 6, page: 1 }).subscribe();

    expect(directus.readItems).toHaveBeenCalledWith(
      'pc_blog_posts',
      jasmine.objectContaining({
        'filter[tags][_contains]': 'Intel',
        limit: 6,
        offset: 6,
      })
    );
  });
});
