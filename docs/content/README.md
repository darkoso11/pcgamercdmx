# Contenido de las landings

Las carpetas de agosto y septiembre contienen las fuentes editoriales y los manifiestos de imágenes utilizados por `tools/prepare-september-content.py`. Son entradas del generador; no se cargan en el navegador.

Para regenerar los datos TypeScript, con Python y Pillow instalados:

```sh
python tools/prepare-september-content.py --month agosto
python tools/prepare-september-content.py --month septiembre
```

Las imágenes existentes se recuperan de `src/assets` mediante `images.json`. Las imágenes nuevas pueden colocarse temporalmente en `.local-run/august-assets/<drive-id>` o `.local-run/september-assets/<drive-id>`; estas carpetas no se versionan.

Las rutas se configuran en `commercial-pages.config.ts` y `august-pages.config.ts`. La página de gama alta tiene su propio componente y su URL principal es `/pc-gamer-gama-alta`; la dirección anterior redirige conservando los parámetros de campaña. HYPERION y WORKSTATION son fichas editoriales con enlaces a Contacto.

## Validación

Ejecutar `npm run build`, servir el resultado con `tools/serve-browser-build.mjs` en el puerto 4266 y ejecutar los verificadores `tools/verify-august-pages.mjs` y `tools/verify-september-pages.mjs`. Comprueban metadatos, contenido, imágenes y navegación sin generar capturas ni enviar visitas a Analytics.

## Analytics

`environment.prod.ts` configura `G-1RE1CQG7LC`. La etiqueta se incluye en el head prerenderizado y se reutiliza al iniciar Angular. Desarrollo no configura seguimiento.

En GA4, habilitar Medición mejorada → Vistas de página → Cambios de página basados en eventos del historial del navegador para las navegaciones internas. Tras desplegar, comprobar una entrada directa y una navegación interna en Tiempo real o DebugView.
