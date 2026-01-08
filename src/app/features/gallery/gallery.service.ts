import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ImageItem {
  src: string;
  title?: string;
  category: string;
  tags?: string[];
  author?: string;
  date?: string;
}

@Injectable({ providedIn: 'root' })
export class GalleryService {
  private manifestUrl = '/assets/mock/gallery.json';

  constructor(private http: HttpClient) {}

  getImages(): Observable<ImageItem[]> {
    return this.http.get<ImageItem[]>(this.manifestUrl);
  }
}
