export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: Author;
  coverImage: string;
  tags: string[];
  categories: string[];
  publishDate: Date;
  updatedDate?: Date;
  readTime: number; // Tiempo estimado de lectura en minutos
  featured: boolean;
  views: number;
}

export interface Author {
  id: string;
  name: string;
  avatar: string;
  bio?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}
