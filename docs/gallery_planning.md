# Plan de Galería de Imágenes

## Objetivo
Construir una galería en Angular que cargue un manifiesto JSON de imágenes y permita segmentarlas por categorías: `productos`, `gabinetes`, `custom`, `influencers`, `eventos`, `curiosidades`, `ensambles`, `marcas`, `certificaciones`, etc.

## Esquema de metadatos (gallery.json)
- `src`: ruta de la imagen (relativa a `/assets`)
- `title`: título opcional
- `category`: categoría principal (string)
- `tags`: array de etiquetas opcionales
- `author`: autor/creditos opcional
- `date`: fecha opcional (ISO)

Ejemplo:
```
{
  "src": "/assets/img/custom/IMG-20250208-WA0056.jpg",
  "title": "Custom Build A",
  "category": "custom",
  "tags": ["rgb","mod"],
  "author": "Usuario1",
  "date": "2025-02-08"
}
```

## Estructura propuesta en el repo
- `src/assets/img/...` (carpetas por tipo ya presentes)
- `src/assets/mock/gallery.json` (manifiesto)
- `src/app/features/gallery/gallery.service.ts` (carga el manifiesto)
- `src/app/features/gallery/gallery.component.(ts|html|scss)` (interfaz, filtros, grid, lightbox)

## Funcionalidades mínimas (MVP)
- Cargar manifest JSON desde `/assets/mock/gallery.json`.
- Mostrar grid responsivo de miniaturas.
- Filtro por categoría (botones) y búsqueda por tags/título (futuro).
- Modal/lightbox simple al hacer clic en una imagen.
- Lazy loading de imágenes con `loading="lazy"`.

## Mejoras posibles (Fase 2)
- Paginación o scroll infinito para grandes catálogos.
- Upload/administración desde panel admin (actualizar `gallery.json`).
- Categorías múltiples por imagen.
- Soporte para formatos WebP y generación de thumbnails.
- Accesibilidad: teclado, roles ARIA, descripciones.

## Diseño Cyberpunk aplicado
- Tema oscuro con gradientes neón (cian, púrpura, rosa).
- Header con título glow y animación pulse.
- Filtros como botones redondos con hover glow.
- **Masonry grid**: Layout tipo Pinterest con alturas variables, usando CSS Grid (con fallback a flex).
- Items con hover effects (scale, glow, overlay), animaciones fade-in staggered.
- Modal con backdrop blur, animaciones de entrada.
- Loader spinner mientras carga el JSON.
- Mensaje si no hay imágenes en categoría.
- Tags mostrados en overlay bottom de cada item.
- Responsive para móviles.

## Funcionalidades actuales
- Carga de `gallery.json` con manejo de errores.
- Filtros por categoría (muestra todas por defecto).
- Modal lightbox con detalles.
- Lazy loading.
- TrackBy para optimización.
- Estado de carga.

## Próximas mejoras
- Búsqueda por título/tags.
- Paginación si >50 imágenes.
- Upload desde admin (actualizar JSON dinámicamente).
- Soporte para videos o más tipos de media.
