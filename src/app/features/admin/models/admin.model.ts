export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'author';
  avatar?: string;
  bio?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  type: 'image' | 'video' | 'document';
  size: number; // en bytes
  dimensions?: {
    width: number;
    height: number;
  };
  uploadedBy: string;
  uploadDate: Date;
  alt?: string;
}

export interface DraftPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  authorId: string;
  status: 'draft' | 'published' | 'scheduled';
  tags: string[];
  categories: string[];
  publishDate?: Date;
  lastSavedDate: Date;
  seoMetadata?: {
    metaTitle?: string;
    metaDescription?: string;
    canonicalUrl?: string;
    focusKeyword?: string;
  };
}
