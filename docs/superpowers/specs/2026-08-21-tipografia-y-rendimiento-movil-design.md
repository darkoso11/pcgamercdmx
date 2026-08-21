# Tipografía cyberpunk y segunda optimización móvil

## Contexto

La primera optimización ya está desplegada en `main`. PageSpeed móvil fluctúa
entre 82 y 84, con accesibilidad, buenas prácticas y SEO en 100. La regresión
visual confirmada es la pérdida de `Orbitron`: el CSS aún la solicita, pero la
fuente dejó de cargarse al retirar Google Fonts. Una medición independiente de
producción identificó además entrega sin compresión desde Nginx, LCP dominado por
la imagen principal, Font Awesome sobredimensionado y ausencia de caché para WebP
y WOFF2.

## Objetivos

- Restaurar exactamente `Orbitron` en los elementos que ya componían la identidad
  cyberpunk, sin cambiar textos, tamaños, jerarquía, colores ni distribución.
- Evitar una nueva dependencia crítica de Google Fonts mediante WOFF2 local y
  `font-display: swap`.
- Mejorar PageSpeed móvil actuando sobre transferencia, imagen LCP, fuentes de
  iconos y caché, sin retirar contenido o funcionalidad.
- Mantener 100 en accesibilidad, buenas prácticas y SEO, y conservar el buen
  resultado de escritorio.

## Diseño aprobado

### Tipografía

Se incorporará una versión WOFF2 local de Orbitron con los pesos realmente usados.
Una declaración `@font-face` global tendrá `font-display: swap`; el CSS existente
seguirá decidiendo dónde se aplica la fuente. No se reemplazará la tipografía de
cuerpo por una fuente decorativa ni se restaurarán hojas bloqueantes externas.

### Entrega Nginx

Se habilitará gzip para HTML, CSS, JavaScript, JSON y SVG, con `Vary:
Accept-Encoding`. Los archivos con hash conservarán caché larga. Imágenes y
fuentes locales recibirán una política de caché explícita que permita reutilización
sin convertir nombres modificables en recursos permanentemente inmutables.

### LCP e imágenes

La imagen principal conservará encuadre, dimensiones visuales, texto alternativo,
prioridad alta y carga anticipada. Se añadirá una variante moderna y ajustada al
tamaño móvil únicamente si la comparación visual confirma que no introduce
degradación. Las imágenes inferiores mantendrán carga diferida.

### Iconos

Font Awesome no se eliminará a costa de iconos ausentes. Se generará un subconjunto
local con las clases y glifos realmente consumidos, o se conservará temporalmente
la versión actual si la validación demuestra que el subconjunto representa un
riesgo funcional. No se rediseñarán iconos ni controles.

## Pruebas y criterios de aceptación

- Una prueba debe fallar antes de restaurar la fuente y demostrar después que el
  HTML/CSS usa Orbitron local sin referencias a Google Fonts.
- La tipografía calculada de encabezados y navegación debe incluir `Orbitron` y la
  fuente debe cargar correctamente en el build de producción.
- La configuración Nginx debe validar compresión y caché mediante un contenedor o
  una comprobación equivalente reproducible.
- Deben pasar las pruebas unitarias, Playwright en los proyectos disponibles, Axe
  y el build de producción.
- Lighthouse móvil local y una medición contra el despliegue deben documentar FCP,
  LCP, TBT, CLS, bytes transferidos y puntuaciones por categoría.
- No se aceptarán regresiones de contenido, rutas, teclado, diseño adaptable,
  accesibilidad o SEO.

## Fuera de alcance

- Rediseño de la página o cambio de identidad visual.
- Eliminación de secciones para mejorar una puntuación.
- Refactorización general de módulos, editores administrativos o componentes
  huérfanos.
- Garantizar una cifra exacta de PageSpeed, ya que la prueba pública tiene variación
  de red y servidor; se exige mejora verificable y ausencia de regresiones.

## Riesgos y mitigaciones

- Una fuente precargada puede competir con el LCP: se medirá antes de conservar el
  `preload` y se priorizará la imagen principal.
- Un subconjunto de iconos incompleto puede mostrar cuadros vacíos: se extraerán
  usos estáticos y dinámicos y se comprobarán rutas públicas y administrativas.
- AVIF puede ahorrar bytes pero aumentar decodificación en equipos lentos: se
  comparará con WebP y se conservará la alternativa con mejor LCP real.
