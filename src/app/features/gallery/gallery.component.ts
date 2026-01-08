import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { GalleryService, ImageItem } from './gallery.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  images: ImageItem[] = [];
  filtered: ImageItem[] = [];
  categories: string[] = [];
  activeCategory = 'all';
  modalImage: ImageItem | null = null;

  constructor(private gallery: GalleryService) {}

  ngOnInit() {
    this.gallery.getImages().subscribe(data => {
      this.images = data;
      this.categories = ['all', ...Array.from(new Set(data.map(i => i.category)))];
      this.applyFilter();
    });
  }

  setCategory(cat: string) {
    this.activeCategory = cat;
    this.applyFilter();
  }

  applyFilter() {
    this.filtered = this.activeCategory === 'all' ? this.images : this.images.filter(i => i.category === this.activeCategory);
  }

  open(item: ImageItem) { this.modalImage = item; }
  close() { this.modalImage = null; }

  trackBySrc(index: number, item: ImageItem): string {
    return item.src;
  }
}