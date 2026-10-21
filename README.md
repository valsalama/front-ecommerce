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

El administrador puede consultar el listado completo de usuarios. La cuenta común puede acceder a su perfil, pero recibe una pantalla de acceso restringido si intenta ingresar al panel administrativo.

> El rol es un metadato exclusivo de la sesión simulada. No se agregó al JSON de `UsuarioRespuestaDTO` porque el backend actual no lo expone.

## Rutas implementadas

| Ruta | Pantalla | Acceso |
| --- | --- | --- |
| `/` | Inicio y catálogo existente | Público |
| `/login` | Inicio de sesión | Público |
| `/registro` | Registro de usuario | Público |
| `/mi-perfil` | Perfil de la sesión | Usuario autenticado |
| `/usuarios` | Listado y búsqueda | Administrador simulado |
| `/usuarios/:id` | Detalle de usuario | Usuario autenticado |
| `/sin-permiso` | Acceso restringido | Usuario autenticado |
| `/productos/:productoId/resenias` | Reseñas de un producto | Público |

Las rutas desconocidas muestran una pantalla 404 y todas las pantallas comparten encabezado, navegación adaptable y pie de página.

## Correspondencia con el backend

| Endpoint Java | Método del frontend | Pantalla o acción |
| --- | --- | --- |
| `POST /api/usuarios/registro` | `register()` | Formulario de registro |
| `POST /api/usuarios/login` | `login()` | Formulario de acceso |
| `GET /api/usuarios` | `getUsers()` | Listado administrativo |
| `GET /api/usuarios/{id}` | `getUserById()` | Perfil/detalle |

Los archivos de `public/data/` respetan estos contratos:

- `UsuarioRegistroDTO`: `nombreUsuario`, `mail`, `contrasenia`, `nombre`, `apellido`.
- `UsuarioRespuestaDTO`: `id`, `nombreUsuario`, `mail`, `nombre`, `apellido`.
- `LoginDTO`: `mail`, `contrasenia`.
- `LoginRespuestaDTO`: `token`, `tipo`, `usuario`.
- `ErrorRespuestaDTO`: `fecha`, `estado`, `error`, `mensaje`, `ruta`, `errores`.

La contraseña solo se utiliza como entrada del formulario y nunca aparece en las respuestas ni en el perfil.

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

En el panel `/usuarios`, la sección “Probar estados de la interfaz” permite alternar entre datos, lista vacía y error sin modificar los JSON.

## Estructura relevante

```text
public/data/               Respuestas JSON simuladas
src/components/layout/     Encabezado, pie y contenedor general
src/components/routing/    Protección de rutas
src/components/ui/         Componentes visuales reutilizables
src/context/               Estado de la sesión
src/pages/                 Pantallas de usuarios y autenticación
src/services/              Capa de acceso a datos locales
docs/                      Mockups, wireflow y cobertura funcional
```

## Migración futura a la API

Los componentes no leen archivos JSON directamente: llaman a `authService.js` y `userService.js`. Para integrar Spring Boot solo se deben reemplazar esas lecturas por solicitudes `fetch` a los endpoints reales y enviar el token como `Authorization: Bearer <token>`. Las pantallas, los estados y las rutas pueden mantenerse sin cambios estructurales.

## Diseño

El tablero de mockups y el mapa de navegación están documentados en [docs/usuarios-diseno.md](docs/usuarios-diseno.md). El módulo de reseñas está en [docs/resenias-diseno.md](docs/resenias-diseno.md) y el mapa de navegación de toda la aplicación en [docs/mapa-de-navegacion.md](docs/mapa-de-navegacion.md). La comprobación requisito por requisito se encuentra en [docs/evaluacion-consigna.md](docs/evaluacion-consigna.md).
