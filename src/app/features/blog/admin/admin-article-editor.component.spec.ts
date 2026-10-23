import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AdminArticleEditorComponent } from './admin-article-editor.component';

describe('AdminArticleEditorComponent async state', () => {
  let blogService: {
    getById: jasmine.Spy;
    update: jasmine.Spy;
  };
  let uploadService: {
    uploadFile: jasmine.Spy;
  };
  let route: {
    snapshot: { params: Record<string, string> };
  };
  let router: {
    navigate: jasmine.Spy;
  };
  let cdr: {
    detectChanges: jasmine.Spy;
    markForCheck: jasmine.Spy;
  };
  let component: AdminArticleEditorComponent;

  beforeEach(() => {
    sessionStorage.removeItem('pcg_blog_editor_draft');
    blogService = {
      getById: jasmine.createSpy(),
      update: jasmine.createSpy(),
    };
    uploadService = {
      uploadFile: jasmine.createSpy(),
    };
    route = {
      snapshot: { params: { id: '2' } },
    };
    router = {
      navigate: jasmine.createSpy(),
    };
    cdr = {
      detectChanges: jasmine.createSpy(),
      markForCheck: jasmine.createSpy(),
    };
    component = new AdminArticleEditorComponent(
      new FormBuilder(),
      blogService as any,
      uploadService as any,
      route as any,
      router as any,
      cdr as any
    );
  });

  it('notifies zoneless change detection when a video upload finishes', async () => {
    component.addSection();
    const section = component.sectionsArray.at(0);
    (section as any)._videoFile = new File(['video'], 'clip.mp4', {
      type: 'video/mp4',
    });
    uploadService.uploadFile.and.resolveTo({
      fileId: 'video-1',
      url: 'https://cms.test.pcgamercdmx.com/assets/video-1',
      filename: 'clip.mp4',
      mimeType: 'video/mp4',
    });

    await component.uploadSectionVideo(0);

    expect(component.uploading).toBeFalse();
    expect(section.value.videoFileId).toBe('video-1');
    expect(cdr.markForCheck).toHaveBeenCalled();
  });

  it('loads an existing file video into the editable controls', () => {
    blogService.getById.and.returnValue(of({
      _id: '1',
      title: 'Artículo con video',
      slug: 'articulo-con-video',
      summary: 'Resumen suficientemente largo',
      categoryId: 'guias',
      tags: [],
      published: true,
      sections: [{
        title: 'Demostración',
        text: '<p>Contenido</p>',
        images: [],
        media: [{
          kind: 'video-file',
          fileId: 'video-existing',
          url: 'https://cms.test.pcgamercdmx.com/assets/video-existing',
          filename: 'existing.mp4',
          mimeType: 'video/mp4',
          title: 'Video existente',
        }],
      }],
    }));

    component.loadArticle('1');

    const section = component.sectionsArray.at(0);
    expect(section.value.videoFileId).toBe('video-existing');
    expect(section.value.videoFileUrl).toContain('video-existing');
    expect(section.value.videoTitle).toBe('Video existente');
    expect(section.value.existingMedia).toEqual([]);
  });

  it('loads the local publication time when editing a scheduled article', () => {
    blogService.getById.and.returnValue(of({
      _id: '1',
      title: 'Artículo programado',
      slug: 'articulo-programado',
      summary: 'Resumen suficientemente largo',
      categoryId: 'guias',
      tags: [],
      published: true,
      publishedAt: '2026-08-10T15:30:00.000Z',
      sections: [],
    }));

    component.loadArticle('1');

    expect(component.form.value.scheduledAt).toBe('2026-08-10T09:30');
  });

  it('renders the Directus error and unlocks saving after an update fails', async () => {
    component.isNew = false;
    component.addSection();
    component.form.patchValue({
      title: 'Artículo editable',
      summary: 'Resumen suficientemente largo',
      categoryId: 'guias',
    });
    blogService.update.and.returnValue(
      throwError(() => ({
        status: 403,
        error: {
          errors: [{ message: 'You do not have permission to update this item.' }],
        },
      }))
    );

    await component.onSave('draft');

    expect(component.saving).toBeFalse();
    expect(component.errorMsg).toContain(
      'You do not have permission to update this item.'
    );
    expect(cdr.markForCheck).toHaveBeenCalled();
  });

  it('uploads a selected video automatically before updating the article', async () => {
    component.isNew = false;
    component.addSection();
    const section = component.sectionsArray.at(0);
    (section as any)._videoFile = new File(['video'], 'clip.mp4', {
      type: 'video/mp4',
    });
    section.patchValue({
      videoFileName: 'clip.mp4',
      videoFileType: 'video/mp4',
      videoTitle: 'Recorrido del ensamble',
    });
    component.form.patchValue({
      title: 'Artículo con video',
      summary: 'Resumen suficientemente largo',
      categoryId: 'guias',
    });
    uploadService.uploadFile.and.resolveTo({
      fileId: 'video-2',
      url: 'https://cms.test.pcgamercdmx.com/assets/video-2',
      filename: 'clip.mp4',
      mimeType: 'video/mp4',
    });
    blogService.update.and.returnValue(of({}));

    await component.onSave('publish');

    expect(uploadService.uploadFile).toHaveBeenCalled();
    expect(blogService.update).toHaveBeenCalledWith(
      '2',
      jasmine.objectContaining({
        sections: [
          jasmine.objectContaining({
            media: [
              jasmine.objectContaining({
                kind: 'video-file',
                fileId: 'video-2',
                title: 'Recorrido del ensamble',
              }),
            ],
          }),
        ],
      })
    );
  });

  it('uploads selected cover and section images automatically before saving', async () => {
    component.isNew = false;
    component.addSection();
    component.form.patchValue({
      title: 'Artículo con imágenes',
      summary: 'Resumen suficientemente largo',
      categoryId: 'guias',
    });
    component.selectedCoverFile = new File(['cover'], 'cover.webp', {
      type: 'image/webp',
    });
    const section = component.sectionsArray.at(0);
    component.addImageToSection(0);
    const image = component.getSectionImages(0).at(0);
    (image as any)._file = new File(['section'], 'section.png', {
      type: 'image/png',
    });

    uploadService.uploadFile.and.returnValues(
      Promise.resolve({
        fileId: 'cover-1',
        url: 'https://cms.test.pcgamercdmx.com/assets/cover-1',
        filename: 'cover.webp',
        mimeType: 'image/webp',
      }),
      Promise.resolve({
        fileId: 'image-1',
        url: 'https://cms.test.pcgamercdmx.com/assets/image-1',
        filename: 'section.png',
        mimeType: 'image/png',
      })
    );
    blogService.update.and.returnValue(of({}));

    await component.onSave('draft');

    expect(uploadService.uploadFile).toHaveBeenCalledTimes(2);
    expect(blogService.update).toHaveBeenCalledWith(
      '2',
      jasmine.objectContaining({
        coverImage: jasmine.objectContaining({ fileId: 'cover-1' }),
        sections: [
          jasmine.objectContaining({
            images: [
              jasmine.objectContaining({
                fileId: 'image-1',
                url: 'https://cms.test.pcgamercdmx.com/assets/image-1',
              }),
            ],
          }),
        ],
      })
    );
    expect(section.value.images[0].fileId).toBe('image-1');
  });

  it('stores the current editor route for the private preview', async () => {
    component.isNew = false;
    component.addSection();
    component.form.patchValue({
      title: 'Artículo editable',
      summary: 'Resumen suficientemente largo',
      categoryId: 'guias',
    });

    await component.openPreview();

    const preview = JSON.parse(
      sessionStorage.getItem('pcg_blog_preview') || '{}'
    );
    expect(preview.returnUrl).toContain('/blog/2/edit');
    expect(preview.article.title).toBe('Artículo editable');
  });

  it('normalizes a selected video into preview media', async () => {
    component.isNew = false;
    component.addSection();
    const section = component.sectionsArray.at(0);
    section.patchValue({
      videoFileId: 'video-1',
      videoFileUrl: 'https://cms.test.pcgamercdmx.com/assets/video-1',
      videoFileName: 'clip.mp4',
      videoFileType: 'video/mp4',
      videoTitle: 'Demostración del equipo',
    });
    component.form.patchValue({
      title: 'Artículo con video',
      summary: 'Resumen suficientemente largo',
      categoryId: 'guias',
    });

    await component.openPreview();

    const preview = JSON.parse(
      sessionStorage.getItem('pcg_blog_preview') || '{}'
    );
    expect(preview.article.sections[0].media).toEqual([
      jasmine.objectContaining({
        kind: 'video-file',
        fileId: 'video-1',
        title: 'Demostración del equipo',
      }),
    ]);
  });

  it('releases video preview URLs when replaced and destroyed', async () => {
    component.addSection();
    uploadService.uploadFile.and.resolveTo({
      fileId: 'video-1',
      url: 'https://cms.test.pcgamercdmx.com/assets/video-1',
      filename: 'clip.mp4',
      mimeType: 'video/mp4',
    });
    spyOn(URL, 'createObjectURL').and.returnValues('blob:first', 'blob:second');
    const revoke = spyOn(URL, 'revokeObjectURL');

    component.onSectionVideoSelect({
      target: {
        files: [new File(['one'], 'first.mp4', { type: 'video/mp4' })],
      },
    } as unknown as Event, 0);
    await Promise.resolve();
    component.onSectionVideoSelect({
      target: {
        files: [new File(['two'], 'second.mp4', { type: 'video/mp4' })],
      },
    } as unknown as Event, 0);

    expect(revoke).toHaveBeenCalledWith('blob:first');

    component.ngOnDestroy();

    expect(revoke).toHaveBeenCalledWith('blob:second');
  });

  it('uploads the latest video when the selection changes during an upload', async () => {
    component.addSection();
    const section = component.sectionsArray.at(0);
    spyOn(URL, 'createObjectURL').and.returnValues('blob:first', 'blob:second');
    spyOn(URL, 'revokeObjectURL');
    let resolveFirst!: (value: {
      fileId: string;
      url: string;
      filename: string;
      mimeType: string;
    }) => void;
    const firstUpload = new Promise<{
      fileId: string;
      url: string;
      filename: string;
      mimeType: string;
    }>((resolve) => {
      resolveFirst = resolve;
    });
    uploadService.uploadFile.and.returnValues(
      firstUpload,
      Promise.resolve({
        fileId: 'video-2',
        url: 'https://cms.test.pcgamercdmx.com/assets/video-2',
        filename: 'second.mp4',
        mimeType: 'video/mp4',
      })
    );

    component.onSectionVideoSelect({
      target: {
        files: [new File(['one'], 'first.mp4', { type: 'video/mp4' })],
      },
    } as unknown as Event, 0);
    component.onSectionVideoSelect({
      target: {
        files: [new File(['two'], 'second.mp4', { type: 'video/mp4' })],
      },
    } as unknown as Event, 0);
    const pendingUpload = (section as any)._videoUploadPromise as Promise<void>;

    resolveFirst({
      fileId: 'video-1',
      url: 'https://cms.test.pcgamercdmx.com/assets/video-1',
      filename: 'first.mp4',
      mimeType: 'video/mp4',
    });
    await pendingUpload;

    expect(uploadService.uploadFile).toHaveBeenCalledTimes(2);
    expect(uploadService.uploadFile.calls.mostRecent().args[0].name).toBe('second.mp4');
    expect(section.value.videoFileId).toBe('video-2');
    expect(section.value.videoFileName).toBe('second.mp4');
  });

  it('clears persisted video metadata when selecting a replacement', () => {
    component.addSection();
    const section = component.sectionsArray.at(0);
    section.patchValue({
      videoFileId: 'video-old',
      videoFileUrl: 'https://cms.test.pcgamercdmx.com/assets/video-old',
      videoFileName: 'old.mp4',
      videoFileType: 'video/mp4',
    });
    spyOn(URL, 'createObjectURL').and.returnValue('blob:replacement');
    uploadService.uploadFile.and.returnValue(new Promise(() => undefined));

    component.onSectionVideoSelect({
      target: {
        files: [new File(['new'], 'replacement.mp4', { type: 'video/mp4' })],
      },
    } as unknown as Event, 0);

    expect(section.value.videoFileId).toBe('');
    expect(section.value.videoFileUrl).toBe('');
    expect(section.value.videoFileName).toBe('replacement.mp4');
  });

  it('rejects a video larger than the editor limit before uploading', () => {
    component.addSection();
    const oversized = new File(['video'], 'oversized.mp4', {
      type: 'video/mp4',
    });
    Object.defineProperty(oversized, 'size', {
      value: 251 * 1024 * 1024,
    });

    component.onSectionVideoSelect({
      target: { files: [oversized] },
    } as unknown as Event, 0);

    expect(uploadService.uploadFile).not.toHaveBeenCalled();
    expect(component.errorMsg).toContain('250 MB');
  });

  for (const direction of ['up', 'down'] as const) {
    it(`moves complete sections ${direction} without losing images or pending files`, () => {
      component.addSection();
      component.addSection();
      component.addImageToSection(0);
      component.addImageToSection(0);
      const first = component.sectionsArray.at(0);
      const second = component.sectionsArray.at(1);
      const image = component.getSectionImages(0).at(0);
      const file = new File(['pending'], 'pending.png');
      (image as any)._file = file;
      if (direction === 'up') component.moveSectionUp(1);
      else component.moveSectionDown(0);
      expect(component.sectionsArray.at(0)).toBe(second);
      expect(component.sectionsArray.at(1)).toBe(first);
      expect(component.getSectionImages(0).length).toBe(0);
      expect(component.getSectionImages(1).length).toBe(2);
      expect((component.getSectionImages(1).at(0) as any)._file).toBe(file);
    });
  }

  it('preserves all section data when loading and saving unchanged multimedia', async () => {
    const section = {
      id: 'stable-section', title: 'Sección', text: '<p>Texto</p>', order: 0,
      links: [{ title: 'Referencia', link: '/contacto' }],
      images: [{ url: '/image.webp', alt: 'Equipo', position: 'left', decorative: false, variant: 'large', order: 0 }],
      media: [
        { kind: 'video-file', fileId: 'v1', url: '/v1.mp4', title: 'Primero', captionsUrl: '/es.vtt', transcript: 'Texto' },
        { kind: 'video-embed', provider: 'youtube', externalId: 'abcdefghi', title: 'Otro título', transcript: 'Otro texto' },
        { kind: 'video-file', fileId: 'v2', url: '/v2.mp4', title: 'Segundo' },
      ],
    };
    component.isNew = false;
    blogService.getById.and.returnValue(of({ title: 'Artículo completo', summary: 'Resumen suficientemente largo', categoryId: 'guias', tags: [], sections: [section] }));
    blogService.update.and.returnValue(of({}));
    component.loadArticle('2');
    await component.onSave('draft');
    const saved = blogService.update.calls.mostRecent().args[1].sections[0];
    expect(saved).toEqual(jasmine.objectContaining({ id: section.id, links: section.links }));
    expect(saved.images[0]).toEqual(jasmine.objectContaining(section.images[0]));
    expect(saved.media).toEqual(section.media);
  });

  it('restores unsaved changes once after returning from preview', async () => {
    sessionStorage.removeItem('pcg_blog_editor_draft');
    component.isNew = false;
    component.addSection();
    component.addImageToSection(0);
    component.form.patchValue({ title: 'Cambios sin guardar', summary: 'Resumen suficientemente largo', categoryId: 'guias', scheduledAt: '2026-12-01T10:00' });
    component.getSectionImages(0).at(0).patchValue({ url: '/saved.webp', alt: 'Imagen' });
    await component.openPreview();
    const restored = new AdminArticleEditorComponent(new FormBuilder(), blogService as any, uploadService as any, route as any, router as any, cdr as any);
    spyOn(restored, 'loadCategories');
    spyOn(restored, 'loadSubcategories');
    restored.ngOnInit();
    expect(restored.form.value.title).toBe('Cambios sin guardar');
    expect(restored.form.value.scheduledAt).toBe('2026-12-01T10:00');
    expect(restored.getSectionImages(0).value[0].alt).toBe('Imagen');
    expect(blogService.getById).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('pcg_blog_editor_draft')).toBeNull();
  });

  it('waits for pending files before navigating to preview', async () => {
    component.addSection();
    let finish!: (value: any) => void;
    component.selectedCoverFile = new File(['cover'], 'cover.png');
    uploadService.uploadFile.and.returnValue(new Promise(resolve => finish = resolve));
    const preview = component.openPreview();
    expect(router.navigate).not.toHaveBeenCalled();
    finish({ fileId: 'cover', url: '/cover.png' });
    await preview;
    expect(JSON.parse(sessionStorage.getItem('pcg_blog_preview')!).article.coverImage.fileId).toBe('cover');
    expect(router.navigate).toHaveBeenCalled();
  });

  for (const target of ['cover', 'section'] as const) {
    it(`keeps the latest ${target} image when replaced during upload`, async () => {
      component.addSection();
      component.addImageToSection(0);
      const image = component.getSectionImages(0).at(0);
      const first = new File(['first'], 'first.png', { type: 'image/png' });
      const second = new File(['second'], 'second.png', { type: 'image/png' });
      let finish!: (value: any) => void;
      uploadService.uploadFile.and.returnValues(new Promise(resolve => finish = resolve), Promise.resolve({ fileId: 'second', url: '/second.png', filename: 'second.png' }));
      if (target === 'cover') component.selectedCoverFile = first;
      else (image as any)._file = first;
      const pending = target === 'cover' ? component.uploadCoverImage() : component.uploadSectionImage(0, 0);
      if (target === 'cover') component.selectedCoverFile = second;
      else (image as any)._file = second;
      finish({ fileId: 'first', url: '/first.png' });
      await pending;
      expect(uploadService.uploadFile.calls.mostRecent().args[0]).toBe(second);
      expect(target === 'cover' ? component.form.value.coverImage.fileId : image.value.fileId).toBe('second');
    });
  }

  it('keeps the editor open if a pending upload fails before preview', async () => {
    component.selectedCoverFile = new File(['image'], 'cover.png');
    uploadService.uploadFile.and.rejectWith(new Error('Sin conexión'));
    await component.openPreview();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.errorMsg).toContain('Sin conexión');
    expect(component.saving).toBeFalse();
  });

  it('preserves multimedia across repeated preview and restore cycles without duplicates', async () => {
    const media = [
      { kind: 'video-file', fileId: 'v1', url: '/v1.mp4', title: 'Uno', transcript: 'Transcripción' },
      { kind: 'video-file', fileId: 'v2', url: '/v2.mp4', title: 'Dos' },
    ];
    blogService.getById.and.returnValue(of({ title: 'Artículo original', summary: 'Resumen suficientemente largo', categoryId: 'guias', tags: ['guia'], sections: [{ id: 's1', media, images: [], links: [{ title: 'Enlace', link: '/blog' }] }] }));
    component.isNew = false;
    component.loadArticle('2');
    for (let cycle = 0; cycle < 2; cycle++) {
      await component.openPreview();
      component = new AdminArticleEditorComponent(new FormBuilder(), blogService as any, uploadService as any, route as any, router as any, cdr as any);
      spyOn(component, 'loadCategories');
      spyOn(component, 'loadSubcategories');
      component.ngOnInit();
    }
    blogService.update.and.returnValue(of({}));
    await component.onSave('draft');
    expect(blogService.update.calls.mostRecent().args[1].sections[0].media).toEqual(media);
    expect(blogService.update.calls.mostRecent().args[1].tags).toEqual(['guia']);
  });

  it('loads and persists SEO overrides while preserving the original publication date', async () => {
    component.isNew = false;
    blogService.getById.and.returnValue(of({ title: 'Artículo', slug: 'articulo', summary: 'Resumen suficientemente largo', categoryId: '1', published: true, publishedAt: '2026-01-01T12:00:00Z', seoTitle: 'Título SEO', seoDescription: 'Descripción para buscadores', seoImage: 'https://example.com/social.webp', sections: [{ text: '<p>Contenido</p>' }] }));
    blogService.update.and.returnValue(of({}));
    component.loadArticle('2');
    expect(component.form.value.seoTitle).toBe('Título SEO');
    await component.onSave('publish');
    expect(blogService.update.calls.mostRecent().args[1]).toEqual(jasmine.objectContaining({ seoTitle: 'Título SEO', seoImage: 'https://example.com/social.webp', publishedAt: '2026-01-01T12:00:00Z' }));
  });

  it('does not publish immediately when the scheduling date is in the past', async () => {
    component.isNew = false;
    component.addSection();
    component.form.patchValue({ title: 'Artículo', summary: 'Resumen suficientemente largo', categoryId: '1', scheduledAt: '2020-01-01T12:00' });
    blogService.update.and.returnValue(of({}));
    await component.onSave('schedule');
    expect(blogService.update).not.toHaveBeenCalled();
    expect(component.errorMsg).toContain('futura');
  });

  it('generates an accented title slug without losing its letters', async () => {
    component.isNew = false;
    component.addSection();
    component.form.patchValue({ title: 'Guía de edición', summary: 'Resumen suficientemente largo', categoryId: '1' });
    blogService.update.and.returnValue(of({}));
    await component.onSave('draft');
    expect(blogService.update.calls.mostRecent().args[1].slug).toBe('guia-de-edicion');
  });

  it('rejects slugs that cannot be used as a single canonical path', () => {
    component.form.get('slug')!.setValue('entrada con / espacios');
    expect(component.form.get('slug')!.valid).toBeFalse();
  });
});
