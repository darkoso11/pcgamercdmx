# Auditoria y contexto actual del proyecto PC Gamer CDMX

Fecha de auditoria: 2026-05-09  
Repositorio: `pcgamercdmx`  
Tipo de proyecto: frontend Angular con SSR/prerender preparado  
Documento de referencia revisado: `C:\Users\lince\Downloads\PC_Gamer_CDMX.docx`

## 1. Resumen ejecutivo

El proyecto ya evoluciono mas alla del documento original. La base actual es un frontend Angular 20 con rutas publicas, experiencia comercial de ensambles, catalogo de productos, blog, galeria, contacto, servicios, cotizador, sorteos y un panel admin parcial.

La direccion mas importante ya esta bien encaminada: los ensambles dejaron de ser solo `productos/paquetes` y ahora tienen ruta propia en `/ensambles`. Esto coincide con `docs/products_planning.md`, donde se decide separar:

- `/ensambles`: superficie comercial para PCs armadas.
- `/productos`: catalogo de componentes y perifericos.

El build compila correctamente con `npm run build`. No hay bloqueo tecnico inmediato para seguir trabajando, pero si hay deuda relevante antes de considerar el sitio listo para produccion: mocks activos, links rotos, rutas incompletas, datos placeholder, formularios sin flujo real, SEO incompleto y varios detalles de accesibilidad.

## 2. Intencion original vs realidad actual

### Intencion del `.docx`

El documento original describe una plataforma integral para PC Gamer CDMX con:

- Home estilo neon/cyberpunk.
- Catalogo de productos.
- Cotizador.
- Servicios.
- Nosotros.
- Contacto.
- Blog.
- Sorteos.
- Galeria.
- Panel de administracion.
- Backend Node.js/Express y MongoDB.
- SSR para SEO.

### Realidad actual del repo

Este repo esta funcionando principalmente como frontend Angular. Los documentos actuales ajustan el alcance:

- `docs/blog_planning.md` dice que el backend sera otro proyecto Nest.js.
- El frontend ya define contratos y endpoints esperados bajo `/api/blog`.
- La galeria usa `src/assets/mock/gallery.json`.
- Productos y admin de productos trabajan con data local/mock en servicios.
- Hay SSR/hydration configurado, pero la integracion backend real todavia no esta cerrada.

### Divergencias principales

| Tema | Documento original | Estado actual |
|---|---|---|
| Backend | Node.js + Express en el ecosistema | Planeado como Nest.js separado; frontend consume `/api/*` |
| Base de datos | MongoDB Atlas | No existe conexion real en este repo |
| Productos | Catalogo general + paquetes | Ya se separo `/ensambles` de `/productos` |
| Admin | CRUD completo con JWT | Admin parcial, con mocks/interceptor |
| Blog | Publico + admin + SEO | Implementado parcialmente con mock backend |
| Galeria | Grid + filtros + modal | Implementado con JSON local |
| Cotizador | Flujo por pasos | Ruta existe, requiere validacion funcional profunda |
| SEO | SSR, sitemap, schema | SSR preparado, metadata parcial, schema/sitemap pendientes |

## 3. Stack tecnico verificado

Evidencia: `package.json`, `angular.json`, `src/main.ts`, `src/server.ts`, `src/app/app.config.ts`.

- Angular `^20.0.3`.
- Angular Router con lazy-loaded standalone components.
- Angular SSR/hydration: `@angular/ssr`, `provideClientHydration(withEventReplay())`.
- Tailwind CSS 4 via `@import "tailwindcss";`.
- Angular Material theme incluido en `angular.json`.
- `ngx-quill` y `quill` para editor WYSIWYG del blog/admin.
- `ngx-toastr` disponible.
- Express en dependencias, con `server.ts`/`src/server.ts`.
- Karma/Jasmine para pruebas unitarias.
- Docker/nginx/vercel configs presentes.

Scripts relevantes:

```bash
npm start
npm run build
npm test
npm run serve:ssr:pcgamercdmx
```

