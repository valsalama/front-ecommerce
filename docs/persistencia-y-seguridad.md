# Persistencia y seguridad

## Solución elegida

Se utiliza localStorage para guardar la preferencia de tema claro u oscuro
mediante la clave trama-theme. Es un dato no sensible y se conserva después
de actualizar la página o cerrar el navegador.

Para la autenticación se eligió una cookie HttpOnly que contiene el JWT.
El frontend no guarda el token en localStorage ni sessionStorage.

Se descartó persistir el JWT mediante localStorage o Redux Persist porque
un script ejecutado mediante XSS podría leerlo. Redux Persist, cuando utiliza
localStorage, no elimina este riesgo.

## Recuperación de sesión

Después del login, el backend envía la cookie trama_access_token.
Al iniciar la aplicación o presionar F5, el frontend consulta
GET /api/usuarios/me para recuperar el usuario y su rol.

Mientras se comprueba la sesión, se muestra un estado de carga.
Si el backend devuelve 401, la aplicación considera que no hay sesión válida.

El JWT y la cookie tienen una duración de una hora.
El cierre de sesión solicita al backend eliminar la cookie y después
limpia el estado de autenticación del frontend.

## Mitigación de XSS

HttpOnly impide que JavaScript lea directamente la cookie de autenticación.
Esto reduce el riesgo de robo del token, pero no elimina los ataques XSS:
un script malicioso todavía podría realizar solicitudes desde la aplicación.

Para reducir ese riesgo se deben renderizar los datos como texto,
evitar insertar HTML no confiable, validar las entradas y mantener
las dependencias actualizadas.

Las preferencias de localStorage no se utilizan para decidir permisos.
El backend valida el JWT recibido para autenticar cada solicitud.

## Mitigación de CSRF

Spring Security exige un token CSRF para las solicitudes que modifican datos.
El frontend lo obtiene mediante GET /api/usuarios/csrf y lo envía
en el encabezado indicado por el backend.

El token CSRF es diferente del JWT y no sirve para iniciar sesión.
La cookie también utiliza SameSite=Lax como protección complementaria.

## Configuración local y HTTPS

Las cookies utilizan Secure por defecto, para su envío mediante HTTPS.
El perfil local desactiva Secure únicamente para probar mediante HTTP
en localhost.

Durante el desarrollo, Vite redirige las solicitudes /api al backend
en localhost:8080. En un despliegue se debe configurar una ruta equivalente
hacia la API y utilizar HTTPS.

## Alcance

El registro, login, recuperación de sesión y logout utilizan el backend real.
Los demás módulos conservan sus servicios de demostración con JSON locales.
Esta actividad no convierte todos los módulos en operaciones contra la API.

El logout elimina la cookie del navegador; no implementa una lista de
revocación de JWT. Un token previamente copiado conservaría su validez
hasta su vencimiento.

## Verificación realizada

- Registro e inicio de sesión con un usuario real.
- Recuperación de sesión después de F5.
- Cierre de sesión y posterior actualización sin recuperar la sesión.
- Cambio de tema y conservación de la preferencia después de F5.
- Pruebas del backend sobre autenticación con cookies y rechazo sin CSRF.
- Build del frontend y 16 pruebas existentes aprobadas.