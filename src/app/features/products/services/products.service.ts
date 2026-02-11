import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface ProductBrandLogo {
  src: string;
  alt: string;
  position: string;
}

export interface Product {
  id: number;
  title: string;
  image: string;
  price: number;
  processor: string;
  motherboard: string;
  ram: string;
  storage: string;
  graphicsCard: string;
  slug: string;
  brandLogos: ProductBrandLogo[];
  powerCertificate: string;
  watts: number;
  category?: 'paquete' | 'periferico' | 'componente';
  description?: string;
  specifications?: { [key: string]: string };
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  // Mock data - En producción esto vendría de una API
  private products: Product[] = [
    {
      id: 1,
      title: 'CPU PRE ARMADO 1',
      image: 'assets/img/gabinetes/BR-938686_1.png',
      price: 11999,
      processor: 'AMD RYZEN 7 5700',
      motherboard: 'ASUS ROG STRIX B550-F',
      ram: '16 GB DDR4',
      storage: 'SSD M.2 NVME 1TB',
      graphicsCard: 'NVIDIA RTX 3060',
      slug: 'cpu-pre-armado-1',
      brandLogos: [
        {
          src: 'assets/img/marcas/nvidia_tag.svg',
          alt: 'NVIDIA',
          position: 'top-left',
        },
        {
          src: 'assets/img/marcas/ryzen_tag.svg',
          alt: 'AMD Ryzen',
          position: 'top-right',
        },
        {
          src: 'assets/img/marcas/corsairbrand.png',
          alt: 'Corsair',
          position: 'bottom-left',
        },
      ],
      powerCertificate: 'assets/img/certificaciones/80plusgold.png',
      watts: 650,
      category: 'paquete',
      description:
        'PC de escritorio potente diseñada para gaming casual y producción de contenido. Equipada con procesador AMD Ryzen de última generación y tarjeta gráfica NVIDIA RTX 3060 para un rendimiento equilibrado.',
      specifications: {
        'Procesador': 'AMD RYZEN 7 5700 (8 núcleos / 16 hilos)',
        'Placa Base': 'ASUS ROG STRIX B550-F',
        'Memoria RAM': '16 GB DDR4 3600MHz',
        'Almacenamiento': 'SSD NVMe 1TB PCIe 4.0',
        'Tarjeta Gráfica': 'NVIDIA RTX 3060 (12GB GDDR6)',
        'Fuente de Poder': '650W Certificado 80+ Gold',
        'Gabinete': 'Fractal Design Core 1000',
        'Refrigeración': 'Refrigeración por aire stock',
        'Conectividad': 'WiFi 6, Gigabit Ethernet',
        'Puertos': '4x USB 3.2, 2x USB 2.0, Jack 3.5mm',
      },
    },
    {
      id: 2,
      title: 'CPU PRE ARMADO 2',
      image: 'assets/img/gabinetes/HBJNKHGNM.png',
      price: 15999,
      processor: 'INTEL CORE i5-12400F',
      motherboard: 'ASUS PRIME B660M-A',
      ram: '32 GB DDR4',
      storage: 'SSD M.2 NVME 1TB',
      graphicsCard: 'NVIDIA RTX 3070',
      slug: 'cpu-pre-armado-2',
      brandLogos: [
        {
          src: 'assets/img/marcas/nvidia_tag.svg',
          alt: 'NVIDIA',
          position: 'top-left',
        },
        {
          src: 'assets/img/marcas/ryzen_tag.svg',
          alt: 'AMD Ryzen',
          position: 'top-right',
        },
        {
          src: 'assets/img/marcas/corsairbrand.png',
          alt: 'Corsair',
          position: 'bottom-left',
        },
      ],
      powerCertificate: 'assets/img/certificaciones/80plusgold.png',
      watts: 650,
      category: 'paquete',
      description:
        'PC gaming de alto rendimiento con procesador Intel de 12ª generación. Ideal para gaming en 1440p con configuraciones altas y multitarea exigente.',
      specifications: {
        'Procesador': 'Intel Core i5-12400F (6 núcleos / 12 hilos)',
        'Placa Base': 'ASUS PRIME B660M-A',
        'Memoria RAM': '32 GB DDR4 3200MHz',
        'Almacenamiento': 'SSD NVMe 1TB PCIe 3.0',
        'Tarjeta Gráfica': 'NVIDIA RTX 3070 (8GB GDDR6)',
        'Fuente de Poder': '750W Certificado 80+ Gold',
        'Gabinete': 'NZXT H510',
        'Refrigeración': 'Refrigeración por aire',
        'Conectividad': 'WiFi 6E, Gigabit Ethernet',
        'Puertos': '6x USB 3.2, 2x USB 2.0, Jack 3.5mm',
      },
    },
    {
      id: 3,
      title: 'CPU PRE ARMADO 3',
      image: 'assets/img/gabinetes/product-section-01.png',
      price: 21999,
      processor: 'AMD RYZEN 9 5900X',
      motherboard: 'ASUS ROG STRIX X570-E',
      ram: '32 GB DDR4',
      storage: 'SSD M.2 NVME 2TB',
      graphicsCard: 'NVIDIA RTX 3080',
      slug: 'cpu-pre-armado-3',
      brandLogos: [
        {
          src: 'assets/img/marcas/nvidia_tag.svg',
          alt: 'NVIDIA',
          position: 'top-left',
        },
        {
          src: 'assets/img/marcas/ryzen_tag.svg',
          alt: 'AMD Ryzen',
          position: 'top-right',
        },
        {
          src: 'assets/img/marcas/corsairbrand.png',
          alt: 'Corsair',
          position: 'bottom-left',
        },
      ],
      powerCertificate: 'assets/img/certificaciones/80plusgold.png',
      watts: 650,
      category: 'paquete',
      description:
        'PC gaming profesional con procesador Ryzen 9 de 12 núcleos. Diseñada para gaming en 4K ultra y creación de contenido intensiva.',
      specifications: {
        'Procesador': 'AMD Ryzen 9 5900X (12 núcleos / 24 hilos)',
        'Placa Base': 'ASUS ROG STRIX X570-E',
        'Memoria RAM': '32 GB DDR4 3600MHz',
        'Almacenamiento': 'SSD NVMe 2TB PCIe 4.0',
        'Tarjeta Gráfica': 'NVIDIA RTX 3080 (10GB GDDR6X)',
        'Fuente de Poder': '850W Certificado 80+ Gold',
        'Gabinete': 'Lian Li LANCOOL 215',
        'Refrigeración': 'Refrigeración líquida AIO 360mm',
        'Conectividad': 'WiFi 6, 2.5G Ethernet',
        'Puertos': '8x USB 3.2, 4x USB 2.0, Jack 3.5mm',
      },
    },
    {
      id: 4,
      title: 'CPU PRE ARMADO 4',
      image: 'assets/img/gabinetes/rog-hyperion-gr701.png',
      price: 29999,
      processor: 'INTEL CORE i9-12900K',
      motherboard: 'ASUS ROG MAXIMUS Z690 HERO',
      ram: '64 GB DDR5',
      storage: 'SSD M.2 NVME 2TB',
      graphicsCard: 'NVIDIA RTX 4080',
      slug: 'cpu-pre-armado-4',
      brandLogos: [
        {
          src: 'assets/img/marcas/nvidia_tag.svg',
          alt: 'NVIDIA',
          position: 'top-left',
        },
        {
          src: 'assets/img/marcas/ryzen_tag.svg',
          alt: 'AMD Ryzen',
          position: 'top-right',
        },
        {
          src: 'assets/img/marcas/corsairbrand.png',
          alt: 'Corsair',
          position: 'bottom-left',
        },
      ],
      powerCertificate: 'assets/img/certificaciones/80plusgold.png',
      watts: 650,
      category: 'paquete',
      description:
        'PC gaming flagship con componentes de gama ultra. Procesador Intel Core i9 de 12ª generación y RTX 4080. Perfecto para máximo rendimiento en cualquier escenario.',
      specifications: {
        'Procesador': 'Intel Core i9-12900K (16 núcleos / 24 hilos)',
        'Placa Base': 'ASUS ROG MAXIMUS Z690 HERO',
        'Memoria RAM': '64 GB DDR5 6000MHz',
        'Almacenamiento': 'SSD NVMe 2TB PCIe 5.0',
        'Tarjeta Gráfica': 'NVIDIA RTX 4080 (16GB GDDR6X)',
        'Fuente de Poder': '1000W Certificado 80+ Platinum',
        'Gabinete': 'Corsair Crystal Series 680X RGB',
        'Refrigeración': 'Refrigeración líquida AIO 480mm',
        'Conectividad': 'WiFi 6E, 10G Ethernet',
        'Puertos': '10x USB 3.2, 4x USB 2.0, Jack 3.5mm + USB-C',
      },
    },
    {
      id: 5,
      title: 'CPU PRE ARMADO 5',
      image: 'assets/img/gabinetes/rog-hyperion-gr701.png',
      price: 34999,
      processor: 'AMD RYZEN 9 5950X',
      motherboard: 'ASUS ROG CROSSHAIR VIII HERO',
      ram: '64 GB DDR4',
      storage: 'SSD M.2 NVME 2TB',
      graphicsCard: 'NVIDIA RTX 4090',
      slug: 'cpu-pre-armado-5',
      brandLogos: [
        {
          src: 'assets/img/marcas/nvidia_tag.svg',
          alt: 'NVIDIA',
          position: 'top-left',
        },
        {
          src: 'assets/img/marcas/ryzen_tag.svg',
          alt: 'AMD Ryzen',
          position: 'top-right',
        },
        {
          src: 'assets/img/marcas/corsairbrand.png',
          alt: 'Corsair',
          position: 'bottom-left',
        },
      ],
      powerCertificate: 'assets/img/certificaciones/80plusgold.png',
      watts: 650,
      category: 'paquete',
      description:
        'PC gaming supremo con procesador Ryzen 9 de 16 núcleos y RTX 4090. La máquina más potente para gaming y creación profesional sin límites.',
      specifications: {
        'Procesador': 'AMD Ryzen 9 5950X (16 núcleos / 32 hilos)',
        'Placa Base': 'ASUS ROG CROSSHAIR VIII HERO',
        'Memoria RAM': '64 GB DDR4 3600MHz',
        'Almacenamiento': 'SSD NVMe 2TB PCIe 4.0',
        'Tarjeta Gráfica': 'NVIDIA RTX 4090 (24GB GDDR6X)',
        'Fuente de Poder': '1200W Certificado 80+ Titanium',
        'Gabinete': 'Thermaltake Core P5',
        'Refrigeración': 'Refrigeración líquida AIO 360mm + Custom',
        'Conectividad': 'WiFi 6, 10G Ethernet',
        'Puertos': '10x USB 3.2, 4x USB 2.0, USB-C, Jack 3.5mm',
      },
    },
  ];

