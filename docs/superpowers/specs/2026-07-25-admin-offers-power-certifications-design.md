# Ofertas y certificaciones de fuentes en el flujo administrativo

**Fecha:** 2026-07-25

**Rama:** `flujo-de-visualizacion-productos`

**Estado:** Diseño aprobado

## 1. Objetivo

Completar el flujo administrativo separado de productos y ensambles con:

- administración persistente de ofertas;
- cálculo automático de precios promocionales;
- controles independientes para aplicar el descuento y mostrar su etiqueta;
- una biblioteca reutilizable de imágenes de certificaciones de fuentes;
- captura explícita de modelo de fuente, watts y certificación;
- persistencia completa y representación correcta en tarjetas y detalles públicos;
- corrección de los problemas detectados en la auditoría del editor de ensambles.

La solución conservará el contexto visual y operativo del panel existente: técnica,
gamer, directa y sencilla para personal interno capacitado.

## 2. Alcance

### Incluido

- CRUD de ofertas para productos/componentes.
- CRUD de ofertas para ensambles.
- Separación estricta de los datos y selectores de ambos catálogos.
- Descuentos porcentuales y de cantidad fija.
- Programación por fecha de inicio y finalización.
- Activación y desactivación de la oferta.
- Control independiente de visibilidad de la etiqueta `Oferta`.
- Prevención de más de una oferta activa sobre un mismo artículo.
- Estados programada, activa, pausada y vencida.
- Biblioteca persistente de certificaciones en Directus.
- Selección de una certificación por ensamble.
- Registro de certificaciones nuevas desde el editor.
- Modelo de fuente y watts editables.
- Migración compatible de Bronze y Gold actuales.
- Corrección y verificación del editor de ensambles.
- Integración del precio, etiqueta, certificación y watts en la experiencia pública.

### Fuera de alcance

- Acumulación de promociones.
- Cupones ingresados por clientes.
- Descuentos diferentes por variante.
- Más de una certificación por fuente.
- Rediseño general del panel administrativo.
- Procesamiento destructivo de las imágenes originales.

## 3. Usuarios y principios

El panel es utilizado por el propietario y personal interno capacitado en hardware.
Aunque conocen el dominio, las tareas deben ser rápidas y claras.

Principios:

1. Productos y ensambles nunca se mezclan en administración.
2. Directus es la fuente persistente de verdad.
3. Los datos capturados deben llegar completos a la interfaz pública.
4. Los estados y consecuencias de cada acción deben ser explícitos.
5. La complejidad avanzada se muestra mediante divulgación progresiva.
6. El diseño existente se conserva, corrigiendo accesibilidad y respuesta móvil.

## 4. Modelo de datos

### 4.1 Ofertas

Se agregará una colección `pc_offers` con los siguientes conceptos:

| Campo | Propósito |
|---|---|
| `id` | Identificador |
| `title` | Nombre administrativo |
| `description` | Explicación opcional |
| `catalog_domain` | `products` o `assemblies` |
| `discount_type` | `percentage` o `fixed` |
| `discount_value` | Valor positivo del descuento |
| `starts_at` | Inicio de vigencia |
| `ends_at` | Fin de vigencia |
| `active` | Permite aplicar o pausar la oferta |
| `show_badge` | Controla únicamente la etiqueta visual |
| `target_type` | Artículos individuales o categoría |
| `created_at` | Auditoría |
| `updated_at` | Auditoría |

Los destinos se normalizarán mediante relaciones con los artículos o categorías
correspondientes. El dominio de la oferta limitará los elementos seleccionables y
evitará asociaciones cruzadas.

### 4.2 Certificaciones de fuentes

Se agregará `pc_power_certifications`:

| Campo | Propósito |
|---|---|
| `id` | Identificador |
| `name` | Nombre editable y texto alternativo |
| `image` | Relación con Directus Files |
| `active` | Disponible o archivada |
| `sort` | Orden del selector |
| `created_at` | Auditoría |
| `updated_at` | Auditoría |

Cada ensamble tendrá:

- `powerSupply`: modelo o descripción de la fuente;
- `watts`: potencia numérica;
- `powerCertification`: relación con una certificación.

