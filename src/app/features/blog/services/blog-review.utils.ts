import { safeBlogLink } from './blog-link.utils';

export interface BlogReviewIssue { code: string; message: string; section?: number; }
export interface BlogReviewReport { errors: BlogReviewIssue[]; warnings: BlogReviewIssue[]; }

export function reviewBlogArticle(raw: any, doc: Document): BlogReviewReport {
  const report: BlogReviewReport = { errors: [], warnings: [] };
  const error = (code: string, message: string, section?: number) => report.errors.push({ code, message, section });
  const warn = (code: string, message: string, section?: number) => report.warnings.push({ code, message, section });
  if ((raw.title || '').trim().length < 3) error('title', 'Completa el título del artículo (al menos 3 caracteres).');
  if ((raw.summary || '').trim().length < 10) error('summary', 'Completa el resumen del artículo (al menos 10 caracteres).');
  if (!raw.categoryId) error('category', 'Selecciona una categoría.');
  if (raw.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw.slug)) error('slug', 'La URL debe usar letras minúsculas, números y guiones.');
  if (!(raw.sections || []).length) error('sections', 'Añade al menos una sección.');
  if (raw.seoImage && (!/^https?:\/\//i.test(raw.seoImage) || !safeBlogLink(raw.seoImage))) error('seo-image', 'La imagen social necesita una URL http/https válida sin credenciales.');
  if (!raw.coverImage?.url) warn('cover', 'No hay portada. Al compartir se usará la imagen SEO o la imagen predeterminada.');
  else if (!(raw.coverDecorative ?? raw.coverImage.decorative) && !(raw.coverAlt ?? raw.coverImage.alt ?? '').trim()) warn('cover-alt', 'Describe la portada o márcala como decorativa.');
  let linkCount = 0;
  const checkLink = (href: string, text: string, section: number) => {
    linkCount++;
    if (!safeBlogLink(href)) error('link-url', `Sección ${section + 1}: corrige un enlace vacío o con una URL no admitida.`, section);
    if (!text.trim()) error('link-text', `Sección ${section + 1}: añade texto descriptivo a un enlace.`, section);
    else if (/^(clic aqu[ií]|aqu[ií]|ver m[aá]s|click here)$/i.test(text.trim())) warn('link-label', `Sección ${section + 1}: usa un texto de enlace más descriptivo que «${text.trim()}».`, section);
  };
  (raw.sections || []).forEach((section: any, index: number) => {
    const template = doc.createElement('template');
    template.innerHTML = section.text || '';
    const content = template.content;
    const media = section.existingMedia || section.media || [];
    const images = [...(section.images || []), ...media.filter((item: any) => item.kind === 'image')];
    const hasMedia = images.some((image: any) => image.url || image.preview) || media.length || section.videoUrl || section.videoFileId || section.videoPreviewUrl;
    if (!content.textContent?.trim() && !content.querySelector('img,video,iframe') && !hasMedia && !(section.links || []).length) warn('empty-section', `Sección ${index + 1}: añade contenido o elimina esta sección vacía.`, index);
    if (!section.title?.trim()) warn('section-title', `Sección ${index + 1}: considera añadir un título para organizar el contenido.`, index);
    if (content.querySelector('h1,h2')) warn('headings', `Sección ${index + 1}: los H1/H2 del texto se convertirán en H3; revisa la jerarquía de subtítulos.`, index);
    let headingLevel = 2;
    content.querySelectorAll('h3,h4,h5,h6').forEach(heading => {
      const level = Number(heading.tagName[1]);
      if (level > headingLevel + 1) warn('heading-jump', `Sección ${index + 1}: hay un salto en la jerarquía de encabezados.`, index);
      headingLevel = level;
    });
    images.forEach((image: any) => {
      if ((image.url || image.preview) && !image.decorative && !image.alt?.trim()) warn('image-alt', `Sección ${index + 1}: describe una imagen informativa o márcala como decorativa.`, index);
      if (!image.url && !image.preview) warn('empty-image', `Sección ${index + 1}: hay un bloque de imagen sin archivo.`, index);
    });
    content.querySelectorAll('img').forEach(image => {
      if (!image.getAttribute('alt')?.trim() && image.getAttribute('role') !== 'presentation' && image.getAttribute('aria-hidden') !== 'true') warn('inline-image-alt', `Sección ${index + 1}: una imagen dentro del texto no tiene descripción; puedes usar las imágenes de sección con texto alternativo.`, index);
    });
    content.querySelectorAll('a').forEach(anchor => {
      if (!anchor.hasAttribute('href') && anchor.id && !anchor.textContent?.trim()) return;
      checkLink(anchor.getAttribute('href') || '', anchor.textContent || anchor.getAttribute('aria-label') || anchor.querySelector('img')?.getAttribute('alt') || '', index);
    });
    (section.links || []).forEach((link: any) => checkLink(link.link || '', link.title || '', index));
  });
  if (!linkCount) warn('no-links', 'No hay enlaces. Valora si conviene enlazar contenido relacionado o una acción útil para el lector.');
  return report;
}
