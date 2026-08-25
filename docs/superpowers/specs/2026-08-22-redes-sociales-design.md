# Corrección de enlaces de redes sociales

## Objetivo

Corregir las URLs oficiales de Facebook, Instagram y TikTok utilizadas por el sitio, y mantener la documentación de contacto alineada con la aplicación.

## Fuente de verdad

La aplicación seguirá obteniendo los enlaces desde `BUSINESS_INFO.social` en `src/app/shared/config/business-info.ts`. No se duplicarán URLs en los componentes.

Las URLs exactas serán:

- Facebook: `https://www.facebook.com/pcgamerciudadmexico`
- Instagram: `https://www.instagram.com/pcgamer_cdmx/`
- TikTok: `https://www.tiktok.com/@pcgamercdmx`

## Cambios

1. Actualizar las tres propiedades en la configuración central.
2. Actualizar las mismas tres URLs en `docs/company_contact_info.md`.
3. Añadir una prueba enfocada que compare las propiedades con las URLs exactas aprobadas.

Los botones del navbar, inicio, footer y sección de comunidad, además de los metadatos SEO, recibirán los valores corregidos mediante la configuración central existente.

## Fuera de alcance

No se modificarán estilos, estructura de componentes, cuentas de colaboradores, grupo de Facebook, YouTube, Discord ni otras URL de contacto.

## Verificación

- Ejecutar primero la nueva prueba y confirmar que falla con las URLs anteriores.
- Aplicar el cambio mínimo en configuración y documentación.
- Confirmar que la prueba pasa.
- Ejecutar las pruebas relacionadas y una compilación de producción para detectar regresiones de integración.