  constructor() {}

  /**
   * Obtiene todos los productos
   */
  getAllProducts(): Observable<Product[]> {
    return of([...this.products]);
  }

  /**
   * Obtiene un producto específico por su slug
   */
  getProductBySlug(slug: string): Observable<Product | undefined> {
    const product = this.products.find((p) => p.slug === slug);
    return of(product);
  }

  /**
   * Obtiene productos por categoría
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    const filtered = this.products.filter((p) => p.category === category);
    return of(filtered);
  }

  /**
   * Obtiene productos relacionados (misma categoría, excluyendo el actual)
   */
  getRelatedProducts(slug: string, limit: number = 4): Observable<Product[]> {
    const current = this.products.find((p) => p.slug === slug);
    if (!current) {
      return of([]);
    }

    const related = this.products
      .filter((p) => p.category === current.category && p.slug !== slug)
      .slice(0, limit);

    return of(related);
  }

  /**
   * Busca productos por término de búsqueda
   */
  searchProducts(term: string): Observable<Product[]> {
    const lowerTerm = term.toLowerCase();
    const results = this.products.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerTerm) ||
        p.processor.toLowerCase().includes(lowerTerm) ||
        p.graphicsCard.toLowerCase().includes(lowerTerm) ||
        p.description?.toLowerCase().includes(lowerTerm)
    );
    return of(results);
  }
}
