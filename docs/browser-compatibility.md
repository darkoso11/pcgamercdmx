# Compatibilidad de navegadores

## Política soportada

La aplicación usa Angular 20.3 y adopta su Baseline oficial del 30 de abril de
2025. La matriz mínima reproducible es:

| Familia | Versión mínima | Cobertura |
| --- | ---: | --- |
| Chromium (Chrome, Edge, Brave y Opera) | 121 | Soporte directo por motor |
| Chrome Android | 121 | Soporte directo y prueba móvil |
| Firefox / Firefox Android | 122 | Soporte directo |
| Safari / iOS Safari | 17.2 | Soporte directo y pruebas WebKit |

Las versiones se fijan en `.browserslistrc`; no dependen de los objetivos
variables por popularidad de la base local de Browserslist.

## Verificación

- `npm run build` transpila JavaScript y procesa CSS para la matriz anterior.
- `npm run test:browsers` compila y sirve el bundle de producción antes de
  ejecutar todas las rutas públicas estáticas con Chromium, Microsoft Edge,
  Firefox, WebKit, Chrome móvil y Safari móvil emulados.
- `.github/workflows/browser-compatibility.yml` repite la matriz en cada push
  y pull request. El trabajo de Edge se ejecuta en Windows con el navegador
  instalado en el runner; el resto se ejecuta en Linux.
- Brave y Opera instalados localmente se pueden probar sin guardar rutas del
  equipo en el repositorio mediante `BRAVE_EXECUTABLE_PATH` y
  `OPERA_EXECUTABLE_PATH`, respectivamente.
- WebKit ofrece detección temprana de errores del motor de Safari. Para flujos
  de cámara, video, pagos o integración con el sistema operativo, se mantiene
  necesaria una prueba final en Safari real sobre macOS/iOS.

## Degradación y límites conocidos

- Los efectos visuales con `backdrop-filter` conservan fondos legibles si el
  efecto no está disponible.
- `color-mix()` tiene un color de borde previo como fallback.
- El almacenamiento de sesión tolera navegadores que exponen Web Storage pero
  bloquean sus operaciones por privacidad o política. En ese caso la página no
  se rompe, aunque el usuario deberá habilitar almacenamiento para persistir la
  sesión administrativa.
