import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { BlogPost } from '../../models/blog.model';

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.css']
})
export class BlogPostComponent implements OnInit {
  post: BlogPost | null = null;
  relatedPosts: BlogPost[] = [];
  isLoading = true;
  notFound = false;

  constructor(
    private blogService: BlogService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadPost(slug);
      }
    });
  }

  loadPost(slug: string): void {
    this.isLoading = true;
    
    this.blogService.getPostBySlug(slug).subscribe(post => {
      if (post) {
        this.post = post;
        this.blogService.incrementViewCount(post.id);
        this.loadRelatedPosts(post.id);
      } else {
        this.notFound = true;
      }
      this.isLoading = false;
    });
  }

  loadRelatedPosts(postId: string): void {
    this.blogService.getRelatedPosts(postId, 3).subscribe(posts => {
      this.relatedPosts = posts;
    });
  }

  getFormattedDate(date: Date): string {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  shareOnTwitter(): void {
    if (!this.post) return;
    
    const text = `Leyendo: "${this.post.title}" en PC Gamer CDMX`;
    const url = window.location.href;
    
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  }

  shareOnFacebook(): void {
    if (!this.post) return;
    
    const url = window.location.href;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
  }

  shareOnWhatsApp(): void {
    if (!this.post) return;
    
    const text = `Leyendo: "${this.post.title}" en PC Gamer CDMX: ${window.location.href}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  }
}