Verificacion realizada:

```text
npm run build -> OK
Initial raw size: 2.31 MB
Lazy chunk destacado: ngx-quill/quill 422.85 kB
Aviso: baseline-browser-mapping desactualizado
```

## 4. Estructura actual del proyecto

```text
src/
  app/
    app.routes.ts
    app.config.ts
    core/
    layout/
    shared/
      components/
        navbar/
        footer/
        brands-section/
        sliders/
      models/
      services/
    features/
      home/
      assemblies/
      products/
        admin/
        components/
        packages/
        peripherals/
        products-overview/
        services/
      blog/
        admin/
        models/
        services/
      gallery/
      contact/
      about/
      services/
      quotation/
      giveaways/
      admin/
  assets/
    img/
    mock/
      blog-sample.json
      gallery.json
```

## 5. Rutas actuales

Evidencia: `src/app/app.routes.ts`.

### Publicas

- `/`: home.
- `/ensambles`: pagina comercial de ensambles.
- `/ensambles/:slug`: detalle de ensamble usando `ProductDetailComponent`.
- `/productos`: shell de productos con children.
- `/productos/componentes`: catalogo de componentes.
- `/productos/perifericos`: catalogo de perifericos.
- `/productos/:slug`: detalle de producto.
- `/productos/paquetes`: redirect a `/ensambles`.
- `/contacto`.
- `/nosotros`.
- `/galeria`.
- `/sorteos`.
- `/servicios`.
- `/cotiza-tu-pc`.
- `/blog`.
- `/blog/:slug`.

### Admin

- `/admin`.
- `/admin/blog`.
- `/admin/blog/new`.
- `/admin/blog/categories`.
- `/admin/blog/:id/edit`.
- `/admin/blog/login`.
- `/admin/products`.
- `/admin/products/list`.
- `/admin/products/new`.
- `/admin/products/:id/edit`.
- `/admin/products/packages`.
- `/admin/products/offers`.
- `/admin/products/categories`.
- `/admin/products/assemblies`.

## 6. Estado por modulo

### Home

Evidencia: `src/app/features/home/home.component.html`, `src/app/features/home/home.component.ts`, screenshots `.tmp-*`.

Estado:

- Home extenso con hero cyberpunk, slider superior, paquetes, custom cases, perifericos, banners, comunidad, juegos, necesidades, marcas, servicios, blog y formulario.
- Tiene buen impacto visual y una identidad clara.
- Usa imagenes reales del proyecto para gabinetes, pero tambien varias imagenes externas placeholder (`picsum.photos`).
- El formulario de necesidades esta maquetado, pero no tiene `ngSubmit` ni integracion real.

Riesgos:

- Link roto: `routerLink="/cotizacion"` en home, pero la ruta real es `/cotiza-tu-pc`.
- Link roto: `routerLink="/custom-cases"` no existe.
- WhatsApp placeholder: `5215555555555`.
- Muchos `console.log` en `home.component.ts`.
- El home es muy largo y mezcla varias intenciones: showroom, comunidad, blog, formulario, juegos y catalogo. Conviene priorizar conversion.

### Ensambles

Evidencia: `src/app/features/assemblies/assemblies.component.html`, `docs/products_planning.md`, screenshot `.tmp-ensambles-desktop.png`.

Estado:

- Es la mejor alineacion actual entre planeacion y UI.
- Hero claro y comercial.
- CTAs visibles: cotizar setup y ver catalogo.
- Integra `app-packages` para listado/filtros.
- Buen lenguaje visual premium/cyberpunk sobrio.

Mejoras:

- En desktop, la navegacion fija ocupa mucho peso visual sobre el hero.
- En mobile, el detalle de ensamble se ve funcional, pero la navegacion superior se percibe comprimida y el breadcrumb queda muy cerca del menu.
- Falta CTA sticky en mobile para cotizar desde detalle.

### Productos

Evidencia: `src/app/features/products/products-overview/*`, `src/app/features/products/services/products.service.ts`, screenshot `.tmp-productos-desktop.png`.

