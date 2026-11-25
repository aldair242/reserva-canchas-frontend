# Pendientes y Observaciones del Backend

Este documento registra los campos y requerimientos detectados que **no están presentes en el contrato OpenAPI real** (`docs/openapi.json`), siguiendo estrictamente la regla de **no inventar datos, campos ni simular respuestas falsas en el frontend**.

---

## 1. Campos Faltantes en `ReservaResponse`
- **Expiración / Tiempo límite para pagar**:
  - `ReservaResponse` contiene `estado` (`PENDIENTE`, `CONFIRMADA`, etc.), `fecha`, `horaInicio`, `horaFin`, `pagada`, pero **no** incluye un campo como `tiempoLimitePago`, `expiracionPago` o `fechaLimite`.
  - **Manejo en frontend**: Se muestra el estado de la reserva (`PENDIENTE` o `PAGADA`) y las reglas generales de cancelación (política de 2 horas previas calculada respecto a la fecha y hora de inicio de la reserva). Si se requiere un contador regresivo de expiración del pago pendiente, el backend debe exponer la marca temporal exacta de vencimiento.
- **Montos de Reembolso y Diferencias de Tarifa en Cancelación / Reprogramación**:
  - `ReservaResponse` contiene únicamente `precioTotal: number` y `motivoCancelacion: string`. No existen campos como `montoReembolso`, `porcentajePenalidad`, ni `diferenciaTarifa` o `saldoPendiente` resultantes de reprogramar a un turno con tarifa distinta.
  - **Manejo en frontend**: Se informa claramente el `precioTotal` del turno y el resultado de la operación sin inventar cálculos de reembolso ni saldos a favor no respaldados por la API.

---

## 2. Endpoints de Administradores de Sede (Confirmados e Integrados)
- **Estado**: **Confirmado en el OpenAPI oficial**.
  - `GET /api/admin/usuarios/administradores-sede` (`listarAdministradoresSede`)
  - `POST /api/admin/usuarios/administradores-sede` (`crearAdministradorSede`)
  - `PUT /api/admin/usuarios/administradores-sede/{id}` (`actualizarAdministradorSede`)
  - `DELETE /api/admin/usuarios/administradores-sede/{id}` (`eliminarAdministradorSede`)
- **Integración**: Se consumen exclusivamente a través de los clientes generados por Orval en `@/api/endpoints`.

---

## 3. Consulta Global de Partidos para Administradores
- **Estado**: La API expone `GET /api/partidos/mis` (del usuario en sesión) y `GET /api/partidos/{id}`. No cuenta con un listado global `GET /api/partidos` para listar todos los partidos de una sede o fecha en el panel administrativo.
- **Manejo en frontend**: Se accede al detalle de partido por ID (`/partidos/:id`), y el jugador visualiza sus propios partidos en `Mis Partidos`. La pantalla de Demo YOLO permite interactuar con un partido seleccionando su identificador.

---

## 4. Streaming y Simulación YOLO
- **Estado**: La ingesta e inferencia se gestiona vía:
  - `POST /api/sensores/yolo/partidos/{partidoId}/deteccion`
  - `POST /api/sensores/yolo/camaras/{camaraId}/deteccion`
- **Manejo en frontend**: Se implementa la consola de control y disparo de detecciones protegida por rol usando el token JWT del administrador autenticado, sin solicitar ni almacenar `claveApi` en el navegador, mostrando la etiqueta `SIMULADO`.