Solo se permite una certificación por ensamble. La relación permitirá reutilizar la
misma imagen en múltiples ensambles y reflejar correcciones futuras.

### 4.3 Compatibilidad

Durante la migración se conservará lectura compatible con:

- `specifications.powerCertificate`;
- `specifications.watts`;
- los archivos locales Bronze y Gold;
- `discounted_price` y metadatos de descuento anteriores.

Bronze y Gold se registrarán como datos iniciales. Tras resolver la relación, las
vistas públicas dejarán de sustituir certificaciones desconocidas por Gold.

## 5. Reglas de ofertas

Una oferta es efectiva cuando:

1. está activa;
2. la fecha actual se encuentra dentro de su vigencia;
3. el artículo pertenece al dominio y destino de la oferta.

El cálculo será:

```text
porcentaje: precio_final = precio_base × (1 − porcentaje / 100)
cantidad fija: precio_final = precio_base − cantidad
```

El resultado:

- nunca será menor que cero;
- se redondeará a dos decimales;
- no modificará el precio base;
- volverá automáticamente al precio base al pausar o vencer la oferta.

`show_badge` no modifica el cálculo. Una oferta efectiva puede aplicar el descuento
con la etiqueta oculta. Una oferta inactiva o fuera de vigencia no aplica descuento
ni muestra etiqueta.

Antes de activar o ampliar una oferta, el sistema verificará conflictos. Si algún
artículo ya tiene otra oferta efectiva o programada para un periodo superpuesto, se
bloqueará la acción y se identificará la oferta en conflicto.

## 6. UX/UI de ofertas

Cada dominio tendrá su propia ruta y administrador:

- productos/componentes;
- ensambles.

La pantalla incluirá:

- botón `Crear oferta`;
- métricas de ofertas totales y activas;
- filtros por estado;
- listado con descuento, alcance, vigencia y estado;
- acciones de editar, activar/desactivar y mostrar/ocultar etiqueta;
- estado vacío con acción para crear la primera oferta.

El formulario permitirá:

- elegir porcentaje o cantidad fija;
- seleccionar únicamente destinos del dominio actual;
- ver una previsualización del precio resultante;
- programar fechas;
- configurar `active` y `show_badge` independientemente;
- revisar conflictos antes de guardar o activar.

Desactivar conservará la oferta como historial. La eliminación, si se expone, deberá
requerir confirmación y no será el mecanismo habitual para pausar promociones.

## 7. UX/UI del editor de ensambles

La sección técnica agrupará:

1. modelo de la fuente;
2. potencia en watts;
3. certificación.

El selector mostrará nombre y miniatura de las certificaciones activas. La acción
`Registrar nueva certificación` desplegará una sección dentro del formulario, sin
modal, con:

- nombre;
- selector de archivo;
- miniatura previa;
- guardar y cancelar.

Al guardarse correctamente, la certificación nueva quedará seleccionada. Si falla la
subida o creación, el formulario del ensamble conservará sus valores.

La imagen se presentará en un contenedor fijo pequeño, en la misma ubicación actual,
usando `object-fit: contain`. El tamaño original no alterará el diseño ni deformará
la imagen.

### Publicación

- `Guardar como borrador` requiere título y slug.
- `Publicar ensamble` requiere todos los campos públicos obligatorios.
- Se elimina el checkbox ambiguo `Publicar este ensamble`.
- Las acciones determinan explícitamente el estado.
- El primer campo inválido recibe foco.
- Cada error aparece junto a su campo.
- Los botones se bloquean durante operaciones en curso.

## 8. Experiencia pública

Las tarjetas y páginas de detalle:

- muestran precio base y precio promocional calculado;
- muestran la etiqueta solo cuando la oferta efectiva lo permite;
- muestran el modelo de fuente en especificaciones;
- muestran watts como valor numérico con sufijo `W`;
- muestran la imagen y el nombre de la certificación seleccionada;
- conservan el espacio pequeño actual para el logotipo;
- usan el nombre como alternativa si la imagen falla.

La misma resolución de oferta y certificación se reutilizará en listados, sliders y
detalles para evitar resultados distintos entre superficies.