Estado:

- Ya comunica correctamente que productos es catalogo, no ensambles.
- Tiene entry cards para ensambles, componentes y perifericos.
- Muestra destacados con datos de `ProductsService`.
- `ProductsService` ya tiene `getSegmentLink()` y `getDetailLink()` para separar ensambles de productos.

Mejoras:

- Filtros reales por componentes/perifericos deben madurar.
- Falta paginacion, orden y URL query params para SEO.
- Todavia hay mezcla visual entre cards de catalogo y cards comerciales.

### Blog

Evidencia: `docs/blog_planning.md`, `src/app/features/blog/services/blog.service.ts`, `src/app/features/blog/services/mock-backend.interceptor.ts`, `src/app/app.config.ts`.

Estado:

- Contrato frontend bien planteado.
- Admin blog y editor existen.
- `BlogService` apunta a `/api/blog`.
- Hay mock interceptor activo globalmente en `app.config.ts`.

Riesgos:

- El interceptor mock esta registrado siempre, con comentario "remove in production".
- Login mock acepta password `admin`.
- Datos persistidos en `localStorage`.
- Existen rutas API esperadas, pero sin backend real.

### Galeria

Evidencia: `docs/gallery_planning.md`, `src/app/features/gallery/gallery.component.*`, `src/assets/mock/gallery.json`.

Estado:

- Carga manifiesto local.
- Filtros por categoria.
- Modal/lightbox.
- Lazy loading de imagenes.

Riesgos UX/UI:

- El H1 usa texto con gradiente (`bg-clip-text text-transparent`), patron visual que conviene evitar si se busca una interfaz mas premium y menos generica.
- Modal tiene `role="dialog"` y `aria-modal`, pero falta label accesible y manejo de teclado/focus trap.

### Contacto

Evidencia: `src/app/features/contact/contact.component.*`.

Estado:

- Usa reactive forms y validacion.
- Tiene rutas de contacto y WhatsApp.

Riesgos:

- Hay `console.log('Datos del formulario')`.
- Requiere confirmar si el submit envia a backend, email, WhatsApp o solo queda local.

### Admin

Evidencia: `src/app/features/admin/*`, `src/app/features/products/admin/shared/products-admin.service.ts`.

Estado:

- Hay dashboard admin, login, blog admin y productos admin.
- Productos admin usa mocks y placeholders.

Riesgos:

- No esta listo para produccion sin backend/auth real.
- Hay servicios duplicados o paralelos para productos admin (`products-admin.service.ts` en dos ubicaciones).
- Auth de blog guarda token en `localStorage`; esto es aceptable para prototipo, pero debe revisarse con backend real.

## 7. Modelos y data

Evidencia: `src/app/shared/models/*`, `src/app/features/products/services/products.service.ts`, `src/assets/mock/*`.

Fuentes actuales:

- Ensambles/componentes/perifericos: arrays en `ProductsService`.
- Blog publico/admin: `/api/blog` mockeado por interceptor y/o `assets/mock/blog-sample.json`.
- Galeria: `assets/mock/gallery.json`.
- Admin productos: mocks en `ProductsAdminService`.

Recomendacion:

- Definir una sola fuente de verdad para productos/ensambles antes de conectar backend.
- Mantener `shared/models` como contratos base.
- Separar view models publicos de DTOs de backend.
- Evitar que el admin tenga modelos paralelos que diverjan de `shared/models`.

## 8. Auditoria UX/UI

### Puntuacion

| Dimension | Score | Hallazgo clave |
|---|---:|---|
| Accesibilidad | 2/4 | Hay alt y algo de ARIA, pero faltan labels en botones icono, focus trap en modales y consistencia semantica |
| Performance | 2/4 | Build OK, pero bundle inicial bruto alto, assets externos placeholder y home muy cargado |
| Responsive | 3/4 | Mobile existe y se ve trabajado; detalle mobile requiere pulir nav/breadcrumb/CTA |
| Theming | 2/4 | Hay tokens globales en `styles.css`, pero muchas clases usan colores hard-coded |
| Anti-patrones visuales | 2/4 | Identidad fuerte, pero hay glow excesivo, texto degradado y demasiadas cards similares |
| Total | 11/20 | Aceptable, con trabajo importante antes de produccion |

