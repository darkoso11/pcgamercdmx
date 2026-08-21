# Rendimiento, SEO y accesibilidad pública

## Objetivo

Mejorar de forma medible la carga móvil, Core Web Vitals, SEO técnico y
accesibilidad de PC Gamer CDMX, usando el informe móvil de PageSpeed como línea base.
La rama también cerrará los dos defectos pendientes de las acciones masivas del
listado administrativo de productos.

## Línea base

El informe de PageSpeed del 15 de agosto de 2026 registra:

- rendimiento 31, accesibilidad 84, SEO 85 y buenas prácticas 100;
- FCP de 4.1 s, LCP de 8.3 s, TBT de 190 ms, Speed Index de 9.6 s y CLS de 1.556;
- 12,564 KiB transferidos;
- 4,109 KiB de ahorro estimado en imágenes y 140 KiB de JavaScript sin uso;
- dos respuestas de catálogo de aproximadamente 2.36 MB cada una durante el inicio;
- botones sin nombre, selects sin etiqueta, contrastes insuficientes, un enlace sin
  nombre descriptivo y un `robots.txt` inválido.

## Criterios de éxito

La validación local móvil debe alcanzar los siguientes umbrales antes de cerrar la
rama:

- Lighthouse: rendimiento >= 90, accesibilidad = 100, SEO = 100 y buenas prácticas = 100;
- LCP <= 2.5 s, CLS <= 0.1 y TBT <= 200 ms;
- una sola solicitud de catálogo por carga y sin respuestas duplicadas;
- ausencia de fallos automáticos de nombre accesible, etiqueta, contraste y enlace;
- navegación independiente por teclado en cada carrusel y banner;
- build de producción y suite completa sin regresiones.

Las mediciones contra producción se repetirán después del despliegue porque la red,
el CMS y la infraestructura externa no son deterministas. Si un umbral externo no se
alcanza, el cierre documentará la diferencia entre el laboratorio local y producción.

## Diseño de rendimiento y carga

### Datos

`ProductsService` compartirá la carga pública del catálogo dentro de una navegación
para que productos y periféricos no disparen la misma consulta. La consulta destinada
a inicio pedirá únicamente categorías, campos y cantidad necesarios para los
carruseles. Se conservarán los datos locales de respaldo y el manejo de error actual.

Las pruebas demostrarán primero la solicitud duplicada y después verificarán una sola
lectura compartida sin alterar los resultados de categorías, ofertas ni stock.

### Imágenes

La imagen que determine el LCP se descubrirá desde el HTML inicial, se cargará de
forma anticipada y tendrá prioridad alta. Las imágenes posteriores o fuera de la
ventana usarán carga diferida y decodificación asíncrona.

Todas las imágenes de inicio declararán dimensiones o una relación de aspecto estable
para reservar espacio y evitar saltos. Las imágenes locales grandes se convertirán a
un formato moderno y se servirán en tamaños acordes con su representación. Las
imágenes procedentes de Directus usarán transformaciones de ancho, formato y calidad
cuando el CMS las admita, conservando la URL original como recuperación segura.

No se aplicará `loading="lazy"` a la imagen LCP.

### Recursos iniciales

Se eliminarán hojas de fuentes o iconos que no tengan consumidores y se reducirá el
bloqueo de las que sigan siendo necesarias. El análisis del bundle determinará qué
dependencias pueden diferirse sin cambiar la apariencia ni la interacción inicial.
Los presupuestos de Angular se endurecerán solo después de medir el resultado real.

La configuración de caché distinguirá el documento HTML de los recursos con hash:
HTML revalidable y recursos inmutables con caché prolongada.

## Diseño SEO

La aplicación publicará un `robots.txt` de texto válido en la raíz y un sitemap de
rutas públicas canónicas. Las rutas administrativas continuarán con `noindex`.

Se validarán título, descripción, canonical, Open Graph, Twitter Cards y datos
estructurados en el HTML prerenderizado. Los enlaces tendrán texto accesible y
descriptivo. No se añadirá `llms.txt`, porque no forma parte del SEO web estándar ni
afecta la categoría SEO clásica solicitada.

