import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { BlogService } from '../services/blog.service';
import { UploadService } from '../services/upload.service';
import { AdminHeaderComponent } from './admin-header.component';

@Component({
  selector: 'app-admin-article-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, QuillModule, AdminHeaderComponent],
  templateUrl: './admin-article-editor.component.html',
  styleUrls: ['./admin-article-editor.component.css']
})
export class AdminArticleEditorComponent implements OnInit {
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
    private router: Router
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
    this.blogService.getCategories().subscribe((res: any) => {
      this.categories = Array.isArray(res) ? res : (res.data || res);
    });
  }

  loadSubcategories() {
    this.blogService.getSubCategories().subscribe((res: any) => {
      this.subcategories = Array.isArray(res) ? res : (res.data || res);
      this.updateFilteredSubcategories();
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
    console.log('Cargar artículo:', id);
  }

  addSection() {
    const sectionForm = this.fb.group({
      title: [''],
      text: [''],
      order: [this.sectionsArray.length],
      images: this.fb.array([]),
      imageLayout: ['1'] // 1, 2, 3, o 4 columnas
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
      const publicUrl = await this.uploadService.uploadFile(file);
      imageForm.patchValue({ url: publicUrl });
      this.successMsg = 'Imagen subida correctamente';
      setTimeout(() => this.successMsg = '', 3000);
    } catch (e) {
      this.errorMsg = 'Error al subir la imagen: ' + (e as any).message;
    } finally {
      this.uploading = false;
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
      const publicUrl = await this.uploadService.uploadFile(this.selectedCoverFile);
      this.form.patchValue({ coverImage: publicUrl });
      this.successMsg = 'Imagen subida correctamente';
      this.selectedCoverFile = null;
      setTimeout(() => this.successMsg = '', 3000);
    } catch (e) {
      this.errorMsg = 'Error al subir la imagen: ' + (e as any).message;
    } finally {
      this.uploading = false;
    }
  }

  async onSave() {
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
      const formData = this.form.value;
      
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

      if (this.isNew) {
        await this.blogService.create(formData).toPromise();
        this.successMsg = 'Artículo creado exitosamente';
        setTimeout(() => this.router.navigate(['/admin/blog']), 1500);
      } else {
        const id = this.route.snapshot.params['id'];
        await this.blogService.update(id, formData).toPromise();
        this.successMsg = 'Artículo actualizado exitosamente';
        setTimeout(() => this.router.navigate(['/admin/blog']), 1500);
      }
    } catch (e) {
      this.errorMsg = 'Error al guardar: ' + (e as any).message;
    } finally {
      this.saving = false;
    }
  }
}
