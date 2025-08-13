/**
 * Interfaces para el módulo del blog
 */

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
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
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number; // Número de posts en esta categoría
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
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
}