## Diseño de accesibilidad pública

Se corregirán los fallos confirmados por PageSpeed:

- nombres de botones e indicadores de carrusel;
- etiquetas programáticas de los selects del formulario;
- texto descriptivo del enlace detectado;
- combinaciones de color que no alcanzan WCAG AA;
- objetivos táctiles de al menos 44 x 44 px en controles compactos.

Los cambios visuales se limitarán a color, foco y área interactiva; se conservará la
identidad gamer existente.

## Carruseles y banners

`HeroSliderComponent`, `ProductsSliderComponent`, `PeripheralsSliderComponent` y
`BannersSliderComponent` serán regiones independientes con nombre accesible. Cada
instancia mantendrá su propio índice y procesará teclado únicamente cuando el foco se
encuentre en ella.

El contrato de interacción será:

- `ArrowLeft` muestra el elemento anterior y `ArrowRight` el siguiente;
- banners y hero pueden circular entre extremos; productos y periféricos respetan
  sus límites desplazables;
- Tab y Shift+Tab no se interceptan;
- Enter y Espacio conservan el comportamiento nativo de enlaces y botones;
- un clic o swipe sitúa el foco en la región correspondiente sin desplazar la página;
- las flechas no se escuchan desde `window` ni `document`;
- solo se llama `preventDefault()` cuando una flecha es procesada por el carrusel;
- los cambios manuales se anuncian mediante estado accesible; el autoplay no genera
  anuncios repetitivos;
- autoplay se pausa con foco, hover, interacción o preferencia de movimiento reducido,
  y dispone de un control accesible para pausarlo o reanudarlo.

Las pruebas montarán varias instancias simultáneas y comprobarán que una flecha nunca
modifica un carrusel sin foco.

## Acciones masivas administrativas

El botón **Editar** conservará su texto y `aria-expanded`, y declarará con
`aria-controls` el identificador estable del panel que expande. Se mantendrá como
patrón de divulgación con botones nativos, sin fingir un menú ARIA que exigiría otro
modelo de teclado.

Todos los controles de la sección contextual tendrán objetivos táctiles mínimos de
44 x 44 px, incluidos acciones principales, opciones de edición, selección global,
confirmación y cancelación. No cambiarán servicios, persistencia ni reglas de negocio.

## Estrategia de pruebas

Cada corrección seguirá RED-GREEN-REFACTOR:

1. reproducir el fallo con una prueba unitaria, de plantilla o de navegador;
2. ejecutar la prueba y confirmar que falla por el motivo esperado;
3. aplicar el cambio mínimo;
4. ejecutar la prueba específica y las pruebas relacionadas;
5. mantener un escenario Playwright móvil que mida accesibilidad, carga, ausencia de
   solicitudes duplicadas, teclado entre carruseles y desplazamiento horizontal;
6. cerrar con suite completa, build de producción y Lighthouse móvil local.

## Fuera de alcance

Solo queda fuera la limpieza sin relación directa con PageSpeed, SEO, accesibilidad o
carga: TypeScript y módulos placeholder, componentes huérfanos, README genérico,
estado editorial del plan del blog, duplicación de instrucciones para herramientas y
refactorizaciones generales del editor legado.

Los activos no utilizados, el XML copiado a producción, el JSON duplicado, el favicon
inexistente y la configuración de entrega sí entran en alcance porque incrementan o
invalidan la salida publicada.

## Riesgos y límites

- El contenido remoto puede cambiar el elemento LCP y el peso de la página.
- Las transformaciones de Directus deben comprobarse contra el servidor configurado
  antes de hacerlas obligatorias.
- La activación por swipe debe verificarse en un navegador táctil para no bloquear el
  scroll vertical.
- Los cambios de caché no deben impedir que HTML o contenido administrativo se
  actualicen oportunamente.
- Ninguna mejora de puntuación justifica ocultar contenido esencial o degradar la
  experiencia sin JavaScript.
