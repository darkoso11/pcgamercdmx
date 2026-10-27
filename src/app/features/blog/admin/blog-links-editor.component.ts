import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, Input, OnDestroy } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ArticleLink } from '../models/types';
import { BlogLinkKind, BlogLinkResult, BlogLinkSearchService } from '../services/blog-link-search.service';
import { blogLinkRel, InlineBlogLink, inlineBlogLinks, safeBlogLink } from '../services/blog-link.utils';
import { removeInlineBlogLink, writeInlineBlogLink } from './blog-link-formats';

export function createBlogLinkForm(fb: FormBuilder, link?: ArticleLink): FormGroup {
  return fb.group({ originalLink: [link || null], title: [link?.title || ''], link: [link?.link || ''], newTab: [link?.newTab === true], rel: [link?.rel || ''] });
}

@Component({
  selector: 'app-blog-links-editor', standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './blog-links-editor.component.html',
  styles: [`:host{display:block;min-width:0} input:not([type=checkbox]),select{display:block;width:100%;min-width:0;padding:.65rem;border:1px solid #64748b;border-radius:.4rem;background:#07111f;color:#fff} button{padding:.55rem .8rem;border:1px solid #67e8f9;border-radius:.4rem} button:disabled{opacity:.5} a,span{overflow-wrap:anywhere} label{display:block;margin:.8rem 0 .35rem} button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #fff;outline-offset:3px}`],
})
export class BlogLinksEditorComponent implements OnDestroy {
  @Input({ required: true }) links!: FormArray;
  @Input() sectionNumber = 1;
  @Input() editor: any;
  @Input() set html(value: string) {
    if (value === this.previousHtml) return;
    this.previousHtml = value;
    this.inlineLinks = inlineBlogLinks(value || '', this.doc);
  }
  inlineLinks: InlineBlogLink[] = [];
  private previousHtml?: string;
  draft: FormGroup;
  kind: BlogLinkKind = 'article';
  query = '';
  results: BlogLinkResult[] = [];
  searching = false;
  searched = false;
  searchError = '';
  error = '';
  editingRelated: number | null = null;
  editingInline?: InlineBlogLink;
  private searchSubscription?: Subscription;

  constructor(private readonly fb: FormBuilder, private readonly finder: BlogLinkSearchService, @Inject(DOCUMENT) private readonly doc: Document, private readonly cdr: ChangeDetectorRef) {
    this.draft = createBlogLinkForm(fb);
  }

  ngOnDestroy(): void { this.searchSubscription?.unsubscribe(); }

  resetSearch(): void {
    this.searchSubscription?.unsubscribe();
    this.searching = false;
    this.results = [];
    this.searched = false;
    this.searchError = '';
  }

  search(): void {
    this.searchSubscription?.unsubscribe();
    this.results = [];
    this.searched = false;
    this.searchError = '';
    if (this.query.trim().length < 2) { this.searchError = 'Escribe al menos dos caracteres para buscar.'; return; }
    this.searching = true;
    this.searchSubscription = this.finder.search(this.kind, this.query).subscribe({
      next: results => { this.results = results; this.searched = true; this.searching = false; this.cdr.markForCheck(); },
      error: () => { this.searching = false; this.searchError = 'No se pudo consultar el contenido público. Revisa la conexión e inténtalo de nuevo.'; this.cdr.markForCheck(); },
    });
  }

  choose(result: BlogLinkResult): void {
    this.draft.patchValue({ title: this.draft.value.title || result.title, link: result.link });
    this.results = [];
    this.searched = false;
  }

  reset(): void {
    this.draft.reset({ title: '', link: '', newTab: false, rel: '', originalLink: null });
    this.editingRelated = null;
    this.editingInline = undefined;
    this.error = '';
  }

  editRelated(index: number): void {
    this.reset();
    this.editingRelated = index;
    const link = this.links.at(index).value;
    this.draft.patchValue({ ...link, rel: blogLinkRel({ rel: link.rel }) || '' });
  }

  editInline(link: InlineBlogLink): void {
    this.reset();
    this.editingInline = link;
    this.draft.patchValue({ ...link, rel: blogLinkRel({ rel: link.rel }) || '' });
  }

  private value(): ArticleLink | undefined {
    const value = this.draft.getRawValue();
    const href = safeBlogLink(value.link);
    if (!value.title?.trim() || !href) { this.error = 'Añade texto descriptivo y una URL válida (ruta /interna, #ancla, http, https, mailto o tel).'; return undefined; }
    this.error = '';
    return { title: value.title.trim(), link: href, newTab: !!value.newTab, rel: blogLinkRel({ rel: value.rel }) || '' };
  }

  saveRelated(): void {
    const value = this.value();
    if (!value) return;
    if (this.editingRelated !== null) this.links.at(this.editingRelated).patchValue(value);
    else this.links.push(createBlogLinkForm(this.fb, value));
    this.links.markAsDirty();
    this.reset();
  }

  saveInline(): void {
    const value = this.value();
    if (!value) return;
    try { writeInlineBlogLink(this.editor, value, this.editingInline); this.reset(); }
    catch (error) { this.error = (error as Error).message; }
  }

  removeRelated(index: number): void {
    this.links.removeAt(index);
    this.links.markAsDirty();
    this.reset();
  }

  moveRelated(index: number, direction: number): void {
    const next = index + direction;
    if (next < 0 || next >= this.links.length) return;
    const control = this.links.at(index);
    this.links.removeAt(index);
    this.links.insert(next, control);
    this.links.markAsDirty();
    this.reset();
  }

  removeInline(link: InlineBlogLink): void {
    try { removeInlineBlogLink(this.editor, link); }
    catch (error) { this.error = (error as Error).message; }
  }
}