### Lo que funciona bien

- Direccion visual reconocible: oscuro, neon, hardware, cyberpunk.
- `/ensambles` ya se siente como vitrina comercial.
- `/productos` ya se entiende como catalogo separado.
- Buen uso de imagenes de gabinetes reales en paginas clave.
- Los CTAs principales existen y estan visibles.
- La estructura por features es razonable para seguir creciendo.

### Problemas UX/UI prioritarios

#### P1 - Links rotos en navegacion y CTAs

Ubicaciones:

- `src/app/features/home/home.component.html:29`: `/cotizacion`.
- `src/app/features/home/home.component.html:514`: `/custom-cases`.
- `src/app/shared/components/navbar/navbar.component.html:212`: `/productos/destacado`.

Impacto: usuarios llegan a fallback o rutas inexistentes.

Recomendacion: corregir a rutas existentes o crear rutas reales.

#### P1 - Mock backend activo globalmente

Ubicacion:

- `src/app/app.config.ts`.

Impacto: en produccion podria interceptar `/api/blog` y simular auth/data.

Recomendacion: condicionar el interceptor por environment o removerlo de builds productivos.

#### P1 - Formulario home sin flujo real

Ubicacion:

- `src/app/features/home/home.component.html:608`.

Impacto: parece una conversion principal, pero no envia datos.

Recomendacion: convertirlo en reactive form real, enlazar a `/cotiza-tu-pc` o enviar a backend/contacto.

#### P2 - Datos placeholder y links genericos

Ubicaciones:

- `home.component.ts`: `picsum.photos`, influencers ficticios, social links genericos.
- `home.component.html` y `navbar.component.html`: WhatsApp `5215555555555`.
- `products-admin.service.ts`: `via.placeholder.com`.

Impacto: reduce confianza comercial.

Recomendacion: centralizar datos de contacto/brand en config y reemplazar placeholders antes de demos comerciales.

#### P2 - Exceso de glow y texto degradado

Ubicaciones:

- `src/app/features/gallery/gallery.component.html:4`.
- `src/styles.css`.
- `src/app/features/home/home.component.css`.

Impacto: la estetica puede verse mas generica y menos premium.

Recomendacion: mantener cyberpunk, pero usar neon como acento, no como textura dominante.

#### P2 - Accesibilidad incompleta en modales/menus

Ubicaciones:

- Galeria modal.
- Custom case modal en Home.
- Menu mobile Navbar.

Impacto: usuarios con teclado o lector de pantalla pueden perder contexto.

Recomendacion:

- Agregar `aria-label` a botones icono.
- Añadir `aria-labelledby` en modales.
- Cerrar con Escape.
- Atrapar foco dentro del modal/menu.
- Restaurar foco al boton que abrio el modal.

#### P2 - Bundle inicial grande

Evidencia:

- `npm run build`: initial raw total `2.31 MB`.

Impacto: performance inicial y Core Web Vitals pueden sufrir en mobile.

Recomendacion:

- Revisar imports globales.
- Ver si Quill/Angular Material estan entrando en chunks iniciales innecesarios.
- Optimizar imagenes locales y generar variantes WebP.
- Auditar scripts/CDNs externos del `index.html`.

## 9. SEO y contenido

Estado:

- Varias rutas tienen `title` en `app.routes.ts`.
- `ProductDetailComponent` actualiza meta tags.
- SSR/hydration esta configurado.

Pendiente:

- `html lang` esta en `en`, deberia ser `es-MX`.
- Falta estrategia de canonical.
- Falta sitemap.
- Falta schema `Product` para detalle de ensambles/productos.
- Falta metadata por categorias de productos.
- Falta copy SEO estable para `componentes`, `perifericos`, `ensambles`.
- Blog requiere backend o prerender/mock estable para indexacion real.

