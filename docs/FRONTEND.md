Proyecto: frontend de "Reserva de Canchas" que consume la API REST de Spring Boot en http://localhost:8080. El contrato real está en http://localhost:8080/v3/api-docs (OpenAPI) y la documentación en /swagger-ui.html.

Stack:
- React 18 + Vite + TypeScript
- Tailwind CSS
- React Router
- TanStack Query para datos del servidor
- react-hook-form + zod para formularios
- Cliente de la API generado desde el OpenAPI con orval (o openapi-typescript + fetch tipado)
- Vitest + Testing Library para pruebas

Reglas:
- No inventes endpoints, rutas ni campos: todo sale del OpenAPI. Si falta algo en la API, dímelo en vez de simularlo con datos falsos.
- El frontend es un proyecto independiente, con su propia carpeta y su propio repositorio (por ejemplo C:\dev\ReservaCanchas-Frontend), separado del backend. No mezcles archivos de uno en el otro.
- La URL de la API sale de VITE_API_URL (valor por defecto http://localhost:8080).
- Autenticación: JWT. Guarda el token y el usuario (con su rol) en un contexto de autenticación; un interceptor agrega Authorization: Bearer a cada petición. Si la API responde 401, cierra sesión y redirige al login.
- Roles: JUGADOR, ADMIN_SEDE y ADMIN (campo rol de la respuesta del login). Las rutas y los menús se protegen por rol, pero recuerda que la seguridad real la aplica el backend.
- Las horas (LocalTime) se envían y reciben como texto "HH:mm:ss".
- Idioma de la interfaz: español. Diseño responsive, mobile-first.
- Todas las pantallas con estados de carga, error y vacío. Los errores de la API (400, 403, 404, 409) se muestran con su mensaje; un 409 al reservar debe explicar que el horario ya no está disponible.
- Estructura: src/api (generado, no editar a mano), src/features/{auth,sedes,canchas,reservas,partidos,clips,estadisticas,admin}, src/components, src/routes, src/lib.
- Nunca guardes claves de dispositivos ni contraseñas fuera del estado temporal de la pantalla.
