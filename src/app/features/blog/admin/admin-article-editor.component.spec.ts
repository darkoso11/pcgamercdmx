import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { AdminArticleEditorComponent } from './admin-article-editor.component';

describe('AdminArticleEditorComponent async state', () => {
  let blogService: {
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
});
