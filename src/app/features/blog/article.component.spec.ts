import { convertToParamMap } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { ArticleComponent } from './article.component';
import { SeoService } from '../../core/services/seo.service';
import { TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, RESPONSE_INIT } from '@angular/core';

describe('ArticleComponent SEO', () => {
  const article = { title: 'Guía de hardware', slug: 'guia', summary: 'Consejos para tu PC', categoryId: '1', published: true, publishedAt: '2026-10-01T12:00:00Z', sections: [], coverImage: { url: '/cover.webp' } };
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let seo: { update: jasmine.Spy };
  let blog: { getPublishedBySlug: jasmine.Spy };
  let component: ArticleComponent;
  let response: ResponseInit;
  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ slug: 'guia' }));
    seo = { update: jasmine.createSpy() };
    blog = { getPublishedBySlug: jasmine.createSpy().and.returnValue(of(article)) };
    response = {};
    TestBed.configureTestingModule({ providers: [{ provide: SeoService, useValue: seo }, { provide: RESPONSE_INIT, useValue: response }] });
    component = TestBed.runInInjectionContext(() => new ArticleComponent({ paramMap: params, snapshot: { paramMap: params.value } } as any, blog as any, { markForCheck: () => {} } as ChangeDetectorRef));
  });
  it('uses the article metadata and structured data', () => {
    component.ngOnInit();
    expect(seo.update).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'Guía de hardware | PC Gamer CDMX', description: article.summary, image: '/cover.webp', type: 'article', url: '/blog/guia', structuredData: jasmine.any(Array) }));
  });
  it('marks missing entries noindex', () => {
    blog.getPublishedBySlug.and.returnValue(of(null));
    component.ngOnInit();
    expect(seo.update).toHaveBeenCalledWith(jasmine.objectContaining({ noIndex: true, structuredData: [] }));
    expect(response.status).toBe(404);
  });
  it('does not mistake an upstream failure for a missing article', () => {
    blog.getPublishedBySlug.and.returnValue(throwError(() => new Error('CMS offline')));
    component.ngOnInit();
    expect(component.error).toBeTrue();
    expect(component.notFound).toBeFalse();
    expect(seo.update).toHaveBeenCalledWith(jasmine.objectContaining({ noIndex: true }));
    expect(response.status).toBe(503);
  });
  it('replaces metadata when the slug changes and ignores an obsolete response', () => {
    const old = new Subject<any>();
    blog.getPublishedBySlug.and.returnValues(old, of({ ...article, title: 'Otra entrada', slug: 'otra' }));
    component.ngOnInit();
    params.next(convertToParamMap({ slug: 'otra' }));
    old.next(article);
    expect(component.article?.slug).toBe('otra');
    expect(seo.update.calls.mostRecent().args[0].title).toBe('Otra entrada | PC Gamer CDMX');
  });
});
