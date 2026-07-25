# Preservar la categoría al editar productos y ensambles

## Objetivo

Al editar y guardar un producto o ensamble, conservar su clasificación actual. En la lista administrativa, mostrar la subcategoría específica seleccionada —por ejemplo, `Memorias RAM`— en lugar de sustituir todos los componentes por la etiqueta genérica `Hardware y accesorios`.

## Diagnóstico

El registro del producto mostrado en la captura conserva en Directus la categoría principal `component` y la subcategoría con ID `13`. La lista administrativa ignora esa subcategoría y traduce cualquier producto de tipo componente a la etiqueta fija `Hardware y accesorios`.

El guardado reconstruye el payload de Directus. Por ello, la corrección también debe proteger los identificadores de categoría y subcategoría durante la carga y el guardado, y debe asegurar que el editor de ensambles siempre persista la categoría canónica `assembled`.

## Diseño

### Productos

- La categoría principal y la subcategoría se cargarán desde los identificadores almacenados en los metadatos administrativos.
- La carga asíncrona de las categorías no limpiará la subcategoría del producto que se está editando.
- El payload de actualización conservará `categoryId` y `subcategoryId`.
- La categoría canónica de Directus seguirá derivándose de la categoría principal seleccionada.

### Ensambles

- El payload del editor de ensambles usará siempre la categoría administrativa de ensambles, que el mapper convierte a `assembled`.
- Un valor antiguo, vacío o inesperado del formulario no podrá convertir un ensamble en `component`.

### Lista administrativa

- La columna `Categoría` resolverá primero el nombre de la subcategoría mediante `subcategoryId`.
- Si no puede encontrar la subcategoría, mostrará el nombre de la categoría principal mediante `categoryId`.
- Como último recurso, usará la etiqueta general correspondiente a la categoría canónica.

## Flujo de datos

1. Directus entrega el producto con su categoría canónica y sus metadatos administrativos.
2. El mapper conserva `categoryId` y `subcategoryId`.
3. El editor rellena los selectores sin reiniciar la subcategoría durante la carga inicial.
4. Al guardar, ambos identificadores vuelven en el payload.
5. La lista carga la jerarquía de categorías y muestra el nombre específico asociado al producto.

## Pruebas

- Una prueba de la lista demostrará primero que un componente con subcategoría `Memorias RAM` se muestra actualmente como `Hardware y accesorios`.
- La misma prueba deberá pasar mostrando `Memorias RAM` después de la corrección.
- Una prueba del editor de productos verificará que una actualización conserva `categoryId` y `subcategoryId`.
- Una prueba del editor de ensambles verificará que una actualización siempre se envía como ensamble.
- Se ejecutarán las pruebas relacionadas y después la compilación del proyecto.

## Fuera de alcance

- No se migrarán ni renombrarán categorías existentes en Directus.
- No se cambiará la taxonomía pública ni las rutas del catálogo.
- No se modificarán productos o ensambles existentes fuera del guardado normal del editor.
