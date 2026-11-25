# Reporte de Pruebas en Navegador Real y Backend en Vivo

**Fecha de Ejecución**: 24/11/2026 - 23:58 (America/Lima)  
**Entorno Frontend**: Vite Dev Server (`http://localhost:5173`) + Microsoft Edge Headless  
**Entorno Backend**: Spring Boot 3.3.5 en puerto 8080 (`http://localhost:8080`) con PostgreSQL 16  
**Rama de Trabajo**: `feature/entrega-final` (sin push remoto)

---

## 1. Tabla de Resultados Reales por Flujo

| # | Flujo / Operación | Método y Endpoint | Resultado Real | Evidencia y Comportamiento Observado |
|---|---|---|---|---|
| **1** | **Registro de Jugador** | `POST /api/auth/registro` | **EXITOSO (201 Created)** | Registró jugador con JWT generado y rol `JUGADOR`. |
| **2** | **Inicio de Sesión (Login)** | `POST /api/auth/login` | **EXITOSO (200 OK)** | Retornó token Bearer tanto para jugador como para administrador (`admingeneral@prueba.com`). |
| **3** | **Consulta de Canchas y Sedes** | `GET /api/sedes`, `GET /api/canchas` | **EXITOSO (200 OK)** | Catálogo poblado en tiempo real con 14 sedes y 11 canchas con tarifas en Soles. |
| **4** | **Reserva de Cancha** | `POST /api/reservas` | **EXITOSO (201 Created)** | Creó reserva con código único (ej: `RES-2F833A54`), horario validado sin colisiones. |
| **5** | **Pago Simulado** | `POST /api/reservas/{id}/pagar` | **EXITOSO (200 OK)** | Confirmó la reserva inmediatamente cambiando estado a `CONFIRMADA` y `pagada: true`. Se corrigió el payload para exigir `monto` y `tipoPago`. |
| **6** | **Crear Partido desde Reserva** | `POST /api/partidos?reservaId={id}` | **EXITOSO (201 Created)** | Creó el partido en estado `PROGRAMADO` asignando al organizador al Equipo A y generando UUID de invitación. |
| **7** | **Invitación a Partido** | `GET /api/invitaciones/{token}` | **EXITOSO (200 OK)** | Retorna resumen del partido **únicamente mientras el partido está en estado `PROGRAMADO`**. |
| **8** | **Unirse a Partido** | `POST /api/invitaciones/{token}/unirse` | **EXITOSO (201 Created)** | Un segundo jugador se incorporó exitosamente al Equipo B. |
| **9** | **Iniciar Partido** | `PUT /api/partidos/{id}/iniciar` | **EXITOSO (200 OK)** | Transición de estado a `EN_JUEGO` con hora de inicio real (`inicioReal`). |
| **10** | **Simulación YOLO (IA)** | `POST /api/sensores/yolo/partidos/{id}/deteccion` | **EXITOSO (201 Created)** | Ingesta de gol procesada exitosamente con el **JWT de Administrador** (sin exigir claveApi en navegador), generando Evento ID en estado `PENDIENTE_ATRIBUCION`. |
| **11** | **Generación de Clips de Video** | `GET /api/partidos/{id}/clips` | **EXITOSO (200 OK)** | Generación asíncrona de clip de gol (ej: `d9c8a7d9-38b8-40a8-8668-cd5dabc85ec1.mp4`) en estado `LISTO` con duración de 15 segundos. |
| **12** | **Atribución de Gol** | `PUT /api/eventos/{id}/atribuir` | **COMPORTAMIENTO INTERNO DETECTADO (400)** | El endpoint del backend exige que el usuario autenticado sea un `Jugador` que además figure en la lista interna de `participantes_partido`. Sin embargo, al crearse el partido, la entidad en base de datos almacena el puntero en la jerarquía `Persona` y la validación `p.getPersona() instanceof Jugador` falla internamente en el backend si Hibernate cargó el proxy como `Persona`. **Documentado formalmente en PENDIENTES_BACKEND.md**. |
| **13** | **Confirmación de Gol** | `PUT /api/eventos/{id}/confirmar` | **COMPORTAMIENTO CONDICIONAL (400)** | Por regla estricta del backend, un gol **no puede confirmarse si no ha sido atribuido previamente** (`evento.getAtribuidor() != null`) y el confirmador debe ser un jugador rival distinto del atribuidor. |
| **14** | **Finalizar Partido** | `PUT /api/partidos/{id}/finalizar` | **EXITOSO (200 OK)** | Transición a `FINALIZADO` con timestamp de cierre y bloqueo de nuevos eventos. |
| **15** | **Rankings Deportivos** | `GET /api/rankings?criterio=GOLES` | **EXITOSO (200 OK)** | Requiere cabecera `Authorization: Bearer <token>`. Retorna lista ordenada de anotadores y podio Top 3. |
| **16** | **Reprogramación de Reserva** | `PUT /api/reservas/{id}/reprogramar` | **EXITOSO (200 OK)** | Permite cambiar de horario si se respeta la regla de anticipación y no hay solapamiento. |
| **17** | **Cancelación de Reserva** | `PUT /api/reservas/{id}/cancelar` | **EXITOSO (200 OK)** | Permite cancelar especificando motivo descriptivo si faltan más de 2 horas para el inicio. |

---

## 2. Auditoría Visual y Responsive (Escritorio vs Móvil 360 px)

Se tomaron capturas reales en el navegador Microsoft Edge sin emuladores sintéticos:

- **Portada**:
  - Desktop (1280x800): `docs/capturas/01_portada_desktop.png` (Hero, buscador dual, 3 pasos y footer completo).
  - Móvil (360x740): `docs/capturas/01_portada_360px.png` (Layout vertical sin desbordamiento horizontal, navegación adaptable).
- **Catálogo de Canchas**:
  - Desktop: `docs/capturas/02_canchas_desktop.png` (Grilla de 3 columnas con filtros laterales).
  - Móvil: `docs/capturas/02_canchas_360px.png` (Tarjetas adaptadas a 360 px con botones táctiles legibles).
- **Inicio de Sesión**:
  - Desktop: `docs/capturas/03_login_desktop.png` (2 columnas con panel de beneficios deportivos a la izquierda).
  - Móvil: `docs/capturas/03_login_360px.png` (Columna única optimizada para teclado táctil y botón de mostrar contraseña).
- **Registro de Jugador**:
  - Desktop: `docs/capturas/04_registro_desktop.png`
  - Móvil: `docs/capturas/04_registro_360px.png`
- **Detalle de Partido**:
  - Desktop: `docs/capturas/05_partido_detalle_desktop.png` (Marcador digital, cronología y código QR).
  - Móvil: `docs/capturas/05_partido_detalle_360px.png` (Alineaciones y controles accesibles sin scroll horizontal).
- **Convocatoria e Invitación**:
  - Desktop: `docs/capturas/06_invitacion_desktop.png`
  - Móvil: `docs/capturas/06_invitacion_360px.png`

---

## 3. Pruebas Automatizadas Unitarias y de Integración

- Suite de pruebas ejecutada con **Vitest**: **29/29 pruebas aprobadas al 100%**.
- Se agregaron pruebas para los nuevos componentes:
  - `src/features/partidos/InvitacionDetallePage.test.tsx` (Verificación de ficha de convocatoria y selector de equipo).
  - `src/features/admin/DemoYoloPage.test.tsx` (Validación de controles de inferencia y presencia visible de la insignia `SIMULADO`).
