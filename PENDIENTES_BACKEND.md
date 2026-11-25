# Pendientes y Comportamientos del Backend (PENDIENTES_BACKEND.md)

Documento de seguimiento de limitaciones y particularidades encontradas en los contratos y servicios de la API REST de Spring Boot (`http://localhost:8080`).

---

## 1. Modelo `ReservaResponse`
- **Campos Ausentes**: No expone `fechaExpiracionPago`, `porcentajePenalidadCancelacion`, ni `montoReembolso`.
- **Manejo en Frontend**:
  - Se implementó la regla de negocio de **cancelación y reprogramación hasta 2 horas antes** del horario de inicio directamente en la UI.
  - El modal de pago calcula el saldo y procesa la transacción de forma inmediata conectada al endpoint `POST /api/reservas/{id}/pagar`.

## 2. Validación de Atribución de Goles (`PUT /api/eventos/{id}/atribuir`)
- **Regla del Backend**: Exige que el atribuidor sea un usuario autenticado con rol `JUGADOR` que pertenezca a la colección `partido.getParticipantes()`.
- **Comportamiento Detectado**: Al crearse el partido mediante `POST /api/partidos`, el primer participante se persiste como una referencia abstracta a la tabla `personas`. En tiempo de ejecución en Hibernate, si la entidad se recupera mediante un proxy de `Persona`, la verificación interna `p.getPersona() instanceof Jugador` evalúa a `false`, devolviendo el mensaje de error:
  > *"Debe ser participante del partido para realizar esta accion"*
- **Manejo en Frontend**: El frontend implementa correctamente el envío del `anotadorId` del participante seleccionado y maneja la captura de errores HTTP 400 informando al usuario el motivo sin romper la interfaz.

## 3. Confirmación de Eventos (`PUT /api/eventos/{id}/confirmar`)
- **Regla de Negocio Estricta**: No permite confirmar un gol si previamente no cuenta con un atribuidor registrado (`evento.getAtribuidor() != null`).
- **Confirmador Rival**: El confirmador debe ser un participante del equipo contrario y diferente del que realizó la atribución.

## 4. Consulta de Invitación (`GET /api/invitaciones/{token}`)
- **Vigencia del Token**: El endpoint devuelve HTTP 400 (*"La invitación ha vencido o el partido ya no está en estado programado"*) en cuanto el partido pasa al estado `EN_JUEGO` o `FINALIZADO`.
- **Manejo en Frontend**: Se muestra el banner informativo explicativo cuando el token ha dejado de aceptar nuevos registros.

## 5. Permisos de Detección YOLO
- **Seguridad**: Los endpoints `/api/sensores/yolo/partidos/{id}/deteccion` y `/api/sensores/yolo/camaras/{id}/deteccion` devuelven HTTP 403 (*"No tiene permisos para gestionar esta sede"*) si se intentan invocar con un JWT de rol `JUGADOR`. Requieren obligatoriamente credenciales de `ADMIN` o del `ADMIN_SEDE` asignado a dicho complejo deportivo.
- **Manejo en Frontend**: Se protegió la ruta `/admin/yolo` exclusivamente para administradores, empleando su propio token de sesión sin requerir `claveApi` en el cliente.
