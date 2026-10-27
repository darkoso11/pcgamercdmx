import { ChangeDetectorRef, Component, HostListener, Inject, Optional, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { firstValueFrom, Subscription } from 'rxjs';
import { PrivateMediaDirective } from '../private-media.directive';
import { Article } from '../models/types';
import { BlogRevision, BlogService } from '../services/blog.service';
import { BlogDraftStore, DraftConflictError, EditorDraft, StoredEditorDraft } from '../services/blog-draft.store';
import { UploadService } from '../services/upload.service';
import { AdminHeaderComponent } from '../../admin/admin-header.component';
import { adminUrl } from '../../admin/admin-route.config';
import { buildArticleSeo } from '../services/blog-seo.utils';
import { localDateTimeToUtc, normalizeBodyHeadings, normalizeVideoUrl, utcDateTimeToLocal } from '../services/blog-content.utils';
import { reviewBlogArticle } from '../services/blog-review.utils';
import { BlogLinksEditorComponent, createBlogLinkForm } from './blog-links-editor.component';
import { prepareBlogLinkFormats } from './blog-link-formats';

@Component({
  selector: 'app-admin-article-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, QuillModule, AdminHeaderComponent, PrivateMediaDirective, BlogLinksEditorComponent],
  templateUrl: './admin-article-editor.component.html',
  styleUrls: ['./admin-article-editor.component.css']
})
export class AdminArticleEditorComponent implements OnInit, OnDestroy {
  readonly maxVideoSizeMb = 250;
  readonly adminBlogUrl = adminUrl('blog');
  readonly prepareBlogLinkFormats = prepareBlogLinkFormats;
  private readonly textEditors = new WeakMap<object, any>();
  form: FormGroup;
  isNew = true;
  saving = false;
  uploading = false;
  selectedCoverFile: File | null = null;
  coverImagePreview: string | null = null;
  private coverPreviewFile: File | null = null;
  private coverUploadPromise: Promise<void> | null = null;
  errorMsg = '';
  successMsg = '';
  hasUnsavedChanges = false;
  localSavedAt = '';
  localPending = false;
  autosaveError = '';
  recoveryCandidate?: StoredEditorDraft;
  revisions: BlogRevision[] = [];
  historyOpen = false;
  historyBusy = false;
  historyError = '';
  remoteConflict = false;
  loadingArticle = false;
  loadFailed = false;
  private editorReady = false;
  private recoveryInitialized = false;
  private returningFromPreview = false;
  private previewLocalToken?: string;
  private destroyed = false;
  private suppressRecovery = false;
  private allowNavigation = false;
  private localConflict = false;
  private localKey?: string;
  private localToken?: string;
  private changeSequence = 0;
  private serverVersion = '';
  private autosaveTimer?: ReturnType<typeof setTimeout>;
  private editorSubscription?: Subscription;
  private articleSubscription?: Subscription;
  private writes: Promise<void> = Promise.resolve();
  private recoveredImageUrls: string[] = [];

  categories: any[] = [];
  subcategories: any[] = [];
  filteredSubcategories: any[] = [];
  showNewCategory = false;
  showNewSubcategory = false;
  newCategoryName = '';
  newSubcategoryName = '';

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 3 }, { 'header': 4 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ]
  };

  constructor(
    private fb: FormBuilder,
    private blogService: BlogService,
    private uploadService: UploadService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    @Optional() private readonly draftStore: BlogDraftStore | null = null,
    @Inject(DOCUMENT) private readonly editorDocument: Document = document
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      slug: ['', Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)],
      summary: ['', [Validators.required, Validators.minLength(10)]],
      seoTitle: ['', Validators.maxLength(255)],
      seoDescription: [''],
      seoImage: ['', Validators.pattern(/^https?:\/\/[^\s]+$/)],
      publishedAt: [''],
      categoryId: ['', Validators.required],
      subCategoryId: [''],
      tags: [''],
      coverImage: [''],
      coverAlt: [''],
      coverDecorative: [false],
      published: [false],
      scheduledAt: [''],
      sections: this.fb.array([])
    });
  }

  get seoPreview() {
    return buildArticleSeo({ ...this.form.getRawValue(), title: this.form.value.title || 'Título del artículo', slug: this.form.value.slug || 'url-del-articulo' });
  }

  get sectionsArray(): FormArray {
    return this.form.get('sections') as FormArray;
  }

  get reviewReport() { return reviewBlogArticle(this.form.getRawValue(), this.editorDocument); }
  getSectionLinks(index: number): FormArray { return this.sectionsArray.at(index).get('links') as FormArray; }
  setTextEditor(section: object, editor: any): void { this.textEditors.set(section, editor); this.cdr.markForCheck(); }
  getTextEditor(section: object): any { return this.textEditors.get(section); }

  ngOnInit() {
    this.editorSubscription?.unsubscribe();
    this.editorSubscription = this.form.valueChanges.subscribe(() => this.editorChanged());
    const id = this.route.snapshot.params['id'];
    this.isNew = !id;
    this.returningFromPreview = this.restorePreviewDraft();
    if (!this.returningFromPreview) {
      if (id) this.loadArticle(id);
      else this.addSection();
    }
    if (this.returningFromPreview || !id) {
      this.editorReady = true;
      if (this.returningFromPreview) this.hasUnsavedChanges = true;
      void this.initializeRecovery();
    }
    this.loadCategories();
    this.loadSubcategories();
  }

  ngOnDestroy(): void {
    clearTimeout(this.autosaveTimer);
    if (!this.allowNavigation) void this.persistLocalDraft();
    this.destroyed = true;
    this.editorSubscription?.unsubscribe();
    this.articleSubscription?.unsubscribe();
    this.recoveredImageUrls.forEach(url => URL.revokeObjectURL(url));
    for (const control of this.sectionsArray.controls) {
      this.releaseVideoPreview(control as FormGroup);
    }
  }

  loadCategories() {
    this.blogService.getCategories().subscribe({
      next: (res: any) => {
        this.categories = Array.isArray(res) ? res : (res.data || res);
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMsg = `No se pudieron cargar las categorías del blog: ${this.requestErrorMessage(error)}`;
        this.cdr.detectChanges();
      },
    });
  }

  loadSubcategories() {
    this.blogService.getSubCategories().subscribe({
      next: (res: any) => {
        this.subcategories = Array.isArray(res) ? res : (res.data || res);
        this.updateFilteredSubcategories();
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMsg = `No se pudieron cargar las subcategorías del blog: ${this.requestErrorMessage(error)}`;
        this.cdr.detectChanges();
      },
    });
  }

  onCategoryChange() {
    this.updateFilteredSubcategories();
    // Reset subcategory if not valid for new category
    const selectedSubId = this.form.value.subCategoryId;
    if (selectedSubId && !this.filteredSubcategories.find(s => s._id === selectedSubId)) {
      this.form.patchValue({ subCategoryId: '' });
    }
  }

  updateFilteredSubcategories() {
    const categoryId = this.form.value.categoryId;
    this.filteredSubcategories = categoryId ? this.subcategories.filter(s => s.categoryId === categoryId) : [];
  }

  loadArticle(id: string) {
    this.articleSubscription?.unsubscribe();
    this.loadingArticle = true;
    this.loadFailed = false;
    this.articleSubscription = this.blogService.getById(id).subscribe({
      next: (article) => {
        if (this.destroyed) return;
        this.serverVersion = article.updatedAt || '';
        this.populateArticle(article);
        this.loadingArticle = false;
        this.editorReady = true;
        void this.initializeRecovery();
      },
      error: () => {
        this.loadingArticle = false;
        this.loadFailed = true;
        this.errorMsg = 'No se pudo cargar el artículo';
        this.cdr.detectChanges();
      }
    });
  }

  private populateArticle(article: Article): void {
    this.sectionsArray.clear();
    (article.sections || []).forEach((section: any) => {
      const media = section.media || [];
      const fileVideo = media.find((item: any) => item.kind === 'video-file');
      const embedVideo = media.find((item: any) => item.kind === 'video-embed');
      const sectionForm = this.fb.group({
        originalSection: [section],
        originalFileVideo: [fileVideo || null],
        originalEmbedVideo: [embedVideo || null],
        initialVideoTitle: [fileVideo?.title || embedVideo?.title || ''],
        title: [section.title || ''],
        text: [section.text || ''],
        links: this.fb.array((section.links || section.originalSection?.links || []).map((link: any) => createBlogLinkForm(this.fb, link))),
        order: [section.order || this.sectionsArray.length],
        images: this.fb.array((section.images || []).map((image: any) => this.fb.group({
          originalImage: [image],
          url: [image.url || ''],
          fileId: [image.fileId || ''],
          filename: [image.filename || ''],
          mimeType: [image.mimeType || ''],
          alt: [image.alt || ''],
          decorative: [image.decorative === true],
          preview: [image.url || ''],
          order: [image.order || 0]
        }))),
        imageLayout: [section.imageLayout || '1'],
        existingMedia: [media.filter(
          (item: any) =>
            item !== fileVideo && item !== embedVideo
        )],
        videoUrl: [this.editableEmbedUrl(embedVideo)],
        videoTitle: [fileVideo?.title || embedVideo?.title || ''],
        videoFileId: [fileVideo?.fileId || ''],
        videoFileUrl: [fileVideo?.url || ''],
        videoFileName: [fileVideo?.filename || ''],
        videoFileType: [fileVideo?.mimeType || ''],
        videoPreviewUrl: ['']
      });
      this.sectionsArray.push(sectionForm);
    });

    if (this.sectionsArray.length === 0) {
      this.addSection();
    }

    this.form.patchValue({
      title: article.title,
      slug: article.slug || '',
      summary: article.summary || '',
      seoTitle: article.seoTitle || '',
      seoDescription: article.seoDescription || '',
      seoImage: article.seoImage || '',
      publishedAt: article.publishedAt || '',
      categoryId: article.categoryId || '',
      subCategoryId: article.subCategoryId || '',
      tags: (article.tags || []).join(', '),
      coverImage: article.coverImage || '',
      coverAlt: article.coverImage?.alt || '',
      coverDecorative: article.coverImage?.decorative === true,
      published: article.published,
      scheduledAt: article.publishedAt
        ? utcDateTimeToLocal(article.publishedAt)
        : ''
    });
    this.coverImagePreview = article.coverImage?.url || null;
    this.updateFilteredSubcategories();
    this.cdr.detectChanges();
  }

  addSection() {
    const sectionForm = this.fb.group({
      title: [''],
      text: [''],
      links: this.fb.array([]),
      order: [this.sectionsArray.length],
      images: this.fb.array([]),
      imageLayout: ['1'], // 1, 2, 3, o 4 columnas
      existingMedia: [[]],
      videoUrl: [''],
      videoTitle: [''],
      videoFileId: [''],
      videoFileUrl: [''],
      videoFileName: [''],
      videoFileType: [''],
      videoPreviewUrl: ['']
    });
    this.sectionsArray.push(sectionForm);
  }

  getSectionImages(sectionIndex: number): FormArray {
    return (this.sectionsArray.at(sectionIndex) as FormGroup).get('images') as FormArray;
  }

  addImageToSection(sectionIndex: number) {
    const imagesArray = this.getSectionImages(sectionIndex);
    const imageForm = this.fb.group({
      url: [''],
      fileId: [''],
      filename: [''],
      mimeType: [''],
      alt: [''],
      decorative: [false],
      preview: [''],
      order: [imagesArray.length]
    });
    imagesArray.push(imageForm);
  }

  removeImageFromSection(sectionIndex: number, imageIndex: number) {
    const imagesArray = this.getSectionImages(sectionIndex);
    imagesArray.removeAt(imageIndex);
  }

  onSectionImageSelect(event: any, sectionIndex: number, imageIndex: number) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.errorMsg = 'La imagen no puede ser mayor a 5MB';
        return;
      }
      const imageForm = this.getSectionImages(sectionIndex).at(imageIndex) as FormGroup;
      imageForm.patchValue({ fileId: '', url: '' });
      const reader = new FileReader();
      reader.onload = (e) => {
        if ((imageForm as any)._file !== file) return;
        imageForm.patchValue({ preview: e.target?.result as string });
      };
      reader.readAsDataURL(file);
      (imageForm as any)._file = file;
      void this.uploadSectionImage(sectionIndex, imageIndex).catch(() => undefined);
    }
  }

  async uploadSectionImage(sectionIndex: number, imageIndex: number) {
    const imagesArray = this.getSectionImages(sectionIndex);
    const imageForm = imagesArray.at(imageIndex) as FormGroup;
    const file = (imageForm as any)._file;

    if (!file) return;

    const pendingUpload = (imageForm as any)._uploadPromise as Promise<void> | undefined;
    if (pendingUpload) {
      return pendingUpload;
    }

    this.uploading = true;
    this.errorMsg = '';
    const upload = (async () => {
      try {
        while ((imageForm as any)._file) {
          const selected = (imageForm as any)._file as File;
          try {
            const uploaded = await this.uploadService.uploadFile(selected);
            if ((imageForm as any)._file !== selected) continue;
            imageForm.patchValue({ ...uploaded, preview: uploaded.url });
            delete (imageForm as any)._file;
            this.successMsg = 'Imagen lista para guardar';
            return;
          } catch (error) {
            if ((imageForm as any)._file !== selected) continue;
            this.errorMsg = `Error al subir la imagen: ${this.requestErrorMessage(error)}`;
            throw error;
          }
        }
      } finally {
        delete (imageForm as any)._uploadPromise;
        this.uploading = false;
        this.cdr.markForCheck();
      }
    })();
    (imageForm as any)._uploadPromise = upload;
    return upload;
  }

  removeSection(index: number) {
    this.releaseVideoPreview(this.sectionsArray.at(index) as FormGroup);
    this.sectionsArray.removeAt(index);
  }

  moveSectionUp(index: number) {
    if (index > 0) {
      const sections = this.sectionsArray;
      const current = sections.at(index);
      sections.removeAt(index);
      sections.insert(index - 1, current);
      sections.markAsDirty();
    }
  }

  moveSectionDown(index: number) {
    if (index < this.sectionsArray.length - 1) {
      const sections = this.sectionsArray;
      const current = sections.at(index);
      sections.removeAt(index);
      sections.insert(index + 1, current);
      sections.markAsDirty();
    }
  }

  onCoverImageSelect(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        this.errorMsg = 'La imagen no puede ser mayor a 5MB';
        return;
      }
      this.selectedCoverFile = file;
      this.coverPreviewFile = file;
      this.form.patchValue({ coverImage: '' });
      const reader = new FileReader();
      reader.onload = (e) => {
        if (this.coverPreviewFile !== file) return;
        this.coverImagePreview = e.target?.result as string;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
      void this.uploadCoverImage().catch(() => undefined);
    }
  }

  async uploadCoverImage() {
    if (!this.selectedCoverFile) return;
    
    if (this.coverUploadPromise) {
      return this.coverUploadPromise;
    }

    this.uploading = true;
    this.errorMsg = '';
    this.coverUploadPromise = (async () => {
      try {
        while (this.selectedCoverFile) {
          const file = this.selectedCoverFile;
          try {
            const uploaded = await this.uploadService.uploadFile(file);
            if (this.selectedCoverFile !== file) continue;
            this.form.patchValue({ coverImage: { ...uploaded, alt: this.form.value.coverAlt || '', decorative: this.form.value.coverDecorative } });
            this.selectedCoverFile = null;
            this.successMsg = 'Portada lista para guardar';
            return;
          } catch (error) {
            if (this.selectedCoverFile !== file) continue;
            this.errorMsg = `Error al subir la imagen: ${this.requestErrorMessage(error)}`;
            throw error;
          }
        }
      } finally {
        this.coverUploadPromise = null;
        this.uploading = false;
        this.cdr.markForCheck();
      }
    })();
    return this.coverUploadPromise;
  }

  createCategoryInline() {
    const name = this.newCategoryName.trim();
    if (!name) return;
    this.blogService.createCategory({ name }).subscribe({
      next: (category) => {
        this.categories = [...this.categories, category];
        this.form.patchValue({ categoryId: category._id || '' });
        this.newCategoryName = '';
        this.showNewCategory = false;
        this.updateFilteredSubcategories();
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'No se pudo crear la categoría. Verifica los permisos de Directus.';
        this.cdr.detectChanges();
      },
    });
  }

  createSubcategoryInline() {
    const name = this.newSubcategoryName.trim();
    const categoryId = this.form.value.categoryId;
    if (!name || !categoryId) return;
    this.blogService.createSubCategory({ name, categoryId }).subscribe({
      next: (subcategory) => {
        this.subcategories = [...this.subcategories, subcategory];
        this.updateFilteredSubcategories();
        this.form.patchValue({ subCategoryId: subcategory._id || '' });
        this.newSubcategoryName = '';
        this.showNewSubcategory = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'No se pudo crear la subcategoría. Verifica los permisos de Directus.';
        this.cdr.detectChanges();
      },
    });
  }

  onSectionVideoSelect(event: Event, sectionIndex: number) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!this.isVideoFile(file)) {
      this.errorMsg = 'Selecciona un archivo de video válido';
      return;
    }
    if (file.size > this.maxVideoSizeMb * 1024 * 1024) {
      this.errorMsg = `El video no puede ser mayor a ${this.maxVideoSizeMb} MB`;
      input.value = '';
      return;
    }
    const section = this.sectionsArray.at(sectionIndex) as FormGroup;
    this.releaseVideoPreview(section);
    (section as any)._videoFile = file;
    const videoPreviewUrl = typeof URL !== 'undefined' && URL.createObjectURL
      ? URL.createObjectURL(file)
      : '';
    section.patchValue({
      videoFileId: '',
      videoFileUrl: '',
      videoFileName: file.name,
      videoFileType: file.type,
      videoTitle: section.value.videoTitle || file.name,
      videoPreviewUrl,
    });
    void this.uploadSectionVideo(sectionIndex).catch(() => undefined);
  }

  async uploadSectionVideo(sectionIndex: number) {
    const section = this.sectionsArray.at(sectionIndex) as FormGroup;
    if (!(section as any)._videoFile) return;
    const pendingUpload = (section as any)._videoUploadPromise as Promise<void> | undefined;
    if (pendingUpload) {
      return pendingUpload;
    }

    this.uploading = true;
    this.errorMsg = '';
    const upload = (async () => {
      try {
        while (true) {
          const file = (section as any)._videoFile as File | undefined;
          if (!file) return;
          try {
            const uploaded = await this.uploadService.uploadFile(file);
            if ((section as any)._videoFile !== file) {
              continue;
            }
            section.patchValue({
              videoFileId: uploaded.fileId,
              videoFileUrl: uploaded.url,
              videoFileName: uploaded.filename,
              videoFileType: uploaded.mimeType,
            });
            this.successMsg = 'Video listo para guardar';
            return;
          } catch (error) {
            if ((section as any)._videoFile !== file) {
              continue;
            }
            this.errorMsg = `Error al subir el video: ${this.requestErrorMessage(error)}`;
            throw error;
          }
        }
      } finally {
        delete (section as any)._videoUploadPromise;
        this.uploading = false;
        this.cdr.markForCheck();
      }
    })();
    (section as any)._videoUploadPromise = upload;
    return upload;
  }

  async openPreview() {
    if (this.saving) return;
    this.saving = true;
    try {
      await this.uploadPendingMedia();
      const preview = this.form.getRawValue();
      this.applyCoverDescription(preview);
      preview.tags = typeof preview.tags === 'string'
        ? preview.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : preview.tags;
      preview.sections = this.buildPersistedSections(
        preview.sections,
        preview.title
      );
      const id = this.route.snapshot.params['id'];
      const returnUrl = this.isNew || !id
        ? adminUrl('blog/new')
        : adminUrl(`blog/${id}/edit`);
      sessionStorage.setItem('pcg_blog_editor_draft', JSON.stringify({
        returnUrl,
        article: preview,
        scheduledAt: this.form.value.scheduledAt,
        coverAlt: this.form.value.coverAlt,
        coverDecorative: this.form.value.coverDecorative,
        serverVersion: this.serverVersion,
      }));
      sessionStorage.setItem('pcg_blog_preview', JSON.stringify({
        article: preview,
        returnUrl,
      }));
      this.localPending = true;
      this.changeSequence++;
      await this.persistLocalDraft();
      const editorDraft = JSON.parse(sessionStorage.getItem('pcg_blog_editor_draft') || '{}');
      editorDraft.localToken = this.localToken;
      sessionStorage.setItem('pcg_blog_editor_draft', JSON.stringify(editorDraft));
      this.allowNavigation = true;
      await this.router.navigate([adminUrl('blog/preview')]);
    } catch (error) {
      this.errorMsg = `No se pudo generar la vista previa: ${this.requestErrorMessage(error)}`;
    } finally {
      this.form.enable({ emitEvent: false });
      this.saving = false;
      if (!this.destroyed) this.allowNavigation = false;
      this.cdr.markForCheck();
    }
  }

  async onSave(mode: 'draft' | 'publish' | 'schedule' = 'draft') {
    if (this.saving || this.historyBusy || this.loadingArticle || this.loadFailed) return;
    if (this.recoveryCandidate) { this.errorMsg = 'Elige recuperar o descartar la copia local antes de guardar.'; return; }
    if (mode !== 'draft' && this.reviewReport.errors.length) {
      this.errorMsg = 'Corrige los errores del panel de revisión antes de publicar o programar.';
      this.editorDocument.getElementById('publication-review')?.focus();
      return;
    }
    if (!this.form.valid) {
      this.errorMsg = 'Por favor completa todos los campos requeridos';
      return;
    }

    if (this.sectionsArray.length === 0) {
      this.errorMsg = 'Debe haber al menos una sección de contenido';
      return;
    }

    this.saving = true;
    this.form.disable({ emitEvent: false });
    this.errorMsg = '';
    
    try {
      if (this.draftStore && !this.isNew) {
        const latest = await firstValueFrom(this.blogService.getById(this.route.snapshot.params['id']));
        if ((latest.updatedAt || '') !== this.serverVersion) {
          this.remoteConflict = true;
          throw new Error('Otra sesión modificó el artículo. Compara la versión actual antes de guardar. Tu copia local se conserva.');
        }
      }
      await this.uploadPendingMedia();
      const formData = this.form.getRawValue();
      this.applyCoverDescription(formData);
      
      if (typeof formData.tags === 'string') {
        formData.tags = formData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
      }

      if (!formData.slug) {
        formData.slug = formData.title
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '')
          .replace(/-+/g, '-')
          .substring(0, 80).replace(/^-+|-+$/g, '');
      }

      if (!formData.slug) throw new Error('Escribe una URL con letras y números para el artículo');
      if (mode === 'schedule' && !formData.scheduledAt) {
        this.errorMsg = 'Selecciona la fecha y hora de publicación';
        this.saving = false;
        return;
      }

      if (mode === 'schedule' && Date.parse(localDateTimeToUtc(formData.scheduledAt)) <= Date.now()) {
        throw new Error('Selecciona una fecha futura para programar la publicación');
      }
      formData.published = mode !== 'draft';
      formData.publishedAt = mode === 'schedule'
        ? localDateTimeToUtc(formData.scheduledAt)
        : mode === 'publish'
          ? (formData.publishedAt && Date.parse(formData.publishedAt) <= Date.now() ? formData.publishedAt : new Date().toISOString())
          : formData.publishedAt || null;
      formData.sections = this.buildPersistedSections(
        formData.sections,
        formData.title
      );
      delete formData.scheduledAt;

      if (this.isNew) {
        await firstValueFrom(this.blogService.create(formData));
        this.hasUnsavedChanges = false;
        await this.clearLocalAfterSave();
        this.successMsg = 'Artículo creado exitosamente';
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate([this.adminBlogUrl]), 1500);
      } else {
        const id = this.route.snapshot.params['id'];
        await firstValueFrom(this.blogService.update(id, formData));
        this.hasUnsavedChanges = false;
        await this.clearLocalAfterSave();
        this.successMsg = 'Artículo actualizado exitosamente';
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate([this.adminBlogUrl]), 1500);
      }
    } catch (e) {
      this.errorMsg = `Error al guardar: ${this.requestErrorMessage(e)}`;
      await this.persistLocalDraft();
    } finally {
      this.form.enable({ emitEvent: false });
      this.saving = false;
      this.cdr.markForCheck();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: BeforeUnloadEvent): void {
    if (!this.hasUnsavedChanges || this.allowNavigation) return;
    void this.persistLocalDraft();
    event.preventDefault();
    event.returnValue = '';
  }

  canLeaveEditor(): boolean {
    return this.allowNavigation || !this.hasUnsavedChanges || window.confirm('Hay cambios sin guardar en el CMS. La copia local solo está disponible en este navegador. ¿Salir del editor?');
  }

  private editorChanged(): void {
    if (!this.editorReady || this.suppressRecovery || this.saving || this.destroyed || this.recoveryCandidate) return;
    this.hasUnsavedChanges = true;
    this.localPending = true;
    this.changeSequence++;
    clearTimeout(this.autosaveTimer);
    this.autosaveTimer = setTimeout(() => void this.persistLocalDraft(), 1000);
  }

  private async initializeRecovery(): Promise<void> {
    if (!this.draftStore || this.recoveryInitialized) return;
    this.recoveryInitialized = true;
    try {
      const key = await this.draftStore.scope(this.route.snapshot.params['id']);
      const record = await this.draftStore.read(key);
      if (this.destroyed) return;
      this.localKey = key;
      this.localToken = record?.token;
      this.localConflict = false;
      this.autosaveError = '';
      if (this.returningFromPreview && (!record || record.token === this.previewLocalToken)) {
        this.returningFromPreview = false;
        this.serverVersion = record?.draft.baseVersion || this.serverVersion;
        this.localSavedAt = record?.savedAt || '';
        await this.persistLocalDraft();
      } else if (record) this.recoveryCandidate = record;
      else if (this.hasUnsavedChanges) await this.persistLocalDraft();
      this.returningFromPreview = false;
    } catch {
      this.autosaveError = 'No se pudo habilitar la recuperación local. Guarda en el CMS para conservar tu trabajo.';
    }
    if (!this.destroyed) this.cdr.markForCheck();
  }

  private captureLocalDraft(): EditorDraft {
    const raw = structuredClone(this.form.getRawValue());
    const seen = new Set<object>();
    const removePreviews = (value: any): void => {
      if (!value || typeof value !== 'object' || seen.has(value)) return;
      seen.add(value);
      delete value.preview;
      delete value.videoPreviewUrl;
      Object.values(value).forEach(removePreviews);
    };
    removePreviews(raw);
    return {
      raw, baseVersion: this.serverVersion, cover: this.selectedCoverFile,
      images: this.sectionsArray.controls.map(section => (section.get('images') as FormArray).controls.map(image => (image as any)._file || null)),
      videos: this.sectionsArray.controls.map(section => (section as any)._videoFile || null),
    };
  }

  async persistLocalDraft(): Promise<void> {
    if (!this.draftStore || !this.localKey || !this.hasUnsavedChanges || this.recoveryCandidate || this.localConflict) return;
    if (!this.localPending && this.localToken) return;
    const key = this.localKey;
    const snapshot = this.captureLocalDraft();
    const sequence = this.changeSequence;
    this.writes = this.writes.then(async () => {
      try {
        const saved = await this.draftStore!.write(key, snapshot, this.localToken);
        this.localToken = saved.token;
        this.localSavedAt = saved.savedAt;
        if (sequence === this.changeSequence) this.localPending = false;
        this.autosaveError = '';
      } catch (error) {
        this.localConflict = error instanceof DraftConflictError;
        this.autosaveError = this.localConflict ? (error as Error).message : 'No se pudo guardar la copia local (almacenamiento no disponible o sin espacio). Guarda en el CMS.';
      }
      if (!this.destroyed) this.cdr.markForCheck();
    });
    await this.writes;
  }

  recoverLocalDraft(): void {
    if (!this.recoveryCandidate) return;
    if (this.hasUnsavedChanges && !window.confirm('Recuperar la copia sustituirá los cambios actuales del editor. ¿Continuar?')) return;
    const record = this.recoveryCandidate;
    this.applyLocalDraft(record.draft);
    this.serverVersion = record.draft.baseVersion || '';
    this.localSavedAt = record.savedAt;
    this.recoveryCandidate = undefined;
    this.hasUnsavedChanges = true;
    this.localPending = false;
    this.successMsg = 'Copia local recuperada. Revisa el contenido y guarda en el CMS cuando esté listo.';
    this.cdr.markForCheck();
  }

  async discardLocalDraft(): Promise<void> {
    if (!this.draftStore || !this.localKey || !this.recoveryCandidate) return;
    try {
      await this.draftStore.remove(this.localKey, this.localToken);
      this.localToken = undefined;
      this.recoveryCandidate = undefined;
      this.autosaveError = '';
      if (this.hasUnsavedChanges) await this.persistLocalDraft();
    } catch {
      this.autosaveError = 'La copia cambió en otra pestaña o no pudo eliminarse. Recarga antes de continuar.';
    }
    this.cdr.markForCheck();
  }

  private applyLocalDraft(draft: EditorDraft): void {
    this.suppressRecovery = true;
    try {
      this.sectionsArray.controls.forEach(section => this.releaseVideoPreview(section as FormGroup));
      this.recoveredImageUrls.forEach(url => URL.revokeObjectURL(url));
      this.recoveredImageUrls = [];
      const raw: any = draft.raw;
      const article = { ...raw, tags: typeof raw.tags === 'string' ? raw.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean) : raw.tags,
        sections: raw.sections.map((section: any) => ({ ...section, media: section.originalSection?.media || section.existingMedia || [] })) };
      this.populateArticle(article);
      this.form.patchValue(raw, { emitEvent: false });
      const imageUrl = (file: File): string => {
        const url = URL.createObjectURL(file);
        this.recoveredImageUrls.push(url);
        return url;
      };
      this.selectedCoverFile = draft.cover || null;
      this.coverPreviewFile = draft.cover || null;
      if (draft.cover) this.coverImagePreview = imageUrl(draft.cover);
      this.sectionsArray.controls.forEach((section, index) => {
        (section.get('images') as FormArray).controls.forEach((image, imageIndex) => {
          const file = draft.images[index]?.[imageIndex];
          if (file) { (image as any)._file = file; image.patchValue({ preview: imageUrl(file) }, { emitEvent: false }); }
          else image.patchValue({ preview: image.value.url || '' }, { emitEvent: false });
        });
        const video = draft.videos[index];
        if (video) {
          (section as any)._videoFile = video;
          section.patchValue({ videoPreviewUrl: URL.createObjectURL(video) }, { emitEvent: false });
        }
      });
      this.form.markAsDirty();
    } finally { this.suppressRecovery = false; }
  }

  async loadHistory(): Promise<void> {
    this.historyOpen = true;
    if (this.isNew || this.historyBusy) return;
    this.historyBusy = true;
    this.historyError = '';
    try { this.revisions = await firstValueFrom(this.blogService.getRevisions(this.route.snapshot.params['id'])); }
    catch { this.historyError = 'No se pudo cargar el historial. Comprueba la conexión y tus permisos e inténtalo de nuevo.'; }
    finally { this.historyBusy = false; if (!this.destroyed) this.cdr.markForCheck(); }
  }

  async restoreRevision(revision: BlogRevision): Promise<void> {
    if (this.historyBusy || this.saving || this.recoveryCandidate) return;
    if (this.hasUnsavedChanges && !window.confirm('Abrir esta versión sustituirá los cambios sin guardar del editor. No modificará el artículo en el CMS hasta que guardes. ¿Continuar?')) return;
    this.historyBusy = true;
    this.historyError = '';
    try {
      const article = await firstValueFrom(this.blogService.getRevision(revision.id, this.route.snapshot.params['id']));
      if (this.destroyed) return;
      const { slug, publishedAt, published } = this.form.getRawValue();
      this.suppressRecovery = true;
      this.sectionsArray.controls.forEach(section => this.releaseVideoPreview(section as FormGroup));
      this.selectedCoverFile = null;
      this.coverPreviewFile = null;
      this.populateArticle({ ...article, slug, publishedAt, published });
      this.hasUnsavedChanges = true;
      this.localPending = true;
      this.changeSequence++;
      this.successMsg = `Versión ${revision.id} abierta para revisión. No se ha publicado ni guardado en el CMS.`;
      this.suppressRecovery = false;
      await this.persistLocalDraft();
    } catch { this.historyError = 'No se pudo abrir la versión. El contenido actual se ha conservado.'; }
    finally { this.suppressRecovery = false; this.historyBusy = false; if (!this.destroyed) this.cdr.markForCheck(); }
  }

  async loadLatestVersion(): Promise<void> {
    if (!window.confirm('Descartar los cambios del editor y cargar la versión actual del CMS. ¿Continuar?')) return;
    this.loadingArticle = true;
    try {
      const article = await firstValueFrom(this.blogService.getById(this.route.snapshot.params['id']));
      this.suppressRecovery = true;
      this.sectionsArray.controls.forEach(section => this.releaseVideoPreview(section as FormGroup));
      this.selectedCoverFile = null;
      this.coverPreviewFile = null;
      this.populateArticle(article);
      this.serverVersion = article.updatedAt || '';
      this.remoteConflict = false;
      this.hasUnsavedChanges = false;
      await this.clearLocalAfterSave();
    } catch { this.errorMsg = 'No se pudo cargar la versión actual del CMS.'; }
    finally { this.loadingArticle = false; this.suppressRecovery = false; this.cdr.markForCheck(); }
  }

  retryArticleLoad(): void { this.loadArticle(this.route.snapshot.params['id']); }

  retryRecovery(): void {
    this.recoveryInitialized = false;
    void this.initializeRecovery();
  }

  private async clearLocalAfterSave(): Promise<void> {
    clearTimeout(this.autosaveTimer);
    await this.writes;
    this.localPending = false;
    if (!this.draftStore || !this.localKey) return;
    try {
      await this.draftStore.remove(this.localKey, this.localToken);
      this.localToken = undefined;
      this.localSavedAt = '';
      this.localPending = false;
    } catch { this.autosaveError = 'El CMS se guardó, pero la copia local cambió en otra pestaña o no pudo eliminarse.'; }
  }

  private applyCoverDescription(data: any): void {
    if (data.coverImage?.url) {
      data.coverImage = { ...data.coverImage, alt: data.coverDecorative ? '' : data.coverAlt?.trim() || '', decorative: data.coverDecorative === true };
    }
    delete data.coverAlt;
    delete data.coverDecorative;
  }

  private restorePreviewDraft(): boolean {
    try {
      const raw = sessionStorage.getItem('pcg_blog_editor_draft');
      if (!raw) return false;
      const draft = JSON.parse(raw);
      const id = this.route.snapshot.params['id'];
      const returnUrl = id ? adminUrl(`blog/${id}/edit`) : adminUrl('blog/new');
      if (draft.returnUrl !== returnUrl || !Array.isArray(draft.article?.sections)) return false;
      this.populateArticle(draft.article);
      this.serverVersion = draft.serverVersion || this.serverVersion;
      this.previewLocalToken = draft.localToken;
      this.form.patchValue({ scheduledAt: draft.scheduledAt || '' });
      if (typeof draft.coverAlt === 'string') this.form.patchValue({ coverAlt: draft.coverAlt });
      if (typeof draft.coverDecorative === 'boolean') this.form.patchValue({ coverDecorative: draft.coverDecorative });
      this.form.markAsDirty();
      sessionStorage.removeItem('pcg_blog_editor_draft');
      return true;
    } catch {
      return false;
    }
  }

  private requestErrorMessage(error: unknown): string {
    const directusMessage = (error as any)?.error?.errors?.[0]?.message;
    if (typeof directusMessage === 'string' && directusMessage.trim()) {
      return directusMessage;
    }

    const message = (error as any)?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    return 'Directus no devolvió detalles del error.';
  }

  private buildPersistedSections(sections: any[], articleTitle: string): any[] {
    return sections.map((section: any, index: number) => {
      const { originalSection, originalFileVideo, originalEmbedVideo, initialVideoTitle,
        existingMedia, videoUrl, videoTitle, videoFileId, videoFileUrl,
        videoFileName, videoFileType, videoPreviewUrl, images, links, ...persisted } = section;
      const media = [...(existingMedia || [])];
      let embedVideo: any;
      let fileVideo: any;
      if (videoUrl?.trim()) {
        const embed = normalizeVideoUrl(videoUrl);
        const unchanged = embed.provider === originalEmbedVideo?.provider &&
          embed.externalId === originalEmbedVideo?.externalId;
        embedVideo = {
          ...(unchanged ? originalEmbedVideo : {}), ...embed,
          title: unchanged && videoTitle === initialVideoTitle
            ? originalEmbedVideo.title : videoTitle?.trim() || `Video de ${articleTitle}`,
        };
      }
      if (videoFileId && videoFileUrl) {
        const unchanged = videoFileId === originalFileVideo?.fileId;
        fileVideo = {
          ...(unchanged ? originalFileVideo : {}),
          kind: 'video-file', fileId: videoFileId, url: videoFileUrl,
          ...(videoFileName ? { filename: videoFileName } : {}),
          ...(videoFileType ? { mimeType: videoFileType } : {}),
          title: unchanged && videoTitle === initialVideoTitle
            ? originalFileVideo.title : videoTitle?.trim() || `Video de ${articleTitle}`,
        };
      }
      // Replace only the two videos exposed by the editor, preserving the others in order.
      const orderedMedia = (originalSection?.media || []).flatMap((item: any) => {
        if (item === originalFileVideo) return fileVideo ? [fileVideo] : [];
        if (item === originalEmbedVideo) return embedVideo ? [embedVideo] : [];
        return media.includes(item) ? [item] : [];
      });
      for (const item of media) {
        if (!orderedMedia.includes(item)) orderedMedia.push(item);
      }
      if (embedVideo && !originalEmbedVideo) orderedMedia.push(embedVideo);
      if (fileVideo && !originalFileVideo) orderedMedia.push(fileVideo);
      return {
        ...originalSection, ...persisted, text: normalizeBodyHeadings(persisted.text || ''), media: orderedMedia, order: index,
        links: (links || originalSection?.links || []).map((entry: any, order: number) => {
          const { originalLink, ...editable } = entry;
          const link = { ...originalLink, ...editable, title: (editable.title || '').trim(), link: (editable.link || '').trim() };
          if (originalLink && !('newTab' in originalLink) && !link.newTab) delete link.newTab;
          if (originalLink && !('rel' in originalLink) && !link.rel) delete link.rel;
          if ('order' in (originalLink || entry)) link.order = order;
          return link;
        }),
        images: (images || []).map((image: any) => {
          const { originalImage, preview, ...editable } = image;
          return { ...originalImage, ...editable, alt: editable.decorative ? '' : editable.alt || '' };
        }),
      };
    });
  }

  private async uploadPendingMedia(): Promise<void> {
    if (this.coverUploadPromise) {
      await this.coverUploadPromise;
    }
    if (this.selectedCoverFile) {
      await this.uploadCoverImage();
    }

    for (const control of this.sectionsArray.controls) {
      const section = control as FormGroup;
      const images = section.get('images') as FormArray;
      for (const imageControl of images.controls) {
        const image = imageControl as FormGroup;
        const pendingImageUpload = (image as any)._uploadPromise as Promise<void> | undefined;
        if (pendingImageUpload) {
          await pendingImageUpload;
        }
        if ((image as any)._file) {
          await this.uploadSectionImage(
            this.sectionsArray.controls.indexOf(section),
            images.controls.indexOf(image)
          );
        }
      }

      const pendingVideoUpload = (section as any)._videoUploadPromise as Promise<void> | undefined;
      if (pendingVideoUpload) {
        await pendingVideoUpload;
      }
      const file = (section as any)._videoFile as File | undefined;
      if (!file || section.value.videoFileId) {
        continue;
      }

      const uploaded = await this.uploadService.uploadFile(file);
      section.patchValue({
        videoFileId: uploaded.fileId,
        videoFileUrl: uploaded.url,
        videoFileName: uploaded.filename,
        videoFileType: uploaded.mimeType,
      });
    }
  }

  private isVideoFile(file: File): boolean {
    if (file.type.startsWith('video/')) {
      return true;
    }
    return /\.(avi|flv|m4v|mkv|mov|mp4|mpeg|mpg|webm|wmv)$/i.test(file.name);
  }

  private editableEmbedUrl(media: any): string {
    if (!media?.externalId) {
      return '';
    }
    return media.provider === 'youtube'
      ? `https://youtu.be/${media.externalId}`
      : `https://vimeo.com/${media.externalId}`;
  }

  private releaseVideoPreview(section: FormGroup): void {
    const previewUrl = section.value.videoPreviewUrl;
    if (typeof previewUrl === 'string' && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
      section.patchValue({ videoPreviewUrl: '' }, { emitEvent: false });
    }
  }
}
