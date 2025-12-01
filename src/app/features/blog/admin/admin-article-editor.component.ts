import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { QuillModule } from 'ngx-quill';
import { BlogService } from '../services/blog.service';
import { UploadService } from '../services/upload.service';
import { AdminHeaderComponent } from './admin-header.component';

@Component({
  selector: 'app-admin-article-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, QuillModule, AdminHeaderComponent],
  template: `
    <app-admin-header></app-admin-header>
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">{{ isNew ? 'Nuevo Artículo' : 'Editar Artículo' }}</h1>
      
      <form [formGroup]="form" (ngSubmit)="onSave()">
        <!-- Título -->
        <div class="mb-4">
          <label class="block font-semibold mb-2">Título</label>
          <input 
            type="text" 
            formControlName="title" 
            class="w-full border rounded p-2 bg-gray-800 text-white"
            required
          />
        </div>

        <!-- Slug -->
        <div class="mb-4">
          <label class="block font-semibold mb-2">Slug</label>
          <input 
            type="text" 
            formControlName="slug" 
            class="w-full border rounded p-2 bg-gray-800 text-white"
          />
        </div>

        <!-- Resumen -->
        <div class="mb-4">
          <label class="block font-semibold mb-2">Resumen</label>
          <textarea 
            formControlName="summary" 
            class="w-full border rounded p-2 bg-gray-800 text-white h-20"
          ></textarea>
        </div>

        <!-- Categoría -->
        <div class="mb-4">
          <label class="block font-semibold mb-2">Categoría</label>
          <select 
            formControlName="categoryId" 
            class="w-full border rounded p-2 bg-gray-800 text-white"
          >
            <option value="">Seleccionar categoría</option>
            <option value="cat1">Tecnología</option>
            <option value="cat2">Reseñas</option>
            <option value="cat3">Tutoriales</option>
          </select>
        </div>

        <!-- Editor Quill para el contenido principal -->
        <div class="mb-4">
          <label class="block font-semibold mb-2">Contenido Principal</label>
          <quill-editor 
            formControlName="mainContent" 
            [modules]="quillModules"
            class="bg-white text-black rounded"
          ></quill-editor>
        </div>

        <!-- Botón subir imagen de portada -->
        <div class="mb-4">
          <label class="block font-semibold mb-2">Imagen de Portada</label>
          <input 
            type="file" 
            accept="image/*" 
            (change)="onCoverImageSelect($event)"
            class="mb-2"
          />
          <div *ngIf="coverImagePreview" class="mb-2">
            <img [src]="coverImagePreview" alt="Preview" class="max-w-xs rounded">
          </div>
          <button 
            type="button" 
            (click)="uploadCoverImage()" 
            class="bg-blue-600 text-white px-4 py-2 rounded"
            [disabled]="!selectedCoverFile || uploading"
          >
            {{ uploading ? 'Subiendo...' : 'Subir Portada' }}
          </button>
        </div>

        <!-- Publicar -->
        <div class="mb-6">
          <label class="flex items-center">
            <input 
              type="checkbox" 
              formControlName="published" 
              class="mr-2"
            />
            <span class="font-semibold">Publicar</span>
          </label>
        </div>

        <!-- Botones -->
        <div class="flex gap-2">
          <button 
            type="submit" 
            class="bg-green-600 text-white px-6 py-2 rounded"
            [disabled]="form.invalid"
          >
            {{ isNew ? 'Crear' : 'Guardar' }}
          </button>
          <a routerLink="/admin/blog" class="bg-gray-600 text-white px-6 py-2 rounded">
            Cancelar
          </a>
        </div>
      </form>

      <div *ngIf="errorMsg" class="mt-4 p-3 bg-red-600 text-white rounded">
        {{ errorMsg }}
      </div>
      <div *ngIf="successMsg" class="mt-4 p-3 bg-green-600 text-white rounded">
        {{ successMsg }}
      </div>
    </div>
  `,
  styles: [`
    ::ng-deep .ql-editor {
      min-height: 300px;
      max-height: 600px;
      overflow-y: auto;
    }
  `]
})
export class AdminArticleEditorComponent implements OnInit {
  form: FormGroup;
  isNew = true;
  uploading = false;
  selectedCoverFile: File | null = null;
  coverImagePreview: string | null = null;
  errorMsg = '';
  successMsg = '';

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
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      slug: [''],
      summary: [''],
      categoryId: ['', Validators.required],
      mainContent: [''],
      published: [false],
      coverImage: ['']
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isNew = false;
      this.loadArticle(id);
    }
  }

  loadArticle(id: string) {
    // Implementar cuando backend esté listo
    console.log('Cargar artículo:', id);
  }

  onCoverImageSelect(event: any) {
    const file = event.target.files?.[0];
    if (file) {
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
    try {
      const publicUrl = await this.uploadService.uploadFile(this.selectedCoverFile);
      this.form.patchValue({ coverImage: publicUrl });
      this.successMsg = 'Imagen subida correctamente';
      this.selectedCoverFile = null;
    } catch (e) {
      this.errorMsg = 'Error al subir la imagen';
    } finally {
      this.uploading = false;
    }
  }

  async onSave() {
    if (!this.form.valid) return;
    
    const data = this.form.value;
    try {
      if (this.isNew) {
        await this.blogService.create(data);
        this.successMsg = 'Artículo creado';
      } else {
        const id = this.route.snapshot.params['id'];
        await this.blogService.update(id, data);
        this.successMsg = 'Artículo actualizado';
      }
    } catch (e) {
      this.errorMsg = 'Error al guardar el artículo';
    }
  }
}
