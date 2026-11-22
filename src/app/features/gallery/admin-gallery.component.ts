import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';
import { DirectusApiService } from '../../core/services/directus-api.service';
import { AdminHeaderComponent } from '../admin/admin-header.component';
import { emptyGalleryImage, emptyGallerySettings, GalleryService, ImageItem } from './gallery.service';

@Component({
  selector: 'app-admin-gallery', standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AdminHeaderComponent],
  templateUrl: './admin-gallery.component.html', styleUrls: ['./admin-gallery.component.css'],
})
export class AdminGalleryComponent implements OnInit, OnDestroy {
  @ViewChild('editorPanel') editorPanel?: ElementRef<HTMLElement>;
  @ViewChild('feedback') feedback?: ElementRef<HTMLElement>;
  @ViewChild('imageForm') imageForm?: NgForm;
  @ViewChild('pageForm') pageForm?: NgForm;
  images: ImageItem[] = [];
  settings = emptyGallerySettings();
  editor = emptyGalleryImage();
  tab: 'images' | 'page' = 'images';
  query = '';
  category = '';
  status = '';
  tagsText = '';
  file: File | null = null;
  preview = '';
  loading = true;
  ready = false;
  saving = false;
  error = '';
  message = '';

  constructor(private readonly gallery: GalleryService, private readonly api: DirectusApiService,
    private readonly cdr: ChangeDetectorRef) {}

