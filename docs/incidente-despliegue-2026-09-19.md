# Incidente de despliegue — 2026-09-19

## Síntoma

El editor rápido estaba integrado en GitHub, pero los sitios de pruebas y producción seguían mostrando la interfaz anterior.

## Evidencia

- GitHub: `origin/test` en `d8a2245` (PR #84), `origin/main` en `e874b0e` (PR #85).
- Antes de intervenir, el checkout de pruebas del VPS estaba en `b82b6de` (PR #78) y producción en `934b9c5` (PR #79).
- Los últimos logs de despliegue de ambos servicios eran del 4 de septiembre UTC.
- Dokploy tenía correctamente configuradas las ramas `test` y `main`, despliegue automático activo y disparador `push`.
- Dokploy registraba repetidamente `getaddrinfo ENOTFOUND dokploy-redis`.
- Redis respondía `PONG` dentro de su contenedor, pero desde Dokploy su nombre no resolvía y la conexión a su IP virtual agotaba el tiempo de espera.

## Intervención

Se ejecutó `docker service update --force dokploy-redis` para recrear exclusivamente la tarea Redis. No se reinició el VPS ni se modificaron DNS, credenciales, código de negocio o servicios de la tienda.

Después de la recreación, desde el contenedor Dokploy el nombre `dokploy-redis` resolvió y la conexión devolvió `PONG`. La cola comenzó a procesar automáticamente un despliegue pendiente, con otros dos trabajos en espera. El checkout de pruebas pasó a `d8a2245`.

## Estado de verificación

La conectividad de la cola está recuperada. Los tres trabajos pendientes finalizaron con estado `done`; pruebas quedó en `d8a2245` (PR #84) y producción en `e874b0e` (PR #85). La cola quedó vacía y todos los servicios Swarm mostraron 1/1 réplicas. La consulta de logs del último minuto no encontró `ENOTFOUND`.

Verificación pública final: ambos dominios sirven `main-4QETKYCI.js`. Los módulos de productos (`chunk-WY7VA7QH.js`) y ensambles (`chunk-IUMCKWZ2.js`) responden HTTP 200 en ambos dominios, contienen `saveQuickEdit` y ya no contienen el texto antiguo `Ordenados por disponibilidad`. No se realizó una edición de datos autenticada desde el navegador; queda pendiente la comprobación funcional dentro del admin.

## Riesgo pendiente

No se ha determinado todavía el origen del fallo de registro/conectividad del servicio Redis en la red de Docker Swarm. Conviene vigilar errores de resolución, antigüedad de trabajos pendientes y correspondencia entre versión Git y versión publicada. Las credenciales compartidas durante el diagnóstico deben rotarse mediante sus interfaces correspondientes; este informe no contiene secretos.
