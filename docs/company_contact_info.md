# Datos comerciales de PC Gamer CDMX

Documento de referencia para reutilizar datos de contacto en futuras sesiones.
La fuente tecnica actual vive en `src/app/shared/config/business-info.ts`.

## Identidad

- Nombre comercial: PC Gamer CDMX
- Sitio/proyecto: pcgamercdmx

## Tienda

- Direccion corta: Insurgentes Sur 300 local 5, Roma
- Direccion completa: Insurgentes Sur 300 local 5, Colonia Roma, Ciudad de Mexico
- Telefono fijo: 55 5512 7560
- Enlace telefono fijo: `tel:+525555127560`
- Nota de telefono fijo: unicamente para llamadas

## Horarios

- Lunes - Viernes: 10:30 - 19:00
- Sabado: 11:00 - 17:00
- Domingo: Cerrado

## Correo general

- Correo: contacto@pcgamercdmx.com
- Enlace mailto: `mailto:contacto@pcgamercdmx.com`

## Asesores de ventas

### Hugo Lopez

- Telefono y WhatsApp: 55 1394 1449
- Numero internacional WhatsApp: 525513941449
- Enlace telefono: `tel:+525513941449`
- Enlace WhatsApp base: `https://wa.me/525513941449`
- Correo: ventas.hugo@pcgamercdmx.mx
- Enlace mailto: `mailto:ventas.hugo@pcgamercdmx.mx`

### Omar Pc Gamer

- Telefono y WhatsApp: 55 7205 2726
- Numero internacional WhatsApp: 525572052726
- Enlace telefono: `tel:+525572052726`
- Enlace WhatsApp base: `https://wa.me/525572052726`
- Correo: ventas.omar@pcgamercdmx.mx
- Enlace mailto: `mailto:ventas.omar@pcgamercdmx.mx`

## Mensaje sugerido para WhatsApp

```text
Hola, vengo del sitio de PC Gamer CDMX. Me interesa una cotizacion o asesoria para mi setup. Quiero contactar con {nombre del asesor}.
```

## Google Maps

- Busqueda/direccion: Insurgentes Sur 300 local 5, Colonia Roma, Ciudad de Mexico
- URL para abrir Google Maps:

```text
https://www.google.com/maps/search/?api=1&query=Insurgentes%20Sur%20300%20local%205%2C%20Colonia%20Roma%2C%20Ciudad%20de%20Mexico
```

- URL para iframe embed:

```text
https://www.google.com/maps?q=Insurgentes%20Sur%20300%20local%205%2C%20Colonia%20Roma%2C%20Ciudad%20de%20Mexico&output=embed
```

## Redes sociales

- Facebook: https://facebook.com/pcgamercdmx
- Instagram: https://instagram.com/pcgamercdmx
- TikTok: https://tiktok.com/@pcgamercdmx
- YouTube: https://youtube.com/@pcgamercdmx
- Discord: https://discord.gg/pcgamercdmx
- Grupo de Facebook: https://facebook.com/groups/pcgamercdmx

## Notas de implementacion

- Evitar duplicar datos en componentes; importar `BUSINESS_INFO` desde `src/app/shared/config/business-info.ts`.
- Para iframes de Google Maps en Angular, usar `DomSanitizer.bypassSecurityTrustResourceUrl`.
- Los botones de WhatsApp deben incluir mensaje precargado con `encodeURIComponent`.
- El telefono fijo debe mostrarse como "unicamente para llamadas".