  ngOnInit(): void { void this.load(); }
  async load(): Promise<void> {
    this.loading = true;
    this.ready = false;
    this.error = '';
    try {
      const result = await firstValueFrom(forkJoin({ images: this.gallery.getImages(true), settings: this.gallery.getSettings(true) }));
      this.images = result.images;
      this.settings = result.settings;
      this.ready = true;
    } catch { this.error = 'No se pudo cargar la galería. Revisa la conexión y los permisos del administrador.'; }
    finally { this.loading = false; this.cdr.markForCheck(); }
  }
  get categories(): string[] { return [...new Set(this.images.map(i => i.category))].sort(); }
  get tags(): string[] { return [...new Set(this.images.flatMap(i => i.tags))].sort(); }
  get published(): ImageItem[] { return this.images.filter(i => i.published); }
  get filtered(): ImageItem[] {
    const query = this.query.trim().toLocaleLowerCase('es');
    return this.images.filter(i => (!this.category || i.category === this.category)
      && (!this.status || i.published === (this.status === 'published'))
      && (!query || [i.title, i.description, i.category, ...i.tags].join(' ').toLocaleLowerCase('es').includes(query)));
  }
  get dirty(): boolean { return !!(this.imageForm?.dirty || this.pageForm?.dirty || this.file); }
  canLeave(): boolean { return !this.saving && (!this.dirty || window.confirm('Tienes cambios sin guardar. ¿Quieres descartarlos?')); }
  @HostListener('window:beforeunload', ['$event']) beforeUnload(event: BeforeUnloadEvent): void {
    if (this.dirty || this.saving) event.preventDefault();
  }
  changeTab(tab: 'images' | 'page'): void {
    if (tab === this.tab || !this.canLeave()) return;
    this.clearFile(); this.editor = emptyGalleryImage(); this.tagsText = '';
    this.imageForm?.resetForm(this.editor); this.pageForm?.resetForm();
    this.tab = tab; this.error = ''; this.message = '';
    // Re-read persisted settings when returning after discarding page edits.
    if (tab === 'page') void this.load();
  }
  edit(item?: ImageItem): void {
    if (!this.canLeave()) return;
    this.clearFile();
    this.editor = item ? { ...item, tags: [...item.tags] } : { ...emptyGalleryImage(), sort_order: this.images.length };
    this.tagsText = this.editor.tags.join(', ');
    this.imageForm?.resetForm({ ...this.editor, tagsText: this.tagsText });
    this.error = ''; this.message = '';
    if (window.matchMedia('(max-width: 900px)').matches) this.editorPanel?.nativeElement.scrollIntoView({ block: 'start' });
  }
  selectFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || this.saving) return;
    this.error = '';
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
      this.showError('Selecciona una imagen JPG, PNG, WebP o AVIF.'); return;
    }
    if (!file.size || file.size > 10 * 1024 * 1024) {
      this.showError('La imagen debe pesar entre 1 byte y 10 MB.'); return;
    }
    this.clearFile(); this.file = file; this.preview = URL.createObjectURL(file);
  }
  clearFile(): void {
    if (this.preview) URL.revokeObjectURL(this.preview);
    this.preview = ''; this.file = null;
  }
  async saveImage(): Promise<void> {
    if (this.saving || !this.ready) return;
    this.error = ''; this.message = '';
    if (!this.editor.title.trim() || !this.editor.alt.trim() || !this.editor.category.trim() || (!this.file && !this.editor.src)) {
      this.showError('Agrega una imagen, título, texto alternativo y categoría.'); return;
    }
    if (!Number.isInteger(this.editor.sort_order) || this.editor.sort_order < 0) {
      this.showError('El orden debe ser un entero mayor o igual a cero.'); return;
    }
    const tags = [...new Set(this.tagsText.split(',').map(t => t.trim().toLocaleLowerCase('es')).filter(Boolean))];
    if (tags.length > 20 || tags.some(t => t.length > 50)) { this.showError('Usa hasta 20 etiquetas de máximo 50 caracteres.'); return; }
    this.saving = true;
    try {
      if (this.file) {
        const image = new Image();
        const probeUrl = URL.createObjectURL(this.file);
        try {
          image.src = probeUrl;
          await image.decode();
        } catch {
          this.showError('El archivo no contiene una imagen válida. Selecciona otra imagen.');
          return;
        } finally {
          URL.revokeObjectURL(probeUrl);
        }
        const uploaded = await firstValueFrom(this.api.uploadFile(this.file, this.editor.title.trim(), { auth: true }));
        this.editor.src = this.api.assetUrl(uploaded.data.id);
        // Keep the uploaded URL for retries if the subsequent record save fails.
        this.clearFile();
        this.imageForm?.form.markAsDirty();
      }
      const result = await firstValueFrom(this.gallery.saveImage({ ...this.editor,
        title: this.editor.title.trim(), alt: this.editor.alt.trim(), category: this.editor.category.trim().toLocaleLowerCase('es'),
        description: this.editor.description.trim(), author: this.editor.author.trim(), date: this.editor.date || null, tags }));
      this.images = [...this.images.filter(i => i.id !== result.id), result].sort((a, b) => a.sort_order - b.sort_order || a.id! - b.id!);
      this.editor = { ...result, tags: [...(result.tags || [])] }; this.tagsText = tags.join(', ');
      this.imageForm?.resetForm({ ...this.editor, tagsText: this.tagsText });
      this.message = 'Imagen guardada.';
    } catch { this.error = 'No se pudo guardar la imagen. Tus cambios siguen aquí; puedes intentarlo de nuevo.'; }
    finally { this.finishSaving(); }
  }
  async remove(item: ImageItem): Promise<void> {
    if (this.saving || !item.id || !this.canLeave() || !window.confirm(`¿Eliminar «${item.title}» de la galería? El archivo se conservará en la biblioteca de medios.`)) return;
    this.saving = true; this.error = ''; this.message = '';
    try {
      await firstValueFrom(this.gallery.deleteImage(item.id));
      this.images = this.images.filter(i => i.id !== item.id);
      this.clearFile(); this.editor = emptyGalleryImage(); this.tagsText = '';
      this.imageForm?.resetForm({ ...this.editor, tagsText: '' });
      this.message = 'Imagen eliminada.';
    } catch { this.error = 'No se pudo eliminar la imagen. Inténtalo de nuevo.'; }
    finally { this.finishSaving(); }
  }
  async savePage(): Promise<void> {
    if (this.saving || !this.ready) return;
    this.error = ''; this.message = '';
    if (!this.settings.heading.trim() || !this.settings.seo_title.trim() || !this.settings.seo_description.trim()) {
      this.showError('Completa el encabezado, título SEO y descripción SEO.'); return;
    }
    this.saving = true;
    try {
      this.settings = await firstValueFrom(this.gallery.saveSettings(this.settings));
      this.pageForm?.resetForm(this.settings); this.message = 'Página guardada.';
    } catch { this.error = 'No se pudo guardar la página. Tus cambios siguen aquí.'; }
    finally { this.finishSaving(); }
  }
  private showError(message: string): void {
    this.error = message;
    this.feedback?.nativeElement.scrollIntoView({ block: 'start' });
  }

  private finishSaving(): void {
    this.saving = false;
    this.cdr.markForCheck();
    this.feedback?.nativeElement.scrollIntoView({ block: 'start' });
  }

  ngOnDestroy(): void { this.clearFile(); }
}
