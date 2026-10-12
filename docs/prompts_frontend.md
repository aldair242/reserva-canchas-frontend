# Prompts para el Frontend - Reserva de Canchas

## Preparación

1. El backend debe estar corriendo (`docker compose up -d` y `.\mvnw.cmd spring-boot:run`) y `http://localhost:8080/v3/api-docs` debe mostrar un JSON.
2. Crea una carpeta nueva y vacía para el frontend, fuera del backend (por ejemplo `C:\dev\ReservaCanchas-Frontend`), con `git init`. Dentro crea `docs/` y guarda ahí este archivo (`docs/prompts_frontend.md`) y el bloque "Contexto" como `docs/FRONTEND.md`. Abre esa carpeta en el editor.
3. Instala Node.js 20 o superior (`node -v`).
4. Haz un commit por fase, igual que en el backend.
5. Antes de la Fase F0, manda el prompt B (ajustes del backend). Evita problemas después.

---

## Contexto (pegar en `docs/FRONTEND.md` y en el primer prompt)

```
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
```

---

## Prompt B - Ajustes del backend (mandarlo ANTES del frontend)

```
Haz estos ajustes en el backend, sin cambiar el diseño ni modificar migraciones Flyway existentes. Para cada uno agrega pruebas y respeta la seguridad por rol:

1. OpenAPI: configura springdoc para que LocalTime se documente como string con formato HH:mm:ss (hoy Swagger lo muestra como un objeto con hour, minute, second, nano) y que los DTOs de entrada tengan ejemplos válidos con @Schema.
2. Revisa si el frontend puede resolver estos flujos con los endpoints actuales y, si no, agrégalos:
   - Pasar de una reserva a su partido: ReservaResponse debe incluir partidoId (nulo si aún no hay partido).
   - GET /api/partidos/mis: partidos que organizo o en los que participo (como jugador registrado).
   - GET /api/sedes/{id}/reservas?fecha=: reservas de una sede, solo para su AdministradorSede o ADMIN.
   - Los eventos de un partido deben venir en PartidoResponse o en GET /api/partidos/{id}/eventos.
3. POST /api/sedes y PUT: si el usuario autenticado es AdministradorSede, usa su propio id como dueño e ignora administradorSedeId del cuerpo; solo un ADMIN puede indicar otro dueño.
4. Verifica que CORS permita las cabeceras Authorization y Content-Type y los métodos GET, POST, PUT y DELETE desde http://localhost:5173 (puerto de Vite), además de 3000 y 4200, solo en dev.
5. Ejecuta mvnw.cmd clean verify y dime qué cambiaste.
```

---

## Fase F0 - Esqueleto, cliente de la API y autenticación

```
Lee docs/FRONTEND.md.
1. Crea el proyecto en la raíz de esta carpeta (es un proyecto independiente del backend) con Vite + React + TypeScript, instala Tailwind, React Router, TanStack Query, react-hook-form, zod, Vitest y Testing Library.
2. Genera el cliente de la API desde http://localhost:8080/v3/api-docs con orval (o la alternativa que prefieras) en src/api, con un script npm "api:generar" para regenerarlo. Guarda también una copia del contrato en docs/openapi.json, para poder regenerar el cliente aunque el backend no esté corriendo.
3. Configura un cliente HTTP único que lea VITE_API_URL, agregue el token y maneje el 401.
4. Contexto de autenticación y pantallas: login (POST /api/auth/login) y registro (POST /api/auth/registro). Guarda token y usuario; muestra el nombre y el rol en la barra superior; botón de cerrar sesión.
5. Layout con barra de navegación que cambie según el rol, rutas protegidas por rol y páginas 404 y 403.
6. Pruebas del formulario de login y de la protección de rutas.
7. Crea .env.example con VITE_API_URL y un README con los comandos.
No implementes todavía otras pantallas. Al terminar ejecuta npm run build y npm test, y dime qué creaste.
```

## Fase F1 - Catálogo, disponibilidad y reservas

```
Implementa el flujo del jugador para reservar:
1. Listado de sedes (GET /api/sedes) y de canchas con filtros por deporte y sede (GET /api/canchas), con tarjetas que muestren datos propios de cada tipo de cancha (formato, techada, iluminación, precio).
2. Detalle de cancha con selector de fecha y turnos disponibles (GET /api/canchas/{id}/disponibilidad), mostrando el precio de cada turno.
3. Reservar (POST /api/reservas): resumen y confirmación. Un 409 debe mostrar que el horario ya no está disponible y refrescar los turnos.
4. Pagar (POST /api/reservas/{id}/pagar) con selector del método de pago según PagoRequest.
5. Mis reservas (GET /api/reservas/mis) con estado, cancelar (con aviso de la regla de 2 horas) y reprogramar.
6. Pruebas del flujo de reserva y del manejo del 409.
No toques lo ya hecho en F0 salvo lo necesario. Al terminar ejecuta npm run build y npm test.
```

