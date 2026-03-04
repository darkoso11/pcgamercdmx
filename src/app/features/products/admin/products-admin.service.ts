import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Interfaz para las subcategorías
 */
export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
}

/**
 * Interfaz para las categorías
 */
export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  subcategories?: Subcategory[];
}

/**
 * Interfaz para los productos
 */
export interface Product {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  brand: string;
  productType: string;
  categoryId: string;
  subcategoryId: string;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  currency: string;
  stock: number;
  lowStockAlert?: number;
  sku?: string;
  image: string;
  gallery?: string[];
  modelo?: string;
  tipo?: string;
  conexion?: string;
  tamaño?: string;
  material?: string;
  puertos?: string;
  especificacionPersonalizada?: string;
  metaDescription?: string;
  keywords?: string[];
  published?: boolean;
  featured?: boolean;
  internalNotes?: string;
  // Propiedades para ensambles de computadoras
  processor?: string;
  motherboard?: string;
  graphicsCard?: string;
  ram?: string;
  nvmeSsd?: string;
  powerSupply?: string;
  cooling?: string;
  case?: string;
  operatingSystem?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Servicio para administar productos
 */
@Injectable({
  providedIn: 'root'
})
export class ProductsAdminService {
  private apiUrl = '/api/products';
  private categoriesUrl = '/api/categories';

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todas las categorías con sus subcategorías
   */
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl).pipe(
      catchError((err) => {
        console.error('Error fetching categories:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene una categoría por su ID
   */
  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.categoriesUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching category:', err);
        return of({} as Category);
      })
    );
  }

  /**
   * Obtiene un producto por su ID
   */
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('Error fetching product:', err);
        return of({} as Product);
      })
    );
  }

  /**
   * Obtiene todos los productos
   */
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl).pipe(
      catchError((err) => {
        console.error('Error fetching products:', err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene productos por categoría
   */
  getProductsByCategory(categoryId: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/category/${categoryId}`).pipe(
      catchError((err) => {
        console.error('Error fetching products by category:', err);
        return of([]);
      })
    );
  }

  /**
   * Crea un nuevo producto
   */
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product).pipe(
      catchError((err) => {
        console.error('Error creating product:', err);
        throw err;
      })
    );
  }

  /**
   * Actualiza un producto existente
   */
  updateProduct(id: string, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product).pipe(
      catchError((err) => {
        console.error('Error updating product:', err);
        throw err;
      })
    );
  }

  /**
   * Elimina un producto
   */
  deleteProduct(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`).pipe(
      catchError((err) => {
        console.error('Error deleting product:', err);
        throw err;
      })
    );
  }

  /**
   * Carga una imagen y retorna su URL
   */
  uploadImage(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ url: string }>(`${this.apiUrl}/upload`, formData).pipe(
      catchError((err) => {
        console.error('Error uploading image:', err);
        throw err;
      })
    );
  }
}