## 10. Seguridad y produccion

Riesgos:

- Mock login de admin con password `admin`.
- Tokens en `localStorage`.
- Interceptor mock global.
- Links externos sin `rel="noopener noreferrer"` en varias ubicaciones.
- APIs `/api/*` no estan respaldadas por backend real en este repo.
- Datos de contacto placeholder.

Recomendacion:

1. Crear environments reales: `development`, `staging`, `production`.
2. Condicionar mocks solo a development.
3. Mover URLs/contacto/redes a config.
4. Definir estrategia auth real con backend.
5. Agregar guards que validen token contra backend, no solo existencia local.

## 11. Recomendaciones priorizadas

### Prioridad 1 - Estabilizar navegacion y conversion

- Corregir links rotos: `/cotizacion`, `/custom-cases`, `/productos/destacado`.
- Reemplazar numero de WhatsApp placeholder.
- Definir flujo real del formulario home.
- Agregar CTA sticky en detalle mobile de ensambles.

### Prioridad 2 - Separar dev/prod

- Sacar `MockBackendInterceptor` de produccion.
- Marcar claramente servicios mock vs servicios API.
- Crear `environment.ts` y `environment.prod.ts` si se van a usar file replacements.
- Eliminar `console.log` de componentes publicos.

### Prioridad 3 - Consolidar arquitectura de datos

- Unificar modelos de productos entre publico y admin.
- Decidir DTOs esperados del backend Nest.js.
- Documentar endpoints reales para productos, ensambles, blog, galeria y cotizaciones.
- Evitar duplicacion de `ProductsAdminService`.

### Prioridad 4 - UX/UI premium

- Mantener dark cyberpunk, pero reducir glow constante.
- Evitar texto degradado en titulos.
- Usar imagenes reales del negocio en vez de placeholders externos.
- Dar mas jerarquia a CTAs de cotizacion que a exploracion secundaria.
- Hacer que cards de ensamble sean mas editoriales y cards de catalogo mas utilitarias.

### Prioridad 5 - SEO/performance

- Cambiar `lang="en"` a `lang="es-MX"`.
- Implementar sitemap y canonical.
- Agregar schema `Product`.
- Optimizar assets locales.
- Auditar dependencias del bundle inicial.

## 12. Siguiente plan recomendado

1. Hacer un pass corto de correcciones P1: links, WhatsApp, formulario, mocks por environment.
2. Auditar visualmente Home, Ensambles, Productos y Detalle en mobile/desktop.
3. Consolidar `ProductsService` + admin services alrededor de un contrato unico.
4. Preparar integracion backend Nest.js por dominios: blog, productos, cotizaciones, uploads.
5. Ejecutar una segunda auditoria con pruebas de navegacion, a11y y performance.

## 13. Evidencia revisada

- `C:\Users\lince\Downloads\PC_Gamer_CDMX.docx`
- `docs/products_planning.md`
- `docs/blog_planning.md`
- `docs/gallery_planning.md`
- `package.json`
- `angular.json`
- `src/index.html`
- `src/app/app.routes.ts`
- `src/app/app.config.ts`
- `src/app/features/home/home.component.html`
- `src/app/features/home/home.component.ts`
- `src/app/features/assemblies/assemblies.component.html`
- `src/app/features/products/products-overview/products-overview.html`
- `src/app/features/products/services/products.service.ts`
- `src/app/features/products/product-detail.component.ts`
- `src/app/features/blog/services/blog.service.ts`
- `src/app/features/blog/services/mock-backend.interceptor.ts`
- `src/app/features/gallery/gallery.component.html`
- `src/app/features/contact/contact.component.*`
- `src/app/shared/components/navbar/navbar.component.html`
- `src/styles.css`
- `.tmp-ensambles-desktop.png`
- `.tmp-productos-desktop.png`
- `.tmp-ensamble-detail-mobile.png`

