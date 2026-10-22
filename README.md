# TRAMA — Frontend e-commerce

Frontend académico desarrollado en React para el TPO de Aplicaciones Interactivas. En esta entrega la interfaz consume archivos JSON locales que reproducen los DTOs del backend Spring Boot; la conexión real con la API queda preparada para una etapa posterior.

## Requisitos

- Node.js 20 o superior.
- npm 10 o superior.

## Instalación y ejecución

```bash
npm install
npm run dev
```

Vite mostrará la dirección local, normalmente `http://localhost:5173`.

Otros comandos disponibles:

```bash
npm run build     # genera la versión de producción en dist/
npm run lint      # revisa el código fuente
npm run preview   # previsualiza la compilación
```

## Sesiones de demostración

La autenticación es simulada y se mantiene en `localStorage`. Desde `/login` se pueden completar automáticamente estas cuentas:

| Acceso | Correo | Contraseña |
| --- | --- | --- |
| Usuario | `benja@trama.com` | `trama123` |
| Administrador | `admin@trama.com` | `admin123` |

El administrador accede a los paneles de usuarios, categorías y productos (inventario, stock y fotos). La cuenta común puede comprar, guardar favoritos, dejar reseñas y ver sus órdenes, pero recibe una pantalla de acceso restringido si intenta ingresar al panel administrativo. El administrador de demostración es el dueño de los productos cargados (`usuarioId` 4), por eso es quien puede modificarlos.

> El rol es un metadato exclusivo de la sesión simulada. No se agregó al JSON de `UsuarioRespuestaDTO` porque el backend actual no lo expone.

## Rutas implementadas

| Ruta | Pantalla | Acceso |
| --- | --- | --- |
| `/` | Inicio con prendas destacadas | Público |
| `/login` | Inicio de sesión | Público |
| `/registro` | Registro de usuario | Público |
| `/productos` | Catálogo con búsqueda, filtros y paginación | Público |
| `/productos/:id` | Detalle de producto con galería, carrito, favorito y reseñas | Público |
| `/productos/:productoId/resenias` | Reseñas de un producto | Público |
| `/mi-perfil` | Perfil de la sesión | Usuario autenticado |
| `/usuarios/:id` | Detalle de usuario | Usuario autenticado |
| `/carrito` | Carrito de compras | Usuario autenticado |
| `/checkout` | Resumen y confirmación de compra | Usuario autenticado |
| `/ordenes` | Historial de órdenes | Usuario autenticado |
| `/ordenes/:ordenId` | Detalle de orden | Usuario autenticado |
| `/favoritos` | Favoritos | Usuario autenticado |
| `/usuarios` | Listado y búsqueda de usuarios | Administrador simulado |
| `/categorias`, `/categorias/nueva`, `/categorias/:id`, `/categorias/:id/editar` | Gestión de categorías | Administrador simulado |
| `/admin/productos`, `/admin/productos/nuevo`, `/admin/productos/:id/editar` | Inventario, alta, edición y stock de productos | Administrador simulado |
| `/admin/productos/:id/fotos` | Gestión de fotos del producto | Administrador simulado |
| `/sin-permiso` | Acceso restringido | Usuario autenticado |

Las rutas desconocidas muestran una pantalla 404 y todas las pantallas comparten encabezado, navegación adaptable y pie de página.

## Correspondencia con el backend

Cada módulo tiene su archivo de servicio en `src/services/`, que hoy lee los JSON de `public/data/` y simula en memoria las altas, bajas y modificaciones. La cobertura endpoint por endpoint (28 en total) está en [docs/mapa-de-navegacion.md](docs/mapa-de-navegacion.md). Resumen:

| Módulo | Endpoints representados | Servicio |
| --- | --- | --- |
| Usuarios | registro, login, listado y detalle | `authService.js`, `userService.js` |
| Categorías | listado, detalle, búsqueda, alta, edición y baja | `categoryService.js` |
| Productos | listado, búsqueda paginada, detalle, alta, edición, stock y baja | `productService.js` |
| Fotos | listado, alta por URL, portada y baja | `photoService.js` |
| Carrito | consulta, agregar, cambiar cantidad, quitar, vaciar y checkout | `cartService.js` |
| Órdenes | checkout e historial | `orderService.js` |
| Favoritos | listado, alta y vaciado | `favoriteService.js` |
| Reseñas | alta, listado por producto y promedio | `reseniaService.js` |

Los archivos de `public/data/` respetan los DTO del backend:

- `UsuarioRegistroDTO`, `UsuarioRespuestaDTO`, `LoginDTO` y `LoginRespuestaDTO`.
- `CategoriaDTO`.
- `ProductoRespuestaDTO` (con `fotos`) y la página de Spring (`Page`) de `GET /api/productos/buscar`.
- `FotoRespuestaDTO`.
- `CarritoRespuestaDTO`, `ItemCarritoRespuestaDTO` y `CheckoutRespuestaDTO`.
- `OrdenRespuestaDTO` y `DetallePedidoRespuestaDTO`, con el código de seguimiento de 12 caracteres hexadecimales.
- `FavoritoDTO`.
- `ReseniaDTO`.
- `ErrorRespuestaDTO`: `fecha`, `estado`, `error`, `mensaje`, `ruta`, `errores`.

