import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { BlogPost, BlogCategory, BlogTag } from '../../models/blog.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-blog-home',
  standalone: true,
  imports: [
    NgIf, NgFor,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './blog-home.component.html',
  styleUrls: ['./blog-home.component.css']
})
export class BlogHomeComponent implements OnInit {
  posts: BlogPost[] = [];
  featuredPosts: BlogPost[] = [];
  categories: BlogCategory[] = [];
  tags: BlogTag[] = [];
  currentPage = 1;
  totalPosts = 0;
  postsPerPage = 6;
  isLoading = true;
  searchControl = new FormControl('');
  searchResults: BlogPost[] = [];
  showSearchResults = false;
  selectedCategory: string | null = null;
  selectedTag: string | null = null;

  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Suscribirse a cambios en los parámetros de la ruta
    this.route.params.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
        this.selectedTag = null;
      } else if (params['tag']) {
        this.selectedTag = params['tag'];
        this.selectedCategory = null;
      } else {
        this.selectedCategory = null;
        this.selectedTag = null;
      }
      
      this.loadPosts();
    });
    
    // Cargar datos iniciales
    this.loadFeaturedPosts();
    this.loadCategories();
    this.loadTags();
    
    // Configurar búsqueda
    this.setupSearch();
  }

  loadPosts(): void {
    this.isLoading = true;
    
    this.blogService.getPosts(
      this.currentPage, 
      this.postsPerPage, 
      this.selectedCategory || undefined, 
      this.selectedTag || undefined
    ).subscribe(result => {
      this.posts = result.posts;
      this.totalPosts = result.total;
      this.isLoading = false;
    });
  }

  loadFeaturedPosts(): void {
    this.blogService.getFeaturedPosts(3).subscribe(posts => {
      this.featuredPosts = posts;
    });
  }

  loadCategories(): void {
    this.blogService.getCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  loadTags(): void {
    this.blogService.getTags().subscribe(tags => {
      this.tags = tags;
    });
  }

  setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {
        if (!query || query.length < 2) {
          this.showSearchResults = false;
          return [];
        }
        return this.blogService.searchPosts(query);
      })
    ).subscribe(results => {
      if (results.length > 0) {
        this.searchResults = results;
        this.showSearchResults = true;
      } else {
        this.showSearchResults = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPosts();
    window.scrollTo(0, 0);
  }

  clearFilters(): void {
    this.selectedCategory = null;
    this.selectedTag = null;
    this.currentPage = 1;
    this.loadPosts();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalPosts / this.postsPerPage);
  }

  getFormattedDate(date: Date): string {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
