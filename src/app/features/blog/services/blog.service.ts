import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import { 
  BlogPost, 
  BlogCategory, 
  BlogTag, 
  BlogPostListResponse, 
  Author 
} from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private mockPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Cómo armar tu PC gamer en 2024: Guía completa',
      slug: 'como-armar-tu-pc-gamer-2024',
      excerpt: 'Aprende a construir tu PC gaming desde cero con los mejores componentes del mercado actual.',
      content: `
        <h2>Introducción al mundo del PC Gaming</h2>
        <p>Armar tu propia PC gamer es una experiencia gratificante que te permite personalizar cada aspecto de tu sistema según tus necesidades específicas. En esta guía, te llevaremos paso a paso a través del proceso completo.</p>
        
        <h2>Seleccionando los componentes adecuados</h2>
        <p>La selección de componentes es crucial para conseguir el rendimiento que buscas:</p>
        
        <h3>Procesador (CPU)</h3>
        <p>El cerebro de tu sistema. Actualmente, los procesadores <strong>AMD Ryzen 7000</strong> y <strong>Intel Core 13ª generación</strong> ofrecen el mejor rendimiento para gaming.</p>
        
        <h3>Tarjeta gráfica (GPU)</h3>
        <p>El componente más importante para gaming. Las <strong>NVIDIA RTX 4070</strong> y <strong>AMD RX 7800 XT</strong> ofrecen excelente rendimiento en la gama media-alta.</p>
        
        <h3>Memoria RAM</h3>
        <p>Para gaming en 2024, 16GB es el mínimo recomendado, pero 32GB te dará más margen para multitarea y juegos exigentes.</p>
        
        <h2>Ensamblaje paso a paso</h2>
        <p>El proceso de ensamblaje puede parecer intimidante al principio, pero siguiendo estos pasos será mucho más sencillo:</p>
        
        <ol>
          <li>Instala el procesador en la placa madre con cuidado, alineando las marcas.</li>
          <li>Monta el disipador de CPU siguiendo las instrucciones del fabricante.</li>
          <li>Instala los módulos de RAM en los slots adecuados.</li>
          <li>Monta la placa madre en el gabinete.</li>
          <li>Instala la fuente de poder y conecta los cables principales.</li>
          <li>Monta la tarjeta gráfica en el slot PCIe principal.</li>
          <li>Conecta todos los cables de alimentación restantes.</li>
          <li>Instala tus unidades de almacenamiento.</li>
        </ol>
        
        <h2>Configuración inicial</h2>
        <p>Una vez ensamblado tu sistema, es momento de configurar el software:</p>
        
        <ul>
          <li>Instala Windows 11 desde una unidad USB booteable.</li>
          <li>Actualiza todos los drivers, especialmente los de la GPU.</li>
          <li>Configura la BIOS para habilitar XMP/DOCP para tu RAM.</li>
          <li>Instala tus juegos favoritos y disfruta de tu nueva PC!</li>
        </ul>
      `,
      coverImage: 'assets/img/blog/pc-building-guide.jpg',
      publishDate: new Date('2024-03-15'),
      author: {
        id: '1',
        name: 'Carlos Rodríguez',
        avatar: 'assets/img/authors/carlos.jpg',
        bio: 'Experto en hardware y apasionado por el PC gaming. Llevo más de 10 años armando computadoras y optimizando sistemas.',
        socialLinks: {
          twitter: 'https://twitter.com/carlostech',
          instagram: 'https://instagram.com/carlos_tech'
        }
      },
      categories: ['Guías', 'Hardware'],
      tags: ['PC Gaming', 'Ensamblaje', 'Hardware', 'Guía'],
      readTime: 12,
      views: 3240,
      featured: true
    },
    {
      id: '2',
      title: 'Las mejores tarjetas gráficas para gaming en 2024',
      slug: 'mejores-tarjetas-graficas-gaming-2024',
      excerpt: 'Análisis detallado de las GPUs más potentes y con mejor relación calidad-precio del mercado actual.',
      content: `
        <h2>El panorama de las GPUs en 2024</h2>
        <p>El mercado de tarjetas gráficas ha experimentado grandes cambios en los últimos años. Con la llegada de las arquitecturas Ada Lovelace de NVIDIA y RDNA 3 de AMD, los gamers tienen más opciones que nunca.</p>
        
        <h2>Gama alta: máximo rendimiento</h2>
        <p>Si buscas lo mejor de lo mejor y el presupuesto no es problema:</p>
        
        <h3>NVIDIA RTX 4090</h3>
        <p>La indiscutible reina del rendimiento. Con 24GB de VRAM y una potencia bruta impresionante, no hay juego que se le resista, incluso en 4K con ray tracing. Su único inconveniente es su precio prohibitivo y consumo energético.</p>
        
        <h3>AMD Radeon RX 7900 XTX</h3>
        <p>La respuesta de AMD a la gama alta de NVIDIA ofrece un rendimiento excelente a un precio más accesible que la RTX 4090. Sus 24GB de VRAM la hacen ideal para juegos exigentes y creación de contenido.</p>
        
        <h2>Gama media-alta: el punto dulce</h2>
        
        <h3>NVIDIA RTX 4070 Ti</h3>
        <p>Ofrece un rendimiento similar a la antigua buque insignia RTX 3090 pero con menor consumo y precio. Perfecta para gaming en 1440p con todas las características activadas o 4K con algunos ajustes.</p>
        
        <h3>AMD Radeon RX 7800 XT</h3>
        <p>Excelente relación calidad-precio. Supera a la RTX 4070 en rendimiento rasterizado tradicional y cuesta menos, aunque su rendimiento en ray tracing es inferior.</p>
        
        <h2>Gama media: accesibilidad y buen rendimiento</h2>
        
        <h3>NVIDIA RTX 4060 Ti</h3>
        <p>Ideal para gaming en 1080p y 1440p con alta tasa de fotogramas. Ofrece soporte para DLSS 3 con generación de frames, lo que puede mejorar significativamente el rendimiento en juegos compatibles.</p>
        
        <h3>AMD Radeon RX 7700 XT</h3>
        <p>Ofrece más VRAM (12GB) que su competidora directa y mejor rendimiento en memoria, lo que la hace más preparada para juegos futuros.</p>
        
        <h2>Tecnologías a considerar</h2>
        <p>Al elegir una GPU, no solo debes considerar el rendimiento bruto:</p>
        
        <ul>
          <li><strong>DLSS vs FSR:</strong> Las tecnologías de upscaling de NVIDIA y AMD pueden aumentar significativamente el rendimiento.</li>
          <li><strong>Ray Tracing:</strong> NVIDIA sigue teniendo ventaja en rendimiento con ray tracing activado.</li>
          <li><strong>VRAM:</strong> Para resoluciones altas y texturas de alta calidad, más VRAM siempre es mejor.</li>
          <li><strong>Eficiencia energética:</strong> Considera el consumo y los requisitos de fuente de alimentación.</li>
        </ul>
      `,
      coverImage: 'assets/img/blog/gpu-comparison.jpg',
      publishDate: new Date('2024-04-02'),
      author: {
        id: '2',
        name: 'Laura Martínez',
        avatar: 'assets/img/authors/laura.jpg',
        bio: 'Especialista en tecnología y hardware gaming. Analista de componentes y benchmarks en varios medios especializados.',
        socialLinks: {
          twitter: 'https://twitter.com/lauratechgaming',
          linkedin: 'https://linkedin.com/in/lauramartineztech'
        }
      },
      categories: ['Hardware', 'Análisis'],
      tags: ['GPU', 'Tarjetas gráficas', 'NVIDIA', 'AMD', 'Gaming'],
      readTime: 15,
      views: 2850
    },
    {
      id: '3',
      title: 'Optimización de Windows 11 para gaming: Guía definitiva',
      slug: 'optimizacion-windows-11-gaming',
      excerpt: 'Maximiza el rendimiento de tus juegos en Windows 11 con estos ajustes y configuraciones esenciales.',
      content: `
        <h2>Windows 11 y gaming: un matrimonio complicado</h2>
        <p>Cuando Windows 11 se lanzó, muchos gamers experimentaron problemas de rendimiento comparado con Windows 10. Sin embargo, con las actualizaciones recientes y los ajustes adecuados, Windows 11 puede ofrecer una experiencia gaming superior.</p>
        
        <h2>Ajustes fundamentales del sistema</h2>
        
        <h3>Activar el Modo Juego</h3>
        <p>Windows 11 incluye un Modo Juego mejorado que prioriza los recursos del sistema para tu experiencia gaming:</p>
        <ol>
          <li>Abre la Configuración de Windows (Windows + I)</li>
          <li>Ve a "Juegos" > "Modo Juego"</li>
          <li>Activa la opción "Modo Juego"</li>
        </ol>
        
        <h3>Desactivar funciones innecesarias</h3>
        <p>Algunas características de Windows 11 pueden consumir recursos valiosos:</p>
        <ul>
          <li>Desactiva "Consejos y sugerencias" en Configuración > Sistema > Notificaciones</li>
          <li>Desactiva efectos visuales innecesarios en "Configuración > Accesibilidad > Efectos visuales"</li>
          <li>Considera desactivar la grabación en segundo plano de Xbox Game Bar si no la utilizas</li>
        </ul>
        
        <h2>Optimización de hardware virtual</h2>
        
        <h3>Memoria virtual</h3>
        <p>Ajustar la memoria virtual puede mejorar el rendimiento:</p>
        <ol>
          <li>Busca "Rendimiento" en el menú de inicio y selecciona "Ajustar el rendimiento y aspecto de Windows"</li>
          <li>Ve a la pestaña "Avanzado" y haz clic en "Cambiar" en la sección "Memoria virtual"</li>
          <li>Desmarca "Administrar automáticamente el tamaño del archivo de paginación"</li>
          <li>Establece un tamaño personalizado: el tamaño inicial debe ser 1.5x tu RAM y el tamaño máximo 3x tu RAM</li>
        </ol>
        
        <h3>Hardware-Accelerated GPU Scheduling</h3>
        <p>Esta función permite que tu GPU administre su propia memoria, reduciendo la latencia:</p>
        <ol>
          <li>Ve a Configuración > Sistema > Pantalla > Gráficos</li>
          <li>Activa "Programación de GPU acelerada por hardware"</li>
        </ol>
        
        <h2>Optimización de drivers y software</h2>
        
        <h3>Actualiza tus drivers gráficos</h3>
        <p>Tanto NVIDIA como AMD lanzan regularmente drivers optimizados para los últimos juegos:</p>
        <ul>
          <li>Utiliza GeForce Experience (NVIDIA) o Radeon Software (AMD) para mantener tus drivers actualizados</li>
          <li>Considera utilizar drivers Studio/Enterprise para mayor estabilidad, o drivers Game Ready para las últimas optimizaciones</li>
        </ul>
        
        <h3>Optimización específica para juegos</h3>
        <p>Configura los paneles de control de tu GPU:</p>
        <ul>
          <li>NVIDIA: Configura "Administrar configuración 3D" en el Panel de Control NVIDIA</li>
          <li>AMD: Ajusta la configuración en Radeon Software > Juegos</li>
        </ul>
        
        <h2>Solución de problemas comunes</h2>
        
        <h3>VBS (Virtualization-Based Security)</h3>
        <p>VBS puede afectar al rendimiento en algunos juegos. Considera desactivarlo si no necesitas sus características de seguridad:</p>
        <ol>
          <li>Busca "Seguridad de Windows" y ábrelo</li>
          <li>Ve a "Seguridad del dispositivo" > "Aislamiento central"</li>
          <li>Desactiva "Seguridad basada en virtualización"</li>
        </ol>
        
        <h3>Problemas de CPU E-cores/P-cores (Intel)</h3>
        <p>Para procesadores Intel de 12ª generación en adelante:</p>
        <ul>
          <li>Actualiza Windows 11 a la última versión</li>
          <li>Considera usar el software Intel Thread Director</li>
          <li>Para juegos específicos con problemas, puedes asignar afinidad de CPU manualmente</li>
        </ul>
      `,
      coverImage: 'assets/img/blog/windows-11-gaming.jpg',
      publishDate: new Date('2024-02-20'),
      author: {
        id: '3',
        name: 'Miguel Ángel Torres',
        avatar: 'assets/img/authors/miguel.jpg',
        bio: 'Especialista en optimización de sistemas y overclocking. Consultor de sistemas para torneos de esports.',
        socialLinks: {
          twitter: 'https://twitter.com/migueloptimizer',
          github: 'https://github.com/migueltorres'
        }
      },
      categories: ['Software', 'Guías'],
      tags: ['Windows 11', 'Optimización', 'Rendimiento', 'Gaming'],
      readTime: 18,
      views: 4120
    }
  ];

  private mockAuthors: Author[] = [
    {
      id: '1',
      name: 'Carlos Rodríguez',
      avatar: 'assets/img/authors/carlos.jpg',
      bio: 'Experto en hardware y apasionado por el PC gaming. Llevo más de 10 años armando computadoras y optimizando sistemas.',
      socialLinks: {
        twitter: 'https://twitter.com/carlostech',
        instagram: 'https://instagram.com/carlos_tech'
      }
    },
    {
      id: '2',
      name: 'Laura Martínez',
      avatar: 'assets/img/authors/laura.jpg',
      bio: 'Especialista en tecnología y hardware gaming. Analista de componentes y benchmarks en varios medios especializados.',
      socialLinks: {
        twitter: 'https://twitter.com/lauratechgaming',
        linkedin: 'https://linkedin.com/in/lauramartineztech'
      }
    },
    {
      id: '3',
      name: 'Miguel Ángel Torres',
      avatar: 'assets/img/authors/miguel.jpg',
      bio: 'Especialista en optimización de sistemas y overclocking. Consultor de sistemas para torneos de esports.',
      socialLinks: {
        twitter: 'https://twitter.com/migueloptimizer',
        github: 'https://github.com/migueltorres'
      }
    }
  ];

  private mockCategories: BlogCategory[] = [
    { id: '1', name: 'Hardware', slug: 'hardware', description: 'Análisis y guías sobre componentes para PC', count: 8 },
    { id: '2', name: 'Software', slug: 'software', description: 'Programas, sistemas operativos y optimización', count: 5 },
    { id: '3', name: 'Guías', slug: 'guias', description: 'Tutoriales paso a paso para diversas tareas', count: 12 },
    { id: '4', name: 'Análisis', slug: 'analisis', description: 'Revisiones detalladas de productos y tecnologías', count: 7 },
    { id: '5', name: 'Noticias', slug: 'noticias', description: 'Las últimas novedades del mundo tech y gaming', count: 15 }
  ];

  private mockTags: BlogTag[] = [
    { id: '1', name: 'PC Gaming', slug: 'pc-gaming', count: 25 },
    { id: '2', name: 'Hardware', slug: 'hardware', count: 18 },
    { id: '3', name: 'NVIDIA', slug: 'nvidia', count: 9 },
    { id: '4', name: 'AMD', slug: 'amd', count: 8 },
    { id: '5', name: 'Intel', slug: 'intel', count: 7 },
    { id: '6', name: 'Windows 11', slug: 'windows-11', count: 5 },
    { id: '7', name: 'GPU', slug: 'gpu', count: 12 },
    { id: '8', name: 'CPU', slug: 'cpu', count: 10 },
    { id: '9', name: 'Ensamblaje', slug: 'ensamblaje', count: 6 },
    { id: '10', name: 'Optimización', slug: 'optimizacion', count: 8 }
  ];

  constructor(private http: HttpClient) { }

  /**
   * Obtiene una lista de posts con paginación y filtros opcionales
   */
  getPosts(page: number = 1, limit: number = 10, category?: string, tag?: string): Observable<BlogPostListResponse> {
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

  /**
   * Obtiene un post por su slug
   */
  getPostBySlug(slug: string): Observable<BlogPost> {
    const post = this.mockPosts.find(p => p.slug === slug);
    
    if (!post) {
      return throwError(() => new Error('Post not found'));
    }
    
    // Incrementar vistas (simulado)
    post.views += 1;
    
    return of(post).pipe(delay(300));
  }

  /**
   * Busca posts por término
   */
  searchPosts(query: string): Observable<BlogPost[]> {
    if (!query || query.trim() === '') {
      return of([]);
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    const results = this.mockPosts.filter(post => 
      post.title.toLowerCase().includes(normalizedQuery) || 
      post.excerpt.toLowerCase().includes(normalizedQuery) ||
      post.content.toLowerCase().includes(normalizedQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)) ||
      post.categories.some(cat => cat.toLowerCase().includes(normalizedQuery))
    ).slice(0, 5); // Limitar a 5 resultados
    
    return of(results).pipe(delay(300));
  }

  /**
   * Obtiene posts destacados
   */
  getFeaturedPosts(limit: number = 3): Observable<BlogPost[]> {
    const featured = this.mockPosts
      .filter(post => post.featured)
      .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())
      .slice(0, limit);
    
    return of(featured).pipe(delay(300));
  }

  /**
   * Obtiene posts relacionados a un post específico
   */
  getRelatedPosts(postId: string, limit: number = 3): Observable<BlogPost[]> {
    const post = this.mockPosts.find(p => p.id === postId);
    
    if (!post) {
      return of([]);
    }
    
    // Si el post tiene relatedPosts definidos, usarlos
    if (post.relatedPosts && post.relatedPosts.length > 0) {
      const related = this.mockPosts
        .filter(p => post.relatedPosts?.includes(p.id))
        .slice(0, limit);
      return of(related).pipe(delay(300));
    }
    
    // Si no, encontrar posts con categorías o tags similares
    const related = this.mockPosts
      .filter(p => p.id !== postId) // Excluir el post actual
      .map(p => {
        // Calcular puntuación de relevancia
        let score = 0;
        
        // Categorías compartidas
        const sharedCategories = p.categories.filter(cat => 
          post.categories.includes(cat)
        );
        score += sharedCategories.length * 2; // Mayor peso a categorías
        
        // Tags compartidos
        const sharedTags = p.tags.filter(tag => 
          post.tags.includes(tag)
        );
        score += sharedTags.length;
        
        return { post: p, score };
      })
      .filter(item => item.score > 0) // Solo posts con alguna relación
      .sort((a, b) => b.score - a.score) // Ordenar por relevancia
      .map(item => item.post)
      .slice(0, limit);
    
    return of(related).pipe(delay(300));
  }

  /**
   * Obtiene todas las categorías
   */
  getCategories(): Observable<BlogCategory[]> {
    return of(this.mockCategories).pipe(delay(300));
  }

  /**
   * Obtiene todos los tags
   */
  getTags(): Observable<BlogTag[]> {
    return of(this.mockTags).pipe(delay(300));
  }

  /**
   * Obtiene un autor por su ID
   */
  getAuthor(id: string): Observable<Author> {
    const author = this.mockAuthors.find(a => a.id === id);
    
    if (!author) {
      return throwError(() => new Error('Author not found'));
    }
    
    return of(author).pipe(delay(300));
  }

  /**
   * Obtiene los posts más populares (por vistas)
   */
  getPopularPosts(limit: number = 5): Observable<BlogPost[]> {
    const popular = this.mockPosts
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
    
    return of(popular).pipe(delay(300));
  }
}
