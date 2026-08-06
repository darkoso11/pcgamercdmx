import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { adminUrl } from '../../admin/admin-route.config';
import { AdminArticlePreviewComponent } from './admin-article-preview.component';

describe('AdminArticlePreviewComponent', () => {
  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AdminArticlePreviewComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => sessionStorage.clear());

  it('renders stored videos and returns to the article being edited', () => {
    sessionStorage.setItem('pcg_blog_preview', JSON.stringify({
      returnUrl: adminUrl('blog/2/edit'),
      article: {
        title: 'Artículo con video',
        summary: 'Resumen del artículo',
        sections: [{
          title: 'Demostración',
          text: '<p>Contenido</p>',
          images: [],
          media: [{
            kind: 'video-file',
            fileId: 'video-1',
            url: 'https://cms.test.pcgamercdmx.com/assets/video-1',
            title: 'Demostración del equipo',
            mimeType: 'video/mp4',
          }],
        }],
      },
    }));

    const fixture = TestBed.createComponent(AdminArticlePreviewComponent);
    fixture.detectChanges();

    const video = fixture.nativeElement.querySelector('video') as HTMLVideoElement;
    const backLink = fixture.nativeElement.querySelector(
      '.preview-bar a'
    ) as HTMLAnchorElement;
    expect(video).not.toBeNull();
    expect(video.querySelector('source')?.getAttribute('src')).toContain('video-1');
    expect(backLink.getAttribute('href')).toBe(adminUrl('blog/2/edit'));
  });
});
