# Correccion del slider y marcas de ensambles

## Objetivo

El slider de ensambles debe mostrar exclusivamente productos publicados por el backend, usar la imagen principal de cada ensamble y presentar solo las marcas elegidas por el administrador. El editor conservara el lenguaje visual actual y evitara superposiciones o contrastes insuficientes.

## Alcance

- Eliminar los cinco ensambles de ejemplo definidos en `HomeComponent`.
- Inicializar el slider sin productos y mantenerlo vacio cuando el backend no entregue ensambles.
- Eliminar `BR-938686_1.png` como imagen de respaldo en las vistas del catalogo y los sliders.
- Incorporar seleccion multiple de marcas en el creador y editor activo de ensambles.
- Persistir las marcas seleccionadas mediante el campo `brandLogos` que ya soportan el modelo y el mapper de Directus.
- Mostrar en el slider exactamente las marcas guardadas, sin inferir marcas adicionales a partir del nombre del procesador, GPU o motherboard.

Quedan fuera de alcance los cambios al diseno general de las tarjetas, la administracion dinamica del catalogo de marcas y modificaciones a productos que no sean ensambles.

## Selector de marcas

El formulario ofrecera las marcas NVIDIA, Intel, AMD, ASUS, Corsair y Gigabyte mediante controles de seleccion multiple. Cada opcion asociara un nombre accesible con una ruta de logo existente en los assets del proyecto.

Las opciones reutilizaran colores, bordes y tipografia del formulario actual. Se organizaran en una cuadricula adaptable con separacion constante, altura uniforme y sin posicionamiento absoluto. El estado seleccionado tendra borde y fondo de alto contraste, y no dependera solo del color: conservara el control de seleccion y un nombre textual legible.

Al editar un ensamble, las marcas persistidas apareceran seleccionadas. Al crear o guardar, el payload incluira un arreglo normalizado de objetos `{ src, alt }`. La seleccion vacia sera valida y producira `brandLogos: []`.

## Flujo de datos

1. El administrador selecciona las marcas en el formulario.
2. El editor convierte la seleccion en `brandLogos` y la envia por `ProductsAdminService`.
3. El mapper existente guarda el arreglo en `brand_logos` de Directus y lo reconstruye al leer el producto.
4. `ProductsService` convierte los datos del ensamble al modelo de catalogo.
5. Home entrega al slider unicamente los logos persistidos.

La seleccion editorial sera la unica fuente de verdad. No se completaran logos automaticamente con heuristicas sobre los nombres de componentes.

## Ensambles e imagenes del slider

`carruselProducts` y `filteredCarruselProducts` comenzaran vacios. Si Directus devuelve resultados, Home los mapeara como hasta ahora. Si devuelve una lista vacia o una solicitud falla, el slider permanecera vacio en lugar de mostrar datos ficticios.

Los manejadores de error no reemplazaran una imagen fallida por `BR-938686_1.png`. Para impedir ciclos de error y evitar que una imagen ajena tape el producto, ocultaran el elemento fallido o aplicaran el comportamiento neutro ya utilizado por el componente, sin introducir otro gabinete.

Las referencias que representen datos demostrativos locales y puedan alcanzar el catalogo de ensambles tambien se retiraran, de modo que la imagen principal guardada en el backend sea siempre la primera fuente visual del producto.

## Accesibilidad

- Cada logo tendra texto alternativo con el nombre de la marca.
- Los controles se podran operar con teclado y conservaran un indicador de foco visible.
- El nombre textual de cada marca permanecera visible en el editor.
- La cuadricula evitara solapamientos en anchos pequenos y permitira que cada opcion crezca sin invadir otra.
- Los estados normal, foco y seleccionado mantendran contraste legible sobre el fondo oscuro actual.

## Manejo de errores

- Una imagen principal invalida no se sustituira por un gabinete diferente.
- Un logo individual que no cargue se ocultara sin afectar los demas logos ni el contenido de la tarjeta.
- Un error o respuesta vacia del backend dejara el listado vacio y no reactivara contenido estatico.

## Pruebas y verificacion

- Prueba de Home que confirme que no existen ensambles estaticos y que una respuesta vacia mantiene el slider vacio.
- Pruebas del editor que confirmen carga, seleccion multiple y serializacion de `brandLogos` al crear y editar.
- Prueba del mapeo del slider que confirme que no agrega marcas inferidas.
- Prueba del componente de slider que confirme que el error de una imagen no asigna `BR-938686_1.png`.
- Busqueda global para verificar que el archivo no siga usado como placeholder en los flujos afectados.
- Ejecucion de las pruebas Angular relacionadas y compilacion de produccion.

## Criterios de aceptacion

- Ninguna tarjeta del slider aparece si no proviene del backend.
- Cada ensamble muestra su propia imagen principal; `BR-938686_1.png` no se usa como reemplazo.
- El administrador puede elegir cualquiera de las seis marcas, quitar selecciones y recuperar la seleccion al editar.
- El slider muestra exactamente los logos elegidos y cada logo permanece alineado, separado y legible.
- Las pruebas relacionadas y la compilacion terminan correctamente.
