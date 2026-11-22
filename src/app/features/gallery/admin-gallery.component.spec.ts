import { ChangeDetectorRef } from '@angular/core';
import { of } from 'rxjs';
import { AdminGalleryComponent } from './admin-gallery.component';
import { GalleryService, emptyGalleryImage } from './gallery.service';
import { DirectusApiService } from '../../core/services/directus-api.service';

describe('AdminGalleryComponent upload validation', () => {
  let component: AdminGalleryComponent;
  let api: jasmine.SpyObj<DirectusApiService>;
  let gallery: jasmine.SpyObj<GalleryService>;
  beforeEach(() => {
    api = jasmine.createSpyObj('DirectusApiService', ['uploadFile', 'assetUrl']);
    gallery = jasmine.createSpyObj('GalleryService', ['saveImage']);
    api.uploadFile.and.returnValue(of({ data: { id: 'upload' } }));
    api.assetUrl.and.returnValue('https://cms.example/assets/upload');
    gallery.saveImage.and.returnValue(of({ ...emptyGalleryImage(), id: 1 }));
    component = new AdminGalleryComponent(gallery, api, { markForCheck: () => {} } as ChangeDetectorRef);
    component.ready = true;
    component.editor = { ...emptyGalleryImage(), title: 'PC', alt: 'PC azul', category: 'custom' };
  });
  afterEach(() => component.ngOnDestroy());
  it('does not upload or save corrupt bytes declared as an image', async () => {
    component.file = new File(['not an image'], 'broken.png', { type: 'image/png' });
    await component.saveImage();
    expect(api.uploadFile).not.toHaveBeenCalled();
    expect(gallery.saveImage).not.toHaveBeenCalled();
    expect(component.error).toContain('imagen válida');
    expect(component.saving).toBeFalse();
  });
  it('accepts a decoded image and saves its uploaded URL', async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 2; canvas.height = 2;
    const blob = await new Promise<Blob>(resolve => canvas.toBlob(value => resolve(value!), 'image/png'));
    component.file = new File([blob], 'valid.png', { type: 'image/png' });
    await component.saveImage();
    expect(api.uploadFile).toHaveBeenCalledTimes(1);
    expect(gallery.saveImage).toHaveBeenCalledWith(jasmine.objectContaining({ src: 'https://cms.example/assets/upload' }));
    expect(component.message).toBe('Imagen guardada.');
  });
});
