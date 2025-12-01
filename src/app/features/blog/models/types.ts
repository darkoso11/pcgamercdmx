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
