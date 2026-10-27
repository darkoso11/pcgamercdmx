import { blogLinkRel, inlineBlogLinks, safeBlogLink } from './blog-link.utils';
import { reviewBlogArticle } from './blog-review.utils';

describe('Blog links and publication review', () => {
  const article = () => ({ title: 'Artículo válido', summary: 'Resumen suficientemente largo', categoryId: '1', sections: [{ title: 'Sección', text: '<p>Contenido editorial.</p>' }] });

  it('accepts explicit web and contact URLs and site paths', () => {
    for (const link of ['/productos/pc-gamer', '#presupuesto', 'https://example.com/guia', 'mailto:ventas@example.com', 'tel:+525555123456']) expect(safeBlogLink(link)).toBe(link);
  });

  it('rejects executable schemes, credentials, ambiguous paths and control characters', () => {
    for (const link of ['javascript:alert(1)', 'data:text/html,hi', 'https://user:pass@example.com', '//example.com', '/\\example.com', 'example.com', '#', 'https://example.com/%0aheader', 'https://example.com/a b']) expect(safeBlogLink(link)).toBeUndefined();
  });

  it('only adds requested SEO relationships and protects new tabs', () => {
    expect(blogLinkRel({})).toBeNull();
    expect(blogLinkRel({ rel: 'sponsored nofollow unknown', newTab: true })).toBe('sponsored nofollow noopener noreferrer');
  });

  it('reads inline labels and attributes without inserting the HTML into the document', () => {
    const links = inlineBlogLinks('<a href="/productos" target="_blank" rel="sponsored">Comparar equipos</a>', document);
    expect(links[0]).toEqual(jasmine.objectContaining({ title: 'Comparar equipos', link: '/productos', newTab: true, rel: 'sponsored' }));
  });

  it('keeps automatic SEO overrides optional and recommendations nonblocking', () => {
    const report = reviewBlogArticle(article(), document);
    expect(report.errors).toEqual([]);
    expect(report.warnings.some(issue => issue.code === 'cover')).toBeTrue();
  });

  it('reports empty or invalid links as errors while missing image descriptions remain recommendations', () => {
    const value: any = article();
    value.sections[0].links = [{ title: '', link: 'javascript:alert(1)' }];
    value.sections[0].images = [{ url: '/assets/photo.jpg', alt: '' }];
    const report = reviewBlogArticle(value, document);
    expect(report.errors.map(issue => issue.code)).toEqual(['link-url', 'link-text']);
    expect(report.warnings.some(issue => issue.code === 'image-alt')).toBeTrue();
  });

  it('recognizes image labels and document anchors as legitimate links', () => {
    const value = article();
    value.sections[0].text = '<a id="equipos"></a><a href="/productos"><img src="/pc.png" alt="Ver equipos disponibles"></a>';
    expect(reviewBlogArticle(value, document).errors).toEqual([]);
  });

  it('warns about skipped headings and empty sections without imposing a word count', () => {
    const value = article();
    value.sections[0].text = '<h4>Subtítulo</h4>';
    expect(reviewBlogArticle(value, document).warnings.some(issue => issue.code === 'heading-jump')).toBeTrue();
    value.sections[0].text = '<p><br></p>';
    expect(reviewBlogArticle(value, document).warnings.some(issue => issue.code === 'empty-section')).toBeTrue();
  });
});