La contraseña solo se utiliza como entrada del formulario y nunca aparece en las respuestas ni en el perfil. El backend solo permite vaciar la lista de favoritos; quitar una prenda individual se simula en memoria.

## Estados demostrables

- Carga asincrónica mediante `useEffect`.
- Login correcto e incorrecto.
- Validación de campos obligatorios y correo.
- Registro correcto y usuario duplicado.
- Listado con datos, lista vacía y error de servidor.
- Búsqueda sin coincidencias.
- Usuario inexistente.
- Ruta protegida sin sesión y acceso administrativo denegado.
- Persistencia y cierre de sesión.
- Catálogo con resultados, sin coincidencias y producto inexistente.
- Carrito vacío y checkout con carrito vacío o stock insuficiente.
- Errores de validación en productos, fotos (URL inválida o límite de 10) y reseñas (calificación inválida o duplicada).
- Categoría inexistente o en uso al eliminar.

En el panel `/usuarios`, la sección “Probar estados de la interfaz” permite alternar entre datos, lista vacía y error sin modificar los JSON.

## Estructura relevante

```text
public/data/               Respuestas JSON simuladas
src/components/layout/     Encabezado, pie y contenedor general
src/components/routing/    Protección de rutas
src/components/ui/         Componentes visuales reutilizables
src/components/<módulo>/   Componentes propios de carrito, órdenes, fotos, productos, categorías y reseñas
src/context/               Sesión, carrito y favoritos
src/pages/                 Pantallas de toda la aplicación
src/services/              Capa de acceso a datos locales
docs/                      Mockups, mapa de navegación y cobertura funcional
tests/                     Pruebas del servicio de categorías (node --test)
```

## Migración futura a la API

Los componentes no leen archivos JSON directamente: llaman a los servicios de `src/services/`. Para integrar Spring Boot solo se deben reemplazar esas lecturas por solicitudes `fetch` a los endpoints reales y enviar el token como `Authorization: Bearer <token>`. Las pantallas, los estados y las rutas pueden mantenerse sin cambios estructurales.

## Diseño

Los mockups están en Figma: [TRAMA - Mockups](https://www.figma.com/design/cXFsu9YbGmqkF3iAj7BfbI/TRAMA---Mockups?node-id=1-2&t=j84wcZQuG6hYl0bv-1). Reúnen los tableros de escritorio y celular de todos los módulos, la guía de estilos y componentes y el mapa de navegación. Los mismos tableros están en `docs/` en formato SVG.

| Documento | Contenido |
| --- | --- |
| [docs/mapa-de-navegacion.md](docs/mapa-de-navegacion.md) | Mapa de navegación, rutas y cobertura de los 28 endpoints |
| [docs/usuarios-diseno.md](docs/usuarios-diseno.md) | Usuarios y estructura |
| [docs/categorias-diseno.md](docs/categorias-diseno.md) | Categorías |
| [docs/productos-diseno.md](docs/productos-diseno.md) | Catálogo y productos |
| [docs/carrito-diseno.md](docs/carrito-diseno.md) | Carrito |
| [docs/resenias-diseno.md](docs/resenias-diseno.md) | Reseñas |
| [docs/evaluacion-consigna.md](docs/evaluacion-consigna.md) | Comprobación requisito por requisito |

Tableros SVG: [estilos y componentes](docs/estilos-y-componentes.svg), [usuarios](docs/mockups-usuarios.svg), [categorías](docs/mockups-categorias.svg), [productos](docs/mockups-productos.svg), [fotos](docs/mockups-fotos.svg), [carrito](docs/mockups-carrito.svg), [órdenes](docs/mockups-ordenes.svg), [favoritos](docs/mockups-favoritos.svg), [reseñas](docs/mockups-resenias.svg) y [mapa de navegación](docs/mapa-de-navegacion.svg).

## Equipo

Grupo 7, Aplicaciones Interactivas (UADE).

| Integrante | Módulo |
| --- | --- |
| Benja | Usuarios y estructura inicial |
| Julieta | Categorías |
| Alan | Catálogo y productos |
| Julian | Fotos de productos |
| Ian | Carrito |
| Julián Casella | Órdenes y checkout |
| Nacho | Favoritos |
| Valu | Reseñas y consolidación del diseño |

## Categorías — Julieta

Acceso desde **Categorías** con la cuenta administrativa de demostración.
Incluye listado, consulta por ID, búsqueda exacta por nombre (con opción de
ignorar mayúsculas), alta, edición y baja lógica simulada con control de categoría
en uso. Se reutilizan las categorías e identificadores del equipo.
Los cambios se mantienen al navegar y se reinician al recargar la página.

- [Diseño, contratos y pruebas manuales](docs/categorias-diseno.md).
- [Mockups de escritorio y móvil](docs/mockups-categorias.svg).
- Rutas: `/categorias`, `/categorias/nueva`, `/categorias/:id`, `/categorias/:id/editar`.
