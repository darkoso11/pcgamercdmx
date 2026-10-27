import { ArticleLink } from '../models/types';
import { blogLinkRel, InlineBlogLink, safeBlogLink } from '../services/blog-link.utils';

let registration: Promise<void> | undefined;

// Register before Quill imports HTML so rel/target survive editing and recovery.
export function prepareBlogLinkFormats(): Promise<void> {
  return registration ??= import('quill').then(({ default: Quill }) => {
    const parchment = Quill.import('parchment') as any;
    Quill.register(new parchment.Attributor('blogLinkRel', 'rel', { scope: parchment.Scope.INLINE }), true);
    Quill.register(new parchment.Attributor('blogLinkTarget', 'target', { scope: parchment.Scope.INLINE, whitelist: ['_self', '_blank'] }), true);
  });
}

function inlineRange(editor: any, source: InlineBlogLink): { index: number; length: number } {
  const anchor = editor?.root.querySelectorAll('a')[source.index] as HTMLAnchorElement | undefined;
  if (!anchor || anchor.getAttribute('href') !== source.originalHref || anchor.textContent !== source.originalTitle) throw new Error('El texto cambió. Selecciona de nuevo el enlace que deseas editar.');
  const blot = editor.constructor.find(anchor);
  if (!blot) throw new Error('No se pudo localizar el enlace en el editor.');
  return { index: blot.offset(editor.scroll), length: blot.length() };
}

export function writeInlineBlogLink(editor: any, link: ArticleLink, source?: InlineBlogLink): void {
  const href = safeBlogLink(link.link);
  if (!editor) throw new Error('Espera a que termine de cargar el editor de texto.');
  if (!href || !link.title.trim()) throw new Error('Completa el texto y una URL válida.');
  const range = source ? inlineRange(editor, source) : editor.getSelection(true) || { index: Math.max(0, editor.getLength() - 1), length: 0 };
  if (!source || editor.getText(range.index, range.length) !== link.title) {
    if (range.length) editor.deleteText(range.index, range.length, 'user');
    editor.insertText(range.index, link.title, 'user');
  }
  editor.formatText(range.index, link.title.length, { link: href, blogLinkRel: blogLinkRel(link) || false, blogLinkTarget: link.newTab ? '_blank' : '_self' }, 'user');
  editor.setSelection(range.index + link.title.length, 0, 'silent');
}

export function removeInlineBlogLink(editor: any, source: InlineBlogLink): void {
  if (!editor) throw new Error('Espera a que termine de cargar el editor de texto.');
  const range = inlineRange(editor, source);
  editor.formatText(range.index, range.length, { blogLinkRel: false, blogLinkTarget: false, link: false }, 'user');
}
