# Plan de contenido — septiembre 2026

Estado: implementado localmente según las decisiones de [implementacion.md](implementacion.md). Publicación pendiente.

## Fuente y alcance

[Calendario editorial](https://docs.google.com/spreadsheets/d/1icv4_INB0Q1XfQgBtfFBmYQefUBebkwavL-7KIZQxzc/edit), pestaña SEO ON PAGE, filas 3–6 y 12–15. Se leyeron los cuatro documentos enlazados y los inventarios de sus cuatro carpetas de imágenes. Transcripciones en esta carpeta conservan contenido y enlaces.

| Página | Ruta requerida | Contenido e imágenes |
| --- | --- | --- |
| Edición de audio y video | /pc-para-edicion-de-audio-y-video/ | edicion-fuente.md; 6 ensambles y 6 logos de software |
| Workstation | /workstation/ | workstation-fuente.md; 6 ensambles |
| Streaming | /streaming-pc/ | streaming-fuente.md; 6 ensambles |
| Componentes PC Gamer | /componentes-para-pc-gamer/ | componentes-fuente.md; 14 imágenes de componentes |

## Diseño propuesto

Crear cuatro páginas comerciales enlazadas desde Productos, manteniendo tipografía, colores y componentes del sitio. Usar la página actual de gama alta como referencia de integración. Mantener las URL raíz indicadas por SEO aunque se acceda desde el menú Productos.

Estructura: H1 e introducción del documento, CTA de contacto, cuadrícula de productos con imágenes y enlaces, secciones H2/H3 del texto, botones de catálogo/cotización donde corresponda, cierre comercial y cuatro preguntas frecuentes. Edición incorpora los seis logos suministrados. Componentes incorpora las catorce piezas indicadas.

Prioridad editorial: metatítulos y descripciones de la tabla SEO Content; texto, jerarquía, CTA, títulos y ALT de los documentos. Las instrucciones de producción (URL, Título, Alt Text) se convierten en atributos y recursos, no se muestran como párrafos. Conservar textos completos aunque superen las 500 palabras orientativas de la estrategia.

## Alternativas

1. Recomendada: páginas Angular con contenido editorial separado y piezas visuales compartidas para catálogo y FAQ. Reutiliza SEO y catálogo existentes; limita duplicación.
2. Cuatro componentes completamente independientes: máxima libertad visual, mayor mantenimiento repetido.
3. Páginas administradas en CMS: permiten edición posterior, pero requieren ampliar modelos y administración fuera del alcance editorial inicial.

## Diferencias que resolver

- La hoja solicita 301 de /productos/perifericos a componentes. El código actual separa periféricos de /productos/hardware-accesorios. Recomendación: conservar periféricos y crear la nueva página; confirmar esta desviación antes de aplicar una migración.
- /pc-gamer-gama-alta/ no figura como ruta; existe /pc-gamer-gama-alta-cdmx. Propuesta: alias 301 hacia la página existente, con canonical único.
- /pc-gamer-gama-media/ y /computadora-para-diseno-grafico/ no figuran en las rutas. Verificar despliegue antes de decidir nuevas páginas o destinos alternativos; no presentar enlaces rotos como trabajo terminado.
- En la estrategia de componentes, el enlace de edición apunta por error a diseño gráfico. El documento final ya utiliza /pc-para-edicion-de-audio-y-video/: seguir el documento final.
- Documentos incluyen precios y especificaciones de ensambles. Contrastar con catálogo antes de publicar; el componente actual de gama alta trata HYPERION y WORKSTATION como fichas editoriales con CTA a contacto, mientras los nuevos textos enlazan sus fichas de ensamble.
- La ficha editorial WORKSTATION combina Ryzen 7 9700X y placa TRX50; requiere verificación de compatibilidad antes de reproducirla. CÁPSULA indica RTX 5070 8GB: contrastar modelo y memoria. No corregir datos comerciales por conjetura.

## Implementación y verificación

1. Inventariar cada imagen del documento y descargar archivos suministrados; comprobar visualmente correspondencia, optimizar tamaños y registrar nombre, título y ALT. Servir recursos locales con dimensiones declaradas y carga diferida fuera del primer bloque.
2. Resolver mapa de enlaces y productos contra el catálogo vigente. Si falta una ficha, mostrar consulta de disponibilidad con CTA de contacto y sin inventar stock o precio vigente.
3. Implementar páginas y componentes compartidos con datos tipados. Mantener contenido editorial renderizable aunque falle el catálogo; mostrar estado de consulta en productos afectados.
4. Añadir rutas, enlaces del menú y sitemap, y verificar prerender. Usar SeoService para metadatos, canonical, Open Graph y datos estructurados de página, navegación, listado y FAQ coherentes con el contenido visible.
5. Implementar redirecciones acordadas como respuestas HTTP 301 en la capa que sirve producción; verificar con solicitudes HTTP, no solamente navegación Angular.
6. Comprobar HTML generado de las cuatro URL: un H1, títulos/descripciones exactos, canonical, cuatro FAQ, imágenes y CTA correctos. Revisar móvil/escritorio, teclado, cambios de ruta, catálogo vacío y fallo de carga.
7. Ejecutar build y pruebas centradas en rutas, selección de productos y SEO. Revisar enlaces, peso de imágenes y rendimiento en una vista previa.
8. Tras despliegue, comprobar las cuatro URL públicas y sitemap; revisar GTM y solicitar/verificar indexación en Search Console si hay acceso. Registrar evidencia; no confundir prerender con indexación confirmada.

## Secuencia editorial propuesta

| Ventana de septiembre 2026 | Entregable |
| --- | --- |
| 15–18 | Resolver diferencias, validar catálogo, preparar imágenes y página de edición como base |
| 19–22 | Workstation y streaming, reutilizando la estructura validada |
| 23–25 | Componentes y navegación final |
| 26–28 | Revisión visual, SEO, rendimiento y correcciones |
| 29–30 | Publicación y verificaciones en producción según acceso disponible |

Ventanas propuestas, no automatizaciones ni publicación programada. Se pueden entregar las cuatro páginas antes si quedan resueltas las dependencias.

## Criterio de cierre

Cuatro páginas con contenido e imágenes suministrados, enlaces funcionales, metadatos y FAQ comprobados, catálogo coherente y build correcto. Entrega debe distinguir implementación local, publicación e indexación. No hay cambios de aplicación ni despliegue en esta fase de planificación.
