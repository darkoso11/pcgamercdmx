# Cierre SEO editorial y entorno de pruebas

Alcance aprobado: completar imágenes y encabezados, revisar artículos existentes, preparar validación en producción y después impedir indexación de test.

- La portada tendrá descripción editable y opción decorativa; conservará los atributos existentes al guardar o abrir la vista previa. Las imágenes de sección tendrán la misma opción.
- El título del artículo es el único H1; los títulos de sección son H2. El editor ofrecerá H3/H4 y el contenido heredado H1/H2 se mostrará como H3 sin perder texto, atributos ni otros elementos. El siguiente guardado persistirá esa estructura.
- La revisión editorial será de lectura y generará propuestas específicas; no inventará descripciones visuales ni retirará contenido público sin decisión editorial.
- Las comprobaciones de producción serán de lectura. Search Console está verificada; la indexación efectiva se validará después de desplegar la versión en producción.
- Por último, el servidor añadirá X-Robots-Tag: noindex a todas las respuestas del host exacto test.pcgamercdmx.com. Producción permanecerá indexable. Se mantendrá el acceso del rastreador para que pueda leer noindex.
- Validación: pruebas de conservación de atributos, normalización de encabezados y política por dominio; compilación SSR; verificadores públicos; revisión del editor y cabeceras reales tras despliegue en pruebas.
