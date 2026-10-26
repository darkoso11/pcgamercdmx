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
