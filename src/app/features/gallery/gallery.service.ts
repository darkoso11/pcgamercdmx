import { Injectable } from '@angular/core';
import { map, Observable, timeout } from 'rxjs';
import { DirectusApiService } from '../../core/services/directus-api.service';

export interface ImageItem {
  id?: number;
  src: string;
  title: string;
  alt: string;
  description: string;
  category: string;
  tags: string[];
  author: string;
  date: string | null;
  published: boolean;
  sort_order: number;
}
export interface GallerySettings {
  heading: string;
  subtitle: string;
  seo_title: string;
  seo_description: string;
  social_image_id: number | null;
}
export const emptyGalleryImage = (): ImageItem => ({
  src: '', title: '', alt: '', description: '', category: '', tags: [], author: '',
  date: null, published: false, sort_order: 0,
});
export const emptyGallerySettings = (): GallerySettings => ({
  heading: '', subtitle: '', seo_title: '', seo_description: '', social_image_id: null,
});
export const galleryImageFields = 'id,src,title,alt,description,category,tags,author,date,published,sort_order';
export const gallerySettingsFields = 'heading,subtitle,seo_title,seo_description,social_image_id';

function normalizeImage(item: ImageItem): ImageItem {
  return { id: item.id, src: item.src ?? '', title: item.title ?? '', alt: item.alt ?? '',
    description: item.description ?? '', category: item.category ?? '', author: item.author ?? '',
    tags: Array.isArray(item.tags) ? item.tags.filter(t => typeof t === 'string') : [],
    date: item.date || null, published: item.published === true, sort_order: item.sort_order ?? 0 };
}
function normalizeSettings(item: GallerySettings): GallerySettings {
  return { heading: item.heading ?? '', subtitle: item.subtitle ?? '', seo_title: item.seo_title ?? '',
    seo_description: item.seo_description ?? '', social_image_id: item.social_image_id ?? null };
}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  constructor(private readonly api: DirectusApiService) {}

  getImages(admin = false): Observable<ImageItem[]> {
    return this.api.readItems<ImageItem>('pc_gallery_images', {
      fields: galleryImageFields, sort: 'sort_order,id', limit: -1,
      ...(!admin ? { 'filter[published][_eq]': true } : {}),
    }, { auth: admin }).pipe(timeout(20000), map(response => response.data.map(normalizeImage)));
  }

  saveImage(item: ImageItem): Observable<ImageItem> {
    const { id, ...payload } = normalizeImage(item);
    const request = id
      ? this.api.updateItem<ImageItem>('pc_gallery_images', id, payload, { auth: true })
      : this.api.createItem<ImageItem>('pc_gallery_images', payload, { auth: true });
    return request.pipe(map(response => normalizeImage(response.data)));
  }

  deleteImage(id: number): Observable<void> {
    return this.api.deleteItem('pc_gallery_images', id, { auth: true });
  }

  getSettings(admin = false): Observable<GallerySettings> {
    return this.api.readItem<GallerySettings>('pc_gallery_settings', 1,
      { fields: gallerySettingsFields }, { auth: admin }).pipe(timeout(20000), map(response => normalizeSettings(response.data)));
  }

  saveSettings(settings: GallerySettings): Observable<GallerySettings> {
    return this.api.updateItem<GallerySettings>('pc_gallery_settings', 1, { ...normalizeSettings(settings) }, { auth: true })
      .pipe(map(response => normalizeSettings(response.data)));
  }
}
