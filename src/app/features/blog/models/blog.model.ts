<<<<<<< HEAD
/**
 * Interfaces para el módulo del blog
 */

=======
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
<<<<<<< HEAD
  coverImage: string;
  publishDate: Date;
  lastModified?: Date;
  author: Author;
  categories: string[];
  tags: string[];
  readTime: number;
  views: number;
  featured?: boolean;
  relatedPosts?: string[]; // IDs de posts relacionados
=======
  author: Author;
  coverImage: string;
  tags: string[];
  categories: string[];
  publishDate: Date;
  updatedDate?: Date;
  readTime: number; // Tiempo estimado de lectura en minutos
  featured: boolean;
  views: number;
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
<<<<<<< HEAD
  bio: string;
=======
  bio?: string;
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
<<<<<<< HEAD
    github?: string;
=======
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
<<<<<<< HEAD
  count?: number; // Número de posts en esta categoría
=======
  postCount: number;
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
<<<<<<< HEAD
  count?: number; // Número de posts con este tag
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  date: Date;
  approved: boolean;
  parentId?: string; // Para comentarios anidados
}

export interface BlogPostListResponse {
  posts: BlogPost[];
  total: number;
=======
  postCount: number;
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325
}
