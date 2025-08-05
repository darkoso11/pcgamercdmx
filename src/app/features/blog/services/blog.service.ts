import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BlogPost, BlogCategory, BlogTag, Author } from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private mockAuthors: Author[] = [
    {
      id: '1',
      name: 'Carlos Rodríguez',
      avatar: 'assets/img/authors/carlos.jpg',
      bio: 'Experto en hardware y entusiasta de la tecnología gaming. Lleva más de 10 años en la industria.',
      socialLinks: {
        twitter: 'https://twitter.com/carlostech',
        instagram: 'https://instagram.com/carlos_tech'
      }
    },
    {
      id: '2',
      name: 'Laura Méndez',
      avatar: 'assets/img/authors/laura.jpg',
      bio: 'Especialista en software de gaming y streaming. Creadora de contenido y jugadora profesional.',
      socialLinks: {
        twitter: 'https://twitter.com/lauragamer',
        instagram: 'https://instagram.com/laura_gamer'
      }
    }
  ];

  private mockCategories: BlogCategory[] = [
    { id: '1', name: 'Hardware', slug: 'hardware', postCount: 5, description: 'Todo sobre componentes y tecnología' },
    { id: '2', name: 'Gaming', slug: 'gaming', postCount: 4, description: 'Noticias y reseñas de juegos' },
    { id: '3', name: 'Tutoriales', slug: 'tutoriales', postCount: 3, description: 'Guías paso a paso' },
    { id: '4', name: 'Software', slug: 'software', postCount: 2, description: 'Aplicaciones y programas' }
  ];

  private mockTags: BlogTag[] = [
    { id: '1', name: 'RTX 4000', slug: 'rtx-4000', postCount: 3 },
    { id: '2', name: 'AMD', slug: 'amd', postCount: 2 },
    { id: '3', name: 'Intel', slug: 'intel', postCount: 2 },
    { id: '4', name: 'Cooling', slug: 'cooling', postCount: 1 },
    { id: '5', name: 'Esports', slug: 'esports', postCount: 2 },
    { id: '6', name: 'Overclocking', slug: 'overclocking', postCount: 1 }
  ];

  private mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Las mejores tarjetas gráficas para 2024',
      slug: 'mejores-tarjetas-graficas-2024',
      excerpt: 'Analizamos las mejores opciones de Nvidia y AMD para cada presupuesto.',
      content: `
        <p>Las tarjetas gráficas son el corazón de cualquier PC gaming, y en 2024 tenemos opciones más potentes que nunca.</p>
        <h2>Gama Alta: RTX 4090</h2>
        <p>Si buscas el máximo rendimiento sin importar el precio, la RTX 4090 sigue siendo la reina indiscutible...</p>
        <h2>Gama Media: RTX 4070</h2>
        <p>Para la mayoría de jugadores, la RTX 4070 ofrece un excelente equilibrio entre rendimiento y precio...</p>
        <h2>Gama Económica: RX 7600</h2>
        <p>La AMD RX 7600 es una excelente opción para presupuestos más ajustados, ofreciendo...</p>
        <h2>Conclusión</h2>
        <p>Sea cual sea tu presupuesto, actualmente hay excelentes opciones en el mercado...</p>
      `,
      author: this.mockAuthors[0],
      coverImage: 'https://picsum.photos/id/211/1200/600',
      tags: ['RTX 4000', 'AMD', 'Gaming'],
      categories: ['Hardware'],
      publishDate: new Date('2023-12-15'),
      readTime: 8,
      featured: true,
      views: 1245
    },
    {
      id: '2',
      title: 'Guía para overclock seguro de CPU',
      slug: 'guia-overclock-seguro-cpu',
      excerpt: 'Todo lo que necesitas saber para aumentar el rendimiento de tu procesador sin riesgos.',
      content: `
        <p>El overclocking puede dar nueva vida a tu procesador, pero debe hacerse correctamente para evitar daños.</p>
        <h2>¿Qué es el overclocking?</h2>
        <p>El overclocking consiste en aumentar la frecuencia de reloj por encima de los valores de fábrica...</p>
        <h2>Requisitos previos</h2>
        <p>Antes de comenzar, necesitarás un buen sistema de refrigeración y una fuente de alimentación de calidad...</p>
        <h2>Procedimiento paso a paso</h2>
        <p>1. Entra en la BIOS de tu sistema presionando Delete o F2 durante el arranque...</p>
        <p>2. Busca la sección de configuración de CPU, normalmente llamada "CPU Configuration" o similar...</p>
        <p>3. Aumenta el multiplicador de la CPU en pequeños incrementos, por ejemplo de 0.5 en 0.5...</p>
        <h2>Pruebas de estabilidad</h2>
        <p>Después de cada cambio, es fundamental realizar pruebas de estabilidad utilizando software como Prime95...</p>
        <h2>Monitorización de temperaturas</h2>
        <p>Mantén siempre un ojo en las temperaturas utilizando software como HWMonitor o Core Temp...</p>
        <h2>Conclusión</h2>
        <p>Con paciencia y siguiendo estos pasos, podrás obtener un rendimiento adicional de forma segura...</p>
      `,
      author: this.mockAuthors[1],
      coverImage: 'https://picsum.photos/id/212/1200/600',
      tags: ['Overclocking', 'Intel', 'AMD'],
      categories: ['Tutoriales', 'Hardware'],
      publishDate: new Date('2023-12-10'),
      readTime: 12,
      featured: false,
      views: 879
    },
    {
      id: '3',
      title: 'Cómo configurar tu PC para streaming',
      slug: 'configurar-pc-para-streaming',
      excerpt: 'Ajustes de OBS, hardware recomendado y consejos de profesionales.',
      content: `
        <p>El streaming se ha convertido en una actividad muy popular, y configurar correctamente tu PC puede marcar la diferencia...</p>
        <h2>Hardware recomendado</h2>
        <p>Para streaming de calidad, recomendamos como mínimo un procesador de 8 núcleos como el Ryzen 7 5800X3D...</p>
        <h2>Configuración de OBS</h2>
        <p>Open Broadcaster Software (OBS) es la herramienta más popular para streaming. Veamos cómo configurarla correctamente...</p>
        <h3>Ajustes de codificación</h3>
        <p>Si tienes una tarjeta gráfica NVIDIA reciente, lo mejor es usar el codificador NVENC para reducir la carga del CPU...</p>
        <h3>Resolución y bitrate</h3>
        <p>Para streaming en 1080p a 60fps, recomendamos un bitrate de al menos 6000kbps...</p>
        <h2>Organización de escenas</h2>
        <p>Organizar tus escenas de forma eficiente te permitirá cambiar entre ellas sin problemas durante el directo...</p>
        <h2>Audio</h2>
        <p>Configurar correctamente el audio es crucial. Recomendamos usar filtros como el Noise Suppression...</p>
        <h2>Consejos de profesionales</h2>
        <p>Entrevistamos a varios streamers profesionales para recopilar sus mejores consejos...</p>
      `,
      author: this.mockAuthors[1],
      coverImage: 'https://picsum.photos/id/213/1200/600',
      tags: ['Streaming', 'Software', 'Gaming'],
      categories: ['Tutoriales', 'Software'],
      publishDate: new Date('2023-12-05'),
      readTime: 10,
      featured: true,
      views: 1523
    }
  ];

  constructor() { }

  getPosts(page: number = 1, limit: number = 10, category?: string, tag?: string): Observable<{posts: BlogPost[], total: number}> {
    // Filtrar por categoría si se proporciona
    let filteredPosts = this.mockPosts;
    
    if (category) {
      filteredPosts = filteredPosts.filter(post => 
        post.categories.some(cat => cat.toLowerCase() === category.toLowerCase())
      );
    }
    
    if (tag) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags.some(t => t.toLowerCase() === tag.toLowerCase())
      );
    }
    
    // Simular paginación
    const startIndex = (page - 1) * limit;
    const paginatedPosts = filteredPosts.slice(startIndex, startIndex + limit);
    
    // Simular delay de red
    return of({
      posts: paginatedPosts,
      total: filteredPosts.length
    }).pipe(delay(300));
  }

  getFeaturedPosts(limit: number = 3): Observable<BlogPost[]> {
    const featuredPosts = this.mockPosts
      .filter(post => post.featured)
      .slice(0, limit);
      
    return of(featuredPosts).pipe(delay(300));
  }

  getPostBySlug(slug: string): Observable<BlogPost | null> {
    const post = this.mockPosts.find(p => p.slug === slug) || null;
    return of(post).pipe(delay(300));
  }

  getRelatedPosts(postId: string, limit: number = 3): Observable<BlogPost[]> {
    // Encontrar el post actual
    const currentPost = this.mockPosts.find(p => p.id === postId);
    
    if (!currentPost) {
      return of([]);
    }
    
    // Encontrar posts con categorías o tags similares
    const relatedPosts = this.mockPosts
      .filter(post => post.id !== postId) // Excluir el post actual
      .filter(post => {
        // Verificar si hay categorías o tags en común
        const hasCommonCategory = post.categories.some(category => 
          currentPost.categories.includes(category)
        );
        
        const hasCommonTag = post.tags.some(tag => 
          currentPost.tags.includes(tag)
        );
        
        return hasCommonCategory || hasCommonTag;
      })
      .slice(0, limit);
      
    return of(relatedPosts).pipe(delay(300));
  }

  getCategories(): Observable<BlogCategory[]> {
    return of(this.mockCategories).pipe(delay(300));
  }

  getTags(): Observable<BlogTag[]> {
    return of(this.mockTags).pipe(delay(300));
  }

  searchPosts(query: string): Observable<BlogPost[]> {
    if (!query.trim()) {
      return of([]);
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    
    const results = this.mockPosts.filter(post => 
      post.title.toLowerCase().includes(normalizedQuery) ||
      post.excerpt.toLowerCase().includes(normalizedQuery) ||
      post.content.toLowerCase().includes(normalizedQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
      post.categories.some(category => category.toLowerCase().includes(normalizedQuery))
    );
    
    return of(results).pipe(delay(300));
  }

  incrementViewCount(postId: string): Observable<void> {
    // En una implementación real, esto enviaría una solicitud al backend
    const post = this.mockPosts.find(p => p.id === postId);
    
    if (post) {
      post.views += 1;
    }
    
    return of(undefined);
  }
}
