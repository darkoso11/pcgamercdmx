import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { firstValueFrom } from 'rxjs';
import { BlogService } from '../services/blog.service';
import { UploadService } from '../services/upload.service';
import { AdminHeaderComponent } from '../../admin/admin-header.component';
import { adminUrl } from '../../admin/admin-route.config';
import { localDateTimeToUtc, normalizeVideoUrl } from '../services/blog-content.utils';

@Component({
  selector: 'app-admin-article-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, QuillModule, AdminHeaderComponent],
  templateUrl: './admin-article-editor.component.html',
  styleUrls: ['./admin-article-editor.component.css']
})
export class AdminArticleEditorComponent implements OnInit, OnDestroy {
  readonly maxVideoSizeMb = 250;
  readonly adminBlogUrl = adminUrl('blog');
  form: FormGroup;
  isNew = true;
  saving = false;
  uploading = false;
  selectedCoverFile: File | null = null;
  coverImagePreview: string | null = null;
  private coverUploadPromise: Promise<void> | null = null;
  errorMsg = '';
  successMsg = '';

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
      [{ 'header': 1 }, { 'header': 2 }],
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
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      slug: [''],
      summary: ['', [Validators.required, Validators.minLength(10)]],
      categoryId: ['', Validators.required],
      subCategoryId: [''],
      tags: [''],
      coverImage: [''],
      published: [false],
      scheduledAt: [''],
      sections: this.fb.array([])
    });
  }

  get sectionsArray(): FormArray {
    return this.form.get('sections') as FormArray;
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isNew = false;
      this.loadArticle(id);
    } else {
      this.addSection();
    }
    this.loadCategories();
    this.loadSubcategories();
  }

  ngOnDestroy(): void {
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
    this.blogService.getById(id).subscribe({
      next: (article) => {
        this.sectionsArray.clear();
        (article.sections || []).forEach((section: any) => {
          const media = section.media || [];
          const fileVideo = media.find((item: any) => item.kind === 'video-file');
          const embedVideo = media.find((item: any) => item.kind === 'video-embed');
          const sectionForm = this.fb.group({
            title: [section.title || ''],
            text: [section.text || ''],
            order: [section.order || this.sectionsArray.length],
            images: this.fb.array((section.images || []).map((image: any) => this.fb.group({
              url: [image.url || ''],
              fileId: [image.fileId || ''],
              filename: [image.filename || ''],
              mimeType: [image.mimeType || ''],
              alt: [image.alt || ''],
              preview: [image.url || ''],
              order: [image.order || 0]
            }))),
            imageLayout: [section.imageLayout || '1'],
            existingMedia: [media.filter(
              (item: any) =>
                item.kind !== 'video-file' && item.kind !== 'video-embed'
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
          categoryId: article.categoryId || '',
          subCategoryId: article.subCategoryId || '',
          tags: (article.tags || []).join(', '),
          coverImage: article.coverImage || '',
          published: article.published
        });
        this.coverImagePreview = article.coverImage?.url || null;
        this.updateFilteredSubcategories();
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'No se pudo cargar el artículo';
        this.cdr.detectChanges();
      }
    });
  }

  addSection() {
    const sectionForm = this.fb.group({
      title: [''],
      text: [''],
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
      const reader = new FileReader();
      reader.onload = (e) => {
        const preview = e.target?.result as string;
        const imagesArray = this.getSectionImages(sectionIndex);
        (imagesArray.at(imageIndex) as FormGroup).patchValue({ preview });
      };
      reader.readAsDataURL(file);
      const imageForm = this.getSectionImages(sectionIndex).at(imageIndex) as FormGroup;
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
        const uploaded = await this.uploadService.uploadFile(file);
        imageForm.patchValue({
          url: uploaded.url,
          fileId: uploaded.fileId,
          filename: uploaded.filename,
          mimeType: uploaded.mimeType,
        });
        this.successMsg = 'Imagen lista para guardar';
      } catch (e) {
        this.errorMsg = `Error al subir la imagen: ${this.requestErrorMessage(e)}`;
        throw e;
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
      const current = sections.at(index).value;
      const previous = sections.at(index - 1).value;
      sections.at(index).patchValue(previous);
      sections.at(index - 1).patchValue(current);
    }
  }

  moveSectionDown(index: number) {
    if (index < this.sectionsArray.length - 1) {
      const sections = this.sectionsArray;
      const current = sections.at(index).value;
      const next = sections.at(index + 1).value;
      sections.at(index).patchValue(next);
      sections.at(index + 1).patchValue(current);
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
      const reader = new FileReader();
      reader.onload = (e) => {
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
    const file = this.selectedCoverFile;
    this.coverUploadPromise = (async () => {
      try {
        const uploaded = await this.uploadService.uploadFile(file);
        this.form.patchValue({
          coverImage: {
            ...uploaded,
            alt: this.form.value.title || '',
          },
        });
        this.successMsg = 'Portada lista para guardar';
        this.selectedCoverFile = null;
      } catch (e) {
        this.errorMsg = `Error al subir la imagen: ${this.requestErrorMessage(e)}`;
        throw e;
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

  openPreview() {
    try {
      const preview = this.form.getRawValue();
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
      sessionStorage.setItem('pcg_blog_preview', JSON.stringify({
        article: preview,
        returnUrl,
      }));
      this.router.navigate([adminUrl('blog/preview')]);
    } catch (error) {
      this.errorMsg = `No se pudo generar la vista previa: ${this.requestErrorMessage(error)}`;
      this.cdr.markForCheck();
    }
  }

  async onSave(mode: 'draft' | 'publish' | 'schedule' = 'draft') {
    if (!this.form.valid) {
      this.errorMsg = 'Por favor completa todos los campos requeridos';
      return;
    }

    if (this.sectionsArray.length === 0) {
      this.errorMsg = 'Debe haber al menos una sección de contenido';
      return;
    }

    this.saving = true;
    this.errorMsg = '';
    
    try {
      await this.uploadPendingMedia();
      const formData = this.form.getRawValue();
      
      if (typeof formData.tags === 'string') {
        formData.tags = formData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
      }

      if (!formData.slug) {
        formData.slug = formData.title
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '')
          .replace(/-+/g, '-')
          .substring(0, 50);
      }

      if (mode === 'schedule' && !formData.scheduledAt) {
        this.errorMsg = 'Selecciona la fecha y hora de publicación';
        this.saving = false;
        return;
      }

      formData.published = mode !== 'draft';
      formData.publishedAt = mode === 'schedule'
        ? localDateTimeToUtc(formData.scheduledAt)
        : mode === 'publish'
          ? new Date().toISOString()
          : null;
      formData.sections = this.buildPersistedSections(
        formData.sections,
        formData.title
      );
      delete formData.scheduledAt;

      if (this.isNew) {
        await firstValueFrom(this.blogService.create(formData));
        this.successMsg = 'Artículo creado exitosamente';
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate([this.adminBlogUrl]), 1500);
      } else {
        const id = this.route.snapshot.params['id'];
        await firstValueFrom(this.blogService.update(id, formData));
        this.successMsg = 'Artículo actualizado exitosamente';
        this.cdr.markForCheck();
        setTimeout(() => this.router.navigate([this.adminBlogUrl]), 1500);
      }
    } catch (e) {
      this.errorMsg = `Error al guardar: ${this.requestErrorMessage(e)}`;
    } finally {
      this.saving = false;
      this.cdr.markForCheck();
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
      const media = [...(section.existingMedia || [])];
      if (section.videoUrl?.trim()) {
        const embed = normalizeVideoUrl(section.videoUrl);
        media.push({
          ...embed,
          title: section.videoTitle?.trim() || `Video de ${articleTitle}`,
        });
      }
      if (section.videoFileId && section.videoFileUrl) {
        media.push({
          kind: 'video-file',
          fileId: section.videoFileId,
          url: section.videoFileUrl,
          filename: section.videoFileName,
          mimeType: section.videoFileType,
          title: section.videoTitle?.trim() || `Video de ${articleTitle}`,
        });
      }
      const {
        existingMedia,
        videoUrl,
        videoTitle,
        videoFileId,
        videoFileUrl,
        videoFileName,
        videoFileType,
        videoPreviewUrl,
        ...persisted
      } = section;
      return { ...persisted, media, order: index };
    });
  }

  private async uploadPendingMedia(): Promise<void> {
    if (this.coverUploadPromise) {
      await this.coverUploadPromise;
    }
    if (
      this.selectedCoverFile &&
      !this.form.value.coverImage?.fileId
    ) {
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
        if ((image as any)._file && !image.value.fileId) {
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
