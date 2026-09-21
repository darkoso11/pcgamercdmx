# Implementación de septiembre 2026

## Decisiones confirmadas

- El usuario autorizó crear e implementar las cuatro páginas con los datos suministrados, dejando las correcciones de ensambles para después.
- HYPERION y WORKSTATION no existen como productos. Mostrar las fichas editoriales con sus imágenes, precios y especificaciones, y CTA a Contacto.
- Periféricos conserva /productos/perifericos; no se aplica la redirección propuesta por la hoja.
- El enlace de edición se toma del documento final corregido.

## Ejecución

1. Pruebas de rutas y renderizado: confirmar fallo por ausencia de las páginas.
2. Descargar las 38 imágenes de los documentos y registrar correspondencia con cada título y ALT. Conservar los originales.
3. Generar datos editoriales tipados desde las transcripciones, conservando los textos, precios y especificaciones. El generador es una herramienta local; el sitio no consulta Drive ni interpreta Markdown en ejecución.
4. Implementar un componente compartido: introducción, catálogo, secciones, logos, CTA y FAQ.
5. Integrar rutas, metadatos, sitemap y accesos desde Productos. Usar páginas relacionadas para enlazar las cuatro entre sí.
6. Ejecutar pruebas y build; verificar HTML prerenderizado, imágenes y presentación móvil/escritorio.

## Destinos provisionales

Los enlaces a gama alta se normalizan a /pc-gamer-gama-alta-cdmx. Gama media y diseño gráfico enlazan a /cotiza-tu-pc mientras no existan sus páginas. No se crean redirecciones ni páginas de relleno para estos destinos. Se conserva el enlace original en las transcripciones para poder actualizarlo después.

## Límites de esta entrega

Datos editoriales estáticos según la autorización; sin cambios al CMS. No se añaden datos estructurados de ofertas ni stock no confirmado. Las FAQ describen el mismo contenido visible. Publicación, GTM y Search Console requieren verificaciones posteriores en producción.

## Validación local

- Build de producción correcto, con advertencia de presupuesto inicial: 551.97 KB frente al umbral de 550 KB.
- Nueve pruebas específicas aprobadas: rutas, tarjetas, FAQ y cambio entre páginas.
- `node tools/verify-september-pages.mjs` aprobado contra el build servido en el puerto 4266: cuatro páginas a 1440 y 390 píxeles, HTML prerenderizado, canonical, imágenes, FAQ, navegación y ausencia de desbordamiento horizontal.
- `git diff --check` correcto.
- Capturas de escritorio y móvil disponibles en `capturas/`.

Para repetir la revisión: ejecutar `npm run build`, iniciar `tools/serve-browser-build.mjs` con `PORT=4266` y ejecutar el verificador. El verificador requiere el build de producción, porque el servidor de desarrollo no sirve HTML prerenderizado.
