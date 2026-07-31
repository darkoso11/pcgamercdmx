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

  it('stores the current editor route for the private preview', () => {
    component.isNew = false;
    component.addSection();
    component.form.patchValue({
      title: 'Artículo editable',
      summary: 'Resumen suficientemente largo',
      categoryId: 'guias',
    });

    component.openPreview();

    const preview = JSON.parse(
      sessionStorage.getItem('pcg_blog_preview') || '{}'
    );
    expect(preview.returnUrl).toContain('/blog/2/edit');
    expect(preview.article.title).toBe('Artículo editable');
  });

  it('normalizes a selected video into preview media', () => {
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

    component.openPreview();

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
});
