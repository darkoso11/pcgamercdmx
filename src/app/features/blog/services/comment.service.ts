import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Comment } from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private mockComments: Comment[] = [
    {
      id: '1',
      postId: '1',
      author: {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        avatar: 'assets/img/avatars/user1.jpg'
      },
      content: 'Excelente guía, me ayudó mucho a la hora de armar mi primera PC. Gracias por los detalles!',
      date: new Date('2024-03-16T14:32:00'),
      approved: true
    },
    {
      id: '2',
      postId: '1',
      author: {
        name: 'Ana López',
        email: 'ana@example.com',
        avatar: 'assets/img/avatars/user2.jpg'
      },
      content: '¿Recomendarías también considerar una fuente de poder modular para principiantes?',
      date: new Date('2024-03-17T09:15:00'),
      approved: true
    },
    {
      id: '3',
      postId: '1',
      parentId: '2',
      author: {
        name: 'Carlos Rodríguez',
        email: 'carlos@pcgamercdmx.com',
        avatar: 'assets/img/authors/carlos.jpg'
      },
      content: 'Hola Ana, ¡absolutamente! Las fuentes modulares son excelentes para un primer montaje ya que facilitan mucho la gestión de cables.',
      date: new Date('2024-03-17T10:22:00'),
      approved: true
    },
    {
      id: '4',
      postId: '2',
      author: {
        name: 'Roberto Sánchez',
        email: 'roberto@example.com',
        avatar: 'assets/img/avatars/user3.jpg'
      },
      content: 'Estaba dudando entre la RTX 4070 y la RX 7800 XT. Este artículo me ayudó a decidirme por la AMD. ¡Gracias!',
      date: new Date('2024-04-03T16:45:00'),
      approved: true
    }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Obtiene comentarios para un post específico
   */
  getCommentsByPostId(postId: string): Observable<Comment[]> {
    const comments = this.mockComments
      .filter(comment => comment.postId === postId && comment.approved)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return of(comments).pipe(delay(300));
  }

  /**
   * Añade un nuevo comentario
   */
  addComment(comment: Omit<Comment, 'id' | 'approved' | 'date'>): Observable<Comment> {
    // En un caso real, esto sería una llamada POST
    const newComment: Comment = {
      ...comment,
      id: (this.mockComments.length + 1).toString(),
      approved: false, // En un caso real, podría haber moderación
      date: new Date()
    };
    
    this.mockComments.push(newComment);
    
    return of(newComment).pipe(delay(300));
  }
}
