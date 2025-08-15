import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { BlogService } from '../../services/blog.service';
import { BlogPost } from '../../models/blog.model';
<<<<<<< HEAD
import { CommentService } from '../../services/comment.service';
import { Comment } from '../../models/blog.model';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
=======
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325

@Component({
  selector: 'app-blog-post',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
=======
  imports: [CommonModule, RouterModule],
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.css']
})
export class BlogPostComponent implements OnInit {
  post: BlogPost | null = null;
  relatedPosts: BlogPost[] = [];
<<<<<<< HEAD
  comments: Comment[] = [];
  isLoading = true;
  notFound = false;
  commentForm: FormGroup;
  showCommentForm = false;
  commentSubmitted = false;
  replyingTo: string | null = null;

  constructor(
    private blogService: BlogService,
    private commentService: CommentService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      content: ['', [Validators.required, Validators.minLength(5)]],
      parentId: [null]
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) {
        this.handleNotFound();
        return;
      }

      this.loadPost(slug);
=======
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
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325
    });
  }

  loadPost(slug: string): void {
    this.isLoading = true;
<<<<<<< HEAD
    this.notFound = false;

    this.blogService.getPostBySlug(slug).subscribe({
      next: (post) => {
        this.post = post;
        this.loadRelatedPosts(post.id);
        this.loadComments(post.id);
        this.isLoading = false;
        
        // Scroll to top
        window.scrollTo(0, 0);
        
        // Update page title for SEO
        document.title = `${post.title} | PC Gamer CDMX Blog`;
      },
      error: (err) => {
        console.error('Error loading post:', err);
        this.handleNotFound();
      }
=======
    
    this.blogService.getPostBySlug(slug).subscribe(post => {
      if (post) {
        this.post = post;
        this.blogService.incrementViewCount(post.id);
        this.loadRelatedPosts(post.id);
      } else {
        this.notFound = true;
      }
      this.isLoading = false;
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325
    });
  }

  loadRelatedPosts(postId: string): void {
    this.blogService.getRelatedPosts(postId, 3).subscribe(posts => {
      this.relatedPosts = posts;
    });
  }

<<<<<<< HEAD
  loadComments(postId: string): void {
    this.commentService.getCommentsByPostId(postId).subscribe(comments => {
      this.comments = comments;
    });
  }

  handleNotFound(): void {
    this.notFound = true;
    this.isLoading = false;
    document.title = 'Artículo no encontrado | PC Gamer CDMX Blog';
  }

=======
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325
  getFormattedDate(date: Date): string {
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

<<<<<<< HEAD
  toggleCommentForm(): void {
    this.showCommentForm = !this.showCommentForm;
    this.replyingTo = null;
    this.commentForm.reset({
      name: '',
      email: '',
      content: '',
      parentId: null
    });
    this.commentSubmitted = false;
  }

  replyToComment(commentId: string, authorName: string): void {
    this.showCommentForm = true;
    this.replyingTo = authorName;
    this.commentForm.patchValue({
      parentId: commentId,
      content: `@${authorName} `
    });
    
    // Scroll to comment form
    setTimeout(() => {
      const commentForm = document.getElementById('comment-form');
      if (commentForm) {
        commentForm.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  submitComment(): void {
    if (this.commentForm.invalid || !this.post) {
      return;
    }

    const formValue = this.commentForm.value;
    
    const comment = {
      postId: this.post.id,
      author: {
        name: formValue.name,
        email: formValue.email
      },
      content: formValue.content,
      parentId: formValue.parentId
    };

    this.commentService.addComment(comment).subscribe({
      next: () => {
        this.commentSubmitted = true;
        this.commentForm.reset();
      },
      error: (err) => {
        console.error('Error submitting comment:', err);
      }
    });
  }

  shareOnTwitter(): void {
    if (!this.post) return;
    
    const text = encodeURIComponent(`${this.post.title} vía @PCGamerCDMX`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
=======
  shareOnTwitter(): void {
    if (!this.post) return;
    
    const text = `Leyendo: "${this.post.title}" en PC Gamer CDMX`;
    const url = window.location.href;
    
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325
  }

  shareOnFacebook(): void {
    if (!this.post) return;
    
<<<<<<< HEAD
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
=======
    const url = window.location.href;
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank'
    );
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325
  }

  shareOnWhatsApp(): void {
    if (!this.post) return;
    
<<<<<<< HEAD
    const text = encodeURIComponent(`${this.post.title} ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  // Helper para obtener comentarios raíz (sin padre)
  getRootComments(): Comment[] {
    return this.comments.filter(comment => !comment.parentId);
  }

  // Helper para obtener respuestas a un comentario
  getCommentReplies(commentId: string): Comment[] {
    return this.comments.filter(comment => comment.parentId === commentId);
=======
    const text = `Leyendo: "${this.post.title}" en PC Gamer CDMX: ${window.location.href}`;
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`,
      '_blank'
    );
>>>>>>> 95468a2760a4c4557224cca0eea84a0aa0f43325
  }
}
