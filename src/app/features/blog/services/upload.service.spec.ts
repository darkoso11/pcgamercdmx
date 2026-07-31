import { of } from 'rxjs';
import { UploadService } from './upload.service';

describe('UploadService', () => {
  it('uploads through Directus Files and returns stable metadata', async () => {
    const directus = {
      uploadFile: jasmine.createSpy().and.returnValue(of({
        data: { id: 'file-123', filename_download: 'cover.webp' },
      })),
      assetUrl: jasmine.createSpy().and.returnValue(
        'https://cms.test.pcgamercdmx.com/assets/file-123'
      ),
    };
    const service = new UploadService(directus as any);
    const file = new File(['image'], 'cover.webp', { type: 'image/webp' });

    const result = await service.uploadFile(file);

    expect(directus.uploadFile).toHaveBeenCalledWith(file, 'cover.webp', { auth: true });
    expect(result).toEqual({
      fileId: 'file-123',
      url: 'https://cms.test.pcgamercdmx.com/assets/file-123',
      filename: 'cover.webp',
      mimeType: 'image/webp',
    });
  });
});