## 9. Auditoría del editor actual

Resultado inicial: **7/20 (deficiente)**.

### P0 — Bloqueantes

- El editor permite publicar un formulario incompleto.
- La prueba actual codifica como correcto publicar campos obligatorios vacíos.
- `operatingSystem` se captura pero no se serializa hacia Directus.
- Las certificaciones no reconocidas muestran incorrectamente la imagen Gold.
- El slider muestra `Oferta` de forma incondicional y solo presenta el precio base.

### P1 — Mayores

- El checkbox de publicación no controla el resultado.
- Dieciocho etiquetas no están asociadas semánticamente con sus campos.
- Faltan mensajes de validación para la mayoría de los datos obligatorios.
- La galería oculta la eliminación tras `hover`, impidiendo un uso fiable en táctil.
- El encabezado y las acciones desbordan horizontalmente en móvil.
- Los campos manuales de porcentaje y precio descontado pueden contradecirse.
- Un timeout global de 20 segundos puede abortar cargas de imágenes grandes.

### P2 — Menores

- Los mensajes de éxito y error no usan `aria-live`.
- La previsualización usa texto alternativo genérico.
- Los colores y superficies no reutilizan consistentemente los tokens existentes.
- Falta una estrategia explícita de optimización y carga diferida de imágenes.

### Hallazgos positivos

- El editor ya usa formularios reactivos.
- Existen validadores básicos y filtrado de formatos de imagen.
- Las imágenes se suben antes de guardar el registro.
- Borrador y publicación ya tienen acciones separadas.
- El selector de marcas tiene grupo accesible y miniaturas proporcionales.
- Las rejillas principales ya se adaptan de dos columnas a una.

## 10. Manejo de errores

- Un fallo de archivo impedirá registrar una certificación incompleta.
- Un fallo de Directus conservará el estado del formulario.
- Los mensajes usarán regiones accesibles.
- Se distinguirán subida, guardado, publicación y activación.
- Se impedirán dobles envíos.
- La validación de conflicto se repetirá al guardar para evitar condiciones de carrera.
- Un recurso visual faltante degradará a texto, no a una certificación incorrecta.

## 11. Estrategia de pruebas

### Unitarias

- descuentos porcentuales y fijos;
- redondeo y límite mínimo cero;
- vigencia temporal;
- estado y etiqueta independientes;
- detección de periodos superpuestos;
- separación de dominios;
- mapeo Directus de ofertas y certificaciones;
- validación de publicación y borrador;
- persistencia de sistema operativo, watts y certificación.

### Integración

- creación, edición, activación y pausa de ofertas;
- alta y reutilización de una certificación;
- creación y edición de ensambles;
- persistencia y recarga desde Directus;
- resolución de datos en tarjeta y detalle;
- compatibilidad con ensambles existentes.

### Visual y accesibilidad

- escritorio y móvil;
- navegación por teclado;
- asociación de etiquetas;
- foco del primer error;
- estados `aria-live`;
- controles de galería en táctil;
- ausencia de desplazamiento horizontal;
- imágenes de certificación de proporciones distintas.

### Verificación final

- suite completa de pruebas;
- build de producción;
- recorrido administrativo y público en navegador;
- nueva auditoría con comparación contra el resultado inicial de 7/20.

## 12. Criterios de aceptación

1. Una oferta puede crearse y editarse en su catálogo correspondiente.
2. El descuento se calcula automáticamente y nunca altera el precio base.
3. Activación y visibilidad de etiqueta funcionan independientemente.
4. Ningún artículo tiene dos ofertas simultáneas o superpuestas.
5. Productos y ensambles no se mezclan en selectores, métricas ni ofertas.
6. Una certificación puede subirse, guardarse y reutilizarse.
7. Cada ensamble selecciona como máximo una certificación.
8. Watts, modelo, certificación y sistema operativo sobreviven guardar y recargar.
9. Todos esos datos aparecen correctamente en las vistas públicas aplicables.
10. Publicar bloquea datos inválidos; guardar borrador conserva el flujo reducido.
11. El editor funciona sin desbordamiento en móvil y es utilizable con teclado.
12. Las pruebas y el build terminan correctamente.
