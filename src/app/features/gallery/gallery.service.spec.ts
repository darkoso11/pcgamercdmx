import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { GalleryService, emptyGalleryImage } from './gallery.service';
import { clearStoredDirectusSession, setStoredDirectusSession } from '../../core/services/directus-auth.storage';

describe('GalleryService persistence', () => {
  let service: GalleryService;
  let http: HttpTestingController;
  beforeEach(() => {
    clearStoredDirectusSession();
    setStoredDirectusSession('gallery-test-token');
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(GalleryService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { clearStoredDirectusSession(); http.verify(); });
  it('reads published records from the CMS and never restores deleted defaults', () => {
    let images: unknown;
    service.getImages().subscribe(data => images = data);
    const request = http.expectOne(req => req.url.endsWith('/items/pc_gallery_images'));
    expect(request.request.params.get('filter[published][_eq]')).toBe('true');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({ data: [] });
    expect(images).toEqual([]);
  });
  it('propagates CMS failures instead of showing hardcoded images', () => {
    let failed = false;
    service.getImages().subscribe({ error: () => failed = true });
    http.expectOne(req => req.url.endsWith('/items/pc_gallery_images')).flush({}, { status: 503, statusText: 'Unavailable' });
    expect(failed).toBeTrue();
  });
  it('normalizes nullable CMS fields so existing records remain editable', () => {
    service.getImages().subscribe(data => {
      expect(data[0].description).toBe('');
      expect(data[0].author).toBe('');
      expect(data[0].tags).toEqual([]);
    });
    http.expectOne(req => req.url.endsWith('/items/pc_gallery_images')).flush({ data: [{ id: 1, description: null, author: null, tags: null }] });
  });
  it('updates a persisted image rather than creating a duplicate, omitting migration metadata', () => {
    const image = { ...emptyGalleryImage(), id: 9, title: 'Edited', legacy_key: 'private' };
    service.saveImage(image).subscribe();
    const request = http.expectOne(req => req.url.endsWith('/items/pc_gallery_images/9'));
    expect(request.request.method).toBe('PATCH');
    expect(request.request.headers.get('Authorization')).toBe('Bearer gallery-test-token');
    expect(request.request.body.title).toBe('Edited');
    expect(request.request.body.id).toBeUndefined();
    expect(request.request.body.legacy_key).toBeUndefined();
    request.flush({ data: { id: 9 } });
  });
  it('deletes the record with the authenticated API', () => {
    service.deleteImage(9).subscribe();
    const request = http.expectOne(req => req.url.endsWith('/items/pc_gallery_images/9'));
    expect(request.request.method).toBe('DELETE');
    expect(request.request.headers.get('Authorization')).toBe('Bearer gallery-test-token');
    request.flush(null);
  });
  it('normalizes optional page settings from the CMS', () => {
    service.getSettings().subscribe(settings => expect(settings.subtitle).toBe(''));
    http.expectOne(req => req.url.endsWith('/items/pc_gallery_settings/1')).flush({ data: { subtitle: null } });
  });
});
