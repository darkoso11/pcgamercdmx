# Plan para añadir un Blog (FRONTEND)

Este documento está ajustado: este repositorio es SOLO el frontend (Angular). Todo lo relativo al backend se desarrollará en un proyecto separado (Nest.js) — aquí se especifica el contrato (types, endpoints esperados, esquema MongoDB y flujo de subida a S3) para que el backend lo implemente.

Breve explicación: editor WYSIWYG
- Un editor WYSIWYG ("What You See Is What You Get") permite al autor escribir contenido formateado (negritas, listas, links, insertar imágenes) con una interfaz visual similar a un procesador de texto; el editor guarda contenido HTML o un delta estructurado. Recomendamos usar `ngx-quill` o `@ckeditor/ckeditor5-angular` en el frontend para una integración sencilla.

**Objetivos**
- Frontend: vista pública de blog y panel admin (Angular) que consuma un backend separado.
- Backend (otro repo, Nest.js): CRUD en MongoDB y subida de archivos a S3 (signed URLs).

**Estructura sugerida (frontend)**
- `src/app/features/blog/` — módulo del blog.
- `src/app/features/blog/admin/` — páginas admin: `login`, `dashboard`, `articles`, `article-editor`, `categories`.
- `src/app/features/blog/public/` — páginas públicas: `blog-list`, `category-page`, `article-page`, `search`.

**Types (TypeScript) — usar `type` en lugar de `interface` y comentar cada propiedad**

```ts
// src/app/features/blog/models/types.ts
// Imagen usada dentro de una sección o como portada
export type ArticleImage = {
    // URL pública accesible (S3) de la imagen
    url: string;
    // Posición sugerida para el layout dentro de la sección
    position?: 'up' | 'down' | 'left' | 'right';
    // Orden relativo cuando hay varias imágenes
    order?: number;
    // Texto alternativo para accesibilidad y SEO
    alt?: string;
    // Tamaño o variante (p.e. 'small','medium','large') opcional
    variant?: string;
}

// Link simple usado dentro de secciones
export type ArticleLink = {
    // Texto visible del enlace
    title: string;
    // URL (puede ser interna o externa)
    link: string;
    // Orden relativo del link
    order?: number;
}

// Sección de artículo: unidad de contenido (texto + imágenes + links)
export type ArticleSection = {
    // Identificador local (UI) opcional para edición
    id?: string;
    // Título de la sección (opcional)
    title?: string;
    // Contenido HTML o texto del editor WYSIWYG
    text?: string;
    // Imágenes asociadas a esta sección
    images?: ArticleImage[];
    // Links relacionados con la sección
    links?: ArticleLink[];
    // Orden de la sección dentro del artículo (0..n)
    order?: number;
}

// Principal type de artículo. NOTA: 'author' eliminado por petición.
export type Article = {
    // ID generado por MongoDB (string)
    _id?: string;
    // Título del artículo (requerido)
    title: string;
    // Slug amigable para la URL (p.e. 'mi-articulo-interesante')
    slug?: string;
    // Resumen corto para listados y SEO
    summary?: string;
    // Imagen de portada principal (S3 url)
    coverImage?: ArticleImage;
    // Secciones del artículo (editor dividido en bloques)
    sections: ArticleSection[];
    // Referencia a la categoría (id de MongoDB)
    categoryId: string;
    // Referencia a la subcategoría (id de MongoDB)
    subCategoryId?: string;
    // Etiquetas libres para búsquedas y filtros
    tags?: string[];
    // Si el artículo está publicado o es borrador
    published: boolean;
    // Fecha de publicación (ISO string)
    publishedAt?: string;
    // Timestamps de creación/actualización (ISO string)
    createdAt?: string;
    updatedAt?: string;
}

export type Category = {
    _id?: string;
    // Nombre visible de la categoría
    name: string;
    // Descripción corta (opcional)
    description?: string;
}

export type SubCategory = {
    _id?: string;
    name: string;
    // Referencia a la categoría padre
    categoryId: string;
    description?: string;
}
```

**Notas sobre types y MongoDB**
- Los `type` anteriores reflejan el shape que el frontend espera recibir del backend. En MongoDB (Mongoose) cada esquema debería mapear estas propiedades y usar tipos apropiados (`String`, `Boolean`, `Date`, `Number`, `Array`, `Object`).

Ejemplo de esquema Mongoose sugerido (para el repo backend Nest.js):

```js
// ejemplo simplificado (backend repo - usar en Nest.js con Mongoose)
const ArticleSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, index: true, unique: true },
    summary: String,
    coverImage: { url: String, alt: String, order: Number },
    sections: [{ title: String, text: String, images: [{ url: String, alt: String, order: Number }], links: [{ title: String, link: String, order: Number }], order: Number }],
    categoryId: { type: Types.ObjectId, ref: 'Category' },
    subCategoryId: { type: Types.ObjectId, ref: 'SubCategory' },
    tags: [String],
    published: { type: Boolean, default: false },
    publishedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: Date,
    readTimeMinutes: Number,
    views: { type: Number, default: 0 },
    language: { type: String, default: 'es' }
});
```

