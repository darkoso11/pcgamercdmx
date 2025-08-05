@Injectable({
  providedIn: 'root'
})
export class AdminBlogService {
  constructor(private http: HttpClient) {}
  
  // CRUD para artículos
  getAllPosts(filters?: any): Observable<DraftPost[]> {
    // Implementación
  }
  
  getPostById(id: string): Observable<DraftPost> {
    // Implementación
  }
  
  createPost(post: DraftPost): Observable<DraftPost> {
    // Implementación
  }
  
  updatePost(id: string, post: DraftPost): Observable<DraftPost> {
    // Implementación
  }
  
  deletePost(id: string): Observable<void> {
    // Implementación
  }
  
  publishPost(id: string): Observable<DraftPost> {
    // Implementación
  }
  
  unpublishPost(id: string): Observable<DraftPost> {
    // Implementación
  }
  
  schedulePost(id: string, publishDate: Date): Observable<DraftPost> {
    // Implementación
  }
  
  // Gestión de categorías y etiquetas
  getCategories(): Observable<BlogCategory[]> {
    // Implementación
  }
  
  createCategory(category: BlogCategory): Observable<BlogCategory> {
    // Implementación
  }
  
  // ... métodos similares para etiquetas
  
  // Estadísticas y analíticas
  getPostStatistics(): Observable<any> {
    // Implementación
  }
}
