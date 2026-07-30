import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
export class AdminArticleEditorComponent implements OnInit {
  readonly adminBlogUrl = adminUrl('blog');
  form: FormGroup;
  isNew = true;
  saving = false;
  uploading = false;
  selectedCoverFile: File | null = null;
  coverImagePreview: string | null = null;
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
            existingMedia: [section.media || []],
            videoUrl: [''],
            videoTitle: [''],
            videoFileId: [''],
            videoFileUrl: [''],
            videoFileName: [''],
            videoFileType: ['']
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
      videoFileType: ['']
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
        (imagesArray.at(imageIndex) as any)._file = file;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadSectionImage(sectionIndex: number, imageIndex: number) {
    const imagesArray = this.getSectionImages(sectionIndex);
    const imageForm = imagesArray.at(imageIndex) as FormGroup;
    const file = (imageForm as any)._file;

    if (!file) return;

    this.uploading = true;
    this.errorMsg = '';
    try {
      const uploaded = await this.uploadService.uploadFile(file);
      imageForm.patchValue({
        url: uploaded.url,
        fileId: uploaded.fileId,
        filename: uploaded.filename,
        mimeType: uploaded.mimeType,
      });
      this.successMsg = 'Imagen subida correctamente';
      setTimeout(() => {
        this.successMsg = '';
        this.cdr.markForCheck();
      }, 3000);
    } catch (e) {
      this.errorMsg = `Error al subir la imagen: ${this.requestErrorMessage(e)}`;
    } finally {
      this.uploading = false;
      this.cdr.markForCheck();
    }
  }

  removeSection(index: number) {
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
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadCoverImage() {
    if (!this.selectedCoverFile) return;
    
    this.uploading = true;
    this.errorMsg = '';
    try {
      const uploaded = await this.uploadService.uploadFile(this.selectedCoverFile);
      this.form.patchValue({
        coverImage: {
          ...uploaded,
          alt: this.form.value.title || '',
        },
      });
      this.successMsg = 'Imagen subida correctamente';
      this.selectedCoverFile = null;
      setTimeout(() => {
        this.successMsg = '';
        this.cdr.markForCheck();
      }, 3000);
    } catch (e) {
      this.errorMsg = `Error al subir la imagen: ${this.requestErrorMessage(e)}`;
    } finally {
      this.uploading = false;
      this.cdr.markForCheck();
    }
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
    if (!file.type.startsWith('video/')) {
      this.errorMsg = 'Selecciona un archivo de video válido';
      return;
    }
    const section = this.sectionsArray.at(sectionIndex) as FormGroup;
    (section as any)._videoFile = file;
    section.patchValue({
      videoFileName: file.name,
      videoFileType: file.type,
      videoTitle: section.value.videoTitle || file.name,
    });
  }

  async uploadSectionVideo(sectionIndex: number) {
    const section = this.sectionsArray.at(sectionIndex) as FormGroup;
    const file = (section as any)._videoFile as File | undefined;
    if (!file) return;
    this.uploading = true;
    this.errorMsg = '';
    try {
      const uploaded = await this.uploadService.uploadFile(file);
      section.patchValue({
        videoFileId: uploaded.fileId,
        videoFileUrl: uploaded.url,
        videoFileName: uploaded.filename,
        videoFileType: uploaded.mimeType,
      });
      this.successMsg = 'Video subido correctamente';
    } catch (error) {
      this.errorMsg = `Error al subir el video: ${this.requestErrorMessage(error)}`;
    } finally {
      this.uploading = false;
      this.cdr.markForCheck();
    }
  }

  openPreview() {
    const preview = this.form.getRawValue();
    preview.tags = typeof preview.tags === 'string'
      ? preview.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
      : preview.tags;
    sessionStorage.setItem('pcg_blog_preview', JSON.stringify(preview));
    this.router.navigate([adminUrl('blog/preview')]);
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
      await this.uploadPendingSectionVideos();
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
      formData.sections = formData.sections.map((section: any, index: number) => {
        const media = [...(section.existingMedia || [])];
        if (section.videoUrl?.trim()) {
          const embed = normalizeVideoUrl(section.videoUrl);
          media.push({
            ...embed,
            title: section.videoTitle?.trim() || `Video de ${formData.title}`,
          });
        }
        if (section.videoFileId && section.videoFileUrl) {
          media.push({
            kind: 'video-file',
            fileId: section.videoFileId,
            url: section.videoFileUrl,
            filename: section.videoFileName,
            mimeType: section.videoFileType,
            title: section.videoTitle?.trim() || `Video de ${formData.title}`,
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
          ...persisted
        } = section;
        return { ...persisted, media, order: index };
      });
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

  private async uploadPendingSectionVideos(): Promise<void> {
    for (const control of this.sectionsArray.controls) {
      const section = control as FormGroup;
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
}