**Backend: proyecto separado (Nest.js) — contrato mínimo**
- Tecnología: Nest.js + Mongoose + AWS S3 (uploads) + JWT para admin.
- Endpoints esperados (implementados en el repo backend):
    - POST `/api/blog/login` { password } -> `{ token }` (admin auth)
    - GET `/api/blog/articles` (filtros: categoryId, subCategoryId, q, page, limit)
    - GET `/api/blog/articles/:slug`
    - POST `/api/blog/articles` (auth)
    - PUT `/api/blog/articles/:id` (auth)
    - DELETE `/api/blog/articles/:id` (auth)
    - GET/POST/PUT/DELETE `/api/blog/categories` y `/api/blog/subcategories` (auth para mutaciones)
    - POST `/api/blog/uploads/sign` { filename, contentType } -> `{ signedUrl, publicUrl }` (devuelve signed URL para subir a S3)

Notas: la subida de imágenes debe ser lo más sencilla posible para el frontend: el backend devuelve un signed URL y el frontend hace PUT directo a S3 usando `fetch` o `axios`.

Flujo de subida simple (recomendado)
1. Frontend solicita signed URL al backend: POST `/api/blog/uploads/sign` con `{ filename, contentType }`.
2. Backend (Nest.js) usa AWS SDK para generar un signed PUT URL y devuelve `{ signedUrl, publicUrl }`.
3. Frontend hace `PUT signedUrl` con el archivo; luego usa `publicUrl` en el editor o como `coverImage`.

Ventaja: minimiza complejidad en frontend (solo dos llamadas) y evita que el servidor almacene archivos temporalmente.

**Componentes/Páginas (mejoradas y alineadas con el flujo)**
- Admin pages (panel):
    - `/admin/login` — `AdminLoginPage` (form que guarda token en `AuthService`).
    - `/admin` — `AdminDashboardPage` (panel con accesos rápidos).
    - `/admin/articles` — `AdminArticleListPage` (tabla/paginación, acciones: editar, duplicar, borrar, publicar).
    - `/admin/articles/new` y `/admin/articles/:id/edit` — `AdminArticleEditorPage` (editor WYSIWYG por secciones, subir imágenes con botón que obtiene signed URL y sube a S3).
    - `/admin/categories` — `AdminCategoryManagerPage` (crear/editar/eliminar categorías y subcategorías).

- Páginas públicas:
    - `/blog` — `BlogListPage` (paginado, filtros por categoría/subcategoría, búsqueda, mostrar summary y coverImage).
    - `/blog/category/:slug` — `CategoryPage` (lista filtrada).
    - `/blog/:slug` — `ArticlePage` (renderiza secciones con HTML seguro y carga lazy de imágenes).
    - `/blog/search` — `BlogSearchPage` (resultados por query).

**Servicios Angular (frontend)**
- `AuthService` — login admin, guarda token en `localStorage`, añade header Authorization.
- `BlogService` — llamadas a endpoints (list, detail, create, update, delete).
- `UploadService` — solicita signed URL y sube archivo a S3; devuelve `publicUrl`.

Ejemplo breve `UploadService` flow (pseudocódigo):

```ts
async uploadFile(file: File) {
    const meta = { filename: file.name, contentType: file.type };
    const { signedUrl, publicUrl } = await this.http.post('/api/blog/uploads/sign', meta).toPromise();
    await fetch(signedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    return publicUrl; // usar en el editor o como coverImage.url
}
```

**Validaciones (frontend expectations)**
- `title` requerido.
- Al menos una `section` con contenido (texto o imágenes) si `published=true`.
- Imagen máxima recomendada 5MB y tipos `jpg|png|webp`.

**Seed / ejemplos (frontend)**
- El frontend puede incluir un archivo JSON de ejemplo con artículos para desarrollo local (`src/assets/mock/blog-sample.json`) y un modo `USE_MOCK=true` para desarrollo sin backend.

**Tareas concretas (siguientes pasos para frontend)**
1. Actualizar `docs/blog_planning.md` (hecho).
2. Generar `src/app/features/blog/models/types.ts` con los `type` anteriores.
3. Crear stubs de `BlogService`, `UploadService`, `AuthService`.
4. Crear páginas admin/public con rutas y placeholders del editor.
5. Añadir `ngx-quill` o `ckeditor` en `package.json` si se aprueba.

**Tareas para el backend (repo separado, Nest.js)**
- Crear repo Nest.js con módulos: `auth`, `blog`, `uploads`.
- Implementar Mongoose schemas (articles, categories, subcategories).
- Endpoint `POST /api/blog/uploads/sign` que devuelva signed URLs para S3.