## Fase F2 - Partidos, invitaciones y eventos

```
Implementa partidos:
1. Crear el partido desde una reserva confirmada y pagada (POST /api/partidos) y pantalla del partido (GET /api/partidos/{id}) con marcador, equipos A y B y participantes.
2. Agregar participantes (POST /api/partidos/{id}/participantes): jugador registrado o invitado por nombre, y equipo.
3. Iniciar y finalizar el partido (PUT), con confirmación.
4. Enlace de invitación con botón de copiar. Página pública /invitacion/:token (GET /api/invitaciones/{token}) con el resumen del partido y botón "Reclamar mi perfil" (POST .../reclamar): si no hay sesión, ir al login y volver a la invitación.
5. Eventos: lista del partido, registro manual (POST /api/partidos/{partidoId}/eventos), y para cada gol pendiente: atribuir anotador y asistente (PUT /api/eventos/{id}/atribuir), confirmar y descartar. Muestra la fecha límite de atribución y resalta los goles pendientes. Solo mostrar las acciones que el usuario puede hacer.
6. Pruebas de la pantalla de atribución y del flujo de invitación.
Al terminar ejecuta npm run build y npm test.
```

## Fase F3 - Clips, estadísticas y rankings

```
Implementa highlights y estadísticas:
1. Galería de clips por partido (GET /api/partidos/{id}/clips) con miniatura, estado (PENDIENTE, PROCESANDO, LISTO, ERROR), minuto, equipo y jugador. Reproductor de video para los clips LISTO usando la URL que entrega la API (GET /api/clips/{id}); refresco automático mientras haya clips en proceso.
2. Acciones sobre clips: descartar y reintentar (los que estén en ERROR).
3. Estadísticas del jugador (GET /api/jugadores/{id}/estadisticas) en tarjetas: partidos jugados, goles, asistencias, goles por partido, victorias, empates, derrotas y porcentaje de victorias. Mi perfil (GET /api/jugadores/me).
4. Rankings (GET /api/rankings) con selector de criterio (goles, asistencias, victorias) y filtros que ofrezca la API.
5. Pruebas del reproductor y del refresco de clips en proceso.
Al terminar ejecuta npm run build y npm test.
```

## Fase F4 - Panel de administración de sedes

```
Implementa el panel para ADMIN_SEDE y ADMIN:
1. Mis sedes (GET /api/sedes/mis), crear, editar y eliminar sedes (con confirmación). Campos de horario como selector de hora.
2. Canchas de una sede: crear y editar con formulario según el tipo (fútbol con formato, básquet con medio campo, vóley con altura de red y playa, pádel con paredes de vidrio) y la configuración de tarifa (estándar, hora pico o promocional).
3. Bloqueos de cancha (POST /api/canchas/{id}/bloqueos).
4. Dispositivos de una cancha: listar, registrar sensor de arco (POST /api/canchas/{canchaId}/sensores) y cámara (POST .../camaras), y desactivar. Al registrar, mostrar el código y la claveApi UNA sola vez en un cuadro con botón de copiar y un aviso claro de que no se volverán a mostrar. Mostrar el estado en línea.
5. Si existe GET /api/sedes/{id}/reservas, una vista de reservas por fecha de la sede.
6. Pruebas del formulario de cancha y de la pantalla de claves.
Al terminar ejecuta npm run build y npm test.
```

## Fase F5 - Pulido y cierre

```
Cierra el frontend:
1. Revisa que todas las pantallas tengan estados de carga, error y vacío, y que se vean bien en móvil (360 px) y escritorio.
2. Accesibilidad básica: etiquetas en formularios, foco visible, contraste, navegación con teclado y textos alternativos.
3. Manejo global de errores de red y de la API, con mensajes en español.
4. Revisa que no haya tokens, claves ni datos sensibles en la consola, en la URL ni en el código.
5. Verifica que ninguna acción visible falle por permisos: oculta o deshabilita lo que el rol no puede hacer.
6. Pruebas pendientes, npm run build sin advertencias y npm run lint limpio.
7. Actualiza el README con instalación, variables, scripts, cómo regenerar el cliente de la API y el flujo de uso.
Dame el resumen de cambios y la lista de pantallas con sus rutas.
```

---

## Cómo probar cada fase

1. Backend corriendo y base de datos arriba.
2. En la carpeta del frontend: `npm install`, `npm run dev` y abre `http://localhost:5173`.
3. Recorre la pantalla nueva con un usuario de cada rol: admin (`admin@prueba.com`, solo en dev) y dos jugadores.
4. Prueba los errores: sin sesión, reserva duplicada, cancelar fuera de plazo, rol equivocado.
5. `npm test` y `npm run build`, luego commit.
